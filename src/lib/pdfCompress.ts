import { PDFDocument, PDFName, PDFRawStream, PDFNumber, PDFDict, PDFArray, PDFRef } from 'pdf-lib';
import sharp, { type Sharp } from 'sharp';
import zlib from 'zlib';

/**
 * Server-side PDF compression for uploaded datasheets.
 *
 * Embedded raster images are almost always what makes a PDF heavy, so this:
 *  1. Downscales oversized images (max ~150 DPI on an A4 page).
 *  2. Re-encodes them as optimised JPEG (mozjpeg).
 *  3. Re-saves the document with compressed object streams.
 *
 * It is deliberately conservative: anything it cannot handle safely (CMYK, indexed
 * colour, masks, non 8-bit images, encrypted files...) is left untouched, and the
 * original buffer is returned if the result is not smaller.
 */

const MAX_DIMENSION = 1800; // px — ≈150 DPI across the long edge of an A4 page
const JPEG_QUALITY = 72;
const MIN_IMAGE_BYTES = 16 * 1024; // don't bother with tiny images (icons, logos)

// Only replace an image if the new encoding is meaningfully smaller.
// Flate images are often line-art/screenshots, so require a bigger win before going lossy.
const DCT_REPLACE_RATIO = 0.9;
const FLATE_REPLACE_RATIO = 0.6;

export interface PdfCompressionResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  imagesOptimized: number;
}

function getFilters(dict: PDFDict): string[] {
  const filter = dict.lookup(PDFName.of('Filter'));
  if (!filter) return [];
  if (filter instanceof PDFName) return [filter.decodeText()];
  if (filter instanceof PDFArray) {
    return filter.asArray().map((f) => (f instanceof PDFName ? f.decodeText() : ''));
  }
  return [];
}

function getNumber(dict: PDFDict, key: string): number | undefined {
  const val = dict.lookup(PDFName.of(key));
  return val instanceof PDFNumber ? val.asNumber() : undefined;
}

/** Returns the number of colour components (1 or 3) for supported colour spaces, else null. */
function getSupportedComponents(dict: PDFDict): 1 | 3 | null {
  const cs = dict.lookup(PDFName.of('ColorSpace'));
  if (cs instanceof PDFName) {
    const name = cs.decodeText();
    if (name === 'DeviceRGB') return 3;
    if (name === 'DeviceGray') return 1;
    return null;
  }
  if (cs instanceof PDFArray && cs.size() >= 2) {
    const kind = cs.lookup(0);
    if (kind instanceof PDFName && kind.decodeText() === 'ICCBased') {
      const iccStream = cs.lookup(1) as { dict?: PDFDict } | undefined;
      const n = iccStream?.dict ? getNumber(iccStream.dict, 'N') : undefined;
      if (n === 3) return 3;
      if (n === 1) return 1;
    }
  }
  return null;
}

/** Reverses PNG row predictors (PDF /Predictor >= 10) on inflated image data. */
function undoPngPredictor(data: Buffer, width: number, height: number, bpp: number): Buffer | null {
  const rowLength = width * bpp;
  const stride = rowLength + 1;
  if (data.length < stride * height) return null;

  const out = Buffer.alloc(rowLength * height);
  let prev = Buffer.alloc(rowLength);

  for (let y = 0; y < height; y++) {
    const filterType = data[y * stride];
    const row = data.subarray(y * stride + 1, y * stride + 1 + rowLength);
    const cur = out.subarray(y * rowLength, (y + 1) * rowLength);

    for (let x = 0; x < rowLength; x++) {
      const left = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      let val: number;
      switch (filterType) {
        case 0:
          val = row[x];
          break;
        case 1:
          val = row[x] + left;
          break;
        case 2:
          val = row[x] + up;
          break;
        case 3:
          val = row[x] + ((left + up) >> 1);
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          val = row[x] + pred;
          break;
        }
        default:
          return null;
      }
      cur[x] = val & 0xff;
    }
    prev = cur;
  }
  return out;
}

async function recompressImage(
  stream: PDFRawStream
): Promise<{ bytes: Buffer; width: number; height: number } | null> {
  const dict = stream.dict;
  const contents = Buffer.from(stream.contents);
  if (contents.length < MIN_IMAGE_BYTES) return null;

  // Skip anything that relies on exact pixel values or unusual encodings
  const imageMask = dict.lookup(PDFName.of('ImageMask'));
  if (imageMask && imageMask.toString() === 'true') return null;
  if (dict.has(PDFName.of('Mask'))) return null;
  if (dict.has(PDFName.of('Decode'))) return null;
  if (getNumber(dict, 'BitsPerComponent') !== 8) return null;

  const width = getNumber(dict, 'Width');
  const height = getNumber(dict, 'Height');
  if (!width || !height) return null;

  const components = getSupportedComponents(dict);
  if (!components) return null;

  const filters = getFilters(dict);
  if (filters.length !== 1) return null;
  const filter = filters[0];

  let pipeline: Sharp;
  if (filter === 'DCTDecode') {
    pipeline = sharp(contents);
  } else if (filter === 'FlateDecode') {
    let raw: Buffer = zlib.inflateSync(contents);
    const parms = dict.lookup(PDFName.of('DecodeParms'));
    const predictor = parms instanceof PDFDict ? (getNumber(parms, 'Predictor') ?? 1) : 1;
    if (predictor >= 10) {
      const unfiltered = undoPngPredictor(raw, width, height, components);
      if (!unfiltered) return null;
      raw = unfiltered;
    } else if (predictor !== 1) {
      return null; // TIFF predictor — not supported
    }
    if (raw.length < width * height * components) return null;
    pipeline = sharp(raw.subarray(0, width * height * components), {
      raw: { width, height, channels: components },
    });
  } else {
    return null;
  }

  let outWidth = width;
  let outHeight = height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    outWidth = Math.max(1, Math.round(width * scale));
    outHeight = Math.max(1, Math.round(height * scale));
    pipeline = pipeline.resize(outWidth, outHeight, { fit: 'fill' });
  }

  const bytes = await pipeline
    .removeAlpha()
    .toColourspace(components === 1 ? 'b-w' : 'srgb')
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  const ratio = filter === 'DCTDecode' ? DCT_REPLACE_RATIO : FLATE_REPLACE_RATIO;
  if (bytes.length >= contents.length * ratio) return null;

  return { bytes, width: outWidth, height: outHeight };
}

export async function compressPdf(input: Buffer): Promise<PdfCompressionResult> {
  const originalSize = input.length;
  const unchanged: PdfCompressionResult = {
    buffer: input,
    originalSize,
    compressedSize: originalSize,
    imagesOptimized: 0,
  };

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
  } catch (err) {
    console.warn('[PDF] Could not parse PDF, uploading original:', err);
    return unchanged;
  }

  // Encrypted streams can't be rewritten safely
  if (pdfDoc.isEncrypted) return unchanged;

  const context = pdfDoc.context;
  const objects = context.enumerateIndirectObjects();

  // Images used as soft masks for other images are left alone
  const softMaskRefs = new Set<string>();
  for (const [, obj] of objects) {
    if (obj instanceof PDFRawStream) {
      const smask = obj.dict.get(PDFName.of('SMask'));
      if (smask instanceof PDFRef) softMaskRefs.add(smask.toString());
    }
  }

  let imagesOptimized = 0;
  for (const [ref, obj] of objects) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (softMaskRefs.has(ref.toString())) continue;

    const subtype = obj.dict.lookup(PDFName.of('Subtype'));
    if (!(subtype instanceof PDFName) || subtype.decodeText() !== 'Image') continue;

    try {
      const result = await recompressImage(obj);
      if (!result) continue;

      const newDict = obj.dict.clone(context);
      newDict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
      newDict.delete(PDFName.of('DecodeParms'));
      newDict.set(PDFName.of('Width'), PDFNumber.of(result.width));
      newDict.set(PDFName.of('Height'), PDFNumber.of(result.height));
      newDict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));

      context.assign(ref, PDFRawStream.of(newDict, new Uint8Array(result.bytes)));
      imagesOptimized++;
    } catch (err) {
      console.warn(`[PDF] Skipping image ${ref.toString()}:`, err);
    }
  }

  try {
    const saved = await pdfDoc.save({ useObjectStreams: true });
    if (saved.length < originalSize) {
      return {
        buffer: Buffer.from(saved),
        originalSize,
        compressedSize: saved.length,
        imagesOptimized,
      };
    }
  } catch (err) {
    console.warn('[PDF] Failed to save optimized PDF, uploading original:', err);
  }

  return unchanged;
}

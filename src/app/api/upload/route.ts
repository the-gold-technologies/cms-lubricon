import { NextResponse } from 'next/server';
import { cloudinary, deleteCloudinaryFileByUrl } from '@/lib/cloudinary';
import sharp from 'sharp';
import { compressPdf } from '@/lib/pdfCompress';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const folder = (data.get('folder') as string) || 'lubricon-india/uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const originalBytes = await file.arrayBuffer();
    let uploadBuffer = Buffer.from(originalBytes);
    const originalSize = uploadBuffer.length;
    let finalFileName = file.name || 'file';
    let mimeType = (file.type || '').toLowerCase();
    const ext = finalFileName.includes('.')
      ? finalFileName.split('.').pop()?.toLowerCase() || ''
      : '';

    const isRasterImage =
      (mimeType.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'bmp'].includes(ext)) &&
      !mimeType.includes('svg') &&
      !mimeType.includes('icon') &&
      ext !== 'svg' &&
      ext !== 'ico';

    const isPdf = mimeType === 'application/pdf' || ext === 'pdf';

    // 1. Auto-compress raster images using sharp
    if (isRasterImage) {
      try {
        const sharpInstance = sharp(uploadBuffer).rotate();
        const meta = await sharpInstance.metadata();

        let pipeline = sharpInstance;
        // Limit max dimensions to 2560px (Ultra-HD / 2K) to eliminate huge 20MB megapixel overhead
        if (meta.width && meta.height && (meta.width > 2560 || meta.height > 2560)) {
          pipeline = pipeline.resize({
            width: 2560,
            height: 2560,
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        // Convert to WebP with optimal balance of visual fidelity and lightweight file size
        const compressed = await pipeline.webp({ quality: 80, effort: 4 }).toBuffer();

        // Use compressed buffer
        uploadBuffer = compressed;
        finalFileName = finalFileName.replace(/\.[^/.]+$/, '') + '.webp';
        mimeType = 'image/webp';
      } catch (imgErr) {
        console.warn('Image compression warning (proceeding with original buffer):', imgErr);
      }
    } else if (isPdf) {
      // 2. Compress PDF: downscale/re-encode embedded images + compressed object streams
      try {
        const result = await compressPdf(uploadBuffer);
        uploadBuffer = Buffer.from(result.buffer);
        console.log(
          `[PDF] ${finalFileName}: ${originalSize} -> ${result.compressedSize} bytes (${result.imagesOptimized} images optimized)`
        );
      } catch (pdfErr) {
        console.warn('PDF optimization skipped (proceeding with original buffer):', pdfErr);
      }
    }

    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: isRasterImage ? 'image' : isPdf ? 'image' : 'auto',
    };

    if (isRasterImage) {
      uploadOptions.format = 'webp';
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      uploadStream.end(uploadBuffer);
    });

    const savedBytes = Math.max(0, originalSize - uploadBuffer.length);
    const compressionRatio =
      originalSize > 0
        ? `${Math.max(0, (1 - uploadBuffer.length / originalSize) * 100).toFixed(1)}%`
        : '0%';

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      name: finalFileName,
      originalSize,
      size: uploadBuffer.length,
      savedBytes,
      compressionRatio,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    let url: string | null = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      url = body.url || null;
    } else {
      const { searchParams } = new URL(request.url);
      url = searchParams.get('url');
    }

    if (!url) {
      return NextResponse.json({ success: false, error: 'File URL is required' }, { status: 400 });
    }

    const deleted = await deleteCloudinaryFileByUrl(url);

    return NextResponse.json({
      success: deleted,
      url,
    });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Delete failed' },
      { status: 500 }
    );
  }
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Default system assets that must never be deleted automatically
const PROTECTED_PUBLIC_IDS = new Set([
  'jaideva/logo/jaideva-main-logo',
  'jaideva/logo/jaideva-main-logo.png',
]);

export interface CloudinaryUrlInfo {
  resourceType: 'image' | 'raw' | 'video';
  publicId: string;
  publicIdWithoutExt: string;
  fullPublicId: string;
  extension: string;
}

/**
 * Accurately parses a Cloudinary delivery URL to extract public_id and resource_type.
 */
export function parseCloudinaryUrl(url: string): CloudinaryUrlInfo | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const beforeUpload = parts[0];
    const afterUpload = parts[1];

    // Determine resource_type (image, raw, video)
    const resourceTypeMatch = beforeUpload.match(/\/(image|raw|video|auto)$/);
    const rawResourceType = resourceTypeMatch ? resourceTypeMatch[1] : 'image';
    const resourceType: 'image' | 'raw' | 'video' =
      rawResourceType === 'raw' || rawResourceType === 'video' ? rawResourceType : 'image';

    // Parse segments after /upload/ to remove transformations and version
    const segments = afterUpload.split('/');
    let startIndex = 0;
    while (startIndex < segments.length) {
      const seg = segments[startIndex];
      // Version string: v12345678
      if (/^v\d+$/.test(seg)) {
        startIndex++;
        break;
      }
      // Transformation parameters (e.g. c_fill,w_300 or q_auto,f_auto)
      if (
        seg.includes(',') ||
        seg.includes('_') ||
        ['c_', 'w_', 'h_', 'q_', 'f_', 'b_', 'e_'].some((prefix) => seg.startsWith(prefix))
      ) {
        startIndex++;
        continue;
      }
      break;
    }

    const publicPath = segments.slice(startIndex).join('/');
    if (!publicPath) return null;

    // Check if filename has an extension
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(publicPath);
    let publicIdWithoutExt = publicPath;
    let extension = '';
    if (hasExtension) {
      const lastDot = publicPath.lastIndexOf('.');
      publicIdWithoutExt = publicPath.slice(0, lastDot);
      extension = publicPath.slice(lastDot + 1).toLowerCase();
    }

    return {
      resourceType,
      publicId: resourceType === 'raw' ? publicPath : publicIdWithoutExt,
      publicIdWithoutExt,
      fullPublicId: publicPath,
      extension,
    };
  } catch (err) {
    console.error('Error parsing Cloudinary URL:', err);
    return null;
  }
}

/**
 * Extracts all Cloudinary URLs from any JSON structure, string, or HTML content.
 */
export function extractCloudinaryUrls(data: any): string[] {
  const urls = new Set<string>();
  const urlRegex = /https?:\/\/[a-zA-Z0-9.-]*cloudinary\.com\/[^\s"'<>)]+/g;

  function traverse(item: any) {
    if (!item) return;

    if (typeof item === 'string') {
      const matches = item.match(urlRegex);
      if (matches) {
        for (const u of matches) {
          const cleanUrl = u.replace(/[.,;:]+$/, '');
          urls.add(cleanUrl);
        }
      }
      return;
    }

    if (Array.isArray(item)) {
      for (const el of item) {
        traverse(el);
      }
      return;
    }

    if (typeof item === 'object') {
      for (const key of Object.keys(item)) {
        traverse(item[key]);
      }
    }
  }

  traverse(data);
  return Array.from(urls);
}

/**
 * Deletes a single file from Cloudinary by its full URL.
 */
export async function deleteCloudinaryFileByUrl(url: string): Promise<boolean> {
  const info = parseCloudinaryUrl(url);
  if (!info) return false;

  // Protect critical seed assets
  if (
    PROTECTED_PUBLIC_IDS.has(info.publicId) ||
    PROTECTED_PUBLIC_IDS.has(info.fullPublicId) ||
    info.publicId.endsWith('jaideva-main-logo')
  ) {
    console.log(`[Cloudinary] Skipping protected asset: ${info.publicId}`);
    return false;
  }

  try {
    // 1. Try deleting with primary detected resource_type
    let result = await cloudinary.uploader.destroy(info.publicId, {
      resource_type: info.resourceType,
      invalidate: true,
    });

    // 2. If not found or if it's a PDF / raw document, attempt alternate resource_type
    if (result?.result !== 'ok' && (info.extension === 'pdf' || info.resourceType === 'image')) {
      const rawResult = await cloudinary.uploader.destroy(info.fullPublicId, {
        resource_type: 'raw',
        invalidate: true,
      });

      if (rawResult?.result === 'ok') {
        result = rawResult;
      } else if (info.extension === 'pdf') {
        const rawNoExtResult = await cloudinary.uploader.destroy(info.publicIdWithoutExt, {
          resource_type: 'raw',
          invalidate: true,
        });
        if (rawNoExtResult?.result === 'ok') {
          result = rawNoExtResult;
        }
      }
    }

    const success = result?.result === 'ok';
    if (success) {
      console.log(`[Cloudinary] Successfully deleted file: ${info.publicId} (${url})`);
    } else {
      console.warn(`[Cloudinary] Delete response for ${info.publicId}:`, result);
    }
    return success;
  } catch (error) {
    console.error(`[Cloudinary] Error deleting file ${url}:`, error);
    return false;
  }
}

/**
 * Compares old data and new data, finds any Cloudinary URLs that were replaced or removed,
 * and deletes them from Cloudinary storage.
 */
export async function cleanupReplacedCloudinaryFiles(
  oldData: any,
  newData: any
): Promise<string[]> {
  if (!oldData) return [];

  const oldUrls = extractCloudinaryUrls(oldData);
  if (oldUrls.length === 0) return [];

  const newUrlsSet = new Set(extractCloudinaryUrls(newData));
  const removedUrls = oldUrls.filter((url) => !newUrlsSet.has(url));

  if (removedUrls.length === 0) return [];

  console.log(
    `[Cloudinary] Cleaning up ${removedUrls.length} replaced/removed files...`,
    removedUrls
  );

  const deleted: string[] = [];
  for (const url of removedUrls) {
    try {
      const ok = await deleteCloudinaryFileByUrl(url);
      if (ok) deleted.push(url);
    } catch (e) {
      console.error(`[Cloudinary] Failed to delete removed URL: ${url}`, e);
    }
  }

  return deleted;
}

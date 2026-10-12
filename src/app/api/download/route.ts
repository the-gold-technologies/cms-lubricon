import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const customName = searchParams.get('name') || 'document.pdf';

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let downloadTarget = fileUrl;

    // Cloudinary blocks public delivery of PDFs by default (401 ACL failure).
    // Generate an authorized private download URL using Cloudinary SDK:
    if (fileUrl.includes('cloudinary.com')) {
      try {
        const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.pdf)?$/i);
        if (match && match[1]) {
          const publicId = match[1];
          downloadTarget = cloudinary.utils.private_download_url(publicId, 'pdf', {
            resource_type: 'image',
            type: 'upload',
            attachment: true,
          });
        }
      } catch (err) {
        console.error('Error generating Cloudinary download URL:', err);
      }
    }

    const response = await fetch(downloadTarget);
    if (!response.ok) {
      return new NextResponse('Failed to fetch file from source', { status: response.status });
    }

    const fileBuffer = await response.arrayBuffer();
    const sanitizedName = customName.endsWith('.pdf') ? customName : customName + '.pdf';
    const cleanFilename = sanitizedName.replace(/[^a-zA-Z0-9_.-]/g, '_');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="' + cleanFilename + '"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('PDF download proxy error:', error);
    return NextResponse.json({ error: error?.message || 'Download failed' }, { status: 500 });
  }
}

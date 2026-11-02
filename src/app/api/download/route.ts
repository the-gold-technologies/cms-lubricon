import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { verifyDownloadToken } from '@/lib/captcha';

export const dynamic = 'force-dynamic';

/**
 * Datasheet PDF download proxy.
 *
 * - Website visitors: `?product=<slug>&token=<signed token>` — the token is only issued by
 *   /api/enquiries after the download form (with captcha) is submitted.
 * - Logged-in CMS admins: `?url=<cloudinary url>` for previewing uploaded PDFs.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('product');
    const token = searchParams.get('token');
    const adminUrl = searchParams.get('url');

    let fileUrl: string;
    let fileName = 'datasheet.pdf';

    if (productSlug) {
      if (!verifyDownloadToken(productSlug, token)) {
        return NextResponse.json(
          { error: 'This download link has expired. Please submit the form again.' },
          { status: 403 }
        );
      }
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { slug: true, pdfUrl: true },
      });
      if (!product?.pdfUrl) {
        return NextResponse.json({ error: 'Datasheet not found' }, { status: 404 });
      }
      fileUrl = product.pdfUrl;
      fileName = `${product.slug}-datasheet.pdf`;
    } else if (adminUrl) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      fileUrl = adminUrl;
      fileName = searchParams.get('name') || fileName;
    } else {
      return NextResponse.json({ error: 'Missing product parameter' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(fileUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    let downloadTarget = fileUrl;

    // Cloudinary blocks public delivery of PDFs by default (401 ACL failure).
    // Generate an authorized private download URL using the Cloudinary SDK:
    if (parsed.hostname.endsWith('cloudinary.com')) {
      try {
        const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.pdf)?$/i);
        if (match && match[1]) {
          downloadTarget = cloudinary.utils.private_download_url(match[1], 'pdf', {
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
    const sanitizedName = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
    const cleanFilename = sanitizedName.replace(/[^a-zA-Z0-9_.-]/g, '_');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="' + cleanFilename + '"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    console.error('PDF download proxy error:', error);
    return NextResponse.json({ error: error?.message || 'Download failed' }, { status: 500 });
  }
}

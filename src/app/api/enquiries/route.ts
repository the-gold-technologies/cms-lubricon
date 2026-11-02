import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEnquiryNotificationEmail } from '@/lib/mail';
import { verifyCaptcha, createDownloadToken } from '@/lib/captcha';

const DATASHEET_ENQUIRY_TYPE = 'Datasheet Download';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');

    const where: any = {};
    if (type) {
      where.type = type;
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit, 10) } : {}),
    });

    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, interestedIn, budget } = body;
    let { product, message } = body;

    const captcha = verifyCaptcha(body.captchaToken, body.captchaAnswer);
    if (!captcha.ok) {
      return NextResponse.json(
        {
          success: false,
          code: 'CAPTCHA_INVALID',
          error:
            captcha.reason === 'expired'
              ? 'Security code expired. Please enter the new code.'
              : 'Incorrect security code. Please try again.',
        },
        { status: 400 }
      );
    }

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and at least one contact method (email or phone) are required',
        },
        { status: 400 }
      );
    }

    // Datasheet download: record who downloaded which product and issue a signed link
    let downloadUrl: string | null = null;
    if (body.type === DATASHEET_ENQUIRY_TYPE) {
      const productSlug = typeof body.productSlug === 'string' ? body.productSlug : '';
      const datasheetProduct = productSlug
        ? await prisma.product.findUnique({
            where: { slug: productSlug },
            select: { name: true, slug: true, pdfUrl: true },
          })
        : null;
      if (!datasheetProduct?.pdfUrl) {
        return NextResponse.json(
          { success: false, error: 'No datasheet is available for this product' },
          { status: 404 }
        );
      }
      product = datasheetProduct.name;
      message = [message, `Downloaded datasheet for ${datasheetProduct.name}`]
        .filter(Boolean)
        .join(' | ');
      const token = createDownloadToken(datasheetProduct.slug);
      downloadUrl = `/api/download?product=${encodeURIComponent(datasheetProduct.slug)}&token=${encodeURIComponent(token)}`;
    }

    const created = await prisma.enquiry.create({
      data: {
        type: body.type || 'General',
        name,
        email: email || 'noemail@provided.com',
        phone: phone || null,
        company: company || body.companyName || null,
        location: body.location || null,
        industry: body.industry || null,
        service: body.service || null,
        timeframe: body.timeframe || null,
        interestedIn: interestedIn || null,
        product: product || interestedIn || null,
        packaging: body.packaging || null,
        budget: budget || null,
        message: message || null,
        status: 'Pending',
      },
    });

    // Fire email notifications asynchronously without blocking the response
    sendEnquiryNotificationEmail(created).catch((mailErr) => {
      console.error('Async email dispatch failed for enquiry:', mailErr);
    });

    return NextResponse.json({ success: true, data: { id: created.id }, downloadUrl });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await prisma.enquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const leads = await prisma.distributorApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching distributor leads:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      firmName,
      email,
      phone,
      city,
      state,
      existingBusiness,
      annualTurnover,
      experienceYears,
      message,
    } = body;

    if (!name || !firmName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, firm name, and phone number are required' },
        { status: 400 }
      );
    }

    const resolvedExistingBusiness =
      existingBusiness ||
      body.currentBusiness ||
      (body.businessType ? `Business: ${body.businessType}` : null) ||
      null;

    const resolvedAnnualTurnover = annualTurnover || body.investmentCapacity || null;

    const extraDetails = [body.lubeType ? `Lube Segment: ${body.lubeType}` : null, message]
      .filter(Boolean)
      .join('\n');

    const created = await prisma.distributorApplication.create({
      data: {
        name,
        firmName,
        email: email || 'noemail@provided.com',
        phone,
        city: city || 'N/A',
        state: state || 'N/A',
        existingBusiness: resolvedExistingBusiness,
        annualTurnover: resolvedAnnualTurnover,
        experienceYears: experienceYears ? String(experienceYears) : null,
        message: extraDetails || null,
        status: 'Pending',
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error submitting distributor lead:', error);
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

    const updated = await prisma.distributorApplication.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating lead status:', error);
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

    await prisma.distributorApplication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

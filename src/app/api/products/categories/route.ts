import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      shortDesc,
      fullDesc,
      coverImage,
      isFeatured,
      primaryCtaText,
      secondaryCtaText,
      featuredBadgeText,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Category name and slug are required' },
        { status: 400 }
      );
    }

    const count = await prisma.productCategory.count();

    const created = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        shortDesc: shortDesc || null,
        fullDesc: fullDesc || null,
        coverImage: coverImage || null,
        primaryCtaText: primaryCtaText || 'Request a Quote',
        secondaryCtaText: secondaryCtaText || 'Browse range',
        featuredBadgeText: featuredBadgeText || 'Featured product',
        isFeatured: isFeatured ?? true,
        order: count,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      slug,
      shortDesc,
      fullDesc,
      coverImage,
      isFeatured,
      order,
      primaryCtaText,
      secondaryCtaText,
      featuredBadgeText,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required for update' },
        { status: 400 }
      );
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase() }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(fullDesc !== undefined && { fullDesc }),
        ...(coverImage !== undefined && { coverImage }),
        ...(primaryCtaText !== undefined && { primaryCtaText }),
        ...(secondaryCtaText !== undefined && { secondaryCtaText }),
        ...(featuredBadgeText !== undefined && { featuredBadgeText }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const cat = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!cat) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Reassign products of this category to another category if any exist to prevent foreign key errors
    const fallbackCategory = await prisma.productCategory.findFirst({
      where: { id: { not: id } },
      orderBy: { order: 'asc' },
    });

    if (fallbackCategory) {
      await prisma.product.updateMany({
        where: { categorySlug: cat.slug },
        data: {
          categorySlug: fallbackCategory.slug,
          categoryName: fallbackCategory.name,
        },
      });
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

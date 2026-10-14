import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await prisma.navLink.findMany({
      orderBy: { order: 'asc' },
    });

    const prodLink = links.find(
      (l: any) => l.url === '/products' || l.label.toLowerCase() === 'products'
    );
    const indLink = links.find(
      (l: any) => l.url === '/industries' || l.label.toLowerCase().includes('industr')
    );

    const result = links.map((link: any) => {
      let resolvedParent = link.parent || '-';
      if ((resolvedParent === 'Products' || resolvedParent === 'products') && prodLink) {
        resolvedParent = prodLink.id;
      } else if (
        (resolvedParent === 'Industries' ||
          resolvedParent === 'Industries We Serve' ||
          resolvedParent === 'industries') &&
        indLink
      ) {
        resolvedParent = indLink.id;
      }

      return {
        id: link.id,
        label: link.label,
        title: link.title || link.label.toUpperCase(),
        url: link.url,
        type:
          link.type ||
          (link.url === '/products' || link.url === '/industries' ? 'Dropdown' : 'Main Link'),
        parent: resolvedParent,
        order: link.order,
        isStatic: link.isStatic,
        description: link.description,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching nav links:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label, url, type, parent, order, title, description } = body;

    if (!label || !url) {
      return NextResponse.json(
        { success: false, error: 'Label and URL are required' },
        { status: 400 }
      );
    }

    const parentVal = parent && parent.trim() && parent !== '-' ? parent.trim() : '-';

    // Calculate next order if not provided
    let assignedOrder = typeof order === 'number' ? order : 0;
    if (typeof order !== 'number') {
      const existing = await prisma.navLink.findMany({
        where: { parent: parentVal },
        orderBy: { order: 'desc' },
        take: 1,
      });
      assignedOrder = existing.length > 0 ? (existing[0].order ?? 0) + 1 : 0;
    }

    const newLink = await prisma.navLink.create({
      data: {
        label: label.trim(),
        url: url.trim(),
        type: type || (parentVal === '-' ? 'Main Link' : 'Dropdown'),
        parent: parentVal,
        order: assignedOrder,
        title: title || label.trim().toUpperCase(),
        description: description || null,
        isStatic: false,
      },
    });

    return NextResponse.json({ success: true, data: newLink });
  } catch (error) {
    console.error('Error creating nav link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create navigation link' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // 1. Single Link Update
    if (body.id) {
      const { id, label, url, type, parent, order, title, description } = body;
      const updated = await prisma.navLink.update({
        where: { id },
        data: {
          ...(label !== undefined ? { label: label.trim() } : {}),
          ...(url !== undefined ? { url: url.trim() } : {}),
          ...(type !== undefined ? { type } : {}),
          ...(parent !== undefined ? { parent: parent || '-' } : {}),
          ...(order !== undefined ? { order: Number(order) } : {}),
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 2. Bulk links reorder
    const { links } = body;
    if (Array.isArray(links)) {
      for (const item of links) {
        if (item.id) {
          await prisma.navLink.update({
            where: { id: item.id },
            data: {
              ...(item.order !== undefined ? { order: Number(item.order) } : {}),
              ...(item.parent !== undefined ? { parent: item.parent || '-' } : {}),
              ...(item.type !== undefined ? { type: item.type } : {}),
            },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error('Error updating nav links:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Link ID is required' }, { status: 400 });
    }

    // Cascade delete any child links
    await prisma.navLink.deleteMany({
      where: { parent: id },
    });

    // Delete the target link
    await prisma.navLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting nav link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation link' },
      { status: 500 }
    );
  }
}

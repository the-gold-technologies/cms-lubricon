import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await prisma.navLink.findMany({
      orderBy: { order: 'asc' },
    });

    const categories = await prisma.productCategory.findMany({
      orderBy: { order: 'asc' },
    });

    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
    });

    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const result: any[] = [];

    // Find Products link ID
    const prodLink = links.find(
      (l: any) => l.url === '/products' || l.label.toLowerCase() === 'products'
    );
    const prodLinkId = prodLink ? prodLink.id : 'products';

    // Find Blog link ID
    const blogLink = links.find(
      (l: any) => l.url === '/blogs' || l.label.toLowerCase().includes('blog')
    );
    const blogLinkId = blogLink ? blogLink.id : 'blogs';

    // 1. Root Navigation Links (Home, About, Brands, Products, Industries, Gallery, Blog, Contact)
    for (const link of links) {
      result.push({
        id: link.id,
        label: link.label,
        title: link.title || link.label.toUpperCase(),
        url: link.url,
        type: link.type || (link.url === '/products' ? 'Dropdown' : 'Main Link'),
        parent: '-',
        order: link.order,
      });
    }

    // 2. Product Brand Categories under Products
    if (prodLinkId) {
      for (const cat of categories) {
        const catId = `cat-${cat.id}`;
        result.push({
          id: catId,
          label: cat.name,
          title: cat.name.toUpperCase(),
          url: `/products/${cat.slug}`,
          type: 'Category',
          parent: prodLinkId,
          order: cat.order,
        });

        // 3. Products under each Brand Category
        const brandProducts = products.filter((p: any) => p.categorySlug === cat.slug);
        for (const prod of brandProducts) {
          result.push({
            id: `prod-${prod.id}`,
            label: prod.name,
            title: prod.name.toUpperCase(),
            url: `/products/${cat.slug}/${prod.slug}`,
            type: 'Product',
            parent: catId,
            order: prod.order,
          });
        }
      }
    }

    // 4. Blog Posts under Blog
    if (blogLinkId) {
      for (const post of blogPosts) {
        result.push({
          id: `blog-${post.id}`,
          label: post.title,
          title: post.title.toUpperCase(),
          url: `/blogs/${post.slug}`,
          type: 'Blog Article',
          parent: blogLinkId,
          order: 0,
        });
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching nav links:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { links } = body;

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { success: false, error: 'links array is required' },
        { status: 400 }
      );
    }

    // Only persist root links (filter out dynamic nested items)
    const rootIncoming = links.filter(
      (l: any) =>
        l.id && !l.id.startsWith('cat-') && !l.id.startsWith('prod-') && !l.id.startsWith('blog-')
    );

    const incomingIds = rootIncoming
      .filter((l: any) => !l.id.startsWith('nav-'))
      .map((l: any) => l.id);

    await prisma.navLink.deleteMany({
      where: {
        id: { notIn: incomingIds },
      },
    });

    for (let i = 0; i < rootIncoming.length; i++) {
      const link = rootIncoming[i];
      const navData = {
        label: link.label,
        title: link.title || link.label.toUpperCase(),
        url: link.url,
        type: link.type || 'Main Link',
        parent: '-',
        order: i,
      };

      if (link.id && !link.id.startsWith('nav-')) {
        await prisma.navLink.update({
          where: { id: link.id },
          data: navData,
        });
      } else {
        await prisma.navLink.create({
          data: navData,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating nav links:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

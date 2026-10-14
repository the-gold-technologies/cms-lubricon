import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupReplacedCloudinaryFiles } from '@/lib/cloudinary';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
      });
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const seo = {
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        targetKeywords: product.targetKeywords,
        canonicalUrl: product.canonicalUrl,
        noIndex: product.noIndex,
        schema: product.schema,
        headingOptions: product.headingOptions,
      };
      return NextResponse.json({ success: true, data: product, seo });
    }

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
      });
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      const seo = {
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        targetKeywords: product.targetKeywords,
        canonicalUrl: product.canonicalUrl,
        noIndex: product.noIndex,
        schema: product.schema,
        headingOptions: product.headingOptions,
      };
      return NextResponse.json({ success: true, data: product, seo });
    }

    const search = searchParams.get('search') || searchParams.get('q');
    const where: any = {};
    if (categorySlug && categorySlug !== 'all') {
      where.categorySlug = categorySlug;
    }
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { subCategoryTitle: { contains: term, mode: 'insensitive' } },
        { categoryName: { contains: term, mode: 'insensitive' } },
        { specsText: { contains: term, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    const categories = await prisma.productCategory.findMany({
      orderBy: { order: 'asc' },
    });

    let seo = null;
    if (categorySlug && categorySlug !== 'all') {
      const seoPage = await prisma.page.findUnique({
        where: { slug: `products/${categorySlug}` },
      });
      if (seoPage) {
        seo = {
          metaTitle: seoPage.metaTitle,
          metaDescription: seoPage.metaDescription,
          targetKeywords: seoPage.targetKeywords,
          canonicalUrl: seoPage.canonicalUrl,
          noIndex: seoPage.noIndex,
          schema: seoPage.schema,
          headingOptions: seoPage.headingOptions,
        };
      }
    }

    const productsPage = await prisma.page.findUnique({
      where: { slug: "products" },
      include: { sections: true },
    });
    const heroSection = productsPage?.sections.find((s: any) => s.type === "ProductsHero");

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        hero: heroSection?.content || null,
      },
      hero: heroSection?.content || null,
      seo,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, ...rest } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const highestOrder = await prisma.product.aggregate({
      _max: { order: true },
    });
    const order = (highestOrder._max.order ?? -1) + 1;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        order,
        ...rest,
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.section === "ProductsHero" || body.sectionType === "ProductsHero") {
      const page = await prisma.page.upsert({
        where: { slug: "products" },
        update: {},
        create: {
          slug: "products",
          title: "All Products",
          visibility: "published",
          isStatic: true,
        },
      });

      const existingSection = await prisma.section.findFirst({
        where: { pageId: page.id, type: "ProductsHero" },
      });

      if (existingSection) {
        await cleanupReplacedCloudinaryFiles(existingSection.content, body.content);
        await prisma.section.update({
          where: { id: existingSection.id },
          data: { content: body.content },
        });
      } else {
        await prisma.section.create({
          data: {
            pageId: page.id,
            type: "ProductsHero",
            content: body.content,
            order: 1,
          },
        });
      }

      return NextResponse.json({ success: true, data: body.content });
    }

    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (existingProduct) {
      await cleanupReplacedCloudinaryFiles(existingProduct, data);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (existingProduct) {
      await cleanupReplacedCloudinaryFiles(existingProduct, null);
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

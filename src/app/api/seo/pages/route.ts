import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        type: true,
        visibility: true,
        headingOptions: true,
        order: true,
        parent: true,
        description: true,
        isStatic: true,
      },
      orderBy: { order: 'asc' },
    });

    // Fixed display order for website pages in Per-Page SEO
    const pageOrderMap: Record<string, number> = {
      about: 1,
      products: 2,
      industries: 3,
      contact: 4,
      'privacy-policy': 5,
    };

    const titleMap: Record<string, string> = {
      about: 'About Us',
      products: 'Products',
      industries: 'Industries We Serve',
      contact: 'Contact Us',
      'privacy-policy': 'Privacy Policy',
    };

    // Filter out 'home' (Home SEO is managed under Global SEO / Static Pages -> Home)
    // and exclude any category/product sub-paths so each website section is a single flat page entry
    const standalonePages = pages.filter((p: any) => p.slug !== 'home' && !p.slug.includes('/'));

    // Ensure default core pages exist in the list
    const coreSlugs = ['about', 'products', 'industries', 'contact'];
    const mergedList: any[] = [];
    const seenSlugs = new Set<string>();

    for (const p of standalonePages) {
      const normalizedSlug = p.slug.toLowerCase().trim();
      seenSlugs.add(normalizedSlug);

      mergedList.push({
        id: p.id,
        pageId: p.id,
        title: titleMap[normalizedSlug] || p.title,
        slug: p.slug,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        type: 'Standard Page',
        visibility: p.visibility || 'published',
        parent: '-',
        order: pageOrderMap[normalizedSlug] ?? (p.order || 50),
        description:
          p.description || `SEO configuration for ${titleMap[normalizedSlug] || p.title}`,
        navTitle: titleMap[normalizedSlug] || p.title,
        isStatic: true,
        headingOptions: p.headingOptions,
      });
    }

    // If any core page isn't in DB yet, add it as a placeholder
    for (const coreSlug of coreSlugs) {
      if (!seenSlugs.has(coreSlug)) {
        mergedList.push({
          id: `page-${coreSlug}`,
          pageId: null,
          title: titleMap[coreSlug] || coreSlug,
          slug: coreSlug,
          metaTitle: null,
          metaDescription: null,
          type: 'Standard Page',
          visibility: 'published',
          parent: '-',
          order: pageOrderMap[coreSlug] ?? 10,
          description: `SEO configuration for ${titleMap[coreSlug]}`,
          navTitle: titleMap[coreSlug],
          isStatic: true,
        });
      }
    }

    mergedList.sort((a, b) => a.order - b.order);

    return NextResponse.json({ success: true, data: mergedList });
  } catch (error) {
    console.error('Error fetching pages for SEO:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

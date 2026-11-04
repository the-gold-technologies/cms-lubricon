import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupReplacedCloudinaryFiles } from '@/lib/cloudinary';

const INDUSTRIES_SLUG = 'industries';

/**
 * Keep product industry tags in sync when industries are renamed or removed.
 * `renames` maps old slug -> new slug; `removed` lists slugs that no longer exist.
 */
async function syncProductIndustryTags(renames: Record<string, string>, removed: string[]) {
  const affected = [...Object.keys(renames), ...removed];
  if (affected.length === 0) return;

  const products = await prisma.product.findMany({
    where: { industrySlugs: { hasSome: affected } },
    select: { id: true, industrySlugs: true },
  });

  for (const product of products) {
    const next = Array.from(
      new Set(
        (product.industrySlugs as string[])
          .filter((s) => !removed.includes(s))
          .map((s) => renames[s] ?? s)
      )
    );
    await prisma.product.update({
      where: { id: product.id },
      data: { industrySlugs: next },
    });
  }
}

export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: INDUSTRIES_SLUG },
      include: { sections: true },
    });

    if (!page) {
      const industries = await prisma.industry.findMany({ orderBy: { order: 'asc' } });
      return NextResponse.json({ success: true, data: { industries }, seo: null });
    }

    const sectionsMap: Record<string, any> = {};
    for (const section of page.sections) {
      sectionsMap[section.type] = section.content;
    }

    const seo = {
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      targetKeywords: page.targetKeywords,
      canonicalUrl: page.canonicalUrl,
      noIndex: page.noIndex,
      schema: page.schema,
      headingOptions: page.headingOptions,
    };

    const industries = await prisma.industry.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...sectionsMap,
        industries,
      },
      seo,
    });
  } catch (error) {
    console.error('Error fetching industries page data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const page = await prisma.page.upsert({
      where: { slug: INDUSTRIES_SLUG },
      create: {
        title: 'Industries',
        slug: INDUSTRIES_SLUG,
        type: 'static',
        visibility: 'published',
      },
      update: {},
    });

    let sectionsToSave: Record<string, any> = {};

    if (Array.isArray(body.industries)) {
      const incomingIds = body.industries.map((ind: any) => ind.id).filter(Boolean);
      const removedIndustries = await prisma.industry.findMany({
        where: { id: { notIn: incomingIds } },
        select: { slug: true },
      });
      const removedSlugs: string[] = removedIndustries.map((r: { slug: string }) => r.slug);
      const renamedSlugs: Record<string, string> = {};
      await prisma.industry.deleteMany({
        where: { id: { notIn: incomingIds } },
      });
      for (let i = 0; i < body.industries.length; i++) {
        const ind = body.industries[i];
        const slug =
          ind.slug ||
          ind.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') ||
          `industry-${Date.now()}-${i}`;
        const data = {
          name: ind.name,
          slug,
          icon: ind.icon || null,
          image: ind.image || null,
          description: ind.description || '',
          challenges: Array.isArray(ind.challenges) ? ind.challenges : [],
          solutions: Array.isArray(ind.solutions) ? ind.solutions : [],
          recommendedProducts: Array.isArray(ind.recommendedProducts)
            ? ind.recommendedProducts
            : [],
          order: ind.order !== undefined ? Number(ind.order) : i,
          isFeatured: ind.isFeatured !== undefined ? Boolean(ind.isFeatured) : true,
        };
        if (ind.id) {
          const existingInd = await prisma.industry.findUnique({
            where: { id: ind.id },
          });
          if (existingInd) {
            await cleanupReplacedCloudinaryFiles(existingInd, data);
            if (existingInd.slug !== slug) renamedSlugs[existingInd.slug] = slug;
          }
          await prisma.industry.upsert({
            where: { id: ind.id },
            update: data,
            create: { id: ind.id, ...data },
          });
        } else {
          await prisma.industry.create({
            data,
          });
        }
      }
      await syncProductIndustryTags(renamedSlugs, removedSlugs);
    }

    if (body.section && body.content !== undefined) {
      sectionsToSave[body.section] = body.content;
    } else if (body.sections && typeof body.sections === 'object') {
      sectionsToSave = body.sections;
    } else {
      sectionsToSave = body;
    }

    for (const [sectionType, content] of Object.entries(sectionsToSave)) {
      if (
        sectionType === 'sections' ||
        sectionType === 'section' ||
        sectionType === 'content' ||
        sectionType === 'seo'
      )
        continue;

      const existing = await prisma.section.findFirst({
        where: { pageId: page.id, type: sectionType },
      });

      if (existing) {
        await cleanupReplacedCloudinaryFiles(existing.content, content);

        await prisma.section.update({
          where: { id: existing.id },
          data: { content: content as any },
        });
      } else {
        const count = await prisma.section.count({
          where: { pageId: page.id },
        });
        await prisma.section.create({
          data: {
            pageId: page.id,
            type: sectionType,
            content: content as any,
            order: count,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving industries page sections:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Industry ID is required' },
        { status: 400 }
      );
    }

    const existingInd = await prisma.industry.findUnique({
      where: { id },
    });

    if (existingInd) {
      await cleanupReplacedCloudinaryFiles(existingInd, null);
    }

    await prisma.industry.delete({
      where: { id },
    });

    if (existingInd) {
      await syncProductIndustryTags({}, [existingInd.slug]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting industry:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

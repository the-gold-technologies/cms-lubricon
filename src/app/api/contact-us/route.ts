import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupReplacedCloudinaryFiles } from '@/lib/cloudinary';

const CONTACT_SLUG = 'contact-us';

export async function GET() {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: { in: ['contact-us', 'contact'] } },
      include: { sections: true },
    });
    const offices = await prisma.officeLocation.findMany({
      orderBy: { order: 'asc' },
    });

    const sectionsMap: Record<string, any> = {};
    if (page?.sections) {
      for (const section of page.sections) {
        if (section.type !== 'RegionalOffices') {
          sectionsMap[section.type] = section.content;
        }
      }
    }

    const seo = page
      ? {
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          targetKeywords: page.targetKeywords,
          canonicalUrl: page.canonicalUrl,
          noIndex: page.noIndex,
          schema: page.schema,
          headingOptions: page.headingOptions,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        sections: sectionsMap,
        ...sectionsMap,
        offices,
      },
      offices,
      seo,
    });
  } catch (error) {
    console.error('Error fetching contact-us:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    let page = await prisma.page.findFirst({
      where: { slug: { in: ['contact', 'contact-us'] } },
    });

    if (!page) {
      page = await prisma.page.create({
        data: {
          title: 'Contact Us',
          slug: 'contact',
          type: 'static',
          visibility: 'published',
        },
      });
    }

    // 1. Check if section-level update
    if (body.section && body.content !== undefined) {
      const existing = await prisma.section.findFirst({
        where: { pageId: page.id, type: body.section },
      });

      if (existing) {
        await cleanupReplacedCloudinaryFiles(existing.content, body.content);

        await prisma.section.update({
          where: { id: existing.id },
          data: { content: body.content },
        });
      } else {
        const count = await prisma.section.count({ where: { pageId: page.id } });
        await prisma.section.create({
          data: {
            pageId: page.id,
            type: body.section,
            content: body.content,
            order: count,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    // 2. Full object update
    for (const [sectionType, content] of Object.entries(body)) {
      if (
        sectionType === 'sections' ||
        sectionType === 'offices' ||
        sectionType === 'seo' ||
        sectionType === 'RegionalOffices'
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
        const count = await prisma.section.count({ where: { pageId: page.id } });
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
    console.error('Error updating contact-us sections:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

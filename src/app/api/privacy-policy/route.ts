import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupReplacedCloudinaryFiles } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const PRIVACY_SLUG = 'privacy-policy';

export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: PRIVACY_SLUG },
      include: { sections: true },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Privacy Policy page not found in database' },
        { status: 404 }
      );
    }

    const sectionsMap: Record<string, any> = {};
    for (const section of page.sections) {
      sectionsMap[section.type] = section.content;
    }

    const policyContent = sectionsMap['PrivacyPolicyContent'] || sectionsMap['content'] || null;
    if (!policyContent) {
      return NextResponse.json(
        { success: false, error: 'Privacy Policy content not found in database' },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      data: policyContent,
      seo,
    });
  } catch (error) {
    console.error('Error fetching privacy-policy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const heroTitle = body.heroHeading || body.title || 'Privacy Policy';

    const page = await prisma.page.upsert({
      where: { slug: PRIVACY_SLUG },
      create: {
        title: heroTitle,
        slug: PRIVACY_SLUG,
        type: 'legal',
        visibility: body.isPublished === false ? 'draft' : 'published',
        order: 5,
        metaTitle: 'Privacy Policy | Lubricon Specialities India',
        metaDescription:
          'Read the official Privacy Policy of Lubricon Specialities India — Australian technology lubricants and industrial fluids data protection practices.',
        targetKeywords:
          'Privacy Policy, Lubricon Specialities India, Australian Lubricants data privacy',
        canonicalUrl: '/privacy-policy',
        noIndex: false,
        headingOptions: 'h1',
      },
      update: {
        title: heroTitle,
        visibility: body.isPublished === false ? 'draft' : 'published',
      },
    });

    const contentData = {
      title: heroTitle,
      heroBadge: body.heroBadge || '',
      heroHeading: heroTitle,
      heroDescription: body.heroDescription || '',
      heroBannerImage: body.heroBannerImage || '',
      lastUpdated: body.lastUpdated || '',
      content: body.content || '',
      isPublished: body.isPublished ?? true,
    };

    const existingSection = await prisma.section.findFirst({
      where: { pageId: page.id, type: 'PrivacyPolicyContent' },
    });

    if (existingSection) {
      await cleanupReplacedCloudinaryFiles(existingSection.content, contentData);

      await prisma.section.update({
        where: { id: existingSection.id },
        data: { content: contentData as any },
      });
    } else {
      await prisma.section.create({
        data: {
          pageId: page.id,
          type: 'PrivacyPolicyContent',
          content: contentData as any,
          order: 0,
        },
      });
    }

    return NextResponse.json({ success: true, data: contentData });
  } catch (error) {
    console.error('Error saving privacy-policy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

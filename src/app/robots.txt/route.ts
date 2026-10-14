import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.globalConfig.findFirst();

    if (!config?.robotsTxt) {
      return new NextResponse('Robots.txt is not configured in CMS', { status: 404 });
    }

    return new NextResponse(config.robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('Error generating robots.txt:', err);
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}

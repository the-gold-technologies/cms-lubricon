import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.globalConfig.findUnique({ where: { id: 'global' } });
    const targetUrl = config?.favicon?.trim();

    if (!targetUrl) {
      return new NextResponse(null, { status: 204 });
    }

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return NextResponse.redirect(targetUrl, 307);
    }

    return NextResponse.redirect(
      new URL(targetUrl, process.env.NEXTAUTH_URL || 'http://localhost:3001'),
      307
    );
  } catch (error) {
    return new NextResponse(null, { status: 204 });
  }
}

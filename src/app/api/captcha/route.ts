import { NextResponse } from 'next/server';
import { createCaptcha } from '@/lib/captcha';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { token, svg } = createCaptcha();
    return NextResponse.json(
      { success: true, token, svg },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Captcha generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not generate captcha' },
      { status: 500 }
    );
  }
}

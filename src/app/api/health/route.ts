import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'jai-deva-cms',
    timestamp: new Date().toISOString(),
  });
}

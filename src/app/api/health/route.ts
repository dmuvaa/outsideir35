import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'outsideir35',
    time: new Date().toISOString(),
  });
}

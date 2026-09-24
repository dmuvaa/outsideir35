import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = new URL('/auth/confirm', url.origin);
  for (const key of ['code', 'token_hash', 'type']) {
    const value = url.searchParams.get(key);
    if (value) next.searchParams.set(key, value);
  }
  return NextResponse.redirect(next);
}

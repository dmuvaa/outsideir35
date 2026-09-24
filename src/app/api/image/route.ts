import { NextRequest, NextResponse } from 'next/server';
import { allowedStorageUrl, isAllowedImagePath } from '@/lib/platform';

export async function GET(request: NextRequest) {
  let targetUrl = request.nextUrl.searchParams.get('url');
  const path = request.nextUrl.searchParams.get('path');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (path) {
    if (!supabaseUrl) {
      return new NextResponse('Server configuration error', { status: 500 });
    }
    if (!isAllowedImagePath(path)) {
      return new NextResponse('Invalid path', { status: 403 });
    }
    targetUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${path}`;
  }

  if (!targetUrl) {
    return new NextResponse('Missing url or path parameter', { status: 400 });
  }

  if (!allowedStorageUrl(targetUrl, supabaseUrl)) {
    return new NextResponse('Invalid image URL', { status: 403 });
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Unsupported media type', { status: 415 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

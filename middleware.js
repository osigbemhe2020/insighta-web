import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/error'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow auth callback through
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Check for access_token cookie
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // No tokens at all — redirect to login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)'
  ]
};
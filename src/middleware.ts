import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// TOGGLE THIS: set to false to bring the site back
// ============================================
const MAINTENANCE_MODE = false;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Redirect naked domain to www subdomain on production
  if (hostname === 'samparka.online') {
    url.hostname = 'www.samparka.online';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // During maintenance, block all routes except the homepage
  if (MAINTENANCE_MODE && url.pathname !== '/') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo images (assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

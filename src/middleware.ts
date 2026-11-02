import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// GET endpoints that expose private data (leads, stats, admin account) — never public
const PRIVATE_GET_PREFIXES = ['/api/enquiries', '/api/dashboard', '/api/profile'];

/**
 * API requests the public website is allowed to make without an admin session:
 * - reading published content (GET), except the private endpoints above
 * - submitting enquiries (captcha-verified in the route)
 * - NextAuth's own endpoints
 * /api/download is a GET and does its own token / session check.
 */
function isPublicApiRequest(method: string, pathname: string): boolean {
  if (pathname.startsWith('/api/auth')) return true;
  if (method === 'GET' || method === 'HEAD') {
    return !PRIVATE_GET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }
  return method === 'POST' && pathname === '/api/enquiries';
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const currentUrl = new URL(req.url);
  const origin = req.headers.get('origin') || '*';

  // 1. Universal CORS Handling for all /api/ routes
  if (nextUrl.pathname.startsWith('/api/')) {
    // Handle OPTIONS Preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers':
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only the public website's needs are open; everything else requires an admin session
    if (!isLoggedIn && !isPublicApiRequest(req.method, nextUrl.pathname)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // 2. Auth Routes & Public Pages
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/login', '/register', '/robots.txt', '/sitemap.xml'].includes(
    nextUrl.pathname
  );

  if (isApiAuthRoute) return NextResponse.next();

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', currentUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', currentUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

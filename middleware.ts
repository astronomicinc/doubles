import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/status',
  '/accepted',
  '/confirmation',
  '/manage-seat',
  '/post-event/sparks',
  '/post-event/match',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get('auth_token')?.value;

  if (!sessionToken) {
    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Session token exists, pass it along in headers for server components to verify
  // Actual verification happens in server components via getCurrentUser()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-token', sessionToken);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/status/:path*',
    '/accepted/:path*',
    '/confirmation/:path*',
    '/manage-seat/:path*',
    '/post-event/:path*',
    '/admin/:path*',
  ],
};

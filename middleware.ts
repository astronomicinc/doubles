import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/auth';

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

export async function middleware(request: NextRequest) {
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

  // Verify session
  const sessionResult = await verifySession(sessionToken);

  if (!sessionResult.success || !sessionResult.user) {
    // Clear invalid session cookie
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // Session is valid, add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', sessionResult.user.id);
  requestHeaders.set('x-user-email', sessionResult.user.email);

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

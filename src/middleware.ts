import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection for the admin area.
 *
 * The app authenticates with the Firebase client SDK, so we cannot verify a
 * real ID token in the edge runtime without a heavier setup (session cookies +
 * next-firebase-auth-edge). Instead we check a lightweight presence cookie
 * (`sm_session`) that AuthContext sets/clears on auth state changes. This gives
 * a fast server-side redirect and avoids a flash of the admin UI for logged-out
 * visitors.
 *
 * IMPORTANT: This is defense-in-depth / UX only. The real security boundary is
 * Firestore Security Rules (see firestore.rules) plus the client-side
 * AdminGuard, which enforce role/email authorization.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('sm_session')?.value);

  const isLoginRoute = pathname.startsWith('/admin/login');
  const isAdminRoute = pathname.startsWith('/admin');

  // Block the dashboard when there's no session — send to login.
  if (isAdminRoute && !isLoginRoute && !hasSession) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated users shouldn't see the login page.
  if (isLoginRoute && hasSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

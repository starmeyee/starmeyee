import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a foundational middleware.
// For robust Firebase auth in middleware, you typically use next-firebase-auth-edge 
// or verify session cookies. Here we set up the structure.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Basic structural check for auth token/cookie
    // Replace 'session' with your actual auth cookie name later
    const session = request.cookies.get('session');
    
    // TEMPORARY: Commented out the server-side redirect until session cookies 
    // are implemented via Firebase Admin SDK. 
    // Client-side ProtectedRoute handles this for now.
    /*
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    */
    
    // Note: True role verification should happen server-side 
    // or by decoding the JWT securely in edge runtime.
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  // If user is not authenticated on a protected path → redirect to sign-in
  if (!token) {
    if (pathname === pagesOptions.signIn) {
      return NextResponse.next();
    }
    const signInUrl = new URL(pagesOptions.signIn!, req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (token && pathname === pagesOptions.signIn) {
    return NextResponse.redirect(new URL('/fleet-overview', req.url));
  }

  // Authenticated user hitting `/` → redirect to fleet-overview
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fleet-overview', req.url));
  }

  // RBAC for Operation Overview
  if (pathname === '/operation-overview') {
    const role = (token.user as any)?.role_code;
    if (role === 'owner' || role === 'vessel') {
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|logo|auth|engine|airlines-logo|email-templates|public).*)',
  ],
};

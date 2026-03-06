import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/citizen(.*)',
  '/api/sensor(.*)',
  '/api/readings(.*)',
  '/api/advisory(.*)',
  '/api/qna(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For admin routes, check authentication AND role
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    
    // Check if user is logged in
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has admin role
    const role = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
    
    if (role !== 'admin') {
      // Redirect non-admin users to citizen dashboard
      return NextResponse.redirect(new URL('/citizen?error=unauthorized', req.url));
    }
  }

  // Protect all other routes
  await auth.protect();
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

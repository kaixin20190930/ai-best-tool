import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/profile',
  '/favorites',
  '/settings',
  '/submit',
];

/**
 * Admin routes that require admin role
 */
const adminRoutes = [
  '/admin',
];

/**
 * Auth routes that should redirect if already authenticated
 */
const authRoutes = [
  '/login',
  '/register',
];

/**
 * Check if a path matches any of the route patterns
 * Handles both with and without locale prefix
 */
function matchesRoute(path: string, routes: string[]): boolean {
  // Remove locale prefix if present (e.g., /en/profile -> /profile)
  const pathWithoutLocale = path.replace(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)/, '');
  
  return routes.some(route => 
    path.startsWith(route) || pathWithoutLocale.startsWith(route)
  );
}

/**
 * Middleware to protect routes
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAdminRoute = matchesRoute(pathname, adminRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);

  // Get user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if accessing protected route without auth
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access
  if (isAdminRoute && user) {
    if (!isAdminUser(user)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect to home if accessing auth routes while authenticated
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

/**
 * Check if user is authenticated (for use in Server Components)
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Check if user is admin (for use in Server Components)
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (!isAdminUser(user)) {
    throw new Error('Forbidden');
  }

  return user;
}

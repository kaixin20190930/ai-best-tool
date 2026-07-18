import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { BASE_URL } from './lib/env';
import intlMiddleware from './middlewares/intlMiddleware';

const localePattern = /^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/;

const protectedRoutes = ['/profile', '/favorites', '/settings', '/submit'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register', '/auth'];
const indexableGuidePaths = new Set([
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/best-free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-seo-tools',
  '/guides/ai-video-tools',
  '/guides/ai-image-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-chatbot-tools',
  '/guides/ai-productivity-tools',
  '/guides/ai-tools-for-research',
  '/guides/ai-tools-for-developers',
  '/guides/ai-tools-for-automation',
  '/guides/ai-tools-for-web3',
  '/guides/ai-tools-for-marketing',
  '/guides/ai-tools-for-sales',
  '/guides/ai-tools-for-voice',
  '/guides/ai-note-taking-tools',
]);
const noindexPublicRoutes = ['/pricing', '/submit', '/developer/listing', '/new'];

function getPathParts(pathname: string) {
  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch?.[1] || null;
  const pathWithoutLocale = locale ? pathname.replace(localePattern, '') || '/' : pathname;

  return { locale, pathWithoutLocale };
}

function matchesRoute(pathname: string, routes: string[]) {
  const { pathWithoutLocale } = getPathParts(pathname);

  return routes.some((route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`));
}

function shouldNoindexPublicPath(pathname: string) {
  const { pathWithoutLocale } = getPathParts(pathname);

  if (noindexPublicRoutes.some((route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`))) {
    return true;
  }

  if (pathWithoutLocale.startsWith('/guides/') && !indexableGuidePaths.has(pathWithoutLocale)) {
    return true;
  }

  return false;
}

function withIndexingHeaders(request: NextRequest, response: NextResponse) {
  if (shouldNoindexPublicPath(request.nextUrl.pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

function isAuthCallbackRoute(pathname: string) {
  const { pathWithoutLocale } = getPathParts(pathname);

  return pathWithoutLocale === '/auth' || pathWithoutLocale.startsWith('/auth/');
}

function getLocalizedPath(pathname: string, targetPath: string) {
  const { locale } = getPathParts(pathname);

  if (!locale || locale === 'en') {
    return targetPath;
  }

  return `/${locale}${targetPath}`;
}

function getLocalizedAdminDashboardPath(pathname: string) {
  const { locale } = getPathParts(pathname);
  const targetLocale = locale || 'cn';
  return `/${targetLocale}/admin/dashboard`;
}

function getPreferredHost() {
  try {
    const hostname = new URL(BASE_URL).hostname.toLowerCase();
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch {
    return '';
  }
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local');
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

async function getCurrentUser(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, response };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { user, response };
  } catch (error) {
    return { user: null, response };
  }
}

export async function middleware(request: NextRequest) {
  const preferredHost = getPreferredHost();
  const currentHost = request.nextUrl.hostname.toLowerCase();
  if (preferredHost && !isLocalHost(currentHost)) {
    const isPreferredHost = currentHost === preferredHost;
    const isWwwVariant = currentHost === `www.${preferredHost}`;

    if (isPreferredHost || isWwwVariant) {
      const redirectUrl = request.nextUrl.clone();
      let shouldRedirect = false;

      if (isWwwVariant) {
        redirectUrl.hostname = preferredHost;
        shouldRedirect = true;
      }

      if (redirectUrl.protocol !== 'https:') {
        redirectUrl.protocol = 'https:';
        shouldRedirect = true;
      }

      if (shouldRedirect) {
        return NextResponse.redirect(redirectUrl, 308);
      }
    }
  }

  const { pathname } = request.nextUrl;
  const needsAuthCheck =
    matchesRoute(pathname, protectedRoutes) ||
    matchesRoute(pathname, adminRoutes) ||
    matchesRoute(pathname, authRoutes);

  if (!needsAuthCheck) {
    return withIndexingHeaders(request, intlMiddleware(request));
  }

  const { user, response: sessionResponse } = await getCurrentUser(request);
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAdminRoute = matchesRoute(pathname, adminRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);
  const isCallbackRoute = isAuthCallbackRoute(pathname);

  if ((isProtectedRoute || isAdminRoute) && !user) {
    const redirectUrl = new URL(getLocalizedPath(pathname, '/login'), request.url);
    redirectUrl.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(redirectUrl);
    copyCookies(sessionResponse, response);
    return response;
  }

  if (isAdminRoute && user) {
    const userRole = user.user_metadata?.role || 'user';

    if (userRole !== 'admin' && userRole !== 'moderator') {
      const response = NextResponse.redirect(new URL(getLocalizedPath(pathname, '/'), request.url));
      copyCookies(sessionResponse, response);
      return response;
    }

    if (getPathParts(pathname).pathWithoutLocale === '/admin') {
      const response = NextResponse.redirect(new URL(getLocalizedAdminDashboardPath(pathname), request.url));
      copyCookies(sessionResponse, response);
      return response;
    }
  }

  if (isAuthRoute && user) {
    const response = NextResponse.redirect(new URL(getLocalizedPath(pathname, '/'), request.url));
    copyCookies(sessionResponse, response);
    return response;
  }

  if (isCallbackRoute) {
    const response = NextResponse.next();
    copyCookies(sessionResponse, response);
    return withIndexingHeaders(request, response);
  }

  const response = intlMiddleware(request);
  copyCookies(sessionResponse, response);
  return withIndexingHeaders(request, response);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

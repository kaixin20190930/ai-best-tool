import type { UrlObject } from 'node:url';

const localePrefixPattern = /^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/;

export function splitLocalePath(pathname: string) {
  let path = pathname;
  let locale: string | undefined;
  let count = 0;
  let match = path.match(localePrefixPattern);
  while (match) {
    [, locale] = match;
    count += 1;
    path = path.slice(match[0].length) || '/';
    match = path.match(localePrefixPattern);
  }
  return { pathname: path, locale, count };
}

// next-intl owns the locale prefix. Do not alter query values, hashes or external URLs.
export function normalizeLocalizedHref(href: string | UrlObject, explicitLocale?: string) {
  const pathname = typeof href === 'string' ? href.split(/[?#]/, 1)[0] : href.pathname;
  const external = typeof href !== 'string' && Boolean(href.protocol || href.host || href.hostname);
  if (external || !pathname?.startsWith('/') || pathname.startsWith('//')) {
    return { href, locale: explicitLocale };
  }
  const parts = splitLocalePath(pathname);
  return {
    href:
      typeof href === 'string' ? parts.pathname + href.slice(pathname.length) : { ...href, pathname: parts.pathname },
    locale: explicitLocale || parts.locale,
  };
}

export function repairRepeatedLocalePath(pathname: string) {
  const parts = splitLocalePath(pathname);
  if (parts.count < 2) return pathname;
  return parts.locale === 'en' ? parts.pathname : `/${parts.locale}${parts.pathname === '/' ? '' : parts.pathname}`;
}

export function safeLocalizedReturnPath(value: unknown, locale?: string): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return undefined;
  // URL parsers can interpret backslashes and encoded separators differently.
  if (
    // eslint-disable-next-line no-control-regex -- Reject URL-parser control-character ambiguity.
    /[\\\u0000-\u0020\u007f]/.test(value) ||
    /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value.split(/[?#]/, 1)[0]) ||
    value.includes('://')
  ) {
    return undefined;
  }
  const pathname = value.split(/[?#]/, 1)[0];
  const parts = splitLocalePath(pathname);
  if (parts.pathname.startsWith('//')) return undefined;
  const targetLocale = parts.locale || locale || 'en';
  const prefix = targetLocale === 'en' ? '' : `/${targetLocale}`;
  return `${prefix}${parts.pathname === '/' && prefix ? '' : parts.pathname}${value.slice(pathname.length)}`;
}

export function buildLoginHref(returnPath: string, locale: string) {
  const safePath = safeLocalizedReturnPath(returnPath, locale) || '/';
  return `/login?${new URLSearchParams({ redirect: safePath })}`;
}

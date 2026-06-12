import { locales } from '@/i18n';

const localeSet = new Set(locales);

function mapLanguageTagToLocale(tag: string | null | undefined): string | null {
  if (!tag) {
    return null;
  }

  const normalized = tag.toLowerCase();

  if (normalized.startsWith('zh-tw') || normalized.startsWith('zh-hk') || normalized.startsWith('zh-hant')) {
    return 'tw';
  }

  if (normalized.startsWith('zh')) {
    return 'cn';
  }

  if (normalized.startsWith('ja')) {
    return 'jp';
  }

  if (normalized.startsWith('de')) {
    return 'de';
  }

  if (normalized.startsWith('es')) {
    return 'es';
  }

  if (normalized.startsWith('fr')) {
    return 'fr';
  }

  if (normalized.startsWith('pt')) {
    return 'pt';
  }

  if (normalized.startsWith('ru')) {
    return 'ru';
  }

  if (normalized.startsWith('en')) {
    return 'en';
  }

  return null;
}

function getCookieLocale(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('NEXT_LOCALE='));

  if (!cookie) {
    return null;
  }

  const value = decodeURIComponent(cookie.slice('NEXT_LOCALE='.length));
  return localeSet.has(value) ? value : null;
}

function getPreferredLocale(request: Request): string {
  const cookieLocale = getCookieLocale(request);
  if (cookieLocale) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) {
    return 'en';
  }

  for (const part of acceptLanguage.split(',')) {
    const locale = mapLanguageTagToLocale(part.split(';')[0]?.trim());
    if (locale && localeSet.has(locale)) {
      return locale;
    }
  }

  return 'en';
}

export function buildLocalizedTopLevelUrl(request: Request, targetPath: string) {
  const normalizedTargetPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  const locale = getPreferredLocale(request);
  const localizedPath = locale === 'en' ? normalizedTargetPath : `/${locale}${normalizedTargetPath}`;

  return new URL(localizedPath, request.url);
}

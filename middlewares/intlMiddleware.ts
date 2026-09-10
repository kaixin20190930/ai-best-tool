import createMiddleware from 'next-intl/middleware';

import { localePrefix } from '@/app/navigation';

import { locales } from '../i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix,
  // Page metadata knows content eligibility (including empty topics and tool
  // review gates). Routing alone does not. Keep one authoritative hreflang
  // declaration in metadata instead of advertising every routing locale here.
  alternateLinks: false,
});

export default intlMiddleware;

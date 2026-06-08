import type { Metadata } from 'next';

export const INDEXABLE_LOCALES = ['en', 'cn'] as const;

export function isIndexableLocale(locale: string): boolean {
  return INDEXABLE_LOCALES.includes(locale as (typeof INDEXABLE_LOCALES)[number]);
}

export function getNoindexMetadata(): Pick<Metadata, 'robots'> {
  return {
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}


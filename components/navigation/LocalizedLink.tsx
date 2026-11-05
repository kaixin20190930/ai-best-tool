'use client';

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import NextLink from 'next/link';
import { useLocale } from 'next-intl';

import { normalizeLocalizedHref } from '@/lib/navigation/localizedPaths';

type Props = Omit<ComponentPropsWithoutRef<typeof NextLink>, 'locale'> & { locale?: string };

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(({ href, locale, ...props }, ref) => {
  const currentLocale = useLocale();
  const normalized = normalizeLocalizedHref(href, locale, currentLocale);
  // Preserve all Next Link accessibility, event, prefetch and ref behavior.
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <NextLink {...props} ref={ref} href={normalized.href} />;
});

LocalizedLink.displayName = 'LocalizedLink';
export default LocalizedLink;

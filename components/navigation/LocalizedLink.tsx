'use client';

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { normalizeLocalizedHref } from '@/lib/navigation/localizedPaths';

const { Link: IntlLink } = createSharedPathnamesNavigation({ localePrefix: 'as-needed' });
type Props = ComponentPropsWithoutRef<typeof IntlLink>;

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(({ href, locale, ...props }, ref) => {
  const normalized = normalizeLocalizedHref(href, locale);
  // Preserve all Next Link accessibility, event, prefetch and ref behavior.
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IntlLink {...props} ref={ref} href={normalized.href} locale={normalized.locale} />;
});

LocalizedLink.displayName = 'LocalizedLink';
export default LocalizedLink;

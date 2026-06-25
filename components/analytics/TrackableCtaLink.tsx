'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { trackCtaClick } from '@/app/actions/analytics';

interface TrackableCtaLinkProps {
  href: string;
  ctaId: string;
  ctaLabel: string;
  pageType: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  toolId?: string;
  userId?: string;
}

export default function TrackableCtaLink({
  href,
  ctaId,
  ctaLabel,
  pageType,
  children,
  className,
  target,
  rel,
  toolId,
  userId,
}: TrackableCtaLinkProps) {
  const pathname = usePathname() || '';

  const handleClick = () => {
    const normalizedPathname = pathname || href;
    const localeMatch = normalizedPathname.match(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/);
    const sourceLocale = localeMatch?.[1] || null;
    const sourcePath = normalizedPathname.replace(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/, '') || '/';

    trackCtaClick(
      {
        cta_id: ctaId,
        cta_label: ctaLabel,
        page_type: pageType,
        href,
        source_path: sourcePath,
        source_locale: sourceLocale,
      },
      toolId,
      userId,
    ).catch((error) => {
      console.error('Failed to track CTA click:', error);
    });
  };

  const isInternal = href.startsWith('/');
  const isNewTab = target === '_blank';
  const resolvedRel = rel || (isNewTab ? 'noreferrer' : undefined);

  if (isInternal) {
    return (
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={handleClick} target={target} rel={resolvedRel}>
      {children}
    </a>
  );
}

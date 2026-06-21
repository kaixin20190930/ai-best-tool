'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

import { trackComparisonClick } from '@/app/actions/analytics';

interface TrackableCompareLinkProps {
  href: string;
  toolId: string;
  userId?: string;
  children: ReactNode;
  className?: string;
}

export default function TrackableCompareLink({ href, toolId, userId, children, className }: TrackableCompareLinkProps) {
  const handleClick = async () => {
    trackComparisonClick(toolId, href, userId).catch((err) => console.error('Failed to track comparison click:', err));
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

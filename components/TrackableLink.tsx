'use client';

import { trackToolClick } from '@/app/actions/analytics';
import { ReactNode } from 'react';

interface TrackableLinkProps {
  href: string;
  toolId: string;
  userId?: string;
  children: ReactNode;
  className?: string;
  decisionVisit?: boolean;
}

export default function TrackableLink({
  href,
  toolId,
  userId,
  children,
  className,
  decisionVisit = false,
}: TrackableLinkProps) {
  const handleClick = async () => {
    // Track the click (fire and forget)
    trackToolClick(toolId, userId).catch((err) =>
      console.error('Failed to track tool click:', err),
    );
  };

  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className={className}
      data-decision-official-visit={decisionVisit ? 'true' : undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

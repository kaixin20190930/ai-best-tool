'use client';

import { trackToolClick } from '@/app/actions/analytics';
import { ReactNode } from 'react';

interface TrackableLinkProps {
  href: string;
  toolId: string;
  userId?: string;
  children: ReactNode;
  className?: string;
}

export default function TrackableLink({ 
  href, 
  toolId, 
  userId, 
  children, 
  className 
}: TrackableLinkProps) {
  const handleClick = async () => {
    // Track the click (fire and forget)
    trackToolClick(toolId, userId).catch(err => 
      console.error('Failed to track tool click:', err)
    );
  };

  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

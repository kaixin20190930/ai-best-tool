'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type PageViewType =
  | 'home'
  | 'tool_detail'
  | 'guide'
  | 'category'
  | 'explore'
  | 'best_ai_tools'
  | 'best_ai_tools_topic'
  | 'pricing'
  | 'submit'
  | 'claim_listing'
  | 'profile'
  | 'profile_submissions'
  | 'other';

const localePattern = /^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/;

function getPathWithoutLocale(pathname: string) {
  return pathname.replace(localePattern, '') || '/';
}

function getPageType(pathname: string): PageViewType {
  const normalizedPath = getPathWithoutLocale(pathname);

  if (normalizedPath === '/') return 'home';
  if (normalizedPath.startsWith('/guides')) return 'guide';
  if (normalizedPath.startsWith('/ai/')) return 'tool_detail';
  if (normalizedPath.startsWith('/categories')) return 'category';
  if (normalizedPath.startsWith('/explore')) return 'explore';
  if (normalizedPath === '/best-ai-tools') return 'best_ai_tools';
  if (normalizedPath.startsWith('/best-ai-tools/')) return 'best_ai_tools_topic';
  if (normalizedPath.startsWith('/pricing')) return 'pricing';
  if (normalizedPath.startsWith('/submit')) return 'submit';
  if (normalizedPath.startsWith('/developer/listing')) return 'claim_listing';
  if (normalizedPath.startsWith('/profile') && !normalizedPath.startsWith('/profile/submissions')) return 'profile';
  if (normalizedPath.startsWith('/profile/submissions')) return 'profile_submissions';

  return 'other';
}

function shouldIgnorePath(pathname: string) {
  const normalizedPath = getPathWithoutLocale(pathname);

  return (
    normalizedPath.startsWith('/admin') ||
    normalizedPath.startsWith('/login') ||
    normalizedPath.startsWith('/register') ||
    normalizedPath.startsWith('/auth') ||
    normalizedPath.startsWith('/api') ||
    normalizedPath.startsWith('/_next') ||
    normalizedPath.startsWith('/favicon')
  );
}

async function sendPageView(payload: { pagePath: string; pageType: PageViewType; toolId?: string | null }) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    const sent = navigator.sendBeacon('/api/analytics/page-view', blob);

    if (sent) {
      return;
    }
  }

  await fetch('/api/analytics/page-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    credentials: 'same-origin',
    keepalive: true,
  });
}

export default function PageViewTracker({ toolId }: { toolId?: string | null }) {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || shouldIgnorePath(pathname)) {
      return;
    }

    const pageType = getPageType(pathname);

    // Tool detail pages are tracked by the detail page itself so we can attach toolId.
    if (pageType === 'tool_detail' && !toolId) {
      return;
    }

    const pagePath = getPathWithoutLocale(pathname);
    const trackingKey = `${pagePath}:${toolId || ''}`;

    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    lastTrackedRef.current = trackingKey;

    sendPageView({
      pagePath,
      pageType,
      toolId: toolId || null,
    }).catch((error) => {
      console.error('Failed to track page view:', error);
    });
  }, [pathname, toolId]);

  return null;
}

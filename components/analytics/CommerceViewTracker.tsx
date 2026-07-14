'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type CommerceViewType = 'pricing_view' | 'submit_view';

function getPathWithoutLocale(pathname: string) {
  return pathname.replace(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/, '') || '/';
}

async function sendCommerceView(payload: { eventType: CommerceViewType; pagePath: string; pageType: string }) {
  await fetch('/api/analytics/commerce-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
    keepalive: true,
  });
}

export default function CommerceViewTracker({
  eventType,
  pageType,
}: {
  eventType: CommerceViewType;
  pageType: string;
}) {
  const pathname = usePathname() || '';
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const pagePath = getPathWithoutLocale(pathname);
    const trackingKey = `${eventType}:${pagePath}`;

    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    lastTrackedRef.current = trackingKey;

    sendCommerceView({
      eventType,
      pagePath,
      pageType,
    }).catch((error) => {
      console.error('Failed to track commerce view:', error);
    });
  }, [eventType, pageType, pathname]);

  return null;
}

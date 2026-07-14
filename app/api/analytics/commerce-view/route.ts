/* eslint-disable import/prefer-default-export */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/neon/client';

type CommerceViewType = 'pricing_view' | 'submit_view';

function normalizePagePath(pagePath: unknown): string {
  if (typeof pagePath !== 'string') {
    return '/';
  }

  const trimmed = pagePath.trim();
  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function normalizeViewType(eventType: unknown): CommerceViewType | null {
  if (eventType === 'pricing_view' || eventType === 'submit_view') {
    return eventType;
  }

  return null;
}

function normalizePageType(pageType: unknown): string {
  if (typeof pageType !== 'string') {
    return 'other';
  }

  const trimmed = pageType.trim();
  return trimmed || 'other';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = normalizeViewType(body?.eventType);
    const pagePath = normalizePagePath(body?.pagePath);
    const pageType = normalizePageType(body?.pageType);

    if (!eventType) {
      return NextResponse.json({ ok: false, error: 'Invalid event type.' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    await query(
      `
        INSERT INTO analytics (event_type, metadata, timestamp, user_agent, referrer)
        VALUES ($1, $2, NOW(), $3, $4)
      `,
      [
        eventType,
        JSON.stringify({
          page_path: pagePath,
          page_type: pageType,
        }),
        userAgent,
        referrer,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to track commerce view:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/* eslint-disable import/prefer-default-export */

import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/db/neon/client';

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

function normalizePageType(pageType: unknown): PageViewType {
  if (
    pageType === 'home' ||
    pageType === 'tool_detail' ||
    pageType === 'guide' ||
    pageType === 'category' ||
    pageType === 'explore' ||
    pageType === 'best_ai_tools' ||
    pageType === 'best_ai_tools_topic' ||
    pageType === 'pricing' ||
    pageType === 'submit' ||
    pageType === 'claim_listing' ||
    pageType === 'profile' ||
    pageType === 'profile_submissions' ||
    pageType === 'other'
  ) {
    return pageType;
  }

  return 'other';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pagePath = normalizePagePath(body?.pagePath);
    const pageType = normalizePageType(body?.pageType);
    const toolId = typeof body?.toolId === 'string' && body.toolId.trim() ? body.toolId.trim() : null;
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    const existingSessionId = request.cookies.get('abt_session_id')?.value?.trim() || null;
    const sessionId = existingSessionId || crypto.randomUUID();
    const metadata = {
      page_path: pagePath,
      page_type: pageType,
    };

    await query(
      `
        INSERT INTO analytics (event_type, tool_id, metadata, timestamp, session_id, user_agent, referrer)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6)
      `,
      ['page_view', toolId, JSON.stringify(metadata), sessionId, userAgent, referrer],
    );

    if (toolId) {
      await query(
        `
          UPDATE tools
          SET view_count = view_count + 1, updated_at = NOW()
          WHERE id = $1
        `,
        [toolId],
      );
    }

    const response = NextResponse.json({ ok: true });

    if (!existingSessionId) {
      response.cookies.set('abt_session_id', sessionId, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    console.error('Failed to track page view:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

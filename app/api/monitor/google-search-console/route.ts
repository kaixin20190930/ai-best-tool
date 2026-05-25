import { NextRequest, NextResponse } from 'next/server';

import {
  inspectGoogleSearchConsoleUrlBySystem,
  submitGoogleSearchConsoleSitemapBySystem,
} from '@/app/actions/admin/googleSearchConsole';

function isAuthorized(request: NextRequest) {
  const token = process.env.MONITOR_API_TOKEN;
  if (!token) return true;
  return request.headers.get('authorization') === `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const sitemapUrl = (searchParams.get('sitemapUrl') || '').trim();
  const inspectionUrl = (searchParams.get('inspectionUrl') || '').trim();
  const propertyUrl = (searchParams.get('propertyUrl') || '').trim() || undefined;
  const siteOrigin = (searchParams.get('siteOrigin') || '').trim() || undefined;

  if (action === 'submit-sitemap') {
    const result = await submitGoogleSearchConsoleSitemapBySystem(
      sitemapUrl,
      { propertyUrl, siteOrigin }
    );
    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error || 'Sitemap submission failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, action, response: result.response });
  }

  if (action === 'inspect-url') {
    const result = await inspectGoogleSearchConsoleUrlBySystem(
      inspectionUrl,
      { propertyUrl, siteOrigin }
    );
    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error || 'URL inspection failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, action, response: result.response });
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Invalid action. Use action=submit-sitemap or action=inspect-url.',
    },
    { status: 400 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/db/neon/client';

import { BASE_URL } from '@/lib/env';
import { createStripeCheckoutSession, isStripeConfigured } from '@/lib/services/stripe';
import { createClient } from '@/lib/supabase/server';
import { trackCommerceEvent } from '@/app/actions/analytics';

export const runtime = 'nodejs';

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getSourceMetadataFromReferrer(referrer: string): { sourcePath: string | null; sourceLocale: string | null } {
  if (!referrer) {
    return { sourcePath: null, sourceLocale: null };
  }

  try {
    const url = new URL(referrer);
    const pathname = url.pathname || '/';
    const localeMatch = pathname.match(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/);
    const sourceLocale = localeMatch?.[1] || null;
    const sourcePath = pathname.replace(/^\/(en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/, '') || '/';

    return { sourcePath, sourceLocale };
  } catch {
    return { sourcePath: null, sourceLocale: null };
  }
}

function getCommercialValue(tool: Record<string, unknown>, key: string): unknown {
  const features = getRecord(tool.features);
  const submission = getRecord(features.submission);
  const commercial = getRecord(submission.commercial);

  return commercial[key];
}

function parseFeaturedDays(value: unknown): 0 | 3 | 7 | 14 {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (parsed === 3 || parsed === 7 || parsed === 14) return parsed;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ ok: false, error: 'STRIPE_SECRET_KEY is not configured.' }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(redirectUrl);
    }

    const toolId = request.nextUrl.searchParams.get('toolId')?.trim() || '';
    if (!toolId) {
      return NextResponse.json({ ok: false, error: 'toolId is required.' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          id::text AS id,
          name,
          title,
          url,
          submitted_by::text AS "submittedBy",
          features
        FROM tools
        WHERE id = $1
        LIMIT 1
      `,
      [toolId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Tool not found.' }, { status: 404 });
    }

    const tool = result.rows[0] as Record<string, unknown>;
    if (String(tool.submittedBy || '') !== user.id) {
      return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
    }

    const plan = String(getCommercialValue(tool, 'plan') || 'free');
    const paymentConfirmed = getCommercialValue(tool, 'paymentConfirmed') === true;
    if (plan !== 'standard_paid' || paymentConfirmed) {
      return NextResponse.json({ ok: false, error: 'This submission does not require payment.' }, { status: 400 });
    }

    const featuredDays = parseFeaturedDays(getCommercialValue(tool, 'featuredDaysRequested'));
    const fastTrack = getCommercialValue(tool, 'fastTrackRequested') === true;

    const siteUrl = BASE_URL.replace(/\/$/, '');
    const titleValue = tool.title;
    const titleRecord = getRecord(titleValue);
    const toolTitle =
      typeof titleValue === 'string'
        ? titleValue
        : String(titleRecord.en || titleRecord.zh || tool.name || 'AI Best Tool');

    const session = await createStripeCheckoutSession({
      toolId,
      toolTitle,
      toolName: String(tool.name || toolId),
      featuredDays,
      fastTrack,
      customerEmail: user.email || undefined,
      successUrl: `${siteUrl}/profile/submissions?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/profile/submissions?payment=cancelled`,
    });

    const { sourcePath, sourceLocale } = getSourceMetadataFromReferrer(request.headers.get('referer') || '');

    await trackCommerceEvent(
      'checkout_create',
      {
        toolTitle,
        featuredDays,
        fastTrack,
        sessionId: session.id,
        sourcePath,
        sourceLocale,
      },
      toolId,
      user.id,
    );

    return NextResponse.redirect(session.url, { status: 302 });
  } catch (error) {
    console.error('Stripe checkout route failed:', error);

    const message = error instanceof Error ? error.message : 'Stripe checkout failed unexpectedly.';
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

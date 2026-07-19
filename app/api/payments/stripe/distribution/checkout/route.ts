import { NextRequest, NextResponse } from 'next/server';

import { BASE_URL } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { createDistributionCheckoutSession, getDistributionPriceId, type DistributionPlan } from '@/lib/services/stripe';
import { recordDistributionAttributionEvent } from '@/lib/services/distributionAttribution';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const plan = request.nextUrl.searchParams.get('plan') as DistributionPlan;
    if (plan !== 'pro' && plan !== 'agency') return NextResponse.json({ ok: false, error: 'plan must be pro or agency.' }, { status: 400 });
    if (!getDistributionPriceId(plan)) return NextResponse.json({ ok: false, error: `Stripe price for ${plan} is not configured yet.` }, { status: 503 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    const siteUrl = BASE_URL.replace(/\/$/, '');
    const session = await createDistributionCheckoutSession({
      userId: user.id,
      email: user.email,
      plan,
      successUrl: `${siteUrl}/distribution?checkout=success&plan=${plan}`,
      cancelUrl: `${siteUrl}/pricing?checkout=cancelled`,
    });
    await recordDistributionAttributionEvent('checkout', user.id, { sessionId: session.id, plan });
    return NextResponse.redirect(session.url, { status: 302 });
  } catch (error) {
    console.error('Distribution checkout route failed:', error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Distribution checkout failed.' }, { status: 500 });
  }
}

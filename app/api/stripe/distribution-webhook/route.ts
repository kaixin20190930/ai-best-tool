import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeDistributionWebhookSecret, verifyStripeWebhookSignature } from '@/lib/services/stripe';

export const runtime = 'nodejs';

type DistributionEvent = {
  type: string;
  data?: { object?: Record<string, any> };
};

function getMetadata(value: Record<string, any>): Record<string, string> {
  return value.metadata && typeof value.metadata === 'object' ? value.metadata : {};
}

function toIsoDate(value: unknown): string | null {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

async function upsertEntitlement(input: {
  userId: string;
  plan: 'pro' | 'agency';
  status: 'active' | 'paused' | 'cancelled';
  customerId?: string | null;
  subscriptionId?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('distribution_entitlements').upsert({
    user_id: input.userId,
    plan: input.plan,
    status: input.status,
    source: 'stripe',
    stripe_customer_id: input.customerId || null,
    stripe_subscription_id: input.subscriptionId || null,
    current_period_end: input.currentPeriodEnd || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')?.trim() || '';
  if (!signature || !verifyStripeWebhookSignature(payload, signature, getStripeDistributionWebhookSecret())) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 });
  }

  let event: DistributionEvent;
  try {
    event = JSON.parse(payload) as DistributionEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const object = event.data?.object || {};
  const metadata = getMetadata(object);
  if (metadata.feature !== 'distribution') return NextResponse.json({ ok: true, skipped: true });

  try {
    if (event.type === 'checkout.session.completed') {
      const userId = metadata.user_id || String(object.client_reference_id || '');
      const plan = metadata.plan === 'agency' ? 'agency' : 'pro';
      const paymentStatus = String(object.payment_status || '');
      if (!userId || paymentStatus !== 'paid') return NextResponse.json({ ok: true, skipped: true });
      await upsertEntitlement({
        userId,
        plan,
        status: 'active',
        customerId: object.customer ? String(object.customer) : null,
        subscriptionId: object.subscription ? String(object.subscription) : null,
      });
      const supabase = createAdminClient();
      const { error: attributionError } = await supabase.from('distribution_attribution_events').insert({
        event_type: 'payment',
        session_id: String(object.id || object.subscription || userId),
        user_id: userId,
        metadata: { plan, stripeSessionId: object.id || null, subscriptionId: object.subscription || null },
      });
      if (attributionError) console.error('Distribution payment attribution failed:', attributionError);
      return NextResponse.json({ ok: true, activated: true });
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created' || event.type === 'customer.subscription.deleted') {
      const userId = metadata.user_id || '';
      if (!userId) return NextResponse.json({ ok: true, skipped: true });
      const plan = metadata.plan === 'agency' ? 'agency' : 'pro';
      const subscriptionStatus = String(object.status || '');
      const status = event.type === 'customer.subscription.deleted' || subscriptionStatus === 'canceled' ? 'cancelled' : ['active', 'trialing'].includes(subscriptionStatus) ? 'active' : 'paused';
      await upsertEntitlement({
        userId,
        plan,
        status,
        customerId: object.customer ? String(object.customer) : null,
        subscriptionId: object.id ? String(object.id) : null,
        currentPeriodEnd: toIsoDate(object.current_period_end),
      });
      return NextResponse.json({ ok: true, updated: true });
    }
  } catch (error) {
    console.error('Distribution Stripe webhook failed:', error);
    return NextResponse.json({ ok: false, error: 'Unable to update distribution entitlement.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, skipped: true });
}

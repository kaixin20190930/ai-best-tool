import crypto from 'node:crypto';

import { getListingTotalCents, listingConfig } from '@/lib/config/listing';

export type StripeCheckoutInput = {
  toolId: string;
  toolTitle: string;
  toolName: string;
  featuredDays: 0 | 3 | 7 | 14;
  fastTrack: boolean;
  customerEmail?: string | null;
  successUrl: string;
  cancelUrl: string;
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export type DistributionPlan = 'pro' | 'agency';
export type DistributionInterval = 'monthly' | 'yearly';

export type StripeListingPriceIds = {
  priorityReview: string | null;
  featured3Days: string | null;
  featured7Days: string | null;
  featured14Days: string | null;
  launchBundle: string | null;
};

export function getStripeListingPriceIds(): StripeListingPriceIds {
  return {
    priorityReview: process.env.STRIPE_LISTING_PRICE_ID_PRIORITY_REVIEW?.trim() || null,
    featured3Days: process.env.STRIPE_LISTING_PRICE_ID_FEATURED_3D?.trim() || null,
    featured7Days: process.env.STRIPE_LISTING_PRICE_ID_FEATURED_7D?.trim() || null,
    featured14Days: process.env.STRIPE_LISTING_PRICE_ID_FEATURED_14D?.trim() || null,
    launchBundle: process.env.STRIPE_LISTING_PRICE_ID_LAUNCH_BUNDLE?.trim() || null,
  };
}

function getDistributionPriceEnvKey(plan: DistributionPlan, interval: DistributionInterval): string {
  return `STRIPE_DISTRIBUTION_PRICE_ID_${plan.toUpperCase()}_${interval.toUpperCase()}`;
}

export function getDistributionPriceId(plan: DistributionPlan, interval: DistributionInterval = 'monthly'): string | null {
  const value = process.env[getDistributionPriceEnvKey(plan, interval)];
  return value?.trim() || null;
}

export function isDistributionStripeConfigured(): boolean {
  return isStripeConfigured() && Boolean(getDistributionPriceId('pro', 'monthly'));
}

export async function createDistributionCheckoutSession(input: {
  userId: string;
  email?: string | null;
  plan: DistributionPlan;
  interval: DistributionInterval;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const secretKey = getStripeSecretKey();
  const priceId = getDistributionPriceId(input.plan, input.interval);
  if (!priceId) throw new Error(`${getDistributionPriceEnvKey(input.plan, input.interval)} is not configured.`);

  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('client_reference_id', input.userId);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price]', priceId);
  body.set('metadata[feature]', 'distribution');
  body.set('metadata[user_id]', input.userId);
  body.set('metadata[plan]', input.plan);
  body.set('metadata[interval]', input.interval);
  body.set('subscription_data[metadata][feature]', 'distribution');
  body.set('subscription_data[metadata][user_id]', input.userId);
  body.set('subscription_data[metadata][plan]', input.plan);
  body.set('subscription_data[metadata][interval]', input.interval);
  if (input.email) body.set('customer_email', input.email);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Distribution checkout session creation failed: ${await response.text()}`);
  const data = (await response.json()) as { id?: string; url?: string };
  if (!data.id || !data.url) throw new Error('Distribution checkout response was missing url or id.');
  return { id: data.id, url: data.url };
}

export function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  return secretKey;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return webhookSecret;
}

export function getStripeListingAmountCents(featuredDays: 0 | 3 | 7 | 14, fastTrack: boolean): number {
  return getListingTotalCents(featuredDays, fastTrack);
}

export function buildStripeListingDescription(input: Pick<StripeCheckoutInput, 'featuredDays' | 'fastTrack'>): string {
  if (input.fastTrack && input.featuredDays === 14) {
    return listingConfig.pricingTiers.launchBundle.summary;
  }

  const prioritySummary = listingConfig.pricingTiers.priorityReview.summary;

  if (input.featuredDays === 0) {
    return `${prioritySummary} Total: $9.`;
  }

  const featuredWindow = listingConfig.pricingTiers.featuredWindows.find((item) => item.days === input.featuredDays);

  const featuredSummary = featuredWindow?.summary || `${input.featuredDays}-day featured placement`;
  const total = getListingTotalCents(input.featuredDays, input.fastTrack);
  return `${prioritySummary} ${featuredSummary} Total: $${(total / 100).toFixed(2)}.`.trim();
}

function getFixedListingPriceIds(input: Pick<StripeCheckoutInput, 'featuredDays' | 'fastTrack'>): string[] | null {
  const prices = getStripeListingPriceIds();

  if (input.fastTrack && input.featuredDays === 14) {
    return prices.launchBundle ? [prices.launchBundle] : null;
  }

  if (!prices.priorityReview) return null;
  if (input.featuredDays === 0) return [prices.priorityReview];

  const featuredPrice =
    input.featuredDays === 3
      ? prices.featured3Days
      : input.featuredDays === 7
        ? prices.featured7Days
        : prices.featured14Days;

  return featuredPrice ? [prices.priorityReview, featuredPrice] : null;
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<{ id: string; url: string }> {
  const secretKey = getStripeSecretKey();
  const amountCents = getStripeListingAmountCents(input.featuredDays, input.fastTrack);
  const amountLabel = `$${(amountCents / 100).toFixed(2)}`;
  const productName = input.fastTrack && input.featuredDays === 14
    ? `${input.toolTitle} - launch bundle`
    : input.featuredDays > 0
      ? `${input.toolTitle} - priority review + ${input.featuredDays}-day featured placement`
      : `${input.toolTitle} - priority review`;

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('client_reference_id', input.toolId);
  const fixedPriceIds = getFixedListingPriceIds(input);
  if (fixedPriceIds) {
    fixedPriceIds.forEach((priceId, index) => {
      body.set(`line_items[${index}][quantity]`, '1');
      body.set(`line_items[${index}][price]`, priceId);
    });
  } else {
    body.set('line_items[0][quantity]', '1');
    body.set('line_items[0][price_data][currency]', 'usd');
    body.set('line_items[0][price_data][unit_amount]', String(amountCents));
    body.set('line_items[0][price_data][product_data][name]', productName);
    body.set('line_items[0][price_data][product_data][description]', buildStripeListingDescription(input));
  }
  body.set('metadata[tool_id]', input.toolId);
  body.set('metadata[tool_name]', input.toolTitle);
  body.set('metadata[tool_slug]', input.toolName);
  body.set('metadata[featured_days]', String(input.featuredDays));
  body.set('metadata[fast_track]', String(input.fastTrack));
  body.set('metadata[amount_cents]', String(amountCents));
  body.set('metadata[amount_label]', amountLabel);
  body.set(
    'metadata[product_key]',
    input.fastTrack && input.featuredDays === 14
      ? 'launch_bundle'
      : input.featuredDays > 0
        ? `featured_${input.featuredDays}_days`
        : 'priority_review',
  );

  if (input.customerEmail) {
    body.set('customer_email', input.customerEmail);
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe checkout session creation failed: ${errorText}`);
  }

  const data = (await response.json()) as { id?: string; url?: string };

  if (!data.id || !data.url) {
    throw new Error('Stripe checkout session response was missing url or id.');
  }

  return { id: data.id, url: data.url };
}

function timingSafeHexEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signatureParts = parts.filter((part) => part.startsWith('v1='));

  if (!timestampPart || signatureParts.length === 0) {
    return false;
  }

  const timestamp = Number.parseInt(timestampPart.slice(2), 10);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  return signatureParts.some((part) => timingSafeHexEqual(part.slice(3), expectedSignature));
}

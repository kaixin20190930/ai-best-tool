import crypto from 'node:crypto';

import { listingConfig } from '@/lib/config/listing';

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
  const priorityReview = 2900;
  const featuredAmountByDays: Record<0 | 3 | 7 | 14, number> = {
    0: 0,
    3: 2900,
    7: 4900,
    14: 7900,
  };

  if (fastTrack && featuredDays === 14) {
    return 9900;
  }

  return priorityReview + featuredAmountByDays[featuredDays];
}

export function buildStripeListingDescription(input: Pick<StripeCheckoutInput, 'featuredDays' | 'fastTrack'>): string {
  if (input.fastTrack && input.featuredDays === 14) {
    return listingConfig.pricingTiers.launchBundle.summary;
  }

  const prioritySummary = listingConfig.pricingTiers.priorityReview.summary;

  if (input.featuredDays === 0) {
    return prioritySummary;
  }

  const featuredWindow = listingConfig.pricingTiers.featuredWindows.find((item) => item.days === input.featuredDays);

  const featuredSummary = featuredWindow?.summary || `${input.featuredDays}-day featured placement`;
  return `${prioritySummary} ${featuredSummary}`.trim();
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<{ id: string; url: string }> {
  const secretKey = getStripeSecretKey();
  const amountCents = getStripeListingAmountCents(input.featuredDays, input.fastTrack);
  const amountLabel = `$${(amountCents / 100).toFixed(2)}`;
  const productName =
    input.featuredDays > 0
      ? `${input.toolTitle} - ${input.featuredDays}-day featured placement`
      : `${input.toolTitle} - priority review`;

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', input.successUrl);
  body.set('cancel_url', input.cancelUrl);
  body.set('client_reference_id', input.toolId);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'usd');
  body.set('line_items[0][price_data][unit_amount]', String(amountCents));
  body.set('line_items[0][price_data][product_data][name]', productName);
  body.set('line_items[0][price_data][product_data][description]', buildStripeListingDescription(input));
  body.set('metadata[tool_id]', input.toolId);
  body.set('metadata[tool_name]', input.toolTitle);
  body.set('metadata[tool_slug]', input.toolName);
  body.set('metadata[featured_days]', String(input.featuredDays));
  body.set('metadata[fast_track]', String(input.fastTrack));
  body.set('metadata[amount_cents]', String(amountCents));
  body.set('metadata[amount_label]', amountLabel);

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

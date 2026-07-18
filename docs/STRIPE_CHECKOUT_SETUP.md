# Stripe Checkout Setup

This project uses Stripe Checkout Sessions for paid listings and featured placement. The current integration is designed for one-time payments, not subscriptions.

For the recommended commercial model and future subscription roadmap, see:

- `docs/PAID_LISTING_MODEL.md`
- `docs/PAID_LISTING_MODEL_CN.md`

## What you need

In the Stripe Dashboard:

1. Create or open your Stripe account.
2. Go to **Developers -> API keys** and copy the **secret key**.
3. Go to **Developers -> Webhooks** and add an endpoint for your production domain:
   - `https://your-domain.com/api/stripe/webhook`
4. Subscribe that endpoint to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed` if you want to monitor delayed failures
5. Copy the webhook signing secret (`whsec_...`).

Production variables in Vercel:

6. Add these environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
7. Redeploy the app after saving the env vars.

Recommended production values:

- `NEXT_PUBLIC_SITE_URL=https://aibesttool.com`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`

Notes:

- `STRIPE_PUBLISHABLE_KEY` is not required for the current server-side Checkout flow.
- Keep test keys and live keys in separate Stripe modes. When you move to production, switch the dashboard and the webhook endpoint to live mode.
- Make sure the webhook endpoint URL is exactly `https://aibesttool.com/api/stripe/webhook` or your canonical production domain equivalent.
- The app normalizes the configured site URL before generating Stripe return links, so keep the env var pointed at the canonical production domain.

## How the flow works

1. A user submits a tool with the paid listing option.
2. The submission appears in `/profile/submissions`.
3. Clicking **Complete payment** opens a Stripe Checkout Session.
4. Stripe sends the webhook event after payment completes.
5. The webhook confirms payment, writes a callback log, and either:
   - activates the featured window immediately if the tool is already published, or
   - reserves the featured entitlement until the tool is approved and published.

## What this does not do yet

This setup does **not** currently support:

- recurring billing
- monthly or annual plans
- subscription cancellation lifecycle
- grace period handling for failed renewals

If subscriptions are added later, they should be implemented as a separate billing mode with their own Stripe products, webhook handling, and lifecycle logic.

## Local testing

For local testing, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then submit a test tool and complete payment with Stripe test card details.

## What to verify after payment

- `/admin/payment-callbacks` shows a success log.
- `/admin/tools` shows the tool as paid / featured.
- `/profile/submissions` shows the featured window as active.
- The public tool page is visible again if you test on an existing submission.

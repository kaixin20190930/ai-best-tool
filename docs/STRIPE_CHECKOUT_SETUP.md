# Stripe Checkout Setup

This project uses Stripe Checkout Sessions for paid listings and featured placement. The integration is designed for one-time payments, not subscriptions.

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

In Vercel:

6. Add these environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
7. Redeploy the app after saving the env vars.

## How the flow works

1. A user submits a tool with the paid listing option.
2. The submission appears in `/profile/submissions`.
3. Clicking **Complete payment** opens a Stripe Checkout Session.
4. Stripe sends the webhook event after payment completes.
5. The webhook activates the sponsored placement and writes a callback log.

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


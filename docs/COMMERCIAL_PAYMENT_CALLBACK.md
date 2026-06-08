# Commercial Payment Callback Integration

This document describes how to confirm a paid listing after payment succeeds.

## Endpoint

- Method: `GET`
- Path: `/api/monitor/commercial-payment-confirmed`
- Auth: `Authorization: Bearer ${MONITOR_API_TOKEN}` (required when `MONITOR_API_TOKEN` is configured)

## Query Parameters

- `toolId` (required): Tool UUID in your `tools` table.
- `transactionId` (optional): Payment transaction id from your payment provider.

## Behavior

On success, the endpoint confirms payment for the tool:

- `paymentConfirmed = true`
- if the tool is already published and a featured window was purchased:
  - `isSponsoredPlacement = true`
  - `status = active`
  - `featuredActiveFrom = now`
  - `featuredUntil = now + featuredDaysRequested`
- if the tool is not yet published:
  - payment is recorded
  - the featured entitlement is reserved
  - featured timing starts only after publish

Important note:

- This now matches the recommended product rule:
- featured timing starts when the tool is actually published, not merely when payment succeeds.
- See `docs/PAID_LISTING_MODEL.md` for the broader operating model.

## Example

```bash
curl -X GET \
  "https://your-domain.com/api/monitor/commercial-payment-confirmed?toolId=TOOL_UUID&transactionId=ORDER_20260523_001" \
  -H "Authorization: Bearer YOUR_MONITOR_API_TOKEN"
```

Success response:

```json
{ "ok": true, "name": "tool-name" }
```

Failure response:

```json
{ "ok": false, "error": "Tool not found" }
```

## Logging and Audit

Every callback hit is logged into `payment_callback_logs` (auto-created if missing), including:

- `tool_id`
- `transaction_id`
- `status` (`success` / `failed`)
- `source`
- `error_message`
- `payload`
- `created_at`

Admin view: `/admin/payment-callbacks`

## Idempotency

The endpoint is idempotent by `transactionId`:

- If a successful callback with the same `transactionId` already exists, API returns:
  - `{ "ok": true, "duplicate": true, "message": "Transaction already processed" }`
- It will not re-activate the placement or reset featured timing for duplicates.

Still recommended: keep retries from your payment bridge with the same `transactionId`.

## Integration Checklist

1. Set `MONITOR_API_TOKEN` in production.
2. Confirm `tools.features.submission.commercial.featuredDaysRequested` is present from submit flow.
3. Wire your payment success webhook to call this endpoint.
4. Verify in `/admin/payment-callbacks` and `/admin/tools/:id/edit`.

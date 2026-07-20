# Paid Listing Model

This document defines how paid submissions, featured placement, and future subscriptions should work in AI Best Tool.

It separates:

- what is already implemented today
- what rules operations should follow now
- what should be added later if recurring demand is real

## 1. Current State

Today, the project supports **one-time commercial payments**, not subscriptions.

Implemented now:

- Free submission
- Priority review
- Time-boxed featured placement
- Launch bundle
- Stripe Checkout for one-time payment
- Stripe webhook confirmation
- Payment callback logs
- Admin notifications

Not implemented yet:

- Recurring subscription billing
- Monthly or annual auto-renew plans
- Subscription grace period logic
- Subscription downgrade / cancellation lifecycle
- Monthly featured credits or recurring promotional quotas

## 2. Recommended Commercial Strategy

The recommended strategy is:

### Phase 1: One-time pricing first

Use one-time payment as the default commercial model while the directory is still growing.

Why:

- Easier for developers to understand
- Lower buying friction
- Less likely to feel pushy
- Better fit for launch-driven visibility needs
- Operationally simpler than recurring billing

### Phase 2: Add subscriptions only for ongoing value

Do **not** add subscriptions just to replace one-time review or featured windows.

Add subscriptions only when the product can provide recurring operational value such as:

- verified developer profile
- faster metadata updates
- recurring listing refreshes
- monthly featured credits
- analytics or outbound click reporting
- multiple active tool listings
- faster support SLA

## 3. Recommended One-time Offers

These are the current recommended offers.

### Free submission

- Price: `$0`
- Review target: `3-7 business days`
- Use case: broad coverage and first-time submissions

### Priority review

- Price: `$9 one-time`
- Review target: `1-3 business days`
- Use case: launches, updates, time-sensitive reviews

### Featured placement windows

- `3-day featured`: `+$9`
- `7-day featured`: `+$19`
- `14-day featured`: `+$29`

Use case:

- temporary launch visibility
- short campaign support
- product announcement windows

### Launch bundle

- Price: `$39`
- Includes:
  - priority review
  - 14-day featured placement

Use case:

- the simplest option for a launch period

## 4. Recommended Future Subscription Offers

Subscriptions should be introduced only after one-time demand is validated.

Suggested trigger:

- at least `10-20` paying developers per month
- repeat requests for recurring visibility
- clear demand for listing maintenance, analytics, or multi-tool support

Suggested subscription structure:

### Verified Developer

- Price: `$19/month`
- Includes:
  - verified badge
  - faster metadata updates
  - priority support for listing corrections
  - one active developer profile

### Growth Listing

- Price: `$49/month`
- Includes:
  - everything in Verified Developer
  - one monthly featured credit
  - up to `3` managed listings
  - faster update SLA
  - basic performance reporting

### Portfolio / Agency

- Price: `$199/month`
- Includes:
  - everything in Growth Listing
  - multiple managed listings
  - monthly featured credits
  - expedited updates
  - editorial support

These are product suggestions, not implemented billing plans.

## 5. Paid Submission Rules

Paid submission should **not** mean instant publication.

Paid submission means:

- the user pays for review speed and/or visibility rights
- the tool still must meet directory quality requirements before public promotion

### Minimum publish gate

Before a paid tool is published, it should have at least:

- name
- working website
- assigned category
- usable logo
- at least one screenshot or thumbnail
- understandable short description
- usable detail copy
- pricing label
- basic tags

If these are missing:

- the tool can stay in `pending review`
- the user keeps the paid entitlement
- the listing should not be publicly promoted yet

## 6. Review and Metadata Improvement Cadence

### On submission review

During the first review pass:

- verify the website
- fix obvious metadata gaps
- normalize category and pricing
- clean up description and detail copy
- add or request media when missing

### After publish

Suggested review cadence:

- active / paid / high-traffic tools: every `30 days`
- normal published tools: every `60 days`
- long-tail tools: every `60-90 days`

### What should be optimized

Descriptions should be improved when:

- they are too generic
- they read like raw marketing copy
- they do not explain the real use case
- they are missing pricing or workflow clarity

## 7. Featured Placement Rules

### Current implemented behavior

Featured timing now starts when the tool is **published**, not when payment succeeds.

That means:

- payment success reserves the entitlement
- review happens next if the tool is still pending
- featured window starts only after publish

### Operational rule

Recommended policy:

- payment success reserves the entitlement
- review happens next
- featured window starts only after publish

### When a tool exits featured

A tool should leave featured status when:

- the paid featured window expires
- the tool is unpublished or rejected before activation
- the tool becomes policy-incompatible
- the official site is broken or unsafe
- the listing quality is too poor for promoted visibility

## 8. Archive, Remove, and Delist Rules

### Archive

Archive when:

- the tool is low quality but recoverable
- metadata is outdated and the tool is not worth promoting now
- the tool no longer fits the public ranking surface
- it may still be useful internally or historically

### Remove

Remove when:

- the site is dead permanently
- the tool is a confirmed duplicate
- the listing is misleading, unsafe, or fraudulent
- the tool adds no public or internal value

### Paid listing after archive or remove

If a paid listing becomes archived or removed:

- do not keep it featured
- record the reason clearly
- if needed, handle refunds or manual credits case by case

## 9. Refund and Credit Guidance

The project does not currently implement automated refunds.

Recommended policy:

- refund or manual credit if the team rejects a paid listing for reasons the submitter could not reasonably predict
- do not automatically refund after a featured window has substantially run
- use manual review for fraud, duplicate, or obvious policy violations

## 10. If Subscriptions Are Added Later

If recurring billing is added, subscription lifecycle should be explicit.

Suggested states:

- `active`
- `past_due`
- `grace_period`
- `canceled`
- `expired`

Suggested rules:

- billing failure triggers `past_due`
- keep benefits for a short `7-day grace period`
- remove subscription-only perks when grace expires
- keep the public tool listing if it still meets quality standards
- remove only subscription perks, not the entire listing by default

### Subscription-only benefits should be removable independently

Examples:

- verified badge
- monthly featured credits
- accelerated update SLA
- portfolio slots
- private analytics

That way, one-time visibility and long-term listing health remain separate.

## 11. Recommended Product Roadmap

### Now

- keep one-time pricing live
- keep Stripe Checkout on one-time mode
- improve paid submission fairness
- tighten the publish gate for incomplete paid tools

### Next

- start featured timing on publish instead of payment
- make missing metadata blockers more visible in admin
- define manual refund / credit policy

### Later

- launch subscription only after recurring demand is validated
- build subscription lifecycle management before selling recurring plans

## 12. Bottom Line

The best operating model right now is:

- free submission stays open
- one-time priority review stays simple
- featured placement stays time-boxed
- subscriptions are optional future expansion, not the default starting point

This keeps monetization clear without turning the directory into a heavy recurring sales product.

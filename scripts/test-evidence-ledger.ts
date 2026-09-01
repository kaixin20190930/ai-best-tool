import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildEvidenceLedger, buildEvidenceLedgerEntry } from '@/lib/services/intelligence/evidenceLedger';
import type { ProductIntelligenceClaim, ProductIntelligenceSource } from '@/lib/services/intelligence/types';

const now = new Date('2026-09-01T12:00:00.000Z');
const source: ProductIntelligenceSource = {
  id: 'source-pricing',
  profileId: 'profile-example',
  url: 'https://example.com/pricing',
  pageType: 'pricing',
  httpStatus: 200,
  canonicalUrl: 'https://example.com/pricing',
  contentHash: 'pricing-hash',
  contentType: 'text/html',
  fetchedAt: '2026-09-01T08:00:00.000Z',
  fetchStatus: 'success',
  sourceType: 'official',
  sourceLabel: 'Pricing',
  publisherName: 'Example',
  lastVerifiedAt: '2026-09-01T09:00:00.000Z',
  metadata: {},
};

const baseClaim: ProductIntelligenceClaim = {
  id: 'claim-pro-price',
  profileId: 'profile-example',
  claimType: 'pricing_plan',
  claimKey: 'pricing_plan:pro',
  claimValue: { name: 'Pro', price: 19, interval: 'month' },
  sourceId: source.id,
  sourceUrl: source.url,
  sourceExcerpt: 'Pro costs $19 per month.',
  sourceType: 'official',
  observedAt: '2026-09-01T08:00:00.000Z',
  confidence: 95,
  conflictStatus: 'none',
  verificationStatus: 'candidate',
  verifiedAt: null,
  verificationNote: null,
  reviewDueAt: '2026-10-01T09:00:00.000Z',
  expiresAt: null,
  invalidatedAt: null,
  invalidationReason: null,
  validityScope: { plan: 'Pro', billingInterval: 'month', region: 'global' },
};

const candidate = buildEvidenceLedgerEntry(baseClaim, source, now);
assert.equal(candidate.verificationStatus, 'candidate');
assert.equal(candidate.freshness, 'fresh');
assert.equal(candidate.canSupportDecision, false, 'machine candidates must not become public evidence automatically');
assert.equal(candidate.sourceLabel, 'Pricing');
assert.deepEqual(candidate.validityScope, baseClaim.validityScope);

const verified = buildEvidenceLedgerEntry(
  {
    ...baseClaim,
    verificationStatus: 'verified',
    verifiedAt: '2026-09-01T09:00:00.000Z',
    verificationNote: 'Checked against the official pricing page.',
  },
  source,
  now,
);
assert.equal(verified.canSupportDecision, true);

const reviewDue = buildEvidenceLedgerEntry(
  { ...baseClaim, verificationStatus: 'verified', reviewDueAt: '2026-08-31T09:00:00.000Z' },
  source,
  now,
);
assert.equal(reviewDue.freshness, 'review_due');
assert.equal(reviewDue.canSupportDecision, true, 'review due should trigger a queue, not silently erase evidence');

const expired = buildEvidenceLedgerEntry(
  { ...baseClaim, verificationStatus: 'verified', expiresAt: '2026-08-31T09:00:00.000Z' },
  source,
  now,
);
assert.equal(expired.freshness, 'expired');
assert.equal(expired.canSupportDecision, false);

const invalidated = buildEvidenceLedgerEntry(
  {
    ...baseClaim,
    verificationStatus: 'verified',
    invalidatedAt: '2026-09-01T10:00:00.000Z',
    invalidationReason: 'The plan was retired.',
  },
  source,
  now,
);
assert.equal(invalidated.freshness, 'invalidated');
assert.equal(invalidated.canSupportDecision, false);

const conflicted = buildEvidenceLedgerEntry(
  { ...baseClaim, verificationStatus: 'verified', conflictStatus: 'confirmed' },
  source,
  now,
);
assert.equal(conflicted.canSupportDecision, false);

const ledger = buildEvidenceLedger([{ ...baseClaim, sourceId: undefined }], [source], now);
assert.equal(ledger[0]?.sourceId, source.id, 'legacy claims should resolve a source by URL');

const migration = readFileSync(
  resolve(process.cwd(), 'db/supabase/migrations/20260901_evidence_ledger_model.sql'),
  'utf8',
);
[
  'source_id UUID REFERENCES product_intelligence_sources',
  'source_type VARCHAR(30)',
  'verification_status VARCHAR(20)',
  'verified_at TIMESTAMPTZ',
  'review_due_at TIMESTAMPTZ',
  'expires_at',
  'invalidated_at TIMESTAMPTZ',
  'invalidation_reason TEXT',
  'validity_scope JSONB',
  "DEFAULT 'candidate'",
].forEach((requiredFragment) => {
  assert.equal(migration.includes(requiredFragment), true, `migration is missing ${requiredFragment}`);
});

console.log('Evidence Ledger model checks passed.');

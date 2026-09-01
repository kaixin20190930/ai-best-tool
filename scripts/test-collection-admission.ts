import assert from 'node:assert/strict';

import { evaluateCollectionAdmission } from '@/lib/services/admin/collectionAdmission';

const incomplete = evaluateCollectionAdmission({
  quality_score: 90,
  raw_payload: {},
  relevance_score: 80,
  status: 'new',
  summary: 'Short',
});

assert.equal(incomplete.draftReady, false);
assert.equal(incomplete.publishReady, false);
assert.ok(incomplete.coreGaps.includes('Missing source URL'));
assert.ok(incomplete.decisionGaps.includes('Missing review date'));

const completeCandidate = {
  quality_score: 90,
  raw_payload: {
    categorySlug: 'research',
    detailMetadata: {
      canonicalUrl: 'https://example.com',
      description: 'A'.repeat(180),
      imageUrl: 'https://example.com/logo.png',
    },
    decision: {
      compareAxes: ['Sources'],
      limitations: ['Limited free usage'],
      notIdealFor: ['One-off use'],
      reviewedAt: '2026-08-31T00:00:00.000Z',
    },
    marketValidation: {
      evidenceUrls: ['https://independent.example.com/review'],
      reviewedAt: '2026-08-31T00:00:00.000Z',
      score: 82,
      strongSignals: ['verified-customer-adoption'],
      supportingSignals: ['active-release-history'],
      verdict: 'validated',
    },
    tags: ['research'],
    useCases: ['Evidence research'],
  },
  relevance_score: 80,
  status: 'new',
  summary: 'A'.repeat(90),
} as const;
const complete = evaluateCollectionAdmission(completeCandidate);

assert.equal(complete.draftReady, true);
assert.equal(complete.publishReady, true);
assert.deepEqual(complete.coreGaps, []);
assert.deepEqual(complete.decisionGaps, []);
assert.deepEqual(complete.marketGaps, []);

const emerging = evaluateCollectionAdmission({
  ...completeCandidate,
  raw_payload: {
    ...completeCandidate.raw_payload,
    marketValidation: {
      evidenceUrls: ['https://launch.example.com/product'],
      reviewedAt: '2026-09-01T00:00:00.000Z',
      supportingSignals: ['transparent-official-documentation'],
      verdict: 'emerging',
    },
  },
});

assert.equal(emerging.draftReady, true);
assert.equal(emerging.marketValidated, false);
assert.equal(emerging.publishReady, false);
assert.ok(emerging.marketGaps.includes('Market verdict is not validated'));

const lowMarketScore = evaluateCollectionAdmission({
  ...completeCandidate,
  raw_payload: {
    ...completeCandidate.raw_payload,
    marketValidation: {
      ...completeCandidate.raw_payload.marketValidation,
      score: 74,
    },
  },
});

assert.equal(lowMarketScore.marketValidated, false);
assert.equal(lowMarketScore.publishReady, false);
assert.ok(lowMarketScore.marketGaps.includes('Market score must be at least 75'));

console.log('Collection admission test passed.');

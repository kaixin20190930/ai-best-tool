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

const complete = evaluateCollectionAdmission({
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
    tags: ['research'],
    useCases: ['Evidence research'],
  },
  relevance_score: 80,
  status: 'new',
  summary: 'A'.repeat(90),
});

assert.equal(complete.draftReady, true);
assert.equal(complete.publishReady, true);
assert.deepEqual(complete.coreGaps, []);
assert.deepEqual(complete.decisionGaps, []);

console.log('Collection admission test passed.');

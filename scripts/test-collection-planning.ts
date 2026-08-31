import assert from 'node:assert/strict';

import {
  CandidatePoolEntry,
  getCandidateIntakePlan,
  validateThreeDayCandidatePool,
} from '@/lib/services/admin/collectionPlanning';

function entry(title: string, day: string): CandidatePoolEntry {
  return {
    candidateUrl: `https://discovery.example/${title.toLowerCase()}`,
    categorySlug: 'productivity',
    decision: 'needs_evidence',
    decisionReason: 'Official product exists, but publication evidence is incomplete.',
    evidenceUrls: [`https://${title.toLowerCase()}.example`, `https://${title.toLowerCase()}.example/docs`],
    gaps: ['Missing media', 'Missing limitations'],
    officialUrl: `https://${title.toLowerCase()}.example`,
    plannedFor: `${day}T09:00:00.000Z`,
    reviewedAt: '2026-08-31T00:00:00.000Z',
    summary: 'A sufficiently descriptive candidate summary for an editorial review queue.',
    tags: ['productivity'],
    title,
    useCases: ['Editorial workflow'],
  };
}

const validPool = [
  entry('Alpha', '2026-09-01'),
  entry('Beta', '2026-09-01'),
  entry('Gamma', '2026-09-02'),
  entry('Delta', '2026-09-02'),
  entry('Epsilon', '2026-09-03'),
  entry('Zeta', '2026-09-03'),
];

assert.deepEqual(validateThreeDayCandidatePool(validPool), []);

const invalidPool = validPool.slice(0, 2);
assert.ok(
  validateThreeDayCandidatePool(invalidPool).some((message) =>
    message.includes('between 3 and 6')
  )
);

const parsed = getCandidateIntakePlan({ intakePlan: validPool[0] });
assert.equal(parsed?.decision, 'needs_evidence');
assert.equal(parsed?.plannedFor, '2026-09-01T09:00:00.000Z');
assert.equal(parsed?.evidenceUrls.length, 2);
assert.equal(getCandidateIntakePlan({ intakePlan: { decision: 'unknown' } }), null);

const incompleteReadyPool = validPool.map((item, index) =>
  index === 0 ? { ...item, decision: 'ready_for_draft' as const, gaps: [] } : item
);
assert.ok(
  validateThreeDayCandidatePool(incompleteReadyPool).some((message) =>
    message.includes('requires a valid image URL')
  )
);

console.log('Collection planning test passed.');

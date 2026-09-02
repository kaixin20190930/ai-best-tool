import assert from 'node:assert/strict';

import { buildDecisionCardV2 } from '@/lib/services/decision/card';
import type {
  DecisionEvidenceReference,
  DerivedToolDecisionProfile,
  DerivedToolRelationship,
} from '@/lib/services/decision/evidence';

function evidence(
  claimId: string,
  purpose: DecisionEvidenceReference['purpose'],
  claimValue: unknown,
): DecisionEvidenceReference {
  return {
    claimId,
    claimType: purpose === 'cost' ? 'pricing_plan' : purpose,
    claimKey: `${purpose}:${claimId}`,
    claimValue,
    sourceUrl: `https://example.com/evidence/${claimId}`,
    sourceExcerpt: null,
    observedAt: '2026-09-01T00:00:00.000Z',
    verifiedAt: '2026-09-01T00:00:00.000Z',
    reviewDueAt: '2026-12-01T00:00:00.000Z',
    expiresAt: null,
    validityScope: {},
    canSupportDecision: true,
    exclusionReason: null,
    purpose,
  };
}

const costEvidence = evidence('cost-1', 'cost', { amount: 120, currency: 'USD', period: 'year' });
const setupEvidence = evidence('setup-1', 'setup', 'Official onboarding guide');
const limitationEvidence = evidence('limit-1', 'limitation', 'Export is limited on the starter plan');
const replacementEvidence = evidence('replace-1', 'replacement', 'Reviewed workflow overlap');

const profile: DerivedToolDecisionProfile = {
  toolId: '11111111-1111-4111-8111-111111111111',
  profileVersion: 1,
  setupComplexity: 'medium',
  setupMinutesLow: 15,
  setupMinutesHigh: 30,
  dataTrainingUse: 'no',
  selfHostLevel: 'no',
  exportLevel: 'limited',
  decisionSummary: {},
  watchOuts: [{ en: 'Export is limited on the starter plan', cn: '入门套餐导出受限' }],
  reviewedAt: '2026-09-01T00:00:00.000Z',
  reviewDueAt: '2026-12-01T00:00:00.000Z',
  evidenceState: 'supported',
  evidence: [costEvidence, setupEvidence, limitationEvidence],
  excludedEvidence: [],
};

const replacement: DerivedToolRelationship = {
  id: 'relationship-1',
  toolId: profile.toolId,
  relatedToolId: '22222222-2222-4222-8222-222222222222',
  relationshipType: 'replaces',
  rationale: { en: 'Covers the same primary workflow.', cn: '覆盖相同核心工作流。' },
  reviewedAt: '2026-09-01T00:00:00.000Z',
  reviewDueAt: '2026-12-01T00:00:00.000Z',
  evidenceState: 'supported',
  evidence: [replacementEvidence],
  excludedEvidence: [],
};

const unsupportedComplement: DerivedToolRelationship = {
  ...replacement,
  id: 'relationship-2',
  relatedToolId: '33333333-3333-4333-8333-333333333333',
  relationshipType: 'complements',
  evidence: [],
};

const model = buildDecisionCardV2(
  profile,
  [replacement, unsupportedComplement],
  [
    { id: replacement.relatedToolId, slug: 'verified-alternative', title: 'Verified Alternative' },
    { id: unsupportedComplement.relatedToolId, slug: 'unsupported-complement', title: 'Unsupported Complement' },
  ],
  'en',
);

assert.ok(model, 'a supported profile should produce Decision Card 2.0');
assert.equal(model.trueCost.state, 'supported');
assert.equal(model.trueCost.value?.monthlyEquivalent, 10);
assert.equal(model.setup.state, 'supported');
assert.equal(model.dataUse.state, 'unknown', 'profile values without privacy evidence must remain unknown');
assert.equal(model.exitPath.state, 'unknown', 'exit fields need privacy or export evidence');
assert.equal(model.whyNot.state, 'supported');
assert.equal(model.replaces.length, 1);
assert.equal(model.replaces[0].href, '/ai/verified-alternative#decision-card');
assert.equal(model.worksWith.length, 0, 'relationships without replacement evidence must not be published');

assert.equal(
  buildDecisionCardV2({ ...profile, evidenceState: 'review_due' }, [], [], 'en'),
  null,
  'review-due profiles must fall back to the existing card',
);

console.log('Decision Card 2.0 evidence contract passed.');

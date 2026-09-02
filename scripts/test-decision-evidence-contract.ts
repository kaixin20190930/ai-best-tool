import assert from 'node:assert/strict';

import {
  deriveDecisionEvidenceBundle,
  deriveDecisionEvidenceTrace,
  getSupportingDecisionEvidence,
} from '@/lib/services/decision/evidence';

const now = new Date('2026-09-02T12:00:00.000Z');
const baseClaim = {
  id: 'claim-valid',
  claim_type: 'pricing_plan',
  claim_key: 'pricing_plan:pro',
  claim_value: { price: 19, interval: 'month' },
  source_url: 'https://example.com/pricing',
  source_excerpt: 'Pro is $19 per month.',
  observed_at: '2026-09-01T00:00:00.000Z',
  verified_at: '2026-09-01T01:00:00.000Z',
  verification_status: 'verified',
  conflict_status: 'none',
  review_due_at: '2026-10-01T00:00:00.000Z',
  expires_at: null,
  invalidated_at: null,
  validity_scope: { region: 'global' },
};

assert.equal(deriveDecisionEvidenceTrace(baseClaim, now).canSupportDecision, true);

const exclusions = [
  ['candidate', { verification_status: 'candidate' }, 'not_verified'],
  ['conflict', { conflict_status: 'possible' }, 'conflict'],
  ['invalidated', { invalidated_at: '2026-09-02T01:00:00.000Z' }, 'invalidated'],
  ['expired', { expires_at: '2026-09-01T00:00:00.000Z' }, 'expired'],
  ['review due', { review_due_at: '2026-09-01T00:00:00.000Z' }, 'review_due'],
  ['missing source', { source_url: '' }, 'missing_source'],
] as const;

for (const [label, override, reason] of exclusions) {
  const trace = deriveDecisionEvidenceTrace({ ...baseClaim, ...override }, now);
  assert.equal(trace.canSupportDecision, false, `${label} evidence must not support a decision`);
  assert.equal(trace.exclusionReason, reason);
}

const bundle = deriveDecisionEvidenceBundle(
  {
    profiles: [
      {
        tool_id: 'tool-a',
        profile_version: 1,
        setup_complexity: 'low',
        setup_minutes_low: 5,
        setup_minutes_high: 10,
        data_training_use: 'no',
        self_host_level: 'no',
        export_level: 'full',
        decision_summary: { en: 'Good fit for small teams.' },
        watch_outs: ['No self-hosting'],
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: '2026-10-01T00:00:00.000Z',
      },
      {
        tool_id: 'tool-overdue',
        profile_version: 1,
        setup_complexity: 'unknown',
        data_training_use: 'unknown',
        self_host_level: 'unknown',
        export_level: 'unknown',
        decision_summary: {},
        watch_outs: [],
        reviewed_at: '2026-08-01T00:00:00.000Z',
        review_due_at: '2026-09-01T00:00:00.000Z',
      },
    ],
    taskFits: [
      {
        id: 'fit-a',
        tool_id: 'tool-a',
        task_id: 'task-a',
        fit_level: 'strong',
        rationale: { en: 'Verified workflow.' },
        required_conditions: [],
        disqualifiers: [],
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: '2026-10-01T00:00:00.000Z',
      },
    ],
    relationships: [],
    profileClaimLinks: [
      { subjectId: 'tool-a', claimId: 'claim-valid', purpose: 'cost' },
      { subjectId: 'tool-a', claimId: 'claim-candidate', purpose: 'privacy' },
      { subjectId: 'tool-overdue', claimId: 'claim-valid', purpose: 'cost' },
    ],
    taskFitClaimLinks: [{ subjectId: 'fit-a', claimId: 'claim-valid', purpose: 'fit' }],
    relationshipClaimLinks: [],
    claims: [baseClaim, { ...baseClaim, id: 'claim-candidate', verification_status: 'candidate' }],
  },
  now,
);

assert.equal(bundle.available, true);
assert.equal(bundle.profiles[0]?.evidenceState, 'supported');
assert.equal(bundle.profiles[0]?.evidence.length, 1);
assert.equal(bundle.profiles[0]?.excludedEvidence[0]?.exclusionReason, 'not_verified');
assert.equal(bundle.profiles[0]?.evidence[0]?.purpose, 'cost');
assert.equal(getSupportingDecisionEvidence(bundle.profiles[0]?.evidence || [], 'cost').length, 1);
assert.equal(getSupportingDecisionEvidence(bundle.profiles[0]?.evidence || [], 'privacy').length, 0);
assert.equal(bundle.profiles[1]?.evidenceState, 'review_due');
assert.equal(bundle.taskFits[0]?.evidenceState, 'supported');
assert.equal(bundle.taskFits[0]?.evidence[0]?.sourceUrl, 'https://example.com/pricing');

const unsupported = deriveDecisionEvidenceBundle(
  {
    profiles: [
      {
        tool_id: 'tool-b',
        profile_version: 1,
        setup_complexity: 'unknown',
        data_training_use: 'unknown',
        self_host_level: 'unknown',
        export_level: 'unknown',
        decision_summary: {},
        watch_outs: [],
        reviewed_at: '2026-09-01T00:00:00.000Z',
        review_due_at: null,
      },
    ],
    taskFits: [],
    relationships: [],
    profileClaimLinks: [{ subjectId: 'tool-b', claimId: 'claim-candidate', purpose: 'other' }],
    taskFitClaimLinks: [],
    relationshipClaimLinks: [],
    claims: [{ ...baseClaim, id: 'claim-candidate', verification_status: 'candidate' }],
  },
  now,
);
assert.equal(unsupported.profiles[0]?.evidenceState, 'unsupported');
assert.equal(unsupported.profiles[0]?.evidence.length, 0);

console.log(
  JSON.stringify(
    {
      success: true,
      staleEvidenceExcluded: true,
      conflictsExcluded: true,
      candidateEvidenceExcluded: true,
      sourceTracePreserved: true,
    },
    null,
    2,
  ),
);

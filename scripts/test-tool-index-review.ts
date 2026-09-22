import assert from 'node:assert/strict';

import {
  deriveIndexReviewEvidence,
  evaluateToolIndexReview,
  type IndexReviewInput,
} from '../lib/services/toolIndexReview';

const passing: IndexReviewInput = {
  published: true,
  monitor: true,
  qualityScore: 100,
  mediaComplete: true,
  marketValidated: true,
  officialSourceCount: 2,
  independentSignalCount: 2,
  decisionContentComplete: true,
  editorialDatesComplete: true,
  canonicalUnique: true,
  intentUnique: true,
  automatedSeoPassed: true,
  observationComplete: true,
  gscSnapshotDate: '2026-09-20',
  asOfDate: '2026-09-21',
  siteSearchHealth: 'healthy',
  policyPaused: false,
  quotaAvailable: true,
};

assert.equal(evaluateToolIndexReview(passing).decision, 'approve_continue_index');
assert.equal(evaluateToolIndexReview({ ...passing, policyPaused: true }).decision, 'hold_monitor');
assert.equal(evaluateToolIndexReview({ ...passing, gscSnapshotDate: '2026-08-01' }).decision, 'hold_monitor');
assert.equal(evaluateToolIndexReview({ ...passing, independentSignalCount: 0 }).decision, 'repair_monitor');
assert.equal(evaluateToolIndexReview({ ...passing, mergeOrArchive: true }).decision, 'merge_or_archive');
assert.equal(evaluateToolIndexReview({ ...passing, permanentNoindex: true }).decision, 'permanent_noindex');
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    observationComplete: false,
    releaseTrack: 'mature_high_demand',
  }).decision,
  'approve_continue_index',
  'Mature high-demand tools may be approved without an artificial waiting period',
);
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    observationComplete: false,
    releaseTrack: 'standard',
  }).decision,
  'hold_monitor',
  'Standard tools must retain the observation gate',
);
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    observationComplete: false,
    releaseTrack: 'mature_high_demand',
    intentUnique: false,
  }).decision,
  'repair_monitor',
  'The mature track must never bypass identity and intent checks',
);
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    observationComplete: false,
    releaseTrack: 'mature_high_demand',
    siteSearchHealth: 'warning',
  }).decision,
  'approve_continue_index',
  'A small mature-tool release may proceed while site health is warning',
);
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    releaseTrack: 'standard',
    siteSearchHealth: 'warning',
  }).decision,
  'hold_monitor',
  'Standard tools still require healthy site search status',
);
assert.equal(
  evaluateToolIndexReview({
    ...passing,
    observationComplete: false,
    releaseTrack: 'mature_high_demand',
    siteSearchHealth: 'blocked',
  }).decision,
  'hold_monitor',
  'Blocked site health must stop every release track',
);

const noPageMetrics = evaluateToolIndexReview(passing);
assert.equal(
  noPageMetrics.decision,
  'approve_continue_index',
  'Pre-index review must not require impossible page-level GSC metrics',
);
const releasedPayloadEvidence = deriveIndexReviewEvidence({
  audience: { bestFit: { en: ['Writers'] }, notIdealFor: { en: ['Unreviewed automation'] } },
  editorial: { reviewedAt: '2026-09-20' },
  decision: { compareAxes: { en: ['Cost'] }, limitations: { en: ['Usage limits'] } },
  evidence: {
    official: [{ url: 'https://example.com/pricing' }, { url: 'https://example.com/privacy' }],
    independent: [{ url: 'https://reviews.example/tool' }, { url: 'https://store.example/tool' }],
  },
  marketValidation: { verdict: 'validated', strongSignals: ['adoption', 'reviews'] },
});
assert.deepEqual(releasedPayloadEvidence, {
  officialSourceCount: 2,
  independentSignalCount: 2,
  decisionContentComplete: true,
  marketValidated: true,
  editorialReviewed: true,
});
console.log('PASS: index review decisions, precedence, freshness, and pre-index GSC boundary');

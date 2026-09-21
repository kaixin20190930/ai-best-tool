import assert from 'node:assert/strict';

import { evaluateToolIndexReview, type IndexReviewInput } from '../lib/services/toolIndexReview';

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

const noPageMetrics = evaluateToolIndexReview(passing);
assert.equal(
  noPageMetrics.decision,
  'approve_continue_index',
  'Pre-index review must not require impossible page-level GSC metrics',
);
console.log('PASS: index review decisions, precedence, freshness, and pre-index GSC boundary');

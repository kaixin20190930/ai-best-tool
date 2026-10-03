import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  getMonitorPublicationBlockers,
  getMonitorReviewDate,
  getSubmissionOwnershipLabel,
  getSubmissionReviewSlaHours,
  submissionReviewSlaHoursSql,
  withMonitorPublicationReview,
} from '../lib/services/admin/submissionPublication';
import { evaluateToolIndexReview, type IndexReviewInput } from '../lib/services/toolIndexReview';

const complete = {
  url: 'https://example.com/product',
  category_id: 'category-id',
  image_url: 'https://example.com/logo.png',
  thumbnail_url: 'https://example.com/screenshot.png',
  content: { en: 'A useful AI product with a clear audience and a concrete workflow. '.repeat(2) },
  detail: { en: 'This detailed description explains what the product does, how its main workflow works, what a user can expect, and which tasks it helps complete. '.repeat(2) },
  pricing: 'freemium',
  tags: ['productivity'],
  features: { submission: { commercial: { plan: 'free', targetReviewSlaHours: 120 } } },
};

assert.deepEqual(getMonitorPublicationBlockers(complete), [], 'Core complete submission can publish without editorial evidence');
assert.ok(getMonitorPublicationBlockers({ ...complete, thumbnail_url: null }).includes('Screenshot'));
assert.ok(getMonitorPublicationBlockers({ ...complete, image_url: 'https://www.google.com/s2/favicons?domain=example.com' }).includes('Logo'));
assert.ok(getMonitorPublicationBlockers({ ...complete, url: 'javascript:alert(1)' }).includes('Website URL'));
assert.ok(getMonitorPublicationBlockers({ ...complete, pricing: 'unknown' }).includes('Pricing'));
assert.ok(getMonitorPublicationBlockers({ ...complete, tags: ['  '] }).includes('Tags'));
assert.deepEqual(getMonitorPublicationBlockers({ ...complete, features: { mediaReview: { needed: true } } }), [], 'Current complete media can clear a stale media-needed flag');
assert.ok(getMonitorPublicationBlockers({ ...complete, features: { submission: { commercial: { plan: 'standard_paid', paymentConfirmed: false } } } }).includes('Priority review payment'));
assert.deepEqual(getMonitorPublicationBlockers({ ...complete, features: { submission: { commercial: { plan: 'standard_paid', paymentConfirmed: true } } } }), []);

assert.equal(getSubmissionReviewSlaHours(complete.features), 120);
assert.equal(getSubmissionReviewSlaHours({ submission: { commercial: { targetReviewSlaHours: 48 } } }), 48);
for (const value of [0, -1, 721, 'infinity', null]) {
  assert.equal(getSubmissionReviewSlaHours({ submission: { commercial: { targetReviewSlaHours: value } } }), 120);
}
assert.match(submissionReviewSlaHoursSql, /targetReviewSlaHours/);
assert.match(submissionReviewSlaHoursSql, /ELSE 120/);
assert.equal(getSubmissionOwnershipLabel('account-id', null), 'Submitter linked · Ownership unverified');
assert.equal(getSubmissionOwnershipLabel('account-id', 'pending'), 'Submitter linked · Ownership unverified');
assert.equal(getSubmissionOwnershipLabel('account-id', 'claimed'), 'Owner claimed');

const next = withMonitorPublicationReview(complete.features, 'admin@example.com');
const review = (next.submission as { review: { approvedAt: string; reviewer: string; publishMode: string } }).review;
assert.equal(review.reviewer, 'admin@example.com');
assert.equal(review.publishMode, 'monitor_noindex');
assert.ok(Number.isFinite(Date.parse(review.approvedAt)));
assert.equal(getMonitorReviewDate('2099-01-01'), '2099-01-01');
assert.ok(getMonitorReviewDate(null) > new Date().toISOString().slice(0, 10));

const indexInput: IndexReviewInput = {
  published: true, monitor: true, qualityScore: 100, mediaComplete: true,
  marketValidated: false, officialSourceCount: 0, independentSignalCount: 0,
  decisionContentComplete: false, editorialDatesComplete: false,
  canonicalUnique: true, intentUnique: true, automatedSeoPassed: true,
  observationComplete: true, gscSnapshotDate: '2026-10-03', asOfDate: '2026-10-03',
  siteSearchHealth: 'healthy', policyPaused: false, quotaAvailable: true,
};
assert.equal(evaluateToolIndexReview(indexInput).decision, 'repair_monitor', 'Publication must not grant indexing');

const actions = readFileSync('app/actions/admin/tools.ts', 'utf8');
const approve = actions.slice(actions.indexOf('export async function approveTool('), actions.indexOf('export async function rejectTool('));
assert.match(approve, /getMonitorPublicationBlockers/);
assert.match(approve, /page_quality_status = 'monitor'/);
assert.match(approve, /withMonitorPublicationReview/);
assert.doesNotMatch(approve, /getEvidencePublishGateError|getMarketValidationPublishGateError|continue_index/);
assert.match(actions, /getMonitorPublicationBlockers\(\{ \.\.\.prospectiveTool, features: nextFeaturesForUpdate \}\)/);
assert.match(actions, /created_at <= NOW\(\) - \(\$\{submissionReviewSlaHoursSql\} \* INTERVAL '1 hour'\)/);

console.log('Submission monitor publication checks passed');

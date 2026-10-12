import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

import {
  buildReadyDraftMonitorPublishSql,
  getMonitorPublicationBlockers,
  getMonitorReviewDate,
  getSubmissionOwnershipLabel,
  getSubmissionReviewSlaHours,
  isMonitorPaymentEligible,
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
assert.equal(isMonitorPaymentEligible({ plan: 'free' }), true);
assert.equal(isMonitorPaymentEligible({ plan: 'standard_paid' }), false);
assert.equal(isMonitorPaymentEligible({ plan: 'standard_paid', paymentConfirmed: 'true' }), false);
assert.equal(isMonitorPaymentEligible({ plan: 'standard_paid', paymentConfirmed: true }), true);

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
const publishReady = actions.slice(actions.indexOf('export async function publishReadyTools('), actions.indexOf('export async function markPendingFollowedUp('));
assert.match(publishReady, /pool\.query\(buildReadyDraftMonitorPublishSql\(evidenceReadyDraftSql\),\s*\[\s*ids,\s*reviewer\.email \|\| reviewer\.id,\s*\]\)/);
const batchSql = buildReadyDraftMonitorPublishSql("status = 'draft'");
assert.match(batchSql, /id::text = ANY\(\$1::text\[\]\)/);
assert.match(batchSql, /'reviewer', \$2::text/);
assert.match(batchSql, /page_quality_status = 'monitor'/);
assert.match(batchSql, /next_review_date = CASE/);
assert.match(batchSql, /'publishMode', 'monitor_noindex'/);
assert.match(batchSql, /features #> '\{submission,commercial,paymentConfirmed\}' = 'true'::jsonb/);
assert.match(batchSql, /COALESCE\(features->'submission'->'commercial'->>'plan', 'free'\) <> 'standard_paid'/);
assert.match(batchSql, /AND status = 'draft'/);
const approve = actions.slice(actions.indexOf('export async function approveTool('), actions.indexOf('export async function rejectTool('));
assert.match(approve, /getMonitorPublicationBlockers/);
assert.match(approve, /page_quality_status = 'monitor'/);
assert.match(approve, /withMonitorPublicationReview/);
assert.doesNotMatch(approve, /getEvidencePublishGateError|getMarketValidationPublishGateError|continue_index/);
assert.match(actions, /getMonitorPublicationBlockers\(\{ \.\.\.prospectiveTool, features: nextFeaturesForUpdate \}\)/);
assert.match(actions, /created_at <= NOW\(\) - \(\$\{submissionReviewSlaHoursSql\} \* INTERVAL '1 hour'\)/);

async function testBatchPublicationSql() {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) {
    console.log('SKIP PostgreSQL behavior test: TEST_DATABASE_URL is not set');
    return;
  }
  const db = new Client({ connectionString });
  let inTransaction = false;
  try {
    await db.connect();
    await db.query('BEGIN');
    inTransaction = true;
    await db.query('SET LOCAL search_path = pg_temp, pg_catalog');
    await db.query(`CREATE TEMP TABLE tools (
      id text PRIMARY KEY, name text, status text, page_quality_status text,
      next_review_date date, features jsonb, updated_at timestamptz
    ) ON COMMIT DROP`);
    const cases = [
      { id: 'free', commercial: { plan: 'free' } },
      { id: 'unpaid', commercial: { plan: 'standard_paid', paymentConfirmed: false } },
      { id: 'string-paid', commercial: { plan: 'standard_paid', paymentConfirmed: 'true' } },
      { id: 'paid', commercial: { plan: 'standard_paid', paymentConfirmed: true } },
    ];
    for (const item of cases) {
      await db.query(
        `INSERT INTO tools (id, name, status, page_quality_status, next_review_date, features)
         VALUES ($1, $1, 'draft', 'continue_index', CURRENT_DATE + 60, $2::jsonb)`,
        [item.id, JSON.stringify({ collection: { source: 'candidate' }, submission: {
          commercial: { ...item.commercial, invoiceId: 'retained' },
          review: { previousNote: 'retained' }, owner: 'retained',
        } })],
      );
    }
    const result = await db.query(batchSql, [
      cases.map((item) => item.id), 'reviewer@example.com',
    ]);
    assert.deepEqual(result.rows.map((row) => row.name).sort(), ['free', 'paid']);
    const rows = await db.query('SELECT id, status, page_quality_status, next_review_date, features FROM tools ORDER BY id');
    for (const row of rows.rows) {
      const published = row.id === 'free' || row.id === 'paid';
      assert.equal(row.status, published ? 'published' : 'draft');
      assert.equal(row.page_quality_status, published ? 'monitor' : 'continue_index');
      assert.equal(row.features.collection.source, 'candidate');
      assert.equal(row.features.submission.owner, 'retained');
      assert.equal(row.features.submission.commercial.invoiceId, 'retained');
      assert.equal(row.features.submission.review.previousNote, 'retained');
      if (published) {
        assert.equal(row.features.submission.review.reviewer, 'reviewer@example.com');
        assert.equal(row.features.submission.review.publishMode, 'monitor_noindex');
        assert.ok(Number.isFinite(Date.parse(row.features.submission.review.approvedAt)));
      }
    }
    const retry = await db.query(batchSql, [
      cases.map((item) => item.id), 'reviewer@example.com',
    ]);
    assert.equal(retry.rowCount, 0);
  } finally {
    if (inTransaction) await db.query('ROLLBACK').catch(() => undefined);
    await db.end().catch(() => undefined);
  }
}

testBatchPublicationSql().then(
  () => console.log('Submission monitor publication checks passed'),
  (error) => { console.error(error); process.exitCode = 1; },
);

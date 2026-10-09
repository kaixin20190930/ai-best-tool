import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import {
  buildFreshnessNext,
  freshnessProductionWrites,
  freshnessResultStatus,
  inspectFreshnessState,
} from './freshness-batch-state';
import { applyCandidateDetail } from './freshness-first-batch';
import REPLIT from './freshness-replit';

const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'));
const manifestFields = [
  'slug', 'outcome', 'preimageSha256', 'passSnapshot', 'expectedDetailSha256', 'changedFields',
  'nextReviewDate', 'sources', 'unresolved',
] as const;
const selected = (row: Record<string, any>) => Object.fromEntries(manifestFields.map((field) => [field, row[field]]));

async function main() {
  const candidate = REPLIT[0];
  const preflight = read('docs/REPLIT_FRESHNESS_PREFLIGHT_2026-10-09.json');
  const rollback = read('docs/REPLIT_FRESHNESS_ROLLBACK_2026-10-09.json');
  assert.equal(preflight.mode, 'preflight');
  assert.equal(rollback.mode, 'rollback');
  assert.equal(preflight.batch, 'replit');
  assert.equal(rollback.batch, 'replit');
  assert.equal(preflight.productionWrites, 0);
  assert.equal(rollback.productionWrites, 0);
  assert.equal(preflight.results.length, 1);
  assert.equal(rollback.results.length, 1);
  assert.equal(preflight.results[0].status, 'ready');
  assert.equal(rollback.results[0].status, 'rolled_back');
  const approved = preflight.results[0];
  assert.deepEqual(selected(rollback.results[0]), selected(approved), 'rollback manifest drift');
  assert.equal(approved.slug, candidate.slug);
  assert.equal(approved.outcome, candidate.outcome);
  assert.deepEqual(approved.passSnapshot, candidate.passSnapshot);
  assert.equal(approved.expectedDetailSha256, candidate.expectedDetailSha256);
  assert.equal(approved.nextReviewDate, candidate.nextReviewDate);
  assert.deepEqual(approved.sources, candidate.sources);
  assert.deepEqual(approved.unresolved, candidate.unresolved);
  assert.deepEqual(approved.changedFields, ['detail', 'features', 'next_review_date']);

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const query = await client.query(
      'SELECT to_jsonb(t) - $1::text AS record FROM public.tools t WHERE id=$2 AND name=$3',
      ['search_vector', candidate.id, candidate.slug],
    );
    assert.equal(query.rowCount, 1);
    const row = query.rows[0].record;
    assert.equal(hash(row), preflight.results[0].preimageSha256, 'production preimage drift after rollback');
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'monitor');
    assert.equal(row.next_review_date, '2026-10-09');
    inspectFreshnessState(candidate, row, '2026-10-09');
    const next = buildFreshnessNext(candidate, row, false);
    assert.equal(hash(applyCandidateDetail(row.detail, candidate)), candidate.expectedDetailSha256);
    assert.equal(hash(next.detail), candidate.expectedDetailSha256);
    for (const key of ['id', 'name', 'url', 'status', 'page_quality_status', 'pricing', 'title'])
      assert.deepEqual(next[key], row[key], `${key} changed`);
    assert.deepEqual(next.features.editorial, row.features.editorial);
    assert.deepEqual(next.features.marketValidation, row.features.marketValidation);
    assert.deepEqual(next.features.audience, row.features.audience);
    assert.equal(next.features.maintenanceReview.checkedAt, '2026-10-09');
    assert.equal(next.next_review_date, '2026-10-16');

    const replay = inspectFreshnessState(candidate, next, '2026-10-09');
    assert.equal(replay.alreadyApplied, true);
    assert.deepEqual(replay.passSnapshot, candidate.passSnapshot);
    const replayNext = buildFreshnessNext(candidate, next, replay.alreadyApplied);
    assert.deepEqual(replayNext, next, 'applied replay changed postimage');
    const replayChangedFields = ['detail', 'features', 'next_review_date'].filter(
      (key) => JSON.stringify(replayNext[key]) !== JSON.stringify(next[key]),
    );
    assert.deepEqual(replayChangedFields, []);
    const replayStatus = freshnessResultStatus('commit', replay.alreadyApplied);
    assert.equal(replayStatus, 'already_applied');
    assert.equal(freshnessProductionWrites('commit', [{ status: replayStatus }]), 0);

    const tamperedReview = structuredClone(next);
    tamperedReview.features.maintenanceReview.changeSummary = 'tampered';
    assert.throws(() => inspectFreshnessState(candidate, tamperedReview, '2026-10-09'));
    const tamperedDetail = structuredClone(next);
    tamperedDetail.detail.en += ' tampered';
    assert.throws(() => inspectFreshnessState(candidate, tamperedDetail, '2026-10-09'));
    const tamperedDate = structuredClone(next);
    tamperedDate.next_review_date = '2026-10-17';
    assert.throws(() => inspectFreshnessState(candidate, tamperedDate, '2026-10-09'));

    await client.query('ROLLBACK');
    console.log(
      JSON.stringify({
        status: 'PASS',
        slug: candidate.slug,
        preimageSha256: hash(row),
        expectedDetailSha256: candidate.expectedDetailSha256,
        replayStatus,
        replayChangedFields,
        productionWrites: 0,
      }),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

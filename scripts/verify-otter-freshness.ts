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
import { assertFourthBatchReviewedResult } from './freshness-fourth-batch';
import OTTER from './freshness-otter';

const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'));
const candidate = OTTER[0];
const preflight = read('docs/OTTER_FRESHNESS_PREFLIGHT_2026-10-10.json');
const rollback = read('docs/OTTER_FRESHNESS_ROLLBACK_2026-10-10.json');
const checkedFields = [
  'slug',
  'outcome',
  'preimageSha256',
  'passSnapshot',
  'expectedDetailSha256',
  'changedFields',
  'nextReviewDate',
  'sources',
  'unresolved',
];
const selected = (value: Record<string, any>) => Object.fromEntries(checkedFields.map((key) => [key, value[key]]));

async function main() {
  assert.equal(preflight.mode, 'preflight');
  assert.equal(rollback.mode, 'rollback');
  assert.equal(preflight.batch, 'otter');
  assert.equal(rollback.batch, 'otter');
  assert.equal(preflight.productionWrites, 0);
  assert.equal(rollback.productionWrites, 0);
  assert.equal(preflight.results.length, 1);
  assert.equal(rollback.results.length, 1);
  const approved = preflight.results[0];
  assert.equal(approved.status, 'ready');
  assert.equal(rollback.results[0].status, 'rolled_back');
  assert.deepEqual(selected(rollback.results[0]), selected(approved));
  assert.deepEqual(approved.passSnapshot, candidate.passSnapshot);
  assert.deepEqual(approved.changedFields, ['features', 'next_review_date']);
  assertFourthBatchReviewedResult(candidate, approved, ['features', 'next_review_date']);

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
    const before = query.rows[0].record;
    assert.equal(hash(before), approved.preimageSha256, 'post-rollback production preimage drift');
    assert.equal(before.status, 'published');
    assert.equal(before.page_quality_status, 'monitor');
    assert.equal(before.pricing, 'freemium');
    assert.equal(before.next_review_date, '2026-10-10');
    assert.equal(before.features?.maintenanceReview, undefined);
    assert.equal(inspectFreshnessState(candidate, before, '2026-10-10').alreadyApplied, false);
    const next = buildFreshnessNext(candidate, before, false);
    assert.equal(hash(next.detail), candidate.expectedDetailSha256);
    assert.deepEqual(next.detail, before.detail);
    assert.deepEqual(next.features.pricingSnapshot, before.features.pricingSnapshot);
    assert.deepEqual(next.features.editorial, before.features.editorial);
    assert.deepEqual(next.features.marketValidation, before.features.marketValidation);
    assert.equal(next.features.maintenanceReview.checkedAt, '2026-10-10');
    assert.equal(next.next_review_date, '2026-10-24');
    for (const key of Object.keys(before).filter((column) => !['features', 'next_review_date'].includes(column)))
      assert.deepEqual(next[key], before[key], `${key} drift`);

    assert.equal(inspectFreshnessState(candidate, next, '2026-10-10').alreadyApplied, true);
    const replayNext = buildFreshnessNext(candidate, next, true);
    assert.deepEqual(replayNext, next);
    const replayStatus = freshnessResultStatus('commit', true);
    assert.equal(replayStatus, 'already_applied');
    assert.equal(freshnessProductionWrites('commit', [{ status: replayStatus }]), 0);
    const tamperedReview = structuredClone(next);
    tamperedReview.features.maintenanceReview.sources = [];
    assert.throws(() => inspectFreshnessState(candidate, tamperedReview, '2026-10-10'));
    const tamperedDetail = structuredClone(next);
    tamperedDetail.detail.en += ' tampered';
    assert.throws(() => inspectFreshnessState(candidate, tamperedDetail, '2026-10-10'));
    const tamperedSchedule = structuredClone(next);
    tamperedSchedule.next_review_date = '2026-10-25';
    assert.throws(() => inspectFreshnessState(candidate, tamperedSchedule, '2026-10-10'));
    await client.query('ROLLBACK');
    const report = {
      checkedAt: '2026-10-10',
      readIsolation: 'new_connection_read_only_transaction',
      slug: candidate.slug,
      status: 'matched',
      preimageSha256: hash(before),
      candidateDetailSha256: hash(next.detail),
      candidateChangedFields: ['features', 'next_review_date'],
      replayStatus,
      replayChangedFields: [],
      productionWrites: 0,
    };
    const out = process.argv.find((arg) => arg.startsWith('--out='))?.slice(6);
    if (process.argv.slice(2).some((arg) => !arg.startsWith('--out='))) throw new Error('Only --out is supported');
    if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
    else console.log(JSON.stringify(report));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

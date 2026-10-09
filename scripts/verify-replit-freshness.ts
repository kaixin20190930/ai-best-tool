import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { buildFreshnessNext, inspectFreshnessState } from './freshness-batch-state';
import { applyCandidateDetail } from './freshness-first-batch';
import REPLIT from './freshness-replit';

const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'));

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
  assert.deepEqual(preflight.results[0].changedFields, ['detail', 'features', 'next_review_date']);
  assert.equal(rollback.results[0].preimageSha256, preflight.results[0].preimageSha256);

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
    await client.query('ROLLBACK');
    console.log(
      JSON.stringify({
        status: 'PASS',
        slug: candidate.slug,
        preimageSha256: hash(row),
        expectedDetailSha256: candidate.expectedDetailSha256,
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

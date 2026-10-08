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
import FIFTH_BATCH from './freshness-fifth-batch';
import { FIRST_BATCH } from './freshness-first-batch';
import FOURTH_BATCH, {
  assertFourthBatchReleaseManifest,
  assertFourthBatchReviewedResult,
  FOURTH_BATCH_OWNER_TIME_OVERRIDE,
  FOURTH_BATCH_PUBLISH_NOT_BEFORE,
  fourthBatchReleaseAllowed,
} from './freshness-fourth-batch';
import SECOND_BATCH from './freshness-second-batch';
import THIRD_BATCH, {
  assertThirdBatchReleaseManifest,
  THIRD_BATCH_OWNER_TIME_OVERRIDE,
  THIRD_BATCH_PUBLISH_NOT_BEFORE,
  thirdBatchReleaseAllowed,
} from './freshness-third-batch';

const protectedKeys = ['status', 'page_quality_status', 'name', 'url', 'title', 'id', 'pricing'];
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readSql = `SELECT to_jsonb(t) - 'search_vector' AS record, next_review_date::text AS due
  FROM public.tools t WHERE id=$1 AND name=$2`;

async function main() {
  const args = process.argv.slice(2);
  const third = args.includes('--batch=third');
  const fourth = args.includes('--batch=fourth');
  const fifth = args.includes('--batch=fifth');
  const second = args.includes('--batch=second');
  if ([second, third, fourth, fifth].filter(Boolean).length > 1) throw new Error('Choose one batch');
  let batch = FIRST_BATCH;
  let batchName = 'first';
  if (second) {
    batch = SECOND_BATCH;
    batchName = 'second';
  }
  if (third) {
    batch = THIRD_BATCH;
    batchName = 'third';
  }
  if (fourth) {
    batch = FOURTH_BATCH;
    batchName = 'fourth';
  }
  if (fifth) {
    batch = FIFTH_BATCH;
    batchName = 'fifth';
  }
  let mode: 'commit' | 'rollback' | 'preflight' = 'preflight';
  if (args.includes('--rollback')) mode = 'rollback';
  if (args.includes('--commit')) mode = 'commit';
  if (args.includes('--commit') && args.includes('--rollback')) throw new Error('Choose one mode');
  const manifestPath = args.find((arg) => arg.startsWith('--manifest='))?.slice(11);
  if (mode === 'commit' && !manifestPath) throw new Error('Commit requires reviewed --manifest path');
  if (
    args.some(
      (arg) =>
        !['--commit', '--rollback', '--batch=second', '--batch=third', '--batch=fourth', '--batch=fifth'].includes(
          arg,
        ) &&
        !arg.startsWith('--manifest=') &&
        !arg.startsWith('--out='),
    )
  )
    throw new Error('Unsupported argument');
  if (
    third &&
    mode === 'commit' &&
    !thirdBatchReleaseAllowed(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    )
  )
    throw new Error(`Third batch effectiveReleaseDate ${THIRD_BATCH_OWNER_TIME_OVERRIDE.effectiveReleaseDate}`);
  if (
    fourth &&
    mode === 'commit' &&
    !fourthBatchReleaseAllowed(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    )
  )
    throw new Error(`Fourth batch effectiveReleaseDate ${FOURTH_BATCH_OWNER_TIME_OVERRIDE.effectiveReleaseDate}`);
  const manifest = manifestPath ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  if (manifest?.ownerTimeOverride && manifest.ownerTimeOverride.batch !== batchName) {
    throw new Error(
      manifest.ownerTimeOverride.batch === 'third' && !fourth
        ? 'Third batch owner time override cannot be used with first or second batch'
        : 'Owner time override cannot be used with a different batch',
    );
  }
  if (mode === 'commit' && (manifest?.mode !== 'preflight' || manifest?.results?.length !== batch.length))
    throw new Error('Invalid reviewed manifest');
  if (
    fifth &&
    mode === 'commit' &&
    (manifest?.batch !== 'fifth' ||
      manifest?.productionWrites !== 0 ||
      manifest?.results?.map((row: any) => row.slug).join(',') !== FIFTH_BATCH.map((row) => row.slug).join(','))
  )
    throw new Error('Fifth batch reviewed manifest mismatch');
  if (third && mode === 'commit') assertThirdBatchReleaseManifest(manifest);
  if (fourth && mode === 'commit') assertFourthBatchReleaseManifest(manifest);
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  const results = [];
  try {
    for (const candidate of batch) {
      await client.query(mode === 'preflight' ? 'BEGIN READ ONLY' : 'BEGIN');
      try {
        await client.query("SET LOCAL lock_timeout='5s'");
        await client.query("SET LOCAL statement_timeout='30s'");
        const found = await client.query(`${readSql}${mode === 'preflight' ? '' : ' FOR UPDATE'}`, [
          candidate.id,
          candidate.slug,
        ]);
        assert.equal(found.rowCount, 1, `${candidate.slug}: entity missing or duplicate`);
        const before = found.rows[0].record;
        const { alreadyApplied, passSnapshot } = inspectFreshnessState(
          candidate,
          before,
          new Date().toISOString().slice(0, 10),
        );
        assert.equal(before.status, 'published');
        assert(['monitor', 'continue_index'].includes(before.page_quality_status));
        if (fifth) {
          assert.equal(before.page_quality_status, 'monitor', `${candidate.slug}: index gate drift`);
          assert.equal(before.pricing, 'freemium', `${candidate.slug}: pricing enum drift`);
        }
        assert(before.features && typeof before.features === 'object' && !Array.isArray(before.features));
        if (!before.url || !/^https:\/\//.test(before.url)) throw new Error(`${candidate.slug}: entity URL risk`);
        const beforeHash = hash(before);
        const approved = manifest?.results?.find((item: any) => item.slug === candidate.slug);
        if (
          mode === 'commit' &&
          (!approved ||
            (!alreadyApplied && approved.preimageSha256 !== beforeHash) ||
            JSON.stringify(approved.passSnapshot) !== JSON.stringify(passSnapshot))
        )
          throw new Error(`${candidate.slug}: preimage or PASS snapshot drift`);
        const next = buildFreshnessNext(candidate, before, alreadyApplied);
        assert.equal(
          hash(next.detail),
          candidate.expectedDetailSha256,
          `${candidate.slug}: candidate detail postimage mismatch`,
        );
        for (const key of protectedKeys)
          assert.deepEqual(next[key], before[key], `${candidate.slug}: protected ${key}`);
        const changes = ['detail', 'features', 'next_review_date'].filter(
          (key) => JSON.stringify(next[key]) !== JSON.stringify(before[key]),
        );
        assert(changes.every((key) => ['detail', 'features', 'next_review_date'].includes(key)));
        if ((fourth || fifth) && mode === 'commit') {
          let expectedChanges = changes;
          if (alreadyApplied) {
            expectedChanges = candidate.replacements?.length
              ? ['detail', 'features', 'next_review_date']
              : ['features', 'next_review_date'];
          }
          assertFourthBatchReviewedResult(candidate, approved, expectedChanges);
        }
        if (mode !== 'preflight' && !alreadyApplied) {
          await client.query(
            `UPDATE public.tools SET detail=$2::jsonb, features=$3::jsonb,
            next_review_date=$4::date, updated_at=now() WHERE id=$1`,
            [candidate.id, JSON.stringify(next.detail), JSON.stringify(next.features), candidate.nextReviewDate],
          );
          const after = (await client.query(readSql, [candidate.id, candidate.slug])).rows[0].record;
          for (const column of Object.keys(before).filter(
            (key) => !['detail', 'features', 'next_review_date', 'updated_at'].includes(key),
          ))
            assert.deepEqual(after[column], before[column], `${candidate.slug}: unexpected ${column}`);
          assert.deepEqual(after.detail, next.detail);
          assert.deepEqual(after.features, next.features);
          assert.equal(after.next_review_date, candidate.nextReviewDate);
        }
        if (mode === 'commit') await client.query('COMMIT');
        else await client.query('ROLLBACK');
        results.push({
          slug: candidate.slug,
          outcome: candidate.outcome,
          preimageSha256: beforeHash,
          passSnapshot,
          expectedDetailSha256: candidate.expectedDetailSha256,
          changedFields: alreadyApplied ? [] : changes,
          nextReviewDate: candidate.nextReviewDate,
          sources: candidate.sources,
          unresolved: candidate.unresolved,
          status: freshnessResultStatus(mode, alreadyApplied),
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    let releaseMeta = {};
    if (third) {
      releaseMeta = {
        publishNotBefore: THIRD_BATCH_PUBLISH_NOT_BEFORE,
        ownerTimeOverride: THIRD_BATCH_OWNER_TIME_OVERRIDE,
      };
    }
    if (fourth) {
      releaseMeta = {
        publishNotBefore: FOURTH_BATCH_PUBLISH_NOT_BEFORE,
        ownerTimeOverride: FOURTH_BATCH_OWNER_TIME_OVERRIDE,
      };
    }
    if (fifth) releaseMeta = { batch: 'fifth' };
    const output = { mode, ...releaseMeta, productionWrites: freshnessProductionWrites(mode, results), results };
    const out = args.find((arg) => arg.startsWith('--out='))?.slice(6);
    if (out) fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
    else console.log(JSON.stringify(output, null, 2));
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

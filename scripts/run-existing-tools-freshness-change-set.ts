import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import {
  buildAllowedUpdateSql,
  replaceApprovedAtPath,
  replaceApprovedText,
  validateApprovedWritablePaths,
  type ApprovedWritablePath,
} from './existing-tools-freshness-write-policy';

type Item = {
  id: string;
  slug: string;
  preimageSha256: string;
  protectedSha256: string;
  protectedFeaturesSha256: string;
  expectedDetailSha256: string;
  nextReviewDate: string;
  review: Record<string, unknown>;
  detailReplacements?: Record<string, { from: string; to: string }>;
  featureReplacements?: { path: string[]; from: string; to: string }[];
};

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readSql = "SELECT to_jsonb(t) - 'search_vector' AS record FROM public.tools t WHERE id=$1 AND name=$2";

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find((arg) => arg.startsWith('--mode='))?.slice(7) || 'preflight';
  const manifestPath = args.find((arg) => arg.startsWith('--manifest='))?.slice(11);
  const qaPath = args.find((arg) => arg.startsWith('--qa-report='))?.slice(12);
  assert(['preflight', 'rollback', 'commit', 'postcheck'].includes(mode), 'Invalid mode');
  assert(manifestPath, 'A change-set manifest is required');
  assert(
    args.every((arg) => /^--(mode|manifest|qa-report)=/.test(arg)),
    'Unsupported argument',
  );
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw) as { unit: string; approvedWritablePaths: ApprovedWritablePath[]; items: Item[] };
  assert(manifest.items.length > 0 && manifest.items.length <= 5, 'Batch must contain 1-5 items');
  assert.equal(new Set(manifest.items.map((item) => item.id)).size, manifest.items.length);
  validateApprovedWritablePaths(manifest.items, manifest.approvedWritablePaths);
  if (mode === 'commit') {
    assert(qaPath, 'Independent QA report required for commit');
    const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
    assert.equal(qa.status, 'QA_PASS');
    assert.equal(qa.unit, manifest.unit);
    assert.equal(qa.manifestSha256, hash(JSON.parse(raw)));
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  const results: unknown[] = [];
  try {
    await client.query(mode === 'preflight' || mode === 'postcheck' ? 'BEGIN READ ONLY' : 'BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    for (const item of manifest.items) {
      const found = await client.query(`${readSql}${mode === 'rollback' || mode === 'commit' ? ' FOR UPDATE' : ''}`, [
        item.id,
        item.slug,
      ]);
      assert.equal(found.rowCount, 1, `${item.slug}: missing or duplicated entity`);
      const before = found.rows[0].record;
      assert.equal(before.status, 'published');
      assert.equal(before.page_quality_status, 'monitor');
      assert.equal(before.name, item.slug);
      assert(before.url?.startsWith('https://'));
      const protectedRow = { ...before };
      for (const key of ['detail', 'features', 'next_review_date', 'updated_at']) delete protectedRow[key];
      assert.equal(hash(protectedRow), item.protectedSha256, `${item.slug}: protected-field drift`);
      const features = structuredClone(before.features);
      const detail = structuredClone(before.detail);
      const protectedFeatures = structuredClone(before.features);
      delete protectedFeatures.maintenanceReview;
      if (item.featureReplacements?.some((patch) => patch.path.join('.') === 'decision.freshnessSummary.en')) {
        delete protectedFeatures.decision.freshnessSummary;
      }
      assert.equal(hash(protectedFeatures), item.protectedFeaturesSha256, `${item.slug}: unrelated feature drift`);
      for (const [locale, patch] of Object.entries(item.detailReplacements || {})) {
        assert.equal(typeof detail[locale], 'string');
        detail[locale] = replaceApprovedText(detail[locale], patch.from, patch.to);
      }
      for (const patch of item.featureReplacements || []) {
        replaceApprovedAtPath(features, patch.path, patch.from, patch.to);
      }
      features.maintenanceReview = item.review;
      assert.equal(hash(detail), item.expectedDetailSha256, `${item.slug}: detail postimage drift`);
      const expected = { ...before, detail, features, next_review_date: item.nextReviewDate };
      const alreadyApplied =
        before.next_review_date === item.nextReviewDate &&
        isDeepStrictEqual(before.features, features) &&
        isDeepStrictEqual(before.detail, detail);
      if (mode === 'postcheck') assert(alreadyApplied, `${item.slug}: postimage mismatch`);
      else if (!alreadyApplied) assert.equal(hash(before), item.preimageSha256, `${item.slug}: preimage drift`);
      if ((mode === 'rollback' || mode === 'commit') && !alreadyApplied) {
        const featurePatches = item.featureReplacements || [];
        const writeDetail = Boolean(item.detailReplacements);
        const updated = await client.query(
          buildAllowedUpdateSql(
            featurePatches.map((patch) => patch.path),
            writeDetail,
          ),
          [
            item.id,
            ...(writeDetail ? [JSON.stringify(detail)] : []),
            JSON.stringify(item.review),
            item.nextReviewDate,
            item.slug,
            ...featurePatches.flatMap((patch) => [patch.path, JSON.stringify(patch.to)]),
          ],
        );
        assert.equal(updated.rowCount, 1);
        const after = updated.rows[0].record;
        for (const key of Object.keys(before).filter(
          (column) => !['detail', 'features', 'next_review_date'].includes(column),
        )) {
          assert.deepEqual(after[key], before[key], `${item.slug}: protected ${key}`);
        }
        assert.deepEqual(after.detail, expected.detail);
        assert.deepEqual(after.features, expected.features);
        assert.equal(after.next_review_date, expected.next_review_date);
      }
      const changedFields: string[] = [];
      if (!alreadyApplied) {
        changedFields.push('features.maintenanceReview', 'next_review_date');
        if (item.detailReplacements) changedFields.push('detail');
        if (item.featureReplacements) changedFields.push('features.decision.freshnessSummary');
      }
      results.push({
        slug: item.slug,
        preimageSha256: item.preimageSha256,
        alreadyApplied,
        outcome: item.review.outcome,
        nextReviewDate: item.nextReviewDate,
        changedFields,
      });
    }
    if (mode === 'commit') await client.query('COMMIT');
    else await client.query('ROLLBACK');
    console.log(
      JSON.stringify(
        {
          unit: manifest.unit,
          mode,
          manifestSha256: hash(JSON.parse(raw)),
          productionWrites: mode === 'commit' ? results.filter((row: any) => !row.alreadyApplied).length : 0,
          results,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

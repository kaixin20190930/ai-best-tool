import assert, { isDeepStrictEqual } from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

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

function replaceAtPath(value: Record<string, any>, path: string[], from: string, to: string, postcheck: boolean) {
  let cursor = value;
  for (const key of path.slice(0, -1)) {
    assert(cursor[key] && typeof cursor[key] === 'object', `Missing ${path.join('.')}`);
    cursor = cursor[key];
  }
  const key = path.at(-1)!;
  if (postcheck && cursor[key] === to) return;
  assert.equal(cursor[key], from, `Changed preimage ${path.join('.')}`);
  cursor[key] = to;
}

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
  const manifest = JSON.parse(raw) as { unit: string; items: Item[] };
  assert(manifest.items.length > 0 && manifest.items.length <= 5, 'Batch must contain 1-5 items');
  assert.equal(new Set(manifest.items.map((item) => item.id)).size, manifest.items.length);
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
      if (item.featureReplacements?.some((patch) => patch.path.join('.') === 'decision.freshnessSummary.en'))
        delete protectedFeatures.decision.freshnessSummary;
      assert.equal(hash(protectedFeatures), item.protectedFeaturesSha256, `${item.slug}: unrelated feature drift`);
      for (const [locale, patch] of Object.entries(item.detailReplacements || {})) {
        assert.equal(typeof detail[locale], 'string');
        if (detail[locale].includes(patch.to) && !detail[locale].includes(patch.from)) continue;
        assert(detail[locale].includes(patch.from), `${item.slug}: missing ${locale} detail preimage`);
        detail[locale] = detail[locale].replace(patch.from, patch.to);
      }
      for (const patch of item.featureReplacements || [])
        replaceAtPath(features, patch.path, patch.from, patch.to, true);
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
        const updated = await client.query(
          `UPDATE public.tools AS t SET detail=$2::jsonb, features=$3::jsonb, next_review_date=$4::date, updated_at=now()
           WHERE id=$1 AND name=$5 RETURNING to_jsonb(t) - 'search_vector' AS record`,
          [item.id, JSON.stringify(detail), JSON.stringify(features), item.nextReviewDate, item.slug],
        );
        assert.equal(updated.rowCount, 1);
        const after = updated.rows[0].record;
        for (const key of Object.keys(before).filter(
          (column) => !['detail', 'features', 'next_review_date', 'updated_at'].includes(column),
        ))
          assert.deepEqual(after[key], before[key], `${item.slug}: protected ${key}`);
        assert.deepEqual(after.detail, expected.detail);
        assert.deepEqual(after.features, expected.features);
        assert.equal(after.next_review_date, expected.next_review_date);
      }
      results.push({
        slug: item.slug,
        preimageSha256: item.preimageSha256,
        alreadyApplied,
        outcome: item.review.outcome,
        nextReviewDate: item.nextReviewDate,
        changedFields: alreadyApplied
          ? []
          : [
              'features.maintenanceReview',
              'next_review_date',
              ...(item.detailReplacements ? ['detail'] : []),
              ...(item.featureReplacements ? ['features.decision.freshnessSummary'] : []),
            ],
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

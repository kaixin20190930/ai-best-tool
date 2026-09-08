import assert from 'node:assert/strict';
import fs from 'node:fs';

import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

type Review = {
  reviewedAt: string;
  nextReviewDate: string;
  gscEvidence: string;
  records: Array<{
    id: string;
    slug: string;
    canonicalPath: string;
    currentOfficialUrl: string;
    decision: 'monitor';
    reason: string;
    futureAction: string;
    officialSources: string[];
    independentSources: string[];
  }>;
};

const review = JSON.parse(
  fs.readFileSync('data/collection/legacy-brand-scope-index-review-2026-09-08.json', 'utf8'),
) as Review;

function indexInput(row: Record<string, unknown>, pageQualityStatus = row.page_quality_status as string | null) {
  return {
    status: row.status as string | null,
    pageQualityStatus,
    categoryId: row.category_id as string | null,
    imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    content: row.content,
    detail: row.detail,
    pricing: row.pricing as string | null,
    tags: row.tags as string[] | null,
  };
}

function validateReview() {
  assert.match(review.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert(review.nextReviewDate > review.reviewedAt);
  assert.match(review.gscEvidence, /not as zero impressions or zero clicks/i);
  assert.equal(review.records.length, 2);
  assert.equal(new Set(review.records.map((item) => item.id)).size, 2);
  assert.equal(new Set(review.records.map((item) => item.slug)).size, 2);
  for (const item of review.records) {
    assert.equal(item.canonicalPath, `/ai/${item.slug}`);
    assert.equal(item.decision, 'monitor');
    assert(item.reason.length >= 120 && item.futureAction.length >= 120);
    assert(item.officialSources.length >= 2 && item.independentSources.length >= 2);
    const sources = [...item.officialSources, ...item.independentSources];
    assert(sources.every((source) => source.startsWith('https://')));
    assert.equal(new Set(sources).size, sources.length);
  }
}

async function main() {
  validateReview();
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  if (args.includes('--check')) {
    console.log('PASS two fixed brand-scope records, evidence boundaries and monitor decisions');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const results = [];
    for (const item of review.records) {
      const select = `SELECT *,next_review_date::text AS next_review_date_text,
        to_jsonb(t)-'page_quality_status'-'next_review_date'-'updated_at' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const before = (
        await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [item.id, item.slug])
      ).rows[0];
      assert(before, `${item.slug}: fixed production record is missing`);
      assert.equal(before.status, 'published', `${item.slug}: publication state changed`);
      assert.equal(before.url, item.currentOfficialUrl, `${item.slug}: official URL changed; review instead of overwriting`);
      assert(
        ['continue_index', 'monitor'].includes(before.page_quality_status),
        `${item.slug}: unexpected quality state`,
      );
      const beforeDecision = getToolIndexDecision(indexInput(before));
      const expectedDecision = getToolIndexDecision(indexInput(before, 'monitor'));
      assert.equal(expectedDecision.indexable, false);
      assert.equal(expectedDecision.reason, 'indexing_paused');
      const alreadyApplied =
        before.page_quality_status === 'monitor' && before.next_review_date_text === review.nextReviewDate;

      if (!args.includes('--status') && !alreadyApplied) {
        const updated = await client.query(
          `UPDATE public.tools
              SET page_quality_status='monitor',next_review_date=$2::date,updated_at=now()
            WHERE id=$1`,
          [item.id, review.nextReviewDate],
        );
        assert.equal(updated.rowCount, 1, `${item.slug}: expected one updated row`);
      }

      const after = (await client.query(select, [item.id, item.slug])).rows[0];
      assert.deepEqual(after.stable, before.stable, `${item.slug}: protected fields changed`);
      if (!args.includes('--status')) {
        assert.equal(after.page_quality_status, 'monitor');
        assert.equal(after.next_review_date_text, review.nextReviewDate);
        assert.equal(getToolIndexDecision(indexInput(after)).indexable, false);
      }
      results.push({
        slug: item.slug,
        alreadyApplied,
        beforeReason: beforeDecision.reason,
        afterReason: args.includes('--status') ? beforeDecision.reason : 'indexing_paused',
        nextReviewDate: args.includes('--status') ? before.next_review_date_text : review.nextReviewDate,
      });
    }
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          reviewedAt: review.reviewedAt,
          gscEvidence: review.gscEvidence,
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
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

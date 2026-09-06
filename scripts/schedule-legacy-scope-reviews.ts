import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const nextReviewDate = '2026-09-11';
const records = [
  ['eca3ba76-9e1c-449d-bfa8-43e1a390d681', 'adobe'],
  ['44dd71ec-57fb-4d1b-b702-002693fb7c36', 'salesforce_einstein'],
] as const;

function indexInput(row: Record<string, unknown>) {
  return {
    status: row.status as string | null,
    pageQualityStatus: row.page_quality_status as string | null,
    categoryId: row.category_id as string | null,
    imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    content: row.content,
    detail: row.detail,
    pricing: row.pricing as string | null,
    tags: row.tags as string[] | null,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)),
    'Use --check, --status or --commit; default rolls back.',
  );
  assert.match(nextReviewDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Set(records.map(([, slug]) => slug)).size, records.length);
  if (args.includes('--check')) {
    console.log('PASS two fixed legacy scope records and explicit review date');
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
    for (const [id, slug] of records) {
      const select = `SELECT *, next_review_date::text AS next_review_date_text,
        to_jsonb(t)-'next_review_date' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id, slug]))
        .rows[0];
      assert(before, `${slug}: fixed record missing`);
      assert.equal(before.status, 'published', `${slug}: unexpected publication state`);
      assert.equal(before.page_quality_status, 'continue_index', `${slug}: unexpected index review state`);
      const beforeIndexDecision = getToolIndexDecision(indexInput(before));

      if (!args.includes('--status')) {
        const updated = await client.query(
          `UPDATE public.tools SET next_review_date=$2::date
          WHERE id=$1 AND next_review_date IS DISTINCT FROM $2::date`,
          [id, nextReviewDate],
        );
        assert(updated.rowCount === 0 || updated.rowCount === 1, `${slug}: unexpected update count`);
        assert.equal(
          (
            await client.query(
              `UPDATE public.tools SET next_review_date=$2::date
              WHERE id=$1 AND next_review_date IS DISTINCT FROM $2::date`,
              [id, nextReviewDate],
            )
          ).rowCount,
          0,
          `${slug}: repeated application must be idempotent`,
        );
      }

      const after = (await client.query(select, [id, slug])).rows[0];
      assert.deepEqual(after.stable, before.stable, `${slug}: only next_review_date may change`);
      assert.equal(after.next_review_date_text, nextReviewDate, `${slug}: review date not applied`);
      assert.deepEqual(getToolIndexDecision(indexInput(after)), beforeIndexDecision, `${slug}: index decision changed`);
      results.push({
        slug,
        nextReviewDate: after.next_review_date_text,
        indexable: beforeIndexDecision.indexable,
        contentStatusAndIndexUnchanged: true,
      });
    }

    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          reason: 'Schedule URL-level evidence review without claiming editorial or market verification.',
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

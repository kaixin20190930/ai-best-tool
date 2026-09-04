import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import TOOL_MAINTENANCE_REVIEWS from '../lib/config/toolMaintenanceReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.length <= 1 && args.every((arg) => ['--commit', '--status'].includes(arg)),
    'Use --commit or --status; default rolls back.',
  );
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const results = [];
    for (const [slug, review] of Object.entries(TOOL_MAINTENANCE_REVIEWS)) {
      const { id, ...record } = review;
      const select = `SELECT features, next_review_date::text AS next_review_date,
        to_jsonb(t)-'features'-'next_review_date'-'updated_at' AS stable FROM public.tools t WHERE id=$1 AND name=$2`;
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id, slug]))
        .rows[0];
      assert(
        before && before.stable.status === 'published' && before.stable.page_quality_status === 'monitor',
        `${slug}: expected published monitor row`,
      );
      assert(
        before.features && typeof before.features === 'object' && !Array.isArray(before.features),
        `${slug}: invalid features`,
      );
      if (!args.includes('--status')) {
        await client.query(
          `UPDATE public.tools SET features=jsonb_set(features,'{maintenanceReview}',$2::jsonb),
          next_review_date=$3::date,updated_at=now() WHERE id=$1
          AND (features->'maintenanceReview' IS DISTINCT FROM $2::jsonb OR next_review_date IS DISTINCT FROM $3::date)`,
          [id, JSON.stringify(record), review.nextReviewDate],
        );
      }
      const after = (await client.query(select, [id, slug])).rows[0];
      assert.deepEqual(after.stable, before.stable, 'Content and index fields must not change');
      assert.deepEqual(
        after.features,
        { ...before.features, maintenanceReview: record },
        'Only scoped review metadata may change',
      );
      assert.equal(after.next_review_date, review.nextReviewDate);
      results.push({
        slug,
        nextReviewDate: after.next_review_date,
        status: after.stable.page_quality_status,
        editorialDate: after.features.editorial?.reviewedAt,
        marketDate: after.features.marketValidation?.reviewedAt,
      });
    }
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', results }, null, 2));
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

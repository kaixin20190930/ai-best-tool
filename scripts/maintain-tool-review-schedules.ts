import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { buildIntelligenceReviewSchedule } from '../lib/services/intelligence/reviewSchedule';

const id = '6f62a262-3cb3-4201-9127-b1c4eda6438f';
const reviewedAt = '2026-09-01T00:00:00.000Z';

function proposedDate(basis: string | null, existing: string | null) {
  if (existing) return existing;
  return buildIntelligenceReviewSchedule({ lastVerifiedAt: basis })[0].dueAt?.slice(0, 10) || null;
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.length <= 1 && args.every((arg) => ['--test', '--inventory', '--commit', '--status'].includes(arg)),
    'Use --test, --inventory, --commit or --status; default rolls back.',
  );
  if (args.includes('--test')) {
    assert.equal(proposedDate(reviewedAt, null), '2026-10-01');
    assert.equal(proposedDate(reviewedAt, '2026-09-07'), '2026-09-07');
    assert.equal(proposedDate(null, null), null);
    assert.equal(proposedDate('invalid', null), null);
    assert.equal(proposedDate('2024-02-01T00:00:00.000Z', null), '2024-03-02');
    console.log('PASS existing 30-day cadence, explicit-date preservation, missing/invalid evidence and leap year');
    return;
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    if (args.includes('--inventory')) {
      const rows = (
        await client.query(`SELECT name, features #>> '{editorial,reviewedAt}' AS reviewed_at,
        features #>> '{editorial,sourceUrl}' AS source_url, features #>> '{marketValidation,verdict}' AS market_verdict
        FROM public.tools WHERE status='published' AND next_review_date IS NULL ORDER BY name`)
      ).rows;
      console.log(
        JSON.stringify(
          {
            missingSchedule: rows.length,
            rows,
            warning: 'Database fields only; page-level evidence has not been audited by this inventory.',
          },
          null,
          2,
        ),
      );
      await client.query('ROLLBACK');
      return;
    }
    const select = `SELECT next_review_date::text AS next_review_date,
      to_jsonb(t)-'next_review_date'-'updated_at' AS stable FROM public.tools t WHERE id=$1 AND name='emdash'`;
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id])).rows[0];
    assert(
      before && before.stable.status === 'published' && before.stable.page_quality_status === 'continue_index',
      'Unexpected Emdash entity or index state',
    );
    assert.equal(
      before.stable.features.editorial.reviewedAt,
      reviewedAt,
      'Review basis changed; reassess rather than overwrite',
    );
    assert.equal(before.stable.features.editorial.sourceUrl, 'https://emdash.com/');
    const dueDate = proposedDate(reviewedAt, before.next_review_date);
    assert(dueDate);
    if (!args.includes('--status')) {
      const updated = await client.query(
        `UPDATE public.tools SET next_review_date=$2::date,updated_at=now()
        WHERE id=$1 AND next_review_date IS NULL`,
        [id, dueDate],
      );
      assert.equal(updated.rowCount, before.next_review_date ? 0 : 1);
      // A second application must neither move the date nor refresh updated_at.
      assert.equal(
        (
          await client.query(
            `UPDATE public.tools SET next_review_date=$2::date,updated_at=now()
        WHERE id=$1 AND next_review_date IS NULL`,
            [id, dueDate],
          )
        ).rowCount,
        0,
      );
    }
    const after = (await client.query(select, [id])).rows[0];
    assert.deepEqual(after.stable, before.stable, 'No content, evidence, index or other tool field may change');
    assert.equal(after.next_review_date, dueDate);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          tool: 'emdash',
          basis: reviewedAt,
          nextReviewDate: after.next_review_date,
          evidenceAndIndexUnchanged: true,
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

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

// Applied migrations are corroborated by the dated execution record in the
// four-week plan and the September 2 index-policy snapshot, not created_at alone.
const slugs = [
  'fathom',
  'gamma',
  'consensus',
  'runway',
  'luma-ai',
  'pipedream',
  'cursor',
  'the-graph',
  'perplexity',
  'make',
];

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.length <= 1 && args.every((arg) => arg === '--commit'),
    'Default is rollback; only --commit is supported.',
  );
  const manifest = slugs.map((slug) => {
    const path = `db/supabase/migrations/20260901_migrate_${slug.replaceAll('-', '_')}_tool.sql`;
    const sql = fs.readFileSync(path, 'utf8');
    const id = sql.match(/target_id uuid := '([a-f0-9-]{36})'/)?.[1];
    assert(
      id && sql.includes(`'${slug}'`) && sql.includes("'continue_index'") && sql.includes('INSERT INTO public.tools'),
      `Unexpected historical migration: ${path}`,
    );
    return { slug, id, path };
  });
  assert.equal(new Set(manifest.map((entry) => entry.id)).size, 10);
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query('LOCK TABLE public.tools IN SHARE ROW EXCLUSIVE MODE');
    const policy = (
      await client.query('SELECT paused FROM public.tool_index_release_policy WHERE singleton FOR UPDATE')
    ).rows[0];
    assert.equal(policy?.paused, true, 'History reconciliation must not run with approvals enabled');
    const snapshot = async () =>
      (
        await client.query(
          "SELECT md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY id), '')) AS hash FROM public.tools t",
        )
      ).rows[0].hash;
    const before = await snapshot();
    const rows = (
      await client.query(
        `SELECT id, name, status, page_quality_status,
        (created_at AT TIME ZONE 'Asia/Shanghai')::date::text AS created_day
        FROM public.tools WHERE id=ANY($1::uuid[])`,
        [manifest.map((entry) => entry.id)],
      )
    ).rows;
    for (const entry of manifest) {
      const row = rows.find((item) => item.id === entry.id && item.name === entry.slug);
      assert(row, `Missing historical entity: ${entry.slug}`);
      assert.equal(row.created_day, '2026-09-01', `Historical date needs manual review: ${entry.slug}`);
    }
    // Batch reads/writes keep the production lock short even on a remote connection.
    const events = manifest.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      key: `observed:2026-09-01:${entry.id}`,
      source: `${entry.path}; FOUR_WEEK_EVIDENCE_LED_DIRECTORY_PLAN_CN execution record; TOOL_INDEX_RELEASE_POLICY_CN 2026-09-02 snapshot`,
    }));
    const insert = `INSERT INTO public.tool_index_release_log(tool_id,tool_slug,entry_type,release_day,event_key,source)
      SELECT id,slug,'historical_observed',DATE '2026-09-01',key,source
      FROM jsonb_to_recordset($1::jsonb) AS e(id uuid,slug text,key text,source text) ON CONFLICT(event_key) DO NOTHING`;
    await client.query(insert, [JSON.stringify(events)]);
    assert.equal(
      (await client.query(insert, [JSON.stringify(events)])).rowCount,
      0,
      'Repeated reconciliation must not duplicate history',
    );
    const savedRows = (
      await client.query(
        'SELECT tool_id,tool_slug,entry_type,release_day::text FROM public.tool_index_release_log WHERE event_key=ANY($1::text[])',
        [events.map((entry) => entry.key)],
      )
    ).rows;
    assert.equal(savedRows.length, 10);
    for (const entry of manifest) {
      const saved = savedRows.find((row) => row.tool_id === entry.id);
      assert.deepEqual(saved, {
        tool_id: entry.id,
        tool_slug: entry.slug,
        entry_type: 'historical_observed',
        release_day: '2026-09-01',
      });
    }
    assert.equal(await snapshot(), before, 'Reconciliation must not alter tools');
    const days = (
      await client.query(`SELECT release_day::text, count(*)::int AS approvals
      FROM public.tool_index_release_log WHERE release_day BETWEEN DATE '2026-08-31' AND DATE '2026-09-06'
      AND entry_type <> 'baseline' GROUP BY release_day ORDER BY release_day`)
    ).rows;
    const knownWeekApprovals = days.reduce((sum, day) => sum + day.approvals, 0);
    assert(knownWeekApprovals >= 12, 'Expected ten corroborated migrations plus two September 4 releases');
    assert.equal(
      (await client.query('SELECT paused FROM public.tool_index_release_policy WHERE singleton')).rows[0].paused,
      true,
    );
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          committed: args.includes('--commit'),
          days,
          knownWeekApprovals,
          remainingWeekQuota: 0,
          paused: true,
          toolRowsUnchanged: true,
          unknownHistoryNotInferred: true,
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

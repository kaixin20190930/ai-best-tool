import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.every((arg) => ['--commit', '--status'].includes(arg)),
    'Use --commit or --status; default is rollback.',
  );
  assert(args.length <= 1, 'Choose one mode only.');
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    if (!args.includes('--status')) {
      // Prevent concurrent tool mutations while comparing the migration snapshot.
      await client.query('LOCK TABLE public.tools IN SHARE ROW EXCLUSIVE MODE');
      const snapshotSql =
        "SELECT md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY id), '')) AS hash FROM public.tools t";
      const before = (await client.query(snapshotSql)).rows[0].hash;
      await client.query(fs.readFileSync('db/neon/20260904_tool_index_release_guard.sql', 'utf8'));
      assert.equal((await client.query(snapshotSql)).rows[0].hash, before, 'Migration must not change any tool row');
    }
    const policy = (
      await client.query(
        'SELECT paused, daily_limit, weekly_limit, pause_reason FROM public.tool_index_release_policy WHERE singleton',
      )
    ).rows[0];
    assert(policy, 'Missing release policy');
    const trigger = (
      await client.query(
        "SELECT tgenabled FROM pg_trigger WHERE tgrelid='public.tools'::regclass AND tgname='tool_index_release_guard'",
      )
    ).rows[0];
    assert.equal(trigger?.tgenabled, 'O', 'Release trigger must be enabled');
    const ledger = (
      await client.query(
        'SELECT entry_type, count(*)::int AS count FROM public.tool_index_release_log GROUP BY entry_type ORDER BY entry_type',
      )
    ).rows;
    const result = { success: true, mode: args[0] || 'dry-run-rollback', policy, ledger, triggerEnabled: true };
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify(result, null, 2));
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

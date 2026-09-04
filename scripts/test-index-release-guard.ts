import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

async function main() {
  config({ path: '.env.local', quiet: true });
  const connectionString = getDatabaseConnectionString();
  const a = new Client({ connectionString });
  const b = new Client({ connectionString });
  const schema = `index_guard_test_${randomUUID().replaceAll('-', '')}`;
  const q = `"${schema}"`;
  const migration = fs
    .readFileSync('db/neon/20260904_tool_index_release_guard.sql', 'utf8')
    .replaceAll('public.', `${q}.`);
  await a.connect();
  await b.connect();
  try {
    // Isolated, randomly named schema: never modifies production tools or policy.
    await a.query(`CREATE SCHEMA ${q}`);
    await a.query(
      `CREATE TABLE ${q}.tools (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, status text, page_quality_status text DEFAULT 'monitor')`,
    );
    await a.query(
      `INSERT INTO ${q}.tools(name,status,page_quality_status) VALUES ('baseline','published','continue_index')`,
    );
    await a.query(migration);
    const insert = (client: Client, name: string, quality = 'continue_index', status = 'published') =>
      client.query(`INSERT INTO ${q}.tools(name,status,page_quality_status) VALUES ($1,$2,$3)`, [
        name,
        status,
        quality,
      ]);
    const count = async () =>
      Number(
        (await a.query(`SELECT count(*) FROM ${q}.tool_index_release_log WHERE entry_type='approval'`)).rows[0].count,
      );
    const reset = async () => {
      await a.query(`DELETE FROM ${q}.tools WHERE name <> 'baseline'`);
      await a.query(`DELETE FROM ${q}.tool_index_release_log WHERE entry_type <> 'baseline'`);
      await a.query(`UPDATE ${q}.tool_index_release_policy SET paused=false`);
    };
    await assert.rejects(insert(a, 'paused'), /INDEX_RELEASE_PAUSED/);
    await insert(a, 'public-monitor', 'monitor');
    await a.query(`UPDATE ${q}.tools SET name=name, page_quality_status='continue_index' WHERE name='baseline'`);
    assert.equal(await count(), 0);
    await a.query(migration);
    assert.equal(
      (await a.query(`SELECT count(*)::int AS n FROM ${q}.tool_index_release_log WHERE entry_type='baseline'`)).rows[0]
        .n,
      1,
    );
    console.log('PASS: paused approvals blocked; monitor publication and existing edits allowed; migration idempotent');

    await reset();
    await insert(a, 'first');
    await assert.rejects(insert(a, 'second'), /INDEX_RELEASE_DAILY_LIMIT/);
    assert.equal(await count(), 1);
    await a.query(`UPDATE ${q}.tools SET page_quality_status='monitor' WHERE name='first'`);
    await assert.rejects(
      a.query(`UPDATE ${q}.tools SET page_quality_status='continue_index' WHERE name='first'`),
      /INDEX_RELEASE_DAILY_LIMIT/,
    );
    console.log('PASS: daily limit and downgrade/reapprove bypass blocked');

    await reset();
    await a.query(`INSERT INTO ${q}.tool_index_release_log(tool_id,tool_slug,entry_type,release_day,source)
      SELECT gen_random_uuid(),'history','historical_observed', (clock_timestamp() AT TIME ZONE 'Asia/Shanghai')::date,'test' FROM generate_series(1,5)`);
    await assert.rejects(insert(a, 'weekly'), /INDEX_RELEASE_WEEKLY_LIMIT/);
    console.log('PASS: historical approvals count toward weekly limit');

    await reset();
    await assert.rejects(
      a.query(
        `INSERT INTO ${q}.tools(name,status,page_quality_status) VALUES ('bulk-a','published','continue_index'),('bulk-b','published','continue_index')`,
      ),
      /INDEX_RELEASE_DAILY_LIMIT/,
    );
    assert.equal(await count(), 0);
    assert.equal((await a.query(`SELECT count(*)::int AS n FROM ${q}.tools WHERE name LIKE 'bulk-%'`)).rows[0].n, 0);
    await a.query(`INSERT INTO ${q}.tools SELECT * FROM ${q}.tools WHERE name='baseline' ON CONFLICT(id) DO NOTHING`);
    assert.equal(await count(), 0);
    console.log('PASS: failed bulk write and ledger roll back together; ignored insert does not consume quota');

    await reset();
    await insert(a, 'draft', 'continue_index', 'draft');
    await a.query(`UPDATE ${q}.tool_index_release_policy SET paused=true`);
    await assert.rejects(
      a.query(`UPDATE ${q}.tools SET status='published' WHERE name='draft'`),
      /INDEX_RELEASE_PAUSED/,
    );
    console.log('PASS: publishing an already-approved draft cannot bypass guard');

    for (const isolation of ['READ COMMITTED', 'REPEATABLE READ']) {
      await reset();
      await b.query(`BEGIN ISOLATION LEVEL ${isolation}`);
      await b.query(`SELECT count(*) FROM ${q}.tool_index_release_log`);
      await a.query('BEGIN');
      await insert(a, 'race-a');
      await b.query("SET LOCAL lock_timeout = '5s'");
      const pending = insert(b, 'race-b').then(
        () => null,
        (error: Error & { code?: string }) => error,
      );
      await delay(100);
      await a.query('COMMIT');
      const error = await pending;
      assert(error, 'Second concurrent approval must fail');
      if (isolation === 'READ COMMITTED') assert.match(error.message, /INDEX_RELEASE_DAILY_LIMIT/);
      else assert.equal(error.code, '40001');
      await b.query('ROLLBACK');
      assert.equal(await count(), 1);
      console.log(`PASS: concurrent ${isolation} approvals cannot exceed quota`);
    }
  } finally {
    await a.query('ROLLBACK');
    await b.query('ROLLBACK');
    await a.query(`DROP SCHEMA IF EXISTS ${q} CASCADE`);
    await b.end();
    await a.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

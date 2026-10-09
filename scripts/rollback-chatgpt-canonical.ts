import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import {
  CHATGPT_CANONICAL_ID,
  assertChatgptProtectedStateUnchanged,
  findChatgptIdentityMatches,
  readChatgptProtectedState,
} from './chatgpt-canonical-guard';

const payload = JSON.parse(fs.readFileSync('data/collection/chatgpt-release.json', 'utf8'));
const commit = process.argv.includes('--commit');
assert(process.argv.every((arg) => !arg.startsWith('--') || arg === '--commit'), 'Unsupported rollback option');

async function openDatabase() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  return client;
}

async function assertNoDependentRows(client: Client) {
  const references = await client.query(
    `SELECT n.nspname AS schema_name, t.relname AS table_name, a.attname AS column_name,
            cardinality(c.conkey) AS key_columns
       FROM pg_constraint c
       JOIN pg_class t ON t.oid=c.conrelid
       JOIN pg_namespace n ON n.oid=t.relnamespace
       JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1]
      WHERE c.contype='f' AND c.confrelid='public.tools'::regclass`,
  );
  for (const row of references.rows) {
    assert.equal(row.key_columns, 1, `Composite dependent key in ${row.schema_name}.${row.table_name}`);
    const table = `"${String(row.schema_name).replaceAll('"', '""')}"."${String(row.table_name).replaceAll('"', '""')}"`;
    const column = `"${String(row.column_name).replaceAll('"', '""')}"`;
    const count = await client.query(`SELECT count(*)::int AS n FROM ${table} WHERE ${column}=$1`, [CHATGPT_CANONICAL_ID]);
    assert.equal(count.rows[0].n, 0, `${row.schema_name}.${row.table_name} has ChatGPT dependent rows`);
  }
}

async function main() {
  const client = await openDatabase();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['directory:chatgpt']);
    const protectedBefore = await readChatgptProtectedState(client);
    const matches = await findChatgptIdentityMatches(client);
    assert.equal(matches.rowCount, 1, 'Rollback requires exactly one ChatGPT identity');
    assert.equal(matches.rows[0].id, CHATGPT_CANONICAL_ID);
    assert.equal(matches.rows[0].name, 'chatgpt');
    assert.equal(matches.rows[0].status, 'published');
    assert.equal(matches.rows[0].page_quality_status, 'monitor');
    const row = await client.query(
      `SELECT t.title,t.content,t.detail,t.features,t.use_cases,t.url,t.image_url,t.thumbnail_url,
              t.pricing,t.tags,t.category_id,t.next_review_date::text AS next_review_date,c.slug AS category_slug
         FROM public.tools t JOIN public.categories c ON c.id=t.category_id WHERE t.id=$1 FOR UPDATE OF t`,
      [CHATGPT_CANONICAL_ID],
    );
    assert.equal(row.rowCount, 1);
    for (const key of ['title', 'content', 'detail', 'features', 'use_cases', 'url', 'image_url', 'thumbnail_url', 'pricing', 'tags', 'next_review_date', 'category_slug'] as const) {
      const expected = ({ ...payload, url: payload.officialUrl, use_cases: payload.useCases, image_url: payload.imageUrl, thumbnail_url: payload.thumbnailUrl, next_review_date: payload.nextReviewDate, category_slug: payload.categorySlug } as Record<string, unknown>)[key];
      assert.deepEqual(row.rows[0][key], expected, `ChatGPT ${key} changed; manual reconciliation required`);
    }
    await assertNoDependentRows(client);
    const deleted = await client.query('DELETE FROM public.tools WHERE id=$1 AND name=$2 RETURNING id', [CHATGPT_CANONICAL_ID, 'chatgpt']);
    assert.equal(deleted.rowCount, 1, 'Rollback must delete one candidate row');
    assertChatgptProtectedStateUnchanged(protectedBefore, await readChatgptProtectedState(client));
    await client.query(commit ? 'COMMIT' : 'ROLLBACK');
    const readback = await openDatabase();
    try {
      await readback.query('BEGIN READ ONLY');
      const found = await findChatgptIdentityMatches(readback);
      assert.equal(found.rowCount, commit ? 0 : 1, 'Rollback fresh-connection readback differs');
      assertChatgptProtectedStateUnchanged(protectedBefore, await readChatgptProtectedState(readback));
      await readback.query('ROLLBACK');
    } finally { await readback.end(); }
    console.log(`✅ ChatGPT rollback ${commit ? 'committed' : 'dry run rolled back'}; protected rows unchanged`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });

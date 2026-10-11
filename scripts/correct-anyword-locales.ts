import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

config({ path: '.env.local', quiet: true });

const ID = '4555627d-2de9-4614-a850-fa073388f869';
const PRE_MD5 = 'c28bd4dda38fdfb6eeb7965512b47a7d';
const POST_MD5 = '9283fee0c6acc144162f49e7c81db67b';
const PROTECTED_MD5 = 'd4d319fccdc5545755043504b8fe5a14';
const localizedFields = ['title', 'content', 'detail', 'use_cases', 'features'] as const;
const payload = JSON.parse(fs.readFileSync('data/collection/anyword-release.json', 'utf8'));

function oldLocales(current: Record<string, unknown>) {
  assert.deepEqual(Object.keys(current).sort(), ['cn', 'en', 'tw']);
  return { en: current.en, zh: current.cn, cn: current.tw };
}

function oldFeatures(current: Record<string, any>) {
  const old = structuredClone(current);
  old.audience.bestFit = oldLocales(current.audience.bestFit);
  old.audience.notIdealFor = oldLocales(current.audience.notIdealFor);
  old.editorial.trustNote = oldLocales(current.editorial.trustNote);
  return old;
}

function desiredFields() {
  assert.equal(payload.id, ID);
  return {
    title: payload.title,
    content: payload.content,
    detail: payload.detail,
    use_cases: payload.useCases,
    features: payload.features,
  };
}

function originalFields(desired: ReturnType<typeof desiredFields>) {
  return {
    title: oldLocales(desired.title),
    content: oldLocales(desired.content),
    detail: oldLocales(desired.detail),
    use_cases: oldLocales(desired.use_cases),
    features: oldFeatures(desired.features),
  };
}

function selectFields(row: Record<string, any>) {
  return Object.fromEntries(localizedFields.map((field) => [field, row[field]]));
}

function assertProtected(before: Record<string, any>, after: Record<string, any>) {
  const strip = (row: Record<string, any>) =>
    Object.fromEntries(Object.entries(row).filter(([field]) => !localizedFields.includes(field as any)));
  assert.deepEqual(strip(after), strip(before), 'protected fields changed');
}

async function readRow(db: Client, lock: boolean) {
  const result = await db.query(
    `SELECT to_jsonb(t) AS row, md5(to_jsonb(t)::text) AS row_md5,
            md5((to_jsonb(t) - ARRAY['title','content','detail','use_cases','features'])::text) AS protected_md5
       FROM tools t WHERE id = $1${lock ? ' FOR UPDATE' : ''}`,
    [ID],
  );
  assert.equal(result.rowCount, 1, 'fixed Anyword row missing');
  return result.rows[0] as { row: Record<string, any>; row_md5: string; protected_md5: string };
}

async function main() {
  const args = process.argv.slice(2);
  assert(args.every((arg) => ['--preflight', '--postcheck', '--commit'].includes(arg)), 'unknown option');
  assert(args.length <= 1, 'choose one mode');
  const mode = args[0] === '--preflight' ? 'preflight' : args[0] === '--postcheck' ? 'postcheck' : args[0] === '--commit' ? 'commit' : 'rollback';
  const desired = desiredFields();
  const original = originalFields(desired);
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let beforeMd5 = '';
  let afterMd5 = '';
  let alreadyApplied = false;
  try {
    await db.query(mode === 'preflight' || mode === 'postcheck' ? 'BEGIN READ ONLY' : 'BEGIN');
    const current = await readRow(db, mode === 'commit' || mode === 'rollback');
    beforeMd5 = current.row_md5;
    assert.equal(current.protected_md5, PROTECTED_MD5, 'protected production preimage changed');
    assert.equal(current.row.id, ID);
    assert.equal(current.row.name, 'anyword');
    assert.equal(current.row.url, 'https://www.anyword.com/');
    assert.equal(current.row.status, 'published');
    assert.equal(current.row.page_quality_status, 'monitor');

    alreadyApplied = localizedFields.every((field) => isDeepStrictEqual(current.row[field], desired[field]));
    if (alreadyApplied) {
      assert.notEqual(mode, 'preflight', 'correction already applied');
      assert.equal(beforeMd5, POST_MD5, 'corrected Anyword afterimage changed');
      afterMd5 = beforeMd5;
    } else {
      assert.notEqual(mode, 'postcheck', 'correction has not been applied');
      assert.equal(beforeMd5, PRE_MD5, 'exact Anyword row preimage changed');
      assert.deepEqual(selectFields(current.row), original, 'localized preimage differs from released payload');
      if (mode === 'preflight') {
        afterMd5 = beforeMd5;
      } else {
        const update = await db.query(
          `UPDATE tools t SET title=$2::jsonb, content=$3::jsonb, detail=$4::jsonb,
                  use_cases=$5::jsonb, features=$6::jsonb
            WHERE id=$1 AND md5(to_jsonb(t)::text)=$7
            RETURNING to_jsonb(t) AS row, md5(to_jsonb(t)::text) AS row_md5`,
          [ID, ...localizedFields.map((field) => JSON.stringify(desired[field])), PRE_MD5],
        );
        assert.equal(update.rowCount, 1, 'concurrent Anyword edit or duplicate update');
        const after = update.rows[0].row as Record<string, any>;
        assert.deepEqual(selectFields(after), desired, 'corrected locale afterimage mismatch');
        assertProtected(current.row, after);
        afterMd5 = update.rows[0].row_md5;
        assert.equal(afterMd5, POST_MD5, 'corrected Anyword row hash mismatch');
      }
    }
    if (mode === 'commit' && !alreadyApplied) await db.query('COMMIT');
    else await db.query('ROLLBACK');
  } catch (error) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await db.end();
  }

  if (mode === 'rollback') {
    const verify = new Client({ connectionString: getDatabaseConnectionString() });
    await verify.connect();
    try {
      await verify.query('BEGIN READ ONLY');
      const persisted = await readRow(verify, false);
      assert.equal(persisted.row_md5, beforeMd5, 'rollback changed production row');
      await verify.query('ROLLBACK');
    } finally {
      await verify.end();
    }
  }
  console.log(JSON.stringify({ mode, id: ID, preimageMd5: beforeMd5, afterimageMd5: afterMd5, protectedMd5: PROTECTED_MD5, alreadyApplied, productionWrites: mode === 'commit' && !alreadyApplied ? 1 : 0 }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

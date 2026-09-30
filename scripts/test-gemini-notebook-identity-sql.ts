import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

const forward = readFileSync('db/neon/20261001_owner_gemini_notebook_identity.sql', 'utf8');
const rollback = readFileSync('db/neon/20261001_owner_gemini_notebook_identity_rollback.sql', 'utf8');
const id = 'cec78907-e2a1-4eb7-853a-a58334026280';
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

for (const sql of [forward, rollback]) {
  assert.match(sql, /^BEGIN;/m);
  assert.match(sql, /^ROLLBACK;\s*$/m);
  assert.doesNotMatch(sql, /^COMMIT;/m);
  assert.doesNotMatch(sql, /CREATE\s+(?:UNLOGGED\s+)?TABLE/i);
  assert.doesNotMatch(
    sql,
    /(?:INSERT|UPDATE|DELETE)\s+(?:public\.)?(?:product_intelligence|tool_capabilities|tool_task_fits)/i,
  );
  assert.match(sql, /GET DIAGNOSTICS v_count = ROW_COUNT/);
  assert.match(sql, /md5\(to_jsonb\(/);
}
assert.match(forward, /Ultra 20 TB 500 and Ultra 30 TB 600/);
assert.match(forward, /Ultra 20 TB 500、Ultra 30 TB 600/);
assert.match(forward, /v_old\.features \|\| jsonb_build_object/);
assert.match(rollback, /v_snapshot->'detail'/);

async function main() {
  const workDir = mkdtempSync(join(tmpdir(), 'gemini-identity-pg-'));
  const port = 54000 + Math.floor(Math.random() * 10000);
  let started = false;
  const client = new Client({ host: workDir, port, user: 'postgres', database: 'postgres' });
  try {
    execFileSync('initdb', ['-A', 'trust', '-U', 'postgres', '-D', workDir], { stdio: 'ignore' });
    execFileSync('pg_ctl', ['-D', workDir, '-o', `-F -p ${port} -k ${workDir}`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    await client.connect();
    await client.query(`CREATE TABLE tools (
    id uuid PRIMARY KEY, name text UNIQUE NOT NULL, title jsonb NOT NULL, content jsonb NOT NULL,
    detail jsonb NOT NULL, url text NOT NULL, features jsonb NOT NULL, status text NOT NULL,
    page_quality_status text NOT NULL, next_review_date date, updated_at timestamptz NOT NULL,
    unrelated text NOT NULL DEFAULT 'untouched'
  )`);
    const title = {
      en: 'NotebookLM Source-Grounded Research',
      cn: 'NotebookLM 资料锚定研究',
      zh: 'NotebookLM 资料锚定研究',
      tw: 'NotebookLM 资料锚定研究',
    };
    const features = {
      unrelated: { shouldRemain: true },
      editorial: {
        reviewedAt: '2026-09-06',
        sourceUrl: 'https://support.google.com/notebooklm/answer/16164461?hl=en',
        trustNote: { en: 'Citation accuracy not independently tested.' },
      },
      trialTemplate: { targetOutcome: { en: 'Verify NotebookLM.' }, checks: ['keep'] },
      marketValidation: {
        score: 90,
        evidenceUrls: [
          'https://support.google.com/notebooklm/answer/16164461?hl=en',
          'https://example.org/independent',
        ],
      },
    };
    await client.query(
      `INSERT INTO tools (id,name,title,content,detail,url,features,status,page_quality_status,next_review_date,updated_at)
    VALUES ($1,'notebooklm',$2,'{}',$3,'https://notebooklm.google.com/',$4,'published','monitor','2026-09-20','2026-09-30T20:29:26.195266Z')`,
      [id, title, { en: 'NotebookLM' }, features],
    );
    const before = (
      await client.query(
        `SELECT updated_at::text AS at, md5(to_jsonb(t)::text) AS hash,
    jsonb_build_object('id',id,'name',name,'title',title,'url',url,'detail',detail,
      'features',features,'next_review_date',next_review_date,'updated_at',updated_at,
      'row_md5',md5(to_jsonb(t)::text)) AS snapshot FROM tools t WHERE id=$1`,
        [id],
      )
    ).rows[0];
    await client.query(forward);
    assert.equal(
      (await client.query('SELECT url FROM tools WHERE id=$1', [id])).rows[0].url,
      'https://notebooklm.google.com/',
      'default forward precheck wrote data',
    );
    await client.query(forward.replace(/ROLLBACK;\s*$/, 'COMMIT;'));
    assert.equal(
      (await client.query('SELECT url FROM tools WHERE id=$1', [id])).rows[0].url,
      'https://notebooklm.google.com/',
      'a COMMIT without Owner gates wrote data',
    );
    const gatedForward = forward
      .replace(
        "-- SET LOCAL app.gemini_notebook_expected_updated_at = '<exact verifier updatedAtUtc>';",
        `SET LOCAL app.gemini_notebook_expected_updated_at = ${quote(before.at)};`,
      )
      .replace(
        "-- SET LOCAL app.gemini_notebook_expected_row_md5 = '<exact verifier rowMd5>';",
        `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote(before.hash)};`,
      )
      .replace(
        "-- SET LOCAL app.gemini_notebook_owner_gate = 'I reviewed the private snapshot and approve this Neon identity update';",
        "SET LOCAL app.gemini_notebook_owner_gate = 'I reviewed the private snapshot and approve this Neon identity update';",
      )
      .replace(/ROLLBACK;\s*$/, 'COMMIT;');
    assert.match(gatedForward, /COMMIT;\s*$/);
    await assert.rejects(
      client.query(
        gatedForward.replace(
          `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote(before.hash)};`,
          `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote('0'.repeat(32))};`,
        ),
      ),
      /Snapshot timestamp\/hash changed/,
    );
    await client.query('ROLLBACK');
    assert.equal(
      (await client.query('SELECT url FROM tools WHERE id=$1', [id])).rows[0].url,
      'https://notebooklm.google.com/',
      'stale snapshot changed data',
    );
    await client.query(gatedForward);
    const after = (
      await client.query(
        `SELECT *, updated_at::text AS at, md5(to_jsonb(t)::text) AS hash
    FROM tools t WHERE id=$1`,
        [id],
      )
    ).rows[0];
    assert.equal(after.url, 'https://notebook.google.com/');
    assert.equal(after.features.unrelated.shouldRemain, true);
    assert.deepEqual(after.features.trialTemplate.checks, ['keep']);
    assert.equal(after.features.marketValidation.score, 90);
    assert.equal(after.features.identity.currentName, 'Gemini Notebook');
    assert.ok(after.detail.en.includes('Ultra 20 TB 500 and Ultra 30 TB 600'));
    assert.equal(after.name, 'notebooklm');
    assert.equal(after.page_quality_status, 'monitor');
    assert.equal(after.unrelated, 'untouched');
    const retry = gatedForward
      .replace(
        `SET LOCAL app.gemini_notebook_expected_updated_at = ${quote(before.at)};`,
        `SET LOCAL app.gemini_notebook_expected_updated_at = ${quote(after.at)};`,
      )
      .replace(
        `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote(before.hash)};`,
        `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote(after.hash)};`,
      );
    await client.query(retry);
    assert.equal(
      (await client.query('SELECT md5(to_jsonb(t)::text) AS hash FROM tools t WHERE id=$1', [id])).rows[0].hash,
      after.hash,
      'idempotent retry changed the row',
    );
    await client.query(rollback);
    assert.equal(
      (await client.query('SELECT url FROM tools WHERE id=$1', [id])).rows[0].url,
      'https://notebook.google.com/',
      'default rollback precheck wrote data',
    );
    await client.query(rollback.replace(/ROLLBACK;\s*$/, 'COMMIT;'));
    assert.equal(
      (await client.query('SELECT url FROM tools WHERE id=$1', [id])).rows[0].url,
      'https://notebook.google.com/',
      'a rollback COMMIT without Owner gates wrote data',
    );
    const gatedRollback = rollback
      .replace(
        "-- SELECT set_config('app.gemini_notebook_private_snapshot', $snapshot$<paste exact JSON snapshot>$snapshot$, true);",
        `SELECT set_config('app.gemini_notebook_private_snapshot', ${quote(JSON.stringify(before.snapshot))}, true);`,
      )
      .replace(
        "-- SET LOCAL app.gemini_notebook_expected_updated_at = '<exact identity verifier updatedAtUtc>';",
        `SET LOCAL app.gemini_notebook_expected_updated_at = ${quote(after.at)};`,
      )
      .replace(
        "-- SET LOCAL app.gemini_notebook_expected_row_md5 = '<exact identity verifier rowMd5>';",
        `SET LOCAL app.gemini_notebook_expected_row_md5 = ${quote(after.hash)};`,
      )
      .replace(
        "-- SET LOCAL app.gemini_notebook_rollback_gate = 'I reviewed the private snapshot and approve exact Neon identity rollback';",
        "SET LOCAL app.gemini_notebook_rollback_gate = 'I reviewed the private snapshot and approve exact Neon identity rollback';",
      )
      .replace(/ROLLBACK;\s*$/, 'COMMIT;');
    await client.query(gatedRollback);
    const restored = (await client.query('SELECT url, md5(to_jsonb(t)::text) AS hash FROM tools t WHERE id=$1', [id]))
      .rows[0];
    assert.equal(restored.url, 'https://notebooklm.google.com/');
    assert.equal(restored.hash, before.hash);
    console.log('PASS Gemini Notebook SQL static, default rollback, gated forward, exact rollback');
  } finally {
    await client.end().catch(() => undefined);
    if (started) execFileSync('pg_ctl', ['-D', workDir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Empty LOCAL PostgreSQL only. All fixture DDL and candidate writes roll back.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const sql = readFileSync('db/supabase/manual/20261006_meeting_notes_user_value_candidate.sql', 'utf8');
const manifest = JSON.parse(sql.split('$payload$')[1]);
const reviewer = '11111111-1111-4111-8111-111111111111';
const approved = sql.replace('v_reviewer uuid := NULL;', `v_reviewer uuid := '${reviewer}';`);
const client = new Client({ host: '127.0.0.1', port: 5432, database: 'postgres' });
async function main() {
  await client.connect();
  try {
    const tables = await client.query(
      "SELECT to_regclass('auth.users') AS a, to_regclass('public.decision_tasks') AS b",
    );
    assert.equal(tables.rows[0].a, null);
    assert.equal(tables.rows[0].b, null);
    await client.query('BEGIN');
    try {
      await client.query(`
        SET LOCAL TIME ZONE 'UTC';
        CREATE SCHEMA auth;
        CREATE TABLE auth.users (id uuid PRIMARY KEY);
        CREATE TABLE public.decision_tasks (id uuid PRIMARY KEY, slug text, status text);
        CREATE TABLE public.tool_task_fits (id uuid PRIMARY KEY, tool_id uuid, task_id uuid, fit_level text,
          rationale jsonb, required_conditions jsonb, disqualifiers jsonb, status text,
          updated_at timestamptz, reviewed_at timestamptz, review_due_at timestamptz, reviewed_by uuid,
          last_edited_by uuid, editorial_history jsonb DEFAULT '[]');
        CREATE TABLE public.product_intelligence_profiles (id uuid PRIMARY KEY, owner_type text, owner_id uuid);
        CREATE TABLE public.product_intelligence_claims (id uuid PRIMARY KEY, profile_id uuid, source_url text,
          claim_value jsonb, verified_at timestamptz, review_due_at timestamptz, source_type text,
          verification_status text, conflict_status text, invalidated_at timestamptz, expires_at timestamptz);
        CREATE TABLE public.tool_task_fit_claims (fit_id uuid, claim_id uuid);
      `);
      const history = readFileSync('db/supabase/migrations/20260925_decision_cluster_editorial_closure.sql', 'utf8');
      await client.query(
        history.slice(
          history.indexOf('CREATE OR REPLACE FUNCTION record_fit_editorial_change()'),
          history.indexOf('CREATE OR REPLACE FUNCTION lock_cl01_published_fit_evidence()'),
        ),
      );
      await client.query('INSERT INTO auth.users VALUES ($1)', [reviewer]);
      await client.query("INSERT INTO public.decision_tasks VALUES ($1, 'meeting-notes', 'active')", [
        manifest[0].before.task_id,
      ]);
      for (const entry of manifest) {
        await client.query(
          'INSERT INTO public.tool_task_fits SELECT * FROM jsonb_populate_record(NULL::public.tool_task_fits, $1)',
          [JSON.stringify(entry.before)],
        );
        await client.query("INSERT INTO public.product_intelligence_profiles VALUES ($1, 'tool', $2)", [
          entry.claims[0].profile_id,
          entry.before.tool_id,
        ]);
        for (const claim of entry.claims) {
          await client.query(
            'INSERT INTO public.product_intelligence_claims SELECT * FROM jsonb_populate_record(NULL::public.product_intelligence_claims, $1)',
            [
              JSON.stringify({
                ...claim,
                source_type: 'official',
                verification_status: 'verified',
                conflict_status: 'none',
              }),
            ],
          );
          await client.query('INSERT INTO public.tool_task_fit_claims VALUES ($1,$2)', [entry.before.id, claim.id]);
        }
      }
      const snapshot = async () =>
        (await client.query('SELECT to_jsonb(f) AS value FROM public.tool_task_fits f ORDER BY id')).rows;
      const initial = await snapshot();
      async function denied(command: string, pattern: RegExp, mutation?: string) {
        await client.query('SAVEPOINT test_case');
        if (mutation) await client.query(mutation);
        await assert.rejects(client.query(command), pattern);
        await client.query('ROLLBACK TO SAVEPOINT test_case');
        assert.deepEqual(await snapshot(), initial, 'atomic failure leaves all fits unchanged');
      }
      await denied(sql, /reviewer required/);
      await denied(
        approved,
        /snapshot drift/,
        `UPDATE public.tool_task_fits SET rationale = '{}' WHERE id = '${manifest[2].before.id}'`,
      );
      await denied(
        approved,
        /evidence changed/,
        `UPDATE public.product_intelligence_claims SET review_due_at = '2020-01-01' WHERE id = '${manifest[2].claims[0].id}'`,
      );
      await denied(
        approved,
        /evidence changed/,
        `UPDATE public.product_intelligence_profiles SET owner_id = '${reviewer}' WHERE id = '${manifest[2].claims[0].profile_id}'`,
      );
      await client.query("SET LOCAL TIME ZONE 'Asia/Shanghai'");
      await client.query(approved);
      for (const entry of manifest) {
        const row = (
          await client.query('SELECT to_jsonb(f) AS value FROM public.tool_task_fits f WHERE id = $1', [
            entry.before.id,
          ])
        ).rows[0].value;
        for (const key of ['rationale', 'required_conditions', 'disqualifiers'])
          assert.deepEqual(row[key], entry.after[key]);
        assert.equal(row.review_due_at, entry.before.review_due_at);
        assert.equal(row.status, entry.before.status);
        assert.equal(row.fit_level, entry.before.fit_level);
        assert.equal(row.last_edited_by, reviewer);
        assert.equal(row.editorial_history.length, 1);
      }
      await client.query('SAVEPOINT replay');
      await assert.rejects(client.query(approved), /snapshot drift/);
      await client.query('ROLLBACK TO SAVEPOINT replay');
      console.log(
        'MTN-UX-01 local SQL PASS: real execution, bilingual updates/history, atomic drift/stale/wrong-owner rejection, replay rejection.',
      );
    } finally {
      await client.query('ROLLBACK');
    }
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

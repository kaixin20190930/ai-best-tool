import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

// Local PostgreSQL only. The fixture and all export writes stay inside a
// transaction that is rolled back before this test exits.
const client = new Client({ host: '127.0.0.1', port: 5432, database: 'postgres' });
const exportSql = fs.readFileSync(
  path.join(process.cwd(), 'db/supabase/manual/20260923_seed_decision_graph_first_batch.sql'),
  'utf8',
);
const relations = [
  ['7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'fddb0da1-3fb5-4bad-9ad5-df543171985f'],
  ['b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'e54d8004-86ef-476d-addc-cb5215e94a5f'],
  ['57b270b9-78cf-41f8-8b74-dec46400cd65', '32e5934f-bc33-415c-9d98-e88529155855'],
  ['711df152-fdcf-4a19-930c-ab866b67605f', '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939'],
  ['f15873ae-c6ef-4f0a-b811-b40c2aba76ab', '363978e2-46d0-40fb-a344-42b61e19325c'],
  ['23bb3601-a5ac-42c3-bff3-64b06a063959', '806bedca-c1e4-4fd1-ae57-e4db06567e47'],
  ['f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e', '76cf5413-ce8c-424d-9a6b-21584758cf72'],
];

async function count(table: string): Promise<number> {
  const result = await client.query<{ count: string }>(`SELECT count(*) FROM public.${table}`);
  return Number(result.rows[0].count);
}

const auditedTables = [
  'decision_tasks',
  'decision_capabilities',
  'task_capabilities',
  'tool_capabilities',
  'tool_capability_claims',
  'tool_task_fits',
  'tool_task_fit_claims',
  'product_intelligence_profiles',
  'product_intelligence_claims',
] as const;

async function snapshotPublicTables(): Promise<Record<string, unknown[]>> {
  const snapshots = await Promise.all(
    auditedTables.map(async (table) => {
      const result = await client.query<{ value: unknown }>(
        `SELECT to_jsonb(record) AS value FROM public.${table} record ORDER BY to_jsonb(record)::text`,
      );
      return [table, result.rows.map((row) => row.value)] as const;
    }),
  );
  return Object.fromEntries(snapshots);
}

async function assertNoSeedTempTables() {
  const result = await client.query<{ task: string | null; relation: string | null }>(
    "SELECT to_regclass('pg_temp.decision_graph_seed_task_capabilities')::text AS task, " +
      "to_regclass('pg_temp.decision_graph_seed_relations')::text AS relation",
  );
  assert.equal(result.rows[0].task, null);
  assert.equal(result.rows[0].relation, null);
}

async function main() {
  await client.connect();
  try {
    const existing = await client.query<{ present: string | null }>(
      "SELECT to_regclass('auth.users')::text AS present UNION ALL SELECT to_regclass('public.decision_tasks')::text",
    );
    assert.ok(existing.rows.every((row) => row.present === null), 'use an empty local PostgreSQL database');

    await client.query('BEGIN');
    try {
      await client.query(`
        CREATE SCHEMA auth;
        CREATE TABLE auth.users (id UUID PRIMARY KEY);
        CREATE TABLE public.decision_tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT UNIQUE NOT NULL,
          name JSONB, description JSONB, status TEXT, display_order INTEGER, constraint_schema JSONB
        );
        CREATE TABLE public.decision_capabilities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT UNIQUE NOT NULL,
          name JSONB, description JSONB, capability_group TEXT, status TEXT, display_order INTEGER
        );
        CREATE TABLE public.task_capabilities (
          task_id UUID, capability_id UUID, importance TEXT, rationale JSONB, status TEXT,
          reviewed_at TIMESTAMPTZ, review_due_at TIMESTAMPTZ, reviewed_by UUID,
          PRIMARY KEY (task_id, capability_id)
        );
        CREATE TABLE public.tool_capabilities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tool_id UUID, capability_id UUID,
          support_level TEXT, availability TEXT, plan_requirement JSONB, limitations JSONB,
          status TEXT, reviewed_at TIMESTAMPTZ, review_due_at TIMESTAMPTZ, reviewed_by UUID,
          UNIQUE (tool_id, capability_id)
        );
        CREATE TABLE public.tool_capability_claims (
          tool_capability_id UUID, claim_id UUID, purpose TEXT,
          PRIMARY KEY (tool_capability_id, claim_id, purpose)
        );
        CREATE TABLE public.tool_task_fits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tool_id UUID, task_id UUID,
          fit_level TEXT, rationale JSONB, required_conditions JSONB, disqualifiers JSONB,
          status TEXT, reviewed_at TIMESTAMPTZ, review_due_at TIMESTAMPTZ, reviewed_by UUID,
          UNIQUE (tool_id, task_id)
        );
        CREATE TABLE public.tool_task_fit_claims (
          fit_id UUID, claim_id UUID, purpose TEXT,
          PRIMARY KEY (fit_id, claim_id, purpose)
        );
        CREATE TABLE public.product_intelligence_profiles (id UUID PRIMARY KEY, owner_type TEXT, owner_id UUID);
        CREATE TABLE public.product_intelligence_claims (
          id UUID PRIMARY KEY, profile_id UUID, verification_status TEXT, conflict_status TEXT,
          invalidated_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, review_due_at TIMESTAMPTZ
        );
      `);
      await client.query("INSERT INTO auth.users VALUES ('2b8177ac-70b3-4475-a1ee-509ff8b4b622')");
      await client.query(`
        INSERT INTO public.decision_tasks (id, slug, status)
        VALUES ('e9c64181-9cad-40c5-979e-3af4bd9cc630', 'meeting-notes', 'active')
      `);
      for (const [toolId, claimId] of relations) {
        await client.query(
          'INSERT INTO public.product_intelligence_profiles (id, owner_type, owner_id) VALUES ($1, $2, $3)',
          [claimId, 'tool', toolId],
        );
        await client.query(
          `INSERT INTO public.product_intelligence_claims
            (id, profile_id, verification_status, conflict_status, review_due_at)
           VALUES ($1, $1, 'verified', 'none', NOW() + INTERVAL '30 days')`,
          [claimId],
        );
      }
      const published = [
        [relations[0][0], relations[0][1], 'strong'],
        [relations[1][0], relations[1][1], 'strong'],
        [relations[2][0], relations[2][1], 'conditional'],
      ];
      for (const [toolId, claimId, fitLevel] of published) {
        const fit = await client.query<{ id: string }>(
          `INSERT INTO public.tool_task_fits (tool_id, task_id, fit_level, rationale, status)
           VALUES ($1, 'e9c64181-9cad-40c5-979e-3af4bd9cc630', $2, '{}'::jsonb, 'published') RETURNING id`,
          [toolId, fitLevel],
        );
        await client.query(
          'INSERT INTO public.tool_task_fit_claims (fit_id, claim_id, purpose) VALUES ($1, $2, $3)',
          [fit.rows[0].id, claimId, 'limitation'],
        );
      }

      const cleanupAnchor = '\nDROP TABLE pg_temp.decision_graph_seed_relations;';
      assert.equal(exportSql.split(cleanupAnchor).length, 2, 'the export must have one final cleanup point');
      const finalClaimLink = exportSql.lastIndexOf('INSERT INTO public.tool_task_fit_claims');
      assert.ok(
        finalClaimLink >= 0 && finalClaimLink < exportSql.indexOf(cleanupAnchor),
        'the injected failure must occur after the final permanent write',
      );
      const lateFailureSql = exportSql.replace(
        cleanupAnchor,
        "\nRAISE EXCEPTION 'DIFF-03_LOCAL_LATE_FAILURE';" + cleanupAnchor,
      );
      const beforeFailure = await snapshotPublicTables();
      assert.deepEqual(
        auditedTables.slice(0, 7).map((table) => beforeFailure[table].length),
        [1, 0, 0, 0, 0, 3, 3],
        'the failure fixture must start before the exported public writes',
      );
      await client.query('SAVEPOINT decision_graph_late_failure');
      try {
        await assert.rejects(client.query(lateFailureSql), /DIFF-03_LOCAL_LATE_FAILURE/);
      } finally {
        await client.query('ROLLBACK TO SAVEPOINT decision_graph_late_failure');
        await client.query('RELEASE SAVEPOINT decision_graph_late_failure');
      }
      assert.deepEqual(await snapshotPublicTables(), beforeFailure, 'the full late-failing export must roll back');
      await assertNoSeedTempTables();

      await client.query(exportSql);
      assert.deepEqual(
        await Promise.all([
          count('decision_tasks'), count('decision_capabilities'), count('task_capabilities'),
          count('tool_capabilities'), count('tool_capability_claims'), count('tool_task_fits'),
          count('tool_task_fit_claims'),
        ]),
        [6, 12, 12, 7, 7, 7, 7],
      );
      await client.query(exportSql);
      assert.deepEqual(
        await Promise.all([
          count('decision_tasks'), count('decision_capabilities'), count('task_capabilities'),
          count('tool_capabilities'), count('tool_capability_claims'), count('tool_task_fits'),
          count('tool_task_fit_claims'),
        ]),
        [6, 12, 12, 7, 7, 7, 7],
      );
      const preserved = await client.query<{ count: string }>(
        "SELECT count(*) FROM public.tool_task_fits WHERE status = 'published'",
      );
      assert.equal(Number(preserved.rows[0].count), 3);
      await assertNoSeedTempTables();
    } finally {
      await client.query('ROLLBACK');
    }

    console.log(
      JSON.stringify({ success: true, localPostgres: true, lateFailureRolledBack: true, fullExportExecutedTwice: true }, null, 2),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

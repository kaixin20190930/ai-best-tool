import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

const migration = readFileSync('db/supabase/migrations/20261005_admin_gemini_fit_rationale_recovery.sql', 'utf8');
const toolId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const profileId = 'c7890701-0000-4000-8000-000000000001';
const fitId = 'c7890701-0000-4000-8000-000000000301';
const reviewerId = 'd7890701-0000-4000-8000-000000000001';
const capabilityIds = [201, 202].map((n) => `c7890701-0000-4000-8000-${String(n).padStart(12, '0')}`);
const claimId = (n: number) => `c7890701-0000-4000-8000-${String(n).padStart(12, '0')}`;
const sourceId = (n: number) => `c7890701-0000-4000-8000-${String(n).padStart(12, '0')}`;
const approvedRationale = {
  en: 'Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.',
  cn: '用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。',
};
const initialRationale = {
  en: 'Works for source-grounded synthesis when users select a bounded source set and inspect each important citation.',
  cn: '用户选定有限资料集并逐条核查重要引用时，适于资料锚定的综合。',
};
const conditions = [
  {
    en: 'Accept Google hosting, account and region limits; inspect imported sources and cited passages.',
    cn: '接受 Google 托管、账号和地区限制；核查导入资料和引文段落。',
  },
];
const disqualifiers = [
  {
    en: 'Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.',
    cn: '要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。',
  },
];
const sources = [
  [101, 'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'],
  [102, 'https://support.google.com/gemininotebook/answer/16164461'],
  [103, 'https://support.google.com/gemininotebook/answer/16215270?hl=en'],
  [104, 'https://support.google.com/gemininotebook/answer/16206563?hl=en'],
  [105, 'https://support.google.com/gemininotebook/answer/16213268?hl=en'],
  [106, 'https://support.google.com/gemininotebook/answer/17670842?hl=en'],
  [107, 'https://support.google.com/gemininotebook/answer/17004255?hl=en'],
] as const;
const claims = [
  [401, 101, 'identity-2026-10'],
  [402, 102, 'grounding-2026-10'],
  [403, 103, 'discovery-2026-10'],
  [404, 103, 'import-loss-2026-10'],
  [405, 104, 'notebook-boundary-2026-10'],
  [406, 104, 'sharing-export-2026-10'],
  [407, 105, 'plans-2026-10'],
  [408, 106, 'compute-limits-2026-10'],
  [409, 107, 'data-handling-2026-10'],
  [410, 102, 'workspace-privacy-2026-10'],
] as const;
const decisionLinks = [
  [402, 'fit'],
  [404, 'limitation'],
  [406, 'export'],
  [407, 'cost'],
  [409, 'privacy'],
] as const;
const capabilityLinks = [
  [201, 403, 'support'],
  [201, 407, 'availability'],
  [201, 408, 'plan'],
  [201, 404, 'limitation'],
  [201, 405, 'limitation'],
  [202, 402, 'support'],
  [202, 407, 'availability'],
  [202, 407, 'plan'],
  [202, 404, 'limitation'],
  [202, 405, 'limitation'],
] as const;
const fitLinks = [
  [402, 'fit'],
  [403, 'fit'],
  [404, 'limitation'],
  [405, 'limitation'],
  [409, 'privacy'],
  [410, 'privacy'],
] as const;

const schema = `
  CREATE SCHEMA auth;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
  END $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_setting('request.jwt.claim.role', true) $$;
  CREATE TABLE auth.users(id uuid PRIMARY KEY);
  INSERT INTO auth.users VALUES ('${reviewerId}');
  CREATE TABLE public.product_intelligence_profiles(
    id uuid PRIMARY KEY, owner_type text, owner_id uuid, profile_status text,
    next_review_at timestamptz, last_verified_at timestamptz);
  CREATE TABLE public.product_intelligence_sources(
    id uuid PRIMARY KEY, profile_id uuid, url text, source_type text,
    fetch_status text, last_verified_at timestamptz);
  CREATE TABLE public.product_intelligence_claims(
    id uuid PRIMARY KEY, profile_id uuid, source_id uuid, source_url text, source_type text,
    claim_key text, verification_status text, conflict_status text, invalidated_at timestamptz,
    verified_at timestamptz, verified_by uuid, review_due_at timestamptz, expires_at timestamptz);
  CREATE TABLE public.tool_decision_profiles(
    tool_id uuid PRIMARY KEY, editorial_status text, reviewed_at timestamptz,
    review_due_at timestamptz, reviewed_by uuid);
  CREATE TABLE public.tool_capabilities(
    id uuid PRIMARY KEY, tool_id uuid, status text, reviewed_at timestamptz,
    review_due_at timestamptz, reviewed_by uuid);
  CREATE TABLE public.tool_task_fits(
    id uuid PRIMARY KEY, tool_id uuid, task_id uuid, fit_level text, rationale jsonb,
    required_conditions jsonb, disqualifiers jsonb, status text,
    reviewed_at timestamptz, review_due_at timestamptz, reviewed_by uuid,
    last_edited_by uuid, updated_at timestamptz NOT NULL DEFAULT now());
  CREATE TABLE public.tool_decision_profile_claims(tool_id uuid, claim_id uuid, purpose text);
  CREATE TABLE public.tool_capability_claims(tool_capability_id uuid, claim_id uuid, purpose text);
  CREATE TABLE public.tool_task_fit_claims(fit_id uuid, claim_id uuid, purpose text);
  CREATE FUNCTION public.set_decision_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = clock_timestamp(); RETURN NEW; END; $$;
  CREATE TRIGGER tool_task_fits_set_updated_at BEFORE UPDATE ON public.tool_task_fits
    FOR EACH ROW EXECUTE FUNCTION public.set_decision_updated_at();
  ALTER TABLE public.product_intelligence_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_intelligence_sources ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_intelligence_claims ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_decision_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_capabilities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_task_fits ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_decision_profile_claims ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_capability_claims ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_task_fit_claims ENABLE ROW LEVEL SECURITY;
`;

async function main() {
  const useLocalPostgres = process.env.GEMINI_FIT_RATIONALE_TEST_USE_LOCAL_POSTGRES === '1';
  const dir = useLocalPostgres ? '' : mkdtempSync(join(tmpdir(), 'gemini-fit-rationale-pg-'));
  const port = useLocalPostgres ? 5432 : 54000 + Math.floor(Math.random() * 9000);
  const host = useLocalPostgres ? '127.0.0.1' : dir;
  const testDbName = `gemini_fit_rationale_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const admin = useLocalPostgres
    ? new Client({ host, port, user: process.env.USER || 'postgres', database: 'postgres' })
    : null;
  const db = new Client({
    host,
    port,
    user: process.env.USER || 'postgres',
    database: useLocalPostgres ? testDbName : 'postgres',
  });
  const concurrent = new Client({
    host,
    port,
    user: process.env.USER || 'postgres',
    database: useLocalPostgres ? testDbName : 'postgres',
  });
  let started = false;
  let databaseCreated = false;
  try {
    if (useLocalPostgres) {
      await admin!.connect();
      await admin!.query(`CREATE DATABASE "${testDbName}"`);
      databaseCreated = true;
    } else {
      execFileSync('initdb', ['-A', 'trust', '-U', process.env.USER || 'postgres', '-D', dir], { stdio: 'ignore' });
      execFileSync('pg_ctl', ['-D', dir, '-o', `-F -p ${port} -k ${dir}`, '-w', 'start'], { stdio: 'ignore' });
      started = true;
    }
    await Promise.all([db.connect(), concurrent.connect()]);
    await db.query(schema);
    await db.query(migration);
    await Promise.all([
      db.query("SET request.jwt.claim.role = 'service_role'"),
      concurrent.query("SET request.jwt.claim.role = 'service_role'"),
    ]);

    await db.query(`INSERT INTO product_intelligence_profiles
      VALUES ('${profileId}','tool','${toolId}','ready',now()+interval '30 days',now())`);
    for (const [n, url] of sources) {
      await db.query(
        `INSERT INTO product_intelligence_sources
        VALUES ($1,'${profileId}',$2,'official','success',now()-interval '1 hour')`,
        [sourceId(n), url],
      );
    }
    for (const [n, source, key] of claims) {
      const url = sources.find(([sourceNumber]) => sourceNumber === source)?.[1];
      assert.ok(url);
      await db.query(
        `INSERT INTO product_intelligence_claims VALUES
        ($1,'${profileId}',$2,$3,'official',$4,'verified','none',NULL,now()-interval '1 hour',
          '${reviewerId}',now()+interval '30 days',NULL)`,
        [claimId(n), sourceId(source), url, `gemini-notebook:research:${key}`],
      );
    }
    await db.query(`INSERT INTO tool_decision_profiles VALUES
      ('${toolId}','reviewed',now()-interval '1 hour',now()+interval '30 days','${reviewerId}')`);
    for (const id of capabilityIds) {
      await db.query(
        `INSERT INTO tool_capabilities VALUES
        ($1,'${toolId}','reviewed',now()-interval '1 hour',now()+interval '30 days','${reviewerId}')`,
        [id],
      );
    }
    await db.query(
      `INSERT INTO tool_task_fits
      (id,tool_id,task_id,fit_level,rationale,required_conditions,disqualifiers,status)
      VALUES ('${fitId}','${toolId}','${taskId}','conditional',$1::jsonb,$2::jsonb,$3::jsonb,'draft')`,
      [JSON.stringify(initialRationale), JSON.stringify(conditions), JSON.stringify(disqualifiers)],
    );
    for (const [claim, purpose] of decisionLinks) {
      await db.query(`INSERT INTO tool_decision_profile_claims VALUES ('${toolId}',$1,$2)`, [claimId(claim), purpose]);
    }
    for (const [capability, claim, purpose] of capabilityLinks) {
      await db.query('INSERT INTO tool_capability_claims VALUES ($1,$2,$3)', [
        capabilityIds[capability === 201 ? 0 : 1],
        claimId(claim),
        purpose,
      ]);
    }
    for (const [claim, purpose] of fitLinks) {
      await db.query(`INSERT INTO tool_task_fit_claims VALUES ('${fitId}',$1,$2)`, [claimId(claim), purpose]);
    }

    const rows = async (table: string, where = '', order = '1') =>
      (await db.query(`SELECT to_jsonb(t) AS value FROM public.${table} t ${where} ORDER BY ${order}`)).rows.map(
        (r) => r.value,
      );
    const state = async () => ({
      profiles: await rows('product_intelligence_profiles'),
      sources: await rows('product_intelligence_sources', '', 'id'),
      claims: await rows('product_intelligence_claims', '', 'id'),
      decisions: await rows('tool_decision_profiles'),
      capabilities: await rows('tool_capabilities', '', 'id'),
      fits: await rows('tool_task_fits'),
      decisionLinks: await rows('tool_decision_profile_claims', '', 'claim_id,purpose'),
      capabilityLinks: await rows('tool_capability_claims', '', 'tool_capability_id,claim_id,purpose'),
      fitLinks: await rows('tool_task_fit_claims', '', 'claim_id,purpose'),
    });
    const fit = async () =>
      (await db.query('SELECT to_jsonb(f) AS value FROM tool_task_fits f WHERE id=$1', [fitId])).rows[0]?.value;
    const rpc = (client: Client) =>
      client.query('SELECT public.admin_apply_gemini_notebook_fit_rationale($1) AS result', [reviewerId]);
    const rejectWithoutPartialWrite = async (
      label: string,
      mutation: () => Promise<unknown>,
      expectedError: RegExp,
    ) => {
      await db.query('BEGIN');
      try {
        await mutation();
        await db.query('SAVEPOINT before_rpc');
        const before = await state();
        await assert.rejects(rpc(db), expectedError, label);
        await db.query('ROLLBACK TO SAVEPOINT before_rpc');
        assert.deepEqual(await state(), before, `${label}: rejected RPC left partial writes`);
      } finally {
        await db.query('ROLLBACK');
      }
    };

    await rejectWithoutPartialWrite(
      'missing verified claim',
      async () => {
        await db.query('DELETE FROM tool_task_fit_claims WHERE claim_id=$1', [claimId(410)]);
        await db.query('DELETE FROM product_intelligence_claims WHERE id=$1', [claimId(410)]);
      },
      /Ten exact current verified Gemini official claims/,
    );
    await rejectWithoutPartialWrite(
      'missing official source',
      async () => {
        await db.query('UPDATE product_intelligence_claims SET source_id=$1,source_url=$2 WHERE id=$3', [
          sourceId(106),
          sources[5][1],
          claimId(409),
        ]);
        await db.query('DELETE FROM product_intelligence_sources WHERE id=$1', [sourceId(107)]);
      },
      /Seven exact current Google official Gemini sources/,
    );
    await rejectWithoutPartialWrite(
      'missing 5/10/6 relationship',
      async () => {
        await db.query(
          `DELETE FROM tool_capability_claims
        WHERE tool_capability_id=$1 AND claim_id=$2 AND purpose='plan'`,
          [capabilityIds[1], claimId(407)],
        );
      },
      /relationships must exactly match 5\/10\/6/,
    );
    await rejectWithoutPartialWrite(
      'wrong predefined source URL',
      async () => {
        await db.query(
          "UPDATE product_intelligence_sources SET url='https://support.google.com/gemininotebook/answer/16164461?hl=en' WHERE id=$1",
          [sourceId(102)],
        );
      },
      /Seven exact current Google official Gemini sources/,
    );
    await rejectWithoutPartialWrite(
      'unexpected Fit status',
      async () => {
        await db.query("UPDATE tool_task_fits SET status='stale' WHERE id=$1", [fitId]);
      },
      /exact approved draft preimage/,
    );
    await rejectWithoutPartialWrite(
      'concurrent Fit preimage drift',
      async () => {
        await db.query("UPDATE tool_task_fits SET fit_level='strong' WHERE id=$1", [fitId]);
      },
      /exact approved draft preimage/,
    );

    await db.query('BEGIN');
    await db.query("UPDATE tool_task_fits SET fit_level='strong' WHERE id=$1", [fitId]);
    const concurrentFitCall = rpc(concurrent);
    let observedFitLock = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const wait = await db.query(`SELECT wait_event_type FROM pg_stat_activity
        WHERE datname=current_database() AND query LIKE 'SELECT public.admin_apply_gemini_notebook_fit_rationale%'`);
      if (wait.rows.some((row) => row.wait_event_type === 'Lock')) {
        observedFitLock = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.ok(observedFitLock, 'RPC did not wait for the concurrent Fit update lock');
    await db.query('COMMIT');
    await assert.rejects(concurrentFitCall, /exact approved draft preimage/);
    assert.equal((await fit()).status, 'draft', 'concurrent Fit drift unexpectedly changed the status');
    await db.query("UPDATE tool_task_fits SET fit_level='conditional' WHERE id=$1", [fitId]);

    await db.query('BEGIN');
    const beforeConcurrency = await state();
    await rpc(db);
    assert.notDeepEqual(await state(), beforeConcurrency, 'successful RPC did not review the Fit');
    const reviewedFit = await fit();
    assert.equal(reviewedFit.status, 'reviewed');
    assert.deepEqual(reviewedFit.rationale, approvedRationale);
    assert.equal(reviewedFit.fit_level, 'conditional');
    assert.deepEqual(reviewedFit.required_conditions, conditions);
    assert.deepEqual(reviewedFit.disqualifiers, disqualifiers);
    assert.equal(reviewedFit.reviewed_by, reviewerId);
    assert.equal(reviewedFit.last_edited_by, reviewerId);
    assert.ok(Date.parse(reviewedFit.review_due_at) > Date.now());
    await db.query('ROLLBACK');
    assert.equal((await fit()).status, 'draft', 'outer transaction rollback did not restore draft Fit');

    // Exercise two independent callers against the same exact draft. The RPC's
    // transaction lock serializes them: one reviews, the other sees unchanged.
    const outcomes = await Promise.all([rpc(db), rpc(concurrent)]);
    const statuses = outcomes.map((outcome) => outcome.rows[0].result.status).sort();
    assert.deepEqual(statuses, ['reviewed', 'unchanged']);
    const stateAfterReview = await state();
    const replay = (await rpc(db)).rows[0].result;
    assert.deepEqual(replay, { status: 'unchanged', fitId });
    assert.deepEqual(await state(), stateAfterReview, 'idempotent replay changed the reviewed postimage');

    // A concurrent writer changes a locked official source while the RPC is
    // starting. The RPC waits on its table lock, sees the committed drift, and
    // rejects without touching the Fit.
    await db.query('BEGIN');
    await db.query("UPDATE product_intelligence_sources SET url='https://bad.example/' WHERE id=$1", [sourceId(101)]);
    const concurrentCall = rpc(concurrent);
    let observedLock = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const wait = await db.query(`SELECT wait_event_type FROM pg_stat_activity
        WHERE datname=current_database() AND query LIKE 'SELECT public.admin_apply_gemini_notebook_fit_rationale%'`);
      if (wait.rows.some((row) => row.wait_event_type === 'Lock')) {
        observedLock = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.ok(observedLock, 'RPC did not wait for the concurrent source update lock');
    await db.query('COMMIT');
    await assert.rejects(concurrentCall, /Seven exact current Google official Gemini sources/);
    assert.equal((await fit()).status, 'reviewed', 'rejected concurrent drift changed the Fit');

    const productionWrites = 0;
    assert.equal(productionWrites, 0);
    console.log(
      JSON.stringify({
        test: 'Gemini Notebook Fit rationale transactional RPC',
        result: 'PASS',
        cases: [
          'valid update',
          'missing claim/source/link',
          'wrong source URL',
          'unexpected Fit state',
          'Fit preimage drift',
          'concurrent Fit drift',
          'concurrent source drift',
          'serialized duplicate',
          'idempotent replay',
          'transaction rollback',
        ],
        productionWrites,
      }),
    );
  } finally {
    await Promise.all([db.end().catch(() => undefined), concurrent.end().catch(() => undefined)]);
    if (started) execFileSync('pg_ctl', ['-D', dir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    if (databaseCreated && admin) {
      await admin
        .query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid <> pg_backend_pid()', [
          testDbName,
        ])
        .catch(() => undefined);
      await admin.query(`DROP DATABASE IF EXISTS "${testDbName}"`).catch(() => undefined);
    }
    await admin?.end().catch(() => undefined);
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

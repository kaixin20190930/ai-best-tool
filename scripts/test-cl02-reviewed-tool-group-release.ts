import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

import {
  reviewedFitConditionsComplete,
  reviewedToolCapabilityContentBlockers,
} from '../lib/decision/reviewedToolCapabilityGate';

const originalMigration = readFileSync(
  'db/supabase/migrations/20261004_admin_publish_reviewed_task_tool_group.sql',
  'utf8',
);
const migration = readFileSync(
  'db/supabase/migrations/20261006_admin_publish_reviewed_task_tool_group_bilingual_gate.sql',
  'utf8',
);
// Only the content gate is superseded: locks, permissions, transaction, evidence,
// replay, group scope and publication writes must remain byte-for-byte unchanged.
const stripGate = (sql: string) =>
  sql
    .slice(sql.indexOf('CREATE OR REPLACE FUNCTION'))
    .replace(
      / {7}v_row.support_level[\s\S]*?(?= {4}IF EXISTS \(SELECT 1 FROM public.tool_task_fits other_fit)/,
      '<content-gate>\n',
    );
assert.equal(stripGate(migration), stripGate(originalMigration));

const validContent = {
  support_level: 'strong',
  availability: 'all_plans',
  plan_requirement: { en: 'Available in current plan; recheck account access.', cn: '根据当前套餐核查目标账号权限。' },
  limitations: [{ en: 'Current plan limits apply.', cn: '当前套餐用量限制仍然适用。' }],
};
const invalidContent: { field: keyof typeof validContent; value: unknown; reason: string }[] = [
  { field: 'availability', value: 'unknown', reason: 'availability' },
  { field: 'availability', value: null, reason: 'availability' },
  ...[
    null,
    {},
    [],
    '',
    'legacy plan',
    42,
    true,
    { en: 'English only' },
    { cn: '仅有中文不完整' },
    { en: '   ', cn: '有效中文说明' },
    { en: '\t\n a ', cn: '有效中文说明' },
    { en: 'ok', cn: '有效中文说明' },
    { en: 'English description', cn: '短' },
    { en: 12345678, cn: '有效中文说明' },
    { en: 'English description', cn: null },
    { en: 'English description', cn: ['错误字段类型'] },
    { ...validContent.plan_requirement, extra: false },
  ].map((value) => ({ field: 'plan_requirement' as const, value, reason: 'plan_requirement' })),
  ...[
    null,
    [],
    {},
    '',
    'legacy limitation',
    42,
    true,
    ['Current plan limits apply.'],
    [null],
    [42],
    [true],
    [[]],
    [{}],
    [{ en: 'English only' }],
    [{ cn: '只有中文也不满足发布完整性' }],
    [{ en: '', cn: '有效中文说明需要八个字符' }],
    [{ en: '       ', cn: '有效中文说明需要八个字符' }],
    [{ en: '\t\r\n\f\v     ', cn: '有效中文说明需要八个字符' }],
    [{ en: '\t\r 1234567 \n\v', cn: '有效中文说明需要八个字符' }],
    [{ en: '1234567', cn: '有效中文说明需要八个字符' }],
    [{ en: 'English description', cn: '短说明' }],
    [{ en: 123456789, cn: '有效中文说明需要八个字符' }],
    [{ en: 'English description', cn: false }],
    [{ en: 'English description', cn: { text: '类型错误的中文说明' } }],
    [...validContent.limitations, { en: 'invalid second entry' }],
  ].map((value) => ({ field: 'limitations' as const, value, reason: 'limitations' })),
];
assert.deepEqual(reviewedToolCapabilityContentBlockers(validContent), []);
for (const test of invalidContent) {
  assert.ok(
    reviewedToolCapabilityContentBlockers({ ...validContent, [test.field]: test.value }).length,
    `Static preflight must reject ${test.field}=${JSON.stringify(test.value)}`,
  );
}
assert.deepEqual(
  reviewedToolCapabilityContentBlockers({
    ...validContent,
    plan_requirement: { en: ' abc ', cn: ' 三个字 ' },
    limitations: [{ en: ' 12345678 ', cn: ' 一二三四五六七八 ' }],
  }),
  [],
);
assert.ok(
  reviewedToolCapabilityContentBlockers({ ...validContent, limitations: [{ en: '😀😀😀😀', cn: '一二三四五六七八' }] })
    .length,
  'Count code points like PostgreSQL, not UTF-16 units',
);
const withdrawalMigration = readFileSync('db/supabase/migrations/20261004_admin_withdraw_task_tool_group.sql', 'utf8');
const action = readFileSync('app/actions/admin/decision.ts', 'utf8');
const ui = readFileSync('components/admin/ReviewedTaskToolGroupRelease.tsx', 'utf8');
const preflight = readFileSync('scripts/preflight-cl02-reviewed-relations.ts', 'utf8');
assert.match(preflight, /reviewedToolCapabilityContentBlockers\(capability\)/);
for (const field of ['required_conditions', 'disqualifiers']) {
  assert.ok(preflight.includes(`reviewedFitConditionsComplete(fit.${field})`));
}
assert.equal(reviewedFitConditionsComplete([{ en: 'x', cn: '字' }]), false);
assert.equal(reviewedFitConditionsComplete([{ en: '12345678', cn: '一二三四五六七八' }]), true);
for (const [name, expectedCounts] of [
  ['Gemini Notebook', [5, 10, 6]],
  ['Perplexity', [6, 10, 7]],
] as const) {
  const target = preflight.match(new RegExp(`name: '${name}',([\\s\\S]*?)expectedRationale:`))?.[1];
  assert.ok(target, `${name}: preflight target must exist`);
  const counts = ['decisionCapabilities', 'toolCapabilityLinks', 'fitLinks'].map((field) =>
    Number(target.match(new RegExp(`${field}: (\\d+)`))?.[1]),
  );
  assert.deepEqual(counts, expectedCounts, `${name}: preflight must require exact reviewed relation counts`);
}
assert.match(migration, /auth\.role\(\) IS DISTINCT FROM 'service_role'/);
assert.match(
  migration,
  /GRANT EXECUTE ON FUNCTION public\.admin_publish_reviewed_task_tool_group[\s\S]*TO service_role/,
);
assert.match(migration, /FOR UPDATE/);
assert.match(migration, /FOR SHARE OF l,c,p,s/);
assert.match(migration, /updated_at<>\(v_(?:fit|capability)->>'updated_at'\)::timestamptz/);
assert.match(migration, /ARRAY\['support','availability','plan','limitation'\]/);
assert.match(migration, /ARRAY\['fit','limitation'\]/);
assert.match(migration, /verification_status<>'verified'/);
assert.match(migration, /conflict_status<>'none'/);
assert.match(migration, /s\.source_type<>'official'/);
assert.match(migration, /s\.profile_id IS DISTINCT FROM c\.profile_id/);
assert.match(migration, /'linkFingerprint',v_link_fingerprint/);
assert.match(migration, /e\.metadata->'linkFingerprint'=v_link_fingerprint/);
assert.match(migration, /e\.metadata->'toolCapabilities'=p_tool_capabilities/);
assert.match(migration, /e\.metadata->'fits'=p_fits/);
assert.match(migration, /Published group manifest preimage mismatch/);
assert.doesNotMatch(migration, /profileStatus'<>'ready'\)\)\)/);
assert.match(migration, /p\.profile_status<>'ready'/);
assert.match(migration, /p\.owner_id<>p_tool_id/);
assert.match(migration, /review_due_at<=v_now/);
assert.match(migration, /reviewed_by IS NULL/);
assert.match(migration, /Gemini Notebook rationale must distinguish/);
assert.match(migration, /Perplexity rationale must state/);
assert.match(migration, /'unchanged',true/);
assert.match(migration, /p_preflight/);
assert.doesNotMatch(
  migration,
  /UPDATE public\.(?:decision_tasks|task_capabilities|tools|product_intelligence_profiles)/i,
);
assert.doesNotMatch(migration, /APPROVED_TASK_PAGE_SLUGS|sitemap|robots|index_reviews/i);
assert.match(withdrawalMigration, /admin_withdraw_task_tool_group/);
assert.match(withdrawalMigration, /updated_at=\(v_entry->>'updated_at'\)::timestamptz/);
assert.match(withdrawalMigration, /decision_withdrawal/);
assert.match(withdrawalMigration, /Withdrawal manifest must cover every exact Tool Capability and Fit/);
assert.match(withdrawalMigration, /e\.metadata->'toolCapabilities'=p_tool_capabilities/);
assert.match(withdrawalMigration, /'unchanged',true/);
assert.doesNotMatch(
  withdrawalMigration,
  /UPDATE public\.(?:decision_tasks|task_capabilities|tools|product_intelligence_profiles)/i,
);
assert.match(action, /export async function transitionReviewedTaskToolGroup/);
assert.match(action, /input\.taskId !== '527fe8b7-c171-4c50-ab1f-9404d7536e7c'/);
assert.match(action, /admin_publish_reviewed_task_tool_group/);
assert.match(ui, /Read-only preflight/);
assert.match(ui, /Independent QA reference required to publish/);
assert.match(preflight, /readyForIndependentQa/);
assert.match(preflight, /productionWrites: 0/);
assert.match(preflight, /fitCandidateMatches/);
assert.match(
  preflight,
  /Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook/,
);
assert.match(preflight, /不等同于开放网页检索/);
assert.match(preflight, /geminiIndexUnchanged && perplexityIndexUnchanged/);
assert.match(preflight, /PERPLEXITY_TOOL_INDEX_STATE_CHANGED/);
const editorialCandidate = JSON.parse(readFileSync('docs/CL02_PERPLEXITY_EDITORIAL_CANDIDATE_2026-10-06.json', 'utf8'));
assert.equal(editorialCandidate.productionWrites, 0);
assert.equal(editorialCandidate.publishAllowed, false);
assert.equal(editorialCandidate.decision.executionStatus, 'HOLD_ADMIN_CONTENT_EDITOR_REQUIRED');
assert.deepEqual(Object.keys(editorialCandidate.decision.patch), ['watch_outs']);
assert.match(editorialCandidate.decision.patch.watch_outs[0].en, /3\/day/);
assert.equal(editorialCandidate.toolCapabilities.length, 2);
for (const { form } of editorialCandidate.toolCapabilities) {
  assert.equal(form.action, 'saveToolCapability');
  assert.equal(form.status, 'draft');
  assert.match(form.planRequirement.en, /3\/day/);
  assert.equal(form.availability, 'unknown', 'Quota correction cannot silently promote a Capability to all_plans');
  assert.deepEqual(
    reviewedToolCapabilityContentBlockers({
      support_level: form.supportLevel,
      availability: form.availability,
      plan_requirement: form.planRequirement,
      limitations: form.limitations,
    }),
    ['AVAILABILITY_UNKNOWN'],
  );
}

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const reviewer = 'd7890701-0000-4000-8000-000000000001';
const caps = ['c7890701-0000-4000-8000-000000000201', 'c7890701-0000-4000-8000-000000000202'];
const fitId = 'c7890701-0000-4000-8000-000000000301';

async function main(toolId = 'cec78907-e2a1-4eb7-853a-a58334026280') {
  const perplexity = toolId === '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
  const rationale = perplexity
    ? {
        en: 'Use for open-web discovery and cited answers only when important citations are checked against original pages.',
        cn: '仅在逐条核读重要原文时，用于开放网页发现与带来源回答。',
      }
    : {
        en: 'Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.',
        cn: '用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。',
      };
  const dir = mkdtempSync(join(tmpdir(), 'cl02-reviewed-group-pg-'));
  const port = 54000 + Math.floor(Math.random() * 9000);
  // Explicit fallback for macOS SHMMNI exhaustion. A Unix socket and unique new
  // database are mandatory; never use DATABASE_URL or change shared roles.
  const localServer = process.argv.includes('--local-server');
  const database = `cl02_gate_${dir.split('-').pop()!.toLowerCase()}`;
  assert.match(database, /^cl02_gate_[a-z0-9]+$/);
  const localAdmin = localServer ? new Client({ host: '/tmp', port: 5432, database: 'postgres' }) : null;
  const db = new Client(
    localServer ? { host: '/tmp', port: 5432, database } : { host: dir, port, user: 'postgres', database: 'postgres' },
  );
  let started = false;
  let createdDatabase = false;
  try {
    if (localAdmin) {
      await localAdmin.connect();
      const roles = await localAdmin.query(
        "SELECT rolname FROM pg_roles WHERE rolname IN ('service_role','anon','authenticated')",
      );
      assert.equal(roles.rows.length, 3, 'Local fallback requires existing roles; it never creates global roles');
      await localAdmin.query(`CREATE DATABASE "${database}"`);
      createdDatabase = true;
    } else {
      execFileSync('initdb', ['-A', 'trust', '-U', 'postgres', '-D', dir]);
      execFileSync('pg_ctl', ['-D', dir, '-o', `-F -p ${port} -k ${dir}`, '-w', 'start']);
      started = true;
    }
    await db.connect();
    await db.query(`CREATE SCHEMA auth;
      ${localServer ? '' : 'CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated;'}
      CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_setting('request.jwt.claim.role',true) $$;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      INSERT INTO auth.users VALUES ('${reviewer}');
      CREATE TABLE decision_tasks(id uuid PRIMARY KEY,slug text,status text);
      CREATE TABLE task_capabilities(task_id uuid,capability_id uuid,status text,reviewed_by uuid,reviewed_at timestamptz,review_due_at timestamptz);
      CREATE TABLE decision_capabilities(id uuid PRIMARY KEY,slug text,status text);
      CREATE TABLE tool_decision_profiles(tool_id uuid PRIMARY KEY,editorial_status text,reviewed_by uuid,reviewed_at timestamptz,review_due_at timestamptz);
      CREATE TABLE product_intelligence_profiles(id uuid PRIMARY KEY,owner_type text,owner_id uuid,profile_status text,next_review_at timestamptz);
      CREATE TABLE product_intelligence_sources(id uuid PRIMARY KEY,profile_id uuid,url text,source_type text,fetch_status text,last_verified_at timestamptz);
      CREATE TABLE product_intelligence_claims(id uuid PRIMARY KEY,profile_id uuid,source_id uuid,source_url text,source_type text,verification_status text,conflict_status text,invalidated_at timestamptz,expires_at timestamptz,verified_at timestamptz,verified_by uuid,review_due_at timestamptz);
      CREATE TABLE tool_capabilities(id uuid PRIMARY KEY,tool_id uuid,capability_id uuid,support_level text,availability text,plan_requirement jsonb,limitations jsonb,status text,reviewed_by uuid,reviewed_at timestamptz,review_due_at timestamptz,last_edited_by uuid,updated_at timestamptz);
      CREATE TABLE tool_task_fits(id uuid PRIMARY KEY,task_id uuid,tool_id uuid,fit_level text,rationale jsonb,required_conditions jsonb,disqualifiers jsonb,status text,reviewed_by uuid,reviewed_at timestamptz,review_due_at timestamptz,last_edited_by uuid,updated_at timestamptz);
      CREATE TABLE tool_capability_claims(tool_capability_id uuid,claim_id uuid,purpose text);
      CREATE TABLE tool_task_fit_claims(fit_id uuid,claim_id uuid,purpose text);
      CREATE TABLE tool_decision_profile_claims(tool_id uuid,claim_id uuid,purpose text);
      CREATE TABLE product_intelligence_timeline_events(id bigint GENERATED ALWAYS AS IDENTITY,profile_id uuid,event_type text,review_scope text,claim_type text,claim_key text,title text,summary text,old_value jsonb,new_value jsonb,visibility text,occurred_at timestamptz,verified_at timestamptz,verified_by uuid,metadata jsonb);
      ALTER TABLE decision_tasks ENABLE ROW LEVEL SECURITY; ALTER TABLE task_capabilities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE decision_capabilities ENABLE ROW LEVEL SECURITY; ALTER TABLE tool_decision_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_capabilities ENABLE ROW LEVEL SECURITY; ALTER TABLE tool_task_fits ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_capability_claims ENABLE ROW LEVEL SECURITY; ALTER TABLE tool_task_fit_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_decision_profile_claims ENABLE ROW LEVEL SECURITY; ALTER TABLE product_intelligence_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_intelligence_sources ENABLE ROW LEVEL SECURITY; ALTER TABLE product_intelligence_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_intelligence_timeline_events ENABLE ROW LEVEL SECURITY;`);
    await db.query(`INSERT INTO decision_tasks VALUES ('${taskId}','research-with-citations','active');
      INSERT INTO decision_capabilities VALUES ('50288b6e-a968-4bcf-9e55-911df203e0c7','research-discovery','active'),('04930ae8-4c78-487f-a6c9-25680b8da681','citation-traceability','active');
      INSERT INTO task_capabilities VALUES ('${taskId}','50288b6e-a968-4bcf-9e55-911df203e0c7','published','${reviewer}',now(),now()+interval '30 days'),('${taskId}','04930ae8-4c78-487f-a6c9-25680b8da681','published','${reviewer}',now(),now()+interval '30 days');
      INSERT INTO tool_decision_profiles VALUES ('${toolId}','reviewed','${reviewer}',now(),now()+interval '30 days');
      INSERT INTO product_intelligence_profiles VALUES ('c7890701-0000-4000-8000-000000000001','tool','${toolId}','ready',now()+interval '30 days');
      INSERT INTO product_intelligence_profiles VALUES ('c7890701-0000-4000-8000-000000000002','tool','00000000-0000-4000-8000-000000000099','ready',now()+interval '30 days');
      INSERT INTO product_intelligence_sources VALUES ('c7890701-0000-4000-8000-000000000101','c7890701-0000-4000-8000-000000000001','https://support.google.com/gemininotebook/answer/16164461','official','success',now());
      INSERT INTO product_intelligence_claims VALUES ('c7890701-0000-4000-8000-000000000401','c7890701-0000-4000-8000-000000000001','c7890701-0000-4000-8000-000000000101','https://support.google.com/gemininotebook/answer/16164461','official','verified','none',NULL,NULL,now(),'${reviewer}',now()+interval '30 days');
      INSERT INTO product_intelligence_claims VALUES ('c7890701-0000-4000-8000-000000000402','c7890701-0000-4000-8000-000000000001','c7890701-0000-4000-8000-000000000101','https://support.google.com/gemininotebook/answer/16164461','official','verified','none',NULL,NULL,now(),'${reviewer}',now()+interval '30 days');
      INSERT INTO tool_capabilities VALUES
       ('${caps[0]}','${toolId}','50288b6e-a968-4bcf-9e55-911df203e0c7','strong','all_plans','${JSON.stringify(validContent.plan_requirement)}','${JSON.stringify(validContent.limitations)}','reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now()),
       ('${caps[1]}','${toolId}','04930ae8-4c78-487f-a6c9-25680b8da681','strong','all_plans','${JSON.stringify(validContent.plan_requirement)}','${JSON.stringify(validContent.limitations)}','reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now());
      INSERT INTO tool_task_fits VALUES ('${fitId}','${taskId}','${toolId}','conditional',
       '${JSON.stringify(rationale)}',
       '[{"en":"Accept Google hosting, account and region limits; inspect imported sources and cited passages.","cn":"接受 Google 托管、账号和地区限制；核查导入资料和引文段落。"}]',
       '[{"en":"Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.","cn":"要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。"}]',
       'reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now());
      INSERT INTO tool_capability_claims SELECT id,'c7890701-0000-4000-8000-000000000401',purpose FROM tool_capabilities CROSS JOIN (VALUES('support'),('availability'),('plan'),('limitation')) p(purpose) WHERE tool_id='${toolId}';
      INSERT INTO tool_task_fit_claims VALUES ('${fitId}','c7890701-0000-4000-8000-000000000401','fit'),('${fitId}','c7890701-0000-4000-8000-000000000401','limitation');
      INSERT INTO tool_decision_profile_claims VALUES ('${toolId}','c7890701-0000-4000-8000-000000000401','fit');
      SELECT set_config('request.jwt.claim.role','service_role',false);`);
    // Realistic immutable link cardinalities: Gemini 5/10/6; Perplexity 6/10/7.
    await db.query(`INSERT INTO product_intelligence_claims
      SELECT ('c7890701-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
        profile_id,source_id,source_url,source_type,verification_status,conflict_status,
        invalidated_at,expires_at,verified_at,verified_by,review_due_at
      FROM product_intelligence_claims CROSS JOIN generate_series(403,406) n
      WHERE id='c7890701-0000-4000-8000-000000000401';
      INSERT INTO tool_decision_profile_claims
      SELECT '${toolId}',('c7890701-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,'fit'
      FROM generate_series(402,${perplexity ? 406 : 405}) n;
      INSERT INTO tool_capability_claims
      SELECT id,'c7890701-0000-4000-8000-000000000402','limitation' FROM tool_capabilities;
      INSERT INTO tool_task_fit_claims
      SELECT '${fitId}',('c7890701-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,purpose
      FROM generate_series(402,403) n CROSS JOIN (VALUES ('fit'),('limitation')) p(purpose);
      ${perplexity ? `INSERT INTO tool_task_fit_claims VALUES ('${fitId}','c7890701-0000-4000-8000-000000000404','limitation');` : ''}`);
    const counts = (
      await db.query(`SELECT
      (SELECT count(*)::int FROM tool_decision_profile_claims) decision,
      (SELECT count(*)::int FROM tool_capability_claims) capability,
      (SELECT count(*)::int FROM tool_task_fit_claims) fit`)
    ).rows[0];
    assert.deepEqual(counts, { decision: perplexity ? 6 : 5, capability: 10, fit: perplexity ? 7 : 6 });
    await db.query(originalMigration);
    await db.query(migration);
    const manifest = await db.query(
      "SELECT jsonb_agg(jsonb_build_object('id',id,'updated_at',updated_at,'status','reviewed') ORDER BY id) value FROM tool_capabilities WHERE tool_id=$1",
      [toolId],
    );
    const fitManifest = await db.query(
      "SELECT jsonb_build_array(jsonb_build_object('id',id,'updated_at',updated_at,'status','reviewed')) value FROM tool_task_fits WHERE id=$1",
      [fitId],
    );
    const capsJson = JSON.stringify(manifest.rows[0].value);
    const fitsJson = JSON.stringify(fitManifest.rows[0].value);
    const call = (preflightOnly: boolean, capabilityManifest = capsJson, fitPreimage = fitsJson) =>
      db.query('SELECT public.admin_publish_reviewed_task_tool_group($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7) value', [
        taskId,
        toolId,
        capabilityManifest,
        fitPreimage,
        reviewer,
        'independent qa record 123',
        preflightOnly,
      ]);
    const stateSnapshot = async () =>
      (
        await db.query(`SELECT jsonb_build_object(
      'caps',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM tool_capabilities t),
      'fits',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM tool_task_fits t),
      'events',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_intelligence_timeline_events t)) value`)
      ).rows[0].value;
    const protectedSnapshot = async () =>
      (
        await db.query(`SELECT jsonb_build_object(
      'task',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM decision_tasks t),
      'taskCapabilities',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM task_capabilities t),
      'decision',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM tool_decision_profiles t),
      'decisionLinks',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM tool_decision_profile_claims t),
      'capabilityLinks',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM tool_capability_claims t),
      'fitLinks',(SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM tool_task_fit_claims t)) value`)
      ).rows[0].value;
    const protectedBefore = await protectedSnapshot();
    const validBefore = await stateSnapshot();
    const fitContent = (
      await db.query('SELECT required_conditions,disqualifiers FROM tool_task_fits WHERE id=$1', [fitId])
    ).rows[0];
    for (const field of ['required_conditions', 'disqualifiers']) {
      assert.equal(
        reviewedFitConditionsComplete(fitContent[field]),
        true,
        `${field}: existing bilingual long text passes`,
      );
      for (const value of [
        [{ en: 'x', cn: '字' }],
        [{ en: '1234567', cn: '一二三四五六七八' }],
        [{ en: '12345678', cn: '一二三四五六七' }],
        [{ en: '   x   ', cn: '   字   ' }],
        [{ en: '😀😀😀😀', cn: '一二三四五六七八' }],
      ]) {
        assert.equal(reviewedFitConditionsComplete(value), false, `${field}: local gate rejects short text`);
        await db.query(`UPDATE tool_task_fits SET ${field}=$1 WHERE id=$2`, [JSON.stringify(value), fitId]);
        const beforeRejection = await stateSnapshot();
        for (const preflightOnly of [true, false]) {
          await assert.rejects(
            call(preflightOnly),
            (error: any) =>
              error.code === '23514' && /incomplete bilingual rationale\/conditions\/disqualifiers/.test(error.message),
          );
          assert.deepEqual(await stateSnapshot(), beforeRejection, 'Fit content rejection must not write');
        }
      }
      const validBoundary = [{ en: ' 12345678 ', cn: ' 一二三四五六七八 ' }];
      assert.equal(reviewedFitConditionsComplete(validBoundary), true);
      await db.query(`UPDATE tool_task_fits SET ${field}=$1 WHERE id=$2`, [JSON.stringify(validBoundary), fitId]);
      assert.equal((await call(true)).rows[0].value.preflight, true, `${field}: RPC accepts exact minima`);
      await db.query(`UPDATE tool_task_fits SET ${field}=$1 WHERE id=$2`, [JSON.stringify(fitContent[field]), fitId]);
      assert.equal((await call(true)).rows[0].value.preflight, true, `${field}: RPC accepts bilingual long text`);
    }
    assert.deepEqual(await stateSnapshot(), validBefore);
    for (const limits of [
      [{ en: ' 12345678\t', cn: '\n一二三四五六七八 ' }],
      [{ en: '😀😀😀😀😀😀😀😀', cn: '一二三四五六七八' }, ...validContent.limitations],
    ]) {
      await db.query('UPDATE tool_capabilities SET plan_requirement=$1,limitations=$2 WHERE id=$3', [
        JSON.stringify({ en: ' abc ', cn: ' 三个字 ' }),
        JSON.stringify(limits),
        caps[0],
      ]);
      assert.equal(
        (await call(true)).rows[0].value.preflight,
        true,
        'Exact bilingual minima and multiple entries must pass',
      );
    }
    await db.query('UPDATE tool_capabilities SET plan_requirement=$1,limitations=$2 WHERE id=$3', [
      JSON.stringify(validContent.plan_requirement),
      JSON.stringify(validContent.limitations),
      caps[0],
    ]);
    for (const test of invalidContent) {
      // Only fixed, locally declared column names are interpolated; values are bound.
      await db.query(`UPDATE tool_capabilities SET ${test.field}=$1 WHERE id=$2`, [
        test.field === 'availability' ? test.value : JSON.stringify(test.value),
        caps[0],
      ]);
      const beforeRejection = await stateSnapshot();
      for (const preflightOnly of [true, false]) {
        await assert.rejects(
          call(preflightOnly),
          (error: any) => error.code === '23514' && error.message.includes(test.reason),
          `RPC must reject ${test.field}=${JSON.stringify(test.value)} (preflight=${preflightOnly})`,
        );
        assert.deepEqual(await stateSnapshot(), beforeRejection, 'Rejection must not change status or audit');
      }
      await db.query(`UPDATE tool_capabilities SET ${test.field}=$1 WHERE id=$2`, [
        test.field === 'availability' ? validContent[test.field] : JSON.stringify(validContent[test.field]),
        caps[0],
      ]);
    }
    for (const field of ['plan_requirement', 'limitations']) {
      await db.query(`UPDATE tool_capabilities SET ${field}=NULL WHERE id=$1`, [caps[0]]);
      await assert.rejects(call(true), (error: any) => error.code === '23514' && error.message.includes(field));
      await db.query(`UPDATE tool_capabilities SET ${field}=$1 WHERE id=$2`, [
        JSON.stringify(validContent[field as 'plan_requirement' | 'limitations']),
        caps[0],
      ]);
    }
    assert.deepEqual(await stateSnapshot(), validBefore);
    await db.query(`CREATE FUNCTION reject_test_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'injected audit failure'; END $$;
      CREATE TRIGGER reject_test_audit BEFORE INSERT ON product_intelligence_timeline_events
      FOR EACH ROW EXECUTE FUNCTION reject_test_audit();`);
    await assert.rejects(call(false), /injected audit failure/);
    assert.deepEqual(await stateSnapshot(), validBefore, 'Audit failure rolls back both relation writes');
    await db.query('DROP TRIGGER reject_test_audit ON product_intelligence_timeline_events');
    for (const role of ['anon', 'authenticated']) {
      await db.query(`SET ROLE ${role}`);
      await assert.rejects(
        call(true),
        (error: any) => error.code === '42501',
        'SQL EXECUTE ACL must deny non-service roles',
      );
      await db.query('RESET ROLE');
    }
    const acl = await db.query(`SELECT has_function_privilege('service_role',
      'public.admin_publish_reviewed_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)','EXECUTE') allowed`);
    assert.equal(acl.rows[0].allowed, true);
    await db.query("UPDATE product_intelligence_sources SET profile_id='c7890701-0000-4000-8000-000000000002'");
    await assert.rejects(
      call(true),
      /Linked claims must be current official same-owner evidence/,
      'A source owned by another profile must block even read-only publication preflight',
    );
    await db.query("UPDATE product_intelligence_sources SET profile_id='c7890701-0000-4000-8000-000000000001'");
    const checked = await call(true);
    assert.equal(checked.rows[0].value.preflight, true);
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM tool_capabilities WHERE status='reviewed'")).rows[0].n,
      2,
      'Preflight must not write relation status',
    );
    const drifted = JSON.parse(capsJson);
    drifted[0].updated_at = '2000-01-01T00:00:00.000Z';
    await assert.rejects(call(false, JSON.stringify(drifted)), /stale, unreviewed, or incomplete/);
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM tool_task_fits WHERE status='reviewed'")).rows[0].n,
      1,
      'Drift rejection must be atomic',
    );
    const published = await call(false);
    assert.equal(published.rows[0].value.ok, true);
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM tool_capabilities WHERE status='published'")).rows[0].n,
      2,
    );
    assert.equal(
      (await db.query('SELECT status FROM tool_task_fits WHERE id=$1', [fitId])).rows[0].status,
      'published',
    );
    const replay = await call(false);
    assert.equal(replay.rows[0].value.unchanged, true);
    const wrongReplayTime = JSON.parse(capsJson);
    wrongReplayTime[0].updated_at = '2000-01-01T00:00:00.000Z';
    await assert.rejects(
      call(false, JSON.stringify(wrongReplayTime)),
      /Published group manifest preimage mismatch/,
      'A replay with a changed Tool Capability updated_at must be rejected',
    );
    const wrongCapabilityStatus = JSON.parse(capsJson);
    wrongCapabilityStatus[0].status = 'published';
    await assert.rejects(
      call(false, JSON.stringify(wrongCapabilityStatus)),
      /Published group manifest preimage mismatch/,
      'A replay with a changed Tool Capability status must be rejected',
    );
    const missingStatus = JSON.parse(capsJson);
    delete missingStatus[0].status;
    await assert.rejects(
      call(false, JSON.stringify(missingStatus)),
      /Published group manifest preimage mismatch/,
      'A replay missing Tool Capability status must be rejected',
    );
    const missingUpdatedAt = JSON.parse(capsJson);
    delete missingUpdatedAt[0].updated_at;
    await assert.rejects(
      call(false, JSON.stringify(missingUpdatedAt)),
      /Published group manifest preimage mismatch/,
      'A replay missing Tool Capability updated_at must be rejected',
    );
    const wrongFitTime = JSON.parse(fitsJson);
    wrongFitTime[0].updated_at = '2000-01-01T00:00:00.000Z';
    await assert.rejects(
      call(false, capsJson, JSON.stringify(wrongFitTime)),
      /Published group manifest preimage mismatch/,
      'A replay with a changed Fit updated_at must be rejected',
    );
    const wrongFitStatus = JSON.parse(fitsJson);
    wrongFitStatus[0].status = 'published';
    await assert.rejects(
      call(false, capsJson, JSON.stringify(wrongFitStatus)),
      /Published group manifest preimage mismatch/,
      'A replay with a changed Fit status must be rejected',
    );
    const missingFitStatus = JSON.parse(fitsJson);
    delete missingFitStatus[0].status;
    await assert.rejects(
      call(false, capsJson, JSON.stringify(missingFitStatus)),
      /Published group manifest preimage mismatch/,
      'A replay missing Fit status must be rejected',
    );
    const missingFitUpdatedAt = JSON.parse(fitsJson);
    delete missingFitUpdatedAt[0].updated_at;
    await assert.rejects(
      call(false, capsJson, JSON.stringify(missingFitUpdatedAt)),
      /Published group manifest preimage mismatch/,
      'A replay missing Fit updated_at must be rejected',
    );
    await db.query(
      "UPDATE tool_capability_claims SET purpose='changed' WHERE tool_capability_id=$1 AND purpose='support'",
      [caps[0]],
    );
    await assert.rejects(
      call(false),
      /Published group manifest preimage mismatch/,
      'Changing a published evidence purpose must reject an otherwise identical publication replay',
    );
    await db.query(
      "UPDATE tool_capability_claims SET purpose='support' WHERE tool_capability_id=$1 AND purpose='changed'",
      [caps[0]],
    );
    await db.query('DELETE FROM tool_capability_claims WHERE tool_capability_id=$1 AND purpose=$2', [
      caps[0],
      'support',
    ]);
    await assert.rejects(
      call(false),
      /Published group manifest preimage mismatch/,
      'Deleting a published evidence link must reject an otherwise identical publication replay',
    );
    await db.query("INSERT INTO tool_capability_claims VALUES ($1,'c7890701-0000-4000-8000-000000000401','support')", [
      caps[0],
    ]);
    await db.query(
      "UPDATE tool_capability_claims SET claim_id='c7890701-0000-4000-8000-000000000402' WHERE tool_capability_id=$1 AND purpose='support'",
      [caps[0]],
    );
    await assert.rejects(
      call(false),
      /Published group manifest preimage mismatch/,
      'Replacing a published evidence claim must reject an otherwise identical publication replay',
    );
    await db.query(
      "UPDATE tool_capability_claims SET claim_id='c7890701-0000-4000-8000-000000000401' WHERE tool_capability_id=$1 AND purpose='support'",
      [caps[0]],
    );
    await db.query(
      "UPDATE product_intelligence_claims SET invalidated_at=now() WHERE id='c7890701-0000-4000-8000-000000000401'",
    );
    await assert.rejects(
      call(false),
      /Published group manifest preimage mismatch/,
      'Invalidated linked evidence must reject an otherwise identical publication replay',
    );
    await db.query(
      "UPDATE product_intelligence_claims SET invalidated_at=NULL WHERE id='c7890701-0000-4000-8000-000000000401'",
    );
    assert.equal(
      (await call(false)).rows[0].value.unchanged,
      true,
      'Restored exact evidence manifest should replay unchanged',
    );
    assert.equal(
      (await db.query('SELECT count(*)::int n FROM product_intelligence_timeline_events')).rows[0].n,
      1,
      'Idempotent replay must not duplicate the audit event',
    );
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM task_capabilities WHERE status='published'")).rows[0].n,
      2,
    );
    await db.query(withdrawalMigration);
    const publishedCaps = await db.query(
      "SELECT jsonb_agg(jsonb_build_object('id',id,'updated_at',updated_at,'status',status) ORDER BY id) value FROM tool_capabilities WHERE tool_id=$1 AND status='published'",
      [toolId],
    );
    const publishedFits = await db.query(
      "SELECT jsonb_build_array(jsonb_build_object('id',id,'updated_at',updated_at,'status',status)) value FROM tool_task_fits WHERE id=$1 AND status='published'",
      [fitId],
    );
    const withdrawCapsJson = JSON.stringify(publishedCaps.rows[0].value);
    const withdrawFitsJson = JSON.stringify(publishedFits.rows[0].value);
    const withdrawal = (preflightOnly: boolean, capabilityManifest = withdrawCapsJson) =>
      db.query('SELECT public.admin_withdraw_task_tool_group($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7) value', [
        taskId,
        toolId,
        capabilityManifest,
        withdrawFitsJson,
        reviewer,
        'rollback QA record 456',
        preflightOnly,
      ]);
    const subset = JSON.stringify(JSON.parse(withdrawCapsJson).slice(0, 1));
    await assert.rejects(
      withdrawal(false, subset),
      /Withdrawal manifest must cover every exact Tool Capability and Fit/,
      'A subset withdrawal manifest must be rejected',
    );
    assert.equal((await withdrawal(true)).rows[0].value.preflight, true);
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM tool_task_fits WHERE status='published'")).rows[0].n,
      1,
      'Withdrawal preflight must not write relation status',
    );
    const staleWithdrawCaps = JSON.parse(withdrawCapsJson);
    staleWithdrawCaps[0].updated_at = '2000-01-01T00:00:00.000Z';
    await assert.rejects(withdrawal(false, JSON.stringify(staleWithdrawCaps)), /Tool Capability preimage drifted/);
    const withdrawn = await withdrawal(false);
    assert.equal(withdrawn.rows[0].value.ok, true);
    assert.equal(
      (await withdrawal(false)).rows[0].value.unchanged,
      true,
      'Exact withdrawal replay with the same reference must return unchanged',
    );
    assert.equal((await db.query("SELECT count(*)::int n FROM tool_capabilities WHERE status='stale'")).rows[0].n, 2);
    assert.equal((await db.query('SELECT status FROM tool_task_fits WHERE id=$1', [fitId])).rows[0].status, 'stale');
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM task_capabilities WHERE status='published'")).rows[0].n,
      2,
      'Withdrawal must leave Task Capabilities unchanged',
    );
    assert.equal(
      (
        await db.query(
          "SELECT count(*)::int n FROM product_intelligence_timeline_events WHERE event_type='decision_withdrawal'",
        )
      ).rows[0].n,
      1,
      'Idempotent withdrawal replay must not duplicate its audit event',
    );
    assert.deepEqual(
      await protectedSnapshot(),
      protectedBefore,
      'Publication/withdrawal must preserve Task, Decision and all evidence links',
    );
    await db.query("SELECT set_config('request.jwt.claim.role','authenticated',false)");
    await assert.rejects(call(false), /service_role and a real reviewer are required/);
    console.log(
      `${perplexity ? 'Perplexity 6/10/7' : 'Gemini 5/10/6'}: bilingual gate, preflight parity, rollback, permissions, replay and scope passed.`,
    );
  } finally {
    await db.end().catch(() => undefined);
    if (localAdmin) {
      if (createdDatabase) await localAdmin.query(`DROP DATABASE "${database}"`);
      await localAdmin.end();
    }
    if (started) execFileSync('pg_ctl', ['-D', dir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv.includes('--static-only')) {
  console.log('CL-02 reviewed tool-group migration, scope, and admin-action structure passed.');
} else {
  main()
    .then(() => main('3d018623-85f9-4df4-bd55-9a4a0e7a2d93'))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

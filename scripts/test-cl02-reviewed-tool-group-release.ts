import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

const migration = readFileSync('db/supabase/migrations/20261004_admin_publish_reviewed_task_tool_group.sql', 'utf8');
const withdrawalMigration = readFileSync('db/supabase/migrations/20261004_admin_withdraw_task_tool_group.sql', 'utf8');
const action = readFileSync('app/actions/admin/decision.ts', 'utf8');
const ui = readFileSync('components/admin/ReviewedTaskToolGroupRelease.tsx', 'utf8');
const preflight = readFileSync('scripts/preflight-cl02-reviewed-relations.ts', 'utf8');
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

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const toolId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const reviewer = 'd7890701-0000-4000-8000-000000000001';
const caps = ['c7890701-0000-4000-8000-000000000201', 'c7890701-0000-4000-8000-000000000202'];
const fitId = 'c7890701-0000-4000-8000-000000000301';

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'cl02-reviewed-group-pg-'));
  const port = 54000 + Math.floor(Math.random() * 9000);
  const db = new Client({ host: dir, port, user: 'postgres', database: 'postgres' });
  let started = false;
  try {
    execFileSync('initdb', ['-A', 'trust', '-U', 'postgres', '-D', dir]);
    execFileSync('pg_ctl', ['-D', dir, '-o', `-F -p ${port} -k ${dir}`, '-w', 'start']);
    started = true;
    await db.connect();
    await db.query(`CREATE SCHEMA auth;
      CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated;
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
      INSERT INTO product_intelligence_profiles VALUES ('c7890701-0000-4000-8000-000000000002','tool','${toolId}','ready',now()+interval '30 days');
      INSERT INTO product_intelligence_sources VALUES ('c7890701-0000-4000-8000-000000000101','c7890701-0000-4000-8000-000000000001','https://support.google.com/gemininotebook/answer/16164461','official','success',now());
      INSERT INTO product_intelligence_claims VALUES ('c7890701-0000-4000-8000-000000000401','c7890701-0000-4000-8000-000000000001','c7890701-0000-4000-8000-000000000101','https://support.google.com/gemininotebook/answer/16164461','official','verified','none',NULL,NULL,now(),'${reviewer}',now()+interval '30 days');
      INSERT INTO product_intelligence_claims VALUES ('c7890701-0000-4000-8000-000000000402','c7890701-0000-4000-8000-000000000001','c7890701-0000-4000-8000-000000000101','https://support.google.com/gemininotebook/answer/16164461','official','verified','none',NULL,NULL,now(),'${reviewer}',now()+interval '30 days');
      INSERT INTO tool_capabilities VALUES
       ('${caps[0]}','${toolId}','50288b6e-a968-4bcf-9e55-911df203e0c7','strong','all_plans','{"en":"Available in current plan; recheck account access."}','["Current plan limits apply."]','reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now()),
       ('${caps[1]}','${toolId}','04930ae8-4c78-487f-a6c9-25680b8da681','strong','all_plans','{"en":"Available in current plan; recheck account access."}','["Current plan limits apply."]','reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now());
      INSERT INTO tool_task_fits VALUES ('${fitId}','${taskId}','${toolId}','conditional',
       '{"en":"Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.","cn":"用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。"}',
       '[{"en":"Accept Google hosting, account and region limits; inspect imported sources and cited passages.","cn":"接受 Google 托管、账号和地区限制；核查导入资料和引文段落。"}]',
       '[{"en":"Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.","cn":"要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。"}]',
       'reviewed','${reviewer}',now(),now()+interval '30 days',NULL,now());
      INSERT INTO tool_capability_claims SELECT id,'c7890701-0000-4000-8000-000000000401',purpose FROM tool_capabilities CROSS JOIN (VALUES('support'),('availability'),('plan'),('limitation')) p(purpose) WHERE tool_id='${toolId}';
      INSERT INTO tool_task_fit_claims VALUES ('${fitId}','c7890701-0000-4000-8000-000000000401','fit'),('${fitId}','c7890701-0000-4000-8000-000000000401','limitation');
      INSERT INTO tool_decision_profile_claims VALUES ('${toolId}','c7890701-0000-4000-8000-000000000401','fit');
      SELECT set_config('request.jwt.claim.role','service_role',false);`);
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
    await db.query("SELECT set_config('request.jwt.claim.role','authenticated',false)");
    await assert.rejects(call(false), /service_role and a real reviewer are required/);
    console.log(
      'CL-02 reviewed tool-group preflight, drift rejection, atomic publication, replay idempotency, and scope passed.',
    );
  } finally {
    await db.end().catch(() => undefined);
    if (started) execFileSync('pg_ctl', ['-D', dir, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv.includes('--static-only')) {
  console.log('CL-02 reviewed tool-group migration, scope, and admin-action structure passed.');
} else {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

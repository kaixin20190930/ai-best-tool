import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

import { batchDigest, buildBatch, canonicalPayload } from './build-app-decision-batch';

const reviewer = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const qa = 'codex-thread:00000000-0000-4000-8000-000000000001';
const migration = readFileSync('db/supabase/migrations/20261013_decision_manifest_batch_intake.sql', 'utf8');
const editorial = readFileSync('db/supabase/migrations/20260925_decision_cluster_editorial_closure.sql', 'utf8');
const officialIntake = editorial.slice(
  editorial.indexOf('CREATE OR REPLACE FUNCTION decision_official_evidence_intake('),
  editorial.indexOf('CREATE OR REPLACE FUNCTION decision_cluster_transition('),
);
const publicationGate = editorial.slice(
  editorial.indexOf('CREATE OR REPLACE FUNCTION decision_cluster_transition('),
  editorial.indexOf('REVOKE ALL ON FUNCTION decision_official_evidence_intake('),
);
const capabilityFoundation = readFileSync('db/supabase/migrations/20260922_decision_capability_foundation.sql','utf8');
const capabilityEvidenceTrigger = capabilityFoundation.slice(
  capabilityFoundation.indexOf('CREATE OR REPLACE FUNCTION assert_active_verified_tool_capability_claim()'),
  capabilityFoundation.indexOf('CREATE OR REPLACE FUNCTION assert_tool_capability_publishable()'),
);
const decisionFoundation = readFileSync('db/supabase/migrations/20260902_decision_finder_foundation.sql','utf8');
const decisionEvidenceTrigger = decisionFoundation.slice(
  decisionFoundation.indexOf('CREATE OR REPLACE FUNCTION assert_active_verified_decision_claim()'),
  decisionFoundation.indexOf('DROP TRIGGER IF EXISTS relationship_claim_must_be_verified'),
);

async function main() {
  const editorialManifest = JSON.parse(readFileSync(
    'data/decision-graph/build-app-decision-closeout-2026-10-13.json','utf8'));
  const real = buildBatch(editorialManifest,reviewer,qa);
  assert.deepEqual(real.tools.map((tool) => ({slug:tool.slug,claims:tool.expectedClaims})),[
    {slug:'bolt',claims:8},
    {slug:'lovable',claims:9},
    {slug:'v0',claims:8},
  ],'The real write set must contain the three evidence-ready tools');
  assert.equal(real.tools.reduce((total,tool) => total + tool.expectedClaims,0),25,
    'The real write set must contain exactly 25 claims');
  assert.equal(real.tools.some((tool) => tool.slug === 'replit'),false,
    'Replit must remain outside the real write set');
  const fixture = JSON.parse(JSON.stringify(editorialManifest));
  for (const tool of fixture.tools) {
    tool.writeEligibility='READY';
    if (tool.slug==='replit') tool.availability='all_plans';
    for (const claim of tool.newClaims) {
      claim.sourceExcerpt='SYNTHETIC LOCAL PG FIXTURE ONLY; NOT OFFICIAL EVIDENCE.';
      claim.excerptVerifiedAt='2026-10-13';
    }
  }
  const fixtureEvidence = (path: string) => {
    const value = JSON.parse(readFileSync(path,'utf8'));
    for (const tool of value.tools) for (const claim of tool.claims) {
      claim.sourceExcerpt='SYNTHETIC LOCAL PG FIXTURE ONLY; NOT OFFICIAL EVIDENCE.';
      claim.excerptVerifiedAt='2026-10-13';
    }
    return value;
  };
  const batch = buildBatch(fixture,reviewer,qa,fixtureEvidence);
  const holdFixture = JSON.parse(JSON.stringify(fixture));
  holdFixture.tools[3].decision='HOLD_EVIDENCE';
  assert.deepEqual(buildBatch(holdFixture,reviewer,qa,fixtureEvidence).tools.map((tool: any) => tool.slug),
    ['bolt','lovable','replit'],'HOLD tool must be excluded from the write set');
  const dir = mkdtempSync(join(tmpdir(), 'build-app-decision-pg-'));
  const port = 54000 + Math.floor(Math.random() * 9000);
  const db = new Client({ host: dir, port, user: 'postgres', database: 'postgres' });
  let started = false;
  try {
    execFileSync('initdb', ['-A', 'trust', '-U', 'postgres', '-D', dir], { stdio: 'ignore' });
    execFileSync('pg_ctl', ['-D', dir, '-o', `-F -p ${port} -k ${dir}`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    await db.connect();
    await db.query(`
      CREATE EXTENSION pgcrypto;
      CREATE SCHEMA auth;
      CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated;
      CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$
        SELECT current_setting('request.jwt.claim.role',true) $$;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      INSERT INTO auth.users VALUES ('${reviewer}');
      CREATE TABLE decision_tasks(id uuid PRIMARY KEY,slug text,status text);
      CREATE TABLE decision_capabilities(id uuid PRIMARY KEY,status text);
      CREATE TABLE task_capabilities(task_id uuid,capability_id uuid,status text,updated_at timestamptz,
        reviewed_by uuid,reviewed_at timestamptz,review_due_at timestamptz,rationale jsonb,
        last_edited_by uuid);
      CREATE TABLE product_intelligence_profiles(id uuid PRIMARY KEY,owner_type text,owner_id uuid,
        canonical_domain text,product_name text,profile_status text,last_verified_at timestamptz,
        next_review_at timestamptz,metadata jsonb,updated_at timestamptz DEFAULT now(),
        UNIQUE(owner_type,owner_id),CHECK(profile_status IN ('ready','pending','conflict','stale')));
      CREATE TABLE product_intelligence_sources(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid REFERENCES product_intelligence_profiles(id),url text,canonical_url text,
        source_type text,source_label text,last_verified_at timestamptz,metadata jsonb,
        CHECK(source_type IN ('official','community','third_party','unknown')),
        UNIQUE(profile_id,url));
      CREATE TABLE product_intelligence_claims(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid REFERENCES product_intelligence_profiles(id),claim_type text,claim_key text,
        claim_value jsonb,source_id uuid REFERENCES product_intelligence_sources(id),source_url text,
        source_excerpt text,observed_at timestamptz,
        source_type text,verification_status text,verified_at timestamptz,verified_by uuid,
        verification_note text,review_due_at timestamptz,validity_scope jsonb,conflict_status text DEFAULT 'none',
        invalidated_at timestamptz,expires_at timestamptz,
        CHECK(verification_status IN ('verified','candidate','rejected','superseded')));
      CREATE TABLE product_intelligence_timeline_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid REFERENCES product_intelligence_profiles(id),event_type text,review_scope text,
        claim_type text,claim_key text,title text,
        summary text,old_value jsonb,new_value jsonb,source_url text,source_excerpt text,
        visibility text,occurred_at timestamptz,verified_at timestamptz,verified_by uuid,
        review_note text,metadata jsonb);
      CREATE TABLE tool_decision_profiles(tool_id uuid PRIMARY KEY,setup_complexity text,data_training_use text,
        self_host_level text,export_level text,decision_summary jsonb,watch_outs jsonb,
        editorial_status text,reviewed_at timestamptz,review_due_at timestamptz,reviewed_by uuid,
        updated_at timestamptz DEFAULT now());
      CREATE TABLE tool_capabilities(id uuid PRIMARY KEY,tool_id uuid,
        capability_id uuid REFERENCES decision_capabilities(id),support_level text,
        availability text,plan_requirement jsonb,limitations jsonb,status text,reviewed_at timestamptz,
        review_due_at timestamptz,reviewed_by uuid,last_edited_by uuid,updated_at timestamptz DEFAULT now(),
        UNIQUE(tool_id,capability_id),CHECK(jsonb_typeof(limitations)='array'),
        CHECK(status IN ('draft','reviewed','published','stale')));
      CREATE TABLE tool_task_fits(id uuid PRIMARY KEY,tool_id uuid,task_id uuid,fit_level text,rationale jsonb,
        required_conditions jsonb,disqualifiers jsonb,status text,reviewed_at timestamptz,
        review_due_at timestamptz,reviewed_by uuid,last_edited_by uuid,updated_at timestamptz DEFAULT now());
      CREATE TABLE tool_capability_claims(tool_capability_id uuid REFERENCES tool_capabilities(id),
        claim_id uuid REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,purpose text,
        PRIMARY KEY(tool_capability_id,claim_id,purpose));
      CREATE TABLE tool_task_fit_claims(fit_id uuid REFERENCES tool_task_fits(id),
        claim_id uuid REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,purpose text,
        PRIMARY KEY(fit_id,claim_id,purpose));
      CREATE TABLE tool_decision_profile_claims(tool_id uuid REFERENCES tool_decision_profiles(tool_id),
        claim_id uuid REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,purpose text,
        PRIMARY KEY(tool_id,claim_id,purpose));
      INSERT INTO decision_tasks VALUES ('${batch.taskId}','build-app-with-ai','active');
      INSERT INTO decision_capabilities VALUES ('${batch.capabilityId}','active');
      INSERT INTO decision_capabilities VALUES ('136ae3d3-9468-4445-a01d-8f2aaef53b97','active');
      INSERT INTO product_intelligence_profiles
        (id,owner_type,owner_id,canonical_domain,product_name,profile_status,metadata)
      VALUES ('00000000-0000-4000-8000-000000000099','tool',
        '00000000-0000-4000-8000-000000000099','other.example','Sentinel','ready','{}');
      SELECT set_config('request.jwt.claim.role','service_role',false);
    `);
    for (const row of batch.taskPreimage) {
      await db.query(`INSERT INTO task_capabilities
        (task_id,capability_id,status,updated_at,reviewed_by,reviewed_at,review_due_at,rationale)
        VALUES ($1,$2,'reviewed',$3,$4,$5,$6,$7::jsonb)`,
        [batch.taskId, row.id, row.updated_at, reviewer,row.reviewed_at,row.review_due_at,
          JSON.stringify({ en: 'A substantive reviewable implementation and delivery workflow.' })]);
    }
    await db.query(officialIntake);
    await db.query(capabilityEvidenceTrigger);
    await db.query(decisionEvidenceTrigger);
    await db.query(migration);
    await db.query(publicationGate);
    const signature = 'public.decision_manifest_batch_intake(uuid,uuid,jsonb,jsonb,text,uuid,text,boolean)';
    const privileges = (await db.query(`SELECT
      has_function_privilege('anon',$1,'EXECUTE') anon,
      has_function_privilege('authenticated',$1,'EXECUTE') authenticated,
      has_function_privilege('service_role',$1,'EXECUTE') service_role`,[signature])).rows[0];
    assert.deepEqual(privileges,{anon:false,authenticated:false,service_role:true});
    const args = [batch.taskId,batch.capabilityId,JSON.stringify(batch.taskPreimage),
      JSON.stringify(batch.tools),batch.batchHash,reviewer,qa];
    const payloadArgs = (tools: any[], taskPreimage = batch.taskPreimage, hash?: string) => [
      batch.taskId,batch.capabilityId,JSON.stringify(taskPreimage),JSON.stringify(tools),
      hash || batchDigest({ taskId:batch.taskId,capabilityId:batch.capabilityId,
        taskPreimage,tools,reviewer,qaReference:qa }),reviewer,qa,
    ];
    const envelope = { taskId:batch.taskId,capabilityId:batch.capabilityId,
      taskPreimage:batch.taskPreimage,tools:batch.tools,reviewer,qaReference:qa };
    const canonical = (await db.query(
      'SELECT public.decision_manifest_canonical_jsonb($1::jsonb) value',[JSON.stringify(envelope)]
    )).rows[0].value;
    assert.equal(canonical,canonicalPayload(envelope),'Client and database canonical payload differ');
    const intake = (commit: boolean, payload = args) => db.query(
      `SELECT public.decision_manifest_batch_intake($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,$8) value`,
      [...payload,commit]);
    const revert = (commit: boolean) => db.query(
      `SELECT public.decision_manifest_batch_revert($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,$8) value`,
      [...args,commit]);
    const counts = async () => (await db.query(`SELECT
      (SELECT count(*)::int FROM product_intelligence_profiles) profiles,
      (SELECT count(*)::int FROM product_intelligence_sources) sources,
      (SELECT count(*)::int FROM product_intelligence_claims) claims,
      (SELECT count(*)::int FROM product_intelligence_timeline_events) timeline,
      (SELECT count(*)::int FROM tool_capabilities) capabilities,
      (SELECT count(*)::int FROM tool_task_fits) fits,
      (SELECT count(*)::int FROM decision_manifest_batch_records) records,
      (SELECT count(*)::int FROM tool_capability_claims)+
      (SELECT count(*)::int FROM tool_task_fit_claims)+
      (SELECT count(*)::int FROM tool_decision_profile_claims) links`)).rows[0];
    const baseline = await counts();
    const missingTaskField = JSON.parse(JSON.stringify(batch.taskPreimage));
    delete missingTaskField[0].reviewed_at;
    await assert.rejects(intake(true,payloadArgs(batch.tools,missingTaskField)),
      /Task Capability preimage is incomplete/);
    assert.deepEqual(await counts(),baseline);
    const badSource = JSON.parse(JSON.stringify(batch.tools));
    badSource[3].claims[0].sourceUrl = 'https://unrelated.example/claim';
    await assert.rejects(intake(true,payloadArgs(badSource)),
      /Official excerpt|Official HTTPS|canonical domain/);
    assert.deepEqual(await counts(),baseline,'A late tool failure must roll back the whole batch');
    assert.equal((await intake(false)).rows[0].value.mode,'preflight_rolled_back');
    assert.deepEqual(await counts(),baseline,'Preflight must not persist');
    const committed = (await intake(true)).rows[0].value;
    assert.equal(committed.mode,'committed');
    assert.equal(committed.results.length,4);
    const after = await counts();
    assert.deepEqual(after,{ profiles: 5,sources: after.sources,claims:35,timeline:35,
      capabilities:4,fits:4,records:4,links:28 });
    assert.ok(after.sources >= 8);
    const caps = (await db.query(`SELECT id,status,updated_at::text FROM tool_capabilities ORDER BY id`)).rows;
    const fits = (await db.query(`SELECT id,status,updated_at::text FROM tool_task_fits ORDER BY id`)).rows;
    const publication = await db.query(`SELECT public.decision_cluster_transition(
      $1,$2::jsonb,$3::jsonb,$4::jsonb,'publish',$5,$6,true) value`,[
      batch.taskId,JSON.stringify(batch.taskPreimage),
      JSON.stringify(caps),JSON.stringify(fits),reviewer,qa]);
    assert.equal(publication.rows[0].value.ok,true,'Existing publication RPC must accept intake postimage');
    assert.equal((await intake(true)).rows[0].value.results.every((row: any) => row.writes === 0),true);
    assert.deepEqual(await counts(),after,'Idempotent replay must not write');
    assert.equal((await revert(false)).rows[0].value.mode,'revert_preflight_rolled_back');
    assert.deepEqual(await counts(),after,'Revert preflight must not persist');
    const changed = JSON.parse(JSON.stringify(batch.tools));
    changed[0].claims[0].summary += ' unauthorized drift';
    await assert.rejects(intake(true,[...args.slice(0,3),JSON.stringify(changed),...args.slice(4)]),
      /payload hash differs/);
    const claimId = (await db.query(`SELECT id FROM product_intelligence_claims
      WHERE profile_id=$1 LIMIT 1`,[batch.tools[0].profileId])).rows[0].id;
    const oldDue = (await db.query(`SELECT review_due_at::text value FROM product_intelligence_claims
      WHERE id=$1`,[claimId])).rows[0].value;
    await db.query(`UPDATE product_intelligence_claims SET review_due_at=now()-interval '1 day' WHERE id=$1`,[claimId]);
    await assert.rejects(intake(true),/drifted or evidence expired/);
    await db.query(`UPDATE product_intelligence_claims SET review_due_at=$1 WHERE id=$2`,[oldDue,claimId]);
    const extraSource = (await db.query(`INSERT INTO product_intelligence_sources
      (profile_id,url,canonical_url,source_type,source_label,metadata)
      VALUES ($1,'https://bolt.new/extra','https://bolt.new/extra','official','Extra','{}') RETURNING id`,
      [batch.tools[0].profileId])).rows[0].id;
    await assert.rejects(revert(true),/postimage drifted/,'Additional Source must block revert');
    await db.query('DELETE FROM product_intelligence_sources WHERE id=$1',[extraSource]);
    await db.query('UPDATE tool_capabilities SET updated_at=updated_at+interval \'1 second\' WHERE id=$1',
      [batch.tools[0].capabilityId]);
    await assert.rejects(intake(true),/drifted/,'Relation version drift must fail closed');
    await db.query('UPDATE tool_capabilities SET updated_at=updated_at-interval \'1 second\' WHERE id=$1',
      [batch.tools[0].capabilityId]);
    await db.query(`UPDATE tool_capabilities SET status='published' WHERE id=$1`,
      [batch.tools[0].capabilityId]);
    await assert.rejects(revert(true),/postimage drifted/,'Published relation must block revert');
    await db.query(`UPDATE tool_capabilities SET status='reviewed' WHERE id=$1`,
      [batch.tools[0].capabilityId]);
    const blocker = new Client({ host:dir,port,user:'postgres',database:'postgres' });
    await blocker.connect();
    try {
      await blocker.query('BEGIN');
      await blocker.query(`UPDATE product_intelligence_sources SET source_label=source_label
        WHERE profile_id=$1`,[batch.tools[0].profileId]);
      await db.query(`SET lock_timeout='100ms'`);
      await assert.rejects(intake(true),/lock timeout/,'Concurrent source writer must block the batch');
      await db.query('RESET lock_timeout');
    } finally {
      await blocker.query('ROLLBACK');
      await blocker.end();
    }
    assert.equal((await intake(true)).rows[0].value.results.every((row: any) => row.writes===0),true);
    await db.query('SET ROLE anon');
    await assert.rejects(intake(true),/permission denied/,'anon must lack actual EXECUTE privilege');
    await db.query('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claim.role','authenticated',false)`);
    await assert.rejects(intake(true),/service_role required/);
    await db.query(`SELECT set_config('request.jwt.claim.role','service_role',false)`);
    assert.equal((await revert(true)).rows[0].value.mode,'reverted');
    assert.deepEqual(await counts(),baseline,'Exact revert must preserve sentinel and restore preimage');
    console.log(JSON.stringify({ ok:true,fixture:'SYNTHETIC_LOCAL_ONLY',realWriteSet:0,
      batchHash:batch.batchHash,tools:4,verifiedClaims:35,
      tested:['canonical hash','tampered hash','missing task field','preflight rollback',
        'atomic commit','idempotent replay','expired claim','extra source',
        'concurrent writer','published revert refusal','role EXECUTE denial',
        'exact revert','non-target sentinel','existing publication preflight'] }));
  } finally {
    try { await db.end(); } catch { /* connection may not have opened */ }
    if (started) execFileSync('pg_ctl',['-D',dir,'-m','immediate','-w','stop'],{stdio:'ignore'});
    rmSync(dir,{recursive:true,force:true});
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

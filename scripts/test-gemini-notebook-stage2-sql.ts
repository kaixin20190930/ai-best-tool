import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

import { stage2StateMd5, postgresJsonbText, type Stage2State } from './gemini-notebook-stage2-state';

const candidate = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_candidate.sql','utf8');
const amendment = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_source_url_amendment.sql','utf8');
const review = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_review_links.sql','utf8');
const rollback = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_rollback.sql','utf8');
const verifier = readFileSync('scripts/verify-gemini-notebook-stage2-readonly.ts','utf8');
for (const sql of [review,rollback]) {
  assert.match(sql,/^BEGIN;/m);
  assert.match(sql,/^ROLLBACK;\s*$/m);
  assert.doesNotMatch(sql,/^COMMIT;/m);
  assert.doesNotMatch(sql,/CREATE\s+(?:UNLOGGED\s+)?TABLE\s+(?!pg_temp)/i);
  assert.doesNotMatch(sql,/decision_cluster_transition\s*\(/i);
}
assert.match(candidate,/^CREATE OR REPLACE FUNCTION pg_temp\.gemini_notebook_stage2_candidate\(p_mode text\)/m);
assert.match(candidate,/stage2_preflight_rollback/);
assert.match(candidate,/SELECT \* FROM pg_temp\.gemini_notebook_stage2_candidate\('ROLLBACK'\);\s*$/);
assert.doesNotMatch(candidate,/^BEGIN;|^COMMIT;/m);
assert.match(candidate,/verification_status='candidate'/);
assert.match(candidate,/editorial_status='draft'/);
assert.match(candidate,/answer\/16164461','help'/);
assert.doesNotMatch(candidate,/answer\/16164461\?hl=en/);
assert.match(verifier,/answer\/16164461',/);
assert.doesNotMatch(verifier,/answer\/16164461\?hl=en/);
assert.match(amendment,/v_prior_md5 <> '769d65d12796a59bc33dd66117ebbc74'/);
assert.match(amendment,/stage2_source_url_preflight_rollback/);
assert.match(amendment,/SELECT \* FROM pg_temp\.gemini_notebook_stage2_source_url_amendment\('ROLLBACK'\);\s*$/);
assert.doesNotMatch(amendment,/^BEGIN;|^COMMIT;/m);
assert.match(review,/reviewer.*auth\.users/s);
assert.match(review,/Stage 2 requires RLS enabled on all nine Supabase tables/);
assert.match(review,/000000000406','export'/);
assert.match(candidate,/YouTube import depends on available captions and imports caption text, not embedded video or audio/);
assert.doesNotMatch(candidate,/omit media, captions/i);
assert.match(verifier,/Task Page opened/);
assert.match(verifier,/\[406,'export'\]/);
assert.match(verifier,/productionWrites:0/);
assert.doesNotMatch(verifier,/\.insert\(|\.update\(|\.delete\(|\.upsert\(/);
const hashExpression = (sql: string) => {
  const match=[...sql.matchAll(/SELECT md5\(jsonb_build_object\(([\s\S]*?)\)\:\:text\) INTO v_[a-z]+_md5;/g)].at(-1);
  assert.ok(match,'SQL postimage hash expression missing');
  return match[1];
};
assert.equal(hashExpression(candidate),hashExpression(review),'candidate and review hash fields/order differ');
assert.equal(hashExpression(candidate),hashExpression(rollback),'candidate and rollback hash fields/order differ');
assert.equal(hashExpression(candidate).replace(/\s+/g,' '),hashExpression(amendment).replace(/\s+/g,' '),
  'candidate and amendment hash fields/order differ');

const commit = (sql: string) => sql.replace(/ROLLBACK;\s*$/, 'COMMIT;');
const newUrl='https://support.google.com/gemininotebook/answer/16164461';
const oldUrl=`${newUrl}?hl=en`;
const legacyCandidate=candidate.replace(newUrl,oldUrl);
const commitLegacyCandidate = legacyCandidate.replace(/gemini_notebook_stage2_candidate\('ROLLBACK'\);\s*$/,
  "gemini_notebook_stage2_candidate('COMMIT');");
const commitAmendment = (sql: string) => sql.replace(/gemini_notebook_stage2_source_url_amendment\('ROLLBACK'\);\s*$/,
  "gemini_notebook_stage2_source_url_amendment('COMMIT');");
const taskId='527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const reviewer='d7890701-0000-4000-8000-000000000001';
const reviewerEmail='reviewer@example.test';

async function main() {
  const dir=mkdtempSync(join(tmpdir(),'gemini-stage2-pg-'));
  const port=54000+Math.floor(Math.random()*9000);
  const db=new Client({host:dir,port,user:'postgres',database:'postgres'});
  let started=false;
  let postHash='';
  try {
    execFileSync('initdb',['-A','trust','-U','postgres','-D',dir],{stdio:'ignore'});
    execFileSync('pg_ctl',['-D',dir,'-o',`-F -p ${port} -k ${dir}`,'-w','start'],{stdio:'ignore'});
    started=true;
    await db.connect();
    db.on('notice',(notice) => { const match=notice.message?.match(/POST_MD5 ([0-9a-f]{32})/); if(match) postHash=match[1]; });
    await db.query(`CREATE SCHEMA auth;
      CREATE TABLE auth.users (id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb,raw_app_meta_data jsonb);
      INSERT INTO auth.users VALUES ('${reviewer}','${reviewerEmail}','{"role":"admin"}','{}');
      CREATE TABLE decision_tasks(id uuid PRIMARY KEY,slug text,status text);
      INSERT INTO decision_tasks VALUES ('${taskId}','research-with-citations','active');
      CREATE TABLE decision_capabilities(id uuid PRIMARY KEY,slug text,status text);
      INSERT INTO decision_capabilities VALUES
        ('50288b6e-a968-4bcf-9e55-911df203e0c7','research-discovery','active'),
        ('04930ae8-4c78-487f-a6c9-25680b8da681','citation-traceability','active');
      CREATE TABLE product_intelligence_profiles(
        id uuid PRIMARY KEY,owner_type text,owner_id uuid,canonical_domain text,product_name text,
        profile_status text,next_review_at timestamptz,last_verified_at timestamptz,
        metadata jsonb DEFAULT '{}',created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),
        UNIQUE(owner_type,owner_id));
      CREATE TABLE product_intelligence_sources(
        id uuid PRIMARY KEY,profile_id uuid REFERENCES product_intelligence_profiles(id),url text,
        canonical_url text,page_type text,source_type text,source_label text,publisher_name text,
        fetch_status text,metadata jsonb DEFAULT '{}',fetched_at timestamptz,last_verified_at timestamptz,
        http_status integer,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),
        UNIQUE(profile_id,url));
      CREATE TABLE product_intelligence_claims(
        id uuid PRIMARY KEY,profile_id uuid REFERENCES product_intelligence_profiles(id),claim_type text,
        claim_key text,claim_value jsonb,source_id uuid REFERENCES product_intelligence_sources(id),
        source_url text,source_type text,confidence integer,conflict_status text,
        verification_status text,validity_scope jsonb,metadata jsonb DEFAULT '{}',
        source_excerpt text,verified_at timestamptz,verified_by uuid,review_due_at timestamptz,
        invalidated_at timestamptz,expires_at timestamptz,verification_note text,
        observed_at timestamptz DEFAULT now(),created_at timestamptz DEFAULT now());
      CREATE TABLE tool_decision_profiles(
        tool_id uuid PRIMARY KEY,setup_complexity text,data_training_use text,self_host_level text,
        export_level text,decision_summary jsonb,watch_outs jsonb,editorial_status text,
        reviewed_at timestamptz,review_due_at timestamptz,reviewed_by uuid,
        created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
      CREATE TABLE tool_capabilities(
        id uuid PRIMARY KEY,tool_id uuid,capability_id uuid REFERENCES decision_capabilities(id),
        support_level text,availability text,plan_requirement jsonb,limitations jsonb,status text,
        reviewed_at timestamptz,review_due_at timestamptz,reviewed_by uuid,last_edited_by uuid,
        created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),UNIQUE(tool_id,capability_id));
      CREATE TABLE tool_task_fits(
        id uuid PRIMARY KEY,tool_id uuid,task_id uuid REFERENCES decision_tasks(id),fit_level text,
        rationale jsonb,required_conditions jsonb,disqualifiers jsonb,status text,
        reviewed_at timestamptz,review_due_at timestamptz,reviewed_by uuid,last_edited_by uuid,
        created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),UNIQUE(tool_id,task_id));
      CREATE TABLE tool_decision_profile_claims(tool_id uuid REFERENCES tool_decision_profiles(tool_id),
        claim_id uuid REFERENCES product_intelligence_claims(id),purpose text,created_at timestamptz DEFAULT now(),
        PRIMARY KEY(tool_id,claim_id,purpose));
      CREATE TABLE tool_capability_claims(tool_capability_id uuid REFERENCES tool_capabilities(id),
        claim_id uuid REFERENCES product_intelligence_claims(id),purpose text,created_at timestamptz DEFAULT now(),
        PRIMARY KEY(tool_capability_id,claim_id,purpose));
      CREATE TABLE tool_task_fit_claims(fit_id uuid REFERENCES tool_task_fits(id),
        claim_id uuid REFERENCES product_intelligence_claims(id),purpose text,created_at timestamptz DEFAULT now(),
        PRIMARY KEY(fit_id,claim_id,purpose));
      CREATE TABLE tool_relationships(tool_id uuid,related_tool_id uuid);
      ALTER TABLE product_intelligence_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_intelligence_sources ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_intelligence_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_decision_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_capabilities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_task_fits ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_decision_profile_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_capability_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tool_task_fit_claims ENABLE ROW LEVEL SECURITY;
    `);
    const count=async(table:string)=>Number((await db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n);
    const rows=async(table:string,where:string,order:string)=>
      (await db.query(`SELECT to_jsonb(t) AS value FROM ${table} t ${where} ORDER BY ${order}`)).rows.map((x)=>x.value);
    const state=async():Promise<Stage2State>=>({
      profile:(await rows('product_intelligence_profiles',"WHERE id='c7890701-0000-4000-8000-000000000001'",'id'))[0]||null,
      sources:await rows('product_intelligence_sources',"WHERE profile_id='c7890701-0000-4000-8000-000000000001'",'id'),
      claims:await rows('product_intelligence_claims',"WHERE profile_id='c7890701-0000-4000-8000-000000000001'",'id'),
      decision:(await rows('tool_decision_profiles',"WHERE tool_id='cec78907-e2a1-4eb7-853a-a58334026280'",'tool_id'))[0]||null,
      capabilities:await rows('tool_capabilities',"WHERE tool_id='cec78907-e2a1-4eb7-853a-a58334026280'",'id'),
      fit:(await rows('tool_task_fits',"WHERE id='c7890701-0000-4000-8000-000000000301'",'id'))[0]||null,
      decisionLinks:await rows('tool_decision_profile_claims',"WHERE tool_id='cec78907-e2a1-4eb7-853a-a58334026280'",'claim_id,purpose'),
      capabilityLinks:await rows('tool_capability_claims',"WHERE tool_capability_id IN ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202')",'tool_capability_id,claim_id,purpose'),
      fitLinks:await rows('tool_task_fit_claims',"WHERE fit_id='c7890701-0000-4000-8000-000000000301'",'claim_id,purpose'),
    });
    const jsonbSample=(await db.query(`SELECT '{"zz": [1, {"a": "资料", "bbb": true}], "a": null}'::jsonb::text AS value`)).rows[0].value;
    assert.equal(postgresJsonbText({zz:[1,{a:'资料',bbb:true}],a:null}),jsonbSample);
    const resultRow=(result:any)=> (Array.isArray(result) ? result.at(-1) : result).rows[0];
    const preview=resultRow(await db.query(candidate));
    assert.equal(preview.mode,'preflight');
    assert.equal(preview.preflight,true);
    assert.deepEqual([preview.profiles,preview.sources,preview.claims,preview.decision,
      preview.capabilities,preview.fit,preview.links],[1,7,10,1,2,1,0]);
    assert.match(preview.post_md5,/^[0-9a-f]{32}$/);
    assert.equal(await count('product_intelligence_profiles'),0,'default preflight wrote data');
    await assert.rejects(db.query(`SELECT * FROM pg_temp.gemini_notebook_stage2_candidate(NULL)`),/Use ROLLBACK/);
    await assert.rejects(db.query(`SELECT * FROM pg_temp.gemini_notebook_stage2_candidate('WRONG')`),/Use ROLLBACK/);
    assert.equal(await count('product_intelligence_profiles'),0,'invalid mode wrote data');
    const committed=resultRow(await db.query(commitLegacyCandidate));
    assert.equal(committed.mode,'committed');
    assert.equal(committed.preflight,false);
    postHash=committed.post_md5;
    assert.equal(await count('product_intelligence_profiles'),1);
    assert.equal(await count('product_intelligence_sources'),7);
    assert.equal(await count('product_intelligence_claims'),10);
    assert.equal(await count('tool_capabilities'),2);
    assert.equal(await count('tool_task_fits'),1);
    const candidateHash=postHash;
    assert.equal(stage2StateMd5(await state()),candidateHash,'candidate verifier hash differs from SQL postimage');
    postHash=resultRow(await db.query(commitLegacyCandidate)).post_md5;
    assert.equal(postHash,candidateHash,'candidate rerun changed postimage');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"drift":true}' WHERE claim_key='gemini-notebook:research:grounding-2026-10'`);
    await assert.rejects(db.query(commitLegacyCandidate),/Ten exact candidate claims required/);
    await db.query('ROLLBACK');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"summary":"Notebook chat answers from selected sources with inline citations; citation accuracy was not independently tested by this site."}' WHERE claim_key='gemini-notebook:research:grounding-2026-10'`);
    assert.equal(stage2StateMd5(await state()),candidateHash);
    await assert.rejects(db.query(amendment),/prior stateMd5 drift/,'literal production hash must reject fixture hash');
    const fixtureAmendment=amendment.replaceAll('769d65d12796a59bc33dd66117ebbc74',candidateHash);
    const beforeAmendment=await state();
    const amendmentPreview=resultRow(await db.query(fixtureAmendment));
    assert.deepEqual([amendmentPreview.mode,amendmentPreview.changed_sources,amendmentPreview.changed_claims],
      ['preflight',1,2]);
    assert.match(amendmentPreview.post_md5,/^[0-9a-f]{32}$/);
    assert.deepEqual(await state(),beforeAmendment,'amendment preflight left writes');
    await assert.rejects(db.query(`SELECT * FROM pg_temp.gemini_notebook_stage2_source_url_amendment('WRONG')`),/Use ROLLBACK/);
    await db.query('ALTER TABLE product_intelligence_sources DISABLE ROW LEVEL SECURITY');
    await assert.rejects(db.query(commitAmendment(fixtureAmendment)),/Stage 2 requires RLS enabled on all nine Supabase tables/);
    await db.query('ALTER TABLE product_intelligence_sources ENABLE ROW LEVEL SECURITY');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"drift":true}' WHERE claim_key='gemini-notebook:research:identity-2026-10'`);
    await assert.rejects(db.query(commitAmendment(fixtureAmendment)),/prior stateMd5 drift/);
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"summary":"NotebookLM was renamed Gemini Notebook on 2026-07-16; it remains the same standalone product."}' WHERE claim_key='gemini-notebook:research:identity-2026-10'`);
    assert.equal(stage2StateMd5(await state()),candidateHash);
    const amended=resultRow(await db.query(commitAmendment(fixtureAmendment)));
    assert.deepEqual([amended.mode,amended.changed_sources,amended.changed_claims],['committed',1,2]);
    assert.equal(amended.post_md5,amendmentPreview.post_md5);
    const expectedAmended:Stage2State=structuredClone(beforeAmendment);
    const amendedSource=expectedAmended.sources.find((x)=>x.id==='c7890701-0000-4000-8000-000000000102');
    assert.ok(amendedSource);
    amendedSource.url=newUrl;
    amendedSource.canonical_url=newUrl;
    for(const claim of expectedAmended.claims.filter((x)=>
      ['c7890701-0000-4000-8000-000000000402','c7890701-0000-4000-8000-000000000410'].includes(String(x.id)))) {
      claim.source_url=newUrl;
    }
    assert.deepEqual(await state(),expectedAmended,'amendment changed fields beyond source 102 and claims 402/410');
    assert.equal(stage2StateMd5(await state()),amended.post_md5,'candidate verifier hash differs from amendment postimage');
    await assert.rejects(db.query(commitAmendment(fixtureAmendment)),/prior stateMd5 drift/,'repeat amendment must reject');
    const keys=(await db.query('SELECT claim_key FROM product_intelligence_claims')).rows.map((x)=>x.claim_key.replace('gemini-notebook:research:',''));
    const excerpts=Object.fromEntries(keys.map((key)=>[key,`Official passage checked for ${key} by the independent reviewer.`]));
    const ownerGate=`APPROVE_GEMINI_STAGE2:${reviewer}:${reviewerEmail}:USER_METADATA_ROLE`;
    const configured=review
      .replace('00000000-0000-0000-0000-000000000000',reviewer)
      .replace('REPLACE_WITH_EXACT_REVIEWER_EMAIL',reviewerEmail)
      .replace('REPLACE_WITH_USER_METADATA_ROLE_OR_ADMIN_EMAILS','USER_METADATA_ROLE')
      .replace('REPLACE_WITH_EXACT_OWNER_APPROVAL',ownerGate)
      .replace('REPLACE_WITH_INDEPENDENT_REVIEW_REFERENCE','QA-2026-10-01-independent')
      .replace('REPLACE_WITH_ORIGINAL_PRIOR_POST_MD5',amended.post_md5)
      .replace("SET LOCAL gemini.stage2.excerpts = '{}';",`SET LOCAL gemini.stage2.excerpts = '${JSON.stringify(excerpts)}';`);
    const nonAdmin='d7890701-0000-4000-8000-000000000002';
    const nonAdminEmail='nonadmin@example.test';
    await db.query(`INSERT INTO auth.users VALUES ($1,$2,'{"role":"user"}','{}')`,[nonAdmin,nonAdminEmail]);
    await assert.rejects(db.query(commit(configured.replaceAll(reviewer,nonAdmin))),/Reviewer UUID\/email mismatch or app admin basis missing/);
    await db.query('ROLLBACK');
    const missingReviewer='d7890701-0000-4000-8000-000000000003';
    await assert.rejects(db.query(commit(configured.replaceAll(reviewer,missingReviewer))),/Reviewer UUID\/email mismatch or app admin basis missing/);
    await db.query('ROLLBACK');
    await assert.rejects(db.query(commit(configured.replaceAll(reviewerEmail,'wrong@example.test'))),/Reviewer UUID\/email mismatch or app admin basis missing/);
    await db.query('ROLLBACK');
    await assert.rejects(db.query(commit(configured.replaceAll(reviewerEmail,''))),/Exact Owner approval/);
    await db.query('ROLLBACK');
    await assert.rejects(db.query(commit(configured.replace(ownerGate,'REPLACE_WITH_EXACT_OWNER_APPROVAL'))),/Exact Owner approval/);
    await db.query('ROLLBACK');
    await db.query(`ALTER TABLE tool_task_fit_claims DISABLE ROW LEVEL SECURITY`);
    await assert.rejects(db.query(commit(configured)),/Stage 2 requires RLS enabled on all nine Supabase tables/);
    await db.query('ROLLBACK');
    await db.query(`ALTER TABLE tool_task_fit_claims ENABLE ROW LEVEL SECURITY`);
    const allowlistGate=`APPROVE_GEMINI_STAGE2:${nonAdmin}:${nonAdminEmail}:ADMIN_EMAILS`;
    const allowlistConfig=configured
      .replace("SET LOCAL gemini.stage2.admin_basis = 'USER_METADATA_ROLE';",
        "SET LOCAL gemini.stage2.admin_basis = 'ADMIN_EMAILS';")
      .replace(ownerGate,allowlistGate)
      .replaceAll(reviewer,nonAdmin)
      .replaceAll(reviewerEmail,nonAdminEmail);
    await db.query(allowlistConfig);
    assert.equal(await count('tool_decision_profile_claims'),0,'allowlist review dry-run wrote links');
    await assert.rejects(db.query(commit(configured.replace(amended.post_md5,'00000000000000000000000000000000'))),/prior postimage drift/);
    await db.query('ROLLBACK');
    await db.query(configured);
    assert.equal(await count('tool_capability_claims'),0,'review dry-run wrote links');
    await db.query(commit(configured));
    assert.equal(await count('tool_decision_profile_claims'),5);
    assert.equal(Number((await db.query(`SELECT count(*)::int AS n FROM tool_decision_profile_claims l
      JOIN product_intelligence_claims c ON c.id=l.claim_id
      JOIN product_intelligence_profiles p ON p.id=c.profile_id
      WHERE l.tool_id='cec78907-e2a1-4eb7-853a-a58334026280'
        AND c.id='c7890701-0000-4000-8000-000000000406' AND l.purpose='export'
        AND c.verification_status='verified' AND p.owner_type='tool'
        AND p.owner_id=l.tool_id`)).rows[0].n),1,'sharing/export claim must be verified and same-owner');
    assert.equal(await count('tool_capability_claims'),9);
    assert.equal(await count('tool_task_fit_claims'),6);
    const reviewHash=postHash;
    assert.equal(stage2StateMd5(await state()),reviewHash,'reviewed verifier hash differs from SQL postimage');
    await db.query(commit(configured.replace(amended.post_md5,reviewHash)));
    assert.equal(postHash,reviewHash,'review rerun changed postimage');
    const wrong=rollback.replace('REPLACE_WITH_ORIGINAL_COMMIT_POST_MD5','00000000000000000000000000000000');
    await assert.rejects(db.query(commit(wrong)),/postimage drift/);
    await db.query('ROLLBACK');
    const exact=rollback.replace('REPLACE_WITH_ORIGINAL_COMMIT_POST_MD5',reviewHash);
    await db.query(exact);
    assert.equal(await count('product_intelligence_profiles'),1,'rollback dry-run changed production fixture');
    await db.query(commit(exact));
    assert.equal(await count('product_intelligence_profiles'),0);
    assert.equal(await count('product_intelligence_claims'),0);
    assert.equal(await count('tool_capability_claims'),0);
    console.log('Gemini Notebook Stage 2 SQL: candidate, source URL amendment 1+2, preflight, drift, review and rollback PASS');
  } finally {
    await db.end().catch(()=>{});
    if(started) execFileSync('pg_ctl',['-D',dir,'-m','immediate','-w','stop'],{stdio:'ignore'});
    rmSync(dir,{recursive:true,force:true});
  }
}
main().catch((error)=>{ console.error(error); process.exitCode=1; });

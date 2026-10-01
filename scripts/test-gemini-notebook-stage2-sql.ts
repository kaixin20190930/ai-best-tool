import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

const candidate = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_candidate.sql','utf8');
const review = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_review_links.sql','utf8');
const rollback = readFileSync('db/supabase/manual/20261001_gemini_notebook_stage2_rollback.sql','utf8');
const verifier = readFileSync('scripts/verify-gemini-notebook-stage2-readonly.ts','utf8');
for (const sql of [candidate,review,rollback]) {
  assert.match(sql,/^BEGIN;/m);
  assert.match(sql,/^ROLLBACK;\s*$/m);
  assert.doesNotMatch(sql,/^COMMIT;/m);
  assert.doesNotMatch(sql,/CREATE\s+(?:UNLOGGED\s+)?TABLE\s+(?!pg_temp)/i);
  assert.doesNotMatch(sql,/decision_cluster_transition\s*\(/i);
}
assert.match(candidate,/verification_status='candidate'/);
assert.match(candidate,/editorial_status='draft'/);
assert.match(review,/reviewer.*auth\.users/s);
assert.match(verifier,/Task Page opened/);

const commit = (sql: string) => sql.replace(/ROLLBACK;\s*$/, 'COMMIT;');
const taskId='527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const reviewer='d7890701-0000-4000-8000-000000000001';

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
      CREATE TABLE auth.users (id uuid PRIMARY KEY,raw_user_meta_data jsonb,raw_app_meta_data jsonb);
      INSERT INTO auth.users VALUES ('${reviewer}','{}','{"role":"admin"}');
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
    await db.query(candidate);
    assert.equal(await count('product_intelligence_profiles'),0,'default preflight wrote data');
    await db.query(commit(candidate));
    assert.equal(await count('product_intelligence_profiles'),1);
    assert.equal(await count('product_intelligence_sources'),7);
    assert.equal(await count('product_intelligence_claims'),10);
    assert.equal(await count('tool_capabilities'),2);
    assert.equal(await count('tool_task_fits'),1);
    const candidateHash=postHash;
    await db.query(commit(candidate));
    assert.equal(postHash,candidateHash,'candidate rerun changed postimage');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"drift":true}' WHERE claim_key='gemini-notebook:research:grounding-2026-10'`);
    await assert.rejects(db.query(commit(candidate)),/Ten exact candidate claims required/);
    await db.query('ROLLBACK');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"summary":"Notebook chat answers from selected sources with inline citations; citation accuracy was not independently tested by this site."}' WHERE claim_key='gemini-notebook:research:grounding-2026-10'`);
    const keys=(await db.query('SELECT claim_key FROM product_intelligence_claims')).rows.map((x)=>x.claim_key.replace('gemini-notebook:research:',''));
    const excerpts=Object.fromEntries(keys.map((key)=>[key,`Official passage checked for ${key} by the independent reviewer.`]));
    const configured=review
      .replace('00000000-0000-0000-0000-000000000000',reviewer)
      .replace('REPLACE_WITH_INDEPENDENT_REVIEW_REFERENCE','QA-2026-10-01-independent')
      .replace('REPLACE_WITH_ORIGINAL_PRIOR_POST_MD5',candidateHash)
      .replace("SET LOCAL gemini.stage2.excerpts = '{}';",`SET LOCAL gemini.stage2.excerpts = '${JSON.stringify(excerpts)}';`);
    const nonAdmin='d7890701-0000-4000-8000-000000000002';
    await db.query(`INSERT INTO auth.users VALUES ($1,'{"role":"admin"}','{}')`,[nonAdmin]);
    await assert.rejects(db.query(commit(configured.replaceAll(reviewer,nonAdmin))),/lacks service-managed admin/);
    await db.query('ROLLBACK');
    await assert.rejects(db.query(commit(configured.replace(candidateHash,'00000000000000000000000000000000'))),/prior postimage drift/);
    await db.query('ROLLBACK');
    await db.query(configured);
    assert.equal(await count('tool_capability_claims'),0,'review dry-run wrote links');
    await db.query(commit(configured));
    assert.equal(await count('tool_decision_profile_claims'),4);
    assert.equal(await count('tool_capability_claims'),9);
    assert.equal(await count('tool_task_fit_claims'),6);
    const reviewHash=postHash;
    await db.query(commit(configured.replace(candidateHash,reviewHash)));
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
    console.log('Gemini Notebook Stage 2 SQL: preflight, commit, idempotence, drift, review links and exact rollback PASS');
  } finally {
    await db.end().catch(()=>{});
    if(started) execFileSync('pg_ctl',['-D',dir,'-m','immediate','-w','stop'],{stdio:'ignore'});
    rmSync(dir,{recursive:true,force:true});
  }
}
main().catch((error)=>{ console.error(error); process.exitCode=1; });

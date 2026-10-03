import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

import { stage2StateMd5, type Stage2State } from './gemini-notebook-stage2-state';

const sql = readFileSync('db/supabase/manual/20261003_perplexity_stage2_candidate.sql','utf8');
const verifier = readFileSync('scripts/verify-perplexity-stage2-readonly.ts','utf8');
assert.match(sql,/^SELECT \* FROM pg_temp\.perplexity_stage2_candidate\('ROLLBACK'\);\s*$/m);
assert.doesNotMatch(sql,/^\s*(?:COMMIT|UPDATE|DELETE)\s+/im);
assert.doesNotMatch(sql,/\b(?:published|reviewed|verified)\b(?=\s*['",])/i);
assert.match(sql,/Stage 2 requires RLS enabled on all nine Supabase tables/);
assert.match(sql,/Existing evidence links require separate reconciliation/);
assert.match(verifier,/Task 404 lost noindex/);
assert.match(verifier,/Cross-owner (?:Decision|Capability|Fit) link/);
assert.doesNotMatch(verifier,/\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

const sourceTest = readFileSync('scripts/test-gemini-notebook-stage2-sql.ts','utf8');
const fixture = sourceTest.match(/await db\.query\(`CREATE SCHEMA auth;([\s\S]*?)\n    `\);/)?.[1];
assert.ok(fixture, 'Shared Stage 2 test schema fixture missing');
const schema = `CREATE SCHEMA auth;${fixture}`.replaceAll('${reviewer}', 'd7890701-0000-4000-8000-000000000001')
  .replaceAll('${reviewerEmail}', 'reviewer@example.test')
  .replaceAll('${taskId}', '527fe8b7-c171-4c50-ab1f-9404d7536e7c');
const commit = sql.replace(/perplexity_stage2_candidate\('ROLLBACK'\);\s*$/,
  "perplexity_stage2_candidate('COMMIT');");
const profileId = 'd0186230-0000-4000-8000-000000000001';
const toolId = '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
const fitId = 'd0186230-0000-4000-8000-000000000301';
const ids = [201,202].map((n) => `d0186230-0000-4000-8000-${String(n).padStart(12,'0')}`);

async function main() {
  const dir = mkdtempSync(join(tmpdir(),'perplexity-stage2-pg-'));
  const port = 54000 + Math.floor(Math.random()*9000);
  const db = new Client({host:dir,port,user:'postgres',database:'postgres'});
  let started = false;
  try {
    execFileSync('initdb',['-A','trust','-U','postgres','-D',dir],{stdio:'ignore'});
    execFileSync('pg_ctl',['-D',dir,'-o',`-F -p ${port} -k ${dir}`,'-w','start'],{stdio:'ignore'});
    started = true;
    await db.connect();
    await db.query(schema);
    const count = async (table:string) => Number((await db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n);
    const result = (value:any) => (Array.isArray(value) ? value.at(-1) : value).rows[0];
    const rows = async (table:string,where:string,order:string) =>
      (await db.query(`SELECT to_jsonb(t) AS value FROM ${table} t ${where} ORDER BY ${order}`)).rows.map((x) => x.value);
    const state = async ():Promise<Stage2State> => ({
      profile:(await rows('product_intelligence_profiles',`WHERE id='${profileId}'`,'id'))[0] || null,
      sources:await rows('product_intelligence_sources',`WHERE profile_id='${profileId}'`,'id'),
      claims:await rows('product_intelligence_claims',`WHERE profile_id='${profileId}'`,'id'),
      decision:(await rows('tool_decision_profiles',`WHERE tool_id='${toolId}'`,'tool_id'))[0] || null,
      capabilities:await rows('tool_capabilities',`WHERE tool_id='${toolId}'`,'id'),
      fit:(await rows('tool_task_fits',`WHERE id='${fitId}'`,'id'))[0] || null,
      decisionLinks:await rows('tool_decision_profile_claims',`WHERE tool_id='${toolId}'`,'claim_id,purpose'),
      capabilityLinks:await rows('tool_capability_claims',`WHERE tool_capability_id IN ('${ids.join("','")}')`,'tool_capability_id,claim_id,purpose'),
      fitLinks:await rows('tool_task_fit_claims',`WHERE fit_id='${fitId}'`,'claim_id,purpose'),
    });
    const preflight = result(await db.query(sql));
    assert.deepEqual([preflight.mode,preflight.preflight,preflight.profiles,preflight.sources,
      preflight.claims,preflight.decision,preflight.capabilities,preflight.fit,preflight.links],
      ['preflight',true,1,5,7,1,2,1,0]);
    assert.equal(await count('product_intelligence_profiles'),0,'Default ROLLBACK left data');
    await db.query('ALTER TABLE product_intelligence_claims DISABLE ROW LEVEL SECURITY');
    await assert.rejects(db.query(sql),/RLS enabled/);
    assert.equal(await count('product_intelligence_profiles'),0);
    await db.query('ALTER TABLE product_intelligence_claims ENABLE ROW LEVEL SECURITY');
    await db.query(`INSERT INTO product_intelligence_profiles (id,owner_type,owner_id,canonical_domain,product_name,profile_status)
      VALUES ('aaaaaaaa-0000-4000-8000-000000000001','tool','aaaaaaaa-0000-4000-8000-000000000002','other.example','Other','ready')`);
    await db.query(`INSERT INTO product_intelligence_sources (id,profile_id,url)
      VALUES ('d0186230-0000-4000-8000-000000000101','aaaaaaaa-0000-4000-8000-000000000001','https://other.example/')`);
    await assert.rejects(db.query(commit),/Five exact pending official sources required/);
    assert.equal(await count('tool_decision_profiles'),0,'Cross-owner collision partially wrote');
    await db.query("DELETE FROM product_intelligence_sources WHERE profile_id='aaaaaaaa-0000-4000-8000-000000000001'");
    await db.query("DELETE FROM product_intelligence_profiles WHERE id='aaaaaaaa-0000-4000-8000-000000000001'");
    await db.query(`INSERT INTO product_intelligence_profiles (id,owner_type,owner_id,canonical_domain,product_name,profile_status)
      VALUES ('aaaaaaaa-0000-4000-8000-000000000003','tool','aaaaaaaa-0000-4000-8000-000000000002','perplexity.ai','Alias','ready')`);
    await assert.rejects(db.query(commit),/old state is not empty or exact candidate/);
    await db.query("DELETE FROM product_intelligence_profiles WHERE id='aaaaaaaa-0000-4000-8000-000000000003'");
    const written = result(await db.query(commit));
    assert.equal(written.mode,'committed');
    assert.deepEqual([written.profiles,written.sources,written.claims,written.decision,
      written.capabilities,written.fit,written.links],[1,5,7,1,2,1,0]);
    assert.equal(stage2StateMd5(await state()),written.post_md5,'Verifier hash differs from SQL');
    assert.equal(result(await db.query(commit)).post_md5,written.post_md5,'Idempotent replay drifted');
    await db.query(`UPDATE product_intelligence_claims SET claim_value='{"drift":true}'
      WHERE claim_key='perplexity:research:direct-links-2026-10'`);
    await assert.rejects(db.query(commit),/Seven exact candidate claims required/);
    assert.equal(await count('tool_capability_claims'),0);
    await db.query(`UPDATE product_intelligence_claims
      SET claim_value='{"summary":"Pro Search answers include direct original-source links for inspection; the site has not independently tested citation accuracy."}'
      WHERE claim_key='perplexity:research:direct-links-2026-10'`);
    assert.equal(result(await db.query(commit)).post_md5,written.post_md5);
    assert.equal(await count('tool_decision_profile_claims'),0);
    assert.equal(await count('tool_capability_claims'),0);
    assert.equal(await count('tool_task_fit_claims'),0);
    console.log('Perplexity Stage 2 candidate: preview, commit, idempotence, RLS, cross-owner collision, drift, hash, zero links PASS');
  } finally {
    await db.end().catch(() => undefined);
    if (started) execFileSync('pg_ctl',['-D',dir,'-m','immediate','-w','stop'],{stdio:'ignore'});
    rmSync(dir,{recursive:true,force:true});
  }
}
main().catch((error) => { console.error(error); process.exitCode=1; });

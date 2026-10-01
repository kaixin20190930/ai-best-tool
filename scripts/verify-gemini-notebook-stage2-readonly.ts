import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { APPROVED_TASK_PAGE_SLUGS, getTaskPageRouteDecision } from '../lib/seo/taskPageApproval';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { createAdminClient } from '../lib/supabase/admin';
import { stage2StateMd5 } from './gemini-notebook-stage2-state';

loadEnvConfig(process.cwd());

const phase = process.argv[2] || '--baseline';
assert.ok(['--baseline', '--candidate', '--reviewed'].includes(phase), 'Choose --baseline, --candidate or --reviewed');
const toolId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const profileId = 'c7890701-0000-4000-8000-000000000001';
const fitId = 'c7890701-0000-4000-8000-000000000301';
const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const capabilityIds = [
  'c7890701-0000-4000-8000-000000000201',
  'c7890701-0000-4000-8000-000000000202',
];
const sourceIds = Array.from({ length: 7 }, (_, i) => `c7890701-0000-4000-8000-${String(i + 101).padStart(12, '0')}`);
const claimIds = Array.from({ length: 10 }, (_, i) => `c7890701-0000-4000-8000-${String(i + 401).padStart(12, '0')}`);
const expectedClaimKeys = [
  'identity','grounding','discovery','import-loss','notebook-boundary','sharing-export',
  'plans','compute-limits','data-handling','workspace-privacy',
].map((key) => `gemini-notebook:research:${key}-2026-10`);
const expectedUrls = [
  'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/',
  'https://support.google.com/gemininotebook/answer/16164461',
  'https://support.google.com/gemininotebook/answer/16215270?hl=en',
  'https://support.google.com/gemininotebook/answer/16206563?hl=en',
  'https://support.google.com/gemininotebook/answer/16213268?hl=en',
  'https://support.google.com/gemininotebook/answer/17670842?hl=en',
  'https://support.google.com/gemininotebook/answer/17004255?hl=en',
];
const expectedDecisionLinks = [
  [402,'fit'],[404,'limitation'],[406,'export'],[407,'cost'],[409,'privacy'],
].map(([n,p]) => `${toolId}:c7890701-0000-4000-8000-${String(n).padStart(12,'0')}:${p}`).sort();
const expectedCapabilityLinks = [
  [201,403,'support'],[201,407,'availability'],[201,408,'plan'],[201,404,'limitation'],[201,405,'limitation'],
  [202,402,'support'],[202,407,'availability'],[202,404,'limitation'],[202,405,'limitation'],
].map(([relation,claim,purpose]) => `c7890701-0000-4000-8000-${String(relation).padStart(12,'0')}:c7890701-0000-4000-8000-${String(claim).padStart(12,'0')}:${purpose}`).sort();
const expectedFitLinks = [
  [402,'fit'],[403,'fit'],[404,'limitation'],[405,'limitation'],[409,'privacy'],[410,'privacy'],
].map(([n,p]) => `${fitId}:c7890701-0000-4000-8000-${String(n).padStart(12,'0')}:${p}`).sort();

async function read(label: string, request: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

function currentReview(row: any, now: number) {
  return Boolean(row.reviewed_by) && Date.parse(row.reviewed_at) <= now && Date.parse(row.review_due_at) > now;
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let tools: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    tools = (await neon.query(`SELECT id,name,url,status,page_quality_status,content,detail
      FROM tools WHERE id=$1 OR lower(name) IN ('notebooklm','gemini-notebook','gemini notebook')
      OR lower(url) ~ '^https?://(notebooklm|notebook)[.]google[.]com([/?#]|$)'`, [toolId])).rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(tools.length, 1, 'Notebook identity collision');
  const tool = tools[0];
  assert.equal(tool.id, toolId);
  assert.equal(tool.name, 'notebooklm');
  assert.equal(tool.url, 'https://notebook.google.com/');
  assert.equal(tool.status, 'published');
  assert.equal(tool.page_quality_status, 'monitor');
  const index = getToolIndexDecision({ status: tool.status, pageQualityStatus: tool.page_quality_status,
    categoryId: null, imageUrl: null, thumbnailUrl: null, content: tool.content,
    detail: tool.detail, pricing: null, tags: null });
  assert.equal(index.indexable, false);
  assert.equal(index.reason, 'indexing_paused');
  assert.ok(!APPROVED_TASK_PAGE_SLUGS.includes('research-with-citations'));
  assert.equal(getTaskPageRouteDecision('/cn/tasks/research-with-citations'), 'closed');

  const db = createAdminClient();
  const [tasks, definitions, profiles, decisions, capabilities, fits, sources, claims] = await Promise.all([
    read('task', db.from('decision_tasks').select('id,slug,status').eq('id', taskId)),
    read('definitions', db.from('decision_capabilities').select('id,slug,status').in('slug', ['research-discovery','citation-traceability'])),
    read('profile', db.from('product_intelligence_profiles').select('*').eq('owner_type','tool').eq('owner_id',toolId)),
    read('decision', db.from('tool_decision_profiles').select('*').eq('tool_id',toolId)),
    read('capabilities', db.from('tool_capabilities').select('*').eq('tool_id',toolId)),
    read('fits', db.from('tool_task_fits').select('*').eq('tool_id',toolId)),
    read('sources', db.from('product_intelligence_sources').select('*').eq('profile_id',profileId)),
    read('claims', db.from('product_intelligence_claims').select('*').eq('profile_id',profileId)),
  ]);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].slug, 'research-with-citations');
  assert.equal(tasks[0].status, 'active');
  assert.deepEqual(definitions.map((x) => [x.id,x.slug,x.status]).sort((a,b) => a[1].localeCompare(b[1])), [
    ['04930ae8-4c78-487f-a6c9-25680b8da681','citation-traceability','active'],
    ['50288b6e-a968-4bcf-9e55-911df203e0c7','research-discovery','active'],
  ]);
  const [decisionLinks, capabilityLinks, fitLinks, allDecisionClaimLinks, allCapabilityClaimLinks, allFitClaimLinks] = await Promise.all([
    read('decision links', db.from('tool_decision_profile_claims').select('*').eq('tool_id',toolId)),
    read('capability links', db.from('tool_capability_claims').select('*').in('tool_capability_id',capabilityIds)),
    read('fit links', db.from('tool_task_fit_claims').select('*').eq('fit_id',fitId)),
    read('all decision claim links', db.from('tool_decision_profile_claims').select('*').in('claim_id',claimIds)),
    read('all capability claim links', db.from('tool_capability_claims').select('*').in('claim_id',claimIds)),
    read('all fit claim links', db.from('tool_task_fit_claims').select('*').in('claim_id',claimIds)),
  ]);
  const now = Date.now();
  if (phase === '--baseline') {
    assert.deepEqual([profiles.length,decisions.length,capabilities.length,fits.length,sources.length,claims.length,
      decisionLinks.length,capabilityLinks.length,fitLinks.length,
      allDecisionClaimLinks.length,allCapabilityClaimLinks.length,allFitClaimLinks.length],Array(12).fill(0));
  } else {
    assert.equal(profiles.length, 1);
    assert.equal(profiles[0].id, profileId);
    assert.equal(profiles[0].canonical_domain, 'notebook.google.com');
    assert.equal(profiles[0].product_name, 'Gemini Notebook');
    assert.ok(Date.parse(profiles[0].next_review_at) > now, 'Profile review deadline passed');
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].tool_id, toolId);
    assert.equal(decisions[0].setup_complexity, 'unknown');
    assert.equal(decisions[0].data_training_use, 'unknown');
    assert.equal(decisions[0].self_host_level, 'no');
    assert.equal(decisions[0].export_level, 'limited');
    assert.deepEqual(capabilities.map((x) => x.id).sort(), [...capabilityIds].sort());
    assert.deepEqual(capabilities.map((x) => [x.capability_id,x.support_level,x.availability]).sort((a,b) => a[0].localeCompare(b[0])), [
      ['04930ae8-4c78-487f-a6c9-25680b8da681','strong','all_plans'],
      ['50288b6e-a968-4bcf-9e55-911df203e0c7','partial','unknown'],
    ]);
    assert.equal(fits.length,1);
    assert.equal(fits[0].id,fitId);
    assert.equal(fits[0].task_id,taskId);
    assert.equal(fits[0].fit_level,'conditional');
    assert.deepEqual(sources.map((x) => x.id).sort(), [...sourceIds].sort());
    assert.deepEqual(sources.map((x) => x.url).sort(), [...expectedUrls].sort());
    assert.deepEqual(claims.map((x) => x.id).sort(), [...claimIds].sort());
    assert.deepEqual(claims.map((x) => x.claim_key).sort(), [...expectedClaimKeys].sort());
    const sourceById = new Map(sources.map((x) => [x.id,x]));
    const claimById = new Map(claims.map((x) => [x.id,x]));
    for (const source of sources) {
      assert.equal(source.profile_id,profileId);
      assert.equal(source.source_type,'official');
      assert.equal(source.metadata?.stage2Batch,'gemini-notebook-20261001');
    }
    for (const claim of claims) {
      const source = sourceById.get(claim.source_id);
      assert.ok(source && source.url === claim.source_url, 'Claim/source owner or URL mismatch');
      assert.equal(claim.profile_id,profileId);
      assert.equal(claim.source_type,'official');
      assert.equal(claim.conflict_status,'none');
      assert.equal(claim.invalidated_at,null);
      assert.ok(claim.validity_scope && Object.keys(claim.validity_scope).length);
    }
    for (const link of [...decisionLinks,...capabilityLinks,...fitLinks]) {
      const claim = claimById.get(link.claim_id);
      assert.ok(claim && claim.profile_id===profileId, 'Cross-owner or missing claim link');
      assert.equal(claim.verification_status,'verified');
      assert.ok(Date.parse(claim.review_due_at)>now);
      assert.ok(!claim.expires_at || Date.parse(claim.expires_at)>now);
    }
    assert.deepEqual(allDecisionClaimLinks.map((x) => `${x.tool_id}:${x.claim_id}:${x.purpose}`).sort(),
      decisionLinks.map((x) => `${x.tool_id}:${x.claim_id}:${x.purpose}`).sort(), 'Claim linked to another Decision tool');
    assert.deepEqual(allCapabilityClaimLinks.map((x) => `${x.tool_capability_id}:${x.claim_id}:${x.purpose}`).sort(),
      capabilityLinks.map((x) => `${x.tool_capability_id}:${x.claim_id}:${x.purpose}`).sort(), 'Claim linked to another Tool Capability');
    assert.deepEqual(allFitClaimLinks.map((x) => `${x.fit_id}:${x.claim_id}:${x.purpose}`).sort(),
      fitLinks.map((x) => `${x.fit_id}:${x.claim_id}:${x.purpose}`).sort(), 'Claim linked to another Fit');
    if (phase === '--candidate') {
      assert.equal(profiles[0].profile_status,'pending');
      assert.equal(decisions[0].editorial_status,'draft');
      assert.ok(capabilities.every((x) => x.status==='draft'));
      assert.equal(fits[0].status,'draft');
      assert.ok(sources.every((x) => x.fetch_status==='pending' && !x.last_verified_at));
      assert.ok(claims.every((x) => x.verification_status==='candidate' && !x.verified_by));
      assert.deepEqual([decisionLinks.length,capabilityLinks.length,fitLinks.length],[0,0,0]);
    } else {
      assert.equal(profiles[0].profile_status,'ready');
      assert.equal(decisions[0].editorial_status,'reviewed');
      assert.ok(currentReview(decisions[0],now));
      assert.ok(capabilities.every((x) => x.status==='reviewed' && currentReview(x,now)));
      assert.equal(fits[0].status,'reviewed');
      assert.ok(currentReview(fits[0],now));
      assert.ok(sources.every((x) => x.fetch_status==='success' && Date.parse(x.last_verified_at)<=now));
      assert.ok(claims.every((x) => x.verification_status==='verified' && x.verified_by &&
        Date.parse(x.verified_at)<=now && Date.parse(x.review_due_at)>now && x.source_excerpt));
      assert.deepEqual([decisionLinks.length,capabilityLinks.length,fitLinks.length],[5,9,6]);
      assert.deepEqual(decisionLinks.map((x) => `${x.tool_id}:${x.claim_id}:${x.purpose}`).sort(),expectedDecisionLinks);
      assert.deepEqual(capabilityLinks.map((x) => `${x.tool_capability_id}:${x.claim_id}:${x.purpose}`).sort(),expectedCapabilityLinks);
      assert.deepEqual(fitLinks.map((x) => `${x.fit_id}:${x.claim_id}:${x.purpose}`).sort(),expectedFitLinks);
    }
  }
  const base = process.env.GEMINI_NOTEBOOK_VERIFY_BASE_URL || 'https://aibesttool.com';
  const [taskPage,sitemap] = await Promise.all([
    fetch(`${base}/cn/tasks/research-with-citations`,{ method:'GET',cache:'no-store' }),
    fetch(`${base}/sitemap.xml`,{ method:'GET',cache:'no-store' }),
  ]);
  assert.equal(taskPage.status,404,'Research Task Page opened');
  assert.equal(sitemap.status,200,'Production sitemap unavailable');
  const xml = await sitemap.text();
  assert.ok(!xml.includes('/tasks/research-with-citations') && !xml.includes('/ai/notebooklm'),
    'Task Page or Notebook tool became sitemap-eligible');
  const stateMd5 = stage2StateMd5({
    profile: profiles[0] || null,
    sources,
    claims,
    decision: decisions[0] || null,
    capabilities,
    fit: fits.find((x) => x.id === fitId) || null,
    decisionLinks,
    capabilityLinks,
    fitLinks,
  });
  console.log(JSON.stringify({ phase, checkedAtUtc:new Date().toISOString(), productionWrites:0,
    ownerId:toolId, stateMd5, profile:profiles.length, sources:sources.length, claims:claims.length,
    decision:decisions.length, capabilities:capabilities.length, fit:fits.length,
    links:{ decision:decisionLinks.length,capability:capabilityLinks.length,fit:fitLinks.length },
    taskPageStatus:taskPage.status, sitemapEligible:false, toolIndexReason:index.reason },null,2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode=1; });

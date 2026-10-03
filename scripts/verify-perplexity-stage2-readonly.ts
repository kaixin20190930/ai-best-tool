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
assert.ok(['--baseline', '--candidate'].includes(phase), 'Choose --baseline or --candidate');

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const owners = {
  consensus: 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab',
  notebook: 'cec78907-e2a1-4eb7-853a-a58334026280',
  perplexity: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93',
};
const perplexityProfileId = 'd0186230-0000-4000-8000-000000000001';
const perplexityFitId = 'd0186230-0000-4000-8000-000000000301';
const perplexityCapabilityIds = [201, 202].map((n) => `d0186230-0000-4000-8000-${String(n).padStart(12, '0')}`);
const perplexitySourceIds = [101, 102, 103, 104, 105].map(
  (n) => `d0186230-0000-4000-8000-${String(n).padStart(12, '0')}`,
);
const perplexityClaimIds = [401, 402, 403, 404, 405, 406, 407].map(
  (n) => `d0186230-0000-4000-8000-${String(n).padStart(12, '0')}`,
);
const expectedKeys = [
  'web-synthesis',
  'direct-links',
  'focus',
  'plans',
  'api-boundary',
  'data-boundary',
  'labels-limitation',
].map((name) => `perplexity:research:${name}-2026-10`);
const expectedUrls = [
  'https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search',
  'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you',
  'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity',
  'https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels',
  'https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions',
];
const correctedPlansValue = {
  summary:
    'The current official plan comparison lists 3 Pro Searches per day for Free; Pro, Max and Enterprise have differentiated access.',
};
const correctedPlansScope = {
  scope: 'Web/app subscription',
  freePlanProSearchQuota: '3/day per current official plan comparison',
  requires: 'recheck target account at review',
};

async function read(label: string, request: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

const currentReview = (row: any, now: number) =>
  Boolean(row.reviewed_by) && Date.parse(row.reviewed_at) <= now && Date.parse(row.review_due_at) > now;

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let tools: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    tools = (
      await neon.query(`SELECT id,name,url,status,page_quality_status,content,detail FROM tools
      WHERE lower(name) IN ('consensus','notebooklm','gemini notebook','perplexity')
      OR lower(url) ~ '(consensus[.]app|notebook(lm)?[.]google[.]com|perplexity[.]ai)' ORDER BY name`)
    ).rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(tools.length, 3, 'Duplicate product name or domain');
  assert.deepEqual(tools.map((x) => x.id).sort(), Object.values(owners).sort());
  assert.ok(tools.every((x) => x.status === 'published'));
  const notebook = tools.find((x) => x.id === owners.notebook)!;
  assert.equal(notebook.name, 'notebooklm');
  assert.equal(notebook.url, 'https://notebook.google.com/');
  assert.equal(notebook.page_quality_status, 'monitor');
  const notebookIndex = getToolIndexDecision({
    status: notebook.status,
    pageQualityStatus: notebook.page_quality_status,
    categoryId: null,
    imageUrl: null,
    thumbnailUrl: null,
    content: notebook.content,
    detail: notebook.detail,
    pricing: null,
    tags: null,
  });
  assert.equal(notebookIndex.indexable, false);
  assert.equal(notebookIndex.reason, 'indexing_paused');
  assert.ok(!APPROVED_TASK_PAGE_SLUGS.includes('research-with-citations'));
  assert.equal(getTaskPageRouteDecision('/cn/tasks/research-with-citations'), 'closed');

  const db = createAdminClient();
  const ids = Object.values(owners);
  const [tasks, definitions, taskCapabilities, profiles, decisions, capabilities, fits, reviewAudit] =
    await Promise.all([
      read('task', db.from('decision_tasks').select('*').eq('id', taskId)),
      read(
        'definitions',
        db
          .from('decision_capabilities')
          .select('id,slug,status')
          .in('slug', ['research-discovery', 'citation-traceability']),
      ),
      read('task capabilities', db.from('task_capabilities').select('*').eq('task_id', taskId)),
      read('profiles', db.from('product_intelligence_profiles').select('*').in('owner_id', ids)),
      read('decisions', db.from('tool_decision_profiles').select('*').in('tool_id', ids)),
      read('capabilities', db.from('tool_capabilities').select('*').in('tool_id', ids)),
      read('fits', db.from('tool_task_fits').select('*').eq('task_id', taskId)),
      read(
        'Perplexity target review audit',
        db
          .from('admin_evidence_review_audit')
          .select('id,claim_id,action,reviewer_id,created_at')
          .eq('claim_id', perplexityClaimIds[3])
          .order('id', { ascending: false })
          .limit(1),
      ),
    ]);
  const now = Date.now();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].slug, 'research-with-citations');
  assert.equal(tasks[0].status, 'active');
  assert.deepEqual(definitions.map((x) => x.slug).sort(), ['citation-traceability', 'research-discovery']);
  assert.ok(definitions.every((x) => x.status === 'active'));
  assert.equal(taskCapabilities.length, 2);
  assert.ok(taskCapabilities.every((x) => x.status === 'published' && currentReview(x, now)));
  const sourceIds = profiles.map((x) => x.id);
  const allPerplexityFits = await read(
    'all Perplexity fits',
    db.from('tool_task_fits').select('id,tool_id,task_id').eq('tool_id', owners.perplexity),
  );
  const [sources, claims, decisionLinks, capabilityLinks, fitLinks] = await Promise.all([
    read('sources', db.from('product_intelligence_sources').select('*').in('profile_id', sourceIds)),
    read('claims', db.from('product_intelligence_claims').select('*').in('profile_id', sourceIds)),
    read('decision links', db.from('tool_decision_profile_claims').select('*').in('tool_id', ids)),
    read(
      'capability links',
      db
        .from('tool_capability_claims')
        .select('*')
        .in(
          'tool_capability_id',
          capabilities.map((x) => x.id),
        ),
    ),
    read(
      'fit links',
      db
        .from('tool_task_fit_claims')
        .select('*')
        .in(
          'fit_id',
          fits.map((x) => x.id),
        ),
    ),
  ]);
  const byOwner = (rows: any[], key: string, id: string) => rows.filter((x) => x[key] === id);
  const consensusProfiles = byOwner(profiles, 'owner_id', owners.consensus);
  const notebookProfiles = byOwner(profiles, 'owner_id', owners.notebook);
  const perplexityProfiles = byOwner(profiles, 'owner_id', owners.perplexity);
  assert.equal(consensusProfiles.length, 1);
  assert.equal(consensusProfiles[0].id, 'b72150af-7c8e-40dc-81f7-b41375afa6f4');
  assert.equal(consensusProfiles[0].profile_status, 'ready');
  assert.equal(byOwner(sources, 'profile_id', consensusProfiles[0].id).length, 7);
  assert.equal(
    byOwner(claims, 'profile_id', consensusProfiles[0].id).filter(
      (x) =>
        x.claim_key.startsWith('consensus:research:') &&
        x.verification_status === 'verified' &&
        x.conflict_status === 'none' &&
        Date.parse(x.review_due_at) > now,
    ).length,
    6,
  );
  const consensusCap = byOwner(capabilities, 'tool_id', owners.consensus);
  const consensusFit = byOwner(fits, 'tool_id', owners.consensus);
  assert.deepEqual(
    consensusCap.map((x) => x.id),
    ['5e6f6ba6-8587-4c59-977a-ed74672dee5c'],
  );
  assert.deepEqual(
    consensusFit.map((x) => x.id),
    ['d52cc53b-6e5f-4b0b-809b-140076d4d7d2'],
  );
  assert.ok([...consensusCap, ...consensusFit].every((x) => x.status === 'published' && currentReview(x, now)));
  assert.deepEqual(
    [
      byOwner(capabilityLinks, 'tool_capability_id', consensusCap[0].id).length,
      byOwner(fitLinks, 'fit_id', consensusFit[0].id).length,
    ],
    [7, 6],
  );

  assert.equal(notebookProfiles.length, 1);
  assert.equal(notebookProfiles[0].id, 'c7890701-0000-4000-8000-000000000001');
  assert.equal(notebookProfiles[0].profile_status, 'ready');
  assert.equal(byOwner(sources, 'profile_id', notebookProfiles[0].id).length, 7);
  assert.equal(
    byOwner(claims, 'profile_id', notebookProfiles[0].id).filter(
      (x) => x.verification_status === 'verified' && x.conflict_status === 'none' && Date.parse(x.review_due_at) > now,
    ).length,
    10,
  );
  const notebookDecision = byOwner(decisions, 'tool_id', owners.notebook);
  const notebookCap = byOwner(capabilities, 'tool_id', owners.notebook);
  const notebookFit = byOwner(fits, 'tool_id', owners.notebook);
  assert.equal(notebookDecision.length, 1);
  assert.equal(notebookDecision[0].editorial_status, 'reviewed');
  assert.equal(notebookCap.length, 2);
  assert.equal(notebookFit.length, 1);
  assert.ok(
    [...notebookDecision, ...notebookCap, ...notebookFit].every(
      (x) => (x.editorial_status || x.status) === 'reviewed' && currentReview(x, now),
    ),
  );
  assert.deepEqual(
    [
      byOwner(decisionLinks, 'tool_id', owners.notebook).length,
      capabilityLinks.filter((x) => notebookCap.some((c) => c.id === x.tool_capability_id)).length,
      byOwner(fitLinks, 'fit_id', notebookFit[0].id).length,
    ],
    [5, 9, 6],
  );

  const perplexityDecision = byOwner(decisions, 'tool_id', owners.perplexity);
  const perplexityCap = byOwner(capabilities, 'tool_id', owners.perplexity);
  const perplexityFit = byOwner(fits, 'tool_id', owners.perplexity);
  assert.deepEqual(
    allPerplexityFits.map((x) => x.id).sort(),
    perplexityFit.map((x) => x.id).sort(),
    'Perplexity has an unexpected Fit for another Task',
  );
  const perplexitySources = byOwner(sources, 'profile_id', perplexityProfileId);
  const perplexityClaims = byOwner(claims, 'profile_id', perplexityProfileId);
  const perplexityDecisionLinks = byOwner(decisionLinks, 'tool_id', owners.perplexity);
  const perplexityCapabilityLinks = capabilityLinks.filter((x) =>
    perplexityCap.some((c) => c.id === x.tool_capability_id),
  );
  const perplexityFitLinks = fitLinks.filter((x) => perplexityFit.some((f) => f.id === x.fit_id));
  if (phase === '--baseline') {
    assert.deepEqual(
      [
        perplexityProfiles.length,
        perplexitySources.length,
        perplexityClaims.length,
        perplexityDecision.length,
        perplexityCap.length,
        perplexityFit.length,
        perplexityDecisionLinks.length,
        perplexityCapabilityLinks.length,
        perplexityFitLinks.length,
      ],
      Array(9).fill(0),
    );
  } else {
    assert.equal(perplexityProfiles.length, 1);
    assert.equal(perplexityProfiles[0].id, perplexityProfileId);
    assert.equal(perplexityProfiles[0].canonical_domain, 'www.perplexity.ai');
    assert.equal(perplexityProfiles[0].profile_status, 'pending');
    assert.ok(Date.parse(perplexityProfiles[0].next_review_at) > now);
    assert.deepEqual(perplexitySources.map((x) => x.id).sort(), perplexitySourceIds);
    assert.deepEqual(perplexitySources.map((x) => x.url).sort(), expectedUrls.sort());
    assert.ok(
      perplexitySources.every((x) => x.source_type === 'official' && x.metadata?.stage2Batch === 'perplexity-20261003'),
    );
    assert.ok(
      perplexitySources
        .filter((x) => x.id !== perplexitySourceIds[1])
        .every((x) => x.fetch_status === 'success' && Boolean(x.last_verified_at)),
    );
    assert.equal(perplexitySources.find((x) => x.id === perplexitySourceIds[1])?.fetch_status, 'pending');
    assert.deepEqual(perplexityClaims.map((x) => x.id).sort(), perplexityClaimIds);
    assert.deepEqual(perplexityClaims.map((x) => x.claim_key).sort(), expectedKeys.sort());
    const plansClaim = perplexityClaims.find((x) => x.id === perplexityClaimIds[3]);
    assert.deepEqual(plansClaim?.claim_value, correctedPlansValue, 'Plans candidate has stale or unexpected value');
    assert.deepEqual(plansClaim?.validity_scope, correctedPlansScope, 'Plans candidate has unexpected scope');
    assert.equal(plansClaim?.verification_status, 'candidate', 'Plans claim must remain candidate/HOLD');
    assert.equal(plansClaim?.verified_by, null);
    assert.equal(plansClaim?.verified_at, null);
    assert.equal(plansClaim?.source_excerpt, null);
    assert.equal(reviewAudit[0]?.action, 'hold', 'Plans claim must remain under the latest HOLD review');
    assert.ok(
      Date.parse(reviewAudit[0]?.created_at) > now - 14 * 24 * 60 * 60 * 1000,
      'Plans HOLD review audit is stale',
    );
    assert.ok(Date.parse(reviewAudit[0]?.created_at) <= now, 'Plans HOLD review audit is future-dated');
    assert.ok(reviewAudit[0]?.reviewer_id, 'Plans HOLD audit is missing a reviewer');
    const { data: reviewUser, error: reviewUserError } = await db.auth.admin.getUserById(reviewAudit[0].reviewer_id);
    if (reviewUserError) throw new Error(`Perplexity HOLD reviewer: ${reviewUserError.message}`);
    assert.ok(
      ['admin', 'moderator'].includes(reviewUser.user?.user_metadata?.role as string),
      'Plans HOLD reviewer is not an app admin or moderator',
    );
    const verifiedClaims = perplexityClaims.filter(
      (x) => x.id !== perplexityClaimIds[3] && x.verification_status === 'verified',
    );
    assert.equal(verifiedClaims.length, 6);
    assert.ok(
      verifiedClaims.every(
        (x) => Boolean(x.verified_by && x.verified_at && x.source_excerpt) && Date.parse(x.review_due_at) > now,
      ),
    );
    assert.ok(
      perplexityClaims.every(
        (x) =>
          x.conflict_status === 'none' &&
          x.metadata?.stage2Batch === 'perplexity-20261003' &&
          perplexitySources.some((s) => s.id === x.source_id && s.url === x.source_url),
      ),
    );
    assert.equal(perplexityDecision.length, 1);
    assert.equal(perplexityDecision[0].editorial_status, 'draft');
    assert.deepEqual(perplexityCap.map((x) => x.id).sort(), perplexityCapabilityIds);
    assert.ok(perplexityCap.every((x) => x.status === 'draft'));
    assert.equal(perplexityFit.length, 1);
    assert.equal(perplexityFit[0].id, perplexityFitId);
    assert.equal(perplexityFit[0].fit_level, 'conditional');
    assert.equal(perplexityFit[0].status, 'draft');
    assert.deepEqual(
      [perplexityDecisionLinks.length, perplexityCapabilityLinks.length, perplexityFitLinks.length],
      [0, 0, 0],
    );
  }
  const allClaimIds = claims.map((x) => x.id);
  const [allDecisionLinks, allCapabilityLinks, allFitLinks] = await Promise.all([
    read('all decision links', db.from('tool_decision_profile_claims').select('*').in('claim_id', allClaimIds)),
    read('all capability links', db.from('tool_capability_claims').select('*').in('claim_id', allClaimIds)),
    read('all fit links', db.from('tool_task_fit_claims').select('*').in('claim_id', allClaimIds)),
  ]);
  const claimById = new Map(claims.map((x) => [x.id, x]));
  const profileById = new Map(profiles.map((x) => [x.id, x]));
  const capById = new Map(capabilities.map((x) => [x.id, x]));
  const fitById = new Map(fits.map((x) => [x.id, x]));
  for (const link of [...decisionLinks, ...capabilityLinks, ...fitLinks]) {
    assert.ok(claimById.has(link.claim_id), 'Relation links a missing or foreign claim');
  }
  for (const link of allDecisionLinks) {
    assert.equal(
      link.tool_id,
      profileById.get(claimById.get(link.claim_id)?.profile_id)?.owner_id,
      'Cross-owner Decision link',
    );
  }
  for (const link of allCapabilityLinks) {
    assert.equal(
      capById.get(link.tool_capability_id)?.tool_id,
      profileById.get(claimById.get(link.claim_id)?.profile_id)?.owner_id,
      'Cross-owner Capability link',
    );
  }
  for (const link of allFitLinks) {
    assert.equal(
      fitById.get(link.fit_id)?.tool_id,
      profileById.get(claimById.get(link.claim_id)?.profile_id)?.owner_id,
      'Cross-owner Fit link',
    );
  }
  const base = process.env.PERPLEXITY_STAGE2_VERIFY_BASE_URL || 'https://aibesttool.com';
  const [taskPage, sitemap] = await Promise.all([
    fetch(`${base}/cn/tasks/research-with-citations`, { cache: 'no-store' }),
    fetch(`${base}/sitemap.xml`, { cache: 'no-store' }),
  ]);
  assert.equal(taskPage.status, 404, 'Research Task Page opened');
  const html = await taskPage.text();
  assert.match(`${taskPage.headers.get('x-robots-tag') || ''} ${html}`, /noindex/i, 'Task 404 lost noindex');
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.ok(
    !xml.includes('/tasks/research-with-citations') && !xml.includes('/ai/notebooklm'),
    'Task or Gemini Notebook entered sitemap',
  );
  const stateMd5 = stage2StateMd5({
    profile: perplexityProfiles[0] || null,
    sources: perplexitySources,
    claims: perplexityClaims,
    decision: perplexityDecision[0] || null,
    capabilities: perplexityCap,
    fit: perplexityFit[0] || null,
    decisionLinks: perplexityDecisionLinks,
    capabilityLinks: perplexityCapabilityLinks,
    fitLinks: perplexityFitLinks,
  });
  console.log(
    JSON.stringify(
      {
        phase,
        checkedAtUtc: new Date().toISOString(),
        productionWrites: 0,
        consensus: { status: 'published', capabilityLinks: 7, fitLinks: 6 },
        geminiNotebook: { status: 'reviewed', links: [5, 9, 6], indexReason: notebookIndex.reason },
        perplexity: {
          status: phase.slice(2),
          profile: perplexityProfiles.length,
          sources: perplexitySources.length,
          claims: perplexityClaims.length,
          capabilities: perplexityCap.length,
          fit: perplexityFit.length,
          links: 0,
          stateMd5,
        },
        taskPageStatus: taskPage.status,
        taskPageNoindex: true,
        sitemapEligible: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { APPROVED_TASK_PAGE_SLUGS, getTaskPageRouteDecision } from '../lib/seo/taskPageApproval';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const groups = [
  {
    name: 'Gemini Notebook',
    toolId: 'cec78907-e2a1-4eb7-853a-a58334026280',
    profileId: 'c7890701-0000-4000-8000-000000000001',
    capabilityIds: ['c7890701-0000-4000-8000-000000000201', 'c7890701-0000-4000-8000-000000000202'],
    fitId: 'c7890701-0000-4000-8000-000000000301',
    decisionCapabilities: 5,
    toolCapabilityLinks: 9,
    fitLinks: 6,
    expectedRationale: {
      en: 'Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.',
      cn: '用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。',
    },
    roleCheck: (r: any) =>
      r.en?.includes('selects or supplies and imports into a notebook') &&
      r.en?.includes('not open-web search') &&
      r.cn?.includes('用户选择/提供并导入 notebook') &&
      r.cn?.includes('不等同于开放网页检索'),
  },
  {
    name: 'Perplexity',
    toolId: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93',
    profileId: 'd0186230-0000-4000-8000-000000000001',
    capabilityIds: ['d0186230-0000-4000-8000-000000000201', 'd0186230-0000-4000-8000-000000000202'],
    fitId: 'd0186230-0000-4000-8000-000000000301',
    decisionCapabilities: 6,
    toolCapabilityLinks: 10,
    fitLinks: 7,
    expectedRationale: null,
    roleCheck: (r: any) =>
      r.en?.toLowerCase().includes('open-web') &&
      r.en?.toLowerCase().includes('cited answers') &&
      r.cn?.includes('开放网页发现') &&
      r.cn?.includes('带来源回答'),
  },
];

type Row = Record<string, any>;
async function read(label: string, request: PromiseLike<{ data: Row[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}
const currentReview = (row: Row, now: number) =>
  Boolean(row.reviewed_by) &&
  Number.isFinite(Date.parse(row.reviewed_at)) &&
  Date.parse(row.reviewed_at) <= now &&
  Number.isFinite(Date.parse(row.review_due_at)) &&
  Date.parse(row.review_due_at) > now;
const hasPurposes = (rows: Row[], required: string[]) =>
  required.every((purpose) => rows.some((row) => row.purpose === purpose));

async function main() {
  const db = createAdminClient();
  const [tasks, taskCapabilities, profiles, decisions, capabilities, fits] = await Promise.all([
    read('Task', db.from('decision_tasks').select('*').eq('id', taskId)),
    read('Task Capabilities', db.from('task_capabilities').select('*').eq('task_id', taskId)),
    read(
      'Profiles',
      db
        .from('product_intelligence_profiles')
        .select('*')
        .in(
          'id',
          groups.map((x) => x.profileId),
        ),
    ),
    read(
      'Decisions',
      db
        .from('tool_decision_profiles')
        .select('*')
        .in(
          'tool_id',
          groups.map((x) => x.toolId),
        ),
    ),
    read(
      'Tool Capabilities',
      db
        .from('tool_capabilities')
        .select('*')
        .in(
          'id',
          groups.flatMap((x) => x.capabilityIds),
        ),
    ),
    read(
      'Fits',
      db
        .from('tool_task_fits')
        .select('*')
        .in(
          'id',
          groups.map((x) => x.fitId),
        ),
    ),
  ]);
  const capabilityIds = groups.flatMap((x) => x.capabilityIds);
  const fitIds = groups.map((x) => x.fitId);
  const toolDecisionLinks = await Promise.all(
    groups.map((x) =>
      read(`Decision links ${x.name}`, db.from('tool_decision_profile_claims').select('*').eq('tool_id', x.toolId)),
    ),
  );
  const [capabilityLinks, fitLinks] = await Promise.all([
    read(
      'Tool Capability links',
      db.from('tool_capability_claims').select('*').in('tool_capability_id', capabilityIds),
    ),
    read('Fit links', db.from('tool_task_fit_claims').select('*').in('fit_id', fitIds)),
  ]);
  const claimIds = [
    ...new Set([...toolDecisionLinks.flat(), ...capabilityLinks, ...fitLinks].map((x) => String(x.claim_id))),
  ];
  const claims = claimIds.length
    ? await read('Claims', db.from('product_intelligence_claims').select('*').in('id', claimIds))
    : [];
  const sourceIds = [...new Set(claims.map((x) => String(x.source_id)))];
  const sources = sourceIds.length
    ? await read('Sources', db.from('product_intelligence_sources').select('*').in('id', sourceIds))
    : [];
  const now = Date.now();
  const task = tasks[0];
  const blockers: string[] = [];
  if (tasks.length !== 1 || task?.slug !== 'research-with-citations' || task?.status !== 'active')
    blockers.push('TASK_IDENTITY_OR_STATE');
  if (
    !APPROVED_TASK_PAGE_SLUGS.includes('research-with-citations') &&
    getTaskPageRouteDecision('/cn/tasks/research-with-citations') !== 'closed'
  )
    blockers.push('TASK_PAGE_ROUTE_NOT_CLOSED');
  if (taskCapabilities.length === 0 || taskCapabilities.some((x) => x.status !== 'published' || !currentReview(x, now)))
    blockers.push('TASK_CAPABILITY_REVIEW_NOT_CURRENT');
  const profileById = new Map(profiles.map((x) => [x.id, x]));
  const sourceById = new Map(sources.map((x) => [x.id, x]));
  const claimById = new Map(claims.map((x) => [x.id, x]));
  const groupsOut = groups.map((target, index) => {
    const profile = profileById.get(target.profileId);
    const decision = decisions.find((x) => x.tool_id === target.toolId);
    const targetCaps = capabilities.filter((x) => x.tool_id === target.toolId && target.capabilityIds.includes(x.id));
    const fit = fits.find((x) => x.id === target.fitId);
    const capLinks = capabilityLinks.filter((x) => target.capabilityIds.includes(x.tool_capability_id));
    const groupFitLinks = fitLinks.filter((x) => x.fit_id === target.fitId);
    const dLinks = toolDecisionLinks[index];
    const groupClaims = [...dLinks, ...capLinks, ...groupFitLinks].map((link) => claimById.get(link.claim_id));
    const claimsCurrentOfficial = groupClaims.every((claim) => {
      if (!claim) return false;
      const source = sourceById.get(claim.source_id);
      return (
        claim.profile_id === target.profileId &&
        claim.verification_status === 'verified' &&
        claim.conflict_status === 'none' &&
        !claim.invalidated_at &&
        Boolean(claim.verified_by) &&
        Boolean(claim.verified_at) &&
        Date.parse(claim.review_due_at) > now &&
        (!claim.expires_at || Date.parse(claim.expires_at) > now) &&
        claim.source_type === 'official' &&
        source?.profile_id === target.profileId &&
        source?.source_type === 'official' &&
        source?.fetch_status === 'success' &&
        Boolean(source.last_verified_at) &&
        source.last_verified_at <= new Date(now).toISOString() &&
        claim.source_url === source.url
      );
    });
    const fitRoleOk = Boolean(fit && target.roleCheck(fit.rationale));
    const fitCandidateMatches =
      !target.expectedRationale ||
      (fit?.rationale?.en === target.expectedRationale.en && fit?.rationale?.cn === target.expectedRationale.cn);
    const exactCounts =
      dLinks.length === target.decisionCapabilities &&
      capLinks.length === target.toolCapabilityLinks &&
      groupFitLinks.length === target.fitLinks;
    const capPurposeChecks =
      targetCaps.length === 2 &&
      targetCaps.every((capability) => {
        const ownLinks = capLinks.filter((x) => x.tool_capability_id === capability.id);
        return hasPurposes(ownLinks, ['support', 'availability', 'plan', 'limitation']);
      });
    const fitPurposeCheck = hasPurposes(groupFitLinks, ['fit', 'limitation']);
    const reviewed = Boolean(
      profile &&
        profile.profile_status === 'ready' &&
        profile.owner_type === 'tool' &&
        profile.owner_id === target.toolId &&
        profile.next_review_at &&
        Date.parse(profile.next_review_at) > now &&
        decision?.editorial_status === 'reviewed' &&
        currentReview(decision, now) &&
        targetCaps.length === 2 &&
        targetCaps.every((x) => x.status === 'reviewed' && currentReview(x, now)) &&
        fit?.status === 'reviewed' &&
        currentReview(fit, now),
    );
    const fitContentComplete = Boolean(
      fit &&
        fit.fit_level === 'conditional' &&
        fit.rationale?.en &&
        fit.rationale?.cn &&
        Array.isArray(fit.required_conditions) &&
        fit.required_conditions.length &&
        Array.isArray(fit.disqualifiers) &&
        fit.disqualifiers.length &&
        fit.required_conditions.every((x: Row) => x.en && x.cn) &&
        fit.disqualifiers.every((x: Row) => x.en && x.cn),
    );
    const manifest = {
      toolId: target.toolId,
      profile: profile && {
        id: profile.id,
        updated_at: profile.updated_at,
        profile_status: profile.profile_status,
        next_review_at: profile.next_review_at,
      },
      decision: decision && {
        tool_id: decision.tool_id,
        updated_at: decision.updated_at,
        status: decision.editorial_status,
        reviewed_by: decision.reviewed_by,
        reviewed_at: decision.reviewed_at,
        review_due_at: decision.review_due_at,
      },
      toolCapabilities: targetCaps.map((x) => ({
        id: x.id,
        updated_at: x.updated_at,
        status: x.status,
        reviewed_by: x.reviewed_by,
        reviewed_at: x.reviewed_at,
        review_due_at: x.review_due_at,
      })),
      fits: fit
        ? [
            {
              id: fit.id,
              updated_at: fit.updated_at,
              status: fit.status,
              reviewed_by: fit.reviewed_by,
              reviewed_at: fit.reviewed_at,
              review_due_at: fit.review_due_at,
              rationale: fit.rationale,
              required_conditions: fit.required_conditions,
              disqualifiers: fit.disqualifiers,
            },
          ]
        : [],
      relationCounts: { decision: dLinks.length, toolCapability: capLinks.length, fit: groupFitLinks.length },
    };
    const checks = {
      reviewed,
      exactCounts,
      sameOwnerReadyEvidence: claimsCurrentOfficial,
      toolCapabilityPurposes: capPurposeChecks,
      fitPurposes: fitPurposeCheck,
      rationaleConditionsDisqualifiers: fitContentComplete,
      sourceRole: fitRoleOk,
      candidateRationale: fitCandidateMatches,
    };
    for (const [name, passed] of Object.entries(checks))
      if (!passed)
        blockers.push(
          `${target.name.replaceAll(' ', '_').toUpperCase()}_${name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).toUpperCase()}`,
        );
    return { name: target.name, checks, manifest };
  });

  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let notebook: Row;
  let perplexity: Row;
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query(
      'SELECT id,name,url,status,page_quality_status,content,detail FROM tools WHERE id = ANY($1::uuid[])',
      [[groups[0].toolId, groups[1].toolId]],
    );
    assert.equal(result.rows.length, 2);
    notebook = result.rows.find((row) => row.id === groups[0].toolId)!;
    perplexity = result.rows.find((row) => row.id === groups[1].toolId)!;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  const toolIndex = (row: Row) =>
    getToolIndexDecision({
      status: row.status,
      pageQualityStatus: row.page_quality_status,
      categoryId: null,
      imageUrl: null,
      thumbnailUrl: null,
      content: row.content,
      detail: row.detail,
      pricing: null,
      tags: null,
    });
  const notebookIndex = toolIndex(notebook);
  const perplexityIndex = toolIndex(perplexity);
  const base = process.env.CL02_VERIFY_BASE_URL || 'https://aibesttool.com';
  const [taskPage, sitemap] = await Promise.all([
    fetch(`${base}/cn/tasks/research-with-citations`, { cache: 'no-store' }),
    fetch(`${base}/sitemap.xml`, { cache: 'no-store' }),
  ]);
  const taskPageHtml = await taskPage.text();
  const sitemapText = await sitemap.text();
  const pageUnchanged =
    taskPage.status === 404 &&
    !APPROVED_TASK_PAGE_SLUGS.includes('research-with-citations') &&
    getTaskPageRouteDecision('/cn/tasks/research-with-citations') === 'closed' &&
    /noindex/i.test(`${taskPage.headers.get('x-robots-tag') || ''} ${taskPageHtml}`);
  const indexUnchanged = notebookIndex.indexable === false && notebookIndex.reason === 'indexing_paused';
  const sitemapUnchanged =
    sitemap.status === 200 &&
    !sitemapText.includes('/tasks/research-with-citations') &&
    !sitemapText.includes('/ai/notebooklm') &&
    !sitemapText.includes('/ai/perplexity');
  if (!pageUnchanged) blockers.push('TASK_PAGE_OPEN_OR_APPROVED');
  if (!indexUnchanged) blockers.push('GEMINI_TOOL_INDEX_STATE_CHANGED');
  if (!sitemapUnchanged) blockers.push('TASK_OR_TOOL_ROUTE_IN_SITEMAP');
  const output = {
    checkedAt: new Date().toISOString(),
    readOnly: true,
    productionWrites: 0,
    groups: groupsOut,
    pageAndIndex: {
      taskPageStatus: taskPage.status,
      taskPageNoindex: pageUnchanged,
      toolIndexDecisions: { geminiNotebook: notebookIndex.reason, perplexity: perplexityIndex.reason },
      sitemapEligible: !sitemapUnchanged,
    },
    blockers: [...new Set(blockers)],
    readyForIndependentQa: blockers.length === 0,
  };
  console.log(JSON.stringify(output, null, 2));
  if (blockers.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      { readOnly: true, productionWrites: 0, error: error instanceof Error ? error.message : String(error) },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});

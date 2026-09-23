import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '@/lib/database/connection';
import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

type TaskSpec = {
  slug: string;
  name: { en: string; cn: string };
  description: { en: string; cn: string };
  constraintSchema: Record<string, unknown>;
};

type CapabilitySpec = {
  slug: string;
  group: 'creation' | 'editing' | 'analysis' | 'automation' | 'collaboration' | 'governance' | 'delivery';
  name: { en: string; cn: string };
  description: { en: string; cn: string };
};

export const decisionGraphTasks: TaskSpec[] = [
  {
    slug: 'product-image-to-short-video',
    name: { en: 'Turn product images into short videos', cn: '将产品图片制作成短视频' },
    description: {
      en: 'Create and refine short product-video concepts from supplied images.',
      cn: '从已有产品图片生成并完善短视频概念。',
    },
    constraintSchema: { needsInputImage: true, output: 'short_video', requiresReview: true },
  },
  {
    slug: 'meeting-notes',
    name: { en: 'Transcribe and summarize meetings', cn: '转录并总结会议' },
    description: {
      en: 'Capture a meeting, produce a reviewable summary, and identify follow-up work.',
      cn: '记录会议、生成可复核摘要并识别后续工作。',
    },
    constraintSchema: { needsAudioCapture: true, output: 'meeting_summary', requiresReview: true },
  },
  {
    slug: 'brand-constrained-marketing-content',
    name: { en: 'Create marketing content within brand constraints', cn: '在品牌约束下生成营销内容' },
    description: {
      en: 'Draft marketing content while retaining an editorial review against brand requirements.',
      cn: '在保留品牌要求人工审核的前提下起草营销内容。',
    },
    constraintSchema: { needsBrandGuidance: true, output: 'marketing_draft', requiresReview: true },
  },
  {
    slug: 'build-app-with-ai',
    name: { en: 'Build an application with AI', cn: '使用 AI 构建应用' },
    description: {
      en: 'Use AI-assisted development while keeping implementation, integration, and deployment decisions reviewable.',
      cn: '使用 AI 辅助开发，同时保留可审核的实现、集成和部署决策。',
    },
    constraintSchema: { output: 'application', requiresCodeReview: true, requiresIntegrationReview: true },
  },
  {
    slug: 'research-with-citations',
    name: { en: 'Research papers and sources with citations', cn: '基于引用研究论文和资料' },
    description: {
      en: 'Find and synthesize research while preserving source and citation review.',
      cn: '在保留来源与引用审核的前提下查找并综合研究资料。',
    },
    constraintSchema: { needsCitations: true, output: 'research_synthesis', requiresSourceReview: true },
  },
  {
    slug: 'ai-voiceover',
    name: { en: 'Create an AI voiceover', cn: '创建 AI 配音' },
    description: {
      en: 'Generate voice narration with consent, output, and delivery constraints reviewed.',
      cn: '在审核同意、输出和交付限制的前提下生成配音。',
    },
    constraintSchema: { output: 'voiceover', requiresConsentReview: true, requiresExportReview: true },
  },
];

export const decisionGraphCapabilities: CapabilitySpec[] = [
  {
    slug: 'image-to-video-generation',
    group: 'creation',
    name: { en: 'Image-to-video generation', cn: '图片转视频生成' },
    description: { en: 'Generate video from supplied images.', cn: '从已有图片生成视频。' },
  },
  {
    slug: 'video-editing-and-export',
    group: 'delivery',
    name: { en: 'Video editing and export', cn: '视频编辑与导出' },
    description: { en: 'Refine generated video and deliver an output file.', cn: '完善生成的视频并交付输出文件。' },
  },
  {
    slug: 'meeting-transcription',
    group: 'analysis',
    name: { en: 'Meeting transcription', cn: '会议转录' },
    description: { en: 'Convert meeting speech into reviewable text.', cn: '将会议语音转换为可复核文本。' },
  },
  {
    slug: 'meeting-summary-and-actions',
    group: 'collaboration',
    name: { en: 'Meeting summaries and actions', cn: '会议摘要与行动项' },
    description: {
      en: 'Produce summaries and follow-up actions from a meeting.',
      cn: '从会议中生成摘要和后续行动项。',
    },
  },
  {
    slug: 'brand-guided-content-generation',
    group: 'creation',
    name: { en: 'Brand-guided content generation', cn: '品牌引导内容生成' },
    description: { en: 'Draft content using supplied brand guidance.', cn: '使用提供的品牌指引起草内容。' },
  },
  {
    slug: 'brand-controls-and-style-guidance',
    group: 'governance',
    name: { en: 'Brand controls and style guidance', cn: '品牌控制与风格指引' },
    description: {
      en: 'Apply and review style, policy, and approval constraints.',
      cn: '应用并审核风格、政策和审批约束。',
    },
  },
  {
    slug: 'ai-assisted-app-development',
    group: 'automation',
    name: { en: 'AI-assisted app development', cn: 'AI 辅助应用开发' },
    description: { en: 'Generate or modify application code with review.', cn: '在审核下生成或修改应用代码。' },
  },
  {
    slug: 'developer-workflow-integration',
    group: 'automation',
    name: { en: 'Developer workflow integration', cn: '开发工作流集成' },
    description: {
      en: 'Connect development work to tools, services, or automation.',
      cn: '将开发工作连接到工具、服务或自动化。',
    },
  },
  {
    slug: 'research-discovery',
    group: 'analysis',
    name: { en: 'Research discovery', cn: '研究资料发现' },
    description: { en: 'Find papers and relevant source material.', cn: '查找论文和相关资料。' },
  },
  {
    slug: 'citation-traceability',
    group: 'governance',
    name: { en: 'Citation traceability', cn: '引用可追溯性' },
    description: { en: 'Keep sources and citations reviewable.', cn: '保持来源和引用可审核。' },
  },
  {
    slug: 'text-to-speech-voice-generation',
    group: 'creation',
    name: { en: 'Text-to-speech voice generation', cn: '文本转语音生成' },
    description: { en: 'Generate narration from supplied text.', cn: '从提供的文本生成配音。' },
  },
  {
    slug: 'voice-consent-and-export',
    group: 'governance',
    name: { en: 'Voice consent and export', cn: '声音同意与导出' },
    description: { en: 'Review voice rights, consent, and output delivery.', cn: '审核声音权利、同意和输出交付。' },
  },
];

const targets = [
  ['chatgpt', ['chatgpt']],
  ['claude', ['claude', 'anthropic']],
  ['gemini', ['gemini']],
  ['fathom', ['fathom']],
  ['gamma', ['gamma']],
  ['consensus', ['consensus']],
  ['runway', ['runway']],
  ['luma-ai', ['luma-ai', 'luma']],
  ['pipedream', ['pipedream']],
  ['cursor', ['cursor']],
  ['the-graph', ['the-graph']],
  ['n8n', ['n8n']],
  ['openrouter', ['openrouter']],
  ['grammarly', ['grammarly']],
  ['jasper', ['jasper']],
  ['elevenlabs', ['elevenlabs']],
  ['midjourney', ['midjourney']],
  ['otter-ai', ['otter-ai', 'otter']],
  ['fireflies-ai', ['fireflies', 'fireflies-ai']],
  ['descript', ['descript']],
] as const;

const taskCapabilityPlan: Array<{
  task: string;
  capability: string;
  importance: 'required' | 'preferred';
  rationale: TaskSpec['name'];
}> = [
  {
    task: 'product-image-to-short-video',
    capability: 'image-to-video-generation',
    importance: 'required',
    rationale: { en: 'A source image must be turned into video.', cn: '需要将源图片转为视频。' },
  },
  {
    task: 'product-image-to-short-video',
    capability: 'video-editing-and-export',
    importance: 'preferred',
    rationale: { en: 'A usable short video needs a delivery path.', cn: '可用短视频需要交付路径。' },
  },
  {
    task: 'meeting-notes',
    capability: 'meeting-transcription',
    importance: 'required',
    rationale: { en: 'The meeting needs a reviewable transcript.', cn: '会议需要可复核的转录文本。' },
  },
  {
    task: 'meeting-notes',
    capability: 'meeting-summary-and-actions',
    importance: 'required',
    rationale: { en: 'The output must identify the summary and follow-up work.', cn: '输出必须识别摘要和后续工作。' },
  },
  {
    task: 'brand-constrained-marketing-content',
    capability: 'brand-guided-content-generation',
    importance: 'required',
    rationale: { en: 'The task starts with brand-guided drafting.', cn: '任务从品牌引导的内容起草开始。' },
  },
  {
    task: 'brand-constrained-marketing-content',
    capability: 'brand-controls-and-style-guidance',
    importance: 'preferred',
    rationale: { en: 'Brand constraints still need editorial review.', cn: '品牌约束仍需编辑审核。' },
  },
  {
    task: 'build-app-with-ai',
    capability: 'ai-assisted-app-development',
    importance: 'required',
    rationale: { en: 'The requested output is an application.', cn: '请求的输出是应用。' },
  },
  {
    task: 'build-app-with-ai',
    capability: 'developer-workflow-integration',
    importance: 'preferred',
    rationale: { en: 'Implementation must fit a delivery workflow.', cn: '实现必须适配交付工作流。' },
  },
  {
    task: 'research-with-citations',
    capability: 'research-discovery',
    importance: 'required',
    rationale: { en: 'Relevant papers and sources must be found.', cn: '必须找到相关论文和资料。' },
  },
  {
    task: 'research-with-citations',
    capability: 'citation-traceability',
    importance: 'required',
    rationale: { en: 'Citations require a reviewable source trail.', cn: '引用需要可审核的来源链。' },
  },
  {
    task: 'ai-voiceover',
    capability: 'text-to-speech-voice-generation',
    importance: 'required',
    rationale: { en: 'The output is generated narration.', cn: '输出是生成的配音。' },
  },
  {
    task: 'ai-voiceover',
    capability: 'voice-consent-and-export',
    importance: 'preferred',
    rationale: { en: 'Consent and delivery constraints require review.', cn: '同意和交付限制需要审核。' },
  },
];

// These are editorially selected against the exact, read-only inventory below.
// They are intentionally sparse: a target is omitted until a current verified
// claim supports the stated relation, rather than treating 20 × 6 as a quota.
const manualToolRelations = [
  {
    target: 'fathom',
    task: 'meeting-notes',
    capability: 'meeting-summary-and-actions',
    claimId: 'fddb0da1-3fb5-4bad-9ad5-df543171985f',
    fit: 'strong',
  },
  {
    target: 'otter-ai',
    task: 'meeting-notes',
    capability: 'meeting-transcription',
    claimId: 'e54d8004-86ef-476d-addc-cb5215e94a5f',
    fit: 'strong',
  },
  {
    target: 'fireflies-ai',
    task: 'meeting-notes',
    capability: 'meeting-transcription',
    claimId: '32e5934f-bc33-415c-9d98-e88529155855',
    fit: 'conditional',
  },
  {
    target: 'luma-ai',
    task: 'product-image-to-short-video',
    capability: 'image-to-video-generation',
    claimId: '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939',
    fit: 'conditional',
  },
  {
    target: 'consensus',
    task: 'research-with-citations',
    capability: 'research-discovery',
    claimId: '363978e2-46d0-40fb-a344-42b61e19325c',
    fit: 'strong',
  },
  {
    target: 'n8n',
    task: 'build-app-with-ai',
    capability: 'developer-workflow-integration',
    claimId: '806bedca-c1e4-4fd1-ae57-e4db06567e47',
    fit: 'strong',
  },
  {
    target: 'openrouter',
    task: 'build-app-with-ai',
    capability: 'developer-workflow-integration',
    claimId: '76cf5413-ce8c-424d-9a6b-21584758cf72',
    fit: 'conditional',
  },
] as const;

type ToolRow = { id: string; name: string; status: string; page_quality_status: string | null };
type Row = Record<string, unknown>;

function currentClaim(claim: Row, now: Date): boolean {
  const beforeNow = (value: unknown) => typeof value === 'string' && new Date(value).getTime() <= now.getTime();
  return (
    claim.verification_status === 'verified' &&
    claim.conflict_status === 'none' &&
    !claim.invalidated_at &&
    !beforeNow(claim.expires_at) &&
    !beforeNow(claim.review_due_at)
  );
}

async function inventory() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let toolRows: ToolRow[] = [];
  try {
    await neon.query('BEGIN READ ONLY');
    const aliases = targets.flatMap(([, names]) => names);
    const result = await neon.query<ToolRow>(
      'SELECT id, name, status, page_quality_status FROM tools WHERE lower(name) = ANY($1::text[]) ORDER BY name',
      [aliases],
    );
    toolRows = result.rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }

  const supabase = createAdminClient();
  const toolIds = toolRows.map((tool) => tool.id);
  const profilesResult = toolIds.length
    ? await supabase
        .from('product_intelligence_profiles')
        .select('id, owner_type, owner_id, product_name, profile_status')
        .eq('owner_type', 'tool')
        .in('owner_id', toolIds)
    : { data: [], error: null };
  if (profilesResult.error) throw new Error(profilesResult.error.message);
  const profiles = (profilesResult.data || []) as Row[];
  const profileIds = profiles.map((profile) => String(profile.id));
  const claimsResult = profileIds.length
    ? await supabase
        .from('product_intelligence_claims')
        .select(
          'id, profile_id, claim_type, claim_key, source_url, verification_status, conflict_status, invalidated_at, expires_at, review_due_at',
        )
        .in('profile_id', profileIds)
    : { data: [], error: null };
  if (claimsResult.error) throw new Error(claimsResult.error.message);
  const claims = (claimsResult.data || []) as Row[];
  const now = new Date();

  const output = targets.map(([target, aliases]) => {
    const matches = toolRows.filter((tool) => aliases.includes(tool.name.toLowerCase() as never));
    const tool = matches.length === 1 ? matches[0] : null;
    const matchingProfiles = tool ? profiles.filter((profile) => profile.owner_id === tool.id) : [];
    const profileIdsForTool = new Set(matchingProfiles.map((profile) => String(profile.id)));
    const verifiedClaims = claims.filter(
      (claim) => profileIdsForTool.has(String(claim.profile_id)) && currentClaim(claim, now),
    );
    let identityState: 'missing' | 'unique' | 'conflict' = 'conflict';
    if (matches.length === 0) identityState = 'missing';
    else if (matches.length === 1) identityState = 'unique';
    return {
      target,
      aliases,
      identity: tool
        ? {
            toolId: tool.id,
            canonicalSlug: tool.name,
            status: tool.status,
            pageQualityStatus: tool.page_quality_status,
          }
        : null,
      identityState,
      profiles: matchingProfiles.map((profile) => ({
        id: profile.id,
        productName: profile.product_name,
        status: profile.profile_status,
      })),
      validVerifiedClaimCount: verifiedClaims.length,
      validVerifiedClaims: verifiedClaims.map((claim) => ({
        id: claim.id,
        type: claim.claim_type,
        key: claim.claim_key,
        sourceUrl: claim.source_url,
      })),
    };
  });

  const existingTasksResult = await supabase
    .from('decision_tasks')
    .select('id, slug, status')
    .in(
      'slug',
      decisionGraphTasks.map((task) => task.slug),
    );
  if (existingTasksResult.error) throw new Error(existingTasksResult.error.message);

  return {
    success: true,
    mode: 'inventory-read-only',
    targetCount: targets.length,
    uniqueTools: output.filter((tool) => tool.identityState === 'unique').length,
    toolsWithCurrentVerifiedClaims: output.filter((tool) => tool.validVerifiedClaimCount > 0).length,
    tasks: decisionGraphTasks,
    capabilities: decisionGraphCapabilities,
    existingTasks: existingTasksResult.data || [],
    tools: output,
  };
}

type InventoryResult = Awaited<ReturnType<typeof inventory>>;

function buildSeedPlan(inventoryResult: InventoryResult) {
  const tools = new Map(inventoryResult.tools.map((tool) => [tool.target, tool]));
  const eligibleRelations = manualToolRelations.flatMap((relation) => {
    const tool = tools.get(relation.target);
    if (
      !tool?.identity ||
      tool.identityState !== 'unique' ||
      !tool.validVerifiedClaims.some((claim) => claim.id === relation.claimId)
    ) {
      return [];
    }
    return [{ ...relation, toolId: tool.identity.toolId }];
  });
  const relationTargets = new Set(eligibleRelations.map((relation) => relation.target));
  const evidenceGaps = inventoryResult.tools
    .filter((tool) => tool.identityState !== 'unique' || !relationTargets.has(tool.target))
    .map((tool) => ({
      target: tool.target,
      reason: tool.identityState !== 'unique' ? tool.identityState : 'no_manual_current_claim_mapping',
    }));

  return {
    tasks: decisionGraphTasks,
    capabilities: decisionGraphCapabilities,
    taskCapabilities: taskCapabilityPlan,
    eligibleRelations,
    evidenceGaps,
    expectedWriteCounts: {
      tasks: decisionGraphTasks.length,
      capabilities: decisionGraphCapabilities.length,
      taskCapabilities: taskCapabilityPlan.length,
      toolCapabilities: eligibleRelations.length,
      toolTaskFits: eligibleRelations.length,
      toolCapabilityClaimLinks: eligibleRelations.length,
      toolTaskFitClaimLinks: eligibleRelations.length,
    },
  };
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: unknown): string {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function sqlValues(rows: string[][]): string {
  return rows.map((row) => `  (${row.join(', ')})`).join(',\n');
}

/**
 * Produces a reviewable, manually executable transaction from the exact
 * read-only inventory used to plan the seed. This function never connects to
 * the database and deliberately contains no connection configuration.
 */
export function emitSeedSql(plan: ReturnType<typeof buildSeedPlan>, reviewerId: string): string {
  const taskRows = plan.tasks.map((task, index) => [
    sqlLiteral(task.slug),
    sqlJson(task.name),
    sqlJson(task.description),
    "'active'",
    String(index),
    sqlJson(task.constraintSchema),
  ]);
  const capabilityRows = plan.capabilities.map((capability, index) => [
    sqlLiteral(capability.slug),
    sqlJson(capability.name),
    sqlJson(capability.description),
    sqlLiteral(capability.group),
    "'active'",
    String(index),
  ]);
  const taskCapabilityRows = plan.taskCapabilities.map((relation) => [
    sqlLiteral(relation.task),
    sqlLiteral(relation.capability),
    sqlLiteral(relation.importance),
    sqlJson(relation.rationale),
  ]);
  const relationRows = plan.eligibleRelations.map((relation) => [
    `${sqlLiteral(relation.toolId)}::uuid`,
    sqlLiteral(relation.task),
    sqlLiteral(relation.capability),
    `${sqlLiteral(relation.claimId)}::uuid`,
    sqlLiteral(relation.fit),
  ]);

  return `-- DIFF-03 decision graph first batch. Generated from a read-only inventory; do not edit around guards.
-- This transaction intentionally creates reviewed relations only. It does not write directory records or public-discovery configuration.
BEGIN;

DO $$
DECLARE
  required_relation TEXT;
BEGIN
  FOREACH required_relation IN ARRAY ARRAY[
    'auth.users',
    'public.decision_tasks',
    'public.decision_capabilities',
    'public.task_capabilities',
    'public.tool_capabilities',
    'public.tool_capability_claims',
    'public.tool_task_fits',
    'public.tool_task_fit_claims',
    'public.product_intelligence_profiles',
    'public.product_intelligence_claims'
  ] LOOP
    IF to_regclass(required_relation) IS NULL THEN
      RAISE EXCEPTION 'DIFF-01/Decision Finder prerequisite relation is missing: %', required_relation;
    END IF;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = ${sqlLiteral(reviewerId)}::uuid) THEN
    RAISE EXCEPTION 'Seed reviewer does not exist in auth.users.';
  END IF;
END
$$;

CREATE TEMP TABLE decision_graph_seed_task_capabilities (
  task_slug TEXT NOT NULL,
  capability_slug TEXT NOT NULL,
  importance TEXT NOT NULL,
  rationale JSONB NOT NULL,
  PRIMARY KEY (task_slug, capability_slug)
) ON COMMIT DROP;

INSERT INTO decision_graph_seed_task_capabilities (task_slug, capability_slug, importance, rationale)
VALUES
${sqlValues(taskCapabilityRows)};

CREATE TEMP TABLE decision_graph_seed_relations (
  tool_id UUID NOT NULL,
  task_slug TEXT NOT NULL,
  capability_slug TEXT NOT NULL,
  claim_id UUID NOT NULL,
  fit_level TEXT NOT NULL,
  PRIMARY KEY (tool_id, task_slug, capability_slug, claim_id)
) ON COMMIT DROP;

INSERT INTO decision_graph_seed_relations (tool_id, task_slug, capability_slug, claim_id, fit_level)
VALUES
${sqlValues(relationRows)};

DO $$
BEGIN
  IF (SELECT count(*) FROM decision_graph_seed_relations) <> (
    SELECT count(*)
    FROM decision_graph_seed_relations relation
    JOIN public.product_intelligence_claims claim ON claim.id = relation.claim_id
    JOIN public.product_intelligence_profiles profile ON profile.id = claim.profile_id
    WHERE profile.owner_type = 'tool'
      AND profile.owner_id = relation.tool_id
      AND claim.verification_status = 'verified'
      AND claim.conflict_status = 'none'
      AND claim.invalidated_at IS NULL
      AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
      AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
  ) THEN
    RAISE EXCEPTION 'Seed snapshot is no longer current: a mapped claim is missing, invalid, conflicted, expired, or owned by another tool.';
  END IF;

  PERFORM claim.id
  FROM decision_graph_seed_relations relation
  JOIN public.product_intelligence_claims claim ON claim.id = relation.claim_id
  JOIN public.product_intelligence_profiles profile ON profile.id = claim.profile_id
  WHERE profile.owner_type = 'tool'
    AND profile.owner_id = relation.tool_id
    AND claim.verification_status = 'verified'
    AND claim.conflict_status = 'none'
    AND claim.invalidated_at IS NULL
    AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
    AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
  FOR SHARE OF claim, profile;
END
$$;

INSERT INTO public.decision_tasks (slug, name, description, status, display_order, constraint_schema)
VALUES
${sqlValues(taskRows)}
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.decision_capabilities (slug, name, description, capability_group, status, display_order)
VALUES
${sqlValues(capabilityRows)}
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.decision_tasks WHERE slug IN (
    SELECT task_slug FROM decision_graph_seed_task_capabilities
  )) <> (SELECT count(DISTINCT task_slug) FROM decision_graph_seed_task_capabilities) THEN
    RAISE EXCEPTION 'Seed task resolution failed after insert.';
  END IF;

  IF (SELECT count(*) FROM public.decision_capabilities WHERE slug IN (
    SELECT capability_slug FROM decision_graph_seed_task_capabilities
  )) <> (SELECT count(DISTINCT capability_slug) FROM decision_graph_seed_task_capabilities) THEN
    RAISE EXCEPTION 'Seed capability resolution failed after insert.';
  END IF;
END
$$;

DO $$
BEGIN
  PERFORM 1
  FROM public.task_capabilities task_capability
  JOIN public.decision_tasks task ON task.id = task_capability.task_id
  JOIN public.decision_capabilities capability ON capability.id = task_capability.capability_id
  JOIN decision_graph_seed_task_capabilities seed
    ON seed.task_slug = task.slug AND seed.capability_slug = capability.slug
  WHERE task_capability.status = 'published'
  FOR UPDATE OF task_capability;
  PERFORM 1
  FROM public.task_capabilities task_capability
  JOIN public.decision_tasks task ON task.id = task_capability.task_id
  JOIN public.decision_capabilities capability ON capability.id = task_capability.capability_id
  JOIN decision_graph_seed_task_capabilities seed
    ON seed.task_slug = task.slug AND seed.capability_slug = capability.slug
  WHERE task_capability.status = 'published'
    AND task_capability.importance <> seed.importance;
  IF FOUND THEN
    RAISE EXCEPTION 'Published Task Capability conflicts with the planned importance and requires a manual editorial change.';
  END IF;

  PERFORM 1
  FROM public.tool_capabilities tool_capability
  JOIN public.decision_capabilities capability ON capability.id = tool_capability.capability_id
  JOIN decision_graph_seed_relations seed
    ON seed.tool_id = tool_capability.tool_id AND seed.capability_slug = capability.slug
  WHERE tool_capability.status = 'published'
  FOR UPDATE OF tool_capability;
  PERFORM 1
  FROM public.tool_capabilities tool_capability
  JOIN public.decision_capabilities capability ON capability.id = tool_capability.capability_id
  JOIN decision_graph_seed_relations seed
    ON seed.tool_id = tool_capability.tool_id AND seed.capability_slug = capability.slug
  WHERE tool_capability.status = 'published'
    AND (
      tool_capability.support_level NOT IN ('strong', 'partial')
      OR NOT EXISTS (
        SELECT 1
        FROM public.tool_capability_claims claim_link
        WHERE claim_link.tool_capability_id = tool_capability.id
          AND claim_link.claim_id = seed.claim_id
      )
    );
  IF FOUND THEN
    RAISE EXCEPTION 'Published Tool Capability conflicts with the planned supported capability or mapped evidence and requires a manual editorial change.';
  END IF;

  PERFORM 1
  FROM public.tool_task_fits fit
  JOIN public.decision_tasks task ON task.id = fit.task_id
  JOIN decision_graph_seed_relations seed
    ON seed.tool_id = fit.tool_id AND seed.task_slug = task.slug
  WHERE fit.status = 'published'
  FOR UPDATE OF fit;
  PERFORM 1
  FROM public.tool_task_fits fit
  JOIN public.decision_tasks task ON task.id = fit.task_id
  JOIN decision_graph_seed_relations seed
    ON seed.tool_id = fit.tool_id AND seed.task_slug = task.slug
  WHERE fit.status = 'published'
    AND (
      fit.fit_level <> seed.fit_level
      OR NOT EXISTS (
        SELECT 1
        FROM public.tool_task_fit_claims claim_link
        WHERE claim_link.fit_id = fit.id
          AND claim_link.claim_id = seed.claim_id
      )
    );
  IF FOUND THEN
    RAISE EXCEPTION 'Published Tool Task Fit conflicts with the planned fit level or mapped evidence and requires a manual editorial change.';
  END IF;
END
$$;

INSERT INTO public.task_capabilities (
  task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at, reviewed_by
)
SELECT
  task.id, capability.id, seed.importance, seed.rationale, 'reviewed', NOW(), NOW() + INTERVAL '90 days', ${sqlLiteral(reviewerId)}::uuid
FROM decision_graph_seed_task_capabilities seed
JOIN public.decision_tasks task ON task.slug = seed.task_slug
JOIN public.decision_capabilities capability ON capability.slug = seed.capability_slug
ON CONFLICT (task_id, capability_id) DO UPDATE SET
  importance = EXCLUDED.importance,
  rationale = EXCLUDED.rationale,
  status = 'reviewed',
  reviewed_at = EXCLUDED.reviewed_at,
  review_due_at = EXCLUDED.review_due_at,
  reviewed_by = EXCLUDED.reviewed_by
WHERE public.task_capabilities.status <> 'published';

INSERT INTO public.tool_capabilities (
  tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, reviewed_at, review_due_at, reviewed_by
)
SELECT
  seed.tool_id, capability.id, 'partial', 'unknown', '{}'::jsonb, '[]'::jsonb, 'reviewed', NOW(), NOW() + INTERVAL '90 days', ${sqlLiteral(reviewerId)}::uuid
FROM decision_graph_seed_relations seed
JOIN public.decision_capabilities capability ON capability.slug = seed.capability_slug
ON CONFLICT (tool_id, capability_id) DO UPDATE SET
  support_level = EXCLUDED.support_level,
  availability = EXCLUDED.availability,
  plan_requirement = EXCLUDED.plan_requirement,
  limitations = EXCLUDED.limitations,
  status = 'reviewed',
  reviewed_at = EXCLUDED.reviewed_at,
  review_due_at = EXCLUDED.review_due_at,
  reviewed_by = EXCLUDED.reviewed_by
WHERE public.tool_capabilities.status <> 'published';

INSERT INTO public.tool_capability_claims (tool_capability_id, claim_id, purpose)
SELECT tool_capability.id, seed.claim_id, 'support'
FROM decision_graph_seed_relations seed
JOIN public.decision_capabilities capability ON capability.slug = seed.capability_slug
JOIN public.tool_capabilities tool_capability
  ON tool_capability.tool_id = seed.tool_id AND tool_capability.capability_id = capability.id
  AND tool_capability.status <> 'published'
ON CONFLICT DO NOTHING;

INSERT INTO public.tool_task_fits (
  tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, status, reviewed_at, review_due_at, reviewed_by
)
SELECT
  seed.tool_id,
  task.id,
  seed.fit_level,
  '{"en":"Editorially mapped from the linked verified claim; review limitations before publication.","cn":"由关联的已核验 claim 经编辑映射；发布前须审核限制。"}'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'reviewed',
  NOW(),
  NOW() + INTERVAL '90 days',
  ${sqlLiteral(reviewerId)}::uuid
FROM decision_graph_seed_relations seed
JOIN public.decision_tasks task ON task.slug = seed.task_slug
ON CONFLICT (tool_id, task_id) DO UPDATE SET
  fit_level = EXCLUDED.fit_level,
  rationale = EXCLUDED.rationale,
  status = 'reviewed',
  reviewed_at = EXCLUDED.reviewed_at,
  review_due_at = EXCLUDED.review_due_at,
  reviewed_by = EXCLUDED.reviewed_by
WHERE public.tool_task_fits.status <> 'published';

DO $$
BEGIN
  IF (SELECT count(*) FROM public.task_capabilities task_capability
      JOIN public.decision_tasks task ON task.id = task_capability.task_id
      JOIN public.decision_capabilities capability ON capability.id = task_capability.capability_id
      JOIN decision_graph_seed_task_capabilities seed
        ON seed.task_slug = task.slug AND seed.capability_slug = capability.slug
      WHERE task_capability.status IN ('reviewed', 'published')) <> (SELECT count(*) FROM decision_graph_seed_task_capabilities) THEN
    RAISE EXCEPTION 'Seed Task Capability resolution was not completely reviewed or compatibly preserved as published.';
  END IF;

  IF (SELECT count(*) FROM public.tool_capabilities tool_capability
      JOIN public.decision_capabilities capability ON capability.id = tool_capability.capability_id
      JOIN decision_graph_seed_relations seed
        ON seed.tool_id = tool_capability.tool_id AND seed.capability_slug = capability.slug
      WHERE tool_capability.status IN ('reviewed', 'published')) <> (SELECT count(*) FROM decision_graph_seed_relations) THEN
    RAISE EXCEPTION 'Seed Tool Capability resolution was not completely reviewed or compatibly preserved as published.';
  END IF;

  IF (SELECT count(*) FROM public.tool_task_fits fit
      JOIN public.decision_tasks task ON task.id = fit.task_id
      JOIN decision_graph_seed_relations seed
        ON seed.tool_id = fit.tool_id AND seed.task_slug = task.slug
      WHERE fit.status IN ('reviewed', 'published')) <> (SELECT count(*) FROM decision_graph_seed_relations) THEN
    RAISE EXCEPTION 'Seed Tool Task Fit resolution was not completely reviewed or compatibly preserved as published.';
  END IF;
END
$$;

INSERT INTO public.tool_task_fit_claims (fit_id, claim_id, purpose)
SELECT fit.id, seed.claim_id, 'fit'
FROM decision_graph_seed_relations seed
JOIN public.decision_tasks task ON task.slug = seed.task_slug
JOIN public.tool_task_fits fit ON fit.tool_id = seed.tool_id AND fit.task_id = task.id AND fit.status <> 'published'
ON CONFLICT DO NOTHING;

COMMIT;
`;
}

async function executeCommit(plan: ReturnType<typeof buildSeedPlan>, reviewerId: string) {
  const connectionString = process.env.SUPABASE_DB_URL?.trim();
  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL is required for an explicit transactional --commit; dry-run never writes.');
  }
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    const taskIds = new Map<string, string>();
    for (let index = 0; index < plan.tasks.length; index += 1) {
      const task = plan.tasks[index];
      await client.query(
        `INSERT INTO decision_tasks (slug, name, description, status, display_order, constraint_schema)
         VALUES ($1, $2::jsonb, $3::jsonb, 'active', $4, $5::jsonb)
         ON CONFLICT (slug) DO NOTHING`,
        [
          task.slug,
          JSON.stringify(task.name),
          JSON.stringify(task.description),
          index,
          JSON.stringify(task.constraintSchema),
        ],
      );
      const result = await client.query<{ id: string }>('SELECT id FROM decision_tasks WHERE slug = $1', [task.slug]);
      assert.equal(result.rowCount, 1, `Task ${task.slug} must be unique after seed.`);
      taskIds.set(task.slug, result.rows[0].id);
    }

    const capabilityIds = new Map<string, string>();
    for (let index = 0; index < plan.capabilities.length; index += 1) {
      const capability = plan.capabilities[index];
      await client.query(
        `INSERT INTO decision_capabilities (slug, name, description, capability_group, status, display_order)
         VALUES ($1, $2::jsonb, $3::jsonb, $4, 'active', $5)
         ON CONFLICT (slug) DO NOTHING`,
        [
          capability.slug,
          JSON.stringify(capability.name),
          JSON.stringify(capability.description),
          capability.group,
          index,
        ],
      );
      const result = await client.query<{ id: string }>('SELECT id FROM decision_capabilities WHERE slug = $1', [
        capability.slug,
      ]);
      assert.equal(result.rowCount, 1, `Capability ${capability.slug} must be unique after seed.`);
      capabilityIds.set(capability.slug, result.rows[0].id);
    }

    const reviewedAt = new Date();
    const reviewDueAt = new Date(reviewedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    for (const relation of plan.taskCapabilities) {
      const existingTaskCapability = await client.query<{ task_id: string; status: string; importance: string }>(
        'SELECT task_id, status, importance FROM task_capabilities WHERE task_id = $1 AND capability_id = $2 FOR UPDATE',
        [taskIds.get(relation.task), capabilityIds.get(relation.capability)],
      );
      if (existingTaskCapability.rows[0]?.status === 'published') {
        if (existingTaskCapability.rows[0].importance !== relation.importance) {
          throw new Error(
            `Published Task Capability ${existingTaskCapability.rows[0].task_id}:${relation.capability} conflicts with the planned importance and requires a manual editorial change.`,
          );
        }
        continue;
      }
      await client.query(
        `INSERT INTO task_capabilities (task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at, reviewed_by)
         VALUES ($1, $2, $3, $4::jsonb, 'reviewed', $5, $6, $7)
         ON CONFLICT (task_id, capability_id) DO UPDATE SET
           importance = EXCLUDED.importance, rationale = EXCLUDED.rationale, status = 'reviewed',
           reviewed_at = EXCLUDED.reviewed_at, review_due_at = EXCLUDED.review_due_at, reviewed_by = EXCLUDED.reviewed_by`,
        [
          taskIds.get(relation.task),
          capabilityIds.get(relation.capability),
          relation.importance,
          JSON.stringify(relation.rationale),
          reviewedAt,
          reviewDueAt,
          reviewerId,
        ],
      );
    }

    for (const relation of plan.eligibleRelations) {
      const existingToolCapability = await client.query<{ id: string; status: string; support_level: string }>(
        'SELECT id, status, support_level FROM tool_capabilities WHERE tool_id = $1 AND capability_id = $2 FOR UPDATE',
        [relation.toolId, capabilityIds.get(relation.capability)],
      );
      if (existingToolCapability.rows[0]?.status === 'published') {
        const existingClaimLink = await client.query(
          'SELECT 1 FROM tool_capability_claims WHERE tool_capability_id = $1 AND claim_id = $2',
          [existingToolCapability.rows[0].id, relation.claimId],
        );
        if (!['strong', 'partial'].includes(existingToolCapability.rows[0].support_level) || existingClaimLink.rowCount !== 1) {
          throw new Error(
            `Published Tool Capability ${existingToolCapability.rows[0].id} conflicts with the planned supported capability or mapped evidence and requires a manual editorial change.`,
          );
        }
      } else {
        const toolCapabilityResult = await client.query<{ id: string }>(
          `INSERT INTO tool_capabilities (tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, reviewed_at, review_due_at, reviewed_by)
           VALUES ($1, $2, 'partial', 'unknown', '{}'::jsonb, '[]'::jsonb, 'reviewed', $3, $4, $5)
           ON CONFLICT (tool_id, capability_id) DO UPDATE SET
             support_level = EXCLUDED.support_level, availability = EXCLUDED.availability, plan_requirement = EXCLUDED.plan_requirement,
             limitations = EXCLUDED.limitations, status = 'reviewed', reviewed_at = EXCLUDED.reviewed_at,
             review_due_at = EXCLUDED.review_due_at, reviewed_by = EXCLUDED.reviewed_by
           RETURNING id`,
          [relation.toolId, capabilityIds.get(relation.capability), reviewedAt, reviewDueAt, reviewerId],
        );
        const toolCapabilityId = toolCapabilityResult.rows[0].id;
        await client.query(
          `INSERT INTO tool_capability_claims (tool_capability_id, claim_id, purpose)
           VALUES ($1, $2, 'support') ON CONFLICT DO NOTHING`,
          [toolCapabilityId, relation.claimId],
        );
      }

      const existingFit = await client.query<{ id: string; status: string; fit_level: string }>(
        'SELECT id, status, fit_level FROM tool_task_fits WHERE tool_id = $1 AND task_id = $2 FOR UPDATE',
        [relation.toolId, taskIds.get(relation.task)],
      );
      if (existingFit.rows[0]?.status === 'published') {
        const existingClaimLink = await client.query(
          'SELECT 1 FROM tool_task_fit_claims WHERE fit_id = $1 AND claim_id = $2',
          [existingFit.rows[0].id, relation.claimId],
        );
        if (existingFit.rows[0].fit_level !== relation.fit || existingClaimLink.rowCount !== 1) {
          throw new Error(
            `Published Tool Task Fit ${existingFit.rows[0].id} conflicts with the planned fit level or mapped evidence and requires a manual editorial change.`,
          );
        }
      } else {
        const fitResult = await client.query<{ id: string }>(
          `INSERT INTO tool_task_fits (tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, status, reviewed_at, review_due_at, reviewed_by)
           VALUES ($1, $2, $3, $4::jsonb, '[]'::jsonb, '[]'::jsonb, 'reviewed', $5, $6, $7)
           ON CONFLICT (tool_id, task_id) DO UPDATE SET
             fit_level = EXCLUDED.fit_level, rationale = EXCLUDED.rationale, status = 'reviewed', reviewed_at = EXCLUDED.reviewed_at,
             review_due_at = EXCLUDED.review_due_at, reviewed_by = EXCLUDED.reviewed_by
           RETURNING id`,
          [
            relation.toolId,
            taskIds.get(relation.task),
            relation.fit,
            JSON.stringify({
              en: 'Editorially mapped from the linked verified claim; review limitations before publication.',
              cn: '由关联的已核验 claim 经编辑映射；发布前须审核限制。',
            }),
            reviewedAt,
            reviewDueAt,
            reviewerId,
          ],
        );
        await client.query(
          `INSERT INTO tool_task_fit_claims (fit_id, claim_id, purpose)
           VALUES ($1, $2, 'fit') ON CONFLICT DO NOTHING`,
          [fitResult.rows[0].id, relation.claimId],
        );
      }
    }
    await client.query('COMMIT');
    return { committed: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(
    args.every(
      (arg) =>
        arg === '--inventory' ||
        arg === '--commit' ||
        arg.startsWith('--reviewer-id=') ||
        arg.startsWith('--emit-sql='),
    ),
    'Use --inventory (default), explicit --commit --reviewer-id=<auth-user-uuid>, or --emit-sql=<path> --reviewer-id=<auth-user-uuid>.',
  );
  const inventoryResult = await inventory();
  const plan = buildSeedPlan(inventoryResult);
  const commit = args.includes('--commit');
  const reviewerId = args.find((arg) => arg.startsWith('--reviewer-id='))?.slice('--reviewer-id='.length) || '';
  const emitSqlPath = args.find((arg) => arg.startsWith('--emit-sql='))?.slice('--emit-sql='.length) || '';
  assert(!(commit && emitSqlPath), '--commit and --emit-sql cannot be used together.');
  if (emitSqlPath) {
    assert(/^[0-9a-f-]{36}$/i.test(reviewerId), '--emit-sql requires a real --reviewer-id auth UUID.');
    const resolvedPath = path.resolve(process.cwd(), emitSqlPath);
    const workspaceRoot = `${process.cwd()}${path.sep}`;
    assert(resolvedPath.startsWith(workspaceRoot), '--emit-sql path must stay inside the workspace.');
    assert(resolvedPath.endsWith('.sql'), '--emit-sql path must end in .sql.');
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, emitSeedSql(plan, reviewerId), 'utf8');
    console.log(
      JSON.stringify(
        { success: true, mode: 'emit-sql-read-only', path: resolvedPath, inventory: inventoryResult, plan },
        null,
        2,
      ),
    );
    return;
  }
  if (commit) {
    assert(/^[0-9a-f-]{36}$/i.test(reviewerId), '--commit requires a real --reviewer-id auth UUID.');
    const result = await executeCommit(plan, reviewerId);
    console.log(JSON.stringify({ success: true, mode: 'commit', inventory: inventoryResult, plan, result }, null, 2));
    return;
  }
  console.log(JSON.stringify({ success: true, mode: 'dry-run-no-write', inventory: inventoryResult, plan }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

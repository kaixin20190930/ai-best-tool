-- DIFF-03 decision graph first batch. Generated from a read-only inventory; do not edit around guards.
-- One top-level DO statement is atomic even when SQL Editor uses a new connection for each statement.
-- This statement intentionally creates reviewed relations only. It does not write directory records or public-discovery configuration.
DO $decision_graph_seed$
DECLARE
  required_relation TEXT;
BEGIN
  DROP TABLE IF EXISTS pg_temp.decision_graph_seed_task_capabilities;
  DROP TABLE IF EXISTS pg_temp.decision_graph_seed_relations;

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

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '2b8177ac-70b3-4475-a1ee-509ff8b4b622'::uuid) THEN
    RAISE EXCEPTION 'Seed reviewer does not exist in auth.users.';
  END IF;

CREATE TEMP TABLE decision_graph_seed_task_capabilities (
  task_slug TEXT NOT NULL,
  capability_slug TEXT NOT NULL,
  importance TEXT NOT NULL,
  rationale JSONB NOT NULL,
  PRIMARY KEY (task_slug, capability_slug)
) ON COMMIT PRESERVE ROWS;

INSERT INTO decision_graph_seed_task_capabilities (task_slug, capability_slug, importance, rationale)
VALUES
  ('product-image-to-short-video', 'image-to-video-generation', 'required', '{"en":"A source image must be turned into video.","cn":"需要将源图片转为视频。"}'::jsonb),
  ('product-image-to-short-video', 'video-editing-and-export', 'preferred', '{"en":"A usable short video needs a delivery path.","cn":"可用短视频需要交付路径。"}'::jsonb),
  ('meeting-notes', 'meeting-transcription', 'required', '{"en":"The meeting needs a reviewable transcript.","cn":"会议需要可复核的转录文本。"}'::jsonb),
  ('meeting-notes', 'meeting-summary-and-actions', 'required', '{"en":"The output must identify the summary and follow-up work.","cn":"输出必须识别摘要和后续工作。"}'::jsonb),
  ('brand-constrained-marketing-content', 'brand-guided-content-generation', 'required', '{"en":"The task starts with brand-guided drafting.","cn":"任务从品牌引导的内容起草开始。"}'::jsonb),
  ('brand-constrained-marketing-content', 'brand-controls-and-style-guidance', 'preferred', '{"en":"Brand constraints still need editorial review.","cn":"品牌约束仍需编辑审核。"}'::jsonb),
  ('build-app-with-ai', 'ai-assisted-app-development', 'required', '{"en":"The requested output is an application.","cn":"请求的输出是应用。"}'::jsonb),
  ('build-app-with-ai', 'developer-workflow-integration', 'preferred', '{"en":"Implementation must fit a delivery workflow.","cn":"实现必须适配交付工作流。"}'::jsonb),
  ('research-with-citations', 'research-discovery', 'required', '{"en":"Relevant papers and sources must be found.","cn":"必须找到相关论文和资料。"}'::jsonb),
  ('research-with-citations', 'citation-traceability', 'required', '{"en":"Citations require a reviewable source trail.","cn":"引用需要可审核的来源链。"}'::jsonb),
  ('ai-voiceover', 'text-to-speech-voice-generation', 'required', '{"en":"The output is generated narration.","cn":"输出是生成的配音。"}'::jsonb),
  ('ai-voiceover', 'voice-consent-and-export', 'preferred', '{"en":"Consent and delivery constraints require review.","cn":"同意和交付限制需要审核。"}'::jsonb);

CREATE TEMP TABLE decision_graph_seed_relations (
  tool_id UUID NOT NULL,
  task_slug TEXT NOT NULL,
  capability_slug TEXT NOT NULL,
  claim_id UUID NOT NULL,
  fit_level TEXT NOT NULL,
  PRIMARY KEY (tool_id, task_slug, capability_slug, claim_id)
) ON COMMIT PRESERVE ROWS;

INSERT INTO decision_graph_seed_relations (tool_id, task_slug, capability_slug, claim_id, fit_level)
VALUES
  ('7ae4bbb2-847f-45cc-9294-e96663fa02a3'::uuid, 'meeting-notes', 'meeting-summary-and-actions', 'fddb0da1-3fb5-4bad-9ad5-df543171985f'::uuid, 'strong'),
  ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49'::uuid, 'meeting-notes', 'meeting-transcription', 'e54d8004-86ef-476d-addc-cb5215e94a5f'::uuid, 'strong'),
  ('57b270b9-78cf-41f8-8b74-dec46400cd65'::uuid, 'meeting-notes', 'meeting-transcription', '32e5934f-bc33-415c-9d98-e88529155855'::uuid, 'conditional'),
  ('711df152-fdcf-4a19-930c-ab866b67605f'::uuid, 'product-image-to-short-video', 'image-to-video-generation', '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939'::uuid, 'conditional'),
  ('f15873ae-c6ef-4f0a-b811-b40c2aba76ab'::uuid, 'research-with-citations', 'research-discovery', '363978e2-46d0-40fb-a344-42b61e19325c'::uuid, 'strong'),
  ('23bb3601-a5ac-42c3-bff3-64b06a063959'::uuid, 'build-app-with-ai', 'developer-workflow-integration', '806bedca-c1e4-4fd1-ae57-e4db06567e47'::uuid, 'strong'),
  ('f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e'::uuid, 'build-app-with-ai', 'developer-workflow-integration', '76cf5413-ce8c-424d-9a6b-21584758cf72'::uuid, 'conditional');

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
END;

INSERT INTO public.decision_tasks (slug, name, description, status, display_order, constraint_schema)
VALUES
  ('product-image-to-short-video', '{"en":"Turn product images into short videos","cn":"将产品图片制作成短视频"}'::jsonb, '{"en":"Create and refine short product-video concepts from supplied images.","cn":"从已有产品图片生成并完善短视频概念。"}'::jsonb, 'active', 0, '{"needsInputImage":true,"output":"short_video","requiresReview":true}'::jsonb),
  ('meeting-notes', '{"en":"Transcribe and summarize meetings","cn":"转录并总结会议"}'::jsonb, '{"en":"Capture a meeting, produce a reviewable summary, and identify follow-up work.","cn":"记录会议、生成可复核摘要并识别后续工作。"}'::jsonb, 'active', 1, '{"needsAudioCapture":true,"output":"meeting_summary","requiresReview":true}'::jsonb),
  ('brand-constrained-marketing-content', '{"en":"Create marketing content within brand constraints","cn":"在品牌约束下生成营销内容"}'::jsonb, '{"en":"Draft marketing content while retaining an editorial review against brand requirements.","cn":"在保留品牌要求人工审核的前提下起草营销内容。"}'::jsonb, 'active', 2, '{"needsBrandGuidance":true,"output":"marketing_draft","requiresReview":true}'::jsonb),
  ('build-app-with-ai', '{"en":"Build an application with AI","cn":"使用 AI 构建应用"}'::jsonb, '{"en":"Use AI-assisted development while keeping implementation, integration, and deployment decisions reviewable.","cn":"使用 AI 辅助开发，同时保留可审核的实现、集成和部署决策。"}'::jsonb, 'active', 3, '{"output":"application","requiresCodeReview":true,"requiresIntegrationReview":true}'::jsonb),
  ('research-with-citations', '{"en":"Research papers and sources with citations","cn":"基于引用研究论文和资料"}'::jsonb, '{"en":"Find and synthesize research while preserving source and citation review.","cn":"在保留来源与引用审核的前提下查找并综合研究资料。"}'::jsonb, 'active', 4, '{"needsCitations":true,"output":"research_synthesis","requiresSourceReview":true}'::jsonb),
  ('ai-voiceover', '{"en":"Create an AI voiceover","cn":"创建 AI 配音"}'::jsonb, '{"en":"Generate voice narration with consent, output, and delivery constraints reviewed.","cn":"在审核同意、输出和交付限制的前提下生成配音。"}'::jsonb, 'active', 5, '{"output":"voiceover","requiresConsentReview":true,"requiresExportReview":true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.decision_capabilities (slug, name, description, capability_group, status, display_order)
VALUES
  ('image-to-video-generation', '{"en":"Image-to-video generation","cn":"图片转视频生成"}'::jsonb, '{"en":"Generate video from supplied images.","cn":"从已有图片生成视频。"}'::jsonb, 'creation', 'active', 0),
  ('video-editing-and-export', '{"en":"Video editing and export","cn":"视频编辑与导出"}'::jsonb, '{"en":"Refine generated video and deliver an output file.","cn":"完善生成的视频并交付输出文件。"}'::jsonb, 'delivery', 'active', 1),
  ('meeting-transcription', '{"en":"Meeting transcription","cn":"会议转录"}'::jsonb, '{"en":"Convert meeting speech into reviewable text.","cn":"将会议语音转换为可复核文本。"}'::jsonb, 'analysis', 'active', 2),
  ('meeting-summary-and-actions', '{"en":"Meeting summaries and actions","cn":"会议摘要与行动项"}'::jsonb, '{"en":"Produce summaries and follow-up actions from a meeting.","cn":"从会议中生成摘要和后续行动项。"}'::jsonb, 'collaboration', 'active', 3),
  ('brand-guided-content-generation', '{"en":"Brand-guided content generation","cn":"品牌引导内容生成"}'::jsonb, '{"en":"Draft content using supplied brand guidance.","cn":"使用提供的品牌指引起草内容。"}'::jsonb, 'creation', 'active', 4),
  ('brand-controls-and-style-guidance', '{"en":"Brand controls and style guidance","cn":"品牌控制与风格指引"}'::jsonb, '{"en":"Apply and review style, policy, and approval constraints.","cn":"应用并审核风格、政策和审批约束。"}'::jsonb, 'governance', 'active', 5),
  ('ai-assisted-app-development', '{"en":"AI-assisted app development","cn":"AI 辅助应用开发"}'::jsonb, '{"en":"Generate or modify application code with review.","cn":"在审核下生成或修改应用代码。"}'::jsonb, 'automation', 'active', 6),
  ('developer-workflow-integration', '{"en":"Developer workflow integration","cn":"开发工作流集成"}'::jsonb, '{"en":"Connect development work to tools, services, or automation.","cn":"将开发工作连接到工具、服务或自动化。"}'::jsonb, 'automation', 'active', 7),
  ('research-discovery', '{"en":"Research discovery","cn":"研究资料发现"}'::jsonb, '{"en":"Find papers and relevant source material.","cn":"查找论文和相关资料。"}'::jsonb, 'analysis', 'active', 8),
  ('citation-traceability', '{"en":"Citation traceability","cn":"引用可追溯性"}'::jsonb, '{"en":"Keep sources and citations reviewable.","cn":"保持来源和引用可审核。"}'::jsonb, 'governance', 'active', 9),
  ('text-to-speech-voice-generation', '{"en":"Text-to-speech voice generation","cn":"文本转语音生成"}'::jsonb, '{"en":"Generate narration from supplied text.","cn":"从提供的文本生成配音。"}'::jsonb, 'creation', 'active', 10),
  ('voice-consent-and-export', '{"en":"Voice consent and export","cn":"声音同意与导出"}'::jsonb, '{"en":"Review voice rights, consent, and output delivery.","cn":"审核声音权利、同意和输出交付。"}'::jsonb, 'governance', 'active', 11)
ON CONFLICT (slug) DO NOTHING;

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
END;

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
END;

INSERT INTO public.task_capabilities (
  task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at, reviewed_by
)
SELECT
  task.id, capability.id, seed.importance, seed.rationale, 'reviewed', NOW(), NOW() + INTERVAL '90 days', '2b8177ac-70b3-4475-a1ee-509ff8b4b622'::uuid
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
  seed.tool_id, capability.id, 'partial', 'unknown', '{}'::jsonb, '[]'::jsonb, 'reviewed', NOW(), NOW() + INTERVAL '90 days', '2b8177ac-70b3-4475-a1ee-509ff8b4b622'::uuid
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
  '2b8177ac-70b3-4475-a1ee-509ff8b4b622'::uuid
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
END;

INSERT INTO public.tool_task_fit_claims (fit_id, claim_id, purpose)
SELECT fit.id, seed.claim_id, 'fit'
FROM decision_graph_seed_relations seed
JOIN public.decision_tasks task ON task.slug = seed.task_slug
JOIN public.tool_task_fits fit ON fit.tool_id = seed.tool_id AND fit.task_id = task.id AND fit.status <> 'published'
ON CONFLICT DO NOTHING;

DROP TABLE pg_temp.decision_graph_seed_relations;
DROP TABLE pg_temp.decision_graph_seed_task_capabilities;
END
$decision_graph_seed$;

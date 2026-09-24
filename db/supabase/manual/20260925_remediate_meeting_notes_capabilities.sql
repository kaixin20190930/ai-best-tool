-- Manual DIFF-07 meeting-notes remediation. Execute only after the named reviewer
-- personally rechecks the six official pages at execution time. Do not run from
-- an unattended migration or reuse this batch after a source expires.
-- One top-level DO statement: SQL Editor statement boundaries cannot partially
-- commit this batch. Any guard or postcondition failure rolls back everything.
-- Task Page approval remains separately gated; this script does not touch it.
DO $meeting_notes_remediation$
DECLARE
  v_batch CONSTANT text := 'meeting-notes-20260925';
  v_reviewer CONSTANT uuid := '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
  v_task CONSTANT uuid := 'e9c64181-9cad-40c5-979e-3af4bd9cc630';
  v_transcription CONSTANT uuid := '6150a718-2693-4bfb-a13d-b76ac44e6357';
  v_summary CONSTANT uuid := 'c14d491e-d40e-407e-a3c6-c1d59719acfa';
  v_now CONSTANT timestamptz := transaction_timestamp();
  v_due CONSTANT timestamptz := transaction_timestamp() + interval '30 days';
  v_spec record;
  v_source uuid;
  v_claim uuid;
  v_count integer;
  v_relation text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('meeting-notes-20260925-remediation'));
  IF v_now < timestamptz '2026-09-25 00:00:00+00' THEN
    RAISE EXCEPTION 'Meeting-notes review batch cannot be dated before 2026-09-25.';
  END IF;

  FOREACH v_relation IN ARRAY ARRAY[
    'auth.users', 'public.decision_tasks', 'public.decision_capabilities',
    'public.task_capabilities', 'public.tool_capabilities',
    'public.tool_capability_claims', 'public.tool_task_fits',
    'public.tool_task_fit_claims', 'public.product_intelligence_profiles',
    'public.product_intelligence_sources', 'public.product_intelligence_claims'
  ] LOOP
    IF to_regclass(v_relation) IS NULL THEN
      RAISE EXCEPTION 'Meeting-notes prerequisite relation missing: %', v_relation;
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_reviewer) THEN
    RAISE EXCEPTION 'The current meeting-notes reviewer does not exist.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.decision_tasks WHERE id = v_task AND slug = 'meeting-notes' AND status = 'active')
    OR NOT EXISTS (SELECT 1 FROM public.decision_capabilities WHERE id = v_transcription AND slug = 'meeting-transcription' AND status = 'active')
    OR NOT EXISTS (SELECT 1 FROM public.decision_capabilities WHERE id = v_summary AND slug = 'meeting-summary-and-actions' AND status = 'active') THEN
    RAISE EXCEPTION 'Meeting-notes task/capability identity or active status changed.';
  END IF;

  CREATE TEMP TABLE meeting_remediation_targets (
    tool_id uuid PRIMARY KEY,
    profile_id uuid NOT NULL,
    canonical_domain text NOT NULL,
    product_name text NOT NULL,
    capability_id uuid NOT NULL,
    tool_capability_id uuid NOT NULL,
    fit_id uuid NOT NULL,
    legacy_claim_id uuid NOT NULL,
    fit_level text NOT NULL,
    support_level text NOT NULL,
    availability text NOT NULL,
    plan_requirement jsonb NOT NULL,
    limitations jsonb NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO meeting_remediation_targets VALUES
    (
      '7ae4bbb2-847f-45cc-9294-e96663fa02a3',
      '21efd79f-58c8-439f-af40-69841ef18881', 'fathom.video', 'Fathom AI Notetaker',
      v_summary, '10f1048d-4b0c-40cb-adc7-7fa0f718afb2',
      'e6f8457e-cc46-40c0-9d2b-aa455d87c658',
      'fddb0da1-3fb5-4bad-9ad5-df543171985f', 'strong', 'partial', 'all_plans',
      '{"en":"Free includes meeting summaries; advanced summaries are limited to the first five calls each month, then General/Enhanced templates. Premium is required for unlimited advanced summaries, AI action items, follow-up emails, custom summaries, and Ask Fathom.","cn":"免费版提供会议摘要；每月前 5 次通话可用高级摘要，之后仅有 General/Enhanced 模板。无限高级摘要、AI 行动项、后续邮件、自定义摘要和 Ask Fathom 需要 Premium。"}',
      '[{"en":"Free advanced summaries stop after five calls per month; Premium-only action items and follow-up features must not be treated as Free capabilities.","cn":"免费版每月 5 次高级摘要后受限；Premium 专属的行动项及后续功能不能视为免费能力。"}]'
    ),
    (
      'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
      '42446fa0-13e4-48ee-a4fa-7c33679d89aa', 'otter.ai', 'Otter.ai',
      v_transcription, 'ecdccdc0-f256-437e-ad41-f5209071212b',
      '00d00375-2bb6-4ac3-8e6f-593327e244fb',
      'e54d8004-86ef-476d-addc-cb5215e94a5f', 'strong', 'partial', 'all_plans',
      '{"en":"Basic is free with 300 transcription minutes per month, up to 30 minutes accessible per conversation or import, three lifetime file imports per account, and the 25 most recent conversations visible.","cn":"Basic 免费版每月 300 分钟转录；每场会议或导入最多可访问 30 分钟转录；每个账号累计 3 次文件导入；仅显示最近 25 场对话。"}',
      '[{"en":"After 300 monthly minutes, recording/import transcription pauses until the next cycle. Longer Basic conversations expose only the first 30 transcript minutes; older conversations are archived.","cn":"每月 300 分钟用尽后，录制/导入转录需等下个周期；Basic 的较长会议仅可访问前 30 分钟转录，较早对话会归档。"}]'
    ),
    (
      '57b270b9-78cf-41f8-8b74-dec46400cd65',
      'f2205c00-f20c-4c91-a757-bf91f6df4df3', 'fireflies.ai', 'Fireflies',
      v_transcription, '6ef8f10b-7b03-4ae4-988d-997cc8f4f2ca',
      '0ea08626-0d94-4773-a27e-3b5ce8fbd09b',
      '32e5934f-bc33-415c-9d98-e88529155855', 'conditional', 'partial', 'all_plans',
      '{"en":"Free allows unlimited transcription for eligible auto-joined meetings; without auto-join, transcription credits depend on sign-up source: website 3, Chrome extension 5, new mobile user 10, existing mobile user 5. Free includes 400 storage minutes per seat and 20 monthly AI credits for advanced features. Paid plans expand summaries, storage, and downloads.","cn":"免费版对符合条件的自动加入会议提供无限转录；未使用自动加入时，转录积分按注册来源分配：网站 3、Chrome 扩展 5、移动端新用户 10、移动端老用户 5。免费版每席位有 400 分钟存储，并有每月 20 个供高级功能使用的 AI 积分；付费套餐扩展摘要、存储与下载。"}',
      '[{"en":"Unlimited Free transcription depends on auto-join. Uploaded files and meeting summaries consume transcription credits; the 20 monthly AI credits apply to advanced features. Free transcript downloads require a paid plan; summaries and action items remain subject to plan limits.","cn":"免费版无限转录以自动加入为条件。上传文件和会议摘要消耗转录积分；每月 20 个 AI 积分用于高级功能。下载转录需付费套餐；摘要和行动项仍受套餐限制。"}]'
    );

  IF (SELECT count(*) FROM meeting_remediation_targets) <> 3 OR
     (SELECT count(*) FROM public.product_intelligence_profiles profile
      JOIN meeting_remediation_targets target ON target.profile_id = profile.id
      WHERE profile.owner_type = 'tool' AND profile.owner_id = target.tool_id
        AND profile.canonical_domain = target.canonical_domain
        AND profile.product_name = target.product_name AND profile.profile_status = 'ready') <> 3 THEN
    RAISE EXCEPTION 'Exactly three expected, ready tool profiles are required.';
  END IF;
  IF (SELECT count(*) FROM public.task_capabilities
      WHERE task_id = v_task AND capability_id IN (v_transcription, v_summary)
        AND importance = 'required' AND status IN ('reviewed', 'published')) <> 2 THEN
    RAISE EXCEPTION 'Expected two required reviewed/published meeting-notes Task Capabilities.';
  END IF;
  IF (SELECT count(*) FROM public.tool_capabilities capability
      JOIN meeting_remediation_targets target ON target.tool_capability_id = capability.id
      WHERE capability.tool_id = target.tool_id AND capability.capability_id = target.capability_id
        AND capability.status IN ('reviewed', 'published')) <> 3 THEN
    RAISE EXCEPTION 'Expected three exact meeting-notes Tool Capabilities.';
  END IF;
  IF (SELECT count(*) FROM public.tool_task_fits fit
      JOIN meeting_remediation_targets target ON target.fit_id = fit.id
      WHERE fit.tool_id = target.tool_id AND fit.task_id = v_task
        AND fit.fit_level = target.fit_level AND fit.status = 'published') <> 3 THEN
    RAISE EXCEPTION 'Expected three unchanged published meeting-notes fits.';
  END IF;
  IF (SELECT count(*) FROM meeting_remediation_targets target
      JOIN public.product_intelligence_claims claim ON claim.id = target.legacy_claim_id
      JOIN public.product_intelligence_profiles profile ON profile.id = claim.profile_id
      JOIN public.tool_capability_claims capability_link
        ON capability_link.tool_capability_id = target.tool_capability_id AND capability_link.claim_id = claim.id
      JOIN public.tool_task_fit_claims fit_link
        ON fit_link.fit_id = target.fit_id AND fit_link.claim_id = claim.id
      WHERE profile.id = target.profile_id AND profile.owner_id = target.tool_id
        AND claim.verification_status = 'verified' AND claim.conflict_status = 'none'
        AND claim.invalidated_at IS NULL
        AND (claim.expires_at IS NULL OR claim.expires_at > v_now)
        AND (claim.review_due_at IS NULL OR claim.review_due_at > v_now)) <> 3 THEN
    RAISE EXCEPTION 'Existing mapped claim identity/link/freshness changed; stop for re-review.';
  END IF;

  CREATE TEMP TABLE meeting_remediation_claims (
    tool_id uuid NOT NULL REFERENCES meeting_remediation_targets(tool_id),
    claim_key text NOT NULL,
    claim_type text NOT NULL,
    source_url text NOT NULL,
    canonical_url text,
    page_type text NOT NULL,
    source_label text NOT NULL,
    publisher_name text NOT NULL,
    claim_value jsonb NOT NULL,
    validity_scope jsonb NOT NULL,
    PRIMARY KEY (tool_id, claim_key)
  ) ON COMMIT DROP;

  INSERT INTO meeting_remediation_claims VALUES
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-free-premium', 'feature_limit',
     'https://help.fathom.video/en/articles/5290881', NULL, 'help', 'Free vs Premium for individuals', 'Fathom',
     '{"free":{"recording_storage":"unlimited","transcription_languages":38,"advanced_summaries_per_month":5,"after_limit":"General or Enhanced template only"},"premium":{"advanced_summaries":"unlimited","action_items":true,"follow_up_emails":true,"custom_summaries":true,"ask_fathom":true}}',
     '{"plans":["Free","Premium"],"scope":"individual meeting summaries and follow-up features"}'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-pricing', 'pricing_plan',
     'https://fathom.video/pricing', 'https://www.fathom.ai/pricing', 'pricing', 'Fathom pricing', 'Fathom',
     '{"free":{"instant_call_summaries":true},"premium":{"advanced_call_summaries":true,"ai_action_items":true}}',
     '{"plans":["Free","Premium"],"scope":"individual plan capability boundary"}'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'free_limit',
     'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan', NULL, 'help', 'Otter Basic conversation and import limits', 'Otter.ai',
     '{"basic":{"monthly_transcription_minutes":300,"accessible_minutes_per_conversation_or_import":30,"file_imports_per_account":3,"recent_conversations_visible":25}}',
     '{"plan":"Basic","scope":"free transcription and conversation history limits"}'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-summary', 'workflow_feature',
     'https://help.otter.ai/hc/en-us/articles/9156381229079-Meeting-Summary-Overview', NULL, 'help', 'Meeting Summary Overview', 'Otter.ai',
     '{"meeting_summary":{"topics":true,"highlights":true,"action_items_when_present":true,"email_requires_synced_calendar_and_sharing":true}}',
     '{"scope":"calendar-connected meeting summary workflow"}'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-free-guide', 'free_limit',
     'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan', NULL, 'help', 'Fireflies Free plan guide', 'Fireflies',
     '{"free":{"unlimited_transcription_requires_auto_join":true,"signup_transcription_credits":{"website":3,"chrome_extension":5,"mobile_new_user":10,"mobile_existing_user":5},"storage_minutes_per_seat":400,"ai_credits_per_month":20,"uploads_consume_transcription_credits":true,"transcript_download_requires_paid_plan":true}}',
     '{"plan":"Free","scope":"eligible auto-joined meetings and credit-limited summaries"}'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-pricing', 'pricing_plan',
     'https://fireflies.ai/pricing', NULL, 'pricing', 'Fireflies pricing', 'Fireflies',
     '{"free":{"transcription":"unlimited with auto-join conditions","ai_summaries":"limited"},"paid":{"ai_summaries":"unlimited","transcript_downloads":true}}',
     '{"plans":["Free","Pro","Business"],"scope":"transcription, summary, and download plan boundary"}');

  IF (SELECT count(*) FROM meeting_remediation_claims) <> 6 OR
     (SELECT count(DISTINCT source_url) FROM meeting_remediation_claims) <> 6 THEN
    RAISE EXCEPTION 'Exactly six distinct direct official sources/claims are required.';
  END IF;

  -- The batch marker makes a rerun a no-op for review timestamps. A stale
  -- previously-created claim raises instead of silently extending its window.
  FOR v_spec IN SELECT claim.*, target.profile_id
                FROM meeting_remediation_claims claim
                JOIN meeting_remediation_targets target USING (tool_id)
                ORDER BY claim.tool_id, claim.claim_key LOOP
    INSERT INTO public.product_intelligence_sources (
      profile_id, url, page_type, source_type, source_label, publisher_name,
      canonical_url, fetch_status, fetched_at, last_verified_at, metadata
    ) VALUES (
      v_spec.profile_id, v_spec.source_url, v_spec.page_type, 'official',
      v_spec.source_label, v_spec.publisher_name, v_spec.canonical_url,
      'success', v_now, v_now, jsonb_build_object('manualReviewBatch', v_batch)
    ) ON CONFLICT (profile_id, url) DO UPDATE SET
      page_type = EXCLUDED.page_type,
      source_type = 'official',
      source_label = EXCLUDED.source_label,
      publisher_name = EXCLUDED.publisher_name,
      canonical_url = EXCLUDED.canonical_url,
      fetch_status = 'success',
      fetched_at = v_now,
      last_verified_at = v_now,
      metadata = coalesce(public.product_intelligence_sources.metadata, '{}'::jsonb)
        || jsonb_build_object('manualReviewBatch', v_batch)
    WHERE public.product_intelligence_sources.metadata->>'manualReviewBatch' IS DISTINCT FROM v_batch;

    SELECT id INTO STRICT v_source
    FROM public.product_intelligence_sources
    WHERE profile_id = v_spec.profile_id AND url = v_spec.source_url;
    IF NOT EXISTS (
      SELECT 1 FROM public.product_intelligence_sources source
      WHERE source.id = v_source AND source.profile_id = v_spec.profile_id
        AND source.url = v_spec.source_url AND source.page_type = v_spec.page_type
        AND source.source_type = 'official' AND source.fetch_status = 'success'
        AND source.source_label = v_spec.source_label
        AND source.publisher_name = v_spec.publisher_name
        AND source.canonical_url IS NOT DISTINCT FROM v_spec.canonical_url
        AND source.last_verified_at >= timestamptz '2026-09-25 00:00:00+00'
        AND source.last_verified_at <= v_now
        AND source.metadata->>'manualReviewBatch' = v_batch
    ) THEN
      RAISE EXCEPTION 'Official source % differs from the reviewed batch.', v_spec.source_url;
    END IF;

    SELECT count(*) INTO v_count
    FROM public.product_intelligence_claims
    WHERE profile_id = v_spec.profile_id AND claim_key = v_spec.claim_key;
    IF v_count > 1 THEN
      RAISE EXCEPTION 'Duplicate manual claim key for %.', v_spec.claim_key;
    END IF;
    IF v_count = 0 THEN
      INSERT INTO public.product_intelligence_claims (
        profile_id, claim_type, claim_key, claim_value, source_id, source_url,
        source_type, observed_at, confidence, conflict_status, expires_at,
        metadata, verification_status, verified_at, verified_by, verification_note,
        review_due_at, invalidated_at, validity_scope
      ) VALUES (
        v_spec.profile_id, v_spec.claim_type, v_spec.claim_key, v_spec.claim_value,
        v_source, v_spec.source_url, 'official', v_now, 100, 'none', NULL,
        jsonb_build_object('manualReviewBatch', v_batch), 'verified', v_now,
        v_reviewer, 'Current manual review of the cited official page for meeting-notes remediation.',
        v_due, NULL, v_spec.validity_scope
      );
    ELSE
      SELECT id INTO STRICT v_claim
      FROM public.product_intelligence_claims
      WHERE profile_id = v_spec.profile_id AND claim_key = v_spec.claim_key;
      IF NOT EXISTS (
      SELECT 1 FROM public.product_intelligence_claims claim
      WHERE claim.id = v_claim AND claim.profile_id = v_spec.profile_id
        AND claim.claim_key = v_spec.claim_key AND claim.claim_type = v_spec.claim_type
        AND claim.claim_value = v_spec.claim_value AND claim.validity_scope = v_spec.validity_scope
        AND claim.source_id = v_source AND claim.source_url = v_spec.source_url
        AND claim.source_type = 'official' AND claim.verification_status = 'verified'
        AND claim.conflict_status = 'none' AND claim.invalidated_at IS NULL
        AND claim.expires_at IS NULL AND claim.verified_by = v_reviewer
        AND claim.verified_at >= timestamptz '2026-09-25 00:00:00+00'
        AND claim.verified_at <= v_now AND claim.review_due_at > v_now
        AND claim.metadata->>'manualReviewBatch' = v_batch
      ) THEN
        RAISE EXCEPTION 'Existing manual claim % differs or is stale; use a new reviewed batch.', v_spec.claim_key;
      END IF;
    END IF;
  END LOOP;

  CREATE TEMP TABLE meeting_remediation_purposes (
    tool_id uuid NOT NULL,
    claim_key text NOT NULL,
    relation_kind text NOT NULL CHECK (relation_kind IN ('capability', 'fit')),
    purpose text NOT NULL,
    PRIMARY KEY (tool_id, claim_key, relation_kind, purpose)
  ) ON COMMIT DROP;
  INSERT INTO meeting_remediation_purposes VALUES
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-free-premium', 'capability', 'support'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-free-premium', 'capability', 'limitation'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-pricing', 'capability', 'availability'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-pricing', 'capability', 'plan'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'capability', 'support'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'capability', 'availability'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'capability', 'plan'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'capability', 'limitation'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-free-guide', 'capability', 'support'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-free-guide', 'capability', 'limitation'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-pricing', 'capability', 'availability'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-pricing', 'capability', 'plan'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-free-premium', 'fit', 'fit'),
    ('7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'meeting-notes-20260925:fathom-pricing', 'fit', 'limitation'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-summary', 'fit', 'fit'),
    ('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'meeting-notes-20260925:otter-basic-limits', 'fit', 'limitation'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-free-guide', 'fit', 'fit'),
    ('57b270b9-78cf-41f8-8b74-dec46400cd65', 'meeting-notes-20260925:fireflies-pricing', 'fit', 'limitation');

  IF (SELECT count(*) FROM meeting_remediation_purposes WHERE relation_kind = 'capability') <> 12 OR
     (SELECT count(*) FROM meeting_remediation_purposes WHERE relation_kind = 'fit') <> 6 THEN
    RAISE EXCEPTION 'The exact four capability evidence purposes and fit evidence map are required.';
  END IF;

  INSERT INTO public.tool_capability_claims (tool_capability_id, claim_id, purpose)
  SELECT target.tool_capability_id, claim.id, purpose.purpose
  FROM meeting_remediation_purposes purpose
  JOIN meeting_remediation_targets target ON target.tool_id = purpose.tool_id
  JOIN public.product_intelligence_claims claim
    ON claim.profile_id = target.profile_id AND claim.claim_key = purpose.claim_key
  WHERE purpose.relation_kind = 'capability'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.tool_task_fit_claims (fit_id, claim_id, purpose)
  SELECT target.fit_id, claim.id, purpose.purpose
  FROM meeting_remediation_purposes purpose
  JOIN meeting_remediation_targets target ON target.tool_id = purpose.tool_id
  JOIN public.product_intelligence_claims claim
    ON claim.profile_id = target.profile_id AND claim.claim_key = purpose.claim_key
  WHERE purpose.relation_kind = 'fit'
  ON CONFLICT DO NOTHING;

  -- Update reviewed rows once. Already-published rows must match the intended
  -- content and reviewer; a repeated execution does not rewrite review history.
  UPDATE public.task_capabilities SET
    rationale = CASE capability_id
      WHEN v_transcription THEN '{"en":"A reviewable transcript preserves what participants said so readers can verify the summary and follow-up actions against the original discussion.","cn":"可复核的转录保留参会者发言，使读者能对照原话核查摘要和后续行动。"}'::jsonb
      ELSE '{"en":"The meeting-notes result must identify the main decisions and concrete follow-up actions, not merely record speech.","cn":"会议纪要需要识别主要决定和具体后续行动，而不只是记录发言。"}'::jsonb
    END,
    status = 'published', reviewed_at = v_now, review_due_at = v_due, reviewed_by = v_reviewer
  WHERE task_id = v_task AND capability_id IN (v_transcription, v_summary) AND status = 'reviewed';

  UPDATE public.tool_capabilities capability SET
    support_level = target.support_level,
    availability = target.availability,
    plan_requirement = target.plan_requirement,
    limitations = target.limitations,
    status = 'published', reviewed_at = v_now, review_due_at = v_due, reviewed_by = v_reviewer
  FROM meeting_remediation_targets target
  WHERE capability.id = target.tool_capability_id
    AND capability.tool_id = target.tool_id AND capability.capability_id = target.capability_id
    AND capability.status = 'reviewed';

  UPDATE public.tool_task_fits fit SET
    reviewed_by = v_reviewer, reviewed_at = v_now, review_due_at = v_due
  FROM meeting_remediation_targets target
  WHERE fit.id = target.fit_id AND fit.tool_id = target.tool_id AND fit.task_id = v_task
    AND fit.status = 'published' AND fit.fit_level = target.fit_level
    AND fit.reviewed_by IS NULL;

  -- Postconditions are part of this same DO transaction. Any mismatch raises
  -- and rolls back source/claim/link creation and all relation updates.
  IF (SELECT count(*) FROM public.task_capabilities
      WHERE task_id = v_task AND capability_id IN (v_transcription, v_summary)
        AND importance = 'required' AND status = 'published'
        AND reviewed_by = v_reviewer
        AND reviewed_at >= timestamptz '2026-09-25 00:00:00+00'
        AND reviewed_at <= v_now AND review_due_at > v_now
        AND rationale = CASE capability_id
          WHEN v_transcription THEN '{"en":"A reviewable transcript preserves what participants said so readers can verify the summary and follow-up actions against the original discussion.","cn":"可复核的转录保留参会者发言，使读者能对照原话核查摘要和后续行动。"}'::jsonb
          ELSE '{"en":"The meeting-notes result must identify the main decisions and concrete follow-up actions, not merely record speech.","cn":"会议纪要需要识别主要决定和具体后续行动，而不只是记录发言。"}'::jsonb END) <> 2 THEN
    RAISE EXCEPTION 'Two exact current meeting-notes Task Capabilities were not published.';
  END IF;
  IF (SELECT count(*) FROM public.tool_capabilities capability
      JOIN meeting_remediation_targets target ON target.tool_capability_id = capability.id
      WHERE capability.tool_id = target.tool_id AND capability.capability_id = target.capability_id
        AND capability.status = 'published' AND capability.support_level = target.support_level
        AND capability.availability = target.availability
        AND capability.plan_requirement = target.plan_requirement
        AND capability.limitations = target.limitations AND capability.reviewed_by = v_reviewer
        AND capability.reviewed_at >= timestamptz '2026-09-25 00:00:00+00'
        AND capability.reviewed_at <= v_now AND capability.review_due_at > v_now) <> 3 THEN
    RAISE EXCEPTION 'Three exact current Tool Capabilities were not published.';
  END IF;
  IF (SELECT count(*) FROM public.tool_task_fits fit
      JOIN meeting_remediation_targets target ON target.fit_id = fit.id
      WHERE fit.tool_id = target.tool_id AND fit.task_id = v_task
        AND fit.status = 'published' AND fit.fit_level = target.fit_level
        AND fit.reviewed_by = v_reviewer
        AND fit.reviewed_at >= timestamptz '2026-09-25 00:00:00+00'
        AND fit.reviewed_at <= v_now AND fit.review_due_at > v_now) <> 3 THEN
    RAISE EXCEPTION 'Three legacy fits did not receive this current manual review.';
  END IF;
  IF (SELECT count(*) FROM meeting_remediation_claims spec
      JOIN meeting_remediation_targets target ON target.tool_id = spec.tool_id
      JOIN public.product_intelligence_sources source
        ON source.profile_id = target.profile_id AND source.url = spec.source_url
      JOIN public.product_intelligence_claims claim
        ON claim.profile_id = target.profile_id AND claim.claim_key = spec.claim_key
      WHERE source.source_type = 'official' AND source.fetch_status = 'success'
        AND source.last_verified_at >= timestamptz '2026-09-25 00:00:00+00'
        AND claim.source_id = source.id AND claim.source_url = spec.source_url
        AND claim.claim_value = spec.claim_value AND claim.validity_scope = spec.validity_scope
        AND claim.verification_status = 'verified' AND claim.verified_by = v_reviewer
        AND claim.verified_at <= v_now AND claim.review_due_at > v_now
        AND claim.conflict_status = 'none' AND claim.invalidated_at IS NULL
        AND claim.expires_at IS NULL) <> 6 THEN
    RAISE EXCEPTION 'Six current direct official source/claim pairs were not verified.';
  END IF;
  IF (SELECT count(*) FROM meeting_remediation_purposes purpose
      JOIN meeting_remediation_targets target ON target.tool_id = purpose.tool_id
      JOIN public.product_intelligence_claims claim
        ON claim.profile_id = target.profile_id AND claim.claim_key = purpose.claim_key
      JOIN public.tool_capability_claims link
        ON link.tool_capability_id = target.tool_capability_id
        AND link.claim_id = claim.id AND link.purpose = purpose.purpose
      WHERE purpose.relation_kind = 'capability') <> 12 OR
     (SELECT count(*) FROM meeting_remediation_purposes purpose
      JOIN meeting_remediation_targets target ON target.tool_id = purpose.tool_id
      JOIN public.product_intelligence_claims claim
        ON claim.profile_id = target.profile_id AND claim.claim_key = purpose.claim_key
      JOIN public.tool_task_fit_claims link
        ON link.fit_id = target.fit_id
        AND link.claim_id = claim.id AND link.purpose = purpose.purpose
      WHERE purpose.relation_kind = 'fit') <> 6 THEN
    RAISE EXCEPTION 'Expected capability/fit evidence links or purpose coverage is incomplete.';
  END IF;
  DROP TABLE pg_temp.meeting_remediation_purposes;
  DROP TABLE pg_temp.meeting_remediation_claims;
  DROP TABLE pg_temp.meeting_remediation_targets;
END
$meeting_notes_remediation$;

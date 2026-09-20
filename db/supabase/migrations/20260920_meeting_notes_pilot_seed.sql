-- Production-gated seed for the meeting-notes decision Pilot.
-- Facts are limited to current official sources reviewed on 2026-09-20.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product_intelligence_profiles
    WHERE owner_type = 'tool'
      AND owner_id IN (
        'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49'::uuid,
        '57b270b9-78cf-41f8-8b74-dec46400cd65'::uuid
      )
      AND id NOT IN (
        '42446fa0-13e4-48ee-a4fa-7c33679d89aa'::uuid,
        'f2205c00-f20c-4c91-a757-bf91f6df4df3'::uuid
      )
  ) THEN
    RAISE EXCEPTION 'Conflicting Otter or Fireflies intelligence profile.';
  END IF;
END $$;

INSERT INTO product_intelligence_profiles (
  id, owner_type, owner_id, canonical_domain, product_name, profile_status,
  last_crawled_at, last_verified_at, next_review_at, metadata
) VALUES
(
  '42446fa0-13e4-48ee-a4fa-7c33679d89aa', 'tool',
  'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'otter.ai', 'Otter.ai', 'ready',
  '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z', '2026-10-20T00:00:00Z',
  '{"entryMethod":"meeting_notes_pilot","officialOnly":true}'::jsonb
),
(
  'f2205c00-f20c-4c91-a757-bf91f6df4df3', 'tool',
  '57b270b9-78cf-41f8-8b74-dec46400cd65', 'fireflies.ai', 'Fireflies', 'ready',
  '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z', '2026-10-20T00:00:00Z',
  '{"entryMethod":"meeting_notes_pilot","officialOnly":true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  canonical_domain=EXCLUDED.canonical_domain, product_name=EXCLUDED.product_name,
  profile_status='ready', last_verified_at=EXCLUDED.last_verified_at,
  next_review_at=EXCLUDED.next_review_at, metadata=EXCLUDED.metadata, updated_at=NOW();

INSERT INTO product_intelligence_sources (
  id, profile_id, url, page_type, http_status, canonical_url, fetch_status,
  source_type, source_label, publisher_name, last_verified_at, fetched_at, metadata
) VALUES
(
  '51be123b-da44-47b8-bfff-fc88124f6964', '42446fa0-13e4-48ee-a4fa-7c33679d89aa',
  'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
  'help', 200,
  'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
  'success', 'official', 'Otter Basic plan limits', 'Otter.ai',
  '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z', '{"manualReview":true}'::jsonb
),
(
  '78f1512b-96a7-4001-977d-41a8ef231edd', 'f2205c00-f20c-4c91-a757-bf91f6df4df3',
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
  'help', 200,
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
  'success', 'official', 'Fireflies Free plan limits', 'Fireflies.ai',
  '2026-09-20T00:00:00Z', '2026-09-20T00:00:00Z', '{"manualReview":true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  http_status=200, fetch_status='success', last_verified_at=EXCLUDED.last_verified_at,
  fetched_at=EXCLUDED.fetched_at, metadata=EXCLUDED.metadata, updated_at=NOW();

INSERT INTO product_intelligence_claims (
  id, profile_id, claim_type, claim_key, claim_value, source_url, source_excerpt,
  observed_at, confidence, conflict_status, source_id, source_type,
  verification_status, verified_at, verification_note, review_due_at, validity_scope, metadata
) VALUES
(
  'e54d8004-86ef-476d-addc-cb5215e94a5f', '42446fa0-13e4-48ee-a4fa-7c33679d89aa',
  'free_limit', 'free_limit:basic-meeting-transcription-2026-09',
  '{"plan":"Basic","monthlyTranscriptionMinutes":300,"maxMinutesPerConversation":30,"lifetimeImports":3,"recentConversationAccess":25}'::jsonb,
  'https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan',
  'Basic provides up to 300 transcription minutes per month, 30 minutes per conversation, three file imports per account, and access to the 25 most recent conversations.',
  '2026-09-20T00:00:00Z', 95, 'none', '51be123b-da44-47b8-bfff-fc88124f6964',
  'official', 'verified', '2026-09-20T00:00:00Z',
  'Manually verified against the current official Otter Help Center article.',
  '2026-10-20T00:00:00Z', '{"plan":"Basic","region":"global_reference"}'::jsonb,
  '{"entryMethod":"meeting_notes_pilot"}'::jsonb
),
(
  '32e5934f-bc33-415c-9d98-e88529155855', 'f2205c00-f20c-4c91-a757-bf91f6df4df3',
  'free_limit', 'free_limit:free-plan-meeting-workflow-2026-09',
  '{"plan":"Free","signupTranscriptionCredits":{"web":3,"chromeExtension":5,"mobileNewUser":10,"mobileExistingUser":5},"storageMinutesPerSeat":400,"monthlyAiCredits":20,"unlimitedEligibleAutoJoinTranscription":true}'::jsonb,
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
  'The Free plan uses signup-dependent transcription credits, provides 400 storage minutes per seat and 20 AI credits, and allows unlimited eligible auto-join transcription under documented conditions.',
  '2026-09-20T00:00:00Z', 95, 'none', '78f1512b-96a7-4001-977d-41a8ef231edd',
  'official', 'verified', '2026-09-20T00:00:00Z',
  'Manually verified against the current official Fireflies guide.',
  '2026-10-20T00:00:00Z', '{"plan":"Free","accountCohort":"current_signup","autoJoinConditional":true}'::jsonb,
  '{"entryMethod":"meeting_notes_pilot"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  claim_value=EXCLUDED.claim_value, source_excerpt=EXCLUDED.source_excerpt,
  observed_at=EXCLUDED.observed_at, confidence=EXCLUDED.confidence,
  conflict_status='none', verification_status='verified', verified_at=EXCLUDED.verified_at,
  verification_note=EXCLUDED.verification_note, review_due_at=EXCLUDED.review_due_at,
  invalidated_at=NULL, invalidation_reason=NULL, validity_scope=EXCLUDED.validity_scope,
  metadata=EXCLUDED.metadata;

INSERT INTO decision_tasks (
  id, slug, name, description, status, display_order, constraint_schema
) VALUES (
  'e9c64181-9cad-40c5-979e-3af4bd9cc630', 'meeting-notes',
  '{"en":"Capture meetings and turn them into follow-up","zh":"记录会议并形成后续行动","cn":"记录会议并形成后续行动"}'::jsonb,
  '{"en":"Compare meeting capture, transcript review, summaries, action items and governed team reuse.","zh":"比较会议采集、转录复核、摘要、行动项和受治理的团队复用。","cn":"比较会议采集、转录复核、摘要、行动项和受治理的团队复用。"}'::jsonb,
  'active', 10,
  '{"role":["sales","customer_success","operations","other"],"team_size":["solo","2_10","11_50","51_plus"],"data_sensitivity":["low","medium","high","regulated"],"export":["required","not_required"]}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, status='active',
  display_order=EXCLUDED.display_order, constraint_schema=EXCLUDED.constraint_schema;

INSERT INTO tool_decision_profiles (
  tool_id, setup_complexity, data_training_use, self_host_level, export_level,
  decision_summary, watch_outs, editorial_status, reviewed_at, review_due_at
) VALUES
(
  '7ae4bbb2-847f-45cc-9294-e96663fa02a3', 'unknown', 'unknown', 'unknown', 'unknown',
  '{"en":"Strong when supported online meetings need fast summaries and follow-up; verify capture compatibility, consent and account limits.","zh":"适合需要快速摘要和跟进的受支持线上会议；需核对采集兼容性、同意和账号限制。"}'::jsonb,
  '["Review generated notes before use","Confirm recording consent and platform support"]'::jsonb,
  'reviewed', '2026-09-20T00:00:00Z', '2026-10-20T00:00:00Z'
),
(
  'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49', 'unknown', 'unknown', 'unknown', 'unknown',
  '{"en":"Strong for searchable meeting history and collaborative notes when the team can govern auto-join, sharing and plan limits.","zh":"适合需要可搜索会议历史和协作笔记、且能治理自动入会、共享和套餐限制的团队。"}'::jsonb,
  '["Basic access is limited","Review transcript accuracy and sharing defaults"]'::jsonb,
  'reviewed', '2026-09-20T00:00:00Z', '2026-10-20T00:00:00Z'
),
(
  '57b270b9-78cf-41f8-8b74-dec46400cd65', 'unknown', 'unknown', 'unknown', 'unknown',
  '{"en":"Conditional fit for teams that need searchable meeting memory and integrations and can govern auto-join, credits and downstream data.","zh":"适合需要可搜索会议记忆和集成、且能治理自动入会、credits 与下游数据的团队。"}'::jsonb,
  '["Free limits depend on signup and auto-join conditions","Review consent, AI credits and downstream retention"]'::jsonb,
  'reviewed', '2026-09-20T00:00:00Z', '2026-10-20T00:00:00Z'
)
ON CONFLICT (tool_id) DO UPDATE SET
  setup_complexity=EXCLUDED.setup_complexity, data_training_use=EXCLUDED.data_training_use,
  self_host_level=EXCLUDED.self_host_level, export_level=EXCLUDED.export_level,
  decision_summary=EXCLUDED.decision_summary, watch_outs=EXCLUDED.watch_outs,
  editorial_status='reviewed', reviewed_at=EXCLUDED.reviewed_at,
  review_due_at=EXCLUDED.review_due_at, updated_at=NOW();

INSERT INTO tool_decision_profile_claims (tool_id, claim_id, purpose) VALUES
('7ae4bbb2-847f-45cc-9294-e96663fa02a3','fddb0da1-3fb5-4bad-9ad5-df543171985f','fit'),
('b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49','e54d8004-86ef-476d-addc-cb5215e94a5f','limitation'),
('57b270b9-78cf-41f8-8b74-dec46400cd65','32e5934f-bc33-415c-9d98-e88529155855','limitation')
ON CONFLICT DO NOTHING;

UPDATE tool_decision_profiles SET editorial_status='published', updated_at=NOW()
WHERE tool_id IN (
  '7ae4bbb2-847f-45cc-9294-e96663fa02a3',
  'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
  '57b270b9-78cf-41f8-8b74-dec46400cd65'
);

INSERT INTO tool_task_fits (
  id, tool_id, task_id, fit_level, rationale, required_conditions,
  disqualifiers, status, reviewed_at, review_due_at
) VALUES
(
  'e6f8457e-cc46-40c0-9d2b-aa455d87c658', '7ae4bbb2-847f-45cc-9294-e96663fa02a3',
  'e9c64181-9cad-40c5-979e-3af4bd9cc630', 'strong',
  '{"en":"Fast meeting capture, summaries and follow-up for supported calls.","zh":"为受支持会议提供快速采集、摘要和跟进。"}'::jsonb,
  '["Supported meeting platform","Participant notice and transcript review"]'::jsonb,
  '["Unsupported capture environment","Unreviewed authoritative record"]'::jsonb,
  'reviewed','2026-09-20T00:00:00Z','2026-10-20T00:00:00Z'
),
(
  '00d00375-2bb6-4ac3-8e6f-593327e244fb', 'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
  'e9c64181-9cad-40c5-979e-3af4bd9cc630', 'strong',
  '{"en":"Searchable meeting history and collaborative notes with explicit plan boundaries.","zh":"在明确套餐边界下提供可搜索会议历史和协作笔记。"}'::jsonb,
  '["Plan limits match meeting volume","Auto-join and sharing are governed"]'::jsonb,
  '["Recording is prohibited","No transcript review process"]'::jsonb,
  'reviewed','2026-09-20T00:00:00Z','2026-10-20T00:00:00Z'
),
(
  '0ea08626-0d94-4773-a27e-3b5ce8fbd09b', '57b270b9-78cf-41f8-8b74-dec46400cd65',
  'e9c64181-9cad-40c5-979e-3af4bd9cc630', 'conditional',
  '{"en":"Searchable team meeting memory with broad workflows, conditional on credits, auto-join and data governance.","zh":"提供可搜索团队会议记忆，但取决于 credits、自动入会和数据治理条件。"}'::jsonb,
  '["Free or paid limits match use","Consent and downstream retention are governed"]'::jsonb,
  '["Confidential meetings cannot be excluded","No downstream deletion process"]'::jsonb,
  'reviewed','2026-09-20T00:00:00Z','2026-10-20T00:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  fit_level=EXCLUDED.fit_level, rationale=EXCLUDED.rationale,
  required_conditions=EXCLUDED.required_conditions, disqualifiers=EXCLUDED.disqualifiers,
  status='reviewed', reviewed_at=EXCLUDED.reviewed_at,
  review_due_at=EXCLUDED.review_due_at, updated_at=NOW();

INSERT INTO tool_task_fit_claims (fit_id, claim_id, purpose) VALUES
('e6f8457e-cc46-40c0-9d2b-aa455d87c658','fddb0da1-3fb5-4bad-9ad5-df543171985f','fit'),
('00d00375-2bb6-4ac3-8e6f-593327e244fb','e54d8004-86ef-476d-addc-cb5215e94a5f','limitation'),
('0ea08626-0d94-4773-a27e-3b5ce8fbd09b','32e5934f-bc33-415c-9d98-e88529155855','limitation')
ON CONFLICT DO NOTHING;

UPDATE tool_task_fits SET status='published', updated_at=NOW()
WHERE id IN (
  'e6f8457e-cc46-40c0-9d2b-aa455d87c658',
  '00d00375-2bb6-4ac3-8e6f-593327e244fb',
  '0ea08626-0d94-4773-a27e-3b5ce8fbd09b'
);

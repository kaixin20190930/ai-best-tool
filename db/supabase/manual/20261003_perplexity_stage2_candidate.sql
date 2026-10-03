-- Owner SQL Editor only. The final SELECT always returns one result row.
-- Default ROLLBACK mode undoes candidate writes inside a PL/pgSQL subtransaction.
-- After a fresh preflight, change only the last line's mode to COMMIT.
-- pg_temp helper exists only for this SQL Editor session; the last SELECT is the result row.
-- This creates no verified claim, evidence link, published relation, or Task Page.
CREATE OR REPLACE FUNCTION pg_temp.perplexity_stage2_candidate(p_mode text)
RETURNS TABLE(mode text, preflight boolean, profiles integer, sources integer,
  claims integer, decision integer, capabilities integer, fit integer,
  links integer, post_md5 text)
LANGUAGE plpgsql AS $stage2$
DECLARE
  v_tool CONSTANT uuid := '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
  v_task CONSTANT uuid := '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
  v_profile CONSTANT uuid := 'd0186230-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'd0186230-0000-4000-8000-000000000301';
  v_discovery CONSTANT uuid := '50288b6e-a968-4bcf-9e55-911df203e0c7';
  v_citation CONSTANT uuid := '04930ae8-4c78-487f-a6c9-25680b8da681';
  v_now timestamptz := clock_timestamp();
  v_row record;
  v_count integer;
  v_state jsonb;
  v_post_md5 text;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('ROLLBACK','COMMIT') THEN
    RAISE EXCEPTION 'Use ROLLBACK for preview or COMMIT for candidate write';
  END IF;
  BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'Owner SQL Editor or service role required';
  END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN (
      'public.product_intelligence_profiles'::regclass,
      'public.product_intelligence_sources'::regclass,
      'public.product_intelligence_claims'::regclass,
      'public.tool_decision_profiles'::regclass,
      'public.tool_capabilities'::regclass,
      'public.tool_task_fits'::regclass,
      'public.tool_decision_profile_claims'::regclass,
      'public.tool_capability_claims'::regclass,
      'public.tool_task_fit_claims'::regclass) AND relrowsecurity) <> 9 THEN
    RAISE EXCEPTION 'Stage 2 requires RLS enabled on all nine Supabase tables';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('perplexity-stage2-candidate'));
  IF (SELECT count(*) FROM public.decision_tasks WHERE id=v_task AND slug='research-with-citations' AND status='active') <> 1
     OR (SELECT count(*) FROM public.decision_capabilities WHERE
       (id=v_discovery AND slug='research-discovery' AND status='active') OR
       (id=v_citation AND slug='citation-traceability' AND status='active')) <> 2 THEN
    RAISE EXCEPTION 'Fixed Task/Capability identities or status changed';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool) NOT IN (0,1)
     OR EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool AND id<>v_profile)
     OR EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE id=v_profile AND (owner_type<>'tool' OR owner_id<>v_tool))
     OR EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE canonical_domain IN ('perplexity.ai','www.perplexity.ai') AND owner_id<>v_tool)
     OR EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status<>'draft')
     OR EXISTS (SELECT 1 FROM public.tool_capabilities WHERE tool_id=v_tool AND id NOT IN
       ('d0186230-0000-4000-8000-000000000201'::uuid,'d0186230-0000-4000-8000-000000000202'::uuid))
     OR EXISTS (SELECT 1 FROM public.tool_task_fits WHERE tool_id=v_tool AND id<>v_fit) THEN
    RAISE EXCEPTION 'Perplexity old state is not empty or exact candidate; HOLD';
  END IF;
  SELECT jsonb_build_object(
    'profiles',(SELECT count(*) FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool),
    'sources',(SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile),
    'claims',(SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile),
    'decision',(SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool),
    'capabilities',(SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool),
    'fits',(SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool),
    'links',(SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool) +
      (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities c ON c.id=l.tool_capability_id WHERE c.tool_id=v_tool) +
      (SELECT count(*) FROM public.tool_task_fit_claims l JOIN public.tool_task_fits f ON f.id=l.fit_id WHERE f.tool_id=v_tool)
  ) INTO v_state;
  RAISE NOTICE 'PREIMAGE %', v_state;
  IF (v_state->>'links')::integer <> 0 THEN RAISE EXCEPTION 'Existing evidence links require separate reconciliation'; END IF;

  INSERT INTO public.product_intelligence_profiles
    (id,owner_type,owner_id,canonical_domain,product_name,profile_status,next_review_at,metadata)
  VALUES (v_profile,'tool',v_tool,'www.perplexity.ai','Perplexity','pending',
    '2026-12-30T00:00:00Z',
    '{"stage2Batch":"perplexity-20261003","scope":"web search and cited answers"}')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_type='tool' AND owner_id=v_tool
      AND canonical_domain='www.perplexity.ai' AND product_name='Perplexity' AND profile_status='pending'
      AND next_review_at='2026-12-30T00:00:00Z' AND last_verified_at IS NULL
      AND metadata='{"stage2Batch":"perplexity-20261003","scope":"web search and cited answers"}'::jsonb) <> 1 THEN
    RAISE EXCEPTION 'Profile postimage differs';
  END IF;

  CREATE TEMP TABLE stage2_source_spec (id uuid PRIMARY KEY, url text UNIQUE, page_type text, label text) ON COMMIT DROP;
  INSERT INTO stage2_source_spec VALUES
    ('d0186230-0000-4000-8000-000000000101','https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search','help','What is Pro Search?'),
    ('d0186230-0000-4000-8000-000000000102','https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you','help','Subscription plan comparison'),
    ('d0186230-0000-4000-8000-000000000103','https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity','help','Data Collection at Perplexity'),
    ('d0186230-0000-4000-8000-000000000104','https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels','help','Understanding source labels'),
    ('d0186230-0000-4000-8000-000000000105','https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions','help','Enterprise pricing and API boundary');
  IF EXISTS (SELECT 1 FROM public.product_intelligence_sources s WHERE s.profile_id=v_profile AND NOT EXISTS
      (SELECT 1 FROM stage2_source_spec x WHERE x.id=s.id AND x.url=s.url)) THEN
    RAISE EXCEPTION 'Unknown Perplexity source exists';
  END IF;
  INSERT INTO public.product_intelligence_sources
    (id,profile_id,url,canonical_url,page_type,source_type,source_label,publisher_name,fetch_status,metadata)
  SELECT id,v_profile,url,url,page_type,'official',label,'Perplexity','pending',
    '{"stage2Batch":"perplexity-20261003","note":"Candidate URL; fetch and review not attested"}'::jsonb
  FROM stage2_source_spec ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_sources s JOIN stage2_source_spec x ON x.id=s.id
      WHERE s.profile_id=v_profile AND s.url=x.url AND s.canonical_url=x.url AND s.page_type=x.page_type
        AND s.source_type='official' AND s.source_label=x.label AND s.publisher_name='Perplexity'
        AND s.fetch_status='pending' AND s.last_verified_at IS NULL AND s.fetched_at IS NULL
        AND s.http_status IS NULL AND s.metadata='{"stage2Batch":"perplexity-20261003","note":"Candidate URL; fetch and review not attested"}'::jsonb) <> 5 THEN
    RAISE EXCEPTION 'Five exact pending official sources required';
  END IF;

  CREATE TEMP TABLE stage2_claim_spec (id uuid PRIMARY KEY, source_id uuid, claim_key text UNIQUE,
    claim_type text, claim_value jsonb, validity_scope jsonb) ON COMMIT DROP;
  INSERT INTO stage2_claim_spec VALUES
    ('d0186230-0000-4000-8000-000000000401','d0186230-0000-4000-8000-000000000101','perplexity:research:web-synthesis-2026-10','workflow_feature',
      '{"summary":"Pro Search conducts multiple open-web searches and synthesizes answers from sources that may include articles, papers, forums and videos."}','{"surface":"Pro Search Web focus","excludes":"closed corpus or exhaustive systematic review"}'),
    ('d0186230-0000-4000-8000-000000000402','d0186230-0000-4000-8000-000000000101','perplexity:research:direct-links-2026-10','workflow_feature',
      '{"summary":"Pro Search answers include direct original-source links for inspection; the site has not independently tested citation accuracy."}','{"surface":"Pro Search answer","requires":"open and read the original source"}'),
    ('d0186230-0000-4000-8000-000000000403','d0186230-0000-4000-8000-000000000101','perplexity:research:focus-2026-10','workflow_feature',
      '{"summary":"Search focus can target Web, Academic, Finance or Files; each selection changes the source scope."}','{"surface":"Pro Search focus selector","conditions":["account","plan","selected focus"]}'),
    ('d0186230-0000-4000-8000-000000000404','d0186230-0000-4000-8000-000000000102','perplexity:research:plans-2026-10','plan_limit',
      '{"summary":"Standard has basic search and limited Pro Search; Pro, Max and Enterprise have differentiated access. Exact Free Pro Search quota remains unknown because official pages conflict."}','{"scope":"Web/app subscription","exactFreeProSearchQuota":"unknown","requires":"recheck target account at review"}'),
    ('d0186230-0000-4000-8000-000000000405','d0186230-0000-4000-8000-000000000105','perplexity:research:api-boundary-2026-10','plan_limit',
      '{"summary":"API Platform usage and credits are billed separately from Enterprise seats and web/app subscriptions."}','{"scope":"Enterprise and API procurement","excludes":"included API entitlement"}'),
    ('d0186230-0000-4000-8000-000000000406','d0186230-0000-4000-8000-000000000103','perplexity:research:data-boundary-2026-10','privacy_limit',
      '{"summary":"Free, Pro and Max enable AI Data Retention by default and allow opt-out for future data; Enterprise data is not used for AI training."}','{"scope":"named consumer and Enterprise plans","requires":"check account setting and Enterprise contract"}'),
    ('d0186230-0000-4000-8000-000000000407','d0186230-0000-4000-8000-000000000104','perplexity:research:labels-limitation-2026-10','workflow_limit',
      '{"summary":"Source labels rate a website domain, not each page or claim; linked material and conclusions require original-source review."}','{"surface":"source labels and linked answers","excludes":"page-level or claim-level accuracy guarantee"}');
  IF EXISTS (SELECT 1 FROM public.product_intelligence_claims c WHERE c.profile_id=v_profile AND NOT EXISTS
      (SELECT 1 FROM stage2_claim_spec x WHERE x.id=c.id AND x.claim_key=c.claim_key)) THEN
    RAISE EXCEPTION 'Unknown Perplexity claim exists';
  END IF;
  INSERT INTO public.product_intelligence_claims
    (id,profile_id,claim_type,claim_key,claim_value,source_id,source_url,source_type,
     confidence,conflict_status,verification_status,validity_scope,metadata)
  SELECT x.id,v_profile,x.claim_type,x.claim_key,x.claim_value,x.source_id,s.url,'official',50,'none',
    'candidate',x.validity_scope,'{"stage2Batch":"perplexity-20261003","siteCitationAccuracyTested":false}'::jsonb
  FROM stage2_claim_spec x JOIN stage2_source_spec s ON s.id=x.source_id ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_claims c JOIN stage2_claim_spec x ON x.id=c.id
      JOIN stage2_source_spec s ON s.id=x.source_id
      WHERE c.profile_id=v_profile AND c.claim_type=x.claim_type AND c.claim_key=x.claim_key
        AND c.claim_value=x.claim_value AND c.source_id=x.source_id AND c.source_url=s.url
        AND c.source_type='official' AND c.verification_status='candidate' AND c.source_excerpt IS NULL
        AND c.verified_at IS NULL AND c.verified_by IS NULL AND c.review_due_at IS NULL
        AND c.conflict_status='none' AND c.invalidated_at IS NULL AND c.validity_scope=x.validity_scope
        AND c.confidence=50 AND c.expires_at IS NULL
        AND c.metadata='{"stage2Batch":"perplexity-20261003","siteCitationAccuracyTested":false}'::jsonb) <> 7 THEN
    RAISE EXCEPTION 'Seven exact candidate claims required';
  END IF;

  INSERT INTO public.tool_decision_profiles
    (tool_id,setup_complexity,data_training_use,self_host_level,export_level,decision_summary,watch_outs,editorial_status)
  VALUES (v_tool,'unknown','unknown','unknown','unknown',
    '{"en":"Useful for open-web discovery and cited synthesis when the reader checks important original sources.","cn":"适于开放网页发现与带来源综合，重要结论须核读原文。"}',
    '[{"en":"Focus, plan and account change scope and access. Source links and domain labels do not prove accuracy; Free Pro Search exact quota is unresolved. Web and API entitlements differ.","cn":"范围与权益受搜索焦点、套餐和账号影响。来源链接及域名标签不证明准确；Free Pro Search 精确额度未消歧。Web 与 API 权益分离。"}]','draft')
  ON CONFLICT (tool_id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND setup_complexity='unknown'
      AND data_training_use='unknown' AND self_host_level='unknown' AND export_level='unknown'
      AND editorial_status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL
      AND decision_summary='{"en":"Useful for open-web discovery and cited synthesis when the reader checks important original sources.","cn":"适于开放网页发现与带来源综合，重要结论须核读原文。"}'::jsonb
      AND watch_outs='[{"en":"Focus, plan and account change scope and access. Source links and domain labels do not prove accuracy; Free Pro Search exact quota is unresolved. Web and API entitlements differ.","cn":"范围与权益受搜索焦点、套餐和账号影响。来源链接及域名标签不证明准确；Free Pro Search 精确额度未消歧。Web 与 API 权益分离。"}]'::jsonb) <> 1 THEN
    RAISE EXCEPTION 'Decision profile postimage differs';
  END IF;

  INSERT INTO public.tool_capabilities
    (id,tool_id,capability_id,support_level,availability,plan_requirement,limitations,status)
  VALUES
    ('d0186230-0000-4000-8000-000000000201',v_tool,v_discovery,'strong','unknown',
     '{"en":"Basic search is available on Standard; Pro Search depth and limits vary by plan. Exact Free Pro Search quota is unknown.","cn":"Standard 可用基础搜索；Pro Search 深度与限制依套餐变化。Free Pro Search 精确额度未知。"}',
     '[{"en":"Open-web and selected focus are not an exhaustive literature search; inspect original sources.","cn":"开放网页与选定焦点不等于穷尽文献检索；须核读原文。"}]','draft'),
    ('d0186230-0000-4000-8000-000000000202',v_tool,v_citation,'partial','unknown',
     '{"en":"Direct source links are documented for Pro Search; verify access on the target plan and account.","cn":"官方说明 Pro Search 有直接来源链接；须按目标套餐及账号核对。"}',
     '[{"en":"Links are a review path, not evidence of page-level or claim-level correctness; accuracy was not independently tested.","cn":"链接提供回查路径，不证明单篇或单条主张正确；本站未独立实测准确性。"}]','draft')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='draft'
      AND reviewed_by IS NULL AND reviewed_at IS NULL AND
      ((id='d0186230-0000-4000-8000-000000000201' AND capability_id=v_discovery AND support_level='strong' AND availability='unknown'
        AND plan_requirement='{"en":"Basic search is available on Standard; Pro Search depth and limits vary by plan. Exact Free Pro Search quota is unknown.","cn":"Standard 可用基础搜索；Pro Search 深度与限制依套餐变化。Free Pro Search 精确额度未知。"}'::jsonb
        AND limitations='[{"en":"Open-web and selected focus are not an exhaustive literature search; inspect original sources.","cn":"开放网页与选定焦点不等于穷尽文献检索；须核读原文。"}]'::jsonb) OR
       (id='d0186230-0000-4000-8000-000000000202' AND capability_id=v_citation AND support_level='partial' AND availability='unknown'
        AND plan_requirement='{"en":"Direct source links are documented for Pro Search; verify access on the target plan and account.","cn":"官方说明 Pro Search 有直接来源链接；须按目标套餐及账号核对。"}'::jsonb
        AND limitations='[{"en":"Links are a review path, not evidence of page-level or claim-level correctness; accuracy was not independently tested.","cn":"链接提供回查路径，不证明单篇或单条主张正确；本站未独立实测准确性。"}]'::jsonb))) <> 2 THEN
    RAISE EXCEPTION 'Two exact draft Tool Capabilities required';
  END IF;
  INSERT INTO public.tool_task_fits
    (id,tool_id,task_id,fit_level,rationale,required_conditions,disqualifiers,status)
  VALUES (v_fit,v_tool,v_task,'conditional',
    '{"en":"Use for open-web discovery and cited answers only when important citations are checked against original pages.","cn":"仅在逐条核读重要原文时，用于开放网页发现与带来源回答。"}',
    '[{"en":"Select the intended search focus, confirm plan access, inspect primary text and methods, and check privacy settings.","cn":"选定搜索范围，确认套餐权限，检查原始文本与方法，并核对隐私设置。"}]',
    '[{"en":"Requires exhaustive reproducible systematic review, guaranteed citation accuracy, or included API access.","cn":"要求穷尽可复现系统综述、保证引文准确或订阅附带 API 权益。"}]','draft')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_task_fits WHERE id=v_fit AND tool_id=v_tool AND task_id=v_task
      AND fit_level='conditional' AND status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL
      AND rationale='{"en":"Use for open-web discovery and cited answers only when important citations are checked against original pages.","cn":"仅在逐条核读重要原文时，用于开放网页发现与带来源回答。"}'::jsonb
      AND required_conditions='[{"en":"Select the intended search focus, confirm plan access, inspect primary text and methods, and check privacy settings.","cn":"选定搜索范围，确认套餐权限，检查原始文本与方法，并核对隐私设置。"}]'::jsonb
      AND disqualifiers='[{"en":"Requires exhaustive reproducible systematic review, guaranteed citation accuracy, or included API access.","cn":"要求穷尽可复现系统综述、保证引文准确或订阅附带 API 权益。"}]'::jsonb) <> 1 THEN
    RAISE EXCEPTION 'Draft Fit postimage differs';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile)<>5 OR
     (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile)<>7 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool)<>2 OR
     (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool)<>1 THEN
    RAISE EXCEPTION 'Candidate row counts differ';
  END IF;
  SELECT md5(jsonb_build_object(
    'profile',(SELECT to_jsonb(p) FROM public.product_intelligence_profiles p WHERE p.id=v_profile),
    'sources',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.id),'[]'::jsonb) FROM public.product_intelligence_sources s WHERE s.profile_id=v_profile),
    'claims',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]'::jsonb) FROM public.product_intelligence_claims c WHERE c.profile_id=v_profile),
    'decision',(SELECT to_jsonb(d) FROM public.tool_decision_profiles d WHERE d.tool_id=v_tool),
    'capabilities',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.id),'[]'::jsonb) FROM public.tool_capabilities t WHERE t.tool_id=v_tool),
    'fit',(SELECT to_jsonb(f) FROM public.tool_task_fits f WHERE f.id=v_fit),
    'decisionLinks',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.claim_id,l.purpose),'[]'::jsonb) FROM public.tool_decision_profile_claims l WHERE l.tool_id=v_tool),
    'capabilityLinks',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.tool_capability_id,l.claim_id,l.purpose),'[]'::jsonb) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool),
    'fitLinks',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.claim_id,l.purpose),'[]'::jsonb) FROM public.tool_task_fit_claims l WHERE l.fit_id=v_fit)
  )::text) INTO v_post_md5;
  mode := CASE WHEN p_mode='ROLLBACK' THEN 'preflight' ELSE 'committed' END;
  preflight := p_mode='ROLLBACK';
  SELECT count(*)::integer INTO profiles FROM public.product_intelligence_profiles WHERE id=v_profile;
  SELECT count(*)::integer INTO sources FROM public.product_intelligence_sources WHERE profile_id=v_profile;
  SELECT count(*)::integer INTO claims FROM public.product_intelligence_claims WHERE profile_id=v_profile;
  SELECT count(*)::integer INTO decision FROM public.tool_decision_profiles WHERE tool_id=v_tool;
  SELECT count(*)::integer INTO capabilities FROM public.tool_capabilities WHERE tool_id=v_tool;
  SELECT count(*)::integer INTO fit FROM public.tool_task_fits WHERE id=v_fit;
  SELECT ((SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit))::integer INTO links;
  post_md5 := v_post_md5;
  IF (profiles,sources,claims,decision,capabilities,fit,links)<>(1,5,7,1,2,1,0) THEN
    RAISE EXCEPTION 'Candidate result row counts differ';
  END IF;
  IF preflight THEN
    RAISE EXCEPTION 'stage2_preflight_rollback' USING ERRCODE='P0001';
  END IF;
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM <> 'stage2_preflight_rollback' THEN RAISE; END IF;
  END;
  RETURN NEXT;
END
$stage2$;
SELECT * FROM pg_temp.perplexity_stage2_candidate('ROLLBACK');

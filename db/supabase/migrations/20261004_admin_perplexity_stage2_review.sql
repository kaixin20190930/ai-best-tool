-- One-time, fail-closed Admin Evidence Review action for Perplexity Stage 2.
-- Routine relation reviews run through the admin UI and this service-role RPC.
-- The function reviews only the predefined draft graph and exact evidence links;
-- it never publishes a relation or changes tools, Tasks, or index state.
CREATE OR REPLACE FUNCTION public.admin_link_perplexity_stage2_evidence(p_reviewer uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tool CONSTANT uuid := '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
  v_task CONSTANT uuid := '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
  v_profile CONSTANT uuid := 'd0186230-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'd0186230-0000-4000-8000-000000000301';
  v_now timestamptz := clock_timestamp();
  v_due timestamptz;
  v_count integer;
  v_decision_status text;
  v_fit_status text;
  v_capability_statuses integer;
BEGIN
  IF auth.role() <> 'service_role' OR p_reviewer IS NULL OR NOT EXISTS
    (SELECT 1 FROM auth.users WHERE id = p_reviewer) THEN
    RAISE EXCEPTION 'Admin service role and real reviewer required';
  END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
    ('public.product_intelligence_profiles'::regclass,'public.product_intelligence_sources'::regclass,
     'public.product_intelligence_claims'::regclass,'public.tool_decision_profiles'::regclass,
     'public.tool_capabilities'::regclass,'public.tool_task_fits'::regclass,
     'public.tool_decision_profile_claims'::regclass,'public.tool_capability_claims'::regclass,
     'public.tool_task_fit_claims'::regclass,'public.admin_evidence_review_audit'::regclass)
     AND relrowsecurity) <> 10 THEN
    RAISE EXCEPTION 'Perplexity Stage 2 review requires RLS';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('perplexity-stage2-admin-review'));

  IF NOT EXISTS (SELECT 1 FROM public.product_intelligence_profiles
      WHERE id=v_profile AND owner_type='tool' AND owner_id=v_tool
        AND canonical_domain='www.perplexity.ai' AND profile_status IN ('pending','ready')) THEN
    RAISE EXCEPTION 'Perplexity profile owner or state mismatch';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile) <> 5 OR
     EXISTS (SELECT 1 FROM (VALUES
       ('d0186230-0000-4000-8000-000000000101'::uuid,'https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search'),
       ('d0186230-0000-4000-8000-000000000102'::uuid,'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you'),
       ('d0186230-0000-4000-8000-000000000103'::uuid,'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity'),
       ('d0186230-0000-4000-8000-000000000104'::uuid,'https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels'),
       ('d0186230-0000-4000-8000-000000000105'::uuid,'https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions')
     ) expected(id,url) LEFT JOIN public.product_intelligence_sources s
       ON s.id=expected.id AND s.profile_id=v_profile AND s.url=expected.url
        AND s.source_type='official' AND s.fetch_status='success'
        AND s.last_verified_at IS NOT NULL AND s.metadata->>'stage2Batch'='perplexity-20261003'
       WHERE s.id IS NULL) THEN
    RAISE EXCEPTION 'Five exact current official Perplexity sources required';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile) <> 7 OR
     EXISTS (SELECT 1 FROM (VALUES
       ('d0186230-0000-4000-8000-000000000401'::uuid,'perplexity:research:web-synthesis-2026-10','d0186230-0000-4000-8000-000000000101'::uuid),
       ('d0186230-0000-4000-8000-000000000402'::uuid,'perplexity:research:direct-links-2026-10','d0186230-0000-4000-8000-000000000101'::uuid),
       ('d0186230-0000-4000-8000-000000000403'::uuid,'perplexity:research:focus-2026-10','d0186230-0000-4000-8000-000000000101'::uuid),
       ('d0186230-0000-4000-8000-000000000404'::uuid,'perplexity:research:plans-2026-10','d0186230-0000-4000-8000-000000000102'::uuid),
       ('d0186230-0000-4000-8000-000000000405'::uuid,'perplexity:research:api-boundary-2026-10','d0186230-0000-4000-8000-000000000105'::uuid),
       ('d0186230-0000-4000-8000-000000000406'::uuid,'perplexity:research:data-boundary-2026-10','d0186230-0000-4000-8000-000000000103'::uuid),
       ('d0186230-0000-4000-8000-000000000407'::uuid,'perplexity:research:labels-limitation-2026-10','d0186230-0000-4000-8000-000000000104'::uuid)
     ) expected(id,claim_key,source_id)
     LEFT JOIN public.product_intelligence_claims c
       ON c.id=expected.id AND c.claim_key=expected.claim_key AND c.source_id=expected.source_id
        AND c.profile_id=v_profile AND c.verification_status='verified'
        AND c.conflict_status='none' AND c.invalidated_at IS NULL
        AND (c.expires_at IS NULL OR c.expires_at>v_now)
        AND c.review_due_at>v_now AND c.verified_at IS NOT NULL AND c.verified_by IS NOT NULL
        AND length(btrim(coalesce(c.source_excerpt,'')))>=12
        AND c.source_type='official' AND c.metadata->>'stage2Batch'='perplexity-20261003'
     LEFT JOIN public.product_intelligence_sources s
       ON s.id=c.source_id AND s.profile_id=c.profile_id AND s.url=c.source_url
        AND s.source_type=c.source_type AND s.fetch_status='success'
        AND s.last_verified_at IS NOT NULL
     WHERE c.id IS NULL OR s.id IS NULL) THEN
    RAISE EXCEPTION 'All seven exact verified/current same-owner Perplexity claims required';
  END IF;
  SELECT min(review_due_at) INTO v_due FROM public.product_intelligence_claims WHERE profile_id=v_profile;
  IF v_due IS NULL OR v_due<=v_now THEN RAISE EXCEPTION 'Perplexity claims have no future review window'; END IF;

  SELECT editorial_status INTO v_decision_status FROM public.tool_decision_profiles WHERE tool_id=v_tool FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Predefined Perplexity Decision missing'; END IF;
  SELECT status INTO v_fit_status FROM public.tool_task_fits WHERE id=v_fit AND tool_id=v_tool AND task_id=v_task
    AND fit_level='conditional'
    AND rationale='{"en":"Use for open-web discovery and cited answers only when important citations are checked against original pages.","cn":"仅在逐条核读重要原文时，用于开放网页发现与带来源回答。"}'::jsonb
    AND required_conditions='[{"en":"Select the intended search focus, confirm plan access, inspect primary text and methods, and check privacy settings.","cn":"选定搜索范围，确认套餐权限，检查原始文本与方法，并核对隐私设置。"}]'::jsonb
    AND disqualifiers='[{"en":"Requires exhaustive reproducible systematic review, guaranteed citation accuracy, or included API access.","cn":"要求穷尽可复现系统综述、保证引文准确或订阅附带 API 权益。"}]'::jsonb FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Predefined conditional Perplexity Fit missing'; END IF;
  IF (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool)<>2 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND id IN
       ('d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000202')
       AND capability_id IN ('50288b6e-a968-4bcf-9e55-911df203e0c7','04930ae8-4c78-487f-a6c9-25680b8da681')
       AND ((id='d0186230-0000-4000-8000-000000000201' AND support_level='strong' AND availability='unknown'
         AND plan_requirement='{"en":"Basic search is available on Standard; Pro Search depth and limits vary by plan. Exact Free Pro Search quota is unknown.","cn":"Standard 可用基础搜索；Pro Search 深度与限制依套餐变化。Free Pro Search 精确额度未知。"}'::jsonb
         AND limitations='[{"en":"Open-web and selected focus are not an exhaustive literature search; inspect original sources.","cn":"开放网页与选定焦点不等于穷尽文献检索；须核读原文。"}]'::jsonb) OR
        (id='d0186230-0000-4000-8000-000000000202' AND support_level='partial' AND availability='unknown'
         AND plan_requirement='{"en":"Direct source links are documented for Pro Search; verify access on the target plan and account.","cn":"官方说明 Pro Search 有直接来源链接；须按目标套餐及账号核对。"}'::jsonb
         AND limitations='[{"en":"Links are a review path, not evidence of page-level or claim-level correctness; accuracy was not independently tested.","cn":"链接提供回查路径，不证明单篇或单条主张正确；本站未独立实测准确性。"}]'::jsonb)))<>2 OR
     NOT EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool
       AND setup_complexity='unknown' AND data_training_use='unknown' AND self_host_level='unknown' AND export_level='unknown'
       AND decision_summary='{"en":"Useful for open-web discovery and cited synthesis when the reader checks important original sources.","cn":"适于开放网页发现与带来源综合，重要结论须核读原文。"}'::jsonb
       AND watch_outs='[{"en":"Focus, plan and account change scope and access. Source links and domain labels do not prove accuracy; Free Pro Search exact quota is unresolved. Web and API entitlements differ.","cn":"范围与权益受搜索焦点、套餐和账号影响。来源链接及域名标签不证明准确；Free Pro Search 精确额度未消歧。Web 与 API 权益分离。"}]'::jsonb) THEN
    RAISE EXCEPTION 'Predefined Perplexity Capabilities changed';
  END IF;
  SELECT count(*) INTO v_capability_statuses FROM public.tool_capabilities
    WHERE tool_id=v_tool AND status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL;
  IF NOT ((v_decision_status='draft' AND v_fit_status='draft' AND v_capability_statuses=2) OR
          (v_decision_status='reviewed' AND v_fit_status='reviewed' AND v_capability_statuses=0 AND
           (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='reviewed'
             AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND review_due_at>v_now)=2 AND
           EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool
             AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND review_due_at>v_now) AND
           EXISTS (SELECT 1 FROM public.tool_task_fits WHERE id=v_fit
             AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND review_due_at>v_now))) THEN
    RAISE EXCEPTION 'Perplexity graph must be exact drafts or fully reviewed';
  END IF;

  CREATE TEMP TABLE perplexity_admin_links(kind text, relation_id uuid, claim_id uuid, purpose text,
    PRIMARY KEY(kind,relation_id,claim_id,purpose)) ON COMMIT DROP;
  INSERT INTO perplexity_admin_links VALUES
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000401','fit'),
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000402','fit'),
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000404','limitation'),
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000405','limitation'),
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000406','privacy'),
    ('decision',v_tool,'d0186230-0000-4000-8000-000000000407','limitation'),
    ('capability','d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000401','support'),
    ('capability','d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000403','support'),
    ('capability','d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000404','availability'),
    ('capability','d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000404','plan'),
    ('capability','d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000407','limitation'),
    ('capability','d0186230-0000-4000-8000-000000000202','d0186230-0000-4000-8000-000000000402','support'),
    ('capability','d0186230-0000-4000-8000-000000000202','d0186230-0000-4000-8000-000000000403','availability'),
    ('capability','d0186230-0000-4000-8000-000000000202','d0186230-0000-4000-8000-000000000404','plan'),
    ('capability','d0186230-0000-4000-8000-000000000202','d0186230-0000-4000-8000-000000000406','limitation'),
    ('capability','d0186230-0000-4000-8000-000000000202','d0186230-0000-4000-8000-000000000407','limitation'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000401','fit'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000402','fit'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000403','fit'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000404','limitation'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000405','limitation'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000406','privacy'),
    ('fit',v_fit,'d0186230-0000-4000-8000-000000000407','limitation');
  IF (SELECT count(*) FROM perplexity_admin_links)<>23 OR EXISTS
    (SELECT 1 FROM perplexity_admin_links l LEFT JOIN public.product_intelligence_claims c
       ON c.id=l.claim_id AND c.profile_id=v_profile WHERE c.id IS NULL) THEN
    RAISE EXCEPTION 'Exact Perplexity relation manifest or owner mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tool_decision_profile_claims l WHERE l.tool_id=v_tool AND NOT EXISTS
      (SELECT 1 FROM perplexity_admin_links x WHERE x.kind='decision' AND x.relation_id=l.tool_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose)) OR
     EXISTS (SELECT 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id
       WHERE t.tool_id=v_tool AND NOT EXISTS (SELECT 1 FROM perplexity_admin_links x WHERE x.kind='capability'
         AND x.relation_id=l.tool_capability_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose)) OR
     EXISTS (SELECT 1 FROM public.tool_task_fit_claims l WHERE l.fit_id=v_fit AND NOT EXISTS
       (SELECT 1 FROM perplexity_admin_links x WHERE x.kind='fit' AND x.relation_id=l.fit_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose)) THEN
    RAISE EXCEPTION 'Unexpected existing Perplexity evidence links';
  END IF;
  SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit) INTO v_count;
  IF v_count=23 THEN
    IF v_decision_status<>'reviewed' OR v_fit_status<>'reviewed' OR
       NOT EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE id=v_profile AND profile_status='ready') OR
       (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='reviewed')<>2 THEN
      RAISE EXCEPTION 'Linked Perplexity graph is not fully reviewed';
    END IF;
    RETURN jsonb_build_object('decisionLinks',6,'capabilityLinks',10,'fitLinks',7,'status','reviewed','unchanged',true);
  ELSIF v_count<>0 OR v_decision_status<>'draft' OR v_fit_status<>'draft' OR v_capability_statuses<>2 THEN
    RAISE EXCEPTION 'Existing Perplexity links or graph state are partial';
  END IF;

  UPDATE public.product_intelligence_profiles SET profile_status='ready',
    last_verified_at=v_now,next_review_at=v_due WHERE id=v_profile AND profile_status='pending';
  UPDATE public.tool_decision_profiles SET editorial_status='reviewed',reviewed_at=v_now,
    review_due_at=v_due,reviewed_by=p_reviewer WHERE tool_id=v_tool AND editorial_status='draft';
  UPDATE public.tool_capabilities SET status='reviewed',reviewed_at=v_now,review_due_at=v_due,
    reviewed_by=p_reviewer,last_edited_by=p_reviewer WHERE tool_id=v_tool AND status='draft'
      AND id IN ('d0186230-0000-4000-8000-000000000201','d0186230-0000-4000-8000-000000000202');
  UPDATE public.tool_task_fits SET status='reviewed',reviewed_at=v_now,review_due_at=v_due,
    reviewed_by=p_reviewer,last_edited_by=p_reviewer WHERE id=v_fit AND status='draft';
  INSERT INTO public.tool_decision_profile_claims(tool_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM perplexity_admin_links WHERE kind='decision';
  INSERT INTO public.tool_capability_claims(tool_capability_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM perplexity_admin_links WHERE kind='capability';
  INSERT INTO public.tool_task_fit_claims(fit_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM perplexity_admin_links WHERE kind='fit';
  SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit) INTO v_count;
  IF v_count<>23 THEN RAISE EXCEPTION 'Exact Perplexity links were not established'; END IF;
  INSERT INTO public.admin_evidence_review_audit(profile_id,action,reviewer_id,review_due_at,note)
    VALUES(v_profile,'link',p_reviewer,v_due,'Perplexity Stage 2 exact 6/10/7 draft graph links');
  RETURN jsonb_build_object('decisionLinks',6,'capabilityLinks',10,'fitLinks',7,'status','reviewed');
END $$;
REVOKE ALL ON FUNCTION public.admin_link_perplexity_stage2_evidence(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_link_perplexity_stage2_evidence(uuid) TO service_role;

-- Owner SQL Editor only. Default transaction is a preflight: inspect notices, then ROLLBACK.
-- After a fresh preflight, change only the final ROLLBACK to COMMIT to retain candidates.
-- This creates no verified claim, evidence link, published relation, or Task Page.
BEGIN;
SET LOCAL statement_timeout = '30s';
DO $stage2$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_task CONSTANT uuid := '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'c7890701-0000-4000-8000-000000000301';
  v_discovery CONSTANT uuid := '50288b6e-a968-4bcf-9e55-911df203e0c7';
  v_citation CONSTANT uuid := '04930ae8-4c78-487f-a6c9-25680b8da681';
  v_now timestamptz := clock_timestamp();
  v_row record;
  v_count integer;
  v_state jsonb;
  v_post_md5 text;
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
  PERFORM pg_advisory_xact_lock(hashtext('gemini-notebook-stage2-candidate'));
  IF (SELECT count(*) FROM public.decision_tasks WHERE id=v_task AND slug='research-with-citations' AND status='active') <> 1
     OR (SELECT count(*) FROM public.decision_capabilities WHERE
       (id=v_discovery AND slug='research-discovery' AND status='active') OR
       (id=v_citation AND slug='citation-traceability' AND status='active')) <> 2 THEN
    RAISE EXCEPTION 'Fixed Task/Capability identities or status changed';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool) NOT IN (0,1)
     OR EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool AND id<>v_profile)
     OR EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status<>'draft')
     OR EXISTS (SELECT 1 FROM public.tool_capabilities WHERE tool_id=v_tool AND id NOT IN
       ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000202'::uuid))
     OR EXISTS (SELECT 1 FROM public.tool_task_fits WHERE tool_id=v_tool AND id<>v_fit) THEN
    RAISE EXCEPTION 'Notebook old state is not empty or exact candidate; HOLD';
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
  VALUES (v_profile,'tool',v_tool,'notebook.google.com','Gemini Notebook','pending',
    '2026-12-15T00:00:00Z',
    '{"stage2Batch":"gemini-notebook-20261001","identity":{"formerName":"NotebookLM","aliases":["NotebookLM"],"identityChangedAt":"2026-07-16","sourceUrl":"https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/"}}')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_type='tool' AND owner_id=v_tool
      AND canonical_domain='notebook.google.com' AND product_name='Gemini Notebook' AND profile_status='pending'
      AND next_review_at='2026-12-15T00:00:00Z' AND metadata->>'stage2Batch'='gemini-notebook-20261001') <> 1 THEN
    RAISE EXCEPTION 'Profile postimage differs';
  END IF;

  CREATE TEMP TABLE stage2_source_spec (id uuid PRIMARY KEY, url text UNIQUE, page_type text, label text) ON COMMIT DROP;
  INSERT INTO stage2_source_spec VALUES
    ('c7890701-0000-4000-8000-000000000101','https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/','product','Google Gemini Notebook rename'),
    ('c7890701-0000-4000-8000-000000000102','https://support.google.com/gemininotebook/answer/16164461?hl=en','help','Learn about Gemini Notebook'),
    ('c7890701-0000-4000-8000-000000000103','https://support.google.com/gemininotebook/answer/16215270?hl=en','help','Add or discover sources'),
    ('c7890701-0000-4000-8000-000000000104','https://support.google.com/gemininotebook/answer/16206563?hl=en','help','Create a notebook'),
    ('c7890701-0000-4000-8000-000000000105','https://support.google.com/gemininotebook/answer/16213268?hl=en','help','Upgrade Gemini Notebook'),
    ('c7890701-0000-4000-8000-000000000106','https://support.google.com/gemininotebook/answer/17670842?hl=en','help','Manage usage limits'),
    ('c7890701-0000-4000-8000-000000000107','https://support.google.com/gemininotebook/answer/17004255?hl=en','terms','Gemini Notebook privacy and terms');
  IF EXISTS (SELECT 1 FROM public.product_intelligence_sources s WHERE s.profile_id=v_profile AND NOT EXISTS
      (SELECT 1 FROM stage2_source_spec x WHERE x.id=s.id AND x.url=s.url)) THEN
    RAISE EXCEPTION 'Unknown Notebook source exists';
  END IF;
  INSERT INTO public.product_intelligence_sources
    (id,profile_id,url,canonical_url,page_type,source_type,source_label,publisher_name,fetch_status,metadata)
  SELECT id,v_profile,url,url,page_type,'official',label,'Google','pending',
    '{"stage2Batch":"gemini-notebook-20261001","note":"Candidate URL; fetch and review not attested"}'::jsonb
  FROM stage2_source_spec ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_sources s JOIN stage2_source_spec x ON x.id=s.id
      WHERE s.profile_id=v_profile AND s.url=x.url AND s.canonical_url=x.url AND s.page_type=x.page_type
        AND s.source_type='official' AND s.source_label=x.label AND s.publisher_name='Google'
        AND s.fetch_status='pending' AND s.last_verified_at IS NULL AND s.fetched_at IS NULL
        AND s.metadata->>'stage2Batch'='gemini-notebook-20261001') <> 7 THEN
    RAISE EXCEPTION 'Seven exact pending official sources required';
  END IF;

  CREATE TEMP TABLE stage2_claim_spec (id uuid PRIMARY KEY, source_id uuid, claim_key text UNIQUE,
    claim_type text, claim_value jsonb, validity_scope jsonb) ON COMMIT DROP;
  INSERT INTO stage2_claim_spec VALUES
    ('c7890701-0000-4000-8000-000000000401','c7890701-0000-4000-8000-000000000101','gemini-notebook:research:identity-2026-10','product_identity',
      '{"summary":"NotebookLM was renamed Gemini Notebook on 2026-07-16; it remains the same standalone product."}','{"scope":"product identity"}'),
    ('c7890701-0000-4000-8000-000000000402','c7890701-0000-4000-8000-000000000102','gemini-notebook:research:grounding-2026-10','workflow_feature',
      '{"summary":"Notebook chat answers from selected sources with inline citations; citation accuracy was not independently tested by this site."}','{"surface":"Gemini Notebook chat","excludes":"ordinary Gemini App chat"}'),
    ('c7890701-0000-4000-8000-000000000403','c7890701-0000-4000-8000-000000000103','gemini-notebook:research:discovery-2026-10','workflow_feature',
      '{"summary":"Web and Drive sources can be discovered and selected for import; discovery is not an exhaustive systematic search."}','{"surface":"supported Web and Drive discovery","conditions":["account","region","source access"]}'),
    ('c7890701-0000-4000-8000-000000000404','c7890701-0000-4000-8000-000000000103','gemini-notebook:research:import-loss-2026-10','workflow_limit',
      '{"summary":"Web imports extract HTML text, YouTube imports use captions, Google file footnotes and comments are omitted, and audio imports use transcripts."}','{"scope":"respective source types","requires":"check original against imported content"}'),
    ('c7890701-0000-4000-8000-000000000405','c7890701-0000-4000-8000-000000000104','gemini-notebook:research:notebook-boundary-2026-10','workflow_limit',
      '{"summary":"Notebook content is scoped to each notebook; simultaneous retrieval across notebooks is unavailable."}','{"surface":"notebook chat"}'),
    ('c7890701-0000-4000-8000-000000000406','c7890701-0000-4000-8000-000000000104','gemini-notebook:research:sharing-export-2026-10','workflow_limit',
      '{"summary":"Viewer and Editor sharing and Docs or Sheets export have separate access boundaries; exported files do not inherit notebook permissions."}','{"surface":"Web sharing and export","conditions":["account permissions"]}'),
    ('c7890701-0000-4000-8000-000000000407','c7890701-0000-4000-8000-000000000105','gemini-notebook:research:plans-2026-10','plan_limit',
      '{"summary":"Standard, Plus, Pro and Ultra have different limits; feature access also depends on account, age, region and Workspace administration."}','{"scope":"current plan and account eligibility","requires":"recheck at review date"}'),
    ('c7890701-0000-4000-8000-000000000408','c7890701-0000-4000-8000-000000000106','gemini-notebook:research:compute-limits-2026-10','plan_limit',
      '{"summary":"Additional five-hour and weekly compute limits may apply; daily chat counts alone do not describe usage limits."}','{"scope":"usage policy from September 2026","requires":"recheck by plan"}'),
    ('c7890701-0000-4000-8000-000000000409','c7890701-0000-4000-8000-000000000107','gemini-notebook:research:data-handling-2026-10','privacy_limit',
      '{"summary":"Notebook content is not used to directly train foundational models unless feedback is provided; shared data in other Google services follows their separate notices."}','{"scope":"general account notice and cross-service sharing","excludes":"qualified Workspace and Education terms"}'),
    ('c7890701-0000-4000-8000-000000000410','c7890701-0000-4000-8000-000000000102','gemini-notebook:research:workspace-privacy-2026-10','privacy_limit',
      '{"summary":"Eligible Workspace and Workspace for Education uploads, queries and answers are not human-reviewed or used to train AI models."}','{"scope":"qualified Workspace and Education accounts only"}');
  IF EXISTS (SELECT 1 FROM public.product_intelligence_claims c WHERE c.profile_id=v_profile AND NOT EXISTS
      (SELECT 1 FROM stage2_claim_spec x WHERE x.id=c.id AND x.claim_key=c.claim_key)) THEN
    RAISE EXCEPTION 'Unknown Notebook claim exists';
  END IF;
  INSERT INTO public.product_intelligence_claims
    (id,profile_id,claim_type,claim_key,claim_value,source_id,source_url,source_type,
     confidence,conflict_status,verification_status,validity_scope,metadata)
  SELECT x.id,v_profile,x.claim_type,x.claim_key,x.claim_value,x.source_id,s.url,'official',50,'none',
    'candidate',x.validity_scope,'{"stage2Batch":"gemini-notebook-20261001","siteCitationAccuracyTested":false}'::jsonb
  FROM stage2_claim_spec x JOIN stage2_source_spec s ON s.id=x.source_id ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.product_intelligence_claims c JOIN stage2_claim_spec x ON x.id=c.id
      JOIN stage2_source_spec s ON s.id=x.source_id
      WHERE c.profile_id=v_profile AND c.claim_type=x.claim_type AND c.claim_key=x.claim_key
        AND c.claim_value=x.claim_value AND c.source_id=x.source_id AND c.source_url=s.url
        AND c.source_type='official' AND c.verification_status='candidate' AND c.source_excerpt IS NULL
        AND c.verified_at IS NULL AND c.verified_by IS NULL AND c.review_due_at IS NULL
        AND c.conflict_status='none' AND c.invalidated_at IS NULL AND c.validity_scope=x.validity_scope
        AND c.metadata->>'stage2Batch'='gemini-notebook-20261001') <> 10 THEN
    RAISE EXCEPTION 'Ten exact candidate claims required';
  END IF;

  INSERT INTO public.tool_decision_profiles
    (tool_id,setup_complexity,data_training_use,self_host_level,export_level,decision_summary,watch_outs,editorial_status)
  VALUES (v_tool,'unknown','unknown','no','limited',
    '{"en":"Suitable for synthesis within a selected source set with traceable citations. Discovery and import do not constitute exhaustive search; verify important citations against the originals.","cn":"适于对已选资料集进行可回查综合。发现与导入不等于穷尽检索；重要引文须打开原文核对。"}',
    '[{"en":"Imports can omit media, captions, footnotes, comments or inaccessible pages; account, plan, region, compute, cross-service and Workspace privacy boundaries vary. Citation accuracy has not been independently tested by this site.","cn":"导入可能丢失媒体、字幕外内容、脚注、评论或无权限页面；账号、套餐、地区、计算量、跨服务和 Workspace 隐私边界不同。本站尚未独立实测引文准确性。"}]','draft')
  ON CONFLICT (tool_id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND setup_complexity='unknown'
      AND data_training_use='unknown' AND self_host_level='no' AND export_level='limited'
      AND editorial_status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL
      AND decision_summary='{"en":"Suitable for synthesis within a selected source set with traceable citations. Discovery and import do not constitute exhaustive search; verify important citations against the originals.","cn":"适于对已选资料集进行可回查综合。发现与导入不等于穷尽检索；重要引文须打开原文核对。"}'::jsonb
      AND watch_outs='[{"en":"Imports can omit media, captions, footnotes, comments or inaccessible pages; account, plan, region, compute, cross-service and Workspace privacy boundaries vary. Citation accuracy has not been independently tested by this site.","cn":"导入可能丢失媒体、字幕外内容、脚注、评论或无权限页面；账号、套餐、地区、计算量、跨服务和 Workspace 隐私边界不同。本站尚未独立实测引文准确性。"}]'::jsonb) <> 1 THEN
    RAISE EXCEPTION 'Decision profile postimage differs';
  END IF;

  INSERT INTO public.tool_capabilities
    (id,tool_id,capability_id,support_level,availability,plan_requirement,limitations,status)
  VALUES
    ('c7890701-0000-4000-8000-000000000201',v_tool,v_discovery,'partial','unknown',
     '{"en":"Web, Drive and Deep Research availability depends on account, age, region and plan; verify the intended workflow.","cn":"Web、Drive 和 Deep Research 可用性受账号、年龄、地区及套餐影响；须核对预期流程。"}',
     '[{"en":"User-selected import and notebook scope do not provide exhaustive or reproducible literature search.","cn":"用户选择导入及单 notebook 范围不能提供穷尽、可复现的文献检索。"}]','draft'),
    ('c7890701-0000-4000-8000-000000000202',v_tool,v_citation,'strong','all_plans',
     '{"en":"Basic inline citations in notebook chat only; feature and plan details still require account checks.","cn":"仅指 notebook chat 的基础行内引用；具体功能与套餐仍须按账号核对。"}',
     '[{"en":"Citations are review paths, not proof of answer accuracy; imported content can lose context and this site has not run a controlled accuracy test.","cn":"引用是回查路径而非答案准确性的证明；导入内容可能损失语境，本站未做受控准确性实测。"}]','draft')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='draft'
      AND reviewed_by IS NULL AND reviewed_at IS NULL AND
      ((id='c7890701-0000-4000-8000-000000000201' AND capability_id=v_discovery AND support_level='partial' AND availability='unknown'
        AND plan_requirement='{"en":"Web, Drive and Deep Research availability depends on account, age, region and plan; verify the intended workflow.","cn":"Web、Drive 和 Deep Research 可用性受账号、年龄、地区及套餐影响；须核对预期流程。"}'::jsonb
        AND limitations='[{"en":"User-selected import and notebook scope do not provide exhaustive or reproducible literature search.","cn":"用户选择导入及单 notebook 范围不能提供穷尽、可复现的文献检索。"}]'::jsonb) OR
       (id='c7890701-0000-4000-8000-000000000202' AND capability_id=v_citation AND support_level='strong' AND availability='all_plans'
        AND plan_requirement='{"en":"Basic inline citations in notebook chat only; feature and plan details still require account checks.","cn":"仅指 notebook chat 的基础行内引用；具体功能与套餐仍须按账号核对。"}'::jsonb
        AND limitations='[{"en":"Citations are review paths, not proof of answer accuracy; imported content can lose context and this site has not run a controlled accuracy test.","cn":"引用是回查路径而非答案准确性的证明；导入内容可能损失语境，本站未做受控准确性实测。"}]'::jsonb))) <> 2 THEN
    RAISE EXCEPTION 'Two exact draft Tool Capabilities required';
  END IF;
  INSERT INTO public.tool_task_fits
    (id,tool_id,task_id,fit_level,rationale,required_conditions,disqualifiers,status)
  VALUES (v_fit,v_tool,v_task,'conditional',
    '{"en":"Works for source-grounded synthesis when users select a bounded source set and inspect each important citation.","cn":"用户选定有限资料集并逐条核查重要引用时，适于资料锚定的综合。"}',
    '[{"en":"Accept Google hosting, account and region limits; inspect imported sources and cited passages.","cn":"接受 Google 托管、账号和地区限制；核查导入资料和引文段落。"}]',
    '[{"en":"Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.","cn":"要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。"}]','draft')
  ON CONFLICT (id) DO NOTHING;
  IF (SELECT count(*) FROM public.tool_task_fits WHERE id=v_fit AND tool_id=v_tool AND task_id=v_task
      AND fit_level='conditional' AND status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL
      AND rationale='{"en":"Works for source-grounded synthesis when users select a bounded source set and inspect each important citation.","cn":"用户选定有限资料集并逐条核查重要引用时，适于资料锚定的综合。"}'::jsonb
      AND required_conditions='[{"en":"Accept Google hosting, account and region limits; inspect imported sources and cited passages.","cn":"接受 Google 托管、账号和地区限制；核查导入资料和引文段落。"}]'::jsonb
      AND disqualifiers='[{"en":"Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.","cn":"要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。"}]'::jsonb) <> 1 THEN
    RAISE EXCEPTION 'Draft Fit postimage differs';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile)<>7 OR
     (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile)<>10 OR
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
  RAISE NOTICE 'POST_MD5 %',v_post_md5;
  RAISE NOTICE 'POSTIMAGE candidate: profile=1 sources=7 claims=10 decision=1 tool_capabilities=2 fit=1 links=0; no publish';
END
$stage2$;
ROLLBACK;

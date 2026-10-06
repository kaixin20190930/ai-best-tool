-- One-time transactional repair for the pre-reviewed Gemini Notebook Fit.
-- All evidence/source/relationship checks and the unique Fit update run in the
-- same database transaction as this SECURITY DEFINER RPC invocation.
CREATE OR REPLACE FUNCTION public.admin_apply_gemini_notebook_fit_rationale(p_reviewer uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_task CONSTANT uuid := '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'c7890701-0000-4000-8000-000000000301';
  v_now timestamptz := clock_timestamp();
  v_due timestamptz := clock_timestamp() + interval '90 days';
  v_fit_row public.tool_task_fits%ROWTYPE;
  v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' OR p_reviewer IS NULL OR NOT EXISTS
    (SELECT 1 FROM auth.users WHERE id = p_reviewer) THEN
    RAISE EXCEPTION 'service_role and real reviewer required' USING ERRCODE = '42501';
  END IF;

  IF (SELECT count(*) FROM pg_class WHERE oid IN
    ('public.product_intelligence_profiles'::regclass,
     'public.product_intelligence_sources'::regclass,
     'public.product_intelligence_claims'::regclass,
     'public.tool_decision_profiles'::regclass,
     'public.tool_capabilities'::regclass,
     'public.tool_task_fits'::regclass,
     'public.tool_decision_profile_claims'::regclass,
     'public.tool_capability_claims'::regclass,
     'public.tool_task_fit_claims'::regclass) AND relrowsecurity) <> 9 THEN
    RAISE EXCEPTION 'Gemini Fit rationale recovery requires RLS on all nine evidence tables'
      USING ERRCODE = '23514';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('gemini-notebook-fit-rationale-recovery'));

  -- SHARE ROW EXCLUSIVE blocks concurrent inserts/updates/deletes, including
  -- phantoms that row locks alone cannot protect, through validation and write.
  LOCK TABLE public.product_intelligence_profiles,
    public.product_intelligence_sources,
    public.product_intelligence_claims,
    public.tool_decision_profiles,
    public.tool_capabilities,
    public.tool_task_fits,
    public.tool_decision_profile_claims,
    public.tool_capability_claims,
    public.tool_task_fit_claims
    IN SHARE ROW EXCLUSIVE MODE;

  PERFORM 1 FROM public.product_intelligence_profiles
    WHERE id = v_profile FOR UPDATE;
  IF (SELECT count(*) FROM public.product_intelligence_profiles
      WHERE id = v_profile AND owner_type = 'tool' AND owner_id = v_tool
        AND profile_status = 'ready' AND next_review_at > v_now) <> 1 OR
     (SELECT count(*) FROM public.product_intelligence_profiles
      WHERE owner_type = 'tool' AND owner_id = v_tool) <> 1 THEN
    RAISE EXCEPTION 'Gemini Notebook profile identity or current review window drifted'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.product_intelligence_sources
    WHERE profile_id = v_profile ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id = v_profile) <> 7 OR
     EXISTS (
       WITH expected(id, url) AS (VALUES
         ('c7890701-0000-4000-8000-000000000101'::uuid,'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'),
         ('c7890701-0000-4000-8000-000000000102'::uuid,'https://support.google.com/gemininotebook/answer/16164461'),
         ('c7890701-0000-4000-8000-000000000103'::uuid,'https://support.google.com/gemininotebook/answer/16215270?hl=en'),
         ('c7890701-0000-4000-8000-000000000104'::uuid,'https://support.google.com/gemininotebook/answer/16206563?hl=en'),
         ('c7890701-0000-4000-8000-000000000105'::uuid,'https://support.google.com/gemininotebook/answer/16213268?hl=en'),
         ('c7890701-0000-4000-8000-000000000106'::uuid,'https://support.google.com/gemininotebook/answer/17670842?hl=en'),
         ('c7890701-0000-4000-8000-000000000107'::uuid,'https://support.google.com/gemininotebook/answer/17004255?hl=en')
       )
       SELECT 1 FROM expected e LEFT JOIN public.product_intelligence_sources s
         ON s.id = e.id AND s.profile_id = v_profile AND s.url = e.url
          AND s.source_type = 'official' AND s.fetch_status = 'success'
          AND s.last_verified_at IS NOT NULL AND s.last_verified_at <= v_now
       WHERE s.id IS NULL
     ) OR EXISTS (
       SELECT 1 FROM public.product_intelligence_sources s
       WHERE s.profile_id = v_profile AND NOT EXISTS (
         SELECT 1 FROM (VALUES
           ('c7890701-0000-4000-8000-000000000101'::uuid,'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'),
           ('c7890701-0000-4000-8000-000000000102'::uuid,'https://support.google.com/gemininotebook/answer/16164461'),
           ('c7890701-0000-4000-8000-000000000103'::uuid,'https://support.google.com/gemininotebook/answer/16215270?hl=en'),
           ('c7890701-0000-4000-8000-000000000104'::uuid,'https://support.google.com/gemininotebook/answer/16206563?hl=en'),
           ('c7890701-0000-4000-8000-000000000105'::uuid,'https://support.google.com/gemininotebook/answer/16213268?hl=en'),
           ('c7890701-0000-4000-8000-000000000106'::uuid,'https://support.google.com/gemininotebook/answer/17670842?hl=en'),
           ('c7890701-0000-4000-8000-000000000107'::uuid,'https://support.google.com/gemininotebook/answer/17004255?hl=en')
         ) e(id,url) WHERE e.id = s.id AND e.url = s.url
       )
     ) THEN
    RAISE EXCEPTION 'Seven exact current Google official Gemini sources are required'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.product_intelligence_claims
    WHERE profile_id = v_profile ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id = v_profile) <> 10 OR
     EXISTS (
       WITH expected(id, source_id, claim_key, url) AS (VALUES
         ('c7890701-0000-4000-8000-000000000401'::uuid,'c7890701-0000-4000-8000-000000000101'::uuid,'gemini-notebook:research:identity-2026-10','https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'),
         ('c7890701-0000-4000-8000-000000000402'::uuid,'c7890701-0000-4000-8000-000000000102'::uuid,'gemini-notebook:research:grounding-2026-10','https://support.google.com/gemininotebook/answer/16164461'),
         ('c7890701-0000-4000-8000-000000000403'::uuid,'c7890701-0000-4000-8000-000000000103'::uuid,'gemini-notebook:research:discovery-2026-10','https://support.google.com/gemininotebook/answer/16215270?hl=en'),
         ('c7890701-0000-4000-8000-000000000404'::uuid,'c7890701-0000-4000-8000-000000000103'::uuid,'gemini-notebook:research:import-loss-2026-10','https://support.google.com/gemininotebook/answer/16215270?hl=en'),
         ('c7890701-0000-4000-8000-000000000405'::uuid,'c7890701-0000-4000-8000-000000000104'::uuid,'gemini-notebook:research:notebook-boundary-2026-10','https://support.google.com/gemininotebook/answer/16206563?hl=en'),
         ('c7890701-0000-4000-8000-000000000406'::uuid,'c7890701-0000-4000-8000-000000000104'::uuid,'gemini-notebook:research:sharing-export-2026-10','https://support.google.com/gemininotebook/answer/16206563?hl=en'),
         ('c7890701-0000-4000-8000-000000000407'::uuid,'c7890701-0000-4000-8000-000000000105'::uuid,'gemini-notebook:research:plans-2026-10','https://support.google.com/gemininotebook/answer/16213268?hl=en'),
         ('c7890701-0000-4000-8000-000000000408'::uuid,'c7890701-0000-4000-8000-000000000106'::uuid,'gemini-notebook:research:compute-limits-2026-10','https://support.google.com/gemininotebook/answer/17670842?hl=en'),
         ('c7890701-0000-4000-8000-000000000409'::uuid,'c7890701-0000-4000-8000-000000000107'::uuid,'gemini-notebook:research:data-handling-2026-10','https://support.google.com/gemininotebook/answer/17004255?hl=en'),
         ('c7890701-0000-4000-8000-000000000410'::uuid,'c7890701-0000-4000-8000-000000000102'::uuid,'gemini-notebook:research:workspace-privacy-2026-10','https://support.google.com/gemininotebook/answer/16164461')
       )
       SELECT 1 FROM expected e LEFT JOIN public.product_intelligence_claims c
         ON c.id = e.id AND c.profile_id = v_profile AND c.source_id = e.source_id
          AND c.claim_key = e.claim_key AND c.source_url = e.url AND c.source_type = 'official'
          AND c.verification_status = 'verified' AND c.conflict_status = 'none'
          AND c.invalidated_at IS NULL AND c.verified_by IS NOT NULL
          AND c.verified_at IS NOT NULL AND c.verified_at <= v_now
          AND c.review_due_at > v_now AND (c.expires_at IS NULL OR c.expires_at > v_now)
       WHERE c.id IS NULL
     ) OR EXISTS (
       SELECT 1 FROM public.product_intelligence_claims c
       WHERE c.profile_id = v_profile AND c.id NOT IN (
         'c7890701-0000-4000-8000-000000000401','c7890701-0000-4000-8000-000000000402',
         'c7890701-0000-4000-8000-000000000403','c7890701-0000-4000-8000-000000000404',
         'c7890701-0000-4000-8000-000000000405','c7890701-0000-4000-8000-000000000406',
         'c7890701-0000-4000-8000-000000000407','c7890701-0000-4000-8000-000000000408',
         'c7890701-0000-4000-8000-000000000409','c7890701-0000-4000-8000-000000000410'
       )
     ) THEN
    RAISE EXCEPTION 'Ten exact current verified Gemini official claims are required'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.tool_decision_profiles
    WHERE tool_id = v_tool FOR UPDATE;
  IF (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id = v_tool
      AND editorial_status = 'reviewed' AND reviewed_by IS NOT NULL
      AND reviewed_at IS NOT NULL AND reviewed_at <= v_now AND review_due_at > v_now) <> 1 OR
     (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id = v_tool) <> 1 THEN
    RAISE EXCEPTION 'Gemini Notebook Decision is not uniquely and currently reviewed'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.tool_capabilities
    WHERE tool_id = v_tool ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM public.tool_capabilities WHERE tool_id = v_tool) <> 2 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id = v_tool
       AND id IN ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202')
       AND status = 'reviewed' AND reviewed_by IS NOT NULL
       AND reviewed_at IS NOT NULL AND reviewed_at <= v_now AND review_due_at > v_now) <> 2 THEN
    RAISE EXCEPTION 'Both exact Gemini Notebook Tool Capabilities must be currently reviewed'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.tool_task_fits
    WHERE tool_id = v_tool ORDER BY id FOR UPDATE;
  SELECT * INTO v_fit_row FROM public.tool_task_fits
    WHERE id = v_fit AND task_id = v_task AND tool_id = v_tool;
  IF NOT FOUND OR (SELECT count(*) FROM public.tool_task_fits WHERE tool_id = v_tool) <> 1 THEN
    RAISE EXCEPTION 'Gemini Notebook must have exactly the expected Fit'
      USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM public.tool_decision_profile_claims WHERE tool_id = v_tool FOR UPDATE;
  PERFORM 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities c
    ON c.id = l.tool_capability_id WHERE c.tool_id = v_tool FOR UPDATE OF l;
  PERFORM 1 FROM public.tool_task_fit_claims WHERE fit_id = v_fit FOR UPDATE;

  IF (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id = v_tool) <> 5 OR
     EXISTS (SELECT 1 FROM public.tool_decision_profile_claims l WHERE l.tool_id = v_tool AND
       (l.claim_id, l.purpose) NOT IN (
         ('c7890701-0000-4000-8000-000000000402'::uuid,'fit'),
         ('c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000406'::uuid,'export'),
         ('c7890701-0000-4000-8000-000000000407'::uuid,'cost'),
         ('c7890701-0000-4000-8000-000000000409'::uuid,'privacy')
       )) OR
     (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities c
       ON c.id = l.tool_capability_id WHERE c.tool_id = v_tool) <> 10 OR
     EXISTS (SELECT 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities c
       ON c.id = l.tool_capability_id WHERE c.tool_id = v_tool AND
       (l.tool_capability_id, l.claim_id, l.purpose) NOT IN (
         ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000403'::uuid,'support'),
         ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'availability'),
         ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000408'::uuid,'plan'),
         ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000405'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000402'::uuid,'support'),
         ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'availability'),
         ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'plan'),
         ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000405'::uuid,'limitation')
       )) OR
     (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id = v_fit) <> 6 OR
     EXISTS (SELECT 1 FROM public.tool_task_fit_claims WHERE fit_id = v_fit AND
       (claim_id, purpose) NOT IN (
         ('c7890701-0000-4000-8000-000000000402'::uuid,'fit'),
         ('c7890701-0000-4000-8000-000000000403'::uuid,'fit'),
         ('c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000405'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000409'::uuid,'privacy'),
         ('c7890701-0000-4000-8000-000000000410'::uuid,'privacy')
       )) THEN
    RAISE EXCEPTION 'Gemini Notebook evidence relationships must exactly match 5/10/6'
      USING ERRCODE = '23514';
  END IF;

  IF v_fit_row.status = 'reviewed' AND
     v_fit_row.rationale = '{"en":"Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.","cn":"用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。"}'::jsonb AND
     v_fit_row.reviewed_by IS NOT NULL AND v_fit_row.reviewed_at IS NOT NULL AND
     v_fit_row.reviewed_at <= v_now AND v_fit_row.review_due_at > v_now THEN
    RETURN jsonb_build_object('status', 'unchanged', 'fitId', v_fit);
  END IF;

  IF v_fit_row.status <> 'draft' OR v_fit_row.fit_level <> 'conditional' OR
     v_fit_row.rationale IS DISTINCT FROM '{"en":"Works for source-grounded synthesis when users select a bounded source set and inspect each important citation.","cn":"用户选定有限资料集并逐条核查重要引用时，适于资料锚定的综合。"}'::jsonb OR
     v_fit_row.required_conditions IS DISTINCT FROM '[{"en":"Accept Google hosting, account and region limits; inspect imported sources and cited passages.","cn":"接受 Google 托管、账号和地区限制；核查导入资料和引文段落。"}]'::jsonb OR
     v_fit_row.disqualifiers IS DISTINCT FROM '[{"en":"Requires exhaustive reproducible literature search, simultaneous cross-notebook coverage, or unreviewed high-stakes conclusions.","cn":"要求穷尽可复现文献检索、同时覆盖多个 notebook，或未经复核的高风险结论。"}]'::jsonb OR
     NOT (
       (v_fit_row.reviewed_by IS NULL AND v_fit_row.reviewed_at IS NULL AND
        v_fit_row.review_due_at IS NULL AND v_fit_row.last_edited_by IS NULL) OR
       (v_fit_row.reviewed_by IS NOT NULL AND EXISTS
          (SELECT 1 FROM auth.users WHERE id = v_fit_row.reviewed_by) AND
        v_fit_row.reviewed_at IS NOT NULL AND v_fit_row.reviewed_at <= v_now AND
        v_fit_row.review_due_at IS NOT NULL AND v_fit_row.review_due_at > v_now AND
        v_fit_row.last_edited_by IS NOT NULL AND EXISTS
          (SELECT 1 FROM auth.users WHERE id = v_fit_row.last_edited_by))
     ) OR
     v_fit_row.updated_at IS NULL THEN
    RAISE EXCEPTION 'Gemini Fit is not the exact approved draft preimage or reviewed target'
      USING ERRCODE = '23514';
  END IF;

  UPDATE public.tool_task_fits SET
    status = 'reviewed',
    rationale = '{"en":"Use Gemini Notebook to synthesize sources the user selects or supplies and imports into a notebook; it can discover some Web or Drive sources for selection, but it is not open-web search.","cn":"用于综合用户选择/提供并导入 notebook 的资料；也可发现部分网页或云端硬盘来源供选择，不等同于开放网页检索。"}'::jsonb,
    reviewed_at = v_now,
    review_due_at = v_due,
    reviewed_by = p_reviewer,
    last_edited_by = p_reviewer
  WHERE id = v_fit AND task_id = v_task AND tool_id = v_tool
    AND status = 'draft' AND updated_at = v_fit_row.updated_at;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Gemini Fit changed during recovery; retry after reload'
      USING ERRCODE = '40001';
  END IF;

  RETURN jsonb_build_object('status', 'reviewed', 'fitId', v_fit);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_apply_gemini_notebook_fit_rationale(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_apply_gemini_notebook_fit_rationale(uuid) TO service_role;

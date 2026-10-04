-- Repair the one missing current plan-purpose evidence link through Admin.
CREATE OR REPLACE FUNCTION public.admin_complete_gemini_notebook_plan_link(p_reviewer uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_capability CONSTANT uuid := 'c7890701-0000-4000-8000-000000000202';
  v_claim CONSTANT uuid := 'c7890701-0000-4000-8000-000000000407';
  v_now timestamptz := clock_timestamp();
  v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' OR p_reviewer IS NULL OR
     NOT EXISTS (SELECT 1 FROM auth.users WHERE id=p_reviewer) THEN
    RAISE EXCEPTION 'service_role and real reviewer required' USING ERRCODE='42501';
  END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
    ('public.product_intelligence_profiles'::regclass,'public.product_intelligence_sources'::regclass,
     'public.product_intelligence_claims'::regclass,'public.tool_decision_profiles'::regclass,
     'public.tool_capabilities'::regclass,'public.tool_task_fits'::regclass,
     'public.tool_decision_profile_claims'::regclass,'public.tool_capability_claims'::regclass,
     'public.tool_task_fit_claims'::regclass,'public.admin_evidence_review_audit'::regclass)
     AND relrowsecurity)<>10 THEN
    RAISE EXCEPTION 'Gemini evidence-link repair requires RLS' USING ERRCODE='23514';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('gemini-notebook-plan-link-repair'));
  IF NOT EXISTS (SELECT 1 FROM public.product_intelligence_profiles p WHERE p.id=v_profile
      AND p.owner_type='tool' AND p.owner_id=v_tool AND p.profile_status='ready'
      AND p.next_review_at>v_now) THEN
    RAISE EXCEPTION 'Gemini profile owner or review window mismatch' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_intelligence_sources s
      WHERE s.id='c7890701-0000-4000-8000-000000000105' AND s.profile_id=v_profile
        AND s.url='https://support.google.com/gemininotebook/answer/16213268?hl=en'
        AND s.source_type='official' AND s.fetch_status='success' AND s.last_verified_at<=v_now) THEN
    RAISE EXCEPTION 'Gemini official plan source is not current' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_intelligence_claims c JOIN public.product_intelligence_sources s
      ON s.id=c.source_id AND s.profile_id=c.profile_id AND s.url=c.source_url
      WHERE c.id=v_claim AND c.profile_id=v_profile AND c.claim_key='gemini-notebook:research:plans-2026-10'
        AND c.source_id=s.id AND c.source_type='official' AND s.source_type='official' AND s.fetch_status='success'
        AND c.verification_status='verified' AND c.conflict_status='none' AND c.invalidated_at IS NULL
        AND c.verified_by IS NOT NULL AND c.verified_at<=v_now AND c.review_due_at>v_now
        AND (c.expires_at IS NULL OR c.expires_at>v_now)) THEN
    RAISE EXCEPTION 'Gemini plan claim is not verified, current, and same-owner' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tool_decision_profiles d WHERE d.tool_id=v_tool
        AND d.editorial_status='reviewed' AND d.reviewed_by IS NOT NULL AND d.reviewed_at<=v_now
        AND d.review_due_at>v_now) OR
     (SELECT count(*) FROM public.tool_capabilities c WHERE c.tool_id=v_tool AND c.status='reviewed'
        AND c.reviewed_by IS NOT NULL AND c.reviewed_at<=v_now AND c.review_due_at>v_now
        AND c.id IN ('c7890701-0000-4000-8000-000000000201',v_capability))<>2 THEN
    RAISE EXCEPTION 'Gemini Decision or Tool Capabilities are not currently reviewed' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tool_task_fits f WHERE f.id='c7890701-0000-4000-8000-000000000301'
        AND f.tool_id=v_tool AND f.task_id='527fe8b7-c171-4c50-ab1f-9404d7536e7c'
        AND f.status='reviewed' AND f.reviewed_by IS NOT NULL AND f.reviewed_at<=v_now AND f.review_due_at>v_now) THEN
    RAISE EXCEPTION 'Gemini Fit is not currently reviewed' USING ERRCODE='23514';
  END IF;

  SELECT count(*) INTO v_count FROM public.tool_decision_profile_claims WHERE tool_id=v_tool;
  IF v_count<>5 OR (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id='c7890701-0000-4000-8000-000000000301')<>6 OR
     EXISTS (SELECT 1 FROM public.tool_decision_profile_claims l WHERE l.tool_id=v_tool AND NOT EXISTS
       (SELECT 1 FROM (VALUES
         ('c7890701-0000-4000-8000-000000000402'::uuid,'fit'),('c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
         ('c7890701-0000-4000-8000-000000000407'::uuid,'cost'),('c7890701-0000-4000-8000-000000000409'::uuid,'privacy'),
         ('c7890701-0000-4000-8000-000000000406'::uuid,'export')) x(claim_id,purpose)
        WHERE x.claim_id=l.claim_id AND x.purpose=l.purpose)) OR
     EXISTS (SELECT 1 FROM public.tool_task_fit_claims l WHERE l.fit_id='c7890701-0000-4000-8000-000000000301'
       AND l.purpose NOT IN ('fit','limitation','privacy')) THEN
    RAISE EXCEPTION 'Gemini Decision/Fit relation set drifted' USING ERRCODE='23514';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities c ON c.id=l.tool_capability_id
      WHERE c.tool_id=v_tool AND NOT EXISTS (SELECT 1 FROM (VALUES
        ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000403'::uuid,'support'),
        ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'availability'),
        ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000408'::uuid,'plan'),
        ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
        ('c7890701-0000-4000-8000-000000000201'::uuid,'c7890701-0000-4000-8000-000000000405'::uuid,'limitation'),
        ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000402'::uuid,'support'),
        ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'availability'),
        ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000407'::uuid,'plan'),
        ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000404'::uuid,'limitation'),
        ('c7890701-0000-4000-8000-000000000202'::uuid,'c7890701-0000-4000-8000-000000000405'::uuid,'limitation')) x(relation_id,claim_id,purpose)
        WHERE x.relation_id=l.tool_capability_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose)) THEN
    RAISE EXCEPTION 'Gemini Tool Capability evidence is not an exact subset of its reviewed manifest' USING ERRCODE='23514';
  END IF;
  SELECT count(*) INTO v_count FROM public.tool_capability_claims l WHERE l.tool_capability_id=v_capability;
  IF v_count=5 AND (SELECT count(*) FROM public.tool_capability_claims l
       JOIN public.tool_capabilities c ON c.id=l.tool_capability_id WHERE c.tool_id=v_tool)=10 AND
     EXISTS (SELECT 1 FROM public.tool_capability_claims WHERE tool_capability_id=v_capability
       AND claim_id=v_claim AND purpose='plan') THEN
    RETURN jsonb_build_object('status','unchanged','capabilityLinks',10);
  ELSIF v_count<>4 OR EXISTS (SELECT 1 FROM public.tool_capability_claims
      WHERE tool_capability_id=v_capability AND purpose='plan') OR
      (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities c ON c.id=l.tool_capability_id
        WHERE c.tool_id=v_tool)<>9 THEN
    RAISE EXCEPTION 'Gemini citation-traceability Capability must have exactly four current links before repair' USING ERRCODE='23514';
  END IF;
  INSERT INTO public.tool_capability_claims(tool_capability_id,claim_id,purpose) VALUES(v_capability,v_claim,'plan');
  INSERT INTO public.admin_evidence_review_audit(profile_id,action,reviewer_id,review_due_at,note)
    VALUES(v_profile,'link',p_reviewer,(SELECT review_due_at FROM public.product_intelligence_claims WHERE id=v_claim),
      'Gemini Notebook citation-traceability plan-purpose evidence repair');
  RETURN jsonb_build_object('status','linked','capabilityLinks',10,'claimId',v_claim,'purpose','plan');
END $$;
REVOKE ALL ON FUNCTION public.admin_complete_gemini_notebook_plan_link(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_complete_gemini_notebook_plan_link(uuid) TO service_role;

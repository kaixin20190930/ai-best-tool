-- Owner SQL Editor only. Existing committed candidate only; never rerun candidate SQL on production.
-- Exact old full-state hash is the hard gate. A repeated COMMIT safely rejects at that gate.
-- Default ROLLBACK mode previews one source row and two claim rows without persisting writes.
CREATE OR REPLACE FUNCTION pg_temp.gemini_notebook_stage2_source_url_amendment(p_mode text)
RETURNS TABLE(mode text, changed_sources integer, changed_claims integer, post_md5 text)
LANGUAGE plpgsql AS $amend$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_source CONSTANT uuid := 'c7890701-0000-4000-8000-000000000102';
  v_fit CONSTANT uuid := 'c7890701-0000-4000-8000-000000000301';
  v_old_url CONSTANT text := 'https://support.google.com/gemininotebook/answer/16164461?hl=en';
  v_new_url CONSTANT text := 'https://support.google.com/gemininotebook/answer/16164461';
  v_prior_md5 text;
  v_post_md5 text;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('ROLLBACK','COMMIT') THEN
    RAISE EXCEPTION 'Use ROLLBACK for preview or COMMIT for source URL amendment';
  END IF;
  BEGIN
    IF current_user NOT IN ('postgres','supabase_admin','service_role') THEN
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
    LOCK TABLE public.product_intelligence_profiles, public.product_intelligence_sources,
      public.product_intelligence_claims, public.tool_decision_profiles,
      public.tool_capabilities, public.tool_task_fits,
      public.tool_decision_profile_claims, public.tool_capability_claims,
      public.tool_task_fit_claims IN SHARE ROW EXCLUSIVE MODE;
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
    )::text) INTO v_prior_md5;
    IF v_prior_md5 <> '769d65d12796a59bc33dd66117ebbc74' THEN
      RAISE EXCEPTION 'Stage 2 amendment prior stateMd5 drift: expected %, current %',
        '769d65d12796a59bc33dd66117ebbc74',v_prior_md5;
    END IF;
    IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE id=v_profile
        AND owner_type='tool' AND owner_id=v_tool AND profile_status='pending')<>1 OR
       (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile)<>7 OR
       (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile)<>10 OR
       (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool
        AND editorial_status='draft')<>1 OR
       (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool
        AND status='draft')<>2 OR
       (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool AND id=v_fit
        AND status='draft')<>1 THEN
      RAISE EXCEPTION 'Stage 2 amendment requires exact candidate/draft owner and counts';
    END IF;
    IF (SELECT count(*) FROM public.product_intelligence_sources WHERE id=v_source
        AND profile_id=v_profile AND url=v_old_url AND canonical_url=v_old_url
        AND source_type='official' AND fetch_status='pending'
        AND fetched_at IS NULL AND last_verified_at IS NULL)<>1 OR
       (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile
        AND id IN ('c7890701-0000-4000-8000-000000000402',
                   'c7890701-0000-4000-8000-000000000410')
        AND source_id=v_source AND source_url=v_old_url AND source_type='official'
        AND verification_status='candidate' AND source_excerpt IS NULL
        AND verified_at IS NULL AND verified_by IS NULL)<>2 OR
       (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile
        AND verification_status='candidate' AND verified_by IS NULL)<>10 THEN
      RAISE EXCEPTION 'Stage 2 amendment source or claim candidate rows drifted';
    END IF;
    IF (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool
        OR claim_id IN (SELECT id FROM public.product_intelligence_claims WHERE profile_id=v_profile))<>0 OR
       (SELECT count(*) FROM public.tool_capability_claims WHERE
        tool_capability_id IN (SELECT id FROM public.tool_capabilities WHERE tool_id=v_tool)
        OR claim_id IN (SELECT id FROM public.product_intelligence_claims WHERE profile_id=v_profile))<>0 OR
       (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit
        OR claim_id IN (SELECT id FROM public.product_intelligence_claims WHERE profile_id=v_profile))<>0 THEN
      RAISE EXCEPTION 'Stage 2 amendment requires zero links';
    END IF;
    UPDATE public.product_intelligence_sources SET url=v_new_url, canonical_url=v_new_url
      WHERE id=v_source AND profile_id=v_profile AND url=v_old_url AND canonical_url=v_old_url;
    GET DIAGNOSTICS changed_sources = ROW_COUNT;
    UPDATE public.product_intelligence_claims SET source_url=v_new_url
      WHERE profile_id=v_profile AND source_id=v_source AND source_url=v_old_url
        AND id IN ('c7890701-0000-4000-8000-000000000402',
                   'c7890701-0000-4000-8000-000000000410');
    GET DIAGNOSTICS changed_claims = ROW_COUNT;
    IF changed_sources<>1 OR changed_claims<>2 THEN
      RAISE EXCEPTION 'Stage 2 amendment changed row count differs';
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
    post_md5 := v_post_md5;
    mode := CASE WHEN p_mode='ROLLBACK' THEN 'preflight' ELSE 'committed' END;
    IF p_mode='ROLLBACK' THEN
      RAISE EXCEPTION 'stage2_source_url_preflight_rollback' USING ERRCODE='P0001';
    END IF;
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM <> 'stage2_source_url_preflight_rollback' THEN RAISE; END IF;
  END;
  RETURN NEXT;
END
$amend$;
SELECT * FROM pg_temp.gemini_notebook_stage2_source_url_amendment('ROLLBACK');

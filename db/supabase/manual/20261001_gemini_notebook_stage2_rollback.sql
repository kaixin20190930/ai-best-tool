-- Exact rollback of Stage 2 only. Requires the ORIGINAL POST_MD5 notice from the
-- committed candidate or reviewed transaction; never substitute a fresh drifted hash.
-- Default ROLLBACK is a no-write preflight. Neon identity is outside this transaction.
BEGIN;
SET LOCAL statement_timeout = '30s';
SET LOCAL gemini.stage2.expected_post_md5 = 'REPLACE_WITH_ORIGINAL_COMMIT_POST_MD5';
DO $rollback$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'c7890701-0000-4000-8000-000000000301';
  v_expected text := current_setting('gemini.stage2.expected_post_md5');
  v_current_md5 text;
  v_count integer;
BEGIN
  IF current_user NOT IN ('postgres','supabase_admin','service_role') THEN
    RAISE EXCEPTION 'Owner SQL Editor or service role required';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('gemini-notebook-stage2-candidate'));
  IF v_expected !~ '^[0-9a-f]{32}$' THEN
    RAISE EXCEPTION 'Original committed POST_MD5 required';
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
  )::text) INTO v_current_md5;
  IF v_current_md5<>v_expected THEN
    RAISE EXCEPTION 'Stage 2 postimage drift: expected %, current %',v_expected,v_current_md5;
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_type='tool'
      AND owner_id=v_tool AND metadata->>'stage2Batch'='gemini-notebook-20261001')<>1 OR
     (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile
       AND metadata->>'stage2Batch'='gemini-notebook-20261001')<>7 OR
     (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile
       AND metadata->>'stage2Batch'='gemini-notebook-20261001')<>10 OR
     (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status IN ('draft','reviewed'))<>1 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status IN ('draft','reviewed')
       AND id IN ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202'))<>2 OR
     (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool AND id=v_fit
       AND status IN ('draft','reviewed'))<>1 THEN
    RAISE EXCEPTION 'Stage 2 identity, count or status changed';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tool_relationships WHERE tool_id=v_tool OR related_tool_id=v_tool) OR
     EXISTS (SELECT 1 FROM public.tool_decision_profile_claims l
       JOIN public.product_intelligence_claims c ON c.id=l.claim_id WHERE c.profile_id=v_profile AND l.tool_id<>v_tool) OR
     EXISTS (SELECT 1 FROM public.tool_capability_claims l
       JOIN public.product_intelligence_claims c ON c.id=l.claim_id
       JOIN public.tool_capabilities t ON t.id=l.tool_capability_id
       WHERE c.profile_id=v_profile AND t.tool_id<>v_tool) OR
     EXISTS (SELECT 1 FROM public.tool_task_fit_claims l
       JOIN public.product_intelligence_claims c ON c.id=l.claim_id
       JOIN public.tool_task_fits f ON f.id=l.fit_id
       WHERE c.profile_id=v_profile AND f.tool_id<>v_tool) THEN
    RAISE EXCEPTION 'Cross-owner or relationship dependency exists; HOLD';
  END IF;
  DELETE FROM public.tool_decision_profile_claims WHERE tool_id=v_tool;
  DELETE FROM public.tool_capability_claims WHERE tool_capability_id IN
    (SELECT id FROM public.tool_capabilities WHERE tool_id=v_tool);
  DELETE FROM public.tool_task_fit_claims WHERE fit_id=v_fit;
  DELETE FROM public.tool_task_fits WHERE id=v_fit AND tool_id=v_tool;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>1 THEN RAISE EXCEPTION 'Fit rollback row count %',v_count; END IF;
  DELETE FROM public.tool_capabilities WHERE tool_id=v_tool
    AND id IN ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>2 THEN RAISE EXCEPTION 'Capability rollback row count %',v_count; END IF;
  DELETE FROM public.tool_decision_profiles WHERE tool_id=v_tool;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>1 THEN RAISE EXCEPTION 'Decision rollback row count %',v_count; END IF;
  DELETE FROM public.product_intelligence_claims WHERE profile_id=v_profile;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>10 THEN RAISE EXCEPTION 'Claim rollback row count %',v_count; END IF;
  DELETE FROM public.product_intelligence_sources WHERE profile_id=v_profile;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>7 THEN RAISE EXCEPTION 'Source rollback row count %',v_count; END IF;
  DELETE FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_id=v_tool;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count<>1 THEN RAISE EXCEPTION 'Profile rollback row count %',v_count; END IF;
  IF EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=v_tool)
     OR EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool)
     OR EXISTS (SELECT 1 FROM public.tool_capabilities WHERE tool_id=v_tool)
     OR EXISTS (SELECT 1 FROM public.tool_task_fits WHERE tool_id=v_tool) THEN
    RAISE EXCEPTION 'Old-state zero not restored';
  END IF;
  RAISE NOTICE 'ROLLBACK PRECHECK PASS: old-state zero restored in transaction; default final ROLLBACK retains production state';
END
$rollback$;
ROLLBACK;

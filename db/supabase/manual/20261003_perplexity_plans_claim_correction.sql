-- Owner SQL Editor only. Correct one stale candidate claim after official plan
-- comparison changed: Free Pro Searches are listed as 3/day.
-- Default ROLLBACK mode previews the exact postimage without leaving writes.
-- This does not pass the claim, alter review/audit state, create links, or publish.
-- Fill these session values from the latest HOLD audit row and auth.users first.
-- Reviewer must be an app admin/moderator; approval text must match exactly.
SET perplexity.plans_correction.reviewer_id = '00000000-0000-0000-0000-000000000000';
SET perplexity.plans_correction.reviewer_email = 'REPLACE_WITH_EXACT_REVIEWER_EMAIL';
SET perplexity.plans_correction.admin_basis = 'USER_METADATA_ROLE';
SET perplexity.plans_correction.owner_approval = 'REPLACE_WITH_EXACT_OWNER_APPROVAL';
CREATE OR REPLACE FUNCTION pg_temp.perplexity_plans_claim_correction(p_mode text)
RETURNS TABLE(mode text, preflight boolean, corrected_claims integer,
  verified_claims integer, decision integer, capabilities integer, fit integer,
  links integer, reviewer_id uuid, hold_audit_at timestamptz, pre_md5 text, post_md5 text)
LANGUAGE plpgsql AS $correction$
DECLARE
  v_tool CONSTANT uuid := '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
  v_profile CONSTANT uuid := 'd0186230-0000-4000-8000-000000000001';
  v_claim CONSTANT uuid := 'd0186230-0000-4000-8000-000000000404';
  v_old_value CONSTANT jsonb := '{"summary":"Standard has basic search and limited Pro Search; Pro, Max and Enterprise have differentiated access. Exact Free Pro Search quota remains unknown because official pages conflict."}'::jsonb;
  v_old_scope CONSTANT jsonb := '{"scope":"Web/app subscription","exactFreeProSearchQuota":"unknown","requires":"recheck target account at review"}'::jsonb;
  v_new_value CONSTANT jsonb := '{"summary":"The current official plan comparison lists 3 Pro Searches per day for Free; Pro, Max and Enterprise have differentiated access."}'::jsonb;
  v_new_scope CONSTANT jsonb := '{"scope":"Web/app subscription","freePlanProSearchQuota":"3/day per current official plan comparison","requires":"recheck target account at review"}'::jsonb;
  v_hold_action text;
  v_hold_reviewer uuid;
  v_hold_created_at timestamptz;
  v_expected_reviewer_text text := current_setting('perplexity.plans_correction.reviewer_id',true);
  v_expected_reviewer_email text := current_setting('perplexity.plans_correction.reviewer_email',true);
  v_admin_basis text := current_setting('perplexity.plans_correction.admin_basis',true);
  v_owner_approval text := current_setting('perplexity.plans_correction.owner_approval',true);
  v_expected_reviewer uuid;
  v_hash text;
  v_pre_md5 text;
  v_target public.product_intelligence_claims%rowtype;
  v_source public.product_intelligence_sources%rowtype;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('ROLLBACK','COMMIT') THEN
    RAISE EXCEPTION 'Use ROLLBACK for preview or COMMIT for the candidate correction';
  END IF;
  BEGIN
    IF current_user NOT IN ('postgres','supabase_admin','service_role') THEN
      RAISE EXCEPTION 'Owner SQL Editor or service role required';
    END IF;
    IF v_expected_reviewer_text IS NULL OR v_expected_reviewer_text !~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' OR
       v_expected_reviewer_text='00000000-0000-0000-0000-000000000000' OR
       v_expected_reviewer_email IS NULL OR v_expected_reviewer_email<>lower(btrim(v_expected_reviewer_email)) OR
       v_expected_reviewer_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' OR
       v_admin_basis IS DISTINCT FROM 'USER_METADATA_ROLE' OR
       v_owner_approval IS DISTINCT FROM ('APPROVE_PERPLEXITY_PLANS_CORRECTION:'||v_expected_reviewer_text||':'||v_expected_reviewer_email||':'||v_admin_basis) THEN
      RAISE EXCEPTION 'Exact expected reviewer identity and Owner approval required';
    END IF;
    v_expected_reviewer := v_expected_reviewer_text::uuid;
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id=v_expected_reviewer
        AND lower(email)=v_expected_reviewer_email
        AND raw_user_meta_data->>'role' IN ('admin','moderator')) THEN
      RAISE EXCEPTION 'Reviewer UUID/email mismatch or app admin basis missing';
    END IF;
    IF (SELECT count(*) FROM pg_class WHERE oid IN (
      'public.product_intelligence_profiles'::regclass,
      'public.product_intelligence_sources'::regclass,
      'public.product_intelligence_claims'::regclass,
      'public.admin_evidence_review_audit'::regclass,
      'public.tool_decision_profiles'::regclass,
      'public.tool_capabilities'::regclass,
      'public.tool_task_fits'::regclass,
      'public.tool_decision_profile_claims'::regclass,
      'public.tool_capability_claims'::regclass,
      'public.tool_task_fit_claims'::regclass) AND relrowsecurity) <> 10 THEN
      RAISE EXCEPTION 'Perplexity correction requires RLS on all ten guarded tables';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtext('perplexity-plans-claim-correction'));
    IF (SELECT count(*) FROM public.product_intelligence_profiles
        WHERE id=v_profile AND owner_type='tool' AND owner_id=v_tool
          AND canonical_domain='www.perplexity.ai' AND profile_status='pending') <> 1 THEN
      RAISE EXCEPTION 'Perplexity profile identity or status drifted';
    END IF;
    IF (SELECT count(*) FROM public.product_intelligence_sources
        WHERE profile_id=v_profile) <> 5 OR
       (SELECT count(*) FROM public.product_intelligence_claims
        WHERE profile_id=v_profile) <> 7 THEN
      RAISE EXCEPTION 'Perplexity Stage 2 source/claim counts drifted';
    END IF;
    IF (SELECT count(*) FROM public.product_intelligence_claims c
        WHERE c.profile_id=v_profile AND c.id<>v_claim
          AND c.id IN ('d0186230-0000-4000-8000-000000000401','d0186230-0000-4000-8000-000000000402',
            'd0186230-0000-4000-8000-000000000403','d0186230-0000-4000-8000-000000000405',
            'd0186230-0000-4000-8000-000000000406','d0186230-0000-4000-8000-000000000407')
          AND c.verification_status='verified' AND c.conflict_status='none'
          AND c.invalidated_at IS NULL AND c.review_due_at > now()) <> 6 THEN
      RAISE EXCEPTION 'The six verified claims are not intact/current';
    END IF;
    IF EXISTS (SELECT 1 FROM public.product_intelligence_claims c WHERE c.profile_id=v_profile
      AND c.id NOT IN ('d0186230-0000-4000-8000-000000000401','d0186230-0000-4000-8000-000000000402',
        'd0186230-0000-4000-8000-000000000403','d0186230-0000-4000-8000-000000000404',
        'd0186230-0000-4000-8000-000000000405','d0186230-0000-4000-8000-000000000406',
        'd0186230-0000-4000-8000-000000000407')) THEN
      RAISE EXCEPTION 'Unexpected claim ID exists';
    END IF;
    SELECT * INTO v_target FROM public.product_intelligence_claims WHERE id=v_claim FOR UPDATE;
    SELECT * INTO v_source FROM public.product_intelligence_sources WHERE id=v_target.source_id;
    IF v_target.id IS DISTINCT FROM v_claim OR v_target.profile_id IS DISTINCT FROM v_profile OR
       v_target.claim_key IS DISTINCT FROM 'perplexity:research:plans-2026-10' OR
       v_target.claim_type IS DISTINCT FROM 'plan_limit' OR
       v_target.source_id IS DISTINCT FROM 'd0186230-0000-4000-8000-000000000102'::uuid OR
       v_target.source_url IS DISTINCT FROM v_source.url OR v_source.profile_id IS DISTINCT FROM v_profile OR
       v_source.url IS DISTINCT FROM 'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you' OR
       v_target.source_type IS DISTINCT FROM 'official' OR v_target.verification_status IS DISTINCT FROM 'candidate' OR
       v_target.conflict_status IS DISTINCT FROM 'none' OR v_target.invalidated_at IS NOT NULL OR
       v_target.verified_at IS NOT NULL OR v_target.verified_by IS NOT NULL OR
       v_target.claim_value IS DISTINCT FROM v_old_value OR v_target.validity_scope IS DISTINCT FROM v_old_scope THEN
      RAISE EXCEPTION 'Target claim is not the exact stale candidate/HOLD preimage';
    END IF;
    v_pre_md5 := md5(to_jsonb(v_target)::text);
    SELECT a.action,a.reviewer_id,a.created_at INTO v_hold_action,v_hold_reviewer,v_hold_created_at
      FROM public.admin_evidence_review_audit a
      WHERE a.profile_id=v_profile AND a.claim_id=v_claim
      ORDER BY a.id DESC LIMIT 1;
    IF v_hold_action IS DISTINCT FROM 'hold' OR v_hold_reviewer IS DISTINCT FROM v_expected_reviewer THEN
      RAISE EXCEPTION 'Latest target HOLD audit does not match the approved reviewer';
    END IF;
    IF v_hold_created_at IS NULL OR v_hold_created_at > clock_timestamp() OR
       v_hold_created_at < clock_timestamp()-interval '14 days' THEN
      RAISE EXCEPTION 'Latest target HOLD audit is outside the 14-day freshness window';
    END IF;
    IF (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool) <> 1 OR
       (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status='draft') <> 1 OR
       (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool) <> 2 OR
       (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='draft') <> 2 OR
       (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool) <> 1 OR
       (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool AND status='draft' AND fit_level='conditional') <> 1 THEN
      RAISE EXCEPTION 'Decision/Capability/Fit protected state drifted';
    END IF;
    IF (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool) +
       (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities c ON c.id=l.tool_capability_id WHERE c.tool_id=v_tool) +
       (SELECT count(*) FROM public.tool_task_fit_claims l JOIN public.tool_task_fits f ON f.id=l.fit_id WHERE f.tool_id=v_tool) <> 0 THEN
      RAISE EXCEPTION 'Perplexity evidence links must remain zero';
    END IF;
    IF EXISTS (SELECT 1 FROM public.product_intelligence_claims c
      WHERE c.profile_id=v_profile AND c.id<>v_claim AND
       (c.verification_status<>'verified' OR c.conflict_status<>'none' OR c.invalidated_at IS NOT NULL)) THEN
      RAISE EXCEPTION 'A protected claim changed status';
    END IF;

    UPDATE public.product_intelligence_claims
      SET claim_value=v_new_value, validity_scope=v_new_scope
      WHERE id=v_claim AND profile_id=v_profile AND verification_status='candidate'
        AND claim_value=v_old_value AND validity_scope=v_old_scope;
    IF NOT FOUND THEN RAISE EXCEPTION 'Target claim changed during correction'; END IF;
    IF (SELECT count(*) FROM public.product_intelligence_claims WHERE id=v_claim
        AND verification_status='candidate' AND claim_value=v_new_value
        AND validity_scope=v_new_scope) <> 1 THEN
      RAISE EXCEPTION 'Corrected candidate postimage differs';
    END IF;
    SELECT md5(jsonb_build_object(
      'claim',(SELECT to_jsonb(c) FROM public.product_intelligence_claims c WHERE c.id=v_claim),
      'otherClaims',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]'::jsonb)
        FROM public.product_intelligence_claims c WHERE c.profile_id=v_profile AND c.id<>v_claim),
      'profile',(SELECT to_jsonb(p) FROM public.product_intelligence_profiles p WHERE p.id=v_profile),
      'decision',(SELECT to_jsonb(d) FROM public.tool_decision_profiles d WHERE d.tool_id=v_tool),
      'capabilities',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]'::jsonb) FROM public.tool_capabilities c WHERE c.tool_id=v_tool),
      'fits',(SELECT coalesce(jsonb_agg(to_jsonb(f) ORDER BY f.id),'[]'::jsonb) FROM public.tool_task_fits f WHERE f.tool_id=v_tool),
      'links',(SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool) +
        (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities c ON c.id=l.tool_capability_id WHERE c.tool_id=v_tool) +
        (SELECT count(*) FROM public.tool_task_fit_claims l JOIN public.tool_task_fits f ON f.id=l.fit_id WHERE f.tool_id=v_tool))
    )::text) INTO v_hash;
    mode := CASE WHEN p_mode='ROLLBACK' THEN 'preflight' ELSE 'committed' END;
    preflight := p_mode='ROLLBACK';
    corrected_claims := 1;
    verified_claims := 6;
    decision := 1;
    capabilities := 2;
    fit := 1;
    links := 0;
    reviewer_id := v_hold_reviewer;
    hold_audit_at := v_hold_created_at;
    pre_md5 := v_pre_md5;
    post_md5 := v_hash;
    IF preflight THEN
      RAISE EXCEPTION 'perplexity_correction_preflight_rollback' USING ERRCODE='P0001';
    END IF;
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM <> 'perplexity_correction_preflight_rollback' THEN RAISE; END IF;
  END;
  RETURN NEXT;
END
$correction$;
SELECT * FROM pg_temp.perplexity_plans_claim_correction('ROLLBACK');

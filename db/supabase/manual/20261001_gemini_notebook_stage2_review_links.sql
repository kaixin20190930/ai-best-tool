-- Separate Owner gate AFTER independent human review of every official URL and claim.
-- First fill the seven SET LOCAL values from the real review record. Default values fail closed.
-- Review in a fresh SQL Editor transaction; keep final ROLLBACK for dry-run.
-- This never publishes a relation or opens a Task Page.
BEGIN;
SET LOCAL statement_timeout = '30s';
SET LOCAL gemini.stage2.reviewer = '00000000-0000-0000-0000-000000000000';
SET LOCAL gemini.stage2.reviewer_email = 'REPLACE_WITH_EXACT_REVIEWER_EMAIL';
-- Use USER_METADATA_ROLE only when auth.users.raw_user_meta_data.role is admin/moderator.
-- Use ADMIN_EMAILS only after Owner checks the exact email in production ADMIN_EMAILS.
SET LOCAL gemini.stage2.admin_basis = 'REPLACE_WITH_USER_METADATA_ROLE_OR_ADMIN_EMAILS';
-- Exact approval text: APPROVE_GEMINI_STAGE2:<reviewer UUID>:<lowercase email>:<admin basis>
SET LOCAL gemini.stage2.owner_approval = 'REPLACE_WITH_EXACT_OWNER_APPROVAL';
SET LOCAL gemini.stage2.qa_reference = 'REPLACE_WITH_INDEPENDENT_REVIEW_REFERENCE';
-- Original committed candidate POST_MD5 for first review; original reviewed POST_MD5 for a no-op rerun.
SET LOCAL gemini.stage2.expected_prior_md5 = 'REPLACE_WITH_ORIGINAL_PRIOR_POST_MD5';
-- JSON object: exactly ten claim keys (suffix after gemini-notebook:research:), each value
-- a >=12 character verbatim excerpt checked against its own source URL by the reviewer.
SET LOCAL gemini.stage2.excerpts = '{}';
DO $review$
DECLARE
  v_tool CONSTANT uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_profile CONSTANT uuid := 'c7890701-0000-4000-8000-000000000001';
  v_fit CONSTANT uuid := 'c7890701-0000-4000-8000-000000000301';
  v_reviewer uuid := current_setting('gemini.stage2.reviewer')::uuid;
  v_reviewer_email text := current_setting('gemini.stage2.reviewer_email');
  v_admin_basis text := current_setting('gemini.stage2.admin_basis');
  v_owner_approval text := current_setting('gemini.stage2.owner_approval');
  v_qa text := current_setting('gemini.stage2.qa_reference');
  v_expected_prior text := current_setting('gemini.stage2.expected_prior_md5');
  v_excerpts jsonb := current_setting('gemini.stage2.excerpts')::jsonb;
  v_now timestamptz := clock_timestamp();
  v_due timestamptz := clock_timestamp() + interval '60 days';
  v_claim record;
  v_links integer;
  v_post_md5 text;
  v_prior_md5 text;
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
  IF v_expected_prior !~ '^[0-9a-f]{32}$' OR v_prior_md5<>v_expected_prior THEN
    RAISE EXCEPTION 'Stage 2 review prior postimage drift: expected %, current %',v_expected_prior,v_prior_md5;
  END IF;
  IF v_reviewer='00000000-0000-0000-0000-000000000000'
     OR v_reviewer_email<>lower(btrim(v_reviewer_email))
     OR v_reviewer_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     OR v_admin_basis NOT IN ('USER_METADATA_ROLE','ADMIN_EMAILS')
     OR v_owner_approval<>('APPROVE_GEMINI_STAGE2:'||v_reviewer::text||':'||v_reviewer_email||':'||v_admin_basis)
     OR length(btrim(v_qa))<12
     OR v_qa='REPLACE_WITH_INDEPENDENT_REVIEW_REFERENCE'
     OR jsonb_typeof(v_excerpts)<>'object' OR
     (SELECT count(*) FROM jsonb_object_keys(v_excerpts))<>10 THEN
    RAISE EXCEPTION 'Exact Owner approval, reviewer identity, QA reference and ten source excerpts required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id=v_reviewer AND lower(email)=v_reviewer_email
      AND (v_admin_basis='ADMIN_EMAILS' OR
           (v_admin_basis='USER_METADATA_ROLE' AND raw_user_meta_data->>'role' IN ('admin','moderator')))) THEN
    RAISE EXCEPTION 'Reviewer UUID/email mismatch or app admin basis missing';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_type='tool'
      AND owner_id=v_tool AND canonical_domain='notebook.google.com' AND product_name='Gemini Notebook'
      AND profile_status IN ('pending','ready'))<>1 OR
     (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile AND source_type='official')<>7 OR
     (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile AND source_type='official'
       AND conflict_status='none' AND invalidated_at IS NULL)<>10 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status IN ('draft','reviewed'))<>2 OR
     (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool AND id=v_fit AND status IN ('draft','reviewed'))<>1 OR
     (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status IN ('draft','reviewed'))<>1 THEN
    RAISE EXCEPTION 'Candidate postimage drifted; do not review';
  END IF;
  FOR v_claim IN SELECT c.*, s.url AS official_url, s.fetch_status
      FROM public.product_intelligence_claims c
      JOIN public.product_intelligence_sources s ON s.id=c.source_id AND s.profile_id=c.profile_id
      WHERE c.profile_id=v_profile ORDER BY c.claim_key FOR UPDATE OF c,s LOOP
    IF v_claim.source_url<>v_claim.official_url OR
       v_claim.claim_key NOT LIKE 'gemini-notebook:research:%-2026-10' OR
       length(btrim(coalesce(v_excerpts->>replace(v_claim.claim_key,'gemini-notebook:research:',''),'')))<12 THEN
      RAISE EXCEPTION 'Missing or mismatched direct excerpt for %',v_claim.claim_key;
    END IF;
    IF v_claim.verification_status='verified' THEN
      IF v_claim.verified_by<>v_reviewer OR v_claim.review_due_at<=v_now OR
         v_claim.source_excerpt<>v_excerpts->>replace(v_claim.claim_key,'gemini-notebook:research:','') THEN
        RAISE EXCEPTION 'Existing reviewed claim differs or expired: %',v_claim.claim_key;
      END IF;
    ELSIF v_claim.verification_status<>'candidate' OR v_claim.verified_by IS NOT NULL THEN
      RAISE EXCEPTION 'Claim is not an untouched candidate: %',v_claim.claim_key;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile AND verification_status='verified')=0 THEN
    UPDATE public.product_intelligence_sources SET fetch_status='success', http_status=200,
      fetched_at=v_now,last_verified_at=v_now,
      metadata=metadata||jsonb_build_object('manualReviewer',v_reviewer,'qaReference',v_qa)
    WHERE profile_id=v_profile AND fetch_status='pending';
    UPDATE public.product_intelligence_claims c SET
      source_excerpt=v_excerpts->>replace(c.claim_key,'gemini-notebook:research:',''),
      verification_status='verified',verified_at=v_now,verified_by=v_reviewer,
      verification_note='Independent official-source review: '||v_qa,
      review_due_at=v_due
    WHERE c.profile_id=v_profile AND c.verification_status='candidate';
    UPDATE public.product_intelligence_profiles SET profile_status='ready',
      last_verified_at=v_now,next_review_at=v_due,updated_at=v_now
    WHERE id=v_profile AND profile_status='pending';
    UPDATE public.tool_decision_profiles SET editorial_status='reviewed',
      reviewed_at=v_now,review_due_at=v_due,reviewed_by=v_reviewer
    WHERE tool_id=v_tool AND editorial_status='draft';
    UPDATE public.tool_capabilities SET status='reviewed',reviewed_at=v_now,
      review_due_at=v_due,reviewed_by=v_reviewer,last_edited_by=v_reviewer
    WHERE tool_id=v_tool AND status='draft';
    UPDATE public.tool_task_fits SET status='reviewed',reviewed_at=v_now,
      review_due_at=v_due,reviewed_by=v_reviewer,last_edited_by=v_reviewer
    WHERE id=v_fit AND status='draft';
  END IF;
  IF (SELECT count(*) FROM public.product_intelligence_claims c
      JOIN public.product_intelligence_sources s ON s.id=c.source_id AND s.profile_id=c.profile_id
      WHERE c.profile_id=v_profile AND c.verification_status='verified' AND c.verified_by=v_reviewer
        AND c.verified_at<=v_now AND c.review_due_at>v_now AND c.conflict_status='none'
        AND c.invalidated_at IS NULL AND c.source_url=s.url AND s.fetch_status='success'
        AND s.last_verified_at<=v_now)<>10 OR
     (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='reviewed'
       AND reviewed_by=v_reviewer AND review_due_at>v_now)<>2 OR
     (SELECT count(*) FROM public.tool_task_fits WHERE id=v_fit AND status='reviewed'
       AND reviewed_by=v_reviewer AND review_due_at>v_now)<>1 OR
     (SELECT count(*) FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status='reviewed'
       AND reviewed_by=v_reviewer AND review_due_at>v_now)<>1 THEN
    RAISE EXCEPTION 'Review postimage incomplete';
  END IF;
  CREATE TEMP TABLE stage2_link_spec (kind text, relation_id uuid, claim_id uuid, purpose text,
    PRIMARY KEY(kind,relation_id,claim_id,purpose)) ON COMMIT DROP;
  INSERT INTO stage2_link_spec VALUES
    ('decision',v_tool,'c7890701-0000-4000-8000-000000000402','fit'),
    ('decision',v_tool,'c7890701-0000-4000-8000-000000000404','limitation'),
    ('decision',v_tool,'c7890701-0000-4000-8000-000000000407','cost'),
    ('decision',v_tool,'c7890701-0000-4000-8000-000000000409','privacy'),
    ('decision',v_tool,'c7890701-0000-4000-8000-000000000406','export'),
    ('capability','c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000403','support'),
    ('capability','c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000407','availability'),
    ('capability','c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000408','plan'),
    ('capability','c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000404','limitation'),
    ('capability','c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000405','limitation'),
    ('capability','c7890701-0000-4000-8000-000000000202','c7890701-0000-4000-8000-000000000402','support'),
    ('capability','c7890701-0000-4000-8000-000000000202','c7890701-0000-4000-8000-000000000407','availability'),
    ('capability','c7890701-0000-4000-8000-000000000202','c7890701-0000-4000-8000-000000000404','limitation'),
    ('capability','c7890701-0000-4000-8000-000000000202','c7890701-0000-4000-8000-000000000405','limitation'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000402','fit'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000403','fit'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000404','limitation'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000405','limitation'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000409','privacy'),
    ('fit',v_fit,'c7890701-0000-4000-8000-000000000410','privacy');
  IF EXISTS (SELECT 1 FROM stage2_link_spec x JOIN public.product_intelligence_claims c ON c.id=x.claim_id
      JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
      WHERE p.owner_type<>'tool' OR p.owner_id<>v_tool OR c.verification_status<>'verified'
        OR c.review_due_at<=v_now OR c.invalidated_at IS NOT NULL OR c.conflict_status<>'none')
     OR (SELECT count(*) FROM stage2_link_spec)<>20 THEN
    RAISE EXCEPTION 'Link map is incomplete or crosses owner';
  END IF;
  INSERT INTO public.tool_decision_profile_claims(tool_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_link_spec WHERE kind='decision' ON CONFLICT DO NOTHING;
  INSERT INTO public.tool_capability_claims(tool_capability_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_link_spec WHERE kind='capability' ON CONFLICT DO NOTHING;
  INSERT INTO public.tool_task_fit_claims(fit_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_link_spec WHERE kind='fit' ON CONFLICT DO NOTHING;
  SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit) INTO v_links;
  IF v_links<>20 OR EXISTS (SELECT 1 FROM public.tool_decision_profile_claims l WHERE l.tool_id=v_tool AND NOT EXISTS
      (SELECT 1 FROM stage2_link_spec x WHERE x.kind='decision' AND x.relation_id=l.tool_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose))
    OR EXISTS (SELECT 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id
      WHERE t.tool_id=v_tool AND NOT EXISTS (SELECT 1 FROM stage2_link_spec x WHERE x.kind='capability'
        AND x.relation_id=l.tool_capability_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose))
    OR EXISTS (SELECT 1 FROM public.tool_task_fit_claims l WHERE l.fit_id=v_fit AND NOT EXISTS
      (SELECT 1 FROM stage2_link_spec x WHERE x.kind='fit' AND x.relation_id=l.fit_id AND x.claim_id=l.claim_id AND x.purpose=l.purpose)) THEN
    RAISE EXCEPTION 'Link postimage differs from exact same-owner manifest';
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
  RAISE NOTICE 'POSTIMAGE reviewed: 10 verified claims, 5 decision + 9 capability + 6 fit links; relation statuses reviewed; Task Page still HOLD';
END
$review$;
ROLLBACK;

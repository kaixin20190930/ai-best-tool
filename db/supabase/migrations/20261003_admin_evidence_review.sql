-- One-time infrastructure for the Admin Evidence Review Queue. Routine reviews use
-- the application; this migration must be applied once before enabling its actions.
CREATE TABLE IF NOT EXISTS public.admin_evidence_review_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.product_intelligence_profiles(id) ON DELETE CASCADE,
  claim_id uuid REFERENCES public.product_intelligence_claims(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('pass', 'hold', 'link')),
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  review_due_at timestamptz,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_evidence_review_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_evidence_review_audit FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_evidence_claim(
  p_claim_id uuid, p_reviewer uuid, p_decision text, p_excerpt text,
  p_note text, p_scope jsonb, p_review_due_at timestamptz
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.product_intelligence_claims%rowtype;
DECLARE s public.product_intelligence_sources%rowtype;
DECLARE p public.product_intelligence_profiles%rowtype;
DECLARE v_now timestamptz := clock_timestamp();
BEGIN
  IF auth.role() <> 'service_role' OR p_reviewer IS NULL OR NOT EXISTS
    (SELECT 1 FROM auth.users WHERE id=p_reviewer) THEN RAISE EXCEPTION 'Admin service role and real reviewer required'; END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
    ('public.product_intelligence_profiles'::regclass,'public.product_intelligence_sources'::regclass,
     'public.product_intelligence_claims'::regclass,'public.admin_evidence_review_audit'::regclass)
     AND relrowsecurity)<>4 THEN RAISE EXCEPTION 'Evidence review requires RLS'; END IF;
  IF p_decision NOT IN ('PASS','HOLD') OR length(btrim(p_note)) < 10 OR
     p_scope IS NULL OR jsonb_typeof(p_scope) <> 'object' THEN RAISE EXCEPTION 'Decision, note and scope required'; END IF;
  SELECT * INTO c FROM public.product_intelligence_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Claim not found'; END IF;
  SELECT * INTO p FROM public.product_intelligence_profiles WHERE id=c.profile_id FOR UPDATE;
  SELECT * INTO s FROM public.product_intelligence_sources WHERE id=c.source_id;
  IF p.owner_type <> 'tool' OR s.id IS NULL OR s.profile_id <> p.id OR
     c.source_url IS DISTINCT FROM s.url OR c.source_type IS DISTINCT FROM s.source_type OR
     s.source_type <> 'official' OR s.url !~ '^https://' OR
     s.fetch_status NOT IN ('pending','success') THEN RAISE EXCEPTION 'Source or owner mismatch'; END IF;
  IF p.id='c7890701-0000-4000-8000-000000000001'::uuid AND
     s.url !~ '^https://(blog[.]google|support[.]google[.]com)/' THEN
    RAISE EXCEPTION 'Gemini source must be a predefined Google official URL'; END IF;
  IF p_decision = 'PASS' THEN
    IF c.verification_status NOT IN ('candidate','verified') OR c.conflict_status <> 'none' OR
       c.invalidated_at IS NOT NULL OR (c.expires_at IS NOT NULL AND c.expires_at <= v_now) OR
       length(btrim(coalesce(p_excerpt,''))) < 12 OR p_review_due_at IS NULL OR p_review_due_at <= v_now OR
       p_review_due_at > v_now + interval '90 days' THEN
      RAISE EXCEPTION 'Claim is conflicted, expired, missing excerpt, or has invalid review date';
    END IF;
    IF c.verification_status='verified' AND c.source_excerpt=btrim(p_excerpt) AND
       c.verification_note=btrim(p_note) AND c.validity_scope=p_scope AND
       c.review_due_at=p_review_due_at THEN
      RETURN jsonb_build_object('decision','PASS','claimId',c.id,'unchanged',true);
    END IF;
    UPDATE public.product_intelligence_claims SET source_excerpt=btrim(p_excerpt),
      validity_scope=p_scope, verification_status='verified', verified_at=v_now,
      verified_by=p_reviewer, verification_note=btrim(p_note), review_due_at=p_review_due_at
      WHERE id=c.id;
    UPDATE public.product_intelligence_sources SET fetch_status='success',last_verified_at=v_now
      WHERE id=s.id;
    UPDATE public.product_intelligence_profiles SET last_verified_at=v_now,
      next_review_at=p_review_due_at WHERE id=p.id;
  ELSE
    IF c.verification_status NOT IN ('candidate','rejected') THEN RAISE EXCEPTION 'Reviewed claim cannot be put on HOLD'; END IF;
    IF c.verification_status='candidate' AND c.source_excerpt IS NOT DISTINCT FROM NULLIF(btrim(p_excerpt),'')
       AND c.verification_note=btrim(p_note) AND c.validity_scope=p_scope THEN
      RETURN jsonb_build_object('decision','HOLD','claimId',c.id,'unchanged',true);
    END IF;
    UPDATE public.product_intelligence_claims SET source_excerpt=NULLIF(btrim(p_excerpt),''),
      validity_scope=p_scope, verification_status='candidate', verified_at=NULL,
      verified_by=NULL, verification_note=btrim(p_note), review_due_at=NULL WHERE id=c.id;
  END IF;
  INSERT INTO public.admin_evidence_review_audit(profile_id,claim_id,action,reviewer_id,review_due_at,note)
    VALUES(p.id,c.id,lower(p_decision),p_reviewer,CASE WHEN p_decision='PASS' THEN p_review_due_at END,btrim(p_note));
  RETURN jsonb_build_object('decision',p_decision,'claimId',c.id);
END $$;
REVOKE ALL ON FUNCTION public.admin_review_evidence_claim(uuid,uuid,text,text,text,jsonb,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_evidence_claim(uuid,uuid,text,text,text,jsonb,timestamptz) TO service_role;

-- The only pre-defined Stage 2 graph package. It reviews existing drafts and
-- inserts exactly its 5/9/6 links. It never publishes a relation or a page.
CREATE OR REPLACE FUNCTION public.admin_link_gemini_notebook_evidence(p_reviewer uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tool constant uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
DECLARE v_profile constant uuid := 'c7890701-0000-4000-8000-000000000001';
DECLARE v_fit constant uuid := 'c7890701-0000-4000-8000-000000000301';
DECLARE v_now timestamptz := clock_timestamp();
DECLARE v_due timestamptz := clock_timestamp() + interval '60 days';
DECLARE v_count integer;
BEGIN
  IF auth.role() <> 'service_role' OR p_reviewer IS NULL OR NOT EXISTS
    (SELECT 1 FROM auth.users WHERE id=p_reviewer) THEN RAISE EXCEPTION 'Admin service role and real reviewer required'; END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
    ('public.product_intelligence_profiles'::regclass,'public.product_intelligence_sources'::regclass,
     'public.product_intelligence_claims'::regclass,'public.tool_decision_profiles'::regclass,
     'public.tool_capabilities'::regclass,'public.tool_task_fits'::regclass,
     'public.tool_decision_profile_claims'::regclass,'public.tool_capability_claims'::regclass,
     'public.tool_task_fit_claims'::regclass,'public.admin_evidence_review_audit'::regclass)
     AND relrowsecurity)<>10 THEN RAISE EXCEPTION 'Stage 2 review requires RLS'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('gemini-notebook-stage2-review'));
  IF (SELECT count(*) FROM public.product_intelligence_sources WHERE profile_id=v_profile)<>7 OR
     EXISTS (SELECT 1 FROM (VALUES
       ('c7890701-0000-4000-8000-000000000101'::uuid,'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/'),
       ('c7890701-0000-4000-8000-000000000102'::uuid,'https://support.google.com/gemininotebook/answer/16164461'),
       ('c7890701-0000-4000-8000-000000000103'::uuid,'https://support.google.com/gemininotebook/answer/16215270?hl=en'),
       ('c7890701-0000-4000-8000-000000000104'::uuid,'https://support.google.com/gemininotebook/answer/16206563?hl=en'),
       ('c7890701-0000-4000-8000-000000000105'::uuid,'https://support.google.com/gemininotebook/answer/16213268?hl=en'),
       ('c7890701-0000-4000-8000-000000000106'::uuid,'https://support.google.com/gemininotebook/answer/17670842?hl=en'),
       ('c7890701-0000-4000-8000-000000000107'::uuid,'https://support.google.com/gemininotebook/answer/17004255?hl=en')
     ) expected(id,url) LEFT JOIN public.product_intelligence_sources s
       ON s.id=expected.id AND s.profile_id=v_profile AND s.url=expected.url WHERE s.id IS NULL)
  THEN RAISE EXCEPTION 'Predefined Gemini sources changed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE id=v_profile AND owner_type='tool' AND owner_id=v_tool)
     OR (SELECT count(*) FROM public.product_intelligence_claims WHERE profile_id=v_profile) <> 10
     OR EXISTS (SELECT 1 FROM public.product_intelligence_claims WHERE profile_id=v_profile AND
       id::text !~ '^c7890701-0000-4000-8000-0000000004(0[1-9]|10)$')
     OR EXISTS (SELECT 1 FROM public.product_intelligence_claims c LEFT JOIN public.product_intelligence_sources s
       ON s.id=c.source_id AND s.profile_id=c.profile_id WHERE c.profile_id=v_profile AND
       (c.verification_status<>'verified' OR c.verified_at IS NULL OR c.verified_by IS NULL OR
        c.conflict_status<>'none' OR c.invalidated_at IS NOT NULL OR
        c.expires_at<=v_now OR c.review_due_at IS NULL OR c.review_due_at<=v_now OR
        length(btrim(coalesce(c.source_excerpt,'')))<12 OR
        c.source_url IS DISTINCT FROM s.url OR c.source_type IS DISTINCT FROM s.source_type OR
        s.source_type<>'official' OR s.fetch_status<>'success' OR s.last_verified_at IS NULL))
  THEN RAISE EXCEPTION 'All ten same-owner official claims must pass review'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status IN ('draft','reviewed'))
     OR (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND id IN
       ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202') AND status IN ('draft','reviewed')) <> 2
     OR NOT EXISTS (SELECT 1 FROM public.tool_task_fits WHERE id=v_fit AND tool_id=v_tool AND status IN ('draft','reviewed'))
  THEN RAISE EXCEPTION 'Predefined same-owner draft graph is missing'; END IF;
  IF (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool)<>2 OR
     (SELECT count(*) FROM public.tool_task_fits WHERE tool_id=v_tool)<>1 THEN
    RAISE EXCEPTION 'Unexpected graph relations for tool'; END IF;
  CREATE TEMP TABLE stage2_admin_links(kind text, relation_id uuid, claim_id uuid, purpose text,
    PRIMARY KEY(kind,relation_id,claim_id,purpose)) ON COMMIT DROP;
  INSERT INTO stage2_admin_links VALUES
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
  IF (SELECT count(*) FROM stage2_admin_links)<>20 OR EXISTS
     (SELECT 1 FROM stage2_admin_links x LEFT JOIN public.product_intelligence_claims c ON c.id=x.claim_id
       WHERE c.id IS NULL OR c.profile_id<>v_profile) THEN RAISE EXCEPTION 'Exact link package or owner mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.tool_decision_profile_claims WHERE tool_id=v_tool AND NOT EXISTS
       (SELECT 1 FROM stage2_admin_links x WHERE kind='decision' AND relation_id=tool_id AND claim_id=tool_decision_profile_claims.claim_id AND purpose=tool_decision_profile_claims.purpose))
    OR EXISTS (SELECT 1 FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool AND NOT EXISTS
       (SELECT 1 FROM stage2_admin_links x WHERE kind='capability' AND relation_id=l.tool_capability_id AND claim_id=l.claim_id AND purpose=l.purpose))
    OR EXISTS (SELECT 1 FROM public.tool_task_fit_claims WHERE fit_id=v_fit AND NOT EXISTS
       (SELECT 1 FROM stage2_admin_links x WHERE kind='fit' AND relation_id=fit_id AND claim_id=tool_task_fit_claims.claim_id AND purpose=tool_task_fit_claims.purpose))
  THEN RAISE EXCEPTION 'Unexpected existing links'; END IF;
  SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit) INTO v_count;
  IF v_count=20 THEN
    IF NOT EXISTS (SELECT 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool AND editorial_status='reviewed') OR
       (SELECT count(*) FROM public.tool_capabilities WHERE tool_id=v_tool AND status='reviewed')<>2 OR
       NOT EXISTS (SELECT 1 FROM public.tool_task_fits WHERE id=v_fit AND status='reviewed') THEN
      RAISE EXCEPTION 'Linked graph is not reviewed'; END IF;
    RETURN jsonb_build_object('decisionLinks',5,'capabilityLinks',9,'fitLinks',6,'status','reviewed','unchanged',true);
  END IF;
  UPDATE public.product_intelligence_profiles SET profile_status='ready',last_verified_at=v_now,
    next_review_at=(SELECT min(review_due_at) FROM public.product_intelligence_claims WHERE profile_id=v_profile)
    WHERE id=v_profile AND profile_status='pending';
  UPDATE public.tool_decision_profiles SET editorial_status='reviewed',reviewed_at=v_now,review_due_at=v_due,reviewed_by=p_reviewer
    WHERE tool_id=v_tool AND editorial_status='draft';
  UPDATE public.tool_capabilities SET status='reviewed',reviewed_at=v_now,review_due_at=v_due,reviewed_by=p_reviewer,last_edited_by=p_reviewer
    WHERE tool_id=v_tool AND status='draft' AND id IN ('c7890701-0000-4000-8000-000000000201','c7890701-0000-4000-8000-000000000202');
  UPDATE public.tool_task_fits SET status='reviewed',reviewed_at=v_now,review_due_at=v_due,reviewed_by=p_reviewer,last_edited_by=p_reviewer
    WHERE id=v_fit AND status='draft';
  INSERT INTO public.tool_decision_profile_claims(tool_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_admin_links WHERE kind='decision' ON CONFLICT DO NOTHING;
  INSERT INTO public.tool_capability_claims(tool_capability_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_admin_links WHERE kind='capability' ON CONFLICT DO NOTHING;
  INSERT INTO public.tool_task_fit_claims(fit_id,claim_id,purpose)
    SELECT relation_id,claim_id,purpose FROM stage2_admin_links WHERE kind='fit' ON CONFLICT DO NOTHING;
  SELECT (SELECT count(*) FROM public.tool_decision_profile_claims WHERE tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_capability_claims l JOIN public.tool_capabilities t ON t.id=l.tool_capability_id WHERE t.tool_id=v_tool)+
    (SELECT count(*) FROM public.tool_task_fit_claims WHERE fit_id=v_fit) INTO v_count;
  IF v_count<>20 THEN RAISE EXCEPTION 'Exact 5/9/6 links were not established'; END IF;
  INSERT INTO public.admin_evidence_review_audit(profile_id,action,reviewer_id,review_due_at,note)
    VALUES(v_profile,'link',p_reviewer,v_due,'Gemini Notebook Stage 2 exact 5/9/6 draft graph links');
  RETURN jsonb_build_object('decisionLinks',5,'capabilityLinks',9,'fitLinks',6,'status','reviewed');
END $$;
REVOKE ALL ON FUNCTION public.admin_link_gemini_notebook_evidence(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_link_gemini_notebook_evidence(uuid) TO service_role;

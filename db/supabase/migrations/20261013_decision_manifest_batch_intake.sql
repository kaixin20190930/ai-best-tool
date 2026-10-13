-- Single immutable foundation migration for a reviewed, service-role-only Decision batch.
-- No directory, routing, indexing, or publication status is changed here.
CREATE TABLE public.decision_manifest_batch_records (
  batch_hash text NOT NULL CHECK (batch_hash ~ '^[a-f0-9]{64}$'),
  tool_id uuid PRIMARY KEY,
  profile_id uuid NOT NULL UNIQUE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  qa_reference text NOT NULL,
  postimage jsonb NOT NULL CHECK (jsonb_typeof(postimage) = 'object'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX decision_manifest_batch_records_hash_idx
  ON public.decision_manifest_batch_records(batch_hash);
ALTER TABLE public.decision_manifest_batch_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.decision_manifest_batch_records FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.decision_manifest_batch_records TO service_role;

-- Canonical JSON format: sorted ASCII object keys; UTF-8 byte lengths for strings;
-- integer decimal numbers only. The TypeScript implementation uses the same grammar.
CREATE OR REPLACE FUNCTION public.decision_manifest_canonical_jsonb(p_value jsonb)
RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE
  v_type text := jsonb_typeof(p_value);
  v_text text;
  v_body text;
  v_count integer;
BEGIN
  IF v_type='null' THEN RETURN 'N'; END IF;
  IF v_type='true' THEN RETURN 'T'; END IF;
  IF v_type='false' THEN RETURN 'F'; END IF;
  IF v_type='boolean' THEN
    RETURN CASE WHEN p_value='true'::jsonb THEN 'T' ELSE 'F' END;
  END IF;
  IF v_type IN ('string','number') THEN
    v_text := CASE WHEN v_type='string' THEN p_value #>> '{}' ELSE p_value::text END;
    IF v_type='number' AND v_text !~ '^-?(0|[1-9][0-9]*)$' THEN
      RAISE EXCEPTION 'Canonical payload permits integer numbers only' USING ERRCODE='23514';
    END IF;
    RETURN CASE WHEN v_type='string' THEN 'S' ELSE 'D' END ||
      octet_length(v_text)::text || ':' || v_text;
  END IF;
  IF v_type='array' THEN
    SELECT count(*), coalesce(string_agg(public.decision_manifest_canonical_jsonb(value),''
      ORDER BY ordinal),'') INTO v_count,v_body
    FROM jsonb_array_elements(p_value) WITH ORDINALITY AS items(value,ordinal);
    RETURN 'A'||v_count::text||':'||v_body;
  END IF;
  IF v_type='object' THEN
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_value) AS keys(key)
               WHERE key !~ '^[ -~]+$') THEN
      RAISE EXCEPTION 'Canonical payload keys must be printable ASCII' USING ERRCODE='23514';
    END IF;
    SELECT count(*), coalesce(string_agg(
      public.decision_manifest_canonical_jsonb(to_jsonb(key)) ||
      public.decision_manifest_canonical_jsonb(value),'' ORDER BY key COLLATE "C"),'')
      INTO v_count,v_body FROM jsonb_each(p_value);
    RETURN 'O'||v_count::text||':'||v_body;
  END IF;
  RAISE EXCEPTION 'Unsupported canonical JSON type' USING ERRCODE='23514';
END;
$$;

CREATE OR REPLACE FUNCTION public.decision_manifest_current_postimage(
  p_tool_id uuid, p_profile_id uuid
) RETURNS jsonb LANGUAGE sql VOLATILE SET search_path = pg_catalog, public AS $$
  SELECT jsonb_build_object(
    'profiles', (SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.id),'[]'::jsonb)
                 FROM public.product_intelligence_profiles p
                 WHERE p.owner_type='tool' AND p.owner_id=p_tool_id),
    'sources', (SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.id),'[]'::jsonb)
                FROM public.product_intelligence_sources s WHERE s.profile_id=p_profile_id),
    'claims', (SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]'::jsonb)
               FROM public.product_intelligence_claims c WHERE c.profile_id=p_profile_id),
    'timeline', (SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.id),'[]'::jsonb)
                 FROM public.product_intelligence_timeline_events e WHERE e.profile_id=p_profile_id),
    'decisions', (SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY d.tool_id),'[]'::jsonb)
                  FROM public.tool_decision_profiles d WHERE d.tool_id=p_tool_id),
    'capabilities', (SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id),'[]'::jsonb)
                     FROM public.tool_capabilities c WHERE c.tool_id=p_tool_id),
    'fits', (SELECT coalesce(jsonb_agg(to_jsonb(f) ORDER BY f.id),'[]'::jsonb)
             FROM public.tool_task_fits f WHERE f.tool_id=p_tool_id),
    'capabilityLinks', (SELECT coalesce(jsonb_agg(to_jsonb(l)
      ORDER BY l.tool_capability_id,l.claim_id,l.purpose),'[]'::jsonb)
      FROM public.tool_capability_claims l JOIN public.tool_capabilities c
        ON c.id=l.tool_capability_id WHERE c.tool_id=p_tool_id),
    'fitLinks', (SELECT coalesce(jsonb_agg(to_jsonb(l)
      ORDER BY l.fit_id,l.claim_id,l.purpose),'[]'::jsonb)
      FROM public.tool_task_fit_claims l JOIN public.tool_task_fits f
        ON f.id=l.fit_id WHERE f.tool_id=p_tool_id),
    'decisionLinks', (SELECT coalesce(jsonb_agg(to_jsonb(l)
      ORDER BY l.tool_id,l.claim_id,l.purpose),'[]'::jsonb)
      FROM public.tool_decision_profile_claims l WHERE l.tool_id=p_tool_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.decision_manifest_batch_intake(
  p_task_id uuid, p_capability_id uuid, p_task_preimage jsonb, p_tools jsonb,
  p_batch_hash text, p_reviewer uuid, p_qa_reference text DEFAULT '',
  p_commit boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_task public.decision_tasks%ROWTYPE;
  v_task_row public.task_capabilities%ROWTYPE;
  v_entry jsonb;
  v_tool jsonb;
  v_claim jsonb;
  v_tool_id uuid;
  v_profile_id uuid;
  v_cap_id uuid;
  v_fit_id uuid;
  v_claim_id uuid;
  v_claim_ids jsonb;
  v_key text;
  v_url text;
  v_domain text;
  v_host text;
  v_purpose text;
  v_min_due timestamptz;
  v_record public.decision_manifest_batch_records%ROWTYPE;
  v_postimage jsonb;
  v_results jsonb := '[]'::jsonb;
  v_seen uuid[] := ARRAY[]::uuid[];
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role required' USING ERRCODE='42501';
  END IF;
  IF p_commit IS NULL OR p_reviewer IS NULL OR NOT EXISTS
       (SELECT 1 FROM auth.users WHERE id=p_reviewer)
    OR p_qa_reference IS NULL
    OR p_task_id IS NULL OR p_capability_id IS NULL
    OR p_task_preimage IS NULL OR jsonb_typeof(p_task_preimage)<>'array'
    OR jsonb_array_length(p_task_preimage) NOT BETWEEN 1 AND 20
    OR p_tools IS NULL OR jsonb_typeof(p_tools)<>'array'
    OR jsonb_array_length(p_tools) NOT BETWEEN 1 AND 20
    OR p_batch_hash IS NULL OR p_batch_hash !~ '^[a-f0-9]{64}$'
    OR (p_commit AND p_qa_reference !~
      '^codex-thread:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    RAISE EXCEPTION 'Complete reviewer, QA reference and manifest required' USING ERRCODE='23514';
  END IF;
  IF p_batch_hash IS DISTINCT FROM encode(digest(convert_to(
    public.decision_manifest_canonical_jsonb(jsonb_build_object(
      'taskId',p_task_id,'capabilityId',p_capability_id,
      'taskPreimage',p_task_preimage,'tools',p_tools,
      'reviewer',p_reviewer,'qaReference',p_qa_reference)), 'UTF8'),'sha256'),'hex') THEN
    RAISE EXCEPTION 'Complete payload hash differs from owner-approved hash' USING ERRCODE='23514';
  END IF;
  -- This rare editorial transaction excludes phantoms from other write paths;
  -- individual rows are additionally locked before exact postimage checks.
  LOCK TABLE public.product_intelligence_profiles, public.product_intelligence_sources,
    public.product_intelligence_claims, public.product_intelligence_timeline_events,
    public.tool_decision_profiles, public.tool_capabilities, public.tool_task_fits,
    public.tool_capability_claims, public.tool_task_fit_claims,
    public.tool_decision_profile_claims, public.decision_manifest_batch_records
    IN SHARE ROW EXCLUSIVE MODE;
  SELECT * INTO v_task FROM public.decision_tasks WHERE id=p_task_id FOR UPDATE;
  IF NOT FOUND OR v_task.status IS DISTINCT FROM 'active' OR NOT EXISTS
    (SELECT 1 FROM public.decision_capabilities WHERE id=p_capability_id AND status='active') THEN
    RAISE EXCEPTION 'Active Task and Capability required' USING ERRCODE='23514';
  END IF;
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_task_preimage) LOOP
    IF v_entry->>'id' IS NULL OR v_entry->>'status' IS NULL
      OR v_entry->>'updated_at' IS NULL OR v_entry->>'reviewed_at' IS NULL
      OR v_entry->>'review_due_at' IS NULL
      OR (v_entry->>'id')::uuid = ANY(v_seen) THEN
      RAISE EXCEPTION 'Task Capability preimage is incomplete or duplicated' USING ERRCODE='23514';
    END IF;
    v_seen := array_append(v_seen,(v_entry->>'id')::uuid);
    SELECT * INTO v_task_row FROM public.task_capabilities
      WHERE task_id=p_task_id AND capability_id=(v_entry->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR v_task_row.status IS DISTINCT FROM 'reviewed'
      OR v_task_row.status IS DISTINCT FROM v_entry->>'status'
      OR v_task_row.updated_at IS DISTINCT FROM (v_entry->>'updated_at')::timestamptz
      OR v_task_row.reviewed_at IS DISTINCT FROM (v_entry->>'reviewed_at')::timestamptz
      OR v_task_row.review_due_at IS DISTINCT FROM (v_entry->>'review_due_at')::timestamptz
      OR v_task_row.reviewed_by IS NULL OR v_task_row.reviewed_at > v_now
      OR v_task_row.review_due_at <= v_now THEN
      RAISE EXCEPTION 'Task Capability exact reviewed preimage drifted' USING ERRCODE='23514';
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM public.task_capabilities WHERE task_id=p_task_id)
       IS DISTINCT FROM jsonb_array_length(p_task_preimage)::bigint
     OR NOT EXISTS (SELECT 1 FROM public.task_capabilities
       WHERE task_id=p_task_id AND capability_id=p_capability_id AND status='reviewed') THEN
    RAISE EXCEPTION 'Task Capability set drifted' USING ERRCODE='23514';
  END IF;
  v_seen := ARRAY[]::uuid[];
  BEGIN
    FOR v_tool IN SELECT value FROM jsonb_array_elements(p_tools) LOOP
      IF v_tool->>'decision' IS DISTINCT FROM 'PASS'
        OR v_tool->>'writeEligibility' IS DISTINCT FROM 'READY'
        OR v_tool->>'toolId' IS NULL OR v_tool->>'profileId' IS NULL
        OR v_tool->>'capabilityId' IS NULL OR v_tool->>'fitId' IS NULL
        OR jsonb_typeof(v_tool->'claims') IS DISTINCT FROM 'array'
        OR jsonb_array_length(v_tool->'claims') NOT BETWEEN 1 AND 100
        OR (v_tool->>'expectedClaims')::integer IS DISTINCT FROM jsonb_array_length(v_tool->'claims')
        OR jsonb_typeof(v_tool->'purposeLinks') IS DISTINCT FROM 'object'
        OR jsonb_typeof(v_tool->'toolCapability'->'limitations') IS DISTINCT FROM 'array'
        OR jsonb_typeof(v_tool->'fit'->'requiredConditions') IS DISTINCT FROM 'array'
        OR jsonb_typeof(v_tool->'fit'->'disqualifiers') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Tool write set incomplete or HOLD' USING ERRCODE='23514';
      END IF;
      v_tool_id := (v_tool->>'toolId')::uuid;
      v_profile_id := (v_tool->>'profileId')::uuid;
      v_cap_id := (v_tool->>'capabilityId')::uuid;
      v_fit_id := (v_tool->>'fitId')::uuid;
      v_domain := lower(v_tool->>'officialHost');
      IF v_tool_id = ANY(v_seen) OR v_domain !~ '^[a-z0-9.-]+$'
        OR lower(v_tool->'profile'->>'canonicalDomain') IS DISTINCT FROM v_domain
        OR v_tool->'directoryPreimage'->>'status' IS DISTINCT FROM 'published'
        OR v_tool->'directoryPreimage'->>'updatedAt' IS NULL
        OR length(btrim(coalesce(v_tool->'profile'->>'productName',''))) < 2 THEN
        RAISE EXCEPTION 'Duplicate tool or invalid directory identity' USING ERRCODE='23514';
      END IF;
      v_seen := array_append(v_seen,v_tool_id);
      PERFORM 1 FROM public.product_intelligence_profiles
        WHERE owner_type='tool' AND owner_id=v_tool_id FOR UPDATE;
      PERFORM 1 FROM public.product_intelligence_sources WHERE profile_id=v_profile_id FOR UPDATE;
      PERFORM 1 FROM public.product_intelligence_claims WHERE profile_id=v_profile_id FOR UPDATE;
      PERFORM 1 FROM public.product_intelligence_timeline_events WHERE profile_id=v_profile_id FOR UPDATE;
      PERFORM 1 FROM public.tool_decision_profiles WHERE tool_id=v_tool_id FOR UPDATE;
      PERFORM 1 FROM public.tool_capabilities WHERE tool_id=v_tool_id FOR UPDATE;
      PERFORM 1 FROM public.tool_task_fits WHERE tool_id=v_tool_id FOR UPDATE;
      PERFORM 1 FROM public.tool_capability_claims WHERE tool_capability_id=v_cap_id FOR UPDATE;
      PERFORM 1 FROM public.tool_task_fit_claims WHERE fit_id=v_fit_id FOR UPDATE;
      PERFORM 1 FROM public.tool_decision_profile_claims WHERE tool_id=v_tool_id FOR UPDATE;
      SELECT * INTO v_record FROM public.decision_manifest_batch_records
        WHERE tool_id=v_tool_id FOR UPDATE;
      IF FOUND THEN
        IF v_record.batch_hash IS DISTINCT FROM p_batch_hash
          OR v_record.profile_id IS DISTINCT FROM v_profile_id
          OR v_record.reviewer_id IS DISTINCT FROM p_reviewer
          OR v_record.qa_reference IS DISTINCT FROM p_qa_reference
          OR public.decision_manifest_current_postimage(v_tool_id,v_profile_id)
               IS DISTINCT FROM v_record.postimage
          OR EXISTS (SELECT 1 FROM public.product_intelligence_claims
            WHERE profile_id=v_profile_id AND (verification_status IS DISTINCT FROM 'verified'
              OR conflict_status IS DISTINCT FROM 'none' OR invalidated_at IS NOT NULL
              OR review_due_at <= v_now OR (expires_at IS NOT NULL AND expires_at <= v_now)))
          OR EXISTS (SELECT 1 FROM public.tool_capabilities
            WHERE tool_id=v_tool_id AND (status IS DISTINCT FROM 'reviewed' OR review_due_at <= v_now))
          OR EXISTS (SELECT 1 FROM public.tool_task_fits
            WHERE tool_id=v_tool_id AND (status IS DISTINCT FROM 'reviewed' OR review_due_at <= v_now)) THEN
          RAISE EXCEPTION 'Exact batch postimage drifted or evidence expired' USING ERRCODE='23514';
        END IF;
        v_results := v_results || jsonb_build_array(jsonb_build_object(
          'toolId',v_tool_id,'result','unchanged','writes',0));
        CONTINUE;
      END IF;
      IF public.decision_manifest_current_postimage(v_tool_id,v_profile_id)->'profiles' <> '[]'::jsonb
        OR public.decision_manifest_current_postimage(v_tool_id,v_profile_id)->'decisions' <> '[]'::jsonb
        OR public.decision_manifest_current_postimage(v_tool_id,v_profile_id)->'capabilities' <> '[]'::jsonb
        OR public.decision_manifest_current_postimage(v_tool_id,v_profile_id)->'fits' <> '[]'::jsonb
        OR EXISTS (SELECT 1 FROM public.product_intelligence_profiles WHERE id=v_profile_id)
        OR EXISTS (SELECT 1 FROM public.product_intelligence_sources WHERE profile_id=v_profile_id)
        OR EXISTS (SELECT 1 FROM public.product_intelligence_claims WHERE profile_id=v_profile_id)
        OR EXISTS (SELECT 1 FROM public.product_intelligence_timeline_events WHERE profile_id=v_profile_id)
        OR EXISTS (SELECT 1 FROM public.tool_capabilities WHERE id=v_cap_id)
        OR EXISTS (SELECT 1 FROM public.tool_task_fits WHERE id=v_fit_id) THEN
        RAISE EXCEPTION 'Target preimage is not empty' USING ERRCODE='23514';
      END IF;
      SELECT min((value->>'reviewDueAt')::timestamptz) INTO v_min_due
        FROM jsonb_array_elements(v_tool->'claims');
      INSERT INTO public.product_intelligence_profiles
        (id,owner_type,owner_id,canonical_domain,product_name,profile_status,
         last_verified_at,next_review_at,metadata)
      VALUES (v_profile_id,'tool',v_tool_id,v_domain,v_tool->'profile'->>'productName',
        'ready',v_now,v_min_due,jsonb_build_object('decisionBatchHash',p_batch_hash,
          'decisionTaskId',p_task_id,'qaReference',p_qa_reference));
      v_claim_ids := '{}'::jsonb;
      FOR v_claim IN SELECT value FROM jsonb_array_elements(v_tool->'claims') LOOP
        v_key := v_claim->>'key';
        v_url := v_claim->>'sourceUrl';
        v_host := lower(split_part(split_part(substring(v_url from 9),'/',1),':',1));
        IF v_url IS NULL OR v_url !~* '^https://[a-z0-9.-]+(/[^[:space:]]*)?$'
          OR (v_host <> v_domain AND v_host <> 'www.'||v_domain
            AND right(v_host,length(v_domain)+1) <> '.'||v_domain)
          OR v_key IS NULL OR v_claim_ids ? v_key
          OR length(btrim(coalesce(v_claim->>'sourceExcerpt',''))) < 12
          OR v_claim->>'excerptVerifiedAt' IS NULL
          OR v_claim->>'sourceDate' IS NULL
          OR (v_claim->>'reviewDueAt')::timestamptz <= v_now
          OR (v_claim->>'reviewDueAt')::timestamptz > v_now+interval '90 days' THEN
          RAISE EXCEPTION 'Official excerpt, source, key or review window invalid' USING ERRCODE='23514';
        END IF;
        v_claim_id := public.decision_official_evidence_intake(
          v_profile_id,v_url,v_claim->>'sourceLabel','decision_graph',v_key,
          v_claim->'value',v_claim->>'sourceExcerpt',v_claim->'scope',
          (v_claim->>'reviewDueAt')::timestamptz,p_reviewer);
        v_claim_ids := v_claim_ids || jsonb_build_object(v_key,v_claim_id);
      END LOOP;
      UPDATE public.product_intelligence_profiles SET next_review_at=v_min_due
        WHERE id=v_profile_id;
      INSERT INTO public.tool_decision_profiles
        (tool_id,setup_complexity,data_training_use,self_host_level,export_level,
         decision_summary,watch_outs,editorial_status,reviewed_at,review_due_at,reviewed_by)
      VALUES (v_tool_id,'unknown','unknown','unknown','unknown',
        v_tool->'decisionProfile'->'summary',v_tool->'decisionProfile'->'watchOuts',
        'reviewed',v_now,v_now+interval '30 days',p_reviewer);
      INSERT INTO public.tool_capabilities
        (id,tool_id,capability_id,support_level,availability,plan_requirement,
         limitations,status,reviewed_at,review_due_at,reviewed_by,last_edited_by)
      VALUES (v_cap_id,v_tool_id,p_capability_id,
        v_tool->'toolCapability'->>'supportLevel',v_tool->>'availability',
        v_tool->'toolCapability'->'planRequirement',v_tool->'toolCapability'->'limitations',
        'reviewed',v_now,v_now+interval '30 days',p_reviewer,p_reviewer);
      INSERT INTO public.tool_task_fits
        (id,tool_id,task_id,fit_level,rationale,required_conditions,disqualifiers,
         status,reviewed_at,review_due_at,reviewed_by,last_edited_by)
      VALUES (v_fit_id,v_tool_id,p_task_id,v_tool->>'fitLevel',v_tool->'fit'->'rationale',
        v_tool->'fit'->'requiredConditions',v_tool->'fit'->'disqualifiers',
        'reviewed',v_now,v_now+interval '30 days',p_reviewer,p_reviewer);
      FOREACH v_purpose IN ARRAY ARRAY['support','availability','plan','limitation'] LOOP
        v_key := v_tool->'purposeLinks'->'capability'->>v_purpose;
        IF v_key IS NULL OR v_claim_ids->>v_key IS NULL THEN
          RAISE EXCEPTION 'Capability purpose lacks verified claim' USING ERRCODE='23514';
        END IF;
        INSERT INTO public.tool_capability_claims(tool_capability_id,claim_id,purpose)
          VALUES (v_cap_id,(v_claim_ids->>v_key)::uuid,v_purpose);
      END LOOP;
      FOREACH v_purpose IN ARRAY ARRAY['fit','limitation'] LOOP
        v_key := v_tool->'purposeLinks'->'fit'->>v_purpose;
        IF v_key IS NULL OR v_claim_ids->>v_key IS NULL THEN
          RAISE EXCEPTION 'Fit purpose lacks verified claim' USING ERRCODE='23514';
        END IF;
        INSERT INTO public.tool_task_fit_claims(fit_id,claim_id,purpose)
          VALUES (v_fit_id,(v_claim_ids->>v_key)::uuid,v_purpose);
      END LOOP;
      v_key := v_tool->'purposeLinks'->'fit'->>'fit';
      INSERT INTO public.tool_decision_profile_claims(tool_id,claim_id,purpose)
        VALUES (v_tool_id,(v_claim_ids->>v_key)::uuid,'fit');
      v_postimage := public.decision_manifest_current_postimage(v_tool_id,v_profile_id);
      IF jsonb_array_length(v_postimage->'profiles')<>1
        OR jsonb_array_length(v_postimage->'sources')<2
        OR jsonb_array_length(v_postimage->'claims')<>(v_tool->>'expectedClaims')::integer
        OR jsonb_array_length(v_postimage->'timeline')<>(v_tool->>'expectedClaims')::integer
        OR jsonb_array_length(v_postimage->'decisions')<>1
        OR jsonb_array_length(v_postimage->'capabilities')<>1
        OR jsonb_array_length(v_postimage->'fits')<>1
        OR jsonb_array_length(v_postimage->'capabilityLinks')<>4
        OR jsonb_array_length(v_postimage->'fitLinks')<>2
        OR jsonb_array_length(v_postimage->'decisionLinks')<>1 THEN
        RAISE EXCEPTION 'Full target postimage cardinality failed' USING ERRCODE='23514';
      END IF;
      INSERT INTO public.decision_manifest_batch_records
        (batch_hash,tool_id,profile_id,reviewer_id,qa_reference,postimage)
      VALUES (p_batch_hash,v_tool_id,v_profile_id,p_reviewer,p_qa_reference,v_postimage);
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'toolId',v_tool_id,'result','created','profileId',v_profile_id,
        'capabilityId',v_cap_id,'fitId',v_fit_id,
        'claims',(v_tool->>'expectedClaims')::integer,'links',7));
    END LOOP;
    IF NOT p_commit THEN
      RAISE EXCEPTION 'rollback probe' USING ERRCODE='P1B01';
    END IF;
  EXCEPTION WHEN SQLSTATE 'P1B01' THEN
    IF p_commit THEN RAISE; END IF;
    RETURN jsonb_build_object('ok',true,'mode','preflight_rolled_back',
      'batchHash',p_batch_hash,'results',v_results,'productionWrites',0);
  END;
  RETURN jsonb_build_object('ok',true,'mode','committed',
    'batchHash',p_batch_hash,'results',v_results);
END;
$$;

-- Exact-ID revert; never delete all evidence selected only by profile_id.
CREATE OR REPLACE FUNCTION public.decision_manifest_batch_revert(
  p_task_id uuid, p_capability_id uuid, p_task_preimage jsonb, p_tools jsonb,
  p_batch_hash text, p_reviewer uuid, p_qa_reference text DEFAULT '',
  p_commit boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_check jsonb;
  v_tool jsonb;
  v_record public.decision_manifest_batch_records%ROWTYPE;
  v_post jsonb;
  v_result jsonb := '[]'::jsonb;
  v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role required' USING ERRCODE='42501';
  END IF;
  IF p_commit IS NULL OR coalesce(p_qa_reference,'') !~
    '^codex-thread:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Independent QA reference required' USING ERRCODE='23514';
  END IF;
  v_check := public.decision_manifest_batch_intake(p_task_id,p_capability_id,
    p_task_preimage,p_tools,p_batch_hash,p_reviewer,p_qa_reference,true);
  IF v_check->>'mode' IS DISTINCT FROM 'committed' OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_check->'results') item
    WHERE item->>'result' IS DISTINCT FROM 'unchanged') THEN
    RAISE EXCEPTION 'Exact unchanged batch postimage required' USING ERRCODE='23514';
  END IF;
  BEGIN
    FOR v_tool IN SELECT value FROM jsonb_array_elements(p_tools) LOOP
      SELECT * INTO v_record FROM public.decision_manifest_batch_records
        WHERE tool_id=(v_tool->>'toolId')::uuid FOR UPDATE;
      v_post := v_record.postimage;
      IF NOT FOUND OR v_post IS DISTINCT FROM public.decision_manifest_current_postimage(
        v_record.tool_id,v_record.profile_id) THEN
        RAISE EXCEPTION 'Batch record or postimage drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_capability_claims l USING jsonb_array_elements(v_post->'capabilityLinks') e
        WHERE l.tool_capability_id=(e->>'tool_capability_id')::uuid
          AND l.claim_id=(e->>'claim_id')::uuid AND l.purpose=e->>'purpose';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'capabilityLinks') THEN
        RAISE EXCEPTION 'Capability link count drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_task_fit_claims l USING jsonb_array_elements(v_post->'fitLinks') e
        WHERE l.fit_id=(e->>'fit_id')::uuid AND l.claim_id=(e->>'claim_id')::uuid
          AND l.purpose=e->>'purpose';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'fitLinks') THEN
        RAISE EXCEPTION 'Fit link count drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_decision_profile_claims l USING jsonb_array_elements(v_post->'decisionLinks') e
        WHERE l.tool_id=(e->>'tool_id')::uuid AND l.claim_id=(e->>'claim_id')::uuid
          AND l.purpose=e->>'purpose';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'decisionLinks') THEN
        RAISE EXCEPTION 'Decision link count drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_task_fits f USING jsonb_array_elements(v_post->'fits') e
        WHERE f.id=(e->>'id')::uuid AND f.updated_at=(e->>'updated_at')::timestamptz
          AND f.status='reviewed';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'fits') THEN
        RAISE EXCEPTION 'Fit version drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_capabilities c USING jsonb_array_elements(v_post->'capabilities') e
        WHERE c.id=(e->>'id')::uuid AND c.updated_at=(e->>'updated_at')::timestamptz
          AND c.status='reviewed';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'capabilities') THEN
        RAISE EXCEPTION 'Capability version drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.tool_decision_profiles d USING jsonb_array_elements(v_post->'decisions') e
        WHERE d.tool_id=(e->>'tool_id')::uuid AND d.updated_at=(e->>'updated_at')::timestamptz
          AND d.editorial_status='reviewed';
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'decisions') THEN
        RAISE EXCEPTION 'Decision version drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.product_intelligence_timeline_events t
        USING jsonb_array_elements(v_post->'timeline') e WHERE t.id=(e->>'id')::uuid;
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'timeline') THEN
        RAISE EXCEPTION 'Timeline IDs drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.product_intelligence_claims c
        USING jsonb_array_elements(v_post->'claims') e WHERE c.id=(e->>'id')::uuid;
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'claims') THEN
        RAISE EXCEPTION 'Claim IDs drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.product_intelligence_sources s
        USING jsonb_array_elements(v_post->'sources') e WHERE s.id=(e->>'id')::uuid;
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>jsonb_array_length(v_post->'sources') THEN
        RAISE EXCEPTION 'Source IDs drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.product_intelligence_profiles p
        USING jsonb_array_elements(v_post->'profiles') e
        WHERE p.id=(e->>'id')::uuid AND p.owner_id=v_record.tool_id
          AND p.updated_at=(e->>'updated_at')::timestamptz;
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>1 THEN
        RAISE EXCEPTION 'Profile version drifted' USING ERRCODE='23514';
      END IF;
      DELETE FROM public.decision_manifest_batch_records
        WHERE tool_id=v_record.tool_id AND batch_hash=p_batch_hash;
      GET DIAGNOSTICS v_count=ROW_COUNT;
      IF v_count<>1 THEN
        RAISE EXCEPTION 'Batch record drifted' USING ERRCODE='23514';
      END IF;
      v_result := v_result || jsonb_build_array(jsonb_build_object(
        'toolId',v_record.tool_id,'result','reverted'));
    END LOOP;
    IF NOT p_commit THEN
      RAISE EXCEPTION 'rollback probe' USING ERRCODE='P1B01';
    END IF;
  EXCEPTION WHEN SQLSTATE 'P1B01' THEN
    RETURN jsonb_build_object('ok',true,'mode','revert_preflight_rolled_back',
      'batchHash',p_batch_hash,'results',v_result,'productionWrites',0);
  END;
  RETURN jsonb_build_object('ok',true,'mode','reverted','batchHash',p_batch_hash,'results',v_result);
END;
$$;

REVOKE ALL ON FUNCTION public.decision_manifest_canonical_jsonb(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decision_manifest_current_postimage(uuid,uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decision_manifest_batch_intake(uuid,uuid,jsonb,jsonb,text,uuid,text,boolean)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decision_manifest_batch_revert(uuid,uuid,jsonb,jsonb,text,uuid,text,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decision_manifest_canonical_jsonb(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.decision_manifest_current_postimage(uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.decision_manifest_batch_intake(uuid,uuid,jsonb,jsonb,text,uuid,text,boolean)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.decision_manifest_batch_revert(uuid,uuid,jsonb,jsonb,text,uuid,text,boolean)
  TO service_role;

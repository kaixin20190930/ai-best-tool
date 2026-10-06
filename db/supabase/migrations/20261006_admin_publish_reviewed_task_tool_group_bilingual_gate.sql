-- Supersedes the 20261004 publication content gate; no content or status backfill.
-- Publish one reviewed Tool Capability + Fit group for an already-published
-- Task Capability set. This is intentionally narrower than Task Page approval.
CREATE OR REPLACE FUNCTION public.admin_publish_reviewed_task_tool_group(
  p_task_id uuid,
  p_tool_id uuid,
  p_tool_capabilities jsonb,
  p_fits jsonb,
  p_reviewer uuid,
  p_qa_reference text,
  p_preflight boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_task_slug text;
  v_fit jsonb;
  v_capability jsonb;
  v_row record;
  v_due timestamptz;
  v_evidence jsonb := '[]'::jsonb;
  v_link_fingerprint jsonb := '[]'::jsonb;
  v_seen uuid[] := ARRAY[]::uuid[];
  v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' OR p_reviewer IS NULL OR
     NOT EXISTS (SELECT 1 FROM auth.users WHERE id=p_reviewer) THEN
    RAISE EXCEPTION 'service_role and a real reviewer are required' USING ERRCODE='42501';
  END IF;
  IF p_task_id IS NULL OR p_tool_id IS NULL OR p_fits IS NULL OR jsonb_typeof(p_fits)<>'array' OR
     jsonb_array_length(p_fits)=0 OR p_tool_capabilities IS NULL OR
     jsonb_typeof(p_tool_capabilities)<>'array' OR jsonb_array_length(p_tool_capabilities)=0 OR
     (NOT coalesce(p_preflight,false) AND length(btrim(coalesce(p_qa_reference,'')))<8) THEN
    RAISE EXCEPTION 'A nonempty exact reviewed group and QA reference are required' USING ERRCODE='23514';
  END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
      ('public.decision_tasks'::regclass,'public.task_capabilities'::regclass,
       'public.decision_capabilities'::regclass,'public.tool_decision_profiles'::regclass,
       'public.tool_decision_profile_claims'::regclass,'public.tool_capabilities'::regclass,
       'public.tool_task_fits'::regclass,'public.tool_capability_claims'::regclass,
       'public.tool_task_fit_claims'::regclass,'public.product_intelligence_profiles'::regclass,
       'public.product_intelligence_sources'::regclass,'public.product_intelligence_claims'::regclass,
       'public.product_intelligence_timeline_events'::regclass)
      AND relrowsecurity)<>13 THEN
    RAISE EXCEPTION 'Reviewed group publication requires RLS' USING ERRCODE='23514';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('reviewed-task-tool-group:'||p_task_id::text||':'||p_tool_id::text));
  SELECT slug INTO v_task_slug FROM public.decision_tasks WHERE id=p_task_id AND status='active' FOR UPDATE;
  IF v_task_slug IS DISTINCT FROM 'research-with-citations' THEN
    RAISE EXCEPTION 'Task is outside this reviewed-group release scope' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tool_decision_profiles d WHERE d.tool_id=p_tool_id
      AND d.editorial_status='reviewed' AND d.reviewed_by IS NOT NULL AND d.reviewed_at<=v_now
      AND d.review_due_at>v_now) THEN
    RAISE EXCEPTION 'Tool Decision must have a current reviewed owner record' USING ERRCODE='23514';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('entity',x.entity,'relationId',x.relation_id,
    'claimId',x.claim_id,'purpose',x.purpose,'claimProfileId',x.claim_profile_id,
    'sourceProfileId',x.source_profile_id,'verificationStatus',x.verification_status,
    'conflictStatus',x.conflict_status,'invalidatedAt',x.invalidated_at,'expiresAt',x.expires_at,
    'reviewDueAt',x.review_due_at,'claimSourceUrl',x.source_url,'claimSourceType',x.source_type,
    'sourceUrl',x.source_actual_url,'sourceType',x.source_actual_type,'sourceFetchStatus',x.fetch_status,
    'sourceLastVerifiedAt',x.last_verified_at,'ownerType',x.owner_type,'ownerId',x.owner_id,
    'profileStatus',x.profile_status,'profileReviewDueAt',x.profile_review_due_at)
    ORDER BY x.entity,x.relation_id,x.purpose,x.claim_id),'[]'::jsonb) INTO v_link_fingerprint
  FROM (
    SELECT 'tool_capability'::text entity,l.tool_capability_id relation_id,l.claim_id,l.purpose,
      c.profile_id claim_profile_id,s.profile_id source_profile_id,c.verification_status,c.conflict_status,
      c.invalidated_at,c.expires_at,c.review_due_at,c.source_url,c.source_type,s.url source_actual_url,
      s.source_type source_actual_type,s.fetch_status,s.last_verified_at,p.owner_type,p.owner_id,p.profile_status,
      p.next_review_at profile_review_due_at
    FROM public.tool_capability_claims l
    JOIN public.tool_capabilities tc ON tc.id=l.tool_capability_id
    LEFT JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    LEFT JOIN public.product_intelligence_sources s ON s.id=c.source_id
    LEFT JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    WHERE tc.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
    UNION ALL
    SELECT 'fit',l.fit_id,l.claim_id,l.purpose,c.profile_id,s.profile_id,c.verification_status,c.conflict_status,
      c.invalidated_at,c.expires_at,c.review_due_at,c.source_url,c.source_type,s.url,s.source_type,s.fetch_status,
      s.last_verified_at,p.owner_type,p.owner_id,p.profile_status,p.next_review_at
    FROM public.tool_task_fit_claims l
    JOIN public.tool_task_fits f ON f.id=l.fit_id
    LEFT JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    LEFT JOIN public.product_intelligence_sources s ON s.id=c.source_id
    LEFT JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
  ) x;

  IF NOT coalesce(p_preflight,false) AND
     (SELECT count(*) FROM public.tool_capabilities tc
       WHERE tc.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
         AND tc.tool_id=p_tool_id AND tc.status='published')=jsonb_array_length(p_tool_capabilities) AND
     (SELECT count(*) FROM public.tool_task_fits f
       WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
         AND f.task_id=p_task_id AND f.tool_id=p_tool_id AND f.status='published')=jsonb_array_length(p_fits) AND
     (SELECT count(*) FROM public.tool_capabilities tc
       JOIN public.task_capabilities taskc ON taskc.task_id=p_task_id AND taskc.capability_id=tc.capability_id
       WHERE tc.tool_id=p_tool_id)=jsonb_array_length(p_tool_capabilities) AND
     (SELECT count(*) FROM public.tool_task_fits f WHERE f.task_id=p_task_id AND f.tool_id=p_tool_id)
       =jsonb_array_length(p_fits) AND
     EXISTS (SELECT 1 FROM public.product_intelligence_timeline_events e
       JOIN public.product_intelligence_profiles p ON p.id=e.profile_id
       WHERE p.owner_type='tool' AND p.owner_id=p_tool_id AND e.event_type='decision_publication'
         AND e.review_scope='decision' AND e.claim_type='decision_cluster' AND e.claim_key=p_task_id::text
         AND e.metadata->>'toolId'=p_tool_id::text AND e.metadata->>'qaReference'=btrim(p_qa_reference)
         AND (SELECT count(*) FROM jsonb_array_elements(e.metadata->'toolCapabilities'))=jsonb_array_length(p_tool_capabilities)
         AND (SELECT count(*) FROM jsonb_array_elements(e.metadata->'fits'))=jsonb_array_length(p_fits)
         AND e.metadata->'toolCapabilities'=p_tool_capabilities
         AND e.metadata->'fits'=p_fits
         AND e.metadata->'linkFingerprint'=v_link_fingerprint
         AND NOT EXISTS (
           SELECT 1 FROM jsonb_array_elements(v_link_fingerprint) evidence
           WHERE evidence->>'verificationStatus'<>'verified' OR evidence->>'conflictStatus'<>'none' OR
             evidence->>'invalidatedAt' IS NOT NULL OR
             (evidence->>'expiresAt' IS NOT NULL AND (evidence->>'expiresAt')::timestamptz<=v_now) OR
             (evidence->>'reviewDueAt')::timestamptz<=v_now OR
             (evidence->>'profileReviewDueAt')::timestamptz<=v_now OR
             evidence->>'claimProfileId' IS DISTINCT FROM evidence->>'sourceProfileId' OR
             evidence->>'claimSourceUrl' IS DISTINCT FROM evidence->>'sourceUrl' OR
             evidence->>'claimSourceType'<>'official' OR evidence->>'sourceType'<>'official' OR
             evidence->>'sourceFetchStatus'<>'success' OR evidence->>'ownerType'<>'tool' OR
             evidence->>'ownerId' IS DISTINCT FROM p_tool_id::text OR evidence->>'profileStatus'<>'ready'))
  THEN
    RETURN jsonb_build_object('ok',true,'preflight',false,'unchanged',true,'taskId',p_task_id,
      'toolId',p_tool_id,'toolCapabilityCount',jsonb_array_length(p_tool_capabilities),
      'fitCount',jsonb_array_length(p_fits));
  END IF;
  IF NOT coalesce(p_preflight,false) AND
     (SELECT count(*) FROM public.tool_capabilities tc
       WHERE tc.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
         AND tc.tool_id=p_tool_id AND tc.status='published')=jsonb_array_length(p_tool_capabilities) AND
     (SELECT count(*) FROM public.tool_task_fits f
       WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
         AND f.task_id=p_task_id AND f.tool_id=p_tool_id AND f.status='published')=jsonb_array_length(p_fits) THEN
    RAISE EXCEPTION 'Published group manifest preimage mismatch' USING ERRCODE='23514';
  END IF;

  -- The Task and its capabilities remain published and are checked, never changed.
  IF NOT EXISTS (SELECT 1 FROM public.task_capabilities tc
      JOIN public.decision_capabilities dc ON dc.id=tc.capability_id
      WHERE tc.task_id=p_task_id AND tc.status='published' AND dc.status='active'
        AND tc.reviewed_by IS NOT NULL AND tc.reviewed_at<=v_now AND tc.review_due_at>v_now)
     OR EXISTS (SELECT 1 FROM public.task_capabilities tc
      WHERE tc.task_id=p_task_id AND (tc.status<>'published' OR tc.reviewed_by IS NULL
        OR tc.reviewed_at IS NULL OR tc.review_due_at IS NULL OR tc.review_due_at<=v_now)) THEN
    RAISE EXCEPTION 'All Task Capabilities must remain published with current reviews' USING ERRCODE='23514';
  END IF;

  IF cardinality(ARRAY(SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities)))
      <> jsonb_array_length(p_tool_capabilities) OR
     (SELECT count(*) FROM public.tool_capabilities tc
       JOIN public.task_capabilities taskc ON taskc.task_id=p_task_id AND taskc.capability_id=tc.capability_id
       WHERE tc.tool_id=p_tool_id) <> jsonb_array_length(p_tool_capabilities) THEN
    RAISE EXCEPTION 'Manifest must contain every exact Tool Capability for this Task/tool' USING ERRCODE='23514';
  END IF;
  FOR v_capability IN SELECT value FROM jsonb_array_elements(p_tool_capabilities) LOOP
    IF coalesce(v_capability->>'status','')<>'reviewed' OR
       coalesce(v_capability->>'id','') !~* '^[0-9a-f-]{36}$' OR
       coalesce(v_capability->>'updated_at','')='' OR
       (v_capability->>'id')::uuid=ANY(v_seen) THEN
      RAISE EXCEPTION 'Incomplete or duplicate Tool Capability preimage' USING ERRCODE='23514';
    END IF;
    v_seen:=array_append(v_seen,(v_capability->>'id')::uuid);
    SELECT tc.* INTO v_row FROM public.tool_capabilities tc
      JOIN public.task_capabilities taskc ON taskc.task_id=p_task_id AND taskc.capability_id=tc.capability_id
      JOIN public.decision_capabilities dc ON dc.id=tc.capability_id AND dc.status='active'
      WHERE tc.id=(v_capability->>'id')::uuid AND tc.tool_id=p_tool_id FOR UPDATE OF tc;
    IF NOT FOUND OR v_row.status<>'reviewed' OR
       v_row.updated_at<>(v_capability->>'updated_at')::timestamptz OR
       v_row.reviewed_by IS NULL OR v_row.reviewed_at IS NULL OR v_row.reviewed_at>v_now OR
       v_row.review_due_at IS NULL OR v_row.review_due_at<=v_now OR
       v_row.support_level IS NULL OR v_row.support_level='unknown' THEN
      RAISE EXCEPTION 'Tool Capability is stale, unreviewed, or incomplete' USING ERRCODE='23514';
    END IF;
    -- Bilingual editorial contract: no legacy string-array fallback. Historical
    -- strings must be translated and re-reviewed through Admin before release.
    IF v_row.availability IS NULL OR v_row.availability='unknown' THEN
      RAISE EXCEPTION 'Tool Capability %: availability is unknown or missing', v_row.id USING ERRCODE='23514';
    END IF;
    IF (CASE WHEN jsonb_typeof(v_row.plan_requirement) IS DISTINCT FROM 'object' THEN true
      ELSE jsonb_typeof(v_row.plan_requirement->'en') IS DISTINCT FROM 'string' OR
        jsonb_typeof(v_row.plan_requirement->'cn') IS DISTINCT FROM 'string' OR
        length(btrim(coalesce(v_row.plan_requirement->>'en',''), E' \t\n\r\f\013'))<3 OR
        length(btrim(coalesce(v_row.plan_requirement->>'cn',''), E' \t\n\r\f\013'))<3 OR
        EXISTS (SELECT 1 FROM jsonb_each(v_row.plan_requirement) x
          WHERE jsonb_typeof(x.value)<>'string' OR length(btrim(x.value #>> '{}', E' \t\n\r\f\013'))<3)
      END) THEN
      RAISE EXCEPTION 'Tool Capability %: plan_requirement requires en/cn strings of at least 3 characters', v_row.id USING ERRCODE='23514';
    END IF;
    IF (CASE WHEN jsonb_typeof(v_row.limitations) IS DISTINCT FROM 'array' THEN true
      ELSE jsonb_array_length(v_row.limitations)=0 OR
        EXISTS (SELECT 1 FROM jsonb_array_elements(v_row.limitations) x
          WHERE jsonb_typeof(x.value) IS DISTINCT FROM 'object' OR
            jsonb_typeof(x.value->'en') IS DISTINCT FROM 'string' OR
            jsonb_typeof(x.value->'cn') IS DISTINCT FROM 'string' OR
            length(btrim(coalesce(x.value->>'en',''), E' \t\n\r\f\013'))<8 OR
            length(btrim(coalesce(x.value->>'cn',''), E' \t\n\r\f\013'))<8)
      END) THEN
      RAISE EXCEPTION 'Tool Capability %: limitations require a nonempty bilingual object array with en/cn strings of at least 8 characters', v_row.id USING ERRCODE='23514';
    END IF;
    IF EXISTS (SELECT 1 FROM public.tool_task_fits other_fit
        JOIN public.task_capabilities other_task ON other_task.task_id=other_fit.task_id
          AND other_task.capability_id=v_row.capability_id
        WHERE other_fit.task_id<>p_task_id AND other_fit.tool_id=p_tool_id
          AND other_fit.status='published' AND other_task.status='published') THEN
      RAISE EXCEPTION 'Tool Capability conflicts with an already-published Task fit' USING ERRCODE='23514';
    END IF;
    IF NOT ARRAY['support','availability','plan','limitation']::text[] <@
       ARRAY(SELECT l.purpose FROM public.tool_capability_claims l WHERE l.tool_capability_id=v_row.id) THEN
      RAISE EXCEPTION 'Tool Capability requires support, availability, plan, and limitation evidence' USING ERRCODE='23514';
    END IF;
  END LOOP;

  IF (SELECT count(*) FROM public.tool_task_fits WHERE task_id=p_task_id AND tool_id=p_tool_id)
       <> jsonb_array_length(p_fits) THEN
    RAISE EXCEPTION 'Manifest must contain every exact Fit for this Task/tool' USING ERRCODE='23514';
  END IF;
  v_seen:=ARRAY[]::uuid[];
  FOR v_fit IN SELECT value FROM jsonb_array_elements(p_fits) LOOP
    IF coalesce(v_fit->>'status','')<>'reviewed' OR
       coalesce(v_fit->>'id','') !~* '^[0-9a-f-]{36}$' OR coalesce(v_fit->>'updated_at','')='' OR
       (v_fit->>'id')::uuid=ANY(v_seen) THEN
      RAISE EXCEPTION 'Incomplete or duplicate Fit preimage' USING ERRCODE='23514';
    END IF;
    v_seen:=array_append(v_seen,(v_fit->>'id')::uuid);
    SELECT f.* INTO v_row FROM public.tool_task_fits f WHERE f.id=(v_fit->>'id')::uuid
      AND f.task_id=p_task_id AND f.tool_id=p_tool_id FOR UPDATE;
    IF NOT FOUND OR v_row.status<>'reviewed' OR v_row.updated_at<>(v_fit->>'updated_at')::timestamptz OR
       v_row.reviewed_by IS NULL OR v_row.reviewed_at IS NULL OR v_row.reviewed_at>v_now OR
       v_row.review_due_at IS NULL OR v_row.review_due_at<=v_now OR
       jsonb_typeof(v_row.rationale)<>'object' OR
       length(btrim(coalesce(v_row.rationale->>'en','')))<20 OR
       length(btrim(coalesce(v_row.rationale->>'cn','')))<12 OR
       jsonb_typeof(v_row.required_conditions)<>'array' OR jsonb_array_length(v_row.required_conditions)=0 OR
       jsonb_typeof(v_row.disqualifiers)<>'array' OR jsonb_array_length(v_row.disqualifiers)=0 OR
       EXISTS (SELECT 1 FROM jsonb_array_elements(v_row.required_conditions) x
         WHERE length(btrim(coalesce(x.value->>'en','')))<8 OR length(btrim(coalesce(x.value->>'cn','')))<8) OR
       EXISTS (SELECT 1 FROM jsonb_array_elements(v_row.disqualifiers) x
         WHERE length(btrim(coalesce(x.value->>'en','')))<8 OR length(btrim(coalesce(x.value->>'cn','')))<8) THEN
      RAISE EXCEPTION 'Fit is stale, unreviewed, or has incomplete bilingual rationale/conditions/disqualifiers' USING ERRCODE='23514';
    END IF;
    IF NOT ARRAY['fit','limitation']::text[] <@
       ARRAY(SELECT l.purpose FROM public.tool_task_fit_claims l WHERE l.fit_id=v_row.id) THEN
      RAISE EXCEPTION 'Fit requires fit and limitation evidence' USING ERRCODE='23514';
    END IF;
    IF p_tool_id='cec78907-e2a1-4eb7-853a-a58334026280' AND
       (v_row.rationale->>'en' NOT ILIKE '%selects or supplies and imports into a notebook%' OR
        v_row.rationale->>'en' NOT ILIKE '%not open-web search%' OR
        v_row.rationale->>'cn' NOT LIKE '%用户选择/提供并导入 notebook%' OR
        v_row.rationale->>'cn' NOT LIKE '%不等同于开放网页检索%') THEN
      RAISE EXCEPTION 'Gemini Notebook rationale must distinguish user-selected imported notebook material from open-web search' USING ERRCODE='23514';
    END IF;
    IF p_tool_id='3d018623-85f9-4df4-bd55-9a4a0e7a2d93' AND
       (v_row.rationale->>'en' NOT ILIKE '%open-web%' OR v_row.rationale->>'en' NOT ILIKE '%cited answers%' OR
        v_row.rationale->>'cn' NOT LIKE '%开放网页发现%' OR v_row.rationale->>'cn' NOT LIKE '%带来源回答%') THEN
      RAISE EXCEPTION 'Perplexity rationale must state its open-web discovery and cited-answer role' USING ERRCODE='23514';
    END IF;
  END LOOP;

  -- Every linked claim must be verified, current, official, and owned by this tool.
  FOR v_row IN
    SELECT c.id FROM public.tool_capability_claims l
      JOIN public.tool_capabilities tc ON tc.id=l.tool_capability_id
      JOIN public.product_intelligence_claims c ON c.id=l.claim_id
      JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
      JOIN public.product_intelligence_sources s ON s.id=c.source_id
      WHERE tc.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
      FOR SHARE OF l,c,p,s
  LOOP NULL; END LOOP;
  FOR v_row IN
    SELECT c.id FROM public.tool_task_fit_claims l
      JOIN public.tool_task_fits f ON f.id=l.fit_id
      JOIN public.product_intelligence_claims c ON c.id=l.claim_id
      JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
      JOIN public.product_intelligence_sources s ON s.id=c.source_id
      WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
      FOR SHARE OF l,c,p,s
  LOOP NULL; END LOOP;
  IF EXISTS (
    SELECT 1 FROM public.tool_capability_claims l
    JOIN public.tool_capabilities tc ON tc.id=l.tool_capability_id
    LEFT JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    LEFT JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    LEFT JOIN public.product_intelligence_sources s ON s.id=c.source_id
    WHERE tc.tool_id=p_tool_id AND tc.id IN
      (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
      AND (c.id IS NULL OR p.owner_type<>'tool' OR p.owner_id<>p_tool_id OR p.profile_status<>'ready' OR
        p.next_review_at IS NULL OR p.next_review_at<=v_now OR s.profile_id IS DISTINCT FROM c.profile_id OR
        c.verification_status<>'verified' OR c.conflict_status<>'none' OR
        c.invalidated_at IS NOT NULL OR (c.expires_at IS NOT NULL AND c.expires_at<=v_now) OR
        c.verified_at IS NULL OR c.verified_by IS NULL OR c.review_due_at IS NULL OR c.review_due_at<=v_now OR
        c.source_type<>'official' OR s.source_type<>'official' OR s.fetch_status<>'success' OR
        s.last_verified_at IS NULL OR s.last_verified_at>v_now OR c.source_url IS DISTINCT FROM s.url)
  ) OR EXISTS (
    SELECT 1 FROM public.tool_task_fit_claims l
    JOIN public.tool_task_fits f ON f.id=l.fit_id
    LEFT JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    LEFT JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    LEFT JOIN public.product_intelligence_sources s ON s.id=c.source_id
    WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
      AND (c.id IS NULL OR p.owner_type<>'tool' OR p.owner_id<>p_tool_id OR p.profile_status<>'ready' OR
        p.next_review_at IS NULL OR p.next_review_at<=v_now OR s.profile_id IS DISTINCT FROM c.profile_id OR
        c.verification_status<>'verified' OR c.conflict_status<>'none' OR
        c.invalidated_at IS NOT NULL OR (c.expires_at IS NOT NULL AND c.expires_at<=v_now) OR
        c.verified_at IS NULL OR c.verified_by IS NULL OR c.review_due_at IS NULL OR c.review_due_at<=v_now OR
        c.source_type<>'official' OR s.source_type<>'official' OR s.fetch_status<>'success' OR
        s.last_verified_at IS NULL OR s.last_verified_at>v_now OR c.source_url IS DISTINCT FROM s.url)
  ) THEN
    RAISE EXCEPTION 'Linked claims must be current official same-owner evidence' USING ERRCODE='23514';
  END IF;

  SELECT min(review_due_at) INTO v_due FROM public.tool_task_fits
    WHERE id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits));
  IF v_due IS NULL OR v_due<=v_now THEN RAISE EXCEPTION 'Reviewed group is expired' USING ERRCODE='23514'; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('entity',e.entity,'relationId',e.relation_id,
    'claimId',e.claim_id,'purpose',e.purpose,'sourceUrl',e.source_url,'sourceType',e.source_type,
    'verificationStatus',e.verification_status,'conflictStatus',e.conflict_status,
    'verifiedAt',e.verified_at,'reviewDueAt',e.review_due_at,'expiresAt',e.expires_at,
    'invalidatedAt',e.invalidated_at,'sourceProfileId',e.source_profile_id,'sourceLastVerifiedAt',e.source_last_verified_at,
    'officialSource',e.official_source,'ownerMatches',e.owner_matches)
    ORDER BY e.entity,e.relation_id,e.purpose,e.claim_id),'[]'::jsonb) INTO v_evidence FROM (
    SELECT 'tool_capability'::text entity,l.tool_capability_id relation_id,c.id claim_id,l.purpose,
      c.source_url,c.source_type,c.verification_status,c.conflict_status,c.verified_at,c.review_due_at,c.expires_at,
      c.invalidated_at,s.profile_id source_profile_id,s.last_verified_at source_last_verified_at,
      (c.source_type='official' AND s.source_type='official' AND s.url=c.source_url AND s.fetch_status='success') official_source,
      (p.owner_type='tool' AND p.owner_id=p_tool_id AND p.profile_status='ready' AND s.profile_id=c.profile_id) owner_matches
    FROM public.tool_capability_claims l JOIN public.tool_capabilities tc ON tc.id=l.tool_capability_id
    JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    JOIN public.product_intelligence_sources s ON s.id=c.source_id
    WHERE tc.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
    UNION ALL
    SELECT 'fit',l.fit_id,c.id,l.purpose,c.source_url,c.source_type,c.verification_status,c.conflict_status,c.verified_at,c.review_due_at,c.expires_at,
      c.invalidated_at,s.profile_id,s.last_verified_at,
      (c.source_type='official' AND s.source_type='official' AND s.url=c.source_url AND s.fetch_status='success'),
      (p.owner_type='tool' AND p.owner_id=p_tool_id AND p.profile_status='ready' AND s.profile_id=c.profile_id)
    FROM public.tool_task_fit_claims l JOIN public.tool_task_fits f ON f.id=l.fit_id
    JOIN public.product_intelligence_claims c ON c.id=l.claim_id
    JOIN public.product_intelligence_profiles p ON p.id=c.profile_id
    JOIN public.product_intelligence_sources s ON s.id=c.source_id
    WHERE f.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
  ) e;

  IF p_preflight THEN
    RETURN jsonb_build_object('ok',true,'preflight',true,'taskId',p_task_id,'toolId',p_tool_id,
      'toolCapabilityIds',p_tool_capabilities,'fitIds',p_fits,'evidence',v_evidence);
  END IF;

  UPDATE public.tool_capabilities SET status='published',last_edited_by=p_reviewer
    WHERE id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
      AND status='reviewed' AND updated_at=(SELECT (m->>'updated_at')::timestamptz
        FROM jsonb_array_elements(p_tool_capabilities) m WHERE (m->>'id')::uuid=tool_capabilities.id);
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>jsonb_array_length(p_tool_capabilities) THEN
    RAISE EXCEPTION 'Tool Capability preimage drifted during publication' USING ERRCODE='40001';
  END IF;
  UPDATE public.tool_task_fits SET status='published',last_edited_by=p_reviewer
    WHERE id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
      AND status='reviewed' AND updated_at=(SELECT (m->>'updated_at')::timestamptz
        FROM jsonb_array_elements(p_fits) m WHERE (m->>'id')::uuid=tool_task_fits.id);
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>jsonb_array_length(p_fits) THEN
    RAISE EXCEPTION 'Fit preimage drifted during publication' USING ERRCODE='40001';
  END IF;
  INSERT INTO public.product_intelligence_timeline_events
    (profile_id,event_type,review_scope,claim_type,claim_key,title,summary,old_value,new_value,
     visibility,occurred_at,verified_at,verified_by,metadata)
  SELECT p.id,'decision_publication','decision','decision_cluster',p_task_id::text,
    'Reviewed tool group published','Exact Tool Capability and Fit manifest transitioned',
    jsonb_build_object('status','reviewed'),jsonb_build_object('status','published'),'internal',v_now,v_now,p_reviewer,
    jsonb_build_object('taskId',p_task_id,'toolId',p_tool_id,'toolCapabilities',p_tool_capabilities,
      'fits',p_fits,'qaReference',btrim(p_qa_reference),'linkFingerprint',v_link_fingerprint)
  FROM public.product_intelligence_profiles p WHERE p.owner_type='tool' AND p.owner_id=p_tool_id;
  RETURN jsonb_build_object('ok',true,'preflight',false,'taskId',p_task_id,'toolId',p_tool_id,
    'toolCapabilityCount',jsonb_array_length(p_tool_capabilities),'fitCount',jsonb_array_length(p_fits));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_publish_reviewed_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_publish_reviewed_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)
  TO service_role;

-- CL-01: one Task, one exact reviewed manifest, one transaction.
-- Tool UUIDs remain logical references to the Neon directory.

ALTER TABLE task_capabilities
  ADD COLUMN editorial_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN last_edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE tool_capabilities
  ADD COLUMN editorial_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN last_edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE tool_task_fits
  ADD COLUMN editorial_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN last_edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION record_task_capability_editorial_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF (OLD.rationale, OLD.importance, OLD.status) IS DISTINCT FROM
     (NEW.rationale, NEW.importance, NEW.status) THEN
    IF NEW.last_edited_by IS NULL THEN
      RAISE EXCEPTION 'Task Capability editor required' USING ERRCODE = '23514';
    END IF;
    NEW.editorial_history := COALESCE(OLD.editorial_history, '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object('at', clock_timestamp(), 'by', NEW.last_edited_by,
        'before', jsonb_build_object('rationale', OLD.rationale, 'importance', OLD.importance,
                                     'status', OLD.status),
        'after', jsonb_build_object('rationale', NEW.rationale, 'importance', NEW.importance,
                                    'status', NEW.status)));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER task_capability_editorial_history
  BEFORE UPDATE ON task_capabilities FOR EACH ROW
  EXECUTE FUNCTION record_task_capability_editorial_change();

CREATE OR REPLACE FUNCTION record_tool_capability_editorial_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF (OLD.support_level, OLD.availability, OLD.plan_requirement, OLD.limitations, OLD.status)
     IS DISTINCT FROM
     (NEW.support_level, NEW.availability, NEW.plan_requirement, NEW.limitations, NEW.status) THEN
    IF NEW.last_edited_by IS NULL THEN
      RAISE EXCEPTION 'Tool Capability editor required' USING ERRCODE = '23514';
    END IF;
    NEW.editorial_history := COALESCE(OLD.editorial_history, '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object('at', clock_timestamp(), 'by', NEW.last_edited_by,
        'before', jsonb_build_object('support', OLD.support_level, 'availability', OLD.availability,
          'plan', OLD.plan_requirement, 'limitations', OLD.limitations, 'status', OLD.status),
        'after', jsonb_build_object('support', NEW.support_level, 'availability', NEW.availability,
          'plan', NEW.plan_requirement, 'limitations', NEW.limitations, 'status', NEW.status)));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER tool_capability_editorial_history
  BEFORE UPDATE ON tool_capabilities FOR EACH ROW
  EXECUTE FUNCTION record_tool_capability_editorial_change();

CREATE OR REPLACE FUNCTION record_fit_editorial_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF (OLD.status, OLD.rationale, OLD.required_conditions, OLD.disqualifiers)
     IS DISTINCT FROM
     (NEW.status, NEW.rationale, NEW.required_conditions, NEW.disqualifiers) THEN
    NEW.editorial_history := COALESCE(OLD.editorial_history, '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object('at', clock_timestamp(), 'by', NEW.last_edited_by,
        'before', jsonb_build_object('status', OLD.status, 'rationale', OLD.rationale,
          'conditions', OLD.required_conditions, 'disqualifiers', OLD.disqualifiers),
        'after', jsonb_build_object('status', NEW.status, 'rationale', NEW.rationale,
          'conditions', NEW.required_conditions, 'disqualifiers', NEW.disqualifiers)));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER fit_editorial_history
  BEFORE UPDATE ON tool_task_fits FOR EACH ROW
  EXECUTE FUNCTION record_fit_editorial_change();

CREATE OR REPLACE FUNCTION lock_cl01_published_fit_evidence()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE v_status text; v_old uuid; v_new uuid;
BEGIN
  IF TG_OP <> 'INSERT' THEN v_old := OLD.fit_id; END IF;
  IF TG_OP <> 'DELETE' THEN v_new := NEW.fit_id; END IF;
  FOR v_status IN
    SELECT fit.status FROM tool_task_fits fit
    JOIN decision_tasks task ON task.id = fit.task_id
    WHERE fit.id IN (v_old, v_new)
      AND task.slug IN ('research-with-citations', 'product-image-to-short-video',
        'build-app-with-ai', 'ai-voiceover', 'brand-constrained-marketing-content')
    FOR UPDATE OF fit
  LOOP
    IF v_status = 'published' THEN
      RAISE EXCEPTION 'Published CL-01 Fit evidence links are locked' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER cl01_fit_evidence_lock
  BEFORE INSERT OR UPDATE OR DELETE ON tool_task_fit_claims
  FOR EACH ROW EXECUTE FUNCTION lock_cl01_published_fit_evidence();

ALTER TABLE product_intelligence_timeline_events
  DROP CONSTRAINT IF EXISTS product_intelligence_timeline_events_event_type_check;
ALTER TABLE product_intelligence_timeline_events
  ADD CONSTRAINT product_intelligence_timeline_events_event_type_check
  CHECK (event_type IN ('fact_added', 'fact_changed', 'fact_removed', 'reviewed_no_change',
                       'decision_publication', 'decision_withdrawal'));

CREATE OR REPLACE FUNCTION decision_official_evidence_intake(
  p_profile_id uuid, p_url text, p_label text, p_claim_type text, p_claim_key text,
  p_claim_value jsonb, p_excerpt text, p_validity_scope jsonb,
  p_review_due_at timestamptz, p_reviewer uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_profile product_intelligence_profiles%ROWTYPE;
  v_existing_source product_intelligence_sources%ROWTYPE;
  v_source_id uuid;
  v_claim product_intelligence_claims%ROWTYPE;
  v_host text;
  v_canonical_host text;
  v_domain text;
  v_now timestamptz := clock_timestamp();
  v_claim_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role required' USING ERRCODE = '42501';
  END IF;
  IF p_reviewer IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_reviewer)
    OR p_review_due_at IS NULL OR p_review_due_at <= v_now
    OR p_review_due_at > v_now + interval '90 days'
    OR p_validity_scope IS NULL OR jsonb_typeof(p_validity_scope) <> 'object'
    OR p_validity_scope = '{}'::jsonb
    OR p_claim_value IS NULL OR p_claim_value = 'null'::jsonb
    OR length(btrim(p_claim_value::text)) < 5
    OR length(btrim(coalesce(p_excerpt, ''))) < 12
    OR length(btrim(coalesce(p_label, ''))) < 3
    OR length(btrim(coalesce(p_claim_type, ''))) < 2
    OR p_claim_type !~ '^[a-z][a-z0-9_]*$'
    OR p_claim_key !~ '^[a-z0-9][a-z0-9:_./-]{2,}$' THEN
    RAISE EXCEPTION 'Incomplete evidence review' USING ERRCODE = '23514';
  END IF;
  IF p_url IS NULL OR p_url !~* '^https://[a-z0-9.-]+(:[0-9]{1,5})?(/[^[:space:]]*)?$' THEN
    RAISE EXCEPTION 'Official HTTPS URL required' USING ERRCODE = '23514';
  END IF;
  v_host := lower(split_part(split_part(substring(p_url from 9), '/', 1), ':', 1));
  SELECT * INTO v_profile FROM product_intelligence_profiles
    WHERE id = p_profile_id AND owner_type = 'tool' FOR UPDATE;
  IF NOT FOUND OR v_profile.profile_status <> 'ready' THEN
    RAISE EXCEPTION 'Current tool profile required' USING ERRCODE = '23514';
  END IF;
  v_domain := lower(regexp_replace(v_profile.canonical_domain, '^www\.', ''));
  IF v_host <> v_domain AND v_host <> 'www.' || v_domain
     AND right(v_host, length(v_domain) + 1) <> '.' || v_domain THEN
    RAISE EXCEPTION 'Source host does not belong to canonical domain' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM product_intelligence_claims
    WHERE profile_id = p_profile_id AND claim_key = p_claim_key AND source_url <> p_url
      AND invalidated_at IS NULL AND verification_status IN ('candidate', 'verified')
  ) THEN
    RAISE EXCEPTION 'Claim key already has a different active source' USING ERRCODE = '23505';
  END IF;
  IF (SELECT count(*) FROM product_intelligence_claims
      WHERE profile_id = p_profile_id AND claim_key = p_claim_key
        AND invalidated_at IS NULL AND verification_status IN ('candidate', 'verified')) > 1 THEN
    RAISE EXCEPTION 'Duplicate active claim key requires reconciliation' USING ERRCODE = '23505';
  END IF;
  SELECT * INTO v_existing_source FROM product_intelligence_sources
    WHERE profile_id = p_profile_id AND url = p_url FOR UPDATE;
  IF FOUND THEN
    IF v_existing_source.source_type <> 'official' THEN
      RAISE EXCEPTION 'Existing source type conflicts with official intake; reconcile manually'
        USING ERRCODE = '23514';
    END IF;
    IF v_existing_source.canonical_url IS NULL OR
       v_existing_source.canonical_url !~* '^https://[a-z0-9.-]+(:[0-9]{1,5})?(/[^[:space:]]*)?$' THEN
      RAISE EXCEPTION 'Existing source canonical URL is missing or invalid; reconcile manually'
        USING ERRCODE = '23514';
    END IF;
    v_canonical_host := lower(split_part(split_part(substring(v_existing_source.canonical_url from 9), '/', 1), ':', 1));
    IF v_existing_source.canonical_url <> p_url
       AND v_canonical_host <> v_domain
       AND v_canonical_host <> 'www.' || v_domain
       AND right(v_canonical_host, length(v_domain) + 1) <> '.' || v_domain THEN
      RAISE EXCEPTION 'Existing source canonical URL conflicts with official domain; reconcile manually'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  INSERT INTO product_intelligence_sources
    (profile_id, url, canonical_url, source_type, source_label, last_verified_at,
     metadata)
  VALUES (p_profile_id, p_url, p_url, 'official', p_label, v_now,
          jsonb_build_object('manualReviewer', p_reviewer, 'manualReviewedAt', v_now))
  ON CONFLICT (profile_id, url) DO UPDATE SET
    source_type = 'official', source_label = EXCLUDED.source_label,
    last_verified_at = EXCLUDED.last_verified_at,
    metadata = product_intelligence_sources.metadata || EXCLUDED.metadata
  RETURNING id INTO v_source_id;
  SELECT * INTO v_claim FROM product_intelligence_claims
    WHERE profile_id = p_profile_id AND claim_key = p_claim_key AND source_url = p_url
    ORDER BY observed_at DESC LIMIT 1 FOR UPDATE;
  IF FOUND AND (v_claim.conflict_status <> 'none'
      OR v_claim.verification_status IN ('rejected', 'superseded')
      OR v_claim.invalidated_at IS NOT NULL
      OR (v_claim.expires_at IS NOT NULL AND v_claim.expires_at <= v_now)
      OR (v_claim.source_id IS NOT NULL AND v_claim.source_id <> v_source_id)) THEN
    RAISE EXCEPTION 'Conflicted or invalidated claim requires a new key' USING ERRCODE = '23514';
  END IF;
  IF FOUND THEN
    UPDATE product_intelligence_claims SET
      claim_type = p_claim_type, claim_value = p_claim_value, source_id = v_source_id,
      source_excerpt = p_excerpt, observed_at = v_now, source_type = 'official',
      verification_status = 'verified', verified_at = v_now, verified_by = p_reviewer,
      verification_note = 'Manual official-source recheck: ' || p_label,
      review_due_at = p_review_due_at, validity_scope = p_validity_scope
    WHERE id = v_claim.id RETURNING id INTO v_claim_id;
  ELSE
    INSERT INTO product_intelligence_claims
      (profile_id, claim_type, claim_key, claim_value, source_id, source_url,
       source_excerpt, observed_at, source_type, verification_status, verified_at,
       verified_by, verification_note, review_due_at, validity_scope)
    VALUES (p_profile_id, p_claim_type, p_claim_key, p_claim_value, v_source_id, p_url,
            p_excerpt, v_now, 'official', 'verified', v_now, p_reviewer,
            'Manual official-source review: ' || p_label, p_review_due_at, p_validity_scope)
    RETURNING id INTO v_claim_id;
  END IF;
  INSERT INTO product_intelligence_timeline_events
    (profile_id, event_type, review_scope, claim_type, claim_key, title, summary,
     old_value, new_value, source_url, source_excerpt, visibility, occurred_at,
     verified_at, verified_by, review_note, metadata)
  VALUES (p_profile_id, CASE WHEN v_claim.id IS NULL THEN 'fact_added' ELSE 'fact_changed' END,
          'decision', p_claim_type, p_claim_key, p_label,
          'Manual official evidence review', v_claim.claim_value, p_claim_value,
          p_url, p_excerpt, 'internal', v_now, v_now, p_reviewer,
          'Official URL and scope checked by editor', jsonb_build_object('claimId', v_claim_id));
  UPDATE product_intelligence_profiles SET last_verified_at = v_now,
    next_review_at = p_review_due_at, updated_at = v_now
    WHERE id = p_profile_id;
  RETURN v_claim_id;
END;
$$;

CREATE OR REPLACE FUNCTION decision_cluster_transition(
  p_task_id uuid, p_task_capabilities jsonb, p_tool_capabilities jsonb,
  p_fits jsonb, p_operation text, p_reviewer uuid, p_qa_reference text,
  p_preflight boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_task decision_tasks%ROWTYPE;
  v_tc task_capabilities%ROWTYPE;
  v_tool tool_capabilities%ROWTYPE;
  v_fit tool_task_fits%ROWTYPE;
  v_entry jsonb;
  v_status text;
  v_next text;
  v_purpose text;
  v_purposes text[];
  v_profile_id uuid;
  v_tool_id uuid;
  v_count integer;
  v_evidence jsonb := '[]'::jsonb;
  v_now timestamptz := clock_timestamp();
  v_seen uuid[] := ARRAY[]::uuid[];
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role required' USING ERRCODE = '42501';
  END IF;
  IF p_reviewer IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_reviewer)
    OR p_operation IS NULL OR p_operation NOT IN ('publish', 'withdraw')
    OR (p_operation = 'publish' AND NOT coalesce(p_preflight, false)
        AND length(btrim(coalesce(p_qa_reference, ''))) < 8)
    OR p_task_capabilities IS NULL OR jsonb_typeof(p_task_capabilities) <> 'array'
    OR p_tool_capabilities IS NULL OR jsonb_typeof(p_tool_capabilities) <> 'array'
    OR p_fits IS NULL OR jsonb_typeof(p_fits) <> 'array'
    OR jsonb_array_length(p_task_capabilities) = 0
    OR jsonb_array_length(p_tool_capabilities) = 0
    OR jsonb_array_length(p_fits) = 0 THEN
    RAISE EXCEPTION 'One nonempty exact Task manifest and reviewer required' USING ERRCODE = '23514';
  END IF;
  v_status := CASE WHEN p_operation = 'publish' THEN 'reviewed' ELSE 'published' END;
  v_next := CASE WHEN p_operation = 'publish' THEN 'published' ELSE 'stale' END;
  SELECT * INTO v_task FROM decision_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND OR v_task.slug NOT IN ('research-with-citations',
      'product-image-to-short-video', 'build-app-with-ai', 'ai-voiceover',
      'brand-constrained-marketing-content')
      OR (p_operation = 'publish' AND v_task.status <> 'active') THEN
    RAISE EXCEPTION 'Task is outside CL-01 scope or inactive' USING ERRCODE = '23514';
  END IF;

  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_task_capabilities) LOOP
    IF (v_entry->>'id') IS NULL OR (v_entry->>'updated_at') IS NULL
       OR (v_entry->>'status') IS DISTINCT FROM v_status THEN
      RAISE EXCEPTION 'Incomplete Task Capability manifest' USING ERRCODE = '23514';
    END IF;
    IF (v_entry->>'id')::uuid = ANY(v_seen) THEN
      RAISE EXCEPTION 'Duplicate Task Capability ID' USING ERRCODE = '23514';
    END IF;
    v_seen := array_append(v_seen, (v_entry->>'id')::uuid);
    SELECT * INTO v_tc FROM task_capabilities
      WHERE task_id = p_task_id AND capability_id = (v_entry->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR v_tc.status <> v_status
      OR v_tc.updated_at <> (v_entry->>'updated_at')::timestamptz
      OR (p_operation = 'publish' AND (
        v_tc.reviewed_by IS NULL OR v_tc.reviewed_at IS NULL
        OR v_tc.review_due_at IS NULL OR v_tc.review_due_at <= v_now
        OR NOT EXISTS (SELECT 1 FROM decision_capabilities c
                       WHERE c.id = v_tc.capability_id AND c.status = 'active')
        OR NOT EXISTS (SELECT 1 FROM jsonb_each(v_tc.rationale) r
                       WHERE jsonb_typeof(r.value) = 'string'
                         AND length(btrim(r.value #>> '{}')) >= 20))) THEN
      RAISE EXCEPTION 'Task Capability is stale, unreviewed, or lacks a concrete rationale' USING ERRCODE = '23514';
    END IF;
  END LOOP;

  v_seen := ARRAY[]::uuid[];
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_fits) LOOP
    IF (v_entry->>'id') IS NULL OR (v_entry->>'updated_at') IS NULL
       OR (v_entry->>'status') IS DISTINCT FROM v_status THEN
      RAISE EXCEPTION 'Incomplete Fit manifest' USING ERRCODE = '23514';
    END IF;
    IF (v_entry->>'id')::uuid = ANY(v_seen) THEN
      RAISE EXCEPTION 'Duplicate Fit ID' USING ERRCODE = '23514';
    END IF;
    v_seen := array_append(v_seen, (v_entry->>'id')::uuid);
    SELECT * INTO v_fit FROM tool_task_fits WHERE id = (v_entry->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR v_fit.task_id <> p_task_id OR v_fit.status <> v_status
      OR v_fit.updated_at <> (v_entry->>'updated_at')::timestamptz
      OR (p_operation = 'publish' AND (
        v_fit.reviewed_by IS NULL OR v_fit.reviewed_at IS NULL
        OR v_fit.review_due_at IS NULL OR v_fit.review_due_at <= v_now
        OR NOT EXISTS (SELECT 1 FROM jsonb_each(v_fit.rationale) r
                       WHERE jsonb_typeof(r.value) = 'string'
                         AND length(btrim(r.value #>> '{}')) >= 20)
        OR jsonb_array_length(v_fit.required_conditions) = 0
        OR jsonb_array_length(v_fit.disqualifiers) = 0)) THEN
      RAISE EXCEPTION 'Fit is cross-Task, stale, or incomplete' USING ERRCODE = '23514';
    END IF;
    IF p_operation = 'publish' THEN
    v_purposes := ARRAY[]::text[];
    FOR v_purpose IN
      SELECT link.purpose
      FROM tool_task_fit_claims link
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
      WHERE link.fit_id = v_fit.id AND profile.owner_type = 'tool'
        AND profile.owner_id = v_fit.tool_id AND profile.profile_status = 'ready'
        AND (profile.next_review_at IS NULL OR profile.next_review_at > v_now)
        AND claim.verification_status = 'verified' AND claim.conflict_status = 'none'
        AND claim.invalidated_at IS NULL AND claim.verified_by IS NOT NULL
        AND claim.review_due_at > v_now
        AND (claim.expires_at IS NULL OR claim.expires_at > v_now)
      FOR SHARE OF link, claim, profile
    LOOP
      v_purposes := array_append(v_purposes, v_purpose);
    END LOOP;
    IF NOT (ARRAY['fit', 'limitation']::text[] <@ v_purposes) THEN
      RAISE EXCEPTION 'Fit requires current same-owner fit and limitation evidence' USING ERRCODE = '23514';
    END IF;
    END IF;
  END LOOP;

  v_seen := ARRAY[]::uuid[];
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_tool_capabilities) LOOP
    IF (v_entry->>'id') IS NULL OR (v_entry->>'updated_at') IS NULL
       OR (v_entry->>'status') IS DISTINCT FROM v_status THEN
      RAISE EXCEPTION 'Incomplete Tool Capability manifest' USING ERRCODE = '23514';
    END IF;
    IF (v_entry->>'id')::uuid = ANY(v_seen) THEN
      RAISE EXCEPTION 'Duplicate Tool Capability ID' USING ERRCODE = '23514';
    END IF;
    v_seen := array_append(v_seen, (v_entry->>'id')::uuid);
    SELECT * INTO v_tool FROM tool_capabilities WHERE id = (v_entry->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR v_tool.status <> v_status
      OR v_tool.updated_at <> (v_entry->>'updated_at')::timestamptz
      OR NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_task_capabilities) m
                     WHERE m->>'id' = v_tool.capability_id::text)
      OR NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_fits) m
                     JOIN tool_task_fits f ON f.id = (m->>'id')::uuid
                     WHERE f.task_id = p_task_id AND f.tool_id = v_tool.tool_id)
      OR EXISTS (
        SELECT 1 FROM tool_task_fits other_fit
        JOIN task_capabilities other_task
          ON other_task.task_id = other_fit.task_id
         AND other_task.capability_id = v_tool.capability_id
        WHERE other_fit.task_id <> p_task_id AND other_fit.tool_id = v_tool.tool_id
          AND other_fit.status = 'published' AND other_task.status = 'published')
      OR (p_operation = 'publish' AND (
        v_tool.reviewed_by IS NULL OR v_tool.reviewed_at IS NULL
        OR v_tool.review_due_at IS NULL OR v_tool.review_due_at <= v_now
        OR v_tool.support_level = 'unknown' OR v_tool.availability = 'unknown'
        OR v_tool.plan_requirement = '{}'::jsonb OR v_tool.limitations = '[]'::jsonb
        OR NOT EXISTS (SELECT 1 FROM jsonb_each(v_tool.plan_requirement) p
                       WHERE jsonb_typeof(p.value) = 'string'
                         AND length(btrim(p.value #>> '{}')) >= 3)
        OR EXISTS (SELECT 1 FROM jsonb_array_elements(v_tool.limitations) l
                   WHERE jsonb_typeof(l.value) <> 'string'
                      OR length(btrim(l.value #>> '{}')) < 8)
        OR NOT EXISTS (SELECT 1 FROM decision_capabilities c
                       WHERE c.id = v_tool.capability_id AND c.status = 'active'))) THEN
      RAISE EXCEPTION 'Tool Capability is stale, incomplete, or outside this Task manifest' USING ERRCODE = '23514';
    END IF;
    IF p_operation = 'publish' THEN
    v_purposes := ARRAY[]::text[];
    FOR v_purpose IN
      SELECT link.purpose
      FROM tool_capability_claims link
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
      WHERE link.tool_capability_id = v_tool.id AND profile.owner_type = 'tool'
        AND profile.owner_id = v_tool.tool_id AND profile.profile_status = 'ready'
        AND (profile.next_review_at IS NULL OR profile.next_review_at > v_now)
        AND claim.verification_status = 'verified' AND claim.conflict_status = 'none'
        AND claim.invalidated_at IS NULL AND claim.verified_by IS NOT NULL
        AND claim.review_due_at > v_now
        AND (claim.expires_at IS NULL OR claim.expires_at > v_now)
      FOR SHARE OF link, claim, profile
    LOOP
      v_purposes := array_append(v_purposes, v_purpose);
    END LOOP;
    IF NOT (ARRAY['support', 'availability', 'plan', 'limitation']::text[] <@ v_purposes) THEN
      RAISE EXCEPTION 'Tool Capability requires four current same-owner evidence purposes' USING ERRCODE = '23514';
    END IF;
    END IF;
  END LOOP;

  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_fits) LOOP
    SELECT tool_id INTO v_tool_id FROM tool_task_fits WHERE id = (v_entry->>'id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_tool_capabilities) m
                   JOIN tool_capabilities c ON c.id = (m->>'id')::uuid
                   WHERE c.tool_id = v_tool_id) THEN
      RAISE EXCEPTION 'Fit has no selected Tool Capability' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  IF p_preflight THEN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'entity', evidence.entity,
      'relationId', evidence.relation_id,
      'claimId', evidence.claim_id,
      'purpose', evidence.purpose,
      'sourceUrl', evidence.source_url,
      'canonicalUrl', evidence.canonical_url,
      'sourceType', evidence.source_type,
      'officialSource', evidence.official_source,
      'verificationStatus', evidence.verification_status,
      'verifiedAt', evidence.verified_at,
      'reviewDueAt', evidence.review_due_at,
      'expiresAt', evidence.expires_at,
      'validityScope', evidence.validity_scope,
      'ownerMatches', evidence.owner_matches
    ) ORDER BY evidence.entity, evidence.relation_id, evidence.purpose, evidence.claim_id), '[]'::jsonb)
    INTO v_evidence
    FROM (
      SELECT 'tool_capability'::text AS entity, capability.id AS relation_id,
        claim.id AS claim_id, link.purpose, claim.source_url,
        source.canonical_url, claim.source_type,
        (claim.source_type = 'official' AND source.source_type = 'official'
          AND source.url = claim.source_url) AS official_source,
        claim.verification_status, claim.verified_at, claim.review_due_at,
        claim.expires_at, claim.validity_scope,
        (profile.owner_type = 'tool' AND profile.owner_id = capability.tool_id) AS owner_matches
      FROM tool_capabilities capability
      JOIN tool_capability_claims link ON link.tool_capability_id = capability.id
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
      LEFT JOIN product_intelligence_sources source ON source.id = claim.source_id
      WHERE capability.id IN
        (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities))
      UNION ALL
      SELECT 'fit'::text AS entity, fit.id AS relation_id,
        claim.id AS claim_id, link.purpose, claim.source_url,
        source.canonical_url, claim.source_type,
        (claim.source_type = 'official' AND source.source_type = 'official'
          AND source.url = claim.source_url) AS official_source,
        claim.verification_status, claim.verified_at, claim.review_due_at,
        claim.expires_at, claim.validity_scope,
        (profile.owner_type = 'tool' AND profile.owner_id = fit.tool_id) AS owner_matches
      FROM tool_task_fits fit
      JOIN tool_task_fit_claims link ON link.fit_id = fit.id
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
      LEFT JOIN product_intelligence_sources source ON source.id = claim.source_id
      WHERE fit.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
    ) evidence;
    RETURN jsonb_build_object('ok', true, 'taskId', p_task_id, 'operation', p_operation,
      'taskCapabilities', jsonb_array_length(p_task_capabilities),
      'toolCapabilities', jsonb_array_length(p_tool_capabilities),
      'fits', jsonb_array_length(p_fits), 'evidence', v_evidence);
  END IF;

  UPDATE task_capabilities SET status = v_next, last_edited_by = p_reviewer WHERE task_id = p_task_id
    AND capability_id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_task_capabilities));
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> jsonb_array_length(p_task_capabilities) THEN
    RAISE EXCEPTION 'Task Capability postcondition failed' USING ERRCODE = '23514';
  END IF;
  UPDATE tool_capabilities SET status = v_next, last_edited_by = p_reviewer WHERE id IN
    (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities));
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> jsonb_array_length(p_tool_capabilities) THEN
    RAISE EXCEPTION 'Tool Capability postcondition failed' USING ERRCODE = '23514';
  END IF;
  UPDATE tool_task_fits SET status = v_next, last_edited_by = p_reviewer WHERE id IN
    (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits));
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> jsonb_array_length(p_fits) THEN
    RAISE EXCEPTION 'Fit postcondition failed' USING ERRCODE = '23514';
  END IF;
  -- Existing publication triggers run in this transaction; any failure rolls the whole group back.
  FOR v_profile_id IN
    SELECT DISTINCT profile.id
    FROM tool_task_fits fit
    JOIN product_intelligence_profiles profile ON profile.owner_type = 'tool'
      AND profile.owner_id = fit.tool_id
    WHERE fit.id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits))
  LOOP
    INSERT INTO product_intelligence_timeline_events
      (profile_id, event_type, review_scope, claim_type, claim_key, title, summary,
       old_value, new_value, visibility, occurred_at, verified_at, verified_by, metadata)
    VALUES (v_profile_id,
      CASE WHEN p_operation = 'publish' THEN 'decision_publication' ELSE 'decision_withdrawal' END,
      'decision', 'decision_cluster', p_task_id::text, 'Task cluster ' || p_operation,
      'Exact Task Capability, Tool Capability, and Fit manifest transitioned',
      jsonb_build_object('status', v_status), jsonb_build_object('status', v_next),
      'internal', v_now, v_now, p_reviewer,
      jsonb_build_object('taskId', p_task_id, 'taskCapabilities', p_task_capabilities,
                         'toolCapabilities', p_tool_capabilities, 'fits', p_fits,
                         'qaReference', p_qa_reference));
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'taskId', p_task_id, 'operation', p_operation);
END;
$$;

REVOKE ALL ON FUNCTION decision_official_evidence_intake(uuid,text,text,text,text,jsonb,text,jsonb,timestamptz,uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decision_official_evidence_intake(uuid,text,text,text,text,jsonb,text,jsonb,timestamptz,uuid)
  TO service_role;
REVOKE ALL ON FUNCTION decision_cluster_transition(uuid,jsonb,jsonb,jsonb,text,uuid,text,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decision_cluster_transition(uuid,jsonb,jsonb,jsonb,text,uuid,text,boolean)
  TO service_role;

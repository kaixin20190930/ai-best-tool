-- CL-04: one exact, reversible Fit-only transition. No Capability rows are updated.
ALTER TABLE product_intelligence_timeline_events
  DROP CONSTRAINT product_intelligence_timeline_events_event_type_check;
ALTER TABLE product_intelligence_timeline_events
  ADD CONSTRAINT product_intelligence_timeline_events_event_type_check
  CHECK (event_type IN ('fact_added', 'fact_changed', 'fact_removed', 'reviewed_no_change',
                       'decision_publication', 'decision_withdrawal', 'decision_restoration'));

CREATE OR REPLACE FUNCTION decision_cl04_fit_transition(
  p_fits jsonb, p_operation text, p_reviewer uuid, p_qa_reference text,
  p_preflight boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_task_id constant uuid := '10ffdf04-6885-4a28-949d-0723038c6954';
  v_n8n_id constant uuid := '692f9115-2d1d-487b-b02b-392fa55d2d34';
  v_router_id constant uuid := 'bb6bb5aa-df5e-4113-bb76-8d4910911b28';
  v_before text;
  v_after text;
  v_entry jsonb;
  v_fit tool_task_fits%ROWTYPE;
  v_count integer;
  v_now timestamptz := clock_timestamp();
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role required' USING ERRCODE = '42501';
  END IF;
  IF p_reviewer IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_reviewer)
    OR length(btrim(coalesce(p_qa_reference, ''))) < 8
    OR p_operation IS NULL OR p_operation NOT IN ('withdraw', 'restore')
    OR p_fits IS NULL OR jsonb_typeof(p_fits) <> 'array'
    OR jsonb_array_length(p_fits) <> 2 THEN
    RAISE EXCEPTION 'Exact two-Fit manifest, reviewer, and QA reference required' USING ERRCODE = '23514';
  END IF;
  v_before := CASE WHEN p_operation = 'withdraw' THEN 'reviewed' ELSE 'stale' END;
  v_after := CASE WHEN p_operation = 'withdraw' THEN 'stale' ELSE 'reviewed' END;

  PERFORM 1 FROM decision_tasks WHERE id = v_task_id AND slug = 'build-app-with-ai'
    AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CL-04 Task identity or status changed' USING ERRCODE = '23514';
  END IF;
  IF (SELECT count(DISTINCT (entry->>'id')::uuid) FROM jsonb_array_elements(p_fits) entry
      WHERE entry->>'id' IN (v_n8n_id::text, v_router_id::text)) <> 2 THEN
    RAISE EXCEPTION 'Manifest must contain only the n8n and OpenRouter Fits' USING ERRCODE = '23514';
  END IF;
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_fits) ORDER BY value->>'id' LOOP
    IF v_entry->>'status' IS DISTINCT FROM v_before
      OR v_entry->>'updated_at' IS NULL THEN
      RAISE EXCEPTION 'Fit manifest status or version missing' USING ERRCODE = '23514';
    END IF;
    SELECT * INTO v_fit FROM tool_task_fits WHERE id = (v_entry->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR v_fit.task_id <> v_task_id OR v_fit.status <> v_before
      OR v_fit.updated_at <> (v_entry->>'updated_at')::timestamptz
      OR (v_fit.id = v_n8n_id AND v_fit.tool_id <> '23bb3601-a5ac-42c3-bff3-64b06a063959'::uuid)
      OR (v_fit.id = v_router_id AND v_fit.tool_id <> 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e'::uuid) THEN
      RAISE EXCEPTION 'Fit identity, status, or version changed' USING ERRCODE = '23514';
    END IF;
  END LOOP;
  IF p_preflight THEN
    RETURN jsonb_build_object('ok', true, 'operation', p_operation, 'taskId', v_task_id,
      'fitIds', jsonb_build_array(v_n8n_id, v_router_id),
      'taskCapabilityUpdates', 0, 'toolCapabilityUpdates', 0, 'fitUpdates', 0);
  END IF;

  UPDATE tool_task_fits SET status = v_after, last_edited_by = p_reviewer,
    updated_at = v_now WHERE id IN (v_n8n_id, v_router_id) AND task_id = v_task_id
    AND status = v_before;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'Fit transition postcondition failed' USING ERRCODE = '23514';
  END IF;
  IF (SELECT count(*) FROM tool_task_fits WHERE id IN (v_n8n_id, v_router_id)
      AND task_id = v_task_id AND status = v_after) <> 2 THEN
    RAISE EXCEPTION 'Fit transition postcondition failed' USING ERRCODE = '23514';
  END IF;
  INSERT INTO product_intelligence_timeline_events
    (profile_id, event_type, review_scope, claim_type, claim_key, title, summary,
     old_value, new_value, visibility, occurred_at, verified_at, verified_by, metadata)
  SELECT profile.id,
    CASE WHEN p_operation = 'withdraw' THEN 'decision_withdrawal' ELSE 'decision_restoration' END,
    'decision', 'decision_cluster',
    v_task_id::text, 'CL-04 Fit ' || p_operation,
    'Exact n8n/OpenRouter Fit-only transition; Capability relationships retained',
    jsonb_build_object('status', v_before), jsonb_build_object('status', v_after),
    'internal', v_now, v_now, p_reviewer,
    jsonb_build_object('taskId', v_task_id, 'fits', p_fits,
      'qaReference', p_qa_reference, 'operation', p_operation)
  FROM product_intelligence_profiles profile
  JOIN tool_task_fits fit ON fit.tool_id = profile.owner_id
  WHERE fit.id IN (v_n8n_id, v_router_id) AND profile.owner_type = 'tool';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'CL-04 timeline audit postcondition failed' USING ERRCODE = '23514';
  END IF;
  RETURN jsonb_build_object('ok', true, 'operation', p_operation, 'taskId', v_task_id,
    'fitUpdates', 2, 'taskCapabilityUpdates', 0, 'toolCapabilityUpdates', 0);
END;
$$;

REVOKE ALL ON FUNCTION decision_cl04_fit_transition(jsonb,text,uuid,text,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decision_cl04_fit_transition(jsonb,text,uuid,text,boolean)
  TO service_role;

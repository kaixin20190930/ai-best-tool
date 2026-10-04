-- Atomic rollback for one previously published reviewed Tool Capability + Fit group.
CREATE OR REPLACE FUNCTION public.admin_withdraw_task_tool_group(
  p_task_id uuid,p_tool_id uuid,p_tool_capabilities jsonb,p_fits jsonb,
  p_reviewer uuid,p_withdrawal_reference text,p_preflight boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE
  v_now timestamptz:=clock_timestamp();
  v_profile uuid;
  v_slug text;
  v_entry jsonb;
  v_seen uuid[]:=ARRAY[]::uuid[];
  v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' OR p_reviewer IS NULL OR
     NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_reviewer) THEN
    RAISE EXCEPTION 'service_role and a real reviewer are required' USING ERRCODE='42501';
  END IF;
  IF p_task_id IS NULL OR p_tool_id IS NULL OR p_tool_capabilities IS NULL OR
     jsonb_typeof(p_tool_capabilities)<>'array' OR jsonb_array_length(p_tool_capabilities)=0 OR
     p_fits IS NULL OR jsonb_typeof(p_fits)<>'array' OR jsonb_array_length(p_fits)=0 OR
     length(btrim(coalesce(p_withdrawal_reference,'')))<8 THEN
    RAISE EXCEPTION 'Exact published group and withdrawal reference are required' USING ERRCODE='23514';
  END IF;
  IF (SELECT count(*) FROM pg_class WHERE oid IN
      ('public.decision_tasks'::regclass,'public.tool_capabilities'::regclass,
       'public.tool_task_fits'::regclass,'public.product_intelligence_profiles'::regclass,
       'public.product_intelligence_timeline_events'::regclass) AND relrowsecurity)<>5 THEN
    RAISE EXCEPTION 'Reviewed group withdrawal requires RLS' USING ERRCODE='23514';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('reviewed-task-tool-group:'||p_task_id::text||':'||p_tool_id::text));
  SELECT slug INTO v_slug FROM public.decision_tasks WHERE id=p_task_id FOR SHARE;
  IF v_slug IS DISTINCT FROM 'research-with-citations' THEN
    RAISE EXCEPTION 'Task is outside this reviewed-group release scope' USING ERRCODE='23514';
  END IF;
  IF (SELECT count(*) FROM public.tool_capabilities c
      JOIN public.task_capabilities tc ON tc.task_id=p_task_id AND tc.capability_id=c.capability_id
      WHERE c.tool_id=p_tool_id)<>jsonb_array_length(p_tool_capabilities) OR
     EXISTS (SELECT 1 FROM public.tool_capabilities c
       JOIN public.task_capabilities tc ON tc.task_id=p_task_id AND tc.capability_id=c.capability_id
       WHERE c.tool_id=p_tool_id AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_tool_capabilities) m
         WHERE m->>'id'=c.id::text)) OR
     EXISTS (SELECT 1 FROM jsonb_array_elements(p_tool_capabilities) m
       WHERE NOT EXISTS (SELECT 1 FROM public.tool_capabilities c
         JOIN public.task_capabilities tc ON tc.task_id=p_task_id AND tc.capability_id=c.capability_id
         WHERE c.tool_id=p_tool_id AND c.id=(m->>'id')::uuid)) OR
     (SELECT count(*) FROM public.tool_task_fits WHERE task_id=p_task_id AND tool_id=p_tool_id)
       <>jsonb_array_length(p_fits) OR
     EXISTS (SELECT 1 FROM public.tool_task_fits f WHERE f.task_id=p_task_id AND f.tool_id=p_tool_id
       AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_fits) m WHERE m->>'id'=f.id::text)) OR
     EXISTS (SELECT 1 FROM jsonb_array_elements(p_fits) m WHERE NOT EXISTS
       (SELECT 1 FROM public.tool_task_fits f WHERE f.task_id=p_task_id AND f.tool_id=p_tool_id
         AND f.id=(m->>'id')::uuid)) THEN
    RAISE EXCEPTION 'Withdrawal manifest must cover every exact Tool Capability and Fit for this Task/tool' USING ERRCODE='23514';
  END IF;
  IF (SELECT count(DISTINCT (value->>'id')::uuid) FROM jsonb_array_elements(p_tool_capabilities))
       <>jsonb_array_length(p_tool_capabilities) OR
     (SELECT count(DISTINCT (value->>'id')::uuid) FROM jsonb_array_elements(p_fits))
       <>jsonb_array_length(p_fits) THEN
    RAISE EXCEPTION 'Withdrawal manifest contains duplicate relation IDs' USING ERRCODE='23514';
  END IF;
  IF NOT coalesce(p_preflight,false) AND EXISTS (
    SELECT 1 FROM public.product_intelligence_timeline_events e
    JOIN public.product_intelligence_profiles p ON p.id=e.profile_id
    WHERE p.owner_type='tool' AND p.owner_id=p_tool_id AND e.event_type='decision_withdrawal'
      AND e.review_scope='decision' AND e.claim_type='decision_cluster' AND e.claim_key=p_task_id::text
      AND e.metadata->>'taskId'=p_task_id::text AND e.metadata->>'toolId'=p_tool_id::text
      AND e.metadata->>'withdrawalReference'=btrim(p_withdrawal_reference)
      AND e.metadata->'toolCapabilities'=p_tool_capabilities AND e.metadata->'fits'=p_fits
      AND NOT EXISTS (SELECT 1 FROM public.tool_capabilities c
        JOIN public.task_capabilities tc ON tc.task_id=p_task_id AND tc.capability_id=c.capability_id
        WHERE c.tool_id=p_tool_id AND c.status<>'stale')
      AND NOT EXISTS (SELECT 1 FROM public.tool_task_fits f
        WHERE f.task_id=p_task_id AND f.tool_id=p_tool_id AND f.status<>'stale')
  ) THEN
    RETURN jsonb_build_object('ok',true,'preflight',false,'unchanged',true,'taskId',p_task_id,
      'toolId',p_tool_id,'toolCapabilityCount',jsonb_array_length(p_tool_capabilities),
      'fitCount',jsonb_array_length(p_fits));
  END IF;
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_tool_capabilities) LOOP
    IF v_entry->>'status'<>'published' OR coalesce(v_entry->>'updated_at','')='' OR
       (v_entry->>'id')::uuid=ANY(v_seen) THEN RAISE EXCEPTION 'Invalid Tool Capability withdrawal preimage' USING ERRCODE='23514'; END IF;
    v_seen:=array_append(v_seen,(v_entry->>'id')::uuid);
    PERFORM 1 FROM public.tool_capabilities c WHERE c.id=(v_entry->>'id')::uuid AND c.tool_id=p_tool_id
      AND c.status='published' AND c.updated_at=(v_entry->>'updated_at')::timestamptz FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Tool Capability preimage drifted' USING ERRCODE='40001'; END IF;
  END LOOP;
  v_seen:=ARRAY[]::uuid[];
  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_fits) LOOP
    IF v_entry->>'status'<>'published' OR coalesce(v_entry->>'updated_at','')='' OR
       (v_entry->>'id')::uuid=ANY(v_seen) THEN RAISE EXCEPTION 'Invalid Fit withdrawal preimage' USING ERRCODE='23514'; END IF;
    v_seen:=array_append(v_seen,(v_entry->>'id')::uuid);
    PERFORM 1 FROM public.tool_task_fits f WHERE f.id=(v_entry->>'id')::uuid AND f.tool_id=p_tool_id
      AND f.task_id=p_task_id AND f.status='published' AND f.updated_at=(v_entry->>'updated_at')::timestamptz FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Fit preimage drifted' USING ERRCODE='40001'; END IF;
  END LOOP;
  IF p_preflight THEN RETURN jsonb_build_object('ok',true,'preflight',true,'taskId',p_task_id,
    'toolId',p_tool_id,'toolCapabilities',p_tool_capabilities,'fits',p_fits); END IF;
  UPDATE public.tool_capabilities SET status='stale',last_edited_by=p_reviewer WHERE id IN
    (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_tool_capabilities));
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>jsonb_array_length(p_tool_capabilities) THEN RAISE EXCEPTION 'Tool Capability withdrawal failed atomically' USING ERRCODE='40001'; END IF;
  UPDATE public.tool_task_fits SET status='stale',last_edited_by=p_reviewer WHERE id IN
    (SELECT (value->>'id')::uuid FROM jsonb_array_elements(p_fits));
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>jsonb_array_length(p_fits) THEN RAISE EXCEPTION 'Fit withdrawal failed atomically' USING ERRCODE='40001'; END IF;
  SELECT id INTO v_profile FROM public.product_intelligence_profiles WHERE owner_type='tool' AND owner_id=p_tool_id;
  INSERT INTO public.product_intelligence_timeline_events
    (profile_id,event_type,review_scope,claim_type,claim_key,title,summary,old_value,new_value,
     visibility,occurred_at,verified_at,verified_by,metadata)
  VALUES(v_profile,'decision_withdrawal','decision','decision_cluster',p_task_id::text,
    'Reviewed tool group withdrawn','Exact Tool Capability and Fit group returned to stale for re-review',
    jsonb_build_object('status','published'),jsonb_build_object('status','stale'),'internal',v_now,v_now,p_reviewer,
    jsonb_build_object('taskId',p_task_id,'toolId',p_tool_id,'toolCapabilities',p_tool_capabilities,
      'fits',p_fits,'withdrawalReference',btrim(p_withdrawal_reference)));
  RETURN jsonb_build_object('ok',true,'preflight',false,'taskId',p_task_id,'toolId',p_tool_id,
    'toolCapabilityCount',jsonb_array_length(p_tool_capabilities),'fitCount',jsonb_array_length(p_fits));
END $$;
REVOKE ALL ON FUNCTION public.admin_withdraw_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_withdraw_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)
  TO service_role;

-- Repair only the purpose-array comparison in the existing reviewed-group RPC.
-- CREATE OR REPLACE preserves the signature, ownership, grants and all other gates.
DO $migration$
DECLARE
  v_signature regprocedure := 'public.admin_publish_reviewed_task_tool_group(uuid,uuid,jsonb,jsonb,uuid,text,boolean)'::regprocedure;
  v_definition text;
  v_old_cap text := 'ARRAY(SELECT l.purpose FROM public.tool_capability_claims l WHERE l.tool_capability_id=v_row.id)';
  v_new_cap text := 'ARRAY(SELECT l.purpose::text FROM public.tool_capability_claims l WHERE l.tool_capability_id=v_row.id)';
  v_old_fit text := 'ARRAY(SELECT l.purpose FROM public.tool_task_fit_claims l WHERE l.fit_id=v_row.id)';
  v_new_fit text := 'ARRAY(SELECT l.purpose::text FROM public.tool_task_fit_claims l WHERE l.fit_id=v_row.id)';
BEGIN
  SELECT pg_get_functiondef(v_signature) INTO v_definition;
  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'Reviewed-group RPC is missing';
  END IF;
  IF position(v_new_cap IN v_definition)>0 AND position(v_new_fit IN v_definition)>0 THEN
    IF position(v_old_cap IN v_definition)>0 OR position(v_old_fit IN v_definition)>0 THEN
      RAISE EXCEPTION 'Reviewed-group RPC has mixed purpose-array types';
    END IF;
    RETURN;
  END IF;
  IF position(v_old_cap IN v_definition)=0 OR position(v_old_fit IN v_definition)=0 OR
     position(v_new_cap IN v_definition)>0 OR position(v_new_fit IN v_definition)>0 THEN
    RAISE EXCEPTION 'Reviewed-group RPC does not match the approved preimage';
  END IF;
  v_definition := replace(replace(v_definition,v_old_cap,v_new_cap),v_old_fit,v_new_fit);
  EXECUTE v_definition;
END
$migration$;

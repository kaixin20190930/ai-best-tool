-- Repair the installed pgcrypto lookup for the existing service-role batch RPC.
-- No function body, grants, table data, or publication state changes.
DO $$
DECLARE
  v_extension_schema name;
  v_digest_oid oid;
BEGIN
  SELECT n.nspname, p.oid INTO v_extension_schema, v_digest_oid
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  JOIN pg_proc p
    ON p.oid = to_regprocedure(format('%I.digest(bytea,text)', n.nspname))
  JOIN pg_depend d
    ON d.classid = 'pg_proc'::regclass
   AND d.objid = p.oid
   AND d.refclassid = 'pg_extension'::regclass
   AND d.refobjid = e.oid
   AND d.deptype = 'e'
  WHERE e.extname = 'pgcrypto';

  IF v_extension_schema IS NULL
     OR v_extension_schema NOT IN ('extensions', 'public')
     OR v_digest_oid IS NULL THEN
    RAISE EXCEPTION 'pgcrypto digest(bytea,text) must exist in extensions or public'
      USING ERRCODE = '23514';
  END IF;

  IF v_extension_schema = 'public' THEN
    ALTER FUNCTION public.decision_manifest_batch_intake(
      uuid, uuid, jsonb, jsonb, text, uuid, text, boolean
    ) SET search_path = pg_catalog, public;
  ELSE
    ALTER FUNCTION public.decision_manifest_batch_intake(
      uuid, uuid, jsonb, jsonb, text, uuid, text, boolean
    ) SET search_path = pg_catalog, extensions, public;
  END IF;
END;
$$;

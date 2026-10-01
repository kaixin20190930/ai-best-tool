-- OWNER MANUAL ONLY. Exact rollback of the matching Neon identity migration.
-- Run as one private SQL script. Default PRECHECKS and ROLLBACKS without a write.
-- Paste the forward script's privately saved private_rollback_snapshot as JSON
-- in the first SET LOCAL below. Use the forward COMMIT notice's post timestamp/hash,
-- and require a fresh --identity verifier to return those same values.
-- Owner must also enter the exact rollback gate and replace final ROLLBACK with
-- COMMIT. Missing/wrong gate returns before UPDATE; no public backup table exists.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
-- SELECT set_config('app.gemini_notebook_private_snapshot', $snapshot$<paste exact JSON snapshot>$snapshot$, true);
-- SET LOCAL app.gemini_notebook_expected_updated_at = '<exact identity verifier updatedAtUtc>';
-- SET LOCAL app.gemini_notebook_expected_row_md5 = '<exact identity verifier rowMd5>';
-- SET LOCAL app.gemini_notebook_rollback_gate = 'I reviewed the private snapshot and approve exact Neon identity rollback';

DO $rollback$
DECLARE
  v_id constant uuid := 'cec78907-e2a1-4eb7-853a-a58334026280';
  v_current tools%ROWTYPE;
  v_restored tools%ROWTYPE;
  v_snapshot jsonb;
  v_snapshot_text text := nullif(current_setting('app.gemini_notebook_private_snapshot', true), '');
  v_expected_at text := nullif(current_setting('app.gemini_notebook_expected_updated_at', true), '');
  v_expected_md5 text := nullif(current_setting('app.gemini_notebook_expected_row_md5', true), '');
  v_gate text := nullif(current_setting('app.gemini_notebook_rollback_gate', true), '');
  v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('directory:notebooklm'));
  SELECT * INTO STRICT v_current FROM tools WHERE id = v_id FOR UPDATE;
  IF (SELECT count(*) FROM tools WHERE lower(name) IN ('notebooklm','gemini-notebook','gemini notebook')
      OR lower(url) ~ '^https?://(notebooklm|notebook)[.]google[.]com([/?#]|$)'
      OR lower(title::text) LIKE '%gemini notebook%') <> 1 THEN
    RAISE EXCEPTION 'Notebook identity collision or duplicate; HOLD';
  END IF;
  IF v_current.name IS DISTINCT FROM 'notebooklm' OR v_current.status IS DISTINCT FROM 'published'
    OR v_current.page_quality_status IS DISTINCT FROM 'monitor' THEN
    RAISE EXCEPTION 'Notebook invariant changed; HOLD';
  END IF;
  IF v_snapshot_text IS NULL OR v_expected_at IS NULL OR v_expected_md5 IS NULL
    OR v_gate IS DISTINCT FROM 'I reviewed the private snapshot and approve exact Neon identity rollback' THEN
    RAISE NOTICE 'PRECHECK only; no rollback write. Provide snapshot, post timestamp/hash and Owner gate.';
    RETURN;
  END IF;
  v_snapshot := v_snapshot_text::jsonb;
  IF v_snapshot->>'id' IS DISTINCT FROM v_id::text
    OR v_snapshot->>'name' IS DISTINCT FROM 'notebooklm'
    OR v_snapshot->>'url' IS DISTINCT FROM 'https://notebooklm.google.com/'
    OR v_snapshot->'title' IS DISTINCT FROM '{"en":"NotebookLM Source-Grounded Research","cn":"NotebookLM 资料锚定研究","zh":"NotebookLM 资料锚定研究","tw":"NotebookLM 资料锚定研究"}'::jsonb
    OR jsonb_typeof(v_snapshot->'detail') IS DISTINCT FROM 'object'
    OR jsonb_typeof(v_snapshot->'features') IS DISTINCT FROM 'object'
    OR v_snapshot->>'next_review_date' IS DISTINCT FROM '2026-09-20'
    OR v_snapshot->>'updated_at' IS NULL OR v_snapshot->>'row_md5' !~ '^[0-9a-f]{32}$' THEN
    RAISE EXCEPTION 'Private preimage is incomplete or does not match the old baseline; HOLD';
  END IF;
  IF md5(to_jsonb(v_current)::text) = v_snapshot->>'row_md5'
    AND v_current.url = 'https://notebooklm.google.com/' THEN
    RAISE NOTICE 'Exact preimage already restored; no update.';
    RETURN;
  END IF;
  IF v_current.url IS DISTINCT FROM 'https://notebook.google.com/'
    OR v_current.title IS DISTINCT FROM '{"en":"Gemini Notebook Source-Grounded Research","cn":"Gemini Notebook 资料锚定研究","zh":"Gemini Notebook 资料锚定研究","tw":"Gemini Notebook 資料錨定研究"}'::jsonb
    OR v_current.next_review_date IS DISTINCT FROM DATE '2026-12-15'
    OR v_current.features->'identity'->>'currentName' IS DISTINCT FROM 'Gemini Notebook'
    OR v_current.updated_at::text IS DISTINCT FROM v_expected_at
    OR md5(to_jsonb(v_current)::text) IS DISTINCT FROM v_expected_md5 THEN
    RAISE EXCEPTION 'Current row differs from exact migration postimage; HOLD';
  END IF;
  UPDATE tools SET title = v_snapshot->'title', url = v_snapshot->>'url',
      detail = v_snapshot->'detail', features = v_snapshot->'features',
      next_review_date = (v_snapshot->>'next_review_date')::date,
      updated_at = (v_snapshot->>'updated_at')::timestamptz
    WHERE id = v_id AND name = 'notebooklm' AND url = 'https://notebook.google.com/'
      AND updated_at::text = v_expected_at AND md5(to_jsonb(tools)::text) = v_expected_md5;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 1 THEN RAISE EXCEPTION 'Expected exactly one rollback row, got %; HOLD',v_count; END IF;
  SELECT * INTO STRICT v_restored FROM tools WHERE id = v_id;
  IF md5(to_jsonb(v_restored)::text) IS DISTINCT FROM v_snapshot->>'row_md5' THEN
    RAISE EXCEPTION 'Restored row differs from private full-row hash; HOLD';
  END IF;
  RAISE NOTICE 'Exact preimage restored. Run --baseline after COMMIT.';
END
$rollback$;
ROLLBACK;

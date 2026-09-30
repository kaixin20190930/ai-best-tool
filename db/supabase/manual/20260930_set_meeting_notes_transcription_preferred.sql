-- Owner-only candidate. This file is intentionally inert unless the Owner supplies
-- a reviewer UUID in the same explicit transaction/session:
--
--   BEGIN;
--   SET LOCAL app.meeting_notes_reviewer_uuid = '<reviewer auth.users UUID>';
--   -- Run the DO block below without changing its scope.
--   COMMIT;
--
-- Do not schedule or run this file unattended. Task Page approval remains a
-- separate code review after a fresh production read-only verification.
DO $meeting_notes_transcription_preferred$
DECLARE
  v_task_id CONSTANT uuid := 'e9c64181-9cad-40c5-979e-3af4bd9cc630';
  v_transcription_id CONSTANT uuid := '6150a718-2693-4bfb-a13d-b76ac44e6357';
  v_summary_id CONSTANT uuid := 'c14d491e-d40e-407e-a3c6-c1d59719acfa';
  v_reviewer_text text := nullif(current_setting('app.meeting_notes_reviewer_uuid', true), '');
  v_reviewer uuid;
  v_now timestamptz := clock_timestamp();
  v_due timestamptz := v_now + interval '30 days';
  v_transcription public.task_capabilities%ROWTYPE;
  v_summary public.task_capabilities%ROWTYPE;
  v_summary_after public.task_capabilities%ROWTYPE;
  v_summary_before jsonb;
  v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('meeting-notes-transcription-preferred-20260930'));

  IF v_reviewer_text IS NULL THEN
    RAISE EXCEPTION 'Owner must set app.meeting_notes_reviewer_uuid in this transaction.'
      USING ERRCODE = '23514';
  END IF;
  BEGIN
    v_reviewer := v_reviewer_text::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'app.meeting_notes_reviewer_uuid must be a UUID.'
      USING ERRCODE = '23514';
  END;
  IF v_reviewer = '00000000-0000-0000-0000-000000000000'::uuid
    OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_reviewer) THEN
    RAISE EXCEPTION 'The supplied reviewer must be an existing auth.users identity.'
      USING ERRCODE = '23514';
  END IF;

  IF (SELECT count(*) FROM public.decision_tasks
      WHERE id = v_task_id AND slug = 'meeting-notes' AND status = 'active') <> 1 THEN
    RAISE EXCEPTION 'The unique active meeting-notes Task identity changed.'
      USING ERRCODE = '23514';
  END IF;
  IF (SELECT count(*) FROM public.decision_capabilities
      WHERE id = v_transcription_id AND slug = 'meeting-transcription' AND status = 'active') <> 1
    OR (SELECT count(*) FROM public.decision_capabilities
        WHERE id = v_summary_id AND slug = 'meeting-summary-and-actions' AND status = 'active') <> 1 THEN
    RAISE EXCEPTION 'The exact active meeting-notes Capability identities changed.'
      USING ERRCODE = '23514';
  END IF;
  IF (SELECT count(*) FROM public.task_capabilities
      WHERE task_id = v_task_id AND capability_id IN (v_transcription_id, v_summary_id)) <> 2 THEN
    RAISE EXCEPTION 'The two exact meeting-notes Task Capability relations are required.'
      USING ERRCODE = '23514';
  END IF;

  SELECT * INTO STRICT v_transcription
  FROM public.task_capabilities
  WHERE task_id = v_task_id AND capability_id = v_transcription_id
  FOR UPDATE;
  SELECT * INTO STRICT v_summary
  FROM public.task_capabilities
  WHERE task_id = v_task_id AND capability_id = v_summary_id
  FOR UPDATE;
  v_summary_before := to_jsonb(v_summary);

  IF v_summary.importance <> 'required'
    OR v_summary.status <> 'published'
    OR v_summary.reviewed_by IS NULL
    OR v_summary.reviewed_at IS NULL OR v_summary.reviewed_at > v_now
    OR v_summary.review_due_at IS NULL OR v_summary.review_due_at <= v_now THEN
    RAISE EXCEPTION 'meeting-summary-and-actions must remain required, published, current, and reviewer-backed.'
      USING ERRCODE = '23514';
  END IF;
  IF v_transcription.status <> 'published'
    OR v_transcription.reviewed_by IS NULL
    OR v_transcription.reviewed_at IS NULL OR v_transcription.reviewed_at > v_now
    OR v_transcription.review_due_at IS NULL OR v_transcription.review_due_at <= v_now THEN
    RAISE EXCEPTION 'meeting-transcription must be published, current, and reviewer-backed before review.'
      USING ERRCODE = '23514';
  END IF;

  IF v_transcription.importance = 'required' THEN
    UPDATE public.task_capabilities
    SET importance = 'preferred',
        reviewed_by = v_reviewer,
        reviewed_at = v_now,
        review_due_at = v_due,
        last_edited_by = v_reviewer
    WHERE task_id = v_task_id
      AND capability_id = v_transcription_id
      AND importance = 'required'
      AND status = 'published';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count <> 1 THEN
      RAISE EXCEPTION 'The exact meeting-transcription relation was not updated.'
        USING ERRCODE = '23514';
    END IF;
  ELSIF v_transcription.importance = 'preferred' THEN
    IF v_transcription.reviewed_by <> v_reviewer THEN
      RAISE EXCEPTION 'Existing preferred review belongs to a different reviewer; stop for reconciliation.'
        USING ERRCODE = '23514';
    END IF;
    RAISE NOTICE 'meeting-transcription is already preferred and current; no timestamps were extended.';
  ELSE
    RAISE EXCEPTION 'meeting-transcription importance is neither the required pre-state nor idempotent preferred state.'
      USING ERRCODE = '23514';
  END IF;

  IF (SELECT count(*) FROM public.task_capabilities
      WHERE task_id = v_task_id AND capability_id = v_transcription_id
        AND importance = 'preferred' AND status = 'published'
        AND reviewed_by = v_reviewer
        AND reviewed_at IS NOT NULL AND reviewed_at <= clock_timestamp()
        AND review_due_at IS NOT NULL AND review_due_at > clock_timestamp()) <> 1 THEN
    RAISE EXCEPTION 'Preferred meeting-transcription postcondition failed.'
      USING ERRCODE = '23514';
  END IF;

  SELECT * INTO STRICT v_summary_after
  FROM public.task_capabilities
  WHERE task_id = v_task_id AND capability_id = v_summary_id;
  IF to_jsonb(v_summary_after) IS DISTINCT FROM v_summary_before THEN
    RAISE EXCEPTION 'meeting-summary-and-actions changed; the transaction is being rolled back.'
      USING ERRCODE = '23514';
  END IF;
END
$meeting_notes_transcription_preferred$;

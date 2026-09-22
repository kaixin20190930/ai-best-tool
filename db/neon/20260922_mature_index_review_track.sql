ALTER TABLE public.tool_index_review_runs
  ADD COLUMN IF NOT EXISTS release_track text NOT NULL DEFAULT 'standard';

ALTER TABLE public.tool_index_review_runs
  DROP CONSTRAINT IF EXISTS tool_index_review_runs_release_track_check;
ALTER TABLE public.tool_index_review_runs
  ADD CONSTRAINT tool_index_review_runs_release_track_check
  CHECK (release_track IN ('standard', 'mature_high_demand'));

DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
      FROM pg_constraint
     WHERE conrelid = 'public.tool_index_review_runs'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) LIKE '%approve_continue_index%'
  LOOP
    EXECUTE format('ALTER TABLE public.tool_index_review_runs DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.tool_index_review_runs
  ADD CONSTRAINT tool_index_review_runs_approval_gate_check
  CHECK (
    decision <> 'approve_continue_index'
    OR (
      review_stage = 'eligibility'
      AND cardinality(blockers) = 0
      AND (
        site_search_health = 'healthy'
        OR (site_search_health = 'warning' AND release_track = 'mature_high_demand')
      )
      AND gsc_snapshot_date IS NOT NULL
      AND gsc_snapshot_age_days IS NOT NULL
      AND gsc_snapshot_age_days <= 14
    )
  );

ALTER TABLE public.tool_index_release_policy
  DROP CONSTRAINT IF EXISTS tool_index_release_policy_daily_limit_check;
ALTER TABLE public.tool_index_release_policy
  ADD CONSTRAINT tool_index_release_policy_daily_limit_check
  CHECK (daily_limit BETWEEN 1 AND 5);

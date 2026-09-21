CREATE TABLE IF NOT EXISTS public.tool_index_review_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  review_stage text NOT NULL DEFAULT 'eligibility'
    CHECK (review_stage IN ('eligibility', 'post_index_7d', 'post_index_14d', 'post_index_28d')),
  decision text NOT NULL
    CHECK (decision IN ('approve_continue_index', 'hold_monitor', 'repair_monitor', 'permanent_noindex', 'merge_or_archive')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  minimum_observation_ends_at date,
  gsc_snapshot_date date,
  gsc_snapshot_age_days integer CHECK (gsc_snapshot_age_days IS NULL OR gsc_snapshot_age_days >= 0),
  site_search_health text NOT NULL DEFAULT 'unknown'
    CHECK (site_search_health IN ('healthy', 'warning', 'blocked', 'unknown')),
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  blockers text[] NOT NULL DEFAULT ARRAY[]::text[],
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by text NOT NULL,
  event_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    decision <> 'approve_continue_index'
    OR (
      review_stage = 'eligibility'
      AND cardinality(blockers) = 0
      AND site_search_health = 'healthy'
      AND gsc_snapshot_date IS NOT NULL
      AND gsc_snapshot_age_days IS NOT NULL
      AND gsc_snapshot_age_days <= 14
    )
  )
);

CREATE INDEX IF NOT EXISTS tool_index_review_runs_tool_created_idx
  ON public.tool_index_review_runs(tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_index_review_runs_decision_created_idx
  ON public.tool_index_review_runs(decision, created_at DESC);

ALTER TABLE public.tool_index_review_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tool_index_review_runs FROM PUBLIC;
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON public.tool_index_review_runs FROM %I', role_name);
    END IF;
  END LOOP;
END $$;

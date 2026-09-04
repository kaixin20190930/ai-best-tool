-- Applies to the authoritative Neon tools table, not the historical Supabase copy.
ALTER TABLE public.tools ALTER COLUMN page_quality_status SET DEFAULT 'monitor';
CREATE TABLE IF NOT EXISTS public.tool_index_release_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  paused boolean NOT NULL DEFAULT true,
  daily_limit integer NOT NULL DEFAULT 1 CHECK (daily_limit BETWEEN 1 AND 1),
  weekly_limit integer NOT NULL DEFAULT 5 CHECK (weekly_limit BETWEEN 1 AND 5),
  pause_reason text NOT NULL DEFAULT 'Approval history requires reconciliation.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tool_index_release_policy(singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tool_index_release_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tool_id uuid NOT NULL,
  tool_slug text NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('baseline', 'historical_observed', 'approval')),
  release_day date,
  event_key text UNIQUE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  database_actor text NOT NULL DEFAULT session_user,
  source text NOT NULL,
  CHECK ((entry_type = 'baseline' AND release_day IS NULL) OR
         (entry_type <> 'baseline' AND release_day IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS tool_index_release_log_day_idx
  ON public.tool_index_release_log(release_day) WHERE entry_type <> 'baseline';

-- Snapshot existing approvals without inventing historical approval dates.
INSERT INTO public.tool_index_release_log(tool_id, tool_slug, entry_type, event_key, source)
SELECT id, name, 'baseline', 'baseline:' || id::text, 'Existing approved state; approval date unknown'
FROM public.tools WHERE status = 'published' AND page_quality_status = 'continue_index'
ON CONFLICT (event_key) DO NOTHING;

-- These two dates are documented deployment observations, not inferred from created_at.
INSERT INTO public.tool_index_release_log(tool_id, tool_slug, entry_type, release_day, event_key, source)
SELECT id, name, 'historical_observed', DATE '2026-09-04', 'observed:2026-09-04:' || id::text,
  'Verified release audit 2026-09-04; known same-day policy deviation'
FROM public.tools
WHERE (id = 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e' AND name = 'openrouter')
   OR (id = '23bb3601-a5ac-42c3-bff3-64b06a063959' AND name = 'n8n')
ON CONFLICT (event_key) DO NOTHING;

ALTER TABLE public.tool_index_release_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_index_release_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tool_index_release_policy, public.tool_index_release_log FROM PUBLIC;
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON public.tool_index_release_policy, public.tool_index_release_log FROM %I', role_name);
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.guard_tool_index_release()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE
  policy public.tool_index_release_policy%ROWTYPE;
  release_date date;
  week_start date;
  day_count integer;
  week_count integer;
BEGIN
  IF NEW.status IS DISTINCT FROM 'published' OR NEW.page_quality_status IS DISTINCT FROM 'continue_index' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'published' AND OLD.page_quality_status = 'continue_index' THEN
      RETURN NEW;
    END IF;
  END IF;

  -- One shared policy row makes concurrent approvals atomic under READ COMMITTED.
  SELECT * INTO policy FROM public.tool_index_release_policy WHERE singleton = true FOR UPDATE;
  IF NOT FOUND OR policy.paused THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INDEX_RELEASE_PAUSED: Index approvals are paused. Keep the tool published with page quality status monitor.';
  END IF;
  -- Also version the mutex row so stronger isolation levels cannot approve
  -- against an old ledger snapshot after waiting for another transaction.
  UPDATE public.tool_index_release_policy SET updated_at = clock_timestamp() WHERE singleton = true;
  release_date := (clock_timestamp() AT TIME ZONE 'Asia/Shanghai')::date;
  week_start := date_trunc('week', release_date::timestamp)::date;
  SELECT count(*) FILTER (WHERE release_day = release_date), count(*)
    INTO day_count, week_count FROM public.tool_index_release_log
    WHERE entry_type <> 'baseline' AND release_day BETWEEN week_start AND release_date;
  IF week_count >= policy.weekly_limit THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INDEX_RELEASE_WEEKLY_LIMIT: Weekly index approval limit reached. Keep the tool published with page quality status monitor.';
  END IF;
  IF day_count >= policy.daily_limit THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INDEX_RELEASE_DAILY_LIMIT: Daily index approval limit reached. Keep the tool published with page quality status monitor.';
  END IF;
  INSERT INTO public.tool_index_release_log(tool_id, tool_slug, entry_type, release_day, source)
    VALUES (NEW.id, NEW.name, 'approval', release_date, TG_OP || ' on tools');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_tool_index_release() FROM PUBLIC;

-- AFTER avoids charging for INSERT ... ON CONFLICT DO NOTHING. An exception rolls
-- back the row and ledger together, including a multi-row statement.
DROP TRIGGER IF EXISTS tool_index_release_guard ON public.tools;
CREATE TRIGGER tool_index_release_guard
AFTER INSERT OR UPDATE OF status, page_quality_status ON public.tools
FOR EACH ROW EXECUTE FUNCTION public.guard_tool_index_release();

-- MEASURE-02: retention, aggregate access and operation audit boundary.
-- This migration is intentionally not applied by this change. It does not enable collection.

CREATE TABLE IF NOT EXISTS public.decision_metric_daily_rollups (
  metric_day DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_version SMALLINT NOT NULL CHECK (event_version = 1),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn')),
  surface TEXT NOT NULL CHECK (surface IN ('find_tools', 'tool_detail', 'comparison', 'guide', 'profile')),
  task_id UUID,
  tool_id UUID,
  event_count BIGINT NOT NULL CHECK (event_count >= 0),
  unique_human_flows BIGINT NOT NULL CHECK (unique_human_flows >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS decision_metric_daily_rollups_identity
  ON public.decision_metric_daily_rollups (
    metric_day,
    event_name,
    event_version,
    locale,
    surface,
    COALESCE(task_id, '00000000-0000-0000-0000-000000000000'::UUID),
    COALESCE(tool_id, '00000000-0000-0000-0000-000000000000'::UUID)
  );

CREATE INDEX IF NOT EXISTS decision_metric_daily_rollups_expiry
  ON public.decision_metric_daily_rollups(expires_at);

CREATE TABLE IF NOT EXISTS public.decision_metric_operation_audits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  raw_window_end TIMESTAMPTZ NOT NULL,
  status_code TEXT NOT NULL CHECK (status_code IN ('completed', 'operation_failed')),
  rolled_up_rows BIGINT NOT NULL DEFAULT 0 CHECK (rolled_up_rows >= 0),
  deleted_raw_rows BIGINT NOT NULL DEFAULT 0 CHECK (deleted_raw_rows >= 0),
  deleted_rollup_rows BIGINT NOT NULL DEFAULT 0 CHECK (deleted_rollup_rows >= 0)
);

CREATE INDEX IF NOT EXISTS decision_metric_operation_audits_started_at
  ON public.decision_metric_operation_audits(started_at DESC);

ALTER TABLE public.decision_metric_daily_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_metric_daily_rollups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.decision_metric_operation_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_metric_operation_audits FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.decision_metric_daily_rollups FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.decision_metric_operation_audits FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE public.decision_metric_operation_audits_id_seq FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.maintain_decision_metric_events(p_now TIMESTAMPTZ DEFAULT NOW())
RETURNS TABLE (
  status_code TEXT,
  rolled_up_rows BIGINT,
  deleted_raw_rows BIGINT,
  deleted_rollup_rows BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_started_at TIMESTAMPTZ := clock_timestamp();
  v_raw_window_end TIMESTAMPTZ := p_now - INTERVAL '35 days';
  v_rolled_up BIGINT := 0;
  v_deleted_raw BIGINT := 0;
  v_deleted_rollups BIGINT := 0;
BEGIN
  INSERT INTO public.decision_metric_daily_rollups (
    metric_day,
    event_name,
    event_version,
    locale,
    surface,
    task_id,
    tool_id,
    event_count,
    unique_human_flows,
    expires_at,
    updated_at
  )
  SELECT
    received_at::DATE,
    event_name,
    event_version,
    locale,
    surface,
    task_id,
    tool_id,
    COUNT(*),
    COUNT(DISTINCT flow_instance_hash),
    (received_at::DATE + INTERVAL '400 days'),
    p_now
  FROM public.decision_metric_events
  WHERE traffic_quality = 'human'
    AND received_at <= v_raw_window_end
  GROUP BY received_at::DATE, event_name, event_version, locale, surface, task_id, tool_id
  ON CONFLICT (
    metric_day,
    event_name,
    event_version,
    locale,
    surface,
    (COALESCE(task_id, '00000000-0000-0000-0000-000000000000'::UUID)),
    (COALESCE(tool_id, '00000000-0000-0000-0000-000000000000'::UUID))
  ) DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_human_flows = EXCLUDED.unique_human_flows,
    expires_at = EXCLUDED.expires_at,
    updated_at = EXCLUDED.updated_at;
  GET DIAGNOSTICS v_rolled_up = ROW_COUNT;

  DELETE FROM public.decision_metric_events WHERE received_at <= v_raw_window_end;
  GET DIAGNOSTICS v_deleted_raw = ROW_COUNT;

  DELETE FROM public.decision_metric_daily_rollups WHERE expires_at <= p_now;
  GET DIAGNOSTICS v_deleted_rollups = ROW_COUNT;

  DELETE FROM public.decision_metric_operation_audits
  WHERE started_at < p_now - INTERVAL '90 days';

  INSERT INTO public.decision_metric_operation_audits (
    started_at,
    completed_at,
    raw_window_end,
    status_code,
    rolled_up_rows,
    deleted_raw_rows,
    deleted_rollup_rows
  ) VALUES (
    v_started_at,
    clock_timestamp(),
    v_raw_window_end,
    'completed',
    v_rolled_up,
    v_deleted_raw,
    v_deleted_rollups
  );

  RETURN QUERY SELECT 'completed'::TEXT, v_rolled_up, v_deleted_raw, v_deleted_rollups;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.decision_metric_operation_audits (
    started_at,
    completed_at,
    raw_window_end,
    status_code
  ) VALUES (
    v_started_at,
    clock_timestamp(),
    v_raw_window_end,
    'operation_failed'
  );
  RETURN QUERY SELECT 'operation_failed'::TEXT, 0::BIGINT, 0::BIGINT, 0::BIGINT;
END;
$$;

CREATE OR REPLACE FUNCTION public.read_decision_metric_daily_summary(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  metric_day DATE,
  event_name TEXT,
  locale TEXT,
  surface TEXT,
  task_id UUID,
  tool_id UUID,
  sample_state TEXT,
  event_count BIGINT,
  unique_human_flows BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH combined AS (
    SELECT
      received_at::DATE AS metric_day,
      event_name,
      locale,
      surface,
      task_id,
      tool_id,
      COUNT(*)::BIGINT AS event_count,
      COUNT(DISTINCT flow_instance_hash)::BIGINT AS unique_human_flows
    FROM public.decision_metric_events
    WHERE traffic_quality = 'human'
      AND received_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY received_at::DATE, event_name, locale, surface, task_id, tool_id
    UNION ALL
    SELECT
      metric_day,
      event_name,
      locale,
      surface,
      task_id,
      tool_id,
      SUM(event_count)::BIGINT,
      SUM(unique_human_flows)::BIGINT
    FROM public.decision_metric_daily_rollups
    WHERE metric_day BETWEEN p_start_date AND p_end_date
    GROUP BY metric_day, event_name, locale, surface, task_id, tool_id
  ), totals AS (
    SELECT
      combined.metric_day,
      combined.event_name,
      combined.locale,
      combined.surface,
      combined.task_id,
      combined.tool_id,
      SUM(combined.event_count)::BIGINT AS event_count,
      SUM(combined.unique_human_flows)::BIGINT AS unique_human_flows
    FROM combined
    GROUP BY
      combined.metric_day,
      combined.event_name,
      combined.locale,
      combined.surface,
      combined.task_id,
      combined.tool_id
  )
  SELECT
    totals.metric_day,
    totals.event_name,
    totals.locale,
    totals.surface,
    totals.task_id,
    totals.tool_id,
    CASE WHEN totals.unique_human_flows >= 20 THEN 'reportable' ELSE 'insufficient_data' END,
    CASE WHEN totals.unique_human_flows >= 20 THEN totals.event_count ELSE NULL END,
    CASE WHEN totals.unique_human_flows >= 20 THEN totals.unique_human_flows ELSE NULL END
  FROM totals
  ORDER BY totals.metric_day, totals.event_name, totals.locale, totals.surface, totals.task_id, totals.tool_id;
$$;

REVOKE ALL ON FUNCTION public.maintain_decision_metric_events(TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_decision_metric_daily_summary(DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.maintain_decision_metric_events(TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_decision_metric_daily_summary(DATE, DATE) TO service_role;

COMMENT ON TABLE public.decision_metric_daily_rollups IS
  'MEASURE-02 daily human-only aggregates. Contains no flow hash or visitor identifier; retained for 400 days.';
COMMENT ON TABLE public.decision_metric_operation_audits IS
  'MEASURE-02 bounded operation audit. Stores status codes and row counts only; retained for 90 days.';
COMMENT ON FUNCTION public.maintain_decision_metric_events(TIMESTAMPTZ) IS
  'Roll up expired human events, delete raw events after 35 days, and prune aggregate/audit retention.';

-- Sanitized maintenance freshness for the service-only monitor endpoint.
-- This does not expose event rows, flow hashes, operation error text, or user data.

CREATE OR REPLACE FUNCTION public.read_decision_metric_maintenance_status()
RETURNS TABLE (
  last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_attempt_status TEXT,
  freshness_status TEXT,
  age_seconds BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH status AS (
    SELECT
      MAX(completed_at) FILTER (WHERE status_code = 'completed') AS last_success_at,
      (ARRAY_AGG(completed_at ORDER BY completed_at DESC))[1] AS last_attempt_at,
      (ARRAY_AGG(status_code ORDER BY completed_at DESC))[1] AS last_attempt_status
    FROM public.decision_metric_operation_audits
  )
  SELECT
    status.last_success_at,
    status.last_attempt_at,
    status.last_attempt_status,
    CASE
      WHEN status.last_success_at IS NULL THEN 'never_run'
      WHEN status.last_success_at < NOW() - INTERVAL '48 hours' THEN 'stale'
      ELSE 'fresh'
    END,
    CASE
      WHEN status.last_success_at IS NULL THEN NULL
      ELSE FLOOR(EXTRACT(EPOCH FROM (NOW() - status.last_success_at)))::BIGINT
    END
  FROM status;
$$;

REVOKE ALL ON FUNCTION public.read_decision_metric_maintenance_status() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_decision_metric_maintenance_status() TO service_role;

COMMENT ON FUNCTION public.read_decision_metric_maintenance_status() IS
  'Service-only sanitized freshness status for the decision metric retention operation.';

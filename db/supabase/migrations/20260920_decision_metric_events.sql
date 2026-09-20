-- MEASURE-01: privacy-minimized decision funnel events.
-- This migration is intentionally not applied by this change. Collection remains disabled until
-- Privacy Owner approval covers retention, internal traffic, bot handling, and access operations.

CREATE TABLE IF NOT EXISTS public.decision_metric_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'find_tools_view',
    'task_start',
    'constraint_selected',
    'task_results_shown',
    'task_zero_result',
    'tool_detail_open',
    'comparison_open',
    'evidence_open',
    'decision_saved',
    'official_site_click'
  )),
  event_version SMALLINT NOT NULL CHECK (event_version = 1),
  flow_instance_hash CHAR(64) NOT NULL CHECK (flow_instance_hash ~ '^[0-9a-f]{64}$'),
  idempotency_key CHAR(64) NOT NULL UNIQUE CHECK (idempotency_key ~ '^[0-9a-f]{64}$'),
  traffic_quality TEXT NOT NULL CHECK (traffic_quality IN ('human', 'unknown')),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn')),
  surface TEXT NOT NULL CHECK (surface IN ('find_tools', 'tool_detail', 'comparison', 'guide', 'profile')),
  task_id UUID,
  result_id UUID,
  tool_id UUID,
  constraint_key TEXT CHECK (constraint_key IN (
    'role', 'team_size', 'budget', 'budget_period', 'integrations', 'data_sensitivity', 'self_host', 'export'
  )),
  constraint_value_code TEXT CHECK (constraint_value_code IN (
    'redacted', 'unknown', 'solo', '2_10', '11_50', '51_plus', 'month', 'year', 'one_time',
    'low', 'medium', 'high', 'regulated', 'required', 'not_required'
  )),
  rules_version TEXT CHECK (rules_version = 'decision-v1'),
  result_count SMALLINT CHECK (result_count BETWEEN 0 AND 3),
  has_unknown BOOLEAN,
  zero_reason_code TEXT CHECK (zero_reason_code IN (
    'no_published_fit', 'no_candidate_after_rules', 'evidence_unavailable'
  )),
  entry_point TEXT CHECK (entry_point IN ('finder_result', 'tool_detail', 'guide', 'comparison')),
  comparison_key TEXT CHECK (comparison_key ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'),
  source_tool_id UUID,
  evidence_surface TEXT CHECK (evidence_surface IN ('ledger', 'card_source')),
  claim_type TEXT CHECK (claim_type IN (
    'product_name', 'one_line_positioning', 'target_audience', 'use_case', 'feature', 'integration',
    'supported_platform', 'pricing_model', 'pricing_plan', 'free_trial', 'free_limit', 'export_limit',
    'license_limit', 'security_claim', 'official_social', 'official_repository', 'changelog_update', 'limitation'
  )),
  save_mode TEXT CHECK (save_mode IN ('create', 'update')),
  official_domain_code TEXT CHECK (official_domain_code ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'),
  received_at TIMESTAMPTZ NOT NULL,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > received_at),
  CONSTRAINT decision_metric_events_field_ownership CHECK (
    (task_id IS NULL OR event_name IN ('task_start', 'task_results_shown', 'task_zero_result', 'decision_saved'))
    AND (result_id IS NULL OR event_name IN (
      'task_results_shown', 'task_zero_result', 'tool_detail_open', 'comparison_open', 'decision_saved'
    ))
    AND (tool_id IS NULL OR event_name IN ('tool_detail_open', 'evidence_open', 'official_site_click'))
    AND (constraint_key IS NULL OR event_name = 'constraint_selected')
    AND (constraint_value_code IS NULL OR event_name = 'constraint_selected')
    AND (rules_version IS NULL OR event_name IN ('task_results_shown', 'task_zero_result', 'decision_saved'))
    AND (result_count IS NULL OR event_name = 'task_results_shown')
    AND (has_unknown IS NULL OR event_name = 'task_results_shown')
    AND (zero_reason_code IS NULL OR event_name = 'task_zero_result')
    AND (comparison_key IS NULL OR event_name = 'comparison_open')
    AND (source_tool_id IS NULL OR event_name = 'comparison_open')
    AND (evidence_surface IS NULL OR event_name = 'evidence_open')
    AND (claim_type IS NULL OR event_name = 'evidence_open')
    AND (save_mode IS NULL OR event_name = 'decision_saved')
    AND (official_domain_code IS NULL OR event_name = 'official_site_click')
  ),
  CONSTRAINT decision_metric_events_required_shape CHECK (
    CASE event_name
      WHEN 'find_tools_view' THEN surface = 'find_tools'
      WHEN 'task_start' THEN surface = 'find_tools' AND task_id IS NOT NULL
      WHEN 'constraint_selected' THEN
        surface = 'find_tools' AND constraint_key IS NOT NULL AND constraint_value_code IS NOT NULL
      WHEN 'task_results_shown' THEN
        surface = 'find_tools' AND task_id IS NOT NULL AND result_id IS NOT NULL
        AND rules_version IS NOT NULL AND result_count IS NOT NULL AND has_unknown IS NOT NULL
      WHEN 'task_zero_result' THEN
        surface = 'find_tools' AND task_id IS NOT NULL AND result_id IS NOT NULL
        AND rules_version IS NOT NULL AND zero_reason_code IS NOT NULL
      WHEN 'tool_detail_open' THEN
        surface = 'tool_detail' AND result_id IS NOT NULL AND tool_id IS NOT NULL AND entry_point = 'finder_result'
      WHEN 'comparison_open' THEN
        surface = 'comparison' AND comparison_key IS NOT NULL
        AND (
          (entry_point = 'finder_result' AND result_id IS NOT NULL AND source_tool_id IS NULL)
          OR (entry_point = 'tool_detail' AND source_tool_id IS NOT NULL AND result_id IS NULL)
        )
      WHEN 'evidence_open' THEN
        surface = 'tool_detail' AND tool_id IS NOT NULL AND evidence_surface IS NOT NULL AND claim_type IS NOT NULL
      WHEN 'decision_saved' THEN
        surface IN ('find_tools', 'profile') AND task_id IS NOT NULL AND result_id IS NOT NULL
        AND save_mode IS NOT NULL AND rules_version IS NOT NULL
      WHEN 'official_site_click' THEN
        tool_id IS NOT NULL AND official_domain_code IS NOT NULL AND surface = entry_point
      ELSE FALSE
    END
  )
);

CREATE INDEX IF NOT EXISTS idx_decision_metric_events_reporting
  ON public.decision_metric_events(event_name, traffic_quality, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_metric_events_expiry
  ON public.decision_metric_events(expires_at);

ALTER TABLE public.decision_metric_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_metric_events FORCE ROW LEVEL SECURITY;

-- Browser roles receive no policy and no table privileges. The server-side service role can only insert;
-- reporting, retention deletion, and raw-row reads require a separate Owner-approved operation or migration.
REVOKE ALL ON TABLE public.decision_metric_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.decision_metric_events_id_seq FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.decision_metric_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.decision_metric_events_id_seq TO service_role;

COMMENT ON TABLE public.decision_metric_events IS
  'MEASURE-01 allowlisted decision events. No raw flow ID, URL, query, user ID, IP, UA, referrer, or free text.';
COMMENT ON COLUMN public.decision_metric_events.flow_instance_hash IS
  'Site-keyed hash of a refresh-volatile, 30-minute rolling in-memory flow ID; the raw ID is never stored.';
COMMENT ON COLUMN public.decision_metric_events.expires_at IS
  'Reviewable per-row retention boundary. No retention duration or deletion job is approved by this migration.';

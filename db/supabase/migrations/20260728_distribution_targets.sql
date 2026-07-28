-- Target-site registry for human-led distribution research.
-- This migration adds the concrete target layer that sits under distribution channels.

CREATE TABLE IF NOT EXISTS distribution_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES distribution_channels(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  homepage_url VARCHAR(1200) NOT NULL,
  submission_url VARCHAR(1200),
  registration_url VARCHAR(1200),
  pricing_url VARCHAR(1200),
  audience TEXT,
  target_status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (target_status IN ('active', 'stale', 'blocked', 'retired')),
  requires_account BOOLEAN NOT NULL DEFAULT FALSE,
  requires_payment BOOLEAN NOT NULL DEFAULT FALSE,
  requires_captcha BOOLEAN NOT NULL DEFAULT FALSE,
  requires_backlink BOOLEAN NOT NULL DEFAULT FALSE,
  editorial_review BOOLEAN NOT NULL DEFAULT FALSE,
  expected_review_days INTEGER CHECK (expected_review_days IS NULL OR expected_review_days > 0),
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (channel_id, homepage_url)
);

CREATE TABLE IF NOT EXISTS distribution_target_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES distribution_targets(id) ON DELETE CASCADE,
  page_url VARCHAR(1200) NOT NULL,
  http_status INTEGER,
  content_hash VARCHAR(128),
  page_title VARCHAR(240),
  visible_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  pricing_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  requires_account BOOLEAN NOT NULL DEFAULT FALSE,
  requires_captcha BOOLEAN NOT NULL DEFAULT FALSE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_target_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES distribution_targets(id) ON DELETE CASCADE,
  source_snapshot_id UUID REFERENCES distribution_target_snapshots(id) ON DELETE SET NULL,
  required_field VARCHAR(120) NOT NULL,
  field_type VARCHAR(40) NOT NULL,
  character_limit INTEGER CHECK (character_limit IS NULL OR character_limit > 0),
  allowed_values JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_asset VARCHAR(80),
  rule_text TEXT NOT NULL,
  source_url VARCHAR(1200) NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (target_id, required_field, source_url)
);

CREATE INDEX IF NOT EXISTS idx_distribution_targets_channel_status
  ON distribution_targets(channel_id, target_status, confidence DESC, next_check_at ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_distribution_targets_status_check
  ON distribution_targets(target_status, next_check_at ASC NULLS LAST, last_checked_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_distribution_target_snapshots_target_fetched
  ON distribution_target_snapshots(target_id, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_target_snapshots_hash
  ON distribution_target_snapshots(target_id, content_hash);

CREATE INDEX IF NOT EXISTS idx_distribution_target_requirements_target_field
  ON distribution_target_requirements(target_id, required_field, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_target_requirements_snapshot
  ON distribution_target_requirements(source_snapshot_id);

ALTER TABLE distribution_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_target_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_target_requirements ENABLE ROW LEVEL SECURITY;

-- Target registry is served through service-role/admin flows, so no public policies are added here yet.

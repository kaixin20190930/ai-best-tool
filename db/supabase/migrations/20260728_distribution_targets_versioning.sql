-- Versioned snapshots and review state for target-site research.

ALTER TABLE distribution_target_snapshots
  ADD COLUMN IF NOT EXISTS rule_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS snapshot_hash VARCHAR(128),
  ADD COLUMN IF NOT EXISTS analysis_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS obstacle_status VARCHAR(20) NOT NULL DEFAULT 'clear'
    CHECK (obstacle_status IN ('clear', 'needs_review', 'blocked')),
  ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_reason TEXT,
  ADD COLUMN IF NOT EXISTS discovered_page_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE distribution_targets
  ADD COLUMN IF NOT EXISTS current_snapshot_id UUID REFERENCES distribution_target_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_rule_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_review_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_distribution_target_snapshots_target_rule_version
  ON distribution_target_snapshots(target_id, rule_version DESC, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_target_snapshots_target_hash
  ON distribution_target_snapshots(target_id, snapshot_hash);

CREATE INDEX IF NOT EXISTS idx_distribution_targets_current_snapshot
  ON distribution_targets(current_snapshot_id);

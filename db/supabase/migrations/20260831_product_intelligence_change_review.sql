-- Preserve verified intelligence facts while automated scans create reviewable differences.

CREATE TABLE IF NOT EXISTS product_intelligence_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  source_url VARCHAR(1200) NOT NULL,
  claim_type VARCHAR(50) NOT NULL,
  claim_key VARCHAR(180) NOT NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('added', 'changed', 'removed')),
  old_value JSONB,
  new_value JSONB,
  old_excerpt TEXT,
  new_excerpt TEXT,
  fingerprint VARCHAR(64) NOT NULL UNIQUE,
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'accepted', 'rejected')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_changes_review_queue
  ON product_intelligence_changes(review_status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_changes_profile
  ON product_intelligence_changes(profile_id, review_status, detected_at DESC);

ALTER TABLE product_intelligence_changes ENABLE ROW LEVEL SECURITY;

-- This is an internal editorial queue. Browser clients receive no direct policy;
-- admin service-role access is used by persistence and the admin dashboard.

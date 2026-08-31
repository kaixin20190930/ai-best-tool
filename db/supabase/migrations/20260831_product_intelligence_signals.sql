-- Queue owner and community input as reviewable signals without publishing it as verified fact.

CREATE TABLE IF NOT EXISTS product_intelligence_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('owner_claim', 'profile_correction', 'comment')),
  source_id UUID NOT NULL,
  signal_type VARCHAR(40) NOT NULL CHECK (signal_type IN ('owner_update', 'correction', 'user_experience')),
  content TEXT NOT NULL,
  source_path VARCHAR(1200),
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'accepted', 'rejected')),
  observed_at TIMESTAMPTZ NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_intelligence_signals_review
  ON product_intelligence_signals(review_status, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_signals_profile
  ON product_intelligence_signals(profile_id, review_status, observed_at DESC);

ALTER TABLE product_intelligence_signals ENABLE ROW LEVEL SECURITY;

-- Internal editorial data; service-role access only until reviewed and promoted.

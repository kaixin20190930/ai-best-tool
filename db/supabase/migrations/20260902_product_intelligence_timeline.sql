-- Editorial timeline for confirmed fact changes and explicit no-change reviews.
-- Machine-detected diffs remain in product_intelligence_changes until reviewed.

CREATE TABLE IF NOT EXISTS product_intelligence_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  source_change_id UUID REFERENCES product_intelligence_changes(id) ON DELETE SET NULL,
  event_type VARCHAR(30) NOT NULL
    CHECK (event_type IN ('fact_added', 'fact_changed', 'fact_removed', 'reviewed_no_change')),
  review_scope VARCHAR(20) NOT NULL DEFAULT 'fact'
    CHECK (review_scope IN ('fact', 'decision', 'full')),
  claim_type VARCHAR(50),
  claim_key VARCHAR(180),
  title VARCHAR(240) NOT NULL,
  summary TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  source_url VARCHAR(1200),
  source_excerpt TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('internal', 'public')),
  occurred_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_by UUID,
  review_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT intelligence_timeline_fact_fields_check CHECK (
    event_type = 'reviewed_no_change'
    OR (claim_type IS NOT NULL AND claim_key IS NOT NULL)
  ),
  CONSTRAINT intelligence_timeline_public_source_check CHECK (
    visibility = 'internal'
    OR source_url ~* '^https?://'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intelligence_timeline_source_change
  ON product_intelligence_timeline_events(source_change_id)
  WHERE source_change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_profile_date
  ON product_intelligence_timeline_events(profile_id, occurred_at DESC, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_public
  ON product_intelligence_timeline_events(profile_id, occurred_at DESC)
  WHERE visibility = 'public';

ALTER TABLE product_intelligence_timeline_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE product_intelligence_timeline_events IS
  'Human-confirmed timeline. Automated differences never enter this table without an explicit review.';
COMMENT ON COLUMN product_intelligence_timeline_events.occurred_at IS
  'When the product fact changed or when a no-change review was performed.';
COMMENT ON COLUMN product_intelligence_timeline_events.verified_at IS
  'When an editor verified and recorded this event.';

-- Unify claim-level provenance, review state, conflicts, and validity boundaries.
-- Existing machine-extracted claims remain candidates until an explicit review.

ALTER TABLE product_intelligence_sources
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(30) NOT NULL DEFAULT 'official',
  ADD COLUMN IF NOT EXISTS source_label VARCHAR(200),
  ADD COLUMN IF NOT EXISTS publisher_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_intelligence_sources_source_type_check'
  ) THEN
    ALTER TABLE product_intelligence_sources
      ADD CONSTRAINT product_intelligence_sources_source_type_check
      CHECK (source_type IN ('official', 'independent', 'owner', 'user', 'editorial'));
  END IF;
END $$;

ALTER TABLE product_intelligence_claims
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES product_intelligence_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(30) NOT NULL DEFAULT 'official',
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'candidate',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS review_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invalidation_reason TEXT,
  ADD COLUMN IF NOT EXISTS validity_scope JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_intelligence_claims_source_type_check'
  ) THEN
    ALTER TABLE product_intelligence_claims
      ADD CONSTRAINT product_intelligence_claims_source_type_check
      CHECK (source_type IN ('official', 'independent', 'owner', 'user', 'editorial'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_intelligence_claims_verification_status_check'
  ) THEN
    ALTER TABLE product_intelligence_claims
      ADD CONSTRAINT product_intelligence_claims_verification_status_check
      CHECK (verification_status IN ('candidate', 'verified', 'rejected', 'superseded'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_intelligence_claims_invalidation_check'
  ) THEN
    ALTER TABLE product_intelligence_claims
      ADD CONSTRAINT product_intelligence_claims_invalidation_check
      CHECK (invalidated_at IS NULL OR NULLIF(BTRIM(invalidation_reason), '') IS NOT NULL);
  END IF;
END $$;

-- Link historical claims to their existing source row without changing evidence status.
UPDATE product_intelligence_claims claim
SET source_id = source.id
FROM product_intelligence_sources source
WHERE claim.source_id IS NULL
  AND source.profile_id = claim.profile_id
  AND source.url = claim.source_url;

-- Preserve any source-kind metadata written by earlier ingestion jobs.
UPDATE product_intelligence_claims
SET source_type = CASE metadata->>'sourceKind'
  WHEN 'independent' THEN 'independent'
  WHEN 'owner' THEN 'owner'
  WHEN 'user' THEN 'user'
  WHEN 'editorial' THEN 'editorial'
  ELSE 'official'
END
WHERE source_type = 'official';

UPDATE product_intelligence_sources source
SET source_type = claim.source_type
FROM product_intelligence_claims claim
WHERE claim.source_id = source.id
  AND source.source_type = 'official'
  AND claim.source_type <> 'official';

CREATE INDEX IF NOT EXISTS idx_intelligence_claims_source
  ON product_intelligence_claims(source_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_claims_evidence_review
  ON product_intelligence_claims(profile_id, verification_status, review_due_at);
CREATE INDEX IF NOT EXISTS idx_intelligence_claims_source_type
  ON product_intelligence_claims(profile_id, source_type, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_claims_invalidated
  ON product_intelligence_claims(profile_id, invalidated_at)
  WHERE invalidated_at IS NOT NULL;

COMMENT ON COLUMN product_intelligence_claims.verification_status IS
  'Editorial state. Automated extraction remains candidate until explicitly verified.';
COMMENT ON COLUMN product_intelligence_claims.review_due_at IS
  'Review deadline; passing it does not automatically invalidate or rewrite the claim.';
COMMENT ON COLUMN product_intelligence_claims.expires_at IS
  'Known factual expiry boundary, distinct from a routine review deadline.';
COMMENT ON COLUMN product_intelligence_claims.validity_scope IS
  'Structured plan, region, platform, account, or other conditions limiting where the claim applies.';

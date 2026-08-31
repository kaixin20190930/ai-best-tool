-- Restore the internal owner/correction source used by the intelligence signal queue.
-- The script is idempotent and keeps the table private behind service/database roles.

CREATE TABLE IF NOT EXISTS tool_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  listing_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  website VARCHAR(500),
  claim_reason VARCHAR(80),
  note TEXT,
  source_path VARCHAR(255),
  source_locale VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  claimed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tool_claims
  ADD COLUMN IF NOT EXISTS claim_reason VARCHAR(80),
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS source_path VARCHAR(255),
  ADD COLUMN IF NOT EXISTS source_locale VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_tool_claims_status ON tool_claims(status);
CREATE INDEX IF NOT EXISTS idx_tool_claims_email ON tool_claims(email);
CREATE INDEX IF NOT EXISTS idx_tool_claims_tool ON tool_claims(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_claims_created_at ON tool_claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_claims_intelligence_source
  ON tool_claims(claim_reason, updated_at DESC)
  WHERE tool_id IS NOT NULL AND claim_reason IN ('ownership_update', 'profile_correction');

ALTER TABLE tool_claims ENABLE ROW LEVEL SECURITY;

-- No public policies: claims contain private contact and editorial information.

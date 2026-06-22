ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS claim_status VARCHAR(30) DEFAULT 'unclaimed',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tools_claim_status ON tools(claim_status);

CREATE TABLE IF NOT EXISTS tool_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  listing_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  website VARCHAR(500),
  note TEXT,
  source_path VARCHAR(255),
  source_locale VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  claimed_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_claims_status ON tool_claims(status);
CREATE INDEX IF NOT EXISTS idx_tool_claims_email ON tool_claims(email);
CREATE INDEX IF NOT EXISTS idx_tool_claims_tool ON tool_claims(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_claims_created_at ON tool_claims(created_at DESC);

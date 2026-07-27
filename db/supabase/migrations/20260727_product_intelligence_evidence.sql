-- Shared evidence store for catalog tools and user-owned distribution projects.

CREATE TABLE IF NOT EXISTS product_intelligence_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type VARCHAR(30) NOT NULL CHECK (owner_type IN ('tool', 'distribution_project')),
  owner_id UUID NOT NULL,
  canonical_domain VARCHAR(255) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  profile_status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (profile_status IN ('pending', 'ready', 'conflict', 'stale')),
  profile_version INTEGER NOT NULL DEFAULT 1 CHECK (profile_version > 0),
  last_crawled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_type, owner_id)
);

CREATE TABLE IF NOT EXISTS product_intelligence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  url VARCHAR(1200) NOT NULL,
  page_type VARCHAR(40) NOT NULL DEFAULT 'other'
    CHECK (page_type IN (
      'homepage', 'pricing', 'features', 'product', 'use_case', 'documentation',
      'changelog', 'about', 'security', 'terms', 'license', 'repository', 'help', 'other'
    )),
  http_status INTEGER,
  canonical_url VARCHAR(1200),
  content_hash VARCHAR(128),
  content_type VARCHAR(120),
  fetched_at TIMESTAMPTZ,
  fetch_status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (fetch_status IN ('pending', 'success', 'blocked', 'failed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, url)
);

CREATE TABLE IF NOT EXISTS product_intelligence_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  claim_type VARCHAR(50) NOT NULL,
  claim_key VARCHAR(180) NOT NULL,
  claim_value JSONB NOT NULL,
  source_url VARCHAR(1200) NOT NULL,
  source_excerpt TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  conflict_status VARCHAR(20) NOT NULL DEFAULT 'none'
    CHECK (conflict_status IN ('none', 'possible', 'confirmed')),
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_intelligence_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES product_intelligence_profiles(id) ON DELETE CASCADE,
  asset_type VARCHAR(30) NOT NULL CHECK (asset_type IN ('logo', 'screenshot', 'social', 'video')),
  source_url VARCHAR(1200) NOT NULL,
  stored_url VARCHAR(1200),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  is_placeholder BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_status VARCHAR(30) NOT NULL DEFAULT 'candidate'
    CHECK (evidence_status IN ('candidate', 'verified', 'rejected')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, asset_type, source_url)
);

CREATE INDEX IF NOT EXISTS idx_intelligence_profiles_status_review
  ON product_intelligence_profiles(profile_status, next_review_at);
CREATE INDEX IF NOT EXISTS idx_intelligence_sources_profile_type
  ON product_intelligence_sources(profile_id, page_type, fetch_status);
CREATE INDEX IF NOT EXISTS idx_intelligence_claims_profile_key
  ON product_intelligence_claims(profile_id, claim_key, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_claims_conflicts
  ON product_intelligence_claims(profile_id, conflict_status)
  WHERE conflict_status <> 'none';
CREATE INDEX IF NOT EXISTS idx_intelligence_assets_profile_status
  ON product_intelligence_assets(profile_id, evidence_status);

ALTER TABLE product_intelligence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_intelligence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_intelligence_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_intelligence_assets ENABLE ROW LEVEL SECURITY;

-- Tool evidence remains internal and is accessed through direct/service-role DB connections.
-- Authenticated users can only access evidence attached to their own distribution projects.
DROP POLICY IF EXISTS "Users can view own product intelligence profiles" ON product_intelligence_profiles;
CREATE POLICY "Users can view own product intelligence profiles"
  ON product_intelligence_profiles FOR SELECT
  USING (
    owner_type = 'distribution_project'
    AND EXISTS (
      SELECT 1 FROM distribution_projects
      WHERE distribution_projects.id = owner_id
        AND distribution_projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own product intelligence profiles" ON product_intelligence_profiles;
CREATE POLICY "Users can manage own product intelligence profiles"
  ON product_intelligence_profiles FOR ALL
  USING (
    owner_type = 'distribution_project'
    AND EXISTS (
      SELECT 1 FROM distribution_projects
      WHERE distribution_projects.id = owner_id
        AND distribution_projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_type = 'distribution_project'
    AND EXISTS (
      SELECT 1 FROM distribution_projects
      WHERE distribution_projects.id = owner_id
        AND distribution_projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own product intelligence sources" ON product_intelligence_sources;
CREATE POLICY "Users can view own product intelligence sources"
  ON product_intelligence_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM product_intelligence_profiles profile
      JOIN distribution_projects project
        ON profile.owner_type = 'distribution_project' AND project.id = profile.owner_id
      WHERE profile.id = profile_id AND project.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own product intelligence claims" ON product_intelligence_claims;
CREATE POLICY "Users can view own product intelligence claims"
  ON product_intelligence_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM product_intelligence_profiles profile
      JOIN distribution_projects project
        ON profile.owner_type = 'distribution_project' AND project.id = profile.owner_id
      WHERE profile.id = profile_id AND project.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own product intelligence assets" ON product_intelligence_assets;
CREATE POLICY "Users can view own product intelligence assets"
  ON product_intelligence_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM product_intelligence_profiles profile
      JOIN distribution_projects project
        ON profile.owner_type = 'distribution_project' AND project.id = profile.owner_id
      WHERE profile.id = profile_id AND project.owner_id = auth.uid()
    )
  );

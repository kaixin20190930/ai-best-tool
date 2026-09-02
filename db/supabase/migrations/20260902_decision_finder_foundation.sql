-- Decision Finder foundation.
-- Directory tools and categories live in Neon. Their UUIDs are logical references here,
-- so this migration must never add cross-database foreign keys for tool_id/category_id.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS decision_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name JSONB NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  constraint_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT decision_tasks_slug_not_blank CHECK (NULLIF(BTRIM(slug), '') IS NOT NULL),
  CONSTRAINT decision_tasks_name_object CHECK (jsonb_typeof(name) = 'object'),
  CONSTRAINT decision_tasks_description_object CHECK (jsonb_typeof(description) = 'object'),
  CONSTRAINT decision_tasks_constraint_schema_object CHECK (jsonb_typeof(constraint_schema) = 'object')
);

CREATE TABLE IF NOT EXISTS tool_decision_profiles (
  tool_id UUID PRIMARY KEY,
  profile_version INTEGER NOT NULL DEFAULT 1 CHECK (profile_version > 0),
  setup_complexity VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (setup_complexity IN ('low', 'medium', 'high', 'unknown')),
  setup_minutes_low INTEGER CHECK (setup_minutes_low IS NULL OR setup_minutes_low >= 0),
  setup_minutes_high INTEGER CHECK (setup_minutes_high IS NULL OR setup_minutes_high >= 0),
  data_training_use VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (data_training_use IN ('no', 'opt_in', 'opt_out', 'yes', 'unknown')),
  self_host_level VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (self_host_level IN ('full', 'partial', 'no', 'unknown')),
  export_level VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (export_level IN ('full', 'limited', 'no', 'unknown')),
  decision_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  watch_outs JSONB NOT NULL DEFAULT '[]'::jsonb,
  editorial_status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (editorial_status IN ('draft', 'reviewed', 'published', 'stale')),
  reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tool_decision_profiles_setup_range CHECK (
    setup_minutes_low IS NULL OR setup_minutes_high IS NULL OR setup_minutes_high >= setup_minutes_low
  ),
  CONSTRAINT tool_decision_profiles_summary_object CHECK (jsonb_typeof(decision_summary) = 'object'),
  CONSTRAINT tool_decision_profiles_watch_outs_array CHECK (jsonb_typeof(watch_outs) = 'array'),
  CONSTRAINT tool_decision_profiles_review_dates CHECK (
    review_due_at IS NULL OR reviewed_at IS NULL OR review_due_at >= reviewed_at
  )
);

CREATE TABLE IF NOT EXISTS tool_task_fits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES decision_tasks(id) ON DELETE CASCADE,
  fit_level VARCHAR(20) NOT NULL
    CHECK (fit_level IN ('strong', 'conditional', 'weak', 'not_fit')),
  rationale JSONB NOT NULL,
  required_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  disqualifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'reviewed', 'published', 'stale')),
  reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tool_task_fits_rationale_object CHECK (jsonb_typeof(rationale) = 'object'),
  CONSTRAINT tool_task_fits_required_conditions_array CHECK (jsonb_typeof(required_conditions) = 'array'),
  CONSTRAINT tool_task_fits_disqualifiers_array CHECK (jsonb_typeof(disqualifiers) = 'array'),
  CONSTRAINT tool_task_fits_review_dates CHECK (
    review_due_at IS NULL OR reviewed_at IS NULL OR review_due_at >= reviewed_at
  ),
  UNIQUE(tool_id, task_id)
);

CREATE TABLE IF NOT EXISTS tool_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL,
  related_tool_id UUID NOT NULL,
  relationship_type VARCHAR(20) NOT NULL
    CHECK (relationship_type IN ('replaces', 'complements', 'overlaps', 'alternative')),
  rationale JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'reviewed', 'published', 'stale')),
  reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tool_relationships_different_tools CHECK (tool_id <> related_tool_id),
  CONSTRAINT tool_relationships_rationale_object CHECK (jsonb_typeof(rationale) = 'object'),
  CONSTRAINT tool_relationships_review_dates CHECK (
    review_due_at IS NULL OR reviewed_at IS NULL OR review_due_at >= reviewed_at
  ),
  UNIQUE(tool_id, related_tool_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS decision_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES decision_tasks(id) ON DELETE RESTRICT,
  role_key VARCHAR(60),
  team_size_band VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (team_size_band IN ('solo', '2_10', '11_50', '51_plus', 'unknown')),
  budget_min NUMERIC(12,2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max NUMERIC(12,2) CHECK (budget_max IS NULL OR budget_max >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  budget_period VARCHAR(20) CHECK (budget_period IS NULL OR budget_period IN ('month', 'year', 'one_time')),
  integration_keys TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  data_sensitivity VARCHAR(20) NOT NULL DEFAULT 'low'
    CHECK (data_sensitivity IN ('low', 'medium', 'high', 'regulated')),
  self_host_required BOOLEAN NOT NULL DEFAULT FALSE,
  export_required BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'saved', 'archived')),
  rules_version VARCHAR(40) NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT decision_sessions_budget_range CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min
  ),
  CONSTRAINT decision_sessions_rules_version_not_blank CHECK (
    NULLIF(BTRIM(rules_version), '') IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS decision_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES decision_sessions(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL,
  recommendation_role VARCHAR(30) NOT NULL
    CHECK (recommendation_role IN ('best_fit', 'lower_cost', 'privacy_control')),
  rank_order SMALLINT NOT NULL CHECK (rank_order BETWEEN 1 AND 3),
  matched_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  unresolved_unknowns JSONB NOT NULL DEFAULT '[]'::jsonb,
  disqualifiers_checked JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_snapshot JSONB NOT NULL,
  rules_version VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT decision_recommendations_matched_array CHECK (jsonb_typeof(matched_conditions) = 'array'),
  CONSTRAINT decision_recommendations_unknowns_array CHECK (jsonb_typeof(unresolved_unknowns) = 'array'),
  CONSTRAINT decision_recommendations_disqualifiers_array CHECK (jsonb_typeof(disqualifiers_checked) = 'array'),
  CONSTRAINT decision_recommendations_input_object CHECK (jsonb_typeof(input_snapshot) = 'object'),
  CONSTRAINT decision_recommendations_rules_version_not_blank CHECK (
    NULLIF(BTRIM(rules_version), '') IS NOT NULL
  ),
  UNIQUE(session_id, recommendation_role),
  UNIQUE(session_id, rank_order)
);

CREATE TABLE IF NOT EXISTS tool_decision_profile_claims (
  tool_id UUID NOT NULL REFERENCES tool_decision_profiles(tool_id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('fit', 'cost', 'setup', 'privacy', 'export', 'replacement', 'limitation', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(tool_id, claim_id, purpose)
);

CREATE TABLE IF NOT EXISTS tool_task_fit_claims (
  fit_id UUID NOT NULL REFERENCES tool_task_fits(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('fit', 'cost', 'setup', 'privacy', 'export', 'replacement', 'limitation', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(fit_id, claim_id, purpose)
);

CREATE TABLE IF NOT EXISTS tool_relationship_claims (
  relationship_id UUID NOT NULL REFERENCES tool_relationships(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('fit', 'cost', 'setup', 'privacy', 'export', 'replacement', 'limitation', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(relationship_id, claim_id, purpose)
);

CREATE TABLE IF NOT EXISTS decision_recommendation_claims (
  recommendation_id UUID NOT NULL REFERENCES decision_recommendations(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('fit', 'cost', 'setup', 'privacy', 'export', 'replacement', 'limitation', 'other')),
  claim_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT decision_recommendation_claims_snapshot_object CHECK (jsonb_typeof(claim_snapshot) = 'object'),
  PRIMARY KEY(recommendation_id, claim_id, purpose)
);

CREATE INDEX IF NOT EXISTS idx_decision_tasks_status_order
  ON decision_tasks(status, display_order, slug);
CREATE INDEX IF NOT EXISTS idx_tool_decision_profiles_status_review
  ON tool_decision_profiles(editorial_status, review_due_at);
CREATE INDEX IF NOT EXISTS idx_tool_task_fits_task_status_level
  ON tool_task_fits(task_id, status, fit_level);
CREATE INDEX IF NOT EXISTS idx_tool_task_fits_tool_status
  ON tool_task_fits(tool_id, status);
CREATE INDEX IF NOT EXISTS idx_tool_relationships_tool_status
  ON tool_relationships(tool_id, status, relationship_type);
CREATE INDEX IF NOT EXISTS idx_tool_relationships_related_status
  ON tool_relationships(related_tool_id, status, relationship_type);
CREATE INDEX IF NOT EXISTS idx_decision_sessions_user_status
  ON decision_sessions(user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_tool
  ON decision_recommendations(tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_claims_claim
  ON tool_decision_profile_claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_task_fit_claims_claim
  ON tool_task_fit_claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_relationship_claims_claim
  ON tool_relationship_claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_claims_claim
  ON decision_recommendation_claims(claim_id);

COMMENT ON COLUMN decision_tasks.category_id IS
  'Logical reference to the Neon categories table; intentionally not a Supabase foreign key.';
COMMENT ON COLUMN tool_decision_profiles.tool_id IS
  'Logical reference to the Neon tools table; validated by the server before editorial writes.';
COMMENT ON COLUMN tool_task_fits.tool_id IS
  'Logical reference to the Neon tools table; intentionally not a cross-database foreign key.';
COMMENT ON COLUMN tool_relationships.tool_id IS
  'Logical reference to the Neon tools table; relationship direction is editorially reviewed.';
COMMENT ON COLUMN tool_relationships.related_tool_id IS
  'Logical reference to the Neon tools table; reverse relationships are not generated automatically.';
COMMENT ON COLUMN decision_recommendations.tool_id IS
  'Logical reference to the Neon tools table captured with a reproducible recommendation snapshot.';

CREATE OR REPLACE FUNCTION set_decision_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS decision_tasks_set_updated_at ON decision_tasks;
CREATE TRIGGER decision_tasks_set_updated_at
  BEFORE UPDATE ON decision_tasks
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS tool_decision_profiles_set_updated_at ON tool_decision_profiles;
CREATE TRIGGER tool_decision_profiles_set_updated_at
  BEFORE UPDATE ON tool_decision_profiles
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS tool_task_fits_set_updated_at ON tool_task_fits;
CREATE TRIGGER tool_task_fits_set_updated_at
  BEFORE UPDATE ON tool_task_fits
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS tool_relationships_set_updated_at ON tool_relationships;
CREATE TRIGGER tool_relationships_set_updated_at
  BEFORE UPDATE ON tool_relationships
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS decision_sessions_set_updated_at ON decision_sessions;
CREATE TRIGGER decision_sessions_set_updated_at
  BEFORE UPDATE ON decision_sessions
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();

CREATE OR REPLACE FUNCTION assert_active_verified_decision_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  primary_tool_id UUID;
  secondary_tool_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'tool_decision_profile_claims' THEN
    primary_tool_id := NEW.tool_id;
  ELSIF TG_TABLE_NAME = 'tool_task_fit_claims' THEN
    SELECT fit.tool_id INTO primary_tool_id
    FROM tool_task_fits fit WHERE fit.id = NEW.fit_id;
  ELSIF TG_TABLE_NAME = 'tool_relationship_claims' THEN
    SELECT relationship.tool_id, relationship.related_tool_id
    INTO primary_tool_id, secondary_tool_id
    FROM tool_relationships relationship WHERE relationship.id = NEW.relationship_id;
  ELSIF TG_TABLE_NAME = 'decision_recommendation_claims' THEN
    SELECT recommendation.tool_id INTO primary_tool_id
    FROM decision_recommendations recommendation WHERE recommendation.id = NEW.recommendation_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM product_intelligence_claims claim
    JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
    WHERE claim.id = NEW.claim_id
      AND profile.owner_type = 'tool'
      AND profile.owner_id IN (primary_tool_id, COALESCE(secondary_tool_id, primary_tool_id))
      AND claim.verification_status = 'verified'
      AND claim.invalidated_at IS NULL
      AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
      AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
      AND claim.conflict_status = 'none'
  ) THEN
    RAISE EXCEPTION 'Decision evidence must be active, verified, conflict-free, and belong to the referenced tool.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_claim_must_be_verified ON tool_decision_profile_claims;
CREATE TRIGGER profile_claim_must_be_verified
  BEFORE INSERT OR UPDATE ON tool_decision_profile_claims
  FOR EACH ROW EXECUTE FUNCTION assert_active_verified_decision_claim();
DROP TRIGGER IF EXISTS task_fit_claim_must_be_verified ON tool_task_fit_claims;
CREATE TRIGGER task_fit_claim_must_be_verified
  BEFORE INSERT OR UPDATE ON tool_task_fit_claims
  FOR EACH ROW EXECUTE FUNCTION assert_active_verified_decision_claim();
DROP TRIGGER IF EXISTS relationship_claim_must_be_verified ON tool_relationship_claims;
CREATE TRIGGER relationship_claim_must_be_verified
  BEFORE INSERT OR UPDATE ON tool_relationship_claims
  FOR EACH ROW EXECUTE FUNCTION assert_active_verified_decision_claim();
DROP TRIGGER IF EXISTS recommendation_claim_must_be_verified ON decision_recommendation_claims;
CREATE TRIGGER recommendation_claim_must_be_verified
  BEFORE INSERT OR UPDATE ON decision_recommendation_claims
  FOR EACH ROW EXECUTE FUNCTION assert_active_verified_decision_claim();

CREATE OR REPLACE FUNCTION assert_decision_editorial_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  has_evidence BOOLEAN;
BEGIN
  IF TG_TABLE_NAME = 'tool_decision_profiles' AND NEW.editorial_status = 'published' THEN
    SELECT EXISTS (
      SELECT 1
      FROM tool_decision_profile_claims link
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      WHERE link.tool_id = NEW.tool_id
        AND claim.verification_status = 'verified'
        AND claim.invalidated_at IS NULL
        AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
        AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
        AND claim.conflict_status = 'none'
    ) INTO has_evidence;
  ELSIF TG_TABLE_NAME = 'tool_task_fits' AND NEW.status = 'published' THEN
    SELECT EXISTS (
      SELECT 1
      FROM tool_task_fit_claims link
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      WHERE link.fit_id = NEW.id
        AND claim.verification_status = 'verified'
        AND claim.invalidated_at IS NULL
        AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
        AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
        AND claim.conflict_status = 'none'
    ) INTO has_evidence;
  ELSIF TG_TABLE_NAME = 'tool_relationships' AND NEW.status = 'published' THEN
    SELECT EXISTS (
      SELECT 1
      FROM tool_relationship_claims link
      JOIN product_intelligence_claims claim ON claim.id = link.claim_id
      WHERE link.relationship_id = NEW.id
        AND claim.verification_status = 'verified'
        AND claim.invalidated_at IS NULL
        AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
        AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
        AND claim.conflict_status = 'none'
    ) INTO has_evidence;
  ELSE
    RETURN NEW;
  END IF;

  IF NEW.reviewed_at IS NULL OR NOT has_evidence THEN
    RAISE EXCEPTION 'Published decision records require reviewed_at and verified evidence.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_must_be_publishable ON tool_decision_profiles;
CREATE TRIGGER profile_must_be_publishable
  BEFORE INSERT OR UPDATE ON tool_decision_profiles
  FOR EACH ROW EXECUTE FUNCTION assert_decision_editorial_publishable();
DROP TRIGGER IF EXISTS task_fit_must_be_publishable ON tool_task_fits;
CREATE TRIGGER task_fit_must_be_publishable
  BEFORE INSERT OR UPDATE ON tool_task_fits
  FOR EACH ROW EXECUTE FUNCTION assert_decision_editorial_publishable();
DROP TRIGGER IF EXISTS relationship_must_be_publishable ON tool_relationships;
CREATE TRIGGER relationship_must_be_publishable
  BEFORE INSERT OR UPDATE ON tool_relationships
  FOR EACH ROW EXECUTE FUNCTION assert_decision_editorial_publishable();

ALTER TABLE decision_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_decision_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_task_fits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_decision_profile_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_task_fit_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_relationship_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_recommendation_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active decision tasks" ON decision_tasks;
CREATE POLICY "Public can view active decision tasks" ON decision_tasks
  FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Public can view published decision profiles" ON tool_decision_profiles;
CREATE POLICY "Public can view published decision profiles" ON tool_decision_profiles
  FOR SELECT USING (editorial_status = 'published');
DROP POLICY IF EXISTS "Public can view published task fits" ON tool_task_fits;
CREATE POLICY "Public can view published task fits" ON tool_task_fits
  FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Public can view published tool relationships" ON tool_relationships;
CREATE POLICY "Public can view published tool relationships" ON tool_relationships
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can manage own decision sessions" ON decision_sessions;
CREATE POLICY "Users can manage own decision sessions" ON decision_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own decision recommendations" ON decision_recommendations;
CREATE POLICY "Users can view own decision recommendations" ON decision_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM decision_sessions session
      WHERE session.id = decision_recommendations.session_id AND session.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users can view own recommendation evidence" ON decision_recommendation_claims;
CREATE POLICY "Users can view own recommendation evidence" ON decision_recommendation_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM decision_recommendations recommendation
      JOIN decision_sessions session ON session.id = recommendation.session_id
      WHERE recommendation.id = decision_recommendation_claims.recommendation_id
        AND session.user_id = auth.uid()
    )
  );

-- Recommendations and all claim links stay service-role write-only. Public pages receive
-- a safe derived view from the server in DCF-02 instead of direct access to raw evidence.

-- Decision Graph capability layer.
-- tool_id values are logical references to the Neon directory database. Supabase
-- must not create a foreign key to a local tools table for cross-store identities.

CREATE TABLE IF NOT EXISTS decision_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(name) = 'object' AND NULLIF(BTRIM(name ->> 'en'), '') IS NOT NULL),
  description JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(description) = 'object'),
  capability_group TEXT NOT NULL CHECK (
    capability_group IN ('creation', 'editing', 'analysis', 'automation', 'collaboration', 'governance', 'delivery', 'other')
  ),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL,
  capability_id UUID NOT NULL REFERENCES decision_capabilities(id) ON DELETE CASCADE,
  support_level TEXT NOT NULL DEFAULT 'unknown' CHECK (
    support_level IN ('strong', 'partial', 'limited', 'not_supported', 'unknown')
  ),
  availability TEXT NOT NULL DEFAULT 'unknown' CHECK (
    availability IN ('all_plans', 'paid_only', 'enterprise_only', 'add_on', 'unknown')
  ),
  plan_requirement JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(plan_requirement) = 'object'),
  limitations JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (jsonb_typeof(limitations) = 'array'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published', 'stale')),
  reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tool_capabilities_unique_tool_capability UNIQUE (tool_id, capability_id),
  CONSTRAINT tool_capabilities_review_window CHECK (
    review_due_at IS NULL OR reviewed_at IS NULL OR review_due_at > reviewed_at
  )
);

CREATE TABLE IF NOT EXISTS task_capabilities (
  task_id UUID NOT NULL REFERENCES decision_tasks(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES decision_capabilities(id) ON DELETE CASCADE,
  importance TEXT NOT NULL CHECK (importance IN ('required', 'preferred', 'contextual')),
  rationale JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(rationale) = 'object'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published', 'stale')),
  reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, capability_id),
  CONSTRAINT task_capabilities_review_window CHECK (
    review_due_at IS NULL OR reviewed_at IS NULL OR review_due_at > reviewed_at
  )
);

CREATE TABLE IF NOT EXISTS tool_capability_claims (
  tool_capability_id UUID NOT NULL REFERENCES tool_capabilities(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  purpose TEXT NOT NULL DEFAULT 'support' CHECK (
    purpose IN ('support', 'availability', 'plan', 'limitation', 'other')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_capability_id, claim_id, purpose)
);

CREATE INDEX IF NOT EXISTS decision_capabilities_status_group_idx
  ON decision_capabilities(status, capability_group, display_order);
CREATE INDEX IF NOT EXISTS tool_capabilities_tool_status_idx
  ON tool_capabilities(tool_id, status);
CREATE INDEX IF NOT EXISTS tool_capabilities_capability_status_idx
  ON tool_capabilities(capability_id, status);
CREATE INDEX IF NOT EXISTS task_capabilities_task_status_idx
  ON task_capabilities(task_id, status);
CREATE INDEX IF NOT EXISTS task_capabilities_capability_status_idx
  ON task_capabilities(capability_id, status);
CREATE INDEX IF NOT EXISTS tool_capability_claims_claim_idx
  ON tool_capability_claims(claim_id);

DROP TRIGGER IF EXISTS decision_capabilities_set_updated_at ON decision_capabilities;
CREATE TRIGGER decision_capabilities_set_updated_at
  BEFORE UPDATE ON decision_capabilities
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS tool_capabilities_set_updated_at ON tool_capabilities;
CREATE TRIGGER tool_capabilities_set_updated_at
  BEFORE UPDATE ON tool_capabilities
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();
DROP TRIGGER IF EXISTS task_capabilities_set_updated_at ON task_capabilities;
CREATE TRIGGER task_capabilities_set_updated_at
  BEFORE UPDATE ON task_capabilities
  FOR EACH ROW EXECUTE FUNCTION set_decision_updated_at();

CREATE OR REPLACE FUNCTION assert_active_verified_tool_capability_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  referenced_tool_id UUID;
BEGIN
  SELECT capability.tool_id INTO referenced_tool_id
  FROM tool_capabilities capability
  WHERE capability.id = NEW.tool_capability_id;

  IF referenced_tool_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM product_intelligence_claims claim
    JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
    WHERE claim.id = NEW.claim_id
      AND profile.owner_type = 'tool'
      AND profile.owner_id = referenced_tool_id
      AND claim.verification_status = 'verified'
      AND claim.invalidated_at IS NULL
      AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
      AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
      AND claim.conflict_status = 'none'
  ) THEN
    RAISE EXCEPTION 'Capability evidence must be active, verified, conflict-free, and belong to the referenced tool.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tool_capability_claim_must_be_verified ON tool_capability_claims;
CREATE TRIGGER tool_capability_claim_must_be_verified
  BEFORE INSERT OR UPDATE ON tool_capability_claims
  FOR EACH ROW EXECUTE FUNCTION assert_active_verified_tool_capability_claim();

CREATE OR REPLACE FUNCTION assert_tool_capability_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  IF NEW.reviewed_at IS NULL OR NEW.reviewed_by IS NULL
    OR NEW.review_due_at IS NULL OR NEW.review_due_at <= NOW() THEN
    RAISE EXCEPTION 'Published tool capabilities require a current review window.'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM decision_capabilities capability
    WHERE capability.id = NEW.capability_id
      AND capability.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Published tool capabilities require an active capability.'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM tool_capability_claims link
    JOIN product_intelligence_claims claim ON claim.id = link.claim_id
    JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
    WHERE link.tool_capability_id = NEW.id
      AND profile.owner_type = 'tool'
      AND profile.owner_id = NEW.tool_id
      AND claim.verification_status = 'verified'
      AND claim.invalidated_at IS NULL
      AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
      AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
      AND claim.conflict_status = 'none'
  ) THEN
    RAISE EXCEPTION 'Published tool capabilities require verified evidence.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tool_capability_must_be_publishable ON tool_capabilities;
CREATE CONSTRAINT TRIGGER tool_capability_must_be_publishable
  AFTER INSERT OR UPDATE ON tool_capabilities
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_tool_capability_publishable();

-- A deferred publication check on links closes the deletion/update path: a
-- transaction may replace evidence links, but must still leave every published
-- capability with at least one valid, same-owner claim at commit time.
CREATE OR REPLACE FUNCTION assert_linked_tool_capability_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  capability_id_to_check UUID;
BEGIN
  capability_id_to_check := COALESCE(NEW.tool_capability_id, OLD.tool_capability_id);

  IF EXISTS (
    SELECT 1
    FROM tool_capabilities capability
    WHERE capability.id = capability_id_to_check
      AND capability.status = 'published'
      AND NOT EXISTS (
        SELECT 1
        FROM tool_capability_claims link
        JOIN product_intelligence_claims claim ON claim.id = link.claim_id
        JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
        WHERE link.tool_capability_id = capability.id
          AND profile.owner_type = 'tool'
          AND profile.owner_id = capability.tool_id
          AND claim.verification_status = 'verified'
          AND claim.invalidated_at IS NULL
          AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
          AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
          AND claim.conflict_status = 'none'
      )
  ) THEN
    RAISE EXCEPTION 'Published tool capabilities require verified evidence.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tool_capability_link_must_keep_capability_publishable ON tool_capability_claims;
CREATE CONSTRAINT TRIGGER tool_capability_link_must_keep_capability_publishable
  AFTER INSERT OR UPDATE OR DELETE ON tool_capability_claims
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_linked_tool_capability_publishable();

-- Prevent a claim edit from silently leaving its only published capability
-- evidence link invalid. Editors can replace evidence or move the capability
-- out of published status within the same transaction.
CREATE OR REPLACE FUNCTION assert_claim_change_keeps_tool_capabilities_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM tool_capability_claims changed_link
    JOIN tool_capabilities capability ON capability.id = changed_link.tool_capability_id
    WHERE changed_link.claim_id = NEW.id
      AND capability.status = 'published'
      AND NOT EXISTS (
        SELECT 1
        FROM tool_capability_claims link
        JOIN product_intelligence_claims claim ON claim.id = link.claim_id
        JOIN product_intelligence_profiles profile ON profile.id = claim.profile_id
        WHERE link.tool_capability_id = capability.id
          AND profile.owner_type = 'tool'
          AND profile.owner_id = capability.tool_id
          AND claim.verification_status = 'verified'
          AND claim.invalidated_at IS NULL
          AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
          AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
          AND claim.conflict_status = 'none'
      )
  ) THEN
    RAISE EXCEPTION 'Claim changes cannot leave a published tool capability without verified evidence.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS claim_change_must_keep_tool_capabilities_publishable ON product_intelligence_claims;
CREATE CONSTRAINT TRIGGER claim_change_must_keep_tool_capabilities_publishable
  AFTER UPDATE OF profile_id, verification_status, invalidated_at, expires_at, review_due_at, conflict_status
  ON product_intelligence_claims
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_claim_change_keeps_tool_capabilities_publishable();

CREATE OR REPLACE FUNCTION assert_task_capability_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (
    NEW.reviewed_at IS NULL OR NEW.reviewed_by IS NULL
    OR NEW.review_due_at IS NULL OR NEW.review_due_at <= NOW()
  ) THEN
    RAISE EXCEPTION 'Published task capabilities require a current review window.'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'published' AND NOT EXISTS (
    SELECT 1
    FROM decision_tasks task
    JOIN decision_capabilities capability ON capability.id = NEW.capability_id
    WHERE task.id = NEW.task_id
      AND task.status = 'active'
      AND capability.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Published task capabilities require active task and capability records.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_capability_must_be_publishable ON task_capabilities;
CREATE TRIGGER task_capability_must_be_publishable
  BEFORE INSERT OR UPDATE ON task_capabilities
  FOR EACH ROW EXECUTE FUNCTION assert_task_capability_publishable();

ALTER TABLE decision_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_capability_claims ENABLE ROW LEVEL SECURITY;

-- The link and claim tables intentionally have no browser SELECT policy. This
-- boolean security-definer function lets the capability policy evaluate current
-- evidence without exposing a claim row or being defeated by those tables' RLS.
CREATE OR REPLACE FUNCTION tool_capability_has_current_verified_claim(
  target_capability_id UUID,
  target_tool_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tool_capability_claims link
    JOIN public.product_intelligence_claims claim ON claim.id = link.claim_id
    JOIN public.product_intelligence_profiles profile ON profile.id = claim.profile_id
    WHERE link.tool_capability_id = target_capability_id
      AND profile.owner_type = 'tool'
      AND profile.owner_id = target_tool_id
      AND claim.verification_status = 'verified'
      AND claim.invalidated_at IS NULL
      AND (claim.expires_at IS NULL OR claim.expires_at > NOW())
      AND (claim.review_due_at IS NULL OR claim.review_due_at > NOW())
      AND claim.conflict_status = 'none'
  );
$$;

DROP POLICY IF EXISTS "Public can view active decision capabilities" ON decision_capabilities;
CREATE POLICY "Public can view active decision capabilities" ON decision_capabilities
  FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Public can view published tool capabilities" ON tool_capabilities;
CREATE POLICY "Public can view published tool capabilities" ON tool_capabilities
  FOR SELECT USING (
    status = 'published'
    AND reviewed_at IS NOT NULL
    AND review_due_at > NOW()
    AND EXISTS (
      SELECT 1
      FROM decision_capabilities capability
      WHERE capability.id = tool_capabilities.capability_id
        AND capability.status = 'active'
    )
    AND tool_capability_has_current_verified_claim(tool_capabilities.id, tool_capabilities.tool_id)
  );
DROP POLICY IF EXISTS "Public can view published task capabilities" ON task_capabilities;
CREATE POLICY "Public can view published task capabilities" ON task_capabilities
  FOR SELECT USING (
    status = 'published'
    AND reviewed_at IS NOT NULL
    AND review_due_at > NOW()
    AND EXISTS (
      SELECT 1
      FROM decision_tasks task
      JOIN decision_capabilities capability ON capability.id = task_capabilities.capability_id
      WHERE task.id = task_capabilities.task_id
        AND task.status = 'active'
        AND capability.status = 'active'
    )
  );

-- Raw claim links intentionally have no public policy. Public pages must consume a
-- safe server-side read model instead of exposing evidence joins directly.

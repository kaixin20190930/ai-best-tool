-- Avoid cross-table NEW-field access in the shared editorial publication gate.
-- PostgreSQL does not guarantee short-circuit evaluation for the old AND guards.

CREATE OR REPLACE FUNCTION assert_decision_editorial_publishable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  has_evidence BOOLEAN;
BEGIN
  IF TG_TABLE_NAME = 'tool_decision_profiles' THEN
    IF NEW.editorial_status <> 'published' THEN
      RETURN NEW;
    END IF;

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
  ELSIF TG_TABLE_NAME = 'tool_task_fits' THEN
    IF NEW.status <> 'published' THEN
      RETURN NEW;
    END IF;

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
  ELSIF TG_TABLE_NAME = 'tool_relationships' THEN
    IF NEW.status <> 'published' THEN
      RETURN NEW;
    END IF;

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

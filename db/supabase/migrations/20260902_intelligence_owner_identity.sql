-- Distinguish platform-level evidence from evidence attached to a directory tool.
-- The existing AI Best Tool profile keeps its sources, claims, assets, and review history.

ALTER TABLE product_intelligence_profiles
  DROP CONSTRAINT IF EXISTS product_intelligence_profiles_owner_type_check;

ALTER TABLE product_intelligence_profiles
  ADD CONSTRAINT product_intelligence_profiles_owner_type_check
  CHECK (owner_type IN ('tool', 'distribution_project', 'site'));

UPDATE product_intelligence_profiles
SET
  owner_type = 'site',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'identityReclassifiedAt', '2026-09-02',
    'identityReclassifiedFrom', 'tool',
    'identityReason', 'Platform-level evidence must not impersonate a directory tool.'
  ),
  updated_at = NOW()
WHERE id = 'eebdaf7a-cdb6-4981-b0af-f24120a42f40'::uuid
  AND owner_id = 'b298fba7-a348-4acf-82a9-59eb24f5a7d9'::uuid
  AND owner_type = 'tool'
  AND canonical_domain = 'aibesttool.com';

COMMENT ON COLUMN product_intelligence_profiles.owner_type IS
  'tool maps to a real directory tool UUID; distribution_project maps to a user project; site stores platform-level evidence.';

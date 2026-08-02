-- Link user-owned AI Best Tool listings to distribution projects across data stores.
-- source_tool_id references the Neon catalog logically, so it intentionally has no Supabase FK.

ALTER TABLE distribution_projects
  ADD COLUMN IF NOT EXISTS source_tool_id UUID,
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(40),
  ADD COLUMN IF NOT EXISTS listing_imported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS listing_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_distribution_projects_source_tool
  ON distribution_projects(owner_id, source_tool_id)
  WHERE source_tool_id IS NOT NULL;

COMMENT ON COLUMN distribution_projects.source_tool_id IS 'Cross-store reference to the user-owned tools row in Neon.';
COMMENT ON COLUMN distribution_projects.product_type IS 'Normalized product type used for adaptive fields, assets, and target scoring.';
COMMENT ON COLUMN distribution_projects.listing_snapshot_json IS 'Owner-reviewable snapshot imported from AI Best Tool; never treated as verified by import alone.';

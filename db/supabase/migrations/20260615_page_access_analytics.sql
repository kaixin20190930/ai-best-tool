CREATE INDEX IF NOT EXISTS idx_analytics_page_type ON analytics ((metadata->>'page_type'));
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics ((metadata->>'page_path'));

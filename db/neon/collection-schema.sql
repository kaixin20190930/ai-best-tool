-- Collection automation schema for AI Best Tool.
-- Purpose:
-- 1. Manage discovery sources such as Product Hunt, RSS feeds, APIs, curated pages.
-- 2. Track scheduled or manual collection runs.
-- 3. Store deduplicated candidates before they become rows in tools.

CREATE TABLE IF NOT EXISTS collection_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  source_type VARCHAR(40) NOT NULL DEFAULT 'html',
  frequency VARCHAR(40) NOT NULL DEFAULT 'daily',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_sources_type_check
    CHECK (source_type IN ('rss', 'html', 'api', 'manual')),
  CONSTRAINT collection_sources_frequency_check
    CHECK (frequency IN ('manual', 'daily', 'weekly'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_sources_url
  ON collection_sources(url);

CREATE INDEX IF NOT EXISTS idx_collection_sources_enabled_next_run
  ON collection_sources(enabled, next_run_at);

CREATE TABLE IF NOT EXISTS collection_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES collection_sources(id) ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  trigger_type VARCHAR(40) NOT NULL DEFAULT 'manual',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  found_count INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_runs_status_check
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT collection_runs_trigger_check
    CHECK (trigger_type IN ('manual', 'scheduled'))
);

CREATE INDEX IF NOT EXISTS idx_collection_runs_source_created
  ON collection_runs(source_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_runs_status
  ON collection_runs(status);

CREATE TABLE IF NOT EXISTS collection_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES collection_sources(id) ON DELETE SET NULL,
  run_id UUID REFERENCES collection_runs(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  url VARCHAR(1000) NOT NULL,
  normalized_url VARCHAR(1000) NOT NULL,
  title TEXT,
  summary TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  relevance_score INTEGER NOT NULL DEFAULT 50,
  quality_score INTEGER NOT NULL DEFAULT 50,
  score_reason TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_candidates_status_check
    CHECK (status IN ('new', 'imported', 'skipped', 'rejected'))
);

ALTER TABLE collection_candidates
  ADD COLUMN IF NOT EXISTS relevance_score INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS score_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_candidates_normalized_url
  ON collection_candidates(normalized_url);

CREATE INDEX IF NOT EXISTS idx_collection_candidates_status_created
  ON collection_candidates(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_candidates_status_scores
  ON collection_candidates(status, relevance_score DESC, quality_score DESC, created_at DESC);

ALTER TABLE collection_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_candidates ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION collection_sources_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS collection_sources_updated_at ON collection_sources;
CREATE TRIGGER collection_sources_updated_at
  BEFORE UPDATE ON collection_sources
  FOR EACH ROW EXECUTE FUNCTION collection_sources_set_updated_at();

CREATE OR REPLACE FUNCTION collection_candidates_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS collection_candidates_updated_at ON collection_candidates;
CREATE TRIGGER collection_candidates_updated_at
  BEFORE UPDATE ON collection_candidates
  FOR EACH ROW EXECUTE FUNCTION collection_candidates_set_updated_at();

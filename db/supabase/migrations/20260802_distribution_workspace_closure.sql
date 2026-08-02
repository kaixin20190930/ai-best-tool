-- Connect distribution projects, concrete targets, assets, packages, events, and reminders.
-- This migration is additive so existing channel-level tasks remain readable.

ALTER TABLE distribution_projects
  ADD COLUMN IF NOT EXISTS intelligence_profile_id UUID REFERENCES product_intelligence_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_goal VARCHAR(40),
  ADD COLUMN IF NOT EXISTS weekly_capacity INTEGER CHECK (weekly_capacity IS NULL OR weekly_capacity > 0),
  ADD COLUMN IF NOT EXISTS budget_preference VARCHAR(30),
  ADD COLUMN IF NOT EXISTS target_markets JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS facts_confirmed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS distribution_project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  profile_asset_id UUID REFERENCES product_intelligence_assets(id) ON DELETE SET NULL,
  asset_type VARCHAR(30) NOT NULL,
  name VARCHAR(180) NOT NULL,
  source_url VARCHAR(1200),
  stored_url VARCHAR(1200),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'verified', 'rejected', 'stale')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, asset_type, name)
);

CREATE TABLE IF NOT EXISTS distribution_project_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  -- Target registry lives in the direct Postgres store; this UUID is a cross-store reference.
  target_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  match_score INTEGER CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 100),
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  opportunity_status VARCHAR(30) NOT NULL DEFAULT 'recommended'
    CHECK (opportunity_status IN ('recommended', 'accepted', 'later', 'in_progress', 'submitted', 'live', 'rejected', 'skipped')),
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  estimated_cost NUMERIC(10, 2) CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  selected_at TIMESTAMPTZ,
  skipped_reason TEXT,
  last_submission_at TIMESTAMPTZ,
  next_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, target_id)
);

ALTER TABLE distribution_tasks
  ADD COLUMN IF NOT EXISTS target_id UUID,
  ADD COLUMN IF NOT EXISTS project_target_id UUID REFERENCES distribution_project_targets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS distribution_link_id UUID REFERENCES distribution_links(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_to UUID;

CREATE TABLE IF NOT EXISTS distribution_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  -- Target registry lives in the direct Postgres store; this UUID is a cross-store reference.
  target_id UUID NOT NULL,
  task_id UUID REFERENCES distribution_tasks(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  profile_version INTEGER CHECK (profile_version IS NULL OR profile_version > 0),
  target_rule_version INTEGER CHECK (target_rule_version IS NULL OR target_rule_version >= 0),
  fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  asset_requirements_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  preflight_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  generation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (generation_status IN ('pending', 'generating', 'ready', 'blocked', 'failed')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_task_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES distribution_tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES distribution_tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  reminder_type VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sent', 'resolved', 'cancelled', 'failed')),
  delivery_channel VARCHAR(20) NOT NULL DEFAULT 'in_app'
    CHECK (delivery_channel IN ('in_app', 'email')),
  sent_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, reminder_type, scheduled_at, delivery_channel)
);

CREATE INDEX IF NOT EXISTS idx_distribution_projects_intelligence_profile
  ON distribution_projects(intelligence_profile_id);
CREATE INDEX IF NOT EXISTS idx_distribution_project_assets_project_status
  ON distribution_project_assets(project_id, status, asset_type);
CREATE INDEX IF NOT EXISTS idx_distribution_project_targets_project_status
  ON distribution_project_targets(project_id, opportunity_status, next_action_at);
CREATE INDEX IF NOT EXISTS idx_distribution_project_targets_target_score
  ON distribution_project_targets(target_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_tasks_target_status
  ON distribution_tasks(target_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_distribution_tasks_project_target
  ON distribution_tasks(project_target_id, status);
CREATE INDEX IF NOT EXISTS idx_distribution_packages_project_target
  ON distribution_packages(project_id, target_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_task_events_task_created
  ON distribution_task_events(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_reminders_owner_schedule
  ON distribution_reminders(owner_id, status, scheduled_at);

ALTER TABLE distribution_project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_project_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own distribution project assets" ON distribution_project_assets;
CREATE POLICY "Users can manage own distribution project assets" ON distribution_project_assets
  FOR ALL
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own distribution project targets" ON distribution_project_targets;
CREATE POLICY "Users can manage own distribution project targets" ON distribution_project_targets
  FOR ALL
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own distribution packages" ON distribution_packages;
CREATE POLICY "Users can manage own distribution packages" ON distribution_packages
  FOR ALL
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own distribution task events" ON distribution_task_events;
CREATE POLICY "Users can view own distribution task events" ON distribution_task_events
  FOR SELECT
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own distribution reminders" ON distribution_reminders;
CREATE POLICY "Users can manage own distribution reminders" ON distribution_reminders
  FOR ALL
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM distribution_projects project WHERE project.id = project_id AND project.owner_id = auth.uid())
  );

COMMENT ON COLUMN distribution_tasks.target_id IS 'Concrete target site. Research tasks may remain null; submission tasks bind a target before ready_to_submit.';
COMMENT ON TABLE distribution_project_targets IS 'Project-specific target opportunities, decisions, estimates, and next actions.';
COMMENT ON TABLE distribution_packages IS 'Versioned, target-specific copy and asset packages for human-led submission.';

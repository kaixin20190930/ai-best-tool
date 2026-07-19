-- Product distribution workspace MVP.
-- This module tracks human-led distribution work; it does not auto-post or mass-build links.

CREATE TABLE IF NOT EXISTS distribution_entitlements (
  user_id UUID PRIMARY KEY,
  plan VARCHAR(30) NOT NULL DEFAULT 'pro' CHECK (plan IN ('pilot', 'pro', 'agency')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  source VARCHAR(30) NOT NULL DEFAULT 'manual',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE distribution_entitlements ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(120);
ALTER TABLE distribution_entitlements ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS idx_distribution_entitlements_stripe_subscription
  ON distribution_entitlements(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS distribution_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  kind VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (kind IN ('own', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, slug)
);

CREATE TABLE IF NOT EXISTS distribution_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES distribution_workspaces(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  name VARCHAR(160) NOT NULL,
  website_url VARCHAR(500),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_key VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  channel_type VARCHAR(30) NOT NULL CHECK (channel_type IN ('directory', 'alternative', 'startup', 'community', 'newsletter', 'blog', 'github', 'reddit', 'other')),
  url VARCHAR(500),
  instructions TEXT,
  requires_manual_action BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES distribution_channels(id),
  title VARCHAR(240) NOT NULL,
  task_type VARCHAR(30) NOT NULL DEFAULT 'submit' CHECK (task_type IN ('research', 'prepare', 'submit', 'publish', 'follow_up', 'measure')),
  status VARCHAR(30) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'submitted', 'live', 'follow_up', 'done', 'skipped')),
  priority VARCHAR(10) NOT NULL DEFAULT 'p1' CHECK (priority IN ('p0', 'p1', 'p2')),
  due_date DATE,
  instructions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES distribution_tasks(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  target_url VARCHAR(500),
  live_url VARCHAR(500),
  link_status VARCHAR(30) NOT NULL DEFAULT 'unknown' CHECK (link_status IN ('unknown', 'pending', 'live', 'removed', 'nofollow', 'rejected')),
  checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_channel_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL UNIQUE REFERENCES distribution_channels(id) ON DELETE CASCADE,
  title_template TEXT,
  description_template TEXT,
  max_title_length INTEGER,
  max_description_length INTEGER,
  required_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES distribution_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES distribution_channels(id),
  name VARCHAR(160) NOT NULL,
  destination_url VARCHAR(500) NOT NULL,
  full_url VARCHAR(1200) NOT NULL,
  utm_source VARCHAR(120) NOT NULL,
  utm_medium VARCHAR(120) NOT NULL DEFAULT 'distribution',
  utm_campaign VARCHAR(160) NOT NULL,
  utm_content VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('visit', 'signup', 'submit', 'claim', 'checkout', 'payment')),
  session_id VARCHAR(120) NOT NULL,
  user_id UUID,
  project_id UUID REFERENCES distribution_projects(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES distribution_channels(id) ON DELETE SET NULL,
  link_id UUID REFERENCES distribution_links(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distribution_projects_owner ON distribution_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_distribution_tasks_owner_status ON distribution_tasks(owner_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_distribution_tasks_project ON distribution_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_distribution_results_task ON distribution_results(task_id);
CREATE INDEX IF NOT EXISTS idx_distribution_links_project ON distribution_links(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_attribution_project ON distribution_attribution_events(project_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_attribution_session ON distribution_attribution_events(session_id, created_at DESC);

INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'What is {{product}} and who is it for?', 'Explain the problem, the actual workflow, and one proof point. Disclose affiliation when relevant.', 120, 500, '["product_url", "audience", "proof_point"]'::jsonb FROM distribution_channels WHERE channel_key = 'ai-directories'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, '{{product}} as an alternative to {{category}}', 'State the comparison honestly. Include the key difference and the user who should consider it.', 120, 500, '["product_url", "alternative_context", "difference"]'::jsonb FROM distribution_channels WHERE channel_key = 'alternative-sites'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'We built {{product}} for {{audience}}', 'Share the launch context, what changed, and what early users can test or discuss.', 100, 800, '["product_url", "audience", "launch_context"]'::jsonb FROM distribution_channels WHERE channel_key = 'startup-launches'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'A useful answer for {{question}}', 'Answer the question first. Mention the product only when it directly supports the answer and disclose affiliation.', 300, 2000, '["question", "answer", "disclosure"]'::jsonb FROM distribution_channels WHERE channel_key = 'communities'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'A practical product for {{audience}}', 'Pitch a specific reader benefit, not a generic product announcement. Include one useful data point or example.', 100, 600, '["audience", "reader_benefit", "proof_point"]'::jsonb FROM distribution_channels WHERE channel_key = 'newsletters'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, '{{product}}: what we learned from building and testing it', 'Publish first-party evidence, dates, screenshots, limitations, and what readers can verify themselves.', 160, 1200, '["experiment", "evidence", "limitations"]'::jsonb FROM distribution_channels WHERE channel_key = 'owned-blog'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'A useful example for {{workflow}}', 'Share a relevant repository, template, or documentation example. Do not place unrelated promotional links in issues.', 100, 1000, '["repository", "workflow", "documentation"]'::jsonb FROM distribution_channels WHERE channel_key = 'github'
ON CONFLICT (channel_id) DO NOTHING;
INSERT INTO distribution_channel_templates (channel_id, title_template, description_template, max_title_length, max_description_length, required_fields)
SELECT id, 'I tested {{product}} for {{use_case}}', 'Lead with the real question or experience. State affiliation, share useful detail, and invite discussion rather than votes.', 300, 2000, '["question", "experience", "disclosure"]'::jsonb FROM distribution_channels WHERE channel_key = 'reddit'
ON CONFLICT (channel_id) DO NOTHING;

INSERT INTO distribution_channels (channel_key, name, channel_type, instructions, sort_order)
VALUES
  ('ai-directories', 'AI directories', 'directory', 'Submit only to relevant directories. Record the listing URL and whether the listing is editorial, paid, or nofollow.', 10),
  ('alternative-sites', 'Alternative sites', 'alternative', 'Research the existing category first. Add a genuinely useful alternative angle rather than duplicate copy.', 20),
  ('startup-launches', 'Startup launch sites', 'startup', 'Prepare a concise launch story, product proof, and founder context before submitting.', 30),
  ('communities', 'Communities', 'community', 'Follow community rules, contribute before sharing, and never post identical promotional copy.', 40),
  ('newsletters', 'Newsletters', 'newsletter', 'Pitch a specific reader benefit with evidence and a short, editable blurb.', 50),
  ('owned-blog', 'Owned blog', 'blog', 'Publish an original use case, comparison, or experiment with first-party evidence.', 60),
  ('github', 'GitHub', 'github', 'Use relevant repositories, templates, docs, or examples. Do not add unrelated links to issues.', 70),
  ('reddit', 'Reddit', 'reddit', 'Answer a real question and disclose affiliation when relevant. Track post URL and follow-up date.', 80)
ON CONFLICT (channel_key) DO UPDATE SET
  name = EXCLUDED.name,
  channel_type = EXCLUDED.channel_type,
  instructions = EXCLUDED.instructions,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE distribution_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_channel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_attribution_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own distribution entitlement" ON distribution_entitlements;
CREATE POLICY "Users can view own distribution entitlement" ON distribution_entitlements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own distribution workspaces" ON distribution_workspaces;
CREATE POLICY "Users can manage own distribution workspaces" ON distribution_workspaces
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can manage own distribution projects" ON distribution_projects;
CREATE POLICY "Users can manage own distribution projects" ON distribution_projects
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated users can view active distribution channels" ON distribution_channels;
CREATE POLICY "Authenticated users can view active distribution channels" ON distribution_channels
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

DROP POLICY IF EXISTS "Users can manage own distribution tasks" ON distribution_tasks;
CREATE POLICY "Users can manage own distribution tasks" ON distribution_tasks
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can manage own distribution results" ON distribution_results;
CREATE POLICY "Users can manage own distribution results" ON distribution_results
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated users can view distribution templates" ON distribution_channel_templates;
CREATE POLICY "Authenticated users can view distribution templates" ON distribution_channel_templates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage own distribution links" ON distribution_links;
CREATE POLICY "Users can manage own distribution links" ON distribution_links
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view own distribution attribution" ON distribution_attribution_events;
CREATE POLICY "Users can view own distribution attribution" ON distribution_attribution_events
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM distribution_projects WHERE id = project_id));

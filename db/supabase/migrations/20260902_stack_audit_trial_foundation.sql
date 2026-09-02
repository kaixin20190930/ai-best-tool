-- AI Stack Audit + 7-Day Trial Scorecard private data foundation.
-- Directory tools live in Neon. tool_id/related_tool_id are logical references and
-- must not receive cross-database foreign keys in this Supabase migration.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_tool_stack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID,
  custom_tool_name VARCHAR(200),
  custom_tool_url VARCHAR(1200),
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('trial', 'free', 'paid', 'cancelled')),
  billing_amount NUMERIC(12,2) CHECK (billing_amount IS NULL OR billing_amount >= 0),
  monthly_cost NUMERIC(12,2) CHECK (monthly_cost IS NULL OR monthly_cost >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  billing_period VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (billing_period IN ('month', 'year', 'usage', 'one_time', 'unknown')),
  cost_normalization JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage_frequency VARCHAR(20) NOT NULL DEFAULT 'rarely'
    CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely', 'never')),
  data_sensitivity VARCHAR(20)
    CHECK (data_sensitivity IS NULL OR data_sensitivity IN ('low', 'medium', 'high', 'regulated')),
  started_at TIMESTAMPTZ,
  renews_at TIMESTAMPTZ,
  cancel_reminder_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stack_item_identity_present CHECK (
    tool_id IS NOT NULL OR NULLIF(BTRIM(custom_tool_name), '') IS NOT NULL
  ),
  CONSTRAINT stack_item_custom_url_http CHECK (
    custom_tool_url IS NULL OR custom_tool_url ~* '^https?://'
  ),
  CONSTRAINT stack_item_cost_normalization_object CHECK (
    jsonb_typeof(cost_normalization) = 'object'
  )
);

COMMENT ON COLUMN user_tool_stack_items.tool_id IS
  'Logical reference to the Neon tools table; intentionally not a Supabase foreign key.';
COMMENT ON COLUMN user_tool_stack_items.billing_amount IS
  'Original user-entered charge for billing_period; never inferred from public pricing.';
COMMENT ON COLUMN user_tool_stack_items.monthly_cost IS
  'Normalized monthly estimate derived from billing_amount with assumptions in cost_normalization.';

CREATE TABLE IF NOT EXISTS user_tool_stack_item_tasks (
  stack_item_id UUID NOT NULL REFERENCES user_tool_stack_items(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES decision_tasks(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (stack_item_id, task_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stack_item_one_primary_task
  ON user_tool_stack_item_tasks(stack_item_id)
  WHERE is_primary;

CREATE TABLE IF NOT EXISTS stack_audit_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input_snapshot JSONB NOT NULL,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  rules_version VARCHAR(40) NOT NULL,
  idempotency_key VARCHAR(100),
  failure_code VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT stack_audit_input_snapshot_object CHECK (jsonb_typeof(input_snapshot) = 'object'),
  CONSTRAINT stack_audit_summary_object CHECK (jsonb_typeof(summary) = 'object'),
  CONSTRAINT stack_audit_rules_version_not_blank CHECK (NULLIF(BTRIM(rules_version), '') IS NOT NULL),
  CONSTRAINT stack_audit_completion_state CHECK (
    (status = 'completed' AND completed_at IS NOT NULL AND failure_code IS NULL)
    OR (status = 'failed' AND failure_code IS NOT NULL)
    OR (status IN ('pending', 'running') AND completed_at IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stack_audit_user_idempotency
  ON stack_audit_runs(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS stack_audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES stack_audit_runs(id) ON DELETE CASCADE,
  stack_item_id UUID REFERENCES user_tool_stack_items(id) ON DELETE SET NULL,
  finding_type VARCHAR(20) NOT NULL
    CHECK (finding_type IN ('keep', 'replace', 'remove', 'missing')),
  related_tool_id UUID,
  rationale JSONB NOT NULL,
  estimated_monthly_savings NUMERIC(12,2)
    CHECK (estimated_monthly_savings IS NULL OR estimated_monthly_savings >= 0),
  currency CHAR(3) CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$'),
  confidence_state VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (confidence_state IN ('supported', 'partial', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stack_audit_finding_rationale_object CHECK (jsonb_typeof(rationale) = 'object'),
  CONSTRAINT stack_audit_finding_subject CHECK (
    finding_type = 'missing' OR stack_item_id IS NOT NULL
  ),
  CONSTRAINT stack_audit_finding_related_tool CHECK (
    finding_type NOT IN ('replace', 'missing') OR related_tool_id IS NOT NULL
  )
);

COMMENT ON COLUMN stack_audit_findings.related_tool_id IS
  'Logical reference to the Neon tools table; intentionally not a Supabase foreign key.';

CREATE TABLE IF NOT EXISTS stack_audit_finding_claims (
  finding_id UUID NOT NULL REFERENCES stack_audit_findings(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES product_intelligence_claims(id) ON DELETE RESTRICT,
  claim_snapshot JSONB NOT NULL,
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('fit', 'cost', 'setup', 'privacy', 'export', 'replacement', 'limitation', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stack_audit_claim_snapshot_object CHECK (jsonb_typeof(claim_snapshot) = 'object'),
  PRIMARY KEY (finding_id, claim_id, purpose)
);

CREATE TABLE IF NOT EXISTS trial_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL,
  decision_session_id UUID REFERENCES decision_sessions(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  target_outcome TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  renewal_at TIMESTAMPTZ,
  final_decision VARCHAR(20) NOT NULL DEFAULT 'undecided'
    CHECK (final_decision IN ('undecided', 'keep', 'cancel', 'compare')),
  private_notes TEXT,
  idempotency_key VARCHAR(100),
  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trial_scorecard_target_not_blank CHECK (NULLIF(BTRIM(target_outcome), '') IS NOT NULL),
  CONSTRAINT trial_scorecard_window CHECK (ends_at > started_at),
  CONSTRAINT trial_scorecard_renewal_after_start CHECK (renewal_at IS NULL OR renewal_at > started_at),
  CONSTRAINT trial_scorecard_final_state CHECK (
    status = 'completed' OR final_decision = 'undecided'
  )
);

COMMENT ON COLUMN trial_scorecards.tool_id IS
  'Logical reference to the Neon tools table; validated by the server before writes.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_scorecard_user_idempotency
  ON trial_scorecards(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS trial_scorecard_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id UUID NOT NULL REFERENCES trial_scorecards(id) ON DELETE CASCADE,
  sequence SMALLINT NOT NULL CHECK (sequence BETWEEN 1 AND 20),
  label TEXT NOT NULL,
  metric_type VARCHAR(20) NOT NULL DEFAULT 'manual'
    CHECK (metric_type IN ('boolean', 'time', 'count', 'quality', 'manual')),
  target_value JSONB,
  actual_value JSONB,
  result VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (result IN ('pending', 'pass', 'fail', 'skipped')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trial_check_label_not_blank CHECK (NULLIF(BTRIM(label), '') IS NOT NULL),
  CONSTRAINT trial_check_completion_state CHECK (
    (result = 'pending' AND completed_at IS NULL)
    OR (result <> 'pending' AND completed_at IS NOT NULL)
  ),
  UNIQUE (scorecard_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_stack_items_user_status
  ON user_tool_stack_items(user_id, subscription_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stack_items_tool
  ON user_tool_stack_items(tool_id) WHERE tool_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stack_item_tasks_task
  ON user_tool_stack_item_tasks(task_id, stack_item_id);
CREATE INDEX IF NOT EXISTS idx_stack_audits_user_status
  ON stack_audit_runs(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stack_findings_audit_type
  ON stack_audit_findings(audit_id, finding_type);
CREATE INDEX IF NOT EXISTS idx_stack_findings_related_tool
  ON stack_audit_findings(related_tool_id) WHERE related_tool_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stack_finding_claims_claim
  ON stack_audit_finding_claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_trial_scorecards_user_status
  ON trial_scorecards(user_id, status, ends_at);
CREATE INDEX IF NOT EXISTS idx_trial_scorecards_tool
  ON trial_scorecards(tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trial_checks_scorecard_result
  ON trial_scorecard_checks(scorecard_id, result, sequence);

CREATE OR REPLACE FUNCTION set_stack_trial_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stack_items_set_updated_at ON user_tool_stack_items;
CREATE TRIGGER stack_items_set_updated_at
  BEFORE UPDATE ON user_tool_stack_items
  FOR EACH ROW EXECUTE FUNCTION set_stack_trial_updated_at();
DROP TRIGGER IF EXISTS trial_scorecards_set_updated_at ON trial_scorecards;
CREATE TRIGGER trial_scorecards_set_updated_at
  BEFORE UPDATE ON trial_scorecards
  FOR EACH ROW EXECUTE FUNCTION set_stack_trial_updated_at();
DROP TRIGGER IF EXISTS trial_checks_set_updated_at ON trial_scorecard_checks;
CREATE TRIGGER trial_checks_set_updated_at
  BEFORE UPDATE ON trial_scorecard_checks
  FOR EACH ROW EXECUTE FUNCTION set_stack_trial_updated_at();

CREATE OR REPLACE FUNCTION assert_stack_audit_item_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  audit_owner UUID;
  item_owner UUID;
BEGIN
  IF NEW.stack_item_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO audit_owner FROM stack_audit_runs WHERE id = NEW.audit_id;
  SELECT user_id INTO item_owner FROM user_tool_stack_items WHERE id = NEW.stack_item_id;

  IF audit_owner IS NULL OR item_owner IS NULL OR audit_owner <> item_owner THEN
    RAISE EXCEPTION 'stack_audit_item_owner_mismatch';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stack_audit_findings_check_owner ON stack_audit_findings;
CREATE TRIGGER stack_audit_findings_check_owner
  BEFORE INSERT OR UPDATE ON stack_audit_findings
  FOR EACH ROW EXECUTE FUNCTION assert_stack_audit_item_ownership();

CREATE OR REPLACE FUNCTION assert_trial_session_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  session_owner UUID;
BEGIN
  IF NEW.decision_session_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO session_owner
  FROM decision_sessions
  WHERE id = NEW.decision_session_id;

  IF session_owner IS NULL OR session_owner <> NEW.user_id THEN
    RAISE EXCEPTION 'trial_decision_session_owner_mismatch';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trial_scorecards_check_session_owner ON trial_scorecards;
CREATE TRIGGER trial_scorecards_check_session_owner
  BEFORE INSERT OR UPDATE ON trial_scorecards
  FOR EACH ROW EXECUTE FUNCTION assert_trial_session_ownership();

ALTER TABLE user_tool_stack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_stack_item_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_audit_finding_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_scorecard_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own stack items" ON user_tool_stack_items;
CREATE POLICY "Users can manage own stack items" ON user_tool_stack_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own stack item tasks" ON user_tool_stack_item_tasks;
CREATE POLICY "Users can manage own stack item tasks" ON user_tool_stack_item_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_tool_stack_items item
      WHERE item.id = user_tool_stack_item_tasks.stack_item_id
        AND item.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tool_stack_items item
      WHERE item.id = user_tool_stack_item_tasks.stack_item_id
        AND item.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own stack audits" ON stack_audit_runs;
CREATE POLICY "Users can view own stack audits" ON stack_audit_runs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own pending stack audits" ON stack_audit_runs;
CREATE POLICY "Users can create own pending stack audits" ON stack_audit_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');
DROP POLICY IF EXISTS "Users can delete own stack audits" ON stack_audit_runs;
CREATE POLICY "Users can delete own stack audits" ON stack_audit_runs
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own stack audit findings" ON stack_audit_findings;
CREATE POLICY "Users can view own stack audit findings" ON stack_audit_findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stack_audit_runs audit
      WHERE audit.id = stack_audit_findings.audit_id
        AND audit.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own stack audit evidence" ON stack_audit_finding_claims;
CREATE POLICY "Users can view own stack audit evidence" ON stack_audit_finding_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM stack_audit_findings finding
      JOIN stack_audit_runs audit ON audit.id = finding.audit_id
      WHERE finding.id = stack_audit_finding_claims.finding_id
        AND audit.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own trial scorecards" ON trial_scorecards;
CREATE POLICY "Users can manage own trial scorecards" ON trial_scorecards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own trial checks" ON trial_scorecard_checks;
CREATE POLICY "Users can manage own trial checks" ON trial_scorecard_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trial_scorecards scorecard
      WHERE scorecard.id = trial_scorecard_checks.scorecard_id
        AND scorecard.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM trial_scorecards scorecard
      WHERE scorecard.id = trial_scorecard_checks.scorecard_id
        AND scorecard.user_id = auth.uid()
    )
  );

-- Anonymous users receive no policy on any STK table. Audit findings and evidence
-- deliberately have no client write policy; only trusted server operations may write them.

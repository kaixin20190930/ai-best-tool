\set ON_ERROR_STOP on
-- Run only against an empty local postgres database. Everything is rolled back.
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public') THEN
    RAISE EXCEPTION 'CL-01 fixture requires an empty local public schema';
  END IF;
END $$;
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT current_setting('request.jwt.claim.role', true)
$$;

CREATE TABLE decision_tasks (id uuid PRIMARY KEY, slug text NOT NULL, status text NOT NULL);
CREATE TABLE decision_capabilities (id uuid PRIMARY KEY, status text NOT NULL);
CREATE TABLE task_capabilities (
  task_id uuid, capability_id uuid, status text, updated_at timestamptz DEFAULT now(),
  reviewed_by uuid, reviewed_at timestamptz, review_due_at timestamptz,
  rationale jsonb, importance text DEFAULT 'preferred', PRIMARY KEY(task_id, capability_id));
CREATE TABLE tool_capabilities (
  id uuid PRIMARY KEY, tool_id uuid, capability_id uuid, status text,
  updated_at timestamptz DEFAULT now(), reviewed_by uuid, reviewed_at timestamptz,
  review_due_at timestamptz, support_level text, availability text,
  plan_requirement jsonb, limitations jsonb);
CREATE TABLE tool_task_fits (
  id uuid PRIMARY KEY, tool_id uuid, task_id uuid, status text,
  updated_at timestamptz DEFAULT now(), reviewed_by uuid, reviewed_at timestamptz,
  review_due_at timestamptz, rationale jsonb, required_conditions jsonb, disqualifiers jsonb);
CREATE TABLE product_intelligence_profiles (
  id uuid PRIMARY KEY, owner_type text, owner_id uuid, canonical_domain text,
  profile_status text, last_verified_at timestamptz, next_review_at timestamptz,
  updated_at timestamptz);
CREATE TABLE product_intelligence_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), profile_id uuid, url text,
  canonical_url text, source_type text, source_label text, last_verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb, UNIQUE(profile_id, url));
CREATE TABLE product_intelligence_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), profile_id uuid, claim_type text,
  claim_key text, claim_value jsonb, source_id uuid, source_url text, source_excerpt text,
  observed_at timestamptz, source_type text, verification_status text,
  verified_at timestamptz, verified_by uuid, verification_note text,
  review_due_at timestamptz, validity_scope jsonb, conflict_status text DEFAULT 'none',
  invalidated_at timestamptz, expires_at timestamptz);
CREATE TABLE tool_capability_claims (tool_capability_id uuid, claim_id uuid, purpose text);
CREATE TABLE tool_task_fit_claims (fit_id uuid, claim_id uuid, purpose text);
CREATE TABLE product_intelligence_timeline_events (
  profile_id uuid, event_type text, review_scope text, claim_type text, claim_key text,
  title text, summary text, old_value jsonb, new_value jsonb, source_url text,
  source_excerpt text, visibility text, occurred_at timestamptz, verified_at timestamptz,
  verified_by uuid, review_note text, metadata jsonb,
  CONSTRAINT product_intelligence_timeline_events_event_type_check
    CHECK (event_type IN ('fact_added', 'fact_changed', 'fact_removed', 'reviewed_no_change')));

\i db/supabase/migrations/20260925_decision_cluster_editorial_closure.sql

SET LOCAL request.jwt.claim.role = 'service_role';
INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111');
INSERT INTO decision_tasks VALUES
  ('22222222-2222-4222-8222-222222222222', 'research-with-citations', 'active'),
  ('22222222-2222-4222-8222-222222222223', 'ai-voiceover', 'active');
INSERT INTO decision_capabilities VALUES ('33333333-3333-4333-8333-333333333333', 'active');
INSERT INTO task_capabilities
  (task_id, capability_id, status, updated_at, reviewed_by, reviewed_at, review_due_at,
   rationale, last_edited_by) VALUES
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333',
   'reviewed', now(), '11111111-1111-4111-8111-111111111111', now() - interval '1 day',
   now() + interval '30 days', '{"en":"A concrete capability rationale for this user task."}',
   '11111111-1111-4111-8111-111111111111');
INSERT INTO tool_capabilities
  (id, tool_id, capability_id, status, updated_at, reviewed_by, reviewed_at,
   review_due_at, support_level, availability, plan_requirement, limitations,
   last_edited_by) VALUES
  ('44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555',
   '33333333-3333-4333-8333-333333333333', 'reviewed', now(),
   '11111111-1111-4111-8111-111111111111', now() - interval '1 day', now() + interval '30 days',
   'strong', 'paid_only', '{"en":"Pro plan required"}', '["No offline output is supported"]',
   '11111111-1111-4111-8111-111111111111');
INSERT INTO tool_task_fits
  (id, tool_id, task_id, status, updated_at, reviewed_by, reviewed_at, review_due_at,
   rationale, required_conditions, disqualifiers) VALUES
  ('66666666-6666-4666-8666-666666666666', '55555555-5555-4555-8555-555555555555',
   '22222222-2222-4222-8222-222222222222', 'reviewed', now(),
   '11111111-1111-4111-8111-111111111111', now() - interval '1 day', now() + interval '30 days',
   '{"en":"A concrete fit rationale for this user task."}',
   '["User provides input"]', '["No offline use"]');
INSERT INTO product_intelligence_profiles
  (id, owner_type, owner_id, canonical_domain, profile_status) VALUES
  ('77777777-7777-4777-8777-777777777777', 'tool',
   '55555555-5555-4555-8555-555555555555', 'example.com', 'ready'),
  ('77777777-7777-4777-8777-777777777778', 'tool',
   '55555555-5555-4555-8555-555555555556', 'other.example', 'ready');
UPDATE task_capabilities SET rationale =
  '{"en":"An independently revised concrete rationale for this Task."}';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM task_capabilities
      WHERE jsonb_array_length(editorial_history) = 1
        AND editorial_history->0->'before'->'rationale' IS NOT NULL
        AND editorial_history->0->'after'->'rationale' IS NOT NULL) THEN
    RAISE EXCEPTION 'rationale change history missing';
  END IF;
END $$;

DO $$
DECLARE v_id uuid;
BEGIN
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://unofficial.test/features', 'Official features', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'domain rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_profiles SET profile_status = 'stale'
    WHERE id = '77777777-7777-4777-8777-777777777777';
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://example.com/features', 'Official features', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'stale profile rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_profiles SET profile_status = 'ready'
    WHERE id = '77777777-7777-4777-8777-777777777777';
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://example.com/features', 'Official features', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() - interval '1 day', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'stale review rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO product_intelligence_sources
    (profile_id, url, canonical_url, source_type, source_label)
  VALUES ('77777777-7777-4777-8777-777777777777',
    'https://example.com/features', 'https://unofficial.test/elsewhere',
    'official', 'Existing official source');
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://example.com/features', 'Official features', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'off-domain canonical URL rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM product_intelligence_claims WHERE claim_key = 'support') THEN
    RAISE EXCEPTION 'off-domain canonical URL created a claim';
  END IF;
  UPDATE product_intelligence_sources SET canonical_url = 'https://docs.example.com/features'
    WHERE profile_id = '77777777-7777-4777-8777-777777777777'
      AND url = 'https://example.com/features';
  v_id := decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
    'https://example.com/features', 'Official features', 'feature', 'support',
    '"Supported feature"', 'The feature is directly supported on this page.',
    '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
  IF NOT EXISTS (SELECT 1 FROM product_intelligence_claims WHERE id = v_id AND verified_by IS NOT NULL)
    THEN RAISE EXCEPTION 'verified claim missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM product_intelligence_sources
      WHERE profile_id = '77777777-7777-4777-8777-777777777777'
        AND url = 'https://example.com/features'
        AND canonical_url = 'https://docs.example.com/features') THEN
    RAISE EXCEPTION 'trusted same-domain canonical URL was overwritten';
  END IF;
  UPDATE product_intelligence_claims SET expires_at = now() - interval '1 day' WHERE id = v_id;
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://example.com/features', 'Official features', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'expired claim refresh rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_claims SET expires_at = NULL WHERE id = v_id;
  BEGIN
    PERFORM decision_official_evidence_intake('77777777-7777-4777-8777-777777777777',
      'https://example.com/pricing', 'Official pricing', 'feature', 'support',
      '"Supported feature"', 'The feature is directly supported on this page.',
      '{"plan":"pro"}', now() + interval '30 days', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'duplicate-key rejection missing';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;

INSERT INTO tool_capability_claims
  SELECT '44444444-4444-4444-8444-444444444444', id, purpose
  FROM product_intelligence_claims CROSS JOIN
    (VALUES ('support'), ('availability'), ('plan'), ('limitation')) AS p(purpose);
INSERT INTO tool_task_fit_claims
  SELECT '66666666-6666-4666-8666-666666666666', id, purpose
  FROM product_intelligence_claims CROSS JOIN (VALUES ('fit'), ('limitation')) AS p(purpose);

CREATE TEMP TABLE cl01_manifest AS
  SELECT jsonb_build_array(jsonb_build_object('id', tc.capability_id, 'status', 'reviewed',
    'updated_at', tc.updated_at)) AS tasks,
    (SELECT jsonb_build_array(jsonb_build_object('id', c.id, 'status', 'reviewed',
      'updated_at', c.updated_at)) FROM tool_capabilities c) AS tools,
    (SELECT jsonb_build_array(jsonb_build_object('id', f.id, 'status', 'reviewed',
      'updated_at', f.updated_at)) FROM tool_task_fits f) AS fits
  FROM task_capabilities tc;

DO $$
DECLARE m cl01_manifest%ROWTYPE;
        v_preflight jsonb;
BEGIN
  SELECT * INTO m FROM cl01_manifest;
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'permission rejection missing';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  v_preflight := decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      '', true);
  IF v_preflight->>'ok' <> 'true' OR jsonb_array_length(v_preflight->'evidence') <> 6
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(v_preflight->'evidence') item
       WHERE item->>'claimId' IS NULL OR item->>'sourceUrl' IS NULL
         OR item->>'purpose' IS NULL OR item->>'reviewDueAt' IS NULL
         OR item->>'verifiedAt' IS NULL OR item->'validityScope' IS NULL
         OR item->>'officialSource' <> 'true' OR item ? 'claimValue'
         OR item ? 'sourceExcerpt') THEN
    RAISE EXCEPTION 'preflight evidence summary is incomplete or exposes raw claim content';
  END IF;
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222223',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'cross-Task rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO task_capabilities
    (task_id, capability_id, status, updated_at, reviewed_by, reviewed_at,
     review_due_at, rationale, last_edited_by)
  VALUES ('22222222-2222-4222-8222-222222222223',
    '33333333-3333-4333-8333-333333333333', 'published', now(),
    '11111111-1111-4111-8111-111111111111', now(), now() + interval '30 days',
    '{"en":"Another Task has a published need for this capability."}',
    '11111111-1111-4111-8111-111111111111');
  INSERT INTO tool_task_fits
    (id, tool_id, task_id, status, updated_at, reviewed_by, reviewed_at,
     review_due_at, rationale, required_conditions, disqualifiers)
  VALUES ('66666666-6666-4666-8666-666666666667',
    '55555555-5555-4555-8555-555555555555',
    '22222222-2222-4222-8222-222222222223', 'published', now(),
    '11111111-1111-4111-8111-111111111111', now(), now() + interval '30 days',
    '{"en":"Another Task has a published Fit with the same Tool."}',
    '["Input"]', '["Exclusion"]');
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'cross-cluster shared Tool Capability rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  DELETE FROM tool_task_fits WHERE id = '66666666-6666-4666-8666-666666666667';
  DELETE FROM task_capabilities WHERE task_id = '22222222-2222-4222-8222-222222222223';
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      '[]'::jsonb, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'empty manifest rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks || m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'duplicate manifest rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_profiles SET owner_id = '55555555-5555-4555-8555-555555555556'
    WHERE id = '77777777-7777-4777-8777-777777777777';
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'wrong owner rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_profiles SET owner_id = '55555555-5555-4555-8555-555555555555'
    WHERE id = '77777777-7777-4777-8777-777777777777';
  UPDATE product_intelligence_claims SET review_due_at = now() - interval '1 day';
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'expired evidence rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE product_intelligence_claims SET review_due_at = now() + interval '30 days';
  UPDATE tool_capabilities SET plan_requirement = '{}'::jsonb;
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'empty plan rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE tool_capabilities SET plan_requirement = '{"en":"Pro plan required"}';
  UPDATE tool_capabilities SET availability = 'unknown';
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'unknown availability rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE tool_capabilities SET availability = 'paid_only';
  DELETE FROM tool_capability_claims WHERE purpose = 'plan';
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', true);
    RAISE EXCEPTION 'missing purpose rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO tool_capability_claims
    SELECT '44444444-4444-4444-8444-444444444444', id, 'plan'
    FROM product_intelligence_claims LIMIT 1;
END $$;

CREATE FUNCTION cl01_reject_fit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'forced fit failure' USING ERRCODE = '23514'; END $$;
CREATE TRIGGER cl01_reject_fit BEFORE UPDATE ON tool_task_fits
  FOR EACH ROW EXECUTE FUNCTION cl01_reject_fit();
DO $$
DECLARE m cl01_manifest%ROWTYPE;
BEGIN
  SELECT * INTO m FROM cl01_manifest;
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', false);
    RAISE EXCEPTION 'forced failure missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM task_capabilities WHERE status <> 'reviewed')
    OR EXISTS (SELECT 1 FROM tool_capabilities WHERE status <> 'reviewed') THEN
    RAISE EXCEPTION 'partial publication escaped rollback';
  END IF;
END $$;
DROP TRIGGER cl01_reject_fit ON tool_task_fits;
SELECT decision_cluster_transition('22222222-2222-4222-8222-222222222222',
  tasks, tools, fits, 'publish', '11111111-1111-4111-8111-111111111111',
  'qa-report-001', false) FROM cl01_manifest;
DO $$
DECLARE m cl01_manifest%ROWTYPE;
BEGIN
  SELECT * INTO m FROM cl01_manifest;
  BEGIN
    PERFORM decision_cluster_transition('22222222-2222-4222-8222-222222222222',
      m.tasks, m.tools, m.fits, 'publish', '11111111-1111-4111-8111-111111111111',
      'qa-report-001', false);
    RAISE EXCEPTION 'repeat publication rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
DO $$ BEGIN
  BEGIN
    DELETE FROM tool_task_fit_claims WHERE purpose = 'fit';
    RAISE EXCEPTION 'published Fit link lock missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
UPDATE product_intelligence_claims SET review_due_at = now() - interval '1 day';
SELECT decision_cluster_transition('22222222-2222-4222-8222-222222222222',
  jsonb_build_array(jsonb_build_object('id', tc.capability_id, 'status', 'published',
    'updated_at', tc.updated_at)),
  (SELECT jsonb_build_array(jsonb_build_object('id', c.id, 'status', 'published',
    'updated_at', c.updated_at)) FROM tool_capabilities c),
  (SELECT jsonb_build_array(jsonb_build_object('id', f.id, 'status', 'published',
    'updated_at', f.updated_at)) FROM tool_task_fits f),
  'withdraw', '11111111-1111-4111-8111-111111111111', '', false)
  FROM task_capabilities tc;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM task_capabilities WHERE status <> 'stale')
    OR EXISTS (SELECT 1 FROM tool_capabilities WHERE status <> 'stale')
    OR EXISTS (SELECT 1 FROM tool_task_fits WHERE status <> 'stale') THEN
    RAISE EXCEPTION 'withdrawal postcondition failed';
  END IF;
  IF EXISTS (SELECT 1 FROM task_capabilities WHERE jsonb_array_length(editorial_history) <> 3)
    OR EXISTS (SELECT 1 FROM tool_capabilities WHERE jsonb_array_length(editorial_history) < 4)
    OR EXISTS (SELECT 1 FROM tool_task_fits WHERE jsonb_array_length(editorial_history) <> 2) THEN
    RAISE EXCEPTION 'editorial transition history missing';
  END IF;
END $$;
ROLLBACK;

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
\i db/supabase/migrations/20260928_decision_cl04_fit_withdrawal.sql

SET LOCAL request.jwt.claim.role = 'service_role';
INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111');
INSERT INTO decision_tasks VALUES
  ('10ffdf04-6885-4a28-949d-0723038c6954', 'build-app-with-ai', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'ai-voiceover', 'active');
INSERT INTO task_capabilities
  (task_id, capability_id, status, rationale, last_edited_by) VALUES
  ('10ffdf04-6885-4a28-949d-0723038c6954',
   '136ae3d3-9468-4445-a01d-8f2aaef53b97', 'reviewed', '{}',
   '11111111-1111-4111-8111-111111111111');
INSERT INTO tool_capabilities
  (id, tool_id, capability_id, status, plan_requirement, limitations, last_edited_by)
  VALUES
  ('4ebad72c-d03e-4a54-9a2c-f5024f7da9ac',
   '23bb3601-a5ac-42c3-bff3-64b06a063959',
   '136ae3d3-9468-4445-a01d-8f2aaef53b97', 'reviewed', '{}', '[]',
   '11111111-1111-4111-8111-111111111111'),
  ('ac4c1009-feaf-4544-bbaf-086e56089bdc',
   'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
   '136ae3d3-9468-4445-a01d-8f2aaef53b97', 'reviewed', '{}', '[]',
   '11111111-1111-4111-8111-111111111111');
INSERT INTO tool_task_fits
  (id, tool_id, task_id, status, rationale, required_conditions, disqualifiers)
  VALUES
  ('692f9115-2d1d-487b-b02b-392fa55d2d34',
   '23bb3601-a5ac-42c3-bff3-64b06a063959',
   '10ffdf04-6885-4a28-949d-0723038c6954', 'reviewed', '{}', '[]', '[]'),
  ('bb6bb5aa-df5e-4113-bb76-8d4910911b28',
   'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
   '10ffdf04-6885-4a28-949d-0723038c6954', 'reviewed', '{}', '[]', '[]'),
  ('66666666-6666-4666-8666-666666666666',
   '23bb3601-a5ac-42c3-bff3-64b06a063959',
   '22222222-2222-4222-8222-222222222222', 'reviewed', '{}', '[]', '[]');
INSERT INTO product_intelligence_profiles
  (id, owner_type, owner_id, canonical_domain, profile_status) VALUES
  ('78427cbc-30df-43f4-99f1-ecbc2ae76c10', 'tool',
   '23bb3601-a5ac-42c3-bff3-64b06a063959', 'n8n.io', 'ready'),
  ('2c4881f1-edf8-4b6a-9280-0ab88a006057', 'tool',
   'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e', 'openrouter.ai', 'ready');

CREATE TEMP TABLE cl04_manifest AS
  SELECT jsonb_agg(jsonb_build_object('id', id, 'status', status,
    'updated_at', updated_at) ORDER BY id) AS fits
  FROM tool_task_fits WHERE task_id = '10ffdf04-6885-4a28-949d-0723038c6954';

DO $$
DECLARE m jsonb; result jsonb;
BEGIN
  SELECT fits INTO m FROM cl04_manifest;
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  BEGIN
    PERFORM decision_cl04_fit_transition(m, 'withdraw',
      '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', true);
    RAISE EXCEPTION 'permission rejection missing';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  result := decision_cl04_fit_transition(m, 'withdraw',
    '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', true);
  IF result->>'ok' <> 'true' OR result->>'fitUpdates' <> '0'
    OR EXISTS (SELECT 1 FROM tool_task_fits WHERE task_id =
      '10ffdf04-6885-4a28-949d-0723038c6954' AND status <> 'reviewed') THEN
    RAISE EXCEPTION 'preflight mutated a Fit';
  END IF;
  BEGIN
    PERFORM decision_cl04_fit_transition(m || jsonb_build_array(m->0), 'withdraw',
      '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', true);
    RAISE EXCEPTION 'extra Fit rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    PERFORM decision_cl04_fit_transition(jsonb_build_array(m->0,
      jsonb_set(m->1, '{updated_at}', to_jsonb('2000-01-01T00:00:00Z'::text))),
      'withdraw', '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', true);
    RAISE EXCEPTION 'version rejection missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

CREATE FUNCTION cl04_reject_second_fit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id = 'bb6bb5aa-df5e-4113-bb76-8d4910911b28' THEN
    RAISE EXCEPTION 'forced second Fit failure' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cl04_reject_second_fit BEFORE UPDATE ON tool_task_fits
  FOR EACH ROW EXECUTE FUNCTION cl04_reject_second_fit();
DO $$ DECLARE m jsonb;
BEGIN
  SELECT fits INTO m FROM cl04_manifest;
  BEGIN
    PERFORM decision_cl04_fit_transition(m, 'withdraw',
      '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', false);
    RAISE EXCEPTION 'forced rollback missing';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF (SELECT count(*) FROM tool_task_fits WHERE task_id =
      '10ffdf04-6885-4a28-949d-0723038c6954' AND status = 'reviewed') <> 2
    OR EXISTS (SELECT 1 FROM product_intelligence_timeline_events)
    OR EXISTS (SELECT 1 FROM tool_task_fits WHERE editorial_history <> '[]'::jsonb) THEN
    RAISE EXCEPTION 'partial withdrawal escaped rollback';
  END IF;
END $$;
DROP TRIGGER cl04_reject_second_fit ON tool_task_fits;

SELECT decision_cl04_fit_transition(fits, 'withdraw',
  '11111111-1111-4111-8111-111111111111', 'CL04-QA-001', false)
  FROM cl04_manifest;
DO $$ BEGIN
  IF (SELECT count(*) FROM tool_task_fits WHERE task_id =
      '10ffdf04-6885-4a28-949d-0723038c6954' AND status = 'stale') <> 2
    OR (SELECT count(*) FROM tool_capabilities WHERE status = 'reviewed') <> 2
    OR (SELECT count(*) FROM task_capabilities WHERE status = 'reviewed') <> 1
    OR (SELECT count(*) FROM tool_task_fits WHERE id =
      '66666666-6666-4666-8666-666666666666' AND status = 'reviewed') <> 1
    OR (SELECT count(*) FROM product_intelligence_timeline_events
      WHERE event_type = 'decision_withdrawal') <> 2
    OR (SELECT count(*) FROM tool_task_fits WHERE task_id =
      '10ffdf04-6885-4a28-949d-0723038c6954'
      AND jsonb_array_length(editorial_history) = 1) <> 2 THEN
    RAISE EXCEPTION 'Fit-only withdrawal or audit postcondition failed';
  END IF;
END $$;

CREATE TEMP TABLE cl04_restore_manifest AS
  SELECT jsonb_agg(jsonb_build_object('id', id, 'status', status,
    'updated_at', updated_at) ORDER BY id) AS fits
  FROM tool_task_fits WHERE task_id = '10ffdf04-6885-4a28-949d-0723038c6954';
SELECT decision_cl04_fit_transition(fits, 'restore',
  '11111111-1111-4111-8111-111111111111', 'CL04-QA-RESTORE', false)
  FROM cl04_restore_manifest;
DO $$ BEGIN
  IF (SELECT count(*) FROM tool_task_fits WHERE task_id =
      '10ffdf04-6885-4a28-949d-0723038c6954' AND status = 'reviewed') <> 2
    OR (SELECT count(*) FROM product_intelligence_timeline_events
      WHERE event_type = 'decision_restoration') <> 2 THEN
    RAISE EXCEPTION 'Fit-only restore postcondition failed';
  END IF;
END $$;
ROLLBACK;

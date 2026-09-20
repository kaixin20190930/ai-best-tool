import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('db/supabase/migrations/20260920_meeting_notes_pilot_seed.sql', 'utf8');

for (const required of [
  "'meeting-notes'",
  "'active'",
  "'7ae4bbb2-847f-45cc-9294-e96663fa02a3'",
  "'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49'",
  "'57b270b9-78cf-41f8-8b74-dec46400cd65'",
  'verification_status',
  "'verified'",
  "'reviewed'",
  "editorial_status='published'",
  "status='published'",
  'tool_decision_profile_claims',
  'tool_task_fit_claims',
]) {
  assert(migration.includes(required), `Pilot seed missing ${required}`);
}

for (const forbidden of ['INSERT INTO decision_metric_events', 'DECISION_EVENT_COLLECTION_ENABLED', 'CREATE POLICY']) {
  assert.equal(migration.includes(forbidden), false, `Pilot seed must not include ${forbidden}`);
}

assert.equal((migration.match(/'2026-10-20T00:00:00Z'/g) || []).length >= 6, true);
console.log('PASS meeting-notes Pilot seed identities, evidence links, review dates and collection boundary');

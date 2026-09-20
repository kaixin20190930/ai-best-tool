import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  DECISION_EVENT_INTERNAL_TOKEN_OVERLAP_HOURS,
  DECISION_EVENT_INTERNAL_TOKEN_ROTATION_DAYS,
  DECISION_EVENT_MIN_HUMAN_FLOWS,
  DECISION_EVENT_OPERATION_AUDIT_RETENTION_DAYS,
  DECISION_EVENT_RAW_RETENTION_DAYS,
  DECISION_EVENT_ROLLUP_RETENTION_DAYS,
  decisionEventPilotPages,
  evaluateDecisionEventPilot,
} from '../lib/analytics/decisionEvents/governance';

const projectRoot = path.resolve(__dirname, '..');
const migration = fs.readFileSync(
  path.join(projectRoot, 'db/supabase/migrations/20260920_decision_metric_governance.sql'),
  'utf8',
);

assert.equal(DECISION_EVENT_RAW_RETENTION_DAYS, 35);
assert.equal(DECISION_EVENT_ROLLUP_RETENTION_DAYS, 400);
assert.equal(DECISION_EVENT_OPERATION_AUDIT_RETENTION_DAYS, 90);
assert.equal(DECISION_EVENT_MIN_HUMAN_FLOWS, 20);
assert.equal(DECISION_EVENT_INTERNAL_TOKEN_ROTATION_DAYS, 30);
assert.equal(DECISION_EVENT_INTERNAL_TOKEN_OVERLAP_HOURS, 24);
assert.deepEqual(
  decisionEventPilotPages.map((page) => page.path),
  ['/find-tools', '/ai/fathom', '/ai/otter-ai', '/ai/fireflies', '/guides/ai-tools-for-meeting-notes'],
);

const pageEvidence = Object.fromEntries(
  decisionEventPilotPages.map((page) => [
    page.path,
    { routeExists: true, publishedEntity: true, verifiedEvidenceCount: 1 },
  ]),
);
const disabled = evaluateDecisionEventPilot({
  collectionEnabled: false,
  foundationMigrationApplied: true,
  governanceMigrationApplied: true,
  retentionOperationConfigured: true,
  aggregateReaderConfigured: true,
  internalTrafficExclusionReady: true,
  activeTaskSlugs: ['meeting-notes'],
  pages: pageEvidence,
});
assert.equal(disabled.ready, false);
assert.deepEqual(disabled.blockers, [{ code: 'collection_not_enabled' }]);

const blockedPage = evaluateDecisionEventPilot({
  collectionEnabled: true,
  foundationMigrationApplied: true,
  governanceMigrationApplied: true,
  retentionOperationConfigured: true,
  aggregateReaderConfigured: true,
  internalTrafficExclusionReady: true,
  activeTaskSlugs: ['meeting-notes'],
  pages: {
    ...pageEvidence,
    '/ai/fireflies': { routeExists: true, publishedEntity: false, verifiedEvidenceCount: 0 },
  },
});
assert.equal(blockedPage.ready, false);
assert.deepEqual(blockedPage.blockers, [
  { code: 'published_entity_missing', path: '/ai/fireflies' },
  { code: 'verified_evidence_missing', path: '/ai/fireflies' },
]);

const missingEvidenceCount = evaluateDecisionEventPilot({
  collectionEnabled: true,
  foundationMigrationApplied: true,
  governanceMigrationApplied: true,
  retentionOperationConfigured: true,
  aggregateReaderConfigured: true,
  internalTrafficExclusionReady: true,
  activeTaskSlugs: ['meeting-notes'],
  pages: {
    ...pageEvidence,
    '/ai/fireflies': { routeExists: true, publishedEntity: true } as never,
  },
});
assert.deepEqual(missingEvidenceCount.blockers, [{ code: 'verified_evidence_missing', path: '/ai/fireflies' }]);

const invalidEvidenceCount = evaluateDecisionEventPilot({
  collectionEnabled: true,
  foundationMigrationApplied: true,
  governanceMigrationApplied: true,
  retentionOperationConfigured: true,
  aggregateReaderConfigured: true,
  internalTrafficExclusionReady: true,
  activeTaskSlugs: ['meeting-notes'],
  pages: {
    ...pageEvidence,
    '/ai/fireflies': { routeExists: true, publishedEntity: true, verifiedEvidenceCount: Number.NaN },
  },
});
assert.deepEqual(invalidEvidenceCount.blockers, [{ code: 'verified_evidence_missing', path: '/ai/fireflies' }]);

const ready = evaluateDecisionEventPilot({
  collectionEnabled: true,
  foundationMigrationApplied: true,
  governanceMigrationApplied: true,
  retentionOperationConfigured: true,
  aggregateReaderConfigured: true,
  internalTrafficExclusionReady: true,
  activeTaskSlugs: ['meeting-notes'],
  pages: pageEvidence,
});
assert.equal(ready.ready, true);
assert.deepEqual(ready.blockers, []);

for (const requiredSql of [
  "INTERVAL '35 days'",
  "date_trunc('day', v_now AT TIME ZONE 'UTC'",
  "(received_at AT TIME ZONE 'UTC')::DATE",
  "INTERVAL '400 days'",
  "INTERVAL '90 days'",
  "traffic_quality = 'human'",
  'received_at < v_raw_window_end',
  'unique_human_flows >= 20',
  "'insufficient_data'",
  'FORCE ROW LEVEL SECURITY',
  'REVOKE ALL ON TABLE public.decision_metric_daily_rollups FROM PUBLIC, anon, authenticated, service_role',
  'GRANT EXECUTE ON FUNCTION public.maintain_decision_metric_events() TO service_role',
]) {
  assert.ok(migration.includes(requiredSql), `Governance migration is missing: ${requiredSql}`);
}

assert.equal(
  migration.includes('maintain_decision_metric_events(p_now'),
  false,
  'The service-role maintenance entry point must not accept a caller-controlled clock.',
);
assert.equal(
  migration.match(/started_at < v_now - INTERVAL '90 days'/g)?.length,
  2,
  'Both success and failure paths must prune operation audits.',
);

for (const forbiddenSql of ['user_agent', 'referrer', 'ip_address', 'flow_instance_hash TEXT']) {
  assert.equal(
    migration.includes(forbiddenSql),
    false,
    `Governance migration contains forbidden data: ${forbiddenSql}`,
  );
}

console.log('MEASURE-02 governance and Pilot boundary tests passed.');

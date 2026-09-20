import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { parseDecisionMetricMaintenanceStatus } from '../lib/analytics/decisionEvents/maintenance';

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, 'db/supabase/migrations/20260920_decision_metric_maintenance_status.sql'),
  'utf8',
);
const route = fs.readFileSync(
  path.join(root, 'app/api/monitor/decision-metrics-maintenance/route.ts'),
  'utf8',
);
const workflow = fs.readFileSync(
  path.join(root, '.github/workflows/decision-metric-maintenance.yml'),
  'utf8',
);
const healthWorkflow = fs.readFileSync(
  path.join(root, '.github/workflows/production-health-monitor.yml'),
  'utf8',
);

assert.match(migration, /read_decision_metric_maintenance_status/);
assert.match(migration, /INTERVAL '48 hours'/);
assert.match(migration, /SECURITY DEFINER/);
assert.match(migration, /GRANT EXECUTE .*service_role/);
assert.doesNotMatch(migration, /flow_instance_hash|user_agent|ip_address|referrer/);
assert.match(route, /process\.env\.MONITOR_API_TOKEN/);
assert.match(route, /runDecisionMetricMaintenance/);
assert.match(route, /readDecisionMetricMaintenanceStatus/);
assert.match(route, /internalTrafficExclusionReady/);
assert.match(workflow, /cron: '40 1 \* \* \*'/);
assert.match(workflow, /--request POST/);
assert.match(workflow, /MONITOR_API_TOKEN/);
assert.match(healthWorkflow, /Check decision metric retention freshness/);

assert.deepEqual(
  parseDecisionMetricMaintenanceStatus([
    {
      last_success_at: '2026-09-20T00:00:00Z',
      last_attempt_at: '2026-09-20T00:00:00Z',
      last_attempt_status: 'completed',
      freshness_status: 'fresh',
      age_seconds: 60,
    },
  ]),
  {
    lastSuccessAt: '2026-09-20T00:00:00Z',
    lastAttemptAt: '2026-09-20T00:00:00Z',
    lastAttemptStatus: 'completed',
    freshnessStatus: 'fresh',
    ageSeconds: 60,
  },
);
assert.throws(() => parseDecisionMetricMaintenanceStatus([]), /maintenance_status_unavailable/);
assert.throws(
  () => parseDecisionMetricMaintenanceStatus([{ freshness_status: 'unknown', age_seconds: null }]),
  /maintenance_status_invalid/,
);

console.log('Decision metric maintenance route, freshness RPC and schedules passed.');

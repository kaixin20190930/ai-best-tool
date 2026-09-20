import { createAdminClient } from '@/lib/supabase/admin';

export type DecisionMetricMaintenanceFreshness = 'fresh' | 'stale' | 'never_run';

export interface DecisionMetricMaintenanceStatus {
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  lastAttemptStatus: string | null;
  freshnessStatus: DecisionMetricMaintenanceFreshness;
  ageSeconds: number | null;
}

function firstRow(data: unknown): Record<string, unknown> | null {
  if (!Array.isArray(data) || data.length !== 1 || typeof data[0] !== 'object' || data[0] === null) return null;
  return data[0] as Record<string, unknown>;
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function parseDecisionMetricMaintenanceStatus(data: unknown): DecisionMetricMaintenanceStatus {
  const row = firstRow(data);
  if (!row) throw new Error('maintenance_status_unavailable');
  const freshnessStatus = row.freshness_status;
  if (!['fresh', 'stale', 'never_run'].includes(String(freshnessStatus))) {
    throw new Error('maintenance_status_invalid');
  }
  const ageSeconds = row.age_seconds;
  if (ageSeconds !== null && (!Number.isSafeInteger(ageSeconds) || Number(ageSeconds) < 0)) {
    throw new Error('maintenance_age_invalid');
  }
  return {
    lastSuccessAt: nullableString(row.last_success_at),
    lastAttemptAt: nullableString(row.last_attempt_at),
    lastAttemptStatus: nullableString(row.last_attempt_status),
    freshnessStatus: freshnessStatus as DecisionMetricMaintenanceFreshness,
    ageSeconds: ageSeconds === null ? null : Number(ageSeconds),
  };
}

export async function readDecisionMetricMaintenanceStatus() {
  const { data, error } = await createAdminClient().rpc('read_decision_metric_maintenance_status');
  if (error) throw new Error('maintenance_status_read_failed');
  return parseDecisionMetricMaintenanceStatus(data);
}

export async function runDecisionMetricMaintenance() {
  const { data, error } = await createAdminClient().rpc('maintain_decision_metric_events');
  if (error) throw new Error('maintenance_operation_failed');
  const row = firstRow(data);
  if (!row || row.status_code !== 'completed') throw new Error('maintenance_operation_failed');
  return {
    statusCode: 'completed' as const,
    rolledUpRows: Number(row.rolled_up_rows || 0),
    deletedRawRows: Number(row.deleted_raw_rows || 0),
    deletedRollupRows: Number(row.deleted_rollup_rows || 0),
  };
}

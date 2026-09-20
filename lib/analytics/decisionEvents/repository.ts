/* eslint-disable import/prefer-default-export */

import { createAdminClient } from '@/lib/supabase/admin';

import type { DecisionEventRepository, DecisionMetricEventRecord } from './ingest';

function toDatabaseRow(record: DecisionMetricEventRecord) {
  return {
    event_name: record.eventName,
    event_version: record.eventVersion,
    flow_instance_hash: record.flowInstanceHash,
    idempotency_key: record.idempotencyKey,
    received_at: record.receivedAt,
    expires_at: record.expiresAt,
    retention_days: record.retentionDays,
    traffic_quality: record.trafficQuality,
    locale: record.locale,
    surface: record.surface,
    task_id: record.taskId,
    result_id: record.resultId,
    tool_id: record.toolId,
    constraint_key: record.constraintKey,
    constraint_value_code: record.constraintValueCode,
    rules_version: record.rulesVersion,
    result_count: record.resultCount,
    has_unknown: record.hasUnknown,
    zero_reason_code: record.zeroReasonCode,
    entry_point: record.entryPoint,
    comparison_key: record.comparisonKey,
    source_tool_id: record.sourceToolId,
    evidence_surface: record.evidenceSurface,
    claim_type: record.claimType,
    save_mode: record.saveMode,
    official_domain_code: record.officialDomainCode,
  };
}

export function createDecisionEventRepository(): DecisionEventRepository {
  return {
    async insert(record) {
      const supabase = createAdminClient();
      const { error } = await supabase.from('decision_metric_events').insert(toDatabaseRow(record));
      if (!error) return 'inserted';
      if (error.code === '23505') return 'duplicate';
      throw new Error(error.message || 'Decision event insert failed.');
    },
  };
}

import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyStackAuditTrialMigration() {
  const supabase = createAdminClient();
  const checks = await Promise.all([
    supabase
      .from('user_tool_stack_items')
      .select('id, user_id, tool_id, billing_amount, monthly_cost, cost_normalization')
      .limit(1),
    supabase.from('user_tool_stack_item_tasks').select('stack_item_id, task_id, is_primary').limit(1),
    supabase
      .from('stack_audit_runs')
      .select('id, user_id, status, rules_version, idempotency_key')
      .limit(1),
    supabase
      .from('stack_audit_findings')
      .select('id, audit_id, stack_item_id, finding_type, related_tool_id, confidence_state')
      .limit(1),
    supabase
      .from('stack_audit_finding_claims')
      .select('finding_id, claim_id, purpose, claim_snapshot')
      .limit(1),
    supabase
      .from('trial_scorecards')
      .select('id, user_id, tool_id, status, started_at, ends_at, final_decision, idempotency_key')
      .limit(1),
    supabase
      .from('trial_scorecard_checks')
      .select('id, scorecard_id, sequence, metric_type, result')
      .limit(1),
  ]);

  const failed = checks.find((check) => check.error);
  if (failed?.error) {
    throw new Error(`Stack Audit migration is not ready: ${failed.error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        tablesReadable: checks.length,
        serviceRoleSchemaCheck: true,
        next: 'Run STK-02 stack editing and cost-normalization tests.',
      },
      null,
      2,
    ),
  );
}

verifyStackAuditTrialMigration().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyDecisionCapabilityFoundation() {
  const supabase = createAdminClient();
  const checks = await Promise.all([
    supabase.from('decision_capabilities').select('id, slug, name, capability_group, status, display_order').limit(1),
    supabase
      .from('tool_capabilities')
      .select('id, tool_id, capability_id, support_level, availability, status, reviewed_at, review_due_at')
      .limit(1),
    supabase
      .from('task_capabilities')
      .select('task_id, capability_id, importance, status, reviewed_at, review_due_at')
      .limit(1),
    supabase.from('tool_capability_claims').select('tool_capability_id, claim_id, purpose').limit(1),
  ]);

  const failed = checks.find((check) => check.error);
  if (failed?.error) {
    throw new Error(`Decision capability migration is not ready: ${failed.error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        tablesReadable: checks.length,
        serviceRoleSchemaCheck: true,
        next: 'Run DIFF-02 capability read-model and editor tests.',
      },
      null,
      2,
    ),
  );
}

verifyDecisionCapabilityFoundation().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyDecisionFinderMigration() {
  const supabase = createAdminClient();
  const checks = await Promise.all([
    supabase.from('decision_tasks').select('id, slug, status, constraint_schema').limit(1),
    supabase.from('tool_decision_profiles').select('tool_id, editorial_status, reviewed_at, review_due_at').limit(1),
    supabase.from('tool_task_fits').select('id, tool_id, task_id, fit_level, status').limit(1),
    supabase.from('tool_relationships').select('id, tool_id, related_tool_id, relationship_type, status').limit(1),
    supabase.from('decision_sessions').select('id, user_id, task_id, rules_version').limit(1),
    supabase
      .from('decision_recommendations')
      .select('id, session_id, tool_id, recommendation_role, rank_order, rules_version')
      .limit(1),
    supabase.from('tool_decision_profile_claims').select('tool_id, claim_id, purpose').limit(1),
    supabase.from('tool_task_fit_claims').select('fit_id, claim_id, purpose').limit(1),
    supabase.from('tool_relationship_claims').select('relationship_id, claim_id, purpose').limit(1),
    supabase
      .from('decision_recommendation_claims')
      .select('recommendation_id, claim_id, purpose, claim_snapshot')
      .limit(1),
  ]);

  const failed = checks.find((check) => check.error);
  if (failed?.error) {
    throw new Error(`Decision Finder migration is not ready: ${failed.error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        tablesReadable: checks.length,
        serviceRoleSchemaCheck: true,
        next: 'Run DCF-02 derived evidence read-layer tests.',
      },
      null,
      2,
    ),
  );
}

verifyDecisionFinderMigration().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

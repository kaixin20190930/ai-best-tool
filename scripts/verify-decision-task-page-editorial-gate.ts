import { loadEnvConfig } from '@next/env';

import { getDecisionToolIdentities } from '../lib/services/decision/repository';
import { evaluateTaskPageEditorialGate } from '../lib/services/decision/taskPageEditorialGate';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
type Row = Record<string, any>;

async function read(label: string, request: PromiseLike<{ data: Row[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function main() {
  const db = createAdminClient();
  const tasks = await read(
    'Task',
    db.from('decision_tasks').select('id,slug,status').eq('id', taskId),
  );
  const task = tasks.length === 1 ? tasks[0] : null;
  const [taskCapabilities, fits] = await Promise.all([
    read(
      'Task Capabilities',
      db
        .from('task_capabilities')
        .select('task_id,capability_id,importance,rationale,status,reviewed_at,review_due_at')
        .eq('task_id', taskId),
    ),
    read(
      'Task Fits',
      db
        .from('tool_task_fits')
        .select('id,task_id,tool_id,fit_level,rationale,required_conditions,disqualifiers,status,reviewed_at,review_due_at')
        .eq('task_id', taskId),
    ),
  ]);
  const capabilityIds = [...new Set(taskCapabilities.map((row) => String(row.capability_id)))];
  const toolIds = [...new Set(fits.map((row) => String(row.tool_id)))];
  const [capabilities, identities] = await Promise.all([
    capabilityIds.length
      ? read('Capability definitions', db.from('decision_capabilities').select('id,slug,status').in('id', capabilityIds))
      : Promise.resolve([]),
    getDecisionToolIdentities(toolIds, 'en'),
  ]);
  const fitIds = fits.map((fit) => String(fit.id));
  const fitClaimLinks = fitIds.length
    ? await read('Fit evidence links', db.from('tool_task_fit_claims').select('fit_id,claim_id').in('fit_id', fitIds))
    : [];
  const claimIds = [...new Set(fitClaimLinks.map((link) => String(link.claim_id)))];
  const claims = claimIds.length
    ? await read(
        'Evidence claims',
        db
          .from('product_intelligence_claims')
          .select('id,profile_id,source_url,verified_at,verified_by,review_due_at,expires_at,verification_status,conflict_status,invalidated_at')
          .in('id', claimIds),
      )
    : [];
  const profileIds = [...new Set(claims.map((claim) => String(claim.profile_id)))];
  const profiles = profileIds.length
    ? await read(
        'Evidence profiles',
        db.from('product_intelligence_profiles').select('id,owner_type,owner_id').in('id', profileIds),
      )
    : [];

  const result = evaluateTaskPageEditorialGate(
    { task, taskCapabilities, capabilities, fits, fitClaimLinks, claims, profiles, identities },
    new Date(),
  );
  console.log(JSON.stringify({ readOnly: true, ...result }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ readOnly: true, decision: 'HOLD', error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});

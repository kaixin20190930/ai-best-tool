import { createAdminClient } from '@/lib/supabase/admin';

import { getDecisionToolIdentities } from './repository';
import { deriveTaskPageReadModel, type TaskPageModel } from './taskPageReadModel';

type Row = Record<string, unknown>;

/** Public Task Page data is assembled only on the server and fails closed on read errors. */
export default async function getPublicTaskPage(slug: string, locale: string): Promise<TaskPageModel | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    const supabase = createAdminClient();
    const taskResult = await supabase
      .from('decision_tasks')
      .select('id, slug, name, description, constraint_schema, status')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    if (taskResult.error || !taskResult.data) return null;
    const task = taskResult.data as Row;
    const [taskCapabilityResult, fitsResult] = await Promise.all([
      supabase
        .from('task_capabilities')
        .select('task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at')
        .eq('task_id', String(task.id)),
      supabase
        .from('tool_task_fits')
        .select(
          'id, task_id, tool_id, fit_level, rationale, required_conditions, disqualifiers, status, reviewed_at, review_due_at',
        )
        .eq('task_id', String(task.id))
        .eq('status', 'published'),
    ]);
    if (taskCapabilityResult.error || fitsResult.error) return null;
    const taskCapabilities = (taskCapabilityResult.data || []) as Row[];
    const fits = (fitsResult.data || []) as Row[];
    if (taskCapabilities.length < 2 || fits.length < 3) return null;
    const capabilityIds = Array.from(new Set(taskCapabilities.map((row) => String(row.capability_id))));
    const fitIds = fits.map((row) => String(row.id));
    const toolIds = Array.from(new Set(fits.map((row) => String(row.tool_id))));
    const [capabilityResult, linksResult, identities] = await Promise.all([
      supabase.from('decision_capabilities').select('id, name, status').in('id', capabilityIds),
      supabase.from('tool_task_fit_claims').select('fit_id, claim_id').in('fit_id', fitIds),
      getDecisionToolIdentities(toolIds, locale),
    ]);
    if (capabilityResult.error || linksResult.error) return null;
    const fitClaimLinks = (linksResult.data || []) as Row[];
    const claimIds = Array.from(new Set(fitClaimLinks.map((row) => String(row.claim_id))));
    if (claimIds.length === 0) return null;
    const claimsResult = await supabase
      .from('product_intelligence_claims')
      .select(
        'id, profile_id, source_url, verified_at, verification_status, conflict_status, invalidated_at, expires_at, review_due_at',
      )
      .in('id', claimIds);
    if (claimsResult.error) return null;
    const claims = (claimsResult.data || []) as Row[];
    const profileIds = Array.from(new Set(claims.map((row) => String(row.profile_id))));
    if (profileIds.length === 0) return null;
    const profilesResult = await supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type, owner_id')
      .in('id', profileIds);
    if (profilesResult.error) return null;
    return deriveTaskPageReadModel({
      task,
      taskCapabilities,
      capabilities: (capabilityResult.data || []) as Row[],
      fits,
      fitClaimLinks,
      claims,
      profiles: (profilesResult.data || []) as Row[],
      identities,
    });
  } catch (error) {
    console.error('Task Page read failed:', error);
    return null;
  }
}

import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminDistributionOverview {
  entitlements: { active: number; pilot: number; pro: number; agency: number };
  projects: Array<{
    id: string;
    name: string;
    websiteUrl: string | null;
    status: string;
    workspaceName: string;
    workspaceKind: string;
    ownerId: string;
    taskTotal: number;
    taskOpen: number;
    liveResults: number;
    problematicResults: number;
    attribution: { visits: number; signups: number; submissions: number; claims: number; payments: number };
  }>;
  recentIssues: Array<{ projectName: string; title: string; status: string; liveUrl: string | null; updatedAt: string }>;
}

export async function getAdminDistributionOverview(): Promise<AdminDistributionOverview> {
  await requireAdmin();
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: entitlements, error: entitlementError }, { data: projects, error: projectError }, { data: tasks, error: taskError }, { data: events, error: eventError }] = await Promise.all([
    supabase.from('distribution_entitlements').select('plan, status'),
    supabase.from('distribution_projects').select('id, name, website_url, status, owner_id, distribution_workspaces(name, kind)').order('created_at', { ascending: false }),
    supabase.from('distribution_tasks').select('id, project_id, title, status, distribution_results(link_status, live_url, updated_at)').order('updated_at', { ascending: false }),
    supabase.from('distribution_attribution_events').select('project_id, event_type').gte('created_at', since),
  ]);

  if (entitlementError || projectError || taskError || eventError) {
    throw new Error(entitlementError?.message || projectError?.message || taskError?.message || eventError?.message || 'Unable to load distribution overview.');
  }

  const entitlementSummary = { active: 0, pilot: 0, pro: 0, agency: 0 };
  for (const entitlement of entitlements || []) {
    if (entitlement.status === 'active') entitlementSummary.active += 1;
    const plan = entitlement.plan as 'pilot' | 'pro' | 'agency';
    if (plan === 'pilot' || plan === 'pro' || plan === 'agency') entitlementSummary[plan] += 1;
  }

  const taskByProject = new Map<string, any[]>();
  for (const task of tasks || []) {
    const current = taskByProject.get(task.project_id) || [];
    current.push(task);
    taskByProject.set(task.project_id, current);
  }

  const attributionByProject = new Map<string, Record<string, number>>();
  for (const event of events || []) {
    const current = attributionByProject.get(event.project_id) || {};
    current[event.event_type] = (current[event.event_type] || 0) + 1;
    attributionByProject.set(event.project_id, current);
  }

  const recentIssues: AdminDistributionOverview['recentIssues'] = [];
  const projectRows = (projects || []).map((project: any) => {
    const projectTasks = taskByProject.get(project.id) || [];
    let liveResults = 0;
    let problematicResults = 0;
    for (const task of projectTasks) {
      for (const result of task.distribution_results || []) {
        if (result.link_status === 'live') liveResults += 1;
        if (['removed', 'rejected'].includes(result.link_status)) {
          problematicResults += 1;
          recentIssues.push({
            projectName: project.name,
            title: task.title,
            status: result.link_status,
            liveUrl: result.live_url || null,
            updatedAt: result.updated_at || '',
          });
        }
      }
    }
    const attribution = attributionByProject.get(project.id) || {};
    return {
      id: project.id,
      name: project.name,
      websiteUrl: project.website_url || null,
      status: project.status,
      workspaceName: project.distribution_workspaces?.name || 'Unknown workspace',
      workspaceKind: project.distribution_workspaces?.kind || 'customer',
      ownerId: project.owner_id,
      taskTotal: projectTasks.length,
      taskOpen: projectTasks.filter((task) => !['done', 'skipped'].includes(task.status)).length,
      liveResults,
      problematicResults,
      attribution: {
        visits: attribution.visit || 0,
        signups: attribution.signup || 0,
        submissions: attribution.submit || 0,
        claims: attribution.claim || 0,
        payments: attribution.payment || 0,
      },
    };
  });

  return {
    entitlements: entitlementSummary,
    projects: projectRows,
    recentIssues: recentIssues.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 20),
  };
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { requireAuth } from '@/lib/auth/middleware';
import { isAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

export type DistributionTaskStatus =
  | 'planned'
  | 'in_progress'
  | 'submitted'
  | 'live'
  | 'follow_up'
  | 'done'
  | 'skipped';

export interface DistributionDashboard {
  workspace: { id: string; name: string; kind: string } | null;
  projects: Array<{ id: string; name: string; websiteUrl: string | null; status: string }>;
  project: { id: string; name: string; websiteUrl: string | null } | null;
  channels: Array<{ id: string; name: string; channelType: string; instructions: string | null }>;
  tasks: Array<{
    id: string;
    title: string;
    status: DistributionTaskStatus;
    priority: string;
    taskType: string;
    dueDate: string | null;
    instructions: string | null;
    channelName: string;
    channelType: string;
    liveUrl: string | null;
    linkStatus: string | null;
  }>;
  metrics: { total: number; dueToday: number; live: number; followUp: number };
}

type AccessResult = { user: User; allowed: boolean };

async function getDistributionAccess(): Promise<AccessResult> {
  const user = await requireAuth();
  if (isAdminUser(user)) return { user, allowed: true };

  const supabase = await createClient();
  const { data } = await supabase
    .from('distribution_entitlements')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const notExpired = !data?.current_period_end || new Date(data.current_period_end).getTime() > Date.now();
  return { user, allowed: data?.status === 'active' && notExpired };
}

function normalize(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function ensureDefaultProject(userId: string, email?: string, isOwnProject = false) {
  const supabase = await createClient();
  const { data: existingProject } = await supabase
    .from('distribution_projects')
    .select('id, name, website_url, workspace_id')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingProject) {
    if (isOwnProject && existingProject.name === 'My product') {
      const { data: updatedProject } = await supabase
        .from('distribution_projects')
        .update({
          name: 'AI Best Tool',
          website_url: 'https://aibesttool.com',
          description: 'Track AI Best Tool distribution, editorial mentions, and follow-ups.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProject.id)
        .select('id, name, website_url, workspace_id')
        .single();

      return updatedProject || existingProject;
    }
    return existingProject;
  }

  const workspaceName = email?.split('@')[0] || 'My distribution workspace';
  const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'workspace';
  const { data: workspace, error: workspaceError } = await supabase
    .from('distribution_workspaces')
    .insert({ owner_id: userId, name: workspaceName, slug, kind: 'own' })
    .select('id, name, kind')
    .single();

  if (workspaceError || !workspace) throw new Error(workspaceError?.message || 'Unable to create distribution workspace.');

  const { data: project, error: projectError } = await supabase
    .from('distribution_projects')
    .insert({
      workspace_id: workspace.id,
      owner_id: userId,
      name: 'My product',
      website_url: isOwnProject ? 'https://aibesttool.com' : null,
      description: 'Track human-led distribution, submissions, mentions, and follow-ups.',
    })
    .select('id, name, website_url, workspace_id')
    .single();

  if (projectError || !project) throw new Error(projectError?.message || 'Unable to create distribution project.');
  return project;
}

export async function getDistributionDashboard(projectId?: string): Promise<
  { success: true; access: true; data: DistributionDashboard } | { success: true; access: false; data: null } | { success: false; error: string }
> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: true, access: false, data: null };

    const supabase = await createClient();
    const defaultProject = await ensureDefaultProject(user.id, user.email, isAdminUser(user));
    const { data: projects, error: projectsError } = await supabase
      .from('distribution_projects')
      .select('id, name, website_url, status, workspace_id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (projectsError) throw projectsError;
    const project = (projects || []).find((item: any) => item.id === projectId) || defaultProject;
    const [{ data: workspace }, { data: channels, error: channelError }, { data: tasks, error: taskError }] = await Promise.all([
      supabase.from('distribution_workspaces').select('id, name, kind').eq('id', project.workspace_id).single(),
      supabase
        .from('distribution_channels')
        .select('id, name, channel_type, instructions')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('distribution_tasks')
        .select('id, title, status, priority, task_type, due_date, instructions, distribution_channels(name, channel_type), distribution_results(live_url, link_status, created_at)')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false }),
    ]);

    if (channelError || taskError) throw new Error(channelError?.message || taskError?.message || 'Unable to load distribution data.');

    const today = new Date().toISOString().slice(0, 10);
    const normalizedTasks = (tasks || []).map((task: any) => {
      const latestResult = [...(task.distribution_results || [])].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        taskType: task.task_type,
        dueDate: task.due_date,
        instructions: task.instructions,
        channelName: task.distribution_channels?.name || 'Unknown channel',
        channelType: task.distribution_channels?.channel_type || 'other',
        liveUrl: latestResult?.live_url || null,
        linkStatus: latestResult?.link_status || null,
      };
    });

    return {
      success: true,
      access: true,
      data: {
        workspace,
        projects: (projects || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          websiteUrl: item.website_url,
          status: item.status,
        })),
        project: { id: project.id, name: project.name, websiteUrl: project.website_url },
        channels: (channels || []).map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          channelType: channel.channel_type,
          instructions: channel.instructions,
        })),
        tasks: normalizedTasks,
        metrics: {
          total: normalizedTasks.length,
          dueToday: normalizedTasks.filter((task) => task.dueDate === today && !['done', 'skipped'].includes(task.status)).length,
          live: normalizedTasks.filter((task) => ['live', 'done'].includes(task.status)).length,
          followUp: normalizedTasks.filter((task) => task.status === 'follow_up').length,
        },
      },
    };
  } catch (error) {
    console.error('Distribution dashboard error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to load distribution dashboard.' };
  }
}

export async function createDistributionProject(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const name = normalize(formData.get('name'));
    const websiteUrl = normalize(formData.get('websiteUrl')) || null;
    const locale = normalize(formData.get('locale')) || 'en';
    if (name.length < 2) return { success: false, error: 'Project name is required.' };
    if (websiteUrl) {
      try {
        const parsed = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
        if (!parsed.hostname) return { success: false, error: 'Enter a valid website URL.' };
      } catch {
        return { success: false, error: 'Enter a valid website URL.' };
      }
    }

    const supabase = await createClient();
    const workspaceProject = await ensureDefaultProject(user.id, user.email, isAdminUser(user));
    const { data: project, error } = await supabase
      .from('distribution_projects')
      .insert({
        workspace_id: workspaceProject.workspace_id,
        owner_id: user.id,
        name,
        website_url: websiteUrl,
        description: `Distribution project for ${name}.`,
      })
      .select('id')
      .single();
    if (error || !project) throw error || new Error('Unable to create project.');
    revalidatePath('/[locale]/distribution', 'page');
    redirect(`/${locale}/distribution?project=${project.id}`);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Create distribution project error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create project.' };
  }
}

export async function createDistributionTask(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };

    const title = normalize(formData.get('title'));
    const channelId = normalize(formData.get('channelId'));
    const priority = normalize(formData.get('priority')) || 'p1';
    const dueDate = normalize(formData.get('dueDate')) || null;
    const instructions = normalize(formData.get('instructions')) || null;
    if (title.length < 3 || !channelId) return { success: false, error: 'Add a task title and channel.' };

    const supabase = await createClient();
    const project = await ensureDefaultProject(user.id, user.email, isAdminUser(user));
    const { error } = await supabase.from('distribution_tasks').insert({
      project_id: project.id,
      owner_id: user.id,
      channel_id: channelId,
      title,
      priority: ['p0', 'p1', 'p2'].includes(priority) ? priority : 'p1',
      due_date: dueDate,
      instructions,
    });
    if (error) throw error;
    revalidatePath('/distribution');
    return { success: true };
  } catch (error) {
    console.error('Create distribution task error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create task.' };
  }
}

export async function updateDistributionTaskStatus(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const taskId = normalize(formData.get('taskId'));
    const status = normalize(formData.get('status')) as DistributionTaskStatus;
    if (!taskId || !['planned', 'in_progress', 'submitted', 'live', 'follow_up', 'done', 'skipped'].includes(status)) {
      return { success: false, error: 'Invalid task status.' };
    }
    const supabase = await createClient();
    const { error } = await supabase.from('distribution_tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', taskId);
    if (error) throw error;
    revalidatePath('/distribution');
    return { success: true };
  } catch (error) {
    console.error('Update distribution task error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update task.' };
  }
}

export async function recordDistributionResult(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const taskId = normalize(formData.get('taskId'));
    const liveUrl = normalize(formData.get('liveUrl')) || null;
    const linkStatus = normalize(formData.get('linkStatus')) || 'unknown';
    const notes = normalize(formData.get('notes')) || null;
    if (!taskId) return { success: false, error: 'Task is required.' };
    const supabase = await createClient();
    const { error } = await supabase.from('distribution_results').insert({
      task_id: taskId,
      owner_id: user.id,
      live_url: liveUrl,
      link_status: ['unknown', 'pending', 'live', 'removed', 'nofollow', 'rejected'].includes(linkStatus) ? linkStatus : 'unknown',
      checked_at: liveUrl ? new Date().toISOString() : null,
      notes,
    });
    if (error) throw error;
    if (liveUrl) {
      await supabase.from('distribution_tasks').update({ status: 'live', updated_at: new Date().toISOString() }).eq('id', taskId);
    }
    revalidatePath('/distribution');
    return { success: true };
  } catch (error) {
    console.error('Record distribution result error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to record result.' };
  }
}

export async function seedDistributionStarterTasks(): Promise<{ success: boolean; created?: number; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed || !isAdminUser(user)) return { success: false, error: 'Only the workspace owner can initialize starter tasks.' };

    const supabase = await createClient();
    const project = await ensureDefaultProject(user.id, user.email, true);
    const { count, error: countError } = await supabase
      .from('distribution_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id);
    if (countError) throw countError;
    if ((count || 0) > 0) return { success: true, created: 0 };

    const { data: channels, error: channelError } = await supabase
      .from('distribution_channels')
      .select('id, channel_key, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (channelError) throw channelError;

    const taskTemplates: Record<string, { title: string; taskType: string; instructions: string; priority: string }> = {
      'ai-directories': { title: 'Audit 3 relevant AI directories before submitting', taskType: 'research', instructions: 'Choose directories with a real audience. Record acceptance rules and whether the listing is editorial or paid.', priority: 'p0' },
      'alternative-sites': { title: 'Prepare an honest AI directory alternative pitch', taskType: 'prepare', instructions: 'Explain what AI Best Tool helps users decide better, without copying generic directory claims.', priority: 'p1' },
      'startup-launches': { title: 'Draft an AI Best Tool launch story', taskType: 'prepare', instructions: 'Use the real problem, product evidence, and current SEO recovery context. No inflated traffic claims.', priority: 'p1' },
      communities: { title: 'Find one relevant community question to answer', taskType: 'research', instructions: 'Contribute a useful answer first. Only mention AI Best Tool when it directly helps the question.', priority: 'p0' },
      newsletters: { title: 'Build a shortlist of 5 relevant newsletters', taskType: 'research', instructions: 'Prioritize newsletters read by AI tool buyers, founders, or technical operators.', priority: 'p1' },
      'owned-blog': { title: 'Publish one first-party comparison or experiment', taskType: 'publish', instructions: 'Use real screenshots, dates, test notes, or GSC evidence. Avoid generic AI-written listicles.', priority: 'p0' },
      github: { title: 'Add a useful open-source example or resource', taskType: 'prepare', instructions: 'Create a relevant repository, template, or documentation example. Do not add unrelated links to issues.', priority: 'p2' },
      reddit: { title: 'Answer one genuine Reddit question with disclosure', taskType: 'submit', instructions: 'Find a relevant question, answer it directly, disclose affiliation, and save the post URL for follow-up.', priority: 'p1' },
    };

    const today = new Date();
    const rows = (channels || []).flatMap((channel: any, index) => {
      const template = taskTemplates[channel.channel_key];
      if (!template) return [];
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + index);
      return [{
        project_id: project.id,
        owner_id: user.id,
        channel_id: channel.id,
        title: template.title,
        task_type: template.taskType,
        priority: template.priority,
        due_date: dueDate.toISOString().slice(0, 10),
        instructions: template.instructions,
      }];
    });
    if (!rows.length) return { success: false, error: 'No active distribution channels are available.' };
    const { error } = await supabase.from('distribution_tasks').insert(rows);
    if (error) throw error;
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true, created: rows.length };
  } catch (error) {
    console.error('Seed distribution tasks error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to initialize starter tasks.' };
  }
}

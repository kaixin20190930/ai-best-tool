'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import type { User } from '@supabase/supabase-js';

import { requireAuth } from '@/lib/auth/middleware';
import { isAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { composeDistributionCopyPackage } from '@/lib/services/distribution/composer';
import { buildDistributionDestinationSuggestion } from '@/lib/services/distribution/destination';
import { buildDistributionPreflight } from '@/lib/services/distribution/preflight';
import { buildDistributionChannelPriorityFeedback, scheduleDistributionTasks } from '@/lib/services/distribution/scheduler';
import { buildDistributionTaskDetail, type DistributionTaskDetail } from '@/lib/services/distribution/taskDetail';
import {
  deriveTaskStatusFromLinkResult,
  isDistributionTaskStatus,
  normalizeDistributionTaskStatus,
  type DistributionTaskStatus,
} from '@/lib/services/distribution/taskStateMachine';

export interface DistributionDashboard {
  workspace: { id: string; name: string; kind: string } | null;
  plan: 'pilot' | 'pro' | 'agency';
  projectLimit: number;
  projects: Array<{ id: string; name: string; websiteUrl: string | null; description: string | null; status: string }>;
  project: { id: string; name: string; websiteUrl: string | null; description: string | null } | null;
  channels: Array<{
    id: string;
    name: string;
    channelType: string;
    instructions: string | null;
    copyPackage: {
      title: string;
      titleAlternatives: string[];
      description: string;
      disclosure: string;
      proofPoints: string[];
      requiredFields: string[];
      handoffNotes: string[];
      followUpPrompt: string;
      maxTitleLength: number | null;
      maxDescriptionLength: number | null;
    };
  }>;
  templates: Array<{ channelId: string; titleTemplate: string | null; descriptionTemplate: string | null; maxTitleLength: number | null; maxDescriptionLength: number | null; requiredFields: string[] }>;
  links: Array<{ id: string; name: string; channelName: string; fullUrl: string; createdAt: string }>;
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
  metrics: {
    total: number;
    dueToday: number;
    preparing: number;
    needsAssets: number;
    readyToSubmit: number;
    submitted: number;
    waitingReview: number;
    live: number;
    followUp: number;
    blocked: number;
    attribution: { visits: number; signups: number; submissions: number; claims: number; checkouts: number; payments: number };
  };
  recommendations: Array<{
    id: string;
    title: string;
    status: DistributionTaskStatus;
    priority: string;
    score: number;
    reason: string;
    dueDate: string | null;
    channelName: string;
    channelType: string;
  }>;
  preflight: {
    ready: boolean;
    blockers: string[];
    warnings: string[];
    requiredFields: string[];
    missingFields: string[];
    titleLength: number;
    titleLimit: number | null;
    descriptionLength: number;
    descriptionLimit: number | null;
    summary: string;
  };
  destinationSuggestion: {
    destinationUrl: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string | null;
    linkName: string;
    summary: string;
  };
}

type AccessResult = { user: User; allowed: boolean; plan: 'pilot' | 'pro' | 'agency' };

async function getDistributionAccess(): Promise<AccessResult> {
  const user = await requireAuth();
  if (isAdminUser(user)) return { user, allowed: true, plan: 'agency' };

  const supabase = await createClient();
  const { data } = await supabase
    .from('distribution_entitlements')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const notExpired = !data?.current_period_end || new Date(data.current_period_end).getTime() > Date.now();
  const plan = data?.plan === 'agency' ? 'agency' : data?.plan === 'pro' ? 'pro' : 'pilot';
  return { user, allowed: data?.status === 'active' && notExpired, plan };
}

function getProjectLimit(plan: 'pilot' | 'pro' | 'agency'): number {
  if (plan === 'agency') return 25;
  if (plan === 'pro') return 5;
  return 1;
}

function normalize(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function insertDistributionFollowUpTask(input: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  projectId: string;
  channelId: string;
  sourceTitle: string;
  reason: string;
  dueDate: Date;
}) {
  const title = `Follow up: ${String(input.sourceTitle || '').slice(0, 160)}`;
  const { data: existing } = await input.supabase
    .from('distribution_tasks')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('channel_id', input.channelId)
    .eq('owner_id', input.userId)
    .eq('task_type', 'follow_up')
    .eq('title', title)
    .maybeSingle();
  if (existing) {
    return { createdTaskId: null, skipped: true as const };
  }

  const { data: created, error } = await input.supabase
    .from('distribution_tasks')
    .insert({
      project_id: input.projectId,
      owner_id: input.userId,
      channel_id: input.channelId,
      title,
      task_type: 'follow_up',
      status: 'planned',
      priority: 'p1',
      due_date: input.dueDate.toISOString().slice(0, 10),
      instructions: input.reason,
    })
    .select('id')
    .single();
  if (error) throw error;

  return { createdTaskId: created?.id || null, skipped: false as const };
}

async function ensureDefaultProject(userId: string, email?: string, isOwnProject = false) {
  const supabase = await createClient();
  const { data: existingProject } = await supabase
    .from('distribution_projects')
    .select('id, name, website_url, description, workspace_id')
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
        .select('id, name, website_url, description, workspace_id')
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
    const { user, allowed, plan } = await getDistributionAccess();
    if (!allowed) return { success: true, access: false, data: null };

    const supabase = await createClient();
    const defaultProject = await ensureDefaultProject(user.id, user.email, isAdminUser(user));
    const { data: projects, error: projectsError } = await supabase
      .from('distribution_projects')
      .select('id, name, website_url, description, status, workspace_id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (projectsError) throw projectsError;
    const project = (projects || []).find((item: any) => item.id === projectId) || defaultProject;
    const projectDescription = (project as { description?: string | null } | null)?.description || null;
    const [{ data: workspace }, { data: channels, error: channelError }, { data: templates, error: templateError }, { data: links, error: linkError }, { data: tasks, error: taskError }, { data: attributionEvents, error: attributionError }] = await Promise.all([
      supabase.from('distribution_workspaces').select('id, name, kind').eq('id', project.workspace_id).single(),
      supabase
        .from('distribution_channels')
        .select('id, channel_key, name, channel_type, instructions')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase.from('distribution_channel_templates').select('channel_id, title_template, description_template, max_title_length, max_description_length, required_fields'),
      supabase.from('distribution_links').select('id, name, full_url, created_at, distribution_channels(name)').eq('project_id', project.id).order('created_at', { ascending: false }).limit(20),
      supabase
        .from('distribution_tasks')
        .select('id, title, status, priority, task_type, due_date, instructions, distribution_channels(name, channel_type), distribution_results(live_url, link_status, created_at)')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('distribution_attribution_events')
        .select('event_type')
        .eq('project_id', project.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    if (channelError || templateError || linkError || taskError) throw new Error(channelError?.message || templateError?.message || linkError?.message || taskError?.message || 'Unable to load distribution data.');

    const today = new Date().toISOString().slice(0, 10);
    const normalizedTasks = (tasks || []).map((task: any) => {
      const latestResult = [...(task.distribution_results || [])].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
      const status = normalizeDistributionTaskStatus(task.status) || 'planned';
      return {
        id: task.id,
        title: task.title,
        status,
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
    const channelAdjustments = buildDistributionChannelPriorityFeedback(normalizedTasks);
    const sortedRecommendations = scheduleDistributionTasks(normalizedTasks, channelAdjustments).slice(0, 3);
    const firstChannel = (channels || [])[0] || null;
    const firstTemplate = firstChannel ? (templates || []).find((template: any) => template.channel_id === firstChannel.id) || null : null;
    const firstCopyPackage = firstChannel
      ? composeDistributionCopyPackage({
          productName: project.name,
          projectDescription,
          projectUrl: project.website_url || null,
          channelName: firstChannel.name,
          channelType: firstChannel.channel_type,
          template: firstTemplate
            ? {
                titleTemplate: firstTemplate.title_template,
                descriptionTemplate: firstTemplate.description_template,
                maxTitleLength: firstTemplate.max_title_length,
                maxDescriptionLength: firstTemplate.max_description_length,
                requiredFields: firstTemplate.required_fields || [],
              }
            : null,
          proofPoint: projectDescription || `${project.name} is available at ${project.website_url || 'its official site'}.`,
          audience: firstChannel.channel_type === 'community' ? 'community readers' : 'the intended audience',
          valueProp: firstChannel.channel_type === 'alternative' ? `compare ${project.name} clearly` : `share ${project.name} with ${firstChannel.name.toLowerCase()}`,
        })
      : null;
    const firstPreflight = firstCopyPackage
      ? buildDistributionPreflight({
          copyPackage: firstCopyPackage,
          projectUrl: project.website_url || null,
          projectDescription,
          channelName: firstChannel?.name || 'target channel',
          channelType: firstChannel?.channel_type || 'other',
        })
      : null;
    const firstDestinationSuggestion = firstChannel
      ? buildDistributionDestinationSuggestion({
          projectUrl: project.website_url || null,
          channelKey: firstChannel.channel_key || firstChannel.id,
          channelName: firstChannel.name,
          projectName: project.name,
          campaign: `${project.name}-${firstChannel.name}`,
          content: projectDescription,
        })
      : null;

    return {
      success: true,
      access: true,
      data: {
        workspace,
        plan,
        projectLimit: getProjectLimit(plan),
        projects: (projects || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          websiteUrl: item.website_url,
          description: item.description || null,
          status: item.status,
        })),
        project: { id: project.id, name: project.name, websiteUrl: project.website_url, description: projectDescription },
        channels: (channels || []).map((channel: any) => {
          const template = (templates || []).find((item: any) => item.channel_id === channel.id) || null;
          return {
            id: channel.id,
            name: channel.name,
            channelType: channel.channel_type,
            instructions: channel.instructions,
            copyPackage: composeDistributionCopyPackage({
              productName: project.name,
              projectDescription,
              projectUrl: project.website_url || null,
              channelName: channel.name,
              channelType: channel.channel_type,
              template: template
                ? {
                    titleTemplate: template.title_template,
                    descriptionTemplate: template.description_template,
                    maxTitleLength: template.max_title_length,
                    maxDescriptionLength: template.max_description_length,
                    requiredFields: template.required_fields || [],
                  }
                : null,
              proofPoint: projectDescription || `${project.name} is available at ${project.website_url || 'its official site'}.`,
              audience: channel.channel_type === 'community' ? 'community readers' : 'the intended audience',
              valueProp: channel.channel_type === 'alternative' ? `compare ${project.name} clearly` : `share ${project.name} with ${channel.name.toLowerCase()}`,
            }),
          };
        }),
        templates: (templates || []).map((template: any) => ({
          channelId: template.channel_id,
          titleTemplate: template.title_template,
          descriptionTemplate: template.description_template,
          maxTitleLength: template.max_title_length,
          maxDescriptionLength: template.max_description_length,
          requiredFields: template.required_fields || [],
        })),
        links: (links || []).map((link: any) => ({
          id: link.id,
          name: link.name,
          channelName: link.distribution_channels?.name || 'Unknown channel',
          fullUrl: link.full_url,
          createdAt: link.created_at,
        })),
        tasks: normalizedTasks,
        metrics: {
          total: normalizedTasks.length,
          dueToday: normalizedTasks.filter((task) => task.dueDate === today && !['done', 'skipped'].includes(task.status)).length,
          preparing: normalizedTasks.filter((task) => task.status === 'in_progress').length,
          needsAssets: normalizedTasks.filter((task) => task.status === 'needs_assets').length,
          readyToSubmit: normalizedTasks.filter((task) => task.status === 'ready_to_submit').length,
          submitted: normalizedTasks.filter((task) => task.status === 'submitted').length,
          waitingReview: normalizedTasks.filter((task) => task.status === 'waiting_review').length,
          live: normalizedTasks.filter((task) => task.status === 'live').length,
          followUp: normalizedTasks.filter((task) => task.status === 'follow_up').length,
          blocked: normalizedTasks.filter((task) => task.status === 'blocked').length,
          attribution: attributionError
            ? { visits: 0, signups: 0, submissions: 0, claims: 0, checkouts: 0, payments: 0 }
            : {
                visits: (attributionEvents || []).filter((event: any) => event.event_type === 'visit').length,
                signups: (attributionEvents || []).filter((event: any) => event.event_type === 'signup').length,
                submissions: (attributionEvents || []).filter((event: any) => event.event_type === 'submit').length,
                claims: (attributionEvents || []).filter((event: any) => event.event_type === 'claim').length,
                checkouts: (attributionEvents || []).filter((event: any) => event.event_type === 'checkout').length,
                payments: (attributionEvents || []).filter((event: any) => event.event_type === 'payment').length,
              },
        },
        recommendations: sortedRecommendations,
        preflight: firstPreflight || {
          ready: false,
          blockers: ['No target channel available.'],
          warnings: [],
          requiredFields: [],
          missingFields: [],
          titleLength: 0,
          titleLimit: null,
          descriptionLength: 0,
          descriptionLimit: null,
          summary: 'No preflight target could be derived.',
        },
        destinationSuggestion:
          firstDestinationSuggestion || {
            destinationUrl: project.website_url || '',
            utmSource: 'distribution',
            utmMedium: 'distribution',
            utmCampaign: project.name,
            utmContent: null,
            linkName: project.name,
            summary: 'No destination suggestion could be derived.',
          },
      },
    };
  } catch (error) {
    console.error('Distribution dashboard error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to load distribution dashboard.' };
  }
}

export async function createDistributionUtmLink(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    const channelId = normalize(formData.get('channelId'));
    const name = normalize(formData.get('name'));
    const campaign = normalize(formData.get('campaign'));
    const content = normalize(formData.get('content')) || null;
    if (!projectId || !channelId || !name || !campaign) return { success: false, error: 'Project, channel, link name, and campaign are required.' };

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase.from('distribution_projects').select('id, website_url').eq('id', projectId).eq('owner_id', user.id).single();
    if (projectError || !project?.website_url) return { success: false, error: 'Add a website URL to this project before creating a tracked link.' };
    const { data: channel, error: channelError } = await supabase.from('distribution_channels').select('id, channel_key').eq('id', channelId).eq('is_active', true).single();
    if (channelError || !channel) return { success: false, error: 'Choose an active distribution channel.' };

    const linkId = randomUUID();
    const destinationUrl = new URL(project.website_url);
    const source = channel.channel_key.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    destinationUrl.searchParams.set('utm_source', source);
    destinationUrl.searchParams.set('utm_medium', 'distribution');
    destinationUrl.searchParams.set('utm_campaign', campaign.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 120));
    if (content) destinationUrl.searchParams.set('utm_content', content.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 120));
    destinationUrl.searchParams.set('abt_dist_link', linkId);
    const { error } = await supabase.from('distribution_links').insert({
      id: linkId,
      project_id: project.id,
      owner_id: user.id,
      channel_id: channel.id,
      name,
      destination_url: project.website_url,
      full_url: destinationUrl.toString(),
      utm_source: source,
      utm_medium: 'distribution',
      utm_campaign: campaign,
      utm_content: content,
    });
    if (error) throw error;
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true };
  } catch (error) {
    console.error('Create distribution UTM link error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create tracked link.' };
  }
}

export async function createDistributionProject(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed, plan } = await getDistributionAccess();
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
    const { count, error: countError } = await supabase
      .from('distribution_projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .neq('status', 'archived');
    if (countError) throw countError;
    if ((count || 0) >= getProjectLimit(plan)) return { success: false, error: `Your current plan supports up to ${getProjectLimit(plan)} active projects.` };
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
    const status = normalizeDistributionTaskStatus(normalize(formData.get('status')));
    if (!taskId || !status || !isDistributionTaskStatus(status)) {
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
    const { data: task, error: taskError } = await supabase.from('distribution_tasks').select('id, title, status, project_id, channel_id').eq('id', taskId).maybeSingle();
    if (taskError) throw taskError;
    const { error } = await supabase.from('distribution_results').insert({
      task_id: taskId,
      owner_id: user.id,
      live_url: liveUrl,
      link_status: ['unknown', 'pending', 'live', 'removed', 'nofollow', 'rejected'].includes(linkStatus) ? linkStatus : 'unknown',
      checked_at: liveUrl ? new Date().toISOString() : null,
      notes,
    });
    if (error) throw error;
    const nextStatus = deriveTaskStatusFromLinkResult({ currentStatus: task?.status || 'planned', liveUrl, linkStatus });
    await supabase.from('distribution_tasks').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', taskId);
    if (task && ['live', 'waiting_review'].includes(nextStatus)) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 3);
      await insertDistributionFollowUpTask({
        supabase,
        userId: user.id,
        projectId: String((task as { project_id?: string }).project_id || ''),
        channelId: String((task as { channel_id?: string }).channel_id || ''),
        sourceTitle: String((task as { title?: string }).title || taskId),
        reason: notes || 'Check the live listing, capture evidence, and decide whether any follow-up is needed.',
        dueDate: followUpDate,
      });
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

    const taskTemplates: Record<string, { title: string; taskType: string; instructions: string; priority: string; status: DistributionTaskStatus }> = {
      'ai-directories': { title: 'Audit 3 relevant AI directories before submitting', taskType: 'research', instructions: 'Choose directories with a real audience. Record acceptance rules and whether the listing is editorial or paid.', priority: 'p0', status: 'planned' },
      'alternative-sites': { title: 'Prepare an honest AI directory alternative pitch', taskType: 'prepare', instructions: 'Explain what AI Best Tool helps users decide better, without copying generic directory claims.', priority: 'p1', status: 'in_progress' },
      'startup-launches': { title: 'Draft an AI Best Tool launch story', taskType: 'prepare', instructions: 'Use the real problem, product evidence, and current SEO recovery context. No inflated traffic claims.', priority: 'p1', status: 'ready_to_submit' },
      communities: { title: 'Find one relevant community question to answer', taskType: 'research', instructions: 'Contribute a useful answer first. Only mention AI Best Tool when it directly helps the question.', priority: 'p0', status: 'planned' },
      newsletters: { title: 'Build a shortlist of 5 relevant newsletters', taskType: 'research', instructions: 'Prioritize newsletters read by AI tool buyers, founders, or technical operators.', priority: 'p1', status: 'needs_assets' },
      'owned-blog': { title: 'Publish one first-party comparison or experiment', taskType: 'publish', instructions: 'Use real screenshots, dates, test notes, or GSC evidence. Avoid generic AI-written listicles.', priority: 'p0', status: 'in_progress' },
      github: { title: 'Add a useful open-source example or resource', taskType: 'prepare', instructions: 'Create a relevant repository, template, or documentation example. Do not add unrelated links to issues.', priority: 'p2', status: 'blocked' },
      reddit: { title: 'Answer one genuine Reddit question with disclosure', taskType: 'submit', instructions: 'Find a relevant question, answer it directly, disclose affiliation, and save the post URL for follow-up.', priority: 'p1', status: 'submitted' },
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
        status: template.status,
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

export async function getDistributionTaskDetail(taskId: string): Promise<{ success: true; access: true; data: DistributionTaskDetail } | { success: true; access: false; data: null } | { success: false; error: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: true, access: false, data: null };
    const supabase = await createClient();
    const normalizedTaskId = normalize(taskId);
    if (!normalizedTaskId) return { success: false, error: 'Task id is required.' };

    const { data: task, error: taskError } = await supabase
      .from('distribution_tasks')
      .select('id, title, status, priority, task_type, due_date, instructions, notes, updated_at, project_id, channel_id, distribution_projects(id, name, website_url, description), distribution_channels(id, channel_key, name, channel_type, instructions), distribution_results(live_url, link_status, notes, checked_at, created_at)')
      .eq('id', normalizedTaskId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!task) return { success: false, error: 'Task not found.' };

    const { data: templates, error: templatesError } = await supabase
      .from('distribution_channel_templates')
      .select('channel_id, title_template, description_template, max_title_length, max_description_length, required_fields');
    if (templatesError) throw templatesError;
    const { data: queue, error: queueError } = await supabase
      .from('distribution_tasks')
      .select('id, title, status, priority, due_date, distribution_channels(name, channel_type)')
      .eq('project_id', task.project_id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (queueError) throw queueError;

    const projectRow = Array.isArray(task.distribution_projects) ? task.distribution_projects[0] || {} : task.distribution_projects || {};
    const channelRow = Array.isArray(task.distribution_channels) ? task.distribution_channels[0] || {} : task.distribution_channels || {};
    const template = (templates || []).find((item: any) => item.channel_id === task.channel_id) || null;
    const recentResult = Array.isArray(task.distribution_results) && task.distribution_results.length > 0 ? [...task.distribution_results].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))[0] : null;
    const detail = buildDistributionTaskDetail({
      task: {
        id: String(task.id),
        title: String(task.title || ''),
        status: normalizeDistributionTaskStatus(String(task.status || 'planned')) || 'planned',
        priority: String(task.priority || 'p1'),
        taskType: String(task.task_type || 'submit'),
        dueDate: (task.due_date as string | null | undefined) || null,
        instructions: (task.instructions as string | null | undefined) || null,
        notes: (task.notes as string | null | undefined) || null,
        liveUrl: recentResult?.live_url || null,
        linkStatus: recentResult?.link_status || null,
        updatedAt: (task.updated_at as string | null | undefined) || null,
      },
      project: {
        id: String((projectRow as { id?: string }).id || task.project_id),
        name: String((projectRow as { name?: string }).name || ''),
        websiteUrl: ((projectRow as { website_url?: string | null }).website_url as string | null | undefined) || null,
        description: ((projectRow as { description?: string | null }).description as string | null | undefined) || null,
      },
      channel: {
        id: String((channelRow as { id?: string }).id || task.channel_id),
        name: String((channelRow as { name?: string }).name || 'Unknown channel'),
        channelType: String((channelRow as { channel_type?: string }).channel_type || 'other'),
        instructions: ((channelRow as { instructions?: string | null }).instructions as string | null | undefined) || null,
        template: template
          ? {
              titleTemplate: template.title_template,
              descriptionTemplate: template.description_template,
              maxTitleLength: template.max_title_length,
              maxDescriptionLength: template.max_description_length,
              requiredFields: template.required_fields || [],
            }
          : null,
      },
      recentResult: recentResult
        ? {
            liveUrl: recentResult.live_url || null,
            linkStatus: recentResult.link_status || null,
            notes: recentResult.notes || null,
            checkedAt: recentResult.checked_at || null,
          }
        : null,
      queue: (queue || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        status: normalizeDistributionTaskStatus(item.status) || 'planned',
        priority: item.priority,
        dueDate: item.due_date,
        channelName: item.distribution_channels?.name || 'Unknown channel',
        channelType: item.distribution_channels?.channel_type || 'other',
      })),
    });

    return { success: true, access: true, data: detail };
  } catch (error) {
    console.error('Get distribution task detail error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to load task detail.' };
  }
}

export async function createDistributionFollowUpTask(formData: FormData): Promise<{ success: boolean; error?: string; createdTaskId?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const taskId = normalize(formData.get('taskId'));
    const reason = normalize(formData.get('reason')) || 'Follow up on the previous submission.';
    const days = Number.parseInt(normalize(formData.get('days')) || '3', 10);
    if (!taskId) return { success: false, error: 'Task is required.' };
    const supabase = await createClient();
    const { data: task, error: taskError } = await supabase
      .from('distribution_tasks')
      .select('id, project_id, channel_id, title, status')
      .eq('id', taskId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!task) return { success: false, error: 'Task not found.' };
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + (Number.isFinite(days) && days > 0 ? days : 3));
    const result = await insertDistributionFollowUpTask({
      supabase,
      userId: user.id,
      projectId: task.project_id,
      channelId: task.channel_id,
      sourceTitle: String(task.title || ''),
      reason,
      dueDate: followUpDate,
    });
    revalidatePath('/distribution');
    return { success: true, createdTaskId: result.createdTaskId || undefined };
  } catch (error) {
    console.error('Create distribution follow-up task error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create follow-up task.' };
  }
}

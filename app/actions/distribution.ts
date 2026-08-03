'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import type { User } from '@supabase/supabase-js';

import { isAdminUser } from '@/lib/auth/admin';
import { requireAuth } from '@/lib/auth/middleware';
import { queryDatabase } from '@/lib/services/database';
import { composeDistributionCopyPackage } from '@/lib/services/distribution/composer';
import { buildDistributionDestinationSuggestion } from '@/lib/services/distribution/destination';
import { buildDistributionPreflight } from '@/lib/services/distribution/preflight';
import {
  composeDistributionPackage,
  type DistributionTargetRequirementInput,
} from '@/lib/services/distribution/packageComposer';
import {
  canReuseDistributionListing,
  inferDistributionProductType,
  normalizeDistributionDomain,
  type DistributionListingCandidate,
  type DistributionProductType,
} from '@/lib/services/distribution/listingBridge';
import {
  buildDistributionChannelPriorityFeedback,
  scheduleDistributionTasks,
} from '@/lib/services/distribution/scheduler';
import {
  recommendDistributionTargets,
  type DistributionTargetRecommendation,
} from '@/lib/services/distribution/targetRecommendation';
import { buildDistributionTaskDetail, type DistributionTaskDetail } from '@/lib/services/distribution/taskDetail';
import {
  deriveTaskStatusFromLinkResult,
  isDistributionTaskStatus,
  normalizeDistributionTaskStatus,
  type DistributionTaskStatus,
} from '@/lib/services/distribution/taskStateMachine';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface DistributionDashboard {
  workspace: { id: string; name: string; kind: string } | null;
  plan: 'pilot' | 'pro' | 'agency';
  projectLimit: number;
  projects: Array<{ id: string; name: string; websiteUrl: string | null; description: string | null; status: string }>;
  project: {
    id: string;
    name: string;
    websiteUrl: string | null;
    description: string | null;
    primaryGoal: string | null;
    weeklyCapacity: number | null;
    budgetPreference: string | null;
    onboardingStatus: string;
    factsConfirmedAt: string | null;
    productType: DistributionProductType | null;
    sourceToolId: string | null;
    listingImportedAt: string | null;
  } | null;
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
  templates: Array<{
    channelId: string;
    titleTemplate: string | null;
    descriptionTemplate: string | null;
    maxTitleLength: number | null;
    maxDescriptionLength: number | null;
    requiredFields: string[];
  }>;
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
    targetId: string | null;
    packageStatus: string | null;
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
    attribution: {
      visits: number;
      signups: number;
      submissions: number;
      claims: number;
      checkouts: number;
      payments: number;
    };
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
  targetRecommendations: Array<DistributionTargetRecommendation & { opportunityStatus: string | null }>;
  targetRegistryUnavailable: boolean;
  assets: Array<{
    id: string;
    assetType: string;
    name: string;
    url: string;
    width: number | null;
    height: number | null;
    status: string;
    verifiedAt: string | null;
    source: string | null;
    sourceToolId: string | null;
  }>;
  listingCandidates: DistributionListingCandidate[];
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

function getDistributionActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return fallback;
}

function localizedCatalogText(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const record = value as Record<string, unknown>;
  for (const key of ['en', 'cn', 'zh']) {
    const localizedValue = record[key];
    if (typeof localizedValue === 'string' && localizedValue.trim()) return localizedValue.trim();
  }
  const first = Object.values(record).find((item) => typeof item === 'string' && item.trim());
  return typeof first === 'string' ? first.trim() : '';
}

async function loadOwnedCatalogListings(input: {
  userId: string;
  email: string | null | undefined;
  projectUrl?: string | null;
  isAdmin: boolean;
}): Promise<DistributionListingCandidate[]> {
  const supabase = createAdminClient();
  const email = String(input.email || '').trim().toLowerCase();
  const projectDomain = normalizeDistributionDomain(input.projectUrl);
  const selectFields =
    'id, name, title, content, url, image_url, thumbnail_url, tags, pricing, screenshots, submitted_by, features, categories(name)';
  const queries = input.isAdmin
    ? projectDomain
      ? [
          supabase
            .from('tools')
            .select(selectFields)
            .in('status', ['published', 'pending'])
            .ilike('url', `%${projectDomain}%`)
            .limit(20),
        ]
      : []
    : [
        supabase
          .from('tools')
          .select(selectFields)
          .in('status', ['published', 'pending'])
          .eq('submitted_by', input.userId)
          .limit(50),
        ...(email
          ? [
              supabase
                .from('tools')
                .select(selectFields)
                .in('status', ['published', 'pending'])
                .contains('features', { submission: { submittedByEmail: email } })
                .limit(50),
            ]
          : []),
      ];
  const queryResults = await Promise.all(queries);
  const failedQueries = queryResults.filter((result) => result.error);
  for (const failedQuery of failedQueries) console.error('Catalog listing query unavailable:', failedQuery.error);
  const rowById = new Map<string, any>();
  for (const result of queryResults) {
    for (const row of result.data || []) rowById.set(String(row.id), row);
  }
  const rows = Array.from(rowById.values());
  return rows
    .map((row) => {
      const description = localizedCatalogText(row.content);
      const name = localizedCatalogText(row.title) || row.name;
      const categoryRow = Array.isArray(row.categories) ? row.categories[0] || null : row.categories;
      const categoryName = localizedCatalogText(categoryRow?.name) || null;
      const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
      const submittedByEmail = String(row.features?.submission?.submittedByEmail || '').trim().toLowerCase();
      const ownershipSource: DistributionListingCandidate['ownershipSource'] =
        row.submitted_by === input.userId
          ? 'submitted'
          : email && submittedByEmail === email
            ? 'submission_email'
            : 'admin_domain';
      return {
        id: row.id,
        name,
        websiteUrl: row.url,
        description,
        categoryName,
        tags,
        pricing: row.pricing || null,
        imageUrl: row.image_url || null,
        thumbnailUrl: row.thumbnail_url || null,
        screenshots: Array.isArray(row.screenshots) ? row.screenshots.map(String).filter(Boolean) : [],
        productType: inferDistributionProductType({
          categoryName,
          tags,
          name,
          description,
        }),
        ownershipSource,
        exactDomainMatch:
          Boolean(projectDomain) && normalizeDistributionDomain(row.url) === projectDomain,
        canReuse: canReuseDistributionListing({
          isAdmin: input.isAdmin,
          userId: input.userId,
          email,
          projectUrl: input.projectUrl,
          listingUrl: row.url,
          submittedBy: row.submitted_by,
          submittedByEmail,
        }),
      };
    })
    .filter((listing) => listing.canReuse)
    .map(({ canReuse: _canReuse, ...listing }) => listing)
    .sort((a, b) => Number(b.exactDomainMatch) - Number(a.exactDomainMatch) || a.name.localeCompare(b.name));
}

function dateAfterDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

async function scheduleDistributionReminders(input: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  taskId: string;
  projectId: string;
  milestones: Array<{ type: string; days: number }>;
}) {
  if (!input.milestones.length) return;
  const reminderTypes = input.milestones.map((item) => item.type);
  const { error: cancelError } = await input.supabase
    .from('distribution_reminders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('task_id', input.taskId)
    .eq('owner_id', input.userId)
    .eq('status', 'scheduled')
    .in('reminder_type', reminderTypes);
  if (cancelError) throw cancelError;
  const { error } = await input.supabase.from('distribution_reminders').insert(
    input.milestones.map((milestone) => ({
      task_id: input.taskId,
      project_id: input.projectId,
      owner_id: input.userId,
      reminder_type: milestone.type,
      scheduled_at: dateAfterDays(milestone.days),
      status: 'scheduled',
      delivery_channel: 'in_app',
      metadata: { daysAfterEvent: milestone.days },
    })),
  );
  if (error) throw error;
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
    .select(
      'id, name, website_url, description, workspace_id, primary_goal, weekly_capacity, budget_preference, onboarding_status, facts_confirmed_at, source_tool_id, product_type, listing_imported_at',
    )
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
        .select(
          'id, name, website_url, description, workspace_id, primary_goal, weekly_capacity, budget_preference, onboarding_status, facts_confirmed_at, source_tool_id, product_type, listing_imported_at',
        )
        .single();

      return updatedProject || existingProject;
    }
    return existingProject;
  }

  const workspaceName = email?.split('@')[0] || 'My distribution workspace';
  const slug =
    workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'workspace';
  const { data: workspace, error: workspaceError } = await supabase
    .from('distribution_workspaces')
    .insert({ owner_id: userId, name: workspaceName, slug, kind: 'own' })
    .select('id, name, kind')
    .single();

  if (workspaceError || !workspace)
    throw new Error(workspaceError?.message || 'Unable to create distribution workspace.');

  const { data: project, error: projectError } = await supabase
    .from('distribution_projects')
    .insert({
      workspace_id: workspace.id,
      owner_id: userId,
      name: 'My product',
      website_url: isOwnProject ? 'https://aibesttool.com' : null,
      description: 'Track human-led distribution, submissions, mentions, and follow-ups.',
    })
    .select(
      'id, name, website_url, description, workspace_id, primary_goal, weekly_capacity, budget_preference, onboarding_status, facts_confirmed_at, source_tool_id, product_type, listing_imported_at',
    )
    .single();

  if (projectError || !project) throw new Error(projectError?.message || 'Unable to create distribution project.');
  return project;
}

export async function getDistributionDashboard(
  projectId?: string,
): Promise<
  | { success: true; access: true; data: DistributionDashboard }
  | { success: true; access: false; data: null }
  | { success: false; error: string }
> {
  try {
    const { user, allowed, plan } = await getDistributionAccess();
    if (!allowed) return { success: true, access: false, data: null };

    const supabase = await createClient();
    const defaultProject = await ensureDefaultProject(user.id, user.email, isAdminUser(user));
    const { data: projects, error: projectsError } = await supabase
      .from('distribution_projects')
      .select(
        'id, name, website_url, description, status, workspace_id, primary_goal, weekly_capacity, budget_preference, onboarding_status, facts_confirmed_at, source_tool_id, product_type, listing_imported_at',
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (projectsError) throw projectsError;
    const project = (projects || []).find((item: any) => item.id === projectId) || defaultProject;
    const projectDescription = (project as { description?: string | null } | null)?.description || null;
    let targetRegistryUnavailable = false;
    const [
      { data: workspace },
      { data: channels, error: channelError },
      { data: templates, error: templateError },
      { data: links, error: linkError },
      { data: tasks, error: taskError },
      { data: attributionEvents, error: attributionError },
    ] = await Promise.all([
      supabase.from('distribution_workspaces').select('id, name, kind').eq('id', project.workspace_id).single(),
      supabase
        .from('distribution_channels')
        .select('id, channel_key, name, channel_type, instructions')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('distribution_channel_templates')
        .select(
          'channel_id, title_template, description_template, max_title_length, max_description_length, required_fields',
        ),
      supabase
        .from('distribution_links')
        .select('id, name, full_url, created_at, distribution_channels(name)')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('distribution_tasks')
        .select(
          'id, title, status, priority, task_type, due_date, instructions, target_id, distribution_channels(name, channel_type), distribution_results(live_url, link_status, created_at)',
        )
        .eq('project_id', project.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('distribution_attribution_events')
        .select('event_type')
        .eq('project_id', project.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    if (channelError || templateError || linkError || taskError)
      throw new Error(
        channelError?.message ||
          templateError?.message ||
          linkError?.message ||
          taskError?.message ||
          'Unable to load distribution data.',
      );

    const [
      targetRows,
      { data: projectTargetRows, error: projectTargetError },
      { data: projectAssetRows, error: projectAssetError },
      { data: projectPackageRows, error: projectPackageError },
      listingCandidates,
    ] = await Promise.all([
      queryDatabase<{
        id: string;
        channel_id: string;
        name: string;
        homepage_url: string;
        submission_url: string | null;
        registration_url: string | null;
        pricing_url: string | null;
        audience: string | null;
        requires_account: boolean;
        requires_payment: boolean;
        requires_captcha: boolean;
        requires_backlink: boolean;
        editorial_review: boolean;
        expected_review_days: number | null;
        confidence: number;
        channel_name: string;
        channel_key: string;
        channel_type: string;
      }>(`
        select
          target.id, target.channel_id, target.name, target.homepage_url, target.submission_url,
          target.registration_url, target.pricing_url, target.audience, target.requires_account,
          target.requires_payment, target.requires_captcha, target.requires_backlink,
          target.editorial_review, target.expected_review_days, target.confidence,
          channel.name as channel_name, channel.channel_key, channel.channel_type
        from distribution_targets target
        join distribution_channels channel on channel.id = target.channel_id
        where target.target_status = 'active'
        order by target.confidence desc, target.name asc
        limit 100
      `).catch((error) => {
        console.error('Distribution target registry unavailable:', error);
        targetRegistryUnavailable = true;
        return [];
      }),
      supabase
        .from('distribution_project_targets')
        .select('id, target_id, opportunity_status, match_score, estimated_minutes')
        .eq('project_id', project.id)
        .eq('owner_id', user.id),
      supabase
        .from('distribution_project_assets')
        .select('id, asset_type, name, source_url, stored_url, width, height, status, verified_at, metadata')
        .eq('project_id', project.id)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('distribution_packages')
        .select('task_id, generation_status, updated_at')
        .eq('project_id', project.id)
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false }),
      loadOwnedCatalogListings({
        userId: user.id,
        email: user.email,
        projectUrl: project.website_url,
        isAdmin: isAdminUser(user),
      }),
    ]);
    if (projectTargetError || projectAssetError || projectPackageError)
      throw new Error(
        projectTargetError?.message ||
          projectAssetError?.message ||
          projectPackageError?.message ||
          'Unable to load distribution project data.',
      );
    const projectTargetByTargetId = new Map((projectTargetRows || []).map((row: any) => [String(row.target_id), row]));
    const targetRecommendations = recommendDistributionTargets(
      (targetRows || []).map((target: any) => ({
        id: String(target.id),
        channelId: String(target.channel_key),
        name: String(target.name || ''),
        channelName: String(target.channel_name || 'Other'),
        channelType: String(target.channel_type || 'other'),
        homepageUrl: String(target.homepage_url || ''),
        submissionUrl: target.submission_url || null,
        registrationUrl: target.registration_url || null,
        pricingUrl: target.pricing_url || null,
        audience: target.audience || null,
        requiresAccount: Boolean(target.requires_account),
        requiresPayment: Boolean(target.requires_payment),
        requiresCaptcha: Boolean(target.requires_captcha),
        requiresBacklink: Boolean(target.requires_backlink),
        editorialReview: Boolean(target.editorial_review),
        expectedReviewDays:
          target.expected_review_days === null || target.expected_review_days === undefined
            ? null
            : Number(target.expected_review_days),
        confidence: Number(target.confidence || 0),
      })),
      {
        primaryGoal: project.primary_goal || null,
        budgetPreference: project.budget_preference || null,
        productType: (project.product_type as DistributionProductType | null) || null,
      },
    ).map((target) => ({
      ...target,
      opportunityStatus: projectTargetByTargetId.get(target.id)?.opportunity_status || null,
    }));

    const today = new Date().toISOString().slice(0, 10);
    const packageStatusByTaskId = new Map<string, string>();
    for (const packageRow of projectPackageRows || []) {
      const packageTaskId = String(packageRow.task_id || '');
      if (packageTaskId && !packageStatusByTaskId.has(packageTaskId)) {
        packageStatusByTaskId.set(packageTaskId, String(packageRow.generation_status || 'pending'));
      }
    }
    const normalizedTasks = (tasks || []).map((task: any) => {
      const latestResult = [...(task.distribution_results || [])].sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
      )[0];
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
        targetId: task.target_id || null,
        packageStatus: packageStatusByTaskId.get(String(task.id)) || null,
      };
    });
    const channelAdjustments = buildDistributionChannelPriorityFeedback(normalizedTasks);
    const sortedRecommendations = scheduleDistributionTasks(normalizedTasks, channelAdjustments).slice(0, 3);
    const firstChannel = (channels || [])[0] || null;
    const firstTemplate = firstChannel
      ? (templates || []).find((template: any) => template.channel_id === firstChannel.id) || null
      : null;
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
          proofPoint:
            projectDescription || `${project.name} is available at ${project.website_url || 'its official site'}.`,
          audience: firstChannel.channel_type === 'community' ? 'community readers' : 'the intended audience',
          valueProp:
            firstChannel.channel_type === 'alternative'
              ? `compare ${project.name} clearly`
              : `share ${project.name} with ${firstChannel.name.toLowerCase()}`,
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
        project: {
          id: project.id,
          name: project.name,
          websiteUrl: project.website_url,
          description: projectDescription,
          primaryGoal: project.primary_goal || null,
          weeklyCapacity:
            project.weekly_capacity === null || project.weekly_capacity === undefined
              ? null
              : Number(project.weekly_capacity),
          budgetPreference: project.budget_preference || null,
          onboardingStatus: project.onboarding_status || 'not_started',
          factsConfirmedAt: project.facts_confirmed_at || null,
          productType: (project.product_type as DistributionProductType | null) || null,
          sourceToolId: project.source_tool_id || null,
          listingImportedAt: project.listing_imported_at || null,
        },
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
              proofPoint:
                projectDescription || `${project.name} is available at ${project.website_url || 'its official site'}.`,
              audience: channel.channel_type === 'community' ? 'community readers' : 'the intended audience',
              valueProp:
                channel.channel_type === 'alternative'
                  ? `compare ${project.name} clearly`
                  : `share ${project.name} with ${channel.name.toLowerCase()}`,
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
          dueToday: normalizedTasks.filter(
            (task) => task.dueDate === today && !['done', 'skipped'].includes(task.status),
          ).length,
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
        destinationSuggestion: firstDestinationSuggestion || {
          destinationUrl: project.website_url || '',
          utmSource: 'distribution',
          utmMedium: 'distribution',
          utmCampaign: project.name,
          utmContent: null,
          linkName: project.name,
          summary: 'No destination suggestion could be derived.',
        },
        targetRecommendations,
        targetRegistryUnavailable,
        assets: (projectAssetRows || []).map((asset: any) => ({
          id: String(asset.id),
          assetType: String(asset.asset_type || 'other'),
          name: String(asset.name || 'Untitled asset'),
          url: String(asset.stored_url || asset.source_url || ''),
          width: asset.width === null || asset.width === undefined ? null : Number(asset.width),
          height: asset.height === null || asset.height === undefined ? null : Number(asset.height),
          status: String(asset.status || 'candidate'),
          verifiedAt: asset.verified_at || null,
          source: typeof asset.metadata?.source === 'string' ? asset.metadata.source : null,
          sourceToolId:
            typeof asset.metadata?.sourceToolId === 'string' ? asset.metadata.sourceToolId : null,
        })),
        listingCandidates,
      },
    };
  } catch (error) {
    console.error('Distribution dashboard error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to load distribution dashboard.' };
  }
}

export async function acceptDistributionTarget(
  formData: FormData,
): Promise<{ success: boolean; error?: string; taskId?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    const targetId = normalize(formData.get('targetId'));
    const estimatedMinutes = Number.parseInt(normalize(formData.get('estimatedMinutes')) || '15', 10);
    const score = Number.parseInt(normalize(formData.get('score')) || '0', 10);
    if (!projectId || !targetId) return { success: false, error: 'Project and target are required.' };
    const supabase = await createClient();
    const [{ data: project, error: projectError }, targets] = await Promise.all([
      supabase
        .from('distribution_projects')
        .select('id, name, facts_confirmed_at')
        .eq('id', projectId)
        .eq('owner_id', user.id)
        .neq('status', 'archived')
        .maybeSingle(),
      queryDatabase<{
        id: string;
        name: string;
        channel_key: string;
        submission_url: string | null;
        requires_account: boolean;
        requires_payment: boolean;
        requires_captcha: boolean;
      }>(
        `
        select target.id, target.name, channel.channel_key, target.submission_url,
          target.requires_account, target.requires_payment, target.requires_captcha
        from distribution_targets target
        join distribution_channels channel on channel.id = target.channel_id
        where target.id = $1 and target.target_status = 'active'
        limit 1
      `,
        [targetId],
      ),
    ]);
    const target = targets[0] || null;
    if (projectError || !project) return { success: false, error: 'Project not found or access denied.' };
    if (!project.facts_confirmed_at) {
      return { success: false, error: 'Confirm the product facts before accepting a target site.' };
    }
    if (!target) return { success: false, error: 'Target is no longer available.' };
    const { data: channel, error: channelError } = await supabase
      .from('distribution_channels')
      .select('id')
      .eq('channel_key', target.channel_key)
      .eq('is_active', true)
      .maybeSingle();
    if (channelError || !channel)
      return { success: false, error: 'The target channel is not available in this workspace.' };
    const { data: projectTarget, error: projectTargetError } = await supabase
      .from('distribution_project_targets')
      .upsert(
        {
          project_id: projectId,
          target_id: targetId,
          owner_id: user.id,
          match_score: Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0)),
          opportunity_status: 'accepted',
          estimated_minutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? estimatedMinutes : 15,
          selected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,target_id' },
      )
      .select('id')
      .single();
    if (projectTargetError || !projectTarget) throw projectTargetError || new Error('Unable to accept target.');
    const { data: existingTask, error: existingTaskError } = await supabase
      .from('distribution_tasks')
      .select('id')
      .eq('project_id', projectId)
      .eq('target_id', targetId)
      .eq('owner_id', user.id)
      .not('status', 'in', '(done,skipped)')
      .maybeSingle();
    if (existingTaskError) throw existingTaskError;
    if (existingTask) return { success: true, taskId: String(existingTask.id) };
    const blockers = [
      target.requires_account ? 'account' : null,
      target.requires_payment ? 'payment' : null,
      target.requires_captcha ? 'captcha' : null,
    ].filter(Boolean);
    const { data: task, error: taskError } = await supabase
      .from('distribution_tasks')
      .insert({
        project_id: projectId,
        project_target_id: projectTarget.id,
        target_id: targetId,
        owner_id: user.id,
        channel_id: channel.id,
        title: `Prepare ${project.name} for ${target.name}`,
        task_type: 'prepare',
        status: project.facts_confirmed_at && target.submission_url ? 'in_progress' : 'needs_assets',
        priority: score >= 80 ? 'p0' : score >= 65 ? 'p1' : 'p2',
        estimated_minutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? estimatedMinutes : 15,
        instructions: `Prepare the target-specific package${blockers.length ? `. Manual steps: ${blockers.join(', ')}` : ''}.`,
      })
      .select('id')
      .single();
    if (taskError || !task) throw taskError || new Error('Unable to create target task.');
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true, taskId: String(task.id) };
  } catch (error) {
    console.error('Accept distribution target error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to accept target.' };
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
    if (!projectId || !channelId || !name || !campaign)
      return { success: false, error: 'Project, channel, link name, and campaign are required.' };

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('distribution_projects')
      .select('id, website_url')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .single();
    if (projectError || !project?.website_url)
      return { success: false, error: 'Add a website URL to this project before creating a tracked link.' };
    const { data: channel, error: channelError } = await supabase
      .from('distribution_channels')
      .select('id, channel_key')
      .eq('id', channelId)
      .eq('is_active', true)
      .single();
    if (channelError || !channel) return { success: false, error: 'Choose an active distribution channel.' };

    const linkId = randomUUID();
    const destinationUrl = new URL(project.website_url);
    const source = channel.channel_key
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    destinationUrl.searchParams.set('utm_source', source);
    destinationUrl.searchParams.set('utm_medium', 'distribution');
    destinationUrl.searchParams.set(
      'utm_campaign',
      campaign
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 120),
    );
    if (content)
      destinationUrl.searchParams.set(
        'utm_content',
        content
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 120),
      );
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
    let normalizedWebsiteUrl = websiteUrl;
    const description = normalize(formData.get('description')) || null;
    const primaryGoal = normalize(formData.get('primaryGoal')) || null;
    const weeklyCapacity = Number.parseInt(normalize(formData.get('weeklyCapacity')) || '3', 10);
    const budgetPreference = normalize(formData.get('budgetPreference')) || 'free_first';
    const locale = normalize(formData.get('locale')) || 'en';
    if (name.length < 2) return { success: false, error: 'Project name is required.' };
    if (websiteUrl) {
      try {
        const parsed = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
        if (!parsed.hostname) return { success: false, error: 'Enter a valid website URL.' };
        normalizedWebsiteUrl = parsed.toString();
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
    if ((count || 0) >= getProjectLimit(plan))
      return { success: false, error: `Your current plan supports up to ${getProjectLimit(plan)} active projects.` };
    const { data: project, error } = await supabase
      .from('distribution_projects')
      .insert({
        workspace_id: workspaceProject.workspace_id,
        owner_id: user.id,
        name,
        website_url: normalizedWebsiteUrl,
        description: description || `Distribution project for ${name}.`,
        primary_goal: primaryGoal,
        weekly_capacity: Number.isFinite(weeklyCapacity) && weeklyCapacity > 0 ? weeklyCapacity : 3,
        budget_preference: budgetPreference,
        onboarding_status: normalizedWebsiteUrl && description ? 'profile_started' : 'not_started',
      })
      .select('id')
      .single();
    if (error || !project) throw error || new Error('Unable to create project.');
    revalidatePath('/[locale]/distribution', 'page');
    redirect(`/${locale}/distribution?project=${project.id}`);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    console.error('Create distribution project error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to create project.' };
  }
}

export async function importDistributionCatalogListing(
  formData: FormData,
): Promise<{ success: boolean; importedAssets?: number; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    const toolId = normalize(formData.get('toolId'));
    if (!projectId || !toolId) return { success: false, error: 'Project and AI Best Tool listing are required.' };
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('distribution_projects')
      .select('id, name, website_url, description')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .neq('status', 'archived')
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return { success: false, error: 'Project not found or access denied.' };
    const ownedListings = await loadOwnedCatalogListings({
      userId: user.id,
      email: user.email,
      projectUrl: project.website_url,
      isAdmin: isAdminUser(user),
    });
    const listing = ownedListings.find((candidate) => candidate.id === toolId);
    if (!listing) {
      return { success: false, error: 'This listing is not owned by this account or does not match the project domain.' };
    }
    const projectDomain = normalizeDistributionDomain(project.website_url);
    const listingDomain = normalizeDistributionDomain(listing.websiteUrl);
    if (projectDomain && listingDomain && projectDomain !== listingDomain) {
      return {
        success: false,
        error: 'The listing domain does not match this project. Switch projects or correct the project website first.',
      };
    }
    const domain = listingDomain;
    if (!domain) return { success: false, error: 'The listing website URL is invalid.' };
    const now = new Date().toISOString();
    const snapshot = {
      source: 'aibesttool_listing',
      sourceToolId: listing.id,
      importedAt: now,
      ownershipSource: listing.ownershipSource,
      categoryName: listing.categoryName,
      tags: listing.tags,
      pricing: listing.pricing,
      productType: listing.productType,
      importedFields: {
        name: listing.name,
        websiteUrl: listing.websiteUrl,
        description: listing.description,
      },
      fieldsRequireOwnerConfirmation: ['name', 'websiteUrl', 'description', 'pricing'],
    };
    // The session query above proves project ownership. Shared intelligence records are
    // maintained server-side so their stricter RLS cannot break an authorized import.
    const adminSupabase = createAdminClient();
    const { error: updateError } = await supabase
      .from('distribution_projects')
      .update({
        name: listing.name || project.name,
        website_url: listing.websiteUrl || project.website_url,
        description: listing.description || project.description,
        source_tool_id: listing.id,
        product_type: listing.productType,
        listing_imported_at: now,
        listing_snapshot_json: snapshot,
        onboarding_status: 'profile_started',
        facts_confirmed_at: null,
        updated_at: now,
      })
      .eq('id', projectId)
      .eq('owner_id', user.id);
    if (updateError) throw updateError;

    const { data: existingIntelligenceProfile, error: existingProfileError } = await adminSupabase
      .from('product_intelligence_profiles')
      .select('id, metadata')
      .eq('owner_type', 'distribution_project')
      .eq('owner_id', projectId)
      .maybeSingle();
    if (existingProfileError) throw existingProfileError;
    const { data: intelligenceProfile, error: profileError } = await adminSupabase
      .from('product_intelligence_profiles')
      .upsert(
        {
          owner_type: 'distribution_project',
          owner_id: projectId,
          canonical_domain: domain,
          product_name: listing.name || project.name,
          profile_status: 'pending',
          metadata: {
            ...((existingIntelligenceProfile?.metadata as Record<string, unknown> | null) || {}),
            importedListing: snapshot,
          },
          updated_at: now,
        },
        { onConflict: 'owner_type,owner_id' },
      )
      .select('id')
      .single();
    if (profileError || !intelligenceProfile) throw profileError || new Error('Unable to link product intelligence.');
    const { error: profileLinkError } = await adminSupabase
      .from('distribution_projects')
      .update({ intelligence_profile_id: intelligenceProfile.id })
      .eq('id', projectId)
      .eq('owner_id', user.id);
    if (profileLinkError) throw profileLinkError;

    const importedAssets = [
      listing.imageUrl
        ? { assetType: 'logo', name: 'AI Best Tool listing logo', url: listing.imageUrl }
        : null,
      listing.thumbnailUrl
        ? { assetType: 'screenshot', name: 'AI Best Tool listing thumbnail', url: listing.thumbnailUrl }
        : null,
      ...listing.screenshots.map((url, index) => ({
        assetType: 'screenshot',
        name: `AI Best Tool listing screenshot ${index + 1}`,
        url,
      })),
    ].filter((asset): asset is { assetType: string; name: string; url: string } => Boolean(asset?.url));
    if (importedAssets.length > 0) {
      const { error: assetError } = await adminSupabase.from('distribution_project_assets').upsert(
        importedAssets.map((asset) => ({
          project_id: projectId,
          owner_id: user.id,
          asset_type: asset.assetType,
          name: asset.name,
          source_url: asset.url,
          status: 'candidate',
          metadata: { source: 'aibesttool_listing', sourceToolId: listing.id },
          updated_at: now,
        })),
        { onConflict: 'project_id,asset_type,name' },
      );
      if (assetError) throw assetError;
    }
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true, importedAssets: importedAssets.length };
  } catch (error) {
    console.error('Import distribution catalog listing error:', error);
    return { success: false, error: getDistributionActionError(error, 'Unable to import listing.') };
  }
}

export async function updateDistributionProjectProfile(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    const name = normalize(formData.get('name'));
    const websiteUrl = normalize(formData.get('websiteUrl'));
    const description = normalize(formData.get('description'));
    const productType = normalize(formData.get('productType')) as DistributionProductType;
    const primaryGoal = normalize(formData.get('primaryGoal'));
    const weeklyCapacity = Number.parseInt(normalize(formData.get('weeklyCapacity')) || '3', 10);
    const budgetPreference = normalize(formData.get('budgetPreference')) || 'free_first';
    const factsConfirmed = normalize(formData.get('factsConfirmed')) === 'on';
    const allowedProductTypes: DistributionProductType[] = [
      'ai_saas',
      'developer_api',
      'open_source',
      'mobile_app',
      'content_newsletter',
      'agency_service',
      'web3',
      'other',
    ];
    if (!projectId || name.length < 2 || !websiteUrl || description.length < 20) {
      return { success: false, error: 'Project, website URL, and a specific product description are required.' };
    }
    let normalizedWebsiteUrl: string;
    try {
      normalizedWebsiteUrl = new URL(
        /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`,
      ).toString();
    } catch {
      return { success: false, error: 'Enter a valid website URL.' };
    }
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from('distribution_projects')
      .update({
        name,
        website_url: normalizedWebsiteUrl,
        description,
        product_type: allowedProductTypes.includes(productType) ? productType : 'other',
        primary_goal: primaryGoal || null,
        weekly_capacity: Number.isFinite(weeklyCapacity) && weeklyCapacity > 0 ? weeklyCapacity : 3,
        budget_preference: budgetPreference,
        onboarding_status: factsConfirmed ? 'facts_confirmed' : 'profile_started',
        facts_confirmed_at: factsConfirmed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .select('id, intelligence_profile_id')
      .maybeSingle();
    if (error) throw error;
    if (!project) return { success: false, error: 'Project not found or access denied.' };
    if (project.intelligence_profile_id) {
      const adminSupabase = createAdminClient();
      const { error: intelligenceError } = await adminSupabase
        .from('product_intelligence_profiles')
        .update({
          product_name: name,
          canonical_domain: new URL(normalizedWebsiteUrl).hostname.replace(/^www\./, ''),
          profile_status: factsConfirmed ? 'ready' : 'pending',
          last_verified_at: factsConfirmed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.intelligence_profile_id)
        .eq('owner_type', 'distribution_project')
        .eq('owner_id', projectId);
      if (intelligenceError) throw intelligenceError;
    }
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true };
  } catch (error) {
    console.error('Update distribution project profile error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update project profile.' };
  }
}

export async function createDistributionProjectAsset(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    const assetType = normalize(formData.get('assetType'));
    const name = normalize(formData.get('name'));
    const sourceUrl = normalize(formData.get('sourceUrl'));
    const width = Number.parseInt(normalize(formData.get('width')), 10);
    const height = Number.parseInt(normalize(formData.get('height')), 10);
    const verified = normalize(formData.get('verified')) === 'on';
    const allowedTypes = ['logo', 'icon', 'screenshot', 'video', 'founder_photo', 'social'];
    if (!projectId || !allowedTypes.includes(assetType) || name.length < 2 || !sourceUrl)
      return { success: false, error: 'Project, asset type, name, and public asset URL are required.' };
    let normalizedUrl: string;
    try {
      const parsed = new URL(sourceUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol');
      normalizedUrl = parsed.toString();
    } catch {
      return { success: false, error: 'Enter a valid public HTTP or HTTPS asset URL.' };
    }
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('distribution_projects')
      .select('id')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return { success: false, error: 'Project not found or access denied.' };
    const { error } = await supabase.from('distribution_project_assets').upsert(
      {
        project_id: projectId,
        owner_id: user.id,
        asset_type: assetType,
        name,
        source_url: normalizedUrl,
        width: Number.isFinite(width) && width > 0 ? width : null,
        height: Number.isFinite(height) && height > 0 ? height : null,
        status: verified ? 'verified' : 'candidate',
        verified_at: verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,asset_type,name' },
    );
    if (error) throw error;
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true };
  } catch (error) {
    console.error('Create distribution project asset error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to save project asset.' };
  }
}

export async function importDistributionIntelligenceAssets(
  formData: FormData,
): Promise<{ success: boolean; imported?: number; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    if (!projectId) return { success: false, error: 'Project is required.' };
    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('distribution_projects')
      .select('id, intelligence_profile_id')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return { success: false, error: 'Project not found or access denied.' };
    let profileId = project.intelligence_profile_id || null;
    if (!profileId) {
      const adminSupabase = createAdminClient();
      const { data: profile, error: profileError } = await adminSupabase
        .from('product_intelligence_profiles')
        .select('id')
        .eq('owner_type', 'distribution_project')
        .eq('owner_id', projectId)
        .maybeSingle();
      if (profileError) throw profileError;
      profileId = profile?.id || null;
    }
    if (!profileId) return { success: false, error: 'No Product Intelligence profile is linked to this project yet.' };
    const adminSupabase = createAdminClient();
    const { data: intelligenceAssets, error: assetError } = await adminSupabase
      .from('product_intelligence_assets')
      .select('id, asset_type, source_url, stored_url, width, height, evidence_status, is_placeholder')
      .eq('profile_id', profileId)
      .neq('evidence_status', 'rejected');
    if (assetError) throw assetError;
    const usableAssets = (intelligenceAssets || []).filter(
      (asset: any) => !asset.is_placeholder && (asset.stored_url || asset.source_url),
    );
    if (!usableAssets.length) return { success: false, error: 'No reusable verified or candidate assets were found.' };
    const { error } = await supabase.from('distribution_project_assets').upsert(
      usableAssets.map((asset: any) => ({
        project_id: projectId,
        owner_id: user.id,
        profile_asset_id: asset.id,
        asset_type: asset.asset_type,
        name: `${asset.asset_type}-${String(asset.id).slice(0, 8)}`,
        source_url: asset.source_url,
        stored_url: asset.stored_url,
        width: asset.width,
        height: asset.height,
        status: asset.evidence_status === 'verified' ? 'verified' : 'candidate',
        verified_at: asset.evidence_status === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'project_id,asset_type,name' },
    );
    if (error) throw error;
    if (!project.intelligence_profile_id)
      await supabase
        .from('distribution_projects')
        .update({ intelligence_profile_id: profileId })
        .eq('id', projectId)
        .eq('owner_id', user.id);
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true, imported: usableAssets.length };
  } catch (error) {
    console.error('Import distribution intelligence assets error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to import intelligence assets.' };
  }
}

export async function createDistributionTask(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };

    const title = normalize(formData.get('title'));
    const projectId = normalize(formData.get('projectId'));
    const channelId = normalize(formData.get('channelId'));
    const priority = normalize(formData.get('priority')) || 'p1';
    const dueDate = normalize(formData.get('dueDate')) || null;
    const instructions = normalize(formData.get('instructions')) || null;
    if (title.length < 3 || !projectId || !channelId)
      return { success: false, error: 'Add a project, task title, and channel.' };

    const supabase = await createClient();
    const [{ data: project, error: projectError }, { data: channel, error: channelError }] = await Promise.all([
      supabase
        .from('distribution_projects')
        .select('id')
        .eq('id', projectId)
        .eq('owner_id', user.id)
        .neq('status', 'archived')
        .maybeSingle(),
      supabase.from('distribution_channels').select('id').eq('id', channelId).eq('is_active', true).maybeSingle(),
    ]);
    if (projectError || !project) return { success: false, error: 'Project not found or access denied.' };
    if (channelError || !channel) return { success: false, error: 'Choose an active distribution channel.' };
    const { error } = await supabase.from('distribution_tasks').insert({
      project_id: projectId,
      owner_id: user.id,
      channel_id: channel.id,
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
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const taskId = normalize(formData.get('taskId'));
    const status = normalizeDistributionTaskStatus(normalize(formData.get('status')));
    if (!taskId || !status || !isDistributionTaskStatus(status)) {
      return { success: false, error: 'Invalid task status.' };
    }
    const supabase = await createClient();
    const { data: existingTask, error: existingTaskError } = await supabase
      .from('distribution_tasks')
      .select('id, project_id, status')
      .eq('id', taskId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (existingTaskError) throw existingTaskError;
    if (!existingTask) return { success: false, error: 'Task not found or access denied.' };
    const now = new Date().toISOString();
    const statusTimestamps: Record<string, string | null> = {};
    if (['submitted', 'waiting_review'].includes(status)) statusTimestamps.submitted_at = now;
    if (['live', 'done', 'skipped'].includes(status)) statusTimestamps.completed_at = now;
    if (!['live', 'done', 'skipped'].includes(status)) statusTimestamps.completed_at = null;
    const { data: task, error } = await supabase
      .from('distribution_tasks')
      .update({ status, updated_at: now, ...statusTimestamps })
      .eq('id', taskId)
      .eq('owner_id', user.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!task) return { success: false, error: 'Task not found or access denied.' };
    if (existingTask.status !== status) {
      const { error: eventError } = await supabase.from('distribution_task_events').insert({
        task_id: taskId,
        project_id: existingTask.project_id,
        owner_id: user.id,
        event_type: 'status_changed',
        from_status: existingTask.status,
        to_status: status,
        reason: 'Status updated from the execution cockpit.',
      });
      if (eventError) throw eventError;
    }
    if (['submitted', 'waiting_review'].includes(status)) {
      await scheduleDistributionReminders({
        supabase,
        userId: user.id,
        taskId,
        projectId: existingTask.project_id,
        milestones: [
          { type: 'submission_check_3d', days: 3 },
          { type: 'submission_check_7d', days: 7 },
        ],
      });
    }
    if (status === 'live') {
      await scheduleDistributionReminders({
        supabase,
        userId: user.id,
        taskId,
        projectId: existingTask.project_id,
        milestones: [
          { type: 'live_check_7d', days: 7 },
          { type: 'live_check_30d', days: 30 },
          { type: 'live_check_90d', days: 90 },
        ],
      });
    }
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
    const { data: task, error: taskError } = await supabase
      .from('distribution_tasks')
      .select('id, title, status, project_id, channel_id')
      .eq('id', taskId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!task) return { success: false, error: 'Task not found or access denied.' };
    const { error } = await supabase.from('distribution_results').insert({
      task_id: taskId,
      owner_id: user.id,
      live_url: liveUrl,
      link_status: ['unknown', 'pending', 'live', 'removed', 'nofollow', 'rejected'].includes(linkStatus)
        ? linkStatus
        : 'unknown',
      checked_at: liveUrl ? new Date().toISOString() : null,
      notes,
    });
    if (error) throw error;
    const nextStatus = deriveTaskStatusFromLinkResult({
      currentStatus: task?.status || 'planned',
      liveUrl,
      linkStatus,
    });
    await supabase
      .from('distribution_tasks')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
        completed_at: nextStatus === 'live' ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
      .eq('owner_id', user.id);
    const { error: eventError } = await supabase.from('distribution_task_events').insert({
      task_id: taskId,
      project_id: task.project_id,
      owner_id: user.id,
      event_type: 'result_recorded',
      from_status: task.status,
      to_status: nextStatus,
      reason: notes,
      metadata: { liveUrl, linkStatus },
    });
    if (eventError) throw eventError;
    if (nextStatus === 'live') {
      await scheduleDistributionReminders({
        supabase,
        userId: user.id,
        taskId,
        projectId: task.project_id,
        milestones: [
          { type: 'live_check_7d', days: 7 },
          { type: 'live_check_30d', days: 30 },
          { type: 'live_check_90d', days: 90 },
        ],
      });
    }
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

export async function seedDistributionStarterTasks(
  formData: FormData,
): Promise<{ success: boolean; created?: number; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const projectId = normalize(formData.get('projectId'));
    if (!projectId) return { success: false, error: 'Project is required.' };

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from('distribution_projects')
      .select('id, name, description')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .neq('status', 'archived')
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return { success: false, error: 'Project not found or access denied.' };
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

    const taskTemplates: Record<
      string,
      { title: string; taskType: string; instructions: string; priority: string; status: DistributionTaskStatus }
    > = {
      'ai-directories': {
        title: 'Audit 3 relevant AI directories before submitting',
        taskType: 'research',
        instructions:
          'Choose directories with a real audience. Record acceptance rules and whether the listing is editorial or paid.',
        priority: 'p0',
        status: 'planned',
      },
      'alternative-sites': {
        title: `Prepare an honest ${project.name} alternative pitch`,
        taskType: 'prepare',
        instructions: `Explain what ${project.name} helps users do better, without copying generic directory claims.`,
        priority: 'p1',
        status: 'in_progress',
      },
      'startup-launches': {
        title: `Draft a ${project.name} launch story`,
        taskType: 'prepare',
        instructions:
          'Use the real problem, product evidence, and current launch context. Do not invent traction claims.',
        priority: 'p1',
        status: 'ready_to_submit',
      },
      communities: {
        title: 'Find one relevant community question to answer',
        taskType: 'research',
        instructions: `Contribute a useful answer first. Only mention ${project.name} when it directly helps the question.`,
        priority: 'p0',
        status: 'planned',
      },
      newsletters: {
        title: 'Build a shortlist of 5 relevant newsletters',
        taskType: 'research',
        instructions: 'Prioritize newsletters read by AI tool buyers, founders, or technical operators.',
        priority: 'p1',
        status: 'needs_assets',
      },
      'owned-blog': {
        title: 'Publish one first-party comparison or experiment',
        taskType: 'publish',
        instructions: 'Use real screenshots, dates, test notes, or GSC evidence. Avoid generic AI-written listicles.',
        priority: 'p0',
        status: 'in_progress',
      },
      github: {
        title: 'Add a useful open-source example or resource',
        taskType: 'prepare',
        instructions:
          'Create a relevant repository, template, or documentation example. Do not add unrelated links to issues.',
        priority: 'p2',
        status: 'blocked',
      },
      reddit: {
        title: 'Answer one genuine Reddit question with disclosure',
        taskType: 'submit',
        instructions:
          'Find a relevant question, answer it directly, disclose affiliation, and save the post URL for follow-up.',
        priority: 'p1',
        status: 'submitted',
      },
    };

    const today = new Date();
    const rows = (channels || []).flatMap((channel: any, index) => {
      const template = taskTemplates[channel.channel_key];
      if (!template) return [];
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + index);
      return [
        {
          project_id: projectId,
          owner_id: user.id,
          channel_id: channel.id,
          title: template.title,
          task_type: template.taskType,
          priority: template.priority,
          due_date: dueDate.toISOString().slice(0, 10),
          instructions: template.instructions,
          status: template.status,
        },
      ];
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

export async function getDistributionTaskDetail(
  taskId: string,
): Promise<
  | { success: true; access: true; data: DistributionTaskDetail }
  | { success: true; access: false; data: null }
  | { success: false; error: string }
> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: true, access: false, data: null };
    const supabase = await createClient();
    const normalizedTaskId = normalize(taskId);
    if (!normalizedTaskId) return { success: false, error: 'Task id is required.' };

    const { data: task, error: taskError } = await supabase
      .from('distribution_tasks')
      .select(
        'id, title, status, priority, task_type, due_date, instructions, notes, updated_at, project_id, channel_id, target_id, distribution_projects(id, name, website_url, description), distribution_channels(id, channel_key, name, channel_type, instructions), distribution_results(live_url, link_status, notes, checked_at, created_at)',
      )
      .eq('id', normalizedTaskId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!task) return { success: false, error: 'Task not found.' };

    const { data: templates, error: templatesError } = await supabase
      .from('distribution_channel_templates')
      .select(
        'channel_id, title_template, description_template, max_title_length, max_description_length, required_fields',
      );
    if (templatesError) throw templatesError;
    const { data: queue, error: queueError } = await supabase
      .from('distribution_tasks')
      .select('id, title, status, priority, due_date, distribution_channels(name, channel_type)')
      .eq('project_id', task.project_id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (queueError) throw queueError;

    const { data: savedPackage, error: packageError } = await supabase
      .from('distribution_packages')
      .select(
        'id, generation_status, fields_json, asset_requirements_json, preflight_json, approved_at, updated_at',
      )
      .eq('task_id', normalizedTaskId)
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (packageError) throw packageError;
    const [{ data: eventRows, error: eventError }, { data: reminderRows, error: reminderError }] =
      await Promise.all([
        supabase
          .from('distribution_task_events')
          .select('id, event_type, from_status, to_status, reason, created_at')
          .eq('task_id', normalizedTaskId)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('distribution_reminders')
          .select('id, reminder_type, scheduled_at, status')
          .eq('task_id', normalizedTaskId)
          .eq('owner_id', user.id)
          .neq('status', 'cancelled')
          .order('scheduled_at', { ascending: true })
          .limit(20),
      ]);
    if (eventError) throw eventError;
    if (reminderError) throw reminderError;

    const projectRow = Array.isArray(task.distribution_projects)
      ? task.distribution_projects[0] || {}
      : task.distribution_projects || {};
    const channelRow = Array.isArray(task.distribution_channels)
      ? task.distribution_channels[0] || {}
      : task.distribution_channels || {};
    const targetRow = task.target_id
      ? (
          await queryDatabase<{
            id: string;
            name: string;
            homepage_url: string;
            submission_url: string | null;
            registration_url: string | null;
            pricing_url: string | null;
            requires_account: boolean;
            requires_payment: boolean;
            requires_captcha: boolean;
            requires_backlink: boolean;
            editorial_review: boolean;
            expected_review_days: number | null;
            confidence: number;
          }>(
            `
          select id, name, homepage_url, submission_url, registration_url, pricing_url,
            requires_account, requires_payment, requires_captcha, requires_backlink,
            editorial_review, expected_review_days, confidence
          from distribution_targets
          where id = $1
          limit 1
        `,
            [task.target_id],
          ).catch((error) => {
            console.error('Distribution task target unavailable:', error);
            return [];
          })
        )[0] || null
      : null;
    const template = (templates || []).find((item: any) => item.channel_id === task.channel_id) || null;
    const recentResult =
      Array.isArray(task.distribution_results) && task.distribution_results.length > 0
        ? [...task.distribution_results].sort((a: any, b: any) =>
            String(b.created_at).localeCompare(String(a.created_at)),
          )[0]
        : null;
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
        instructions:
          ((channelRow as { instructions?: string | null }).instructions as string | null | undefined) || null,
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
      target: targetRow
        ? {
            id: String((targetRow as { id?: string }).id || task.target_id),
            name: String((targetRow as { name?: string }).name || 'Target site'),
            homepageUrl: String((targetRow as { homepage_url?: string }).homepage_url || ''),
            submissionUrl:
              ((targetRow as { submission_url?: string | null }).submission_url as string | null | undefined) || null,
            registrationUrl:
              ((targetRow as { registration_url?: string | null }).registration_url as string | null | undefined) ||
              null,
            pricingUrl:
              ((targetRow as { pricing_url?: string | null }).pricing_url as string | null | undefined) || null,
            requiresAccount: Boolean((targetRow as { requires_account?: boolean }).requires_account),
            requiresPayment: Boolean((targetRow as { requires_payment?: boolean }).requires_payment),
            requiresCaptcha: Boolean((targetRow as { requires_captcha?: boolean }).requires_captcha),
            requiresBacklink: Boolean((targetRow as { requires_backlink?: boolean }).requires_backlink),
            editorialReview: Boolean((targetRow as { editorial_review?: boolean }).editorial_review),
            expectedReviewDays: (targetRow as { expected_review_days?: number | null }).expected_review_days ?? null,
            confidence: Number((targetRow as { confidence?: number }).confidence || 0),
          }
        : null,
      package: savedPackage
        ? {
            id: String(savedPackage.id),
            status: String(savedPackage.generation_status || 'pending'),
            fields: Array.isArray(savedPackage.fields_json) ? savedPackage.fields_json : [],
            assetRequirements: Array.isArray(savedPackage.asset_requirements_json)
              ? savedPackage.asset_requirements_json
              : [],
            missingAssets:
              savedPackage.preflight_json &&
              typeof savedPackage.preflight_json === 'object' &&
              Array.isArray((savedPackage.preflight_json as { missingAssets?: unknown[] }).missingAssets)
                ? ((savedPackage.preflight_json as { missingAssets: string[] }).missingAssets as string[])
                : [],
            blockers:
              savedPackage.preflight_json &&
              typeof savedPackage.preflight_json === 'object' &&
              Array.isArray((savedPackage.preflight_json as { blockers?: unknown[] }).blockers)
                ? ((savedPackage.preflight_json as { blockers: string[] }).blockers as string[])
                : [],
            warnings:
              savedPackage.preflight_json &&
              typeof savedPackage.preflight_json === 'object' &&
              Array.isArray((savedPackage.preflight_json as { warnings?: unknown[] }).warnings)
                ? ((savedPackage.preflight_json as { warnings: string[] }).warnings as string[])
                : [],
            ready:
              Boolean(
                savedPackage.preflight_json &&
                  typeof savedPackage.preflight_json === 'object' &&
                  (savedPackage.preflight_json as { ready?: boolean }).ready,
              ) || savedPackage.generation_status === 'ready',
            approvedAt: (savedPackage.approved_at as string | null | undefined) || null,
            updatedAt: (savedPackage.updated_at as string | null | undefined) || null,
          }
        : null,
      events: (eventRows || []).map((event: any) => ({
        id: String(event.id),
        eventType: String(event.event_type || 'updated'),
        fromStatus: (event.from_status as string | null | undefined) || null,
        toStatus: (event.to_status as string | null | undefined) || null,
        reason: (event.reason as string | null | undefined) || null,
        createdAt: String(event.created_at || ''),
      })),
      reminders: (reminderRows || []).map((reminder: any) => ({
        id: String(reminder.id),
        reminderType: String(reminder.reminder_type || 'follow_up'),
        scheduledAt: String(reminder.scheduled_at || ''),
        status: String(reminder.status || 'scheduled'),
      })),
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

export async function generateDistributionPackage(
  formData: FormData,
): Promise<{ success: boolean; ready?: boolean; error?: string }> {
  try {
    const { user, allowed } = await getDistributionAccess();
    if (!allowed) return { success: false, error: 'Distribution workspace access requires an active plan.' };
    const taskId = normalize(formData.get('taskId'));
    if (!taskId) return { success: false, error: 'Task is required.' };

    const detailResult = await getDistributionTaskDetail(taskId);
    if (!detailResult.success) return { success: false, error: detailResult.error };
    if (!detailResult.access || !detailResult.data) return { success: false, error: 'Task access denied.' };
    const detail = detailResult.data;
    if (!detail.target) {
      return { success: false, error: 'Bind this task to a concrete target site before generating a package.' };
    }

    const requirementRows = await queryDatabase<{
      required_field: string;
      field_type: string;
      character_limit: number | null;
      required_asset: string | null;
      rule_text: string;
      source_url: string;
    }>(
      `
        select required_field, field_type, character_limit, required_asset, rule_text, source_url
        from distribution_target_requirements
        where target_id = $1
        order by confidence desc, required_field asc
      `,
      [detail.target.id],
    ).catch((error) => {
      console.error('Distribution target requirements unavailable:', error);
      return [];
    });
    const requirements: DistributionTargetRequirementInput[] = requirementRows.map((row) => ({
      requiredField: row.required_field,
      fieldType: row.field_type,
      characterLimit: row.character_limit,
      requiredAsset: row.required_asset,
      ruleText: row.rule_text,
      sourceUrl: row.source_url,
    }));

    const supabase = await createClient();
    const { data: assets, error: assetError } = await supabase
      .from('distribution_project_assets')
      .select('asset_type')
      .eq('project_id', detail.project.id)
      .eq('owner_id', user.id)
      .in('status', ['candidate', 'verified']);
    if (assetError) throw assetError;

    const packageDraft = composeDistributionPackage({
      detail,
      requirements,
      availableAssetTypes: (assets || []).map((asset: { asset_type: string }) => asset.asset_type),
    });
    const now = new Date().toISOString();
    const packagePayload = {
      project_id: detail.project.id,
      target_id: detail.target.id,
      task_id: detail.task.id,
      owner_id: user.id,
      target_rule_version: requirements.length,
      fields_json: packageDraft.fields,
      asset_requirements_json: packageDraft.assetRequirements,
      preflight_json: {
        missingAssets: packageDraft.missingAssets,
        blockers: packageDraft.blockers,
        warnings: packageDraft.warnings,
        ready: packageDraft.ready,
      },
      generation_status: packageDraft.ready ? 'ready' : 'blocked',
      updated_at: now,
    };
    const { data: existingPackage, error: existingPackageError } = await supabase
      .from('distribution_packages')
      .select('id')
      .eq('task_id', detail.task.id)
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingPackageError) throw existingPackageError;
    const packageQuery = existingPackage
      ? supabase
          .from('distribution_packages')
          .update(packagePayload)
          .eq('id', existingPackage.id)
          .eq('owner_id', user.id)
      : supabase.from('distribution_packages').insert(packagePayload);
    const { error: saveError } = await packageQuery;
    if (saveError) throw saveError;

    const nextStatus = packageDraft.ready ? 'ready_to_submit' : 'needs_assets';
    const { error: taskError } = await supabase
      .from('distribution_tasks')
      .update({
        status: nextStatus,
        blocked_reason: packageDraft.ready ? null : packageDraft.blockers.join(' | '),
        updated_at: now,
      })
      .eq('id', detail.task.id)
      .eq('owner_id', user.id);
    if (taskError) throw taskError;
    const { error: eventError } = await supabase.from('distribution_task_events').insert({
      task_id: detail.task.id,
      project_id: detail.project.id,
      owner_id: user.id,
      event_type: 'package_generated',
      from_status: detail.task.status,
      to_status: nextStatus,
      reason: packageDraft.ready ? 'Target-specific package is ready.' : 'Package requires missing fields or assets.',
      metadata: {
        targetId: detail.target.id,
        requirementCount: requirements.length,
        blockerCount: packageDraft.blockers.length,
      },
    });
    if (eventError) throw eventError;

    revalidatePath('/[locale]/distribution/tasks/[taskId]', 'page');
    revalidatePath('/[locale]/distribution', 'page');
    return { success: true, ready: packageDraft.ready };
  } catch (error) {
    console.error('Generate distribution package error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unable to generate package.' };
  }
}

export async function createDistributionFollowUpTask(
  formData: FormData,
): Promise<{ success: boolean; error?: string; createdTaskId?: string }> {
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

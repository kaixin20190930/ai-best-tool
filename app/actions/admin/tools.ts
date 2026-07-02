'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/middleware';
import { getPool } from '@/db/neon/client';
import { createNotification } from '@/app/actions/notifications';
import { trackCommerceEvent } from '@/app/actions/analytics';
import { sendTransactionalEmail } from '@/lib/services/mailer';
import { shouldSendSubmissionStatusEmail } from '@/app/actions/userPreferences';
import { getPaidListingPublishGate, getToolQuality } from '@/lib/services/toolQuality';

const publicLocales = ['en', 'cn', 'tw', 'jp', 'de', 'es', 'fr', 'pt', 'ru'];
const validStatuses = ['draft', 'pending', 'published', 'rejected'] as const;
const validPricing = ['free', 'freemium', 'paid'] as const;
const validOutreachStatuses = [
  'not_started',
  'contacted',
  'waiting_reply',
  'follow_up_due',
  'closed',
] as const;
const validOutreachClosedReasons = ['claimed', 'no_reply', 'invalid_contact', 'not_interested'] as const;

type ToolStatus = (typeof validStatuses)[number];
type ToolPricing = (typeof validPricing)[number];
export type OutreachStatus = (typeof validOutreachStatuses)[number];
export type OutreachClosedReason = (typeof validOutreachClosedReasons)[number];

const toolQualityScoreSql = `
  (
    (CASE WHEN category_id IS NOT NULL THEN 20 ELSE 0 END) +
    (CASE WHEN thumbnail_url IS NOT NULL AND thumbnail_url <> '' AND thumbnail_url NOT LIKE '%google.com/s2/favicons%' THEN 20 ELSE 0 END) +
    (CASE WHEN image_url IS NOT NULL AND image_url <> '' AND image_url NOT LIKE '%google.com/s2/favicons%' THEN 15 ELSE 0 END) +
    (CASE WHEN LENGTH(COALESCE(content->>'en', content->>'zh', content::text, '')) >= 80 THEN 20 ELSE 0 END) +
    (CASE WHEN LENGTH(COALESCE(detail->>'en', detail->>'zh', detail::text, '')) >= 160 THEN 15 ELSE 0 END) +
    (CASE WHEN pricing IS NOT NULL AND pricing <> '' THEN 5 ELSE 0 END) +
    (CASE WHEN array_length(tags, 1) > 0 THEN 5 ELSE 0 END)
  )
`;

const mediaNeededSql = `
  (
    image_url IS NULL
    OR image_url = ''
    OR image_url LIKE '%google.com/s2/favicons%'
    OR thumbnail_url IS NULL
    OR thumbnail_url = ''
    OR thumbnail_url LIKE '%google.com/s2/favicons%'
    OR features->'mediaReview'->>'needed' = 'true'
  )
`;

const publishReadySql = `
  (
    status = 'draft'
    AND ${toolQualityScoreSql} >= 80
    AND NOT ${mediaNeededSql}
  )
`;

const paidPublishBlockedSql = `
  (
    COALESCE(features->'submission'->'commercial'->>'plan', 'free') = 'standard_paid'
    AND (
      category_id IS NULL
      OR image_url IS NULL
      OR image_url = ''
      OR image_url LIKE '%google.com/s2/favicons%'
      OR thumbnail_url IS NULL
      OR thumbnail_url = ''
      OR thumbnail_url LIKE '%google.com/s2/favicons%'
      OR LENGTH(COALESCE(content->>'en', content->>'zh', content::text, '')) < 80
      OR LENGTH(COALESCE(detail->>'en', detail->>'zh', detail::text, '')) < 160
      OR pricing IS NULL
      OR pricing = ''
      OR array_length(tags, 1) IS NULL
      OR array_length(tags, 1) = 0
    )
  )
`;

export interface AdminTool {
  id: string;
  name: string;
  title: any;
  content: any;
  detail: any;
  url: string;
  image_url: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  tags: string[];
  pricing: string | null;
  status: string;
  features: Record<string, unknown> | null;
  submitted_by: string | null;
  ownerEmail: string | null;
  claimStatus: string | null;
  claimedAt: string | null;
  created_at: Date;
  updated_at: Date;
  view_count: number;
  click_count: number;
  average_rating: number;
  rating_count: number;
}

export interface AdminOutreachQueueItem {
  id: string;
  name: string;
  title: string;
  contactEmail: string;
  views: number;
  clicks: number;
  favorites: number;
  comments: number;
  daysSinceUpdate: number;
  suggestion: 'claim_listing' | 'featured_pitch' | 'content_collab';
  priorityScore: number;
  reason: string;
  outreachStatus: OutreachStatus;
  outreachUpdatedAt: string | null;
  outreachNote: string | null;
  outreachNextFollowUpAt: string | null;
  outreachClosedReason: OutreachClosedReason | null;
  outreachUpdatedByEmail: string | null;
}

export interface AdminOutreachHistorySummary {
  totalTracked: number;
  closedCount: number;
  claimedCount: number;
  noReplyCount: number;
  invalidContactCount: number;
  notInterestedCount: number;
  unclassifiedClosedCount: number;
  recentClosedCount: number;
  recentClaimedCount: number;
  recentNoReplyCount: number;
  recentInvalidContactCount: number;
  recentNotInterestedCount: number;
}

export interface AdminOutreachClassificationItem {
  id: string;
  name: string;
  title: string;
  contactEmail: string;
  claimStatus: string | null;
  outreachUpdatedAt: string | null;
  outreachNote: string | null;
  outreachClosedReason: OutreachClosedReason | null;
  outreachUpdatedByEmail: string | null;
}

export interface AdminOutreachCommercialBridgeSummary {
  claimedFromOutreachCount: number;
  paidPlanCount: number;
  paymentConfirmedCount: number;
  featuredReservedCount: number;
  featuredLiveCount: number;
  recentClaimedFromOutreachCount: number;
  previousClaimedFromOutreachCount: number;
  recentPaymentConfirmedCount: number;
  previousPaymentConfirmedCount: number;
  recentFeaturedReservedCount: number;
  previousFeaturedReservedCount: number;
  recentFeaturedLiveCount: number;
  previousFeaturedLiveCount: number;
}

export interface AdminOutreachExecutorSummaryItem {
  executorEmail: string;
  totalUpdates: number;
  recentUpdates: number;
  claimedCount: number;
  claimToPaidRate: number;
  claimToFeaturedLiveRate: number;
  paidPlanCount: number;
  paymentConfirmedCount: number;
  featuredReservedCount: number;
  featuredLiveCount: number;
}

export interface AdminPaidListingBlockerItem {
  id: string;
  name: string;
  title: string;
  updatedAt: string;
  blockers: string[];
}

export interface AdminPaidListingBlockerSummary {
  totalBlocked: number;
  blockerCounts: { label: string; count: number }[];
  items: AdminPaidListingBlockerItem[];
}

function getOutreachFollowUpPriority(value: string | null): number {
  if (!value) return 3;

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return 3;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) return 0;
  if (diffDays === 0) return 1;
  return 2;
}

function parseCount(value: unknown): number {
  return Number.parseInt(String(value ?? 0), 10);
}

function normalizeAdminTool(row: any): AdminTool {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
    view_count: Number(row.view_count ?? 0),
    click_count: Number(row.click_count ?? 0),
    average_rating: Number(row.average_rating ?? 0),
    rating_count: Number(row.rating_count ?? 0),
  };
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredText(value: string | undefined, field: string): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error(`${field} is required`);
  }

  return trimmed;
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (tags === undefined) {
    return undefined;
  }

  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function getLocalizedText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record.en || record.zh || Object.values(record)[0];
    return typeof candidate === 'string' ? candidate.trim() : '';
  }

  return '';
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function getCommercialFeature(features: unknown): Record<string, unknown> {
  const featureRecord = getRecord(features);
  const submission = getRecord(featureRecord.submission);
  return getRecord(submission.commercial);
}

function isStandardPaidSubmission(features: unknown): boolean {
  return getCommercialFeature(features).plan === 'standard_paid';
}

function getFeaturedDurationDays(commercial: Record<string, unknown>): number {
  const requestedDaysRaw = commercial.featuredDaysRequested;
  const requestedDays =
    typeof requestedDaysRaw === 'number'
      ? requestedDaysRaw
      : Number.parseInt(String(requestedDaysRaw ?? 0), 10) || 0;

  return [3, 7, 14].includes(requestedDays) ? requestedDays : 0;
}

function getPaidListingGateError(tool: {
  category_id?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  content?: unknown;
  detail?: unknown;
  pricing?: string | null;
  tags?: string[] | null;
  features?: unknown;
}): string | null {
  if (!isStandardPaidSubmission(tool.features)) {
    return null;
  }

  const gate = getPaidListingPublishGate(tool);

  if (gate.ready) {
    return null;
  }

  return `Paid listing is missing required publish fields: ${gate.blockers.join(', ')}`;
}

function buildCommercialStateForCurrentStatus(
  commercial: Record<string, unknown>,
  toolStatus: ToolStatus,
  transactionId?: string | null
): Record<string, unknown> {
  const now = new Date();
  const durationDays = getFeaturedDurationDays(commercial);
  const paymentConfirmed = commercial.paymentConfirmed === true || Boolean(transactionId);
  const isPublished = toolStatus === 'published';

  const nextCommercial: Record<string, unknown> = {
    ...commercial,
    ...(transactionId ? { transactionId } : {}),
  };

  if (!paymentConfirmed) {
    return nextCommercial;
  }

  nextCommercial.paymentConfirmed = true;
  nextCommercial.paymentConfirmedAt =
    typeof commercial.paymentConfirmedAt === 'string' && commercial.paymentConfirmedAt
      ? commercial.paymentConfirmedAt
      : now.toISOString();

  if (!isPublished) {
    nextCommercial.status = 'payment_confirmed_pending_review';
    nextCommercial.featuredReservedAt =
      typeof commercial.featuredReservedAt === 'string' && commercial.featuredReservedAt
        ? commercial.featuredReservedAt
        : now.toISOString();
    nextCommercial.isSponsoredPlacement = false;
    nextCommercial.featuredActiveFrom = null;
    nextCommercial.featuredUntil = null;
    return nextCommercial;
  }

  if (durationDays > 0) {
    const existingFrom =
      typeof commercial.featuredActiveFrom === 'string' && commercial.featuredActiveFrom
        ? commercial.featuredActiveFrom
        : '';
    const existingUntil =
      typeof commercial.featuredUntil === 'string' && commercial.featuredUntil
        ? commercial.featuredUntil
        : '';

    const shouldGenerateWindow = !existingFrom || !existingUntil;
    const activeFrom = shouldGenerateWindow ? now : new Date(existingFrom);
    const activeUntil = shouldGenerateWindow
      ? new Date(activeFrom.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : new Date(existingUntil);

    nextCommercial.status = 'active';
    nextCommercial.isSponsoredPlacement = true;
    nextCommercial.featuredActiveFrom = activeFrom.toISOString();
    nextCommercial.featuredUntil = activeUntil.toISOString();
    nextCommercial.activatedAt =
      typeof commercial.activatedAt === 'string' && commercial.activatedAt
        ? commercial.activatedAt
        : now.toISOString();
    return nextCommercial;
  }

  nextCommercial.status = 'review_completed';
  nextCommercial.isSponsoredPlacement = false;
  nextCommercial.featuredActiveFrom = null;
  nextCommercial.featuredUntil = null;
  return nextCommercial;
}

function cleanDraftSummary(summary: string): string {
  return summary
    .split('. It is especially relevant')[0]
    .split('. Review its positioning')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

function buildImprovedDraftCopy(tool: AdminTool) {
  const title = getLocalizedText(tool.title) || tool.name;
  const currentSummary = getLocalizedText(tool.content);
  const currentDetail = getLocalizedText(tool.detail);
  const features = getRecord(tool.features);
  const collection = getRecord(features.collection);
  const suggestedUseCases = getStringArray(features.suggestedUseCases);
  const scoreReason = typeof collection.scoreReason === 'string' ? collection.scoreReason : '';
  const sourceUrl = typeof collection.sourceUrl === 'string' ? collection.sourceUrl : '';
  const outboundUrl =
    (typeof collection.externalUrl === 'string' && collection.externalUrl) ||
    (typeof collection.productHuntRedirectUrl === 'string' && collection.productHuntRedirectUrl) ||
    tool.url;
  const baseSummary =
    cleanDraftSummary(currentSummary) ||
    `${title} is an AI tool collected for editorial review on AI Best Tool.`;
  const primaryUseCase =
    suggestedUseCases[0] || 'help users evaluate and adopt the product in practical workflows';
  const improvedEn =
    baseSummary.length >= 90
      ? baseSummary
      : `${baseSummary}. It is especially relevant for teams focused on ${primaryUseCase.toLowerCase()}. Review its positioning, pricing, and media before publishing.`;
  const improvedZh =
    `${title} 是一个由 AI Best Tool 自动采集进入审核队列的 AI 工具。它的核心简介是：${baseSummary}。它适合关注「${primaryUseCase}」的用户或团队。发布前建议继续核对官网、价格、截图和核心功能描述。`;
  const detailLines = [
    improvedEn,
    '',
    'Editorial notes:',
    `- Primary use case: ${primaryUseCase}`,
    ...suggestedUseCases.slice(1).map((useCase) => `- Additional use case: ${useCase}`),
    `- Pricing status: ${tool.pricing || 'freemium'}`,
    tool.tags.length > 0 ? `- Suggested tags: ${tool.tags.join(', ')}` : '',
    scoreReason ? `- Collection signal: ${scoreReason}` : '',
    '',
    'Review before publishing:',
    '- Confirm the official website and outbound destination.',
    '- Add a logo or screenshot if available.',
    '- Refine the Chinese copy if the product is important for Chinese users.',
    '',
    sourceUrl ? `Source URL: ${sourceUrl}` : '',
    outboundUrl ? `Outbound URL: ${outboundUrl}` : '',
  ].filter(Boolean);
  const isGeneratedCollectionDetail =
    currentDetail.includes('Collection score:') ||
    currentDetail.includes('Suggested category:') ||
    currentDetail.includes('Source URL:');
  const detailEn =
    currentDetail.length >= 220 && !isGeneratedCollectionDetail
      ? currentDetail
      : detailLines.join('\n');
  const detailZh = [
    improvedZh,
    '',
    '编辑审核要点：',
    `- 主要使用场景：${primaryUseCase}`,
    tool.tags.length > 0 ? `- 建议标签：${tool.tags.join(', ')}` : '',
    scoreReason ? `- 采集判断：${scoreReason}` : '',
    '',
    '发布前请确认：',
    '- 官网或跳转地址是否正确。',
    '- 是否需要补充 logo、截图或更完整的媒体素材。',
    '- 分类、定价和中文介绍是否准确。',
    '',
    sourceUrl ? `来源 URL：${sourceUrl}` : '',
    outboundUrl ? `跳转 URL：${outboundUrl}` : '',
  ].filter(Boolean).join('\n');

  return {
    content: {
      en: improvedEn,
      zh: improvedZh,
    },
    detail: {
      en: detailEn,
      zh: detailZh,
    },
    features: {
      ...features,
      draftImprovement: {
        improvedAt: new Date().toISOString(),
        method: 'rule-based-editorial-template',
      },
    },
  };
}

function assertStatus(status: string | undefined): ToolStatus | undefined {
  if (status === undefined) {
    return undefined;
  }

  if (!validStatuses.includes(status as ToolStatus)) {
    throw new Error('Invalid tool status');
  }

  return status as ToolStatus;
}

function assertPricing(pricing: string | undefined): ToolPricing | undefined {
  if (pricing === undefined) {
    return undefined;
  }

  if (!validPricing.includes(pricing as ToolPricing)) {
    throw new Error('Invalid pricing value');
  }

  return pricing as ToolPricing;
}

function revalidateAdminToolPaths() {
  revalidatePath('/admin/tools');

  for (const locale of publicLocales) {
    revalidatePath(`/${locale}/admin/tools`);
  }
}

function revalidatePublicToolPaths(name?: string | null) {
  revalidatePath('/');
  revalidatePath('/explore');

  for (const locale of publicLocales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/explore`);
  }

  if (!name) {
    return;
  }

  revalidatePath(`/ai/${name}`);

  for (const locale of publicLocales) {
    revalidatePath(`/${locale}/ai/${name}`);
  }
}

async function notifySubmissionStatusChange(
  submittedBy: string | null,
  status: ToolStatus,
  toolName: string,
  toolTitle?: string,
  submittedByEmail?: string | null,
  reason?: string | null,
) {
  if (!submittedBy) {
    return;
  }

  const displayName = toolTitle?.trim() || toolName;
  const rejectionReason = reason?.trim() || '';
  const profileLink = '/profile/submissions';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const profileUrl = `${siteUrl}${profileLink}`;
  const toolUrl = `${siteUrl}/ai/${toolName}`;
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  try {
    if (status === 'published') {
      await createNotification(
        submittedBy,
        'submission_status',
        'Your tool was published / 你的工具已发布',
        `${displayName} is now live. Great work! / ${displayName} 已正式发布，做得很棒！`,
        `/ai/${toolName}`
      );
      if (submittedByEmail && (await shouldSendSubmissionStatusEmail(submittedBy))) {
        await sendTransactionalEmail({
          to: submittedByEmail,
          subject: `[AI Best Tool] ${displayName} was published`,
          text: `${displayName} is now live on AI Best Tool.`,
          html: `
            <p>${displayName} is now live on AI Best Tool.</p>
            <p><a href="${toolUrl}">View published tool</a></p>
          `,
        });
      }
      return;
    }

    if (status === 'rejected') {
      const hasReason = rejectionReason.length > 0;
      const reasonText = hasReason ? `Reason: ${rejectionReason}\n` : '';
      const reasonHtmlBlock = hasReason ? `<p><strong>Reason:</strong> ${escapeHtml(rejectionReason)}</p>` : '';
      const notificationContent = rejectionReason
        ? `${displayName} was reviewed but not published yet. Reason: ${rejectionReason} / ${displayName} 已审核但暂未发布。原因：${rejectionReason}`
        : `${displayName} was reviewed but not published yet. Please refine details and resubmit. / ${displayName} 已审核但暂未发布，请完善信息后重新提交。`;

      await createNotification(
        submittedBy,
        'submission_status',
        'Submission needs updates / 你的提交需要调整',
        notificationContent,
        profileLink
      );
      if (submittedByEmail && (await shouldSendSubmissionStatusEmail(submittedBy))) {
        await sendTransactionalEmail({
          to: submittedByEmail,
          subject: `[AI Best Tool] ${displayName} needs updates`,
          text: `${displayName} was reviewed but not published yet.\n${reasonText}Please refine details and resubmit.`,
          html: `
            <p>${displayName} was reviewed but not published yet.</p>
            ${reasonHtmlBlock}
            <p>Please refine details and resubmit.</p>
            <p><a href="${profileUrl}">View submission status</a></p>
          `,
        });
      }
      return;
    }

    if (status === 'pending') {
      await createNotification(
        submittedBy,
        'submission_status',
        'Submission in review / 你的提交正在审核',
        `${displayName} has entered the review queue. / ${displayName} 已进入审核队列。`,
        profileLink
      );
      if (submittedByEmail && (await shouldSendSubmissionStatusEmail(submittedBy))) {
        await sendTransactionalEmail({
          to: submittedByEmail,
          subject: `[AI Best Tool] ${displayName} is in review`,
          text: `${displayName} has entered the review queue.`,
          html: `
            <p>${displayName} has entered the review queue.</p>
            <p><a href="${profileUrl}">View submission status</a></p>
          `,
        });
      }
      return;
    }
  } catch (error) {
    console.error('Failed to notify submission status change:', error);
  }
}

function getSubmittedByEmailFromFeatures(features: unknown): string | null {
  if (!features || typeof features !== 'object') {
    return null;
  }

  const record = features as Record<string, unknown>;
  const submission =
    record.submission && typeof record.submission === 'object'
      ? (record.submission as Record<string, unknown>)
      : null;
  const email = submission?.submittedByEmail;

  return typeof email === 'string' && email.trim().length > 0 ? email.trim() : null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Get all tools for admin (including pending, rejected, etc.)
 */
export async function getAdminTools(filters?: {
  status?: string;
  claimStatus?: string;
  search?: string;
  collected?: boolean;
  needsMedia?: boolean;
  needsDecision?: boolean;
  quality?: 'low' | 'medium' | 'high';
  ready?: boolean;
  overdue?: boolean;
  followedUp?: boolean;
  staleFollowUp?: boolean;
  paidIntent?: boolean;
  featuredIntent?: boolean;
  paidBlockers?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ tools: AdminTool[]; total: number }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM tools WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    const status = assertStatus(filters?.status);
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const search = filters?.search?.trim();
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR title::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const claimStatus =
      filters?.claimStatus === 'claimed' ||
      filters?.claimStatus === 'pending' ||
      filters?.claimStatus === 'rejected' ||
      filters?.claimStatus === 'unclaimed'
        ? filters.claimStatus
        : undefined;
    if (claimStatus) {
      if (claimStatus === 'unclaimed') {
        query += ` AND COALESCE(claim_status, 'unclaimed') = 'unclaimed'`;
      } else {
        query += ` AND COALESCE(claim_status, 'unclaimed') = $${paramIndex}`;
        params.push(claimStatus);
        paramIndex++;
      }
    }

    if (filters?.collected) {
      query += ` AND features ? 'collection'`;
    }

    if (filters?.needsMedia) {
      query += ` AND ${mediaNeededSql}`;
    }

    if (filters?.needsDecision) {
      query += `
        AND (
          features->'decision' IS NULL
          OR jsonb_typeof(features->'decision') <> 'object'
          OR COALESCE(jsonb_array_length(features->'decision'->'compareAxes'->'en'), 0) = 0
          OR COALESCE(jsonb_array_length(features->'decision'->'compareAxes'->'zh'), 0) = 0
          OR COALESCE(features->'decision'->'officialSummary'->>'en', '') = ''
          OR COALESCE(features->'decision'->'officialSummary'->>'zh', '') = ''
          OR COALESCE(features->'decision'->'freshnessSummary'->>'en', '') = ''
          OR COALESCE(features->'decision'->'freshnessSummary'->>'zh', '') = ''
          OR COALESCE(features->'decision'->'pricingSummary'->>'en', '') = ''
          OR COALESCE(features->'decision'->'pricingSummary'->>'zh', '') = ''
          OR COALESCE(features->'decision'->'mediaSummary'->>'en', '') = ''
          OR COALESCE(features->'decision'->'mediaSummary'->>'zh', '') = ''
          OR COALESCE(features->'decision'->'communitySummary'->>'en', '') = ''
          OR COALESCE(features->'decision'->'communitySummary'->>'zh', '') = ''
        )
      `;
    }

    if (filters?.ready) {
      query += ` AND ${publishReadySql}`;
    }

    if (filters?.overdue) {
      query += ` AND status = 'pending' AND created_at <= NOW() - INTERVAL '48 hours'`;
    }

    if (filters?.followedUp === true) {
      query += ` AND COALESCE(features->'followUp'->>'followedUp', 'false') = 'true'`;
    } else if (filters?.followedUp === false) {
      query += ` AND COALESCE(features->'followUp'->>'followedUp', 'false') <> 'true'`;
    }

    if (filters?.staleFollowUp) {
      query += `
        AND status = 'pending'
        AND COALESCE(features->'followUp'->>'followedUp', 'false') = 'true'
        AND (features->'followUp'->>'followedUpAt') IS NOT NULL
        AND (features->'followUp'->>'followedUpAt')::timestamptz <= NOW() - INTERVAL '3 days'
      `;
    }

    if (filters?.paidIntent) {
      query += ` AND COALESCE(features->'submission'->'commercial'->>'plan', 'free') = 'standard_paid'`;
    }

    if (filters?.featuredIntent) {
      query += ` AND COALESCE((features->'submission'->'commercial'->>'featuredDaysRequested')::int, 0) > 0`;
    }

    if (filters?.paidBlockers) {
      query += ` AND ${paidPublishBlockedSql}`;
    }

    if (filters?.quality) {
      if (filters.quality === 'low') {
        query += ` AND ${toolQualityScoreSql} < 55`;
      } else if (filters.quality === 'medium') {
        query += ` AND ${toolQualityScoreSql} >= 55 AND ${toolQualityScoreSql} < 80`;
      } else if (filters.quality === 'high') {
        query += ` AND ${toolQualityScoreSql} >= 80`;
      }
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseCount(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);

    return {
      tools: result.rows.map(normalizeAdminTool),
      total,
    };
  } catch (error) {
    console.error('Error fetching admin tools:', error);
    throw error;
  }
}

/**
 * Get a single tool by ID for admin
 */
export async function getAdminToolById(id: string): Promise<AdminTool | null> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query('SELECT * FROM tools WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return normalizeAdminTool(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin tool:', error);
    throw error;
  }
}

/**
 * Publish draft tools only when they pass the publishing checklist.
 */
export async function publishReadyTools(
  toolIds: string[]
): Promise<{ success: boolean; published: number; skipped: number; error?: string }> {
  try {
    await requireAdmin();

    const ids = Array.from(new Set(toolIds.map((id) => id.trim()).filter(Boolean)));

    if (ids.length === 0) {
      return { success: false, published: 0, skipped: 0, error: 'No tools selected' };
    }

    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET status = 'published', updated_at = NOW()
        WHERE id::text = ANY($1::text[])
          AND ${publishReadySql}
        RETURNING name
      `,
      [ids]
    );

    revalidateAdminToolPaths();
    for (const row of result.rows) {
      revalidatePublicToolPaths(row.name);
    }

    return {
      success: true,
      published: result.rowCount || 0,
      skipped: ids.length - (result.rowCount || 0),
    };
  } catch (error) {
    console.error('Error publishing ready tools:', error);
    return {
      success: false,
      published: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Failed to publish ready tools',
    };
  }
}

export async function markPendingFollowedUp(
  toolIds: string[]
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    await requireAdmin();

    const ids = Array.from(new Set(toolIds.map((id) => id.trim()).filter(Boolean)));
    if (ids.length === 0) {
      return { success: false, updated: 0, error: 'No tools selected' };
    }

    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET
          features = COALESCE(features, '{}'::jsonb) || jsonb_build_object(
            'followUp',
            jsonb_build_object(
              'followedUp', true,
              'followedUpAt', NOW()::text
            )
          ),
          updated_at = NOW()
        WHERE id::text = ANY($1::text[])
          AND status = 'pending'
          AND submitted_by IS NOT NULL
          AND created_at <= NOW() - INTERVAL '48 hours'
        RETURNING name
      `,
      [ids]
    );

    revalidateAdminToolPaths();
    for (const row of result.rows) {
      revalidatePublicToolPaths(row.name);
    }

    return { success: true, updated: result.rowCount || 0 };
  } catch (error) {
    console.error('Error marking pending tools as followed up:', error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : 'Failed to mark follow-up',
    };
  }
}

/**
 * Approve a tool (change status to published)
 */
export async function approveTool(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const existingResult = await pool.query(
      `
        SELECT id, name, submitted_by, title, features, category_id, image_url, thumbnail_url, content, detail, pricing, tags
        FROM tools
        WHERE id = $1
        LIMIT 1
      `,
      [toolId]
    );

    if (existingResult.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const existingRow = existingResult.rows[0];
    const gateError = getPaidListingGateError(existingRow);
    if (gateError) {
      return { success: false, error: gateError };
    }

    const existingFeatures = getRecord(existingRow.features);
    const submission = getRecord(existingFeatures.submission);
    const commercial = getCommercialFeature(existingRow.features);
    const nextFeatures = {
      ...existingFeatures,
      submission: {
        ...submission,
        commercial: buildCommercialStateForCurrentStatus(commercial, 'published'),
      },
    };

    const result = await pool.query(
      `UPDATE tools
       SET status = $1, features = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING name, submitted_by, title, features`,
      ['published', JSON.stringify(nextFeatures), toolId]
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      const localizedTitle =
        typeof row.title === 'object' && row.title !== null
          ? (row.title.en || row.title.zh || '')
          : '';
      await trackCommerceEvent(
        'publish_success',
        {
          status: 'published',
          title: localizedTitle || row.name || null,
        },
        toolId,
        row.submitted_by ?? null,
      );
      await notifySubmissionStatusChange(
        row.submitted_by ?? null,
        'published',
        row.name,
        localizedTitle,
        getSubmittedByEmailFromFeatures(row.features)
      );
    }

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(result.rows[0]?.name);

    return { success: true };
  } catch (error) {
    console.error('Error approving tool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve tool',
    };
  }
}

/**
 * Reject a tool (change status to rejected)
 */
export async function rejectTool(
  toolId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const rejectionReason = reason?.trim() || null;
    const result = await pool.query(
      `UPDATE tools
       SET status = $1,
           updated_at = NOW(),
           features = jsonb_set(
             COALESCE(features, '{}'::jsonb),
             '{submission,review}',
             COALESCE(features->'submission'->'review', '{}'::jsonb)
               || jsonb_build_object('rejectionReason', NULLIF($3::text, ''), 'rejectedAt', NOW()),
             true
           )
       WHERE id = $2
       RETURNING name, submitted_by, title, features`,
      ['rejected', toolId, rejectionReason]
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      const localizedTitle =
        typeof row.title === 'object' && row.title !== null
          ? (row.title.en || row.title.zh || '')
          : '';
      await notifySubmissionStatusChange(
        row.submitted_by ?? null,
        'rejected',
        row.name,
        localizedTitle,
        getSubmittedByEmailFromFeatures(row.features),
        reason,
      );
    }

    revalidateAdminToolPaths();

    return { success: true };
  } catch (error) {
    console.error('Error rejecting tool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject tool',
    };
  }
}

/**
 * Update tool information
 */
export async function updateTool(
  toolId: string,
  data: {
    name?: string;
    title?: any;
    content?: any;
    detail?: any;
    url?: string;
    image_url?: string;
    thumbnail_url?: string;
    category_id?: string | null;
    tags?: string[];
    pricing?: string;
    status?: string;
    commercialPlan?: 'free' | 'standard_paid';
    commercialStatus?: string;
    fastTrackRequested?: boolean;
    featuredDaysRequested?: number;
    paymentConfirmed?: boolean;
    featuredActiveFrom?: string | null;
    featuredUntil?: string | null;
    isSponsoredPlacement?: boolean;
    paymentUrl?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const existingResult = await pool.query(
      `
        SELECT
          name,
          status,
          submitted_by,
          title,
          features,
          category_id,
          image_url,
          thumbnail_url,
          content,
          detail,
          pricing,
          tags
        FROM tools
        WHERE id = $1
      `,
      [toolId]
    );

    if (existingResult.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const existingName = existingResult.rows[0].name as string;
    const existingStatus = existingResult.rows[0].status as ToolStatus;
    const submittedBy = (existingResult.rows[0].submitted_by as string | null) || null;
    const existingTitleRaw = existingResult.rows[0].title;
    const existingFeatures = getRecord(existingResult.rows[0].features);
    const submittedByEmail = getSubmittedByEmailFromFeatures(existingResult.rows[0].features);
    const nextStatus = assertStatus(data.status);
    const nextPricing = assertPricing(data.pricing);
    const nextTags = normalizeTags(data.tags);
    const nextCommercialPlan =
      data.commercialPlan !== undefined
        ? data.commercialPlan
        : getCommercialFeature(existingResult.rows[0].features).plan;

    const prospectiveTool = {
      category_id:
        data.category_id !== undefined ? normalizeNullableText(data.category_id) : existingResult.rows[0].category_id,
      image_url:
        data.image_url !== undefined ? normalizeNullableText(data.image_url) : existingResult.rows[0].image_url,
      thumbnail_url:
        data.thumbnail_url !== undefined
          ? normalizeNullableText(data.thumbnail_url)
          : existingResult.rows[0].thumbnail_url,
      content: data.content !== undefined ? data.content : existingResult.rows[0].content,
      detail: data.detail !== undefined ? data.detail : existingResult.rows[0].detail,
      pricing: nextPricing !== undefined ? nextPricing : existingResult.rows[0].pricing,
      tags: nextTags !== undefined ? nextTags : existingResult.rows[0].tags,
      features: {
        ...getRecord(existingResult.rows[0].features),
        submission: {
          ...getRecord(getRecord(existingResult.rows[0].features).submission),
          commercial: {
            ...getCommercialFeature(existingResult.rows[0].features),
            ...(nextCommercialPlan ? { plan: nextCommercialPlan } : {}),
          },
        },
      },
    };

    if (nextStatus === 'published') {
      const gateError = getPaidListingGateError(prospectiveTool);
      if (gateError) {
        return { success: false, error: gateError };
      }
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(normalizeRequiredText(data.name, 'Name'));
      paramIndex++;
    }

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(JSON.stringify(data.title));
      paramIndex++;
    }

    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.push(JSON.stringify(data.content));
      paramIndex++;
    }

    if (data.detail !== undefined) {
      updates.push(`detail = $${paramIndex}`);
      params.push(JSON.stringify(data.detail));
      paramIndex++;
    }

    if (data.url !== undefined) {
      updates.push(`url = $${paramIndex}`);
      params.push(normalizeRequiredText(data.url, 'Website URL'));
      paramIndex++;
    }

    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex}`);
      params.push(normalizeNullableText(data.image_url));
      paramIndex++;
    }

    if (data.thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex}`);
      params.push(normalizeNullableText(data.thumbnail_url));
      paramIndex++;
    }

    if (data.category_id !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      params.push(normalizeNullableText(data.category_id));
      paramIndex++;
    }

    if (nextTags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      params.push(nextTags);
      paramIndex++;
    }

    if (nextPricing !== undefined) {
      updates.push(`pricing = $${paramIndex}`);
      params.push(nextPricing);
      paramIndex++;
    }

    if (nextStatus !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(nextStatus);
      paramIndex++;
    }

    const shouldUpdateCommercial =
      data.commercialPlan !== undefined ||
      data.commercialStatus !== undefined ||
      data.fastTrackRequested !== undefined ||
      data.featuredDaysRequested !== undefined ||
      data.paymentConfirmed !== undefined ||
      data.featuredActiveFrom !== undefined ||
      data.featuredUntil !== undefined ||
      data.isSponsoredPlacement !== undefined ||
      data.paymentUrl !== undefined ||
      nextStatus === 'published';

    if (shouldUpdateCommercial) {
      const submission = getRecord(existingFeatures.submission);
      const commercial = getRecord(submission.commercial);
      let nextCommercial: Record<string, unknown> = {
        ...commercial,
        ...(data.commercialPlan !== undefined ? { plan: data.commercialPlan } : {}),
        ...(data.commercialStatus !== undefined ? { status: data.commercialStatus } : {}),
        ...(data.fastTrackRequested !== undefined
          ? { fastTrackRequested: data.fastTrackRequested }
          : {}),
        ...(data.featuredDaysRequested !== undefined
          ? { featuredDaysRequested: data.featuredDaysRequested }
          : {}),
        ...(data.paymentConfirmed !== undefined ? { paymentConfirmed: data.paymentConfirmed } : {}),
        ...(data.featuredActiveFrom !== undefined
          ? { featuredActiveFrom: normalizeNullableText(data.featuredActiveFrom) }
          : {}),
        ...(data.featuredUntil !== undefined
          ? { featuredUntil: normalizeNullableText(data.featuredUntil) }
          : {}),
        ...(data.isSponsoredPlacement !== undefined
          ? { isSponsoredPlacement: data.isSponsoredPlacement }
          : {}),
        ...(data.paymentUrl !== undefined ? { paymentUrl: normalizeNullableText(data.paymentUrl) } : {}),
        updatedAt: new Date().toISOString(),
      };

      if (nextStatus === 'published') {
        nextCommercial = buildCommercialStateForCurrentStatus(nextCommercial, 'published');
      }

      const nextFeatures = {
        ...existingFeatures,
        submission: {
          ...submission,
          commercial: nextCommercial,
        },
      };

      updates.push(`features = $${paramIndex}`);
      params.push(JSON.stringify(nextFeatures));
      paramIndex++;
    }

    if (updates.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    updates.push(`updated_at = NOW()`);
    params.push(toolId);

    const query = `UPDATE tools SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING status, name, title, features`;
    const updated = await pool.query(query, params);

    const finalStatus = (updated.rows[0]?.status as ToolStatus | undefined) || existingStatus;
    if (submittedBy && finalStatus !== existingStatus) {
      const titleObj = updated.rows[0]?.title ?? existingTitleRaw;
      const localizedTitle =
        typeof titleObj === 'object' && titleObj !== null
          ? (titleObj.en || titleObj.zh || '')
          : '';
      const nextName = (updated.rows[0]?.name as string | undefined) || existingName;
      const nextEmail =
        getSubmittedByEmailFromFeatures(updated.rows[0]?.features) || submittedByEmail;
      await notifySubmissionStatusChange(
        submittedBy,
        finalStatus,
        nextName,
        localizedTitle,
        nextEmail
      );
    }

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(existingName);
    revalidatePublicToolPaths(data.name?.trim() || existingName);

    return { success: true };
  } catch (error) {
    console.error('Error updating tool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tool',
    };
  }
}

export async function improveDraftTool(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query('SELECT * FROM tools WHERE id = $1', [toolId]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const tool = normalizeAdminTool(result.rows[0]);

    if (!['draft', 'pending'].includes(tool.status)) {
      return { success: false, error: 'Only draft or pending tools can be improved.' };
    }

    const improved = buildImprovedDraftCopy(tool);
    await pool.query(
      `
        UPDATE tools
        SET content = $2,
            detail = $3,
            features = $4,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        toolId,
        JSON.stringify(improved.content),
        JSON.stringify(improved.detail),
        JSON.stringify(improved.features),
      ]
    );

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(tool.name);

    return { success: true };
  } catch (error) {
    console.error('Error improving draft tool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to improve draft',
    };
  }
}

export async function markToolMediaNeeded(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query('SELECT name, features FROM tools WHERE id = $1', [
      toolId,
    ]);

    if (result.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const features = getRecord(result.rows[0].features);
    await pool.query(
      `
        UPDATE tools
        SET features = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        toolId,
        JSON.stringify({
          ...features,
          mediaReview: {
            needed: true,
            markedAt: new Date().toISOString(),
            reason: 'Logo or thumbnail missing before publication.',
          },
        }),
      ]
    );

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(result.rows[0].name);

    return { success: true };
  } catch (error) {
    console.error('Error marking media needed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark media needed',
    };
  }
}

export async function useToolImageAsThumbnail(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(
      'SELECT name, image_url FROM tools WHERE id = $1',
      [toolId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const imageUrl = normalizeNullableText(result.rows[0].image_url);

    if (!imageUrl) {
      return { success: false, error: 'Image URL is empty.' };
    }

    await pool.query(
      `
        UPDATE tools
        SET thumbnail_url = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [toolId, imageUrl]
    );

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(result.rows[0].name);

    return { success: true };
  } catch (error) {
    console.error('Error using image as thumbnail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to use image as thumbnail',
    };
  }
}

/**
 * Delete a tool
 */
export async function deleteTool(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query('DELETE FROM tools WHERE id = $1 RETURNING name', [
      toolId,
    ]);

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(result.rows[0]?.name);

    return { success: true };
  } catch (error) {
    console.error('Error deleting tool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tool',
    };
  }
}

/**
 * Get tools statistics
 */
export async function getToolsStats(): Promise<{
  total: number;
  published: number;
  pending: number;
  rejected: number;
  draft: number;
  claimed: number;
  claimPending: number;
  claimRejected: number;
  claimUnclaimed: number;
}> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE COALESCE(claim_status, 'unclaimed') = 'claimed') as claimed,
        COUNT(*) FILTER (WHERE COALESCE(claim_status, 'unclaimed') = 'pending') as claim_pending,
        COUNT(*) FILTER (WHERE COALESCE(claim_status, 'unclaimed') = 'rejected') as claim_rejected,
        COUNT(*) FILTER (WHERE COALESCE(claim_status, 'unclaimed') = 'unclaimed') as claim_unclaimed
      FROM tools
    `);

    return {
      total: parseCount(result.rows[0].total),
      published: parseCount(result.rows[0].published),
      pending: parseCount(result.rows[0].pending),
      rejected: parseCount(result.rows[0].rejected),
      draft: parseCount(result.rows[0].draft),
      claimed: parseCount(result.rows[0].claimed),
      claimPending: parseCount(result.rows[0].claim_pending),
      claimRejected: parseCount(result.rows[0].claim_rejected),
      claimUnclaimed: parseCount(result.rows[0].claim_unclaimed),
    };
  } catch (error) {
    console.error('Error fetching tools stats:', error);
    return {
      total: 0,
      published: 0,
      pending: 0,
      rejected: 0,
      draft: 0,
      claimed: 0,
      claimPending: 0,
      claimRejected: 0,
      claimUnclaimed: 0,
    };
  }
}

export async function getOperationalStats(
  range: '7d' | '30d' | 'all' = 'all'
): Promise<{
  candidatesLast24h: number;
  newCandidates: number;
  draftTools: number;
  collectedDrafts: number;
  needsMediaDrafts: number;
  lowQualityDrafts: number;
  readyDrafts: number;
  pendingDeveloperSubmissions: number;
  overduePendingSubmissions: number;
  followedUpOverdueSubmissions: number;
  }> {
  try {
    await requireAdmin();

    const pool = getPool();
    const createdAtFilter =
      range === '7d'
        ? `AND created_at >= NOW() - INTERVAL '7 days'`
        : range === '30d'
        ? `AND created_at >= NOW() - INTERVAL '30 days'`
        : '';
    const result = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)::int
          FROM collection_candidates
          WHERE created_at >= NOW() - INTERVAL '24 hours'
        ) AS candidates_last_24h,
        (
          SELECT COUNT(*)::int
          FROM collection_candidates
          WHERE status = 'new'
        ) AS new_candidates,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_tools,
        COUNT(*) FILTER (
          WHERE status = 'draft'
            AND features ? 'collection'
        )::int AS collected_drafts,
        COUNT(*) FILTER (
          WHERE status = 'draft'
            AND ${mediaNeededSql}
        )::int AS needs_media_drafts,
        COUNT(*) FILTER (
          WHERE status = 'draft'
            AND ${toolQualityScoreSql} < 55
        )::int AS low_quality_drafts,
        COUNT(*) FILTER (
          WHERE ${publishReadySql}
        )::int AS ready_drafts,
        COUNT(*) FILTER (
          WHERE status = 'pending'
            AND submitted_by IS NOT NULL
            ${createdAtFilter}
        )::int AS pending_developer_submissions,
        COUNT(*) FILTER (
          WHERE status = 'pending'
            AND submitted_by IS NOT NULL
            AND created_at <= NOW() - INTERVAL '48 hours'
            ${createdAtFilter}
        )::int AS overdue_pending_submissions
        ,
        COUNT(*) FILTER (
          WHERE status = 'pending'
            AND submitted_by IS NOT NULL
            AND created_at <= NOW() - INTERVAL '48 hours'
            AND COALESCE(features->'followUp'->>'followedUp', 'false') = 'true'
            ${createdAtFilter}
        )::int AS followed_up_overdue_submissions
      FROM tools
    `);
    const row = result.rows[0] || {};

    return {
      candidatesLast24h: Number(row.candidates_last_24h || 0),
      newCandidates: Number(row.new_candidates || 0),
      draftTools: Number(row.draft_tools || 0),
      collectedDrafts: Number(row.collected_drafts || 0),
      needsMediaDrafts: Number(row.needs_media_drafts || 0),
      lowQualityDrafts: Number(row.low_quality_drafts || 0),
      readyDrafts: Number(row.ready_drafts || 0),
      pendingDeveloperSubmissions: Number(row.pending_developer_submissions || 0),
      overduePendingSubmissions: Number(row.overdue_pending_submissions || 0),
      followedUpOverdueSubmissions: Number(row.followed_up_overdue_submissions || 0),
    };
  } catch (error) {
    console.error('Error fetching operational stats:', error);
    return {
      candidatesLast24h: 0,
      newCandidates: 0,
      draftTools: 0,
      collectedDrafts: 0,
      needsMediaDrafts: 0,
      lowQualityDrafts: 0,
      readyDrafts: 0,
      pendingDeveloperSubmissions: 0,
      overduePendingSubmissions: 0,
      followedUpOverdueSubmissions: 0,
    };
  }
}

export async function cleanupExpiredSponsoredPlacementsBySystem(): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET
          features = jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{submission,commercial,isSponsoredPlacement}',
            'false'::jsonb,
            true
          ),
          updated_at = NOW()
        WHERE
          COALESCE(features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true'
          AND NULLIF(features->'submission'->'commercial'->>'featuredUntil', '') IS NOT NULL
          AND NULLIF(features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz < NOW()
      `
    );

    revalidateAdminToolPaths();
    revalidatePublicToolPaths();

    return { success: true, updated: result.rowCount || 0 };
  } catch (error) {
    console.error('Error cleaning expired sponsored placements:', error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : 'Failed to clean expired sponsored placements',
    };
  }
}

type FeaturedRenewalReminderType = 'featured_ending_3d' | 'featured_ending_1d';
type ClaimInviteReminderType = 'claim_invite_7d';
type ProfileUpdateReminderType = 'profile_update_30d';

async function ensureFeaturedRenewalReminderLogTable() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS featured_renewal_reminder_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL,
      reminder_type TEXT NOT NULL,
      featured_until TIMESTAMPTZ NOT NULL,
      recipient_email TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_featured_renewal_reminder_logs
    ON featured_renewal_reminder_logs(tool_id, reminder_type, featured_until)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_featured_renewal_reminder_logs_sent_at
    ON featured_renewal_reminder_logs(sent_at DESC)
  `);
}

async function hasFeaturedRenewalReminderBeenSent(
  toolId: string,
  reminderType: FeaturedRenewalReminderType,
  featuredUntil: string,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT 1
      FROM featured_renewal_reminder_logs
      WHERE tool_id = $1
        AND reminder_type = $2
        AND featured_until = $3::timestamptz
      LIMIT 1
    `,
    [toolId, reminderType, featuredUntil],
  );

  return (result.rowCount || 0) > 0;
}

async function recordFeaturedRenewalReminderLog(input: {
  toolId: string;
  reminderType: FeaturedRenewalReminderType;
  featuredUntil: string;
  recipientEmail: string;
}) {
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO featured_renewal_reminder_logs (
        tool_id,
        reminder_type,
        featured_until,
        recipient_email
      )
      VALUES ($1, $2, $3::timestamptz, $4)
      ON CONFLICT (tool_id, reminder_type, featured_until) DO NOTHING
    `,
    [input.toolId, input.reminderType, input.featuredUntil, input.recipientEmail],
  );
}

async function ensureClaimInviteReminderLogTable() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS claim_invite_reminder_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL,
      reminder_type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_claim_invite_reminder_logs
    ON claim_invite_reminder_logs(tool_id, reminder_type)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_claim_invite_reminder_logs_sent_at
    ON claim_invite_reminder_logs(sent_at DESC)
  `);
}

async function hasClaimInviteReminderBeenSent(
  toolId: string,
  reminderType: ClaimInviteReminderType,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT 1
      FROM claim_invite_reminder_logs
      WHERE tool_id = $1
        AND reminder_type = $2
      LIMIT 1
    `,
    [toolId, reminderType],
  );

  return (result.rowCount || 0) > 0;
}

async function recordClaimInviteReminderLog(input: {
  toolId: string;
  reminderType: ClaimInviteReminderType;
  recipientEmail: string;
}) {
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO claim_invite_reminder_logs (
        tool_id,
        reminder_type,
        recipient_email
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (tool_id, reminder_type) DO NOTHING
    `,
    [input.toolId, input.reminderType, input.recipientEmail],
  );
}

async function ensureProfileUpdateReminderLogTable() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile_update_reminder_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL,
      reminder_type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      quality_score INT NOT NULL,
      missing_labels TEXT[] NOT NULL DEFAULT '{}',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_update_reminder_logs
    ON profile_update_reminder_logs(tool_id, reminder_type)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_profile_update_reminder_logs_sent_at
    ON profile_update_reminder_logs(sent_at DESC)
  `);
}

async function hasProfileUpdateReminderBeenSent(
  toolId: string,
  reminderType: ProfileUpdateReminderType,
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT 1
      FROM profile_update_reminder_logs
      WHERE tool_id = $1
        AND reminder_type = $2
      LIMIT 1
    `,
    [toolId, reminderType],
  );

  return (result.rowCount || 0) > 0;
}

async function recordProfileUpdateReminderLog(input: {
  toolId: string;
  reminderType: ProfileUpdateReminderType;
  recipientEmail: string;
  qualityScore: number;
  missingLabels: string[];
}) {
  const pool = getPool();
  await pool.query(
    `
      INSERT INTO profile_update_reminder_logs (
        tool_id,
        reminder_type,
        recipient_email,
        quality_score,
        missing_labels
      )
      VALUES ($1, $2, $3, $4, $5::text[])
      ON CONFLICT (tool_id, reminder_type) DO NOTHING
    `,
    [input.toolId, input.reminderType, input.recipientEmail, input.qualityScore, input.missingLabels],
  );
}

export async function sendFeaturedRenewalRemindersBySystem(): Promise<{
  success: boolean;
  sent: number;
  skipped: number;
  error?: string;
}> {
  try {
    const pool = getPool();
    await ensureFeaturedRenewalReminderLogTable();

    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.submitted_by::text AS "submittedBy",
          t.owner_email AS "ownerEmail",
          t.features,
          NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz AS "featuredUntil"
        FROM tools t
        WHERE COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true'
          AND NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '') IS NOT NULL
          AND NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz > NOW()
          AND NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz <= NOW() + INTERVAL '72 hours'
        ORDER BY "featuredUntil" ASC
      `,
    );

    const candidates = result.rows as Array<{
      id: string;
      name: string;
      title: unknown;
      submittedBy: string | null;
      ownerEmail: string | null;
      features: unknown;
      featuredUntil: string;
    }>;

    const reminderTasks = await Promise.all(
      candidates.map(async (tool) => {
        const daysLeft = Math.max(
          1,
          Math.ceil((new Date(tool.featuredUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        );
        const reminderType: FeaturedRenewalReminderType =
          daysLeft <= 1 ? 'featured_ending_1d' : 'featured_ending_3d';
        const titleRecord =
          tool.title && typeof tool.title === 'object'
            ? (tool.title as Record<string, unknown>)
            : null;
        const displayName =
          (typeof titleRecord?.en === 'string' && titleRecord.en.trim()) ||
          (typeof titleRecord?.zh === 'string' && titleRecord.zh.trim()) ||
          tool.name;
        const submittedByEmail = getSubmittedByEmailFromFeatures(tool.features);
        const recipientEmail = [tool.ownerEmail, submittedByEmail]
          .find((value): value is string => typeof value === 'string' && isValidEmail(value.trim()))
          ?.trim()
          .toLowerCase();

        if (!recipientEmail) {
          return { sent: 0, skipped: 1 };
        }

        const reminderAlreadySent = await hasFeaturedRenewalReminderBeenSent(
          tool.id,
          reminderType,
          tool.featuredUntil,
        );

        if (reminderAlreadySent) {
          return { sent: 0, skipped: 1 };
        }

        const subject =
          reminderType === 'featured_ending_1d'
            ? `[AI Best Tool] Featured placement ends tomorrow / 前排展示明天结束`
            : `[AI Best Tool] Featured placement ends soon / 前排展示即将结束`;
        const text = [
          `${displayName} currently has a featured window ending on ${new Date(tool.featuredUntil).toISOString()}.`,
          `There are about ${daysLeft} day${daysLeft === 1 ? '' : 's'} left.`,
          '',
          'If you want to keep the extra visibility, you can renew from My Submissions.',
        ].join('\n');
        const html = `
          <p><strong>${escapeHtml(displayName)}</strong> currently has a featured window ending on ${escapeHtml(
            new Date(tool.featuredUntil).toISOString(),
          )}.</p>
          <p>There are about ${daysLeft} day${daysLeft === 1 ? '' : 's'} left.</p>
          <p>If you want to keep the extra visibility, you can renew from My Submissions.</p>
        `;

        const emailResult = await sendTransactionalEmail({
          to: recipientEmail,
          subject,
          text,
          html,
        });

        if (emailResult.success) {
          await recordFeaturedRenewalReminderLog({
            toolId: tool.id,
            reminderType,
            featuredUntil: tool.featuredUntil,
            recipientEmail,
          });
        }

        return {
          sent: emailResult.success ? 1 : 0,
          skipped: emailResult.success ? 0 : 1,
        };
      }),
    );

    return {
      success: true,
      sent: reminderTasks.reduce((sum, item) => sum + item.sent, 0),
      skipped: reminderTasks.reduce((sum, item) => sum + item.skipped, 0),
    };
  } catch (error) {
    console.error('Error sending featured renewal reminders:', error);
    return {
      success: false,
      sent: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Failed to send featured renewal reminders',
    };
  }
}

export async function sendClaimInvitesBySystem(): Promise<{
  success: boolean;
  sent: number;
  skipped: number;
  error?: string;
}> {
  try {
    const pool = getPool();
    await ensureClaimInviteReminderLogTable();

    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.url,
          t.created_at AS "createdAt",
          t.owner_email AS "ownerEmail",
          t.claim_status AS "claimStatus",
          t.features,
          COALESCE(t.features->'submission'->>'submittedByEmail', '') AS "submittedByEmail"
        FROM tools t
        WHERE t.status = 'published'
          AND COALESCE(t.claim_status, 'unclaimed') = 'unclaimed'
          AND COALESCE(t.owner_email, '') = ''
          AND COALESCE(t.features->'submission'->>'submittedByEmail', '') <> ''
          AND t.created_at <= NOW() - INTERVAL '7 days'
        ORDER BY t.created_at ASC
      `,
    );

    const candidates = result.rows as Array<{
      id: string;
      name: string;
      title: unknown;
      url: string;
      createdAt: string;
      ownerEmail: string | null;
      claimStatus: string | null;
      features: unknown;
      submittedByEmail: string;
    }>;

    const reminderTasks = await Promise.all(
      candidates.map(async (tool) => {
        const reminderType: ClaimInviteReminderType = 'claim_invite_7d';
        const recipientEmail = tool.submittedByEmail.trim().toLowerCase();

        if (!isValidEmail(recipientEmail)) {
          return { sent: 0, skipped: 1 };
        }

        if (await hasClaimInviteReminderBeenSent(tool.id, reminderType)) {
          return { sent: 0, skipped: 1 };
        }

        const titleRecord =
          tool.title && typeof tool.title === 'object'
            ? (tool.title as Record<string, unknown>)
            : null;
        const displayName =
          (typeof titleRecord?.en === 'string' && titleRecord.en.trim()) ||
          (typeof titleRecord?.zh === 'string' && titleRecord.zh.trim()) ||
          tool.name;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const claimUrl = `${siteUrl.replace(/\/$/, '')}/en/developer/listing`;

        const subject = `[AI Best Tool] Claim your listing / 认领你的条目`;
        const text = [
          `We have a listing that may belong to you: ${displayName}.`,
          '',
          'If this is your product, you can claim it here:',
          claimUrl,
          '',
          'Claim details:',
          `- Listing: ${displayName}`,
          `- Listing URL: ${tool.url}`,
          '',
          'If this is not your tool, you can ignore this email.',
        ].join('\n');
        const html = `
          <p>We have a listing that may belong to you: <strong>${escapeHtml(displayName)}</strong>.</p>
          <p>If this is your product, you can claim it here:</p>
          <p><a href="${claimUrl}">${claimUrl}</a></p>
          <p><strong>Listing URL:</strong> ${escapeHtml(tool.url)}</p>
          <p>If this is not your tool, you can ignore this email.</p>
        `;

        const emailResult = await sendTransactionalEmail({
          to: recipientEmail,
          subject,
          text,
          html,
        });

        if (emailResult.success) {
          await recordClaimInviteReminderLog({
            toolId: tool.id,
            reminderType,
            recipientEmail,
          });
        }

        return {
          sent: emailResult.success ? 1 : 0,
          skipped: emailResult.success ? 0 : 1,
        };
      }),
    );

    return {
      success: true,
      sent: reminderTasks.reduce((sum, item) => sum + item.sent, 0),
      skipped: reminderTasks.reduce((sum, item) => sum + item.skipped, 0),
    };
  } catch (error) {
    console.error('Error sending claim invites:', error);
    return {
      success: false,
      sent: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Failed to send claim invites',
    };
  }
}

export async function sendProfileUpdateRemindersBySystem(): Promise<{
  success: boolean;
  sent: number;
  skipped: number;
  error?: string;
}> {
  try {
    const pool = getPool();
    await ensureProfileUpdateReminderLogTable();

    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.url,
          t.image_url,
          t.thumbnail_url,
          t.category_id,
          t.content,
          t.detail,
          t.pricing,
          t.tags,
          t.updated_at AS "updatedAt",
          t.owner_email AS "ownerEmail",
          t.submitted_by::text AS "submittedBy",
          t.features
        FROM tools t
        WHERE t.status = 'published'
          AND t.updated_at <= NOW() - INTERVAL '30 days'
          AND (
            COALESCE(t.owner_email, '') <> ''
            OR COALESCE(t.features->'submission'->>'submittedByEmail', '') <> ''
          )
        ORDER BY t.updated_at ASC
      `,
    );

    const candidates = result.rows as Array<{
      id: string;
      name: string;
      title: unknown;
      url: string;
      image_url: string | null;
      thumbnail_url: string | null;
      category_id: string | null;
      content: unknown;
      detail: unknown;
      pricing: string | null;
      tags: string[] | null;
      updatedAt: string;
      ownerEmail: string | null;
      submittedBy: string | null;
      features: unknown;
    }>;

    const reminderTasks = await Promise.all(
      candidates.map(async (tool) => {
        const reminderType: ProfileUpdateReminderType = 'profile_update_30d';
        const recipientEmail = [tool.ownerEmail, getSubmittedByEmailFromFeatures(tool.features)]
          .find((value): value is string => typeof value === 'string' && isValidEmail(value.trim()))
          ?.trim()
          .toLowerCase();

        if (!recipientEmail) {
          return { sent: 0, skipped: 1 };
        }

        if (await hasProfileUpdateReminderBeenSent(tool.id, reminderType)) {
          return { sent: 0, skipped: 1 };
        }

        const quality = getToolQuality({
          category_id: tool.category_id,
          image_url: tool.image_url,
          thumbnail_url: tool.thumbnail_url,
          content: tool.content,
          detail: tool.detail,
          pricing: tool.pricing,
          tags: tool.tags,
        });

        if (quality.missingLabels.length === 0) {
          return { sent: 0, skipped: 1 };
        }

        const titleRecord =
          tool.title && typeof tool.title === 'object'
            ? (tool.title as Record<string, unknown>)
            : null;
        const displayName =
          (typeof titleRecord?.en === 'string' && titleRecord.en.trim()) ||
          (typeof titleRecord?.zh === 'string' && titleRecord.zh.trim()) ||
          tool.name;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const submissionsUrl = `${siteUrl.replace(/\/$/, '')}/en/profile/submissions`;
        const missingList = quality.missingLabels.join(', ');

        const subject = `[AI Best Tool] Update your listing / 更新你的工具资料`;
        const text = [
          `${displayName} is live on AI Best Tool, but the listing still has some gaps that may limit trust and conversion.`,
          '',
          `Current quality score: ${quality.score}/100`,
          `Suggested updates: ${missingList}`,
          '',
          'You can review and update the listing from your submissions page:',
          submissionsUrl,
          '',
          `Listing URL: ${tool.url}`,
        ].join('\n');
        const html = `
          <p><strong>${escapeHtml(displayName)}</strong> is live on AI Best Tool, but the listing still has a few gaps that may limit trust and conversion.</p>
          <p><strong>Current quality score:</strong> ${quality.score}/100</p>
          <p><strong>Suggested updates:</strong> ${escapeHtml(missingList)}</p>
          <p>You can review and update the listing from your submissions page:</p>
          <p><a href="${submissionsUrl}">${submissionsUrl}</a></p>
          <p><strong>Listing URL:</strong> ${escapeHtml(tool.url)}</p>
        `;

        const emailResult = await sendTransactionalEmail({
          to: recipientEmail,
          subject,
          text,
          html,
        });

        if (emailResult.success) {
          await recordProfileUpdateReminderLog({
            toolId: tool.id,
            reminderType,
            recipientEmail,
            qualityScore: quality.score,
            missingLabels: quality.missingLabels,
          });
        }

        return {
          sent: emailResult.success ? 1 : 0,
          skipped: emailResult.success ? 0 : 1,
        };
      }),
    );

    return {
      success: true,
      sent: reminderTasks.reduce((sum, item) => sum + item.sent, 0),
      skipped: reminderTasks.reduce((sum, item) => sum + item.skipped, 0),
    };
  } catch (error) {
    console.error('Error sending profile update reminders:', error);
    return {
      success: false,
      sent: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Failed to send profile update reminders',
    };
  }
}

export async function getFeaturedPlacementStats(): Promise<{
  liveCount: number;
  reservedCount: number;
  expiringSoonCount: number;
  totalViews: number;
  totalClicks: number;
  placements: Array<{
    id: string;
    name: string;
    title: string;
    views: number;
    clicks: number;
    activeFrom: string | null;
    featuredUntil: string | null;
    daysLeft: number | null;
    state: 'live' | 'reserved' | 'expired';
  }>;
}> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.view_count::int AS views,
          t.click_count::int AS clicks,
          COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true' AS is_sponsored_placement,
          NULLIF(t.features->'submission'->'commercial'->>'featuredActiveFrom', '')::timestamptz AS "featuredActiveFrom",
          NULLIF(t.features->'submission'->'commercial'->>'featuredUntil', '')::timestamptz AS "featuredUntil",
          NULLIF(t.features->'submission'->'commercial'->>'featuredReservedAt', '')::timestamptz AS "featuredReservedAt"
        FROM tools t
        WHERE COALESCE(t.features->'submission'->'commercial'->>'featuredReservedAt', '') <> ''
           OR COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') = 'true'
        ORDER BY "featuredUntil" ASC NULLS LAST, t.updated_at DESC
      `,
    );

    const now = Date.now();
    const placements = result.rows
      .map((row) => {
        const featuredActiveFrom =
          typeof row.featuredActiveFrom === 'string' && row.featuredActiveFrom ? row.featuredActiveFrom : null;
        const featuredUntil =
          typeof row.featuredUntil === 'string' && row.featuredUntil ? row.featuredUntil : null;
        const activeFromTime = featuredActiveFrom ? new Date(featuredActiveFrom).getTime() : null;
        const untilTime = featuredUntil ? new Date(featuredUntil).getTime() : null;
        const isSponsoredPlacement = row.is_sponsored_placement === true || row.is_sponsored_placement === 'true';
        const title = getLocalizedText(row.title) || row.name;
        const isLive =
          isSponsoredPlacement &&
          activeFromTime !== null &&
          untilTime !== null &&
          activeFromTime <= now &&
          untilTime > now;
        const isReserved = !isSponsoredPlacement && Boolean(row.featuredReservedAt);
        const daysLeft = untilTime ? Math.max(0, Math.ceil((untilTime - now) / (1000 * 60 * 60 * 24))) : null;

        return {
          id: row.id,
          name: row.name,
          title,
          views: Number(row.views || 0),
          clicks: Number(row.clicks || 0),
          activeFrom: featuredActiveFrom,
          featuredUntil,
          daysLeft,
          state: (isLive ? 'live' : isReserved ? 'reserved' : 'expired') as
            | 'live'
            | 'reserved'
            | 'expired',
        };
      })
      .filter((item) => item.state !== 'expired' || item.featuredUntil !== null);

    const livePlacements = placements.filter((item) => item.state === 'live');
    const reservedPlacements = placements.filter((item) => item.state === 'reserved');
    const expiringSoonCount = livePlacements.filter((item) => (item.daysLeft ?? Number.MAX_SAFE_INTEGER) <= 3).length;

    return {
      liveCount: livePlacements.length,
      reservedCount: reservedPlacements.length,
      expiringSoonCount,
      totalViews: livePlacements.reduce((sum, item) => sum + item.views, 0),
      totalClicks: livePlacements.reduce((sum, item) => sum + item.clicks, 0),
      placements: livePlacements,
    };
  } catch (error) {
    console.error('Error fetching featured placement stats:', error);
    return {
      liveCount: 0,
      reservedCount: 0,
      expiringSoonCount: 0,
      totalViews: 0,
      totalClicks: 0,
      placements: [],
    };
  }
}

export async function getDeveloperOutreachQueue(
  limit: number = 20,
): Promise<AdminOutreachQueueItem[]> {
  try {
    await requireAdmin();

    const pool = getPool();
    const normalizedLimit = Math.max(1, Math.min(limit, 50));
    const result = await pool.query(
      `
        WITH favorite_counts AS (
          SELECT tool_id, COUNT(*)::int AS favorites
          FROM favorites
          GROUP BY tool_id
        ),
        comment_counts AS (
          SELECT tool_id, COUNT(*)::int AS comments
          FROM comments
          WHERE status = 'approved'
          GROUP BY tool_id
        )
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.url,
          t.view_count::int AS views,
          t.click_count::int AS clicks,
          COALESCE(fc.favorites, 0)::int AS favorites,
          COALESCE(cc.comments, 0)::int AS comments,
          t.owner_email AS "ownerEmail",
          COALESCE(t.features->'submission'->>'submittedByEmail', '') AS "submittedByEmail",
          COALESCE(t.features->'outreach'->>'status', 'not_started') AS "outreachStatus",
          NULLIF(t.features->'outreach'->>'updatedAt', '') AS "outreachUpdatedAt",
          NULLIF(t.features->'outreach'->>'note', '') AS "outreachNote",
          NULLIF(t.features->'outreach'->>'nextFollowUpAt', '') AS "outreachNextFollowUpAt",
          NULLIF(t.features->'outreach'->>'closedReason', '') AS "outreachClosedReason",
          NULLIF(t.features->'outreach'->>'updatedByEmail', '') AS "outreachUpdatedByEmail",
          GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - t.updated_at)) / 86400))::int AS "daysSinceUpdate"
        FROM tools t
        LEFT JOIN favorite_counts fc ON fc.tool_id = t.id
        LEFT JOIN comment_counts cc ON cc.tool_id = t.id
        WHERE t.status = 'published'
          AND COALESCE(t.claim_status, 'unclaimed') = 'unclaimed'
          AND (
            COALESCE(t.owner_email, '') <> ''
            OR COALESCE(t.features->'submission'->>'submittedByEmail', '') <> ''
          )
        ORDER BY
          (COALESCE(t.view_count, 0) + COALESCE(t.click_count, 0) * 3 + COALESCE(fc.favorites, 0) * 8 + COALESCE(cc.comments, 0) * 10) DESC,
          t.updated_at ASC
        LIMIT $1
      `,
      [normalizedLimit],
    );

    return result.rows
      .map((row) => {
        const title = getLocalizedText(row.title) || row.name;
        const contactEmail =
          [row.ownerEmail, row.submittedByEmail]
            .find((value): value is string => typeof value === 'string' && isValidEmail(value.trim()))
            ?.trim()
            .toLowerCase() || '';

        if (!contactEmail) {
          return null;
        }

        const views = Number(row.views || 0);
        const clicks = Number(row.clicks || 0);
        const favorites = Number(row.favorites || 0);
        const comments = Number(row.comments || 0);
        const daysSinceUpdate = Number(row.daysSinceUpdate || 0);
        const priorityScore = views + clicks * 3 + favorites * 8 + comments * 10;
        const outreachStatus = validOutreachStatuses.includes(row.outreachStatus)
          ? (row.outreachStatus as OutreachStatus)
          : 'not_started';
        const outreachUpdatedAt =
          typeof row.outreachUpdatedAt === 'string' && row.outreachUpdatedAt.trim().length > 0
            ? row.outreachUpdatedAt
            : null;
        const outreachNote =
          typeof row.outreachNote === 'string' && row.outreachNote.trim().length > 0 ? row.outreachNote.trim() : null;
        const outreachNextFollowUpAt =
          typeof row.outreachNextFollowUpAt === 'string' && row.outreachNextFollowUpAt.trim().length > 0
            ? row.outreachNextFollowUpAt
            : null;
        const outreachClosedReason =
          typeof row.outreachClosedReason === 'string' && validOutreachClosedReasons.includes(row.outreachClosedReason)
            ? (row.outreachClosedReason as OutreachClosedReason)
            : null;
        const outreachUpdatedByEmail =
          typeof row.outreachUpdatedByEmail === 'string' && row.outreachUpdatedByEmail.trim().length > 0
            ? row.outreachUpdatedByEmail.trim().toLowerCase()
            : null;

        let suggestion: 'claim_listing' | 'featured_pitch' | 'content_collab' = 'claim_listing';
        let reason = 'Unclaimed published tool with a reachable contact.';

        if (comments >= 2 || favorites >= 5) {
          suggestion = 'content_collab';
          reason = 'Users are already engaging with this listing, which makes collaboration outreach more credible.';
        } else if (views >= 150 || clicks >= 20) {
          suggestion = 'featured_pitch';
          reason = 'This listing is already getting traffic, so a featured pitch has a stronger conversion story.';
        }

        return {
          id: row.id,
          name: row.name,
          title,
          contactEmail,
          views,
          clicks,
          favorites,
          comments,
          daysSinceUpdate,
          suggestion,
          priorityScore,
          reason,
          outreachStatus,
          outreachUpdatedAt,
          outreachNote,
          outreachNextFollowUpAt,
          outreachClosedReason,
          outreachUpdatedByEmail,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        const priorityDiff =
          getOutreachFollowUpPriority(a.outreachNextFollowUpAt) - getOutreachFollowUpPriority(b.outreachNextFollowUpAt);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        const aFollowUp = a.outreachNextFollowUpAt ? new Date(a.outreachNextFollowUpAt).getTime() : Number.POSITIVE_INFINITY;
        const bFollowUp = b.outreachNextFollowUpAt ? new Date(b.outreachNextFollowUpAt).getTime() : Number.POSITIVE_INFINITY;

        if (aFollowUp !== bFollowUp) {
          return aFollowUp - bFollowUp;
        }

        return b.priorityScore - a.priorityScore || a.daysSinceUpdate - b.daysSinceUpdate;
      });
  } catch (error) {
    console.error('Error fetching developer outreach queue:', error);
    return [];
  }
}

export async function updateOutreachStatus(input: {
  toolId: string;
  status: OutreachStatus;
  note?: string;
  nextFollowUpAt?: string | null;
  closedReason?: OutreachClosedReason | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin();

    const toolId = input.toolId.trim();
    if (!toolId) {
      return { success: false, error: 'Tool id is required.' };
    }

    if (!validOutreachStatuses.includes(input.status)) {
      return { success: false, error: 'Invalid outreach status.' };
    }

    const note = normalizeNullableText(input.note);
    const nextFollowUpAt = normalizeNullableText(input.nextFollowUpAt ?? undefined);
    const closedReason = normalizeNullableText(input.closedReason ?? undefined);
    const updatedByEmail = normalizeNullableText(adminUser.email || adminUser.id || undefined);
    const parsedFollowUpAt =
      nextFollowUpAt && !Number.isNaN(new Date(nextFollowUpAt).getTime())
        ? new Date(nextFollowUpAt).toISOString()
        : null;
    const normalizedClosedReason =
      input.status === 'closed' && closedReason && validOutreachClosedReasons.includes(closedReason as OutreachClosedReason)
        ? closedReason
        : null;

    const pool = getPool();
    const result = await pool.query(
      `
        UPDATE tools
        SET
          features = jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{outreach}',
            COALESCE(features->'outreach', '{}'::jsonb)
              || jsonb_build_object(
                'status', $2::text,
                'updatedAt', NOW()::text,
                'updatedByEmail', $6::text,
                'note', $3::text,
                'nextFollowUpAt', $4::text,
                'closedReason', $5::text
              ),
            true
          ),
          updated_at = NOW()
        WHERE id::text = $1
        RETURNING name
      `,
      [toolId, input.status, note, parsedFollowUpAt, normalizedClosedReason, updatedByEmail],
    );

    if (result.rowCount === 0) {
      return { success: false, error: 'Tool not found.' };
    }

    revalidateAdminToolPaths();
    revalidatePath('/admin/analytics');
    for (const locale of publicLocales) {
      revalidatePath(`/${locale}/admin/analytics`);
    }

    const toolName = String(result.rows[0]?.name || '');
    if (toolName) {
      revalidatePublicToolPaths(toolName);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating outreach status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update outreach status.',
    };
  }
}

export async function getOutreachHistorySummary(): Promise<AdminOutreachHistorySummary> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(
      `
        WITH outreach_history AS (
          SELECT
            COALESCE(t.features->'outreach'->>'status', 'not_started') AS status,
            NULLIF(t.features->'outreach'->>'closedReason', '') AS "closedReason",
            NULLIF(t.features->'outreach'->>'updatedAt', '')::timestamptz AS "updatedAt"
          FROM tools t
          WHERE
            t.features ? 'outreach'
            AND (
              COALESCE(t.features->'outreach'->>'status', 'not_started') <> 'not_started'
              OR NULLIF(t.features->'outreach'->>'closedReason', '') IS NOT NULL
              OR NULLIF(t.features->'outreach'->>'updatedAt', '') IS NOT NULL
            )
        )
        SELECT
          COUNT(*)::int AS "totalTracked",
          COUNT(*) FILTER (WHERE status = 'closed')::int AS "closedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'claimed')::int AS "claimedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'no_reply')::int AS "noReplyCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'invalid_contact')::int AS "invalidContactCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'not_interested')::int AS "notInterestedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" IS NULL)::int AS "unclassifiedClosedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "updatedAt" >= NOW() - INTERVAL '7 days')::int AS "recentClosedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'claimed' AND "updatedAt" >= NOW() - INTERVAL '7 days')::int AS "recentClaimedCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'no_reply' AND "updatedAt" >= NOW() - INTERVAL '7 days')::int AS "recentNoReplyCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'invalid_contact' AND "updatedAt" >= NOW() - INTERVAL '7 days')::int AS "recentInvalidContactCount",
          COUNT(*) FILTER (WHERE status = 'closed' AND "closedReason" = 'not_interested' AND "updatedAt" >= NOW() - INTERVAL '7 days')::int AS "recentNotInterestedCount"
        FROM outreach_history
      `,
    );

    const row = result.rows[0] || {};

    return {
      totalTracked: Number(row.totalTracked || 0),
      closedCount: Number(row.closedCount || 0),
      claimedCount: Number(row.claimedCount || 0),
      noReplyCount: Number(row.noReplyCount || 0),
      invalidContactCount: Number(row.invalidContactCount || 0),
      notInterestedCount: Number(row.notInterestedCount || 0),
      unclassifiedClosedCount: Number(row.unclassifiedClosedCount || 0),
      recentClosedCount: Number(row.recentClosedCount || 0),
      recentClaimedCount: Number(row.recentClaimedCount || 0),
      recentNoReplyCount: Number(row.recentNoReplyCount || 0),
      recentInvalidContactCount: Number(row.recentInvalidContactCount || 0),
      recentNotInterestedCount: Number(row.recentNotInterestedCount || 0),
    };
  } catch (error) {
    console.error('Error fetching outreach history summary:', error);
    return {
      totalTracked: 0,
      closedCount: 0,
      claimedCount: 0,
      noReplyCount: 0,
      invalidContactCount: 0,
      notInterestedCount: 0,
      unclassifiedClosedCount: 0,
      recentClosedCount: 0,
      recentClaimedCount: 0,
      recentNoReplyCount: 0,
      recentInvalidContactCount: 0,
      recentNotInterestedCount: 0,
    };
  }
}

export async function getOutreachNeedsClassification(
  limit = 20
): Promise<AdminOutreachClassificationItem[]> {
  try {
    await requireAdmin();

    const pool = getPool();
    const normalizedLimit = Math.max(1, Math.min(limit, 50));
    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.claim_status AS "claimStatus",
          t.owner_email AS "ownerEmail",
          COALESCE(t.features->'submission'->>'submittedByEmail', '') AS "submittedByEmail",
          NULLIF(t.features->'outreach'->>'updatedAt', '') AS "outreachUpdatedAt",
          NULLIF(t.features->'outreach'->>'note', '') AS "outreachNote",
          NULLIF(t.features->'outreach'->>'closedReason', '') AS "outreachClosedReason",
          NULLIF(t.features->'outreach'->>'updatedByEmail', '') AS "outreachUpdatedByEmail"
        FROM tools t
        WHERE COALESCE(t.features->'outreach'->>'status', 'not_started') = 'closed'
          AND NULLIF(t.features->'outreach'->>'closedReason', '') IS NULL
        ORDER BY NULLIF(t.features->'outreach'->>'updatedAt', '')::timestamptz DESC NULLS LAST, t.updated_at DESC
        LIMIT $1
      `,
      [normalizedLimit],
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name || ''),
      title: getLocalizedText(row.title) || String(row.name || ''),
      contactEmail:
        [row.ownerEmail, row.submittedByEmail]
          .find((value): value is string => typeof value === 'string' && isValidEmail(value.trim()))
          ?.trim()
          .toLowerCase() || '',
      claimStatus: typeof row.claimStatus === 'string' ? row.claimStatus : null,
      outreachUpdatedAt:
        typeof row.outreachUpdatedAt === 'string' && row.outreachUpdatedAt.trim().length > 0 ? row.outreachUpdatedAt : null,
      outreachNote: typeof row.outreachNote === 'string' && row.outreachNote.trim().length > 0 ? row.outreachNote.trim() : null,
      outreachClosedReason:
        typeof row.outreachClosedReason === 'string' && validOutreachClosedReasons.includes(row.outreachClosedReason)
          ? (row.outreachClosedReason as OutreachClosedReason)
          : null,
      outreachUpdatedByEmail:
        typeof row.outreachUpdatedByEmail === 'string' && row.outreachUpdatedByEmail.trim().length > 0
          ? row.outreachUpdatedByEmail.trim().toLowerCase()
          : null,
    }));
  } catch (error) {
    console.error('Error fetching outreach items needing classification:', error);
    return [];
  }
}

export async function getOutreachCommercialBridgeSummary(): Promise<AdminOutreachCommercialBridgeSummary> {
  try {
    await requireAdmin();

    const pool = getPool();
    const result = await pool.query(
      `
        WITH bridge AS (
          SELECT
            NULLIF(t.features->'outreach'->>'updatedAt', '')::timestamptz AS "outreachUpdatedAt",
            NULLIF(t.features->'submission'->'commercial'->>'paymentConfirmedAt', '')::timestamptz AS "paymentConfirmedAt",
            NULLIF(t.features->'submission'->'commercial'->>'featuredReservedAt', '')::timestamptz AS "featuredReservedAt",
            NULLIF(t.features->'submission'->'commercial'->>'activatedAt', '')::timestamptz AS "activatedAt",
            COALESCE(t.features->'outreach'->>'closedReason', '') AS "closedReason",
            COALESCE(t.features->'submission'->'commercial'->>'plan', 'free') AS "plan",
            COALESCE(t.features->'submission'->'commercial'->>'paymentConfirmed', 'false') AS "paymentConfirmed",
            COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') AS "isSponsoredPlacement"
          FROM tools t
          WHERE COALESCE(t.features->'outreach'->>'closedReason', '') = 'claimed'
        )
        SELECT
          COUNT(*)::int AS "claimedFromOutreachCount",
          COUNT(*) FILTER (WHERE plan = 'standard_paid')::int AS "paidPlanCount",
          COUNT(*) FILTER (WHERE paymentConfirmed = 'true')::int AS "paymentConfirmedCount",
          COUNT(*) FILTER (WHERE "featuredReservedAt" IS NOT NULL)::int AS "featuredReservedCount",
          COUNT(*) FILTER (WHERE isSponsoredPlacement = 'true')::int AS "featuredLiveCount",
          COUNT(*) FILTER (
            WHERE "outreachUpdatedAt" >= NOW() - INTERVAL '7 days'
          )::int AS "recentClaimedFromOutreachCount",
          COUNT(*) FILTER (
            WHERE "outreachUpdatedAt" >= NOW() - INTERVAL '14 days'
              AND "outreachUpdatedAt" < NOW() - INTERVAL '7 days'
          )::int AS "previousClaimedFromOutreachCount",
          COUNT(*) FILTER (
            WHERE "paymentConfirmedAt" >= NOW() - INTERVAL '7 days'
          )::int AS "recentPaymentConfirmedCount",
          COUNT(*) FILTER (
            WHERE "paymentConfirmedAt" >= NOW() - INTERVAL '14 days'
              AND "paymentConfirmedAt" < NOW() - INTERVAL '7 days'
          )::int AS "previousPaymentConfirmedCount",
          COUNT(*) FILTER (
            WHERE "featuredReservedAt" >= NOW() - INTERVAL '7 days'
          )::int AS "recentFeaturedReservedCount",
          COUNT(*) FILTER (
            WHERE "featuredReservedAt" >= NOW() - INTERVAL '14 days'
              AND "featuredReservedAt" < NOW() - INTERVAL '7 days'
          )::int AS "previousFeaturedReservedCount",
          COUNT(*) FILTER (
            WHERE "activatedAt" >= NOW() - INTERVAL '7 days'
          )::int AS "recentFeaturedLiveCount",
          COUNT(*) FILTER (
            WHERE "activatedAt" >= NOW() - INTERVAL '14 days'
              AND "activatedAt" < NOW() - INTERVAL '7 days'
          )::int AS "previousFeaturedLiveCount"
        FROM bridge
      `,
    );

    const row = result.rows[0] || {};

    return {
      claimedFromOutreachCount: Number(row.claimedFromOutreachCount || 0),
      paidPlanCount: Number(row.paidPlanCount || 0),
      paymentConfirmedCount: Number(row.paymentConfirmedCount || 0),
      featuredReservedCount: Number(row.featuredReservedCount || 0),
      featuredLiveCount: Number(row.featuredLiveCount || 0),
      recentClaimedFromOutreachCount: Number(row.recentClaimedFromOutreachCount || 0),
      previousClaimedFromOutreachCount: Number(row.previousClaimedFromOutreachCount || 0),
      recentPaymentConfirmedCount: Number(row.recentPaymentConfirmedCount || 0),
      previousPaymentConfirmedCount: Number(row.previousPaymentConfirmedCount || 0),
      recentFeaturedReservedCount: Number(row.recentFeaturedReservedCount || 0),
      previousFeaturedReservedCount: Number(row.previousFeaturedReservedCount || 0),
      recentFeaturedLiveCount: Number(row.recentFeaturedLiveCount || 0),
      previousFeaturedLiveCount: Number(row.previousFeaturedLiveCount || 0),
    };
  } catch (error) {
    console.error('Error fetching outreach commercial bridge summary:', error);
    return {
      claimedFromOutreachCount: 0,
      paidPlanCount: 0,
      paymentConfirmedCount: 0,
      featuredReservedCount: 0,
      featuredLiveCount: 0,
      recentClaimedFromOutreachCount: 0,
      previousClaimedFromOutreachCount: 0,
      recentPaymentConfirmedCount: 0,
      previousPaymentConfirmedCount: 0,
      recentFeaturedReservedCount: 0,
      previousFeaturedReservedCount: 0,
      recentFeaturedLiveCount: 0,
      previousFeaturedLiveCount: 0,
    };
  }
}

export async function getOutreachExecutorSummary(
  limit = 5
): Promise<AdminOutreachExecutorSummaryItem[]> {
  try {
    await requireAdmin();

    const pool = getPool();
    const normalizedLimit = Math.max(1, Math.min(limit, 20));
    const result = await pool.query(
      `
        WITH executor_rows AS (
          SELECT
            COALESCE(NULLIF(t.features->'outreach'->>'updatedByEmail', ''), 'unknown') AS executor_email,
            COALESCE(t.features->'outreach'->>'status', 'not_started') AS status,
            COALESCE(t.features->'outreach'->>'closedReason', '') AS closed_reason,
            COALESCE(t.features->'submission'->'commercial'->>'plan', 'free') AS plan,
            COALESCE(t.features->'submission'->'commercial'->>'paymentConfirmed', 'false') AS payment_confirmed,
            COALESCE(t.features->'submission'->'commercial'->>'isSponsoredPlacement', 'false') AS is_sponsored_placement,
            NULLIF(t.features->'outreach'->>'updatedAt', '')::timestamptz AS outreach_updated_at,
            NULLIF(t.features->'submission'->'commercial'->>'paymentConfirmedAt', '')::timestamptz AS payment_confirmed_at,
            NULLIF(t.features->'submission'->'commercial'->>'featuredReservedAt', '')::timestamptz AS featured_reserved_at,
            NULLIF(t.features->'submission'->'commercial'->>'activatedAt', '')::timestamptz AS activated_at
          FROM tools t
          WHERE NULLIF(t.features->'outreach'->>'updatedByEmail', '') IS NOT NULL
        )
        SELECT
          executor_email AS "executorEmail",
          COUNT(*)::int AS "totalUpdates",
          COUNT(*) FILTER (WHERE outreach_updated_at >= NOW() - INTERVAL '7 days')::int AS "recentUpdates",
          COUNT(*) FILTER (WHERE status = 'closed' AND closed_reason = 'claimed')::int AS "claimedCount",
          COUNT(*) FILTER (
            WHERE status = 'closed' AND closed_reason = 'claimed' AND plan = 'standard_paid'
          )::int AS "paidPlanCount",
          COUNT(*) FILTER (
            WHERE status = 'closed' AND closed_reason = 'claimed' AND payment_confirmed = 'true'
          )::int AS "paymentConfirmedCount",
          COUNT(*) FILTER (
            WHERE status = 'closed' AND closed_reason = 'claimed' AND featured_reserved_at IS NOT NULL
          )::int AS "featuredReservedCount",
          COUNT(*) FILTER (
            WHERE status = 'closed' AND closed_reason = 'claimed' AND is_sponsored_placement = 'true'
          )::int AS "featuredLiveCount"
        FROM executor_rows
        GROUP BY executor_email
        ORDER BY "recentUpdates" DESC, "totalUpdates" DESC, executor_email ASC
        LIMIT $1
      `,
      [normalizedLimit],
    );

    return result.rows.map((row) => ({
      executorEmail: String(row.executorEmail || 'unknown'),
      totalUpdates: Number(row.totalUpdates || 0),
      recentUpdates: Number(row.recentUpdates || 0),
      claimedCount: Number(row.claimedCount || 0),
      claimToPaidRate:
        Number(row.claimedCount || 0) > 0 ? Math.round((Number(row.paidPlanCount || 0) / Number(row.claimedCount || 0)) * 100) : 0,
      claimToFeaturedLiveRate:
        Number(row.claimedCount || 0) > 0
          ? Math.round((Number(row.featuredLiveCount || 0) / Number(row.claimedCount || 0)) * 100)
          : 0,
      paidPlanCount: Number(row.paidPlanCount || 0),
      paymentConfirmedCount: Number(row.paymentConfirmedCount || 0),
      featuredReservedCount: Number(row.featuredReservedCount || 0),
      featuredLiveCount: Number(row.featuredLiveCount || 0),
    }));
  } catch (error) {
    console.error('Error fetching outreach executor summary:', error);
    return [];
  }
}

export async function getPaidListingBlockerSummary(
  limit = 8
): Promise<AdminPaidListingBlockerSummary> {
  try {
    await requireAdmin();

    const pool = getPool();
    const normalizedLimit = Math.max(1, Math.min(limit, 20));
    const result = await pool.query(
      `
        SELECT
          t.id::text AS id,
          t.name,
          t.title,
          t.updated_at AS "updatedAt",
          t.category_id,
          t.image_url,
          t.thumbnail_url,
          t.content,
          t.detail,
          t.pricing,
          t.tags
        FROM tools t
        WHERE COALESCE(t.features->'submission'->'commercial'->>'plan', 'free') = 'standard_paid'
          AND (
            t.category_id IS NULL
            OR t.image_url IS NULL
            OR t.image_url = ''
            OR t.image_url LIKE '%google.com/s2/favicons%'
            OR t.thumbnail_url IS NULL
            OR t.thumbnail_url = ''
            OR t.thumbnail_url LIKE '%google.com/s2/favicons%'
            OR LENGTH(COALESCE(t.content->>'en', t.content->>'zh', t.content::text, '')) < 80
            OR LENGTH(COALESCE(t.detail->>'en', t.detail->>'zh', t.detail::text, '')) < 160
            OR t.pricing IS NULL
            OR t.pricing = ''
            OR array_length(t.tags, 1) IS NULL
            OR array_length(t.tags, 1) = 0
          )
        ORDER BY t.updated_at DESC
        LIMIT $1
      `,
      [normalizedLimit],
    );

    const blockerCounts = new Map<string, number>();
    const items = result.rows.map((row) => {
      const gate = getPaidListingPublishGate(row);
      gate.blockers.forEach((label) => {
        blockerCounts.set(label, (blockerCounts.get(label) || 0) + 1);
      });

      return {
        id: String(row.id),
        name: String(row.name || ''),
        title: getLocalizedText(row.title) || String(row.name || ''),
        updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : new Date(row.updatedAt).toISOString(),
        blockers: gate.blockers,
      };
    });

    return {
      totalBlocked: items.length,
      blockerCounts: Array.from(blockerCounts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
      items,
    };
  } catch (error) {
    console.error('Error fetching paid listing blocker summary:', error);
    return {
      totalBlocked: 0,
      blockerCounts: [],
      items: [],
    };
  }
}

export async function activateCommercialPlacement(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const activation = await activateCommercialPlacementBySystem(toolId, null);
    if (!activation.success) {
      return { success: false, error: activation.error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate commercial placement',
    };
  }
}

export async function activateCommercialPlacementBySystem(
  toolId: string,
  transactionId?: string | null
): Promise<{ success: boolean; error?: string; name?: string }> {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT name, status, features FROM tools WHERE id = $1 LIMIT 1', [toolId]);
    if (result.rows.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const row = result.rows[0];
    const features = getRecord(row.features);
    const submission = getRecord(features.submission);
    const commercial = getRecord(submission.commercial);
    const nextFeatures = {
      ...features,
      submission: {
        ...submission,
        commercial: buildCommercialStateForCurrentStatus(
          commercial,
          row.status as ToolStatus,
          transactionId
        ),
      },
    };

    await pool.query(
      `
        UPDATE tools
        SET features = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [toolId, JSON.stringify(nextFeatures)]
    );

    revalidateAdminToolPaths();
    revalidatePublicToolPaths(row.name);
    return { success: true, name: row.name };
  } catch (error) {
    console.error('Error activating commercial placement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate commercial placement',
    };
  }
}

export async function getSubmissionFunnelStats(
  range: '7d' | '30d' | 'all' = 'all'
): Promise<{
  totalSubmitted: number;
  pending: number;
  published: number;
  rejected: number;
  publishedRate: number;
  avgReviewHours: number;
}> {
  try {
    await requireAdmin();

    const pool = getPool();
    const createdAtFilter =
      range === '7d'
        ? `AND created_at >= NOW() - INTERVAL '7 days'`
        : range === '30d'
        ? `AND created_at >= NOW() - INTERVAL '30 days'`
        : '';
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL ${createdAtFilter})::int AS total_submitted,
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL AND status = 'pending' ${createdAtFilter})::int AS pending_submitted,
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL AND status = 'published' ${createdAtFilter})::int AS published_submitted,
        COUNT(*) FILTER (WHERE submitted_by IS NOT NULL AND status = 'rejected' ${createdAtFilter})::int AS rejected_submitted,
        AVG(
          EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0
        ) FILTER (
          WHERE submitted_by IS NOT NULL
            AND status IN ('published', 'rejected')
            AND updated_at IS NOT NULL
            AND updated_at > created_at
            ${createdAtFilter}
        ) AS avg_review_hours
      FROM tools
    `);

    const row = result.rows[0] || {};
    const totalSubmitted = Number(row.total_submitted || 0);
    const pending = Number(row.pending_submitted || 0);
    const published = Number(row.published_submitted || 0);
    const rejected = Number(row.rejected_submitted || 0);
    const avgReviewHoursRaw = Number(row.avg_review_hours || 0);
    const publishedRate =
      totalSubmitted > 0 ? Math.round((published / totalSubmitted) * 100) : 0;

    return {
      totalSubmitted,
      pending,
      published,
      rejected,
      publishedRate,
      avgReviewHours: Number.isFinite(avgReviewHoursRaw)
        ? Math.round(avgReviewHoursRaw * 10) / 10
        : 0,
    };
  } catch (error) {
    console.error('Error fetching submission funnel stats:', error);
    return {
      totalSubmitted: 0,
      pending: 0,
      published: 0,
      rejected: 0,
      publishedRate: 0,
      avgReviewHours: 0,
    };
  }
}

export async function getSubmissionRejectionReasonStats(
  range: '7d' | '30d' | 'all' = 'all',
  limit: number = 5,
): Promise<{
  totalRejected: number;
  reasons: Array<{
    reason: string;
    count: number;
  }>;
}> {
  try {
    await requireAdmin();

    const pool = getPool();
    const normalizedLimit = Math.max(Math.min(limit, 20), 1);
    const createdAtFilter =
      range === '7d'
        ? `AND created_at >= NOW() - INTERVAL '7 days'`
        : range === '30d'
          ? `AND created_at >= NOW() - INTERVAL '30 days'`
          : '';

    const [summaryResult, reasonsResult] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS total_rejected
        FROM tools
        WHERE submitted_by IS NOT NULL
          AND status = 'rejected'
          ${createdAtFilter}
      `),
      pool.query(
        `
        SELECT
          COALESCE(
            NULLIF(TRIM(features->'submission'->'review'->>'rejectionReason'), ''),
            'No reason recorded'
          ) AS reason,
          COUNT(*)::int AS count
        FROM tools
        WHERE submitted_by IS NOT NULL
          AND status = 'rejected'
          ${createdAtFilter}
        GROUP BY 1
        ORDER BY count DESC, reason ASC
        LIMIT $1
      `,
        [normalizedLimit],
      ),
    ]);

    return {
      totalRejected: Number(summaryResult.rows[0]?.total_rejected || 0),
      reasons: reasonsResult.rows.map((row) => ({
        reason: String(row.reason || 'No reason recorded'),
        count: Number(row.count || 0),
      })),
    };
  } catch (error) {
    console.error('Error fetching submission rejection reason stats:', error);
    return {
      totalRejected: 0,
      reasons: [],
    };
  }
}

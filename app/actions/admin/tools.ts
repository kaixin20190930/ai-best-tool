'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/middleware';
import { getPool } from '@/db/neon/client';
import { createNotification } from '@/app/actions/notifications';
import { sendTransactionalEmail } from '@/lib/services/mailer';
import { shouldSendSubmissionStatusEmail } from '@/app/actions/userPreferences';
import { getPaidListingPublishGate } from '@/lib/services/toolQuality';

const publicLocales = ['en', 'cn', 'tw', 'jp', 'de', 'es', 'fr', 'pt', 'ru'];
const validStatuses = ['draft', 'pending', 'published', 'rejected'] as const;
const validPricing = ['free', 'freemium', 'paid'] as const;

type ToolStatus = (typeof validStatuses)[number];
type ToolPricing = (typeof validPricing)[number];

const toolQualityScoreSql = `
  (
    (CASE WHEN category_id IS NOT NULL THEN 20 ELSE 0 END) +
    (CASE WHEN thumbnail_url IS NOT NULL AND thumbnail_url <> '' THEN 20 ELSE 0 END) +
    (CASE WHEN image_url IS NOT NULL AND image_url <> '' THEN 15 ELSE 0 END) +
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
    OR thumbnail_url IS NULL
    OR thumbnail_url = ''
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
  created_at: Date;
  updated_at: Date;
  view_count: number;
  click_count: number;
  average_rating: number;
  rating_count: number;
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

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
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
  submittedByEmail?: string | null
) {
  if (!submittedBy) {
    return;
  }

  const displayName = toolTitle?.trim() || toolName;
  const profileLink = '/profile/submissions';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const profileUrl = `${siteUrl}${profileLink}`;
  const toolUrl = `${siteUrl}/ai/${toolName}`;

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
      await createNotification(
        submittedBy,
        'submission_status',
        'Submission needs updates / 你的提交需要调整',
        `${displayName} was reviewed but not published yet. Please refine details and resubmit. / ${displayName} 已审核但暂未发布，请完善信息后重新提交。`,
        profileLink
      );
      if (submittedByEmail && (await shouldSendSubmissionStatusEmail(submittedBy))) {
        await sendTransactionalEmail({
          to: submittedByEmail,
          subject: `[AI Best Tool] ${displayName} needs updates`,
          text: `${displayName} was reviewed but not published yet. Please refine details and resubmit.`,
          html: `
            <p>${displayName} was reviewed but not published yet.</p>
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

/**
 * Get all tools for admin (including pending, rejected, etc.)
 */
export async function getAdminTools(filters?: {
  status?: string;
  search?: string;
  collected?: boolean;
  needsMedia?: boolean;
  quality?: 'low' | 'medium' | 'high';
  ready?: boolean;
  overdue?: boolean;
  followedUp?: boolean;
  staleFollowUp?: boolean;
  paidIntent?: boolean;
  featuredIntent?: boolean;
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

    if (filters?.collected) {
      query += ` AND features ? 'collection'`;
    }

    if (filters?.needsMedia) {
      query += ` AND ${mediaNeededSql}`;
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
    const result = await pool.query(
      `UPDATE tools
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING name, submitted_by, title, features`,
      ['rejected', toolId]
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
        getSubmittedByEmailFromFeatures(row.features)
      );
    }

    // TODO: Send notification to submitter with reason
    void reason;

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
        COUNT(*) FILTER (WHERE status = 'draft') as draft
      FROM tools
    `);

    return {
      total: parseCount(result.rows[0].total),
      published: parseCount(result.rows[0].published),
      pending: parseCount(result.rows[0].pending),
      rejected: parseCount(result.rows[0].rejected),
      draft: parseCount(result.rows[0].draft),
    };
  } catch (error) {
    console.error('Error fetching tools stats:', error);
    return {
      total: 0,
      published: 0,
      pending: 0,
      rejected: 0,
      draft: 0,
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

'use server';

import { revalidatePath } from 'next/cache';
import { getPool } from '@/db/neon/client';

import { requireAuth } from '@/lib/auth/middleware';
import { sendTransactionalEmail } from '@/lib/services/mailer';
import { ensureTagsExist } from '@/lib/services/tags';
import { createNotification, notifyAdminsOfSubmission } from '@/app/actions/notifications';
import { shouldSendSubmissionStatusEmail } from '@/app/actions/userPreferences';

interface SubmitToolInput {
  website: string;
  url: string;
  categoryId?: string;
  description?: string;
  tags?: string;
  pricing?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  submissionPlan?: 'free' | 'standard_paid';
  fastTrack?: boolean;
  featuredDays?: 0 | 3 | 7 | 14;
}

interface SubmitToolResult {
  success: boolean;
  error?: string;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = (() => {
    try {
      return new URL(withProtocol);
    } catch {
      return null;
    }
  })();

  if (!parsed) {
    throw new TypeError('Invalid URL');
  }

  return parsed.toString();
}

function normalizeOptionalUrl(url?: string): string | null {
  const trimmed = url?.trim();

  if (!trimmed) {
    return null;
  }

  return normalizeUrl(trimmed);
}

function normalizeTags(tags?: string): string[] {
  if (!tags) {
    return [];
  }

  return tags
    .split(',')
    .map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/https?:\/\//g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .filter((tag, index, array) => array.indexOf(tag) === index)
    .slice(0, 12);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function createUniqueToolSlug(base: string, suffix = 1): Promise<string> {
  const pool = getPool();
  const normalizedBase = slugify(base) || 'ai-tool';
  const candidate = suffix === 1 ? normalizedBase : `${normalizedBase}-${suffix}`;
  const existing = await pool.query('SELECT 1 FROM tools WHERE name = $1 LIMIT 1', [candidate]);

  if (existing.rows.length === 0) {
    return candidate;
  }

  return createUniqueToolSlug(base, suffix + 1);
}

export async function submitTool(input: SubmitToolInput): Promise<SubmitToolResult> {
  try {
    const user = await requireAuth();
    const website = input.website.trim();
    const description = input.description?.trim();
    const pricing = input.pricing || 'freemium';
    const submissionPlan = input.submissionPlan || 'free';
    const fastTrack = Boolean(input.fastTrack);
    const featuredDays = input.featuredDays || 0;
    const categoryId = input.categoryId?.trim() || null;

    if (website.length < 2) {
      return { success: false, error: 'Please enter a valid tool name.' };
    }

    if (description && description.length > 800) {
      return { success: false, error: 'Description is too long.' };
    }

    if (!['free', 'freemium', 'paid'].includes(pricing)) {
      return { success: false, error: 'Please select a valid pricing option.' };
    }
    if (!['free', 'standard_paid'].includes(submissionPlan)) {
      return { success: false, error: 'Please select a valid submission plan.' };
    }
    if (![0, 3, 7, 14].includes(featuredDays)) {
      return { success: false, error: 'Please select a valid featured duration.' };
    }
    if (submissionPlan === 'free' && fastTrack) {
      return { success: false, error: 'Fast track is available for paid plan only.' };
    }

    const url = normalizeUrl(input.url);
    const imageUrl = normalizeOptionalUrl(input.imageUrl);
    const thumbnailUrl = normalizeOptionalUrl(input.thumbnailUrl);
    const tags = normalizeTags(input.tags);
    const urlHost = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch {
        return '';
      }
    })();
    const slug = await createUniqueToolSlug(website || urlHost);
    const title = { en: website, zh: website };
    const content = {
      en: description || `${website} was submitted by its developer and is pending editorial review.`,
      zh: description || `${website} 已由开发者提交，正在等待平台审核。`,
    };
    const detail = {
      en:
        description ||
        `${website} is currently in the review queue. The AI Best Tool team will verify its product details, category, media, and pricing before publication.`,
      zh:
        description || `${website} 当前处于审核队列中。AI Best Tool 团队会在发布前核验产品信息、分类、媒体素材和定价。`,
    };

    const pool = getPool();

    if (categoryId) {
      const category = await pool.query('SELECT 1 FROM categories WHERE id = $1 LIMIT 1', [categoryId]);

      if (category.rows.length === 0) {
        return { success: false, error: 'Please select a valid category.' };
      }
    }

    const features = {
      submission: {
        submittedByEmail: user.email || null,
        commercial: {
          plan: submissionPlan,
          fastTrackRequested: submissionPlan === 'standard_paid' ? fastTrack : false,
          featuredDaysRequested: featuredDays,
          featuredRequested: featuredDays > 0,
          status: submissionPlan === 'free' ? 'free_queue' : 'pending_payment_confirmation',
          targetReviewSlaHours: 24 * 5,
          requestedAt: new Date().toISOString(),
        },
      },
    };

    if (submissionPlan === 'standard_paid') {
      features.submission.commercial.targetReviewSlaHours = fastTrack ? 48 : 72;
    }

    await pool.query(
      `
        INSERT INTO tools (
          name, title, content, detail, url, image_url, thumbnail_url,
          category_id, tags, pricing, status, submitted_by, features
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
      [
        slug,
        JSON.stringify(title),
        JSON.stringify(content),
        JSON.stringify(detail),
        url,
        imageUrl,
        thumbnailUrl,
        categoryId,
        tags,
        pricing,
        'pending',
        user.id,
        JSON.stringify(features),
      ],
    );

    await ensureTagsExist(tags);

    await createNotification(
      user.id,
      'submission_status',
      submissionPlan === 'standard_paid'
        ? 'Submission received / 已收到你的提交'
        : 'Submission received / 已收到你的提交',
      submissionPlan === 'standard_paid'
        ? `${website} is in the review queue. Payment, review status, and featured placement will continue from your submissions page. / ${website} 已进入审核队列。付款、审核状态与前排展示会在“我的提交”中继续处理。`
        : `${website} has entered the review queue. / ${website} 已进入审核队列。`,
      '/profile/submissions',
    );

    await notifyAdminsOfSubmission({
      toolName: slug,
      toolTitle: website,
      submittedByEmail: user.email || null,
      submissionPlan,
      fastTrack,
      featuredDays,
    });

    if (user.email && (await shouldSendSubmissionStatusEmail(user.id))) {
      await sendTransactionalEmail({
        to: user.email,
        subject: `[AI Best Tool] ${website} is in review`,
        text: `${website} has entered the review queue. You can track status in your submissions page.`,
        html: `
          <p>${website} has entered the review queue.</p>
          <p>You can track status in your submissions page.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/profile/submissions">View submissions</a></p>
        `,
      });
    }

    revalidatePath('/admin/tools');
    revalidatePath('/cn/admin/tools');
    revalidatePath('/en/admin/tools');

    return { success: true };
  } catch (error) {
    console.error('Error submitting tool:', error);

    if (error instanceof TypeError) {
      return { success: false, error: 'Please enter a valid website URL.' };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit tool.',
    };
  }
}

export default submitTool;

'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { queryDatabase } from '@/lib/services/database';
import { persistDistributionTargetReview } from '@/lib/services/intelligence/targetPersistence';

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBoolean(value: FormDataEntryValue | null): boolean {
  return value === '1' || value === 'true' || value === 'on';
}

export async function updateDistributionTarget(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const targetId = normalizeText(formData.get('targetId'));
    if (!targetId) return { success: false, error: 'Target is required.' };

    const targetStatus = normalizeText(formData.get('targetStatus'));
    const notes = normalizeText(formData.get('notes')) || null;
    const homepageUrl = normalizeText(formData.get('homepageUrl')) || null;
    const submissionUrl = normalizeText(formData.get('submissionUrl')) || null;
    const registrationUrl = normalizeText(formData.get('registrationUrl')) || null;
    const pricingUrl = normalizeText(formData.get('pricingUrl')) || null;
    const nextCheckAt = normalizeText(formData.get('nextCheckAt')) || null;
    const confidenceValue = Number.parseInt(normalizeText(formData.get('confidence')) || '50', 10);
    const expectedReviewDaysValue = Number.parseInt(normalizeText(formData.get('expectedReviewDays')) || '', 10);
    const locale = normalizeText(formData.get('locale')) || 'en';

    await queryDatabase(
      `
        update distribution_targets
        set
          target_status = $2,
          notes = $3,
          homepage_url = $4,
          submission_url = $5,
          registration_url = $6,
          pricing_url = $7,
          next_check_at = $8,
          confidence = $9,
          expected_review_days = $10,
          requires_account = $11,
          requires_payment = $12,
          requires_captcha = $13,
          requires_backlink = $14,
          editorial_review = $15,
          updated_at = $16
        where id = $1
      `,
      [
        targetId,
        ['active', 'stale', 'blocked', 'retired'].includes(targetStatus) ? targetStatus : 'active',
        notes,
        homepageUrl || null,
        submissionUrl || null,
        registrationUrl || null,
        pricingUrl || null,
        nextCheckAt || null,
        Number.isFinite(confidenceValue) ? Math.max(0, Math.min(100, confidenceValue)) : 50,
        Number.isFinite(expectedReviewDaysValue) && expectedReviewDaysValue > 0 ? expectedReviewDaysValue : null,
        normalizeBoolean(formData.get('requiresAccount')),
        normalizeBoolean(formData.get('requiresPayment')),
        normalizeBoolean(formData.get('requiresCaptcha')),
        normalizeBoolean(formData.get('requiresBacklink')),
        normalizeBoolean(formData.get('editorialReview')),
        new Date().toISOString(),
      ],
    );

    revalidatePath('/admin/targets');
    revalidatePath(`/${locale}/admin/targets`);
    revalidatePath('/admin/distribution');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to update target.' };
  }
}

export async function reviewDistributionTarget(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const targetId = normalizeText(formData.get('targetId'));
    const homepageUrl = normalizeText(formData.get('homepageUrl')) || undefined;
    const locale = normalizeText(formData.get('locale')) || 'en';
    if (!targetId) return { success: false, error: 'Target is required.' };

    await persistDistributionTargetReview({
      targetId,
      homepageUrl,
      dryRun: false,
    });

    revalidatePath('/admin/targets');
    revalidatePath(`/${locale}/admin/targets`);
    revalidatePath('/admin/distribution');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to refresh target.' };
  }
}

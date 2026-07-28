'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('distribution_targets')
      .update({
        target_status: ['active', 'stale', 'blocked', 'retired'].includes(targetStatus) ? targetStatus : 'active',
        notes,
        homepage_url: homepageUrl || null,
        submission_url: submissionUrl || null,
        registration_url: registrationUrl || null,
        pricing_url: pricingUrl || null,
        next_check_at: nextCheckAt || null,
        confidence: Number.isFinite(confidenceValue) ? Math.max(0, Math.min(100, confidenceValue)) : 50,
        expected_review_days: Number.isFinite(expectedReviewDaysValue) && expectedReviewDaysValue > 0 ? expectedReviewDaysValue : null,
        requires_account: normalizeBoolean(formData.get('requiresAccount')),
        requires_payment: normalizeBoolean(formData.get('requiresPayment')),
        requires_captcha: normalizeBoolean(formData.get('requiresCaptcha')),
        requires_backlink: normalizeBoolean(formData.get('requiresBacklink')),
        editorial_review: normalizeBoolean(formData.get('editorialReview')),
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
    if (error) throw error;

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

'use server';

import { revalidatePath } from 'next/cache';

import { createNotification } from '@/app/actions/notifications';
import { query } from '@/db/neon/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const checkResults = new Set(['pass', 'fail', 'skipped']);
const finalDecisions = new Set(['keep', 'cancel', 'compare']);

export type TrialActionResult =
  | { success: true; scorecardId: string; reused?: boolean; message: string }
  | { success: false; code: string; message: string };

function refreshTrials(locale: string, scorecardId?: string) {
  revalidatePath(`/${locale}/profile/trials`);
  if (scorecardId) revalidatePath(`/${locale}/profile/trials/${scorecardId}`);
}

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

async function createTrialInternal(input: {
  locale: string;
  toolId: string;
  targetOutcome: string;
  renewalAt?: string;
  checkLabels: string[];
  idempotencyKey: string;
}): Promise<TrialActionResult> {
  const userId = await currentUserId();
  if (!userId) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to start a trial.' };
  if (!uuidPattern.test(input.toolId)) {
    return { success: false, code: 'INVALID_TOOL', message: 'Choose a valid tool.' };
  }
  const targetOutcome = input.targetOutcome.trim().slice(0, 1000);
  if (!targetOutcome) {
    return { success: false, code: 'OUTCOME_REQUIRED', message: 'Describe what success should look like.' };
  }
  const checkLabels = input.checkLabels.map((label) => label.trim().slice(0, 300)).filter(Boolean);
  if (checkLabels.length < 3 || checkLabels.length > 5) {
    return { success: false, code: 'CHECK_COUNT_INVALID', message: 'Add 3 to 5 real trial checks.' };
  }
  const idempotencyKey = input.idempotencyKey.trim().slice(0, 100);
  if (!idempotencyKey) {
    return { success: false, code: 'TRIAL_KEY_REQUIRED', message: 'Refresh the page and retry.' };
  }
  const renewalAt = input.renewalAt?.trim() ? new Date(input.renewalAt) : null;
  if (renewalAt && Number.isNaN(renewalAt.getTime())) {
    return { success: false, code: 'INVALID_RENEWAL_DATE', message: 'Choose a valid renewal date.' };
  }
  const toolResult = await query<{ id: string }>(
    `SELECT id FROM tools WHERE id = $1::uuid AND status = 'published' LIMIT 1`,
    [input.toolId],
  );
  if (!toolResult.rows[0]) {
    return { success: false, code: 'TOOL_NOT_AVAILABLE', message: 'This tool is not available for a trial.' };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('trial_scorecards')
    .select('id')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existing) {
    return { success: true, scorecardId: String(existing.id), reused: true, message: 'Existing trial reopened.' };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data: scorecard, error: scorecardError } = await admin
    .from('trial_scorecards')
    .insert({
      user_id: userId,
      tool_id: input.toolId,
      status: 'active',
      target_outcome: targetOutcome,
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      renewal_at: renewalAt?.toISOString() || null,
      final_decision: 'undecided',
      idempotency_key: idempotencyKey,
      reminder_enabled: true,
    })
    .select('id')
    .single();
  if (scorecardError || !scorecard) {
    return { success: false, code: 'TRIAL_CREATE_FAILED', message: 'Unable to start this trial.' };
  }
  const scorecardId = String(scorecard.id);
  const { error: checksError } = await admin.from('trial_scorecard_checks').insert(
    checkLabels.map((label, index) => ({
      scorecard_id: scorecardId,
      sequence: index + 1,
      label,
      metric_type: 'manual',
      result: 'pending',
    })),
  );
  if (checksError) {
    await admin.from('trial_scorecards').delete().eq('id', scorecardId).eq('user_id', userId);
    return { success: false, code: 'TRIAL_CHECKS_FAILED', message: 'Trial checks could not be saved; no trial was created.' };
  }

  refreshTrials(input.locale, scorecardId);
  return { success: true, scorecardId, message: '7-day trial started.' };
}

export async function createTrialScorecard(input: {
  locale: string;
  toolId: string;
  targetOutcome: string;
  renewalAt?: string;
  checkLabels: string[];
  idempotencyKey: string;
}): Promise<TrialActionResult> {
  try {
    return await createTrialInternal(input);
  } catch {
    return { success: false, code: 'TRIAL_UNAVAILABLE', message: 'Trials are temporarily unavailable.' };
  }
}

export async function updateTrialCheck(input: {
  locale: string;
  scorecardId: string;
  checkId: string;
  result: string;
  actualNote?: string;
}): Promise<TrialActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to update this trial.' };
    if (!uuidPattern.test(input.scorecardId) || !uuidPattern.test(input.checkId) || !checkResults.has(input.result)) {
      return { success: false, code: 'INVALID_CHECK', message: 'Choose a valid check result.' };
    }
    const admin = createAdminClient();
    const { data: scorecard } = await admin
      .from('trial_scorecards')
      .select('id, status')
      .eq('id', input.scorecardId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!scorecard || !['planned', 'active'].includes(String(scorecard.status))) {
      return { success: false, code: 'TRIAL_NOT_EDITABLE', message: 'This trial can no longer be edited.' };
    }
    const { data, error } = await admin
      .from('trial_scorecard_checks')
      .update({
        result: input.result,
        actual_value: { note: input.actualNote?.trim().slice(0, 500) || null },
        completed_at: new Date().toISOString(),
      })
      .eq('id', input.checkId)
      .eq('scorecard_id', input.scorecardId)
      .select('id')
      .maybeSingle();
    if (error || !data) return { success: false, code: 'CHECK_SAVE_FAILED', message: 'Unable to save this check.' };
    refreshTrials(input.locale, input.scorecardId);
    return { success: true, scorecardId: input.scorecardId, message: 'Trial check saved.' };
  } catch {
    return { success: false, code: 'TRIAL_UNAVAILABLE', message: 'Trials are temporarily unavailable.' };
  }
}

export async function completeTrialScorecard(input: {
  locale: string;
  scorecardId: string;
  finalDecision: string;
  privateNotes?: string;
}): Promise<TrialActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to complete this trial.' };
    if (!uuidPattern.test(input.scorecardId) || !finalDecisions.has(input.finalDecision)) {
      return { success: false, code: 'INVALID_DECISION', message: 'Choose keep, cancel, or compare.' };
    }
    const admin = createAdminClient();
    const { data: scorecard } = await admin
      .from('trial_scorecards')
      .select('id, status')
      .eq('id', input.scorecardId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!scorecard) return { success: false, code: 'TRIAL_NOT_FOUND', message: 'This trial was not found.' };
    if (scorecard.status === 'completed') {
      return { success: true, scorecardId: input.scorecardId, reused: true, message: 'Trial was already completed.' };
    }
    if (!['planned', 'active'].includes(String(scorecard.status))) {
      return { success: false, code: 'TRIAL_NOT_EDITABLE', message: 'This trial can no longer be completed.' };
    }
    const { data: checks, error: checksError } = await admin
      .from('trial_scorecard_checks')
      .select('id, result')
      .eq('scorecard_id', input.scorecardId);
    if (checksError || !checks?.length) {
      return { success: false, code: 'TRIAL_CHECKS_UNAVAILABLE', message: 'Trial checks are unavailable.' };
    }
    if (checks.some((check) => check.result === 'pending')) {
      return { success: false, code: 'TRIAL_CHECKS_PENDING', message: 'Complete or skip every check first.' };
    }
    const { data, error } = await admin
      .from('trial_scorecards')
      .update({
        status: 'completed',
        final_decision: input.finalDecision,
        private_notes: input.privateNotes?.trim().slice(0, 2000) || null,
      })
      .eq('id', input.scorecardId)
      .eq('user_id', userId)
      .in('status', ['planned', 'active'])
      .select('id')
      .maybeSingle();
    if (error || !data) return { success: false, code: 'TRIAL_COMPLETE_FAILED', message: 'Unable to complete this trial.' };
    refreshTrials(input.locale, input.scorecardId);
    return { success: true, scorecardId: input.scorecardId, message: 'Final trial decision saved.' };
  } catch {
    return { success: false, code: 'TRIAL_UNAVAILABLE', message: 'Trials are temporarily unavailable.' };
  }
}

export async function sendTrialRemindersBySystem() {
  const admin = createAdminClient();
  const now = new Date();
  const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const { data: scorecards, error } = await admin
    .from('trial_scorecards')
    .select('id, user_id, tool_id, ends_at, renewal_at')
    .in('status', ['planned', 'active'])
    .eq('reminder_enabled', true)
    .is('reminder_sent_at', null)
    .or(`ends_at.lte.${threshold},renewal_at.lte.${threshold}`)
    .limit(100);
  if (error) return { success: false, sent: 0, skipped: 0, error: 'TRIAL_REMINDER_QUERY_FAILED' };

  let sent = 0;
  let skipped = 0;
  for (const scorecard of scorecards || []) {
    const claimedAt = new Date().toISOString();
    const { data: claimed } = await admin
      .from('trial_scorecards')
      .update({ reminder_sent_at: claimedAt })
      .eq('id', scorecard.id)
      .is('reminder_sent_at', null)
      .select('id')
      .maybeSingle();
    if (!claimed) {
      skipped += 1;
      continue;
    }
    const toolResult = await query<{ title: Record<string, string>; name: string }>(
      `SELECT title, name FROM tools WHERE id = $1::uuid LIMIT 1`,
      [scorecard.tool_id],
    );
    const tool = toolResult.rows[0];
    const toolTitle = tool?.title?.en || tool?.title?.zh || tool?.name || 'AI tool';
    const notification = await createNotification(
      String(scorecard.user_id),
      'trial_due',
      `Trial decision due: ${toolTitle} / 试用即将到期`,
      'Record the remaining checks and choose keep, cancel, or compare. / 请完成剩余检查并选择保留、取消或继续比较。',
      `/profile/trials/${scorecard.id}`,
    );
    if (notification.success) sent += 1;
    else {
      skipped += 1;
      await admin.from('trial_scorecards').update({ reminder_sent_at: null }).eq('id', scorecard.id).eq('reminder_sent_at', claimedAt);
    }
  }
  return { success: true, sent, skipped };
}

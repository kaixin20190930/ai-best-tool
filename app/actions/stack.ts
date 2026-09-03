'use server';

import { revalidatePath } from 'next/cache';

import { query } from '@/db/neon/client';
import { normalizeStackCost, type StackBillingPeriod } from '@/lib/services/stack/cost';
import { createClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const subscriptionStatuses = new Set(['trial', 'free', 'paid', 'cancelled']);
const billingPeriods = new Set<StackBillingPeriod>(['month', 'year', 'usage', 'one_time', 'unknown']);
const usageFrequencies = new Set(['daily', 'weekly', 'monthly', 'rarely', 'never']);
const sensitivityLevels = new Set(['low', 'medium', 'high', 'regulated']);

export type StackItemInput = {
  id?: string;
  toolId?: string;
  customToolName?: string;
  customToolUrl?: string;
  subscriptionStatus: string;
  billingAmount?: string;
  currency: string;
  billingPeriod: StackBillingPeriod;
  usageFrequency: string;
  dataSensitivity?: string;
  startedAt?: string;
  renewsAt?: string;
  cancelReminderAt?: string;
  notes?: string;
  taskId?: string;
};

export type StackActionResult =
  | { success: true; itemId?: string; message: string }
  | { success: false; code: string; message: string };

function optionalDate(value: string | undefined): string | null | 'invalid' {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'invalid' : date.toISOString();
}

function revalidateStack(locale: string) {
  revalidatePath(`/${locale}/profile/stack`);
  revalidatePath(`/${locale}/profile`);
}

async function saveStackItemInternal(input: StackItemInput, locale: string): Promise<StackActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to manage your AI Stack.' };

  const itemId = input.id?.trim() || '';
  if (itemId && !uuidPattern.test(itemId)) {
    return { success: false, code: 'INVALID_ITEM', message: 'This Stack item is not valid.' };
  }

  const toolId = input.toolId?.trim() || '';
  const customToolName = input.customToolName?.trim().slice(0, 200) || '';
  if (!toolId && !customToolName) {
    return { success: false, code: 'TOOL_REQUIRED', message: 'Choose a listed tool or enter a custom tool.' };
  }
  if (toolId && !uuidPattern.test(toolId)) {
    return { success: false, code: 'INVALID_TOOL', message: 'Choose a valid listed tool.' };
  }
  if (toolId) {
    const toolResult = await query<{ id: string }>(
      `SELECT id FROM tools WHERE id = $1::uuid AND status = 'published' LIMIT 1`,
      [toolId],
    );
    if (!toolResult.rows[0]) {
      return { success: false, code: 'TOOL_NOT_AVAILABLE', message: 'This listed tool is not available.' };
    }
  }

  if (!subscriptionStatuses.has(input.subscriptionStatus)) {
    return { success: false, code: 'INVALID_SUBSCRIPTION', message: 'Choose a valid subscription status.' };
  }
  if (!billingPeriods.has(input.billingPeriod)) {
    return { success: false, code: 'INVALID_BILLING_PERIOD', message: 'Choose a valid billing period.' };
  }
  if (!usageFrequencies.has(input.usageFrequency)) {
    return { success: false, code: 'INVALID_USAGE', message: 'Choose a valid usage frequency.' };
  }
  const dataSensitivity = input.dataSensitivity || null;
  if (dataSensitivity && !sensitivityLevels.has(dataSensitivity)) {
    return { success: false, code: 'INVALID_SENSITIVITY', message: 'Choose a valid data sensitivity.' };
  }
  const taskId = input.taskId?.trim() || '';
  if (taskId && !uuidPattern.test(taskId)) {
    return { success: false, code: 'INVALID_TASK', message: 'Choose a valid primary task.' };
  }
  if (taskId) {
    const { data: activeTask, error: taskLookupError } = await supabase
      .from('decision_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('status', 'active')
      .maybeSingle();
    if (taskLookupError || !activeTask) {
      return { success: false, code: 'TASK_NOT_AVAILABLE', message: 'The selected task is no longer available.' };
    }
  }

  const amountText = input.billingAmount?.trim() || '';
  const billingAmount = amountText === '' ? null : Number(amountText);
  if (billingAmount !== null && (!Number.isFinite(billingAmount) || billingAmount < 0 || billingAmount > 1_000_000)) {
    return { success: false, code: 'INVALID_COST', message: 'Enter a valid non-negative billing amount.' };
  }
  const currency = input.currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { success: false, code: 'INVALID_CURRENCY', message: 'Use a three-letter currency code.' };
  }

  const startedAt = optionalDate(input.startedAt);
  const renewsAt = optionalDate(input.renewsAt);
  const cancelReminderAt = optionalDate(input.cancelReminderAt);
  if ([startedAt, renewsAt, cancelReminderAt].includes('invalid')) {
    return { success: false, code: 'INVALID_DATE', message: 'One of the dates is invalid.' };
  }

  const normalized = normalizeStackCost(billingAmount, input.billingPeriod);
  const payload = {
    user_id: user.id,
    tool_id: toolId || null,
    custom_tool_name: toolId ? null : customToolName,
    custom_tool_url: toolId ? null : input.customToolUrl?.trim().slice(0, 1200) || null,
    subscription_status: input.subscriptionStatus,
    billing_amount: billingAmount,
    monthly_cost: normalized.monthlyCost,
    currency,
    billing_period: input.billingPeriod,
    cost_normalization: normalized.normalization,
    usage_frequency: input.usageFrequency,
    data_sensitivity: dataSensitivity,
    started_at: startedAt === 'invalid' ? null : startedAt,
    renews_at: renewsAt === 'invalid' ? null : renewsAt,
    cancel_reminder_at: cancelReminderAt === 'invalid' ? null : cancelReminderAt,
    notes: input.notes?.trim().slice(0, 2000) || null,
  };

  const isNewItem = !itemId;
  const { data: previousTaskLink } = itemId
    ? await supabase
        .from('user_tool_stack_item_tasks')
        .select('task_id, is_primary')
        .eq('stack_item_id', itemId)
        .eq('is_primary', true)
        .maybeSingle()
    : { data: null };
  let savedId = itemId;
  if (itemId) {
    const { data, error } = await supabase
      .from('user_tool_stack_items')
      .update(payload)
      .eq('id', itemId)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle();
    if (error || !data) {
      return { success: false, code: 'STACK_SAVE_FAILED', message: 'Unable to update this Stack item.' };
    }
  } else {
    const { data, error } = await supabase.from('user_tool_stack_items').insert(payload).select('id').single();
    if (error || !data) {
      return { success: false, code: 'STACK_SAVE_FAILED', message: 'Unable to add this tool to your Stack.' };
    }
    savedId = String(data.id);
  }

  const { error: clearTaskError } = await supabase
    .from('user_tool_stack_item_tasks')
    .delete()
    .eq('stack_item_id', savedId);
  if (clearTaskError) {
    if (isNewItem) await supabase.from('user_tool_stack_items').delete().eq('id', savedId).eq('user_id', user.id);
    return { success: false, code: 'STACK_TASK_SAVE_FAILED', message: 'Unable to save the task link. No duplicate tool was created.' };
  }
  if (taskId) {
    const { error: taskError } = await supabase.from('user_tool_stack_item_tasks').insert({
      stack_item_id: savedId,
      task_id: taskId,
      is_primary: true,
    });
    if (taskError) {
      if (isNewItem) {
        await supabase.from('user_tool_stack_items').delete().eq('id', savedId).eq('user_id', user.id);
      } else if (previousTaskLink?.task_id) {
        await supabase.from('user_tool_stack_item_tasks').insert({
          stack_item_id: savedId,
          task_id: previousTaskLink.task_id,
          is_primary: true,
        });
      }
      return { success: false, code: 'STACK_TASK_SAVE_FAILED', message: 'Unable to save the task link. Retry safely.' };
    }
  }

  revalidateStack(locale);
  return { success: true, itemId: savedId, message: itemId ? 'Stack item updated.' : 'Tool added to your Stack.' };
}

export async function saveStackItem(input: StackItemInput, locale: string): Promise<StackActionResult> {
  try {
    return await saveStackItemInternal(input, locale);
  } catch {
    return {
      success: false,
      code: 'STACK_UNAVAILABLE',
      message: 'Your AI Stack is temporarily unavailable. Please retry.',
    };
  }
}

async function deleteStackItemInternal(itemId: string, locale: string): Promise<StackActionResult> {
  if (!uuidPattern.test(itemId)) {
    return { success: false, code: 'INVALID_ITEM', message: 'This Stack item is not valid.' };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, code: 'AUTH_REQUIRED', message: 'Log in to manage your AI Stack.' };

  const { error } = await supabase
    .from('user_tool_stack_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id);
  if (error) return { success: false, code: 'STACK_DELETE_FAILED', message: 'Unable to remove this Stack item.' };

  revalidateStack(locale);
  return { success: true, message: 'Tool removed from your Stack.' };
}

export async function deleteStackItem(itemId: string, locale: string): Promise<StackActionResult> {
  try {
    return await deleteStackItemInternal(itemId, locale);
  } catch {
    return {
      success: false,
      code: 'STACK_UNAVAILABLE',
      message: 'Your AI Stack is temporarily unavailable. Please retry.',
    };
  }
}

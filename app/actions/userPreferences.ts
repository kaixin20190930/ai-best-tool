'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

export async function getMySubmissionEmailPreference(): Promise<boolean> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_preferences')
    .select('notify_tool_updates')
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return true;
  }

  return data.notify_tool_updates !== false;
}

export async function updateMySubmissionEmailPreference(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase.from('user_preferences').upsert(
      {
        user_id: user.id,
        notify_tool_updates: enabled,
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preference.',
    };
  }
}

export async function shouldSendSubmissionStatusEmail(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_preferences')
    .select('email_notifications, notify_tool_updates')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return true;
  }

  if (data.email_notifications === false) {
    return false;
  }

  return data.notify_tool_updates !== false;
}

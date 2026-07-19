import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';

export type DistributionAttributionEvent = 'visit' | 'signup' | 'submit' | 'claim' | 'checkout' | 'payment';

function getCookieValue(name: string): string | null {
  return cookies().get(name)?.value?.trim() || null;
}

export async function recordDistributionAttributionEvent(
  eventType: DistributionAttributionEvent,
  userId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const sessionId = getCookieValue('abt_distribution_session') || randomUUID();
    const linkId = getCookieValue('abt_dist_link');
    const supabase = createAdminClient();

    let projectId = getCookieValue('abt_dist_project');
    let channelId = getCookieValue('abt_dist_channel');

    if (linkId) {
      const { data: link } = await supabase.from('distribution_links').select('project_id, channel_id').eq('id', linkId).maybeSingle();
      projectId = link?.project_id || projectId;
      channelId = link?.channel_id || channelId;
    }

    const { error } = await supabase.from('distribution_attribution_events').insert({
      event_type: eventType,
      session_id: sessionId,
      user_id: userId || null,
      project_id: projectId,
      channel_id: channelId,
      link_id: linkId,
      metadata,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Distribution attribution event failed:', error);
  }
}

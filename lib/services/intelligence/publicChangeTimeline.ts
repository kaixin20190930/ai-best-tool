import { createAdminClient } from '@/lib/supabase/admin';

import { mapIntelligenceTimelineRow } from './changeTimeline';
import type { ProductIntelligenceTimelineEvent } from './types';

// Named for the tool-detail integration that follows the timeline data migration.
// eslint-disable-next-line import/prefer-default-export
export async function getPublicToolChangeTimeline(toolId: string): Promise<ProductIntelligenceTimelineEvent[]> {
  try {
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from('product_intelligence_profiles')
      .select('id')
      .eq('owner_type', 'tool')
      .eq('owner_id', toolId)
      .maybeSingle();
    if (profileError || !profile?.id) return [];

    const { data, error } = await supabase
      .from('product_intelligence_timeline_events')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('visibility', 'public')
      .order('occurred_at', { ascending: false })
      .limit(24);
    if (error) return [];
    return (data || []).map((row) => mapIntelligenceTimelineRow(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

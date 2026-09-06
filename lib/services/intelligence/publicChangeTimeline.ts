import { createAdminClient } from '@/lib/supabase/admin';

import { mapIntelligenceTimelineRow } from './changeTimeline';
import { resolvePublicToolProfileId } from './publicToolProfile';
import type { ProductIntelligenceTimelineEvent } from './types';

// Named for the tool-detail integration that follows the timeline data migration.
// eslint-disable-next-line import/prefer-default-export
export async function getPublicToolChangeTimeline(
  toolId: string,
  canonicalSlug?: string,
): Promise<ProductIntelligenceTimelineEvent[]> {
  try {
    const supabase = createAdminClient();
    const profileId = await resolvePublicToolProfileId(supabase, toolId, canonicalSlug);
    if (!profileId) return [];

    const { data, error } = await supabase
      .from('product_intelligence_timeline_events')
      .select('*')
      .eq('profile_id', profileId)
      .eq('visibility', 'public')
      .order('occurred_at', { ascending: false })
      .limit(24);
    if (error) return [];
    return (data || []).map((row) => mapIntelligenceTimelineRow(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

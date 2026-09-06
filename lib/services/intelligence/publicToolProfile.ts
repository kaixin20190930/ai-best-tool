import type { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

async function findProfileIdByOwnerId(supabase: AdminClient, ownerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('product_intelligence_profiles')
    .select('id')
    .eq('owner_type', 'tool')
    .eq('owner_id', ownerId)
    .maybeSingle();

  return error || !data?.id ? null : String(data.id);
}

// The public directory and intelligence store can retain different tool UUIDs after a controlled migration.
export async function resolvePublicToolProfileId(
  supabase: AdminClient,
  toolId: string,
  canonicalSlug?: string,
): Promise<string | null> {
  const directProfileId = await findProfileIdByOwnerId(supabase, toolId);
  if (directProfileId || !canonicalSlug) return directProfileId;

  const { data: intelligenceTool, error: toolError } = await supabase
    .from('tools')
    .select('id')
    .eq('name', canonicalSlug)
    .maybeSingle();
  if (toolError || !intelligenceTool?.id || intelligenceTool.id === toolId) return null;

  return findProfileIdByOwnerId(supabase, String(intelligenceTool.id));
}

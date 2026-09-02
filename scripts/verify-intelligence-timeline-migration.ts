import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyIntelligenceTimelineMigration() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('product_intelligence_timeline_events')
    .select('id, profile_id, event_type, review_scope, visibility, occurred_at, verified_at')
    .limit(1);
  if (error) throw new Error(`Change Timeline migration is not ready: ${error.message}`);

  console.log(
    JSON.stringify(
      {
        success: true,
        timelineSchemaReadable: true,
        existingEvents: data?.length || 0,
      },
      null,
      2,
    ),
  );
}

verifyIntelligenceTimelineMigration().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

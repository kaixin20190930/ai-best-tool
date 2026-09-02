import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verifyIntelligenceTimelineMigration() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('product_intelligence_timeline_events')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(`Change Timeline migration is not ready: ${error.message}`);

  console.log(
    JSON.stringify(
      {
        success: true,
        timelineSchemaReadable: true,
        existingEvents: count || 0,
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

import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

async function verify() {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('trial_scorecards')
    .select('id, reminder_enabled, reminder_sent_at')
    .limit(1);
  if (error) throw new Error(`Trial reminder migration is not ready: ${error.message}`);
  console.log(JSON.stringify({ success: true, reminderCursorReadable: true, next: 'Run STK-04 trial release tests.' }, null, 2));
}

verify().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

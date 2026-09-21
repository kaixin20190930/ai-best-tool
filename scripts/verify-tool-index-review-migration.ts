import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

async function main() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    const result = await client.query(`SELECT
      to_regclass('public.tool_index_review_runs') IS NOT NULL AS readable,
      EXISTS (SELECT 1 FROM pg_class WHERE oid=to_regclass('public.tool_index_review_runs') AND relrowsecurity) AS rls`);
    if (!result.rows[0]?.readable || !result.rows[0]?.rls)
      throw new Error('Index review migration is missing or RLS is disabled');
    console.log(JSON.stringify({ success: true, reviewLedgerReadable: true, rlsEnabled: true }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

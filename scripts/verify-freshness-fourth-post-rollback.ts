import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import FOURTH_BATCH from './freshness-fourth-batch';
import verifyFourthPostRollbackReadback from './freshness-fourth-post-rollback-state';

async function main() {
  const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice(6);
  if (!outputPath || process.argv.slice(2).some((arg) => !arg.startsWith('--out='))) {
    throw new Error('Provide only --out=path');
  }
  const preflight = JSON.parse(fs.readFileSync('docs/FRESHNESS_FOURTH_BATCH_PREFLIGHT_2026-10-08.json', 'utf8'));
  const rollback = JSON.parse(fs.readFileSync('docs/FRESHNESS_FOURTH_BATCH_ROLLBACK_2026-10-08.json', 'utf8'));
  config({ path: '.env.local', quiet: true });
  // This process opens its own connection after the rollback runner has exited.
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  let readbackRows: Record<string, any>[] = [];
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout='30s'");
    for (const candidate of FOURTH_BATCH) {
      const found = await client.query(
        "SELECT to_jsonb(t) - 'search_vector' AS record FROM public.tools t WHERE id=$1 AND name=$2",
        [candidate.id, candidate.slug],
      );
      if (found.rowCount !== 1) throw new Error(`${candidate.slug}: independent readback missing or duplicate`);
      readbackRows.push(found.rows[0].record);
    }
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
  const result = verifyFourthPostRollbackReadback(preflight, rollback, readbackRows);
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

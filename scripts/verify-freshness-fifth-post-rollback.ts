import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import FIFTH_BATCH from './freshness-fifth-batch';
import verifyFifthPostRollbackReadback from './freshness-fifth-post-rollback-state';

async function main() {
  const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice(6);
  if (!outputPath || process.argv.slice(2).some((arg) => !arg.startsWith('--out=')))
    throw new Error('Provide only --out=path');
  const preflight = JSON.parse(fs.readFileSync('docs/FRESHNESS_FIFTH_BATCH_PREFLIGHT_2026-10-09.json', 'utf8'));
  const rollback = JSON.parse(fs.readFileSync('docs/FRESHNESS_FIFTH_BATCH_ROLLBACK_2026-10-09.json', 'utf8'));
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  const rows: Record<string, any>[] = [];
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout='30s'");
    for (const candidate of FIFTH_BATCH) {
      const found = await client.query(
        "SELECT to_jsonb(t) - 'search_vector' AS record FROM public.tools t WHERE id=$1 AND name=$2",
        [candidate.id, candidate.slug],
      );
      if (found.rowCount !== 1) throw new Error(`${candidate.slug}: independent readback missing or duplicate`);
      rows.push(found.rows[0].record);
    }
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(verifyFifthPostRollbackReadback(preflight, rollback, rows), null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

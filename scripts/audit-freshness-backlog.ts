import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { classifyBacklog, selectBacklogBatch, type BacklogRow } from './freshness-backlog';

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !arg.startsWith('--date=') && !arg.startsWith('--out='))) throw new Error('Only --date and --out are supported; audit is read-only.');
  const today = args.find(arg => arg.startsWith('--date='))?.slice(7) || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Invalid date');
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const result = await client.query<BacklogRow>(`SELECT id,name,status,page_quality_status,next_review_date::text,
      updated_at::text,url,features FROM public.tools ORDER BY name`);
    await client.query('COMMIT');
    const due = result.rows.map(row => classifyBacklog(row, today)).filter((row): row is NonNullable<typeof row> => Boolean(row));
    const counts = Object.fromEntries(['schedule_sync','claim_due','entity_due','manual_archive_review'].map(key => [key, due.filter(row => row.classification === key).length]));
    const report = { asOf: today, readOnly: true, totalTools: result.rows.length, published: result.rows.filter(row => row.status === 'published').length,
      duePublished: due.length, counts, selected: selectBacklogBatch(due).map(row => row.slug), items: due };
    const out = args.find(arg => arg.startsWith('--out='))?.slice(6);
    if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
    else console.log(JSON.stringify(report, null, 2));
  } finally { await client.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

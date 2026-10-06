import { loadEnvConfig } from '@next/env';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());
if (process.env.ELICIT_ENV_FILE) config({ path: process.env.ELICIT_ENV_FILE, quiet: true, override: true });
async function main() {
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let identity;
  try {
    await db.query('BEGIN READ ONLY');
    const matches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url,features::text,tags::text) ILIKE ANY($1)",
      [['%elicit%', '%ought.org%']],
    );
    const counts = await db.query(
      'SELECT status,page_quality_status,count(*)::int FROM tools GROUP BY status,page_quality_status ORDER BY status,page_quality_status',
    );
    identity = { matches: matches.rows, counts: counts.rows };
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
  const profiles = await createAdminClient()
    .from('product_intelligence_profiles')
    .select('id,product_name,canonical_domain')
    .or('product_name.ilike.%elicit%,canonical_domain.ilike.%elicit%,canonical_domain.ilike.%ought.org%');
  if (profiles.error) throw new Error(profiles.error.message);
  const pages = await Promise.all(
    ['/ai/elicit', '/cn/ai/elicit', '/tw/ai/elicit', '/sitemap.xml'].map(async (path) => {
      const r = await fetch('https://aibesttool.com' + path);
      const html = await r.text();
      return {
        path,
        status: r.status,
        canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
        robots: html.match(/<meta name="robots" content="([^"]+)"/)?.[1],
        h1: html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]*>/g, ''),
        ...(path === '/sitemap.xml'
          ? { locCount: (html.match(/<loc>/g) || []).length, elicitMatches: (html.match(/elicit/gi) || []).length }
          : {}),
      };
    }),
  );
  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        productionWrites: 0,
        transaction: 'BEGIN READ ONLY; SELECT; ROLLBACK',
        identity,
        profiles: profiles.data,
        pages,
      },
      null,
      2,
    ),
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

if (process.env.SCITE_ENV_FILE) config({ path: process.env.SCITE_ENV_FILE, quiet: true, override: true });

async function main() {
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let identity;
  try {
    await db.query('BEGIN READ ONLY');
    const productMatches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url) ILIKE ANY($1)",
      [['%scite%', '%scite.ai%']],
    );
    const contextual = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url,features::text,tags::text) ILIKE ANY($1)",
      [['%scite%', '%scite.ai%']],
    );
    const counts = await db.query(
      'SELECT status,page_quality_status,count(*)::int FROM tools GROUP BY status,page_quality_status ORDER BY status,page_quality_status',
    );
    identity = { matches: productMatches.rows, contextualMatches: contextual.rows, counts: counts.rows };
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }

  const profiles = await createAdminClient()
    .from('product_intelligence_profiles')
    .select('id,product_name,canonical_domain')
    .or('product_name.ilike.%scite%,canonical_domain.ilike.%scite%');
  if (profiles.error) throw new Error(profiles.error.message);

  const paths = [
    '/ai/scite',
    '/cn/ai/scite',
    '/tw/ai/scite',
    '/ai/scite-ai',
    '/cn/ai/scite-ai',
    '/tw/ai/scite-ai',
    '/ai/sciteai',
    '/cn/ai/sciteai',
    '/tw/ai/sciteai',
    '/sitemap.xml',
  ];
  const pages = await Promise.all(
    paths.map(async (path) => {
      const response = await fetch(`https://aibesttool.com${path}`, { signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      return {
        path,
        status: response.status,
        canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
        robots: html.match(/<meta name="robots" content="([^"]+)"/)?.[1],
        h1: html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]*>/g, ''),
        ...(path === '/sitemap.xml'
          ? { locCount: (html.match(/<loc>/g) || []).length, sciteMatches: (html.match(/scite/gi) || []).length }
          : {}),
      };
    }),
  );
  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        productionWrites: 0,
        transaction:
          'PostgreSQL default_transaction_read_only=on; BEGIN READ ONLY; SELECT; ROLLBACK; Supabase GET only',
        identity,
        profiles: profiles.data,
        pages,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

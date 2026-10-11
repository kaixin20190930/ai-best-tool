import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

config({ path: '.env.local', quiet: true });

async function main() {
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let identity;
  try {
    await db.query('BEGIN READ ONLY');
    const productMatches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url) ILIKE ANY($1)",
      [['%anyword%', '%any-word%', '%keywee%']],
    );
    const contextual = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url,features::text,tags::text) ILIKE ANY($1)",
      [['%anyword%', '%any-word%', '%keywee%']],
    );
    const fixedId = await db.query('SELECT id,name,url FROM tools WHERE id=$1', [
      '4555627d-2de9-4614-a850-fa073388f869',
    ]);
    identity = { matches: productMatches.rows, contextualMatches: contextual.rows, fixedId: fixedId.rows };
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }

  const profiles = await createAdminClient()
    .from('product_intelligence_profiles')
    .select('id,product_name,canonical_domain')
    .or('product_name.ilike.%anyword%,product_name.ilike.%keywee%,canonical_domain.ilike.%anyword%');
  if (profiles.error) throw new Error(profiles.error.message);

  const paths = ['/ai/anyword', '/cn/ai/anyword', '/tw/ai/anyword', '/ai/any-word', '/ai/keywee', '/sitemap.xml'];
  const pages = await Promise.all(
    paths.map(async (pagePath) => {
      const response = await fetch(`https://aibesttool.com${pagePath}`, { signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      return {
        path: pagePath,
        status: response.status,
        canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
        robots: html.match(/<meta name="robots" content="([^"]+)"/)?.[1],
        ...(pagePath === '/sitemap.xml'
          ? { locCount: (html.match(/<loc>/g) || []).length, anywordMatches: (html.match(/anyword|keywee/gi) || []).length }
          : {}),
      };
    }),
  );
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), productionWrites: 0, identity, profiles: profiles.data, pages }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

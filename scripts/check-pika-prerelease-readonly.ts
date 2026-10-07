import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

// Preserve environment supplied by the read-only wrapper; never override its connection restrictions.
config({ path: process.env.PIKA_ENV_FILE || '.env.local', quiet: true });
async function main() {
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let identity;
  try {
    await db.query('BEGIN READ ONLY');
    const matches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status,features,tags FROM tools WHERE concat_ws(' ',name,title,url,features::text,tags::text) ILIKE ANY($1)",
      [['%pika%', '%mellis%']],
    );
    const counts = await db.query(
      'SELECT status,page_quality_status,count(*)::int FROM tools GROUP BY status,page_quality_status ORDER BY status,page_quality_status',
    );
    const productMatches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url) ILIKE ANY($1)",
      [['%pika%', '%mellis%']],
    );
    identity = {
      matches: productMatches.rows,
      contextualMatches: matches.rows.map(({ features, tags, ...row }) => ({
        ...row,
        matchingAlternativeSlugs:
          features?.decision?.alternatives
            ?.filter((x: { slug?: string }) => x.slug?.includes('pika'))
            .map((x: { slug: string }) => x.slug) || [],
      })),
      counts: counts.rows,
    };
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
  const profiles = await createAdminClient()
    .from('product_intelligence_profiles')
    .select('id,product_name,canonical_domain')
    .or('product_name.ilike.%pika%,canonical_domain.ilike.%pika%,product_name.ilike.%mellis%');
  if (profiles.error) throw new Error(profiles.error.message);
  const pages = await Promise.all(
    [
      '/ai/pika',
      '/cn/ai/pika',
      '/tw/ai/pika',
      '/ai/pika-ai',
      '/cn/ai/pika-ai',
      '/tw/ai/pika-ai',
      '/ai/pika-labs',
      '/cn/ai/pika-labs',
      '/tw/ai/pika-labs',
      '/sitemap.xml',
    ].map(async (path) => {
      const r = await fetch('https://aibesttool.com' + path, { signal: AbortSignal.timeout(30000) });
      const html = await r.text();
      return {
        path,
        status: r.status,
        canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
        robots: html.match(/<meta name="robots" content="([^"]+)"/)?.[1],
        h1: html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]*>/g, ''),
        ...(path === '/sitemap.xml'
          ? { locCount: (html.match(/<loc>/g) || []).length, pikaMatches: (html.match(/pika/gi) || []).length }
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

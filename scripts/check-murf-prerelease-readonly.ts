import { loadEnvConfig } from '@next/env';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());
if (process.env.MURF_ENV_FILE) config({ path: process.env.MURF_ENV_FILE, quiet: true, override: true });
async function main() {
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  let identity;
  try {
    await db.query('BEGIN READ ONLY');
    const matches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status,features,tags FROM tools WHERE concat_ws(' ',name,title,url,features::text,tags::text) ILIKE ANY($1)",
      [['%murf%', '%murf studio%']],
    );
    const counts = await db.query(
      'SELECT status,page_quality_status,count(*)::int FROM tools GROUP BY status,page_quality_status ORDER BY status,page_quality_status',
    );
    const productMatches = await db.query(
      "SELECT id,name,title,url,status,page_quality_status FROM tools WHERE concat_ws(' ',name,title,url) ILIKE ANY($1)",
      [['%murf%']],
    );
    identity = {
      matches: productMatches.rows,
      contextualMatches: matches.rows.map(({ features, tags, ...row }) => ({
        ...row,
        matchingAlternativeSlugs:
          features?.decision?.alternatives
            ?.filter((x: { slug?: string }) => x.slug?.includes('murf'))
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
    .or('product_name.ilike.%murf%,canonical_domain.ilike.%murf%,canonical_domain.ilike.%murf studio%');
  if (profiles.error) throw new Error(profiles.error.message);
  const pages = [];
  for (const path of [
    '/ai/murf',
    '/cn/ai/murf',
    '/tw/ai/murf',
    '/ai/murf-ai',
    '/cn/ai/murf-ai',
    '/tw/ai/murf-ai',
    '/sitemap.xml',
  ]) {
    const r = await fetch('https://aibesttool.com' + path, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
    const html = await r.text();
    pages.push({
      path,
      status: r.status,
      location: r.headers.get('location'),
      canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
      robots: html.match(/<meta name="robots" content="([^"]+)"/)?.[1],
      h1: html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]*>/g, ''),
      ...(path === '/sitemap.xml'
        ? { locCount: (html.match(/<loc>/g) || []).length, murfMatches: (html.match(/murf/gi) || []).length }
        : {}),
    });
  }
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
  console.error(e.stack || e.message);
  process.exitCode = 1;
});

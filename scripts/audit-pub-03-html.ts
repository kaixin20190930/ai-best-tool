import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { Client } from 'pg';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { topListTopics } from '../lib/data/topLists';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { copyViolations } from './lib/public-content-boundary';

const capture = process.argv.includes('--capture');
const refreshPaths = process.argv
  .find((arg) => arg.startsWith('--refresh='))
  ?.slice('--refresh='.length)
  .split(',');
const base = process.env.SEO_BASE_URL || (capture ? 'https://aibesttool.com' : 'http://127.0.0.1:3037');
const dir = 'reports/public-content-boundary/';
async function get(path: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { 'user-agent': 'Googlebot' },
        signal: AbortSignal.timeout(90_000),
      });
      const html = await response.text();
      if (response.status >= 500 && attempt < 2) continue;
      return { response, html };
    } catch (error) {
      if (attempt >= 2) throw error;
    }
  }
}
async function inspect(path: string) {
  const { response, html } = await get(path);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const seo = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
    hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((n) => [
      n.getAttribute('hreflang'),
      n.getAttribute('href'),
    ]),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
    xRobotsTag: response.headers.get('x-robots-tag'),
    schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((n) =>
      JSON.parse(n.textContent || '{}'),
    ),
  };
  document.querySelectorAll('script,style,noscript').forEach((n) => n.remove());
  const text = document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
  const bodyViolations = copyViolations(text);
  document.querySelectorAll('header,footer').forEach((n) => n.remove());
  const commercial = [...document.querySelectorAll('a[href]')]
    .filter((n) =>
      /^\/(?:en\/|cn\/)?(?:submit|pricing|developer\/listing)(?:[?#]|$)/.test(n.getAttribute('href') || ''),
    )
    .map((n) => ({
      href: n.getAttribute('href'),
      text: n.textContent?.trim(),
      owner: !!n.closest('[data-tool-owner-actions]'),
    }));
  const result = {
    path,
    status: response.status,
    resolvedPath: new URL(response.url).pathname,
    seo,
    bodyViolations,
    h1: document.querySelectorAll('h1').length,
    decisionCards: document.querySelectorAll('#decision-card').length,
    evidenceLedgers: document.querySelectorAll('[data-evidence-ledger]').length,
    timelines: document.querySelectorAll('[data-change-timeline]').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((n) => n.textContent),
    commercial,
    text,
  };
  dom.window.close();
  return result;
}
async function main() {
  const before = capture ? null : JSON.parse(readFileSync(`${dir}pub-03-html-before.json`, 'utf8'));
  let inventory;
  if (capture) {
    const client = new Client({ connectionString: getDatabaseConnectionString() });
    await client.connect();
    try {
      const readonly = (await client.query('SHOW default_transaction_read_only')).rows[0].default_transaction_read_only;
      assert.equal(readonly, 'on', 'Database must be read-only');
      const tools = (
        await client.query("SELECT name,status,page_quality_status FROM tools WHERE status='published' ORDER BY name")
      ).rows;
      const categories = (await client.query('SELECT slug FROM categories ORDER BY slug')).rows.map((x) => x.slug);
      inventory = {
        readonly,
        tools,
        categories,
        fallbacks: ['lindy', 'notta', 'defillama', 'grammarly', 'chatgpt'],
        unavailable: ['elevenlabs'],
      };
    } finally {
      await client.end();
    }
  } else inventory = before.inventory;
  const sitemapResponse = await get('/sitemap.xml');
  assert.equal(sitemapResponse.response.status, 200);
  const sitemap = [...sitemapResponse.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const comparison = JSON.parse(readFileSync(`${dir}pub-02-comparison-disposition.json`, 'utf8')).pages.map(
    (p: { path: string }) => p.path,
  );
  const allPaths: string[] = capture
    ? [
      ...new Set([
        ...sitemap.map((url) => new URL(url).pathname),
        ...[
          ...inventory.tools.map((t: { name: string }) => `/ai/${getCanonicalToolSlug(t.name)}`),
          ...inventory.fallbacks.map((slug: string) => `/ai/${slug}`),
          ...inventory.unavailable.map((slug: string) => `/ai/${slug}`),
          ...inventory.categories
            .concat(['web3', 'voice', 'research', 'automation', 'developer-tools'])
            .map((s: string) => `/categories/${s}`),
          ...topListTopics.map((t) => `/best-ai-tools/${t.key}`),
          ...comparison,
          '/new',
          '/submit',
          '/pricing',
          '/developer/listing',
          '/distribution',
          '/find-tools',
        ].flatMap((p) => [p, `/cn${p}`]),
      ]),
    ].sort()
    : before.results.map((r: { path: string }) => r.path);
  const previous = refreshPaths ? JSON.parse(readFileSync(`${dir}pub-03-html-verification.json`, 'utf8')) : null;
  if (refreshPaths) for (const path of refreshPaths) assert(allPaths.includes(path), `Unknown refresh path ${path}`);
  const paths = refreshPaths || allPaths;
  const results: Awaited<ReturnType<typeof inspect>>[] = previous
    ? previous.results.filter((r: { path: string }) => !paths.includes(r.path))
    : [];
  const initialResults = results.length;
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < paths.length) {
        results.push(await inspect(paths[next++]));
        if ((results.length - initialResults) % 25 === 0) console.log(`Scanned ${results.length - initialResults}/${paths.length}`);
      }
    }),
  );
  results.sort((a, b) => a.path.localeCompare(b.path));
  const failures: string[] = [];
  if (!capture) {
    if (JSON.stringify(sitemap) !== JSON.stringify(before.sitemap)) failures.push('sitemap set drift');
    for (const r of results) {
      const old = before.results.find((x: { path: string }) => x.path === r.path);
      if (r.status !== old.status || r.resolvedPath !== old.resolvedPath) failures.push(`${r.path}: status/redirect drift`);
      if (JSON.stringify(r.seo) !== JSON.stringify(old.seo)) failures.push(`${r.path}: frozen SEO drift`);
      if (r.bodyViolations.length) failures.push(`${r.path}: ${r.bodyViolations.join(',')}`);
      if (r.status === 200 && !/\/(distribution|find-tools)$/.test(r.path) && r.h1 !== 1) failures.push(`${r.path}: H1 count ${r.h1}`);
      if (/\/(?:cn\/)?ai\//.test(r.path) && old.decisionCards > 0 && r.decisionCards !== 1) failures.push(`${r.path}: decision count ${r.decisionCards}`);
      if (r.evidenceLedgers !== old.evidenceLedgers || r.timelines !== old.timelines) failures.push(`${r.path}: evidence/timeline lost`);
      if (/^\/(?:cn\/)?(?:$|explore|new|best-ai-tools|categories)/.test(r.path) && r.commercial.length) failures.push(`${r.path}: commercial CTA in discovery`);
      if (/\/(?:cn\/)?ai\//.test(r.path) && r.commercial.some((c) => !c.owner)) failures.push(`${r.path}: commercial CTA outside owner area`);
    }
  }
  const report = {
    base,
    checkedAt: new Date().toISOString(),
    inventory,
    sitemap,
    verificationBatches: [
      ...(previous?.verificationBatches || (previous ? [{ checkedAt: previous.checkedAt, paths: allPaths }] : [])),
      { checkedAt: new Date().toISOString(), paths },
    ],
    results,
    failures,
    pages: results.length,
    baselinePagesWithViolations: before
      ? before.results.filter((r: { text: string }) => copyViolations(r.text).length).length
      : null,
    pagesWithViolations: results.filter((r) => r.bodyViolations.length).length,
    pass: !capture && failures.length === 0,
  };
  writeFileSync(
    `${dir}pub-03-html-${capture ? 'before' : 'verification'}.json`,
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify({ pages: results.length, pagesWithViolations: report.pagesWithViolations, failures }));
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

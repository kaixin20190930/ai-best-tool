import assert from 'node:assert/strict';
import fs from 'node:fs';

type AuditResult = {
  sourceUrl: string;
  firstStatus: number;
  firstLocation: string | null;
  finalUrl: string;
  finalStatus: number;
  canonical: string | null;
  noindex: boolean;
  inSitemap: boolean;
  classification: string;
};

const inputPath = process.argv.find((arg) => arg.startsWith('--input='))?.slice('--input='.length);
assert(inputPath, 'Required: --input=<json-file>');
const urls = JSON.parse(fs.readFileSync(inputPath, 'utf8')) as string[];
assert.equal(new Set(urls).size, urls.length, 'Coverage URL input contains duplicates');

function canonicalFromHtml(html: string): string | null {
  const tags = html.match(/<link\s+[^>]*>/gi) || [];
  return tags.find((tag) => /rel=["']canonical["']/i.test(tag))?.match(/href=["']([^"']+)["']/i)?.[1] || null;
}

function isNoindex(headers: Headers, html: string): boolean {
  const header = headers.get('x-robots-tag') || '';
  const meta = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1] || '';
  return `${header},${meta}`.toLowerCase().includes('noindex');
}

function classify(result: Omit<AuditResult, 'classification'>): string {
  const source = new URL(result.sourceUrl);
  const path = source.pathname;
  if (path === '/favicon.ico') return 'ignore_asset';
  if (result.firstStatus >= 300 && result.firstStatus < 400) return 'historical_redirect';
  if (path.includes('-comparison') || ['/login', '/en/register'].includes(path) || source.search) {
    return result.noindex ? 'expected_noindex' : 'technical_mismatch';
  }
  if (/^\/(fr|ru|jp|pt|de|tw|es)\//.test(path)) return result.noindex ? 'expected_noindex' : 'technical_mismatch';
  if (result.noindex) return 'intentional_tool_hold';
  if (result.inSitemap) return 'indexable_needs_google_review';
  return 'technical_mismatch';
}

async function inspect(url: string, sitemap: string): Promise<AuditResult> {
  const first = await fetch(url, {
    redirect: 'manual',
    headers: { 'user-agent': 'ai-best-tool-gsc-coverage-audit/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  const firstLocation = first.headers.get('location');
  const final = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'ai-best-tool-gsc-coverage-audit/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  const contentType = final.headers.get('content-type') || '';
  const html = contentType.includes('text/html') ? await final.text() : '';
  const base = {
    sourceUrl: url,
    firstStatus: first.status,
    firstLocation,
    finalUrl: final.url,
    finalStatus: final.status,
    canonical: canonicalFromHtml(html),
    noindex: isNoindex(final.headers, html),
    inSitemap: sitemap.includes(`<loc>${final.url}</loc>`),
  };
  return { ...base, classification: classify(base) };
}

async function main() {
  const sitemapResponse = await fetch('https://aibesttool.com/sitemap.xml', { signal: AbortSignal.timeout(20_000) });
  assert(sitemapResponse.ok, 'Unable to load production sitemap');
  const sitemap = await sitemapResponse.text();
  const results: AuditResult[] = [];
  for (let index = 0; index < urls.length; index += 6) {
    const batch = urls.slice(index, index + 6);
    results.push(...(await Promise.all(batch.map((url) => inspect(url, sitemap)))));
  }
  const counts = results.reduce<Record<string, number>>((accumulator, result) => {
    accumulator[result.classification] = (accumulator[result.classification] || 0) + 1;
    return accumulator;
  }, {});
  console.log(
    JSON.stringify({ auditedAt: new Date().toISOString(), inputCount: urls.length, counts, results }, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

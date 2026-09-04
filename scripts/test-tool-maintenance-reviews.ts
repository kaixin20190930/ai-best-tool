import assert from 'node:assert/strict';
import fs from 'node:fs';

import TOOL_MAINTENANCE_REVIEWS from '../lib/config/toolMaintenanceReviews';

async function main() {
  const source = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
  for (const [slug, review] of Object.entries(TOOL_MAINTENANCE_REVIEWS)) {
    assert.equal(review.checkedAt, '2026-09-04');
    assert(review.nextReviewDate > review.checkedAt);
    assert(review.unresolved.length > 0 && review.scope.includes('not a new market validation'));
    assert(review.sources.length >= 3 && review.sources.every((url) => new URL(url).protocol === 'https:'));
    const start = source.indexOf(`if (key === '${slug}')`);
    const branch = source.slice(start, source.indexOf('\n  if (key ===', start + 1));
    for (const language of ['en', 'zh'] as const) {
      assert(branch.includes(`TOOL_MAINTENANCE_REVIEWS.${slug}.note.${language}`), `${slug}: missing visible binding`);
      assert(review.note[language].length > 50);
    }
  }
  assert(TOOL_MAINTENANCE_REVIEWS.consensus.note.en.includes('also consumes a Pro message'));
  assert(TOOL_MAINTENANCE_REVIEWS.gamma.note.en.includes('Free credits do not refresh'));
  console.log('PASS scoped maintenance data, unresolved gaps and visible bindings');
  if (!process.argv.includes('--pages')) return;
  const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
  for (const [slug, review] of Object.entries(TOOL_MAINTENANCE_REVIEWS)) {
    for (const language of ['en', 'zh'] as const) {
      const path = `${language === 'zh' ? '/cn' : ''}/ai/${slug}`;
      const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200);
      const html = await response.text();
      const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      assert(visible.includes(review.note[language]), `${path}: visible review missing`);
      assert(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${path}: index boundary changed`);
      assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`));
      for (const url of review.sources) assert(visible.includes(url), `${path}: source link missing: ${url}`);
      console.log(`PASS ${path}: visible review, sources, canonical, noindex`);
    }
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert(!/<loc>[^<]*\/ai\/(gamma|consensus)\/?<\/loc>/.test(await response.text()));
  console.log('PASS sitemap excludes both tools');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { generateMetadata } from '../app/[locale]/(with-footer)/guides/ai-app-builders/page';
import boltLovableEvidence from '../data/collection/build-app-bolt-lovable-evidence-2026-10-13.json';
import v0ReplitEvidence from '../data/collection/build-app-v0-replit-evidence-2026-10-13.json';
import { appBuilderDimensions, appBuilderTools } from '../lib/content/appBuilderGuide';
import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';

const root = process.cwd();
const routePath = 'app/[locale]/(with-footer)/guides/ai-app-builders/page.tsx';
const route = readFileSync(join(root, routePath), 'utf8');
const hub = readFileSync(join(root, 'app/[locale]/(with-footer)/guides/page.tsx'), 'utf8');
const sitemap = readFileSync(join(root, 'app/sitemap.ts'), 'utf8');
const evidence = [...boltLovableEvidence.tools, ...v0ReplitEvidence.tools];

assert.deepEqual(
  appBuilderTools.map((tool) => tool.key),
  ['bolt', 'lovable', 'replit', 'v0'],
);
assert.equal(appBuilderDimensions.length, 6);
for (const tool of appBuilderTools) {
  const claims = evidence.find((entry) => entry.tool === tool.key)?.claims;
  assert.ok(claims, `missing ${tool.key} evidence`);
  assert.equal(claims.length, 6, `${tool.key}: six dimensions required`);
  assert.ok(tool.bestFor.en && tool.bestFor.cn && tool.notIdeal.en && tool.notIdeal.cn);
  for (const dimension of appBuilderDimensions) {
    const claim = claims.find((entry) => entry.stableKey === dimension.key);
    assert.ok(claim?.sourceUrl.startsWith('https://'), `${tool.key}/${dimension.key}: official source required`);
    assert.ok(claim.reviewedDate && claim.limitation, `${tool.key}/${dimension.key}: review and limitation required`);
    assert.ok(dimension.cells[tool.key].en && dimension.cells[tool.key].cn);
  }
}

assert.match(route, /locale !== 'en' && locale !== 'cn'/);
assert.match(route, /indexable: false/);
assert.match(route, /buildLocalizedPageMetadata/);
assert.match(route, /generateLocalizedCanonicalUrl\(path, locale, BASE_URL\)/);
assert.match(route, /<SeoBreadcrumbs/);
assert.match(route, /generateArticleSchema/);
assert.match(route, /not IDE code completion/);
assert.match(route, /不是编辑器里的代码补全/);
assert.match(route, /getClaim\(tool\.key, dimension\.key\)/);
assert.match(route, /generateLocalizedPath\(`\/ai\/\$\{tool\.key\}`/);
assert.doesNotMatch(route, /QA_PASS|HOLD_PUBLIC|READY_MONITOR|Task\/Fit|internal gate/i);
assert.ok(hub.includes("generateLocalizedPath('/guides/ai-app-builders', locale)"));
assert.ok(hub.includes("locale === 'en' || locale === 'cn'"));
assert.equal(INDEXABLE_GUIDE_PATHS.has('/guides/ai-app-builders'), false);
assert.ok(!sitemap.includes('/guides/ai-app-builders'));
assert.ok(sitemap.includes('INDEXABLE_GUIDE_PAGES.map'));

async function main() {
  for (const locale of ['en', 'cn']) {
    const metadata = await generateMetadata({ params: { locale } });
    const expectedPath = locale === 'en' ? '/guides/ai-app-builders' : '/cn/guides/ai-app-builders';
    assert.equal(metadata.alternates?.canonical, `https://aibesttool.com${expectedPath}`);
    assert.equal(metadata.robots?.index, false);
    assert.equal(metadata.robots?.follow, true);
    assert.equal(metadata.alternates?.languages, undefined);
  }

  console.log('App-builder Guide scope, evidence, locale and SEO boundary tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

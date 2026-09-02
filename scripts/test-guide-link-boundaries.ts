import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { INDEXABLE_GUIDE_PAGES, INDEXABLE_GUIDE_PATHS, isComparisonGuideHref } from '../lib/content/guides';

const root = process.cwd();
const guideHubPath = 'app/[locale]/(with-footer)/guides/page.tsx';
const guideHubSource = readFileSync(join(root, guideHubPath), 'utf8');
const sitemapSource = readFileSync(join(root, 'app/sitemap.ts'), 'utf8');
const middlewareSource = readFileSync(join(root, 'middleware.ts'), 'utf8');

function collectGuideFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return collectGuideFiles(path);
    return path.endsWith('.tsx') ? [path] : [];
  });
}

assert.ok(INDEXABLE_GUIDE_PAGES.length >= 12, 'Indexable guide allowlist is unexpectedly small');
assert.ok(
  INDEXABLE_GUIDE_PAGES.every((guide) => INDEXABLE_GUIDE_PATHS.has(guide.href) && !isComparisonGuideHref(guide.href)),
  'Indexable guide pages must be allowlisted and must not be comparison routes',
);

const comparisonLinks = guideHubSource.match(/\/guides\/[a-z0-9-]+-comparison/g) || [];
assert.equal(comparisonLinks.length, 1, `${guideHubPath}: keep exactly one clearly secondary comparison link`);

const secondarySectionIndex = guideHubSource.indexOf('<GitCompareArrows');
assert.ok(secondarySectionIndex > 0, `${guideHubPath}: missing explicit secondary comparison section`);
assert.ok(
  !guideHubSource.slice(0, secondarySectionIndex).includes('-comparison'),
  `${guideHubPath}: primary guide paths must not link to noindex comparison pages`,
);
assert.ok(
  guideHubSource.includes('INDEXABLE_GUIDE_PAGES'),
  `${guideHubPath}: guide cards must use the shared sitemap allowlist`,
);
assert.ok(
  guideHubSource.includes('generateLocalizedPath'),
  `${guideHubPath}: visible links must follow the default-English no-prefix rule`,
);
assert.ok(
  !guideHubSource.includes("from '@/app/navigation'"),
  `${guideHubPath}: next-intl server Link currently emits explicit /en paths`,
);
assert.ok(
  sitemapSource.includes('INDEXABLE_GUIDE_PAGES.map'),
  'app/sitemap.ts: sitemap and guide hub must share the same guide allowlist',
);
assert.ok(
  middlewareSource.includes("import { INDEXABLE_GUIDE_PATHS } from './lib/seo/guideIndexing'"),
  'middleware.ts: X-Robots-Tag decisions must share the guide allowlist',
);
assert.ok(
  middlewareSource.includes('!INDEXABLE_GUIDE_PATHS.has(pathWithoutLocale)'),
  'middleware.ts: guide noindex decisions must use the shared allowlist',
);

for (const file of collectGuideFiles(join(root, 'app/[locale]/(with-footer)/guides'))) {
  assert.ok(
    !readFileSync(file, 'utf8').includes('tool.averageRating.toFixed'),
    `${file}: database numeric values must be normalized before toFixed`,
  );
}

console.log(`Guide link boundary tests passed for ${INDEXABLE_GUIDE_PAGES.length} indexable guides.`);

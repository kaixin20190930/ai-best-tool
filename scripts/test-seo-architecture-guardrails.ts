import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const appRoot = join(root, 'app');

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return collectSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(path) ? [path] : [];
  });
}

const failures: string[] = [];
const appFiles = collectSourceFiles(appRoot);

for (const file of appFiles) {
  const source = readFileSync(file, 'utf8');
  const fileName = relative(root, file);

  if (/canonical\s*:\s*['"`]/.test(source)) {
    failures.push(`${fileName}: canonical must come from the localized metadata helper, not a literal`);
  }

  if (/canonical\s*:[^\n]*(?:\$\{locale\}|\$\{BASE_URL\}\s*\/\s*\$\{locale\})/.test(source)) {
    failures.push(`${fileName}: canonical must not concatenate locale or BASE_URL manually`);
  }
}

const coreMetadataFiles = [
  'app/[locale]/(with-footer)/(home)/page.tsx',
  'app/[locale]/(with-footer)/explore/layout.tsx',
  'app/[locale]/(with-footer)/explore/page.tsx',
  'app/[locale]/(with-footer)/guides/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx',
  'app/[locale]/(with-footer)/categories/[slug]/page.tsx',
  'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx',
];

for (const file of coreMetadataFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  if (!source.includes('buildLocalizedPageMetadata')) {
    failures.push(`${file}: core metadata must use buildLocalizedPageMetadata`);
  }
}

const bestTopicSource = readFileSync(join(root, 'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx'), 'utf8');
if (!bestTopicSource.includes("export const dynamic = 'force-dynamic'")) {
  failures.push(
    'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx: must remain dynamic because the shared locale layout reads auth cookies',
  );
}

const metadataSource = readFileSync(join(root, 'lib/seo/metadata.ts'), 'utf8');
for (const expected of [
  'generateLocalizedCanonicalUrl(canonicalPath, locale, baseUrl)',
  'generateHreflangLinks(canonicalPath, locale, baseUrl)',
  'isIndexableLocale(locale)',
  'path.split(/[?#]/, 1)',
]) {
  if (!metadataSource.includes(expected)) {
    failures.push(`lib/seo/metadata.ts: missing guardrail ${expected}`);
  }
}

const sitemapSource = readFileSync(join(root, 'app/sitemap.ts'), 'utf8');
for (const expected of [
  'INDEXABLE_LOCALES',
  'getToolIndexDecision(tool).indexable',
  'INDEXABLE_GUIDE_PAGES.map',
  'category.toolCount >= 3',
]) {
  if (!sitemapSource.includes(expected)) {
    failures.push(`app/sitemap.ts: missing sitemap boundary ${expected}`);
  }
}

assert.deepEqual(failures, [], `SEO architecture guardrails failed:\n${failures.join('\n')}`);

console.log(`SEO architecture guardrails passed across ${appFiles.length} app source files.`);

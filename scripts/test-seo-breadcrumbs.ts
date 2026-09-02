import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const componentPath = 'components/seo/SeoBreadcrumbs.tsx';
const componentSource = readFileSync(join(root, componentPath), 'utf8');

for (const expected of [
  'generateLocalizedCanonicalUrl(item.path, locale, BASE_URL)',
  'generateLocalizedPath(item.path, locale)',
  'generateBreadcrumbSchema(schemaItems)',
  "aria-label='Breadcrumb'",
  "aria-current='page'",
  'data-seo-breadcrumbs',
]) {
  assert.ok(componentSource.includes(expected), `${componentPath}: missing shared breadcrumb behavior ${expected}`);
}

const coreBreadcrumbFiles = [
  'app/[locale]/(with-footer)/explore/page.tsx',
  'app/[locale]/(with-footer)/guides/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/page.tsx',
  'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx',
  'app/[locale]/(with-footer)/categories/[slug]/CategoryContent.tsx',
  'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx',
];

for (const file of coreBreadcrumbFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  assert.ok(source.includes('SeoBreadcrumbs'), `${file}: must render the shared visible breadcrumb component`);
  assert.ok(!source.includes('generateBreadcrumbSchema'), `${file}: must not maintain a separate breadcrumb schema`);
}

console.log(`SEO breadcrumb tests passed across ${coreBreadcrumbFiles.length} core templates.`);

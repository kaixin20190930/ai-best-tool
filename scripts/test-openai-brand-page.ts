import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { generateMetadata } from '../app/[locale]/(with-footer)/brands/openai/page';
import { locales } from '../i18n';
import { generateLocalizedCanonicalUrl } from '../lib/seo/metadata';

const openAiBrandPath = '/brands/openai';
assert.deepEqual(locales, ['en', 'jp', 'de', 'es', 'fr', 'pt', 'ru', 'cn', 'tw']);

for (const locale of locales) {
  const metadata = generateMetadata({ params: { locale } });
  const canonical = generateLocalizedCanonicalUrl(openAiBrandPath, locale);
  assert.equal(metadata.alternates?.canonical, canonical, `${locale}: self canonical`);
  assert.equal(metadata.openGraph?.url, canonical, `${locale}: Open Graph URL`);
  assert.equal(metadata.alternates?.languages, undefined, `${locale}: no indexable hreflang`);
  assert.equal(
    metadata.robots && 'index' in metadata.robots ? metadata.robots.index : undefined,
    false,
    `${locale}: noindex`,
  );
  assert.equal(
    metadata.robots && 'follow' in metadata.robots ? metadata.robots.follow : undefined,
    true,
    `${locale}: follow`,
  );
  assert.equal(typeof metadata.title, 'string', `${locale}: title`);
  assert.equal(typeof metadata.description, 'string', `${locale}: description`);
}

const page = readFileSync(join(process.cwd(), 'app/[locale]/(with-footer)/brands/openai/page.tsx'), 'utf8');
const sitemap = readFileSync(join(process.cwd(), 'app/sitemap.ts'), 'utf8');
const aliases = readFileSync(join(process.cwd(), 'lib/config/toolRouteAliases.ts'), 'utf8');

for (const url of [
  '/ai/chatgpt',
  '/ai/codex',
  'https://chatgpt.com/',
  'https://openai.com/codex/',
  'https://developers.openai.com/api/docs',
  'https://openai.com/about/',
]) {
  assert(page.includes(url), `Missing product/company destination: ${url}`);
}
for (const locale of locales) assert(page.includes(`  ${locale}: {`), `${locale}: localized content`);
for (const key of ['chatgpt:', 'codex:', 'api:', 'boundary:'])
  assert(page.includes(key), `Missing identity copy: ${key}`);
assert(!sitemap.includes('brands/openai'), 'Brand route must remain outside sitemap');
assert(!aliases.includes('brands/openai'), 'No legacy tool redirect in this unit');

console.log('OpenAI brand route, identity, metadata, and sitemap tests passed.');

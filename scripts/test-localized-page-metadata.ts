import assert from 'node:assert/strict';

import { CATEGORY_METADATA_PROFILES } from '../lib/seo/categoryMetadataProfiles';
import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';

const baseUrl = 'https://aibesttool.com';

assert.equal(generateLocalizedPath('/guides/ai-writing-tools', 'en'), '/guides/ai-writing-tools');
assert.equal(generateLocalizedPath('/en/guides/ai-writing-tools', 'en'), '/guides/ai-writing-tools');
assert.equal(generateLocalizedPath('/guides/ai-writing-tools', 'cn'), '/cn/guides/ai-writing-tools');

const english = buildLocalizedPageMetadata({
  locale: 'en',
  path: '/guides/ai-writing-tools',
  title: 'AI writing tools',
  description: 'Compare AI writing tools.',
  baseUrl,
});

assert.equal(english.alternates?.canonical, `${baseUrl}/guides/ai-writing-tools`);
assert.deepEqual(english.alternates?.languages, {
  en: `${baseUrl}/guides/ai-writing-tools`,
  'zh-CN': `${baseUrl}/cn/guides/ai-writing-tools`,
  'x-default': `${baseUrl}/guides/ai-writing-tools`,
});
assert.equal(english.openGraph?.url, english.alternates?.canonical);

const chinese = buildLocalizedPageMetadata({
  locale: 'cn',
  path: '/en/ai/fathom?sort=popular',
  title: 'Fathom',
  description: 'Fathom 工具详情。',
  baseUrl,
});

assert.equal(chinese.alternates?.canonical, `${baseUrl}/cn/ai/fathom`);
assert.equal(chinese.alternates?.languages?.['zh-CN'], `${baseUrl}/cn/ai/fathom`);

const privatePage = buildLocalizedPageMetadata({
  locale: 'en',
  path: '/profile/decisions',
  title: 'Saved decisions',
  description: 'Private saved decisions.',
  indexable: false,
  baseUrl,
});

assert.equal(privatePage.alternates?.canonical, `${baseUrl}/profile/decisions`);
assert.equal(privatePage.alternates?.languages, undefined);
assert.equal(typeof privatePage.robots, 'object');
assert.equal(privatePage.robots && 'index' in privatePage.robots ? privatePage.robots.index : undefined, false);

const unsupportedLocale = buildLocalizedPageMetadata({
  locale: 'jp',
  path: '/explore',
  title: 'Explore',
  description: 'Explore AI tools.',
  baseUrl,
});

assert.equal(unsupportedLocale.alternates?.languages, undefined);
assert.equal(
  unsupportedLocale.robots && 'index' in unsupportedLocale.robots ? unsupportedLocale.robots.index : undefined,
  false,
);

for (const slug of ['design-art', 'life-assistant', 'other']) {
  const profile = CATEGORY_METADATA_PROFILES[slug];
  assert(profile, `${slug}: localized category metadata is missing`);
  assert.notEqual(profile.en.title, profile.cn.title, `${slug}: Chinese title must not reuse English metadata`);
  assert(/[\u4e00-\u9fff]/.test(profile.cn.title), `${slug}: Chinese title must be localized`);
  assert(/[\u4e00-\u9fff]/.test(profile.cn.description), `${slug}: Chinese description must be localized`);
}

console.log('Localized page metadata tests passed.');

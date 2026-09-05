import React from 'react';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import LegacyToolScopeNotice from '../components/tools/LegacyToolScopeNotice';
import getLegacyToolScopeReview, {
  applyLegacyToolScope,
  getLegacyToolScopeContent,
} from '../lib/config/legacyToolScopeReviews';
import { dataList, detailList } from '../lib/data';
import { toolToDetailData, toolToListRow } from '../lib/services/toolPresenter';
import type { Tool } from '../lib/services/tools';

for (const slug of ['adobe', 'salesforce_einstein']) {
  for (const locale of ['en', 'cn', 'tw']) {
    const review = getLegacyToolScopeReview(slug, locale);
    assert(review);
    const copy = getLegacyToolScopeContent(slug, locale);
    assert(copy);
    const row = {
      name: slug,
      content: 'Old marketing',
      detail: 'Old claims',
      id: 'unchanged',
      url: 'https://example.com',
    };
    const corrected = applyLegacyToolScope(row, locale);
    assert.equal(corrected.content, review.summary);
    assert.equal(corrected.detail, copy.detail);
    assert.equal(corrected.id, row.id);
    assert.equal(corrected.url, row.url);
    assert.equal(row.content, 'Old marketing', 'Do not mutate source data');
    const fixture = { ...row, title: { en: 'Original title' }, tags: [], features: null } as unknown as Tool;
    assert.equal(toolToListRow(fixture, locale).content, copy.content);
    assert.equal(toolToDetailData(fixture, locale).detail, copy.detail);
    assert(copy.detail.includes(locale === 'en' ? 'not completed hands-on testing' : '不是已完成的实测'));
    const html = renderToStaticMarkup(React.createElement(LegacyToolScopeNotice, { slug, locale }));
    assert(html.includes(`data-tool-scope-review="${slug}"`));
    assert(html.includes(review.checkedAt));
    assert(html.includes(locale === 'en' ? 'not a hands-on test' : '不是实测'));
    assert(!html.includes('<h1'), 'Notice must not add a second H1');
    for (const source of review.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert(html.includes(`href="${source.url}"`));
    }
  }
  assert.notEqual(getLegacyToolScopeReview(slug, 'en')?.summary, getLegacyToolScopeReview(slug, 'cn')?.summary);
  assert.equal(dataList.find((row) => row.name === slug)?.content, getLegacyToolScopeContent(slug, 'en')?.content);
  assert.equal(detailList.find((row) => row.name === slug)?.detail, getLegacyToolScopeContent(slug, 'en')?.detail);
}
for (const slug of ['claude', 'firefly', 'agentforce', 'constructor', '__proto__']) {
  assert.equal(getLegacyToolScopeReview(slug, 'en'), null);
  const row = { name: slug, content: 'Unchanged content', detail: 'Unchanged detail' };
  assert.equal(applyLegacyToolScope(row, 'cn'), row, 'Other tools must remain untouched');
  assert.equal(renderToStaticMarkup(React.createElement(LegacyToolScopeNotice, { slug, locale: 'cn' })), '');
}
const page = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
assert(page.includes('<LegacyToolScopePage slug={canonicalSlug} title={data.title} locale={locale} />'));
assert(page.indexOf('<LegacyToolScopePage') < page.indexOf('<h1'), 'Scope page must bypass generic tool claims');
assert(page.includes('<PageViewTracker toolId={dbTool?.id} />'), 'Preserve tool view tracking');
assert(page.includes('getWebNavigationDetail(canonicalSlug, locale)'), 'Preserve fallback data path');
const guide = readFileSync(
  'app/[locale]/(with-footer)/guides/salesforce-einstein-alternatives-comparison/page.tsx',
  'utf8',
);
assert(guide.includes("slug='salesforce_einstein'"));
assert(!guide.includes('commonly used as Salesforce Einstein alternatives'));
assert(!guide.includes('common Salesforce Einstein alternatives'));
assert(guide.includes('buildComparisonMetadata'), 'Preserve comparison noindex policy');
async function smoke() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3018';
  for (const prefix of ['', '/cn']) {
    for (const path of [
      '/ai/adobe',
      '/ai/salesforce_einstein',
      '/guides/salesforce-einstein-alternatives-comparison',
    ]) {
      const response = await fetch(`${base}${prefix}${path}`, { signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200);
      const raw = await response.text();
      const html = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      const slug = path.includes('adobe') ? 'adobe' : 'salesforce_einstein';
      assert.equal((html.match(/data-tool-scope-review=/g) || []).length, 1);
      assert(html.includes(`data-tool-scope-review="${slug}"`));
      if (path.startsWith('/ai/')) {
        assert(html.includes(`href="https://aibesttool.com${prefix}${path}"`), 'Tool canonical unchanged');
        assert.equal((html.match(/data-legacy-scope-page=/g) || []).length, 1);
        assert.equal((html.match(/<h1\b/g) || []).length, 1);
        assert(html.includes('data-seo-breadcrumbs'));
        assert(!raw.includes('"@type":"SoftwareApplication"'), 'Unresolved scope is not a single software application');
        assert(!html.includes('Compare Similar Tools'), 'Do not reintroduce generic comparison cards');
        assert(html.includes(prefix ? '不是已完成的实测' : 'not completed hands-on testing'));
        assert(html.includes(`href="${prefix}/developer/listing?intent=claim"`));
      } else {
        assert(
          !/<link[^>]*rel="canonical"/.test(html),
          'Preserve existing noindex comparison metadata without adding a canonical',
        );
      }
      const noindex =
        /name="robots"[^>]*content="[^"]*noindex/.test(html) ||
        (response.headers.get('x-robots-tag') || '').includes('noindex');
      assert.equal(noindex, path.startsWith('/guides/'), 'Existing index/noindex boundary unchanged');
      assert(!html.includes('commonly used as Salesforce Einstein alternatives'));
      console.log(`PASS ${prefix}${path}: visible scope notice, canonical and index boundary`);
    }
    const control = await fetch(`${base}${prefix}/ai/claude`, { signal: AbortSignal.timeout(20000) });
    assert.equal(control.status, 200);
    const controlHtml = (await control.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    assert(!controlHtml.includes('data-legacy-scope-page='), 'Unaffected tool retains its normal detail page');
    console.log(`PASS ${prefix}/ai/claude: unaffected control page`);
  }
}

if (process.argv.includes('--smoke')) {
  smoke().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
console.log(
  'PASS bilingual scope notices, original identities, external sources, unknown tools, fallback integration and comparison boundaries',
);

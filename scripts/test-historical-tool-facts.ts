import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import REVIEWS, {
  applyHistoricalToolFactReview,
  getHistoricalToolFactReview,
} from '../lib/config/historicalToolFactReviews';
import { dataList, detailList } from '../lib/data';
import { toolToDetailData, toolToListRow } from '../lib/services/toolPresenter';
import type { Tool } from '../lib/services/tools';

for (const slug of Object.keys(REVIEWS)) {
  for (const locale of ['en', 'cn', 'tw']) {
    const review = getHistoricalToolFactReview(slug, locale);
    assert(review);
    const row = { name: slug, title: 'Old title', url: 'https://example.com', content: 'Old', detail: 'Old detail' };
    const corrected = applyHistoricalToolFactReview(row, locale);
    assert.equal(corrected.title, review.title);
    assert.equal(corrected.url, review.url);
    assert.equal(corrected.content, review.content);
    assert.equal(corrected.detail, review.detail);
    assert.equal(row.content, 'Old');
    const fixture = { ...row, title: { en: 'Old title' }, tags: [], features: null } as unknown as Tool;
    assert.equal(toolToListRow(fixture, locale).content, review.content);
    assert.equal(toolToListRow(fixture, locale).title, review.title);
    assert.equal(toolToDetailData(fixture, locale).detail, review.detail);
    assert.equal(toolToDetailData(fixture, locale).url, review.url);
    assert(review.detail.includes(locale === 'en' ? 'Official sources' : '官方来源'));
  }
  const fallbackList = dataList.find((row) => row.name === slug);
  const fallbackDetail = detailList.find((row) => row.name === slug);
  if (fallbackList) assert.equal(fallbackList.content, getHistoricalToolFactReview(slug, 'en')?.content);
  if (fallbackDetail) assert.equal(fallbackDetail.detail, getHistoricalToolFactReview(slug, 'en')?.detail);
}

assert(getHistoricalToolFactReview('character_ai', 'en')?.detail.includes('make things up'));
assert(getHistoricalToolFactReview('shutterstock', 'en')?.title.includes('GenAI'));
assert(getHistoricalToolFactReview('suno_ai', 'en')?.detail.includes('does not automatically grant retroactive'));
assert(getHistoricalToolFactReview('viggle', 'en')?.detail.includes('seven-day storage'));
assert(!getHistoricalToolFactReview('artiversehub-ai', 'en')?.detail.includes('TurboTax'));
assert(getHistoricalToolFactReview('woy-ai', 'en')?.detail.includes('directory'));
assert(getHistoricalToolFactReview('shop_your_ai_powered_Shopping_assistant', 'en')?.detail.includes('standalone AI assistant'));
assert.equal(getHistoricalToolFactReview('claude', 'en'), null);
const sitemapSource = readFileSync('app/sitemap.ts', 'utf8');
assert(sitemapSource.includes('getCanonicalToolSlug(tool.name)'), 'Sitemap must never emit raw historical slugs');

console.log(`PASS ${Object.keys(REVIEWS).length} bilingual historical fact reviews, presenter projection, static fallback and control slug`);

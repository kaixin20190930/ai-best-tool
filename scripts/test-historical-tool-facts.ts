import assert from 'node:assert/strict';

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
  assert.equal(dataList.find((row) => row.name === slug)?.content, getHistoricalToolFactReview(slug, 'en')?.content);
  assert.equal(detailList.find((row) => row.name === slug)?.detail, getHistoricalToolFactReview(slug, 'en')?.detail);
}

assert(getHistoricalToolFactReview('character_ai', 'en')?.detail.includes('make things up'));
assert(getHistoricalToolFactReview('shutterstock', 'en')?.title.includes('GenAI'));
assert(getHistoricalToolFactReview('suno_ai', 'en')?.detail.includes('does not automatically grant retroactive'));
assert(getHistoricalToolFactReview('viggle', 'en')?.detail.includes('seven-day storage'));
assert.equal(getHistoricalToolFactReview('claude', 'en'), null);

console.log('PASS four bilingual historical fact reviews, presenter projection, static fallback and control slug');

import assert from 'node:assert/strict';

import { getToolIndexDecision } from '@/lib/seo/toolIndexing';

const completeTool = {
  status: 'published',
  pageQualityStatus: 'continue_index',
  categoryId: 'category-id',
  imageUrl: 'https://example.com/logo.png',
  thumbnailUrl: 'https://example.com/screenshot.png',
  content: 'A'.repeat(80),
  detail: 'B'.repeat(160),
  pricing: 'paid',
  tags: ['automation'],
};

assert.equal(getToolIndexDecision(completeTool).indexable, true);
assert.equal(getToolIndexDecision({ ...completeTool, features: { collection: {} } }).indexable, false);
assert.equal(getToolIndexDecision({ ...completeTool, features: { collection: {}, marketValidation: { verdict: 'emerging' } } }).indexable, false);
const completeMarket = {
  verdict: 'validated',
  reviewedAt: '2026-10-15',
  evidenceUrls: ['https://example.com/reviews'],
  strongSignals: ['verified adoption'],
  score: 75,
};
const collectionTool = { ...completeTool, features: { collection: {}, marketValidation: completeMarket } };
assert.equal(getToolIndexDecision(collectionTool).indexable, true);
for (const invalidMarket of [
  { ...completeMarket, reviewedAt: '' },
  { ...completeMarket, evidenceUrls: [] },
  { ...completeMarket, strongSignals: [] },
  { ...completeMarket, score: 74 },
]) {
  assert.equal(getToolIndexDecision({ ...collectionTool, features: {
    collection: {}, marketValidation: invalidMarket,
  } }).indexable, false);
}
assert.equal(getToolIndexDecision({ ...collectionTool, pageQualityStatus: 'monitor' }).indexable, false);
assert.equal(getToolIndexDecision({ ...completeTool, pageQualityStatus: 'monitor' }).indexable, false);
assert.equal(getToolIndexDecision({ ...completeTool, status: 'draft' }).indexable, false);
assert.equal(getToolIndexDecision({ ...completeTool, detail: '' }).indexable, true);
assert.equal(
  getToolIndexDecision({ ...completeTool, content: '', detail: '', thumbnailUrl: null }).indexable,
  false,
);

console.log('Tool indexing gate tests passed.');

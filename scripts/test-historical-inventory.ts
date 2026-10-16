import assert from 'node:assert/strict';

import { buildHistoricalInventory, type InventoryTool } from './historical-inventory';

const row: InventoryTool = {
  id: '1',
  name: 'example',
  status: 'published',
  page_quality_status: 'monitor',
  next_review_date: '2026-10-14',
  url: 'https://example.com',
  features: { editorial: { reviewedAt: '2026-10-01', sourceUrl: 'https://example.com/docs' } },
  category_id: null,
  image_url: null,
  thumbnail_url: null,
  content: {},
  detail: {},
  pricing: null,
  tags: null,
};
const today = '2026-10-16';
const base = buildHistoricalInventory([row], today);
assert.equal(base.readOnly, true);
assert.equal(base.productionWrites, 0);
assert.equal(base.items[0].indexState, 'monitor/noindex');
assert.equal(base.items[0].due?.classification, 'claim_due');
assert.equal(base.items[0].action, 'existing_tool_freshness_batch');
assert.equal(buildHistoricalInventory([{ ...row, features: {} }], today).items[0].action, 'manual_identity_review');
assert.equal(base.coverage.status, 'unavailable');
const duplicate = buildHistoricalInventory([row, { ...row, id: '2' }], today);
assert(duplicate.items.every((item) => item.flags.includes('duplicate/identity-risk')));
assert(duplicate.items.every((item) => item.action === 'owner_authorization_required'));
const disposition = buildHistoricalInventory([{ ...row, page_quality_status: 'archive' }], today);
assert.equal(disposition.items[0].action, 'owner_authorization_required');
const notDue = buildHistoricalInventory([{ ...row, next_review_date: '2026-11-01' }], today);
assert(notDue.items[0].flags.includes('healthy/not_due'));
const notPublished = buildHistoricalInventory([{ ...row, status: 'draft' }], today);
assert.equal(notPublished.items[0].indexState, 'not_published');
assert(!notPublished.items[0].flags.includes('healthy/not_due'));
const indexable = {
  ...row,
  page_quality_status: 'continue_index',
  category_id: 'category',
  image_url: 'https://example.com/image.png',
  thumbnail_url: 'https://example.com/image.png',
  content: { en: 'A useful tool for research decisions with credible detail.' },
  detail: { en: 'Detailed independent account of the product capabilities and limits.' },
  pricing: 'free',
  tags: ['research'],
};
const coverage = {
  property: 'sc-domain:aibesttool.com',
  checkedAt: '2026-10-16',
  results: [{ url: 'https://aibesttool.com/ai/example', indexed: false, inspectedAt: '2026-10-16' }],
};
const observed = buildHistoricalInventory([indexable], today, coverage);
assert(['continue_index-but-not-indexed', 'continue_index_gate_failed'].includes(observed.items[0].indexState));
const stale = buildHistoricalInventory([indexable], today, { ...coverage, checkedAt: '2026-09-01' });
assert.notEqual(stale.items[0].indexState, 'continue_index-but-not-indexed');
const staleItem = buildHistoricalInventory([indexable], today, {
  ...coverage,
  results: [{ ...coverage.results[0], inspectedAt: '2026-09-01' }],
});
assert.notEqual(staleItem.items[0].indexState, 'continue_index-but-not-indexed');
console.log('PASS historical inventory classification, duplicate/disposition authorization, Coverage freshness');

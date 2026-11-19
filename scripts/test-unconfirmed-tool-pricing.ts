import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parseToolPricingPatch } from '../lib/services/admin/toolPricing';
import { getMonitorPublicationBlockers } from '../lib/services/admin/submissionPublication';
import { getPaidListingPublishGate, getToolQuality } from '../lib/services/toolQuality';
import { generateSoftwareSchema } from '../lib/seo/schema';

assert.equal(parseToolPricingPatch(undefined), undefined);
assert.equal(parseToolPricingPatch(null), null);
for (const value of ['free', 'freemium', 'paid']) assert.equal(parseToolPricingPatch(value), value);
for (const value of ['', ' ', 'unknown', 'FREE', 0, false, {}]) {
  assert.throws(() => parseToolPricingPatch(value), /Invalid pricing/);
}
const summary = {
  en: 'Public synthetic demo only; actual private Beta pricing has not been published.',
  cn: '公开合成演示不代表真实服务免费；私有 Beta 定价尚未公开，请联系官方确认。',
  tw: '公開合成演示不代表真實服務免費；私有 Beta 定價尚未公開，請聯絡官方確認。',
};
const complete = { url: 'https://example.com/', category_id: 'category', image_url: '/images/logo.svg',
  thumbnail_url: '/images/cover.svg', content: { en: 'A factual product summary. '.repeat(5) },
  detail: { en: 'A detailed explanation of the product and its limitations. '.repeat(5) },
  tags: ['mcp'], pricing: null, features: { decision: { pricingSummary: summary } } };
assert.equal(getToolQuality(complete).score, 95);
assert.deepEqual(getMonitorPublicationBlockers(complete), []);
assert.ok(getMonitorPublicationBlockers({ ...complete, features: {} }).includes('Pricing'));
assert.ok(getMonitorPublicationBlockers({ ...complete, features: { decision: { pricingSummary: { en: summary.en } } } }).includes('Pricing'));
assert.ok(getMonitorPublicationBlockers({ ...complete, pricing: 'unknown' }).includes('Pricing'));
assert.ok(getMonitorPublicationBlockers({ ...complete, thumbnail_url: null }).includes('Screenshot'));
assert.ok(getPaidListingPublishGate(complete).blockers.includes('Pricing'));
const paid = { ...complete, features: { ...complete.features, submission: {
  commercial: { plan: 'standard_paid', paymentConfirmed: false } } } };
assert.ok(getMonitorPublicationBlockers(paid).includes('Pricing'));
assert.ok(getMonitorPublicationBlockers(paid).includes('Priority review payment'));
assert.ok(getMonitorPublicationBlockers({ ...paid, features: { ...paid.features,
  submission: { commercial: { plan: 'standard_paid', paymentConfirmed: true } } } }).includes('Pricing'));
const metadata = { name: 'Example', description: 'Example', url: 'https://example.com/' };
for (const pricing of [undefined, { type: null }, { type: 'unknown' }]) {
  const schema: any = generateSoftwareSchema({ ...metadata, pricing } as any);
  assert.ok(!('isAccessibleForFree' in schema));
  assert.ok(!('offers' in schema));
}
for (const type of ['free', 'freemium', 'paid']) {
  const schema: any = generateSoftwareSchema({ ...metadata, pricing: { type } } as any);
  assert.equal(schema.isAccessibleForFree, type !== 'paid');
}
const form = readFileSync('components/admin/AdminToolEditForm.tsx', 'utf8');
assert.ok(form.includes("defaultValue={tool.pricing ?? 'unknown'}"));
assert.ok(form.includes("pricingInput === 'unknown' ? null"));
assert.ok(!form.includes("formData.get('pricing') || 'free'"));
const actions = readFileSync('app/actions/admin/tools.ts', 'utf8');
assert.ok(actions.includes('parseToolPricingPatch(data.pricing)'));
assert.ok(actions.includes('await updateDraftToolPricing('));
console.log('Unconfirmed pricing parser, Admin preservation, monitor versus paid gates and schema checks PASS');

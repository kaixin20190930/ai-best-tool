import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildToolEntryHref, matchesToolEntry, normalizeClaimSourcePath, parseToolEntryContext } from '../lib/claims/toolEntry';

const id = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
for (const locale of ['en', 'cn', 'tw']) {
  for (const intent of ['ownership_update', 'profile_correction'] as const) {
    const href = buildToolEntryHref({ intent, toolId: id, slug: 'murf', listingName: 'Murf', website: 'https://murf.ai' }, locale);
    const url = new URL(href, 'https://aibesttool.com');
    assert.equal(url.pathname, `${locale === 'en' ? '' : `/${locale}`}/developer/listing`);
    const context = parseToolEntryContext(Object.fromEntries(url.searchParams), locale);
    assert.deepEqual(context, { intent, toolId: id, slug: 'murf', listingName: 'Murf', website: 'https://murf.ai', sourcePath: `${locale === 'en' ? '' : `/${locale}`}/ai/murf` });
    assert.equal(url.hash, '#claim-form');
  }
}
const valid = { intent: 'profile_correction', toolId: id, slug: 'pika', listingName: 'Pika', website: 'https://pika.art', sourcePath: '/cn/ai/pika' };
for (const bad of [
  { ...valid, intent: 'other' }, { ...valid, toolId: otherId + 'x' },
  { ...valid, slug: '../admin' }, { ...valid, listingName: 'x'.repeat(121) },
  { ...valid, website: 'javascript:alert(1)' }, { ...valid, sourcePath: '//evil.example' },
  { ...valid, sourcePath: '/en/ai/pika' }, { ...valid, website: 'https://user:pass@pika.art' },
  { ...valid, redirect: 'https://evil.example' },
]) assert.equal(parseToolEntryContext(bad, 'cn'), null);
assert.equal(parseToolEntryContext({ ...valid, listingName: ['Pika', 'Other'] }, 'cn'), null);
const tool = { id, name: 'pika', url: 'https://www.pika.art/' };
assert.equal(matchesToolEntry({ toolId: id, slug: 'pika', website: 'https://pika.art' }, tool), true);
assert.equal(matchesToolEntry({ toolId: otherId, slug: 'pika', website: 'https://pika.art' }, tool), false);
assert.equal(matchesToolEntry({ toolId: id, slug: 'scite', website: 'https://pika.art' }, tool), false);
assert.equal(matchesToolEntry({ toolId: id, slug: 'pika', website: 'https://evil.example' }, tool), false);
assert.equal(normalizeClaimSourcePath('/cn/ai/pika', 'cn'), '/cn/ai/pika');
assert.equal(normalizeClaimSourcePath('//evil.example', 'cn'), '/cn/developer/listing');
assert.equal(normalizeClaimSourcePath('/en/ai/pika', 'en'), '/developer/listing');

const action = readFileSync('app/actions/claimListing.ts', 'utf8');
const form = readFileSync('components/developer/ClaimListingForm.tsx', 'utf8');
const detail = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const feedback = readFileSync('components/ToolFeedbackBar.tsx', 'utf8');
const claimPage = readFileSync('app/[locale]/(with-footer)/developer/listing/page.tsx', 'utf8');
assert.match(action, /INSERT INTO tool_claims \([\s\S]*tool_id/);
assert.match(action, /matchesToolEntry/);
assert.match(action, /'new', NOW\(\), NOW\(\)/);
assert.doesNotMatch(action, /UPDATE tools|UPDATE product_intelligence_profiles/);
assert.match(form, /email: ''/);
assert.match(form, /disabled=\{loading\}/);
assert.match(form, /role='alert'/);
assert.match(form, /toolContext\?\.listingName/);
assert.match(form, /toolContext\?\.website/);
assert.match(detail, /intent: 'ownership_update'/);
assert.match(feedback, /intent: 'profile_correction'/);
assert.match(claimPage, /index: false/);
console.log('Tool live signal entry checks passed.');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('app/[locale]/(with-footer)/categories/[slug]/CategoryContent.tsx', 'utf8');

assert(source.includes("const hubStructureReviewedAt = '2026-09-06'"));
assert(source.includes("label: isChinese ? '页面结构复核' : 'Hub structure reviewed'"));
assert(source.includes('not a same-day fact review of every tool below'));
assert(source.includes('data-category-fact-boundary'));
assert(source.includes('Pricing, features, limits, evidence dates, and decision status come from the linked tool page.'));
assert(!source.includes("label: isChinese ? '最近核查' : 'Last checked'"));
assert(!source.includes("const checkedAt = '2026-07-28'"));

const representativeBlock = source.slice(
  source.indexOf('const representativeToolMap'),
  source.indexOf('const decisionFocusMap'),
);
assert(representativeBlock.length > 0, 'Representative tool map must remain inspectable');
for (const prohibited of ['price:', 'pricing:', 'rating:', 'reviewedAt:', 'sourceUrl:', 'featureList:']) {
  assert(!representativeBlock.includes(prohibited), `Category navigation must not copy tool fact field: ${prohibited}`);
}

console.log('PASS category hub date semantics, linked fact boundary and no duplicated tool fact fields');

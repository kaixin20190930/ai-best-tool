import assert from 'node:assert/strict';

import { buildGscDecisionReport, type GscCsvTable } from '@/lib/seo/gscDecisionModel';

function table(home: number, pages: Array<[string, number]>): GscCsvTable {
  return {
    headers: ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'],
    rows: [
      ['https://aibesttool.com/', '2', String(home), '1%', '20'],
      ...pages.map(([url, impressions]) => [url, '0', String(impressions), '0%', '30']),
    ],
  };
}

const baseline = table(900, [
  ['https://aibesttool.com/ai/fathom', 20],
  ['https://aibesttool.com/ai/legacy', 5],
]);
const previous = table(800, [
  ['https://aibesttool.com/ai/fathom', 60],
]);
const current = table(700, [
  ['https://aibesttool.com/ai/fathom', 80],
  ['https://aibesttool.com/categories/automation', 60],
  ['https://aibesttool.com/guides/ai-tools-for-research', 40],
]);

const report = buildGscDecisionReport({ current, previous, baseline });
assert.equal(report.expansionTriggered, true);
assert.equal(report.enhanceCandidates.length, 3);
assert.deepEqual(report.manualClosureCandidates, ['https://aibesttool.com/ai/legacy']);
assert.ok(report.current.nonHomepageShare > report.previous!.nonHomepageShare);
assert.ok(report.previous!.nonHomepageShare > report.baseline!.nonHomepageShare);

const incomplete = buildGscDecisionReport({ current });
assert.equal(incomplete.expansionTriggered, false);
assert.match(incomplete.expansionReasons.join(' '), /三期数据/);

console.log('GSC W4 decision model tests passed.');

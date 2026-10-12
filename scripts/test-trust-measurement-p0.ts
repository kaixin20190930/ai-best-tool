import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import publicDetailText from '../lib/content/publicDetailText';

const read = (path: string) => readFileSync(path, 'utf8');
const home = read('app/[locale]/(with-footer)/(home)/page.tsx');
const community = read('components/home/CommunityPulse.tsx');
const communityQuery = read('lib/services/community.ts');
const comparison = read('components/guides/VerifiedComparisonPage.tsx');
const ads = read('components/ad/GoogleAdSense.tsx');
const toolTracker = read('components/analytics/DecisionToolInteractionTracker.tsx');
const toolPage = read('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');

assert.equal(publicDetailText('EN: Paid plan; CN: 付费套餐; TW: 付費方案', 'cn'), '付费套餐');
assert.equal(publicDetailText('EN: Paid plan CN: 付费套餐 TW: 付費方案', 'en'), 'Paid plan');
assert.equal(publicDetailText('EN: Paid plan CN: 付费套餐 TW: 付費方案', 'tw'), '付費方案');
assert.equal(publicDetailText({ en: 'Paid', cn: '付费' }, 'cn'), '付费');
assert.equal(publicDetailText(['EN: Paid CN: 付费', 'EN: Export CN: 导出'], 'cn'), '付费; 导出');
assert.equal(publicDetailText('Unknown', 'cn'), 'Unknown');

assert.match(home, /getTools\(\{ status: 'published' \}, \{ page: 1, pageSize: 12 \}, 'recent'\)/);
assert.match(home, /totalVisibleTools === undefined/);
assert.match(communityQuery, /HAVING COUNT\(DISTINCT f\.user_id\) > 0/);
assert.doesNotMatch(communityQuery, /COALESCE\(t\.view_count, 0\) \/ 100/);
assert.match(community, /detailHref=\{`\/\$\{locale\}\/ai\/\$\{tool\.name\}`\}/);
assert.match(community, /href=\{`\/\$\{locale\}\$\{compareHref\}`\}/);
assert.match(community, /if \(!highlights\.length && !discussions\.length && !risingTools\.length\) return null/);
assert.match(comparison, /capabilitySources/);
assert.match(comparison, /publicDetailText\(capability\.limitations, locale\)/);
assert.match(ads, /sensitiveDecisionPage/);
assert.match(toolTracker, /eventName: 'evidence_open'/);
assert.match(toolTracker, /eventName: 'official_site_click'/);
assert.match(toolTracker, /eventName: 'comparison_open'/);
assert.match(toolTracker, /link\.closest\('\[data-tool-detail-page\]'\)/);
assert.match(toolPage, /data-tool-detail-page/);

console.log('Trust and measurement P0 scoped checks passed.');

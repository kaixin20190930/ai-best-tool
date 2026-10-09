import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { evaluatePublicationPolicy } from './claim-publication-policy';
import {
  CHATGPT_CANONICAL_ID,
  assertChatgptEmptyPreimage,
  assertChatgptMacRedirectTarget,
  assertChatgptPayload,
  assertChatgptProtectedStateUnchanged,
} from './chatgpt-canonical-guard';

const payload = JSON.parse(fs.readFileSync('data/collection/chatgpt-release.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('data/collection/chatgpt-canonical-preaudit-2026-10-09.json', 'utf8'));
const pageSource = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const chatgptOfficialSnapshot = pageSource.split("  if (key === 'chatgpt') {")[1]?.split("  if (key === 'claude') {")[0];
assert(chatgptOfficialSnapshot, 'ChatGPT official snapshot block is missing');
assert.deepEqual(
  [...chatgptOfficialSnapshot.matchAll(/checkedAt: '(\d{4}-\d{2}-\d{2})'/g)].map((match) => match[1]),
  [payload.reviewedAt, payload.reviewedAt],
  'EN/ZH ChatGPT official snapshots must share the candidate review date',
);
for (const source of audit.sources.official.slice(2)) {
  assert(chatgptOfficialSnapshot.includes(source), `ChatGPT snapshot source missing: ${source}`);
}
assert(chatgptOfficialSnapshot.includes('具体价格、额度和功能须按目标账号及地区复核'));
assert(chatgptOfficialSnapshot.includes('check prices, limits and features for the target account and region'));
assert(chatgptOfficialSnapshot.includes('工作区设置须分别核对'));
assert(chatgptOfficialSnapshot.includes('workspace settings separately'));
assert(payload.detail.en.includes('not a second assistant tool or a promise that every web feature is present on Mac'));
assert(payload.detail.zh.includes('不保证与网页功能完全一致'));
assertChatgptPayload(payload, audit.assetSha256);
assert.equal(payload.id, CHATGPT_CANONICAL_ID);
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.sources.independent.length, 0, 'Only official sources support ChatGPT product claims');
assert.deepEqual(evaluatePublicationPolicy(audit.publicationPolicy).claimLevelHolds, audit.claimLevelHolds);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).indexReleaseApproved, false);
for (const locale of ['en', 'zh', 'cn'] as const) {
  assert(payload.detail[locale].includes('https://learn.chatgpt.com/docs/app'));
  assert(payload.detail[locale].includes('https://chatgpt.com/download/'));
  assert(payload.detail[locale].includes('https://chatgpt.com/pricing/'));
  assert(payload.detail[locale].includes('2026-10-09'));
}

assert.throws(() => assertChatgptPayload({ ...payload, id: '22561562-5b7e-4e32-b629-ea8626abeeda' }, audit.assetSha256), /fixed ID/);
assert.throws(() => assertChatgptPayload(payload, { ...audit.assetSha256, [payload.imageUrl]: '0'.repeat(64) }), /asset hash mismatch/);
assert.throws(() => assertChatgptPayload({ ...payload, features: { claims: payload.features.claims.map((c: { id: string; status: string }) => c.id === 'plan-entitlements' ? { ...c, status: 'verified_public' } : c) } }, audit.assetSha256), /claim scope changed/);
assert.throws(() => assertChatgptEmptyPreimage([{ id: 'other' }], []), /duplicate/);
assert.throws(() => assertChatgptEmptyPreimage([], [{ id: CHATGPT_CANONICAL_ID }]), /fixed ID is occupied/);
assert.throws(() => assertChatgptProtectedStateUnchanged('before', 'after'), /protected rows/);

assert.equal(getCanonicalToolSlug('chatgpt-mac'), 'chatgpt-mac', 'This unit must not activate Mac alias');
assert.equal(getCanonicalToolSlug('gpt_4o'), 'gpt_4o');
assert.equal(getCanonicalToolSlug('openai'), 'openai');
for (const locale of ['en', 'cn', 'jp', 'de', 'es', 'fr', 'pt', 'ru', 'tw']) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  assertChatgptMacRedirectTarget(`${prefix}/ai/chatgpt-mac`, 308, `${prefix}/ai/chatgpt`, 200, `https://aibesttool.com${prefix}/ai/chatgpt`);
  if (locale !== 'en') assert.throws(() => assertChatgptMacRedirectTarget(`${prefix}/ai/chatgpt-mac`, 308, '/ai/chatgpt', 200, 'https://aibesttool.com/ai/chatgpt'), /cross-locale/, locale);
}

const run = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/candidate-release-pipeline.ts', '--candidate=chatgpt', '--phase=validate'], { encoding: 'utf8' });
assert.equal(run.status, 0, run.stderr || run.stdout);
assert.match(run.stdout, /chatgpt: preaudit valid/);
console.log('✅ ChatGPT canonical candidate, protected negatives and future Mac target gate passed');

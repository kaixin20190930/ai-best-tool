import assert from 'node:assert/strict';
import fs from 'node:fs';

import { evaluatePublicationPolicy, validateOptionalPublicationPolicy } from './claim-publication-policy';
import {
  assertPikaEmptyPreimage,
  assertPikaOnlinePage,
  assertPikaPostcheck,
  assertPikaSingleInsert,
} from './pika-release-guard';

const audit = JSON.parse(fs.readFileSync('data/collection/pika-controlled-release-preaudit-2026-10-08.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/collection/pika-release.json', 'utf8'));
const pipeline = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');

assert.equal(audit.status, 'released');
assert.equal(audit.productionWriteApproved, true);
assert.equal(audit.releasedAt, '2026-10-08');
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.deepEqual(validateOptionalPublicationPolicy(audit)?.claimLevelHolds, audit.claimLevelHolds);
assert.equal(evaluatePublicationPolicy(audit.publicationPolicy).releaseState, 'READY_MONITOR');
assert.equal(audit.publicationPolicy.claims.length, 8);
const expectedClaims = [
  [
    'plan-price',
    'conflict',
    'boundary',
    ['no exact purchase value is promised', '不承诺精确购买值', '不承諾精確購買值'],
  ],
  [
    'credit-expiry',
    'conflict',
    'boundary',
    ['new top-up terms and the legacy FAQ conflict', '新加购条款与旧 FAQ 冲突', '新加購條款與舊 FAQ 衝突'],
  ],
  [
    'commercial-tier',
    'conflict',
    'boundary',
    ['confirm the intended account and model', '核对目标账号与模型', '確認目標帳號及模型'],
  ],
  [
    'download-share-watermark',
    'conflict',
    'boundary',
    ['two paths and plan documents differ', '两条路径及套餐文档不能混同', '兩條路徑及方案文件不能混同'],
  ],
  ['export-format', 'unknown', 'omitted', ['no file was exported', '本站未导出文件', '本站未匯出檔案']],
  [
    'generation-and-retry-cost',
    'unknown',
    'omitted',
    ['no account charges or refunds were measured', '未测量账号扣费', '未測量帳號扣點'],
  ],
  [
    'product-fidelity',
    'unknown',
    'boundary',
    ['does not prove exact logos, labels or shape', '不能证明商标、标签或形状准确', '不能證明商標、標籤或形狀準確'],
  ],
  [
    'current-video-privacy',
    'conditional',
    'boundary',
    [
      'visibility, opt-out and deletion scope remain unverified',
      '可见性、退出训练及删除范围仍未验证',
      '可見性、退出訓練及刪除範圍仍未驗證',
    ],
  ],
] as const;
for (const [id, status, exposure, labels] of expectedClaims) {
  const claim = audit.publicationPolicy.claims.find((item: { id: string }) => item.id === id);
  assert(claim, `${id}: missing claim`);
  assert.equal(claim.status, status);
  assert.equal(claim.exposure, exposure);
  for (const [index, locale] of ['en', 'zh', 'cn'].entries()) {
    assert(payload.detail[locale].includes(labels[index]), `${id}: ${locale} public limitation missing`);
  }
}
for (const claim of audit.publicationPolicy.claims) {
  assert.notEqual(claim.exposure, 'exact');
  assert.equal(claim.preciseRecommendation, false);
  assert(claim.publicLimitation && claim.sources.length && claim.nextReviewDate > '2026-10-08');
}
for (const gate of Object.keys(audit.publicationPolicy.entityGates)) {
  const bad = structuredClone(audit.publicationPolicy);
  bad.entityGates[gate] = 'fail';
  assert.equal(evaluatePublicationPolicy(bad).releaseState, 'HOLD');
}
for (const key of ['publicLimitation', 'sources', 'nextReviewDate']) {
  const bad = structuredClone(audit.publicationPolicy);
  bad.claims[0][key] = key === 'sources' ? [] : '';
  assert.throws(() => evaluatePublicationPolicy(bad));
}
assert.equal(payload.slug, 'pika');
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(payload.imageUrl, '/images/tool-media/pika-editorial-cover.svg');
assert.equal(payload.thumbnailUrl, payload.imageUrl);
assert(fs.existsSync(`public${payload.imageUrl}`));
assert.equal(payload.videoUrl, undefined);
for (const locale of ['en', 'zh', 'cn']) {
  assert(payload.detail[locale].includes('https://pika.art/pricing'));
  assert(payload.detail[locale].includes('https://pika.art/faq'));
  assert(payload.detail[locale].includes('2026-10-15'));
  assert(!/\$\s?\d+/.test(payload.detail[locale]));
  assert(payload.detail[locale].length > (locale === 'en' ? 900 : 450));
}
for (const phrase of ['no account or output was tested', '未做账号或输出验证', '未驗證帳號或輸出']) {
  assert(Object.values(payload.detail).some((detail) => (detail as string).includes(phrase)));
}
assert(pipeline.includes("slug: 'pika'"));
assert(pipeline.includes("candidate.slug === 'murf' || candidate.slug === 'pika'"));
assert(pipeline.includes("candidate.slug === 'pika' && options.phase === 'verify'"));
assert(pipeline.includes("await client.query('BEGIN READ ONLY')"));
assert.doesNotThrow(() => assertPikaEmptyPreimage([], [], payload.id));
assert.throws(() => assertPikaEmptyPreimage([{ id: 'other', name: 'pika' }], [], payload.id));
assert.throws(() => assertPikaEmptyPreimage([], [{ id: payload.id, name: 'other' }], payload.id));
assert.doesNotThrow(() => assertPikaSingleInsert(1));
assert.throws(() => assertPikaSingleInsert(0));
assert.throws(() => assertPikaSingleInsert(2));
const row = { id: payload.id, name: 'pika' };
assert.doesNotThrow(() => assertPikaPostcheck([row], payload.id, { tasks: 0, capabilities: 0, fits: 0 }));
assert.throws(() => assertPikaPostcheck([], payload.id, { tasks: 0, capabilities: 0, fits: 0 }));
assert.throws(() => assertPikaPostcheck([row, row], payload.id, { tasks: 0, capabilities: 0, fits: 0 }));
assert.throws(() =>
  assertPikaPostcheck([{ id: 'other', name: 'pika' }], payload.id, { tasks: 0, capabilities: 0, fits: 0 }),
);
assert.throws(() => assertPikaPostcheck([row], payload.id, { tasks: 1, capabilities: 0, fits: 0 }));
assert.throws(() => assertPikaPostcheck([row], payload.id, { tasks: 0, capabilities: 1, fits: 0 }));
assert.throws(() => assertPikaPostcheck([row], payload.id, { tasks: 0, capabilities: 0, fits: 1 }));
const online = {
  status: 200,
  canonical: 'https://aibesttool.com/ai/pika',
  noindex: true,
  heading: 'Pika',
  decisionCard: true,
};
assert.doesNotThrow(() => assertPikaOnlinePage('/ai/pika', online, '<urlset/>'));
for (const bad of [
  { ...online, status: 404 },
  { ...online, canonical: 'https://aibesttool.com/ai/pika-ai' },
  { ...online, noindex: false },
  { ...online, heading: '' },
  { ...online, decisionCard: false },
]) {
  assert.throws(() => assertPikaOnlinePage('/ai/pika', bad, '<urlset/>'));
}
assert.throws(() => assertPikaOnlinePage('/ai/pika', online, '<loc>https://aibesttool.com/tw/ai/pika</loc>'));
assert(pipeline.includes('pika: verify requires --online after a real commit'));
assert(/paths\.push\(`\/tw\/ai\/\$\{candidate\.slug\}`\)/.test(pipeline));
console.log('PASS Pika controlled release: two-layer gates, localized boundary, media and protected-row negatives');

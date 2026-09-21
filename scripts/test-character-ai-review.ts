import assert from 'node:assert/strict';

import {
  characterAiPayload,
  characterAiReview,
  validateCharacterAiReview,
} from './refresh-character-ai-tool';

validateCharacterAiReview();

assert.equal(characterAiReview.slug, 'character_ai', 'Canonical slug must not change');
assert.equal(characterAiPayload.features.marketValidation.verdict, 'validated');
assert.equal(characterAiPayload.features.pricingSnapshot.model, 'freemium');
assert(characterAiPayload.features.evidence.official.length >= 4);
assert(characterAiPayload.features.evidence.independent.length >= 2);
assert(characterAiPayload.detail.en.includes('not a completed hands-on quality benchmark'));
assert(characterAiPayload.detail.cn.includes('不声称已经完成真实使用质量基准测试'));

console.log('PASS Character.AI evidence, decision, pricing, localization, and identity contracts');

import assert from 'node:assert/strict';

import { sunoDecisionPayload, sunoReview, validateSunoDecisionEvidence } from './refresh-suno-decision-evidence';

validateSunoDecisionEvidence();

assert.equal(sunoReview.id, 'fc8fce43-88ef-4817-ac3f-028231da4b4b');
assert.equal(sunoReview.slug, 'suno_ai', 'Canonical slug must not change');
assert.equal(sunoDecisionPayload.features.marketValidation.verdict, 'validated');
assert.equal(sunoDecisionPayload.features.evidence.independent.length, 1, 'Independent source is for maturity only');
assert(sunoDecisionPayload.detail.en.includes('creation time and download time as separate checks'));
assert(sunoDecisionPayload.detail.cn.includes('创建时点和下载时点应分开核对'));
assert(
  sunoDecisionPayload.features.editorial.trustNote.en.includes('not a music-quality or legal-clearance benchmark'),
);
assert(sunoDecisionPayload.features.decision.limitations.en.some((item) => item.includes('copyright protection')));

console.log('PASS Suno product, rights timing, download, copyright, evidence, audience, and index contracts');

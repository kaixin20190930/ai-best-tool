import assert from 'node:assert/strict';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import {
  validateViggleDecisionEvidence,
  viggleDecisionPayload,
  viggleReview,
} from './refresh-viggle-decision-evidence';

validateViggleDecisionEvidence();

assert.equal(viggleReview.id, 'a838bc9e-6653-4608-86d5-144cb703075b');
assert.equal(viggleReview.slug, 'viggle');
assert.equal(getCanonicalToolSlug(viggleReview.slug), 'viggle');
assert.equal(viggleReview.canonicalPath, '/ai/viggle');
assert.equal(viggleDecisionPayload.features.marketValidation.verdict, 'unverified');
assert.equal(
  viggleDecisionPayload.features.evidence.independent.length,
  0,
  'Official-only maintenance must not fabricate independent evidence',
);
assert(viggleDecisionPayload.detail.en.includes('Free at $0, Pro at $7.99/month'));
assert(viggleDecisionPayload.detail.en.includes('Consumer-plan limits do not describe API cost'));
assert(viggleDecisionPayload.detail.en.includes('not a blanket privacy or confidentiality guarantee'));
assert(viggleDecisionPayload.detail.cn.includes('签名结果链接有效期为 1 小时'));
assert(viggleDecisionPayload.features.decision.limitations.en.some((item) => item.includes('seven-day storage')));
assert(viggleDecisionPayload.features.decision.limitations.cn.some((item) => item.includes('水印合规')));

console.log(
  'PASS Viggle current plans, API separation, rights, data-use, evidence boundary, canonical identity, and index contracts',
);

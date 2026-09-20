import assert from 'node:assert/strict';

import {
  createDecisionInternalTrafficToken,
  decisionInternalTrafficTokenMatches,
  hashDecisionInternalTrafficToken,
} from '../lib/analytics/decisionEvents/internalTraffic';

const generated = createDecisionInternalTrafficToken();
assert.ok(generated.token.length >= 32);
assert.match(generated.sha256Hash, /^[0-9a-f]{64}$/);
assert.equal(hashDecisionInternalTrafficToken(generated.token), generated.sha256Hash);
assert.equal(decisionInternalTrafficTokenMatches(generated.token, generated.sha256Hash), true);
assert.equal(decisionInternalTrafficTokenMatches(`${generated.token}x`, generated.sha256Hash), false);
assert.equal(decisionInternalTrafficTokenMatches(generated.token, 'invalid'), false);
assert.equal(decisionInternalTrafficTokenMatches('short', generated.sha256Hash), false);
assert.match(hashDecisionInternalTrafficToken('short'), /^[0-9a-f]{64}$/);

console.log('Decision event internal traffic token generation and matching passed.');

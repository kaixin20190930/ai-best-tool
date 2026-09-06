import assert from 'node:assert/strict';

import { canCompleteTrial, getTrialDaysRemaining } from '../lib/services/stack/trialWindow';

const end = new Date('2026-09-13T08:26:16.781Z');

assert.equal(canCompleteTrial(end, new Date('2026-09-13T08:26:16.780Z')), false);
assert.equal(canCompleteTrial(end, new Date('2026-09-13T08:26:16.781Z')), true);
assert.equal(canCompleteTrial(end, new Date('2026-09-14T08:26:16.781Z')), true);
assert.equal(canCompleteTrial('not-a-date', end), false);
assert.equal(getTrialDaysRemaining(end, new Date('2026-09-06T08:26:16.781Z')), 7);
assert.equal(getTrialDaysRemaining(end, end), 0);

console.log(JSON.stringify({ success: true, earlyCompletionBlocked: true, unlocksAtBoundary: true }, null, 2));

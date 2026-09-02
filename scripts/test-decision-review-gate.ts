import assert from 'node:assert/strict';

import { getDecisionTransitionError } from '@/lib/services/admin/decision';

assert.match(
  getDecisionTransitionError('profile', 'draft', 'published', 1, new Date().toISOString()) || '',
  /not allowed/,
);
assert.match(getDecisionTransitionError('fit', 'reviewed', 'published', 0, new Date().toISOString()) || '', /evidence/);
assert.match(getDecisionTransitionError('relationship', 'reviewed', 'published', 1, null) || '', /human review/);
assert.equal(getDecisionTransitionError('profile', 'draft', 'reviewed', 0, null), null);
assert.equal(getDecisionTransitionError('profile', 'reviewed', 'published', 1, new Date().toISOString()), null);
assert.equal(getDecisionTransitionError('task', 'draft', 'active', 0, null), null);
assert.match(getDecisionTransitionError('task', 'draft', 'published', 0, null) || '', /not allowed/);

console.log('Decision review transition gate passed.');

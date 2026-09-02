import assert from 'node:assert/strict';

import { normalizeStackCost } from '@/lib/services/stack/cost';

assert.deepEqual(normalizeStackCost(19, 'month').monthlyCost, 19);
assert.deepEqual(normalizeStackCost(190, 'year').monthlyCost, 15.83);
assert.deepEqual(normalizeStackCost(42.345, 'usage').monthlyCost, 42.35);
assert.equal(normalizeStackCost(99, 'one_time').monthlyCost, null);
assert.equal(normalizeStackCost(99, 'unknown').monthlyCost, null);
assert.equal(normalizeStackCost(null, 'month').monthlyCost, null);
assert.equal(normalizeStackCost(-1, 'month').monthlyCost, null);
assert.equal(normalizeStackCost(190, 'year').normalization.method, 'annual_divided_by_12');
assert.equal(normalizeStackCost(190, 'year').normalization.divisor, 12);

console.log(JSON.stringify({ success: true, cases: 9, publicPricingInference: false }, null, 2));

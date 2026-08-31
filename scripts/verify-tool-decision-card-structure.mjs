import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = fileURLToPath(
  new URL('../app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', import.meta.url),
);
const source = readFileSync(pagePath, 'utf8');

function count(value) {
  return source.split(value).length - 1;
}

assert.equal(count("'Decision Card'"), 1, 'Tool detail page must render exactly one main Decision Card');
assert.equal(count("'Trust Snapshot'"), 1, 'Tool detail page must render exactly one Trust Snapshot');
assert.equal(count("'Quick decision'"), 0, 'Legacy Quick decision section must not return');
assert.equal(count("'Decision Snapshot'"), 0, 'Legacy sidebar Decision Snapshot must not return');
assert.equal(count('data-decision-evidence-status'), 1, 'Evidence readiness must render exactly once');
assert.ok(source.includes('buildToolDecisionCard({'), 'Page must consume the shared Decision Card model');
assert.ok(source.includes('decisionCard.reviewSchedule.nextFactReviewAt'), '30-day fact review must remain visible');
assert.ok(
  source.includes('decisionCard.reviewSchedule.nextDecisionReviewAt'),
  '90-day decision review must remain visible',
);

console.log('Tool detail Decision Card structure verification passed.');

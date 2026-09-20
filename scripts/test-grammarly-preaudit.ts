import assert from 'node:assert/strict';
import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('data/collection/grammarly-preaudit-2026-09-20.json', 'utf8'));
const detailPage = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');

assert.equal(audit.slug, 'grammarly');
assert.equal(audit.existingRoute, '/ai/grammarly');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'deep_review_complete');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-21');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Grammarly');
assert.equal(audit.identityDecision.company, 'Superhuman Platform Inc.');
assert(audit.decisionAngles.length >= 6);
assert(audit.limitations.length >= 10);
assert(audit.policyBoundaries.length >= 3);
assert(audit.sources.official.length >= 7);
assert(audit.sources.independent.length >= 3);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);

const facts = JSON.stringify(audit);
for (const pattern of [
  /100 AI prompts per month/,
  /2,000 AI prompts per member per month/,
  /USD 30 monthly/,
  /training defaults vary by account type/i,
  /40 million extension users/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);

assert.match(detailPage, /checkedAt: '2026-08-03'/);
assert.match(detailPage, /if \(key === 'grammarly'\)/);

console.log('PASS Grammarly preaudit: identity, plans, privacy, adoption and noindex release boundary');

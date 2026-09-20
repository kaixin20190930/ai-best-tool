import assert from 'node:assert/strict';
import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('data/collection/descript-preaudit-2026-09-20.json', 'utf8'));
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-09-20.json', 'utf8'));

assert.equal(audit.slug, 'descript');
assert.equal(audit.existingRoute, '/ai/descript');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'deep_review_complete');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-23');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Descript');
assert(audit.decisionAngles.length >= 8);
assert(audit.limitations.length >= 12);
assert(audit.policyBoundaries.length >= 4);
assert(audit.sources.official.length >= 7);
assert(audit.sources.independent.length >= 2);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);

const candidate = buffer.candidates.find((item: { slug: string }) => item.slug === 'descript');
assert(candidate);
assert.equal(candidate.status, 'deep_review_complete');
assert.equal(candidate.publicReleaseApproved, false);
assert.equal(candidate.indexReleaseApproved, false);

const facts = JSON.stringify(audit);
for (const pattern of [
  /one media hour per month and 100 AI credits granted one time/,
  /USD 16 per person per month billed annually or USD 24 monthly/,
  /USD 24 per person per month billed annually or USD 35 monthly/,
  /USD 50 per person per month billed annually or USD 65 monthly/,
  /Unused media minutes do not roll over/,
  /speaker's authorization/,
  /Share Data with Descript/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);

assert(!/unlimited AI|guaranteed commercial rights|never uses customer data/i.test(facts));
console.log('PASS Descript preaudit: identity, pricing, usage meters, consent, rights and noindex gates');

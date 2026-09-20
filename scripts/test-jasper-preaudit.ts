import assert from 'node:assert/strict';
import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('data/collection/jasper-preaudit-2026-09-20.json', 'utf8'));
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-09-20.json', 'utf8'));

assert.equal(audit.slug, 'jasper');
assert.equal(audit.existingRoute, '/ai/jasper');
assert.equal(audit.action, 'migrate_existing_fallback');
assert.equal(audit.status, 'deep_review_complete');
assert.equal(audit.reviewedAt, '2026-09-20');
assert.equal(audit.publishNotBefore, '2026-09-22');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(audit.releaseIndexState, 'monitor');
assert.equal(audit.routeAudit.productionEntityMatches, 0);
assert.equal(audit.routeAudit.sitemapMatches, 0);
assert.equal(audit.identityDecision.canonicalProduct, 'Jasper');
assert(audit.decisionAngles.length >= 7);
assert(audit.limitations.length >= 12);
assert(audit.policyBoundaries.length >= 4);
assert(audit.sources.official.length >= 8);
assert(audit.sources.independent.length >= 2);
assert(audit.nextSlotChecklist.length >= 7);
assert.equal(audit.marketValidation.verdict, 'validated');
assert(audit.marketValidation.score >= 90);
const candidate = buffer.candidates.find((item: { slug: string }) => item.slug === 'jasper');
assert(candidate);
assert.equal(candidate.status, 'deep_review_complete');
assert.equal(candidate.publicReleaseApproved, false);
assert.equal(candidate.indexReleaseApproved, false);
const facts = JSON.stringify(audit);
for (const pattern of [
  /USD 69 per month per seat/,
  /USD 59 per month per seat billed yearly/,
  /one included seat/,
  /two Brand Voices, five Knowledge assets and three Audiences/,
  /API\/MCP, Grid output rows/,
  /not currently recorded in the audit log/,
  /more than 4 thousand reviews/,
  /published \+ monitor\/noindex/,
]) assert.match(facts, pattern);
assert(!/guaranteed factual accuracy|Business usage is unlimited|best AI writer/i.test(facts));
console.log('PASS Jasper preaudit: identity, seat pricing, credits, brand governance, privacy and release boundary');

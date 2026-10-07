import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = 'data/collection/scite-prerelease-2026-10-07.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(p.unit, 'SCITE-PRERELEASE-01');
assert.equal(p.baseCommit, '0d7868a7e099b88e27e8e5aaab19d4499cbf55f6');
assert.equal(p.verdict, 'HOLD_EVIDENCE');
for (const key of [
  'publicReleaseApproved',
  'indexReleaseApproved',
  'relationshipCreationApproved',
  'executableReleasePackageCreated',
]) {
  assert.equal(p[key], false, key);
}
assert.equal(p.productionWrites, 0);
assert.deepEqual(
  p.gates.map((g: any) => g.id),
  ['identity', 'ai-value', 'availability', 'official', 'market', 'decision', 'content', 'maintenance'],
);
assert.deepEqual(
  p.gates.filter((g: any) => g.status === 'HOLD').map((g: any) => g.id),
  ['official', 'content'],
);
assert.equal(p.releaseBoundary.nextReleaseCandidateUnchanged, 'elicit');
assert.equal(p.releaseBoundary.readyForPreflight, false);
assert.equal(p.canonical.proposed[0], '/ai/scite');
assert.equal(p.media.status, 'HOLD');
for (const key of ['downloaded', 'reused', 'processed']) assert.equal(p.media[key], false);
assert.equal(p.media.logo, null);
assert.equal(p.media.preview, null);
assert.deepEqual(p.mappingHypotheses.relationshipRows, []);

const ids = new Set([...p.evidence, ...p.independentEvidence].map((e: any) => e.id));
assert.equal(ids.size, p.evidence.length + p.independentEvidence.length);
for (const source of [...p.evidence, ...p.independentEvidence]) {
  assert.equal(new URL(source.url).protocol, 'https:');
  assert.equal(source.status, 'direct_read');
  assert.equal(source.verifiedDate, p.verifiedDate);
  assert.equal(source.nextReview, p.nextReview);
}
for (const fact of Object.values(p.facts) as any[]) {
  assert(fact.evidence.length > 0);
  assert(fact.evidence.every((id: string) => ids.has(id)));
}
for (const conflict of p.conflicts) {
  assert(conflict.sources.length >= 1);
  assert(conflict.sources.every((id: string) => ids.has(id)));
  assert(conflict.resolution.length > 20);
}
assert.equal(p.facts.privacy.status, 'PARTIAL_VERIFIED');
assert.match(p.facts.privacy.finding, /not used to train/i);
assert.match(p.facts.privacy.finding, /ten years/i);
assert.match(p.facts.privacy.crossBorder, /United States/i);
assert.match(p.facts.privacy.crossBorder, /EEA-originating/i);
assert.match(p.facts.privacy.crossBorder, /PRC-resident/i);
assert.equal(p.facts.studentAcademicDiscount.status, 'APPLICATION_PATH_DOCUMENTED_ELIGIBILITY_UNKNOWN');
assert.match(p.facts.studentAcademicDiscount.finding, /customersupport@researchsolutions\.com/);
assert.match(p.facts.studentAcademicDiscount.finding, /sales@scite\.ai/);
assert.match(p.facts.studentAcademicDiscount.finding, /do not promise qualification or savings/i);
assert.equal(p.facts.exportApi.status, 'PARTIAL_UNKNOWN');
assert.deepEqual(
  p.facts.exportApi.apiEndpointFamilies.map((x: any) => x.family),
  [
    'Assistant',
    'Search',
    'Smart Citations / tallies',
    'Reference Check',
    'Journal, Organization & Funder Metrics',
    'Evidence Datasets',
  ],
);
assert(p.facts.exportApi.unknowns.some((x: string) => /export formats and limits/i.test(x)));
assert(p.facts.exportApi.unknowns.some((x: string) => /redistribute/i.test(x)));
assert.equal(p.independentEvidence.filter((e: any) => e.strength === 'strong_actual_adoption').length, 2);
assert.notEqual(new URL(p.independentEvidence[0].url).hostname, new URL(p.independentEvidence[1].url).hostname);
assert.equal(p.productionReadback.productionWrites, 0);
assert.equal(p.productionReadback.status, 'PASS_SCOPED');
assert.equal(p.productionReadback.identity.totalTools, 69);
assert.equal(p.productionReadback.pages.find((x: any) => x.path === '/sitemap.xml').sciteMatches, 0);
const reviewedPages = p.productionReadback.pages.filter((x: any) => x.path !== '/sitemap.xml');
assert.equal(reviewedPages.length, 9);
for (const page of reviewedPages) {
  assert.equal(page.status, 200);
  assert.equal(page.canonical, `https://aibesttool.com${page.path}`);
  assert(page.robots.includes('noindex'));
}

for (const locale of ['en', 'cn', 'tw']) {
  const content = p.content[locale];
  for (const field of ['summary', 'detail', 'pricingBoundary', 'privacyBoundary', 'platforms'])
    assert(content[field].length > 40, `${locale}.${field}`);
  assert(content.bestFor.length >= 2 && content.notIdealFor.length >= 2 && content.limitations.length >= 3);
  assert.equal(content.verifiedDate, p.verifiedDate);
  assert.equal(content.nextReview, p.nextReview);
  assert(content.evidence.every((id: string) => ids.has(id)));
  assert(
    content.independentEvidence.every((id: string) => p.independentEvidence.some((source: any) => source.id === id)),
  );
  assert.equal(content.decisionCard.compareNext.length, 2);
  assert(
    /not|不能|不应|不可|不能/.test(content.summary + content.limitations.join(' ')),
    `${locale} must describe limits`,
  );
  assert.match(content.privacyBoundary, /Customer Data/);
  assert.match(content.pricingBoundary, /customersupport@researchsolutions\.com/);
  assert.match(content.pricingBoundary, /sales@scite\.ai/);
}
assert.notEqual(p.content.cn.summary, p.content.tw.summary);
for (const locale of ['cn', 'tw']) {
  assert.match(p.content[locale].privacyBoundary, /美国|美國/);
  assert.match(p.content[locale].privacyBoundary, /跨境/);
  assert.match(p.content[locale].privacyBoundary, /中国大陆|中國大陸/);
}

console.log(
  'PASS Scite prerelease: source and locale integrity, eight gates, bounded claims, explicit HOLDs and zero release/relationship/index approvals',
);

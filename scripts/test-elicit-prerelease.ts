import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = 'data/collection/elicit-prerelease-2026-10-07.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(p.verdict, 'HOLD_EVIDENCE');
for (const key of [
  'publicReleaseApproved',
  'indexReleaseApproved',
  'relationshipCreationApproved',
  'executableReleasePackageCreated',
])
  assert.equal(p[key], false, key);
assert.equal(p.productionWrites, 0);
assert.equal(p.gates.length, 8);
assert.deepEqual(
  p.gates.filter((g: any) => g.status !== 'PASS').map((g: any) => g.id),
  ['content'],
);
assert.equal(p.media.status, 'HOLD');
assert.equal(p.media.logo, null);
assert.equal(p.media.preview, null);
assert.equal(p.media.downloaded, false);
assert.equal(p.media.reused, false);
assert.deepEqual(p.mappingHypotheses.relationshipRows, []);
assert.equal(p.facts.price.numericPublicationAllowed, false);
assert.equal(p.independentEvidence[0].publicationDate, '2026-05-29');
assert.equal(p.independentEvidence[0].researchDate.highAccuracyRetest, '2025-06-26');
assert.equal(p.independentEvidence[1].researchDate.focusGroup, '2024-03');
const ids = new Set(p.evidence.map((e: any) => e.id));
assert(ids.size >= 2);
for (const e of [...p.evidence, ...p.independentEvidence]) assert.equal(new URL(e.url).protocol, 'https:');
for (const locale of ['en', 'cn', 'tw']) {
  const c = p.content[locale];
  for (const key of ['summary', 'detail', 'pricingBoundary', 'privacyBoundary', 'platforms'])
    assert(c[key].length > 30, `${locale}.${key}`);
  assert(c.bestFor.length >= 2 && c.notIdealFor.length >= 2 && c.limitations.length >= 3);
  assert.equal(c.verifiedDate, p.verifiedDate);
  assert.equal(c.nextReview, p.nextReview);
  assert(c.evidence.every((id: string) => ids.has(id)));
  assert.equal(c.decisionCard.compareNext.length, 2);
  assert(
    !/\$(11|39|49|89|169)|\b(90|87)%/.test(JSON.stringify(c)),
    'No ambiguous price or study accuracy guarantee in localized copy',
  );
}
assert.notEqual(p.content.cn.summary, p.content.tw.summary);
for (const f of Object.values(p.facts) as any[]) assert(f.evidence.every((id: string) => ids.has(id)));
const r = p.productionReadback;
assert.equal(r.productionWrites, 0);
assert.deepEqual(r.identity.matches, []);
assert.deepEqual(r.profiles, []);
for (const page of r.pages.filter((x: any) => x.path !== '/sitemap.xml')) {
  assert.equal(page.status, 200);
  assert.equal(page.canonical, `https://aibesttool.com${page.path}`);
  assert(page.robots.includes('noindex'));
}
assert.equal(r.pages.find((x: any) => x.path === '/sitemap.xml').elicitMatches, 0);
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-10-06.json', 'utf8'));
assert.equal(buffer.candidates.length, 15);
assert.equal(buffer.nextReleaseCandidate.slug, 'elicit');
assert.equal(buffer.candidates.find((x: any) => x.slug === 'elicit').prereleaseReview.package, file);
assert(
  buffer.candidates.every(
    (x: any) => !x.publicReleaseApproved && !x.indexReleaseApproved && !x.relationshipCreationApproved,
  ),
);
console.log(
  'PASS Elicit prerelease: evidence/locale integrity, dated adoption, media HOLD, zero release/relationship approvals, read-only identity and canonical snapshot',
);

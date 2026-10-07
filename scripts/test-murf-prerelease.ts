import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = 'data/collection/murf-prerelease-2026-10-07.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(p.unit, 'MURF-PRERELEASE-01');
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
  p.gates.filter((g: any) => g.status === 'HOLD').map((g: any) => g.id),
  ['official', 'content', 'maintenance'],
);
assert.equal(p.media.status, 'HOLD');
for (const key of ['downloaded', 'reused', 'processed']) assert.equal(p.media[key], false);
assert.equal(p.media.logo, null);
assert.equal(p.media.preview, null);
assert.equal(p.liveSignal.releaseBlocker, true);
assert.deepEqual(p.mappingHypotheses.relationshipRows, []);
assert.equal(p.facts.price.numericPublicationAllowed, false);
assert.equal(p.facts.price.checkoutVerified, false);
const ids = new Set(p.evidence.map((e: any) => e.id));
assert.equal(ids.size, p.evidence.length);
for (const e of [...p.evidence, ...p.independentEvidence]) {
  assert.equal(new URL(e.url).protocol, 'https:');
  assert.equal(e.verifiedDate, p.verifiedDate);
  assert.equal(e.nextReview, p.nextReview);
}
for (const f of Object.values(p.facts) as any[])
  assert(f.evidence.length && f.evidence.every((id: string) => ids.has(id)));
assert.equal(p.independentEvidence[0].strength, 'strong_actual_use');
assert.equal(p.independentEvidence[0].publicationDate, '2025-12-17');
assert.equal(p.independentEvidence[1].strength, 'auxiliary_anonymous_actual_use');
assert.equal(p.excludedEvidence[0].status, 'fetch_failed');
for (const locale of ['en', 'cn', 'tw']) {
  const c = p.content[locale];
  for (const key of ['summary', 'detail', 'pricingBoundary', 'privacyBoundary', 'platforms'])
    assert(c[key].length > 30, `${locale}.${key}`);
  assert(c.bestFor.length >= 2 && c.notIdealFor.length >= 2 && c.limitations.length >= 3);
  assert.equal(c.verifiedDate, p.verifiedDate);
  assert.equal(c.nextReview, p.nextReview);
  assert(c.evidence.every((id: string) => ids.has(id)));
  assert(c.independentEvidence.every((id: string) => p.independentEvidence.some((e: any) => e.id === id)));
  assert.equal(c.decisionCard.compareNext.length, 2);
  assert(
    !/\$|\b(100|500|228|792|300|200)\b/.test(JSON.stringify(c)),
    'Do not publish observational prices/quotas/catalog totals',
  );
}
assert.notEqual(p.content.cn.summary, p.content.tw.summary);
const r = p.productionReadback;
assert.equal(r.productionWrites, 0);
assert.deepEqual(r.identity.matches, []);
assert.deepEqual(r.profiles, []);
assert(r.identity.contextualMatches.some((x: any) => x.matchingAlternativeSlugs.includes('murf-ai')));
for (const page of r.pages.filter((x: any) => x.path !== '/sitemap.xml')) {
  assert.equal(page.status, 200);
  assert.equal(page.canonical, `https://aibesttool.com${page.path}`);
  assert(page.robots.includes('noindex'));
}
assert.equal(p.deduplication.status, 'HOLD', 'Unresolved legacy canonical reference must block release');
assert.equal(r.pages.find((x: any) => x.path === '/sitemap.xml').murfMatches, 0);
const buffer = JSON.parse(fs.readFileSync('data/collection/mature-candidate-buffer-2026-10-06.json', 'utf8'));
assert.equal(buffer.candidates.length, 15);
assert.equal(buffer.nextReleaseCandidate.slug, 'elicit');
assert.equal(buffer.candidates.find((x: any) => x.slug === 'murf').prereleaseReview.package, file);
assert.equal(buffer.counts.marketGatePass, buffer.candidates.filter((x: any) => x.marketGate === 'PASS').length);
assert(
  buffer.candidates.every(
    (x: any) => !x.publicReleaseApproved && !x.indexReleaseApproved && !x.relationshipCreationApproved,
  ),
);
console.log(
  'PASS Murf prerelease: source and locale integrity, independent-use scope, withheld numbers, media/canonical HOLD, zero release or relationship approvals',
);

// QA regression: distinguish event triggers and preserve both conflicting source scopes.
assert.deepEqual(
  p.facts.deletion.scenarios.map((s: any) => s.id),
  ['subscription-cancellation', 'account-termination', 'deletion-request', 'backup-deletion'],
);
assert(p.facts.deletion.scenarios.every((s: any) => s.scopeStatus === 'HOLD_CONFLICT'));
const termination = p.facts.deletion.scenarios.find((s: any) => s.id === 'account-termination');
assert.deepEqual(
  termination.claims.map((c: any) => [c.source, c.days]),
  [
    ['privacy', 30],
    ['security', 90],
  ],
);
assert.equal(p.facts.deletion.scenarios.find((s: any) => s.id === 'backup-deletion').complexCaseUpperDays, 90);
for (const id of ['lifecycle-deletion', 'post-contract-audio-retrieval']) {
  const conflict = p.conflicts.find((c: any) => c.id === id);
  assert(conflict && conflict.sources.includes('security') && conflict.resolution.startsWith('HOLD'));
}
assert(p.facts.export.evidence.includes('cancel') && p.facts.export.evidence.includes('security'));
assert(!JSON.stringify(p.facts).includes('Backup removal timing is unspecified'));
for (const locale of ['en', 'cn', 'tw']) {
  const c = p.content[locale];
  for (const text of [c.detail, c.limitations[c.limitations.length - 1], c.decisionCard.retentionAndExitCheck]) {
    assert(text.includes('90'));
    assert(/unresolved|冲突待核|衝突待核/.test(text));
    assert(/security|安全頁|安全页/.test(text));
    assert(/Cancellation help|取消帮助|取消說明/.test(text));
  }
  assert(/30/.test(c.privacyBoundary) && /90/.test(c.privacyBoundary));
  assert(/backups|备份|備份/.test(c.privacyBoundary));
  assert(c.evidence.includes('security') && c.evidence.includes('privacy') && c.evidence.includes('cancel'));
}
console.log(
  'PASS QA lifecycle/retrieval conflicts: four triggers, scoped 30/90-day claims, official HOLD and three-language exit checks',
);

const audit = fs.readFileSync('docs/MURF_PRERELEASE_2026-10-07_CN.md', 'utf8');
assert(!/6 PASS \/ 2\s+HOLD/.test(audit), 'Do not retain the superseded gate count');
assert(/5 PASS \/ 3\s+HOLD/.test(audit));
assert.equal(
  buffer.candidates.find((x: any) => x.slug === 'murf').prereleaseReview.gateSummary,
  '5 PASS / 3 HOLD (official, content, maintenance)',
);

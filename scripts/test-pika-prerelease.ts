import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const file = 'data/collection/pika-prerelease-2026-10-07.json';
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(p.unit, 'PIKA-PRERELEASE-01');
assert.equal(p.verdict, 'HOLD_EVIDENCE');
for (const key of [
  'publicReleaseApproved',
  'indexReleaseApproved',
  'relationshipCreationApproved',
  'executableReleasePackageCreated',
])
  assert.equal(p[key], false, key);
assert.equal(p.productionWrites, 0);
assert.deepEqual(
  p.gates.map((g: any) => g.id),
  ['identity', 'ai-value', 'availability', 'official', 'market', 'decision', 'content', 'maintenance'],
);
assert.deepEqual(
  p.gates.filter((g: any) => g.status === 'HOLD').map((g: any) => g.id),
  ['official', 'content'],
);
assert.equal(p.releaseBoundary.readyForPreflight, false);
assert.equal(p.media.status, 'HOLD');
assert.equal(p.liveSignal.releaseBlocker, true);
for (const key of ['downloaded', 'reused', 'processed']) assert.equal(p.media[key], false);
assert.equal(p.media.logo, null);
assert.equal(p.media.preview, null);
assert.deepEqual(p.mappingHypotheses.relationshipRows, []);
const ids = new Set(p.evidence.map((e: any) => e.id));
assert.equal(ids.size, p.evidence.length);
for (const e of [...p.evidence, ...p.independentEvidence]) {
  assert.equal(new URL(e.url).protocol, 'https:');
  assert.equal(e.verifiedDate, p.verifiedDate);
  assert.equal(e.nextReview, p.nextReview);
  assert.equal(e.status, 'direct_read');
}
for (const f of Object.values(p.facts) as any[])
  assert(f.evidence.length && f.evidence.every((id: string) => ids.has(id)));
for (const c of p.conflicts) {
  assert(c.sources.length >= 2 && c.sources.every((id: string) => ids.has(id)));
  assert(c.resolution.startsWith('HOLD'));
}
for (const id of [
  'plan-migration',
  'topup-expiry-channel',
  'watermark-commercial',
  'plan-differences',
  'legacy-duration',
  'privacy-lifecycle',
  'minor-access',
])
  assert(p.conflicts.some((c: any) => c.id === id));
assert.equal(p.facts.price.numericPublicationAllowed, false);
assert.equal(p.facts.price.checkoutVerified, false);
assert.equal(p.facts.price.observedNewCreatePlans[0].monthlyCredits, 0);
assert.equal(p.facts.generation.pika25.audio, false);
assert.equal(p.facts.generation.pika25.fiveFrameResolution, '720p');
for (const key of ['pika25Cost', 'failedGenerationRefund', 'retryCost']) assert.equal(p.facts.credits[key], 'unknown');
for (const key of ['format', 'codec', 'downloadAndShareParity']) assert.equal(p.facts.export[key], 'unknown');
assert.equal(p.independentEvidence.length, 2);
assert.notEqual(new URL(p.independentEvidence[0].url).hostname, new URL(p.independentEvidence[1].url).hostname);
assert(p.independentEvidence.every((e: any) => e.strength === 'strong_actual_use'));
assert.equal(p.independentEvidence[0].publicationDate, '2024-12-18');
assert.equal(p.independentEvidence[1].actualTestDate, 'unknown');
for (const locale of ['en', 'cn', 'tw']) {
  const c = p.content[locale];
  for (const key of ['summary', 'detail', 'pricingBoundary', 'privacyBoundary', 'platforms'])
    assert(c[key].length > 30, `${locale}.${key}`);
  assert(c.bestFor.length >= 2 && c.notIdealFor.length >= 2 && c.limitations.length >= 3);
  assert.equal(c.verifiedDate, p.verifiedDate);
  assert.equal(c.nextReview, p.nextReview);
  assert(c.evidence.every((id: string) => ids.has(id)));
  assert(c.independentEvidence.every((id: string) => p.independentEvidence.some((e: any) => e.id === id)));
  assert.deepEqual(
    c.decisionCard.compareNext.map((x: any) => x.slug),
    ['runway', 'luma-ai'],
  );
  assert(
    !/\$|\b(900|3150|8550|2300|6000)\b/.test(JSON.stringify(c)),
    'Unresolved numerical entitlements must stay observational',
  );
  assert(/unknown|未知/.test(c.limitations.join(' ')));
  assert(/conflict|冲突|衝突/.test(c.limitations.join(' ')));
  assert(/training|训练|訓練/.test(c.privacyBoundary));
}
assert.notEqual(p.content.cn.summary, p.content.tw.summary);
const r = p.productionReadback;
assert.equal(r.productionWrites, 0);
assert.deepEqual(r.identity.matches, []);
assert.deepEqual(r.identity.contextualMatches, []);
assert.deepEqual(r.profiles, []);
assert.equal(
  r.identity.counts.reduce((n: number, x: any) => n + x.count, 0),
  69,
);
assert.equal(r.pages.length, 10);
for (const page of r.pages.filter((x: any) => x.path !== '/sitemap.xml')) {
  assert.equal(page.status, 200);
  assert.equal(page.canonical, `https://aibesttool.com${page.path}`);
  assert(page.robots.includes('noindex'));
  assert(!page.h1, 'Existing response is only an unresolved shell');
}
const sitemap = r.pages.find((x: any) => x.path === '/sitemap.xml');
assert.equal(sitemap.locCount, 126);
assert.equal(sitemap.pikaMatches, 0);
assert.equal(p.deduplication.status, 'PASS_SCOPED');
assert.equal(p.deduplication.releaseDayRecheckRequired, true);
const bufferFile = 'data/collection/mature-candidate-buffer-2026-10-06.json';
const buffer = JSON.parse(fs.readFileSync(bufferFile, 'utf8'));
const baseline = JSON.parse(execFileSync('git', ['show', `${p.baseCommit}:${bufferFile}`], { encoding: 'utf8' }));
assert.equal(buffer.unit, baseline.unit, 'candidate buffer unit must remain stable');
assert.equal(buffer.generatedAt, baseline.generatedAt, 'candidate buffer snapshot date must remain stable');
assert.equal(buffer.productionBaseline.productionWrites, 0);
assert.equal(buffer.policy.productionWrites, 0);
assert.equal(buffer.policy.publicReleaseApproved, false);
assert.equal(buffer.policy.indexReleaseApproved, false);
assert.equal(buffer.counts.candidates, buffer.candidates.length);
assert.equal(buffer.candidates.filter((x: any) => x.slug === 'pika').length, 1);
const pikaCandidate = buffer.candidates.find((x: any) => x.slug === 'pika');
assert.equal(pikaCandidate.prereleaseReview.package, file);
assert.equal(pikaCandidate.publicReleaseApproved, false);
assert.equal(pikaCandidate.indexReleaseApproved, false);
assert.equal(pikaCandidate.relationshipCreationApproved, false);
assert(
  !p.publicReleaseApproved && !p.indexReleaseApproved && !p.relationshipCreationApproved,
  'Pika must retain zero release, index and relationship approvals',
);
const verifier = fs.readFileSync('scripts/check-pika-prerelease-readonly.ts', 'utf8');
assert(verifier.includes('BEGIN READ ONLY') && verifier.includes('ROLLBACK'));
assert(
  !/\b(?:INSERT INTO|UPDATE tools|DELETE FROM|CREATE TABLE|ALTER TABLE)\b|\.rpc\(|\.insert\(|\.update\(|\.delete\(/i.test(
    verifier,
  ),
);
const auditFile = 'docs/PIKA_PRERELEASE_2026-10-07_CN.md';
const audit = fs.readFileSync(auditFile, 'utf8');
let links = 0;
for (const m of Array.from(audit.matchAll(/\[[^\]]*\]\(([^)]+)\)/g))) {
  if (/^https:/.test(m[1])) new URL(m[1]);
  else assert(fs.existsSync(path.resolve(path.dirname(auditFile), m[1].split('#')[0])), m[1]);
  links++;
}
assert(/6 PASS \/ 2\s+HOLD/.test(audit));
console.log(
  `PASS Pika prerelease: eight gates, scoped conflicts/unknowns, trilingual content, ${links} audit links, source integrity, read-only boundaries and unchanged other candidates`,
);

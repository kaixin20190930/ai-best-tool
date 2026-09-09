import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

for (const slug of ['synthesia', 'replit', 'otter-ai', 'lovable', 'midjourney']) {
  assert(source.includes(`slug: '${slug}'`), `${slug}: missing pipeline registration`);
}
assert(source.includes("'published','monitor'"), 'Initial release must be published + monitor');
assert(!source.includes("'published','continue_index'"), 'Release pipeline must not approve indexing');
assert(source.includes("phase === 'release' && selected.length !== 1"), 'Bulk release must be blocked');
assert(source.includes("release window opens"), 'Date gate must be explicit');
assert(source.includes("ON CONFLICT (id) DO NOTHING"), 'Idempotent ID boundary is required');
assert(source.includes("conflicting entity exists"), 'Slug/domain conflicts must block release');
assert(source.includes("initial release must remain noindex"), 'Post-release noindex check is required');
assert(source.includes("monitor page leaked into sitemap"), 'Post-release sitemap exclusion is required');
assert(source.includes("releaseIndexState, 'monitor'"), 'Released audit must preserve the monitor state');
assert(source.includes('monitor release cannot approve sitemap inclusion'), 'Monitor release must not approve sitemap inclusion');
assert.equal(packageJson.scripts['tools:candidate-release'], 'tsx scripts/candidate-release-pipeline.ts');
assert.equal(packageJson.scripts['test:candidate-release'], 'tsx scripts/test-candidate-release-pipeline.ts');

const replitPrep = JSON.parse(fs.readFileSync('data/collection/replit-release-prep-2026-09-08.json', 'utf8')) as {
  slug: string;
  status: string;
  preparedAt: string;
  publishNotBefore: string;
  media: { imageUrl: string; thumbnailUrl: string };
  releaseDayChecks: string[];
  sources: string[];
};
assert.equal(replitPrep.slug, 'replit');
assert.equal(replitPrep.status, 'completed_release_day_recheck');
assert(replitPrep.preparedAt < replitPrep.publishNotBefore, 'Replit prep must not impersonate its release-day review');
assert(replitPrep.releaseDayChecks.length >= 5 && replitPrep.sources.length >= 5, 'Replit release prep is incomplete');
for (const asset of [replitPrep.media.imageUrl, replitPrep.media.thumbnailUrl]) {
  assert(asset.startsWith('/'), `Replit prep asset must be local: ${asset}`);
  assert(fs.existsSync(path.join('public', asset.slice(1))), `Replit prep asset is missing: ${asset}`);
}
const replitRelease = JSON.parse(fs.readFileSync('data/collection/replit-release.json', 'utf8')) as {
  slug: string;
  reviewedAt: string;
  nextReviewDate: string;
  features: { editorial?: { reviewedAt?: string }; pricingSnapshot?: { checkedAt?: string } };
};
assert.equal(replitRelease.slug, 'replit');
assert.equal(replitRelease.reviewedAt, '2026-09-09');
assert(replitRelease.nextReviewDate > replitRelease.reviewedAt);
assert.equal(replitRelease.features.editorial?.reviewedAt, replitRelease.reviewedAt);
assert.equal(replitRelease.features.pricingSnapshot?.checkedAt, replitRelease.reviewedAt);

const run = (args: string[]) =>
  spawnSync(process.execPath, ['--import', 'tsx', 'scripts/candidate-release-pipeline.ts', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
const validation = run(['--phase=validate']);
assert.equal(validation.status, 0, validation.stderr || validation.stdout);
const earlyPreflight = run(['--candidate=replit', '--phase=preflight', '--as-of=2026-09-08']);
assert.notEqual(earlyPreflight.status, 0, 'Preflight must fail before the release window');
assert.match(earlyPreflight.stderr, /release window opens 2026-09-09/);
const repeatedReplitRelease = run(['--candidate=replit', '--phase=release', '--as-of=2026-09-09']);
assert.notEqual(repeatedReplitRelease.status, 0, 'Release must fail after Replit is marked released');
assert.match(repeatedReplitRelease.stderr, /candidate is already released/);
const repeatedRelease = run(['--candidate=synthesia', '--phase=release', '--as-of=2026-09-08']);
assert.notEqual(repeatedRelease.status, 0, 'Release must fail after the audit is marked released');
assert.match(repeatedRelease.stderr, /candidate is already released/);

console.log('✅ Candidate release pipeline contract passed.');

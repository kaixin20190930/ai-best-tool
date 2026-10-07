import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertVideoReadback, validateVideoUrl } from './candidate-release-video';

const root = process.cwd();
const payload = JSON.parse(fs.readFileSync('data/collection/elicit-release.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('data/collection/elicit-material-display-preaudit-2026-10-07.json', 'utf8'));
const source = fs.readFileSync('scripts/candidate-release-pipeline.ts', 'utf8');
const policy = fs.readFileSync('docs/BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md', 'utf8');

assert.equal(audit.status, 'ready_for_next_slot');
assert.equal(audit.productionWriteApproved, false);
assert.equal(audit.sitemapChangeApproved, false);
assert.equal(payload.videoUrl, 'https://www.youtube-nocookie.com/embed/gHtxaBhA1IA');
assert.equal(payload.features.media.officialEmbed.videoUrl, 'https://www.youtube.com/watch?v=gHtxaBhA1IA');
assert.equal(payload.features.media.officialEmbed.channelUrl, 'https://www.youtube.com/@elicit-research');
assert.equal(payload.features.media.officialEmbed.checkedAt, '2026-10-07');
assert.match(payload.features.media.officialEmbed.provenance, /first-party official embed/);
assert.match(payload.features.media.officialEmbed.usageBoundary, /do not download, self-host, crop, hotlink thumbnail/);
assert.equal(payload.features.release.indexState, 'monitor');
assert.equal(payload.features.release.sitemapChangeApproved, false);
assert.equal(payload.features.release.relationshipCreationApproved, false);
assert.equal(payload.features.release.productionWrites, 0);
assert.match(policy, /中性.*第一方官方视频 embed/);

for (const asset of payload.features.media.assets) {
  assert.equal(asset.isOfficialLogo, false);
  assert.equal(asset.isProductScreenshot, false);
  const file = path.join('public', asset.path.slice(1));
  assert(fs.existsSync(file), `Missing editorial asset: ${file}`);
  const svg = fs.readFileSync(file, 'utf8');
  assert.match(svg, /AI Best Tool editorial/i);
  assert.doesNotMatch(svg, /#6d28d9|#7c3aed|<text[^>]*>\s*(Elicit|El)\s*<\/text>/i);
}
assert.equal(payload.imageUrl, payload.features.media.assets[0].path);
assert.equal(payload.thumbnailUrl, payload.features.media.assets[1].path);
for (const locale of ['en', 'zh', 'cn']) {
  assert.match(payload.detail[locale], /AI Best Tool|本站/);
  assert(payload.detail[locale].length >= (locale === 'en' ? 900 : 450));
}
assert.match(source, /thumbnail_url, video_url, category_id/);
assert.match(source, /video_url=COALESCE\(EXCLUDED\.video_url,tools\.video_url\)/);
assert.match(source, /thumbnail_url, video_url, next_review_date::text/);
assert.match(source, /assertVideoReadback\(candidate\.slug, payload\.videoUrl, row\.rows\[0\]\.video_url\)/);
assert.doesNotThrow(() => validateVideoUrl('elicit', payload.videoUrl));
assert.doesNotThrow(() => assertVideoReadback('elicit', payload.videoUrl, payload.videoUrl));
assert.throws(() => assertVideoReadback('elicit', payload.videoUrl, null), /video URL readback mismatch/);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'elicit-material-display-'));
try {
  fs.mkdirSync(path.join(fixture, 'data/collection'), { recursive: true });
  fs.copyFileSync(
    'data/collection/elicit-material-display-preaudit-2026-10-07.json',
    path.join(fixture, 'data/collection/elicit-material-display-preaudit-2026-10-07.json'),
  );
  for (const directory of ['public', 'node_modules'])
    fs.symlinkSync(path.join(root, directory), path.join(fixture, directory), 'dir');
  const releaseFile = path.join(fixture, 'data/collection/elicit-release.json');
  const run = (videoUrl: string) => {
    fs.writeFileSync(releaseFile, JSON.stringify({ ...payload, videoUrl }));
    return spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        path.join(root, 'scripts/candidate-release-pipeline.ts'),
        '--candidate=elicit',
        '--phase=release',
        '--as-of=2026-10-07',
      ],
      {
        cwd: fixture,
        encoding: 'utf8',
        env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' },
      },
    );
  };
  for (const bad of [
    'https://www.youtube.com/watch?v=gHtxaBhA1IA',
    'https://evil.example/embed/gHtxaBhA1IA',
    'http://www.youtube-nocookie.com/embed/gHtxaBhA1IA',
  ]) {
    const result = run(bad);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /video must use|video must be/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/, 'Invalid embed must fail before database access');
  }
  const valid = run(payload.videoUrl);
  assert.notEqual(valid.status, 0);
  assert.match(
    valid.stderr,
    /ECONNREFUSED/,
    'Valid payload should pass media validation and stop at the deliberately unavailable test database',
  );
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log(
  'PASS Elicit material/display payload, source boundaries, video SQL readback contract and negative embed validation',
);

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

for (const slug of ['lovable', 'midjourney']) {
  const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(`data/collection/${slug}-preaudit-2026-09-07.json`, 'utf8'));
  assert.equal(getCanonicalToolSlug(slug), slug);
  assert.equal(audit.reviewedAt, '2026-09-07', 'Keep the historical preaudit date');
  assert.equal(payload.reviewedAt, '2026-09-14');
  assert.equal(payload.features.release.scheduledSlot, audit.publishNotBefore);
  assert.equal(payload.features.release.executionType, 'delayed_makeup');
  assert.equal(payload.features.release.sitemapChangeApproved, false);
  assert.equal(payload.nextReviewDate, '2026-10-14');
  assert.equal(payload.features.editorial.reviewedAt, payload.reviewedAt);
  assert.equal(payload.features.pricingSnapshot.checkedAt, payload.reviewedAt);
  assert(payload.features.evidence.official.length >= 5);
  assert(payload.features.evidence.independent.length >= 2);
  for (const locale of ['en', 'zh']) {
    assert(payload.features.audience.bestFit[locale].length >= 3);
    assert(payload.features.audience.notIdealFor[locale].length >= 3);
    assert(payload.features.decision.compareAxes[locale].length >= 5);
    assert(payload.features.decision.limitations[locale].length >= 5);
    for (const source of [...payload.features.evidence.official, ...payload.features.evidence.independent]) {
      assert.equal(source.checkedAt, payload.reviewedAt);
      assert(payload.detail[locale].includes(source.url), `${slug}: source must be visible in both locales`);
    }
    const boundaries =
      slug === 'lovable'
        ? [/RLS/, /Supabase/, /Plan mode/, /Cloud/, /credits/, /Git/]
        : [/Stealth/, /Discord/, /GPU/, /21/, /26/, /V8/, /Pro/, /Mega/];
    for (const boundary of boundaries) assert.match(payload.detail[locale], boundary);
    assert(
      !/500 million|one million new|G2 reviews|300 million/.test(payload.detail[locale]),
      'Do not copy old market numbers into release copy',
    );
  }
  for (const media of payload.features.media.assets) {
    assert.equal(media.isProductScreenshot, false);
    assert.equal(media.checkedAt, payload.reviewedAt);
    assert(media.sourcePage.startsWith('https://'));
    assert(media.usageBasis.length > 50);
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.join('public', media.path.slice(1))))
        .digest('hex'),
      media.sha256,
    );
  }
  const decision = getToolIndexDecision({
    status: 'published',
    pageQualityStatus: 'monitor',
    categoryId: 'reviewed-category',
    imageUrl: payload.imageUrl,
    thumbnailUrl: payload.thumbnailUrl,
    content: payload.content,
    detail: payload.detail,
    pricing: payload.pricing,
    tags: payload.tags,
  });
  assert.equal(decision.indexable, false, 'Complete release content still must remain noindex');
  const beforeSlot = slug === 'lovable' ? '2026-09-10' : '2026-09-11';
  const early = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      'scripts/candidate-release-pipeline.ts',
      `--candidate=${slug}`,
      '--phase=release',
      `--as-of=${beforeSlot}`,
    ],
    { encoding: 'utf8' },
  );
  assert.equal(early.status, 1);
  assert.match(early.stderr, /release window opens/);
  // The real entry point must stop before a DB connection if production media is missing.
  const mediaMissing = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--import',
      'data:text/javascript,globalThis.fetch=async()=>new Response("missing",{status:404})',
      'scripts/candidate-release-pipeline.ts',
      `--candidate=${slug}`,
      '--phase=release',
      '--as-of=2026-09-14',
      '--commit',
    ],
    { encoding: 'utf8', env: { ...process.env, POSTGRES_URL: 'postgres://invalid:invalid@127.0.0.1:1/invalid' } },
  );
  assert.equal(mediaMissing.status, 1);
  assert.match(mediaMissing.stderr, /production media unavailable/);
  assert(!mediaMissing.stderr.includes('ECONNREFUSED'), 'Media gate must run before connecting to DB');
  console.log(`PASS ${slug}: dated bilingual evidence, policy boundaries, media integrity and fail-closed release`);
}
const page = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
assert(
  page.includes('getStringList(decisionFeatures?.limitations, locale)'),
  'Decision Card must render the reviewed limitations',
);
console.log('PASS delayed candidate release checks');

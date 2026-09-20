import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

type Candidate = {
  slug: string;
  aliases: string[];
  domain: string;
  preauditFile: string;
  existingEntityExpected?: boolean;
};

type Preaudit = {
  slug: string;
  existingRoute: string;
  action: string;
  status: string;
  reviewedAt: string;
  publishNotBefore: string;
  releasedAt?: string;
  releaseIndexState?: 'monitor' | 'continue_index';
  productionWriteApproved: boolean;
  sitemapChangeApproved: boolean;
  sources: { official: string[]; independent: string[] };
  nextSlotChecklist: string[];
};

type Localized = { en: string; zh: string; cn?: string };
type LocalizedList = { en: string[]; zh: string[]; cn?: string[] };

type ReleasePayload = {
  id: string;
  slug: string;
  officialUrl: string;
  reviewedAt: string;
  nextReviewDate: string;
  categorySlug: string;
  pricing: 'free' | 'freemium' | 'paid';
  title: Localized;
  content: Localized;
  detail: Localized;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  features: Record<string, unknown>;
  useCases: LocalizedList;
};

const root = process.cwd();
const candidates: Candidate[] = [
  {
    slug: 'synthesia',
    aliases: ['synthesia'],
    domain: 'synthesia.io',
    preauditFile: 'synthesia-preaudit-2026-09-07.json',
  },
  { slug: 'replit', aliases: ['replit'], domain: 'replit.com', preauditFile: 'replit-preaudit-2026-09-07.json' },
  {
    slug: 'otter-ai',
    aliases: ['otter-ai', 'otter', 'otter.ai'],
    domain: 'otter.ai',
    preauditFile: 'otter-ai-preaudit-2026-09-07.json',
  },
  {
    slug: 'lovable',
    aliases: ['lovable', 'lovable-dev'],
    domain: 'lovable.dev',
    preauditFile: 'lovable-preaudit-2026-09-07.json',
  },
  {
    slug: 'midjourney',
    aliases: ['midjourney', 'mid-journey'],
    domain: 'midjourney.com',
    preauditFile: 'midjourney-preaudit-2026-09-07.json',
  },
  {
    slug: 'elevenlabs',
    aliases: ['elevenlabs', 'eleven-labs'],
    domain: 'elevenlabs.io',
    preauditFile: 'elevenlabs-preaudit-2026-09-09.json',
  },
  {
    slug: 'heygen',
    aliases: ['heygen', 'hey-gen'],
    domain: 'heygen.com',
    preauditFile: 'heygen-preaudit-2026-09-09.json',
  },
  {
    slug: 'glean',
    aliases: ['glean', 'glean-search'],
    domain: 'glean.com',
    preauditFile: 'glean-preaudit-2026-09-09.json',
  },
  {
    slug: 'fireflies',
    aliases: ['fireflies', 'fireflies-ai', 'fireflies.ai'],
    domain: 'fireflies.ai',
    preauditFile: 'fireflies-ai-preaudit-2026-09-09.json',
    existingEntityExpected: true,
  },
];

function parseArgs(args: string[]) {
  const phase = args.find((arg) => arg.startsWith('--phase='))?.split('=')[1] || 'validate';
  const candidate = args.find((arg) => arg.startsWith('--candidate='))?.split('=')[1];
  const asOf = args.find((arg) => arg.startsWith('--as-of='))?.split('=')[1] || new Date().toISOString().slice(0, 10);
  const online = args.includes('--online');
  const commit = args.includes('--commit');
  const allowed = new Set(['validate', 'preflight', 'release', 'verify']);
  assert(allowed.has(phase), `Unknown phase: ${phase}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(asOf), 'as-of must use YYYY-MM-DD');
  assert(!commit || phase === 'release', '--commit is only valid for the release phase');
  assert(!online || ['preflight', 'verify'].includes(phase), '--online is only valid for preflight or verify');
  return { phase, candidate, asOf, online, commit };
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function loadPreaudit(candidate: Candidate): Preaudit {
  const audit = readJson<Preaudit>(path.join(root, 'data', 'collection', candidate.preauditFile));
  assert.equal(audit.slug, candidate.slug);
  assert.equal(audit.existingRoute, `/ai/${candidate.slug}`);
  assert.equal(
    audit.action,
    candidate.existingEntityExpected ? 'refresh_existing_entity' : 'migrate_existing_fallback',
  );
  assert(['ready_for_next_slot', 'released'].includes(audit.status), `${candidate.slug}: unsupported release status`);
  if (audit.status === 'ready_for_next_slot') {
    assert.equal(audit.productionWriteApproved, false);
    assert.equal(audit.sitemapChangeApproved, false);
    assert.equal(audit.releasedAt, undefined);
  } else {
    assert.equal(audit.productionWriteApproved, true, `${candidate.slug}: released row needs production approval`);
    assert(
      audit.releasedAt && audit.releasedAt >= audit.publishNotBefore,
      `${candidate.slug}: released date is invalid`,
    );
    assert.equal(audit.releaseIndexState, 'monitor', `${candidate.slug}: controlled release must remain monitor`);
    assert.equal(
      audit.sitemapChangeApproved,
      false,
      `${candidate.slug}: monitor release cannot approve sitemap inclusion`,
    );
  }
  assert(
    audit.sources.official.length >= 5 && audit.sources.independent.length >= 2,
    `${candidate.slug}: evidence incomplete`,
  );
  assert(audit.nextSlotChecklist.length >= 5, `${candidate.slug}: release checklist incomplete`);
  return audit;
}

function validatePublicAsset(assetPath: string) {
  assert(assetPath.startsWith('/') && !assetPath.startsWith('//'), `Asset must be a local public path: ${assetPath}`);
  assert(fs.existsSync(path.join(root, 'public', assetPath.slice(1))), `Missing public asset: ${assetPath}`);
}

function loadPayload(candidate: Candidate, audit: Preaudit, asOf: string): ReleasePayload {
  assert(asOf >= audit.publishNotBefore, `${candidate.slug}: release window opens ${audit.publishNotBefore}`);
  const payloadPath = path.join(root, 'data', 'collection', `${candidate.slug}-release.json`);
  assert(fs.existsSync(payloadPath), `${candidate.slug}: release payload is not ready`);
  const payload = readJson<ReleasePayload>(payloadPath);
  assert.equal(payload.slug, candidate.slug);
  assert.match(payload.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(new URL(payload.officialUrl).hostname.replace(/^www\./, ''), candidate.domain);
  assert(
    payload.reviewedAt >= audit.publishNotBefore && payload.reviewedAt <= asOf,
    `${candidate.slug}: payload review date is invalid`,
  );
  assert(payload.nextReviewDate > payload.reviewedAt, `${candidate.slug}: next review must be later`);
  assert(payload.title.en && payload.title.zh && payload.content.en.length >= 80 && payload.content.zh.length >= 40);
  assert(
    payload.detail.en.length >= 900 && payload.detail.zh.length >= 450,
    `${candidate.slug}: decision copy is incomplete`,
  );
  assert(payload.tags.length >= 2 && Object.keys(payload.features).length > 0);
  assert(
    payload.useCases.en.length > 0 && payload.useCases.zh.length > 0,
    `${candidate.slug}: use cases are incomplete`,
  );
  const editorial = payload.features.editorial as Record<string, unknown> | undefined;
  assert.equal(editorial?.reviewedAt, payload.reviewedAt, `${candidate.slug}: editorial review date mismatch`);
  validatePublicAsset(payload.imageUrl);
  validatePublicAsset(payload.thumbnailUrl);
  return payload;
}

async function openDatabase() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  return client;
}

async function findMatches(client: Client, candidate: Candidate) {
  const escapedDomain = candidate.domain.replaceAll('.', '\\.');
  return client.query(
    `SELECT id, name, url, status, page_quality_status
       FROM tools
      WHERE lower(name) = ANY($1::text[])
         OR url ~* $2
         OR title::text ~* $3
      ORDER BY name`,
    [
      candidate.aliases.map((alias) => alias.toLowerCase()),
      `^https?://(www\\.)?${escapedDomain}([/:?#]|$)`,
      `\\m${candidate.slug.split('-')[0]}\\M`,
    ],
  );
}

function canonicalFromHtml(html: string) {
  const tags = html.match(/<link\s+[^>]*>/g) || [];
  return tags.find((tag) => tag.includes('rel="canonical"'))?.match(/href="([^"]+)"/)?.[1] || null;
}

function isNoindex(headers: Headers, html: string) {
  const value = `${headers.get('x-robots-tag') || ''},${html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || ''}`;
  return value.toLowerCase().includes('noindex');
}

async function fetchPage(pathname: string) {
  const response = await fetch(`https://aibesttool.com${pathname}`, {
    headers: { 'user-agent': 'ai-best-tool-candidate-release/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  return { response, html: await response.text() };
}

async function validateOnlineFallback(candidate: Candidate, expectReleased: boolean) {
  const sitemap = await fetchPage('/sitemap.xml');
  assert(sitemap.response.ok, 'Unable to read production sitemap');
  for (const pathname of [`/ai/${candidate.slug}`, `/cn/ai/${candidate.slug}`]) {
    const { response, html } = await fetchPage(pathname);
    assert(response.ok, `${candidate.slug}: ${pathname} returned ${response.status}`);
    assert.equal(canonicalFromHtml(html), `https://aibesttool.com${pathname}`, `${candidate.slug}: canonical mismatch`);
    assert(isNoindex(response.headers, html), `${candidate.slug}: initial release must remain noindex`);
    assert(
      !sitemap.html.includes(`<loc>https://aibesttool.com${pathname}</loc>`),
      `${candidate.slug}: monitor page leaked into sitemap`,
    );
    const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '') || '';
    if (expectReleased) {
      assert(
        heading.toLowerCase().includes(candidate.slug.split('-')[0]),
        `${candidate.slug}: released page is unavailable or has the wrong heading`,
      );
      assert(html.includes('id="decision-card"'), `${candidate.slug}: released Decision Card is missing`);
    } else {
      console.log(`${candidate.slug}: reserved route ${pathname}; heading=${heading}`);
    }
  }
  if (!expectReleased) {
    console.log(
      `✅ ${candidate.slug}: reserved route is 200, self-canonical, noindex, and outside sitemap; heading reported separately`,
    );
  }
}

async function validateDeployedAssets(payload: ReleasePayload) {
  for (const assetPath of [payload.imageUrl, payload.thumbnailUrl]) {
    const response = await fetch(`https://aibesttool.com${assetPath}`, { signal: AbortSignal.timeout(20_000) });
    assert(
      response.ok && response.headers.get('content-type')?.startsWith('image/'),
      `${payload.slug}: production media unavailable: ${assetPath}`,
    );
    const deployed = createHash('sha256')
      .update(Buffer.from(await response.arrayBuffer()))
      .digest('hex');
    const local = createHash('sha256')
      .update(fs.readFileSync(path.join(root, 'public', assetPath.slice(1))))
      .digest('hex');
    assert.equal(deployed, local, `${payload.slug}: production media differs from reviewed local asset: ${assetPath}`);
  }
}

async function runRelease(candidate: Candidate, audit: Preaudit, asOf: string, commit: boolean) {
  assert.equal(audit.status, 'ready_for_next_slot', `${candidate.slug}: candidate is already released`);
  const payload = loadPayload(candidate, audit, asOf);
  // A database insert cannot deploy new /public files. Fail before opening a write transaction.
  if (commit) await validateDeployedAssets(payload);
  const title = { ...payload.title, cn: payload.title.cn || payload.title.zh };
  const content = { ...payload.content, cn: payload.content.cn || payload.content.zh };
  const detail = { ...payload.detail, cn: payload.detail.cn || payload.detail.zh };
  const useCases = { ...payload.useCases, cn: payload.useCases.cn || payload.useCases.zh };
  const client = await openDatabase();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`directory:${candidate.slug}`]);
    const matches = await findMatches(client, candidate);
    assert(
      matches.rows.every((row) => row.id === payload.id && row.name === candidate.slug),
      `${candidate.slug}: conflicting entity exists`,
    );
    const category = await client.query('SELECT id FROM categories WHERE slug = $1', [payload.categorySlug]);
    assert.equal(category.rowCount, 1, `${candidate.slug}: storage category must exist exactly once`);
    await client.query(
      `INSERT INTO tools
       (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
        features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,ARRAY[]::text[],'published','monitor',$14,NOW(),NOW())
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,title=EXCLUDED.title,content=EXCLUDED.content,detail=EXCLUDED.detail,
         url=EXCLUDED.url,image_url=EXCLUDED.image_url,thumbnail_url=EXCLUDED.thumbnail_url,
         category_id=EXCLUDED.category_id,tags=EXCLUDED.tags,pricing=EXCLUDED.pricing,
         features=EXCLUDED.features,use_cases=EXCLUDED.use_cases,status='published',
         page_quality_status='monitor',next_review_date=EXCLUDED.next_review_date,updated_at=NOW()`,
      [
        payload.id,
        candidate.slug,
        title,
        content,
        detail,
        payload.officialUrl,
        payload.imageUrl,
        payload.thumbnailUrl,
        category.rows[0].id,
        payload.tags,
        payload.pricing,
        payload.features,
        useCases,
        payload.nextReviewDate,
      ],
    );
    const row = await client.query(
      'SELECT id, name, url, status, page_quality_status, features, title, content, detail, use_cases, image_url, thumbnail_url, next_review_date::text AS next_review_date FROM tools WHERE id = $1',
      [payload.id],
    );
    assert.equal(row.rowCount, 1);
    assert.equal(row.rows[0].name, candidate.slug);
    assert.equal(row.rows[0].status, 'published');
    assert.equal(row.rows[0].page_quality_status, 'monitor');
    assert.equal(row.rows[0].url, payload.officialUrl);
    assert.equal(row.rows[0].features.editorial.reviewedAt, payload.reviewedAt);
    assert.deepEqual(row.rows[0].title, title);
    assert.deepEqual(row.rows[0].content, content);
    assert.deepEqual(row.rows[0].detail, detail);
    assert.deepEqual(row.rows[0].use_cases, useCases);
    assert.deepEqual(row.rows[0].features, payload.features);
    assert.equal(row.rows[0].image_url, payload.imageUrl);
    assert.equal(row.rows[0].thumbnail_url, payload.thumbnailUrl);
    assert.equal(row.rows[0].next_review_date, payload.nextReviewDate);
    await client.query(commit ? 'COMMIT' : 'ROLLBACK');
    console.log(`✅ ${candidate.slug}: ${commit ? 'committed' : 'rollback verified'} as published + monitor`);
    console.log(
      JSON.stringify({
        id: payload.id,
        reviewedAt: payload.reviewedAt,
        nextReviewDate: payload.nextReviewDate,
        localizedPayloadReadback: ['en', 'zh', 'cn'],
        transaction: commit ? 'COMMIT' : 'ROLLBACK',
      }),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selected = options.candidate ? candidates.filter((item) => item.slug === options.candidate) : candidates;
  assert(selected.length > 0, `Unknown candidate: ${options.candidate}`);
  assert(!(options.phase === 'release' && selected.length !== 1), 'Release phase requires exactly one --candidate');

  for (const candidate of selected) {
    const audit = loadPreaudit(candidate);
    if (options.phase === 'validate') {
      console.log(
        `✅ ${candidate.slug}: preaudit valid; ${
          audit.status === 'released'
            ? `released ${audit.releasedAt} as monitor`
            : `release window ${audit.publishNotBefore}`
        }`,
      );
      continue;
    }
    if (options.phase === 'release') {
      await runRelease(candidate, audit, options.asOf, options.commit);
      continue;
    }
    assert(options.asOf >= audit.publishNotBefore, `${candidate.slug}: release window opens ${audit.publishNotBefore}`);
    if (options.phase === 'preflight') {
      assert.equal(
        audit.status,
        'ready_for_next_slot',
        `${candidate.slug}: preflight only accepts an unreleased candidate`,
      );
    } else {
      assert.equal(audit.status, 'released', `${candidate.slug}: verify requires a released audit record`);
    }
    const client = await openDatabase();
    try {
      const matches = await findMatches(client, candidate);
      if (options.phase === 'preflight') {
        if (candidate.existingEntityExpected) {
          const payload = loadPayload(candidate, audit, options.asOf);
          assert.equal(matches.rowCount, 1, `${candidate.slug}: expected exactly one refreshable entity`);
          assert.equal(matches.rows[0].id, payload.id, `${candidate.slug}: existing entity id mismatch`);
          assert.equal(matches.rows[0].name, candidate.slug, `${candidate.slug}: existing canonical slug mismatch`);
          assert.equal(matches.rows[0].status, 'published', `${candidate.slug}: existing entity is not published`);
          assert.equal(matches.rows[0].page_quality_status, 'monitor', `${candidate.slug}: existing entity is not monitor`);
        } else {
          assert.equal(matches.rowCount, 0, `${candidate.slug}: existing entity requires manual review`);
        }
      }
      if (options.phase === 'verify') {
        assert.equal(matches.rowCount, 1, `${candidate.slug}: expected exactly one released entity`);
        assert.equal(matches.rows[0].name, candidate.slug);
        assert.equal(matches.rows[0].status, 'published');
        assert.equal(matches.rows[0].page_quality_status, 'monitor');
      }
      console.log(`✅ ${candidate.slug}: database ${options.phase} passed`);
    } finally {
      await client.end();
    }
    if (options.online) await validateOnlineFallback(candidate, options.phase === 'verify');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

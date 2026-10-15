import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import { Client, type PoolClient } from 'pg';

import { parseOps2Selection, selectionHash, selectionLocalizedField, selectionRawPayload } from '../lib/services/admin/ops2Selection';
import { evidenceReadyDraftSql } from '../lib/services/admin/draftPublicationSql';
import { importCollectionCandidateToDraft } from '../lib/services/admin/collection';
import { parseOptions, parseQaReport, qaReportHash, run, verifyPlatformOwnedMedia } from './run-ops2-candidate-enqueue';

const today = new Date().toISOString().slice(0, 10);
const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const content = Object.fromEntries((['en', 'zh', 'cn'] as const).map((locale) => [locale, {
  title: `Fixture AI ${locale} research`,
  summary: `Fixture AI ${locale} helps a researcher review source material and compare supported workflows. Editorial checks remain necessary for every answer.`,
  detail: `Fixture AI ${locale} provides an official research workflow for comparing answers against selected sources. Its output is not a substitute for reading original material, and account-specific limits must be checked before purchase. This synthetic fixture must never be published.`,
  bestFor: ['Source-based research'], notIdealFor: ['Unverified legal conclusions'],
  limitations: ['Account limits require checking'], compareAxes: ['Citation traceability'],
  pricingSummary: 'Current plan terms should be checked in the official account.',
}])) as Record<'en' | 'zh' | 'cn', Record<string, unknown>>;

const fixture = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Fixture AI Research',
  officialUrl: 'https://fixture.example/', categorySlug: 'productivity',
  officialDomainGroup: { canonicalProductDomain: 'fixture.example', parentBrandDomains: [],
    identitySourceIds: ['features'] },
  cluster: { taskSlug: 'research-with-citations', role: 'alternative' },
  officialSources: [
    { id: 'features', url: 'https://fixture.example/features', claimKeys: ['core', 'identity'] },
    { id: 'rights', url: 'https://fixture.example/rights', claimKeys: ['rights'] },
  ],
  entityGate: { status: 'PASS', aiCoreCapability: { status: 'PASS', sourceIds: ['features'],
    evidenceExcerpt: 'The fixture demonstrates source-grounded AI research over user-selected documents.' },
    identityCanonical: { status: 'PASS', sourceIds: ['features'],
      evidenceExcerpt: 'The official feature page identifies Fixture AI Research as this product.' },
    duplicateIntent: { status: 'PASS', checkedToolIds: [],
      rationale: 'Compared existing Research cluster tools and found no matching intent.' } },
  reviewedAt: today, nextReviewDate: future,
  media: { mode: 'official_licensed', url: 'https://fixture.example/media/logo.png', sourceUrl: 'https://fixture.example/brand',
    rightsSourceUrl: 'https://fixture.example/rights', license: 'Official brand asset permission', verifiedAt: today,
    rightsStatus: 'PASS', rightsSourceIds: ['rights'],
    rightsEvidenceExcerpt: 'The official rights page permits display of the published brand asset in directories.' },
  pricing: 'freemium', tags: ['research', 'ai-tool'], localized: content,
  claimGate: { status: 'PASS', items: [{ key: 'core', status: 'verified_public',
    boundary: 'Feature page only, not account-specific access', sourceIds: ['features'], nextReviewDate: future }] },
};

const selection = parseOps2Selection(fixture);
assert.equal(selection.localized.tw.title, content.zh.title);
assert.equal(selection.localized.cn.title, content.cn.title);
assert.equal(selectionLocalizedField(selection, 'title').tw, content.zh.title);
assert.equal(selectionLocalizedField(selection, 'title').zh, content.cn.title);
const newLocalized = { en: content.en, cn: content.cn, tw: {
  ...content.zh, title: 'Fixture AI traditional research',
} };
const newSelection = parseOps2Selection({ ...fixture, localized: newLocalized });
assert.equal(newSelection.localized.tw.title, 'Fixture AI traditional research');
assert.equal(newSelection.localized.cn.title, content.cn.title);
assert.equal(selectionLocalizedField(newSelection, 'title').tw, 'Fixture AI traditional research');
assert.equal(selectionLocalizedField(newSelection, 'title').zh, content.cn.title);
assert.throws(() => parseOps2Selection({ ...fixture, localized: { en: content.en, cn: content.cn } }),
  /requires tw/);
assert.throws(() => parseOps2Selection({ ...fixture, localized: { ...newLocalized, zh: content.zh } }),
  /cannot mix/);
assert.equal(selectionRawPayload(selection).sourceType, 'ops2_selection');
assert.match(evidenceReadyDraftSql, /features->'marketValidation'->>'verdict' = 'validated'/);
assert.doesNotMatch(evidenceReadyDraftSql, /ops2_selection|ops2Selection/);
assert.throws(() => parseOps2Selection({ ...fixture, officialSources: fixture.officialSources.slice(0, 1) }));
assert.throws(() => parseOps2Selection({ ...fixture, officialDomainGroup: {
  ...fixture.officialDomainGroup, canonicalProductDomain: 'other.example' } }));
assert.throws(() => parseOps2Selection({ ...fixture, officialDomainGroup: {
  ...fixture.officialDomainGroup, parentBrandDomains: ['fixture.example'] } }));
assert.throws(() => parseOps2Selection({ ...fixture, officialSources: [
  ...fixture.officialSources, { id: 'alias', url: 'https://alias.example/about', claimKeys: ['identity'] },
] }));
assert.throws(() => parseOps2Selection({ ...fixture, media: { ...fixture.media, rightsSourceUrl: 'https://other.example/rights' } }));
assert.throws(() => parseOps2Selection({ ...fixture, media: { ...fixture.media, rightsStatus: 'unknown' } }));
assert.throws(() => parseOps2Selection({ ...fixture, media: { ...fixture.media, rightsEvidenceExcerpt: 'looks fine' } }));
assert.throws(() => parseOps2Selection({ ...fixture, entityGate: { ...fixture.entityGate, aiCoreCapability: { status: 'HOLD', sourceIds: ['features'] } } }));
assert.throws(() => parseOps2Selection({ ...fixture, entityGate: { ...fixture.entityGate, aiCoreCapability: { status: 'PASS', sourceIds: ['missing'] } } }));
assert.throws(() => parseOps2Selection({ ...fixture, claimGate: { status: 'HOLD', items: fixture.claimGate.items } }));
assert.throws(() => parseOps2Selection({ ...fixture, claimGate: { status: 'PASS', items: [
  { ...fixture.claimGate.items[0], sourceIds: ['missing'] }] } }));
assert.throws(() => parseOps2Selection({ ...fixture, localized: { ...fixture.localized, cn: null } }));
assert.throws(() => parseOptions(['--mode=commit']));
const catalogSelection = parseOps2Selection({ ...fixture,
  id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', name: 'Catalog Fixture AI',
  cluster: { role: 'gap_filler' },
  entityGate: { ...fixture.entityGate, duplicateIntent: { status: 'PASS', checkedToolIds: [],
    rationale: 'Catalog-only selection has no Task Fit and was checked against tool identity and canonical URL.' } },
});
assert.equal(catalogSelection.cluster.taskSlug, undefined);
assert.throws(() => parseOps2Selection({ ...fixture, cluster: { role: 'gap_filler', taskSlug: '' } }),
  /cluster.taskSlug/);
assert.throws(() => parseOps2Selection({ ...fixture, cluster: { role: 'gap_filler', taskSlug: 'Bad Task' } }),
  /Invalid cluster/);
assert.throws(() => parseOps2Selection({ ...fixture, cluster: { role: 'gap_filler' },
  entityGate: { ...fixture.entityGate, duplicateIntent: { ...fixture.entityGate.duplicateIntent,
    checkedToolIds: ['aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'] } } }), /cannot claim Task Fit/);

const parentBrandFixture = {
  ...fixture,
  officialUrl: 'https://product.example/',
  officialDomainGroup: { canonicalProductDomain: 'product.example', parentBrandDomains: ['brand.example'],
    identitySourceIds: ['owner'] },
  officialSources: [
    { id: 'features', url: 'https://product.example/features', claimKeys: ['core'] },
    { id: 'owner', url: 'https://brand.example/products/fixture', claimKeys: ['identity', 'brand_relationship'] },
    { id: 'rights', url: 'https://brand.example/brand', claimKeys: ['rights'] },
  ],
  entityGate: { ...fixture.entityGate, identityCanonical: { ...fixture.entityGate.identityCanonical,
    sourceIds: ['owner'] } },
  media: { ...fixture.media, sourceUrl: 'https://brand.example/brand',
    rightsSourceUrl: 'https://brand.example/brand' },
};
assert.equal(parseOps2Selection(parentBrandFixture).officialDomainGroup?.parentBrandDomains[0], 'brand.example');
assert.throws(() => parseOps2Selection({ ...parentBrandFixture,
  officialSources: parentBrandFixture.officialSources.map((source) => source.id === 'owner'
    ? { ...source, claimKeys: ['identity'] } : source) }), /brand-relationship/);
assert.throws(() => parseOps2Selection({ ...parentBrandFixture, entityGate: {
  ...parentBrandFixture.entityGate, identityCanonical: { ...parentBrandFixture.entityGate.identityCanonical,
    sourceIds: ['features'] } } }), /identity source/);

const platformSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <defs><linearGradient id="local-gradient"><stop offset="0"/><stop offset="1"/></linearGradient></defs>
  <path fill="url(#local-gradient)" d="M1 5h8"/>
</svg>\n`;
const platformFixture = parseOps2Selection({ ...fixture, media: {
  mode: 'platform_owned_editorial', assetPath: '/images/tool-media/fixture-neutral.svg',
  sha256: createHash('sha256').update(platformSvg).digest('hex'), creator: 'AI Best Tool editorial',
  createdAt: today, noVendorMarks: true,
} });
assert.equal(selectionRawPayload(platformFixture).detailMetadata.imageUrl,
  '/images/tool-media/fixture-neutral.svg');
assert.throws(() => parseOps2Selection({ ...fixture, media: {
  ...platformFixture.media, noVendorMarks: false } }));
assert.throws(() => parseOps2Selection({ ...fixture, media: {
  ...platformFixture.media, assetPath: '/../fixture.svg' } }));

type Candidate = { id: string; status: string; title: string; summary: string; url: string;
  relevance_score: number; quality_score: number; score_reason: string; tool_id: null;
  normalized_url: string; raw_payload: Record<string, unknown> };
const fitA = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';
const fitB = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb';
const fitExtra = 'dddddddd-3333-4333-8333-dddddddddddd';
const withChecked = (ids: string[]) => parseOps2Selection({ ...fixture, entityGate: {
  ...fixture.entityGate, duplicateIntent: { ...fixture.entityGate.duplicateIntent, checkedToolIds: ids },
} });
const state: { candidate: Candidate | null; snapshot: Candidate | null; writes: number;
  tools: { id: string; name: string; url: string }[]; fitToolIds: string[];
  taskExists: boolean; fitQueryFails: boolean } = {
  candidate: null, snapshot: null, writes: 0, tools: [], fitToolIds: [],
  taskExists: true, fitQueryFails: false,
};
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const client = {
  async query(sql: string, params: unknown[] = []) {
    if (sql === 'BEGIN') { state.snapshot = clone(state.candidate); return { rows: [], rowCount: 0 }; }
    if (sql === 'ROLLBACK') { state.candidate = clone(state.snapshot); return { rows: [], rowCount: 0 }; }
    if (sql === 'COMMIT') { state.snapshot = null; return { rows: [], rowCount: 0 }; }
    if (sql.startsWith('SELECT * FROM collection_candidates')) {
      const rows = state.candidate && (state.candidate.id === params[0] || state.candidate.normalized_url === params[1])
        ? [clone(state.candidate)] : [];
      return { rows, rowCount: rows.length };
    }
    if (sql === 'SELECT id,name,url,title FROM tools') return { rows: state.tools, rowCount: state.tools.length };
    if (sql.startsWith('SELECT id FROM categories'))
      return { rows: [{ id: 'category-or-task' }], rowCount: 1 };
    if (sql.startsWith('SELECT id FROM decision_tasks'))
      return { rows: state.taskExists ? [{ id: 'category-or-task' }] : [], rowCount: state.taskExists ? 1 : 0 };
    if (sql.startsWith('SELECT DISTINCT tool_id FROM tool_task_fits')) {
      if (state.fitQueryFails) throw new Error('Fit query failed');
      return { rows: state.fitToolIds.map((tool_id) => ({ tool_id })), rowCount: state.fitToolIds.length };
    }
    if (sql.startsWith('INSERT INTO collection_candidates')) {
      if (state.candidate) return { rows: [], rowCount: 0 };
      state.candidate = { id: String(params[0]), normalized_url: String(params[1]), url: String(params[1]),
        title: String(params[2]), summary: String(params[3]), relevance_score: 80, quality_score: 90,
        score_reason: String(params[5]), status: 'new', tool_id: null,
        raw_payload: JSON.parse(String(params[4])) };
      state.writes++;
      return { rows: [{ id: params[0] }], rowCount: 1 };
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  },
  release() {},
} as unknown as PoolClient;
const deps = { connect: async () => client, assertReviewer: async () => undefined,
  readTaskFitToolIds: async (target: PoolClient, taskSlug: string) => {
    const task = await target.query('SELECT id FROM decision_tasks WHERE slug=$1 AND status=$2', [taskSlug, 'active']);
    assert.equal(task.rowCount, 1, 'Selected Task cluster is not active');
    const fits = await target.query(`SELECT DISTINCT tool_id FROM tool_task_fits
      WHERE task_id=$1 AND status IN ('reviewed','published') ORDER BY tool_id`, [task.rows[0].id]);
    return fits.rows.map((row) => String(row.tool_id));
  } };

async function main() {
  const original = { ...process.env };
  try {
    const assetRoot = mkdtempSync(join(tmpdir(), 'ops2-media-'));
    try {
      const mediaRoot = join(assetRoot, 'public/images/tool-media');
      mkdirSync(mediaRoot, { recursive: true });
      const verifySvg = async (name: string, value: string) => {
        const assetPath = `/images/tool-media/${name}.svg`;
        writeFileSync(join(mediaRoot, `${name}.svg`), value);
        return verifyPlatformOwnedMedia(parseOps2Selection({ ...fixture, media: {
          ...platformFixture.media, assetPath,
          sha256: createHash('sha256').update(value).digest('hex'),
        } }), assetRoot);
      };
      writeFileSync(join(mediaRoot, 'fixture-neutral.svg'), platformSvg);
      await verifyPlatformOwnedMedia(platformFixture, assetRoot);
      await verifySvg('local-gradient', platformSvg);
      for (const [name, unsafeSvg] of [
        ['style-import', '<svg xmlns="http://www.w3.org/2000/svg"><style>@import url("https://evil.example/a.css");</style></svg>'],
        ['external-fill', '<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:url(https://evil.example/a.svg#x)"/></svg>'],
        ['doctype-entity', '<!DOCTYPE svg [<!ENTITY payload SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><text>&payload;</text></svg>'],
        ['data-url', '<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:url(data:image/svg+xml;base64,AAAA)"/></svg>'],
        ['external-scheme', '<svg xmlns="http://www.w3.org/2000/svg"><use src="custom-scheme://evil.example/shape"/></svg>'],
      ] as const) await assert.rejects(verifySvg(name, unsafeSvg), /self-contained/);
      await assert.rejects(verifyPlatformOwnedMedia(parseOps2Selection({ ...fixture, media: {
        ...platformFixture.media, sha256: '0'.repeat(64) } }), assetRoot), /sha256 differs/);
    } finally {
      rmSync(assetRoot, { recursive: true, force: true });
    }
    process.env.OPS2_REVIEWER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const report = { status: 'PASS', selectionHash: preflightSelectionHash(),
      reviewer: process.env.OPS2_REVIEWER_ID,
      qaActor: 'codex-thread:cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      qaThread: 'codex-thread:cccccccc-cccc-4ccc-8ccc-cccccccccccc', checkedAt: new Date().toISOString(),
      scope: { operation: 'enqueue', candidateId: selection.id, canonicalUrl: selection.officialUrl } };
    process.env.OPS2_QA_REPORT = JSON.stringify(report);
    process.env.OPS2_QA_REFERENCE = report.qaActor;
    for (const invalid of [
      { ...report, status: 'HOLD' },
      { ...report, selectionHash: '0'.repeat(64) },
      { ...report, qaActor: `codex-thread:${report.reviewer}`, qaThread: `codex-thread:${report.reviewer}` },
      { ...report, qaThread: 'not-a-thread' },
      { ...report, checkedAt: new Date(Date.now() - 73 * 3600000).toISOString() },
      { ...report, scope: { ...report.scope, candidateId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' } },
    ]) assert.throws(() => parseQaReport(invalid, selection));
    state.fitToolIds = [fitB, fitA];
    assert.equal((await run(withChecked([fitA, fitB]), parseOptions(['--mode=preflight']), deps)).ready, true);
    await assert.rejects(run(withChecked([fitA]), parseOptions(['--mode=preflight']), deps));
    await assert.rejects(run(withChecked([fitA, fitB, fitExtra]), parseOptions(['--mode=preflight']), deps));
    state.taskExists = false;
    await assert.rejects(run(withChecked([fitA, fitB]), parseOptions(['--mode=preflight']), deps),
      /not active/);
    state.taskExists = true;
    state.fitQueryFails = true;
    await assert.rejects(run(withChecked([fitA, fitB]), parseOptions(['--mode=preflight']), deps),
      /Fit query failed/);
    state.fitQueryFails = false;
    state.fitToolIds = [];
    state.taskExists = false;
    state.fitQueryFails = true;
    const catalogPreflight = await run(catalogSelection, parseOptions(['--mode=preflight']), deps);
    assert.equal(catalogPreflight.ready, true, 'Catalog-only selection must not require a Task or Fit lookup');
    const catalogRollback = await run(catalogSelection,
      parseOptions(['--mode=rollback', `--expected-hash=${catalogPreflight.preimageHash}`]), deps);
    assert.equal(catalogRollback.productionWrites, 0);
    assert.equal(state.candidate, null);
    state.tools = [{ id: 'existing', name: 'Other Tool', url: catalogSelection.officialUrl }];
    await assert.rejects(run(catalogSelection, parseOptions(['--mode=preflight']), deps), /already exists/);
    state.tools = [];
    state.taskExists = true;
    state.fitQueryFails = false;
    const preflight = await run(selection, parseOptions(['--mode=preflight']), deps);
    assert.equal(preflight.ready, true);
    const hash = preflight.preimageHash!;
    await assert.rejects(run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps),
      /Exact enqueue authorization required/);
    assert.equal(state.candidate, null);
    const rollback = await run(selection, parseOptions(['--mode=rollback', `--expected-hash=${hash}`]), deps);
    assert.equal(rollback.productionWrites, 0);
    assert.equal(state.candidate, null);
    process.env.OPS2_ROLLBACK_HASH = hash;
    const reportHash = qaReportHash(parseQaReport(report, selection));
    process.env.OPS2_QA_REPORT = JSON.stringify({ ...report, status: 'HOLD' });
    await assert.rejects(run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps));
    process.env.OPS2_QA_REPORT = JSON.stringify({ ...report, reviewer: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' });
    await assert.rejects(run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps));
    process.env.OPS2_QA_REPORT = JSON.stringify(report);
    process.env.OPS2_QA_REFERENCE = 'codex-thread:dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    await assert.rejects(run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps));
    process.env.OPS2_QA_REFERENCE = report.qaActor;
    process.env.OPS2_PUBLISH_AUTHORIZATION =
      `enqueue:${selection.id}:${report.selectionHash}:${report.reviewer}:${reportHash}`;
    await assert.rejects(run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps),
      /Exact enqueue authorization required/);
    process.env.OPS2_PUBLISH_AUTHORIZATION =
      `enqueue:${selection.id}:${report.selectionHash}:${report.reviewer}:${report.qaActor}:${reportHash}`;
    const committed = await run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps);
    assert.equal(committed.productionWrites, 1);
    const postArgs = ['--mode=postcheck', `--expected-hash=${hash}`, `--expected-post-hash=${committed.postimageHash}`];
    const check = await run(selection, parseOptions(postArgs), deps);
    assert.equal(check.productionWrites, 0);
    for (const key of ['status', 'title', 'summary', 'url', 'normalized_url', 'relevance_score', 'quality_score', 'tool_id']) {
      const before = clone(state.candidate);
      (state.candidate as any)[key] = key === 'relevance_score' || key === 'quality_score' ? 1 : 'drift';
      await assert.rejects(run(selection, parseOptions(postArgs), deps));
      state.candidate = before;
    }
    const beforeAudit = clone(state.candidate);
    (state.candidate!.raw_payload.ops2EnqueueAudit as Record<string, unknown>).qaReportHash = 'tampered';
    await assert.rejects(run(selection, parseOptions(postArgs), deps));
    state.candidate = beforeAudit;
    const beforePayload = clone(state.candidate);
    state.candidate!.raw_payload.extra = 'unexpected';
    await assert.rejects(run(selection, parseOptions(postArgs), deps));
    state.candidate = beforePayload;
    await assert.rejects(run(selection, parseOptions([...postArgs.slice(0, 2), `--expected-post-hash=${'0'.repeat(64)}`]), deps));
    const replay = await run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), deps);
    assert.equal(replay.productionWrites, 0);
    assert.equal(state.writes, 3, 'Catalog preview, Task preview and first commit are the only inserts');
    const different = parseOps2Selection({ ...fixture, name: 'Changed Fixture AI Research' });
    await assert.rejects(run(different, parseOptions(['--mode=preflight']), deps));
    state.tools = [{ id: 'existing', name: 'Fixture AI Research', url: selection.officialUrl }];
    state.candidate = null;
    await assert.rejects(run(selection, parseOptions(['--mode=preflight']), deps), /already exists/);
    if (process.argv.includes('--local-db')) await runLocalDb();
    console.log('OPS2 structured enqueue validation, collision, rollback, exact authorization, commit and replay passed.');
  } finally {
    for (const key of ['OPS2_REVIEWER_ID', 'OPS2_QA_REFERENCE', 'OPS2_QA_REPORT', 'OPS2_ROLLBACK_HASH', 'OPS2_PUBLISH_AUTHORIZATION']) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

async function runLocalDb() {
  const database = `ops2_enqueue_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const user = userInfo().username;
  const admin = new Client({ host: '/tmp', port: 5432, user, database: 'postgres' });
  const db = new Client({ host: '/tmp', port: 5432, user, database });
  let created = false;
  let connected = false;
  try {
    await admin.connect();
    await admin.query(`CREATE DATABASE "${database}"`);
    created = true;
    await db.connect();
    connected = true;
    await db.query(`CREATE TABLE categories(id uuid PRIMARY KEY, slug text UNIQUE);
      CREATE TABLE decision_tasks(id uuid PRIMARY KEY, slug text UNIQUE, status text);
      CREATE TABLE tool_task_fits(task_id uuid, tool_id uuid, status text);
      CREATE TABLE tools(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, url text, title jsonb,
        content jsonb, detail jsonb, image_url text, thumbnail_url text, category_id uuid,
        tags text[], pricing text, use_cases jsonb, status text, features jsonb,
        next_review_date date, updated_at timestamptz DEFAULT now());
      CREATE TABLE collection_candidates(id uuid PRIMARY KEY, url text, normalized_url text UNIQUE,
        title text, summary text, raw_payload jsonb, relevance_score int, quality_score int,
        score_reason text, status text, tool_id uuid);
      INSERT INTO categories VALUES ('11111111-1111-4111-8111-111111111111','productivity');
      INSERT INTO decision_tasks VALUES ('22222222-2222-4222-8222-222222222222','research-with-citations','active');`);
    const localClient = Object.assign(db, { release() {} }) as unknown as PoolClient;
    const localDeps = { ...deps, connect: async () => localClient };
    await db.query(`INSERT INTO tool_task_fits VALUES
      ('22222222-2222-4222-8222-222222222222',$1,'reviewed'),
      ('22222222-2222-4222-8222-222222222222',$2,'published'),
      ('22222222-2222-4222-8222-222222222222',$3,'draft')`, [fitA, fitB, fitExtra]);
    assert.equal((await run(withChecked([fitB, fitA]), parseOptions(['--mode=preflight']), localDeps)).ready, true);
    await assert.rejects(run(withChecked([fitA]), parseOptions(['--mode=preflight']), localDeps));
    await assert.rejects(run(withChecked([fitA, fitB, fitExtra]), parseOptions(['--mode=preflight']), localDeps));
    await db.query("UPDATE decision_tasks SET status='inactive' WHERE slug='research-with-citations'");
    await assert.rejects(run(withChecked([fitA, fitB]), parseOptions(['--mode=preflight']), localDeps),
      /not active/);
    await db.query("UPDATE decision_tasks SET status='active' WHERE slug='research-with-citations'");
    await db.query('DELETE FROM tool_task_fits');
    const before = await run(selection, parseOptions(['--mode=preflight']), localDeps);
    const hash = before.preimageHash!;
    const rolledBack = await run(selection, parseOptions(['--mode=rollback', `--expected-hash=${hash}`]), localDeps);
    assert.equal(rolledBack.productionWrites, 0);
    assert.equal((await db.query('SELECT count(*)::int n FROM collection_candidates')).rows[0].n, 0);
    process.env.OPS2_ROLLBACK_HASH = hash;
    const report = parseQaReport(JSON.parse(process.env.OPS2_QA_REPORT!), selection);
    process.env.OPS2_PUBLISH_AUTHORIZATION =
      `enqueue:${selection.id}:${selectionHash(selection)}:${report.reviewer}:${report.qaActor}:${qaReportHash(report)}`;
    const committed = await run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), localDeps);
    assert.equal(committed.productionWrites, 1);
    const postArgs = ['--mode=postcheck', `--expected-hash=${hash}`, `--expected-post-hash=${committed.postimageHash}`];
    assert.equal((await run(selection, parseOptions(postArgs), localDeps)).productionWrites, 0);
    assert.equal((await run(selection, parseOptions(['--mode=commit', `--expected-hash=${hash}`]), localDeps))
      .productionWrites, 0);
    assert.equal((await db.query('SELECT count(*)::int n FROM collection_candidates')).rows[0].n, 1);
    await db.query('BEGIN');
    try {
      const imported = await importCollectionCandidateToDraft(selection.id, localClient);
      const tool = (await db.query('SELECT * FROM tools WHERE id=$1', [imported.toolId])).rows[0];
      assert.equal(tool.status, 'draft');
      assert.equal(tool.title.cn, selection.localized.cn.title);
      assert.equal(tool.content.zh, selection.localized.cn.summary);
      assert.equal(tool.content.tw, selection.localized.tw.summary);
      assert.equal(tool.title.tw, selection.localized.tw.title);
      assert.equal(tool.detail.en, selection.localized.en.detail);
      assert.deepEqual(tool.features.collection, {});
      assert.equal(tool.features.ops2Selection, undefined);
      assert.equal(tool.features.claimGate, undefined);
      assert.equal(tool.features.marketValidation, undefined);
      assert.ok(!JSON.stringify(tool).includes('ops2EnqueueAudit'));
      assert.ok(!JSON.stringify(tool).includes('qaReportHash'));
      assert.equal((await db.query(`SELECT 1 FROM tools WHERE id=$1 AND ${evidenceReadyDraftSql}`,
        [imported.toolId])).rowCount, 0, 'Unreviewed market evidence cannot publish the imported draft');
    } finally {
      await db.query('ROLLBACK');
    }
    assert.equal((await db.query('SELECT count(*)::int n FROM tools')).rows[0].n, 0);
    console.log('Isolated local PostgreSQL transaction rollback, commit, postcheck and replay passed.');
  } finally {
    if (connected) await db.end().catch(() => undefined);
    if (created) await admin.query(`DROP DATABASE "${database}"`).catch(() => undefined);
    await admin.end().catch(() => undefined);
  }
}

function preflightSelectionHash() {
  return selectionHash(selection);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

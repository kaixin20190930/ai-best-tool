import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

type Slug = 'grammarly' | 'jasper' | 'descript';
type Patch = {
  classification: string;
  operation: string;
  path: string;
  value?: string;
  newValueCandidate?: string | string[];
  items?: { label: string; url: string; checkedAt: string }[];
};
type Candidate = {
  slug: Slug;
  toolId: string;
  expectedStatus: string;
  expectedPageQualityStatus: string;
  expectedOfficialUrl: string;
  nextReviewDateNoChange: string;
  candidatePatch: Patch[];
};
type Row = Record<string, any>;

const FILES = [
  [
    'docs/CANVA_GRAMMARLY_N6_CANDIDATE_PATCH_2026-09-28_CN.json',
    '2f7b8a38bacffe2c0acaed3ce94f106b3b4d777b8588786ccd94bae608a77400',
  ],
  [
    'docs/JASPER_DESCRIPT_N7_CANDIDATE_PATCH_2026-09-28_CN.json',
    '44475c1ad9150c9af95903b68ab8376b56a2e6198d852ea0af0a0878fd735962',
  ],
] as const;
const TARGETS: Record<
  Slug,
  {
    id: string;
    url: string;
    status: string;
    quality: string;
    review: string;
    baseline: string;
    applied: string;
    protected: string;
    paths: string[];
  }
> = {
  grammarly: {
    id: '4d0bbf38-6b7e-4c44-8e25-9fe73f60bb18',
    url: 'https://www.grammarly.com/',
    status: 'published',
    quality: 'continue_index',
    review: '2026-10-20',
    baseline: '76d643e43e969123f4be656ef493106dc92aeda01800d671d3072330c7580cbe',
    applied: '0c3cb98119b9b836fbd700f4160e6dd46d7f8693035b8abcf0257c7a2be9eb96',
    protected: 'c18a594f6a76c0a9796cc79fc62c724fc8421f0321d1947f341d01a0b956d1a5',
    paths: ['detail.en', 'detail.zh', 'detail.cn', 'features.evidence.official'],
  },
  jasper: {
    id: '5a0c7e91-9a5c-4f84-923a-d8345edaa918',
    url: 'https://www.jasper.ai/',
    status: 'published',
    quality: 'continue_index',
    review: '2026-10-20',
    baseline: '19b77877afa25efe290b926ac06fb9ef0c8c86aebe66345195a67013178912c9',
    applied: 'ece814dd76b32e4e65da4aad8b3cc6433892cf4c779babb7f4cd33c014386abd',
    protected: '918262131ec25097a3c874ce4c32153639e41f127a1366852f14c35a3148e73d',
    paths: ['detail.en', 'detail.zh', 'detail.cn'],
  },
  descript: {
    id: 'a8c41d20-6b48-4f75-9f17-7e34c84619d2',
    url: 'https://www.descript.com/',
    status: 'published',
    quality: 'monitor',
    review: '2026-10-27',
    baseline: '37245bbfb09f593f16ef8577d1e2bf4a512a62b9d624c7cf3a7b77ae2e0c9fda',
    applied: '8cbbf70731fdb2ef827e5e3cf6a91026a2cb9301de2cccf211a50e85749842a3',
    protected: '2e50c373d2764e6038165c5dde6fac8f303302c3deb752da542995062b5a4196',
    paths: [
      'detail.en',
      'detail.zh',
      'detail.cn',
      'features.decision.limitations.en',
      'features.decision.limitations.zh',
      'features.decision.limitations.cn',
    ],
  },
};

function canonical(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}
export function hash(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
const targetFields = (row: Row) => ({ detail: row.detail, features: row.features });
const getPath = (value: Row, dotted: string) => dotted.split('.').reduce((current, key) => current?.[key], value);
const setPath = (value: Row, dotted: string, next: unknown) => {
  const keys = dotted.split('.');
  const parent = keys.slice(0, -1).reduce((current, key) => {
    assert(current && typeof current === 'object' && !Array.isArray(current));
    return current[key];
  }, value);
  assert(parent && typeof parent === 'object' && !Array.isArray(parent));
  parent[keys[keys.length - 1]] = next;
};
function operationForPath(dotted: string) {
  if (dotted === 'features.evidence.official') return 'append_unique_by_url';
  if (dotted.startsWith('features.decision.limitations.')) return 'append_unique_items';
  return 'append_paragraph_if_absent';
}

export function loadPlan(): Candidate[] {
  const manifests = FILES.map(([name, expectedHash]) => {
    const bytes = fs.readFileSync(path.join(process.cwd(), name));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expectedHash,
      `${name}: audited manifest changed; re-audit`,
    );
    return JSON.parse(bytes.toString('utf8'));
  });
  assert.equal(manifests[0].canva.toolId, null, 'Canva must stay excluded');
  assert.match(manifests[0].canva.status, /^HOLD/);
  assert.deepEqual(manifests[0].canva.patch, []);
  assert.deepEqual(
    manifests[1].tools.map((item: Candidate) => item.slug),
    ['jasper', 'descript'],
  );
  const plan = [manifests[0].grammarly, ...manifests[1].tools] as Candidate[];
  assert.deepEqual(
    plan.map((item) => item.slug),
    ['grammarly', 'jasper', 'descript'],
  );
  for (const item of plan) {
    const expected = TARGETS[item.slug];
    assert(expected, `unknown tool ${item.slug}`);
    assert.equal(item.toolId, expected.id);
    assert.equal(item.expectedOfficialUrl, expected.url);
    assert.equal(item.expectedStatus, expected.status);
    assert.equal(item.expectedPageQualityStatus, expected.quality);
    assert.equal(item.nextReviewDateNoChange, expected.review);
    assert.deepEqual(
      item.candidatePatch.map((patch) => patch.path),
      expected.paths,
      `${item.slug}: candidate paths changed`,
    );
    for (const patch of item.candidatePatch) {
      assert.equal(
        patch.classification,
        item.slug === 'grammarly' ? 'safe factual update candidate' : 'SAFE_UPDATE_CANDIDATE',
        `${item.slug}: non-SAFE patch`,
      );
      const operation = operationForPath(patch.path);
      assert.equal(patch.operation, operation, `${item.slug}: unknown operation`);
      if (operation === 'append_unique_by_url') {
        assert(Array.isArray(patch.items) && patch.items.length === 2);
        for (const entry of patch.items)
          assert(typeof entry.label === 'string' && /^https:\/\//.test(entry.url) && entry.checkedAt === '2026-09-28');
      } else if (operation === 'append_unique_items') {
        assert(
          Array.isArray(patch.newValueCandidate) &&
            patch.newValueCandidate.length === 3 &&
            patch.newValueCandidate.every((value) => typeof value === 'string' && value.length > 0),
        );
      } else {
        assert(
          typeof (patch.value ?? patch.newValueCandidate) === 'string' &&
            (patch.value ?? patch.newValueCandidate)!.length > 50,
        );
      }
    }
  }
  return plan;
}

export function applyCandidate(row: Row, candidate: Candidate): { detail: Row; features: Row; changedPaths: string[] } {
  const expected = TARGETS[candidate.slug];
  assert(expected, `unknown tool ${candidate.slug}`);
  assert.deepEqual(
    candidate.candidatePatch.map((patch) => patch.path),
    expected.paths,
    `${candidate.slug}: non-allowlisted path`,
  );
  const output = structuredClone(targetFields(row));
  const changedPaths: string[] = [];
  for (const patch of candidate.candidatePatch) {
    assert.equal(
      patch.classification,
      candidate.slug === 'grammarly' ? 'safe factual update candidate' : 'SAFE_UPDATE_CANDIDATE',
      `${candidate.slug}: non-SAFE patch`,
    );
    assert.equal(patch.operation, operationForPath(patch.path), `${candidate.slug}: unknown operation`);
    const old = getPath(output, patch.path);
    if (patch.operation === 'append_paragraph_if_absent') {
      assert(typeof old === 'string' && old.length > 100, `${candidate.slug}: missing old ${patch.path}`);
      const paragraph = patch.value ?? patch.newValueCandidate;
      assert(typeof paragraph === 'string');
      if (!old.includes(paragraph)) {
        setPath(output, patch.path, `${old.trimEnd()}\n\n${paragraph}`);
        changedPaths.push(patch.path);
      }
    } else if (patch.operation === 'append_unique_by_url') {
      assert(
        Array.isArray(old) && old.every((entry) => entry && typeof entry.url === 'string'),
        `${candidate.slug}: invalid official evidence`,
      );
      const urls = new Set(old.map((entry) => entry.url));
      const next = [...old];
      for (const entry of patch.items ?? []) {
        if (!urls.has(entry.url)) {
          next.push(entry);
          urls.add(entry.url);
        }
      }
      if (next.length !== old.length) {
        setPath(output, patch.path, next);
        changedPaths.push(patch.path);
      }
    } else if (patch.operation === 'append_unique_items') {
      assert(
        Array.isArray(old) && old.every((entry) => typeof entry === 'string'),
        `${candidate.slug}: invalid limitations`,
      );
      const next = [...old];
      for (const entry of patch.newValueCandidate as string[]) if (!next.includes(entry)) next.push(entry);
      if (next.length !== old.length) {
        setPath(output, patch.path, next);
        changedPaths.push(patch.path);
      }
    } else throw new Error(`${candidate.slug}: unknown operation`);
  }
  return { ...output, changedPaths };
}

function indexDecision(row: Row) {
  return getToolIndexDecision({
    status: row.status,
    pageQualityStatus: row.page_quality_status,
    categoryId: row.category_id,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    content: row.content,
    detail: row.detail,
    pricing: row.pricing,
    tags: row.tags,
  });
}
function protectedFields(row: Row) {
  const copy = { ...row };
  for (const key of ['detail', 'features', 'updated_at', 'search_vector']) delete copy[key];
  return canonical(copy);
}
export function assessRow(
  row: Row,
  candidate: Candidate,
  hashes: { baseline: string; applied: string; protected?: string } = TARGETS[candidate.slug],
) {
  const expected = TARGETS[candidate.slug];
  assert.equal(row.id, expected.id);
  assert.equal(row.name, candidate.slug);
  assert.equal(row.url, expected.url);
  assert.equal(row.status, expected.status);
  assert.equal(row.page_quality_status, expected.quality);
  assert.equal(row.next_review_date_text, expected.review);
  if (hashes.protected)
    assert.equal(hash(protectedFields(row)), hashes.protected, `${candidate.slug}: protected source changed; re-audit`);
  assert.equal(
    indexDecision(row).indexable,
    candidate.slug !== 'descript',
    `${candidate.slug}: index baseline changed`,
  );
  const beforeHash = hash(targetFields(row));
  assert(
    [hashes.baseline, hashes.applied].includes(beforeHash),
    `${candidate.slug}: source changed; re-audit before write`,
  );
  const proposed = applyCandidate(row, candidate);
  const alreadyApplied = proposed.changedPaths.length === 0;
  assert.equal(
    beforeHash,
    alreadyApplied ? hashes.applied : hashes.baseline,
    `${candidate.slug}: partial or unreviewed update`,
  );
  assert.equal(
    hash({ detail: proposed.detail, features: proposed.features }),
    hashes.applied,
    `${candidate.slug}: candidate result differs from audited target`,
  );
  const after = { ...row, detail: proposed.detail, features: proposed.features };
  assert.deepEqual(protectedFields(after), protectedFields(row));
  assert.deepEqual(indexDecision(after), indexDecision(row), `${candidate.slug}: index decision changed`);
  return {
    alreadyApplied,
    changedPaths: proposed.changedPaths,
    beforeHash,
    proposedHash: hash(targetFields(after)),
    detail: proposed.detail,
    features: proposed.features,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--status', '--commit'].includes(arg)), 'usage: [--status|--commit]');
  const plan = loadPlan();
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  let inTransaction = false;
  try {
    await client.query(args.includes('--status') ? 'BEGIN READ ONLY' : 'BEGIN');
    inTransaction = true;
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const results = [];
    for (const candidate of plan) {
      const select =
        'SELECT *, next_review_date::text AS next_review_date_text FROM public.tools WHERE id=$1 AND name=$2';
      const params = [candidate.toolId, candidate.slug];
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
      assert(before, `${candidate.slug}: fixed row missing`);
      const assessment = assessRow(before, candidate);
      if (!args.includes('--status') && !assessment.alreadyApplied) {
        const updated = await client.query(
          'UPDATE public.tools SET detail=$3::jsonb, features=$4::jsonb, updated_at=now() WHERE id=$1 AND name=$2',
          [...params, JSON.stringify(assessment.detail), JSON.stringify(assessment.features)],
        );
        assert.equal(updated.rowCount, 1);
        const after = (await client.query(select, params)).rows[0];
        assert.deepEqual(
          protectedFields(after),
          protectedFields(before),
          `${candidate.slug}: protected fields changed`,
        );
        assert.equal(hash(targetFields(after)), assessment.proposedHash, `${candidate.slug}: target fields differ`);
        assert.deepEqual(indexDecision(after), indexDecision(before), `${candidate.slug}: index decision changed`);
      }
      results.push({
        slug: candidate.slug,
        alreadyApplied: assessment.alreadyApplied,
        changedPaths: assessment.changedPaths,
        baselineHash: assessment.beforeHash,
        targetHash: assessment.proposedHash,
        indexable: indexDecision(before).indexable,
      });
    }
    const committed = args.includes('--commit');
    await client.query(committed ? 'COMMIT' : 'ROLLBACK');
    inTransaction = false;
    let mode = 'dry-run-rollback';
    if (args.includes('--status')) mode = 'status-read-only';
    else if (committed) mode = 'commit';
    console.log(JSON.stringify({ mode, results }, null, 2));
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

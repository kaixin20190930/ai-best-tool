import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import type { PoolClient } from 'pg';

import { getPool } from '../db/neon/client';
import { isAdminUser } from '../lib/auth/admin';
import { expectedAuditHash, hash, packHash, parseMarketPack, protectedHash, validateQa,
  type MarketPack } from '../lib/services/admin/ops2MarketValidation';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

type Mode = 'preflight' | 'rollback' | 'commit' | 'postcheck';
type Options = { mode: Mode; expectedHash?: string; expectedPostHash?: string };
type Dependencies = { connect: () => Promise<PoolClient>; assertReviewer: (id: string) => Promise<void> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseOptions(args: string[]): Options {
  const values = new Map<string, string>();
  for (const arg of args) {
    const match = /^--(mode|expected-hash|expected-post-hash)=([^\s]+)$/.exec(arg);
    if (!match || values.has(match[1])) throw new Error('INVALID_ARGUMENT');
    values.set(match[1], match[2]);
  }
  const mode = values.get('mode');
  if (!['preflight', 'rollback', 'commit', 'postcheck'].includes(mode || '')) throw new Error('INVALID_MODE');
  const expectedHash = values.get('expected-hash');
  if (mode !== 'preflight') expectedAuditHash(expectedHash || '');
  const expectedPostHash = values.get('expected-post-hash');
  if (mode === 'postcheck') expectedAuditHash(expectedPostHash || '');
  else if (expectedPostHash) throw new Error('UNEXPECTED_POST_HASH');
  return { mode: mode as Mode, expectedHash, expectedPostHash };
}

function marketValue(pack: MarketPack) {
  return { verdict: pack.verdict, score: pack.score, reviewedAt: pack.reviewedAt,
    evidenceUrls: pack.evidenceUrls, strongSignals: pack.strongSignals,
    supportingSignals: pack.supportingSignals, rationale: pack.rationale,
    sourceNotes: pack.sourceNotes };
}

export function assertApproval(pack: MarketPack, preimageHash: string, env = process.env): string {
  assert.match(env.OPS2_REVIEWER_ID || '', uuid, 'Approved owner reviewer required');
  assert.match(env.OPS2_QA_REFERENCE || '', /^codex-thread:[0-9a-f-]{36}$/i,
    'Independent QA actor required');
  const qaHash = validateQa(pack, env.OPS2_REVIEWER_ID!, env.OPS2_QA_REFERENCE!);
  assert.equal(env.OPS2_ROLLBACK_HASH, preimageHash, 'Matching rollback rehearsal required');
  assert.equal(env.OPS2_MARKET_AUTHORIZATION,
    `market:${pack.toolId}:${packHash(pack)}:${preimageHash}:${env.OPS2_REVIEWER_ID}:${pack.developmentActor}:${env.OPS2_QA_REFERENCE}:${qaHash}`,
    'Exact market-validation authorization required');
  return qaHash;
}

function assertApplied(row: Record<string, any>, pack: MarketPack, preimageHash: string,
  expectedPostHash: string, env = process.env) {
  const market = row.features?.marketValidation;
  assert.ok(market, 'Market validation missing');
  const audit = market.ops2MarketAudit;
  assert.equal(audit?.preimageHash, preimageHash);
  assert.equal(audit?.packHash, packHash(pack));
  assert.equal(audit?.protectedHash, protectedHash(row), 'Protected tool fields changed');
  assert.equal(audit?.reviewer, env.OPS2_REVIEWER_ID);
  assert.equal(audit?.developmentActor, pack.developmentActor);
  assert.equal(audit?.qaActor, env.OPS2_QA_REFERENCE);
  assert.equal(audit?.qaReportHash, validateQa(pack, env.OPS2_REVIEWER_ID!, env.OPS2_QA_REFERENCE!));
  assert.deepEqual({ ...market, ops2MarketAudit: undefined }, { ...marketValue(pack), ops2MarketAudit: undefined });
  const postHash = hash({ market, updated_at: row.updated_at });
  assert.equal(postHash, expectedPostHash, 'Market validation postimage changed');
  return postHash;
}

async function reviewer(id: string) {
  const { data, error } = await createAdminClient().auth.admin.getUserById(id);
  if (error) throw new Error(error.message);
  assert.ok(isAdminUser(data.user), 'Reviewer is not an approved administrator');
}

const productionDeps: Dependencies = { connect: () => getPool().connect(), assertReviewer: reviewer };

export async function run(pack: MarketPack, options: Options, deps = productionDeps, env = process.env) {
  const client = await deps.connect();
  let transaction = false;
  try {
    if (options.mode === 'rollback' || options.mode === 'commit') {
      await client.query('BEGIN');
      transaction = true;
    }
    const result = await client.query(`SELECT * FROM tools WHERE id=$1${transaction ? ' FOR UPDATE' : ''}`,
      [pack.toolId]);
    assert.equal(result.rowCount, 1, 'Exact draft tool not found');
    const row = result.rows[0] as Record<string, any>;
    assert.equal(row.status, 'draft', 'Only drafts can receive market validation');
    const vendor = new URL(row.url);
    assert.ok(pack.vendorDomains.some((domain) => vendor.hostname === domain ||
      vendor.hostname.endsWith(`.${domain}`)), 'Pack must declare the canonical vendor domain');
    for (const source of pack.evidenceUrls) {
      const url = new URL(source);
      assert.ok(!pack.vendorDomains.some((domain) => url.hostname === domain ||
        url.hostname.endsWith(`.${domain}`)), 'Vendor page is not independent market evidence');
    }
    if (options.mode === 'postcheck') {
      assertApplied(row, pack, options.expectedHash!, options.expectedPostHash!, env);
      return { mode: options.mode, toolId: pack.toolId, postimageHash: options.expectedPostHash,
        productionWrites: 0 };
    }
    assert.equal(row.features?.marketValidation, undefined,
      'Existing market validation needs a separate reviewed revision, not blind overwrite');
    const preimageHash = hash(row);
    if (options.mode === 'preflight') return { mode: options.mode, toolId: pack.toolId,
      preimageHash, packHash: packHash(pack), protectedHash: protectedHash(row), productionWrites: 0 };
    assert.equal(options.expectedHash, preimageHash, 'Tool changed since preflight');
    assert.match(env.OPS2_REVIEWER_ID || '', uuid, 'Approved owner reviewer required');
    await deps.assertReviewer(env.OPS2_REVIEWER_ID!);
    const qaHash = options.mode === 'commit' ? assertApproval(pack, preimageHash, env) : null;
    const market = { ...marketValue(pack), ops2MarketAudit: {
      preimageHash, packHash: packHash(pack), protectedHash: protectedHash(row),
      reviewer: env.OPS2_REVIEWER_ID, developmentActor: pack.developmentActor,
      qaActor: options.mode === 'commit' ? env.OPS2_QA_REFERENCE : 'rollback-preview',
      qaReportHash: qaHash || 'rollback-preview',
    } };
    const updated = await client.query(`UPDATE tools SET features=jsonb_set(COALESCE(features,'{}'::jsonb),
      '{marketValidation}',$2::jsonb,true), updated_at=NOW()
      WHERE id=$1 AND status='draft' AND features IS NOT DISTINCT FROM $3::jsonb
      RETURNING *`, [pack.toolId, JSON.stringify(market), JSON.stringify(row.features)]);
    assert.equal(updated.rowCount, 1, 'Tool features changed during market review');
    const after = updated.rows[0] as Record<string, any>;
    assert.equal(protectedHash(after), protectedHash(row), 'Protected tool fields changed');
    assert.deepEqual(after.features.marketValidation, market);
    const postimageHash = hash({ market: after.features.marketValidation, updated_at: after.updated_at });
    if (options.mode === 'rollback') {
      await client.query('ROLLBACK');
      transaction = false;
      return { mode: options.mode, toolId: pack.toolId, preimageHash, postimageHash, productionWrites: 0 };
    }
    await client.query('COMMIT');
    transaction = false;
    return { mode: options.mode, toolId: pack.toolId, preimageHash, postimageHash, productionWrites: 1 };
  } finally {
    if (transaction) await client.query('ROLLBACK').catch(() => undefined);
    client.release();
  }
}

async function readInput(): Promise<unknown> {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk.toString();
    if (input.length > 131072) throw new Error('Market pack too large');
  }
  return JSON.parse(input);
}

if (process.argv[1]?.endsWith('run-ops2-market-validation.ts')) {
  Promise.resolve().then(async () => run(parseMarketPack(await readInput()), parseOptions(process.argv.slice(2))))
    .then((result) => console.log(JSON.stringify(result)), (error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error',
        productionWrites: process.argv.includes('--mode=commit') ? 'unknown' : 0 }));
      process.exitCode = 1;
    });
}

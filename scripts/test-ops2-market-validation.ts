import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { PoolClient } from 'pg';

import { hash, packHash, parseMarketPack, protectedHash, validateQa, type MarketPack } from
  '../lib/services/admin/ops2MarketValidation';
import { assertApproval, parseOptions, run } from './run-ops2-market-validation';

const owner = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const qaActor = 'codex-thread:01a13070-6427-7d92-ad08-3f6d2c59d114';

async function fixture(name: string): Promise<MarketPack> {
  const raw = await readFile(`.local/ops2-${name}-market-validation-2026-10-13.json`, 'utf8');
  return parseMarketPack(JSON.parse(raw));
}

function qaPack(pack: MarketPack): MarketPack {
  return { ...pack, qaReport: { status: 'PASS', reviewer: owner, qaActor,
    checkedAt: new Date().toISOString(), packHash: packHash(pack), toolId: pack.toolId } };
}

function mockDb(pack: MarketPack, url: string) {
  let row: Record<string, any> = { id: pack.toolId, url, status: 'draft',
    page_quality_status: 'monitor', features: { editorial: { source: 'official' } },
    content: { en: 'original' }, updated_at: '2026-10-12T00:00:00.000Z' };
  let snapshot: Record<string, any> | null = null;
  let writes = 0;
  const client = { query: async (sql: string, params?: any[]) => {
    if (sql === 'BEGIN') { snapshot = structuredClone(row); return { rowCount: 0, rows: [] }; }
    if (sql === 'ROLLBACK') { row = snapshot!; snapshot = null; return { rowCount: 0, rows: [] }; }
    if (sql === 'COMMIT') { snapshot = null; return { rowCount: 0, rows: [] }; }
    if (sql.startsWith('SELECT * FROM tools')) return { rowCount: 1, rows: [structuredClone(row)] };
    if (sql.startsWith('UPDATE tools SET')) {
      assert.equal(params?.[0], pack.toolId);
      assert.deepEqual(JSON.parse(params?.[2]), row.features);
      row = { ...row, features: { ...row.features, marketValidation: JSON.parse(params?.[1]) },
        updated_at: '2026-10-13T06:00:00.000Z' };
      writes += 1;
      return { rowCount: 1, rows: [structuredClone(row)] };
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  }, release: () => undefined } as unknown as PoolClient;
  return { deps: { connect: async () => client, assertReviewer: async (id: string) => assert.equal(id, owner) },
    getRow: () => row, getWrites: () => writes };
}

async function main() {
  const v0 = await fixture('v0');
  const sci = await fixture('scispace');
  await assert.rejects(run(v0, parseOptions(['--mode=preflight']), mockDb(v0, v0.officialUrl).deps,
    { OPS2_INTERNAL_PREPARATION_AUTHORIZATION: 'internal-only' } as NodeJS.ProcessEnv),
  /requires independent QA/);
  assert.equal(v0.score, 81);
  assert.equal(sci.score, 77);
  const unsignedV0 = { ...v0, qaReport: null } satisfies MarketPack;
  assert.throws(() => parseMarketPack({ ...v0, evidenceUrls: [v0.evidenceUrls[0],
    'https://blog.producthunt.com/extra'] }), /different registrable domains/);
  assert.throws(() => parseMarketPack({ ...v0, evidenceUrls: [v0.evidenceUrls[0],
    'https://vercel.com/blog/v0'], sourceNotes: [v0.sourceNotes[0],
    { ...v0.sourceNotes[1], url: 'https://vercel.com/blog/v0' }] }), /Vendor domain/);
  assert.throws(() => parseMarketPack({ ...v0, sourceNotes: [v0.sourceNotes[0], v0.sourceNotes[0]] }),
    /exactly once/);
  assert.throws(() => parseMarketPack({ ...v0, score: 74 }), /75-100/);
  assert.throws(() => parseMarketPack({ ...v0, developmentActor: 'unidentified' }),
    /development actor/);
  assert.throws(() => parseMarketPack({ ...v0, sourceNotes: undefined }),
    /source note/);
  assert.throws(() => validateQa(unsignedV0, owner, qaActor), /report required/);
  const selfReviewed = qaPack({ ...v0, developmentActor: qaActor });
  assert.throws(() => validateQa(selfReviewed, owner, qaActor),
    /Development actor cannot approve/);
  assert.throws(() => validateQa({ ...qaPack(v0), developmentActor: 'unknown' }, owner, qaActor),
    /development actor/);
  assert.notEqual(packHash(v0), packHash({ ...v0, developmentActor: qaActor }),
    'Development actor must be bound by the pack hash');
  assert.throws(() => parseOptions(['--mode=commit']), /64/);

  const pack = qaPack(v0);
  const db = mockDb(pack, 'https://v0.app/');
  const pre = await run(pack, { mode: 'preflight' }, db.deps);
  const preimageHash = pre.preimageHash!;
  const env = { OPS2_REVIEWER_ID: owner, OPS2_QA_REFERENCE: qaActor,
    OPS2_ROLLBACK_HASH: preimageHash,
    OPS2_MARKET_AUTHORIZATION: `market:${pack.toolId}:${packHash(pack)}:${preimageHash}:${owner}:${pack.developmentActor}:${qaActor}:${hash(pack.qaReport)}` };
  assert.equal(db.getWrites(), 0);
  assert.throws(() => assertApproval(pack, preimageHash, { ...env, OPS2_MARKET_AUTHORIZATION: 'wrong' }),
    /authorization/);
  const rollback = await run(pack, { mode: 'rollback', expectedHash: preimageHash }, db.deps, env);
  assert.equal(rollback.productionWrites, 0);
  assert.equal(db.getRow().features.marketValidation, undefined);
  assert.equal(protectedHash(db.getRow()), pre.protectedHash);
  const committed = await run(pack, { mode: 'commit', expectedHash: preimageHash }, db.deps, env);
  assert.equal(committed.productionWrites, 1);
  assert.equal(db.getRow().features.marketValidation.score, 81);
  assert.deepEqual(db.getRow().features.marketValidation.sourceNotes, pack.sourceNotes);
  assert.equal(db.getRow().features.marketValidation.ops2MarketAudit.developmentActor,
    pack.developmentActor);
  const checked = await run(pack, { mode: 'postcheck', expectedHash: preimageHash,
    expectedPostHash: committed.postimageHash }, db.deps, env);
  assert.equal(checked.productionWrites, 0);
  assert.equal(db.getRow().page_quality_status, 'monitor');
  const originalSourceNotes = structuredClone(db.getRow().features.marketValidation.sourceNotes);
  delete db.getRow().features.marketValidation.sourceNotes;
  await assert.rejects(() => run(pack, { mode: 'postcheck', expectedHash: preimageHash,
    expectedPostHash: committed.postimageHash }, db.deps, env));
  db.getRow().features.marketValidation.sourceNotes = originalSourceNotes;
  db.getRow().features.marketValidation.sourceNotes[0].signal = 'drifted';
  await assert.rejects(() => run(pack, { mode: 'postcheck', expectedHash: preimageHash,
    expectedPostHash: committed.postimageHash }, db.deps, env));
  db.getRow().features.marketValidation.sourceNotes = originalSourceNotes;
  db.getRow().content.en = 'unexpected';
  await assert.rejects(() => run(pack, { mode: 'postcheck', expectedHash: preimageHash,
    expectedPostHash: committed.postimageHash }, db.deps, env), /Protected tool fields changed/);
  const vendorDb = mockDb(sci, 'https://producthunt.com/products/typeset');
  await assert.rejects(() => run(sci, { mode: 'preflight' }, vendorDb.deps), /canonical vendor domain/);
  console.log('OPS2 market validation: PASS (pack sources, QA scope, rollback, commit, drift gate)');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

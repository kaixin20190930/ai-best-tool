import assert from 'node:assert/strict';
import type { PoolClient } from 'pg';

import { parseOptions, run, type ToolLineDependencies } from './run-ops2-publish-bridge';

const candidateId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const toolId = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const qaReference = 'codex-thread:01a13034-b928-7f63-888f-8bbb3846e78d';
const nextReview = '2026-11-12';
const envKeys = ['OPS2_REVIEWER_ID', 'OPS2_QA_REFERENCE', 'OPS2_PUBLISH_AUTHORIZATION', 'OPS2_ROLLBACK_HASH'] as const;
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

type State = { candidate: Record<string, any>; tool: Record<string, any> | null };

function fixture(kind: 'candidate' | 'tool') {
  let state: State = {
    candidate: { id: candidateId, status: 'new', tool_id: null, normalized_url: 'https://example.com/tool', raw_payload: {} },
    tool: kind === 'tool' ? { id: toolId, status: 'draft', page_quality_status: 'monitor',
      name: 'Example', url: 'https://example.com/tool', next_review_date: nextReview, features: {} } : null,
  };
  let saved: State | null = null;
  const calls: string[] = [];
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
  const query = async (sql: string, params: any[] = []) => {
    calls.push(sql.trim().replace(/\s+/g, ' '));
    if (sql === 'BEGIN') { saved = clone(state); return { rows: [], rowCount: null }; }
    if (sql === 'ROLLBACK') { if (saved) state = saved; saved = null; return { rows: [], rowCount: null }; }
    if (sql === 'COMMIT') { saved = null; return { rows: [], rowCount: null }; }
    if (/^SELECT \* FROM collection_candidates/.test(sql)) return { rows: [clone(state.candidate)], rowCount: 1 };
    if (/^SELECT id,status FROM tools/.test(sql) || /^SELECT \* FROM tools/.test(sql)) {
      const rows = state.tool && state.tool.id === params[0] ? [clone(state.tool)] : [];
      return { rows, rowCount: rows.length };
    }
    if (/^SELECT id,name,url FROM tools WHERE id <>/.test(sql)) return { rows: [], rowCount: 0 };
    if (/^UPDATE collection_candidates/.test(sql)) {
      assert.equal(state.candidate.status, 'imported');
      assert.equal(state.candidate.tool_id, params[4]);
      state.candidate.raw_payload.ops2PublicationBridge = {
        preimageHash: params[1], qaReference: params[2], reviewer: params[3],
      };
      return { rows: [], rowCount: 1 };
    }
    if (/^UPDATE tools/.test(sql.trim())) {
      assert.equal(state.tool?.status, 'draft');
      assert.deepEqual(params[0], [toolId]);
      state.tool = { ...state.tool!, status: 'published', page_quality_status: 'monitor',
        next_review_date: nextReview,
        features: { submission: { review: { publishMode: 'monitor_noindex', reviewer: params[1],
          qaReference: params[2], preimageHash: params[3], nextReviewDate: nextReview } } } };
      return { rows: [{ name: state.tool.name }], rowCount: 1 };
    }
    throw new Error('Unexpected mock query');
  };
  const client = { query, release: () => { calls.push('RELEASE'); } } as unknown as PoolClient;
  const deps: ToolLineDependencies = {
    connect: async () => client,
    assertReviewer: async (reviewer) => { assert.equal(reviewer, toolId); calls.push('ADMIN_CHECK'); },
    importCandidate: async (id, passedClient) => {
      assert.equal(id, candidateId);
      assert.equal(passedClient, client);
      calls.push('IMPORT');
      state.candidate = { ...state.candidate, status: 'imported', tool_id: toolId };
      state.tool = { id: toolId, status: 'draft', name: 'Example', url: 'https://example.com/tool' };
      return { toolId };
    },
    checkToolReady: async (passedClient, row) => {
      assert.equal(passedClient, client);
      assert.equal(row.id, toolId);
      calls.push('READY_CHECK');
      return [];
    },
  };
  return { deps, calls, get state() { return clone(state); }, tamperAudit() {
    if (kind === 'candidate') state.candidate.raw_payload.ops2PublicationBridge.qaReference = 'tampered';
    else state.tool!.features.submission.review.qaReference = 'tampered';
  } };
}

function options(kind: 'candidate' | 'tool', mode: 'preflight' | 'rollback' | 'commit' | 'postcheck', hash?: string) {
  return parseOptions([`--kind=${kind}`, `--mode=${mode}`, `--id=${kind === 'candidate' ? candidateId : toolId}`,
    ...(hash ? [`--expected-hash=${hash}`] : [])]);
}

function authorize(kind: 'candidate' | 'tool', hash: string) {
  process.env.OPS2_REVIEWER_ID = toolId;
  process.env.OPS2_QA_REFERENCE = qaReference;
  process.env.OPS2_ROLLBACK_HASH = hash;
  process.env.OPS2_PUBLISH_AUTHORIZATION = `${kind}:${kind === 'candidate' ? candidateId : toolId}:${hash}`;
}

function writes(calls: string[]) {
  return calls.filter((call) => call === 'IMPORT' || /^UPDATE /.test(call));
}

async function exercise(kind: 'candidate' | 'tool') {
  const object = fixture(kind);
  const before = object.state;
  const preflight = await run(options(kind, 'preflight'), object.deps);
  assert.equal(preflight.productionWrites, 0);
  assert.deepEqual(object.state, before);
  assert.deepEqual(writes(object.calls), []);
  assert.ok(!object.calls.includes('BEGIN'));
  authorize(kind, preflight.preimageHash!);

  object.calls.length = 0;
  const rollback = await run(options(kind, 'rollback', preflight.preimageHash), object.deps);
  assert.equal(rollback.productionWrites, 0);
  assert.deepEqual(object.state, before);
  assert.equal(object.calls[0], 'BEGIN');
  assert.ok(object.calls.includes('ROLLBACK'));
  assert.ok(!object.calls.includes('COMMIT'));

  object.calls.length = 0;
  delete process.env.OPS2_PUBLISH_AUTHORIZATION;
  await assert.rejects(run(options(kind, 'commit', preflight.preimageHash), object.deps));
  assert.deepEqual(writes(object.calls), []);
  assert.deepEqual(object.state, before);
  assert.ok(!object.calls.includes('COMMIT'));
  authorize(kind, preflight.preimageHash!);
  object.calls.length = 0;
  process.env.OPS2_PUBLISH_AUTHORIZATION = 'wrong-scope';
  await assert.rejects(run(options(kind, 'commit', preflight.preimageHash), object.deps));
  assert.deepEqual(writes(object.calls), []);
  assert.deepEqual(object.state, before);
  authorize(kind, preflight.preimageHash!);

  object.calls.length = 0;
  const committed = await run(options(kind, 'commit', preflight.preimageHash), object.deps);
  assert.ok(committed.productionWrites > 0);
  assert.ok(object.calls.includes('COMMIT'));
  const committedState = object.state;
  const writeCount = writes(object.calls).length;
  assert.ok(writeCount > 0);

  object.calls.length = 0;
  const repeat = await run(options(kind, 'commit', preflight.preimageHash), object.deps);
  assert.equal(repeat.alreadyApplied, true);
  assert.equal(repeat.productionWrites, 0);
  assert.deepEqual(writes(object.calls), []);
  assert.deepEqual(object.state, committedState);

  const postcheck = await run(options(kind, 'postcheck', preflight.preimageHash), object.deps);
  assert.equal(postcheck.productionWrites, 0);
  await assert.rejects(run(options(kind, 'postcheck', '0'.repeat(64)), object.deps));
  assert.deepEqual(object.state, committedState);
  assert.deepEqual(writes(object.calls), []);
  object.tamperAudit();
  await assert.rejects(run(options(kind, 'postcheck', preflight.preimageHash), object.deps));
  assert.deepEqual(writes(object.calls), []);
}

async function main() {
  try {
    await exercise('candidate');
    await exercise('tool');
    console.log('OPS2 tool-line behavior mocks passed without a database');
  } finally {
    for (const key of envKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

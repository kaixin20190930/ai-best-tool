import assert from 'node:assert/strict';
import type { PoolClient } from 'pg';

import { parseOptions, run, type ToolLineDependencies } from './run-ops2-publish-bridge';

const candidateId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const toolId = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const qaReference = 'codex-thread:01a13034-b928-7f63-888f-8bbb3846e78d';
const nextReview = '2026-11-12';
const envKeys = ['OPS2_REVIEWER_ID', 'OPS2_QA_REFERENCE', 'OPS2_PUBLISH_AUTHORIZATION', 'OPS2_ROLLBACK_HASH',
  'OPS2_INTERNAL_PREPARATION_AUTHORIZATION', 'OPS2_QA_REPORT'] as const;
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
    if (/^SELECT id,status FROM tools/.test(sql) || /^SELECT \*, next_review_date::text AS next_review_date_db_text/.test(sql)) {
      const rows = state.tool && state.tool.id === params[0] ? [clone(state.tool)] : [];
      if (rows.length && sql.includes('next_review_date_db_text')) {
        rows[0].next_review_date_db_text = nextReview;
      }
      return { rows, rowCount: rows.length };
    }
    if (/^SELECT id,name,url FROM tools WHERE id <>/.test(sql)) return { rows: [], rowCount: 0 };
    if (/^SELECT pg_advisory_xact_lock/.test(sql)) return { rows: [{}], rowCount: 1 };
    if (/^SELECT id FROM collection_candidates\s+WHERE raw_payload/.test(sql)) {
      const used = [state.candidate.raw_payload.ops2EnqueueAudit?.internalPreparationNonce,
        state.candidate.raw_payload.ops2PublicationBridge?.internalPreparationNonce].includes(params[0]);
      return { rows: used ? [{ id: candidateId }] : [], rowCount: used ? 1 : 0 };
    }
    if (/^UPDATE collection_candidates/.test(sql)) {
      assert.equal(state.candidate.status, 'imported');
      assert.equal(state.candidate.tool_id, params[2]);
      state.candidate.raw_payload.ops2PublicationBridge = JSON.parse(params[1]);
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
  delete process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION;
  process.env.OPS2_REVIEWER_ID = toolId;
  process.env.OPS2_QA_REFERENCE = qaReference;
  process.env.OPS2_ROLLBACK_HASH = hash;
  process.env.OPS2_PUBLISH_AUTHORIZATION = `${kind}:${kind === 'candidate' ? candidateId : toolId}:${hash}`;
}

async function exerciseInternalCandidate() {
  const object = fixture('candidate');
  const before = await run(options('candidate', 'preflight'), object.deps);
  const hash = before.preimageHash!;
  process.env.OPS2_REVIEWER_ID = toolId;
  process.env.OPS2_ROLLBACK_HASH = hash;
  delete process.env.OPS2_QA_REFERENCE;
  delete process.env.OPS2_QA_REPORT;
  delete process.env.OPS2_PUBLISH_AUTHORIZATION;
  const nonce = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const token = `candidate:${candidateId}:${hash}:${toolId}:${nonce}`;
  process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION = token;
  const commit = options('candidate', 'commit', hash);
  delete process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION;
  await assert.rejects(run(commit, object.deps));
  process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION = token;
  delete process.env.OPS2_ROLLBACK_HASH;
  await assert.rejects(run(commit, object.deps), /rollback/);
  process.env.OPS2_ROLLBACK_HASH = hash;
  delete process.env.OPS2_REVIEWER_ID;
  await assert.rejects(run(commit, object.deps), /reviewer/);
  process.env.OPS2_REVIEWER_ID = toolId;
  await assert.rejects(run(options('candidate', 'commit', '0'.repeat(64)), object.deps), /[Pp]reimage|rollback/);
  process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION = `candidate:${candidateId}:${'0'.repeat(64)}:${toolId}:${nonce}`;
  await assert.rejects(run(commit, object.deps), /authorization/);
  process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION = token;
  const result = await run(commit, object.deps);
  assert.equal(result.status, 'draft');
  assert.equal(object.state.candidate.raw_payload.ops2PublicationBridge.reviewMode, 'internal_preparation');
  assert.equal(object.state.candidate.raw_payload.ops2PublicationBridge.qaReference, undefined);
  assert.equal((await run(options('candidate', 'postcheck', hash), object.deps)).productionWrites, 0);
  assert.equal((await run(commit, object.deps)).productionWrites, 0);
  await assert.rejects(run(options('tool', 'preflight'), object.deps), /limited to candidate/);
  await assert.rejects(run(options('tool', 'commit', hash), object.deps), /limited to candidate/);
  await assert.rejects(run(parseOptions(['--kind=relation', '--mode=preflight', `--id=${toolId}`]), object.deps),
    /limited to candidate/);
  await assert.rejects(run(parseOptions(['--kind=relation', '--mode=commit', `--id=${toolId}`,
    `--expected-hash=${hash}`]), object.deps), /limited to candidate/);
  delete process.env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION;
  await assert.rejects(run(commit, object.deps), /original review mode/);
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
    await exerciseInternalCandidate();
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

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { Client, type PoolClient } from 'pg';

import { getPool } from '../db/neon/client';
import { isAdminUser } from '../lib/auth/admin';
import { evidenceReadyDraftSql } from '../lib/services/admin/draftPublicationSql';
import { importCollectionCandidateToDraft } from '../lib/services/admin/collection';
import { buildReadyDraftMonitorPublishSql, getMonitorPublicationBlockers } from '../lib/services/admin/submissionPublication';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

type Kind = 'candidate' | 'tool' | 'relation';
type Mode = 'preflight' | 'rollback' | 'commit' | 'postcheck';
type Options = { kind: Kind; mode: Mode; id: string; expectedHash?: string };
type Row = Record<string, any>;
export type ToolLineDependencies = {
  connect: () => Promise<PoolClient>;
  assertReviewer: (id: string) => Promise<void>;
  importCandidate: typeof importCollectionCandidateToDraft;
  checkToolReady: typeof preflightTool;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const researchSlug = 'research-with-citations';

export function parseOptions(args: string[]): Options {
  const values = new Map<string, string>();
  for (const arg of args) {
    const match = /^--(kind|mode|id|expected-hash)=([^\s]+)$/.exec(arg);
    if (!match) throw new Error('INVALID_ARGUMENT');
    assert.ok(!values.has(match[1]), `Duplicate --${match[1]}`);
    values.set(match[1], match[2]);
  }
  const kind = values.get('kind');
  const mode = values.get('mode');
  const id = values.get('id');
  assert.ok(kind === 'candidate' || kind === 'tool' || kind === 'relation');
  assert.ok(mode === 'preflight' || mode === 'rollback' || mode === 'commit' || mode === 'postcheck');
  if (!uuid.test(id || '')) throw new Error('INVALID_ID');
  const expectedHash = values.get('expected-hash');
  if (mode !== 'preflight' && !/^[a-f0-9]{64}$/.test(expectedHash || ''))
    throw new Error('INVALID_EXPECTED_HASH');
  return { kind, mode, id: id!, expectedHash };
}

export function snapshotHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function assertReviewScope(options: Options, currentHash: string, env = process.env) {
  assert.equal(options.expectedHash, currentHash, 'Preimage changed after preflight');
  assert.match(env.OPS2_REVIEWER_ID || '', uuid, 'A real reviewer UUID is required');
}

export function assertCommitScope(options: Options, currentHash: string, env = process.env) {
  assertReviewScope(options, currentHash, env);
  assert.match(env.OPS2_QA_REFERENCE || '', /^codex-thread:[0-9a-f-]{36}$/i,
    'Independent QA thread reference is required');
  assert.equal(env.OPS2_PUBLISH_AUTHORIZATION, `${options.kind}:${options.id}:${currentHash}`,
    'Exact one-object OPS2_PUBLISH_AUTHORIZATION is required');
  assert.equal(env.OPS2_ROLLBACK_HASH, currentHash, 'Matching rollback rehearsal hash is required');
}

async function assertAdminReviewer(reviewerId: string) {
  const { data, error } = await createAdminClient().auth.admin.getUserById(reviewerId);
  if (error) throw new Error(error.message);
  assert.ok(isAdminUser(data.user), 'Reviewer is not an approved administrator');
}

function toolFingerprint(row: Row) {
  return {
    id: row.id, name: row.name, url: row.url, status: row.status,
    page_quality_status: row.page_quality_status, next_review_date: row.next_review_date,
    category_id: row.category_id, image_url: row.image_url, thumbnail_url: row.thumbnail_url,
    content: row.content, detail: row.detail, pricing: row.pricing, tags: row.tags,
    features: row.features, updated_at: row.updated_at,
  };
}

function normalizedUrl(value: string): string {
  const url = new URL(value);
  assert.ok(['https:', 'http:'].includes(url.protocol), 'Official URL must use HTTP(S)');
  return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
}

async function assertUniqueIdentity(client: PoolClient, row: Row) {
  const rows = await client.query('SELECT id,name,url FROM tools WHERE id <> $1', [row.id]);
  const target = normalizedUrl(row.url);
  const duplicate = rows.rows.find((other) => {
    if (other.name?.toLowerCase() === row.name?.toLowerCase()) return true;
    try { return Boolean(other.url) && normalizedUrl(other.url) === target; }
    catch { return false; }
  });
  assert.ok(!duplicate, `Duplicate tool identity: ${duplicate?.id}`);
}

async function readCandidate(client: PoolClient, id: string, lock = false) {
  const result = await client.query(`SELECT * FROM collection_candidates WHERE id = $1${lock ? ' FOR UPDATE' : ''}`, [id]);
  assert.equal(result.rows.length, 1, 'Candidate not found');
  return result.rows[0] as Row;
}

export function assertCandidateAudit(candidate: Row, tool: Row | undefined, hash: string, env = process.env) {
  const audit = candidate.raw_payload?.ops2PublicationBridge;
  assert.equal(candidate.status, 'imported');
  assert.equal(candidate.tool_id, tool?.id);
  assert.equal(tool?.status, 'draft');
  assert.equal(audit?.preimageHash, hash);
  assert.equal(audit?.qaReference, env.OPS2_QA_REFERENCE);
  assert.equal(audit?.reviewer, env.OPS2_REVIEWER_ID);
}

export function assertToolAudit(row: Row, hash: string, env = process.env) {
  const review = row.features?.submission?.review;
  const index = getToolIndexDecision({ status: row.status, pageQualityStatus: row.page_quality_status,
    categoryId: row.category_id, imageUrl: row.image_url, thumbnailUrl: row.thumbnail_url,
    content: row.content, detail: row.detail, pricing: row.pricing, tags: row.tags });
  assert.equal(row.status, 'published');
  assert.equal(row.page_quality_status, 'monitor');
  assert.equal(index.indexable, false);
  assert.equal(review?.publishMode, 'monitor_noindex');
  assert.equal(review?.preimageHash, hash);
  assert.equal(review?.qaReference, env.OPS2_QA_REFERENCE);
  assert.equal(review?.reviewer, env.OPS2_REVIEWER_ID);
  const date = row.next_review_date instanceof Date ? row.next_review_date.toISOString().slice(0, 10)
    : String(row.next_review_date || '').slice(0, 10);
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(review?.nextReviewDate, date);
}

export function assertRelationAudit(manifest: Row, audit: Row, reviewer: string, hash: string, env = process.env) {
  assert.equal(audit.qaReference, env.OPS2_QA_REFERENCE);
  assert.equal(reviewer, env.OPS2_REVIEWER_ID);
  assert.equal(audit.taskId, manifest.taskId);
  assert.equal(audit.toolId, manifest.toolId);
  assert.equal(snapshotHash({ taskId: audit.taskId, toolId: audit.toolId,
    toolCapabilities: audit.toolCapabilities, fits: audit.fits }), hash);
  for (const key of ['toolCapabilities', 'fits']) {
    const current = manifest[key] as Row[];
    const approved = audit[key] as Row[];
    assert.equal(current.length, key === 'fits' ? 1 : 2);
    assert.equal(approved?.length, current.length);
    for (let i = 0; i < current.length; i++) {
      assert.equal(current[i].id, approved[i].id);
      assert.equal(approved[i].status, 'reviewed');
      assert.equal(current[i].status, 'published');
      assert.equal(current[i].last_edited_by, reviewer);
      assert.ok(Date.parse(current[i].updated_at) >= Date.parse(approved[i].updated_at),
        'Published relation timestamp predates approved preimage');
    }
  }
}

async function readTool(client: PoolClient, id: string, lock = false) {
  const result = await client.query(`SELECT * FROM tools WHERE id = $1${lock ? ' FOR UPDATE' : ''}`, [id]);
  assert.equal(result.rows.length, 1, 'Tool not found');
  return result.rows[0] as Row;
}

async function preflightTool(client: PoolClient, row: Row) {
  await assertUniqueIdentity(client, row);
  const blockers = getMonitorPublicationBlockers(row);
  const eligible = await client.query(`SELECT 1 FROM tools WHERE id = $1 AND ${evidenceReadyDraftSql}`, [row.id]);
  if (!eligible.rowCount) blockers.push('Evidence-ready draft predicate');
  return [...new Set(blockers)];
}

const productionToolLineDependencies: ToolLineDependencies = {
  connect: () => getPool().connect(),
  assertReviewer: assertAdminReviewer,
  importCandidate: importCollectionCandidateToDraft,
  checkToolReady: preflightTool,
};

async function runCandidate(options: Options, deps: ToolLineDependencies) {
  const client = await deps.connect();
  let transaction = false;
  try {
    if (options.mode === 'rollback' || options.mode === 'commit') {
      await client.query('BEGIN');
      transaction = true;
    }
    const candidate = await readCandidate(client, options.id, transaction);
    const hash = snapshotHash(candidate);
    const existingTool = candidate.tool_id
      ? await client.query(`SELECT id,status FROM tools WHERE id = $1${transaction ? ' FOR UPDATE' : ''}`, [candidate.tool_id]) : null;
    const alreadyApplied = candidate.status === 'imported' && existingTool?.rowCount === 1;
    if (options.mode === 'postcheck') {
      assertCandidateAudit(candidate, existingTool?.rows[0], options.expectedHash!, process.env);
      return { kind: options.kind, mode: options.mode, id: options.id, toolId: candidate.tool_id,
        toolStatus: existingTool?.rows[0]?.status, auditHash: options.expectedHash, productionWrites: 0 };
    }
    assert.ok(candidate.normalized_url, 'Candidate URL is missing');
    normalizedUrl(candidate.normalized_url);
    if (alreadyApplied && (options.mode === 'commit' || options.mode === 'rollback')) {
      if (options.mode === 'commit') assertCommitScope(options, options.expectedHash!, process.env);
      else assertReviewScope(options, options.expectedHash!, process.env);
      assertCandidateAudit(candidate, existingTool?.rows[0], options.expectedHash!, process.env);
    }
    if (!alreadyApplied) {
      assert.equal(candidate.status, 'new', 'Candidate is no longer importable');
      assert.equal(candidate.tool_id, null, 'Candidate already links to a tool');
    }
    if (options.mode === 'preflight' || alreadyApplied) {
      return { kind: options.kind, mode: options.mode, id: options.id, preimageHash: hash,
        alreadyApplied, toolId: candidate.tool_id || null, productionWrites: 0 };
    }
    if (options.mode === 'commit') assertCommitScope(options, hash);
    else assertReviewScope(options, hash);
    await deps.assertReviewer(process.env.OPS2_REVIEWER_ID!);
    const imported = await deps.importCandidate(options.id, client);
    const draft = await readTool(client, imported.toolId);
    assert.equal(draft.status, 'draft', 'Candidate import must not publish a tool');
    await assertUniqueIdentity(client, draft);
    const auditUpdate = await client.query(`UPDATE collection_candidates
      SET raw_payload = COALESCE(raw_payload, '{}'::jsonb) || jsonb_build_object('ops2PublicationBridge',
        jsonb_build_object('preimageHash',$2::text,'qaReference',$3::text,'reviewer',$4::text))
      WHERE id = $1 AND status = 'imported' AND tool_id = $5`,
    [options.id, hash, process.env.OPS2_QA_REFERENCE || 'rollback-preview', process.env.OPS2_REVIEWER_ID, imported.toolId]);
    assert.equal(auditUpdate.rowCount, 1, 'Candidate changed during import');
    const afterCandidate = await readCandidate(client, options.id);
    assertCandidateAudit(afterCandidate, draft, hash, {
      OPS2_QA_REFERENCE: process.env.OPS2_QA_REFERENCE || 'rollback-preview',
      OPS2_REVIEWER_ID: process.env.OPS2_REVIEWER_ID,
    });
    if (options.mode === 'rollback') {
      await client.query('ROLLBACK');
      transaction = false;
      return { kind: options.kind, mode: options.mode, id: options.id, proposedToolId: imported.toolId, productionWrites: 0 };
    }
    await client.query('COMMIT');
    transaction = false;
    return { kind: options.kind, mode: options.mode, id: options.id, toolId: imported.toolId,
      status: 'draft', productionWrites: 3 };
  } finally {
    if (transaction) await client.query('ROLLBACK').catch(() => undefined);
    client.release();
  }
}

async function runTool(options: Options, deps: ToolLineDependencies) {
  const client = await deps.connect();
  let transaction = false;
  try {
    if (options.mode === 'rollback' || options.mode === 'commit') {
      await client.query('BEGIN');
      transaction = true;
    }
    const row = await readTool(client, options.id, transaction);
    const hash = snapshotHash(toolFingerprint(row));
    if (options.mode === 'postcheck') {
      assertToolAudit(row, options.expectedHash!, process.env);
      return { kind: options.kind, mode: options.mode, id: options.id, indexable: false, productionWrites: 0 };
    }
    if (row.status === 'published' && row.page_quality_status === 'monitor') {
      if (options.mode === 'commit') {
        assertCommitScope(options, options.expectedHash!);
        assertToolAudit(row, options.expectedHash!, process.env);
      } else if (options.mode === 'rollback') {
        assertReviewScope(options, options.expectedHash!, process.env);
        assertToolAudit(row, options.expectedHash!, process.env);
      }
      return { kind: options.kind, mode: options.mode, id: options.id, alreadyApplied: true, productionWrites: 0 };
    }
    assert.equal(row.status, 'draft', 'Only existing draft tools can use this bridge');
    const blockers = await deps.checkToolReady(client, row);
    if (options.mode === 'preflight') {
      return { kind: options.kind, mode: options.mode, id: options.id, preimageHash: hash,
        blockers, ready: blockers.length === 0, productionWrites: 0 };
    }
    assert.deepEqual(blockers, [], 'Draft publication gate failed');
    if (options.mode === 'commit') assertCommitScope(options, hash);
    else assertReviewScope(options, hash);
    await deps.assertReviewer(process.env.OPS2_REVIEWER_ID!);
    const published = await client.query(buildReadyDraftMonitorPublishSql(evidenceReadyDraftSql, true), [
      [options.id], process.env.OPS2_REVIEWER_ID, process.env.OPS2_QA_REFERENCE || 'rollback-preview', hash,
    ]);
    assert.equal(published.rowCount, 1, 'Draft changed or generic publication gate failed');
    const after = await readTool(client, options.id);
    assert.equal(after.status, 'published');
    assert.equal(after.page_quality_status, 'monitor');
    assertToolAudit(after, hash, { OPS2_QA_REFERENCE: process.env.OPS2_QA_REFERENCE || 'rollback-preview',
      OPS2_REVIEWER_ID: process.env.OPS2_REVIEWER_ID });
    if (options.mode === 'rollback') {
      await client.query('ROLLBACK');
      transaction = false;
      return { kind: options.kind, mode: options.mode, id: options.id, proposedStatus: 'published+monitor', productionWrites: 0 };
    }
    await client.query('COMMIT');
    transaction = false;
    return { kind: options.kind, mode: options.mode, id: options.id, status: 'published+monitor',
      indexable: false, productionWrites: 1 };
  } finally {
    if (transaction) await client.query('ROLLBACK').catch(() => undefined);
    client.release();
  }
}

async function readRelationGroup(toolId: string) {
  const db = createAdminClient();
  const task = await db.from('decision_tasks').select('id,slug,status').eq('slug', researchSlug);
  if (task.error) throw new Error(task.error.message);
  assert.equal(task.data?.length, 1);
  assert.equal(task.data[0].status, 'active');
  const taskId = task.data[0].id;
  const taskCaps = await db.from('task_capabilities').select('capability_id,status').eq('task_id', taskId);
  const caps = await db.from('tool_capabilities').select('id,capability_id,tool_id,status,updated_at,last_edited_by').eq('tool_id', toolId);
  const fits = await db.from('tool_task_fits').select('id,task_id,tool_id,status,updated_at,last_edited_by').eq('task_id', taskId).eq('tool_id', toolId);
  for (const result of [taskCaps, caps, fits]) if (result.error) throw new Error(result.error.message);
  const selected = (caps.data || []).filter((cap) => (taskCaps.data || []).some((taskCap) => taskCap.capability_id === cap.capability_id));
  assert.equal(selected.length, 2, 'Expected exact reviewed Research Tool Capability pair');
  assert.equal(fits.data?.length, 1, 'Expected one exact reviewed Research Fit');
  const manifest = {
    taskId, toolId,
    toolCapabilities: selected.map((cap) => ({ id: cap.id, updated_at: cap.updated_at, status: cap.status,
      ...(cap.status === 'published' ? { last_edited_by: cap.last_edited_by } : {}) }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    fits: (fits.data || []).map((fit) => ({ id: fit.id, updated_at: fit.updated_at, status: fit.status,
      ...(fit.status === 'published' ? { last_edited_by: fit.last_edited_by } : {}) }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
  return { db, manifest, hash: snapshotHash(manifest) };
}

async function runRelation(options: Options) {
  const { db, manifest, hash } = await readRelationGroup(options.id);
  const published = [...manifest.toolCapabilities, ...manifest.fits].every((row) => row.status === 'published');
  if (published) {
    const events = await db.from('product_intelligence_timeline_events').select('metadata,verified_by')
      .eq('event_type', 'decision_publication').eq('claim_key', manifest.taskId)
      .contains('metadata', { toolId: options.id }).order('occurred_at', { ascending: false }).limit(1);
    if (events.error) throw new Error(events.error.message);
    const audit = events.data?.[0]?.metadata as Row | undefined;
    assert.ok(audit, 'Published relation group lacks a matching audit event');
    const approvedHash = snapshotHash({ taskId: manifest.taskId, toolId: options.id,
      toolCapabilities: audit.toolCapabilities, fits: audit.fits });
    if (options.mode === 'postcheck' || options.mode === 'commit') {
      assert.equal(options.expectedHash, approvedHash);
      assertRelationAudit(manifest, audit, events.data?.[0]?.verified_by, approvedHash, process.env);
    }
    if (options.mode === 'commit') {
      assertCommitScope(options, approvedHash);
    }
    return { kind: options.kind, mode: options.mode, id: options.id,
      alreadyApplied: options.mode !== 'postcheck', relationCount: 3, auditHash: approvedHash, productionWrites: 0 };
  }
  if (options.mode === 'postcheck') throw new Error('Exact Research relation group is not published');
  assert.ok([...manifest.toolCapabilities, ...manifest.fits].every((row) => row.status === 'reviewed'),
    'Mixed or non-reviewed Research relation state');
  const reviewer = process.env.OPS2_REVIEWER_ID || '';
  assert.match(reviewer, uuid, 'Relation RPC requires a real reviewer UUID');
  await assertAdminReviewer(reviewer);
  const params = {
    p_task_id: manifest.taskId, p_tool_id: options.id,
    p_tool_capabilities: manifest.toolCapabilities, p_fits: manifest.fits,
    p_reviewer: reviewer, p_qa_reference: process.env.OPS2_QA_REFERENCE || '', p_preflight: true,
  };
  const preflight = await db.rpc('admin_publish_reviewed_task_tool_group', params);
  if (preflight.error) throw new Error(preflight.error.message);
  assert.equal((preflight.data as Row)?.ok, true);
  if (options.mode === 'preflight') {
    return { kind: options.kind, mode: options.mode, id: options.id, preimageHash: hash,
      manifest, evidenceCount: (preflight.data as Row)?.evidence?.length || 0, productionWrites: 0 };
  }
  if (options.mode === 'commit') assertCommitScope(options, hash);
  else assertReviewScope(options, hash);
  if (options.mode === 'rollback') {
    assert.ok(process.env.SUPABASE_DB_URL, 'Transactional relation rollback requires SUPABASE_DB_URL');
    const client = new Client({ connectionString: process.env.SUPABASE_DB_URL });
    await client.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('request.jwt.claim.role','service_role',true)");
      const result = await client.query(
        'SELECT public.admin_publish_reviewed_task_tool_group($1,$2,$3::jsonb,$4::jsonb,$5,$6,false) AS value',
        [manifest.taskId, options.id, JSON.stringify(manifest.toolCapabilities), JSON.stringify(manifest.fits),
          reviewer, process.env.OPS2_QA_REFERENCE || 'rollback-preview'],
      );
      assert.equal(result.rows[0]?.value?.ok, true);
      await client.query('ROLLBACK');
      return { kind: options.kind, mode: options.mode, id: options.id, proposedRelations: 3, productionWrites: 0 };
    } finally {
      await client.query('ROLLBACK').catch(() => undefined);
      await client.end();
    }
  }
  const committed = await db.rpc('admin_publish_reviewed_task_tool_group', { ...params, p_preflight: false });
  if (committed.error) throw new Error(committed.error.message);
  assert.equal((committed.data as Row)?.ok, true);
  return { kind: options.kind, mode: options.mode, id: options.id,
    unchanged: (committed.data as Row)?.unchanged === true,
    productionWrites: (committed.data as Row)?.unchanged === true ? 0 : 4 };
}

export async function run(options: Options, deps = productionToolLineDependencies) {
  if (options.kind === 'candidate') return runCandidate(options, deps);
  if (options.kind === 'tool') return runTool(options, deps);
  return runRelation(options);
}

if (process.argv[1]?.endsWith('run-ops2-publish-bridge.ts')) {
  Promise.resolve().then(() => run(parseOptions(process.argv.slice(2)))).then(
    (result) => console.log(JSON.stringify({ ...result, checkedAt: new Date().toISOString() })),
    (error) => {
      console.error(JSON.stringify({ ok: false,
        code: error instanceof Error && /^(INVALID_ARGUMENT|INVALID_ID|INVALID_EXPECTED_HASH)$/.test(error.message)
          ? error.message : 'BRIDGE_FAILED',
        productionWrites: process.argv.some((arg) => arg === '--mode=commit') ? 'unknown' : 0 }));
      process.exitCode = 1;
    },
  );
}

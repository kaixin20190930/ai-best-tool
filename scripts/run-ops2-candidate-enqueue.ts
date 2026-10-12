import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { loadEnvConfig } from '@next/env';
import type { PoolClient } from 'pg';

import { getPool } from '../db/neon/client';
import { isAdminUser } from '../lib/auth/admin';
import { resolveCollectionCategorySlug } from '../lib/services/admin/collection';
import { parseOps2Selection, selectionHash, selectionRawPayload, type Ops2Selection } from '../lib/services/admin/ops2Selection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

type Mode = 'preflight' | 'rollback' | 'commit' | 'postcheck';
type Options = { mode: Mode; expectedHash?: string; expectedPostHash?: string };
type Existing = Record<string, unknown> | null;
type Dependencies = { connect: () => Promise<PoolClient>; assertReviewer: (id: string) => Promise<void>;
  readTaskFitToolIds: (client: PoolClient, taskSlug: string) => Promise<string[]> };
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
  if (mode !== 'preflight' && !/^[a-f0-9]{64}$/.test(expectedHash || '')) throw new Error('INVALID_EXPECTED_HASH');
  const expectedPostHash = values.get('expected-post-hash');
  if (mode === 'postcheck' && !/^[a-f0-9]{64}$/.test(expectedPostHash || ''))
    throw new Error('INVALID_EXPECTED_POST_HASH');
  if (mode !== 'postcheck' && expectedPostHash) throw new Error('UNEXPECTED_POST_HASH');
  return { mode: mode as Mode, expectedHash, expectedPostHash };
}

function sha256(value: unknown): string {
  const canonical = (item: any): any => Array.isArray(item) ? item.map(canonical)
    : item && typeof item === 'object'
      ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, canonical(item[key])])) : item;
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

export type QaReport = { status: 'PASS'; selectionHash: string; reviewer: string; qaActor: string; qaThread: string;
  checkedAt: string; scope: { operation: 'enqueue'; candidateId: string; canonicalUrl: string } };

export function parseQaReport(value: unknown, selection: Ops2Selection): QaReport {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Machine-readable QA report required');
  const report = value as Record<string, any>;
  const checkedAt = Date.parse(report.checkedAt);
  const actor = typeof report.qaActor === 'string' ? report.qaActor.toLowerCase() : '';
  const actorId = actor.replace(/^codex-thread:/, '');
  if (report.status !== 'PASS' || report.selectionHash !== selectionHash(selection) ||
      !uuid.test(report.reviewer || '') ||
      !(uuid.test(actor) || (/^codex-thread:/i.test(actor) && uuid.test(actorId))) ||
      actorId === String(report.reviewer).toLowerCase() ||
      !/^codex-thread:[0-9a-f-]{36}$/i.test(report.qaThread || '') ||
      report.qaThread.toLowerCase() !== `codex-thread:${actorId}` ||
      !Number.isFinite(checkedAt) || checkedAt > Date.now() + 300000 || checkedAt < Date.now() - 72 * 3600000 ||
      report.scope?.operation !== 'enqueue' || report.scope?.candidateId !== selection.id ||
      report.scope?.canonicalUrl !== selection.officialUrl)
    throw new Error('QA report does not PASS this exact enqueue scope');
  return { status: 'PASS', selectionHash: report.selectionHash, reviewer: report.reviewer,
    qaActor: actor, qaThread: report.qaThread.toLowerCase(), checkedAt: new Date(checkedAt).toISOString(),
    scope: { operation: 'enqueue', candidateId: selection.id, canonicalUrl: selection.officialUrl } };
}

export function qaReportHash(report: QaReport): string {
  return sha256(report);
}

export async function verifyPlatformOwnedMedia(selection: Ops2Selection, workspaceRoot = process.cwd()): Promise<void> {
  if (selection.media.mode !== 'platform_owned_editorial') return;
  const publicRoot = resolve(workspaceRoot, 'public');
  const assetFile = resolve(publicRoot, `.${selection.media.assetPath}`);
  assert.ok(assetFile.startsWith(`${publicRoot}${sep}`), 'Platform-owned media escapes the public directory');
  const asset = await readFile(assetFile);
  assert.equal(createHash('sha256').update(asset).digest('hex'), selection.media.sha256,
    'Platform-owned media sha256 differs from the selection');
  if (selection.media.assetPath.endsWith('.svg')) {
    const svg = asset.toString('utf8');
    const svgWithoutNamespaces = svg.replace(/\s+xmlns(?::[\w.-]+)?\s*=\s*(['"])[^'"]*\1/gi, '');
    const svgWithoutLocalPaintReferences = svgWithoutNamespaces.replace(
      /url\(\s*(?:(['"])#[A-Za-z_][\w:.-]*\1|#[A-Za-z_][\w:.-]*)\s*\)/gi, '');
    const hasExternalAttributeScheme = [...svgWithoutNamespaces.matchAll(
      /([:\w.-]+)\s*=\s*(['"])(.*?)\2/gs,
    )].some(([, name, , value]) => name.toLowerCase() !== 'style' &&
      /^(?:[A-Za-z][A-Za-z0-9+.-]*:|\/\/)/.test(value.trim()));
    assert.ok(svg.toLowerCase().includes('<svg') &&
      !/<(?:script|image|foreignobject)\b/i.test(svg) &&
      !/(?:href|xlink:href)\s*=/i.test(svg) &&
      !/<!doctype\b|<!entity\b/i.test(svg) &&
      !/@import\b/i.test(svg) &&
      !/\b(?:https?|ftp|file|javascript|vbscript|data):/i.test(svgWithoutNamespaces) &&
      !hasExternalAttributeScheme &&
      !/url\s*\(/i.test(svgWithoutLocalPaintReferences),
    'Platform-owned SVG must be self-contained; only local url(#id) paint references are allowed');
  }
}

function qaContext(selection: Ops2Selection, env = process.env) {
  const report = parseQaReport(JSON.parse(env.OPS2_QA_REPORT || 'null'), selection);
  assert.equal(report.reviewer, env.OPS2_REVIEWER_ID, 'QA report reviewer differs from approved reviewer');
  assert.equal(report.qaActor, env.OPS2_QA_REFERENCE?.toLowerCase(), 'QA reference differs from independent QA actor');
  return { report, hash: qaReportHash(report) };
}

export function candidateFingerprint(row: Record<string, any>): string {
  const payload = row.raw_payload as Record<string, any>;
  const { postimageHash: _postimageHash, ...audit } = payload.ops2EnqueueAudit || {};
  return sha256({ status: row.status, title: row.title, summary: row.summary, url: row.url,
    normalized_url: row.normalized_url, relevance_score: row.relevance_score,
    quality_score: row.quality_score, score_reason: row.score_reason, tool_id: row.tool_id,
    rawAuditHash: sha256(audit), rawPayloadHash: sha256({ ...payload, ops2EnqueueAudit: audit }) });
}

export function preimageHash(selection: Ops2Selection, existing: Existing): string {
  return createHash('sha256').update(JSON.stringify({ selectionHash: selectionHash(selection),
    existing: existing ? { id: existing.id, status: existing.status, tool_id: existing.tool_id,
      normalized_url: existing.normalized_url, raw_payload: existing.raw_payload } : null })).digest('hex');
}

export function assertEnqueueScope(selection: Ops2Selection, options: Options, hash: string,
  env = process.env): string | null {
  assert.equal(options.expectedHash, hash, 'Selection or database preimage changed');
  assert.match(env.OPS2_REVIEWER_ID || '', uuid, 'Approved reviewer UUID required');
  if (options.mode === 'commit') {
    const qa = qaContext(selection, env);
    assert.equal(env.OPS2_PUBLISH_AUTHORIZATION,
      `enqueue:${selection.id}:${selectionHash(selection)}:${qa.report.reviewer}:${qa.report.qaActor}:${qa.hash}`,
      'Exact enqueue authorization required');
    assert.equal(env.OPS2_ROLLBACK_HASH, hash, 'Matching rollback rehearsal required');
    return qa.hash;
  }
  return null;
}

function normalizedIdentity(value: string): string {
  const parsed = new URL(value);
  return `${parsed.hostname.replace(/^www\./, '').toLowerCase()}${parsed.pathname.replace(/\/$/, '')}`;
}

async function assertNoDuplicateTool(client: PoolClient, selection: Ops2Selection): Promise<void> {
  const result = await client.query('SELECT id,name,url,title FROM tools');
  const target = normalizedIdentity(selection.officialUrl);
  for (const row of result.rows) {
    assert.notEqual(String(row.name || '').toLowerCase(), selection.name.toLowerCase(),
      `Tool name already exists: ${row.id}`);
    const title = row.title && typeof row.title === 'object' ? row.title.en : null;
    assert.notEqual(String(title || '').toLowerCase(), selection.localized.en.title.toLowerCase(),
      `Tool title already exists: ${row.id}`);
    if (row.url) {
      try { assert.notEqual(normalizedIdentity(row.url), target, `Tool canonical already exists: ${row.id}`); }
      catch (error) { if (error instanceof Error && error.message.includes('already exists')) throw error; }
    }
  }
}

async function assertValidClusterAndCategory(client: PoolClient, selection: Ops2Selection,
  deps: Dependencies): Promise<void> {
  const category = await client.query('SELECT id FROM categories WHERE slug=$1',
    [resolveCollectionCategorySlug(selection.categorySlug)]);
  assert.equal(category.rowCount, 1, 'Selected category is not available');
  const actual = (await deps.readTaskFitToolIds(client, selection.cluster.taskSlug))
    .map((id) => id.toLowerCase()).sort();
  const checked = selection.entityGate.duplicateIntent.checkedToolIds.map((id) => id.toLowerCase()).sort();
  assert.deepEqual(checked, actual, 'Task duplicate-intent comparison must cover every reviewed/published Fit tool');
}

async function readTaskFitToolIdsFromClient(client: PoolClient, taskSlug: string): Promise<string[]> {
  const task = await client.query('SELECT id FROM decision_tasks WHERE slug=$1 AND status=$2',
    [taskSlug, 'active']);
  assert.equal(task.rowCount, 1, 'Selected Task cluster is not active');
  const fits = await client.query(`SELECT DISTINCT tool_id FROM tool_task_fits
    WHERE task_id=$1 AND status IN ('reviewed','published') ORDER BY tool_id`, [task.rows[0].id]);
  return fits.rows.map((row) => String(row.tool_id));
}

async function readCandidate(client: PoolClient, selection: Ops2Selection, lock: boolean): Promise<Existing> {
  const result = await client.query(`SELECT * FROM collection_candidates WHERE id=$1 OR normalized_url=$2${lock ? ' FOR UPDATE' : ''}`,
    [selection.id, selection.officialUrl]);
  if (result.rows.length > 1 || (result.rows.length === 1 && result.rows[0].id !== selection.id))
    throw new Error('Candidate identity or canonical collision');
  return result.rows[0] || null;
}

function assertApplied(row: Existing, selection: Ops2Selection, hash: string, qaHash: string,
  reviewer: string, qaActor: string): string {
  assert.ok(row, 'Candidate is not enqueued');
  assert.equal(row.id, selection.id);
  assert.equal(row.status, 'new');
  assert.equal(row.tool_id, null);
  assert.equal(row.normalized_url, selection.officialUrl);
  const payload = row.raw_payload as Record<string, any>;
  assert.equal(selectionHash(parseOps2Selection(payload.ops2Selection)), selectionHash(selection));
  assert.equal(payload.ops2EnqueueAudit?.preimageHash, hash);
  assert.equal(payload.ops2EnqueueAudit?.selectionHash, selectionHash(selection));
  assert.equal(payload.ops2EnqueueAudit?.reviewer, reviewer);
  assert.equal(payload.ops2EnqueueAudit?.qaReference, qaActor);
  assert.equal(payload.ops2EnqueueAudit?.qaActor, qaActor);
  assert.equal(payload.ops2EnqueueAudit?.qaReportHash, qaHash);
  const fingerprint = candidateFingerprint(row);
  assert.equal(payload.ops2EnqueueAudit?.postimageHash, fingerprint, 'Candidate postimage drifted');
  return fingerprint;
}

async function assertAdminReviewer(reviewerId: string): Promise<void> {
  const { data, error } = await createAdminClient().auth.admin.getUserById(reviewerId);
  if (error) throw new Error(error.message);
  assert.ok(isAdminUser(data.user), 'Reviewer is not an approved administrator');
}

async function readProductionTaskFitToolIds(_client: PoolClient, taskSlug: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data: task, error: taskError } = await supabase.from('decision_tasks').select('id')
    .eq('slug', taskSlug).eq('status', 'active').maybeSingle();
  if (taskError) throw new Error(`Task cluster lookup failed: ${taskError.message}`);
  assert.ok(task, 'Selected Task cluster is not active');
  const { data: fits, error: fitsError } = await supabase.from('tool_task_fits').select('tool_id')
    .eq('task_id', task.id).in('status', ['reviewed', 'published']).order('tool_id');
  if (fitsError) throw new Error(`Task Fit lookup failed: ${fitsError.message}`);
  return [...new Set((fits || []).map((row) => String(row.tool_id)))].sort();
}

const productionDeps: Dependencies = { connect: () => getPool().connect(), assertReviewer: assertAdminReviewer,
  readTaskFitToolIds: readProductionTaskFitToolIds };

export async function run(selection: Ops2Selection, options: Options, deps = productionDeps) {
  await verifyPlatformOwnedMedia(selection);
  const client = await deps.connect();
  let transaction = false;
  try {
    if (options.mode === 'rollback' || options.mode === 'commit') {
      await client.query('BEGIN');
      transaction = true;
    }
    const existing = await readCandidate(client, selection, transaction);
    const applied = existing?.raw_payload &&
      (existing.raw_payload as Record<string, any>).ops2EnqueueAudit?.preimageHash;
    if (options.mode === 'postcheck') {
      const qa = qaContext(selection);
      const postimageHash = assertApplied(existing, selection, options.expectedHash!, qa.hash,
        qa.report.reviewer, qa.report.qaActor);
      assert.equal(options.expectedPostHash, postimageHash, 'Candidate postcheck fingerprint differs from commit');
      return { mode: options.mode, id: selection.id, status: existing?.status,
        postimageHash, productionWrites: 0 };
    }
    await assertNoDuplicateTool(client, selection);
    await assertValidClusterAndCategory(client, selection, deps);
    if (applied) {
      const audit = (existing!.raw_payload as Record<string, any>).ops2EnqueueAudit;
      if (options.mode === 'preflight') {
        const postimageHash = assertApplied(existing, selection, audit.preimageHash, audit.qaReportHash,
          audit.reviewer, audit.qaReference);
        return { mode: options.mode, id: selection.id, alreadyApplied: true,
          postimageHash, productionWrites: 0 };
      }
      const qaHash = assertEnqueueScope(selection, options, options.expectedHash!, process.env);
      const postimageHash = assertApplied(existing, selection, options.expectedHash!, qaHash || audit.qaReportHash,
        process.env.OPS2_REVIEWER_ID!, options.mode === 'commit' ? qaContext(selection).report.qaActor : audit.qaReference);
      return { mode: options.mode, id: selection.id, alreadyApplied: true,
        postimageHash, productionWrites: 0 };
    }
    assert.equal(existing, null, 'Existing candidate is not an identical approved enqueue');
    const hash = preimageHash(selection, existing);
    if (options.mode === 'preflight') return { mode: options.mode, id: selection.id, preimageHash: hash,
      selectionHash: selectionHash(selection), ready: true, productionWrites: 0 };
    const qaHash = assertEnqueueScope(selection, options, hash);
    await deps.assertReviewer(process.env.OPS2_REVIEWER_ID!);
    const qaActor = options.mode === 'commit' ? qaContext(selection).report.qaActor : 'rollback-preview';
    const payload = { ...selectionRawPayload(selection), ops2EnqueueAudit: {
      preimageHash: hash, reviewer: process.env.OPS2_REVIEWER_ID,
      selectionHash: selectionHash(selection), qaReference: qaActor, qaActor,
      qaReportHash: qaHash || 'rollback-preview',
      queuedAt: new Date().toISOString(),
    } };
    const scoreReason = `Editorial ${selection.cluster.role} for ${selection.cluster.taskSlug}; two official sources`;
    const postimageHash = candidateFingerprint({ status: 'new', title: selection.name,
      summary: selection.localized.en.summary, url: selection.officialUrl,
      normalized_url: selection.officialUrl, relevance_score: 80, quality_score: 90,
      score_reason: scoreReason, tool_id: null, raw_payload: payload });
    payload.ops2EnqueueAudit = { ...payload.ops2EnqueueAudit, postimageHash };
    const inserted = await client.query(`INSERT INTO collection_candidates
      (id,url,normalized_url,title,summary,raw_payload,relevance_score,quality_score,score_reason,status)
      VALUES ($1,$2,$2,$3,$4,$5::jsonb,80,90,$6,'new')
      ON CONFLICT DO NOTHING RETURNING id`, [selection.id, selection.officialUrl, selection.name,
      selection.localized.en.summary, JSON.stringify(payload), scoreReason]);
    assert.equal(inserted.rowCount, 1, 'Candidate changed or normalized URL already exists');
    const after = await readCandidate(client, selection, false);
    assertApplied(after, selection, hash, qaHash || 'rollback-preview', process.env.OPS2_REVIEWER_ID!, qaActor);
    if (options.mode === 'rollback') {
      await client.query('ROLLBACK');
      transaction = false;
      return { mode: options.mode, id: selection.id, preimageHash: hash,
        postimageHash, productionWrites: 0 };
    }
    await client.query('COMMIT');
    transaction = false;
    return { mode: options.mode, id: selection.id, status: 'new',
      postimageHash, productionWrites: 1 };
  } finally {
    if (transaction) await client.query('ROLLBACK').catch(() => undefined);
    client.release();
  }
}

async function readInput(): Promise<unknown> {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk.toString();
    if (input.length > 131072) throw new Error('Selection input too large');
  }
  return JSON.parse(input);
}

if (process.argv[1]?.endsWith('run-ops2-candidate-enqueue.ts')) {
  Promise.resolve().then(async () => run(parseOps2Selection(await readInput()), parseOptions(process.argv.slice(2))))
    .then((result) => console.log(JSON.stringify(result)), (error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error',
        productionWrites: process.argv.includes('--mode=commit') ? 'unknown' : 0 }));
      process.exitCode = 1;
    });
}

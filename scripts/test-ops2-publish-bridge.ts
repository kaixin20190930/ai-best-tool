import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import { Client } from 'pg';

import { assertCandidateAudit, assertCommitScope, assertRelationAudit, assertToolAudit,
  parseOptions, snapshotHash } from './run-ops2-publish-bridge';
import { evidenceReadyDraftSql, mediaNeededSql } from '../lib/services/admin/draftPublicationSql';
import { buildReadyDraftMonitorPublishSql, getMonitorPublicationBlockers } from '../lib/services/admin/submissionPublication';

const id = 'cec78907-e2a1-4eb7-853a-a58334026280';
const hash = snapshotHash({ id, status: 'draft' });
const options = parseOptions(['--kind=tool', '--mode=commit', `--id=${id}`, `--expected-hash=${hash}`]);
const env = {
  OPS2_PUBLISH_AUTHORIZATION: `tool:${id}:${hash}`,
  OPS2_ROLLBACK_HASH: hash,
  OPS2_REVIEWER_ID: '2b8177ac-70b3-4475-a1ee-509ff8b4b622',
  OPS2_QA_REFERENCE: 'codex-thread:01a13034-b928-7f63-888f-8bbb3846e78d',
};
assertCommitScope(options, hash, env);
assert.throws(() => assertCommitScope(options, hash, { ...env, OPS2_PUBLISH_AUTHORIZATION: '' }));
assert.throws(() => assertCommitScope(options, hash, { ...env, OPS2_ROLLBACK_HASH: '' }));
assert.throws(() => assertCommitScope(options, hash, { ...env, OPS2_QA_REFERENCE: '' }));
assert.throws(() => assertCommitScope(options, snapshotHash({ changed: true }), env));
assert.throws(() => parseOptions(['--kind=tool', '--mode=commit', `--id=${id}`]));
assert.equal(parseOptions(['--kind=relation', '--mode=preflight', `--id=${id}`]).mode, 'preflight');
assert.equal(parseOptions(['--kind=candidate', '--mode=rollback', `--id=${id}`, `--expected-hash=${hash}`]).kind, 'candidate');
assert.throws(() => parseOptions(['--secret=do-not-print']), (error: Error) =>
  error.message === 'INVALID_ARGUMENT' && !error.message.includes('do-not-print'));
assert.throws(() => parseOptions(['--kind=tool', '--mode=postcheck', `--id=${id}`]));
const invalidCli = spawnSync('pnpm', ['exec', 'tsx', 'scripts/run-ops2-publish-bridge.ts',
  '--secret=do-not-print'], { encoding: 'utf8' });
assert.notEqual(invalidCli.status, 0);
assert.match(invalidCli.stderr, /"code":"INVALID_ARGUMENT"/);
assert.doesNotMatch(invalidCli.stderr, /do-not-print|--secret/);

const candidate = { status: 'imported', tool_id: id,
  raw_payload: { ops2PublicationBridge: { preimageHash: hash, qaReference: env.OPS2_QA_REFERENCE,
    reviewer: env.OPS2_REVIEWER_ID } } };
const draft = { id, status: 'draft' };
assertCandidateAudit(candidate, draft, hash, env);
assertCandidateAudit(candidate, draft, hash, env); // Repeated commit uses the same approved audit.
assert.throws(() => assertCandidateAudit({ ...candidate, status: 'new' }, draft, hash, env));
assert.throws(() => assertCandidateAudit(candidate, { ...draft, status: 'published' }, hash, env));
assert.throws(() => assertCandidateAudit(candidate, draft, snapshotHash('tamper'), env));
assert.throws(() => assertCandidateAudit({ ...candidate, raw_payload: { ops2PublicationBridge: {
  ...candidate.raw_payload.ops2PublicationBridge, reviewer: id } } }, draft, hash, env));

const tool = { id, status: 'published', page_quality_status: 'monitor', next_review_date: '2026-11-12',
  features: { submission: { review: { publishMode: 'monitor_noindex', preimageHash: hash,
    qaReference: env.OPS2_QA_REFERENCE, reviewer: env.OPS2_REVIEWER_ID, nextReviewDate: '2026-11-12' } } } };
assertToolAudit(tool, hash, env);
assertToolAudit(tool, hash, env);
const timezoneTool = { ...tool, next_review_date: new Date('2026-11-10T16:00:00Z'),
  next_review_date_db_text: '2026-11-11', features: { submission: { review: {
    ...tool.features.submission.review, nextReviewDate: '2026-11-11' } } } };
assertToolAudit(timezoneTool, hash, env);
assert.throws(() => assertToolAudit({ ...timezoneTool, next_review_date_db_text: '2026-11-10' }, hash, env));
assert.throws(() => assertToolAudit({ ...tool, next_review_date: '2026-11-13' }, hash, env));
assert.throws(() => assertToolAudit({ ...tool, page_quality_status: 'continue_index' }, hash, env));
assert.throws(() => assertToolAudit({ ...tool, features: { submission: { review: {
  ...tool.features.submission.review, qaReference: 'codex-thread:tampered' } } } }, hash, env));

const relationAudit = { taskId: id, toolId: id, qaReference: env.OPS2_QA_REFERENCE,
  toolCapabilities: [{ id: 'cap-a', status: 'reviewed', updated_at: '2026-10-11T00:00:00Z' },
    { id: 'cap-b', status: 'reviewed', updated_at: '2026-10-11T00:00:00Z' }],
  fits: [{ id: 'fit-a', status: 'reviewed', updated_at: '2026-10-11T00:00:00Z' }] };
const relationHash = snapshotHash({ taskId: id, toolId: id,
  toolCapabilities: relationAudit.toolCapabilities, fits: relationAudit.fits });
const relationManifest = { taskId: id, toolId: id,
  toolCapabilities: relationAudit.toolCapabilities.map((row) => ({ ...row, status: 'published',
    updated_at: '2026-10-12T00:00:00Z', last_edited_by: env.OPS2_REVIEWER_ID })),
  fits: relationAudit.fits.map((row) => ({ ...row, status: 'published',
    updated_at: '2026-10-12T00:00:00Z', last_edited_by: env.OPS2_REVIEWER_ID })) };
assertRelationAudit(relationManifest, relationAudit, env.OPS2_REVIEWER_ID, relationHash, env);
assert.throws(() => assertRelationAudit({ ...relationManifest, toolCapabilities: [
  { ...relationManifest.toolCapabilities[0], id: 'tampered' }, relationManifest.toolCapabilities[1],
] }, relationAudit, env.OPS2_REVIEWER_ID, relationHash, env));
assert.throws(() => assertRelationAudit(relationManifest, relationAudit, id, relationHash, env));
assert.throws(() => assertRelationAudit({ ...relationManifest, fits: [{ ...relationManifest.fits[0],
  updated_at: '2026-10-10T00:00:00Z' }] }, relationAudit, env.OPS2_REVIEWER_ID, relationHash, env));

const sql = buildReadyDraftMonitorPublishSql(evidenceReadyDraftSql, true);
assert.match(sql, /status = 'draft'/);
assert.match(sql, /page_quality_status = 'monitor'/);
assert.match(sql, /'qaReference', \$3::text/);
assert.match(sql, /'preimageHash', \$4::text/);
assert.match(sql, /'nextReviewDate'/);
assert.match(sql, /paymentConfirmed\}' = 'true'::jsonb/);
assert.doesNotMatch(sql, /marketValidation/);
assert.match(sql, /bestFit/);
assert.match(sql, /notIdealFor/);
assert.match(sql, /compareAxes/);
assert.match(mediaNeededSql, /COALESCE\(features->'mediaReview'->>'needed' = 'true', FALSE\)/);
assert.ok(getMonitorPublicationBlockers({
  url: 'https://example.com', category_id: 'category', image_url: 'https://example.com/logo',
  thumbnail_url: 'https://example.com/screenshot', content: { en: 'A'.repeat(100) },
  detail: { en: 'B'.repeat(180) }, pricing: 'paid', tags: ['ai'],
  features: { submission: { commercial: { plan: 'standard_paid', paymentConfirmed: false } } },
}).includes('Priority review payment'));

const action = readFileSync('app/actions/admin/tools.ts', 'utf8');
assert.match(action, /buildReadyDraftMonitorPublishSql\(evidenceReadyDraftSql\)/);
const bridge = readFileSync('scripts/run-ops2-publish-bridge.ts', 'utf8');
assert.match(bridge, /importCandidate\(options\.id, client\)/);
assert.match(bridge, /admin_publish_reviewed_task_tool_group/);
assert.match(bridge, /getToolIndexDecision/);
assert.match(bridge, /ROLLBACK/);
assert.match(bridge, /SELECT \* FROM collection_candidates WHERE id = \$1\$\{lock \? ' FOR UPDATE' : ''\}/);
assert.match(bridge, /assert\.equal\(candidate\.status, 'new'/);
assert.match(bridge, /if \(options\.mode === 'preflight' \|\| alreadyApplied\)/);
assert.match(bridge, /if \(options\.mode === 'rollback'\) \{\s*await client\.query\('ROLLBACK'\)/);
assert.doesNotMatch(bridge, /error: error instanceof Error \? error\.message/);

console.log('OPS2 publish bridge focused checks passed');

if (process.argv.includes('--local-db')) {
  const db = new Client({ host: '/tmp', port: 5432, user: userInfo().username, database: 'postgres' });
  Promise.resolve().then(async () => {
    await db.connect();
    const result = await db.query(`SELECT NOT ${mediaNeededSql} AS media_ready FROM (VALUES
      ('https://cdn.example.com/logo.png'::text, 'https://cdn.example.com/preview.png'::text, '{}'::jsonb),
      ('https://cdn.example.com/logo.png'::text, 'https://cdn.example.com/preview.png'::text,
       '{"mediaReview":{"needed":true}}'::jsonb)
    ) AS fixture(image_url, thumbnail_url, features)`);
    assert.deepEqual(result.rows.map((row) => row.media_ready), [true, false],
      'Missing mediaReview must not block complete media; explicit needed=true must block');
    console.log('OPS2 media SQL null-safety checks passed');
  }).catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(() => db.end());
}

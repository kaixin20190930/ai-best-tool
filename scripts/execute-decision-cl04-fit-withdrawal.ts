import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';

import { getAdminEmails } from '../lib/auth/admin';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.env.CL04_ENV_DIR || process.cwd());

const manifestPath = 'docs/DECISION_GRAPH_CL04_FIT_WITHDRAWAL_MANIFEST_2026-09-28_CN.json';
const qaReference = 'codex-thread:01a0e549-64bb-72f0-acb5-aac41c4f7c0f';
const taskId = '10ffdf04-6885-4a28-949d-0723038c6954';
const fitIds = ['692f9115-2d1d-487b-b02b-392fa55d2d34', 'bb6bb5aa-df5e-4113-bb76-8d4910911b28'];
const version = '2026-09-23T06:06:52.904308+00:00';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Fit = { id: string; status: string; updated_at: string };
type Manifest = { taskId: string; operation: string; fits: Fit[]; qaReference: string; preflight: boolean };

export function parseArgs(args: string[]) {
  const options = args[0] === '--' ? args.slice(1) : args;
  const execute = options.includes('--execute');
  const reviewerArgs = options.filter((arg) => arg.startsWith('--reviewer='));
  assert.ok(
    options.every((arg) => arg === '--execute' || arg.startsWith('--reviewer=')),
    'Unknown argument',
  );
  assert.equal(reviewerArgs.length, 1, 'Exactly one --reviewer=<admin-user-uuid> is required');
  assert.equal(options.filter((arg) => arg === '--execute').length, execute ? 1 : 0, 'Duplicate --execute');
  const reviewer = reviewerArgs[0].slice('--reviewer='.length);
  assert.match(reviewer, uuid, 'Reviewer must be a valid UUID');
  return { execute, reviewer };
}

export function validateManifest(value: Manifest) {
  assert.equal(value.taskId, taskId);
  assert.equal(value.operation, 'withdraw');
  assert.equal(value.qaReference, qaReference);
  assert.equal(value.preflight, true);
  assert.equal(value.fits?.length, 2);
  assert.deepEqual(value.fits.map((fit) => fit.id).sort(), [...fitIds].sort());
  for (const fit of value.fits) {
    assert.equal(fit.status, 'reviewed');
    assert.equal(fit.updated_at, version);
  }
}

export function validateResponse(value: any, preflight: boolean) {
  assert.equal(value?.ok, true);
  assert.equal(value?.operation, 'withdraw');
  assert.equal(value?.taskId, taskId);
  assert.equal(value?.taskCapabilityUpdates, 0);
  assert.equal(value?.toolCapabilityUpdates, 0);
  assert.equal(value?.fitUpdates, preflight ? 0 : 2);
  if (preflight) assert.deepEqual([...value.fitIds].sort(), [...fitIds].sort());
}

async function main() {
  const { execute, reviewer } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  validateManifest(manifest);
  const db = createAdminClient();
  const allowedEmails = getAdminEmails();
  assert.ok(allowedEmails.length, 'ADMIN_EMAILS must identify approved administrators');
  const { data: reviewerResult, error: reviewerError } = await db.auth.admin.getUserById(reviewer);
  if (reviewerError) throw new Error(reviewerError.message);
  assert.ok(
    reviewerResult.user?.email && allowedEmails.includes(reviewerResult.user.email.toLowerCase()),
    'Reviewer must be an existing administrator in ADMIN_EMAILS',
  );

  const { data: tasks, error: taskError } = await db.from('decision_tasks').select('id,slug,status').eq('id', taskId);
  if (taskError) throw new Error(taskError.message);
  assert.equal(tasks?.length, 1);
  assert.equal(tasks[0].slug, 'build-app-with-ai');
  assert.equal(tasks[0].status, 'active');
  const { data: fits, error: fitError } = await db
    .from('tool_task_fits')
    .select('id,task_id,tool_id,status,updated_at')
    .eq('task_id', taskId);
  if (fitError) throw new Error(fitError.message);
  assert.equal(fits?.length, 2, 'Expected only the two CL-04 Fits');
  const expectedTools: Record<string, string> = {
    [fitIds[0]]: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    [fitIds[1]]: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
  };
  for (const fit of fits) {
    assert.ok(fitIds.includes(fit.id), 'Unexpected Fit');
    assert.equal(fit.task_id, taskId);
    assert.equal(fit.tool_id, expectedTools[fit.id]);
    assert.equal(fit.status, 'reviewed');
    assert.equal(fit.updated_at.replace(/(?:\+00:00|Z)$/, 'Z'), version.replace(/\+00:00$/, 'Z'), 'Fit version drift');
  }

  // A successful read-only RPC preflight also proves that the migration function is deployed.
  const params = {
    p_fits: manifest.fits,
    p_operation: 'withdraw',
    p_reviewer: reviewer,
    p_qa_reference: manifest.qaReference,
    p_preflight: true,
  };
  const preflight = await db.rpc('decision_cl04_fit_transition', params);
  if (preflight.error) throw new Error(`CL-04 function unavailable or preflight failed: ${preflight.error.message}`);
  validateResponse(preflight.data, true);
  console.log(JSON.stringify({ mode: 'preflight', reviewer, response: preflight.data }));
  if (!execute) return;

  const committed = await db.rpc('decision_cl04_fit_transition', { ...params, p_preflight: false });
  if (committed.error) throw new Error(committed.error.message);
  validateResponse(committed.data, false);
  console.log(JSON.stringify({ mode: 'execute', reviewer, response: committed.data }));
  const check = spawnSync(
    'node',
    [
      'scripts/pub-03-readonly-run.mjs',
      'pnpm',
      'exec',
      'tsx',
      'scripts/verify-decision-cl04-app-build-readonly.ts',
      '--after-withdrawal',
    ],
    { stdio: 'inherit' },
  );
  if (check.error) throw check.error;
  assert.equal(check.status, 0, 'Post-withdrawal read-only verifier failed; investigate committed state');
}

if (process.argv[1]?.endsWith('execute-decision-cl04-fit-withdrawal.ts')) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

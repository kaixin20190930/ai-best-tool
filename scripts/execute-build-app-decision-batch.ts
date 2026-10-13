import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

import { isAdminUser } from '../lib/auth/admin';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getSupabaseUrl } from '../lib/supabase/env';
import { buildBatch } from './build-app-decision-batch';

type Mode = 'preflight' | 'commit' | 'revert-preflight' | 'revert';

export function prepareBatchExecution(
  argv: string[], env: NodeJS.ProcessEnv = process.env, batchBuilder: typeof buildBatch = buildBatch,
) {
  const mode = (argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1] || 'preflight') as Mode;
  assert.ok(['preflight', 'commit', 'revert-preflight', 'revert'].includes(mode));
  const reviewer = argv.find((arg) => arg.startsWith('--reviewer='))?.split('=')[1];
  const qaReference = argv.find((arg) => arg.startsWith('--qa-reference='))?.slice('--qa-reference='.length) || '';
  assert.match(reviewer || '', /^[0-9a-f-]{36}$/i, 'Real approved reviewer UUID required');
  if (mode !== 'preflight') {
    assert.match(qaReference, /^codex-thread:[0-9a-f-]{36}$/i, 'Independent QA thread reference required');
  }
  const batch = batchBuilder(undefined, reviewer, qaReference);
  assert.ok(batch.tools.length > 0, `No QA-ready write set: ${JSON.stringify(batch.holds)}`);
  if (mode !== 'preflight') {
    assert.equal(env.DECISION_BATCH_OWNER_APPROVAL_HASH, batch.batchHash,
      'Owner approval must name this exact batch hash');
  }
  return { mode, reviewer, qaReference, batch };
}

async function main() {
  loadEnvConfig(process.cwd());
  const { mode, reviewer, qaReference, batch } = prepareBatchExecution(process.argv);

  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  assert.ok(key, 'Service-role key unavailable');
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  try {
    await neon.query('BEGIN');
    const ids = batch.tools.map((tool: any) => tool.toolId);
    const { rows } = await neon.query(
      'SELECT id,name,url,status,updated_at::text AS updated_at FROM tools WHERE id = ANY($1::uuid[]) FOR SHARE', [ids]);
    assert.equal(rows.length, ids.length, 'Directory identity count drifted');
    for (const tool of batch.tools as any[]) {
      const row = rows.find((item) => item.id === tool.toolId);
      assert.ok(row, `${tool.slug}: directory row missing`);
      assert.equal(row.name, tool.directoryPreimage.name);
      assert.equal(row.url, tool.directoryPreimage.url);
      assert.equal(row.status, tool.directoryPreimage.status);
      assert.equal(new Date(row.updated_at).getTime(), new Date(tool.directoryPreimage.updatedAt).getTime(),
        `${tool.slug}: directory updated_at drifted`);
    }
    const db = createClient(getSupabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: reviewerResult, error: reviewerError } = await db.auth.admin.getUserById(reviewer!);
    if (reviewerError) throw new Error(reviewerError.message);
    assert.ok(reviewerResult.user && isAdminUser(reviewerResult.user), 'Reviewer is not an approved administrator');
    const args = {
      p_task_id: batch.taskId,
      p_capability_id: batch.capabilityId,
      p_task_preimage: batch.taskPreimage,
      p_tools: batch.tools,
      p_batch_hash: batch.batchHash,
      p_reviewer: reviewer,
      p_qa_reference: qaReference,
      p_commit: mode !== 'preflight',
    };
    const rpc = mode.startsWith('revert') ? 'decision_manifest_batch_revert' : 'decision_manifest_batch_intake';
    args.p_commit = mode === 'commit' || mode === 'revert';
    const { data, error } = await db.rpc(rpc, args);
    if (error) throw new Error(`${rpc}: ${error.message}`);
    assert.equal(data?.ok, true);
    assert.equal(data?.batchHash, batch.batchHash);
    assert.equal(data?.results?.length, batch.tools.length);
    if (mode === 'preflight' || mode === 'revert-preflight') assert.equal(data.productionWrites, 0);
    if (mode === 'commit') {
      const { data: replay, error: replayError } = await db.rpc('decision_manifest_batch_intake', args);
      if (replayError) throw new Error(`Commit postcheck: ${replayError.message}`);
      assert.equal(replay?.ok, true);
      assert.ok(replay.results.every((row: any) => row.result === 'unchanged' && row.writes === 0),
        'Commit postcheck did not match the exact immutable postimage');
    }
    console.log(JSON.stringify({ mode, batchHash: batch.batchHash, results: data.results,
      transaction: data.mode, productionWrites: data.productionWrites ?? 'committed_in_rpc' }));
  } finally {
    await neon.query('ROLLBACK');
    await neon.end();
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}

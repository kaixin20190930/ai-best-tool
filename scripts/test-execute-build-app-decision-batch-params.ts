import assert from 'node:assert/strict';

import { prepareBatchExecution } from './execute-build-app-decision-batch';

const reviewer = '2b8177ac-70b3-4475-a1ee-509ff8b4b622';
const qaReference = 'codex-thread:00000000-0000-4000-8000-000000000001';

const batch = { tools: [{ slug: 'fixture' }], holds: [], batchHash: 'fixture-hash' } as any;
const buildBatch = () => batch;

for (const mode of ['preflight', 'commit', 'revert-preflight', 'revert']) {
  const prepared = prepareBatchExecution(
    [`--mode=${mode}`, `--reviewer=${reviewer}`, `--qa-reference=${qaReference}`],
    { DECISION_BATCH_OWNER_APPROVAL_HASH: 'fixture-hash' }, buildBatch,
  );
  assert.equal(prepared.mode, mode);
  assert.equal(prepared.batch, batch);
}
assert.throws(() => prepareBatchExecution(['--mode=invalid', `--reviewer=${reviewer}`], {}, buildBatch));
assert.throws(() => prepareBatchExecution(['--mode=preflight', '--reviewer=invalid'], {}, buildBatch),
  /Real approved reviewer UUID required/);
assert.throws(() => prepareBatchExecution(['--mode=commit', `--reviewer=${reviewer}`], {}, buildBatch),
  /Independent QA thread reference required/);
assert.throws(() => prepareBatchExecution(
  ['--mode=commit', `--reviewer=${reviewer}`, `--qa-reference=${qaReference}`],
  { DECISION_BATCH_OWNER_APPROVAL_HASH: 'wrong-hash' }, buildBatch),
  /Owner approval must name this exact batch hash/);
assert.throws(() => prepareBatchExecution(
  ['--mode=preflight', `--reviewer=${reviewer}`], {},
  () => ({ ...batch, tools: [], holds: [{ slug: 'fixture' }] })),
  /No QA-ready write set/);

console.log('Executor parameter paths validate before database access and fail closed.');

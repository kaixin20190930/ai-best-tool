import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import FOURTH_BATCH from './freshness-fourth-batch';

const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

export default function verifyFourthPostRollbackReadback(
  preflight: Record<string, any>,
  rollback: Record<string, any>,
  readbackRows: Record<string, any>[],
) {
  assert.equal(preflight.mode, 'preflight');
  assert.equal(rollback.mode, 'rollback');
  assert.equal(preflight.productionWrites, 0);
  assert.equal(rollback.productionWrites, 0);
  assert.equal(preflight.results?.length, FOURTH_BATCH.length);
  assert.equal(rollback.results?.length, FOURTH_BATCH.length);
  assert.equal(readbackRows.length, FOURTH_BATCH.length, 'Independent readback must return five rows');
  const results = FOURTH_BATCH.map((candidate, index) => {
    const approved = preflight.results[index];
    const trial = rollback.results[index];
    const row = readbackRows[index];
    assert.equal(approved.slug, candidate.slug);
    assert.equal(approved.status, 'ready');
    assert.equal(trial.slug, candidate.slug);
    assert.equal(trial.status, 'rolled_back');
    assert.equal(trial.preimageSha256, approved.preimageSha256);
    assert.equal(row?.id, candidate.id);
    assert.equal(row?.name, candidate.slug);
    const readbackSha256 = hash(row);
    assert.equal(
      readbackSha256,
      approved.preimageSha256,
      `${candidate.slug}: independent post-rollback readback drift`,
    );
    return { slug: candidate.slug, preimageSha256: approved.preimageSha256, readbackSha256, status: 'matched' };
  });
  return {
    mode: 'post_rollback_readback',
    productionWrites: 0,
    readIsolation: 'new_connection_read_only_transaction',
    results,
  };
}

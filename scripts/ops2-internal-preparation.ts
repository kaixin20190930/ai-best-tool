import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InternalPreparationAudit = {
  reviewMode: 'internal_preparation';
  internalAuthorizationHash: string;
  internalPreparationNonce: string;
};

export function assertInternalPreparationScope(
  stage: 'enqueue' | 'candidate', id: string, preimageHash: string, reviewer: string,
  selectionHash?: string, env = process.env,
): InternalPreparationAudit {
  assert.match(reviewer, uuid, 'Approved reviewer UUID required');
  assert.equal(env.OPS2_ROLLBACK_HASH, preimageHash, 'Matching rollback rehearsal required');
  assert.ok(!env.OPS2_QA_REPORT && !env.OPS2_QA_REFERENCE && !env.OPS2_PUBLISH_AUTHORIZATION,
    'Internal preparation must not be represented as independent QA');
  const token = env.OPS2_INTERNAL_PREPARATION_AUTHORIZATION || '';
  const prefix = [stage, id, ...(selectionHash ? [selectionHash] : []), preimageHash, reviewer].join(':');
  const nonce = token.startsWith(`${prefix}:`) ? token.slice(prefix.length + 1) : '';
  assert.match(nonce, uuid, 'Exact one-object internal preparation authorization required');
  assert.equal(token, `${prefix}:${nonce}`, 'Internal preparation authorization must be exact');
  return {
    reviewMode: 'internal_preparation',
    internalAuthorizationHash: createHash('sha256').update(token).digest('hex'),
    internalPreparationNonce: nonce,
  };
}

export function assertInternalAudit(audit: Record<string, any>, expected?: InternalPreparationAudit) {
  assert.equal(audit.reviewMode, 'internal_preparation');
  assert.match(audit.internalAuthorizationHash || '', /^[a-f0-9]{64}$/);
  assert.match(audit.internalPreparationNonce || '', uuid);
  assert.equal(audit.qaReference, undefined);
  assert.equal(audit.qaActor, undefined);
  assert.equal(audit.qaReportHash, undefined);
  if (expected) {
    assert.equal(audit.internalAuthorizationHash, expected.internalAuthorizationHash);
    assert.equal(audit.internalPreparationNonce, expected.internalPreparationNonce);
  }
}

export async function assertUnusedInternalPreparationNonce(client: PoolClient, nonce: string) {
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [nonce]);
  const found = await client.query(`SELECT id FROM collection_candidates
    WHERE raw_payload #>> '{ops2EnqueueAudit,internalPreparationNonce}' = $1
       OR raw_payload #>> '{ops2PublicationBridge,internalPreparationNonce}' = $1 LIMIT 1`, [nonce]);
  assert.equal(found.rowCount, 0, 'Internal preparation nonce has already been used');
}

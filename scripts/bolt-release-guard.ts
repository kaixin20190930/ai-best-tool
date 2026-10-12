import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const BOLT_RELEASE_ID = '04570837-c50d-4aa2-b8aa-a11738046fe5';
export const BOLT_EDITORIAL_ASSET = '/images/tool-media/bolt-editorial-cover.svg';

export function assertBoltControllerAuthorization(value: unknown) {
  assert(value && typeof value === 'object', 'bolt: controller QA authorization is required');
  const authorization = value as Record<string, unknown>;
  assert.equal(authorization.candidateSlug, 'bolt', 'bolt: authorization candidate mismatch');
  assert.equal(authorization.approved, true, 'bolt: controller approval missing');
  assert.equal(authorization.independentQaPass, true, 'bolt: independent QA PASS required');
  assert.equal(authorization.scope, 'single published + monitor/noindex insert', 'bolt: authorization scope mismatch');
  const gates = authorization.preservedGates as Record<string, unknown> | undefined;
  assert.equal(gates?.indexApproved, false, 'bolt: index approval is forbidden');
  assert.equal(gates?.sitemapEligible, false, 'bolt: sitemap approval is forbidden');
  assert.equal(gates?.taskCapabilityFitCreationApproved, false, 'bolt: relationship creation is forbidden');
}

export function assertBoltEmptyPreimage(matches: { id: string }[], fixedIdRows: { id: string }[]) {
  assert.equal(matches.length, 0, 'bolt: duplicate identity or alias requires manual review');
  assert.equal(fixedIdRows.length, 0, 'bolt: fixed ID is occupied');
}

export function assertBoltProtectedRowsUnchanged(before: unknown[], after: unknown[]) {
  assert.deepEqual(after, before, 'bolt: protected existing tool rows changed');
}

export function assertBoltAsset(
  payload: { id: string; imageUrl: string; thumbnailUrl: string },
  sha256: Record<string, string>,
  root = process.cwd(),
) {
  assert.equal(payload.id, BOLT_RELEASE_ID, 'bolt: fixed ID changed');
  assert.equal(payload.imageUrl, BOLT_EDITORIAL_ASSET, 'bolt: reviewed editorial asset changed');
  assert.equal(payload.thumbnailUrl, BOLT_EDITORIAL_ASSET, 'bolt: display asset changed');
  const digest = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'public', BOLT_EDITORIAL_ASSET.slice(1))))
    .digest('hex');
  assert.equal(digest, sha256[BOLT_EDITORIAL_ASSET], 'bolt: asset hash mismatch');
}

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ANYWORD_RELEASE_ID = '4555627d-2de9-4614-a850-fa073388f869';
export const ANYWORD_EDITORIAL_ASSET = '/images/tool-media/anyword-editorial-cover.svg';

export function assertAnywordControllerAuthorization(value: unknown) {
  assert(value && typeof value === 'object', 'anyword: controller QA authorization is required');
  const authorization = value as Record<string, unknown>;
  assert.equal(authorization.candidateSlug, 'anyword', 'anyword: authorization candidate mismatch');
  assert.equal(authorization.approved, true, 'anyword: controller approval missing');
  assert.equal(authorization.independentQaPass, true, 'anyword: independent QA PASS required');
  assert.equal(authorization.scope, 'single published + monitor/noindex insert', 'anyword: authorization scope mismatch');
  const gates = authorization.preservedGates as Record<string, unknown> | undefined;
  assert.equal(gates?.indexApproved, false, 'anyword: index approval is forbidden');
  assert.equal(gates?.sitemapEligible, false, 'anyword: sitemap approval is forbidden');
  assert.equal(gates?.taskCapabilityFitCreationApproved, false, 'anyword: relationship creation is forbidden');
}

export function assertAnywordEmptyPreimage(matches: { id: string }[], fixedIdRows: { id: string }[]) {
  assert.equal(matches.length, 0, 'anyword: duplicate identity or alias requires manual review');
  assert.equal(fixedIdRows.length, 0, 'anyword: fixed ID is occupied');
}

export function assertAnywordProtectedRowsUnchanged(before: unknown[], after: unknown[]) {
  assert.deepEqual(after, before, 'anyword: protected existing tool rows changed');
}

export function assertAnywordAsset(
  payload: { id: string; imageUrl: string; thumbnailUrl: string },
  sha256: Record<string, string>,
  root = process.cwd(),
) {
  assert.equal(payload.id, ANYWORD_RELEASE_ID, 'anyword: fixed ID changed');
  assert.equal(payload.imageUrl, ANYWORD_EDITORIAL_ASSET, 'anyword: reviewed editorial asset changed');
  assert.equal(payload.thumbnailUrl, ANYWORD_EDITORIAL_ASSET, 'anyword: display asset changed');
  const digest = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'public', ANYWORD_EDITORIAL_ASSET.slice(1))))
    .digest('hex');
  assert.equal(digest, sha256[ANYWORD_EDITORIAL_ASSET], 'anyword: asset hash mismatch');
}

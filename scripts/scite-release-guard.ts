import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SCITE_RELEASE_ID = '13aa730f-4a82-4fc6-b9fa-93855aa8d921';
export const SCITE_EDITORIAL_ASSET = '/images/tool-media/scite-editorial-cover.svg';

export function assertSciteEmptyPreimage(matches: { id: string }[], fixedIdRows: { id: string }[]) {
  assert.equal(matches.length, 0, 'scite: duplicate identity or alias requires manual review');
  assert.equal(fixedIdRows.length, 0, 'scite: fixed ID is occupied');
}

export function assertSciteProtectedRowsUnchanged(before: unknown[], after: unknown[]) {
  assert.deepEqual(after, before, 'scite: protected existing tool rows changed');
}

export function assertSciteAsset(
  payload: { id: string; imageUrl: string; thumbnailUrl: string },
  sha256: Record<string, string>,
  root = process.cwd(),
) {
  assert.equal(payload.id, SCITE_RELEASE_ID, 'scite: fixed ID changed');
  assert.equal(payload.imageUrl, SCITE_EDITORIAL_ASSET, 'scite: reviewed editorial asset changed');
  assert.equal(payload.thumbnailUrl, SCITE_EDITORIAL_ASSET, 'scite: display asset changed');
  const digest = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'public', SCITE_EDITORIAL_ASSET.slice(1))))
    .digest('hex');
  assert.equal(digest, sha256[SCITE_EDITORIAL_ASSET], 'scite: asset hash mismatch');
}

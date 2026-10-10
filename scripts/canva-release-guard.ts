import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CANVA_RELEASE_ID = '7f37933d-7e61-4a47-bc6e-85bc1bc224c4';
export const CANVA_EDITORIAL_ASSET = '/images/tool-media/canva-editorial-cover.svg';

function normalizedQueryEntries(query: string) {
  return [...new URLSearchParams(query).entries()].sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    const keyOrder = leftKey.localeCompare(rightKey);
    return keyOrder || leftValue.localeCompare(rightValue);
  });
}

export function assertCanvaAliasPreflight(input: {
  aliasPath: string;
  targetPath: string;
  query: string;
  status: number;
  location: string | null;
  canonical: string | null;
  noindex: boolean;
  sitemapContainsAlias: boolean;
  allowExistingShell: boolean;
}) {
  const origin = 'https://aibesttool.com';
  assert(!input.sitemapContainsAlias, `${input.aliasPath}: shell leaked into sitemap`);

  if (input.status === 200 && input.allowExistingShell) {
    assert.equal(input.location, null, `${input.aliasPath}: reserved shell must not redirect`);
    assert.equal(
      input.canonical,
      `${origin}${input.aliasPath}`,
      `${input.aliasPath}: existing shell canonical mismatch`,
    );
    assert(input.noindex, `${input.aliasPath}: existing shell must remain noindex before deployment`);
    return 'reserved-shell';
  }

  assert.equal(input.status, 308, `${input.aliasPath}: alias must be reserved 200 or expected HTTP 308`);
  assert(input.location, `${input.aliasPath}: HTTP 308 is missing Location`);
  const location = new URL(input.location, origin);
  assert.equal(location.origin, origin, `${input.aliasPath}: alias target changed origin`);
  assert.equal(location.pathname, input.targetPath, `${input.aliasPath}: alias crossed locale or missed canonical`);
  assert.deepEqual(
    normalizedQueryEntries(location.search),
    normalizedQueryEntries(input.query),
    `${input.aliasPath}: query was dropped or changed`,
  );
  assert.equal(location.hash, '', `${input.aliasPath}: unexpected fragment in alias target`);
  assert.equal(location.username, '', `${input.aliasPath}: unexpected credentials in alias target`);
  assert.equal(location.password, '', `${input.aliasPath}: unexpected credentials in alias target`);
  return 'canonical-redirect';
}

export function assertCanvaEmptyPreimage(matches: { id: string }[], fixedIdRows: { id: string }[]) {
  assert.equal(matches.length, 0, 'Canva: exact product/surface identity match requires manual review');
  assert.equal(fixedIdRows.length, 0, 'Canva: fixed ID is occupied');
}

export function assertCanvaProtectedRowsUnchanged(before: unknown[], after: unknown[]) {
  assert.deepEqual(after, before, 'Canva: protected existing tool rows changed');
}

export function isCanvaIdentityFieldMatch(input: { name?: string; title?: unknown; url?: string }) {
  const names = new Set(['canva', 'canva ai', 'canva magic studio', 'magic studio', 'magic write']);
  const name = input.name?.trim().toLowerCase() || '';
  const title = typeof input.title === 'string' ? input.title : JSON.stringify(input.title || '');
  let officialDomain = false;
  try {
    officialDomain = new URL(input.url || '').hostname.toLowerCase().replace(/^www\./, '') === 'canva.com';
  } catch {
    officialDomain = false;
  }
  return names.has(name) || officialDomain || /(^|[^a-z])canva([^a-z]|$)|magic\s+studio|magic\s+write/i.test(title);
}

export function assertCanvaAsset(
  payload: { id: string; imageUrl: string; thumbnailUrl: string },
  sha256: Record<string, string>,
  root = process.cwd(),
) {
  assert.equal(payload.id, CANVA_RELEASE_ID, 'Canva: fixed ID changed');
  assert.equal(payload.imageUrl, CANVA_EDITORIAL_ASSET, 'Canva: reviewed editorial asset changed');
  assert.equal(payload.thumbnailUrl, CANVA_EDITORIAL_ASSET, 'Canva: display asset changed');
  const digest = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'public', CANVA_EDITORIAL_ASSET.slice(1))))
    .digest('hex');
  assert.equal(digest, sha256[CANVA_EDITORIAL_ASSET], 'Canva: asset hash mismatch');
}

export function assertCanvaReleasePayload(payload: {
  id: string;
  slug: string;
  officialUrl: string;
  reviewedAt: string;
  nextReviewDate: string;
  title: Record<string, string>;
  content: Record<string, string>;
  detail: Record<string, string>;
  imageUrl: string;
  thumbnailUrl: string;
  features: Record<string, any>;
}) {
  assert.equal(payload.slug, 'canva');
  assert.equal(payload.officialUrl, 'https://www.canva.com/');
  assert.equal(payload.features.release?.target, 'published_monitor_noindex');
  assert.equal(payload.features.release?.sitemapEligible, false);
  assert.equal(payload.features.release?.indexApproved, false);
  assert.equal(payload.features.release?.relationshipCreationApproved, false);
  assert.equal(payload.features.editorial?.nextReviewDate, payload.nextReviewDate);
  assert.equal(payload.nextReviewDate, '2026-10-17');
  for (const locale of ['en', 'zh', 'cn']) {
    let correctionLabel: string;
    if (locale === 'en') {
      correctionLabel = 'Correction and owner updates';
    } else if (locale === 'zh') {
      correctionLabel = '纠错与 Owner 更新';
    } else {
      correctionLabel = '更正與 Owner 更新';
    }
    assert(payload.title[locale], `Canva: ${locale} title missing`);
    assert(payload.content[locale], `Canva: ${locale} content missing`);
    assert(payload.detail[locale]?.includes('2026-10-17'), `Canva: ${locale} next review missing`);
    assert(payload.detail[locale]?.includes(correctionLabel), `Canva: ${locale} correction path missing`);
    assert(
      !/\$\s?\d|\b\d+\s*(?:credits?|uses?|generations?)\b/i.test(payload.detail[locale]),
      `Canva: unsupported exact price/quota assertion in ${locale}`,
    );
  }
  assertCanvaAsset(
    payload,
    payload.features.media?.sha256 ? { [CANVA_EDITORIAL_ASSET]: payload.features.media.sha256 } : {},
  );
}

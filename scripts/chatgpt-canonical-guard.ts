import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Client } from 'pg';

export const CHATGPT_CANONICAL_ID = 'c6a77a90-0bce-4f37-a124-7600e81475a1';
export const CHATGPT_PROTECTED_IDS = {
  'chatgpt-mac': '22561562-5b7e-4e32-b629-ea8626abeeda',
  gpt_4o: '73a3ca28-707c-4460-b769-50ee47ba5e69',
  openai: '1ac05946-fab2-48bf-9c5d-6188124db8fb',
  codex: '35b7a4ae-1200-41f2-94c5-d5ba4dc98704',
} as const;

export type ChatgptGuardPayload = {
  id: string;
  slug: string;
  officialUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  features: { claims: Array<{ id: string; status: string }> };
};

export function assertChatgptPayload(payload: ChatgptGuardPayload, assetSha256: Record<string, string>) {
  assert.equal(payload.id, CHATGPT_CANONICAL_ID, 'ChatGPT fixed ID changed');
  assert.equal(payload.slug, 'chatgpt');
  assert.equal(payload.officialUrl, 'https://chatgpt.com/');
  const assets = [payload.imageUrl, payload.thumbnailUrl];
  assert.equal(new Set(assets).size, 2, 'ChatGPT assets must be distinct');
  assert.deepEqual(Object.keys(assetSha256).sort(), assets.sort(), 'ChatGPT asset manifest differs');
  for (const asset of assets) {
    assert(asset.startsWith('/') && !asset.includes('..'));
    const digest = createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'public', asset.slice(1)))).digest('hex');
    assert.equal(digest, assetSha256[asset], `ChatGPT asset hash mismatch: ${asset}`);
  }
  const expected = new Map([
    ['product-identity', 'verified_public'],
    ['plan-entitlements', 'conditional'],
    ['specific-model-quota', 'unknown'],
    ['personal-training-control', 'conditional'],
    ['business-training-default', 'conditional'],
    ['connector-memory-region', 'unknown'],
  ]);
  assert.equal(payload.features.claims.length, expected.size, 'ChatGPT claim count changed');
  for (const claim of payload.features.claims) {
    assert.equal(claim.status, expected.get(claim.id), `ChatGPT claim scope changed: ${claim.id}`);
    expected.delete(claim.id);
  }
  assert.equal(expected.size, 0);
}

export function assertChatgptEmptyPreimage(matches: Array<{ id: string }>, fixedIdRows: Array<{ id: string }>) {
  assert.equal(matches.length, 0, 'ChatGPT duplicate product, domain root or alias exists');
  assert.equal(fixedIdRows.length, 0, 'ChatGPT fixed ID is occupied');
}

export async function findChatgptIdentityMatches(client: Client) {
  return client.query(
    `SELECT id,name,url,status,page_quality_status FROM public.tools
      WHERE lower(regexp_replace(name,'[^a-z0-9]','','g'))='chatgpt'
         OR lower(regexp_replace(trim(trailing '/' from url),'^https?://(www\\.)?','','i'))='chatgpt.com'
         OR lower(title->>'en')='chatgpt'
      ORDER BY id`,
  );
}

export async function readChatgptProtectedState(client: Client) {
  const protectedRows = await client.query(
    `SELECT name, id, status, page_quality_status, url,
            md5((to_jsonb(t)-'search_vector')::text) AS row_md5
       FROM public.tools t WHERE name=ANY($1::text[]) ORDER BY name`,
    [Object.keys(CHATGPT_PROTECTED_IDS)],
  );
  assert.equal(protectedRows.rowCount, 4, 'OpenAI family protected row count changed');
  for (const row of protectedRows.rows) {
    assert.equal(row.id, CHATGPT_PROTECTED_IDS[row.name as keyof typeof CHATGPT_PROTECTED_IDS], `${row.name}: protected ID changed`);
    assert.equal(row.status, 'published', `${row.name}: status changed`);
    assert.equal(row.page_quality_status, 'monitor', `${row.name}: quality status changed`);
  }
  const relationSpecs = [
    ['capabilities', 'tool_capabilities', 'tool_id=$1'],
    ['fits', 'tool_task_fits', 'tool_id=$1'],
    ['tasks', 'decision_tasks', "slug='chatgpt'"],
    ['release_log', 'tool_index_release_log', 'tool_id=$1'],
    ['review_runs', 'tool_index_review_runs', 'tool_id=$1'],
  ] as const;
  const relations: Record<string, number> = {};
  for (const [label, table, where] of relationSpecs) {
    const exists = await client.query('SELECT to_regclass($1) IS NOT NULL AS present', [`public.${table}`]);
    if (!exists.rows[0].present) {
      relations[label] = 0;
      continue;
    }
    const count = await client.query(`SELECT count(*)::int AS n FROM public.${table} WHERE ${where}`, where.includes('$1') ? [CHATGPT_CANONICAL_ID] : []);
    relations[label] = count.rows[0].n;
  }
  assert(Object.values(relations).every((value) => value === 0), 'ChatGPT ancillary rows require review');
  return JSON.stringify({ protectedRows: protectedRows.rows, relations });
}

export function assertChatgptProtectedStateUnchanged(before: string, after: string) {
  assert.equal(after, before, 'OpenAI family protected rows or ChatGPT ancillary state changed');
}

export function assertChatgptOnlineAsset(
  html: string,
  asset: { thumbnailUrl: string | null; imageUrl: string | null },
) {
  const expected = asset.thumbnailUrl || asset.imageUrl;
  assert(expected?.startsWith('/') && !expected.startsWith('//'), 'ChatGPT database display asset is missing');
  const renderedSources = [...html.matchAll(/<img\b[^>]*>/gi)]
    .filter(([tag]) => /\balt="[^"]* interface preview"/i.test(tag))
    .map(([tag]) => tag.match(/\bsrc="([^"]+)"/i)?.[1])
    .filter(Boolean);
  assert(renderedSources.includes(expected), `ChatGPT database-backed display asset is missing: ${expected}`);
}

export function assertChatgptMacRedirectTarget(
  sourcePath: string,
  status: number,
  location: string | null,
  targetStatus: number,
  targetCanonical: string | null,
) {
  const match = sourcePath.match(/^\/(?:((?:en|cn|jp|de|es|fr|pt|ru|tw))\/)?ai\/chatgpt-mac$/);
  assert(match, `Unsupported Mac source path: ${sourcePath}`);
  const locale = match[1];
  const expected = locale && locale !== 'en' ? `/${locale}/ai/chatgpt` : '/ai/chatgpt';
  assert.equal(status, 308, `${sourcePath}: requires a single permanent redirect`);
  assert.equal(location, expected, `${sourcePath}: cross-locale or chained redirect`);
  assert.equal(targetStatus, 200, `${expected}: target unavailable`);
  assert.equal(targetCanonical, `https://aibesttool.com${expected}`, `${expected}: target canonical mismatch`);
}

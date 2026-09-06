import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getHistoricalToolFactReview } from '../lib/config/historicalToolFactReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const records = [
  ['2443fa93-effd-4a9b-857a-5728e482efe9', 'artiversehub-ai', '37123d9ec5fe35d26ce45028c7328aa8'],
  ['c00e172c-5121-4c9e-826d-b7cc40faf559', 'fastimage-ai-sketch-to-image', 'a2b844e3d99ec53c0146de9b32f9bcec'],
  ['38b8635f-7d00-4809-813a-052af63c83bd', 'honeydo', '289b25cec9b5446cfe8defc7a36bde24'],
  ['d79b9807-66dd-4f1d-82a8-b77e07b62f79', 'shop_your_ai_powered_Shopping_assistant', '8d740898e9b410713574c0bab2d5a66f'],
  ['b880e586-db24-4a51-b275-e4933229ca81', 'tattooai-design', '49486976e3fdc35355864e1e8c24413a'],
  ['eaa24478-b5ae-4afc-a821-c549fe950a59', 'woy-ai', 'd5585773d77b38fac3b640566415b730'],
] as const;

function payload(slug: string) {
  const en = getHistoricalToolFactReview(slug, 'en');
  const zh = getHistoricalToolFactReview(slug, 'cn');
  assert(en && zh);
  return {
    title: { en: en.title, zh: zh.title, cn: zh.title, tw: zh.title },
    url: en.url,
    content: { en: en.content, zh: zh.content, cn: zh.content, tw: zh.content },
    detail: { en: en.detail, zh: zh.detail, cn: zh.detail, tw: zh.detail },
    nextReviewDate: en.nextReviewDate,
  };
}

function indexInput(row: Record<string, unknown>) {
  return {
    status: row.status as string | null, pageQualityStatus: row.page_quality_status as string | null,
    categoryId: row.category_id as string | null, imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null, content: row.content, detail: row.detail,
    pricing: row.pricing as string | null, tags: row.tags as string[] | null,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  for (const [, slug] of records) {
    const item = payload(slug);
    assert(item.content.en !== item.content.zh && item.detail.en.includes('Official sources'));
  }
  assert(!payload('artiversehub-ai').detail.en.includes('TurboTax'));
  if (args.includes('--check')) return console.log('PASS six bilingual monitor payloads and wrong-entity exclusion');

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const results = [];
    for (const [id, slug, baseline] of records) {
      const item = payload(slug);
      const select = `SELECT *,next_review_date::text AS next_review_date_text,md5(content::text || detail::text) AS baseline,
        to_jsonb(t)-'title'-'url'-'content'-'detail'-'page_quality_status'-'next_review_date'-'updated_at'-'search_vector' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id, slug])).rows[0];
      assert(before, `${slug}: fixed record missing`);
      const applied = isDeepStrictEqual(before.content, item.content) && isDeepStrictEqual(before.detail, item.detail) &&
        before.page_quality_status === 'monitor' && before.next_review_date_text === item.nextReviewDate;
      const beforeIndexable = getToolIndexDecision(indexInput(before)).indexable;
      if (args.includes('--status')) { results.push({ slug, applied, nextReviewDate: before.next_review_date_text }); continue; }
      if (!applied) {
        assert.equal(before.baseline, baseline, `${slug}: source changed; stop and audit`);
        await client.query(`UPDATE public.tools SET title=$2::jsonb,url=$3,content=$4::jsonb,detail=$5::jsonb,
          page_quality_status='monitor',next_review_date=$6::date,updated_at=now() WHERE id=$1`,
          [id, JSON.stringify(item.title), item.url, JSON.stringify(item.content), JSON.stringify(item.detail), item.nextReviewDate]);
      }
      const after = (await client.query(select, [id, slug])).rows[0];
      assert.deepEqual(after.stable, before.stable, `${slug}: protected fields changed`);
      assert.deepEqual(after.content, item.content); assert.deepEqual(after.detail, item.detail);
      assert.equal(after.page_quality_status, 'monitor'); assert.equal(after.next_review_date_text, item.nextReviewDate);
      assert.equal(getToolIndexDecision(indexInput(after)).indexable, false);
      results.push({ slug, applied, beforeIndexable, isolatedFromIndex: true });
    }
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', results }, null, 2));
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { await client.end(); }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });

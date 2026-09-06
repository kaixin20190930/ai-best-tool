import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getSafetyToolReview } from '../lib/config/safetyToolReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const records = [
  ['ce8b79e7-7b6a-4552-9c49-5d958aa04829', 'aigirl-best', '7bef398b102bc46d2adf6cacf8cf1657'],
  ['e5a1f5c0-e737-4a12-9c96-d8ef54de2c02', 'anime-girl-studio', '2be51f0f48913a5f41291223356dfcd3'],
  ['a35a82da-3d9d-4e11-97b7-d2dc4e2a210f', 'undressing_ai', 'fb8f5b6ab291be759491bf99d34f0064'],
] as const;

function payload(slug: string) {
  const en = getSafetyToolReview(slug, 'en');
  const zh = getSafetyToolReview(slug, 'cn');
  assert(en && zh);
  return {
    title: { en: en.title, zh: zh.title, cn: zh.title, tw: zh.title },
    content: { en: en.content, zh: zh.content, cn: zh.content, tw: zh.content },
    detail: { en: en.detail, zh: zh.detail, cn: zh.detail, tw: zh.detail },
    pageQualityStatus: en.disposition,
    nextReviewDate: en.nextReviewDate,
  };
}

function indexInput(row: Record<string, unknown>) {
  return {
    status: row.status as string | null,
    pageQualityStatus: row.page_quality_status as string | null,
    categoryId: row.category_id as string | null,
    imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    content: row.content,
    detail: row.detail,
    pricing: row.pricing as string | null,
    tags: row.tags as string[] | null,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  for (const [, slug] of records) {
    const item = payload(slug);
    assert.notEqual(item.content.en, item.content.zh);
    assert(!item.detail.en.toLowerCase().includes('try now'));
  }
  assert.equal(payload('undressing_ai').pageQualityStatus, 'archive');
  if (args.includes('--check')) return console.log('PASS three safety isolation payloads');

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
      const select = `SELECT *, next_review_date::text AS next_review_date_text,
        md5(content::text || detail::text) AS baseline,
        to_jsonb(t)-'title'-'content'-'detail'-'page_quality_status'-'next_review_date'-'updated_at'-'search_vector' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id, slug])).rows[0];
      assert(before, `${slug}: fixed record missing`);
      const applied = isDeepStrictEqual(before.content, item.content) && isDeepStrictEqual(before.detail, item.detail) &&
        before.page_quality_status === item.pageQualityStatus && before.next_review_date_text === item.nextReviewDate;
      const beforeIndexable = getToolIndexDecision(indexInput(before)).indexable;
      if (args.includes('--status')) {
        results.push({ slug, applied, pageQualityStatus: before.page_quality_status, nextReviewDate: before.next_review_date_text });
        continue;
      }
      if (!applied) {
        assert.equal(before.baseline, baseline, `${slug}: source changed; stop and audit`);
        await client.query(
          `UPDATE public.tools SET title=$2::jsonb,content=$3::jsonb,detail=$4::jsonb,
           page_quality_status=$5,next_review_date=$6::date,updated_at=now() WHERE id=$1`,
          [id, JSON.stringify(item.title), JSON.stringify(item.content), JSON.stringify(item.detail), item.pageQualityStatus, item.nextReviewDate],
        );
      }
      const after = (await client.query(select, [id, slug])).rows[0];
      assert.deepEqual(after.stable, before.stable, `${slug}: protected fields changed`);
      assert.deepEqual(after.content, item.content);
      assert.deepEqual(after.detail, item.detail);
      assert.equal(after.page_quality_status, item.pageQualityStatus);
      assert.equal(after.next_review_date_text, item.nextReviewDate);
      assert.equal(getToolIndexDecision(indexInput(after)).indexable, false);
      results.push({ slug, applied, beforeIndexable, isolatedFromIndex: true, disposition: item.pageQualityStatus });
    }
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', results }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

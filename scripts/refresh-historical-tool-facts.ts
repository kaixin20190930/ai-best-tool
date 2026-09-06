import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import REVIEWS, { getHistoricalToolFactReview } from '../lib/config/historicalToolFactReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const records = [
  ['48256626-68c0-4cbc-a120-126f5ca03179', 'character_ai', '7538884ffdcba014af8ea4748e08c8d5'],
  ['603c7a89-e42f-4543-a7a6-2bcfdc00f00b', 'shutterstock', 'a839e1e6c1c1efb3d4b82cbb4e9eb9cc'],
  ['fc8fce43-88ef-4817-ac3f-028231da4b4b', 'suno_ai', 'e79800e024e421e76cc3344ff932a249'],
  ['a838bc9e-6653-4608-86d5-144cb703075b', 'viggle', 'eb49b57454361f2a029e7e525f42abb4'],
] as const;

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

function payload(slug: string) {
  const en = getHistoricalToolFactReview(slug, 'en');
  const zh = getHistoricalToolFactReview(slug, 'cn');
  assert(en && zh, `${slug}: fact review missing`);
  return {
    title: { en: en.title, zh: zh.title, cn: zh.title, tw: zh.title },
    url: en.url,
    content: { en: en.content, zh: zh.content, cn: zh.content, tw: zh.content },
    detail: { en: en.detail, zh: zh.detail, cn: zh.detail, tw: zh.detail },
    nextReviewDate: en.nextReviewDate,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  assert(records.every(([, slug]) => Object.prototype.hasOwnProperty.call(REVIEWS, slug)));
  for (const [, slug] of records) {
    const item = payload(slug);
    assert(item.content.en !== item.content.zh && item.detail.zh.includes('官方来源'));
    assert(item.detail.en.includes('not independently') || item.detail.en.includes('not an independent'));
  }
  if (args.includes('--check')) {
    console.log('PASS four bounded bilingual fact reviews and explicit independent-testing limits');
    return;
  }

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
        to_jsonb(t)-'title'-'url'-'content'-'detail'-'next_review_date'-'updated_at'-'search_vector' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const params = [id, slug];
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
      assert(before, `${slug}: fixed record not found`);
      const alreadyApplied =
        isDeepStrictEqual(before.title, item.title) &&
        isDeepStrictEqual(before.content, item.content) &&
        isDeepStrictEqual(before.detail, item.detail) &&
        before.url === item.url &&
        before.next_review_date_text === item.nextReviewDate;
      if (args.includes('--status')) {
        results.push({ slug, baseline: before.baseline, nextReviewDate: before.next_review_date_text, alreadyApplied });
        continue;
      }
      if (!alreadyApplied) {
        assert.equal(before.baseline, baseline, `${slug}: source changed; audit instead of overwriting`);
        assert.equal(before.status, 'published');
        assert.equal(before.page_quality_status, 'continue_index');
        await client.query(
          `UPDATE public.tools SET title=$2::jsonb,url=$3,content=$4::jsonb,detail=$5::jsonb,
            next_review_date=$6::date,updated_at=now() WHERE id=$1`,
          [id, JSON.stringify(item.title), item.url, JSON.stringify(item.content), JSON.stringify(item.detail), item.nextReviewDate],
        );
      }
      const after = (await client.query(select, params)).rows[0];
      assert.deepEqual(after.stable, before.stable, `${slug}: protected fields changed`);
      assert.deepEqual(after.title, item.title);
      assert.deepEqual(after.content, item.content);
      assert.deepEqual(after.detail, item.detail);
      assert.equal(after.url, item.url);
      assert.equal(after.next_review_date_text, item.nextReviewDate);
      assert.equal(getToolIndexDecision(indexInput(after)).indexable, true, `${slug}: index decision must remain approved`);
      results.push({ slug, alreadyApplied, indexDecisionUnchanged: true });
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

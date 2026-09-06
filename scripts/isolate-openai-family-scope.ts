import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getLegacyToolScopeContent } from '../lib/config/legacyToolScopeReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const records = [
  {
    id: '22561562-5b7e-4e32-b629-ea8626abeeda',
    slug: 'chatgpt-mac',
    baseline: 'd2e5f5c36e6528f9f8444bbf4c67c70b',
    nextReviewDate: '2026-10-06',
  },
  {
    id: '73a3ca28-707c-4460-b769-50ee47ba5e69',
    slug: 'gpt_4o',
    baseline: 'e7cbec9d3f207a52fdd052c3d3fe490e',
    nextReviewDate: '2026-10-06',
  },
  {
    id: '1ac05946-fab2-48bf-9c5d-6188124db8fb',
    slug: 'openai',
    baseline: '4bf9a90ed4e0529d602531f53275eeff',
    nextReviewDate: '2026-10-06',
  },
  {
    id: '3b03eb5b-0cf6-4466-bfba-3fb66e07d8d6',
    slug: 'sora',
    baseline: '4183012fcc043335f2aa46077317832a',
    nextReviewDate: '2026-09-25',
  },
] as const;

function localizedPayload(slug: string) {
  const en = getLegacyToolScopeContent(slug, 'en');
  const zh = getLegacyToolScopeContent(slug, 'cn');
  assert(en && zh, `${slug}: scope correction missing`);
  return {
    title: { en: en.title, zh: zh.title, cn: zh.title, tw: zh.title },
    content: { en: en.content, zh: zh.content, cn: zh.content, tw: zh.content },
    detail: { en: en.detail, zh: zh.detail, cn: zh.detail, tw: zh.detail },
    url: en.url,
  };
}

function indexInput(row: Record<string, unknown>, pageQualityStatus = row.page_quality_status) {
  return {
    status: row.status as string | null,
    pageQualityStatus: pageQualityStatus as string | null,
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
  for (const record of records) {
    const payload = localizedPayload(record.slug);
    assert(payload.content.en !== payload.content.zh);
    assert(payload.detail.en.includes('Official sources'));
    assert(payload.url.startsWith('https://'));
  }
  assert(!localizedPayload('chatgpt-mac').detail.en.includes('artiversehub.ai'));
  assert(!localizedPayload('gpt_4o').detail.en.includes('HIPAA compliant'));
  assert(localizedPayload('sora').detail.en.includes('discontinued'));
  if (args.includes('--check')) {
    console.log('PASS four bilingual corrections, official URLs and unsafe legacy-claim exclusions');
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
    for (const record of records) {
      const payload = localizedPayload(record.slug);
      const select = `SELECT *, next_review_date::text AS next_review_date_text,
        md5(content::text || detail::text) AS baseline,
        to_jsonb(t)-'title'-'url'-'content'-'detail'-'page_quality_status'-'next_review_date'-'updated_at'-'search_vector' AS stable
        FROM public.tools t WHERE id=$1 AND name=$2`;
      const params = [record.id, record.slug];
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
      assert(before, `${record.slug}: fixed record not found`);
      const alreadyApplied =
        isDeepStrictEqual(before.title, payload.title) &&
        isDeepStrictEqual(before.content, payload.content) &&
        isDeepStrictEqual(before.detail, payload.detail) &&
        before.url === payload.url &&
        before.page_quality_status === 'monitor' &&
        before.next_review_date_text === record.nextReviewDate;
      if (args.includes('--status')) {
        results.push({
          slug: record.slug,
          baseline: before.baseline,
          pageQualityStatus: before.page_quality_status,
          nextReviewDate: before.next_review_date_text,
          alreadyApplied,
        });
        continue;
      }
      if (!alreadyApplied) {
        assert.equal(before.baseline, record.baseline, `${record.slug}: source changed; audit instead of overwriting`);
        assert.equal(getToolIndexDecision(indexInput(before)).indexable, true, `${record.slug}: unexpected pre-index state`);
        await client.query(
          `UPDATE public.tools SET title=$2::jsonb,url=$3,content=$4::jsonb,detail=$5::jsonb,
            page_quality_status='monitor',next_review_date=$6::date,updated_at=now() WHERE id=$1`,
          [
            record.id,
            JSON.stringify(payload.title),
            payload.url,
            JSON.stringify(payload.content),
            JSON.stringify(payload.detail),
            record.nextReviewDate,
          ],
        );
      }
      const after = (await client.query(select, params)).rows[0];
      assert.deepEqual(after.stable, before.stable, `${record.slug}: protected fields changed`);
      assert.deepEqual(after.title, payload.title);
      assert.deepEqual(after.content, payload.content);
      assert.deepEqual(after.detail, payload.detail);
      assert.equal(after.url, payload.url);
      assert.equal(after.page_quality_status, 'monitor');
      assert.equal(after.next_review_date_text, record.nextReviewDate);
      assert.equal(getToolIndexDecision(indexInput(after)).indexable, false, `${record.slug}: must leave index scope`);
      results.push({ slug: record.slug, alreadyApplied, isolatedFromIndex: true });
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

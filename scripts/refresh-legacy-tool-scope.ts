import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getLegacyToolScopeContent } from '../lib/config/legacyToolScopeReviews';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const records = [
  {
    id: 'eca3ba76-9e1c-449d-bfa8-43e1a390d681',
    slug: 'adobe',
    baseline: 'c8ef55457569ec1925c69a92088e0c4a',
  },
  {
    id: '44dd71ec-57fb-4d1b-b702-002693fb7c36',
    slug: 'salesforce_einstein',
    baseline: '60e3c200bf65ae5b7b8f46978e86beae',
  },
] as const;

const localizedPayload = (slug: string) => {
  const en = getLegacyToolScopeContent(slug, 'en');
  const zh = getLegacyToolScopeContent(slug, 'cn');
  assert(en && zh, `${slug}: scope correction missing`);
  return {
    content: { en: en.content, zh: zh.content, cn: zh.content, tw: zh.content },
    detail: { en: en.detail, zh: zh.detail, cn: zh.detail, tw: zh.detail },
  };
};

function indexInput(row: Record<string, unknown>, content = row.content, detail = row.detail) {
  return {
    status: row.status as string | null,
    pageQualityStatus: row.page_quality_status as string | null,
    categoryId: row.category_id as string | null,
    imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    content,
    detail,
    pricing: row.pricing as string | null,
    tags: row.tags as string[] | null,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));

  for (const record of records) {
    const payload = localizedPayload(record.slug);
    assert(payload.content.en !== payload.content.zh && /[\u4e00-\u9fff]/.test(payload.content.zh));
    assert(payload.detail.en.includes('Official sources'));
    assert(payload.detail.zh.includes('官方来源'));
    assert(!payload.detail.en.includes('Core Features'));
  }
  if (args.includes('--check')) {
    console.log('PASS two bounded bilingual payloads, scope sources and no legacy feature claims');
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
      const select = `SELECT *, md5(content::text || detail::text) AS baseline,
        to_jsonb(t)-'content'-'detail'-'updated_at'-'search_vector' AS stable
        FROM tools t WHERE id=$1 AND name=$2`;
      const params = [record.id, record.slug];
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
      assert(before, `${record.slug}: fixed record not found`);
      const beforeIndex = getToolIndexDecision(indexInput(before));
      const afterIndex = getToolIndexDecision(indexInput(before, payload.content, payload.detail));
      const alreadyApplied =
        JSON.stringify(before.content) === JSON.stringify(payload.content) &&
        JSON.stringify(before.detail) === JSON.stringify(payload.detail);

      if (args.includes('--status')) {
        results.push({
          slug: record.slug,
          id: record.id,
          baseline: before.baseline,
          updatedAt: before.updated_at,
          status: before.status,
          pageQualityStatus: before.page_quality_status,
          beforeIndex,
          afterIndex,
          alreadyApplied,
        });
        continue;
      }

      assert(record.baseline, `${record.slug}: audited baseline has not been recorded`);
      if (!alreadyApplied) {
        assert.equal(before.baseline, record.baseline, `${record.slug}: source changed; audit instead of overwriting`);
        await client.query('UPDATE tools SET content=$2::jsonb,detail=$3::jsonb,updated_at=now() WHERE id=$1', [
          record.id,
          JSON.stringify(payload.content),
          JSON.stringify(payload.detail),
        ]);
      }
      const after = (await client.query(select, params)).rows[0];
      assert.deepEqual(after.stable, before.stable, `${record.slug}: protected fields changed`);
      assert.deepEqual(after.content, payload.content);
      assert.deepEqual(after.detail, payload.detail);
      assert.deepEqual(afterIndex, beforeIndex, `${record.slug}: index decision changed`);
      results.push({ slug: record.slug, alreadyApplied, indexDecisionUnchanged: true });
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

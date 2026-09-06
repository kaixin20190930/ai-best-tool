import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = 'fc8fce43-88ef-4817-ac3f-028231da4b4b';
const legacySlug = 'suno_aI';
const canonicalSlug = 'suno_ai';
const contentBaseline = '9e40bb47860de8588ccd32dae6c61f3c';

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
  assert(args.length <= 1 && args.every((arg) => ['--status', '--commit'].includes(arg)));
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    const select = `SELECT *,md5(content::text || detail::text) AS baseline,
      to_jsonb(t)-'name'-'updated_at'-'search_vector' AS stable FROM public.tools t WHERE id=$1`;
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id])).rows[0];
    assert(before && [legacySlug, canonicalSlug].includes(before.name));
    assert.equal(before.baseline, contentBaseline, 'Suno content changed; audit instead of renaming blindly');
    assert.equal(getToolIndexDecision(indexInput(before)).indexable, true);
    if (!args.includes('--status') && before.name === legacySlug) {
      const conflict = await client.query('SELECT id FROM public.tools WHERE name=$1 AND id<>$2', [canonicalSlug, id]);
      assert.equal(conflict.rowCount, 0, 'Canonical Suno slug already belongs to another record');
      await client.query('UPDATE public.tools SET name=$2,updated_at=now() WHERE id=$1', [id, canonicalSlug]);
    }
    const after = (await client.query(select, [id])).rows[0];
    assert.deepEqual(after.stable, before.stable, 'Only slug and updated_at may change');
    assert.equal(after.name, canonicalSlug);
    assert.equal(getToolIndexDecision(indexInput(after)).indexable, true);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', slug: after.name }, null, 2));
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

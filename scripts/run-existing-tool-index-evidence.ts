import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { mergeIndexEvidence } from '../lib/services/indexFastTrackEvidence';

type Manifest = {
  unit: string;
  items: {
    id: string;
    slug: string;
    updatedAt: string;
    featuresMd5: string;
    patch: Record<string, unknown>;
  }[];
};

const allowed = new Set(['evidence', 'audience', 'indexIdentity', 'marketValidation']);
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find((arg) => arg.startsWith('--mode='))?.slice(7) || 'preflight';
  const path = args.find((arg) => arg.startsWith('--manifest='))?.slice(11);
  const qaPath = args.find((arg) => arg.startsWith('--qa-report='))?.slice(12);
  assert(['preflight', 'rollback', 'commit', 'postcheck'].includes(mode));
  assert(path && args.every((arg) => /^--(mode|manifest|qa-report)=/.test(arg)));
  const manifest = JSON.parse(fs.readFileSync(path, 'utf8')) as Manifest;
  assert(manifest.unit && manifest.items.length > 0 && manifest.items.length <= 5);
  assert.equal(new Set(manifest.items.map((item) => item.id)).size, manifest.items.length);
  for (const item of manifest.items) {
    assert(/^[0-9a-f-]{36}$/i.test(item.id) && /^[a-z0-9-]+$/.test(item.slug));
    assert(/^[0-9a-f]{32}$/i.test(item.featuresMd5));
    assert(Object.keys(item.patch).length > 0);
    assert(Object.keys(item.patch).every((key) => allowed.has(key)), 'Unsupported index evidence patch');
  }
  if (mode === 'commit') {
    assert(qaPath, 'Independent QA report required');
    const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
    assert.equal(qa.status, 'QA_PASS');
    assert.equal(qa.unit, manifest.unit);
    assert.equal(qa.manifestSha256, hash(manifest));
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  const result = [];
  try {
    await client.query(mode === 'preflight' || mode === 'postcheck' ? 'BEGIN READ ONLY' : 'BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    for (const item of manifest.items) {
      const row = (await client.query(
        `SELECT id, name, status, page_quality_status, features, updated_at::text AS updated_at,
                md5(features::text) AS features_md5
           FROM public.tools WHERE id=$1${mode === 'rollback' || mode === 'commit' ? ' FOR UPDATE' : ''}`,
        [item.id],
      )).rows[0];
      assert(row && row.name === item.slug && row.status === 'published' && row.page_quality_status === 'monitor');
      for (const [key, value] of Object.entries(item.patch)) {
        assert(value && typeof value === 'object' && !Array.isArray(value));
      }
      const merged = mergeIndexEvidence(row.features, item.patch);
      const applied = hash(merged) === hash(row.features);
      if (mode === 'postcheck') assert(applied, `${item.slug}: expected evidence postimage missing`);
      if (!applied) {
        assert.equal(row.updated_at, item.updatedAt, `${item.slug}: updated_at drift`);
        assert.equal(row.features_md5, item.featuresMd5, `${item.slug}: features drift`);
        if (mode === 'rollback' || mode === 'commit') {
          const changed = await client.query(
            `UPDATE public.tools SET features=$2::jsonb, updated_at=now()
              WHERE id=$1 AND status='published' AND page_quality_status='monitor'
                AND updated_at::text=$3 AND md5(features::text)=$4 RETURNING id`,
            [item.id, JSON.stringify(merged), item.updatedAt, item.featuresMd5],
          );
          assert.equal(changed.rowCount, 1);
        }
      }
      result.push({ slug: item.slug, alreadyApplied: applied, changedKeys: Object.keys(item.patch) });
    }
    await client.query(mode === 'commit' ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ unit: manifest.unit, mode, manifestSha256: hash(manifest),
      productionWrites: mode === 'commit' ? result.filter((item) => !item.alreadyApplied).length : 0,
      result }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

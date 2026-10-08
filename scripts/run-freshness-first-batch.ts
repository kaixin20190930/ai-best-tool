import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { FIRST_BATCH, applyCandidateDetail } from './freshness-first-batch';

const protectedKeys = ['status','page_quality_status','name','url','title','id','pricing'];
const hash = (value: unknown) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readSql = `SELECT to_jsonb(t) - 'search_vector' AS record, next_review_date::text AS due
  FROM public.tools t WHERE id=$1 AND name=$2`;

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--commit') ? 'commit' : args.includes('--rollback') ? 'rollback' : 'preflight';
  if (args.includes('--commit') && args.includes('--rollback')) throw new Error('Choose one mode');
  const manifestPath = args.find(arg => arg.startsWith('--manifest='))?.slice(11);
  if (mode === 'commit' && !manifestPath) throw new Error('Commit requires reviewed --manifest path');
  if (args.some(arg => !['--commit','--rollback'].includes(arg) && !arg.startsWith('--manifest=') && !arg.startsWith('--out='))) throw new Error('Unsupported argument');
  const manifest = manifestPath ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  if (mode === 'commit' && (manifest?.mode !== 'preflight' || manifest?.results?.length !== 5)) throw new Error('Invalid reviewed manifest');
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  const results = [];
  try {
    for (const candidate of FIRST_BATCH) {
      await client.query(mode === 'preflight' ? 'BEGIN READ ONLY' : 'BEGIN');
      try {
        await client.query("SET LOCAL lock_timeout='5s'");
        await client.query("SET LOCAL statement_timeout='30s'");
        const found = await client.query(`${readSql}${mode === 'preflight' ? '' : ' FOR UPDATE'}`, [candidate.id, candidate.slug]);
        assert.equal(found.rowCount, 1, `${candidate.slug}: entity missing or duplicate`);
        const before = found.rows[0].record;
        assert.equal(before.status, 'published');
        assert(['monitor','continue_index'].includes(before.page_quality_status));
        assert(before.features && typeof before.features === 'object' && !Array.isArray(before.features));
        if (!before.url || !/^https:\/\//.test(before.url)) throw new Error(`${candidate.slug}: entity URL risk`);
        const beforeHash = hash(before);
        const approved = manifest?.results?.find((item: any) => item.slug === candidate.slug);
        if (mode === 'commit' && (!approved || approved.preimageSha256 !== beforeHash)) throw new Error(`${candidate.slug}: preimage drift`);
        const alreadyApplied = before.features?.maintenanceReview?.checkedAt === candidate.checkedAt &&
          before.features?.maintenanceReview?.changeSummary === candidate.changeSummary &&
          found.rows[0].due === candidate.nextReviewDate;
        const next = structuredClone(before);
        next.detail = alreadyApplied ? before.detail : applyCandidateDetail(before.detail, candidate);
        next.features = { ...before.features, maintenanceReview: {
          ...(before.features.maintenanceReview || {}),
          checkedAt: candidate.checkedAt, nextReviewDate: candidate.nextReviewDate,
          outcome: candidate.outcome, changeSummary: candidate.changeSummary,
          scope: candidate.scope, sources: candidate.sources, unresolved: candidate.unresolved,
          claims: candidate.claims || [],
        } };
        if (candidate.pricingSnapshot) next.features.pricingSnapshot = candidate.pricingSnapshot;
        next.next_review_date = candidate.nextReviewDate;
        for (const key of protectedKeys) assert.deepEqual(next[key], before[key], `${candidate.slug}: protected ${key}`);
        const changes = ['detail','features','next_review_date'].filter(key => JSON.stringify(next[key]) !== JSON.stringify(before[key]));
        assert(changes.every(key => ['detail','features','next_review_date'].includes(key)));
        if (mode !== 'preflight' && !alreadyApplied) {
          await client.query(`UPDATE public.tools SET detail=$2::jsonb, features=$3::jsonb,
            next_review_date=$4::date, updated_at=now() WHERE id=$1`,
            [candidate.id, JSON.stringify(next.detail), JSON.stringify(next.features), candidate.nextReviewDate]);
          const after = (await client.query(readSql, [candidate.id, candidate.slug])).rows[0].record;
          for (const key of Object.keys(before).filter(key => !['detail','features','next_review_date','updated_at'].includes(key)))
            assert.deepEqual(after[key], before[key], `${candidate.slug}: unexpected ${key}`);
          assert.deepEqual(after.detail, next.detail);
          assert.deepEqual(after.features, next.features);
          assert.equal(after.next_review_date, candidate.nextReviewDate);
        }
        if (mode === 'commit') await client.query('COMMIT'); else await client.query('ROLLBACK');
        results.push({ slug: candidate.slug, outcome: candidate.outcome, preimageSha256: beforeHash,
          changedFields: alreadyApplied ? [] : changes, nextReviewDate: candidate.nextReviewDate,
          sources: candidate.sources, unresolved: candidate.unresolved, status: alreadyApplied ? 'already_applied' : mode === 'commit' ? 'committed' : mode === 'rollback' ? 'rolled_back' : 'ready' });
      } catch (error) { await client.query('ROLLBACK'); throw error; }
    }
    const output = { mode, productionWrites: mode === 'commit' ? results.filter(row => row.status === 'committed').length : 0, results };
    const out = args.find(arg => arg.startsWith('--out='))?.slice(6);
    if (out) fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
    else console.log(JSON.stringify(output, null, 2));
  } finally { await client.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

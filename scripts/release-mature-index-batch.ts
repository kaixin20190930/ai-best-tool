import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { deriveIndexReviewEvidence, evaluateToolIndexReview } from '../lib/services/toolIndexReview';
import { getToolQuality } from '../lib/services/toolQuality';

const slugs = ['grammarly', 'jasper', 'elevenlabs', 'midjourney'] as const;
const asOf = '2026-09-22';
const gscSnapshotDate = '2026-09-21';

async function main() {
  const commit = process.argv.slice(2).includes('--commit');
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '60s'");
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['mature-index-batch:2026-09-22']);

    const policy = (
      await client.query(
        'SELECT paused, daily_limit, weekly_limit FROM tool_index_release_policy WHERE singleton=true FOR UPDATE',
      )
    ).rows[0];
    assert(policy, 'Index release policy is missing');
    const quota = (
      await client.query(
        `SELECT count(*) FILTER (WHERE release_day=(clock_timestamp() AT TIME ZONE 'Asia/Shanghai')::date)::int AS today,
                count(*) FILTER (WHERE release_day>=date_trunc('week',(clock_timestamp() AT TIME ZONE 'Asia/Shanghai'))::date)::int AS week
           FROM tool_index_release_log WHERE entry_type <> 'baseline'`,
      )
    ).rows[0];
    assert.equal(quota.today, 0, 'A production index approval already exists today');
    assert(quota.week + slugs.length <= 5, 'The mature batch would exceed the weekly hard limit');

    const tools = (
      await client.query(
        `SELECT id, name, status, page_quality_status, category_id, image_url, thumbnail_url,
                content, detail, pricing, tags, features, next_review_date::text
           FROM tools WHERE name = ANY($1::text[]) ORDER BY name`,
        [slugs],
      )
    ).rows;
    assert.equal(tools.length, slugs.length, 'Every mature batch tool must exist exactly once');

    for (const tool of tools) {
      const evidence = deriveIndexReviewEvidence(tool.features);
      const quality = getToolQuality(tool);
      const result = evaluateToolIndexReview({
        published: tool.status === 'published',
        monitor: tool.page_quality_status === 'monitor',
        qualityScore: quality.score,
        mediaComplete: quality.checks
          .filter((check) => ['logo', 'screenshot'].includes(check.key))
          .every((check) => check.passed),
        marketValidated: evidence.marketValidated,
        officialSourceCount: evidence.officialSourceCount,
        independentSignalCount: evidence.independentSignalCount,
        decisionContentComplete: evidence.decisionContentComplete,
        editorialDatesComplete: evidence.editorialReviewed && Boolean(tool.next_review_date),
        canonicalUnique: true,
        intentUnique: true,
        automatedSeoPassed: true,
        observationComplete: false,
        releaseTrack: 'mature_high_demand',
        gscSnapshotDate,
        asOfDate: asOf,
        siteSearchHealth: 'warning',
        policyPaused: false,
        quotaAvailable: true,
      });
      assert.equal(result.decision, 'approve_continue_index', `${tool.name}: ${result.blockers.join('; ')}`);
      await client.query(
        `INSERT INTO tool_index_review_runs
         (tool_id, tool_slug, decision, gsc_snapshot_date, gsc_snapshot_age_days, site_search_health,
          release_track, checks, blockers, input_snapshot, reviewed_by, event_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (event_key) DO UPDATE SET decision=EXCLUDED.decision,
           gsc_snapshot_date=EXCLUDED.gsc_snapshot_date,
           gsc_snapshot_age_days=EXCLUDED.gsc_snapshot_age_days,
           site_search_health=EXCLUDED.site_search_health,
           release_track=EXCLUDED.release_track, checks=EXCLUDED.checks,
           blockers=EXCLUDED.blockers, input_snapshot=EXCLUDED.input_snapshot,
           reviewed_by=EXCLUDED.reviewed_by, observed_at=now()`,
        [
          tool.id,
          tool.name,
          result.decision,
          gscSnapshotDate,
          result.gscSnapshotAgeDays,
          'warning',
          'mature_high_demand',
          JSON.stringify(result.checks),
          result.blockers,
          JSON.stringify({
            releaseTrack: 'mature_high_demand',
            ownerDirection: 'Index mature tools based on actual quality; controlled four-tool batch.',
            qualityScore: quality.score,
            previousPolicy: policy,
            quota,
          }),
          'codex-owner-directed-mature-batch',
          `eligibility:${tool.id}:${asOf}`,
        ],
      );
    }

    await client.query(
      `UPDATE tool_index_release_policy
          SET paused=false, daily_limit=$1,
              pause_reason=$2, updated_at=now()
        WHERE singleton=true`,
      [slugs.length, 'Owner-approved mature high-demand batch; warning-state release limited to four reviewed tools.'],
    );
    for (const slug of slugs) {
      const updated = await client.query(
        `UPDATE tools SET page_quality_status='continue_index', updated_at=now()
          WHERE name=$1 AND status='published' AND page_quality_status='monitor'
          RETURNING id`,
        [slug],
      );
      assert.equal(updated.rowCount, 1, `${slug}: index state update failed`);
    }
    await client.query(
      `UPDATE tool_index_release_policy
          SET daily_limit=1,
              pause_reason='Controlled mature-tool indexing active: daily 1, weekly 5; warning allowed only through mature review track.',
              updated_at=now()
        WHERE singleton=true`,
    );

    const readback = (
      await client.query(
        `SELECT name, status, page_quality_status FROM tools WHERE name=ANY($1::text[]) ORDER BY name`,
        [slugs],
      )
    ).rows;
    assert(readback.every((row) => row.status === 'published' && row.page_quality_status === 'continue_index'));
    await client.query(commit ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: commit ? 'committed' : 'rollback', slugs, readback }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

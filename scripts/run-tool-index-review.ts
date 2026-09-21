import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { evaluateToolIndexReview, type SiteSearchHealth } from '../lib/services/toolIndexReview';
import { getToolQuality } from '../lib/services/toolQuality';

type Options = {
  slug: string;
  asOf: string;
  gscSnapshotDate: string | null;
  siteHealth: SiteSearchHealth;
  observationComplete: boolean;
  canonicalUnique: boolean;
  intentUnique: boolean;
  seoPassed: boolean;
  reviewedBy: string;
  commit: boolean;
};

function parseArgs(args: string[]): Options {
  const value = (name: string) =>
    args
      .find((arg) => arg.startsWith(`--${name}=`))
      ?.split('=')
      .slice(1)
      .join('=');
  const slug = value('slug');
  assert(slug, 'Required: --slug=<tool-slug>');
  const siteHealth = (value('site-health') || 'unknown') as SiteSearchHealth;
  assert(['healthy', 'warning', 'blocked', 'unknown'].includes(siteHealth), 'Invalid --site-health');
  return {
    slug,
    asOf: value('as-of') || new Date().toISOString().slice(0, 10),
    gscSnapshotDate: value('gsc-snapshot-date') || null,
    siteHealth,
    observationComplete: args.includes('--observation-complete'),
    canonicalUnique: args.includes('--canonical-unique'),
    intentUnique: args.includes('--intent-unique'),
    seoPassed: args.includes('--seo-passed'),
    reviewedBy: value('reviewed-by') || 'codex-index-review',
    commit: args.includes('--commit'),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

async function main() {
  config({ path: '.env.local', quiet: true });
  const options = parseArgs(process.argv.slice(2));
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    const toolResult = await client.query(
      `SELECT id, name, status, page_quality_status, category_id, image_url, thumbnail_url, content, detail,
              pricing, tags, features, next_review_date::text, updated_at
         FROM tools WHERE name=$1`,
      [options.slug],
    );
    assert.equal(toolResult.rowCount, 1, `Expected exactly one tool named ${options.slug}`);
    const tool = toolResult.rows[0];
    const features = record(tool.features);
    const editorial = record(features.editorial);
    const market = record(features.marketValidation);
    const decision = record(features.decision);
    const sourceUrls = list(editorial.sourceUrls).concat(list(features.sourceUrls));
    const independentSignals = list(market.strongSignals).concat(list(market.supportingSignals));
    const quality = getToolQuality(tool);
    const policyResult = await client.query(
      `SELECT paused, daily_limit, weekly_limit FROM tool_index_release_policy WHERE singleton=true`,
    );
    assert.equal(policyResult.rowCount, 1, 'Index release policy is missing');
    const policy = policyResult.rows[0];
    const quotaResult = await client.query(
      `SELECT
         count(*) FILTER (WHERE release_day=(clock_timestamp() AT TIME ZONE 'Asia/Shanghai')::date)::int AS today,
         count(*) FILTER (WHERE release_day>=date_trunc('week',(clock_timestamp() AT TIME ZONE 'Asia/Shanghai'))::date)::int AS week
       FROM tool_index_release_log WHERE entry_type <> 'baseline'`,
    );
    const quota = quotaResult.rows[0];
    const result = evaluateToolIndexReview({
      published: tool.status === 'published',
      monitor: tool.page_quality_status === 'monitor',
      qualityScore: quality.score,
      mediaComplete: quality.checks
        .filter((check) => ['logo', 'screenshot'].includes(check.key))
        .every((check) => check.passed),
      marketValidated: market.verdict === 'validated',
      officialSourceCount: new Set(sourceUrls.filter((item): item is string => typeof item === 'string')).size,
      independentSignalCount: independentSignals.length,
      decisionContentComplete:
        list(decision.bestFor).length > 0 &&
        list(decision.notIdealFor).length > 0 &&
        list(decision.compareAxes).length > 0,
      editorialDatesComplete: typeof editorial.reviewedAt === 'string' && Boolean(tool.next_review_date),
      canonicalUnique: options.canonicalUnique,
      intentUnique: options.intentUnique,
      automatedSeoPassed: options.seoPassed,
      observationComplete: options.observationComplete,
      gscSnapshotDate: options.gscSnapshotDate,
      asOfDate: options.asOf,
      siteSearchHealth: options.siteHealth,
      policyPaused: policy.paused,
      quotaAvailable: quota.today < policy.daily_limit && quota.week < policy.weekly_limit,
    });
    const eventKey = `eligibility:${tool.id}:${options.asOf}`;
    if (options.commit) {
      await client.query(
        `INSERT INTO tool_index_review_runs
         (tool_id, tool_slug, decision, gsc_snapshot_date, gsc_snapshot_age_days, site_search_health,
          checks, blockers, input_snapshot, reviewed_by, event_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (event_key) DO UPDATE SET decision=EXCLUDED.decision, gsc_snapshot_date=EXCLUDED.gsc_snapshot_date,
           gsc_snapshot_age_days=EXCLUDED.gsc_snapshot_age_days, site_search_health=EXCLUDED.site_search_health,
           checks=EXCLUDED.checks, blockers=EXCLUDED.blockers, input_snapshot=EXCLUDED.input_snapshot,
           reviewed_by=EXCLUDED.reviewed_by, observed_at=now()`,
        [
          tool.id,
          tool.name,
          result.decision,
          options.gscSnapshotDate,
          result.gscSnapshotAgeDays,
          options.siteHealth,
          JSON.stringify(result.checks),
          result.blockers,
          JSON.stringify({ options, qualityScore: quality.score, policy, quota }),
          options.reviewedBy,
          eventKey,
        ],
      );
    }
    console.log(
      JSON.stringify({ slug: options.slug, mode: options.commit ? 'committed' : 'dry-run', ...result }, null, 2),
    );
    console.log('Review recording does not modify page_quality_status or sitemap membership.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

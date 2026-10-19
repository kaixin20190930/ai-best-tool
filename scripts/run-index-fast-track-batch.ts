import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';
import { mergeIndexEvidence, selectIndexReleaseTrack, validateDuplicateIntentSnapshot } from '../lib/services/indexFastTrackEvidence';
import { deriveIndexReviewEvidence, evaluateToolIndexReview, type SiteSearchHealth } from '../lib/services/toolIndexReview';
import { getToolQuality } from '../lib/services/toolQuality';

type ToolRow = Record<string, any>;
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const site = 'https://aibesttool.com';

function value(args: string[], name: string) {
  return args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function normalizedUrl(url: string) {
  const parsed = new URL(url);
  return `${parsed.hostname.replace(/^www\./, '').toLowerCase()}${parsed.pathname.replace(/\/$/, '')}`;
}

function evidenceFeatures(tool: ToolRow, staged: Record<string, unknown> | undefined) {
  if (!staged) return tool.features || {};
  return mergeIndexEvidence(tool.features, staged);
}

async function uniqueIdentity(db: Client, tool: ToolRow, rows: ToolRow[], features: Record<string, any>, asOf: string) {
  const identity = features.indexIdentity;
  const canonical = typeof tool.url === 'string' && tool.url.startsWith('https://') &&
    rows.filter((row) => row.id !== tool.id && row.status === 'published' && row.url &&
      normalizedUrl(row.url) === normalizedUrl(tool.url)).length === 0;
  const nameQuery = tool.name.split('-').filter((part: string) => part && !/^\d+$/.test(part)).slice(0, 2).join(' ');
  const scope = { nameQuery, officialUrl: identity?.officialUrl || '', taskMode: 'published_fits' };
  let intent = false;
  let intentAudit: Record<string, unknown> | null = null;
  if (nameQuery.length >= 4 && scope.officialUrl.startsWith('https://') &&
      identity?.duplicateIntent?.checkedScope) {
    const pattern = `%${nameQuery.split(' ').join('%')}%`;
    const toolMatches = (await db.query(`SELECT id FROM public.tools WHERE id<>$1
      AND (name ILIKE $2 OR title::text ILIKE $2 OR url=$3)`,
    [tool.id, pattern, scope.officialUrl])).rows.map((row) => row.id as string);
    const candidateMatches = (await db.query(`SELECT id FROM public.collection_candidates
      WHERE tool_id IS DISTINCT FROM $1
        AND (title ILIKE $2 OR url=$3 OR normalized_url=$4)`,
    [tool.id, pattern, scope.officialUrl, normalizedUrl(scope.officialUrl)])).rows.map((row) => row.id as string);
    const supabase = createAdminClient();
    const ownFits = await supabase.from('tool_task_fits').select('task_id')
      .eq('tool_id', tool.id).eq('status', 'published');
    assert(!ownFits.error, `Task Fit read failed: ${ownFits.error?.message}`);
    const taskIds = [...new Set((ownFits.data || []).map((fit) => fit.task_id))];
    let taskFitToolIds: string[] = [];
    if (taskIds.length > 0) {
      const related = await supabase.from('tool_task_fits').select('tool_id')
        .in('task_id', taskIds).eq('status', 'published').neq('tool_id', tool.id);
      assert(!related.error, `Related Task Fit read failed: ${related.error?.message}`);
      taskFitToolIds = [...new Set((related.data || []).map((fit) => fit.tool_id))];
    }
    intent = validateDuplicateIntentSnapshot(identity.duplicateIntent, scope,
      { toolIds: toolMatches, candidateIds: candidateMatches, taskFitToolIds }, asOf);
    intentAudit = { checkedAt: asOf, checkedScope: scope,
      productionMatchCount: new Set([...toolMatches, ...candidateMatches]).size,
      toolMatchCount: toolMatches.length, candidateMatchCount: candidateMatches.length,
      taskFitMatchCount: taskFitToolIds.length, relatedTaskFitToolIds: taskFitToolIds.sort(),
      manifestMatched: intent };
  }
  return { canonical: Boolean(canonical), intent: Boolean(intent), intentAudit };
}

async function seoGate(slug: string): Promise<boolean> {
  for (const path of [`/ai/${slug}`, `/cn/ai/${slug}`, `/tw/ai/${slug}`]) {
    const response = await fetch(`${site}${path}`, { signal: AbortSignal.timeout(15000) });
    if (response.status !== 200) return false;
    const html = await response.text();
    if (!html.includes(`rel="canonical" href="${site}${path}"`) &&
        !html.includes(`href="${site}${path}" rel="canonical"`)) return false;
    if (!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html) &&
        !/<meta[^>]*content="[^"]*noindex[^"]*"[^>]*name="robots"/i.test(html)) return false;
  }
  return true;
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const mode = value(args, 'mode') || 'select';
  assert(['select', 'preflight', 'rollback', 'commit', 'postcheck'].includes(mode));
  assert(args.every((arg) => /^--(mode|gsc|site-health|evidence-manifest|ids|expected-hash|qa-report)=/.test(arg)));
  const gscPath = value(args, 'gsc');
  assert(gscPath, 'A private current GSC snapshot is required');
  const gsc = JSON.parse(fs.readFileSync(gscPath, 'utf8'));
  assert.equal(gsc.propertyUrl, 'sc-domain:aibesttool.com');
  const siteHealth = (value(args, 'site-health') || 'unknown') as SiteSearchHealth;
  assert(['healthy', 'warning', 'blocked', 'unknown'].includes(siteHealth));
  const ids = value(args, 'ids')?.split(',').filter(Boolean);
  const evidencePath = value(args, 'evidence-manifest');
  assert(!evidencePath || ['select', 'preflight', 'rollback'].includes(mode),
    'Staged evidence cannot be used in a production commit');
  const staged = evidencePath ? JSON.parse(fs.readFileSync(evidencePath, 'utf8')).items : [];
  const stagedById = new Map<string, { updatedAt: string; featuresMd5: string; patch: Record<string, unknown> }>(
    staged.map((item: any) => [item.id, item]),
  );
  config({ path: '.env.local', quiet: true });
  const db = new Client({ connectionString: getDatabaseConnectionString() });
  await db.connect();
  try {
    await db.query(['rollback', 'commit'].includes(mode) ? 'BEGIN' : 'BEGIN READ ONLY');
    await db.query("SET LOCAL lock_timeout='5s'");
    await db.query("SET LOCAL statement_timeout='90s'");
    const clock = (await db.query("SELECT (clock_timestamp() AT TIME ZONE 'Asia/Shanghai')::date::text AS day")).rows[0].day;
    const policy = (await db.query(`SELECT paused, daily_limit, weekly_limit FROM public.tool_index_release_policy
      WHERE singleton=true${['rollback', 'commit'].includes(mode) ? ' FOR UPDATE' : ''}`)).rows[0];
    assert(policy, 'Missing index policy');
    const quota = (await db.query(`SELECT
      count(*) FILTER (WHERE release_day=$1::date)::int AS today,
      count(*) FILTER (WHERE release_day>=date_trunc('week',$1::date)::date)::int AS week
      FROM public.tool_index_release_log WHERE entry_type <> 'baseline'`, [clock])).rows[0];
    const rows = (await db.query(`SELECT id, name, url, status, page_quality_status, category_id,
      image_url, thumbnail_url, content, detail, pricing, tags, features,
      next_review_date::text, updated_at::text AS updated_at, md5(features::text) AS features_md5
      FROM public.tools WHERE status='published' ORDER BY name`)).rows as ToolRow[];
    const monitor = rows.filter((row) => row.page_quality_status === 'monitor');
    const requested = mode === 'postcheck' && ids
      ? rows.filter((row) => ids.includes(row.id))
      : ids ? monitor.filter((row) => ids.includes(row.id)) : monitor;
    assert(!ids || requested.length === ids.length, 'Requested IDs must be unique published monitor tools');
    const reviews = [];
    for (const tool of requested) {
      const stagedItem = stagedById.get(tool.id);
      if (stagedItem) {
        assert.equal(tool.updated_at, stagedItem.updatedAt, `${tool.name}: staged updated_at drift`);
        assert.equal(tool.features_md5, stagedItem.featuresMd5, `${tool.name}: staged features drift`);
      }
      const features = evidenceFeatures(tool, stagedItem?.patch);
      const evidence = deriveIndexReviewEvidence(features);
      const quality = getToolQuality(tool);
      const identity = await uniqueIdentity(db, tool, rows, features, clock);
      const mediaComplete = quality.checks.filter((check) => ['logo', 'screenshot'].includes(check.key))
        .every((check) => check.passed) &&
        [tool.image_url, tool.thumbnail_url].every((url) => typeof url === 'string' &&
          !/placeholder|default-image/i.test(url));
      const datesComplete = evidence.editorialReviewed &&
        features.editorial?.reviewedAt <= clock && tool.next_review_date >= clock;
      const marketScore = Number(features.marketValidation?.score || 0);
      const track = selectIndexReleaseTrack(features.marketValidation, clock);
      const input = {
        published: true, monitor: true, qualityScore: quality.score, mediaComplete,
        marketValidated: evidence.marketValidated,
        officialSourceCount: evidence.officialSourceCount,
        independentSignalCount: evidence.independentSignalCount,
        decisionContentComplete: evidence.decisionContentComplete,
        editorialDatesComplete: datesComplete,
        canonicalUnique: identity.canonical, intentUnique: identity.intent,
        automatedSeoPassed: false,
        observationComplete: track.observationComplete,
        releaseTrack: track.releaseTrack,
        gscSnapshotDate: gsc.latestCompleteDate || null,
        asOfDate: clock, siteSearchHealth: siteHealth,
        policyPaused: policy.paused,
        quotaAvailable: quota.today < 5 && quota.week < 25,
      };
      const provisional = evaluateToolIndexReview({ ...input, automatedSeoPassed: true });
      let seoPassed = false;
      if (provisional.decision === 'approve_continue_index') {
        try { seoPassed = await seoGate(tool.name); } catch { seoPassed = false; }
      }
      const result = evaluateToolIndexReview({ ...input, automatedSeoPassed: seoPassed });
      reviews.push({ id: tool.id, slug: tool.name, releaseTrack: input.releaseTrack,
        intentAudit: identity.intentAudit, preimageHash: hash({
        id: tool.id, status: tool.status, pageQualityStatus: tool.page_quality_status,
        features: tool.features, updatedAt: tool.updated_at,
      }), marketScore, staged: stagedById.has(tool.id), result });
    }
    reviews.sort((a, b) => b.marketScore - a.marketScore || a.slug.localeCompare(b.slug));
    const capacity = Math.min(5 - quota.today, 25 - quota.week, 5);
    const eligible = reviews.filter((row) => row.result.decision === 'approve_continue_index').slice(0, Math.max(0, capacity));
    const batchHash = hash({ day: clock, gscDate: gsc.latestCompleteDate, siteHealth,
      tools: eligible.map(({ id, preimageHash }) => ({ id, preimageHash })) });
    if (mode === 'commit') {
      assert(!staged.length);
      assert.equal(value(args, 'expected-hash'), batchHash, 'Batch preimage changed');
      const qaPath = value(args, 'qa-report');
      assert(qaPath, 'Independent QA report required');
      const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
      assert.equal(qa.status, 'QA_PASS');
      assert(/^codex-thread:[0-9a-f-]{36}$/i.test(qa.qaActor || ''), 'Independent QA actor required');
      assert.equal(qa.batchHash, batchHash);
      assert(eligible.length > 0, 'No eligible A-grade tools');
    }
    if (mode === 'rollback' || mode === 'commit') {
      assert(eligible.length > 0, 'No eligible A-grade tools for rollback');
      if (policy.daily_limit !== 5 || policy.weekly_limit !== 25) {
        await db.query(fs.readFileSync('db/neon/20261017_index_fast_track_quota.sql', 'utf8'));
      }
      for (const tool of eligible) {
        if (mode === 'rollback' && stagedById.has(tool.id)) {
          const before = rows.find((row) => row.id === tool.id)!;
          const stagedItem = stagedById.get(tool.id)!;
          const changedEvidence = await db.query(`UPDATE public.tools SET features=$2::jsonb, updated_at=now()
            WHERE id=$1 AND status='published' AND page_quality_status='monitor'
              AND updated_at::text=$3 AND md5(features::text)=$4 RETURNING id`,
          [tool.id, JSON.stringify(evidenceFeatures(before, stagedItem.patch)),
            stagedItem.updatedAt, stagedItem.featuresMd5]);
          assert.equal(changedEvidence.rowCount, 1, `${tool.slug}: staged evidence drift`);
        }
        const changed = await db.query(`UPDATE public.tools SET page_quality_status='continue_index', updated_at=now()
          WHERE id=$1 AND status='published' AND page_quality_status='monitor'
          RETURNING id`, [tool.id]);
        assert.equal(changed.rowCount, 1, `${tool.slug}: concurrent change`);
        await db.query(`INSERT INTO public.tool_index_review_runs
          (tool_id, tool_slug, decision, gsc_snapshot_date, gsc_snapshot_age_days, site_search_health,
           release_track, checks, blockers, input_snapshot, reviewed_by, event_key)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [tool.id, tool.slug,
          tool.result.decision, gsc.latestCompleteDate, tool.result.gscSnapshotAgeDays, siteHealth,
          tool.releaseTrack, JSON.stringify(tool.result.checks), tool.result.blockers,
          JSON.stringify({ batchHash, preimageHash: tool.preimageHash, marketScore: tool.marketScore }),
          'codex-owner-authorized-a-grade', `fast-track:${tool.id}:${clock}`]);
      }
    }
    if (mode === 'postcheck') {
      assert(ids?.length, 'Postcheck needs exact IDs');
      for (const id of ids) {
        const row = rows.find((item) => item.id === id);
        assert(row?.page_quality_status === 'continue_index', `${id}: not indexable`);
        const log = (await db.query(`SELECT count(*)::int AS n FROM public.tool_index_release_log
          WHERE tool_id=$1 AND entry_type='approval'`, [id])).rows[0];
        assert.equal(log.n, 1, `${id}: release ledger mismatch`);
      }
    }
    await db.query(mode === 'commit' ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode, day: clock, gscDate: gsc.latestCompleteDate,
      siteHealth, policy, quota, targetPolicy: { dailyLimit: 5, weeklyLimit: 25 },
      reviewed: reviews.length, eligible: eligible.map(({ id, slug, releaseTrack, preimageHash, intentAudit }) =>
        ({ id, slug, releaseTrack, preimageHash, intentAudit })),
      batchHash, blocked: reviews.filter((row) => row.result.decision !== 'approve_continue_index')
        .map((row) => ({ slug: row.slug, decision: row.result.decision,
          blockers: row.result.blockers.filter((blocker) => blocker !== 'Automated SEO checks passed') })),
      productionWrites: mode === 'commit' ? eligible.length : 0 }, null, 2));
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

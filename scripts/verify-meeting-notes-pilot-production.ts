import assert from 'node:assert/strict';

import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { createAdminClient } from '../lib/supabase/admin';
import {
  decisionEventPilotPages,
  evaluateDecisionEventPilot,
} from '../lib/analytics/decisionEvents/governance';
import { getDatabaseConnectionString } from '../lib/database/connection';

loadEnvConfig(process.cwd());

const toolIds = {
  fathom: '7ae4bbb2-847f-45cc-9294-e96663fa02a3',
  otter: 'b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49',
  fireflies: '57b270b9-78cf-41f8-8b74-dec46400cd65',
} as const;
const claimIds = [
  'fddb0da1-3fb5-4bad-9ad5-df543171985f',
  'e54d8004-86ef-476d-addc-cb5215e94a5f',
  '32e5934f-bc33-415c-9d98-e88529155855',
] as const;
const taskId = 'e9c64181-9cad-40c5-979e-3af4bd9cc630';
const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');

async function routeEvidence(path: string) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  return {
    status: response.status,
    routeExists: response.status >= 200 && response.status < 400,
    body: response.status === 200 ? await response.text() : '',
  };
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let fireflies: Record<string, unknown>;
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query(
      `SELECT id, name, status, page_quality_status, next_review_date, url
       FROM tools
       WHERE id = $1
          OR lower(name) IN ('fireflies', 'fireflies-ai', 'fireflies.ai')
          OR lower(url) ~ '^https?://(www\\.)?fireflies\\.ai([/?#]|$)'`,
      [toolIds.fireflies],
    );
    assert.equal(result.rowCount, 1, 'Fireflies must have exactly one production entity');
    fireflies = result.rows[0];
    assert.equal(fireflies.id, toolIds.fireflies);
    assert.equal(fireflies.name, 'fireflies');
    assert.equal(fireflies.status, 'published');
    assert.equal(fireflies.page_quality_status, 'monitor');
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }

  const supabase = createAdminClient();
  const [taskResult, profilesResult, fitsResult, profileLinksResult, claimsResult] = await Promise.all([
    supabase.from('decision_tasks').select('id, slug, status').eq('slug', 'meeting-notes'),
    supabase
      .from('tool_decision_profiles')
      .select('tool_id, editorial_status, reviewed_at, review_due_at')
      .in('tool_id', Object.values(toolIds)),
    supabase
      .from('tool_task_fits')
      .select('id, tool_id, task_id, fit_level, status, reviewed_at, review_due_at')
      .eq('task_id', taskId)
      .in('tool_id', Object.values(toolIds)),
    supabase
      .from('tool_decision_profile_claims')
      .select('tool_id, claim_id, purpose')
      .in('tool_id', Object.values(toolIds)),
    supabase
      .from('product_intelligence_claims')
      .select('id, verification_status, conflict_status, invalidated_at, review_due_at')
      .in('id', [...claimIds]),
  ]);
  for (const result of [taskResult, profilesResult, fitsResult, profileLinksResult, claimsResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const taskRows = taskResult.data || [];
  const profiles = profilesResult.data || [];
  const fits = fitsResult.data || [];
  const profileLinks = profileLinksResult.data || [];
  const claims = claimsResult.data || [];
  assert.equal(taskRows.length, 1, 'meeting-notes must be unique');
  assert.equal(taskRows[0].id, taskId);
  assert.equal(taskRows[0].status, 'active');
  assert.equal(profiles.length, 3, 'Pilot requires three decision profiles');
  assert.ok(profiles.every((row) => row.editorial_status === 'published' && row.reviewed_at));
  assert.equal(fits.length, 3, 'Pilot requires three meeting-notes task fits');
  assert.ok(fits.every((row) => row.status === 'published' && row.reviewed_at));
  assert.equal(profileLinks.length, 3, 'Each Pilot profile requires one evidence link');
  assert.equal(claims.length, 3, 'Each Pilot tool requires one verified current claim');
  assert.ok(
    claims.every(
      (claim) =>
        claim.verification_status === 'verified' &&
        claim.conflict_status === 'none' &&
        claim.invalidated_at === null &&
        claim.review_due_at,
    ),
  );

  const fitIds = fits.map((fit) => fit.id);
  const { data: fitLinks = [], error: fitLinksError } = await supabase
    .from('tool_task_fit_claims')
    .select('fit_id, claim_id, purpose')
    .in('fit_id', fitIds);
  if (fitLinksError) throw new Error(fitLinksError.message);
  assert.equal(fitLinks.length, 3, 'Each Pilot task fit requires one evidence link');

  const routeResults = Object.fromEntries(
    await Promise.all(
      decisionEventPilotPages.map(async (page) => [page.path, await routeEvidence(page.path)] as const),
    ),
  );
  const firefliesRoute = routeResults['/ai/fireflies'];
  assert.equal(firefliesRoute.status, 200, 'Fireflies canonical route must return 200');
  assert.match(firefliesRoute.body, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
  assert.match(firefliesRoute.body, /Fireflies/i);

  const aliasResponse = await fetch(`${baseUrl}/ai/fireflies-ai`, { redirect: 'manual' });
  assert.ok([307, 308].includes(aliasResponse.status), 'Fireflies alias must redirect permanently or canonically');
  assert.equal(new URL(aliasResponse.headers.get('location') || '', baseUrl).pathname, '/ai/fireflies');
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemap.includes('/ai/fireflies'), false, 'Monitor/noindex Fireflies must not enter sitemap');

  const toolEvidenceCount = new Map(profileLinks.map((link) => [link.tool_id, 1]));
  const preflight = evaluateDecisionEventPilot({
    collectionEnabled: false,
    foundationMigrationApplied: true,
    governanceMigrationApplied: true,
    retentionOperationConfigured: true,
    aggregateReaderConfigured: true,
    internalTrafficExclusionReady: false,
    activeTaskSlugs: ['meeting-notes'],
    pages: {
      '/find-tools': {
        routeExists: routeResults['/find-tools'].routeExists,
        publishedEntity: true,
        verifiedEvidenceCount: 0,
      },
      '/ai/fathom': {
        routeExists: routeResults['/ai/fathom'].routeExists,
        publishedEntity: profiles.some((profile) => profile.tool_id === toolIds.fathom),
        verifiedEvidenceCount: toolEvidenceCount.get(toolIds.fathom) || 0,
      },
      '/ai/otter-ai': {
        routeExists: routeResults['/ai/otter-ai'].routeExists,
        publishedEntity: profiles.some((profile) => profile.tool_id === toolIds.otter),
        verifiedEvidenceCount: toolEvidenceCount.get(toolIds.otter) || 0,
      },
      '/ai/fireflies': {
        routeExists: firefliesRoute.routeExists,
        publishedEntity: profiles.some((profile) => profile.tool_id === toolIds.fireflies),
        verifiedEvidenceCount: toolEvidenceCount.get(toolIds.fireflies) || 0,
      },
      '/guides/ai-tools-for-meeting-notes': {
        routeExists: routeResults['/guides/ai-tools-for-meeting-notes'].routeExists,
        publishedEntity: true,
        verifiedEvidenceCount: fitLinks.length,
      },
    },
  });
  assert.deepEqual(preflight.blockers, [
    { code: 'collection_not_enabled' },
    { code: 'internal_traffic_exclusion_missing' },
  ]);

  console.log(
    JSON.stringify(
      {
        success: true,
        fireflies,
        meetingNotesTask: taskRows[0],
        publishedProfiles: profiles.length,
        publishedTaskFits: fits.length,
        verifiedClaims: claims.length,
        profileEvidenceLinks: profileLinks.length,
        taskFitEvidenceLinks: fitLinks.length,
        routeStatuses: Object.fromEntries(
          Object.entries(routeResults).map(([path, result]) => [path, result.status]),
        ),
        aliasStatus: aliasResponse.status,
        firefliesInSitemap: false,
        preflight,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

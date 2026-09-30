import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const names = ['consensus', 'notebooklm', 'perplexity'];
const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const consensusId = 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab';
const consensusProfileId = 'b72150af-7c8e-40dc-81f7-b41375afa6f4';
const consensusToolCapabilityId = '5e6f6ba6-8587-4c59-977a-ed74672dee5c';
const consensusFitId = 'd52cc53b-6e5f-4b0b-809b-140076d4d7d2';
const researchClaimKeys = [
  'consensus:research:paper-search-2026-09',
  'consensus:research:citation-grounding-2026-09',
  'consensus:research:fulltext-conditions-2026-09',
  'consensus:research:papers-plan-2026-09',
  'consensus:research:fulltext-chat-mode-2026-09',
  'consensus:research:manual-review-2026-09',
];

async function read(label: string, request: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let tools: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    tools = (
      await neon.query(
        "SELECT id, name, status, url, updated_at::text FROM tools WHERE lower(name) = ANY($1::text[]) OR lower(url) ~ '(consensus\\.app|notebooklm\\.google\\.com|perplexity\\.ai)' ORDER BY name",
        [names],
      )
    ).rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  const ids = tools.filter((row) => names.includes(row.name.toLowerCase())).map((row) => row.id);
  assert.equal(tools.length, 3, 'Unexpected duplicate or alias tool matched the three product domains');
  assert.equal(ids.length, 3, 'Expected exactly the three existing directory tools');
  assert.ok(
    tools.every((row) => row.status === 'published'),
    'Candidate directory tool status changed',
  );
  const db = createAdminClient();
  const [tasks, taskCapabilities, capabilities, toolCapabilities, fits, profiles] = await Promise.all([
    read('task', db.from('decision_tasks').select('id,slug,status,updated_at').eq('id', taskId)),
    read(
      'task capabilities',
      db
        .from('task_capabilities')
        .select('task_id,capability_id,importance,status,updated_at,reviewed_by,reviewed_at,review_due_at')
        .eq('task_id', taskId),
    ),
    read(
      'capabilities',
      db
        .from('decision_capabilities')
        .select('id,slug,status')
        .in('slug', ['research-discovery', 'citation-traceability']),
    ),
    read(
      'tool capabilities',
      db
        .from('tool_capabilities')
        .select(
          'id,tool_id,capability_id,status,support_level,availability,updated_at,reviewed_by,reviewed_at,review_due_at',
        )
        .in('tool_id', ids),
    ),
    read(
      'fits',
      db
        .from('tool_task_fits')
        .select('id,tool_id,task_id,status,fit_level,updated_at,reviewed_by,reviewed_at,review_due_at')
        .eq('task_id', taskId),
    ),
    read(
      'profiles',
      db
        .from('product_intelligence_profiles')
        .select('id,owner_type,owner_id,canonical_domain,profile_status,next_review_at,updated_at')
        .in('owner_id', ids),
    ),
  ]);
  const profileIds = profiles.map((row) => row.id);
  const [sources, claims] = profileIds.length
    ? await Promise.all([
        read(
          'sources',
          db
            .from('product_intelligence_sources')
            .select('id,profile_id,url,source_type,fetch_status,last_verified_at')
            .in('profile_id', profileIds),
        ),
        read(
          'claims',
          db
            .from('product_intelligence_claims')
            .select(
              'id,profile_id,source_id,source_url,claim_key,verification_status,conflict_status,invalidated_at,verified_at,verified_by,review_due_at,expires_at',
            )
            .in('profile_id', profileIds),
        ),
      ])
    : [[], []];
  const relationIds = toolCapabilities.filter((row) => ids.includes(row.tool_id)).map((row) => row.id);
  const fitIds = fits.filter((row) => ids.includes(row.tool_id)).map((row) => row.id);
  const [toolLinks, fitLinks] = await Promise.all([
    relationIds.length
      ? read(
          'tool links',
          db
            .from('tool_capability_claims')
            .select('tool_capability_id,claim_id,purpose')
            .in('tool_capability_id', relationIds),
        )
      : Promise.resolve([]),
    fitIds.length
      ? read('fit links', db.from('tool_task_fit_claims').select('fit_id,claim_id,purpose').in('fit_id', fitIds))
      : Promise.resolve([]),
  ]);
  assert.equal(tasks.length, 1, 'Research Task identity changed');
  assert.equal(tasks[0].slug, 'research-with-citations');
  assert.equal(tasks[0].status, 'active');
  assert.equal(capabilities.length, 2, 'Existing Task Capability identity changed');
  assert.deepEqual(capabilities.map((row) => row.slug).sort(), ['citation-traceability', 'research-discovery']);
  assert.ok(capabilities.every((row) => row.status === 'active'));
  assert.equal(taskCapabilities.length, 2, 'Existing Task Capability count changed');
  const now = Date.now();
  const reviewedCurrent = (row: any) =>
    Boolean(row.reviewed_by) &&
    Number.isFinite(Date.parse(row.reviewed_at)) &&
    Date.parse(row.reviewed_at) <= now &&
    Date.parse(row.review_due_at) > now;
  assert.ok(taskCapabilities.every((row) => row.status === 'published' && reviewedCurrent(row)));
  const relevantToolCapabilities = toolCapabilities.filter((row) =>
    capabilities.some((capability) => capability.id === row.capability_id),
  );
  assert.equal(relevantToolCapabilities.length, 1);
  assert.equal(relevantToolCapabilities[0].id, consensusToolCapabilityId);
  assert.equal(relevantToolCapabilities[0].tool_id, consensusId);
  assert.equal(relevantToolCapabilities[0].capability_id, '50288b6e-a968-4bcf-9e55-911df203e0c7');
  assert.equal(relevantToolCapabilities[0].status, 'published');
  assert.ok(reviewedCurrent(relevantToolCapabilities[0]), 'Consensus Tool Capability review expired or absent');
  assert.equal(fits.length, 1, 'Research Task Fit baseline changed');
  const relevantFits = fits.filter((row) => ids.includes(row.tool_id));
  assert.equal(relevantFits.length, 1);
  assert.equal(relevantFits[0].id, consensusFitId);
  assert.equal(relevantFits[0].tool_id, consensusId);
  assert.equal(relevantFits[0].status, 'published');
  assert.ok(reviewedCurrent(relevantFits[0]), 'Consensus Fit review expired or absent');
  assert.equal(profiles.length, 1, 'Decision evidence profile baseline changed');
  assert.equal(profiles[0].id, consensusProfileId);
  assert.equal(profiles[0].owner_type, 'tool');
  assert.equal(profiles[0].owner_id, consensusId);
  assert.equal(profiles[0].canonical_domain, 'consensus.app');
  assert.equal(profiles[0].profile_status, 'ready');
  assert.ok(!profiles[0].next_review_at || Date.parse(profiles[0].next_review_at) > now);
  assert.equal(toolLinks.length, 7);
  assert.equal(fitLinks.length, 6);
  const currentClaims = claims.filter((row) => researchClaimKeys.includes(row.claim_key));
  assert.deepEqual(currentClaims.map((row) => row.claim_key).sort(), [...researchClaimKeys].sort());
  assert.equal(currentClaims.length, 6, 'Expected six current/verified Consensus research claims');
  const claimById = new Map(currentClaims.map((row) => [row.id, row]));
  const sourceById = new Map(sources.map((row) => [row.id, row]));
  for (const claim of currentClaims) {
    assert.equal(claim.profile_id, consensusProfileId, 'Consensus research claim owner changed');
    assert.equal(claim.verification_status, 'verified');
    assert.equal(claim.conflict_status, 'none');
    assert.equal(claim.invalidated_at, null);
    assert.ok(claim.verified_by, 'Verified claim lacks reviewer');
    assert.ok(Number.isFinite(Date.parse(claim.verified_at)) && Date.parse(claim.verified_at) <= now);
    assert.ok(Date.parse(claim.review_due_at) > now, 'Verified claim review expired');
    assert.ok(!claim.expires_at || Date.parse(claim.expires_at) > now, 'Verified claim validity expired');
    const source = sourceById.get(claim.source_id);
    assert.ok(source && source.profile_id === consensusProfileId && source.url === claim.source_url);
    assert.ok(['official', 'official_docs'].includes(source.source_type));
  }
  for (const link of toolLinks) {
    assert.equal(link.tool_capability_id, consensusToolCapabilityId);
    assert.ok(claimById.has(link.claim_id), 'Tool Capability link has missing, stale, or cross-owner claim');
  }
  for (const link of fitLinks) {
    assert.equal(link.fit_id, consensusFitId);
    assert.ok(claimById.has(link.claim_id), 'Fit link has missing, stale, or cross-owner claim');
  }
  assert.equal(new Set([...toolLinks, ...fitLinks].map((link) => link.claim_id)).size, 6);
  assert.deepEqual(
    new Set(toolLinks.map((row) => row.purpose)),
    new Set(['support', 'availability', 'plan', 'limitation']),
  );
  assert.deepEqual(new Set(fitLinks.map((row) => row.purpose)), new Set(['fit', 'limitation']));
  const profileById = new Map(profiles.map((row) => [row.id, row]));
  console.log(
    JSON.stringify(
      {
        checkedAtUtc: new Date().toISOString(),
        productionWrites: 0,
        task: tasks,
        capabilities,
        taskCapabilities,
        tools,
        toolCapabilities: toolCapabilities.filter((row) =>
          capabilities.some((capability) => capability.id === row.capability_id),
        ),
        fits: fits.filter((row) => ids.includes(row.tool_id)),
        profiles,
        evidence: profiles.map((profile) => ({
          ownerId: profile.owner_id,
          profileId: profile.id,
          sources: sources.filter((row) => row.profile_id === profile.id).map(({ id, ...row }) => row),
          claims: claims.filter((row) => row.profile_id === profile.id).map(({ id, source_id, ...row }) => row),
        })),
        links: {
          tool: toolLinks.map((row) => ({
            relationId: row.tool_capability_id,
            purpose: row.purpose,
            claimOwner: profileById.get(claims.find((claim) => claim.id === row.claim_id)?.profile_id)?.owner_id,
          })),
          fit: fitLinks.map((row) => ({
            relationId: row.fit_id,
            purpose: row.purpose,
            claimOwner: profileById.get(claims.find((claim) => claim.id === row.claim_id)?.profile_id)?.owner_id,
          })),
        },
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

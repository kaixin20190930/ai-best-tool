import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const names = ['consensus', 'notebooklm', 'perplexity'];
const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';

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
        .select('task_id,capability_id,importance,status,updated_at,review_due_at')
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
        .select('id,tool_id,capability_id,status,support_level,availability,updated_at,review_due_at')
        .in('tool_id', ids),
    ),
    read(
      'fits',
      db
        .from('tool_task_fits')
        .select('id,tool_id,task_id,status,fit_level,updated_at,review_due_at')
        .eq('task_id', taskId),
    ),
    read(
      'profiles',
      db
        .from('product_intelligence_profiles')
        .select('id,owner_type,owner_id,canonical_domain,profile_status,updated_at')
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
              'id,profile_id,source_id,claim_key,verification_status,conflict_status,invalidated_at,review_due_at',
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
  assert.equal(taskCapabilities.length, 2, 'Existing Task Capability count changed');
  assert.ok(taskCapabilities.every((row) => row.status === 'published'));
  assert.equal(
    toolCapabilities.filter((row) => capabilities.some((capability) => capability.id === row.capability_id)).length,
    1,
  );
  assert.equal(fits.filter((row) => ids.includes(row.tool_id)).length, 1);
  assert.equal(profiles.length, 1, 'Decision evidence profile baseline changed');
  assert.equal(profiles[0].owner_id, 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab');
  assert.equal(toolLinks.length, 7);
  assert.equal(fitLinks.length, 6);
  assert.ok(
    claims
      .filter((row) => row.claim_key.startsWith('consensus:research:'))
      .every(
        (row) =>
          row.verification_status === 'verified' &&
          row.conflict_status === 'none' &&
          !row.invalidated_at &&
          Date.parse(row.review_due_at) > Date.now(),
      ),
  );
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

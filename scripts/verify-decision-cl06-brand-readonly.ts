import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.env.CL06_ENV_DIR || process.cwd());

const taskSlug = 'brand-constrained-marketing-content';
const capabilitySlugs = ['brand-guided-content-generation', 'brand-controls-and-style-guidance'];
const candidateNames = ['jasper', 'grammarly', 'claude'] as const;
const ids = {
  task: '532b3a97-a6ec-40f7-a906-0d200ff11ffb',
  drafting: '41276fad-9e3e-4c06-acea-de5b182aca9f',
  governance: 'aa39a14e-ed51-4934-bb58-39621c290875',
  claude: '149cf3e0-5f5c-4bdf-ac02-80ec5064fb92',
  grammarly: '4d0bbf38-6b7e-4c44-8e25-9fe73f60bb18',
  jasper: '5a0c7e91-9a5c-4f84-923a-d8345edaa918',
  claudeProfile: '41fc0131-208b-4f21-aa2e-2fde160b1232',
} as const;

async function read<T>(label: string, query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let directoryTools: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query(
      'SELECT id, name, status, url, updated_at::text FROM tools WHERE lower(name) = ANY($1::text[]) ORDER BY name',
      [candidateNames],
    );
    directoryTools = result.rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(directoryTools.length, 3, 'Expected exactly three existing Brand candidate tools');
  assert.ok(directoryTools.every((tool) => tool.status === 'published'));
  for (const name of candidateNames) {
    assert.equal(directoryTools.find((tool) => tool.name.toLowerCase() === name)?.id, ids[name]);
  }

  const db = createAdminClient();
  const tasks = await read<any>(
    'task',
    db
      .from('decision_tasks')
      .select('id, slug, name, description, constraint_schema, status, updated_at')
      .eq('slug', taskSlug),
  );
  assert.equal(tasks.length, 1);
  const task = tasks[0];
  assert.equal(task.id, ids.task);
  assert.equal(task.status, 'active');
  assert.equal(task.constraint_schema?.output, 'marketing_draft');
  assert.equal(task.constraint_schema?.needsBrandGuidance, true);
  assert.equal(task.constraint_schema?.requiresReview, true);

  const capabilities = await read<any>(
    'capabilities',
    db.from('decision_capabilities').select('id, slug, description, status').in('slug', capabilitySlugs),
  );
  assert.equal(capabilities.length, 2);
  assert.ok(capabilities.every((row) => row.status === 'active'));
  assert.equal(capabilities.find((row) => row.slug === capabilitySlugs[0])?.id, ids.drafting);
  assert.equal(capabilities.find((row) => row.slug === capabilitySlugs[1])?.id, ids.governance);
  const capabilityIds = capabilities.map((row) => row.id);
  const toolIds = directoryTools.map((tool) => tool.id);
  const [taskCapabilities, toolCapabilities, fits, profiles] = await Promise.all([
    read<any>(
      'task capabilities',
      db
        .from('task_capabilities')
        .select(
          'task_id, capability_id, importance, rationale, status, reviewed_at, review_due_at, reviewed_by, updated_at',
        )
        .eq('task_id', task.id),
    ),
    read<any>(
      'tool capabilities',
      db
        .from('tool_capabilities')
        .select(
          'id, tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, updated_at',
        )
        .in('tool_id', toolIds)
        .in('capability_id', capabilityIds),
    ),
    read<any>(
      'fits',
      db
        .from('tool_task_fits')
        .select('id, tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, status, updated_at')
        .eq('task_id', task.id),
    ),
    read<any>(
      'profiles',
      db
        .from('product_intelligence_profiles')
        .select(
          'id, owner_type, owner_id, product_name, canonical_domain, profile_status, profile_version, next_review_at, updated_at',
        )
        .in('owner_id', toolIds),
    ),
  ]);
  assert.equal(taskCapabilities.length, 2, 'Expected exactly two Brand Task Capabilities');
  assert.ok(taskCapabilities.every((row) => row.status === 'reviewed'));
  assert.equal(
    taskCapabilities.find(
      (row) => row.capability_id === capabilities.find((item) => item.slug === capabilitySlugs[0])?.id,
    )?.importance,
    'required',
  );
  assert.equal(
    taskCapabilities.find(
      (row) => row.capability_id === capabilities.find((item) => item.slug === capabilitySlugs[1])?.id,
    )?.importance,
    'preferred',
  );
  assert.equal(toolCapabilities.length, 0, 'Brand candidate Tool Capabilities must remain absent');
  assert.equal(fits.length, 0, 'Brand Fits must remain absent');
  assert.equal(profiles.length, 1, 'Expected only the pre-existing Claude intelligence profile');
  assert.equal(profiles[0].id, ids.claudeProfile);
  assert.equal(profiles[0].owner_id, ids.claude);
  assert.equal(profiles[0].profile_status, 'conflict');

  const profileIds = profiles.map((profile) => profile.id);
  const [sources, claims] = profileIds.length
    ? await Promise.all([
        read<any>(
          'sources',
          db
            .from('product_intelligence_sources')
            .select('id, profile_id, url, fetch_status, updated_at')
            .in('profile_id', profileIds),
        ),
        read<any>(
          'claims',
          db
            .from('product_intelligence_claims')
            .select(
              'id, profile_id, source_id, source_url, claim_key, claim_type, verification_status, conflict_status, invalidated_at, verified_by, review_due_at, expires_at',
            )
            .in('profile_id', profileIds),
        ),
      ])
    : [[], []];
  for (const profile of profiles) {
    assert.equal(profile.owner_type, 'tool');
    const owner = directoryTools.find((tool) => tool.id === profile.owner_id);
    assert.ok(owner, 'Profile owner must match a Brand candidate');
  }
  assert.equal(sources.length, 3, 'Expected Claude generic sources only');
  assert.equal(claims.length, 16, 'Expected Claude generic candidate/identity claims only');
  assert.ok(claims.every((claim) => claim.profile_id === ids.claudeProfile));
  assert.ok(claims.every((claim) => !['brand_guidance', 'brand_governance'].includes(claim.claim_type)));

  const claimIds = claims.map((claim) => claim.id);
  const [profileClaimLinks, toolCapabilityClaimLinks, fitClaimLinks] = await Promise.all([
    read<any>(
      'profile claim links',
      db.from('tool_decision_profile_claims').select('tool_id, claim_id, purpose').in('tool_id', toolIds),
    ),
    claimIds.length
      ? read<any>(
          'tool capability claim links',
          db.from('tool_capability_claims').select('tool_capability_id, claim_id, purpose').in('claim_id', claimIds),
        )
      : Promise.resolve([]),
    claimIds.length
      ? read<any>(
          'fit claim links',
          db.from('tool_task_fit_claims').select('fit_id, claim_id, purpose').in('claim_id', claimIds),
        )
      : Promise.resolve([]),
  ]);
  assert.equal(toolCapabilityClaimLinks.length, 0, 'No Claude generic claim may support a Brand Tool Capability');
  assert.equal(fitClaimLinks.length, 0, 'No Claude generic claim may support a Brand Fit');

  console.log(
    JSON.stringify(
      {
        checkedAtUtc: new Date().toISOString(),
        productionWrites: 0,
        task,
        capabilities,
        directoryTools,
        taskCapabilities,
        toolCapabilities,
        fits,
        profiles,
        sources,
        claims,
        profileClaimLinks,
        toolCapabilityClaimLinks,
        fitClaimLinks,
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

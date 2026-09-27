import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.env.CL04_ENV_DIR || process.cwd());

const taskSlug = 'build-app-with-ai';
const capabilitySlugs = ['ai-assisted-app-development', 'developer-workflow-integration'];
const tools = [
  {
    id: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    name: 'n8n',
    domain: 'n8n.io',
    toolCapabilityId: '4ebad72c-d03e-4a54-9a2c-f5024f7da9ac',
    fitId: '692f9115-2d1d-487b-b02b-392fa55d2d34',
    oldClaimId: '806bedca-c1e4-4fd1-ae57-e4db06567e47',
    sourceCount: 5,
    claimCount: 4,
  },
  {
    id: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
    name: 'OpenRouter',
    domain: 'openrouter.ai',
    toolCapabilityId: 'ac4c1009-feaf-4544-bbaf-086e56089bdc',
    fitId: 'bb6bb5aa-df5e-4113-bb76-8d4910911b28',
    oldClaimId: '76cf5413-ce8c-424d-9a6b-21584758cf72',
    sourceCount: 7,
    claimCount: 3,
  },
] as const;

async function read<T>(label: string, query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let directoryTools;
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query(
      'SELECT id, name, status, url, updated_at::text FROM tools WHERE id = ANY($1::uuid[]) ORDER BY id',
      [tools.map((tool) => tool.id)],
    );
    directoryTools = result.rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(directoryTools.length, 2, 'Expected both existing directory tools');
  for (const expected of tools) {
    const row = directoryTools.find((tool) => tool.id === expected.id);
    assert.ok(row, `Missing ${expected.name} directory row`);
    assert.equal(row.name.toLowerCase(), expected.name.toLowerCase());
    assert.equal(new URL(row.url).hostname.replace(/^www\./, ''), expected.domain);
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
  assert.equal(task.status, 'active');
  assert.equal(task.constraint_schema?.output, 'application');
  const capabilities = await read<any>(
    'capabilities',
    db.from('decision_capabilities').select('id, slug, description, status').in('slug', capabilitySlugs),
  );
  assert.equal(capabilities.length, 2);
  assert.ok(capabilities.every((capability) => capability.status === 'active'));
  const capabilityIds = capabilities.map((capability) => capability.id);
  const toolIds = tools.map((tool) => tool.id);
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
          'id, tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, reviewed_at, review_due_at, reviewed_by, updated_at',
        )
        .in('tool_id', toolIds)
        .in('capability_id', capabilityIds),
    ),
    read<any>(
      'fits',
      db
        .from('tool_task_fits')
        .select(
          'id, tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, status, reviewed_at, review_due_at, reviewed_by, updated_at',
        )
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
  assert.equal(taskCapabilities.length, 2, 'Expected exactly two Task Capabilities');
  assert.equal(toolCapabilities.length, 2, 'Expected exactly two Tool Capabilities');
  assert.equal(fits.length, 2, 'Expected exactly two Fits');
  assert.equal(profiles.length, 2, 'Expected exactly two intelligence profiles');
  assert.ok(
    [...taskCapabilities, ...toolCapabilities, ...fits].every((row) => row.status === 'reviewed'),
    'CL-04 relations must remain reviewed',
  );
  for (const expected of tools) {
    const profile = profiles.find((row) => row.owner_id === expected.id);
    assert.ok(profile, `Missing ${expected.name} profile`);
    assert.equal(profile.owner_type, 'tool');
    assert.equal(profile.canonical_domain, expected.domain);
    assert.equal(toolCapabilities.find((row) => row.tool_id === expected.id)?.id, expected.toolCapabilityId);
    assert.equal(fits.find((row) => row.tool_id === expected.id)?.id, expected.fitId);
  }
  const [sources, claims, toolLinks, fitLinks] = await Promise.all([
    read<any>(
      'sources',
      db
        .from('product_intelligence_sources')
        .select('id, profile_id, url, page_type, fetch_status, updated_at')
        .in(
          'profile_id',
          profiles.map((row) => row.id),
        ),
    ),
    read<any>(
      'claims',
      db
        .from('product_intelligence_claims')
        .select(
          'id, profile_id, claim_key, source_id, source_url, claim_type, verification_status, conflict_status, invalidated_at, review_due_at, expires_at, verified_by',
        )
        .in(
          'profile_id',
          profiles.map((row) => row.id),
        ),
    ),
    read<any>(
      'tool links',
      db
        .from('tool_capability_claims')
        .select('tool_capability_id, claim_id, purpose')
        .in(
          'tool_capability_id',
          toolCapabilities.map((row) => row.id),
        ),
    ),
    read<any>(
      'fit links',
      db
        .from('tool_task_fit_claims')
        .select('fit_id, claim_id, purpose')
        .in(
          'fit_id',
          fits.map((row) => row.id),
        ),
    ),
  ]);
  assert.equal(toolLinks.length, 2, 'Expected one old Tool Capability link per tool');
  assert.equal(fitLinks.length, 2, 'Expected one old Fit link per tool');
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  for (const claim of claims) {
    assert.ok(profileById.has(claim.profile_id), 'Claim owner profile must resolve');
  }
  for (const expected of tools) {
    const profile = profiles.find((row) => row.owner_id === expected.id);
    assert.equal(sources.filter((source) => source.profile_id === profile.id).length, expected.sourceCount);
    assert.equal(claims.filter((claim) => claim.profile_id === profile.id).length, expected.claimCount);
    const claim = claims.find((row) => row.id === expected.oldClaimId);
    assert.ok(claim, `Missing ${expected.name} old claim`);
    assert.equal(claim.profile_id, profile.id, 'Linked claim must belong to this tool');
    assert.equal(claim.verification_status, 'verified');
    assert.equal(claim.conflict_status, 'none');
    assert.equal(claim.invalidated_at, null);
    assert.ok(new Date(claim.review_due_at).getTime() > Date.now(), 'Linked claim review must be current');
    assert.deepEqual(
      toolLinks.filter((link) => link.tool_capability_id === expected.toolCapabilityId),
      [{ tool_capability_id: expected.toolCapabilityId, claim_id: expected.oldClaimId, purpose: 'support' }],
    );
    assert.deepEqual(
      fitLinks.filter((link) => link.fit_id === expected.fitId),
      [{ fit_id: expected.fitId, claim_id: expected.oldClaimId, purpose: 'fit' }],
    );
  }
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
        toolLinks,
        fitLinks,
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

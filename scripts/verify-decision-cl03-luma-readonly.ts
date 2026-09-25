import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.env.CL03_ENV_DIR || process.cwd());

const ids = {
  task: '241ae23f-50b8-4cad-b93a-3eda29dc3dfe',
  tool: '711df152-fdcf-4a19-930c-ab866b67605f',
  profile: '4501f2f9-4579-4675-9a16-0ef800fe8385',
  toolCapability: '3fd95416-f1a7-4c43-8614-b5e6dd8051d3',
  fit: '2e5a0e13-ce68-4216-b315-0c6aa3e39937',
} as const;

async function checkedQuery(table: string, query: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const result = await query;
  if (result.error) throw new Error(`${table}: ${result.error.message}`);
  return result.data;
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let tool: unknown;
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query('SELECT id, name, status, url, updated_at::text FROM tools WHERE id = $1', [
      ids.tool,
    ]);
    assert.equal(result.rows.length, 1);
    tool = result.rows[0];
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }

  const db = createAdminClient();
  const [profile, sources, claims, toolCapability, fit, toolLinks, fitLinks, taskCapabilities] = await Promise.all([
    checkedQuery(
      'profile',
      db
        .from('product_intelligence_profiles')
        .select(
          'id, owner_type, owner_id, product_name, canonical_domain, profile_status, profile_version, updated_at, next_review_at',
        )
        .eq('id', ids.profile),
    ),
    checkedQuery(
      'sources',
      db
        .from('product_intelligence_sources')
        .select('id, url, canonical_url, source_type, last_verified_at, updated_at')
        .eq('profile_id', ids.profile),
    ),
    checkedQuery(
      'claims',
      db
        .from('product_intelligence_claims')
        .select(
          'id, claim_key, source_id, source_url, source_type, verification_status, conflict_status, invalidated_at, verified_by, review_due_at, expires_at',
        )
        .eq('profile_id', ids.profile),
    ),
    checkedQuery(
      'tool capability',
      db
        .from('tool_capabilities')
        .select(
          'id, tool_id, capability_id, support_level, availability, plan_requirement, limitations, status, reviewed_at, review_due_at, reviewed_by, updated_at',
        )
        .eq('id', ids.toolCapability),
    ),
    checkedQuery(
      'fit',
      db
        .from('tool_task_fits')
        .select(
          'id, tool_id, task_id, fit_level, rationale, required_conditions, disqualifiers, status, reviewed_at, review_due_at, reviewed_by, updated_at',
        )
        .eq('id', ids.fit),
    ),
    checkedQuery(
      'tool links',
      db
        .from('tool_capability_claims')
        .select('tool_capability_id, claim_id, purpose, created_at')
        .eq('tool_capability_id', ids.toolCapability),
    ),
    checkedQuery(
      'fit links',
      db.from('tool_task_fit_claims').select('fit_id, claim_id, purpose, created_at').eq('fit_id', ids.fit),
    ),
    checkedQuery(
      'task capabilities',
      db
        .from('task_capabilities')
        .select('task_id, capability_id, importance, status, reviewed_at, review_due_at, reviewed_by, updated_at')
        .eq('task_id', ids.task),
    ),
  ]);
  assert.equal((profile as unknown[]).length, 1, 'Luma must have one profile');
  assert.equal((sources as unknown[]).length, 4, 'Unexpected Luma source count; stop and reconcile');
  assert.equal((claims as unknown[]).length, 2, 'Unexpected Luma claim count; stop and reconcile');
  assert.equal((toolCapability as unknown[]).length, 1, 'Expected existing Tool Capability');
  assert.equal((fit as unknown[]).length, 1, 'Expected existing Fit');
  assert.equal((toolLinks as unknown[]).length, 1, 'Unexpected Tool Capability link count');
  assert.equal((fitLinks as unknown[]).length, 1, 'Unexpected Fit link count');
  assert.equal((taskCapabilities as unknown[]).length, 2, 'Expected two existing Task Capabilities');
  const output = {
    checkedAt: new Date().toISOString(),
    tool,
    profile,
    sources,
    claims,
    toolCapability,
    fit,
    toolLinks,
    fitLinks,
    taskCapabilities,
  };
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.env.CL05_ENV_DIR || process.cwd());

const taskSlug = 'ai-voiceover';
const capabilitySlugs = ['text-to-speech-voice-generation', 'voice-consent-and-export'];
const toolNames = ['ElevenLabs', 'Descript'];
const ids = {
  task: 'bb49bd6b-a968-4231-a505-5a79b5ffe8ad',
  ttsCapability: '9c70a590-5848-443b-88cc-203a8f446e18',
  governanceCapability: '87457bc5-6c9e-4aee-b051-0d85fcb8baf9',
  elevenlabs: 'd7b63bf2-63c8-4015-b59d-2f627450813f',
  descript: 'a8c41d20-6b48-4f75-9f17-7e34c84619d2',
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
      [toolNames.map((name) => name.toLowerCase())],
    );
    directoryTools = result.rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(directoryTools.length, 2, 'Expected exactly two existing Voice candidate tools');
  assert.equal(directoryTools.find((tool) => tool.name.toLowerCase() === 'elevenlabs')?.id, ids.elevenlabs);
  assert.equal(directoryTools.find((tool) => tool.name.toLowerCase() === 'descript')?.id, ids.descript);
  const toolIds = directoryTools.map((tool) => tool.id);
  for (const tool of directoryTools) assert.equal(tool.status, 'published');

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
  assert.equal(task.constraint_schema?.output, 'voiceover');
  const capabilities = await read<any>(
    'capabilities',
    db.from('decision_capabilities').select('id, slug, description, status').in('slug', capabilitySlugs),
  );
  assert.equal(capabilities.length, 2);
  assert.ok(capabilities.every((row) => row.status === 'active'));
  assert.equal(capabilities.find((row) => row.slug === 'text-to-speech-voice-generation')?.id, ids.ttsCapability);
  assert.equal(capabilities.find((row) => row.slug === 'voice-consent-and-export')?.id, ids.governanceCapability);
  const capabilityIds = capabilities.map((row) => row.id);
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
  assert.equal(taskCapabilities.length, 2, 'Expected two Voice Task Capabilities');
  assert.ok(taskCapabilities.every((row) => row.status === 'reviewed'));
  assert.equal(taskCapabilities.find((row) => row.capability_id === ids.ttsCapability)?.importance, 'required');
  assert.equal(taskCapabilities.find((row) => row.capability_id === ids.governanceCapability)?.importance, 'preferred');
  assert.equal(toolCapabilities.length, 0, 'Voice candidate Tool Capabilities must remain absent');
  assert.equal(fits.length, 0, 'Voice Fits must remain absent');
  assert.equal(profiles.length, 0, 'Voice candidates unexpectedly gained intelligence profiles');
  assert.deepEqual(directoryTools.map((row) => new URL(row.url).hostname.replace(/^www\./, '')).sort(), [
    'descript.com',
    'elevenlabs.io',
  ]);
  for (const profile of profiles) {
    assert.equal(profile.owner_type, 'tool');
    const tool = directoryTools.find((row) => row.id === profile.owner_id);
    assert.ok(tool, 'Profile owner must match a candidate tool');
    assert.equal(new URL(tool.url).hostname.replace(/^www\./, ''), profile.canonical_domain);
  }
  // No profile means no same-owner source/claim. No relationship means no subject link.
  const ownerEvidenceCounts = { profiles: profiles.length, sources: 0, claims: 0, links: 0 };
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
        ownerEvidenceCounts,
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

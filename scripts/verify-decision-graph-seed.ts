import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';

import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

const taskSlugs = [
  'product-image-to-short-video',
  'meeting-notes',
  'brand-constrained-marketing-content',
  'build-app-with-ai',
  'research-with-citations',
  'ai-voiceover',
];
const capabilitySlugs = [
  'image-to-video-generation',
  'video-editing-and-export',
  'meeting-transcription',
  'meeting-summary-and-actions',
  'brand-guided-content-generation',
  'brand-controls-and-style-guidance',
  'ai-assisted-app-development',
  'developer-workflow-integration',
  'research-discovery',
  'citation-traceability',
  'text-to-speech-voice-generation',
  'voice-consent-and-export',
];

async function main() {
  const supabase = createAdminClient();
  const [tasksResult, capabilitiesResult] = await Promise.all([
    supabase.from('decision_tasks').select('id, slug, status').in('slug', taskSlugs),
    supabase.from('decision_capabilities').select('id, slug, status').in('slug', capabilitySlugs),
  ]);
  const error = tasksResult.error || capabilitiesResult.error;
  if (error) throw new Error(`Decision Graph seed verification unavailable: ${error.message}`);
  const tasks = tasksResult.data || [];
  const capabilities = capabilitiesResult.data || [];
  assert.equal(tasks.length, taskSlugs.length, 'All six DIFF-03 Tasks must exist exactly once.');
  assert.equal(new Set(tasks.map((task) => task.slug)).size, taskSlugs.length, 'Task slugs must remain unique.');
  assert.equal(
    capabilities.length,
    capabilitySlugs.length,
    'All minimal DIFF-03 Capabilities must exist exactly once.',
  );
  assert.equal(
    new Set(capabilities.map((capability) => capability.slug)).size,
    capabilitySlugs.length,
    'Capability slugs must remain unique.',
  );

  const taskIds = tasks.map((task) => task.id);
  const capabilityIds = capabilities.map((capability) => capability.id);
  const [taskCapabilitiesResult, toolCapabilitiesResult, fitsResult] = await Promise.all([
    supabase
      .from('task_capabilities')
      .select('task_id, capability_id, status')
      .in('task_id', taskIds)
      .in('capability_id', capabilityIds),
    supabase.from('tool_capabilities').select('id, tool_id, capability_id, status').in('capability_id', capabilityIds),
    supabase.from('tool_task_fits').select('id, tool_id, task_id, status').in('task_id', taskIds),
  ]);
  const relationError = taskCapabilitiesResult.error || toolCapabilitiesResult.error || fitsResult.error;
  if (relationError) throw new Error(`Decision Graph relation verification unavailable: ${relationError.message}`);
  const taskCapabilities = taskCapabilitiesResult.data || [];
  const toolCapabilities = toolCapabilitiesResult.data || [];
  const fits = fitsResult.data || [];
  assert.equal(taskCapabilities.length, 12, 'The seed must create exactly the 12 planned Task Capability relations.');
  assert.ok(
    taskCapabilities.every((relation) => relation.status === 'reviewed'),
    'Task Capability seed must not publish records.',
  );
  assert.ok(
    toolCapabilities.every((relation) => relation.status === 'reviewed'),
    'Tool Capability seed must not publish records.',
  );
  assert.ok(
    fits.every((relation) => relation.status === 'reviewed'),
    'Tool Task Fit seed must not publish records.',
  );
  assert.ok(
    toolCapabilities.length <= 7 && fits.length <= 7,
    'Sparse evidence plan must not manufacture bulk relations.',
  );

  console.log(
    JSON.stringify(
      {
        success: true,
        tasks: tasks.length,
        capabilities: capabilities.length,
        taskCapabilities: taskCapabilities.length,
        toolCapabilities: toolCapabilities.length,
        toolTaskFits: fits.length,
        publicRelationsCreated: 0,
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

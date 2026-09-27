import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { JSDOM } from 'jsdom';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const ids = {
  task: '241ae23f-50b8-4cad-b93a-3eda29dc3dfe',
  imageCapability: '8affb0cf-5d2c-4837-89f9-abfba146dc66',
  editingCapability: '22061fe3-e424-4d74-862a-3392deb1a84e',
  tool: '711df152-fdcf-4a19-930c-ab866b67605f',
  profile: '4501f2f9-4579-4675-9a16-0ef800fe8385',
  toolCapability: '3fd95416-f1a7-4c43-8614-b5e6dd8051d3',
  fit: '2e5a0e13-ce68-4216-b315-0c6aa3e39937',
  oldClaim: '4cf9edb2-8b6d-49dd-bc36-ccbc32f7a939',
};

type Row = Record<string, any>;

async function read(label: string, query: PromiseLike<{ data: Row[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function getPage(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, 200, `${url} HTTP status`);
  return new JSDOM(await response.text()).window.document;
}

async function verifyOfficialPages() {
  const [app, pricing, ray] = await Promise.all([
    getPage('https://lumalabs.ai/app'),
    getPage('https://lumalabs.ai/pricing'),
    getPage('https://lumalabs.ai/ray'),
  ]);
  const appEntry = [...app.querySelectorAll('a')].find((anchor) => anchor.textContent?.trim() === 'Try Ray3.2');
  assert.equal(
    appEntry?.href,
    'https://app.lumalabs.ai/',
    `Ray3.2 App entry changed: ${[...app.querySelectorAll('a')]
      .filter((anchor) => anchor.textContent?.includes('Ray3.2'))
      .map((anchor) => anchor.textContent?.trim())
      .join(', ')}`,
  );
  const rayEntry = [...ray.querySelectorAll('a')].find((anchor) => anchor.textContent?.trim() === 'Try in Luma');
  assert.equal(rayEntry?.href, 'https://app.lumalabs.ai/', 'Ray3.2 product App entry changed');
  const apiEntry = [...ray.querySelectorAll('a')].find((anchor) => anchor.textContent?.trim() === 'Build with API');
  assert.ok(apiEntry && apiEntry.href !== rayEntry?.href, 'App/API entry separation changed');
  const rayPricingLabel = [...pricing.querySelectorAll('span')].find(
    (element) => element.textContent?.trim() === 'Ray3.2',
  );
  assert.ok(rayPricingLabel, 'Ray3.2 pricing row missing');
  const modelGroup = rayPricingLabel.parentElement?.parentElement?.parentElement;
  const modelText = modelGroup?.textContent?.replace(/\s+/g, ' ') || '';
  assert.match(
    modelText,
    /Ray3\.2.*Text-to-Video\s*Image-to-Video\s*Draft\s*-\s*20 credits\s*\/\s*5 sec\s*60 credits\s*\/\s*10 sec/,
  );
  return { appEntry: true, rayAppApiSeparated: true, ray32ImageToVideoCreditRow: true };
}

async function verifyProduction() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  try {
    await neon.query('BEGIN READ ONLY');
    const rows = (await neon.query('SELECT id, status, url FROM tools WHERE id = $1::uuid', [ids.tool])).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, 'published');
    assert.equal(rows[0].url, 'https://lumalabs.ai/');
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  const db = createAdminClient();
  const [tasks, taskCapabilities, toolCapabilities, fits, profiles, sources, claims, toolLinks, fitLinks] =
    await Promise.all([
      read('task', db.from('decision_tasks').select('id,slug,status').eq('id', ids.task)),
      read(
        'task capabilities',
        db.from('task_capabilities').select('task_id,capability_id,status').eq('task_id', ids.task),
      ),
      read(
        'tool capability',
        db
          .from('tool_capabilities')
          .select('id,tool_id,capability_id,status,availability')
          .eq('tool_id', ids.tool)
          .eq('capability_id', ids.imageCapability),
      ),
      read(
        'fit',
        db.from('tool_task_fits').select('id,task_id,tool_id,status').eq('task_id', ids.task).eq('tool_id', ids.tool),
      ),
      read(
        'profile',
        db
          .from('product_intelligence_profiles')
          .select('id,owner_id,canonical_domain,profile_status')
          .eq('owner_id', ids.tool),
      ),
      read('sources', db.from('product_intelligence_sources').select('id').eq('profile_id', ids.profile)),
      read('claims', db.from('product_intelligence_claims').select('id').eq('profile_id', ids.profile)),
      read(
        'tool links',
        db
          .from('tool_capability_claims')
          .select('tool_capability_id,claim_id,purpose')
          .eq('tool_capability_id', ids.toolCapability),
      ),
      read('fit links', db.from('tool_task_fit_claims').select('fit_id,claim_id,purpose').eq('fit_id', ids.fit)),
    ]);
  assert.deepEqual(
    tasks.map(({ id, slug, status }) => ({ id, slug, status })),
    [{ id: ids.task, slug: 'product-image-to-short-video', status: 'active' }],
  );
  assert.equal(taskCapabilities.length, 2);
  assert.ok(taskCapabilities.every((row) => row.status === 'reviewed'));
  assert.deepEqual(
    new Set(taskCapabilities.map((row) => row.capability_id)),
    new Set([ids.imageCapability, ids.editingCapability]),
  );
  assert.deepEqual(
    toolCapabilities.map(({ id, tool_id, capability_id, status, availability }) => ({
      id,
      tool_id,
      capability_id,
      status,
      availability,
    })),
    [
      {
        id: ids.toolCapability,
        tool_id: ids.tool,
        capability_id: ids.imageCapability,
        status: 'reviewed',
        availability: 'unknown',
      },
    ],
  );
  assert.deepEqual(
    fits.map(({ id, task_id, tool_id, status }) => ({ id, task_id, tool_id, status })),
    [{ id: ids.fit, task_id: ids.task, tool_id: ids.tool, status: 'reviewed' }],
  );
  assert.deepEqual(
    profiles.map(({ id, owner_id, canonical_domain, profile_status }) => ({
      id,
      owner_id,
      canonical_domain,
      profile_status,
    })),
    [{ id: ids.profile, owner_id: ids.tool, canonical_domain: 'lumalabs.ai', profile_status: 'ready' }],
  );
  assert.equal(sources.length, 4);
  assert.equal(claims.length, 2);
  assert.deepEqual(
    toolLinks.map(({ claim_id, purpose }) => ({ claim_id, purpose })),
    [{ claim_id: ids.oldClaim, purpose: 'support' }],
  );
  assert.deepEqual(
    fitLinks.map(({ claim_id, purpose }) => ({ claim_id, purpose })),
    [{ claim_id: ids.oldClaim, purpose: 'fit' }],
  );
  const taskPage = await fetch('https://aibesttool.com/cn/tasks/product-image-to-short-video', {
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(taskPage.status, 404, 'CL-03 Task Page opened');
  return {
    sources: sources.length,
    claims: claims.length,
    toolLinks: toolLinks.length,
    fitLinks: fitLinks.length,
    taskPage: taskPage.status,
  };
}

async function main() {
  const [official, production] = await Promise.all([verifyOfficialPages(), verifyProduction()]);
  console.log(
    JSON.stringify({
      success: true,
      checkedAtUtc: new Date().toISOString(),
      productionWrites: 0,
      official,
      production,
    }),
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

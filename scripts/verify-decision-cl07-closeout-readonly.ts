import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

export const clusters = [
  {
    id: 'CL-02',
    slug: 'research-with-citations',
    taskId: '527fe8b7-c171-4c50-ab1f-9404d7536e7c',
    tools: ['f15873ae-c6ef-4f0a-b811-b40c2aba76ab'],
    expected: { task: 'published', tool: 'published', fit: 'published', toolCount: 1, fitCount: 1 },
  },
  {
    id: 'CL-03',
    slug: 'product-image-to-short-video',
    taskId: '241ae23f-50b8-4cad-b93a-3eda29dc3dfe',
    tools: ['711df152-fdcf-4a19-930c-ab866b67605f'],
    expected: { task: 'reviewed', tool: 'reviewed', fit: 'reviewed', toolCount: 1, fitCount: 1 },
  },
  {
    id: 'CL-04',
    slug: 'build-app-with-ai',
    taskId: '10ffdf04-6885-4a28-949d-0723038c6954',
    tools: ['23bb3601-a5ac-42c3-bff3-64b06a063959', 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e'],
    expected: { task: 'reviewed', tool: 'reviewed', fit: 'reviewed', toolCount: 2, fitCount: 2 },
  },
  {
    id: 'CL-05',
    slug: 'ai-voiceover',
    taskId: 'bb49bd6b-a968-4231-a505-5a79b5ffe8ad',
    tools: ['d7b63bf2-63c8-4015-b59d-2f627450813f', 'a8c41d20-6b48-4f75-9f17-7e34c84619d2'],
    expected: { task: 'reviewed', tool: 'reviewed', fit: 'reviewed', toolCount: 0, fitCount: 0 },
  },
  {
    id: 'CL-06',
    slug: 'brand-constrained-marketing-content',
    taskId: '532b3a97-a6ec-40f7-a906-0d200ff11ffb',
    tools: [
      '5a0c7e91-9a5c-4f84-923a-d8345edaa918',
      '4d0bbf38-6b7e-4c44-8e25-9fe73f60bb18',
      '149cf3e0-5f5c-4bdf-ac02-80ec5064fb92',
    ],
    expected: { task: 'reviewed', tool: 'reviewed', fit: 'reviewed', toolCount: 0, fitCount: 0 },
  },
] as const;

type Row = Record<string, any>;

async function read(label: string, query: PromiseLike<{ data: Row[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

export function verifyClusterSnapshot(
  cluster: (typeof clusters)[number],
  rows: {
    task: Row;
    taskCapabilities: Row[];
    toolCapabilities: Row[];
    fits: Row[];
  },
) {
  assert.equal(rows.task.id, cluster.taskId, `${cluster.id} Task identity changed`);
  assert.equal(rows.task.status, 'active');
  assert.equal(rows.taskCapabilities.length, 2, `${cluster.id} Task Capability count`);
  assert.ok(
    rows.taskCapabilities.every((row) => row.status === cluster.expected.task),
    `${cluster.id} Task Capability status`,
  );
  assert.equal(rows.toolCapabilities.length, cluster.expected.toolCount, `${cluster.id} Tool Capability count`);
  assert.ok(
    rows.toolCapabilities.every((row) => row.status === cluster.expected.tool),
    `${cluster.id} Tool Capability status`,
  );
  assert.equal(rows.fits.length, cluster.expected.fitCount, `${cluster.id} Fit count`);
  assert.ok(
    rows.fits.every((row) => row.status === cluster.expected.fit),
    `${cluster.id} Fit status`,
  );
  assert.ok(
    rows.toolCapabilities.every((row) => cluster.tools.some((id) => id === row.tool_id)),
    `${cluster.id} unexpected tool relation`,
  );
  assert.ok(
    rows.fits.every((row) => cluster.tools.some((id) => id === row.tool_id)),
    `${cluster.id} unexpected Fit owner`,
  );
}

async function fetchProduction(path: string) {
  const response = await fetch(`https://aibesttool.com${path}`, { signal: AbortSignal.timeout(20_000) });
  return { status: response.status, body: await response.text() };
}

async function main() {
  const toolIds = [...new Set(clusters.flatMap((cluster) => [...cluster.tools]))];
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let directoryTools: Row[];
  try {
    await neon.query('BEGIN READ ONLY');
    directoryTools = (await neon.query('SELECT id, name, status, url FROM tools WHERE id = ANY($1::uuid[])', [toolIds]))
      .rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  assert.equal(directoryTools.length, toolIds.length, 'Candidate tool directory identity changed');
  assert.ok(directoryTools.every((row) => row.status === 'published'));

  const db = createAdminClient();
  const taskIds = clusters.map((cluster) => cluster.taskId);
  const [tasks, taskCapabilities, fits, profiles] = await Promise.all([
    read('tasks', db.from('decision_tasks').select('id, slug, status').in('id', taskIds)),
    read(
      'task capabilities',
      db
        .from('task_capabilities')
        .select('task_id, capability_id, importance, status, reviewed_by, reviewed_at, review_due_at, updated_at')
        .in('task_id', taskIds),
    ),
    read(
      'fits',
      db
        .from('tool_task_fits')
        .select('id, task_id, tool_id, status, reviewed_by, reviewed_at, review_due_at, updated_at')
        .in('task_id', taskIds),
    ),
    read(
      'profiles',
      db
        .from('product_intelligence_profiles')
        .select('id, owner_type, owner_id, canonical_domain, profile_status')
        .in('owner_id', toolIds),
    ),
  ]);
  assert.equal(tasks.length, clusters.length);
  const capabilityIds = [...new Set(taskCapabilities.map((row) => row.capability_id))];
  const [capabilities, toolCapabilities] = await Promise.all([
    read('capabilities', db.from('decision_capabilities').select('id, slug, status').in('id', capabilityIds)),
    read(
      'tool capabilities',
      db
        .from('tool_capabilities')
        .select(
          'id, tool_id, capability_id, status, support_level, availability, reviewed_by, reviewed_at, review_due_at, updated_at',
        )
        .in('tool_id', toolIds)
        .in('capability_id', capabilityIds),
    ),
  ]);
  assert.equal(capabilities.length, 10);
  assert.ok(capabilities.every((row) => row.status === 'active'));
  assert.equal(taskCapabilities.length, 10);
  assert.equal(toolCapabilities.length, 4);
  assert.equal(fits.length, 4);

  const [sources, claims, toolLinks, fitLinks] = await Promise.all([
    read(
      'sources',
      db
        .from('product_intelligence_sources')
        .select('id, profile_id, url, source_type, fetch_status, last_verified_at')
        .in(
          'profile_id',
          profiles.map((row) => row.id),
        ),
    ),
    read(
      'claims',
      db
        .from('product_intelligence_claims')
        .select(
          'id, profile_id, source_id, source_url, claim_key, verification_status, conflict_status, invalidated_at, verified_by, review_due_at, expires_at',
        )
        .in(
          'profile_id',
          profiles.map((row) => row.id),
        ),
    ),
    read(
      'tool links',
      db
        .from('tool_capability_claims')
        .select('tool_capability_id, claim_id, purpose')
        .in(
          'tool_capability_id',
          toolCapabilities.map((row) => row.id),
        ),
    ),
    read(
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
  const now = Date.now();
  const claimById = new Map(claims.map((row) => [row.id, row]));
  const sourceById = new Map(sources.map((row) => [row.id, row]));
  const profileByTool = new Map(profiles.map((row) => [row.owner_id, row]));
  assert.ok(
    profiles.every((row) => row.owner_type === 'tool' && toolIds.includes(row.owner_id)),
    'Profile owner boundary',
  );
  assert.ok(
    sources.every((row) => profiles.some((profile) => profile.id === row.profile_id)),
    'Source owner boundary',
  );
  assert.ok(
    claims.every((row) => profiles.some((profile) => profile.id === row.profile_id)),
    'Claim owner boundary',
  );
  const assertLink = (link: Row, toolId: string, requireCurrent: boolean) => {
    const profile = profileByTool.get(toolId);
    const claim = claimById.get(link.claim_id);
    assert.ok(profile && claim && claim.profile_id === profile.id, 'Claim owner mismatch');
    if (requireCurrent) {
      assert.equal(profile.profile_status, 'ready');
      assert.equal(claim.verification_status, 'verified');
      assert.equal(claim.conflict_status, 'none');
      assert.equal(claim.invalidated_at, null);
      assert.ok(claim.verified_by && Date.parse(claim.review_due_at) > now, 'Published claim review expired');
      assert.ok(!claim.expires_at || Date.parse(claim.expires_at) > now, 'Published claim expired');
      const source = sourceById.get(claim.source_id);
      assert.ok(
        source && source.profile_id === profile.id && source.url === claim.source_url,
        'Published source mismatch',
      );
      assert.ok(['official', 'official_docs'].includes(source.source_type), 'Published source must be official');
    }
  };
  const summaries = clusters.map((cluster) => {
    const task = tasks.find((row) => row.slug === cluster.slug);
    assert.ok(task, `${cluster.id} missing Task`);
    const tc = taskCapabilities.filter((row) => row.task_id === task.id);
    const relatedCapabilityIds = tc.map((row) => row.capability_id);
    const tool = toolCapabilities.filter(
      (row) => cluster.tools.some((id) => id === row.tool_id) && relatedCapabilityIds.includes(row.capability_id),
    );
    const fit = fits.filter((row) => row.task_id === task.id);
    verifyClusterSnapshot(cluster, { task, taskCapabilities: tc, toolCapabilities: tool, fits: fit });
    const tLinks = toolLinks.filter((link) => tool.some((row) => row.id === link.tool_capability_id));
    const fLinks = fitLinks.filter((link) => fit.some((row) => row.id === link.fit_id));
    for (const link of tLinks)
      assertLink(link, tool.find((row) => row.id === link.tool_capability_id)!.tool_id, cluster.id === 'CL-02');
    for (const link of fLinks)
      assertLink(link, fit.find((row) => row.id === link.fit_id)!.tool_id, cluster.id === 'CL-02');
    if (cluster.id === 'CL-02') {
      assert.equal(tLinks.length + fLinks.length, 13, 'CL-02 published evidence link count');
      assert.deepEqual(
        new Set(tLinks.map((row) => row.purpose)),
        new Set(['support', 'availability', 'plan', 'limitation']),
      );
      assert.deepEqual(new Set(fLinks.map((row) => row.purpose)), new Set(['fit', 'limitation']));
      assert.ok([...tc, ...tool, ...fit].every((row) => row.reviewed_by && Date.parse(row.review_due_at) > now));
    } else if (cluster.id === 'CL-03' || cluster.id === 'CL-04') {
      assert.equal(tLinks.length, cluster.expected.toolCount, `${cluster.id} old Tool link boundary`);
      assert.equal(fLinks.length, cluster.expected.fitCount, `${cluster.id} old Fit link boundary`);
      assert.ok(tLinks.every((row) => row.purpose === 'support'));
      assert.ok(fLinks.every((row) => row.purpose === 'fit'));
    } else {
      assert.equal(tLinks.length + fLinks.length, 0);
    }
    const clusterProfiles = profiles.filter((row) => cluster.tools.some((id) => id === row.owner_id));
    const profileIds = clusterProfiles.map((row) => row.id);
    return {
      id: cluster.id,
      slug: cluster.slug,
      taskCapabilities: tc.map((row) => ({ capabilityId: row.capability_id, status: row.status })),
      toolCapabilities: tool.map((row) => ({ id: row.id, status: row.status, availability: row.availability })),
      fits: fit.map((row) => ({ id: row.id, status: row.status })),
      evidence: {
        profiles: clusterProfiles.map((row) => ({ id: row.id, status: row.profile_status })),
        sources: sources.filter((row) => profileIds.includes(row.profile_id)).length,
        claims: claims.filter((row) => profileIds.includes(row.profile_id)).length,
        toolLinks: tLinks.length,
        fitLinks: fLinks.length,
      },
    };
  });
  assert.equal(
    profiles.filter((row) => clusters[3].tools.some((id) => id === row.owner_id)).length,
    0,
    'CL-05 profile boundary',
  );
  assert.equal(
    profiles.filter((row) => clusters[4].tools.some((id) => id === row.owner_id)).length,
    1,
    'CL-06 profile boundary',
  );
  assert.equal(
    profiles.find((row) => row.owner_id === '149cf3e0-5f5c-4bdf-ac02-80ec5064fb92')?.profile_status,
    'conflict',
  );
  assert.deepEqual(
    summaries.map((row) => [row.evidence.profiles.length, row.evidence.sources, row.evidence.claims]),
    [
      [1, 7, 8],
      [1, 4, 2],
      [2, 12, 7],
      [0, 0, 0],
      [1, 3, 16],
    ],
    'Unexpected evidence profile/source/claim boundary',
  );
  const [robots, sitemap, ...taskPages] = await Promise.all([
    fetchProduction('/robots.txt'),
    fetchProduction('/sitemap.xml'),
    ...clusters.map((cluster) => fetchProduction(`/cn/tasks/${cluster.slug}`)),
  ]);
  assert.equal(robots.status, 200);
  assert.match(robots.body, /Sitemap:\s*https:\/\/aibesttool\.com\/sitemap\.xml/i);
  assert.equal(sitemap.status, 200);
  assert.equal((sitemap.body.match(/<loc>/g) || []).length, 126, 'Production sitemap count changed');
  assert.doesNotMatch(sitemap.body, /<loc>[^<]*\/tasks\//, 'Task URLs must not enter sitemap');
  assert.ok(
    taskPages.every((page) => page.status === 404),
    'All five Task Pages must remain 404',
  );
  console.log(
    JSON.stringify(
      {
        success: true,
        checkedAtUtc: new Date().toISOString(),
        productionWrites: 0,
        summaries,
        pages: clusters.map((cluster, index) => ({ slug: cluster.slug, status: taskPages[index].status })),
        robots: robots.status,
        sitemap: { status: sitemap.status, urls: 126, taskUrls: 0 },
        totals: {
          taskCapabilities: taskCapabilities.length,
          toolCapabilities: toolCapabilities.length,
          fits: fits.length,
          profiles: profiles.length,
          sources: sources.length,
          claims: claims.length,
          toolLinks: toolLinks.length,
          fitLinks: fitLinks.length,
        },
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

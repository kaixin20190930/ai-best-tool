import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getSupabaseUrl } from '../lib/supabase/env';

loadEnvConfig(process.cwd());

const identityRules = {
  bolt: { names: ['bolt', 'bolt.new'], hosts: ['bolt.new', 'www.bolt.new'] },
  lovable: { names: ['lovable', 'lovable.dev'], hosts: ['lovable.dev', 'www.lovable.dev'] },
  replit: { names: ['replit'], hosts: ['replit.com', 'www.replit.com'] },
  v0: { names: ['v0', 'v0-by-vercel', 'v0 by vercel'], hosts: ['v0.app', 'www.v0.app', 'v0.dev', 'www.v0.dev'] },
} as const;
const allowedNames = Object.values(identityRules).flatMap((rule) => rule.names);
const hostToKey = new Map(Object.entries(identityRules).flatMap(([key, rule]) => rule.hosts.map((host) => [host, key] as const)));
const nameToKey = new Map(Object.entries(identityRules).flatMap(([key, rule]) => rule.names.map((name) => [name, key] as const)));
const officialHostRegex = '^https?://(www\\.)?(bolt\\.new|lovable\\.dev|replit\\.com|v0\\.app|v0\\.dev)(:[0-9]+)?([/?#]|$)';
const targetTaskSlug = 'build-app-with-ai';
const targetCapabilitySlugs = ['ai-assisted-app-development', 'developer-workflow-integration'];
const outputPath = path.join(
  process.cwd(),
  'data/decision-graph/build-app-production-inventory-2026-10-13.json',
);

function getOnlyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method !== 'GET') throw new Error(`Read-only verifier rejected HTTP ${method}.`);
  return fetch(input, { ...init, method: 'GET' });
}

async function read<T>(label: string, query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) throw new Error(`${label} read failed: ${error.message}`);
  if (data === null) throw new Error(`${label} read returned null without an error; visibility is unknown, not zero.`);
  return data;
}

async function main() {
  const checkedAtUtc = new Date().toISOString();
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let directoryTools: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    const result = await neon.query(
      `SELECT id, name, status, url, updated_at::text FROM tools
       WHERE lower(name) = ANY($1::text[])
          OR lower(url) ~* $2
       ORDER BY lower(name)`,
      [allowedNames, officialHostRegex],
    );
    directoryTools = result.rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }
  const matches = new Map<string, any>();
  const candidates = directoryTools.map(({ id, name, url }) => ({ id, name, url }));
  for (const row of directoryTools) {
    const normalizedName = String(row.name).trim().toLowerCase();
    let host: string;
    try {
      host = new URL(row.url).hostname.toLowerCase();
    } catch {
      throw new Error(`Candidate has an invalid official URL: ${JSON.stringify({ id: row.id, name: row.name, url: row.url, nameKey: nameToKey.get(normalizedName) || null, domainKey: null })}; candidates=${JSON.stringify(candidates)}`);
    }
    const nameKey = nameToKey.get(normalizedName) || null;
    const domainKey = hostToKey.get(host) || null;
    const candidate = { id: row.id, name: row.name, url: row.url, host, nameKey, domainKey };
    if (nameKey && !domainKey) {
      throw new Error(`Candidate name matched an allowed alias but its host is not allowed: ${JSON.stringify(candidate)}; candidates=${JSON.stringify(candidates)}`);
    }
    if (domainKey && !nameKey) {
      throw new Error(`Candidate host matched an official domain but its name is not an allowed alias: ${JSON.stringify(candidate)}; candidates=${JSON.stringify(candidates)}`);
    }
    if (nameKey !== domainKey) {
      throw new Error(`Candidate name and official host resolve to different identities: ${JSON.stringify(candidate)}; candidates=${JSON.stringify(candidates)}`);
    }
    if (!nameKey) continue;
    if (matches.has(nameKey)) {
      throw new Error(`Duplicate directory identity candidates for ${nameKey}: ${JSON.stringify([matches.get(nameKey), candidate])}; allCandidates=${JSON.stringify(candidates)}`);
    }
    matches.set(nameKey, row);
  }
  if (matches.size !== 4) {
    throw new Error(`Directory lookup resolved ${matches.size}/4 unique identities (${[...matches.keys()].join(', ')}); unresolved identity is not evidence of absence. Candidate rows: ${JSON.stringify(candidates)}`);
  }
  directoryTools = [...matches.values()].sort((a, b) => a.name.localeCompare(b.name));

  const supabaseKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseKey) throw new Error('Supabase service key is unavailable; relation visibility is unknown, not zero.');
  const supabase = createClient(getSupabaseUrl(), supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: getOnlyFetch },
  });
  const toolIds = directoryTools.map((row) => row.id);
  const [tasks, capabilities, profiles] = await Promise.all([
    read<any>('Task', supabase.from('decision_tasks').select('*').eq('slug', targetTaskSlug)),
    read<any>('Capability taxonomy', supabase.from('decision_capabilities').select('*').in('slug', targetCapabilitySlugs)),
    read<any>('Tool profiles', supabase.from('product_intelligence_profiles').select('*').eq('owner_type', 'tool').in('owner_id', toolIds)),
  ]);
  if (tasks.length !== 1) throw new Error(`Task lookup returned ${tasks.length} rows; expected one unique row.`);
  const task = tasks[0];
  if (capabilities.length !== targetCapabilitySlugs.length) throw new Error('Capability taxonomy lookup was incomplete; do not interpret missing rows as absent production relations.');

  const capabilityIds = capabilities.map((row) => row.id);
  const profileIds = profiles.map((row) => row.id);
  const [taskCapabilities, toolCapabilities, fits, sources, claims] = await Promise.all([
    read<any>('Task Capabilities', supabase.from('task_capabilities').select('*').eq('task_id', task.id).in('capability_id', capabilityIds)),
    read<any>('Tool Capabilities', supabase.from('tool_capabilities').select('*').in('tool_id', toolIds)),
    read<any>('Tool Task Fits', supabase.from('tool_task_fits').select('*').in('tool_id', toolIds)),
    read<any>('Intelligence sources', profileIds.length ? supabase.from('product_intelligence_sources').select('*').in('profile_id', profileIds) : supabase.from('product_intelligence_sources').select('*').eq('profile_id', '00000000-0000-0000-0000-000000000000')),
    read<any>('Intelligence claims', profileIds.length ? supabase.from('product_intelligence_claims').select('*').in('profile_id', profileIds) : supabase.from('product_intelligence_claims').select('*').eq('profile_id', '00000000-0000-0000-0000-000000000000')),
  ]);
  const toolCapabilityIds = toolCapabilities.map((row) => row.id);
  const fitIds = fits.map((row) => row.id);
  const [toolLinks, fitLinks] = await Promise.all([
    read<any>('Tool Capability evidence links', toolCapabilityIds.length ? supabase.from('tool_capability_claims').select('*').in('tool_capability_id', toolCapabilityIds) : supabase.from('tool_capability_claims').select('*').eq('tool_capability_id', '00000000-0000-0000-0000-000000000000')),
    read<any>('Fit evidence links', fitIds.length ? supabase.from('tool_task_fit_claims').select('*').in('fit_id', fitIds) : supabase.from('tool_task_fit_claims').select('*').eq('fit_id', '00000000-0000-0000-0000-000000000000')),
  ]);

  const capabilityById = new Map(capabilities.map((row) => [row.id, row]));
  const profileByOwnerId = new Map(profiles.map((row) => [row.owner_id, row]));
  const claimById = new Map(claims.map((row) => [row.id, row]));
  const toolById = new Map(directoryTools.map((row) => [row.id, row]));
  const snapshot = {
    schemaVersion: 1,
    unit: 'BUILD-APP-RELATION-PRODUCTION-INVENTORY-01',
    checkedAtUtc,
    access: {
      neon: { status: 'readable', mode: 'BEGIN READ ONLY + SELECT + ROLLBACK', writes: 0 },
      supabase: { status: 'readable', mode: 'HTTP GET only; non-GET rejected before network', writes: 0, rpcCalls: 0 },
      absenceSemantics: 'An empty row array means zero only when the table GET completed successfully. Any failed/partial lookup aborts snapshot generation and must be reported as unknown/inaccessible.',
    },
    task: { ...task, requestedCapabilities: targetCapabilitySlugs.map((slug) => capabilities.find((row) => row.slug === slug)) },
    taskCapabilities: taskCapabilities.map((row) => ({ ...row, capability: capabilityById.get(row.capability_id) })),
    tools: directoryTools.map((directoryTool) => {
      const profile = profileByOwnerId.get(directoryTool.id);
      const ownedSources = sources.filter((row) => row.profile_id === profile?.id);
      const ownedClaims = claims.filter((row) => row.profile_id === profile?.id);
      const ownedToolCapabilities = toolCapabilities.filter((row) => row.tool_id === directoryTool.id);
      const ownedFits = fits.filter((row) => row.tool_id === directoryTool.id);
      return {
        directory: directoryTool,
        profile: profile || null,
        profileCount: profiles.filter((row) => row.owner_id === directoryTool.id).length,
        sources: ownedSources,
        sourceCount: ownedSources.length,
        claims: ownedClaims,
        claimCount: ownedClaims.length,
        toolCapabilities: ownedToolCapabilities.map((row) => ({
          ...row,
          capability: capabilityById.get(row.capability_id) || null,
          evidenceLinks: toolLinks.filter((link) => link.tool_capability_id === row.id).map((link) => ({ ...link, claim: claimById.get(link.claim_id) || null })),
        })),
        fits: ownedFits.map((row) => ({
          ...row,
          task: row.task_id === task.id ? { id: task.id, slug: task.slug } : null,
          evidenceLinks: fitLinks.filter((link) => link.fit_id === row.id).map((link) => ({ ...link, claim: claimById.get(link.claim_id) || null })),
        })),
        otherFitCount: ownedFits.filter((row) => row.task_id !== task.id).length,
      };
    }),
    totals: {
      directoryTools: directoryTools.length,
      profiles: profiles.length,
      sources: sources.length,
      claims: claims.length,
      taskCapabilities: taskCapabilities.length,
      toolCapabilities: toolCapabilities.length,
      fits: fits.length,
      toolCapabilityEvidenceLinks: toolLinks.length,
      fitEvidenceLinks: fitLinks.length,
    },
    historicalComparison: {
      snapshotDate: '2026-09-28',
      source: 'docs/DECISION_GRAPH_CL07_PRODUCTION_CLOSEOUT_2026-09-27_CN.md and docs/DECISION_GRAPH_CL04_APP_BUILD_ELIGIBILITY_2026-09-27_CN.md',
      limitation: 'The historical snapshot covers n8n/OpenRouter, not the four current target tools. It records 2 Task Capabilities; n8n/OpenRouter each had 1 Tool Capability and 1 Fit, 12 sources and 7 claims total, and 1 Tool Capability support link plus 1 Fit link per tool before the 2026-09-28 withdrawal. Their two Fits were then changed to stale; this is not a baseline for Bolt/Lovable/Replit/v0.',
    },
    readinessComparison: {
      source: 'data/decision-graph/build-app-relation-readiness-2026-10-13.json',
      priorProductionState: 'unknown_until_read_only_inventory',
      checkedNow: true,
    },
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ success: true, outputPath, checkedAtUtc, totals: snapshot.totals, productionWrites: 0, databaseMethods: ['SELECT'], supabaseHttpMethods: ['GET'], rpcCalls: 0 }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`Production inventory blocked: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

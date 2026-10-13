import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getSupabaseUrl } from '../lib/supabase/env';
import { buildBatch } from './build-app-decision-batch';

const manifestPath = 'data/decision-graph/build-app-decision-closeout-2026-10-13.json';
const requiredLegacy = [
  'source_git_handoff', 'hosting_deployment', 'data_backend_portability',
  'integrations', 'cost_usage_boundaries', 'maintenance_operational_ownership',
];
const requiredPurposes = {
  capability: ['support', 'availability', 'plan', 'limitation'],
  fit: ['fit', 'limitation'],
};

type Claim = {
  key: string;
  sourceUrl: string;
  sourceDate: string;
  sourceDateMeaning: string;
  observedAt: string;
  sourceExcerpt: string;
  excerptVerifiedAt: string;
  excerptLocator: string;
  summary: string;
  scope: Record<string, string>;
  status: string;
  nextReviewDate: string;
};
type Tool = {
  slug: string;
  toolId: string;
  officialHost: string;
  decision: string;
  availability: string;
  fitLevel: string;
  legacySnapshot: string;
  profile: { canonicalDomain: string; productName: string };
  decisionProfile: { summary: Record<string, string> };
  toolCapability: { planRequirement: Record<string, string>; limitations: Record<string, string[]> };
  fit: {
    rationale: Record<string, string>;
    requiredConditions: Record<string, string[]>;
    disqualifiers: Record<string, string[]>;
  };
  newClaims: Claim[];
  purposeLinks: Record<string, Record<string, string>>;
};

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function validateLocal() {
  const manifest = readJson(manifestPath);
  const inventoryBytes = readFileSync(manifest.inventory.path);
  const inventoryHash = createHash('sha256').update(inventoryBytes).digest('hex');
  assert.equal(inventoryHash, manifest.inventory.sha256, 'Inventory preimage changed');
  const inventory = JSON.parse(inventoryBytes.toString());
  assert.equal(manifest.release.productionCommitAllowed, false);
  assert.equal(manifest.release.qaRequired, true);
  assert.equal(manifest.task.id, inventory.task.id);
  assert.equal(manifest.task.slug, inventory.task.slug);
  assert.equal(manifest.capability.id, inventory.task.requestedCapabilities.find((row: any) => row.slug === manifest.capability.slug)?.id);
  assert.equal(inventory.taskCapabilities.length, 2);
  assert.equal(inventory.taskCapabilities.find((row: any) => row.importance === 'required')?.status, 'reviewed');
  assert.equal(inventory.taskCapabilities.find((row: any) => row.importance === 'preferred')?.status, 'reviewed');
  assert.deepEqual(manifest.legacyClaimKeys, requiredLegacy);
  assert.deepEqual(manifest.tools.map((tool: Tool) => tool.slug).sort(), ['bolt', 'lovable', 'replit', 'v0']);

  const ids = new Set<string>();
  for (const tool of manifest.tools as Tool[]) {
    assert.equal(tool.decision, 'PASS');
    assert.equal(tool.availability, tool.slug === 'replit' ? 'unknown' : 'all_plans');
    assert.equal((tool as any).writeEligibility, tool.slug === 'replit' ? 'HOLD_EVIDENCE' : 'READY');
    assert.equal(tool.fitLevel, 'conditional');
    assert.ok(!ids.has(tool.toolId), `Duplicate tool ID: ${tool.toolId}`);
    ids.add(tool.toolId);
    const directory = inventory.tools.find((row: any) => row.directory.id === tool.toolId)?.directory;
    assert.ok(directory, `Missing inventory identity: ${tool.slug}`);
    assert.equal(directory.status, 'published');
    assert.equal(new URL(directory.url).hostname, tool.officialHost);
    assert.equal(tool.profile.canonicalDomain, tool.officialHost);
    assert.ok(tool.profile.productName.trim());
    for (const localized of [tool.decisionProfile.summary, tool.toolCapability.planRequirement, tool.fit.rationale]) {
      assert.ok(localized.en?.trim() && localized.cn?.trim(), `${tool.slug}: incomplete bilingual object`);
    }
    for (const localized of [tool.toolCapability.limitations, tool.fit.requiredConditions, tool.fit.disqualifiers]) {
      assert.ok(localized.en?.length && localized.cn?.length, `${tool.slug}: incomplete bilingual list`);
    }
    const legacy = readJson(tool.legacySnapshot).tools.find((row: any) => row.tool === tool.slug);
    assert.ok(legacy, `Missing legacy evidence: ${tool.slug}`);
    assert.deepEqual(legacy.claims.map((claim: any) => claim.stableKey), requiredLegacy);
    const keys = new Set(tool.newClaims.map((claim) => claim.key));
    assert.deepEqual([...keys].sort(), ['core_ai_app_generation', 'core_availability_plan', 'task_fit_limit']);
    const quotedWordsBySource = new Map<string, number>();
    for (const claim of legacy.claims) {
      const held = claim.evidenceStatus === 'HOLD_SOURCE_EXCERPT';
      assert.ok(held || (claim.sourceExcerpt?.trim().length >= 12 && claim.excerptVerifiedAt === manifest.reviewedAt),
        `${tool.slug}:${claim.stableKey} must have a reviewed excerpt or explicit HOLD`);
      if (held) {
        assert.ok(claim.evidenceNote?.trim());
        continue;
      }
      assert.ok(claim.excerptLocator?.trim());
      quotedWordsBySource.set(claim.sourceUrl,
        (quotedWordsBySource.get(claim.sourceUrl) || 0) + claim.sourceExcerpt.trim().split(/\s+/).length);
    }
    for (const claim of tool.newClaims) {
      const url = new URL(claim.sourceUrl);
      assert.equal(url.protocol, 'https:');
      assert.ok(url.hostname === tool.officialHost || url.hostname.endsWith(`.${tool.officialHost}`), `${tool.slug}: nonofficial host`);
      assert.equal(claim.sourceDateMeaning, 'accessed');
      assert.equal(claim.sourceDate, manifest.reviewedAt);
      assert.equal(claim.observedAt, manifest.reviewedAt);
      assert.equal(claim.excerptVerifiedAt, manifest.reviewedAt);
      assert.ok(claim.sourceExcerpt.trim().length >= 12 && claim.excerptLocator.trim());
      quotedWordsBySource.set(claim.sourceUrl,
        (quotedWordsBySource.get(claim.sourceUrl) || 0) + claim.sourceExcerpt.trim().split(/\s+/).length);
      assert.ok(claim.summary.length >= 60);
      assert.ok(Object.keys(claim.scope).length >= 2);
      assert.ok(['verified_public', 'conditional'].includes(claim.status));
      assert.ok(claim.nextReviewDate > manifest.reviewedAt);
    }
    for (const [source, words] of quotedWordsBySource) {
      assert.ok(words <= 25, `${tool.slug}: over 25 quoted words from ${source}`);
    }
    for (const [relation, purposes] of Object.entries(requiredPurposes)) {
      assert.deepEqual(Object.keys(tool.purposeLinks[relation]).sort(), [...purposes].sort());
      for (const key of Object.values(tool.purposeLinks[relation])) {
        assert.ok(keys.has(key), `${tool.slug}: ${relation} link has no new direct claim: ${key}`);
      }
    }
  }
  return { manifest, inventory };
}

function getOnlyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method !== 'GET') throw new Error(`Production preflight rejected ${method}`);
  return fetch(input, { ...init, method: 'GET' });
}

async function requireRows(label: string, query: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error || data === null) throw new Error(`${label} unreadable: ${error?.message || 'null result'}`);
  return data;
}

async function productionPreflight(manifest: any, inventory: any) {
  loadEnvConfig(process.cwd());
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  try {
    await neon.query('BEGIN READ ONLY');
    const ids = manifest.tools.map((tool: Tool) => tool.toolId);
    const { rows } = await neon.query('SELECT id, name, url, status, updated_at::text FROM tools WHERE id = ANY($1::uuid[])', [ids]);
    assert.equal(rows.length, 4, 'Directory identity count drifted');
    for (const tool of manifest.tools as Tool[]) {
      const current = rows.find((row) => row.id === tool.toolId);
      const prior = inventory.tools.find((row: any) => row.directory.id === tool.toolId)?.directory;
      assert.ok(current && prior);
      assert.equal(current.name, prior.name);
      assert.equal(current.url, prior.url);
      assert.equal(current.status, 'published');
    }
  } finally {
    await neon.query('ROLLBACK');
    await neon.end();
  }

  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error('Supabase service key unavailable; production state is unknown');
  const db = createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: getOnlyFetch },
  });
  const ids = manifest.tools.map((tool: Tool) => tool.toolId);
  const tasks = await requireRows('Task', db.from('decision_tasks').select('id,slug,status').eq('id', manifest.task.id));
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].slug, manifest.task.slug);
  assert.equal(tasks[0].status, 'active');
  const taskCapabilities = await requireRows('Task Capabilities', db.from('task_capabilities').select('capability_id,importance,status,updated_at').eq('task_id', manifest.task.id));
  assert.equal(taskCapabilities.length, 2);
  for (const prior of inventory.taskCapabilities) {
    const current = taskCapabilities.find((row) => row.capability_id === prior.capability_id);
    assert.ok(current && current.status === prior.status && current.updated_at === prior.updated_at, 'Task Capability drifted');
  }
  const checks = [
    ['Intelligence profiles', db.from('product_intelligence_profiles').select('id').eq('owner_type', 'tool').in('owner_id', ids)],
    ['Decision profiles', db.from('tool_decision_profiles').select('tool_id').in('tool_id', ids)],
    ['Tool Capabilities', db.from('tool_capabilities').select('id').in('tool_id', ids)],
    ['Fits', db.from('tool_task_fits').select('id').in('tool_id', ids)],
  ] as const;
  for (const [label, query] of checks) {
    const rows = await requireRows(label, query);
    assert.equal(rows.length, 0, `${label} preimage drifted; stop without writes`);
  }
  return { task: 1, taskCapabilities: 2, tools: 4, existingRelations: 0, productionWrites: 0, supabaseMethods: ['GET'], neonTransaction: 'READ ONLY + ROLLBACK' };
}

async function main() {
  const { manifest, inventory } = validateLocal();
  const writeSet = buildBatch(manifest);
  assert.deepEqual(writeSet.tools.map((tool: any) => tool.slug), ['bolt', 'lovable', 'v0']);
  const production = process.argv.includes('--production') ? await productionPreflight(manifest, inventory) : null;
  console.log(JSON.stringify({ unit: manifest.unit, mode: production ? 'production_readonly_preflight' : 'local_manifest_validation', editorialPass: manifest.tools.map((tool: Tool) => tool.slug), writeHolds: writeSet.holds, eligibleTools: writeSet.tools.map((tool: any) => ({ slug: tool.slug, claims: tool.expectedClaims, excludedClaims: tool.excludedClaims })), legacyClaims: 24, newClaims: 12, production, productionCommitAllowed: false }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

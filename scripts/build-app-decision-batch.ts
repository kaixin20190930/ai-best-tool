import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const manifestFile = 'data/decision-graph/build-app-decision-closeout-2026-10-13.json';

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// UTF-8 byte lengths and sorted ASCII keys match decision_manifest_canonical_jsonb.
export function canonicalPayload(value: any): string {
  if (value === null) return 'N';
  if (typeof value === 'boolean') return value ? 'T' : 'F';
  if (typeof value === 'number') {
    assert.ok(Number.isSafeInteger(value), 'Only integer JSON numbers are supported');
    const text = String(value);
    return `D${Buffer.byteLength(text)}:${text}`;
  }
  if (typeof value === 'string') return `S${Buffer.byteLength(value)}:${value}`;
  if (Array.isArray(value)) return `A${value.length}:${value.map(canonicalPayload).join('')}`;
  assert.equal(typeof value, 'object');
  const keys = Object.keys(value).sort();
  assert.ok(keys.every((key) => /^[\x20-\x7e]+$/.test(key)), 'JSON keys must be ASCII');
  return `O${keys.length}:${keys.map((key) => canonicalPayload(key) + canonicalPayload(value[key])).join('')}`;
}

export function batchDigest(payload: any): string {
  return createHash('sha256').update(canonicalPayload(payload), 'utf8').digest('hex');
}

function stableId(value: string): string {
  const hex = createHash('sha256').update(value).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function localizedList(value: { en: string[]; cn: string[] }): Array<{ en: string; cn: string }> {
  assert.equal(value.en.length, value.cn.length, 'Bilingual list lengths differ');
  return value.en.map((en, index) => ({ en, cn: value.cn[index] }));
}

function localizedStrings(value: { en: string[]; cn: string[] }): string[] {
  return localizedList(value).map((item) => `EN: ${item.en}; CN: ${item.cn}`);
}

function claimFromLegacy(claim: any) {
  assert.ok(['verified_public', 'conditional'].includes(claim.status));
  assert.ok(claim.value && claim.scope && claim.limitation);
  assert.ok(claim.sourceExcerpt?.length >= 12 && claim.excerptVerifiedAt,
    `${claim.tool}:${claim.stableKey} lacks a reviewed verbatim official excerpt`);
  return {
    key: claim.stableKey,
    sourceUrl: claim.sourceUrl,
    sourceLabel: `${claim.tool} official ${claim.stableKey}`,
    sourceDate: claim.sourceDate,
    reviewDueAt: `${claim.nextReviewDate}T12:00:00Z`,
    value: { assertion: claim.value, limitation: claim.limitation, status: claim.status },
    summary: `${claim.value}\nLimit: ${claim.limitation}`,
    sourceExcerpt: claim.sourceExcerpt,
    excerptVerifiedAt: claim.excerptVerifiedAt,
    scope: { statement: claim.scope, sourceDate: claim.sourceDate, claimStatus: claim.status },
  };
}

function claimFromDirect(claim: any, slug: string) {
  assert.ok(['verified_public', 'conditional'].includes(claim.status));
  assert.ok(claim.sourceExcerpt?.length >= 12 && claim.excerptVerifiedAt,
    `${slug}:${claim.key} lacks a reviewed verbatim official excerpt`);
  return {
    key: claim.key,
    sourceUrl: claim.sourceUrl,
    sourceLabel: `${slug} official ${claim.key}`,
    sourceDate: claim.sourceDate,
    reviewDueAt: `${claim.nextReviewDate}T12:00:00Z`,
    value: { assertion: claim.summary, status: claim.status },
    summary: claim.summary,
    sourceExcerpt: claim.sourceExcerpt,
    excerptVerifiedAt: claim.excerptVerifiedAt,
    scope: { ...claim.scope, sourceDate: claim.sourceDate, claimStatus: claim.status },
  };
}

export function buildBatch(
  manifest = readJson(manifestFile), reviewer = '', qaReference = '', evidenceLoader = readJson,
) {
  const inventoryBytes = readFileSync(manifest.inventory.path);
  assert.equal(createHash('sha256').update(inventoryBytes).digest('hex'), manifest.inventory.sha256);
  const inventory = JSON.parse(inventoryBytes.toString());
  const holds: Array<{ slug: string; reasons: string[] }> = [];
  const tools = manifest.tools.filter((tool: any) => {
    const legacy = evidenceLoader(tool.legacySnapshot).tools.find((row: any) => row.tool === tool.slug);
    const legacyClaims = (legacy?.claims || []).filter((claim: any) =>
      claim.status !== 'unknown' && claim.evidenceStatus !== 'HOLD_SOURCE_EXCERPT');
    const claims = [...legacyClaims, ...tool.newClaims];
    const reasons = [];
    if (tool.decision !== 'PASS') reasons.push('editorial_not_pass');
    if (tool.writeEligibility !== 'READY') reasons.push('write_eligibility_hold');
    if (tool.availability === 'unknown') reasons.push('availability_unproven');
    if (tool.newClaims.some((claim: any) => !claim.sourceExcerpt || !claim.excerptVerifiedAt))
      reasons.push('verbatim_official_excerpt_missing');
    if (reasons.length) holds.push({ slug: tool.slug, reasons });
    return reasons.length === 0;
  }).map((tool: any) => {
    const prior = inventory.tools.find((row: any) => row.directory.id === tool.toolId)?.directory;
    assert.ok(prior && prior.status === 'published' && new URL(prior.url).hostname === tool.officialHost);
    const legacy = evidenceLoader(tool.legacySnapshot).tools.find((row: any) => row.tool === tool.slug);
    assert.ok(legacy && legacy.claims.length === 6);
    const claims = [
      ...legacy.claims.filter((claim: any) =>
        claim.status !== 'unknown' && claim.evidenceStatus !== 'HOLD_SOURCE_EXCERPT').map(claimFromLegacy),
      ...tool.newClaims.map((claim: any) => claimFromDirect(claim, tool.slug)),
    ];
    assert.ok(claims.length >= 3 && claims.length <= 9);
    assert.equal(new Set(claims.map((claim) => claim.key)).size, claims.length);
    for (const claim of claims) {
      const host = new URL(claim.sourceUrl).hostname;
      assert.ok(host === tool.officialHost || host.endsWith(`.${tool.officialHost}`));
      assert.ok(Date.parse(claim.reviewDueAt) > Date.now(), `${tool.slug}: review expired`);
    }
    return {
      slug: tool.slug,
      toolId: tool.toolId,
      directoryPreimage: { name: prior.name, url: prior.url, status: prior.status, updatedAt: prior.updated_at },
      decision: 'PASS',
      writeEligibility: 'READY',
      officialHost: tool.officialHost,
      profileId: stableId(`build-app:${tool.toolId}:profile`),
      capabilityId: stableId(`build-app:${tool.toolId}:capability`),
      fitId: stableId(`build-app:${tool.toolId}:fit`),
      profile: tool.profile,
      decisionProfile: {
        summary: tool.decisionProfile.summary,
        watchOuts: localizedList(tool.toolCapability.limitations),
      },
      toolCapability: {
        supportLevel: tool.toolCapability.supportLevel,
        planRequirement: tool.toolCapability.planRequirement,
        limitations: localizedStrings(tool.toolCapability.limitations),
      },
      fit: {
        rationale: tool.fit.rationale,
        requiredConditions: localizedList(tool.fit.requiredConditions),
        disqualifiers: localizedList(tool.fit.disqualifiers),
      },
      fitLevel: tool.fitLevel,
      availability: tool.availability,
      purposeLinks: tool.purposeLinks,
      expectedClaims: claims.length,
      claims,
      excludedClaims: legacy.claims.filter((claim: any) =>
        claim.status === 'unknown' || claim.evidenceStatus === 'HOLD_SOURCE_EXCERPT').map((claim: any) => claim.stableKey),
    };
  });
  const payload = {
    taskId: manifest.task.id,
    capabilityId: manifest.capability.id,
    taskPreimage: inventory.taskCapabilities.map((row: any) => ({
      id: row.capability_id, status: row.status, updated_at: row.updated_at,
      reviewed_at: row.reviewed_at, review_due_at: row.review_due_at,
    })),
    tools,
  };
  const envelope = { ...payload, reviewer, qaReference };
  const batchHash = batchDigest(envelope);
  return { ...payload, reviewer, qaReference, batchHash, holds };
}


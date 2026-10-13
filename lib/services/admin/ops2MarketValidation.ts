import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const threadActor = /^codex-thread:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hashPattern = /^[a-f0-9]{64}$/;

export type MarketPack = {
  toolId: string;
  developmentActor: string;
  verdict: 'validated';
  score: number;
  reviewedAt: string;
  vendorDomains: string[];
  evidenceUrls: string[];
  strongSignals: string[];
  supportingSignals: string[];
  rationale: { en: string; cn: string };
  sourceNotes: { url: string; observedAt: string; signal: string; limitation: string }[];
  qaReport: null | {
    status: 'PASS'; reviewer: string; qaActor: string; checkedAt: string;
    packHash: string; toolId: string;
  };
};

export function hash(value: unknown): string {
  const canonical = (item: any): any => Array.isArray(item) ? item.map(canonical)
    : item && typeof item === 'object'
      ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, canonical(item[key])])) : item;
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function domainGroup(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.');
  const length = parts.at(-1) === 'uk' && parts.at(-2) === 'co' ? 3 : 2;
  return parts.slice(-length).join('.');
}

function day(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10);
}

export function parseMarketPack(input: unknown): MarketPack {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'Market pack object required');
  const pack = input as MarketPack;
  assert.match(pack.toolId || '', uuid, 'Tool UUID required');
  assert.match(pack.developmentActor || '', threadActor,
    'Valid development actor required');
  assert.equal(pack.verdict, 'validated');
  assert.ok(Number.isInteger(pack.score) && pack.score >= 75 && pack.score <= 100, 'Score must be 75-100');
  assert.ok(day(pack.reviewedAt), 'Valid market review date required');
  assert.ok(Array.isArray(pack.vendorDomains) && pack.vendorDomains.length > 0 &&
    pack.vendorDomains.every((item) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(item)),
  'Vendor domain inventory required');
  const vendorDomains = new Set(pack.vendorDomains.map(domainGroup));
  assert.ok(Array.isArray(pack.evidenceUrls) && pack.evidenceUrls.length >= 2,
    'At least two independent market URLs required');
  const domains = new Set<string>();
  for (const raw of pack.evidenceUrls) {
    const url = new URL(raw);
    assert.equal(url.protocol, 'https:', 'Market sources must use HTTPS');
    assert.ok(!url.username && !url.password && !url.hash, 'Market URL must not include credentials or fragment');
    const group = domainGroup(url.hostname);
    assert.ok(!vendorDomains.has(group), 'Vendor domain is not independent market evidence');
    domains.add(group);
  }
  assert.ok(domains.size >= 2, 'Market sources must have different registrable domains');
  for (const key of ['strongSignals', 'supportingSignals'] as const) {
    assert.ok(Array.isArray(pack[key]) && pack[key].length > 0 &&
      pack[key].every((item) => typeof item === 'string' && item.trim().length >= 12),
    `${key} requires concrete signals`);
  }
  assert.ok(pack.rationale && ['en', 'cn'].every((key) =>
    typeof pack.rationale[key as 'en' | 'cn'] === 'string' &&
    pack.rationale[key as 'en' | 'cn'].trim().length >= 40), 'Bilingual rationale required');
  assert.ok(Array.isArray(pack.sourceNotes) && pack.sourceNotes.length === pack.evidenceUrls.length,
    'Every market URL needs an observed source note');
  assert.deepEqual(pack.sourceNotes.map((note) => note.url).sort(), [...pack.evidenceUrls].sort(),
    'Source notes must cover every market URL exactly once');
  for (const note of pack.sourceNotes) {
    assert.ok(pack.evidenceUrls.includes(note.url) && day(note.observedAt) &&
      note.observedAt <= pack.reviewedAt && note.signal?.trim() && note.limitation?.trim(),
    'Source note must have matching URL, date, signal and limitation');
  }
  assert.ok(pack.qaReport === null || (pack.qaReport && typeof pack.qaReport === 'object'),
    'Independent QA report must be null or an object');
  return pack;
}

export function packHash(pack: MarketPack): string {
  const { qaReport: _qaReport, ...evidence } = pack;
  return hash(evidence);
}

export function validateQa(pack: MarketPack, owner: string, qaReference: string): string {
  assert.match(pack.developmentActor || '', threadActor, 'Valid development actor required');
  const qa = pack.qaReport;
  assert.ok(qa, 'Independent QA report required');
  assert.equal(qa.status, 'PASS');
  assert.equal(qa.reviewer, owner);
  assert.equal(qa.qaActor, qaReference);
  assert.notEqual(qa.qaActor.toLowerCase(), owner.toLowerCase());
  assert.match(qa.qaActor, threadActor);
  assert.notEqual(qa.qaActor.toLowerCase(), pack.developmentActor.toLowerCase(),
    'Development actor cannot approve its own market validation');
  assert.equal(qa.packHash, packHash(pack), 'QA approved a different pack');
  assert.equal(qa.toolId, pack.toolId);
  const checked = Date.parse(qa.checkedAt);
  assert.ok(Number.isFinite(checked) && checked <= Date.now() + 300000 &&
    checked >= Date.now() - 72 * 3600000, 'Recent QA report required');
  return hash(qa);
}

export function protectedHash(row: Record<string, any>): string {
  const { marketValidation: _marketValidation, ...features } = row.features || {};
  const { updated_at: _updatedAt, features: _features, ...protectedFields } = row;
  return hash({ ...protectedFields, features });
}

export function expectedAuditHash(value: string): void {
  assert.match(value, hashPattern);
}

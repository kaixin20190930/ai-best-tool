import { createHash } from 'node:crypto';

import type { ExtractedIntelligenceClaim, ProductIntelligenceClaim } from './types';

export type IntelligenceChangeType = 'added' | 'changed' | 'removed';

export interface IntelligenceClaimChange {
  changeType: IntelligenceChangeType;
  claimType: ProductIntelligenceClaim['claimType'];
  claimKey: string;
  sourceUrl: string;
  oldValue: unknown | null;
  newValue: unknown | null;
  oldExcerpt: string | null;
  newExcerpt: string | null;
  fingerprint: string;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, canonicalize(nestedValue)]),
  );
}

export function stableIntelligenceValue(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function identity(claim: Pick<ProductIntelligenceClaim, 'claimType' | 'claimKey'>) {
  return `${claim.claimType}:${claim.claimKey}`;
}

function fingerprint(change: Omit<IntelligenceClaimChange, 'fingerprint'>) {
  return createHash('sha256')
    .update(
      [
        change.sourceUrl,
        change.claimType,
        change.claimKey,
        change.changeType,
        stableIntelligenceValue(change.oldValue),
        stableIntelligenceValue(change.newValue),
      ].join('|'),
    )
    .digest('hex');
}

export function detectIntelligenceClaimChanges(
  existingClaims: ProductIntelligenceClaim[],
  incomingClaims: ExtractedIntelligenceClaim[],
  sourceUrl: string,
): IntelligenceClaimChange[] {
  const existing = new Map(existingClaims.map((claim) => [identity(claim), claim]));
  const incoming = new Map(incomingClaims.map((claim) => [identity(claim as ProductIntelligenceClaim), claim]));
  const changes: IntelligenceClaimChange[] = [];

  for (const [key, current] of Array.from(existing.entries())) {
    const next = incoming.get(key);
    if (!next) {
      const change = {
        changeType: 'removed' as const,
        claimType: current.claimType,
        claimKey: current.claimKey,
        sourceUrl,
        oldValue: current.claimValue,
        newValue: null,
        oldExcerpt: current.sourceExcerpt,
        newExcerpt: null,
      };
      changes.push({ ...change, fingerprint: fingerprint(change) });
      continue;
    }

    if (stableIntelligenceValue(current.claimValue) !== stableIntelligenceValue(next.claimValue)) {
      const change = {
        changeType: 'changed' as const,
        claimType: current.claimType,
        claimKey: current.claimKey,
        sourceUrl,
        oldValue: current.claimValue,
        newValue: next.claimValue,
        oldExcerpt: current.sourceExcerpt,
        newExcerpt: next.sourceExcerpt,
      };
      changes.push({ ...change, fingerprint: fingerprint(change) });
    }
  }

  for (const [key, next] of Array.from(incoming.entries())) {
    if (existing.has(key)) continue;
    const change = {
      changeType: 'added' as const,
      claimType: next.claimType,
      claimKey: next.claimKey,
      sourceUrl,
      oldValue: null,
      newValue: next.claimValue,
      oldExcerpt: null,
      newExcerpt: next.sourceExcerpt,
    };
    changes.push({ ...change, fingerprint: fingerprint(change) });
  }

  return changes.sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
}

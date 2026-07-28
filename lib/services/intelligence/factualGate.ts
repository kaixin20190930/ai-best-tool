import type {
  ProductIntelligenceClaim,
  ProductIntelligenceSource,
} from './types';
import type { EvidenceBoundComposerResult } from './evidenceComposer';

export type FactualGateSeverity = 'info' | 'warn' | 'block';

export interface FactualGateFinding {
  id: string;
  severity: FactualGateSeverity;
  message: string;
  claimIds: string[];
  sourceUrls: string[];
}

export interface FactualGateResult {
  passed: boolean;
  blocked: boolean;
  verifiedClaimCount: number;
  successfulSourceCount: number;
  findingCount: number;
  findings: FactualGateFinding[];
  summary: string;
}

function isVerifiedClaim(claim: ProductIntelligenceClaim) {
  return claim.conflictStatus === 'none' && Boolean(claim.claimValue);
}

function isSuccessfulSource(source: ProductIntelligenceSource) {
  return (
    source.fetchStatus === 'success' &&
    source.httpStatus !== null &&
    source.httpStatus >= 200 &&
    source.httpStatus < 300
  );
}

function hasMeaningfulExcerpt(excerpt: string | null | undefined) {
  return Boolean(excerpt && excerpt.trim().length >= 12);
}

export function evaluateFactualGate(input: {
  sources: ProductIntelligenceSource[];
  claims: ProductIntelligenceClaim[];
  composer: EvidenceBoundComposerResult;
}): FactualGateResult {
  const verifiedClaims = input.claims.filter(isVerifiedClaim);
  const successfulSources = input.sources.filter(isSuccessfulSource);
  const successfulSourceUrls = new Set(successfulSources.map((source) => source.url));
  const findings: FactualGateFinding[] = [];

  if (input.composer.blocks.length === 0) {
    findings.push({
      id: 'no-composed-blocks',
      severity: 'block',
      message: 'No evidence-bound blocks were generated.',
      claimIds: [],
      sourceUrls: [],
    });
  }

  for (const block of input.composer.blocks) {
    if (block.claimIds.length === 0) {
      findings.push({
        id: `block-${block.id}-missing-claims`,
        severity: 'block',
        message: `Block "${block.title}" has no attached claims.`,
        claimIds: [],
        sourceUrls: [],
      });
    }
    if (block.sourceUrls.length === 0) {
      findings.push({
        id: `block-${block.id}-missing-sources`,
        severity: 'block',
        message: `Block "${block.title}" has no attached sources.`,
        claimIds: block.claimIds,
        sourceUrls: [],
      });
    }
  }

  for (const claim of verifiedClaims) {
    const sourceOk = successfulSourceUrls.has(claim.sourceUrl);
    if (!sourceOk) {
      findings.push({
        id: `claim-${claim.id}-unverified-source`,
        severity: 'block',
        message: `Claim "${claim.claimType}" does not point to a successful source record.`,
        claimIds: [claim.id],
        sourceUrls: [claim.sourceUrl],
      });
      continue;
    }
    if (!hasMeaningfulExcerpt(claim.sourceExcerpt)) {
      findings.push({
        id: `claim-${claim.id}-missing-excerpt`,
        severity: 'warn',
        message: `Claim "${claim.claimType}" is verified, but the source excerpt is thin or missing.`,
        claimIds: [claim.id],
        sourceUrls: [claim.sourceUrl],
      });
    }
  }

  if (verifiedClaims.length === 0) {
    findings.push({
      id: 'no-verified-claims',
      severity: 'block',
      message: 'No verified claims are available to support factual content.',
      claimIds: [],
      sourceUrls: [],
    });
  }

  const blockCount = findings.filter((finding) => finding.severity === 'block').length;
  const warnCount = findings.filter((finding) => finding.severity === 'warn').length;
  const passed = blockCount === 0;

  return {
    passed,
    blocked: !passed,
    verifiedClaimCount: verifiedClaims.length,
    successfulSourceCount: successfulSources.length,
    findingCount: findings.length,
    findings,
    summary: passed
      ? `Factual gate passed with ${verifiedClaims.length} verified claims and ${successfulSources.length} successful sources.`
      : `Factual gate blocked: ${blockCount} blocking issue${blockCount === 1 ? '' : 's'} and ${warnCount} warning${warnCount === 1 ? '' : 's'}.`,
  };
}

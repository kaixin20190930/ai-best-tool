import type { ContentQualityAssessment } from './qualityScorer';
import type { FactualGateResult } from './factualGate';
import type { UniquenessGateResult } from './uniquenessGate';

export type ContentIndexDecision = 'draft' | 'noindex' | 'publish';

export interface IndexGateFinding {
  id: string;
  severity: 'info' | 'warn' | 'block';
  message: string;
}

export interface IndexGateResult {
  decision: ContentIndexDecision;
  passed: boolean;
  shouldIndex: boolean;
  shouldPublish: boolean;
  score: number;
  findings: IndexGateFinding[];
  summary: string;
}

function normalizeScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function evaluateIndexGate(input: {
  quality: ContentQualityAssessment;
  factual: FactualGateResult;
  uniqueness: UniquenessGateResult;
}): IndexGateResult {
  const findings: IndexGateFinding[] = [];
  const quality = input.quality;
  const factual = input.factual;
  const uniqueness = input.uniqueness;

  if (!factual.passed) {
    findings.push({
      id: 'factual-blocked',
      severity: 'block',
      message: 'Facts are not sufficiently verified for publish/index use.',
    });
  }

  if (!uniqueness.passed) {
    findings.push({
      id: 'uniqueness-blocked',
      severity: 'block',
      message: 'The content is too similar to other generated blocks.',
    });
  }

  if (quality.blockers.length > 0) {
    findings.push({
      id: 'quality-blockers',
      severity: 'block',
      message: `Quality gate blockers: ${quality.blockers.join(' · ')}`,
    });
  } else if (quality.decision === 'enrich') {
    findings.push({
      id: 'quality-enrich',
      severity: 'warn',
      message: 'Quality is good enough for internal use, but still needs more evidence before publish.',
    });
  } else if (quality.decision === 'review_required') {
    findings.push({
      id: 'quality-review',
      severity: 'warn',
      message: 'Quality is close to publish-ready and should be reviewed before indexing.',
    });
  }

  const factualWarnings = factual.findings.filter((finding) => finding.severity === 'warn');
  if (factualWarnings.length > 0) {
    findings.push({
      id: 'factual-warnings',
      severity: 'warn',
      message: `${factualWarnings.length} factual warning${factualWarnings.length === 1 ? '' : 's'} need attention.`,
    });
  }

  const uniquenessWarnings = uniqueness.findings.filter((finding) => finding.severity === 'warn');
  if (uniquenessWarnings.length > 0) {
    findings.push({
      id: 'uniqueness-warnings',
      severity: 'warn',
      message: `${uniquenessWarnings.length} uniqueness warning${uniquenessWarnings.length === 1 ? '' : 's'} detected.`,
    });
  }

  let decision: ContentIndexDecision = 'draft';
  if (findings.some((finding) => finding.severity === 'block')) {
    decision = 'draft';
  } else if (quality.decision === 'publish_ready' && factual.passed && uniqueness.passed) {
    decision = 'publish';
  } else {
    decision = 'noindex';
  }

  const score = normalizeScore(
    quality.total +
      (factual.passed ? 5 : -15) +
      (uniqueness.passed ? 5 : -15) +
      Math.min(5, factual.verifiedClaimCount) +
      Math.max(0, 5 - Math.round(uniqueness.maxSimilarity * 10)),
  );

  const shouldIndex = decision === 'publish';
  const shouldPublish = decision === 'publish';

  return {
    decision,
    passed: decision === 'publish',
    shouldIndex,
    shouldPublish,
    score,
    findings,
    summary:
      decision === 'publish'
        ? 'Index gate passed: the content is ready to publish and index.'
        : decision === 'noindex'
          ? 'Index gate recommends keeping the page internal/noindex until the evidence improves.'
          : 'Index gate blocks the page from publishing because factual or uniqueness requirements are not met.',
  };
}

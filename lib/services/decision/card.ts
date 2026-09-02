import { getLocalizedToolPath } from '@/lib/config/toolRouteAliases';
import {
  getDecisionEvidenceBundle,
  getSupportingDecisionEvidence,
  type DecisionEvidenceReference,
  type DerivedToolDecisionProfile,
  type DerivedToolRelationship,
} from '@/lib/services/decision/evidence';
import { getDecisionToolIdentities, type DecisionToolIdentity } from '@/lib/services/decision/repository';
import { normalizeVerifiedCost, type NormalizedCost } from '@/lib/services/decision/rules';

export type DecisionCardFieldState = 'supported' | 'unknown';

export interface DecisionCardField<T> {
  state: DecisionCardFieldState;
  value: T | null;
  evidence: DecisionEvidenceReference[];
}

export interface DecisionCardRelationshipItem {
  id: string;
  title: string;
  href: string;
  rationale: Record<string, unknown>;
  relationshipType: DerivedToolRelationship['relationshipType'];
  reviewedAt: string | null;
  evidence: DecisionEvidenceReference[];
}

export interface DecisionCardV2Model {
  toolId: string;
  reviewedAt: string | null;
  reviewDueAt: string | null;
  trueCost: DecisionCardField<NormalizedCost>;
  setup: DecisionCardField<{
    complexity: DerivedToolDecisionProfile['setupComplexity'];
    minutesLow: number | null;
    minutesHigh: number | null;
  }>;
  dataUse: DecisionCardField<DerivedToolDecisionProfile['dataTrainingUse']>;
  exitPath: DecisionCardField<{
    selfHostLevel: DerivedToolDecisionProfile['selfHostLevel'] | null;
    exportLevel: DerivedToolDecisionProfile['exportLevel'] | null;
  }>;
  whyNot: DecisionCardField<unknown[]>;
  replaces: DecisionCardRelationshipItem[];
  worksWith: DecisionCardRelationshipItem[];
}

function field<T>(value: T | null, evidence: DecisionEvidenceReference[]): DecisionCardField<T> {
  return evidence.length > 0 && value !== null
    ? { state: 'supported', value, evidence }
    : { state: 'unknown', value: null, evidence: [] };
}

function buildRelationshipItems(
  relationships: DerivedToolRelationship[],
  identities: Map<string, DecisionToolIdentity>,
  locale: string,
  acceptedTypes: DerivedToolRelationship['relationshipType'][],
): DecisionCardRelationshipItem[] {
  return relationships.flatMap((relationship) => {
    if (relationship.evidenceState !== 'supported' || !acceptedTypes.includes(relationship.relationshipType)) {
      return [];
    }
    const evidence = getSupportingDecisionEvidence(relationship.evidence, 'replacement');
    const identity = identities.get(relationship.relatedToolId);
    if (!identity || evidence.length === 0) return [];

    return [
      {
        id: relationship.id,
        title: identity.title,
        href: `${getLocalizedToolPath(identity.slug, locale)}#decision-card`,
        rationale: relationship.rationale,
        relationshipType: relationship.relationshipType,
        reviewedAt: relationship.reviewedAt,
        evidence,
      },
    ];
  });
}

export function buildDecisionCardV2(
  profile: DerivedToolDecisionProfile,
  relationships: DerivedToolRelationship[],
  identities: DecisionToolIdentity[],
  locale: string,
): DecisionCardV2Model | null {
  if (profile.evidenceState !== 'supported') return null;

  const costEvidence = getSupportingDecisionEvidence(profile.evidence, 'cost');
  const setupEvidence = getSupportingDecisionEvidence(profile.evidence, 'setup');
  const privacyEvidence = getSupportingDecisionEvidence(profile.evidence, 'privacy');
  const exportEvidence = getSupportingDecisionEvidence(profile.evidence, 'export');
  const limitationEvidence = getSupportingDecisionEvidence(profile.evidence, 'limitation');
  const identityMap = new Map(identities.map((identity) => [identity.id, identity]));
  const normalizedCost = normalizeVerifiedCost(profile.evidence);

  return {
    toolId: profile.toolId,
    reviewedAt: profile.reviewedAt,
    reviewDueAt: profile.reviewDueAt,
    trueCost: field(normalizedCost, normalizedCost ? costEvidence : []),
    setup: field(
      {
        complexity: profile.setupComplexity,
        minutesLow: profile.setupMinutesLow,
        minutesHigh: profile.setupMinutesHigh,
      },
      setupEvidence,
    ),
    dataUse: field(profile.dataTrainingUse === 'unknown' ? null : profile.dataTrainingUse, privacyEvidence),
    exitPath: field(
      privacyEvidence.length > 0 || exportEvidence.length > 0
        ? {
          selfHostLevel: privacyEvidence.length > 0 ? profile.selfHostLevel : null,
          exportLevel: exportEvidence.length > 0 ? profile.exportLevel : null,
        }
        : null,
      [...privacyEvidence, ...exportEvidence],
    ),
    whyNot: field(profile.watchOuts.length > 0 ? profile.watchOuts : null, limitationEvidence),
    replaces: buildRelationshipItems(relationships, identityMap, locale, ['replaces', 'alternative']),
    worksWith: buildRelationshipItems(relationships, identityMap, locale, ['complements']),
  };
}

export async function getToolDecisionCardV2(toolId: string, locale: string): Promise<DecisionCardV2Model | null> {
  const bundle = await getDecisionEvidenceBundle([toolId]);
  if (!bundle.available) return null;

  const profile = bundle.profiles.find((candidate) => candidate.toolId === toolId);
  if (!profile) return null;

  const relatedIds = Array.from(
    new Set(bundle.relationships.map((relationship) => relationship.relatedToolId).filter(Boolean)),
  );
  const identities = await getDecisionToolIdentities(relatedIds, locale).catch(() => []);
  return buildDecisionCardV2(profile, bundle.relationships, identities, locale);
}

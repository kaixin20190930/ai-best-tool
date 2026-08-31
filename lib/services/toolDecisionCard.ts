export type DecisionCardAlternative = {
  description: string;
  href: string;
  title: string;
};

export type DecisionEvidenceRequirementKey =
  | 'official_source'
  | 'reviewed_at'
  | 'limitations'
  | 'media'
  | 'best_fit'
  | 'not_ideal_for'
  | 'comparison_path';

export type DecisionEvidenceCompleteness = {
  complete: boolean;
  met: DecisionEvidenceRequirementKey[];
  missing: DecisionEvidenceRequirementKey[];
  score: number;
};

export type ToolDecisionCardModel = {
  audience: {
    bestFit: string[];
    notIdealFor: string[];
  };
  community: {
    evidence: string;
    label: string;
    summary: string;
  };
  comparison: {
    alternatives: DecisionCardAlternative[];
    axes: string[];
    summary: string;
  };
  editorial: {
    reviewedAt: string | null;
    reviewedLabel: string | null;
    reviewerLabel: string;
    sourceUrl: string | null;
    stale: boolean;
    summary: string | null;
    trustNote: string | null;
  };
  freshness: {
    label: string;
    summary: string;
  };
  media: {
    assetCount: number;
    evidence: string;
    label: string;
    summary: string;
  };
  officialSite: {
    hostname: string;
    secureLabel: string;
    statusLabel: string;
    summary: string;
  };
  evidenceCompleteness: DecisionEvidenceCompleteness;
  owner: {
    claimedAtLabel: string | null;
    label: string;
    summary: string;
    tone: string;
  };
  pricing: {
    label: string;
    summary: string;
  };
  risks: string[];
  verificationChecklist: string[];
};

type ToolDecisionCardInput = Omit<ToolDecisionCardModel, 'evidenceCompleteness'>;

function uniqueText(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildToolDecisionCard(input: ToolDecisionCardInput): ToolDecisionCardModel {
  const seenAlternatives = new Set<string>();
  const alternatives = input.comparison.alternatives.filter((alternative) => {
    const key = `${alternative.href.trim()}::${alternative.title.trim()}`;
    if (!alternative.href.trim() || !alternative.title.trim() || seenAlternatives.has(key)) {
      return false;
    }
    seenAlternatives.add(key);
    return true;
  });

  const audience = {
    bestFit: uniqueText(input.audience.bestFit),
    notIdealFor: uniqueText(input.audience.notIdealFor),
  };
  const comparison = {
    ...input.comparison,
    alternatives,
    axes: uniqueText(input.comparison.axes),
  };
  const risks = uniqueText(input.risks);
  const requirements: Array<[DecisionEvidenceRequirementKey, boolean]> = [
    ['official_source', Boolean(input.editorial.sourceUrl)],
    ['reviewed_at', Boolean(input.editorial.reviewedAt)],
    ['limitations', risks.length > 0],
    ['media', input.media.assetCount > 0],
    ['best_fit', audience.bestFit.length > 0],
    ['not_ideal_for', audience.notIdealFor.length > 0],
    ['comparison_path', comparison.axes.length > 0 && comparison.alternatives.length > 0],
  ];
  const met = requirements.filter(([, satisfied]) => satisfied).map(([key]) => key);
  const missing = requirements.filter(([, satisfied]) => !satisfied).map(([key]) => key);

  return {
    ...input,
    audience,
    comparison,
    evidenceCompleteness: {
      complete: missing.length === 0,
      met,
      missing,
      score: Math.round((met.length / requirements.length) * 100),
    },
    risks,
    verificationChecklist: uniqueText(input.verificationChecklist),
  };
}

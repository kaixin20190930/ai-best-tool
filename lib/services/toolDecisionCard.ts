export type DecisionCardAlternative = {
  description: string;
  href: string;
  title: string;
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

type ToolDecisionCardInput = ToolDecisionCardModel;

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

  return {
    ...input,
    audience: {
      bestFit: uniqueText(input.audience.bestFit),
      notIdealFor: uniqueText(input.audience.notIdealFor),
    },
    comparison: {
      ...input.comparison,
      alternatives,
      axes: uniqueText(input.comparison.axes),
    },
    risks: uniqueText(input.risks),
    verificationChecklist: uniqueText(input.verificationChecklist),
  };
}

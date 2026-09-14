export type BilingualCopy = { cn: string; en: string };
export type ComparisonEvidence = {
  id: string;
  claim: BilingualCopy;
  impact: BilingualCopy;
  source: { label: string; url: string };
  checkedAt: string;
};
export type VerifiedComparison = {
  title: BilingualCopy;
  scope: BilingualCopy;
  candidates: {
    slug: string;
    name: string;
    chooseWhen: BilingualCopy;
    strength: BilingualCopy;
    limitation: BilingualCopy;
    fit: BilingualCopy;
    notFor: BilingualCopy;
    evidenceRefs: string[];
  }[];
  comparisonRows: {
    dimension: BilingualCopy;
    values: Record<string, BilingualCopy>;
    fit: BilingualCopy;
    reason: BilingualCopy;
    evidenceRefs: string[];
  }[];
  evidence: ComparisonEvidence[];
  next: { href: string; label: BilingualCopy; description: BilingualCopy };
};

const hasCopy = (copy: BilingualCopy) => Boolean(copy?.cn?.trim() && copy?.en?.trim());
export function validComparisonEvidence(evidence: ComparisonEvidence) {
  try {
    return Boolean(
      evidence.id &&
        hasCopy(evidence.claim) &&
        hasCopy(evidence.impact) &&
        evidence.source.label &&
        new URL(evidence.source.url).protocol === 'https:' &&
        /^\d{4}-\d{2}-\d{2}$/.test(evidence.checkedAt) &&
        Number.isFinite(Date.parse(evidence.checkedAt)),
    );
  } catch {
    return false;
  }
}

// A missing candidate, value or citation invalidates the whole comparison, never just a table cell.
export function validateVerifiedComparison(comparison: VerifiedComparison, availableSlugs: string[]): boolean {
  const { candidates, comparisonRows, evidence } = comparison;
  if (candidates.length < 2 || new Set(candidates.map((item) => item.slug)).size !== candidates.length) return false;
  if (!hasCopy(comparison.title) || !hasCopy(comparison.scope)) return false;
  if (
    candidates.length === 2 &&
    !Object.values(comparison.title).every((title) => title.includes(`${candidates[0].name} vs ${candidates[1].name}`))
  ) return false;
  if (!evidence.length || !evidence.every(validComparisonEvidence)) return false;
  const ids = new Set(evidence.map((item) => item.id));
  if (ids.size !== evidence.length) return false;
  const validRefs = (refs: string[]) => refs.length > 0 && refs.every((ref) => ids.has(ref));
  if (
    !candidates.every(
      (item) =>
        availableSlugs.includes(item.slug) &&
        /^[a-z0-9-]+$/.test(item.slug) &&
        item.name &&
        [item.chooseWhen, item.strength, item.limitation, item.fit, item.notFor].every(hasCopy) &&
        validRefs(item.evidenceRefs),
    )
  ) return false;
  if (
    !comparisonRows.length ||
    !comparisonRows.every(
      (row) =>
        hasCopy(row.dimension) &&
        hasCopy(row.fit) &&
        hasCopy(row.reason) &&
        validRefs(row.evidenceRefs) &&
        Object.keys(row.values).length === candidates.length &&
        candidates.every((item) => hasCopy(row.values[item.slug])) &&
        ['cn', 'en'].every(
          (locale) => new Set(candidates.map((item) => row.values[item.slug][locale as 'cn' | 'en'])).size > 1,
        ),
    )
  ) return false;
  return (
    /^\/(?:ai|guides)\/[a-z0-9-]+(?:#[a-z0-9-]+)?$/.test(comparison.next.href) &&
    hasCopy(comparison.next.label) &&
    hasCopy(comparison.next.description)
  );
}

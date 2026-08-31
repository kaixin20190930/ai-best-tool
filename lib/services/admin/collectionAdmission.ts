export type CollectionAdmissionCandidate = {
  quality_score: number;
  raw_payload: Record<string, unknown>;
  relevance_score: number;
  status: 'new' | 'imported' | 'skipped' | 'rejected';
  summary: string | null;
};

export type CollectionAdmissionResult = {
  coreGaps: string[];
  decisionGaps: string[];
  draftReady: boolean;
  nextAction: string;
  publishReady: boolean;
};

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(textValue).filter(Boolean) : [];
}

export function evaluateCollectionAdmission(candidate: CollectionAdmissionCandidate): CollectionAdmissionResult {
  const payload = candidate.raw_payload || {};
  const detail = recordValue(payload.detailMetadata);
  const decision = recordValue(payload.decision);
  const sourceUrl = textValue(detail.externalUrl) || textValue(detail.canonicalUrl);
  const description = textValue(candidate.summary);
  const detailText = textValue(detail.description) || textValue(payload.detail);
  const tags = stringList(payload.tags);
  const useCases = stringList(payload.useCases);
  const notIdealFor = stringList(decision.notIdealFor).concat(stringList(payload.notIdealFor));
  const compareAxes = stringList(decision.compareAxes);
  const limitations = stringList(decision.limitations).concat(stringList(payload.limitations));

  const coreGaps = [
    payload.category_id || payload.categorySlug ? null : 'Missing category',
    textValue(detail.imageUrl) ? null : 'Missing logo',
    sourceUrl ? null : 'Missing source URL',
    description.length >= 80 ? null : 'Short description',
    detailText.length >= 160 ? null : 'Short detail',
    tags.length > 0 ? null : 'Missing tags',
  ].filter(Boolean) as string[];
  const decisionGaps = [
    sourceUrl ? null : 'Missing official source',
    textValue(decision.reviewedAt) ? null : 'Missing review date',
    limitations.length > 0 ? null : 'Missing limitations',
    textValue(detail.imageUrl) ? null : 'Missing media',
    useCases.length > 0 ? null : 'Missing best-fit evidence',
    notIdealFor.length > 0 ? null : 'Missing not-ideal evidence',
    compareAxes.length > 0 ? null : 'Missing comparison path',
  ].filter(Boolean) as string[];
  const draftReady = candidate.relevance_score >= 50 && candidate.quality_score >= 80 && coreGaps.length === 0;
  const publishReady = draftReady && decisionGaps.length === 0;

  let nextAction = 'Enrich core fields before creating a draft';
  if (candidate.status === 'imported') nextAction = publishReady ? 'Final editorial review' : 'Complete the imported draft';
  else if (candidate.status === 'rejected') nextAction = 'Keep closed unless new evidence arrives';
  else if (candidate.status === 'skipped') nextAction = 'Re-evaluate when the source changes';
  else if (publishReady) nextAction = 'Create draft and verify before publishing';
  else if (draftReady) nextAction = 'Create draft, then complete decision evidence';
  else if (candidate.quality_score < 70 || coreGaps.length >= 3) nextAction = 'Enrich and rescore';

  return { coreGaps, decisionGaps, draftReady, nextAction, publishReady };
}

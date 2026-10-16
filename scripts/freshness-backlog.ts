import { claimReviewIntervalDays } from './claim-publication-policy';

export type BacklogRow = {
  id: string;
  name: string;
  status: string;
  page_quality_status: string;
  next_review_date: string | null;
  updated_at?: string;
  url: string | null;
  features: Record<string, any> | null;
};
export type BacklogClass = 'schedule_sync' | 'claim_due' | 'entity_due' | 'manual_archive_review';

const taskDependencies = new Set(['perplexity', 'gemini', 'github-copilot', 'codex', 'notion', 'dune', 'the-graph']);

function dateDays(date: string, today: string): number {
  return Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000);
}

export function classifyBacklog(row: BacklogRow, today: string) {
  if (row.status !== 'published' || !row.next_review_date || row.next_review_date > today) return null;
  const f = row.features || {};
  const editorial = f.editorial?.reviewedAt?.slice(0, 10) || null;
  const maintenance = f.maintenanceReview?.checkedAt?.slice(0, 10) || null;
  const source = f.editorial?.sourceUrl || f.maintenanceReview?.sources?.[0] || null;
  const latest = [editorial, maintenance].filter(Boolean).sort().at(-1) || null;
  let classification: BacklogClass;
  let reason: string;
  const validSource = typeof source === 'string' && /^https:\/\/[^/]+/i.test(source);
  const validUrl = typeof row.url === 'string' && /^https:\/\/[^/]+/i.test(row.url);
  if (
    row.page_quality_status === 'archive' ||
    row.page_quality_status === 'merge_candidate' ||
    (!validUrl && !validSource)
  ) {
    classification = 'manual_archive_review';
    reason =
      'Explicit archive/merge state or missing valid product URL and source; manual identity and disposition review required.';
  } else if (!editorial && !maintenance) {
    classification = 'entity_due';
    reason = 'No dated editorial or maintenance evidence for identity, canonical and core function.';
  } else if (latest && latest > row.next_review_date && source) {
    classification = 'schedule_sync';
    reason = 'Dated source-backed review is newer than the schedule; synchronize only after scope and cadence check.';
  } else {
    classification = 'claim_due';
    reason = 'Mutable public claims reached review date; dated source evidence must be refreshed.';
  }
  const overdueDays = dateDays(row.next_review_date, today);
  const risk = row.page_quality_status === 'continue_index' ? 'high' : 'medium';
  const sourceAccessible = validSource;
  let cadence = claimReviewIntervalDays('price', 'routine');
  if (classification === 'entity_due') cadence = claimReviewIntervalDays('identity_canonical', 'first');
  if (classification === 'manual_archive_review') cadence = 7;
  return {
    id: row.id,
    slug: row.name,
    classification,
    reason,
    basisDates: {
      nextReviewDate: row.next_review_date,
      editorialReviewedAt: editorial,
      maintenanceCheckedAt: maintenance,
    },
    risk,
    recommendedCadenceDays: cadence,
    overdueDays,
    sourceUrl: source,
    sourceAccessible,
    taskDecisionDependency: taskDependencies.has(row.name),
    indexRisk: row.page_quality_status === 'continue_index',
    priority:
      (row.page_quality_status === 'continue_index' ? 100 : 0) +
      (taskDependencies.has(row.name) ? 35 : 0) +
      Math.min(overdueDays, 60) +
      (sourceAccessible ? 10 : 0) -
      (classification === 'manual_archive_review' ? 20 : 0),
  };
}

export function selectBacklogBatch(items: NonNullable<ReturnType<typeof classifyBacklog>>[], limit = 5) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 5) throw new Error('Freshness batch limit must be 1..5');
  return [...items].sort((a, b) => b.priority - a.priority || a.slug.localeCompare(b.slug)).slice(0, limit);
}

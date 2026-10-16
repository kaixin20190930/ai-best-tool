import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { classifyBacklog, type BacklogRow } from './freshness-backlog';

export type InventoryTool = BacklogRow & {
  category_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  content: unknown;
  detail: unknown;
  pricing: string | null;
  tags: string[] | null;
};

export type CoverageInput = {
  checkedAt: string;
  property: string;
  results: { url: string; indexed: boolean; inspectedAt: string }[];
};

const baseUrl = 'https://aibesttool.com';

function validUrl(value: string | null): boolean {
  try {
    return new URL(value || '').protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildHistoricalInventory(rows: InventoryTool[], today: string, coverage?: CoverageInput) {
  const owners = new Map<string, string[]>();
  for (const row of rows) {
    const slug = getCanonicalToolSlug(row.name);
    owners.set(slug, [...(owners.get(slug) || []), row.id]);
  }
  const coverageFresh = Boolean(
    coverage &&
      coverage.property === 'sc-domain:aibesttool.com' &&
      /^\d{4}-\d{2}-\d{2}$/.test(coverage.checkedAt) &&
      Date.parse(`${today}T00:00:00Z`) - Date.parse(`${coverage.checkedAt}T00:00:00Z`) <= 14 * 86400000 &&
      Date.parse(`${today}T00:00:00Z`) >= Date.parse(`${coverage.checkedAt}T00:00:00Z`),
  );
  const coverageMap = new Map(
    coverageFresh
      ? coverage!.results
          .filter(
            (item) =>
              /^\d{4}-\d{2}-\d{2}$/.test(item.inspectedAt) &&
              Date.parse(`${today}T00:00:00Z`) - Date.parse(`${item.inspectedAt}T00:00:00Z`) <= 14 * 86400000 &&
              Date.parse(`${today}T00:00:00Z`) >= Date.parse(`${item.inspectedAt}T00:00:00Z`) &&
              typeof item.indexed === 'boolean',
          )
          .map((item) => [item.url, item])
      : [],
  );
  const items = rows.map((row) => {
    const slug = getCanonicalToolSlug(row.name);
    const canonical = `${baseUrl}/ai/${slug}`;
    const decision = getToolIndexDecision({
      status: row.status,
      pageQualityStatus: row.page_quality_status,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      thumbnailUrl: row.thumbnail_url,
      content: row.content,
      detail: row.detail,
      pricing: row.pricing,
      tags: row.tags,
      features: row.features,
    });
    const duplicate = (owners.get(slug)?.length || 0) > 1;
    const identityRisk = duplicate || !validUrl(row.url) || row.name !== slug;
    const dispositionCandidate = row.page_quality_status === 'archive' || row.page_quality_status === 'merge_candidate';
    const due = classifyBacklog(row, today);
    const observed = coverageMap.get(canonical);
    let indexState = 'continue_index-google_status_unavailable';
    if (row.status !== 'published') indexState = 'not_published';
    else if (row.page_quality_status !== 'continue_index') indexState = 'monitor/noindex';
    else if (!decision.indexable) indexState = 'continue_index_gate_failed';
    else if (observed?.indexed === false) indexState = 'continue_index-but-not-indexed';
    else if (observed?.indexed === true) indexState = 'continue_index-indexed';
    const healthy =
      row.status === 'published' &&
      !due &&
      !identityRisk &&
      !dispositionCandidate &&
      indexState !== 'continue_index_gate_failed';
    const flags = [indexState];
    if (identityRisk) flags.push('duplicate/identity-risk');
    if (dispositionCandidate) flags.push('defunct/redirect/archive-candidate');
    if (due) flags.push(due.classification);
    else if (healthy) flags.push('healthy/not_due');
    let action = 'no_change';
    if (dispositionCandidate || duplicate) action = 'owner_authorization_required';
    else if (identityRisk || due?.classification === 'manual_archive_review' || due?.classification === 'entity_due')
      action = 'manual_identity_review';
    else if (due) action = 'existing_tool_freshness_batch';
    else if (indexState === 'continue_index_gate_failed' || indexState === 'continue_index-but-not-indexed')
      action = 'search_diagnostic_review';
    return {
      id: row.id,
      slug: row.name,
      status: row.status,
      pageQualityStatus: row.page_quality_status,
      canonical,
      productUrl: row.url,
      indexState,
      indexGate: decision.reason,
      qualityScore: decision.qualityScore,
      flags,
      duplicateOwnerIds: duplicate ? owners.get(slug) : [],
      due: due
        ? { classification: due.classification, reason: due.reason, nextReviewDate: row.next_review_date }
        : null,
      nextReviewDate: row.next_review_date,
      action,
    };
  });
  const counts = Object.fromEntries(
    [...new Set(items.flatMap((item) => item.flags))]
      .sort()
      .map((flag) => [flag, items.filter((item) => item.flags.includes(flag)).length]),
  );
  return {
    asOf: today,
    readOnly: true,
    productionWrites: 0,
    totalToolIds: rows.length,
    coverage: {
      status: coverageFresh ? 'available_partial' : 'unavailable',
      checkedAt: coverageFresh ? coverage!.checkedAt : null,
      inspectedCanonicalCount: coverageFresh ? coverageMap.size : 0,
      note: 'Only explicit recent URL Inspection/Coverage indexed verdicts are used; missing observations never imply not indexed.',
    },
    counts,
    items,
  };
}

import type { SearchAnalyticsRow } from '../integrations/google-search-console';
import type { GscPeriod } from '../integrations/gsc-search-analytics-report';

// Competitor + decision modifier qualifies; naked brand navigation does not.
export function decisionIntent(query: string): string | null {
  const q = query.toLowerCase().trim();
  if (/aibesttool|ai-best-tool|toolbloom|sigoo|ai best tool$/.test(q)) return null;
  if (/\b(vs|versus|alternatives?|compar(?:e|ison)|better)\b|对比|替代/.test(q)) return 'comparison-alternatives';
  if (
    /\b(self[ -]?host(?:ed|ing)?|requirements?|licen[cs](?:e|ing)|limits?|concurrency|overage|retention)\b|自托管|限制/.test(
      q,
    )
  )
    return 'hosting-requirements-limits';
  if (/\b(pric(?:e|es|ing)|costs?|plans?|subscription|credits?|billing)\b|价格|定价|费用/.test(q))
    return 'pricing-cost-plans';
  if (/\b(?:is .+ free|free .+ tools?|best .+ (?:tools?|for)|tools? for .+)\b|免费|推荐/.test(q))
    return 'free-best-for';
  return null;
}

export function aggregate(rows: SearchAnalyticsRow[]) {
  const clicks = rows.reduce((n, r) => n + r.clicks, 0);
  const impressions = rows.reduce((n, r) => n + r.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : null,
    position: impressions ? rows.reduce((n, r) => n + r.position * r.impressions, 0) / impressions : null,
  };
}

export function queryCluster(query: string): string | null {
  const intent = decisionIntent(query);
  if (!intent) return null;
  const entity = query.toLowerCase().match(/\b(n8n|make|lindy)\b/)?.[1];
  return entity ? entity + ':' + intent : 'unmapped:' + query.toLowerCase().trim();
}

function relevantToPage(url: string, query: string) {
  let pathname: string;
  try {
    pathname = new URL(url).pathname.replace(/^\/cn(?=\/|$)/, '');
  } catch {
    return false;
  }
  const q = query.toLowerCase();
  const intent = decisionIntent(q);
  if (!intent) return false;
  if (pathname === '/ai/n8n') return /\bn8n\b/.test(q) && intent !== 'comparison-alternatives';
  if (pathname === '/ai/lindy') return /\blindy\b/.test(q);
  if (pathname === '/ai/make')
    return /\bmake\b/.test(q) && /automation|integromat|make.com|credits|pricing|cost|plans/.test(q);
  if (pathname === '/guides/n8n-self-hosted-requirements')
    return /\bn8n\b/.test(q) && intent === 'hosting-requirements-limits';
  if (pathname === '/guides/ai-tools-for-automation-comparison')
    return intent === 'comparison-alternatives' && /n8n|lindy|make|automation/.test(q);
  return false;
}

export function buildGrowthScoreboard(period: GscPeriod) {
  const queries = period.breakdowns.query.rows.filter((r) => decisionIntent(r.keys?.[0] || ''));
  const groups = new Map<string, SearchAnalyticsRow[]>();
  for (const row of queries) {
    const key = queryCluster(row.keys?.[0] || '')!;
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  const clusters = Array.from(groups).map(([cluster, rows]) => ({ cluster, queries: rows.length, ...aggregate(rows) }));
  const relevant = period.pageQuery?.rows.filter((r) => relevantToPage(r.keys?.[0] || '', r.keys?.[1] || '')) || null;
  return {
    window: { startDate: period.startDate, endDate: period.endDate },
    outcome: { basis: 'visible query rows only; anonymized queries unavailable', ...aggregate(queries) },
    qualifiedQueryCount: queries.length,
    clusters,
    top20DecisionClusters: clusters.filter(
      (c) => !c.cluster.startsWith('unmapped:') && c.impressions > 0 && c.position !== null && c.position <= 20,
    ).length,
    unmappedDecisionQueries: clusters.filter((c) => c.cluster.startsWith('unmapped:')).length,
    relevantExposedPages:
      relevant === null ? null : new Set(relevant.filter((r) => r.impressions > 0).map((r) => r.keys?.[0])).size,
    relevantExposedQueryClusters:
      relevant === null
        ? null
        : new Set(relevant.filter((r) => r.impressions > 0).map((r) => queryCluster(r.keys?.[1] || ''))).size,
    queryRowsCapped: period.breakdowns.query.capped,
    pageQueryRowsCapped: period.pageQuery?.capped ?? null,
    n8nPricing: aggregate(
      queries.filter(
        (r) => /\bn8n\b/i.test(r.keys?.[0] || '') && decisionIntent(r.keys?.[0] || '') === 'pricing-cost-plans',
      ),
    ),
    decisionBehaviors: {
      status: 'unavailable',
      compareNext: null,
      evidence: null,
      outbound: null,
      attributedOrganicVisits: null,
    },
  };
}

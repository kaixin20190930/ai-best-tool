import assert from 'node:assert/strict';

import type { GscPeriod } from '../lib/integrations/gsc-search-analytics-report';
import { aggregate, buildGrowthScoreboard, decisionIntent } from '../lib/seo/productGrowthScoreboard';

const row = (keys: string[], clicks: number, impressions: number, position: number) => ({
  keys,
  clicks,
  impressions,
  position,
  ctr: clicks / impressions,
});
assert.equal(decisionIntent('n8n'), null);
assert.equal(decisionIntent('Toolbloom pricing'), null);
assert.equal(decisionIntent('n8n pricing'), 'pricing-cost-plans');
assert.equal(decisionIntent('n8n vs make'), 'comparison-alternatives');
assert.equal(decisionIntent('n8n self hosted pricing'), 'hosting-requirements-limits');
assert.equal(aggregate([]).ctr, null);
const p: GscPeriod = {
  startDate: '2026-10-04',
  endDate: '2026-10-31',
  totals: row([], 99, 1000, 2),
  breakdowns: {
    date: { rows: [], capped: false, topRowsOnly: false },
    page: { rows: [], capped: false, topRowsOnly: true },
    query: {
      rows: [row(['n8n'], 90, 900, 1), row(['n8n pricing'], 2, 20, 10), row(['n8n cost'], 0, 80, 30)],
      capped: false,
      topRowsOnly: true,
    },
  },
};
const old = buildGrowthScoreboard(p);
assert.equal(old.outcome.clicks, 2);
assert.equal(old.outcome.impressions, 100);
assert.equal(old.outcome.position, 26);
assert.equal(old.top20DecisionClusters, 0, 'Cluster uses weighted position, not one good query');
assert.equal(old.relevantExposedPages, null, 'Unjoined page data cannot prove relevance');
p.pageQuery = {
  rows: [
    row(['https://aibesttool.com/ai/n8n', 'n8n pricing'], 2, 20, 10),
    row(['https://aibesttool.com/ai/lindy', 'n8n pricing'], 0, 10, 15),
  ],
  capped: false,
  topRowsOnly: true,
};
assert.equal(buildGrowthScoreboard(p).relevantExposedPages, 1);
assert.equal(buildGrowthScoreboard(p).decisionBehaviors.outbound, null);
p.breakdowns.query.rows.push(row(['unmapped product pricing'], 0, 100, 1));
assert.equal(
  buildGrowthScoreboard(p).top20DecisionClusters,
  0,
  'Unmapped terms must not create a fake generic cluster',
);
assert.equal(buildGrowthScoreboard(p).unmappedDecisionQueries, 1);
console.log('PASS brand separation, weighted clusters, missing joins and unavailable attribution');

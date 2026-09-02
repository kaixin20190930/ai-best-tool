import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

const finder = source('app/[locale]/(with-footer)/find-tools/page.tsx');
const sitemap = source('app/sitemap.ts');
const robots = source('public/robots.txt');
const detail = source('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');
const card = source('components/decision/DecisionCardV2.tsx');
const adminPage = source('app/[locale]/(admin)/admin/decision/page.tsx');
const adminLayout = source('app/[locale]/(admin)/layout.tsx');
const reviewAction = source('app/actions/admin/decision.ts');
const smoke = source('scripts/production-seo-smoke.ts');

assert.ok(finder.includes('buildLocalizedPageMetadata'), 'Finder must use shared localized metadata');
assert.ok(finder.includes("path: '/find-tools'"), 'Finder needs a query-independent canonical path');
assert.ok(finder.includes('indexable: false'), 'Finder must remain noindex,follow');
assert.ok(finder.includes('SeoBreadcrumbs'), 'Finder needs the shared visible and structured breadcrumb');
assert.ok(!sitemap.includes("url: 'find-tools'"), 'Finder must not be added to sitemap static routes');
assert.ok(!sitemap.includes('/admin/decision'), 'Admin review must never enter the sitemap');
assert.ok(robots.includes('Sitemap: https://aibesttool.com/sitemap.xml'), 'robots must retain the canonical sitemap');

assert.ok(detail.includes('decisionCardV2 ?'), 'tool detail must explicitly gate Decision Card 2.0');
assert.ok(detail.includes('data-tool-decision-card'), 'tool detail must retain the legacy fallback');
assert.ok(card.includes('data-tool-decision-card-v2'), 'Decision Card 2.0 needs a stable smoke-test marker');
assert.ok(card.includes('reference.sourceUrl'), 'Decision Card facts must expose evidence source URLs');
assert.ok(!card.includes('generateMetadata'), 'Decision Card must remain an embedded module, not a new SEO route');

assert.ok(adminPage.includes('Decision review'), 'admin review route must be present');
assert.ok(adminLayout.includes('requireAdmin()'), 'decision review must inherit admin authentication');
assert.ok(
  reviewAction.includes('getDecisionTransitionError'),
  'server actions must enforce the editorial state machine',
);
assert.ok(reviewAction.includes("input.nextStatus === 'reviewed'"), 'human review metadata must be written explicitly');
assert.ok(smoke.includes("'/cn/find-tools'"), 'production smoke must verify the Finder boundary');
assert.ok(smoke.includes('find-tools|decision'), 'production sitemap smoke must reject DCF private routes');

console.log(
  JSON.stringify(
    {
      success: true,
      finderNoindexCanonical: true,
      sitemapExpansion: false,
      decisionCardEmbedded: true,
      evidenceTraceRequired: true,
      adminReviewProtected: true,
      productionSmokeCoverage: true,
    },
    null,
    2,
  ),
);

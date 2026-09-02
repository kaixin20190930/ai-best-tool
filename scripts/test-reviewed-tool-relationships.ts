import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { REVIEWED_TOOL_RELATIONSHIPS } from '../lib/config/reviewedToolRelationships';

const root = process.cwd();
const detailPage = readFileSync(join(root, 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx'), 'utf8');
const relationshipComponent = readFileSync(join(root, 'components/RecommendedTools.tsx'), 'utf8');
const relationshipService = readFileSync(join(root, 'lib/services/reviewedToolRelationships.ts'), 'utf8');

assert.ok(Object.keys(REVIEWED_TOOL_RELATIONSHIPS).length >= 5, 'Reviewed relationship coverage is too small');

for (const [sourceSlug, relationships] of Object.entries(REVIEWED_TOOL_RELATIONSHIPS)) {
  assert.ok(
    relationships.length >= 2 && relationships.length <= 4,
    `${sourceSlug}: expected 2-4 reviewed relationships`,
  );
  const uniqueTargets = new Set<string>();

  for (const relationship of relationships) {
    assert.notEqual(relationship.relatedToolSlug, sourceSlug, `${sourceSlug}: self-links are not allowed`);
    assert.ok(
      !uniqueTargets.has(relationship.relatedToolSlug),
      `${sourceSlug}: duplicate target ${relationship.relatedToolSlug}`,
    );
    uniqueTargets.add(relationship.relatedToolSlug);
    assert.ok(relationship.rationale.cn.trim(), `${sourceSlug}: Chinese rationale is required`);
    assert.ok(relationship.rationale.en.trim(), `${sourceSlug}: English rationale is required`);
    assert.ok(!Number.isNaN(Date.parse(relationship.reviewedAt)), `${sourceSlug}: invalid reviewedAt`);
    assert.ok(!Number.isNaN(Date.parse(relationship.reviewDueAt)), `${sourceSlug}: invalid reviewDueAt`);
    assert.ok(
      Date.parse(relationship.reviewDueAt) > Date.parse(relationship.reviewedAt),
      `${sourceSlug}: reviewDueAt must follow reviewedAt`,
    );
  }
}

assert.ok(
  detailPage.includes('getReviewedToolRelationships(canonicalSlug, locale)'),
  'Tool detail must load the reviewed relationship source',
);
assert.ok(
  !detailPage.includes('const nextComparisonLinks = getNextComparisonLinks('),
  'Decision Card must not consume inferred comparison links',
);
assert.ok(
  detailPage.includes('<a\n                          key={item.href}\n                          href={item.href}'),
  'Already-localized Decision Card relationship links must not be prefixed again by next-intl Link',
);
assert.ok(
  relationshipComponent.includes('data-reviewed-tool-relationships'),
  'Reviewed relationship UI marker is required',
);
assert.ok(
  !relationshipComponent.includes('getRecommendedTools'),
  'Public relationship links must not use algorithmic recommendations',
);
assert.ok(relationshipService.includes("AND status = 'published'"), 'Relationship targets must be published');
assert.ok(
  relationshipService.includes('getToolIndexDecision(tool).indexable'),
  'Relationship targets must pass the tool indexing gate',
);

console.log(
  `Reviewed tool relationship tests passed for ${Object.keys(REVIEWED_TOOL_RELATIONSHIPS).length} source tools.`,
);

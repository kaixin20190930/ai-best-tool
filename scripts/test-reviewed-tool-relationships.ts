import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

import { REVIEWED_TOOL_RELATIONSHIPS } from '../lib/config/reviewedToolRelationships';
import { isReviewedRelationshipEligible } from '../lib/seo/reviewedRelationshipEligibility';

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
function assertAlternativeAnchors(text: string) {
  const source = ts.createSourceFile('detail.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let matched = 0;
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
      const hasExpression = (name: string) =>
        attributes.some(
          (attribute) =>
            attribute.name.getText(source) === name &&
            attribute.initializer &&
            ts.isJsxExpression(attribute.initializer) &&
            attribute.initializer.expression?.getText(source).replace(/\s/g, '') === 'item.href',
        );
      if (hasExpression('key')) {
        matched += 1;
        assert.equal(node.tagName.getText(source), 'a', 'Localized relationship URLs must use native anchors');
        assert(hasExpression('href'), 'Relationship href must preserve item.href');
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert(matched > 0, 'Decision Card relationship anchors are missing');
}

assertAlternativeAnchors(readFileSync('components/tools/PublicToolDecision.tsx', 'utf8'));
assertAlternativeAnchors('<a href={item.href} key={item.href}>OK</a>');
assertAlternativeAnchors('<a\n key={ item.href }\n href={ item.href }\n>OK</a>');
assert.throws(() => assertAlternativeAnchors('<Link key={item.href} href={item.href}>Bad</Link>'));
assert.throws(() => assertAlternativeAnchors('<a key={item.href}>Missing href</a>'));
assert.throws(() => assertAlternativeAnchors('<div>No relationships</div>'));
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
  relationshipService.includes('isReviewedRelationshipEligible(definition, tool, today)'),
  'Relationship targets must pass the reviewed public eligibility gate',
);

const definition = REVIEWED_TOOL_RELATIONSHIPS.lindy[1];
const monitor = {
  status: 'published',
  pageQualityStatus: 'monitor',
  categoryId: 'productivity',
  imageUrl: '/images/tool-media/test-logo.svg',
  thumbnailUrl: '/images/tool-media/test-screen.svg',
  content: 'A'.repeat(80),
  detail: 'B'.repeat(160),
  pricing: 'freemium',
  tags: ['automation'],
};
assert.equal(
  isReviewedRelationshipEligible(definition, monitor, '2026-11-12'),
  true,
  'Reviewed public monitor targets need not wait for indexing',
);
for (const status of ['pending', 'draft', 'rejected'])
  assert.equal(isReviewedRelationshipEligible(definition, { ...monitor, status }, '2026-11-12'), false);
for (const pageQualityStatus of ['archive', 'merge_candidate', 'noindex'])
  assert.equal(isReviewedRelationshipEligible(definition, { ...monitor, pageQualityStatus }, '2026-11-12'), false);
assert.equal(
  isReviewedRelationshipEligible(
    definition,
    { ...monitor, features: { marketValidation: { verdict: 'rejected' } } },
    '2026-11-12',
  ),
  false,
  'An explicit market rejection must exclude even a high-quality public monitor target',
);
assert.equal(
  isReviewedRelationshipEligible(definition, { ...monitor, content: '', detail: '' }, '2026-11-12'),
  false,
  'Thin targets remain excluded',
);
assert.equal(
  isReviewedRelationshipEligible(definition, monitor, '2026-11-26'),
  false,
  'Expired recommendations must stop displaying',
);
assert.equal(
  isReviewedRelationshipEligible(definition, monitor, '2026-11-11'),
  false,
  'Future reviews cannot authorize links',
);

console.log(
  `Reviewed tool relationship tests passed for ${Object.keys(REVIEWED_TOOL_RELATIONSHIPS).length} source tools.`,
);

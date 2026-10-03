import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getLegacyToolScopeContent } from '@/lib/config/legacyToolScopeReviews';
import { getSafetyToolReview } from '@/lib/config/safetyToolReviews';
import {
  getPublicToolDetailDisposition,
  isNextNavigationError,
  isPublicToolMetadataAllowed,
} from '@/lib/content/publicToolDetailAccess';

const route = fs.readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');

for (const status of ['pending', 'draft', 'rejected']) {
  assert.equal(
    getPublicToolDetailDisposition({
      hasDatabaseRecord: true,
      status,
      hasSafetyReview: false,
      hasLegacyScope: false,
    }),
    'not-found',
    `${status} submissions must be hidden behind a 404`,
  );
  assert.equal(isPublicToolMetadataAllowed(status), false, `${status} metadata must not use submitted fields`);
}

assert.equal(
  getPublicToolDetailDisposition({
    hasDatabaseRecord: true,
    status: 'published',
    hasSafetyReview: false,
    hasLegacyScope: false,
  }),
  'published',
  'Published monitor/noindex records must remain publicly renderable',
);
assert.equal(isPublicToolMetadataAllowed('published'), true, 'Published metadata remains available');
assert.equal(
  getPublicToolDetailDisposition({
    hasDatabaseRecord: true,
    status: 'rejected',
    hasSafetyReview: true,
    hasLegacyScope: false,
  }),
  'neutral',
  'Explicit safety archive pages must keep their neutral public page',
);
assert.equal(
  getPublicToolDetailDisposition({
    hasDatabaseRecord: true,
    status: 'draft',
    hasSafetyReview: false,
    hasLegacyScope: true,
  }),
  'neutral',
  'Explicit legacy scope pages must keep their neutral public page',
);
assert.ok(getSafetyToolReview('undressing_ai', 'en'), 'Safety archive fixture must exist');
assert.ok(getLegacyToolScopeContent('adobe', 'en'), 'Legacy scope fixture must exist');
assert.equal(
  getPublicToolDetailDisposition({
    hasDatabaseRecord: false,
    status: undefined,
    hasSafetyReview: false,
    hasLegacyScope: false,
  }),
  'fallback',
  'Missing database records must preserve static legacy fallback',
);

assert.equal(isNextNavigationError({ digest: 'NEXT_NOT_FOUND' }), true, 'Not-found errors must be recognized');
assert.equal(isNextNavigationError({ digest: 'NEXT_REDIRECT;replace;/ai/foo;307;' }), true, 'Redirect errors must be recognized');
assert.equal(isNextNavigationError(new Error('database unavailable')), false, 'Ordinary errors must remain ordinary');
assert.match(route, /if \(isNextNavigationError\(error\)\) throw error;/g, 'Both page and metadata catches must rethrow navigation errors');
assert.match(route, /const toolImage = metadataAllowed[\s\S]*SEO_CONFIG\.defaultImage;/, 'Non-published DB records must not provide metadata media');
assert.match(route, /if \(disposition === 'not-found'\) notFound\(\);/g, 'Page and metadata must 404 hidden submissions');
assert.match(route, /metadataAllowed && dbTool[\s\S]*getLocalizedField\(dbTool\.title/, 'Submitted title must only be read for published records');

console.log('✅ Public tool detail access protects submissions and preserves reviewed legacy surfaces.');

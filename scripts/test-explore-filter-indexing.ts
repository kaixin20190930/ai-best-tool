import assert from 'node:assert/strict';

import { hasActiveExploreFilters } from '../lib/seo/exploreIndexing';
import { buildLocalizedPageMetadata } from '../lib/seo/metadata';

assert.equal(hasActiveExploreFilters(), false);
assert.equal(hasActiveExploreFilters({}), false);
assert.equal(hasActiveExploreFilters({ pricing: '' }), false);
assert.equal(hasActiveExploreFilters({ pricing: 'freemium', sort: 'popular' }), true);
assert.equal(hasActiveExploreFilters({ search: [' ', 'Undressing AI'] }), true);

const root = buildLocalizedPageMetadata({
  locale: 'en',
  path: '/explore',
  title: 'Explore',
  description: 'Explore AI tools.',
  indexable: !hasActiveExploreFilters(),
});
const filtered = buildLocalizedPageMetadata({
  locale: 'en',
  path: '/explore',
  title: 'Explore',
  description: 'Explore AI tools.',
  indexable: !hasActiveExploreFilters({ pricing: 'freemium' }),
});

assert.equal(root.robots, undefined);
assert.equal(filtered.alternates?.canonical, 'https://aibesttool.com/explore');
assert.equal(filtered.robots && 'index' in filtered.robots ? filtered.robots.index : undefined, false);
console.log('PASS: Explore root remains indexable and filtered/search variants are noindex with the clean canonical');

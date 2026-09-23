import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { deriveTaskPageReadModel } from '@/lib/services/decision/taskPageReadModel';

/* eslint-disable no-param-reassign -- Gate fixtures are deliberately mutated one field at a time. */

const now = new Date('2026-09-23T00:00:00.000Z');
const future = '2026-10-23T00:00:00.000Z';
const reviewed = '2026-09-01T00:00:00.000Z';
const ids = [1, 2, 3].map((n) => `${n}1111111-1111-4111-8111-111111111111`);

function fixture() {
  return {
    task: {
      id: 'task',
      slug: 'meeting-notes',
      status: 'active',
      name: { en: 'Meeting notes' },
      description: { en: 'Reviewable meeting summary' },
      constraint_schema: { requiresReview: true },
    },
    taskCapabilities: ['required', 'preferred'].map((importance, index) => ({
      task_id: 'task',
      capability_id: `cap-${index}`,
      importance,
      rationale: { en: 'Needed for meeting notes' },
      status: 'published',
      reviewed_at: reviewed,
      review_due_at: future,
    })),
    capabilities: [0, 1].map((index) => ({
      id: `cap-${index}`,
      name: { en: `Capability ${index}` },
      status: 'active',
    })),
    fits: ids.map((tool_id, index) => ({
      id: `fit-${index}`,
      task_id: 'task',
      tool_id,
      fit_level: 'strong',
      rationale: { en: 'Suitable for this task' },
      required_conditions: [{ en: 'Check consent' }],
      disqualifiers: [],
      status: 'published',
      reviewed_at: reviewed,
      review_due_at: future,
    })),
    fitClaimLinks: ids.map((_, index) => ({ fit_id: `fit-${index}`, claim_id: `claim-${index}` })),
    claims: ids.map((_, index) => ({
      id: `claim-${index}`,
      profile_id: `profile-${index}`,
      source_url: `https://example.com/${index}`,
      verified_at: reviewed,
      review_due_at: future,
      verification_status: 'verified',
      conflict_status: 'none',
      invalidated_at: null,
      expires_at: null,
      claim_value: { secret: 'never public' },
      source_excerpt: 'never public',
    })),
    profiles: ids.map((owner_id, index) => ({ id: `profile-${index}`, owner_type: 'tool', owner_id })),
    identities: ids.map((id, index) => ({ id, slug: `tool-${index}`, title: `Tool ${index}` })),
  };
}

assert.equal(deriveTaskPageReadModel(fixture(), now)?.tools.length, 3);
const publicModel = deriveTaskPageReadModel(fixture(), now)!;
assert.equal(JSON.stringify(publicModel).includes('claim_value'), false);
assert.equal(JSON.stringify(publicModel).includes('source_excerpt'), false);
assert.equal(JSON.stringify(publicModel).includes('claim-0'), false);

function denied(change: (input: ReturnType<typeof fixture>) => void, message: string) {
  const input = fixture();
  change(input);
  assert.equal(deriveTaskPageReadModel(input, now), null, message);
}
denied((x) => {
  x.task.status = 'draft';
}, 'inactive task');
denied((x) => {
  x.task.slug = 'not-first-wave';
}, 'unapproved task');
denied((x) => {
  x.taskCapabilities[0].status = 'reviewed';
}, 'unpublished required capability');
denied((x) => {
  x.taskCapabilities[1].importance = 'required';
}, 'missing preferred capability');
denied((x) => {
  x.taskCapabilities[1].review_due_at = reviewed;
}, 'expired task capability');
denied((x) => {
  x.capabilities[0].status = 'archived';
}, 'inactive capability');
denied((x) => {
  x.fits[0].status = 'reviewed';
}, 'only two published fits');
denied((x) => {
  x.fits[0].review_due_at = reviewed;
}, 'expired fit');
denied((x) => {
  x.fits[0].fit_level = 'not_fit';
}, 'unsuitable fit cannot count');
denied((x) => {
  x.fitClaimLinks.splice(0, 1);
}, 'unbacked fit');
denied((x) => {
  x.claims[0].verification_status = 'candidate';
}, 'unverified claim');
denied((x) => {
  x.claims[0].conflict_status = 'open';
}, 'conflicted claim');
denied((x) => {
  x.claims[0].invalidated_at = reviewed;
}, 'invalidated claim');
denied((x) => {
  x.claims[0].review_due_at = reviewed;
}, 'stale claim');
denied((x) => {
  x.profiles[0].owner_id = ids[1];
}, 'wrong-owner claim');
denied((x) => {
  x.identities.splice(0, 1);
}, 'unpublished or absent Neon tool');
denied((x) => {
  x.identities[0].slug = x.identities[1].slug;
}, 'duplicate Neon tool slug');

const route = readFileSync(resolve('app/[locale]/(with-footer)/tasks/[slug]/page.tsx'), 'utf8');
const read = readFileSync(resolve('lib/services/decision/taskPage.ts'), 'utf8');
const sitemap = readFileSync(resolve('app/sitemap.ts'), 'utf8');
assert.match(route, /if \(!model\) notFound\(\)/);
assert.match(route, /indexable: false/);
assert.match(route, /buildLocalizedPageMetadata/);
assert.match(route, /SeoBreadcrumbs/);
assert.match(route, /getLocalizedToolPath/);
assert.match(route, /generateLocalizedPath\('\/find-tools'/);
assert.doesNotMatch(sitemap, /tasks\/\$\{|url: 'tasks'/);
assert.match(read, /getDecisionToolIdentities/);
assert.doesNotMatch(read, /claim_value|source_excerpt/);
const metadata = buildLocalizedPageMetadata({
  locale: 'cn',
  path: '/tasks/meeting-notes',
  title: '会议纪要',
  description: '已审核的会议工具候选。',
  indexable: false,
});
assert.equal(metadata.alternates?.canonical, 'https://aibesttool.com/cn/tasks/meeting-notes');
assert.equal(metadata.alternates?.languages, undefined, 'noindex pages do not advertise hreflang');
assert.deepEqual(metadata.robots, { index: false, follow: true, googleBot: { index: false, follow: true } });
console.log(
  JSON.stringify(
    { success: true, eligibilityFailClosed: true, rawClaimsExcluded: true, noindex: true, sitemapExcluded: true },
    null,
    2,
  ),
);

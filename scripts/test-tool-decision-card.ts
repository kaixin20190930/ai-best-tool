import assert from 'node:assert/strict';

import { buildToolDecisionCard } from '@/lib/services/toolDecisionCard';

const input = {
  audience: {
    bestFit: ['Research teams', ' Research teams ', 'Analysts'],
    notIdealFor: ['One-off use', ''],
  },
  community: {
    evidence: '2 ratings',
    label: 'Early signal',
    summary: 'Feedback is still limited.',
  },
  comparison: {
    alternatives: [
      { description: 'Primary comparison', href: '/guides/research', title: 'Research tools' },
      { description: 'Duplicate', href: '/guides/research', title: 'Research tools' },
      { description: 'Missing URL', href: '', title: 'Invalid' },
    ],
    axes: ['Sources', ' Sources ', 'Pricing'],
    summary: 'Compare evidence quality first.',
  },
  editorial: {
    reviewedAt: null,
    reviewedLabel: null,
    reviewerLabel: 'Pending',
    sourceUrl: null,
    stale: false,
    summary: null,
    trustNote: null,
  },
  freshness: { label: 'Recently updated', summary: 'Check the official changelog.' },
  media: { assetCount: 1, evidence: '1 screenshot', label: 'Partial preview', summary: 'More media is needed.' },
  officialSite: {
    hostname: 'example.com',
    secureLabel: 'HTTPS',
    statusLabel: 'Public listing',
    summary: 'Official website is available.',
  },
  owner: {
    claimedAtLabel: null,
    label: 'Unclaimed',
    summary: 'No owner signal yet.',
    tone: 'text-slate-700',
  },
  pricing: { label: 'Freemium', summary: 'Verify current limits.' },
  risks: ['Limited feedback', ' Limited feedback ', ''],
  verificationChecklist: ['Check pricing', 'Check pricing', 'Read docs'],
};

const result = buildToolDecisionCard(input);

assert.deepEqual(result.audience.bestFit, ['Research teams', 'Analysts']);
assert.deepEqual(result.audience.notIdealFor, ['One-off use']);
assert.deepEqual(result.comparison.axes, ['Sources', 'Pricing']);
assert.equal(result.comparison.alternatives.length, 1);
assert.deepEqual(result.risks, ['Limited feedback']);
assert.deepEqual(result.verificationChecklist, ['Check pricing', 'Read docs']);
assert.equal(result.evidenceCompleteness.complete, false);
assert.equal(result.evidenceCompleteness.score, 71);
assert.deepEqual(result.evidenceCompleteness.missing, ['official_source', 'reviewed_at']);
assert.equal(result.reviewSchedule.initialReviewRequired, true);
assert.equal(result.reviewSchedule.nextFactReviewAt, null);
assert.deepEqual(input.comparison.axes, ['Sources', ' Sources ', 'Pricing']);

const reviewedResult = buildToolDecisionCard(
  {
    ...input,
    editorial: {
      ...input.editorial,
      reviewedAt: '2026-01-01T00:00:00.000Z',
      sourceUrl: 'https://example.com/docs',
    },
  },
  new Date('2026-01-15T00:00:00.000Z'),
);

assert.equal(reviewedResult.evidenceCompleteness.complete, true);
assert.equal(reviewedResult.reviewSchedule.initialReviewRequired, false);
assert.equal(reviewedResult.reviewSchedule.nextFactReviewAt, '2026-01-31T00:00:00.000Z');
assert.equal(reviewedResult.reviewSchedule.nextDecisionReviewAt, '2026-04-01T00:00:00.000Z');
assert.equal(reviewedResult.reviewSchedule.factReviewDue, false);

console.log('Tool Decision Card model test passed.');

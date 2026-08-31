import assert from 'node:assert/strict';

import { buildToolDecisionCard, ToolDecisionCardModel } from '@/lib/services/toolDecisionCard';

const input: ToolDecisionCardModel = {
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
    reviewedLabel: null,
    reviewerLabel: 'Pending',
    sourceUrl: null,
    stale: false,
    summary: null,
    trustNote: null,
  },
  freshness: { label: 'Recently updated', summary: 'Check the official changelog.' },
  media: { evidence: '1 screenshot', label: 'Partial preview', summary: 'More media is needed.' },
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
assert.deepEqual(input.comparison.axes, ['Sources', ' Sources ', 'Pricing']);

console.log('Tool Decision Card model test passed.');

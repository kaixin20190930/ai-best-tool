import React from 'react';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import type { PublicToolCapabilitySummary } from '@/lib/services/decision/capabilityReadModel';
import { summarizePublicToolEvidence, type PublicToolEvidenceLedger } from '@/lib/services/intelligence/publicEvidence';
import { buildToolDecisionCard } from '@/lib/services/toolDecisionCard';

import PublicToolDecision from '../components/tools/PublicToolDecision';

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
      reviewerLabel: 'Editorial team',
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

(globalThis as unknown as { React: typeof React }).React = React;
for (const card of [result, reviewedResult]) {
  for (const locale of ['en', 'cn']) {
    const html = renderToStaticMarkup(
      React.createElement(PublicToolDecision, {
        card,
        model: null,
        locale,
        task: 'Research notes',
        tradeOff: 'Limited export',
        checkedAt: '2026-01-01',
      }),
    );
    const dom = new JSDOM(html);
    assert.equal(dom.window.document.querySelectorAll('#decision-card').length, 1);
    assert.equal(dom.window.document.querySelectorAll('[data-tool-verified-capabilities]').length, 0);
    assert.equal(dom.window.document.querySelectorAll('[data-tool-evidence-summary]').length, 0);
    for (const copy of [
      'Research notes',
      'Limited export',
      'Research teams',
      'One-off use',
      'Limited feedback',
      'Sources',
      'Pricing',
      'Freemium',
      '2026-01-01',
    ]) {
      assert(html.includes(copy));
    }
    assert(!/Evidence readiness|Next fact check|Next decision review|待补|Pending/.test(html));
    assert.equal(
      dom.window.document.querySelectorAll('a[href="https://example.com/docs"]').length,
      card.editorial.sourceUrl ? 1 : 0,
    );
    dom.window.close();
  }
}

const capabilities: PublicToolCapabilitySummary[] = [
  {
    name: { en: 'Video generation', cn: '视频生成' },
    description: { en: 'Create short clips.' },
    group: 'creation',
    supportLevel: 'unknown',
    availability: 'paid_only',
    planRequirement: { en: 'Business plan' },
    limitations: [{ en: 'No offline export' }],
    evidence: [
      {
        sourceUrl: 'https://example.com/verified-feature',
        verifiedAt: '2026-09-05T00:00:00.000Z',
        reviewDueAt: '2026-12-05T00:00:00.000Z',
      },
    ],
  },
];
const ledger = {
  summary: { verified: 1, decisionReady: 1 },
  entries: [
    {
      claimId: 'secret-claim-id',
      claimValue: 'secret-raw-value',
      sourceExcerpt: 'secret-excerpt',
      verificationStatus: 'verified',
      verifiedAt: '2026-09-05T00:00:00.000Z',
      reviewDueAt: '2026-12-05T00:00:00.000Z',
      canSupportDecision: true,
      freshness: 'fresh',
    },
  ],
} as unknown as PublicToolEvidenceLedger;
const evidenceSummary = summarizePublicToolEvidence(ledger);
assert.deepEqual(evidenceSummary, {
  verified: 1,
  decisionReady: 1,
  latestVerifiedAt: '2026-09-05T00:00:00.000Z',
  nextReviewDueAt: '2026-12-05T00:00:00.000Z',
});
const intelligenceHtml = renderToStaticMarkup(
  React.createElement(
    PublicToolDecision,
    {
      card: reviewedResult,
      model: null,
      locale: 'en',
      task: 'Research notes',
      tradeOff: 'Limited export',
      checkedAt: null,
      capabilities,
      evidenceSummary,
    },
    React.createElement('span', null, 'Existing official evidence child'),
  ),
);
assert(intelligenceHtml.includes('Tool Intelligence / Decision Card'));
assert(intelligenceHtml.includes('Verified capabilities'));
assert(intelligenceHtml.includes('Unknown'));
assert(intelligenceHtml.includes('Paid only'));
assert(intelligenceHtml.includes('Business plan'));
assert(intelligenceHtml.includes('No offline export'));
assert(intelligenceHtml.includes('https://example.com/verified-feature'));
assert(intelligenceHtml.includes('Last verified'));
assert(intelligenceHtml.includes('href="#evidence-ledger"'));
assert(intelligenceHtml.includes('Existing official evidence child'));
for (const secret of ['secret-claim-id', 'secret-raw-value', 'secret-excerpt']) {
  assert(!intelligenceHtml.includes(secret));
}

import React from 'react';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import { INDEXABLE_GUIDE_PAGES } from '@/lib/content/guides';
import { validateVerifiedComparison } from '@/lib/content/verifiedComparison';
import { web3Comparison, web3ComparisonFaqs } from '@/lib/content/web3Comparison';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import {
  derivePublicComparisonCapabilityRows,
  derivePublicDecisionCapabilityReadModel,
  loadPublicComparisonCapabilityRows,
} from '@/lib/services/decision/capabilityReadModel';
import VerifiedComparisonPage from '@/components/guides/VerifiedComparisonPage';

async function main() {
  const now = new Date('2026-09-23T00:00:00.000Z');
  const future = '2026-10-23T00:00:00.000Z';
  const ids = [
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
  ];
  const secretClaimId = 'secret-claim-id';
  const secretProfileId = 'secret-profile-id';
  const secretCapabilityId = 'secret-capability-id';
  const model = derivePublicDecisionCapabilityReadModel(
    {
      capabilities: [
        {
          id: secretCapabilityId,
          slug: 'video-generation',
          name: { en: 'Video generation', cn: '视频生成' },
          description: { en: 'Creates video.', cn: '生成视频。' },
          capability_group: 'creation',
          display_order: 1,
          status: 'active',
        },
      ],
      tasks: [],
      taskCapabilities: [],
      toolCapabilities: [
        {
          id: 'secret-tool-capability-id',
          tool_id: ids[0],
          capability_id: secretCapabilityId,
          support_level: 'strong',
          availability: 'paid_only',
          plan_requirement: { en: 'Paid plan' },
          limitations: [{ en: 'Short clips' }],
          status: 'published',
          reviewed_at: '2026-09-01T00:00:00.000Z',
          review_due_at: future,
        },
        {
          id: 'reviewed-tool-capability',
          tool_id: ids[1],
          capability_id: secretCapabilityId,
          support_level: 'not_supported',
          status: 'reviewed',
          reviewed_at: '2026-09-01T00:00:00.000Z',
          review_due_at: future,
        },
        {
          id: 'wrong-owner-tool-capability',
          tool_id: ids[2],
          capability_id: secretCapabilityId,
          support_level: 'strong',
          status: 'published',
          reviewed_at: '2026-09-01T00:00:00.000Z',
          review_due_at: future,
        },
        {
          id: 'expired-tool-capability',
          tool_id: ids[3],
          capability_id: secretCapabilityId,
          support_level: 'strong',
          status: 'published',
          reviewed_at: '2026-09-01T00:00:00.000Z',
          review_due_at: '2026-09-22T00:00:00.000Z',
        },
      ],
      claimLinks: [
        { tool_capability_id: 'secret-tool-capability-id', claim_id: secretClaimId },
        { tool_capability_id: 'wrong-owner-tool-capability', claim_id: secretClaimId },
      ],
      claims: [
        {
          id: secretClaimId,
          profile_id: secretProfileId,
          source_url: 'https://example.com/capabilities',
          verified_at: '2026-09-01T00:00:00.000Z',
          verification_status: 'verified',
          conflict_status: 'none',
          invalidated_at: null,
          expires_at: null,
          review_due_at: future,
          claim_value: { secret: 'raw-claim-value' },
          source_excerpt: 'raw-source-excerpt',
        },
      ],
      profiles: [{ id: secretProfileId, owner_type: 'tool', owner_id: ids[0] }],
    },
    now,
  );

  const candidates = [
    { slug: 'dune', toolId: ids[0] },
    { slug: 'the-graph', toolId: ids[1] },
    { slug: 'third', toolId: ids[2] },
    { slug: 'fourth', toolId: ids[3] },
    { slug: 'fifth', toolId: '55555555-5555-4555-8555-555555555555' },
  ];
  for (const count of [2, 3, 4]) {
    const rows = derivePublicComparisonCapabilityRows(model, candidates.slice(0, count));
    assert.equal(rows.length, 1, `${count} candidates can show one eligible capability`);
    assert.equal(rows[0].cells.dune?.supportLevel, 'strong');
    for (const candidate of candidates.slice(1, count))
      assert.equal(rows[0].cells[candidate.slug], null, 'unpublished, wrong-owner, or stale evidence is Unknown');
    const serialized = JSON.stringify(rows);
    for (const privateValue of [
      secretClaimId,
      secretProfileId,
      secretCapabilityId,
      'raw-claim-value',
      'raw-source-excerpt',
      ids[0],
    ])
      assert.equal(serialized.includes(privateValue), false, `private value ${privateValue} must not enter the matrix`);
  }
  assert.deepEqual(derivePublicComparisonCapabilityRows(model, candidates.slice(0, 1)), []);
  assert.deepEqual(derivePublicComparisonCapabilityRows(model, candidates), []);
  assert.deepEqual(
    derivePublicComparisonCapabilityRows({ ...model, toolCapabilities: [] }, candidates.slice(0, 2)),
    [],
  );
  assert.deepEqual(
    await loadPublicComparisonCapabilityRows(candidates.slice(0, 2), async () => {
      throw new Error('auxiliary read unavailable');
    }),
    [],
    'capability read failure leaves the verified comparison available',
  );

  function comparisonWithCandidateCount(count: number) {
    const comparison = structuredClone(web3Comparison);
    for (let index = 2; index < count; index += 1) {
      const slug = `candidate-${index + 1}`;
      comparison.candidates.push({
        ...structuredClone(comparison.candidates[0]),
        slug,
        name: `Candidate ${index + 1}`,
      });
      for (const row of comparison.comparisonRows) {
        row.values[slug] = { en: `Additional value ${index + 1}`, cn: `附加值 ${index + 1}` };
      }
    }
    comparison.candidates.length = count;
    return comparison;
  }
  for (const count of [2, 3, 4]) {
    const comparison = comparisonWithCandidateCount(count);
    assert.equal(
      validateVerifiedComparison(
        comparison,
        comparison.candidates.map((item) => item.slug),
      ),
      true,
    );
  }
  for (const count of [1, 5]) {
    const comparison = comparisonWithCandidateCount(count);
    assert.equal(
      validateVerifiedComparison(
        comparison,
        comparison.candidates.map((item) => item.slug),
      ),
      false,
    );
    assert.match(
      renderToStaticMarkup(
        React.createElement(VerifiedComparisonPage, {
          comparison,
          locale: 'en',
          tools: [],
          guideHref: '/guides/ai-tools-for-web3',
          faqs: web3ComparisonFaqs,
        }),
      ),
      /data-public-comparison="unavailable"/,
    );
  }

  const props = {
    comparison: web3Comparison,
    locale: 'en',
    tools: [
      { name: 'dune', title: 'Dune' },
      { name: 'the-graph', title: 'The Graph' },
    ],
    guideHref: '/guides/ai-tools-for-web3',
    faqs: web3ComparisonFaqs,
  };
  const rows = derivePublicComparisonCapabilityRows(model, candidates.slice(0, 2));
  const html = renderToStaticMarkup(React.createElement(VerifiedComparisonPage, { ...props, capabilityRows: rows }));
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('[data-comparison-section="capabilities"]').length, 1);
  assert.equal(document.querySelectorAll('[data-comparison-section]').length, 7);
  assert.match(document.querySelector('[data-comparison-section="capabilities"]')?.textContent || '', /Unknown/);
  assert.match(document.querySelector('[data-comparison-section="capabilities"]')?.textContent || '', /Strong/);
  assert.ok(document.querySelector('a[href="https://example.com/capabilities"]'));
  for (const privateValue of [
    secretClaimId,
    secretProfileId,
    secretCapabilityId,
    'raw-claim-value',
    'raw-source-excerpt',
    ids[0],
  ])
    assert.equal(html.includes(privateValue), false);
  for (const preserved of ['decision', 'matrix', 'candidates', 'fit', 'sources'])
    assert.ok(document.querySelector(`[data-comparison-section="${preserved}"]`));
  assert.ok(document.querySelector('[data-comparison-primary-cta]'));
  assert.equal(
    new JSDOM(
      renderToStaticMarkup(React.createElement(VerifiedComparisonPage, props)),
    ).window.document.querySelectorAll('[data-comparison-section]').length,
    6,
  );

  const templateSource = fs.readFileSync(
    path.join(process.cwd(), 'app/[locale]/(with-footer)/guides/comparison-template.tsx'),
    'utf8',
  );
  assert.match(templateSource, /\.\.\.getNoindexMetadata\(\)/);
  assert.equal((getNoindexMetadata().robots as { index: boolean }).index, false);
  assert.equal(
    INDEXABLE_GUIDE_PAGES.some((page) => page.href.endsWith('-comparison')),
    false,
  );
  assert.equal(
    INDEXABLE_GUIDE_PAGES.some((page) => page.href === '/guides/ai-tools-for-web3-comparison'),
    false,
  );

  console.log('Structured comparison capability matrix test passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

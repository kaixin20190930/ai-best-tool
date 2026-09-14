import React from 'react';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import GuideEvidencePanel from '../components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '../components/guides/GuideSubmissionPath';
import VerifiedComparisonPage from '../components/guides/VerifiedComparisonPage';
import { validateVerifiedComparison } from '../lib/content/verifiedComparison';
import { web3Comparison, web3ComparisonFaqs } from '../lib/content/web3Comparison';
import { generateFAQSchema } from '../lib/seo/schema';
import {
  copyViolations,
  publicSourceFiles,
  scanRepository,
  scanSource,
  type Finding,
} from './lib/public-content-boundary';

const baseline = JSON.parse(readFileSync('reports/public-content-boundary/pub-01-baseline.json', 'utf8')) as {
  findings: Finding[];
};
const pilot = 'app/[locale]/(with-footer)/guides/ai-tools-for-web3-comparison/page.tsx';
const budget = new Map<string, number>();
for (const finding of baseline.findings) {
  if (finding.file === pilot) continue;
  budget.set(finding.fingerprint, (budget.get(finding.fingerprint) || 0) + 1);
}
const current = scanRepository(process.cwd());
assert.equal(current.length, 0, 'PUB-03: public copy must remain free of internal language');
for (const finding of current) {
  const remaining = budget.get(finding.fingerprint) || 0;
  assert.ok(
    remaining > 0,
    `New public copy violation: ${finding.file}:${finding.line} [${finding.rule}] ${finding.text}`,
  );
  budget.set(finding.fingerprint, remaining - 1);
}
for (const file of ['lib/content/web3Comparison.ts', 'lib/content/verifiedComparison.ts']) {
  assert.equal(scanSource(file, readFileSync(file, 'utf8')).length, 0);
}
// Regression probes must demonstrate the gate detects rendered JSX, config and split templates.
for (const source of [
  '<h2>索引策略</h2>',
  "const copy = { cn: '保留索引', en: 'Keep it indexable' };",
  '<p>{`Next enrichment: ${name}`}</p>',
  '<p title="sitemap eligibility">Info</p>',
  '<div>{"\\u7d22\\u5f15\\u7b56\\u7565"}</div>',
])
  assert.ok(scanSource('app/public/page.tsx', source).length > 0);
for (const file of [
  'docs/plan.tsx',
  'reports/audit.tsx',
  'scripts/fixtures/copy.tsx',
  'components/admin/Test.tsx',
  'app/[locale]/(with-footer)/admin/page.tsx',
  'app/[locale]/(admin)/admin/analytics/page.tsx',
  'app/actions/admin/tools.ts',
  'lib/config/status.ts',
]) {
  assert.equal(scanSource(file, '<p>索引策略 continue_index</p>').length, 0);
}
assert.equal(
  scanSource('app/public/page.tsx', '// 保留索引\nconst monitor = true;\nconst jsx = <p>Monitor wallet activity</p>;')
    .length,
  0,
);

const slugs = ['dune', 'the-graph'];
assert.ok(validateVerifiedComparison(web3Comparison, slugs));
const tools = slugs.map((name) => ({ name, title: name === 'dune' ? 'Dune' : 'The Graph' }));
for (const locale of ['cn', 'en']) {
  const props = {
    comparison: web3Comparison,
    locale,
    tools,
    guideHref: '/guides/ai-tools-for-web3',
    faqs: web3ComparisonFaqs,
  };
  const html = renderToStaticMarkup(<VerifiedComparisonPage {...props} />);
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelectorAll('[data-comparison-section]').length, 6);
  for (const attribute of ['evidence', 'next', 'primary-cta'])
    assert.equal(document.querySelectorAll(`[data-comparison-${attribute}]`).length, 1);
  assert.equal(document.querySelectorAll('tbody tr').length, 4);
  assert.equal(document.querySelectorAll('a[href*="/submit"],a[href*="/developer/listing"]').length, 0);
  assert.equal(copyViolations(document.body.textContent || '').length, 0);
  assert.ok(document.querySelector('h1')?.textContent?.includes('Dune vs The Graph'));
  for (const slug of slugs)
    assert.ok(document.querySelector(`a[href="${locale === 'cn' ? '/cn' : ''}/ai/${slug}#decision-card"]`));
  for (const ref of document.querySelectorAll('a[href^="#evidence-"]'))
    assert.ok(document.querySelector(ref.getAttribute('href')!));
  const faqs = web3ComparisonFaqs.map((faq) => ({
    question: faq.question[locale as 'cn' | 'en'],
    answer: faq.answer[locale as 'cn' | 'en'],
  }));
  const schema = generateFAQSchema(faqs);
  const details = document.querySelectorAll('[data-comparison-faq] details');
  schema.mainEntity.forEach((entity, index) => {
    assert.equal(details[index].querySelector('summary')?.textContent, entity.name);
    assert.equal(details[index].querySelector('p')?.textContent, entity.acceptedAnswer.text);
  });
  assert.equal(renderToStaticMarkup(<GuideEvidencePanel locale={locale} variant='verified' evidence={[]} />), '');
  assert.equal(renderToStaticMarkup(<GuideSubmissionPath locale={locale} audience='reader' ctaPrefix='pilot' />), '');

  for (const mutate of [
    (item: typeof web3Comparison) => {
      item.candidates.pop();
    },
    (item: typeof web3Comparison) => {
      delete item.comparisonRows[0].values.dune;
    },
    (item: typeof web3Comparison) => {
      item.comparisonRows[0].reason.en = '';
    },
    (item: typeof web3Comparison) => {
      item.comparisonRows[0].evidenceRefs = ['missing-source'];
    },
    (item: typeof web3Comparison) => {
      item.evidence[0].source.url = 'javascript:alert(1)';
    },
    (item: typeof web3Comparison) => {
      item.evidence[0].checkedAt = '';
    },
    (item: typeof web3Comparison) => {
      item.title.en = 'A shortlist of common tools';
    },
  ]) {
    const comparison = structuredClone(web3Comparison);
    mutate(comparison);
    assert.equal(validateVerifiedComparison(comparison, slugs), false);
    const fallback = renderToStaticMarkup(<VerifiedComparisonPage {...props} comparison={comparison} />);
    assert.ok(fallback.includes('data-public-comparison="unavailable"'));
    assert.ok(!fallback.includes('<table'));
  }
  assert.equal(validateVerifiedComparison(web3Comparison, ['dune']), false);
}
// Only the sourced Web3 comparison is verified; other callers explicitly fail closed.
assert.deepEqual(
  publicSourceFiles(process.cwd()).filter(
    (file) => file.startsWith('app/') && /comparison\s*:\s*web3Comparison/.test(readFileSync(file, 'utf8')),
  ),
  [pilot],
);
assert.ok(readFileSync(pilot, 'utf8').includes('comparison: web3Comparison'));
assert.ok(!readFileSync(pilot, 'utf8').includes('GuideSubmissionPath'));
console.log(
  `Public content boundary PASS: ${current.length} exact legacy findings tracked, no new violations; bilingual six-section sample, citations, FAQ/schema equality and fail-closed probes passed.`,
);

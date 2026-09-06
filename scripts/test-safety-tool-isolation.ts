import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import SafetyToolArchivePage from '../components/tools/SafetyToolArchivePage';
import REVIEWS, { applySafetyToolReview, getSafetyToolReview } from '../lib/config/safetyToolReviews';
import { dataList, detailList } from '../lib/data';
import { toolToDetailData, toolToListRow } from '../lib/services/toolPresenter';
import type { Tool } from '../lib/services/tools';

// Direct TSX execution does not inject Next.js's automatic JSX runtime for imported components.
(globalThis as typeof globalThis & { React: typeof React }).React = React;

for (const slug of Object.keys(REVIEWS)) {
  for (const locale of ['en', 'cn', 'tw']) {
    const review = getSafetyToolReview(slug, locale);
    assert(review);
    const row = { name: slug, title: 'Unsafe old title', content: 'Unsafe old copy', detail: 'Unsafe old detail' };
    const corrected = applySafetyToolReview(row, locale);
    assert.equal(corrected.title, review.title);
    assert.equal(corrected.content, review.content);
    assert.equal(corrected.detail, review.detail);
    const fixture = {
      ...row,
      id: 'fixture',
      title: { en: 'Unsafe old title' },
      url: 'https://unsafe.example',
      tags: [],
      features: null,
    } as unknown as Tool;
    assert.equal(toolToListRow(fixture, locale).content, review.content);
    assert.equal(toolToDetailData(fixture, locale).detail, review.detail);
    const html = renderToStaticMarkup(React.createElement(SafetyToolArchivePage, { slug, locale }));
    assert(html.includes(`data-safety-tool-page="${slug}"`));
    assert(!html.includes('unsafe.example'));
  }
  const fallbackList = dataList.find((row) => row.name === slug);
  const fallbackDetail = detailList.find((row) => row.name === slug);
  if (fallbackList) assert.equal(fallbackList.content, getSafetyToolReview(slug, 'en')?.content);
  if (fallbackDetail) assert.equal(fallbackDetail.detail, getSafetyToolReview(slug, 'en')?.detail);
}

assert.equal(getSafetyToolReview('undressing_ai', 'en')?.disposition, 'archive');
assert.equal(getSafetyToolReview('anime-girl-studio', 'en')?.disposition, 'monitor');
assert.equal(getSafetyToolReview('claude', 'en'), null);

const pageSource = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf8');
const toolsServiceSource = readFileSync('lib/services/tools.ts', 'utf8');
assert(pageSource.includes('return <SafetyToolArchivePage slug={canonicalSlug} locale={locale} />'));
assert(
  pageSource.indexOf('return <SafetyToolArchivePage') < pageSource.indexOf('// Generate SoftwareApplication schema'),
  'Safety records must bypass the generic SoftwareApplication schema path',
);
assert(
  toolsServiceSource.includes("COALESCE(page_quality_status, 'monitor') <> 'archive'"),
  'Archived records must be excluded from public listing queries',
);
assert(toolsServiceSource.includes('params.push(SAFETY_TOOL_SLUGS)'), 'All safety-review records must stay off public lists');

console.log('PASS three safety records, neutral page projection, schema bypass and control slug');

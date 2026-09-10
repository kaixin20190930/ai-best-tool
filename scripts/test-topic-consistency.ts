import React from 'react';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Pool } from 'pg';
import { renderToStaticMarkup } from 'react-dom/server';

import sitemap from '../app/sitemap';
import GuideEvidencePanel from '../components/guides/GuideEvidencePanel';
import { TOPIC_TOOL_NAMES } from '../lib/data/topicToolSources';
import { getTopListTopic, topListTopics } from '../lib/data/topLists';
import { getEditorialReviewRecord } from '../lib/seo/contentReviewDates';
import { buildLocalizedPageMetadata } from '../lib/seo/metadata';
import { BEST_TOPIC_EDIT, getStaticPageLastModified, STATIC_PAGE_EDITS } from '../lib/seo/staticPageDates';
import type { Category } from '../lib/services/categories';
import type { Tool } from '../lib/services/tools';
import { loadTopicCatalog, selectTopicTools } from '../lib/services/topicTools';

const category = { id: 'productivity-id', slug: 'productivity', toolCount: 20 } as unknown as Category;
const tool = (name: string, changes: Partial<Tool> = {}): Tool =>
  ({
    id: name,
    name,
    title: { en: name },
    content: { en: 'A real tool summary.' },
    url: `https://example.com/${name}`,
    status: 'published',
    categoryId: category.id,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-09-01'),
    ...changes,
  }) as Tool;
const automation = getTopListTopic('ai-automation-tools')!;
const fixtureTools = [
  tool('n8n'),
  tool('make'),
  tool('unrelated-productivity'),
  tool('pipedream', { status: 'draft' }),
  tool('zapier', { pageQualityStatus: 'archive' }),
];

async function main() {
  const selected = selectTopicTools(automation, fixtureTools, [category]);
  assert.deepEqual(
    selected.tools.map((item) => item.name),
    ['n8n', 'make'],
  );
  assert.equal(selected.toolCount, 2, 'Count must come from eligible matches, not broad category counts.');
  assert.equal(selected.indexable, true);
  assert.equal(selected.category, null, 'Virtual topic must not pretend to be a database category.');

  for (const changes of [
    { title: {} },
    { content: { en: ' ' } },
    { url: '' },
    { status: 'pending' },
    { pageQualityStatus: 'archive' },
  ]) {
    assert.equal(selectTopicTools(automation, [tool('n8n', changes as Partial<Tool>)], [category]).indexable, false);
  }
  assert.equal(selectTopicTools(automation, [tool('n8n'), tool('n8n')], [category]).toolCount, 1);
  assert.equal(selectTopicTools(automation, [], [category]).indexable, false);
  assert.equal(selectTopicTools(automation, [tool('unrelated-productivity')], [category]).indexable, false);
  assert.equal(selectTopicTools(getTopListTopic('ai-productivity-tools')!, fixtureTools, [category]).toolCount, 3);
  const many = Array.from({ length: 12 }, (_, i) => tool(`tool-${i}`));
  const physical = selectTopicTools(getTopListTopic('ai-productivity-tools')!, many, [category]);
  assert.equal(physical.tools.length, 8);
  assert.equal(physical.toolCount, 12);
  assert.equal(getTopListTopic('unknown'), null);
  for (const topic of topListTopics.filter((item) =>
    ['automation', 'developer-tools', 'ecommerce', 'marketing', 'web3', 'voice', 'video', 'research'].includes(
      item.categorySlug,
    ),
  )) {
    assert(TOPIC_TOOL_NAMES[topic.key]?.length, `${topic.key}: virtual topic lacks an explicit source.`);
  }

  const checkedAt = getEditorialReviewRecord('best-topic-template').reviewedAt;
  for (const locale of ['en', 'cn']) {
    const html = renderToStaticMarkup(
      React.createElement(GuideEvidencePanel, {
        locale,
        checkedAt,
        checkedAtLabel: 'Template reviewed',
        scope: 'Shared template only',
        items: [],
      }),
    );
    assert(html.includes(checkedAt));
    assert(!html.includes('2026-07-15'));
    const undated = renderToStaticMarkup(
      React.createElement(GuideEvidencePanel, { locale, scope: 'Undated', items: [] }),
    );
    assert(
      !/\d{4}-\d{2}-\d{2}|Last checked|最近检查/.test(undated),
      'Missing evidence must not acquire a default review date.',
    );
  }
  const source = fs.readFileSync('app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx', 'utf8');
  assert.match(source, /<GuideEvidencePanel\s+locale=\{locale\}\s+checkedAt=\{checkedAt\}/);
  assert.match(source, /indexable: Boolean\(topicData\?\.indexable\)/);
  assert.match(source, /throw error;/, 'Do not turn a database outage or notFound into a successful fallback page.');
  assert.match(
    fs.readFileSync('app/sitemap.ts', 'utf8'),
    /export const dynamic = 'force-dynamic'/,
    'Sitemap must refresh data-dependent topic eligibility.',
  );
  assert(!/转化|pure traffic|routes traffic|submission paths|Compare then submit|keep clicking/i.test(source));
  for (const topic of topListTopics) assert(!/submission|conversion|pricing path/i.test(topic.nextStep));

  const paths = [
    '/',
    '/explore',
    '/guides',
    '/best-ai-tools',
    ...Object.keys(STATIC_PAGE_EDITS),
    '/best-ai-tools/ai-automation-tools',
  ];
  for (const path of paths) {
    const date = getStaticPageLastModified(path);
    assert(!Number.isNaN(date.getTime()));
    assert(date.getTime() <= Date.now(), `${path}: lastmod is in the future.`);
    assert.deepEqual(date, getStaticPageLastModified(path));
  }
  for (const record of [...Object.values(STATIC_PAGE_EDITS), BEST_TOPIC_EDIT]) assert(record.evidence.length > 30);
  assert.throws(() => getStaticPageLastModified('/unregistered-page'), /Missing sitemap edit record/);

  // Exercise the real catalog and sitemap against a read-only database fixture.
  // No connection or writes are allowed in this test.
  process.env.POSTGRES_URL = 'postgres://fixture:fixture@localhost/fixture';
  let fail = false;
  let incomplete = false;
  Pool.prototype.query = (async (sql: string) => {
    assert.match(sql.trim(), /^SELECT\b/);
    if (fail) throw new Error('Fixture database unavailable');
    if (sql.includes('COUNT(*) as total'))
      return { rows: [{ total: String(fixtureTools.length + (incomplete ? 1 : 0)) }] };
    if (sql.includes('FROM tools')) return { rows: fixtureTools };
    if (sql.includes('FROM categories')) return { rows: [category] };
    throw new Error(`Unexpected SQL: ${sql}`);
  }) as typeof Pool.prototype.query;
  const catalog = await loadTopicCatalog();
  const entries = await sitemap();
  for (const topic of topListTopics) {
    const data = catalog.topics.get(topic.key)!;
    for (const locale of ['en', 'cn']) {
      const path = `${locale === 'cn' ? '/cn' : ''}/best-ai-tools/${topic.key}`;
      assert.equal(
        entries.some((entry) => new URL(entry.url).pathname === path),
        data.indexable,
        `${path}: sitemap disagrees with candidates.`,
      );
      const metadata = buildLocalizedPageMetadata({
        locale,
        path,
        title: topic.title,
        description: topic.description,
        indexable: data.indexable,
      });
      assert.equal(Boolean(metadata.alternates?.languages), data.indexable);
    }
  }
  const statics = entries.filter((entry) => !/\/(ai|categories)\//.test(new URL(entry.url).pathname));
  for (const entry of statics) {
    const path = new URL(entry.url).pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
    assert.deepEqual(entry.lastModified, getStaticPageLastModified(path));
  }
  incomplete = true;
  await assert.rejects(loadTopicCatalog, /incomplete/);
  incomplete = false;
  fail = true;
  await assert.rejects(sitemap, /Fixture database unavailable/, 'Outages must fail, not publish an empty sitemap.');
  console.log('Topic consistency passed: real matches, empty/outage gates, dates, copy, and stable sitemap lastmod.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

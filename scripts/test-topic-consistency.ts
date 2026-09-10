import React from 'react';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Pool } from 'pg';
import { renderToStaticMarkup } from 'react-dom/server';

import sitemap from '../app/sitemap';
import GuideEvidencePanel from '../components/guides/GuideEvidencePanel';
import { MIN_TOPIC_CANDIDATES, TOPIC_TOOL_NAMES } from '../lib/data/topicToolSources';
import { getTopListTopic, topListTopics } from '../lib/data/topLists';
import { getEditorialReviewRecord } from '../lib/seo/contentReviewDates';
import { buildLocalizedPageMetadata } from '../lib/seo/metadata';
import { getSourceLastModified } from '../lib/seo/sitemapDates';
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
  tool('make', {
    createdAt: undefined,
    updatedAt: undefined,
    pageQualityStatus: 'continue_index',
    content: { en: 'Automation workflow details. '.repeat(8) },
    detail: { en: 'Verified workflow capabilities and limits. '.repeat(12) },
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/screenshot.png',
    pricing: 'freemium',
    tags: ['automation'],
  }),
  tool('unrelated-productivity'),
  tool('pipedream', { status: 'draft' }),
  tool('zapier', { pageQualityStatus: 'archive' }),
];

async function main() {
  const selected = selectTopicTools(automation, fixtureTools);
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
    assert.equal(selectTopicTools(automation, [tool('n8n', changes as Partial<Tool>)]).indexable, false);
  }
  assert.equal(selectTopicTools(automation, [tool('n8n'), tool('n8n')]).toolCount, 1);
  assert.equal(selectTopicTools(automation, []).indexable, false);
  assert.equal(selectTopicTools(automation, [tool('unrelated-productivity')]).indexable, false);
  assert.equal(selectTopicTools(getTopListTopic('ai-productivity-tools')!, fixtureTools).toolCount, 2);
  assert.equal(
    selectTopicTools(automation, [tool('n8n')]).indexable,
    false,
    'One accurate candidate is not a comparison shortlist.',
  );
  assert.equal(MIN_TOPIC_CANDIDATES, 2);
  assert.equal(getTopListTopic('unknown'), null);
  assert.deepEqual(Object.keys(TOPIC_TOOL_NAMES).sort(), topListTopics.map((topic) => topic.key).sort());
  for (const topic of topListTopics) {
    // Adversarial same-category records: every one used to enter generic lists.
    const noise = [
      'unrelated-productivity',
      'otter-ai',
      'sora',
      'adobe',
      'salesforce_einstein',
      'openai',
      'woy-ai',
    ].map((name) => tool(name));
    const roster = TOPIC_TOOL_NAMES[topic.key].map((name) => tool(name));
    const result = selectTopicTools(topic, [...roster, ...noise]);
    assert.deepEqual(
      result.tools.map((item) => item.name).sort(),
      [...TOPIC_TOOL_NAMES[topic.key]].sort(),
      `${topic.key}: category noise entered roster.`,
    );
    assert.equal(result.indexable, roster.length >= 2, `${topic.key}: readiness`);
    assert.equal(
      selectTopicTools(topic, [tool('unrelated-productivity')]).indexable,
      false,
      `${topic.key}: generic fallback`,
    );
  }
  const forbidden: Record<string, string[]> = {
    'ai-student-tools': ['fathom', 'otter-ai', 'make', 'salesforce_einstein'],
    'ai-meeting-notes-tools': ['gemini', 'notion', 'perplexity', 'shutterstock'],
    'ai-lead-generation-tools': ['gemini', 'notebooklm', 'fathom', 'gamma'],
    'ai-image-tools': ['sora', 'synthesia', 'viggle', 'runway', 'adobe'],
    'ai-chatbot-tools': ['otter-ai', 'fathom'],
    'ai-seo-tools': ['deepl', 'claude', 'gemini'],
    'ai-writing-tools': ['otter-ai', 'runway', 'synthesia'],
  };
  for (const [key, names] of Object.entries(forbidden)) {
    assert.equal(
      selectTopicTools(
        getTopListTopic(key)!,
        names.map((name) => tool(name)),
      ).toolCount,
      0,
      `${key}: known cross-topic mismatch`,
    );
  }
  assert.deepEqual(TOPIC_TOOL_NAMES['ai-meeting-notes-tools'], ['otter-ai', 'fathom']);
  assert.deepEqual(TOPIC_TOOL_NAMES['ai-student-tools'], ['notebooklm', 'consensus', 'gemini']);
  assert.deepEqual(TOPIC_TOOL_NAMES['ai-lead-generation-tools'], []);
  const unregistered = { ...automation, key: 'unregistered-topic' } as typeof automation;
  assert.equal(selectTopicTools(unregistered, fixtureTools).toolCount, 0);

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
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.deepEqual(
    await sitemap(),
    entries,
    'Same-process regeneration must remain completely stable with missing source timestamps.',
  );
  const missingToolDates = entries.filter((entry) => new URL(entry.url).pathname.endsWith('/ai/make'));
  assert.equal(missingToolDates.length, 2);
  assert(missingToolDates.every((entry) => entry.lastModified === undefined));
  const missingCategoryDates = entries.filter((entry) =>
    new URL(entry.url).pathname.includes('/categories/productivity'),
  );
  assert.equal(missingCategoryDates.length, 2);
  assert(missingCategoryDates.every((entry) => entry.lastModified === undefined));
  assert.equal(getSourceLastModified(undefined, null, new Date('invalid')), undefined);
  assert.deepEqual(getSourceLastModified(new Date('invalid'), '2026-07-18'), new Date('2026-07-18'));
  assert.equal(getStaticPageLastModified('/guides/ai-video-tools').toISOString().slice(0, 10), '2026-07-18');
  assert.equal(getStaticPageLastModified('/guides/ai-tools-for-voice').toISOString().slice(0, 10), '2026-07-18');
  assert.equal(
    getStaticPageLastModified('/best-ai-tools').toISOString().slice(0, 10),
    getEditorialReviewRecord('best-index').reviewedAt,
  );
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

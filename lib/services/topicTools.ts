import { cache } from 'react';

import { SAFETY_TOOL_SLUGS } from '@/lib/config/safetyToolReviews';
import { TOPIC_TOOL_NAMES } from '@/lib/data/topicToolSources';
import { topListTopics, type TopListTopicConfig } from '@/lib/data/topLists';
import { getAllCategories, type Category } from '@/lib/services/categories';
import { getTools, type Tool } from '@/lib/services/tools';

function hasText(value: Record<string, string> | null | undefined): boolean {
  return Boolean(value && Object.values(value).some((text) => typeof text === 'string' && text.trim()));
}

export function isEligibleTopicTool(tool: Tool): boolean {
  return Boolean(
    tool.id &&
      tool.name &&
      /^https?:\/\//.test(tool.url) &&
      hasText(tool.title) &&
      hasText(tool.content) &&
      tool.status === 'published' &&
      tool.pageQualityStatus !== 'archive' &&
      !SAFETY_TOOL_SLUGS.some((name) => name === tool.name),
  );
}

export function selectTopicTools(topic: TopListTopicConfig, tools: Tool[], categories: Category[]) {
  const names = TOPIC_TOOL_NAMES[topic.key];
  const category = categories.find((item) => item.slug === topic.categorySlug) || null;
  const seen = new Set<string>();
  const candidates = tools.filter((tool) => {
    const matches = names ? names.includes(tool.name) : Boolean(category && tool.categoryId === category.id);
    if (!matches || !isEligibleTopicTool(tool) || seen.has(tool.id)) return false;
    seen.add(tool.id);
    return true;
  });
  return {
    category: names ? null : category,
    tools: candidates.slice(0, 8),
    toolCount: candidates.length,
    indexable: candidates.length > 0,
  };
}

// One request snapshot for metadata and page rendering. Database failure must
// propagate, so a temporary outage cannot publish a successful empty sitemap.
export async function loadTopicCatalog() {
  const [result, categories] = await Promise.all([
    getTools({ status: 'published' }, { page: 1, pageSize: 10000 }, 'popular'),
    getAllCategories(),
  ]);
  if (result.total > result.data.length) throw new Error('Topic catalog is incomplete; pagination required.');
  return {
    tools: result.data,
    topics: new Map(topListTopics.map((topic) => [topic.key, selectTopicTools(topic, result.data, categories)])),
  };
}

// Next's server React provides request memoization; standalone audit scripts
// use React 18 and deliberately read a fresh snapshot instead.
export const getTopicCatalog = typeof cache === 'function' ? cache(loadTopicCatalog) : loadTopicCatalog;

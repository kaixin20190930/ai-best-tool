export type TopListTopicKey =
  | 'ai-api-observability-tools'
  | 'ai-agent-tools'
  | 'ai-coding-tools'
  | 'ai-model-routing-tools'
  | 'ai-video-tools'
  | 'ai-research-tools'
  | 'ai-writing-tools';

export type TopListTopicConfig = {
  key: TopListTopicKey;
  categorySlug: string;
  title: string;
  description: string;
  summary: string;
  ctaLabel: string;
  ctaDescription: string;
  guideHref: string;
  guideLabel: string;
  comparisonHref: string;
  comparisonLabel: string;
  nextStep: string;
};

export const topListTopics: TopListTopicConfig[] = [
  {
    key: 'ai-api-observability-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI API Observability Tools',
    description: 'The most useful tools for request logs, tracing, cost visibility, and quality monitoring.',
    summary: 'A practical shortlist for teams debugging real AI traffic, tracking costs, and improving production quality.',
    ctaLabel: 'Go to observability list',
    ctaDescription:
      'Use this list when the decision is about logs, traces, spend visibility, and production-quality feedback loops.',
    guideHref: '/guides/ai-tools-for-api-observability',
    guideLabel: 'Back to observability guide',
    comparisonHref: '/guides/ai-tools-for-api-observability-comparison',
    comparisonLabel: 'Compare observability tools',
    nextStep: 'Compare observability tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-agent-tools',
    categorySlug: 'automation',
    title: 'Best AI Agent Tools',
    description: 'The most useful tools for agent workflows, tool use, orchestration, and runtime control.',
    summary: 'A practical shortlist for teams building multi-step execution flows instead of one-off prompts.',
    ctaLabel: 'Go to agent list',
    ctaDescription:
      'Use this list when the decision is about agent orchestration, execution loops, tool calling, and production-ready control.',
    guideHref: '/guides/ai-tools-for-agents',
    guideLabel: 'Back to agent guide',
    comparisonHref: '/guides/ai-tools-for-agents-comparison',
    comparisonLabel: 'Compare agent tools',
    nextStep: 'Compare agent tools, inspect details, then move into submission or pricing.',
  },
  {
    key: 'ai-coding-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Coding Tools',
    description: 'The strongest coding assistants, editors, and developer workflow tools.',
    summary: 'A practical shortlist for people shipping code, reviewing code, or automating engineering work.',
    ctaLabel: 'Go to coding list',
    ctaDescription: 'Use this list when the decision is about debugging, editing, refactoring, or shipping faster.',
    guideHref: '/guides/ai-coding-tools',
    guideLabel: 'Back to coding guide',
    comparisonHref: '/guides/ai-coding-tools-comparison',
    comparisonLabel: 'Compare coding tools',
    nextStep: 'Compare coding tools, inspect product pages, then move into submission or pricing.',
  },
  {
    key: 'ai-model-routing-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Model Routing Tools',
    description: 'The most useful tools for multi-model access, fallbacks, routing strategy, and cost governance.',
    summary: 'A practical shortlist for teams choosing the right model gateway, routing layer, or fallback stack.',
    ctaLabel: 'Go to model routing list',
    ctaDescription:
      'Use this list when the decision is about model gateways, fallback controls, provider flexibility, and routing governance.',
    guideHref: '/guides/ai-tools-for-model-routing',
    guideLabel: 'Back to model routing guide',
    comparisonHref: '/guides/ai-tools-for-model-routing-comparison',
    comparisonLabel: 'Compare model routing tools',
    nextStep: 'Compare model routing tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-video-tools',
    categorySlug: 'video',
    title: 'Best AI Video Tools',
    description: 'The most useful AI video editors, generators, and production helpers.',
    summary: 'A focused shortlist for creators who need to produce, edit, or repurpose video faster.',
    ctaLabel: 'Go to video list',
    ctaDescription: 'Use this list when the next step is short-form production, editing speed, or content reuse.',
    guideHref: '/guides/ai-video-tools',
    guideLabel: 'Back to video guide',
    comparisonHref: '/guides/ai-video-tools-comparison',
    comparisonLabel: 'Compare video tools',
    nextStep: 'Compare video tools, inspect product pages, then move into submission or pricing.',
  },
  {
    key: 'ai-research-tools',
    categorySlug: 'research',
    title: 'Best AI Research Tools',
    description: 'The most useful tools for discovery, analysis, and source gathering.',
    summary: 'A decision-first shortlist for people comparing sources, validating claims, or building briefs.',
    ctaLabel: 'Go to research list',
    ctaDescription: 'Use this list when the decision is about depth, reliability, and synthesis speed.',
    guideHref: '/guides/ai-tools-for-research',
    guideLabel: 'Back to research guide',
    comparisonHref: '/guides/ai-tools-for-research-comparison',
    comparisonLabel: 'Compare research tools',
    nextStep: 'Compare research tools, inspect product pages, then move into submission or pricing.',
  },
  {
    key: 'ai-writing-tools',
    categorySlug: 'text-writing',
    title: 'Best AI Writing Tools',
    description: 'The strongest AI writing tools for drafting, editing, and workflow support.',
    summary: 'A practical shortlist for creators and teams who care about quality, speed, and review flow.',
    ctaLabel: 'Go to writing list',
    ctaDescription: 'Use this list when the decision is about drafting quality, editing friction, and team fit.',
    guideHref: '/guides/ai-writing-tools',
    guideLabel: 'Back to writing guide',
    comparisonHref: '/guides/ai-writing-tools-comparison',
    comparisonLabel: 'Compare writing tools',
    nextStep: 'Compare writing tools, inspect product pages, then move into submission or pricing.',
  },
];

export function getTopListTopic(key: string): TopListTopicConfig | null {
  return topListTopics.find((topic) => topic.key === key) || null;
}

export function getTopListTopicTitle(key: string): string {
  return getTopListTopic(key)?.title || 'Best AI Tools';
}

export function getTopListTopicDescription(key: string): string {
  return getTopListTopic(key)?.description || 'A focused shortlist of useful AI tools.';
}

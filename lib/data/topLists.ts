export type TopListTopicKey =
  | 'ai-api-observability-tools'
  | 'ai-agent-tools'
  | 'ai-coding-tools'
  | 'ai-code-review-tools'
  | 'ai-ecommerce-tools'
  | 'ai-evals-tools'
  | 'ai-lead-generation-tools'
  | 'ai-marketing-tools'
  | 'ai-model-routing-tools'
  | 'ai-prompt-testing-tools'
  | 'ai-sales-prospecting-tools'
  | 'ai-small-business-tools'
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
    key: 'ai-code-review-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Code Review Tools',
    description: 'The most useful tools for PR understanding, risk checks, review feedback, and team review workflows.',
    summary: 'A practical shortlist for teams trying to reduce review cost, surface risk faster, and keep feedback actionable.',
    ctaLabel: 'Go to code review list',
    ctaDescription:
      'Use this list when the decision is about PR review quality, change understanding, risk flags, and team feedback flow.',
    guideHref: '/guides/ai-tools-for-code-review',
    guideLabel: 'Back to code review guide',
    comparisonHref: '/guides/ai-tools-for-code-review-comparison',
    comparisonLabel: 'Compare code review tools',
    nextStep: 'Compare code review tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-ecommerce-tools',
    categorySlug: 'ecommerce',
    title: 'Best AI Ecommerce Tools',
    description: 'The most useful tools for product copy, merchandising, support, store operations, and conversion workflows.',
    summary: 'A practical shortlist for teams improving product pages, customer experience, and store operations without losing brand consistency.',
    ctaLabel: 'Go to ecommerce list',
    ctaDescription:
      'Use this list when the decision is about product content, support automation, merchandising, and ecommerce workflow fit.',
    guideHref: '/guides/ai-tools-for-ecommerce',
    guideLabel: 'Back to ecommerce guide',
    comparisonHref: '/guides/ai-tools-for-ecommerce-comparison',
    comparisonLabel: 'Compare ecommerce tools',
    nextStep: 'Compare ecommerce tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-evals-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Evals Tools',
    description: 'The most useful tools for output scoring, dataset evaluation, regression checks, and release acceptance.',
    summary: 'A practical shortlist for teams validating AI quality, comparing versions, and making release decisions with more confidence.',
    ctaLabel: 'Go to evals list',
    ctaDescription:
      'Use this list when the decision is about output validation, scoring systems, dataset review, and release acceptance workflow.',
    guideHref: '/guides/ai-tools-for-evals',
    guideLabel: 'Back to evals guide',
    comparisonHref: '/guides/ai-tools-for-evals-comparison',
    comparisonLabel: 'Compare evals tools',
    nextStep: 'Compare evals tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-lead-generation-tools',
    categorySlug: 'productivity',
    title: 'Best AI Lead Generation Tools',
    description: 'The most useful tools for list discovery, enrichment, filtering, and early lead qualification.',
    summary: 'A practical shortlist for teams trying to find better-fit buyers, clean lists faster, and improve downstream sales quality.',
    ctaLabel: 'Go to lead-gen list',
    ctaDescription:
      'Use this list when the decision is about finding leads, enriching data, filtering quality, and preparing cleaner handoffs into sales workflow.',
    guideHref: '/guides/ai-tools-for-lead-generation',
    guideLabel: 'Back to lead-gen guide',
    comparisonHref: '/guides/ai-tools-for-lead-generation-comparison',
    comparisonLabel: 'Compare lead generation tools',
    nextStep: 'Compare lead generation tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-marketing-tools',
    categorySlug: 'marketing',
    title: 'Best AI Marketing Tools',
    description: 'The most useful tools for ads, email, social content, growth workflows, and marketing operations.',
    summary: 'A practical shortlist for teams scaling campaigns, content, and channel execution without losing speed or brand consistency.',
    ctaLabel: 'Go to marketing list',
    ctaDescription:
      'Use this list when the decision is about campaign execution, channel coverage, batch content production, and marketing workflow fit.',
    guideHref: '/guides/ai-tools-for-marketing',
    guideLabel: 'Back to marketing guide',
    comparisonHref: '/guides/ai-tools-for-marketing-comparison',
    comparisonLabel: 'Compare marketing tools',
    nextStep: 'Compare marketing tools, inspect detail pages, then move into submission or pricing.',
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
    key: 'ai-prompt-testing-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Prompt Testing Tools',
    description: 'The most useful tools for prompt evaluation, A/B tests, regression checks, and validation workflows.',
    summary: 'A practical shortlist for teams comparing prompt versions, running evals, and validating quality before release.',
    ctaLabel: 'Go to prompt testing list',
    ctaDescription:
      'Use this list when the decision is about prompt experiments, version comparisons, regression checks, and evaluation workflow.',
    guideHref: '/guides/ai-tools-for-prompt-testing',
    guideLabel: 'Back to prompt testing guide',
    comparisonHref: '/guides/ai-tools-for-prompt-testing-comparison',
    comparisonLabel: 'Compare prompt testing tools',
    nextStep: 'Compare prompt testing tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-sales-prospecting-tools',
    categorySlug: 'productivity',
    title: 'Best AI Sales Prospecting Tools',
    description: 'The most useful tools for outreach prep, personalization, contact prioritization, and outbound workflow support.',
    summary: 'A practical shortlist for teams trying to contact the right buyers with stronger context, better openers, and steadier outbound flow.',
    ctaLabel: 'Go to prospecting list',
    ctaDescription:
      'Use this list when the decision is about outreach preparation, message personalization, prioritization, and prospecting workflow fit.',
    guideHref: '/guides/ai-tools-for-sales-prospecting',
    guideLabel: 'Back to sales prospecting guide',
    comparisonHref: '/guides/ai-tools-for-sales-prospecting-comparison',
    comparisonLabel: 'Compare sales prospecting tools',
    nextStep: 'Compare sales prospecting tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-small-business-tools',
    categorySlug: 'productivity',
    title: 'Best AI Small Business Tools',
    description: 'The most useful tools for small-team operations, customer support, content, automation, and everyday business workflows.',
    summary: 'A practical shortlist for teams that need to save time, reduce repetitive work, and run more of the business with fewer people.',
    ctaLabel: 'Go to small-business list',
    ctaDescription:
      'Use this list when the decision is about practical day-to-day workflow fit, team efficiency, support, and lightweight automation.',
    guideHref: '/guides/ai-tools-for-small-business',
    guideLabel: 'Back to small-business guide',
    comparisonHref: '/guides/ai-tools-for-small-business-comparison',
    comparisonLabel: 'Compare small-business tools',
    nextStep: 'Compare small-business tools, inspect detail pages, then move into submission or pricing.',
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

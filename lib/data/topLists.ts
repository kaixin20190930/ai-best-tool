export type TopListTopicKey =
  | 'ai-api-observability-tools'
  | 'ai-agency-tools'
  | 'ai-agent-tools'
  | 'ai-automation-tools'
  | 'ai-chatbot-tools'
  | 'ai-coding-tools'
  | 'ai-code-review-tools'
  | 'ai-content-creation-tools'
  | 'ai-creator-tools'
  | 'ai-ecommerce-tools'
  | 'ai-evals-tools'
  | 'ai-image-tools'
  | 'ai-lead-generation-tools'
  | 'ai-marketing-tools'
  | 'ai-meeting-notes-tools'
  | 'ai-model-routing-tools'
  | 'ai-note-taking-tools'
  | 'ai-productivity-tools'
  | 'ai-prompt-testing-tools'
  | 'ai-sales-prospecting-tools'
  | 'ai-small-business-tools'
  | 'ai-student-tools'
  | 'ai-web3-tools'
  | 'ai-voice-tools'
  | 'ai-video-tools'
  | 'ai-research-tools'
  | 'ai-seo-tools'
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
    key: 'ai-agency-tools',
    categorySlug: 'productivity',
    title: 'Best AI Agency Tools',
    description:
      'The most useful tools for agency delivery, client collaboration, content production, and service-team workflows.',
    summary:
      'A practical shortlist for teams that need to deliver client work faster, keep projects organized, and produce in volume without losing consistency.',
    ctaLabel: 'Go to agency list',
    ctaDescription:
      'Use this list when the decision is about delivery workflow, client separation, project coordination, and repeatable service output.',
    guideHref: '/guides/ai-tools-for-agencies',
    guideLabel: 'Back to agency guide',
    comparisonHref: '/guides/ai-tools-for-agencies-comparison',
    comparisonLabel: 'Compare agency tools',
    nextStep: 'Compare agency tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-api-observability-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI API Observability Tools',
    description: 'The most useful tools for request logs, tracing, cost visibility, and quality monitoring.',
    summary:
      'A practical shortlist for teams debugging real AI traffic, tracking costs, and improving production quality.',
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
    key: 'ai-automation-tools',
    categorySlug: 'automation',
    title: 'Best AI Automation Tools',
    description:
      'The most useful tools for workflow orchestration, repeatable tasks, trigger-based processes, and cross-tool automation.',
    summary:
      'A practical shortlist for people turning recurring manual work into reliable workflows that teams can actually maintain.',
    ctaLabel: 'Go to automation list',
    ctaDescription:
      'Use this list when the decision is about workflow repeatability, integrations, trigger logic, observability, and maintainability.',
    guideHref: '/guides/ai-tools-for-automation',
    guideLabel: 'Back to automation guide',
    comparisonHref: '/guides/ai-tools-for-automation-comparison',
    comparisonLabel: 'Compare automation tools',
    nextStep: 'Compare automation tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-chatbot-tools',
    categorySlug: 'chatbot',
    title: 'Best AI Chatbot Tools',
    description:
      'The most useful tools for Q&A, writing help, knowledge retrieval, collaboration, and daily chat workflows.',
    summary:
      'A practical shortlist for people who use chat as the main entry point for research, drafting, and team knowledge work.',
    ctaLabel: 'Go to chatbot list',
    ctaDescription:
      'Use this list when the decision is about answer quality, context length, knowledge integration, and chat workflow fit.',
    guideHref: '/guides/ai-chatbot-tools',
    guideLabel: 'Back to chatbot guide',
    comparisonHref: '/guides/ai-chatbot-tools-comparison',
    comparisonLabel: 'Compare chatbot tools',
    nextStep: 'Compare chatbot tools, inspect detail pages, then move into submission or pricing.',
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
    summary:
      'A practical shortlist for teams trying to reduce review cost, surface risk faster, and keep feedback actionable.',
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
    key: 'ai-content-creation-tools',
    categorySlug: 'productivity',
    title: 'Best AI Content Creation Tools',
    description: 'The most useful tools for scripts, thumbnails, rewriting, editing, and multi-channel publishing.',
    summary:
      'A practical shortlist for teams and creators who need to turn one idea into a repeatable content workflow across formats and channels.',
    ctaLabel: 'Go to content creation list',
    ctaDescription:
      'Use this list when the decision is about scripts, repurposing, publishing cadence, and keeping content production consistent.',
    guideHref: '/guides/ai-tools-for-content-creation',
    guideLabel: 'Back to content creation guide',
    comparisonHref: '/guides/ai-tools-for-content-creation-comparison',
    comparisonLabel: 'Compare content creation tools',
    nextStep: 'Compare content creation tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-creator-tools',
    categorySlug: 'productivity',
    title: 'Best AI Creator Tools',
    description:
      'The most useful tools for content planning, scripting, thumbnails, editing, repurposing, and creator workflows.',
    summary:
      'A practical shortlist for creators who need to publish more consistently, reuse content faster, and keep output quality high.',
    ctaLabel: 'Go to creator list',
    ctaDescription:
      'Use this list when the decision is about content workflow, repurposing speed, batch publishing, and creator-tool fit.',
    guideHref: '/guides/ai-tools-for-creators',
    guideLabel: 'Back to creator guide',
    comparisonHref: '/guides/ai-tools-for-creators-comparison',
    comparisonLabel: 'Compare creator tools',
    nextStep: 'Compare creator tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-ecommerce-tools',
    categorySlug: 'ecommerce',
    title: 'Best AI Ecommerce Tools',
    description:
      'The most useful tools for product copy, merchandising, support, store operations, and conversion workflows.',
    summary:
      'A practical shortlist for teams improving product pages, customer experience, and store operations without losing brand consistency.',
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
    description:
      'The most useful tools for output scoring, dataset evaluation, regression checks, and release acceptance.',
    summary:
      'A practical shortlist for teams validating AI quality, comparing versions, and making release decisions with more confidence.',
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
    key: 'ai-image-tools',
    categorySlug: 'design-art',
    title: 'Best AI Image Tools',
    description:
      'The most useful tools for image generation, editing, background removal, design assets, and creative workflows.',
    summary:
      'A practical shortlist for people creating visual assets, refining existing images, and scaling creative output with more control.',
    ctaLabel: 'Go to image list',
    ctaDescription:
      'Use this list when the decision is about generation quality, editing control, resolution, licensing, and creative workflow fit.',
    guideHref: '/guides/ai-image-tools',
    guideLabel: 'Back to image guide',
    comparisonHref: '/guides/ai-image-tools-comparison',
    comparisonLabel: 'Compare image tools',
    nextStep: 'Compare image tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-lead-generation-tools',
    categorySlug: 'productivity',
    title: 'Best AI Lead Generation Tools',
    description: 'The most useful tools for list discovery, enrichment, filtering, and early lead qualification.',
    summary:
      'A practical shortlist for teams trying to find better-fit buyers, clean lists faster, and improve downstream sales quality.',
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
    summary:
      'A practical shortlist for teams scaling campaigns, content, and channel execution without losing speed or brand consistency.',
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
    key: 'ai-meeting-notes-tools',
    categorySlug: 'productivity',
    title: 'Best AI Meeting Notes Tools',
    description:
      'The most useful tools for meeting transcription, note cleanup, action items, and follow-up workflows.',
    summary:
      'A practical shortlist for teams turning meetings into searchable notes, action lists, and cleaner follow-through.',
    ctaLabel: 'Go to meeting notes list',
    ctaDescription:
      'Use this list when the decision is about transcription quality, summary cleanup, action extraction, and team follow-up fit.',
    guideHref: '/guides/ai-tools-for-meeting-notes',
    guideLabel: 'Back to meeting notes guide',
    comparisonHref: '/guides/ai-tools-for-meeting-notes-comparison',
    comparisonLabel: 'Compare meeting notes tools',
    nextStep: 'Compare meeting notes tools, inspect detail pages, then move into submission or pricing.',
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
    key: 'ai-note-taking-tools',
    categorySlug: 'productivity',
    title: 'Best AI Note Taking Tools',
    description:
      'The most useful tools for meeting capture, idea logging, searchable notes, and knowledge organization.',
    summary: 'A practical shortlist for people turning meetings, notes, and scattered inputs into reusable knowledge.',
    ctaLabel: 'Go to note taking list',
    ctaDescription:
      'Use this list when the decision is about capture speed, summaries, search, exports, and long-term knowledge workflow fit.',
    guideHref: '/guides/ai-note-taking-tools',
    guideLabel: 'Back to note taking guide',
    comparisonHref: '/guides/ai-note-taking-tools-comparison',
    comparisonLabel: 'Compare note taking tools',
    nextStep: 'Compare note taking tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-productivity-tools',
    categorySlug: 'productivity',
    title: 'Best AI Productivity Tools',
    description:
      'The most useful tools for daily efficiency, task management, knowledge work, collaboration, and lightweight automation.',
    summary:
      'A practical shortlist for people trying to reduce repetitive work, keep information organized, and move faster across everyday workflows.',
    ctaLabel: 'Go to productivity list',
    ctaDescription:
      'Use this list when the decision is about workflow fit, collaboration depth, automation potential, and long-term daily usefulness.',
    guideHref: '/guides/ai-productivity-tools',
    guideLabel: 'Back to productivity guide',
    comparisonHref: '/guides/ai-productivity-tools-comparison',
    comparisonLabel: 'Compare productivity tools',
    nextStep: 'Compare productivity tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-prompt-testing-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Prompt Testing Tools',
    description: 'The most useful tools for prompt evaluation, A/B tests, regression checks, and validation workflows.',
    summary:
      'A practical shortlist for teams comparing prompt versions, running evals, and validating quality before release.',
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
    description:
      'The most useful tools for outreach prep, personalization, contact prioritization, and outbound workflow support.',
    summary:
      'A practical shortlist for teams trying to contact the right buyers with stronger context, better openers, and steadier outbound flow.',
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
    description:
      'The most useful tools for small-team operations, customer support, content, automation, and everyday business workflows.',
    summary:
      'A practical shortlist for teams that need to save time, reduce repetitive work, and run more of the business with fewer people.',
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
    key: 'ai-student-tools',
    categorySlug: 'productivity',
    title: 'Best AI Student Tools',
    description:
      'The most useful tools for learning, writing, summarizing, note organization, and study collaboration.',
    summary:
      'A practical shortlist for students who want to study faster, organize information better, and reduce friction in everyday schoolwork.',
    ctaLabel: 'Go to student list',
    ctaDescription:
      'Use this list when the decision is about study workflows, writing support, note organization, citations, and affordability.',
    guideHref: '/guides/ai-tools-for-students',
    guideLabel: 'Back to student guide',
    comparisonHref: '/guides/ai-tools-for-students-comparison',
    comparisonLabel: 'Compare student tools',
    nextStep: 'Compare student tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-web3-tools',
    categorySlug: 'web3',
    title: 'Best AI Web3 Tools',
    description:
      'The most useful tools for on-chain analysis, wallet monitoring, protocol research, alerts, and Web3 data workflows.',
    summary:
      'A practical shortlist for teams and individuals working with wallets, DeFi protocols, token flows, and crypto research workflows.',
    ctaLabel: 'Go to Web3 list',
    ctaDescription:
      'Use this list when the decision is about on-chain visibility, wallet tracking, protocol research, alerts, and Web3 workflow fit.',
    guideHref: '/guides/ai-tools-for-web3',
    guideLabel: 'Back to Web3 guide',
    comparisonHref: '/guides/ai-tools-for-web3-comparison',
    comparisonLabel: 'Compare Web3 tools',
    nextStep: 'Compare Web3 tools, inspect detail pages, then move into submission or pricing.',
  },
  {
    key: 'ai-voice-tools',
    categorySlug: 'voice',
    title: 'Best AI Voice Tools',
    description:
      'The most useful tools for voice synthesis, transcription, dubbing, meeting capture, and conversational voice.',
    summary:
      'A practical shortlist for teams choosing between speech generation, transcription accuracy, and product-grade voice workflows.',
    ctaLabel: 'Go to voice list',
    ctaDescription:
      'Use this list when the decision is about voice quality, language coverage, latency, transcription accuracy, and workflow fit.',
    guideHref: '/guides/ai-tools-for-voice',
    guideLabel: 'Back to voice guide',
    comparisonHref: '/guides/ai-tools-for-voice-comparison',
    comparisonLabel: 'Compare voice tools',
    nextStep: 'Compare voice tools, inspect detail pages, then move into submission or pricing.',
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
    key: 'ai-seo-tools',
    categorySlug: 'text-writing',
    title: 'Best AI SEO Tools',
    description:
      'The most useful tools for keyword research, content briefs, optimization workflows, and rank tracking.',
    summary:
      'A practical shortlist for teams growing search traffic through research, content planning, and repeatable SEO execution.',
    ctaLabel: 'Go to SEO list',
    ctaDescription:
      'Use this list when the decision is about keyword coverage, content optimization, SERP workflow fit, and long-term SEO execution.',
    guideHref: '/guides/ai-seo-tools',
    guideLabel: 'Back to SEO guide',
    comparisonHref: '/guides/ai-seo-tools-comparison',
    comparisonLabel: 'Compare SEO tools',
    nextStep: 'Compare SEO tools, inspect detail pages, then move into submission or pricing.',
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

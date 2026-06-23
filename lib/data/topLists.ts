export type TopListTopicKey = 'ai-coding-tools' | 'ai-video-tools' | 'ai-research-tools' | 'ai-writing-tools';

export type TopListTopicConfig = {
  key: TopListTopicKey;
  categorySlug: string;
  title: string;
  description: string;
  summary: string;
  ctaLabel: string;
  ctaDescription: string;
};

export const topListTopics: TopListTopicConfig[] = [
  {
    key: 'ai-coding-tools',
    categorySlug: 'developer-tools',
    title: 'Best AI Coding Tools',
    description: 'The strongest coding assistants, editors, and developer workflow tools.',
    summary: 'A practical shortlist for people shipping code, reviewing code, or automating engineering work.',
    ctaLabel: 'Go to coding list',
    ctaDescription: 'Use this list when the decision is about debugging, editing, refactoring, or shipping faster.',
  },
  {
    key: 'ai-video-tools',
    categorySlug: 'video',
    title: 'Best AI Video Tools',
    description: 'The most useful AI video editors, generators, and production helpers.',
    summary: 'A focused shortlist for creators who need to produce, edit, or repurpose video faster.',
    ctaLabel: 'Go to video list',
    ctaDescription: 'Use this list when the next step is short-form production, editing speed, or content reuse.',
  },
  {
    key: 'ai-research-tools',
    categorySlug: 'research',
    title: 'Best AI Research Tools',
    description: 'The most useful tools for discovery, analysis, and source gathering.',
    summary: 'A decision-first shortlist for people comparing sources, validating claims, or building briefs.',
    ctaLabel: 'Go to research list',
    ctaDescription: 'Use this list when the decision is about depth, reliability, and synthesis speed.',
  },
  {
    key: 'ai-writing-tools',
    categorySlug: 'text-writing',
    title: 'Best AI Writing Tools',
    description: 'The strongest AI writing tools for drafting, editing, and workflow support.',
    summary: 'A practical shortlist for creators and teams who care about quality, speed, and review flow.',
    ctaLabel: 'Go to writing list',
    ctaDescription: 'Use this list when the decision is about drafting quality, editing friction, and team fit.',
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

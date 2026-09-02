export function isComparisonGuideHref(href: string): boolean {
  return href.includes('-comparison');
}

export const INDEXABLE_GUIDE_PATHS = new Set([
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/best-free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-seo-tools',
  '/guides/ai-video-tools',
  '/guides/ai-image-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-chatbot-tools',
  '/guides/ai-productivity-tools',
  '/guides/ai-tools-for-research',
  '/guides/ai-tools-for-developers',
  '/guides/ai-tools-for-automation',
  '/guides/ai-tools-for-web3',
  '/guides/ai-tools-for-marketing',
  '/guides/ai-tools-for-sales',
  '/guides/ai-tools-for-voice',
  '/guides/ai-note-taking-tools',
]);

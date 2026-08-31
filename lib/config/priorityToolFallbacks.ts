export interface PriorityToolFallbackProfile {
  categoryName: string;
  tagName: string;
  title: string;
  url: string;
}

// These are existing, evidence-backed opportunity pages. This fallback only
// keeps them readable when an older database import has no matching tool row.
export const PRIORITY_TOOL_FALLBACK_PROFILES: Record<string, PriorityToolFallbackProfile> = {
  anthropic: {
    title: 'Anthropic',
    url: 'https://www.anthropic.com',
    categoryName: 'AI Models',
    tagName: 'Claude, AI models',
  },
  deepl: {
    title: 'DeepL',
    url: 'https://www.deepl.com',
    categoryName: 'Productivity',
    tagName: 'Translation, writing',
  },
  gamma: {
    title: 'Gamma',
    url: 'https://gamma.app',
    categoryName: 'Productivity',
    tagName: 'Presentations, documents',
  },
  lindy: { title: 'Lindy', url: 'https://www.lindy.ai', categoryName: 'Automation', tagName: 'AI agents, automation' },
  fathom: {
    title: 'Fathom',
    url: 'https://fathom.video',
    categoryName: 'Productivity',
    tagName: 'Meetings, transcription',
  },
  'the-graph': {
    title: 'The Graph',
    url: 'https://thegraph.com',
    categoryName: 'Web3',
    tagName: 'Blockchain data, APIs',
  },
  dune: { title: 'Dune', url: 'https://dune.com', categoryName: 'Web3', tagName: 'On-chain analytics, SQL' },
  notta: {
    title: 'Notta',
    url: 'https://www.notta.ai',
    categoryName: 'Productivity',
    tagName: 'Transcription, meetings',
  },
  runway: { title: 'Runway', url: 'https://runwayml.com', categoryName: 'Video', tagName: 'AI video, creative tools' },
  defillama: {
    title: 'DefiLlama',
    url: 'https://defillama.com',
    categoryName: 'Web3',
    tagName: 'DeFi analytics, data',
  },
  chatgpt: { title: 'ChatGPT', url: 'https://chatgpt.com', categoryName: 'Chatbot', tagName: 'AI assistant, research' },
  claude: { title: 'Claude', url: 'https://claude.ai', categoryName: 'Chatbot', tagName: 'AI assistant, reasoning' },
  cursor: {
    title: 'Cursor',
    url: 'https://cursor.com',
    categoryName: 'Developer Tools',
    tagName: 'AI coding, code editor',
  },
  pipedream: {
    title: 'Pipedream',
    url: 'https://pipedream.com',
    categoryName: 'Automation',
    tagName: 'Workflows, APIs',
  },
  perplexity: {
    title: 'Perplexity',
    url: 'https://www.perplexity.ai',
    categoryName: 'Research',
    tagName: 'AI search, research',
  },
  n8n: { title: 'n8n', url: 'https://n8n.io', categoryName: 'Automation', tagName: 'Workflows, integrations' },
  make: { title: 'Make', url: 'https://www.make.com', categoryName: 'Automation', tagName: 'Workflows, integrations' },
  openrouter: {
    title: 'OpenRouter',
    url: 'https://openrouter.ai',
    categoryName: 'Developer Tools',
    tagName: 'Models, APIs',
  },
  grammarly: {
    title: 'Grammarly',
    url: 'https://www.grammarly.com',
    categoryName: 'Writing',
    tagName: 'Writing, editing',
  },
};

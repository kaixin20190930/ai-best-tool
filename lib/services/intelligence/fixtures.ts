export interface IntelligenceProductFixture {
  key: string;
  name: string;
  websiteUrl: string;
  expectedPageTypes: string[];
}

export interface DistributionTargetFixture {
  key: string;
  name: string;
  channelType: 'directory' | 'alternative' | 'startup' | 'community' | 'github' | 'reddit';
  homepageUrl: string;
  seedUrl?: string;
}

// Public calibration products exercise different pricing, documentation, and
// product structures. They are not automatically imported or published.
export const INTELLIGENCE_PRODUCT_FIXTURES: IntelligenceProductFixture[] = [
  {
    key: 'ai-best-tool',
    name: 'AI Best Tool',
    websiteUrl: 'https://aibesttool.com',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    websiteUrl: 'https://chatgpt.com',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'claude',
    name: 'Claude',
    websiteUrl: 'https://claude.ai',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'cursor',
    name: 'Cursor',
    websiteUrl: 'https://cursor.com',
    expectedPageTypes: ['homepage', 'pricing', 'documentation', 'changelog'],
  },
  {
    key: 'perplexity',
    name: 'Perplexity',
    websiteUrl: 'https://www.perplexity.ai',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'fathom',
    name: 'Fathom',
    websiteUrl: 'https://fathom.video',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'pipedream',
    name: 'Pipedream',
    websiteUrl: 'https://pipedream.com',
    expectedPageTypes: ['homepage', 'pricing', 'documentation'],
  },
  {
    key: 'lindy',
    name: 'Lindy',
    websiteUrl: 'https://www.lindy.ai',
    expectedPageTypes: ['homepage', 'pricing', 'product'],
  },
  {
    key: 'the-graph',
    name: 'The Graph',
    websiteUrl: 'https://thegraph.com',
    expectedPageTypes: ['homepage', 'documentation', 'product'],
  },
  {
    key: 'github-copilot',
    name: 'GitHub Copilot',
    websiteUrl: 'https://github.com/features/copilot',
    expectedPageTypes: ['homepage', 'pricing', 'documentation'],
  },
];

// Target URLs are starting points for the analyzer. The analyzer must verify
// current pricing, account requirements, and submission rules before use.
export const DISTRIBUTION_TARGET_FIXTURES: DistributionTargetFixture[] = [
  {
    key: 'futurepedia',
    name: 'Futurepedia',
    channelType: 'directory',
    homepageUrl: 'https://www.futurepedia.io',
    seedUrl: 'https://www.futurepedia.io/submit-tool',
  },
  {
    key: 'theres-an-ai-for-that',
    name: "There's An AI For That",
    channelType: 'directory',
    homepageUrl: 'https://theresanaiforthat.com',
  },
  {
    key: 'saashub',
    name: 'SaaSHub',
    channelType: 'alternative',
    homepageUrl: 'https://www.saashub.com',
    seedUrl: 'https://www.saashub.com/submit',
  },
  {
    key: 'alternativeto',
    name: 'AlternativeTo',
    channelType: 'alternative',
    homepageUrl: 'https://alternativeto.net',
    seedUrl: 'https://alternativeto.net/faq/',
  },
  {
    key: 'product-hunt',
    name: 'Product Hunt',
    channelType: 'startup',
    homepageUrl: 'https://www.producthunt.com',
    seedUrl: 'https://www.producthunt.com/launch',
  },
  {
    key: 'betalist',
    name: 'BetaList',
    channelType: 'startup',
    homepageUrl: 'https://betalist.com',
    seedUrl: 'https://betalist.com/criteria',
  },
  {
    key: 'hacker-news',
    name: 'Hacker News',
    channelType: 'community',
    homepageUrl: 'https://news.ycombinator.com',
    seedUrl: 'https://news.ycombinator.com/showhn.html',
  },
  {
    key: 'indie-hackers',
    name: 'Indie Hackers',
    channelType: 'community',
    homepageUrl: 'https://www.indiehackers.com',
  },
  {
    key: 'github',
    name: 'GitHub',
    channelType: 'github',
    homepageUrl: 'https://github.com',
  },
  {
    key: 'reddit',
    name: 'Reddit',
    channelType: 'reddit',
    homepageUrl: 'https://www.reddit.com',
  },
];

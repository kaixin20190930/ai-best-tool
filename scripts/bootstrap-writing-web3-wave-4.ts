/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

import { getPool } from '@/db/neon/client';

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

type ToolSeed = {
  name: string;
  title: string;
  url: string;
  categorySlug: 'text-writing' | 'web3';
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  content: {
    en: string;
    zh: string;
  };
  detail: {
    en: string;
    zh: string;
  };
  useCases: {
    en: string[];
    zh: string[];
  };
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: {
      en: string[];
      zh: string[];
    };
    notIdealFor: {
      en: string[];
      zh: string[];
    };
  };
  editorialSummary: {
    en: string;
    zh: string;
  };
  trustNote: {
    en: string;
    zh: string;
  };
  media: {
    accent: string;
    accentSoft: string;
    accentStrong: string;
    surface: string;
    badge: string;
    summary: string;
    logoText: string;
  };
};

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const TAGS: TagSeed[] = [
  { slug: 'writing', en: 'Writing', zh: '写作' },
  { slug: 'seo', en: 'SEO', zh: 'SEO' },
  { slug: 'content-strategy', en: 'Content Strategy', zh: '内容策略' },
  { slug: 'copywriting', en: 'Copywriting', zh: '文案写作' },
  { slug: 'editing', en: 'Editing', zh: '编辑' },
  { slug: 'productivity', en: 'Productivity', zh: '效率' },
  { slug: 'web3', en: 'Web3', zh: 'Web3' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'analytics', en: 'Analytics', zh: '分析' },
  { slug: 'wallet-monitoring', en: 'Wallet Monitoring', zh: '钱包监控' },
  { slug: 'portfolio', en: 'Portfolio', zh: '投资组合' },
  { slug: 'visualization', en: 'Visualization', zh: '可视化' },
  { slug: 'on-chain', en: 'On-chain', zh: '链上' },
  { slug: 'protocol-analytics', en: 'Protocol Analytics', zh: '协议分析' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'frase',
    title: 'Frase',
    url: 'https://www.frase.io',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['writing', 'seo', 'content-strategy'],
    content: {
      en: 'An AI content platform for search-focused briefs, drafting, optimization, and content planning.',
      zh: '一个面向搜索内容的 AI 平台，适合做内容 brief、起草、优化和规划。',
    },
    detail: {
      en: `Frase matters when writing is tightly connected to search demand and content operations. The product sits closer to SEO planning and optimization than to casual drafting, so it is most useful when the question is not "can this write?" but "can this help us publish search-fit content more consistently?"

In practice, the strongest reason to shortlist Frase is that it helps connect research, brief creation, and optimization in one place. That makes it a better fit for content teams and founders who care about search structure, not only first-draft speed.`,
      zh: `当写作任务和搜索需求、内容运营深度绑定时，Frase 的价值会变得很明显。它比起轻量写作助手，更接近 SEO 规划和内容优化工具，所以真正该问的不是“它会不会写”，而是“它能不能帮我们更稳定地做出更符合搜索意图的内容？”

在实战里，Frase 最强的理由，是它把研究、brief 生成和优化放到了一条链上。这让它更适合在意搜索结构的内容团队和创业者，而不只是想要更快首稿的人。`,
    },
    useCases: {
      en: ['SEO briefs', 'Search-first content planning', 'Content optimization', 'SERP-driven article drafting'],
      zh: ['SEO brief', '搜索优先内容规划', '内容优化', '基于 SERP 的文章起草'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Search-oriented writing and content operations.' },
        { label: 'Best for', value: 'Teams planning and optimizing articles around ranking opportunities.' },
        { label: 'Decision angle', value: 'Compare on workflow fit for briefs, optimization, and content planning instead of pure generation alone.' },
      ],
      zh: [
        { label: '核心定位', value: '面向搜索场景的写作与内容运营。' },
        { label: '更适合', value: '围绕排名机会做内容规划和优化的团队。' },
        { label: '比较重点', value: '重点看它是否适合 brief、优化和内容规划，而不只是单次生成效果。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO content teams', 'Founders building organic traffic', 'Marketers planning article workflows'],
        zh: ['SEO 内容团队', '做自然流量的创业者', '规划文章工作流的营销人员'],
      },
      notIdealFor: {
        en: ['Users who only want a simple rewrite tool', 'Creative writers focused on fiction or narrative work'],
        zh: ['只想找简单改写工具的用户', '主要做小说或叙事创作的写作者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a search-content operating layer rather than a generic writing assistant.',
      zh: '已按“搜索内容运营层”而不是通用写作助手来复核。',
    },
    trustNote: {
      en: 'This listing focuses on where Frase is strongest in practice: content planning and optimization around search intent.',
      zh: '本条目聚焦 Frase 最强的实战位置：围绕搜索意图做内容规划和优化。',
    },
    media: {
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f4fffd',
      badge: 'SEO content ops',
      summary: 'Briefs, optimization, and search-led content planning',
      logoText: 'Fr',
    },
  },
  {
    name: 'rytr',
    title: 'Rytr',
    url: 'https://rytr.me',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['writing', 'copywriting', 'productivity'],
    content: {
      en: 'A lightweight AI writer for copy, rewrites, short-form content, and everyday content production.',
      zh: '一个轻量 AI 写作工具，适合短文案、改写和日常内容生产。',
    },
    detail: {
      en: `Rytr is relevant when the user wants a simpler and more affordable writing tool for repeatable day-to-day output. It is less about heavyweight content systems and more about helping solo operators or small teams move faster on short-form content, copy, and routine writing tasks.

The real value is not sophistication for its own sake. It is accessibility. If you want a writing tool that is easy to test, easy to understand, and useful across common copy tasks, Rytr can be a practical shortlist option.`,
      zh: `当用户想找一个更简单、更轻量、也更容易上手的写作工具时，Rytr 会比较有相关性。它不像那种很重的内容系统，更适合独立开发者、小团队去提速短文案、改写和日常写作任务。

它真正的价值不在于“多复杂”，而在于“够顺手”。如果你想找一个容易试用、容易理解、又能覆盖常见文案任务的工具，Rytr 会是一个很实用的 shortlist 选项。`,
    },
    useCases: {
      en: ['Short-form copy', 'Rewrites', 'Daily business writing', 'Template-driven content'],
      zh: ['短文案', '改写润色', '日常商业写作', '模板化内容'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Accessible everyday writing support for common copy tasks.' },
        { label: 'Best for', value: 'Solo operators and small teams who want low-friction content help.' },
        { label: 'Decision angle', value: 'Compare on ease of use, template fit, and whether it helps routine writing move faster.' },
      ],
      zh: [
        { label: '核心定位', value: '覆盖常见文案任务的轻量日常写作支持。' },
        { label: '更适合', value: '想低门槛提速内容输出的独立用户和小团队。' },
        { label: '比较重点', value: '重点看易用性、模板适配，以及它能否让例行写作更快。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Indie hackers', 'Small business owners', 'General-purpose copywriters'],
        zh: ['独立开发者', '小企业主', '通用型文案写作者'],
      },
      notIdealFor: {
        en: ['Teams needing deep SEO workflows', 'Users who care most about fiction or long-form narrative drafting'],
        zh: ['需要深度 SEO 工作流的团队', '更重小说或长篇叙事写作的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a lightweight writing option with lower adoption friction.',
      zh: '已按“上手门槛更低的轻量写作选项”来复核。',
    },
    trustNote: {
      en: 'This profile emphasizes Rytr as a practical, easy-entry writing tool instead of a heavyweight content platform.',
      zh: '本条目强调的是 Rytr 作为一个实用、易入门的写作工具，而不是重量级内容平台。',
    },
    media: {
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f8fbff',
      badge: 'Lightweight writing',
      summary: 'Short-form copy, rewrites, and everyday content help',
      logoText: 'Ry',
    },
  },
  {
    name: 'debank',
    title: 'DeBank',
    url: 'https://debank.com',
    categorySlug: 'web3',
    pricing: 'free',
    tags: ['web3', 'portfolio', 'wallet-monitoring'],
    content: {
      en: 'A Web3 wallet and portfolio tracker for monitoring holdings, activity, and protocol exposure across EVM ecosystems.',
      zh: '一个 Web3 钱包与投资组合跟踪工具，适合观察持仓、活动和协议暴露。',
    },
    detail: {
      en: `DeBank is most useful when the first job is wallet visibility, not deep protocol research. It gives users a faster way to understand what a wallet holds, where activity is happening, and how exposure is spread across protocols and chains.

That makes it a strong entry-layer Web3 tool. If someone is still figuring out positions, wallet behavior, and basic tracking, DeBank is often more immediately useful than heavier institutional research products.`,
      zh: `当第一层任务是“看清钱包发生了什么”，而不是做深度协议研究时，DeBank 会特别好用。它帮助用户更快看懂一个钱包持有什么、活动发生在哪，以及暴露分布在什么协议和链上。

这让它成为一个很强的 Web3 入门可见性层。如果一个人还在梳理持仓、钱包行为和基础跟踪，DeBank 往往会比更重的机构研究产品更直接有用。`,
    },
    useCases: {
      en: ['Wallet visibility', 'Portfolio tracking', 'Activity monitoring', 'Protocol exposure checks'],
      zh: ['钱包可见性', '投资组合跟踪', '活动监控', '协议暴露检查'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Clear wallet and portfolio visibility across Web3 activity.' },
        { label: 'Best for', value: 'Users who need fast insight into holdings and wallet state.' },
        { label: 'Decision angle', value: 'Compare on wallet readability, protocol coverage, and whether it lowers the cost of routine monitoring.' },
      ],
      zh: [
        { label: '核心定位', value: '围绕 Web3 活动的钱包与组合可见性。' },
        { label: '更适合', value: '需要快速看清持仓和钱包状态的用户。' },
        { label: '比较重点', value: '重点看钱包可读性、协议覆盖，以及它是否降低了日常监控成本。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Active Web3 users', 'Analysts checking wallet exposure', 'Operators monitoring holdings across protocols'],
        zh: ['活跃 Web3 用户', '检查钱包暴露的分析师', '跨协议监控持仓的运营人员'],
      },
      notIdealFor: {
        en: ['Users needing institution-grade protocol research', 'Teams that mainly want API-first analytics infrastructure'],
        zh: ['需要机构级协议研究的用户', '主要想要 API 优先分析基础设施的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a wallet-visibility and portfolio-monitoring entry point.',
      zh: '已按“钱包可见性与组合监控入口工具”来复核。',
    },
    trustNote: {
      en: 'This listing positions DeBank around routine wallet clarity, which is the practical job many users actually start with.',
      zh: '本条目把 DeBank 放在“日常钱包清晰度”这个位置上，这是很多用户真正开始使用 Web3 工具时的第一需求。',
    },
    media: {
      accent: '#8b5cf6',
      accentSoft: '#ede9fe',
      accentStrong: '#7c3aed',
      surface: '#faf7ff',
      badge: 'Wallet visibility',
      summary: 'Track holdings, wallet activity, and protocol exposure',
      logoText: 'Db',
    },
  },
  {
    name: 'messari',
    title: 'Messari',
    url: 'https://messari.io',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'research', 'protocol-analytics'],
    content: {
      en: 'A crypto intelligence and research platform for protocol analysis, market monitoring, and source-grounded reports.',
      zh: '一个加密情报与研究平台，适合做协议分析、市场监控和带来源的研究。',
    },
    detail: {
      en: `Messari becomes relevant when the user wants more than charts and token prices. It is stronger when the job includes protocol intelligence, sector monitoring, diligence, and research workflows that need clearer context and structured outputs.

In other words, this is not only a browsing tool. It belongs in a research stack. If someone is comparing crypto platforms around decision support and protocol understanding, Messari is a more serious candidate than a lightweight dashboard.`,
      zh: `当用户需要的不只是图表和价格，而是协议情报、赛道监控、尽调和更结构化的研究输出时，Messari 就会变得更有相关性。

换句话说，它不只是一个“看看市场”的工具，而是更像研究栈里的一层。如果一个人比较的是“决策支持”和“协议理解”，Messari 会比轻量看板更像一个严肃候选。`,
    },
    useCases: {
      en: ['Protocol research', 'Crypto intelligence', 'Sector monitoring', 'Source-grounded market analysis'],
      zh: ['协议研究', '加密情报', '赛道监控', '带来源的市场分析'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Research-led crypto intelligence and protocol analysis.' },
        { label: 'Best for', value: 'Teams comparing ecosystems, protocols, and market narratives with more context.' },
        { label: 'Decision angle', value: 'Compare on research depth, data context, and whether it supports more defensible decision-making.' },
      ],
      zh: [
        { label: '核心定位', value: '研究驱动的加密情报与协议分析。' },
        { label: '更适合', value: '需要更高语境来比较生态、协议和市场叙事的团队。' },
        { label: '比较重点', value: '重点看研究深度、数据语境，以及它是否支持更可辩护的决策。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Crypto researchers', 'Analysts doing protocol diligence', 'Teams monitoring sectors and narratives'],
        zh: ['加密研究者', '做协议尽调的分析师', '监控赛道和叙事的团队'],
      },
      notIdealFor: {
        en: ['Users who only want wallet balance tracking', 'Beginners who just need a lightweight portfolio view'],
        zh: ['只想看钱包余额的用户', '只需要轻量组合视图的入门用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a research and protocol-intelligence layer for more serious crypto workflows.',
      zh: '已按“更严肃加密工作流里的研究与协议情报层”来复核。',
    },
    trustNote: {
      en: 'This profile centers on Messari’s research value, which is where it is most meaningfully different from simpler market dashboards.',
      zh: '本条目聚焦 Messari 的研究价值，这也是它区别于简单市场看板最明显的地方。',
    },
    media: {
      accent: '#0f172a',
      accentSoft: '#e2e8f0',
      accentStrong: '#111827',
      surface: '#f8fafc',
      badge: 'Crypto research',
      summary: 'Protocol intelligence, diligence, and source-grounded analysis',
      logoText: 'Me',
    },
  },
  {
    name: 'bubblemaps',
    title: 'Bubblemaps',
    url: 'https://bubblemaps.io',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'visualization', 'on-chain', 'research'],
    content: {
      en: 'A visual on-chain intelligence platform for investigating wallet clusters, fund flows, and token activity.',
      zh: '一个可视化链上情报平台，适合调查钱包集群、资金流向和代币活动。',
    },
    detail: {
      en: `Bubblemaps is useful when raw tables and wallet lists stop being enough. Its differentiator is not that it adds "more data," but that it makes wallet relationships and token distribution easier to inspect visually, which can change how quickly a user spots suspicious or meaningful patterns.

That makes it especially relevant for investigation-heavy workflows. If the user needs to understand who connects to whom, how supply is distributed, or how funds moved through a cluster, Bubblemaps can surface the shape of the story faster than a standard dashboard.`,
      zh: `当原始表格和钱包列表已经不够用时，Bubblemaps 就会特别有价值。它的区分点不在于“更多数据”，而在于把钱包关系和代币分布更直观地可视化，让用户更快发现可疑或有意义的模式。

这让它特别适合调查导向的工作流。如果用户需要理解“谁和谁有关联”“供应分布如何”“资金怎样穿过一个集群流动”，Bubblemaps 往往能比普通仪表盘更快看出故事的形状。`,
    },
    useCases: {
      en: ['Wallet cluster investigation', 'Token distribution checks', 'Fund-flow visualization', 'On-chain anomaly review'],
      zh: ['钱包集群调查', '代币分布检查', '资金流可视化', '链上异常审查'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Visual relationship mapping for on-chain investigation.' },
        { label: 'Best for', value: 'Users who want to inspect wallet clusters and token movement faster.' },
        { label: 'Decision angle', value: 'Compare on investigative clarity, visual readability, and whether it reveals patterns that tables hide.' },
      ],
      zh: [
        { label: '核心定位', value: '面向链上调查的关系可视化。' },
        { label: '更适合', value: '想更快检查钱包集群和资金流动的用户。' },
        { label: '比较重点', value: '重点看调查清晰度、可视化可读性，以及它能否暴露表格里看不出来的模式。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['On-chain investigators', 'Researchers reviewing token distribution', 'Teams following suspicious wallet clusters'],
        zh: ['链上调查者', '检查代币分布的研究者', '跟踪可疑钱包集群的团队'],
      },
      notIdealFor: {
        en: ['Users who only need a simple wallet tracker', 'Teams focused on broad protocol benchmarking over entity investigation'],
        zh: ['只需要简单钱包跟踪的用户', '更看重协议 benchmarking 而不是实体调查的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a visual investigation layer for on-chain research.',
      zh: '已按“链上研究里的可视化调查层”来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes Bubblemaps for relationship discovery and token-distribution investigation, which is where it is most distinctive.',
      zh: '本条目强调 Bubblemaps 在关系发现和代币分布调查上的价值，这也是它最有辨识度的地方。',
    },
    media: {
      accent: '#ec4899',
      accentSoft: '#fce7f3',
      accentStrong: '#db2777',
      surface: '#fff7fb',
      badge: 'Visual investigation',
      summary: 'Inspect wallet clusters, flows, and token distribution patterns',
      logoText: 'Bm',
    },
  },
];

function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mergeTags(existing: unknown, additions: string[]) {
  const existingTags = Array.isArray(existing) ? existing.filter((item): item is string => typeof item === 'string') : [];
  return Array.from(new Set([...existingTags, ...additions]));
}

function createLogoSvg(seed: ToolSeed) {
  const { media } = seed;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="28" y1="24" x2="226" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.78)"/>
  <rect x="48" y="48" width="160" height="160" rx="36" fill="${media.accentStrong}"/>
  <circle cx="74" cy="74" r="10" fill="rgba(255,255,255,0.28)"/>
  <circle cx="186" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="144" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="70" font-weight="800" fill="white">${escapeXml(media.logoText)}</text>
</svg>
`;
}

function createCoverSvg(seed: ToolSeed) {
  const { media } = seed;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="64" y1="48" x2="1288" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="910" y1="148" x2="1248" y2="520" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1238" cy="128" r="132" fill="${media.accentSoft}" fill-opacity="0.78"/>
  <circle cx="1140" cy="632" r="172" fill="${media.accentSoft}" fill-opacity="0.55"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="220" height="44" rx="22" fill="${media.accentSoft}"/>
  <text x="228" y="154" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${media.accentStrong}">${escapeXml(seed.categorySlug === 'web3' ? 'Web3' : 'Writing')}</text>

  <text x="118" y="258" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="800" fill="#0f172a">${escapeXml(seed.title)}</text>
  <text x="118" y="324" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${media.accentStrong}">${escapeXml(media.badge)}</text>
  <text x="118" y="400" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(media.summary)}</text>

  <rect x="118" y="468" width="478" height="164" rx="28" fill="${media.surface}" stroke="${media.accentSoft}" stroke-width="2"/>
  <text x="160" y="534" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Editorial coverage ready</text>
  <text x="160" y="582" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Localized summary, fit signals,</text>
  <text x="160" y="616" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and stable local media are in place.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.88)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${media.accentStrong}">${escapeXml(media.logoText)}</text>

  <rect x="874" y="546" width="360" height="86" rx="28" fill="${media.accentSoft}"/>
  <text x="1054" y="600" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${media.accentStrong}">Published seed</text>
</svg>
`;
}

async function upsertTags() {
  const pool = getPool();
  await Promise.all(
    TAGS.map((tag) =>
      pool.query(
        `
          INSERT INTO tags (name, slug)
          VALUES ($1::jsonb, $2)
          ON CONFLICT (slug)
          DO UPDATE SET name = EXCLUDED.name
        `,
        [JSON.stringify({ en: tag.en, zh: tag.zh }), tag.slug],
      ),
    ),
  );
}

async function getCategoryIdMap() {
  const pool = getPool();
  const result = await pool.query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function upsertTool(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const pool = getPool();
  const categoryId = categoryIdMap.get(seed.categorySlug);

  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const existingResult = await pool.query('SELECT tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  const existing = existingResult.rows[0];
  const existingTags = existing ? existing.tags : [];
  const existingFeatures =
    existing?.features && typeof existing.features === 'object' ? (existing.features as Record<string, unknown>) : {};
  const mediaReview =
    existingFeatures.mediaReview && typeof existingFeatures.mediaReview === 'object'
      ? (existingFeatures.mediaReview as Record<string, unknown>)
      : {};

  const features = {
    ...existingFeatures,
    localized: {
      en: seed.features.en,
      zh: seed.features.zh,
    },
    audience: {
      bestFit: seed.audience.bestFit,
      notIdealFor: seed.audience.notIdealFor,
    },
    editorial: {
      reviewedAt,
      reviewedBy: 'AI Best Tool Editorial',
      summary: seed.editorialSummary,
      trustNote: seed.trustNote,
    },
    mediaReview: {
      ...mediaReview,
      needed: false,
      reason: 'Locally hosted editorial media kit added for stable preview coverage.',
      resolvedAt: reviewedAt,
      source: 'local-editorial-media',
    },
  };

  await pool.query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, status, features, use_cases
      )
      VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9::text[], $10, 'published', $11::jsonb, $12::jsonb)
      ON CONFLICT (name)
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        detail = EXCLUDED.detail,
        url = EXCLUDED.url,
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        category_id = EXCLUDED.category_id,
        tags = EXCLUDED.tags,
        pricing = EXCLUDED.pricing,
        status = 'published',
        features = EXCLUDED.features,
        use_cases = EXCLUDED.use_cases,
        updated_at = NOW()
    `,
    [
      seed.name,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      new URL(seed.url).toString(),
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      categoryId,
      mergeTags(existingTags, seed.tags),
      seed.pricing,
      JSON.stringify(features),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- upserted ${seed.name}`);
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-cover.svg`), createCoverSvg(seed), 'utf8');
    fs.writeFileSync(path.join(LOGO_DIR, `${seed.name}.svg`), createLogoSvg(seed), 'utf8');
  }

  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();
  const reviewedAt = new Date().toISOString();

  for (const seed of TOOLS) {
    await upsertTool(seed, categoryIdMap, reviewedAt);
  }

  const pool = getPool();
  const counts = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published
    FROM tools
  `);

  console.log(
    JSON.stringify(
      {
        insertedNames: TOOLS.map((tool) => tool.name),
        summary: counts.rows[0],
      },
      null,
      2,
    ),
  );

  await pool.end();
}

main().catch((error) => {
  console.error('\nFailed to bootstrap writing/web3 wave 4:', error);
  process.exit(1);
});

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
  { slug: 'creative-writing', en: 'Creative Writing', zh: '创意写作' },
  { slug: 'storytelling', en: 'Storytelling', zh: '故事写作' },
  { slug: 'marketing', en: 'Marketing', zh: '营销' },
  { slug: 'copywriting', en: 'Copywriting', zh: '文案写作' },
  { slug: 'assistant', en: 'Assistant', zh: '助手' },
  { slug: 'productivity', en: 'Productivity', zh: '效率' },
  { slug: 'web3', en: 'Web3', zh: 'Web3' },
  { slug: 'on-chain', en: 'On-chain', zh: '链上' },
  { slug: 'analytics', en: 'Analytics', zh: '分析' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'protocol-analytics', en: 'Protocol Analytics', zh: '协议分析' },
  { slug: 'wallet-monitoring', en: 'Wallet Monitoring', zh: '钱包监控' },
  { slug: 'portfolio', en: 'Portfolio', zh: '投资组合' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'sudowrite',
    title: 'Sudowrite',
    url: 'https://www.sudowrite.com',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['writing', 'creative-writing', 'storytelling'],
    content: {
      en: 'An AI writing product built for fiction, scenes, character work, and creative drafting.',
      zh: '一个面向小说、场景推进、角色塑造和创意草稿的 AI 写作产品。',
    },
    detail: {
      en: `Sudowrite is not a generic "write anything" tool. It becomes much more valuable when the user is doing narrative work and needs help with scene expansion, plot movement, or getting unstuck without flattening the voice into standard marketing copy.

The real decision here is whether your writing problem is creative momentum rather than information density. If the work is fiction-first, Sudowrite often belongs in a very different shortlist from SEO or campaign copy tools.`,
      zh: `Sudowrite 不是那种“什么都能写”的通用工具。它真正有价值的时候，是用户正在做叙事型写作，需要推进场景、推动情节，或者在卡壳时获得帮助，同时又不想让文字退化成标准营销口吻。

这里真正要判断的是：你的写作难题是不是“创作推进”而不是“信息密度”。如果你的工作更偏小说与叙事，Sudowrite 的 shortlist 会和 SEO 或营销文案工具很不一样。`,
    },
    useCases: {
      en: ['Fiction drafting', 'Scene expansion', 'Character voice exploration', 'Creative unblock'],
      zh: ['小说草稿', '场景扩写', '角色语气探索', '创作卡点突破'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Creative drafting and narrative momentum.' },
        { label: 'Best for', value: 'Writers working on fiction, stories, and voice-sensitive drafts.' },
        { label: 'Decision angle', value: 'Compare on creativity support, tone preservation, and whether it helps you keep writing instead of rewriting from zero.' },
      ],
      zh: [
        { label: '核心定位', value: '创意写作与叙事推进。' },
        { label: '更适合', value: '在做小说、故事或语气敏感型草稿的写作者。' },
        { label: '比较重点', value: '重点看创意支持、语气保持，以及它能否让你继续写下去，而不是每次都从零重写。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Fiction writers', 'Creative storytellers', 'Writers who get stuck mid-draft'],
        zh: ['小说作者', '做叙事创作的人', '经常中途卡稿的写作者'],
      },
      notIdealFor: {
        en: ['Teams mainly writing SEO articles or ad copy', 'Users who only need short factual business content'],
        zh: ['主要写 SEO 文章或广告文案的团队', '只需要短篇事实型商业内容的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a creative-writing specialist, not a general content platform.',
      zh: '已按“创意写作专用工具”而非通用内容平台来复核。',
    },
    trustNote: {
      en: 'This listing highlights where Sudowrite is strongest in practice: helping narrative work move forward without collapsing tone.',
      zh: '本条目强调的是 Sudowrite 最强的实战位置：让叙事工作继续推进，同时尽量不破坏原本的语气。',
    },
    media: {
      accent: '#9333ea',
      accentSoft: '#f3e8ff',
      accentStrong: '#7e22ce',
      surface: '#fcf7ff',
      badge: 'Creative writing',
      summary: 'Fiction drafting, scenes, and narrative flow',
      logoText: 'Su',
    },
  },
  {
    name: 'anyword',
    title: 'Anyword',
    url: 'https://anyword.com',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['writing', 'marketing', 'copywriting'],
    content: {
      en: 'A marketing writing and copy platform for landing pages, ads, and performance-focused content.',
      zh: '一个面向落地页、广告和效果型内容的营销写作与文案平台。',
    },
    detail: {
      en: `Anyword matters when the writing job is tied to conversion, campaigns, and repeatable content production rather than open-ended creativity. Users usually compare it when they want stronger structure around marketing output and clearer support for performance-oriented copy.

That means the main decision is whether the work is brand and conversion writing, not general brainstorming. If performance copy is the real job, Anyword is easier to justify than more free-form writing assistants.`,
      zh: `当写作任务和转化、活动以及可重复的营销内容生产绑定在一起时，Anyword 的价值会更明显。用户通常会在想要更强的营销结构、更明确的效果导向支持时把它放进候选列表。

这意味着主要决策点不是泛泛头脑风暴，而是品牌与转化型写作。如果真正的工作是效果文案，Anyword 往往比更自由的写作助手更容易成立。`,
    },
    useCases: {
      en: ['Ad copy', 'Landing-page messaging', 'Performance marketing drafts', 'Campaign copy iteration'],
      zh: ['广告文案', '落地页信息', '效果营销草稿', '活动文案迭代'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Performance-oriented marketing writing.' },
        { label: 'Best for', value: 'Teams creating ad, landing-page, and campaign copy repeatedly.' },
        { label: 'Decision angle', value: 'Compare on campaign fit, message consistency, and how much it reduces repetitive copy iteration.' },
      ],
      zh: [
        { label: '核心定位', value: '效果导向的营销写作。' },
        { label: '更适合', value: '反复制作广告、落地页和活动文案的团队。' },
        { label: '比较重点', value: '重点看活动适配、信息一致性，以及它能否减少重复文案打磨成本。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Growth marketers', 'Performance teams', 'Founders writing landing-page copy'],
        zh: ['增长营销人员', '效果团队', '自己写落地页文案的创业者'],
      },
      notIdealFor: {
        en: ['Writers focused on fiction or essays', 'Users who mainly want an everyday note-taking assistant'],
        zh: ['主要做小说或随笔创作的写作者', '只是想要日常笔记助手的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a conversion-writing platform with clearer campaign intent.',
      zh: '已按“更偏转化型写作的平台”来复核。',
    },
    trustNote: {
      en: 'This profile positions Anyword around campaign output and conversion writing, which is where it is usually evaluated.',
      zh: '本条目把 Anyword 放在活动输出和转化型写作上来定位，这也是它最常被真正比较的地方。',
    },
    media: {
      accent: '#dc2626',
      accentSoft: '#fee2e2',
      accentStrong: '#b91c1c',
      surface: '#fff7f7',
      badge: 'Marketing copy',
      summary: 'Landing pages, ads, and campaign messaging',
      logoText: 'Aw',
    },
  },
  {
    name: 'hyperwrite',
    title: 'HyperWrite',
    url: 'https://www.hyperwriteai.com',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['writing', 'assistant', 'productivity'],
    content: {
      en: 'A browser-based AI writing assistant for drafting, rewriting, and day-to-day text support.',
      zh: '一个基于浏览器的 AI 写作助手，适合草稿、改写和日常文本支持。',
    },
    detail: {
      en: `HyperWrite is most useful when the job is not one big publishing workflow, but constant small writing moments across the day. It fits users who want light drafting, rewriting, and assistance inside everyday browser work instead of a heavyweight content system.

The practical question is whether you need a full content platform or a flexible helper that stays close to your normal working rhythm. If the latter matters more, HyperWrite can be a better fit than campaign-first writing products.`,
      zh: `当写作工作不是一个大型内容生产流程，而是贯穿一天的许多小写作时刻时，HyperWrite 会更有价值。它适合那些希望在浏览器里的日常工作中获得轻量草稿、改写和辅助支持，而不是引入一个很重的内容平台的用户。

更实际的问题是：你需要的是完整内容系统，还是一个贴近日常节奏的灵活助手。如果后者更重要，HyperWrite 往往会比偏活动型的写作平台更适合。`,
    },
    useCases: {
      en: ['Everyday drafting', 'Rewriting', 'Email and message support', 'Browser-side writing help'],
      zh: ['日常起草', '改写润色', '邮件与消息支持', '浏览器侧写作辅助'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Lightweight writing help inside normal browser workflows.' },
        { label: 'Best for', value: 'Users who write frequently in small bursts across many tabs and tasks.' },
        { label: 'Decision angle', value: 'Compare on convenience, rewrite quality, and whether it helps without forcing a separate content workflow.' },
      ],
      zh: [
        { label: '核心定位', value: '嵌入日常浏览器工作流的轻量写作辅助。' },
        { label: '更适合', value: '在很多标签页和任务之间频繁写小段内容的用户。' },
        { label: '比较重点', value: '重点看顺手程度、改写质量，以及它是否能帮忙而不强迫你切去单独的内容流程。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Knowledge workers', 'Founders writing emails and drafts', 'Users who want daily browser assistance'],
        zh: ['知识工作者', '经常写邮件和草稿的创业者', '想要日常浏览器辅助的用户'],
      },
      notIdealFor: {
        en: ['Teams needing a structured content operations platform', 'Writers looking for deep fiction-specific workflows'],
        zh: ['需要结构化内容运营平台的团队', '寻找深度小说工作流的写作者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a daily writing helper rather than a full publishing system.',
      zh: '已按“日常写作助手”而不是完整发布系统来复核。',
    },
    trustNote: {
      en: 'This profile focuses on HyperWrite as a lightweight companion for frequent browser-side writing, which is where it tends to fit best.',
      zh: '本条目强调的是 HyperWrite 作为日常浏览器侧写作搭档的价值，这也是它最容易贴合真实工作的地方。',
    },
    media: {
      accent: '#0891b2',
      accentSoft: '#cffafe',
      accentStrong: '#0e7490',
      surface: '#f5fdff',
      badge: 'Daily writing help',
      summary: 'Draft, rewrite, and keep everyday text moving',
      logoText: 'Hw',
    },
  },
  {
    name: 'nansen',
    title: 'Nansen',
    url: 'https://www.nansen.ai',
    categorySlug: 'web3',
    pricing: 'paid',
    tags: ['web3', 'on-chain', 'analytics', 'research'],
    content: {
      en: 'An on-chain analytics platform for wallet tracking, smart-money monitoring, and crypto market research.',
      zh: '一个链上分析平台，适合钱包跟踪、聪明钱监控和加密市场研究。',
    },
    detail: {
      en: `Nansen is one of the clearest benchmark tools when the user needs wallet behavior, entity-level tracking, and higher-context on-chain monitoring. It usually enters the shortlist when people want to move beyond raw dashboards into more investigation-oriented research.

The real decision here is whether you need visibility into who is moving capital and how behavior changes over time. If wallet intelligence is core to the job, Nansen is much more than a generic crypto data surface.`,
      zh: `当用户需要钱包行为、实体级追踪和更高语境的链上监控时，Nansen 是最典型的 benchmark 之一。很多人会在想从原始仪表盘走向更偏调查式研究时，把它放进 shortlist。

这里真正要判断的是：你是否需要看清“谁在动资金”，以及这些行为如何随着时间变化。如果钱包情报是核心任务，Nansen 远不只是一个普通的加密数据面板。`,
    },
    useCases: {
      en: ['Wallet intelligence', 'Smart-money monitoring', 'Token flow tracking', 'On-chain market research'],
      zh: ['钱包情报', '聪明钱监控', '代币流向追踪', '链上市场研究'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Wallet and entity-level on-chain intelligence.' },
        { label: 'Best for', value: 'Researchers and operators tracking capital movement and wallet behavior.' },
        { label: 'Decision angle', value: 'Compare on wallet visibility, behavioral context, and whether it improves monitoring beyond raw charts.' },
      ],
      zh: [
        { label: '核心定位', value: '钱包和实体级的链上情报。' },
        { label: '更适合', value: '追踪资金流动和钱包行为的研究者与运营者。' },
        { label: '比较重点', value: '重点看钱包可见性、行为语境，以及它能否把监控能力提升到原始图表之上。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Crypto researchers', 'Funds and analysts', 'Teams tracking wallets and market moves'],
        zh: ['加密研究者', '基金与分析师', '跟踪钱包和市场变化的团队'],
      },
      notIdealFor: {
        en: ['Users who only need a simple portfolio view', 'Teams without a recurring on-chain research workflow'],
        zh: ['只需要简单资产看板的用户', '没有持续链上研究工作流的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a wallet-intelligence anchor for serious on-chain research.',
      zh: '已按“严肃链上研究里的钱包情报锚点”来复核。',
    },
    trustNote: {
      en: 'This listing focuses on the kind of monitoring and behavioral context Nansen adds beyond standard crypto dashboards.',
      zh: '本条目强调的是 Nansen 超出普通加密看板之外的监控能力和行为语境价值。',
    },
    media: {
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f4fffd',
      badge: 'Wallet intelligence',
      summary: 'Track smart money, entities, and on-chain behavior',
      logoText: 'Na',
    },
  },
  {
    name: 'arkham',
    title: 'Arkham',
    url: 'https://arkhamintelligence.com',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'on-chain', 'research'],
    content: {
      en: 'A blockchain intelligence platform for entity mapping, wallet investigation, and on-chain research.',
      zh: '一个区块链情报平台，适合实体映射、钱包调查和链上研究。',
    },
    detail: {
      en: `Arkham is more investigation-oriented than generic crypto dashboards. It becomes relevant when the job is to follow entities, inspect wallet relationships, and turn raw on-chain activity into something closer to an investigative workflow.

The key question is whether you need faster wallet investigation and attribution, not just more charts. If you do, Arkham belongs in a more research-heavy shortlist than many surface-level analytics tools.`,
      zh: `和普通加密看板相比，Arkham 更偏调查式研究。当任务是追踪实体、检查钱包关系，并把原始链上行为转化为更像“调查工作流”的东西时，它会更有相关性。

关键问题是：你需不需要更快的钱包调查和归因，而不只是更多图表。如果需要，Arkham 应该被放在更偏研究型的 shortlist 里，而不是和很多表层分析工具放在一起看。`,
    },
    useCases: {
      en: ['Entity investigation', 'Wallet attribution', 'On-chain research', 'Behavior tracing'],
      zh: ['实体调查', '钱包归因', '链上研究', '行为追踪'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Investigation-led wallet and entity research.' },
        { label: 'Best for', value: 'Users who need attribution and relationship mapping on-chain.' },
        { label: 'Decision angle', value: 'Compare on investigative depth, entity context, and how much faster it makes wallet-level research.' },
      ],
      zh: [
        { label: '核心定位', value: '以调查为导向的钱包与实体研究。' },
        { label: '更适合', value: '需要做归因和关系映射的链上研究者。' },
        { label: '比较重点', value: '重点看调查深度、实体语境，以及它能把钱包级研究提速多少。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['On-chain investigators', 'Researchers following entity behavior', 'Crypto teams watching unusual movement'],
        zh: ['链上调查者', '追踪实体行为的研究者', '观察异常资金动向的加密团队'],
      },
      notIdealFor: {
        en: ['Users who only need protocol overviews', 'People looking for a lightweight first crypto dashboard'],
        zh: ['只需要协议总览的用户', '只想找一个轻量入门加密看板的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a research and attribution tool, not a generic market dashboard.',
      zh: '已按“研究与归因工具”而不是普通市场看板来复核。',
    },
    trustNote: {
      en: 'This profile emphasizes Arkham’s investigation value, which is where it stands apart from broader market surfaces.',
      zh: '本条目强调的是 Arkham 的调查价值，这也是它区别于更宽泛市场面板的地方。',
    },
    media: {
      accent: '#111827',
      accentSoft: '#e5e7eb',
      accentStrong: '#0f172a',
      surface: '#f8fafc',
      badge: 'Entity mapping',
      summary: 'Investigate wallets, relationships, and unusual activity',
      logoText: 'Ar',
    },
  },
  {
    name: 'token-terminal',
    title: 'Token Terminal',
    url: 'https://tokenterminal.com',
    categorySlug: 'web3',
    pricing: 'paid',
    tags: ['web3', 'analytics', 'protocol-analytics', 'research'],
    content: {
      en: 'A protocol analytics platform for comparing crypto projects using financial, usage, and valuation metrics.',
      zh: '一个协议分析平台，适合用财务、使用和估值指标来比较加密项目。',
    },
    detail: {
      en: `Token Terminal is especially useful when the research question is not only “what happened on-chain?” but “how does this protocol compare as a business or network over time?” It adds a more structured lens for people comparing projects across fundamentals.

The practical decision is whether you need project comparison and metric framing, not just raw chain data. If protocol benchmarking is the real job, Token Terminal is a strong fit.`,
      zh: `当研究问题不只是“链上发生了什么”，而是“这个协议作为一个业务或网络，长期表现如何、和别的项目相比怎样”时，Token Terminal 会非常有用。它为跨项目基本面对比提供了更结构化的视角。

实际决策点在于：你需要的是项目比较和指标框架，而不只是原始链上数据。如果协议 benchmarking 是真正的工作，Token Terminal 会很合适。`,
    },
    useCases: {
      en: ['Protocol benchmarking', 'Crypto fundamentals research', 'Metric comparison', 'Project screening'],
      zh: ['协议 benchmarking', '加密基本面研究', '指标比较', '项目筛选'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Cross-project protocol analytics and financial framing.' },
        { label: 'Best for', value: 'Researchers comparing networks, protocols, and fundamentals over time.' },
        { label: 'Decision angle', value: 'Compare on benchmark clarity, metric consistency, and how well it supports protocol-level investment research.' },
      ],
      zh: [
        { label: '核心定位', value: '跨项目协议分析与财务化框架。' },
        { label: '更适合', value: '跨时间比较网络、协议和基本面的研究者。' },
        { label: '比较重点', value: '重点看 benchmark 清晰度、指标一致性，以及它对协议级投资研究的支持力度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Crypto analysts', 'Protocol researchers', 'Investors comparing fundamentals'],
        zh: ['加密分析师', '协议研究者', '做基本面对比的投资者'],
      },
      notIdealFor: {
        en: ['Users mainly watching individual wallets', 'Teams that only need a light DeFi dashboard'],
        zh: ['主要盯单个钱包的用户', '只需要轻量 DeFi 看板的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a protocol-comparison and fundamentals research tool.',
      zh: '已按“协议比较与基本面研究工具”来复核。',
    },
    trustNote: {
      en: 'This listing centers on Token Terminal’s role in structured protocol comparison, not just general crypto browsing.',
      zh: '本条目聚焦 Token Terminal 在结构化协议比较中的作用，而不是泛泛的加密浏览工具。',
    },
    media: {
      accent: '#1d4ed8',
      accentSoft: '#dbeafe',
      accentStrong: '#1e40af',
      surface: '#f7fbff',
      badge: 'Protocol metrics',
      summary: 'Compare networks with financial and usage data',
      logoText: 'TT',
    },
  },
  {
    name: 'zapper',
    title: 'Zapper',
    url: 'https://zapper.xyz',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'portfolio', 'wallet-monitoring'],
    content: {
      en: 'A wallet and portfolio dashboard for tracking assets, activity, and protocol exposure across Web3.',
      zh: '一个钱包与投资组合看板，适合跟踪 Web3 里的资产、活动和协议暴露。',
    },
    detail: {
      en: `Zapper matters when the job is to understand wallet-level positions and portfolio state without diving straight into deeper investigative tooling. It is especially useful as a more approachable layer for monitoring holdings, activity, and protocol exposure.

The real comparison is whether you need an ongoing wallet view or a heavier intelligence workflow. If the first job is portfolio visibility and wallet tracking, Zapper is an easier starting point.`,
      zh: `当任务是理解钱包层面的持仓和组合状态，而不是直接进入更重的调查型工具时，Zapper 会很有价值。它特别适合作为一个更容易上手的层，帮助用户监控持仓、活动和协议暴露。

真正的比较点在于：你需要的是持续的钱包视图，还是更重的情报工作流。如果第一步是组合可见性和钱包跟踪，Zapper 会是更轻松的起点。`,
    },
    useCases: {
      en: ['Wallet tracking', 'Portfolio monitoring', 'Protocol exposure review', 'Cross-app asset visibility'],
      zh: ['钱包跟踪', '投资组合监控', '协议暴露检查', '跨应用资产可见性'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Portfolio and wallet visibility across Web3 activity.' },
        { label: 'Best for', value: 'Users who want a clear wallet and asset view before deeper research.' },
        { label: 'Decision angle', value: 'Compare on wallet readability, protocol coverage, and whether it helps ongoing monitoring feel simpler.' },
      ],
      zh: [
        { label: '核心定位', value: '围绕 Web3 活动的钱包与组合可见性。' },
        { label: '更适合', value: '想先看清钱包和资产，再进入更深研究的用户。' },
        { label: '比较重点', value: '重点看钱包可读性、协议覆盖，以及它是否让持续监控变得更简单。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Wallet-heavy Web3 users', 'Analysts tracking portfolio state', 'Users monitoring asset exposure over time'],
        zh: ['钱包使用频繁的 Web3 用户', '跟踪组合状态的分析师', '长期监控资产暴露的用户'],
      },
      notIdealFor: {
        en: ['Users doing deep entity attribution research', 'Teams seeking protocol benchmarking more than wallet visibility'],
        zh: ['要做深度实体归因研究的用户', '更重协议 benchmarking 而不是钱包可见性的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an approachable wallet-visibility layer for ongoing Web3 monitoring.',
      zh: '已按“持续 Web3 监控里的钱包可见性层”来复核。',
    },
    trustNote: {
      en: 'This profile focuses on Zapper’s clarity for wallet and portfolio visibility, which is often the first real need before deeper research.',
      zh: '本条目强调的是 Zapper 在钱包和组合可见性上的清晰度，这通常是用户进入更深研究前的第一层真实需求。',
    },
    media: {
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Portfolio tracking',
      summary: 'Track wallets, positions, and protocol exposure',
      logoText: 'Za',
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
  console.error('\nFailed to bootstrap writing/web3 wave 3:', error);
  process.exit(1);
});

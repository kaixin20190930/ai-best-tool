/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { closePool, query } from '@/db/neon/client';

type LocalizedText = {
  en: string;
  zh: string;
};

type LocalizedList = {
  en: string[];
  zh: string[];
};

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type ToolSeed = {
  name: string;
  title: string;
  url: string;
  pricing: 'free' | 'freemium' | 'paid';
  tags: string[];
  content: LocalizedText;
  detail: LocalizedText;
  useCases: LocalizedList;
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: LocalizedList;
    notIdealFor: LocalizedList;
  };
  editorialSummary: LocalizedText;
  trustNote: LocalizedText;
  decision: {
    compareAxes: LocalizedList;
    officialSummary: LocalizedText;
    freshnessSummary: LocalizedText;
    pricingSummary: LocalizedText;
    mediaSummary: LocalizedText;
    communitySummary: LocalizedText;
  };
  media: {
    category: string;
    accent: string;
    accentSoft: string;
    accentStrong: string;
    surface: string;
    badge: string;
    summary: string;
    logoText: string;
  };
};

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

const ROOT = '/Users/liukai/web/ai-best-tool';
const COVER_DIR = path.join(ROOT, 'public/images/tool-media');
const LOGO_DIR = path.join(ROOT, 'public/icons/tool-logos');

const TAGS: TagSeed[] = [
  { slug: 'web3', en: 'Web3', zh: 'Web3' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'analytics', en: 'Analytics', zh: '分析' },
  { slug: 'on-chain-data', en: 'On-chain Data', zh: '链上数据' },
  { slug: 'on-chain-analysis', en: 'On-chain Analysis', zh: '链上分析' },
  { slug: 'protocol-analytics', en: 'Protocol Analytics', zh: '协议分析' },
  { slug: 'protocol-research', en: 'Protocol Research', zh: '协议研究' },
  { slug: 'protocol-fundamentals', en: 'Protocol Fundamentals', zh: '协议基本面' },
  { slug: 'defi-analytics', en: 'DeFi Analytics', zh: 'DeFi 分析' },
  { slug: 'token-research', en: 'Token Research', zh: '代币研究' },
  { slug: 'wallet-research', en: 'Wallet Research', zh: '钱包研究' },
  { slug: 'wallet-monitoring', en: 'Wallet Monitoring', zh: '钱包监控' },
  { slug: 'portfolio-tracking', en: 'Portfolio Tracking', zh: '组合跟踪' },
  { slug: 'smart-money', en: 'Smart Money', zh: '聪明钱' },
  { slug: 'entity-mapping', en: 'Entity Mapping', zh: '实体映射' },
  { slug: 'visualization', en: 'Visualization', zh: '可视化' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'defillama',
    title: 'DefiLlama',
    url: 'https://defillama.com',
    pricing: 'free',
    tags: ['web3', 'defi-analytics', 'protocol-analytics', 'token-research'],
    content: {
      en: 'A DeFi analytics platform for protocol scale, sector shifts, yield surfaces, and market-wide crypto research.',
      zh: '一个 DeFi 分析平台，适合看协议规模、赛道变化、收益面板和更宏观的加密研究。',
    },
    detail: {
      en: `DefiLlama is strongest when the job starts with broad market scanning instead of address-level investigation. It helps users understand which protocols, sectors, and chains deserve more attention before they spend time going deeper.

That makes it especially useful as an early-layer research tool. If the real question is "where is activity moving?" or "which part of the ecosystem deserves more investigation next?", DefiLlama is often one of the cleanest first stops.`,
      zh: `当研究的第一步是先扫市场全局，而不是先钻到地址层时，DefiLlama 的价值最明显。它很适合帮助用户先理解：哪些协议、哪些赛道、哪些链值得继续投入时间深入。

这让它特别适合作为研究入口层工具。如果真正的问题是“活跃度往哪走了”或者“接下来应该深挖哪块生态”，DefiLlama 往往是最干净的第一站之一。`,
    },
    useCases: {
      en: ['DeFi sector scanning', 'Protocol scale comparison', 'Market-wide research', 'Early shortlist building'],
      zh: ['DeFi 赛道扫描', '协议规模比较', '宏观研究', '早期 shortlist 构建'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Broad-scan DeFi and protocol intelligence before deeper research starts.' },
        {
          label: 'Best for',
          value: 'Researchers comparing sectors, protocol size, and high-level ecosystem movement.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on macro visibility, protocol breadth, and how fast it helps you narrow into the next research step.',
        },
      ],
      zh: [
        { label: '核心定位', value: '在更深研究开始前，先做 DeFi 和协议全局扫描。' },
        { label: '更适合', value: '比较赛道、协议规模和生态变化的研究者。' },
        { label: '比较重点', value: '重点比较宏观可见性、协议覆盖，以及它是否能更快帮你缩小下一步研究范围。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Crypto researchers', 'Protocol watchers', 'Analysts building early watchlists'],
        zh: ['加密研究者', '协议观察者', '构建早期 watchlist 的分析师'],
      },
      notIdealFor: {
        en: ['People only wanting single-wallet alerts', 'Users who mainly need address-level identity work'],
        zh: ['只想要单个钱包提醒的人', '主要做地址身份研究的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a market-level DeFi research and shortlist-building layer.',
      zh: '已按“市场层 DeFi 研究与 shortlist 构建层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps DefiLlama centered on market-wide discovery and protocol comparison, which is where it is most practically useful.',
      zh: '本条目把 DefiLlama 放在市场发现和协议比较的位置上，这也是它最有实际价值的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Macro visibility', 'Protocol breadth', 'Shortlist speed'],
        zh: ['宏观可见性', '协议覆盖', '缩小范围速度'],
      },
      officialSummary: {
        en: 'The official product surface matters because the product is judged heavily by how quickly users can move from overview to a more specific research path.',
        zh: '官网很重要，因为这个产品很大程度上要靠它能否让用户从全局视图快速走到更具体的研究路径来判断。',
      },
      freshnessSummary: {
        en: 'DeFi dashboards and sector coverage evolve constantly, so current ecosystem support should still be checked live.',
        zh: 'DeFi 看板和赛道覆盖变化很快，因此当前生态支持仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing is usually less important here than whether the surface actually saves enough research time every day.',
        zh: '这里的价格通常没有“它是否真的每天帮你省研究时间”那么重要。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because users need to tell whether the product feels like a research map rather than a noisy chart wall.',
        zh: '预览很重要，因为用户需要判断它更像一个研究地图，而不是一面噪音很多的图表墙。',
      },
      communitySummary: {
        en: 'The strongest signal is whether users repeatedly start their market scanning there before moving to deeper tools.',
        zh: '最强的信号，是用户是否会反复从这里开始做市场扫描，然后再走向更深的工具。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'DeFi market scan',
      summary: 'Scan protocol scale, sector movement, and ecosystem shifts before deeper crypto research',
      logoText: 'DL',
    },
  },
  {
    name: 'dune',
    title: 'Dune',
    url: 'https://dune.com',
    pricing: 'freemium',
    tags: ['web3', 'on-chain-analysis', 'protocol-analytics', 'research'],
    content: {
      en: 'A blockchain analytics workspace for querying raw on-chain data, building dashboards, and turning custom questions into research views.',
      zh: '一个区块链分析工作台，适合查询原始链上数据、做仪表板，并把自定义问题变成研究视图。',
    },
    detail: {
      en: `Dune matters when ready-made dashboards stop being enough. It is strongest for analysts and researchers who want to ask their own on-chain questions instead of only consuming someone else’s market summary.

That makes it an important bridge between broad crypto research and deeper on-chain investigation. If the real job is to verify a thesis with raw data rather than accept a default framing, Dune deserves serious consideration.`,
      zh: `当现成看板已经不够用时，Dune 的价值会很明显。它最适合那些想亲自提出链上问题、而不是只消费别人市场总结的分析师和研究者。

这让它成为连接“宏观研究”和“更深链上验证”的重要桥梁。如果真正的工作是用原始数据验证一个判断，而不是直接接受默认框架，Dune 就值得认真比较。`,
    },
    useCases: {
      en: ['Custom on-chain queries', 'Protocol dashboards', 'Thesis validation', 'Research-grade analytics'],
      zh: ['自定义链上查询', '协议看板', '判断验证', '研究级分析'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Move from generic crypto views into custom on-chain investigation and reusable dashboards.',
        },
        { label: 'Best for', value: 'Researchers who want to test ideas directly against blockchain data.' },
        {
          label: 'Decision angle',
          value: 'Compare on query flexibility, dashboard usefulness, and how much it supports thesis-driven research.',
        },
      ],
      zh: [
        { label: '核心定位', value: '从泛加密视图走向自定义链上调查和可复用仪表板。' },
        { label: '更适合', value: '希望直接用区块链数据验证判断的研究者。' },
        { label: '比较重点', value: '重点比较查询灵活性、看板实用性，以及它对判断驱动研究的支持度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['On-chain analysts', 'Crypto researchers', 'Teams validating protocol or wallet theses'],
        zh: ['链上分析师', '加密研究者', '验证协议或钱包判断的团队'],
      },
      notIdealFor: {
        en: ['People only wanting lightweight charts', 'Users who do not want to work close to raw data'],
        zh: ['只想看轻量图表的人', '不想接近原始数据的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a custom-query and thesis-validation layer inside Web3 research.',
      zh: '已按“Web3 研究里的自定义查询与判断验证层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Dune positioned around custom questions and verification depth, which is where it differs most from broad market dashboards.',
      zh: '本条目把 Dune 放在自定义问题和验证深度的位置上，这也是它和宏观看板最不同的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Query flexibility', 'Verification depth', 'Reusable dashboards'],
        zh: ['查询灵活性', '验证深度', '可复用看板'],
      },
      officialSummary: {
        en: 'The official site matters because much of the product value is expressed through the actual query and dashboard workflow.',
        zh: '官网很关键，因为这个产品的大部分价值都体现在真实查询和看板工作流里。',
      },
      freshnessSummary: {
        en: 'Coverage and dashboards evolve constantly, so current templates and chain support should still be checked live.',
        zh: '覆盖范围和看板会持续变化，因此当前模板和链支持仍建议实时确认。',
      },
      pricingSummary: {
        en: 'The pricing question becomes meaningful once custom analysis starts replacing passive dashboard consumption.',
        zh: '只有当自定义分析开始替代被动看板浏览时，价格问题才会真正变得重要。',
      },
      mediaSummary: {
        en: 'Preview quality matters because users need to judge whether the workspace feels capable enough for real investigation work.',
        zh: '预览很重要，因为用户需要判断这个工作台是否足以支撑真实调查工作。',
      },
      communitySummary: {
        en: 'The strongest signal is whether analysts return to it repeatedly when they need proof instead of summaries.',
        zh: '最强的信号，是分析师在需要证据而不是总结时，是否会反复回到它这里。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#111827',
      accentSoft: '#e5e7eb',
      accentStrong: '#111827',
      surface: '#fafafa',
      badge: 'Custom chain queries',
      summary: 'Ask raw on-chain questions, validate theses, and build reusable blockchain dashboards',
      logoText: 'Du',
    },
  },
  {
    name: 'messari',
    title: 'Messari',
    url: 'https://messari.io',
    pricing: 'freemium',
    tags: ['web3', 'research', 'protocol-research', 'token-research'],
    content: {
      en: 'A crypto research platform for project context, market narratives, ecosystem tracking, and protocol intelligence.',
      zh: '一个加密研究平台，适合做项目上下文、市场叙事、生态跟踪和协议情报整理。',
    },
    detail: {
      en: `Messari is most useful when crypto research is not only about charts, but about understanding what a project is, how it fits the market, and why the narrative around it matters. It acts more like a research context layer than a simple metrics panel.

That makes it a strong fit for people turning scattered information into clearer judgment. If the real job is to decide which projects deserve more attention and what frame to use when comparing them, Messari belongs near the top of the shortlist.`,
      zh: `当加密研究不只是“看图表”，而是要理解一个项目是什么、它怎么嵌入市场、叙事为什么重要时，Messari 的价值会很明显。它更像一个研究上下文层，而不是简单指标面板。

这让它特别适合把零散信息整理成更清楚判断的人。如果真正的工作是判断哪些项目值得继续研究、比较项目时该用什么框架，Messari 就应该排在 shortlist 很靠前的位置。`,
    },
    useCases: {
      en: ['Project research', 'Narrative tracking', 'Protocol intelligence', 'Market context building'],
      zh: ['项目研究', '叙事跟踪', '协议情报', '市场上下文构建'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Add project context and research framing on top of crypto market information.' },
        { label: 'Best for', value: 'Researchers comparing projects, sectors, and market narratives over time.' },
        {
          label: 'Decision angle',
          value: 'Compare on research depth, context richness, and whether it sharpens project judgment.',
        },
      ],
      zh: [
        { label: '核心定位', value: '在加密市场信息之上补充项目上下文和研究框架。' },
        { label: '更适合', value: '长期比较项目、赛道和市场叙事的研究者。' },
        { label: '比较重点', value: '重点比较研究深度、上下文丰富度，以及它是否能让项目判断更清楚。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Crypto researchers', 'Writers and analysts', 'Teams building project watchlists'],
        zh: ['加密研究者', '内容与分析从业者', '构建项目 watchlist 的团队'],
      },
      notIdealFor: {
        en: ['People only watching wallet movements', 'Users needing pure address investigation first'],
        zh: ['只看钱包异动的人', '主要先做地址调查的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a project-context and narrative-framing layer for crypto research.',
      zh: '已按“加密研究里的项目上下文与叙事框架层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Messari positioned around clearer project judgment rather than raw data consumption alone.',
      zh: '本条目把 Messari 放在“让项目判断更清楚”的位置上，而不只是原始数据消费工具。',
    },
    decision: {
      compareAxes: {
        en: ['Research depth', 'Context richness', 'Project judgment'],
        zh: ['研究深度', '上下文丰富度', '项目判断'],
      },
      officialSummary: {
        en: 'The official site matters because the product is judged not just on data points but on whether the research framing feels useful.',
        zh: '官网很重要，因为这个产品不只是靠数据点，而是要看研究框架是否真的有用。',
      },
      freshnessSummary: {
        en: 'Coverage and research packaging evolve, so current product depth should still be confirmed live.',
        zh: '覆盖和研究包装会变化，因此当前产品深度仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes meaningful once research turns into recurring work rather than occasional curiosity.',
        zh: '只有当研究从偶尔好奇变成重复工作时，价格问题才会真正重要。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because users need to judge whether the product surface supports sustained research rather than casual browsing.',
        zh: '预览很重要，因为用户需要判断它更像一个持续研究界面，而不是随手浏览页。',
      },
      communitySummary: {
        en: 'The strongest signal is whether researchers keep using it as a context layer before they make deeper calls.',
        zh: '最强的信号，是研究者在做更深判断前，是否会把它长期当成上下文层来使用。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf7ff',
      badge: 'Project research context',
      summary: 'Add project framing, narratives, and protocol context to recurring crypto research',
      logoText: 'Me',
    },
  },
  {
    name: 'token-terminal',
    title: 'Token Terminal',
    url: 'https://tokenterminal.com',
    pricing: 'paid',
    tags: ['web3', 'token-research', 'protocol-fundamentals', 'protocol-analytics'],
    content: {
      en: 'A protocol fundamentals platform for comparing crypto projects through revenue, activity, and business-style metrics.',
      zh: '一个协议基本面平台，适合通过收入、活跃度和更商业化的指标来比较加密项目。',
    },
    detail: {
      en: `Token Terminal becomes relevant when token research needs stronger fundamentals. It is most useful when the question is not only which project is trending, but which one shows healthier business or protocol signals over time.

That makes it especially valuable for longer-horizon research. If someone is comparing projects through revenue, usage, and other durable metrics rather than headline excitement, Token Terminal deserves a serious look.`,
      zh: `当代币研究开始需要更强的基本面支撑时，Token Terminal 的价值会变得明显。它最适合的问题不是“哪个项目现在更热”，而是“哪个项目在更长期的商业或协议信号上更健康”。

这让它特别适合更长周期的研究。如果一个人正在通过收入、使用量和更耐久的指标比较项目，而不是只看热度，Token Terminal 就值得认真比较。`,
    },
    useCases: {
      en: ['Token fundamentals', 'Project comparison', 'Protocol metrics', 'Longer-horizon crypto research'],
      zh: ['代币基本面', '项目比较', '协议指标', '长周期加密研究'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Push token research toward stronger fundamentals and repeatable project comparison.',
        },
        {
          label: 'Best for',
          value: 'Researchers comparing projects through business and protocol metrics instead of hype alone.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on metric quality, project-comparison usefulness, and how clearly it supports longer-horizon judgment.',
        },
      ],
      zh: [
        { label: '核心定位', value: '把代币研究拉向更强基本面和可重复项目比较。' },
        { label: '更适合', value: '通过商业和协议指标比较项目、而不是只看热度的研究者。' },
        { label: '比较重点', value: '重点比较指标质量、项目比较实用性，以及它对长周期判断的支持度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Fundamentals-oriented researchers', 'Investors comparing projects', 'Teams building token watchlists'],
        zh: ['偏基本面的研究者', '比较项目的投资者', '构建代币 watchlist 的团队'],
      },
      notIdealFor: {
        en: ['People only needing price charts', 'Users mostly tracking address-level behavior'],
        zh: ['只需要价格图的人', '主要跟踪地址层行为的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a protocol-fundamentals and token-comparison layer.',
      zh: '已按“协议基本面与代币比较层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Token Terminal positioned around durable project comparison rather than short-term market noise.',
      zh: '本条目把 Token Terminal 放在更耐久的项目比较位置上，而不是短期市场噪音工具。',
    },
    decision: {
      compareAxes: {
        en: ['Fundamentals depth', 'Project comparison', 'Long-horizon judgment'],
        zh: ['基本面深度', '项目比较', '长周期判断'],
      },
      officialSummary: {
        en: 'The official site matters because the real value is in how the product frames metrics and project comparison, not only in brand familiarity.',
        zh: '官网很重要，因为真正的价值在于它如何组织指标和项目比较，而不只是品牌熟悉度。',
      },
      freshnessSummary: {
        en: 'Metric coverage and project framing evolve, so current scope should still be verified live.',
        zh: '指标覆盖和项目框架会变化，因此当前范围仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes easier to justify once fundamentals research is part of repeated decision work rather than occasional browsing.',
        zh: '只有当基本面研究进入重复决策工作，而不是偶尔浏览时，价格才更容易被 justify。',
      },
      mediaSummary: {
        en: 'Preview quality matters because users need to see whether the metric surface feels truly useful for comparison work.',
        zh: '预览很重要，因为用户需要判断这些指标界面是否真的适合比较工作。',
      },
      communitySummary: {
        en: 'The strongest signal is whether users keep it in their research stack when they need more than momentum narratives.',
        zh: '最强的信号，是当用户需要超越情绪叙事时，是否会长期把它留在研究栈里。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f3fffd',
      badge: 'Protocol fundamentals',
      summary: 'Compare crypto projects through revenue, usage, and stronger long-horizon fundamentals',
      logoText: 'TT',
    },
  },
  {
    name: 'nansen',
    title: 'Nansen',
    url: 'https://www.nansen.ai',
    pricing: 'paid',
    tags: ['web3', 'wallet-research', 'smart-money', 'on-chain-analysis'],
    content: {
      en: 'An on-chain intelligence platform for smart-money behavior, fund flow, wallet research, and crypto market signals.',
      zh: '一个链上情报平台，适合看聪明钱行为、资金流向、钱包研究和加密市场信号。',
    },
    detail: {
      en: `Nansen matters when research is no longer only about projects in isolation, but about who is participating and how capital is moving. It is strongest for turning wallet activity into more meaningful market interpretation.

That makes it especially useful when token or protocol research starts leaning into behavior and money flow. If the real question is not only "what is this project?" but also "who is acting around it?", Nansen belongs high on the shortlist.`,
      zh: `当研究不再只是孤立地看项目，而是开始关心“谁在参与、资金怎么走”时，Nansen 的价值会变得非常明显。它最擅长把钱包活动转成更有意义的市场解释。

这让它在代币或协议研究开始向行为和资金流方向延伸时特别有用。如果真正的问题不只是“这是什么项目”，而是“围绕它的是谁、在做什么”，Nansen 就应该排在 shortlist 很前面。`,
    },
    useCases: {
      en: ['Smart-money tracking', 'Wallet research', 'Fund-flow signals', 'Behavior-led crypto research'],
      zh: ['聪明钱跟踪', '钱包研究', '资金流信号', '行为导向加密研究'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Turn wallet activity and fund flow into more actionable crypto research signals.',
        },
        {
          label: 'Best for',
          value: 'Researchers who need behavior and capital-flow context on top of project or token analysis.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on wallet signal quality, smart-money usefulness, and whether it sharpens interpretation beyond charts.',
        },
      ],
      zh: [
        { label: '核心定位', value: '把钱包活动和资金流转成更可行动的加密研究信号。' },
        { label: '更适合', value: '希望在项目或代币分析之上补行为与资金流上下文的研究者。' },
        { label: '比较重点', value: '重点比较钱包信号质量、聪明钱实用性，以及它是否能让判断超越图表层。' },
      ],
    },
    audience: {
      bestFit: {
        en: [
          'On-chain researchers',
          'Analysts following smart money',
          'Teams tracking wallet behavior around projects',
        ],
        zh: ['链上研究者', '跟踪聪明钱的分析师', '围绕项目跟踪钱包行为的团队'],
      },
      notIdealFor: {
        en: ['People only wanting static portfolio views', 'Users who do not need address-level behavior at all'],
        zh: ['只想看静态组合视图的人', '完全不需要地址层行为信息的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a smart-money and behavior-intelligence layer inside Web3 research.',
      zh: '已按“Web3 研究里的聪明钱与行为情报层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Nansen positioned around behavior interpretation and capital flow, which is where it adds real differentiation.',
      zh: '本条目把 Nansen 放在行为解释和资金流位置上，这也是它最有差异化价值的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Wallet signals', 'Fund-flow context', 'Behavior interpretation'],
        zh: ['钱包信号', '资金流上下文', '行为解释'],
      },
      officialSummary: {
        en: 'The official site matters because this product is judged heavily by how clearly it surfaces wallet behavior and signal layers.',
        zh: '官网很重要，因为这个产品很大程度上要靠它如何呈现钱包行为和信号层来判断。',
      },
      freshnessSummary: {
        en: 'Behavior signals and coverage evolve quickly, so current workflow fit should still be checked live.',
        zh: '行为信号和覆盖会快速变化，因此当前工作流适配度仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes meaningful once behavior-led research is part of repeated decision work rather than occasional curiosity.',
        zh: '只有当行为导向研究进入重复决策工作，而不只是偶尔好奇时，价格才会真正重要。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because users need to feel whether the product genuinely sharpens behavioral interpretation.',
        zh: '预览很重要，因为用户需要判断这个产品是否真的能增强行为解释能力。',
      },
      communitySummary: {
        en: 'The strongest signal is whether researchers return to it when they need more than surface-level token narratives.',
        zh: '最强的信号，是当研究者需要超越表层代币叙事时，是否会反复回到它这里。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#0f172a',
      accentSoft: '#e2e8f0',
      accentStrong: '#0f172a',
      surface: '#f8fafc',
      badge: 'Smart-money signals',
      summary: 'Track wallet behavior, capital flow, and on-chain signals around tokens and protocols',
      logoText: 'Na',
    },
  },
  {
    name: 'arkham',
    title: 'Arkham',
    url: 'https://arkhamintelligence.com',
    pricing: 'freemium',
    tags: ['web3', 'wallet-research', 'entity-mapping', 'on-chain-analysis'],
    content: {
      en: 'A blockchain intelligence platform for entity mapping, wallet investigation, and connecting on-chain clues into clearer stories.',
      zh: '一个区块链情报平台，适合做实体映射、钱包调查，并把链上线索连成更清楚的故事。',
    },
    detail: {
      en: `Arkham becomes relevant when wallet research needs more than holdings or alerts. It is particularly useful when the job is to connect on-chain clues into a clearer identity or investigation path.

That makes it a strong fit for researchers who want to move from surface behavior to more structured wallet understanding. If the real work is about who an address might be and how that changes your interpretation, Arkham is an important candidate.`,
      zh: `当钱包研究需要的不只是持仓或提醒时，Arkham 的价值会很明显。它特别适合把链上线索继续串成更清楚的身份判断或调查路径。

这让它非常适合那些想从表层行为走向更结构化钱包理解的研究者。如果真正的工作是判断一个地址可能是谁、这个判断如何改变你的解读，Arkham 就是一个很重要的候选。`,
    },
    useCases: {
      en: ['Entity mapping', 'Wallet investigation', 'Identity clues', 'Structured on-chain intelligence'],
      zh: ['实体映射', '钱包调查', '身份线索', '结构化链上情报'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Move from wallet activity into identity clues and investigative structure.' },
        {
          label: 'Best for',
          value: 'Researchers who want more interpretability around addresses and entity relationships.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on identity clues, relationship mapping, and how well it supports investigative reasoning.',
        },
      ],
      zh: [
        { label: '核心定位', value: '从钱包活动进一步走向身份线索和调查结构。' },
        { label: '更适合', value: '希望更强地址可解释性和实体关系理解的研究者。' },
        { label: '比较重点', value: '重点比较身份线索、关系映射，以及它对调查型推理的支持度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Wallet investigators', 'Crypto researchers', 'Analysts working on identity and relation clues'],
        zh: ['钱包调查者', '加密研究者', '处理身份和关系线索的分析师'],
      },
      notIdealFor: {
        en: ['People only wanting portfolio rollups', 'Users who only need high-level market views'],
        zh: ['只想看组合归集的人', '只需要高层市场视图的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an identity-clue and investigative wallet-research layer.',
      zh: '已按“身份线索与调查型钱包研究层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Arkham positioned around investigative interpretation, which is where it becomes more useful than a generic tracking tool.',
      zh: '本条目把 Arkham 放在调查型解释的位置上，这也是它比泛跟踪工具更有用的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Identity clues', 'Entity mapping', 'Investigative structure'],
        zh: ['身份线索', '实体映射', '调查结构'],
      },
      officialSummary: {
        en: 'The official site matters because the product is judged heavily by whether the intelligence surface feels structured enough for real investigation.',
        zh: '官网很重要，因为这个产品要靠情报界面是否足够适合真实调查来判断。',
      },
      freshnessSummary: {
        en: 'Entity coverage and intelligence framing evolve, so current fit should still be checked live.',
        zh: '实体覆盖和情报框架会变化，因此当前适配度仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing matters more once investigation-style wallet research becomes recurring rather than occasional.',
        zh: '只有当调查型钱包研究变成重复工作，而不是偶尔查看时，价格才会更重要。',
      },
      mediaSummary: {
        en: 'Preview quality matters because users need to see whether the intelligence surface feels interpretable instead of noisy.',
        zh: '预览很重要，因为用户需要判断情报界面是否足够可解释，而不是一团噪音。',
      },
      communitySummary: {
        en: 'The strongest signal is whether researchers use it when they need to explain who an address might be, not just what it holds.',
        zh: '最强的信号，是当研究者需要解释“这个地址可能是谁”，而不只是“它持有什么”时，是否会用它。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#111827',
      accentSoft: '#f3f4f6',
      accentStrong: '#111827',
      surface: '#fafafa',
      badge: 'Wallet intelligence',
      summary: 'Investigate addresses, entities, and on-chain clue networks with more structure',
      logoText: 'Ar',
    },
  },
  {
    name: 'debank',
    title: 'DeBank',
    url: 'https://debank.com',
    pricing: 'free',
    tags: ['web3', 'portfolio-tracking', 'wallet-monitoring', 'wallet-research'],
    content: {
      en: 'A wallet and portfolio visibility layer for checking holdings, protocol exposure, and routine on-chain activity across Web3.',
      zh: '一个钱包和组合可见性层，适合查看持仓、协议暴露和日常链上活动。',
    },
    detail: {
      en: `DeBank is most useful when the first job is to quickly understand wallet state rather than launch a deeper investigation. It gives a clean starting point for holdings, exposure, and broad activity review.

That makes it especially valuable as an everyday visibility layer. If the real need is "help me see what this wallet is doing" before deciding whether deeper research is necessary, DeBank is a very natural first stop.`,
      zh: `当第一层任务是先快速看清钱包状态，而不是立刻进入更深调查时，DeBank 的价值会非常明显。它提供了一个很干净的起点，让你先看持仓、暴露和大体活动。

这让它特别适合作为日常可见性层。如果真正的需求是“先帮我看清这个钱包大概在干嘛”，再决定是否要深挖，DeBank 会是非常自然的第一站。`,
    },
    useCases: {
      en: ['Wallet visibility', 'Holdings rollups', 'Protocol exposure checks', 'Routine activity review'],
      zh: ['钱包可见性', '持仓归集', '协议暴露检查', '日常活动查看'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Give fast visibility into wallet state before deeper investigation starts.' },
        { label: 'Best for', value: 'Users who want a low-friction read on holdings, exposure, and wallet movement.' },
        {
          label: 'Decision angle',
          value: 'Compare on readability, monitoring ease, and whether it lowers the cost of routine wallet checks.',
        },
      ],
      zh: [
        { label: '核心定位', value: '在更深调查开始前，先快速提供钱包状态可见性。' },
        { label: '更适合', value: '想低摩擦看清持仓、暴露和钱包活动的用户。' },
        { label: '比较重点', value: '重点比较可读性、监控便利度，以及它是否降低了日常钱包检查成本。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Active Web3 users', 'Portfolio checkers', 'Researchers needing a clean wallet starting point'],
        zh: ['活跃 Web3 用户', '组合检查者', '需要干净钱包研究起点的研究者'],
      },
      notIdealFor: {
        en: ['Users needing deeper entity investigation', 'Teams mainly wanting protocol-fundamentals research'],
        zh: ['需要更深实体调查的用户', '主要做协议基本面研究的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an everyday wallet-visibility and starting-point layer.',
      zh: '已按“日常钱包可见性和起点层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps DeBank centered on routine wallet clarity, which is usually its strongest practical value.',
      zh: '本条目把 DeBank 放在“日常钱包清晰度”这个位置上，这通常也是它最强的实际价值。',
    },
    decision: {
      compareAxes: {
        en: ['Wallet readability', 'Exposure visibility', 'Routine monitoring ease'],
        zh: ['钱包可读性', '暴露可见性', '日常监控便利度'],
      },
      officialSummary: {
        en: 'The official site matters because the product is judged heavily by whether the interface makes wallet state understandable at a glance.',
        zh: '官网很重要，因为这个产品很大程度上要靠它是否能让钱包状态一眼看懂来判断。',
      },
      freshnessSummary: {
        en: 'Chain coverage and protocol visibility evolve, so current support should still be verified live.',
        zh: '链支持和协议可见性会变化，因此当前支持仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing is secondary unless the workflow expands into heavier monitoring or team usage.',
        zh: '除非工作流扩展到更重监控或团队使用，否则价格通常不是第一维度。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because users need to tell whether the product surface is truly quick to read.',
        zh: '预览很重要，因为用户需要判断这个产品界面是否真的足够快读。',
      },
      communitySummary: {
        en: 'The strongest signal is whether people keep it open as part of routine wallet checks instead of only one-off curiosity.',
        zh: '最强的信号，是用户是否会把它长期留在日常钱包检查流程里，而不是只偶尔看看。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f8fbff',
      badge: 'Wallet visibility',
      summary: 'See holdings, exposure, and everyday wallet activity clearly before deeper investigation',
      logoText: 'Db',
    },
  },
  {
    name: 'bubblemaps',
    title: 'Bubblemaps',
    url: 'https://bubblemaps.io',
    pricing: 'freemium',
    tags: ['web3', 'wallet-research', 'visualization', 'token-research'],
    content: {
      en: 'A visual blockchain analysis tool for holder structure, wallet clustering, and relationship-driven token investigation.',
      zh: '一个可视化区块链分析工具，适合看持有人结构、钱包聚类和关系驱动的代币调查。',
    },
    detail: {
      en: `Bubblemaps matters when relationships are easier to understand visually than through tables or wallet lists. It becomes especially useful when a researcher wants to spot concentration, clustering, or suspicious structural patterns quickly.

That makes it a powerful clue-discovery layer rather than a complete research stack by itself. If the real job is to make wallet or holder structure more intuitive before going deeper, Bubblemaps deserves a place on the shortlist.`,
      zh: `当地址关系用可视化方式比用表格和钱包列表更容易理解时，Bubblemaps 的价值会非常明显。它特别适合研究者快速发现集中度、聚类关系或一些值得继续追问的结构模式。

这让它更像一个线索发现层，而不是独立完成全部研究栈的工具。如果真正的工作是先把钱包或持有人结构变得更直观，再决定如何深挖，Bubblemaps 就应该进入 shortlist。`,
    },
    useCases: {
      en: ['Holder structure analysis', 'Wallet clustering', 'Visual clue discovery', 'Token ownership research'],
      zh: ['持有人结构分析', '钱包聚类', '可视化线索发现', '代币持有研究'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Make address and holder relationships visually understandable before deeper analysis.',
        },
        { label: 'Best for', value: 'Researchers who need fast visual intuition around token or wallet structure.' },
        {
          label: 'Decision angle',
          value: 'Compare on visual clarity, clustering usefulness, and how much it sharpens clue discovery.',
        },
      ],
      zh: [
        { label: '核心定位', value: '在更深分析开始前，把地址和持有人关系变得更直观。' },
        { label: '更适合', value: '希望快速建立代币或钱包结构直觉的研究者。' },
        { label: '比较重点', value: '重点比较可视化清晰度、聚类实用性，以及它对线索发现的帮助。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Token researchers', 'Wallet investigators', 'Analysts looking for structural red flags'],
        zh: ['代币研究者', '钱包调查者', '寻找结构性风险信号的分析师'],
      },
      notIdealFor: {
        en: ['People only wanting static dashboards', 'Users needing a complete research stack in one tool'],
        zh: ['只想看静态看板的人', '希望一个工具完成全部研究栈的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a visual clue-discovery layer for wallet and token investigation.',
      zh: '已按“钱包与代币调查里的可视化线索发现层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Bubblemaps positioned around structural intuition and clue discovery rather than pretending it replaces a full analytics stack.',
      zh: '本条目把 Bubblemaps 放在结构直觉和线索发现的位置上，而不是假装它能取代完整分析栈。',
    },
    decision: {
      compareAxes: {
        en: ['Visual clarity', 'Clustering usefulness', 'Clue discovery'],
        zh: ['可视化清晰度', '聚类实用性', '线索发现'],
      },
      officialSummary: {
        en: 'The official site matters because the product is judged heavily by whether the visual surface actually sharpens interpretation.',
        zh: '官网很重要，因为这个产品很大程度上要靠可视化界面是否真的增强了解释能力来判断。',
      },
      freshnessSummary: {
        en: 'Visualization features and token coverage evolve, so current fit should still be checked live.',
        zh: '可视化能力和代币覆盖会变化，因此当前适配度仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing matters mostly once visual analysis becomes part of recurring investigation work instead of occasional checks.',
        zh: '只有当可视化分析进入重复调查工作，而不是偶尔查看时，价格才更重要。',
      },
      mediaSummary: {
        en: 'Preview quality matters a lot here because users need confidence that the visual layer is genuinely interpretable.',
        zh: '这里的预览非常重要，因为用户需要确定可视化层是否真的足够可解释。',
      },
      communitySummary: {
        en: 'The strongest signal is whether researchers use it when they want to see structure, not only numbers.',
        zh: '最强的信号，是当研究者想看结构而不只是数字时，是否会用它。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#fbf8ff',
      badge: 'Visual wallet clues',
      summary: 'See holder clusters, wallet relationships, and token structure more intuitively',
      logoText: 'Bm',
    },
  },
  {
    name: 'footprint',
    title: 'Footprint',
    url: 'https://www.footprint.network',
    pricing: 'freemium',
    tags: ['web3', 'protocol-analytics', 'on-chain-data', 'research'],
    content: {
      en: 'An on-chain analytics platform for dashboards, recurring protocol tracking, and research-ready blockchain data views.',
      zh: '一个链上分析平台，适合做仪表板、持续协议跟踪和研究级区块链数据视图。',
    },
    detail: {
      en: `Footprint matters when the work needs repeatable analytics surfaces rather than one-off lookups. It is especially useful when protocol research is turning into recurring dashboards, operating reviews, or shared reporting.

That makes it a strong middle layer between raw data and narrative-heavy research products. If the job is to create recurring views that teams can keep returning to, Footprint deserves a close look.`,
      zh: `当工作需要可重复的分析界面，而不是一次性查询时，Footprint 的价值会很明显。它特别适合协议研究开始变成持续仪表板、运营复盘或团队共享报告的时候。

这让它成为介于原始数据和偏叙事研究产品之间的很强中间层。如果真正的工作是做团队会反复回看的视图，Footprint 就值得认真比较。`,
    },
    useCases: {
      en: ['Recurring dashboards', 'Protocol tracking', 'Shared research views', 'Operational analytics'],
      zh: ['持续仪表板', '协议跟踪', '共享研究视图', '运营分析'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turn chain data into repeatable dashboards and operational research views.' },
        {
          label: 'Best for',
          value: 'Teams that need protocol analysis to become a recurring workflow, not a one-off task.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on dashboard usefulness, repeatability, and how well it supports shared analytical habits.',
        },
      ],
      zh: [
        { label: '核心定位', value: '把链上数据转成可重复仪表板和运营型研究视图。' },
        { label: '更适合', value: '希望把协议分析变成重复工作流而不是一次性任务的团队。' },
        { label: '比较重点', value: '重点比较看板实用性、可重复性，以及它对共享分析习惯的支持度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Protocol analysts', 'Research teams', 'Operators building shared dashboard workflows'],
        zh: ['协议分析师', '研究团队', '构建共享看板工作流的运营者'],
      },
      notIdealFor: {
        en: ['Users only checking personal wallets', 'People wanting pure wallet investigation first'],
        zh: ['只查看个人钱包的用户', '主要先做钱包调查的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a recurring-dashboard and shared-analytics layer for protocol work.',
      zh: '已按“协议工作里的持续看板与共享分析层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Footprint positioned around recurring analytical habits, which is where it becomes more valuable than a simple tracker.',
      zh: '本条目把 Footprint 放在持续分析习惯的位置上，这也是它比简单跟踪工具更有价值的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Dashboard repeatability', 'Shared analytics', 'Protocol tracking'],
        zh: ['看板可重复性', '共享分析', '协议跟踪'],
      },
      officialSummary: {
        en: 'The official site matters because analytics products are judged by whether the real dashboard workflow feels usable and repeatable.',
        zh: '官网很重要，因为分析类产品最终还是要靠真实看板工作流是否可用、可重复来判断。',
      },
      freshnessSummary: {
        en: 'Coverage and dashboard layers evolve, so current data scope should still be checked live.',
        zh: '覆盖范围和看板层会变化，因此当前数据范围仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing matters most once shared dashboards and recurring team analytics become operationally important.',
        zh: '只有当共享仪表板和团队持续分析变得运营上重要时，价格才最关键。',
      },
      mediaSummary: {
        en: 'Preview quality matters because users need to see whether the analytics surface feels operational instead of decorative.',
        zh: '预览很重要，因为用户需要判断分析界面是否足够运营化，而不是装饰化。',
      },
      communitySummary: {
        en: 'The strongest signal is whether teams keep returning to it for repeated protocol reviews instead of isolated checks.',
        zh: '最强的信号，是团队是否会把它用于重复协议复盘，而不是只做一次性查看。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f3fffd',
      badge: 'Recurring analytics',
      summary: 'Build repeatable protocol dashboards and shared analytics workflows on top of chain data',
      logoText: 'Fp',
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
  const current = Array.isArray(existing) ? existing.filter((item): item is string => typeof item === 'string') : [];
  return Array.from(new Set([...current, ...additions]));
}

function createLogoSvg(seed: ToolSeed) {
  const { media } = seed;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="24" y1="24" x2="228" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="44" fill="rgba(255,255,255,0.82)"/>
  <rect x="48" y="48" width="160" height="160" rx="36" fill="${media.accentStrong}"/>
  <circle cx="76" cy="78" r="10" fill="rgba(255,255,255,0.18)"/>
  <circle cx="180" cy="182" r="14" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="white">${escapeXml(media.logoText)}</text>
</svg>
`;
}

function createCoverSvg(seed: ToolSeed) {
  const { media } = seed;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="72" y1="64" x2="1288" y2="738" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="918" y1="148" x2="1248" y2="516" gradientUnits="userSpaceOnUse">
      <stop stop-color="${media.accentSoft}"/>
      <stop offset="1" stop-color="${media.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1232" cy="140" r="136" fill="${media.accentSoft}" fill-opacity="0.74"/>
  <circle cx="1110" cy="650" r="170" fill="${media.accentSoft}" fill-opacity="0.5"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="116" y="120" width="260" height="46" rx="23" fill="${media.accentSoft}"/>
  <text x="246" y="149" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${media.accentStrong}">${escapeXml(media.category)}</text>

  <text x="116" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${escapeXml(seed.title)}</text>
  <text x="116" y="318" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${media.accentStrong}">${escapeXml(media.badge)}</text>
  <text x="116" y="392" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(media.summary)}</text>

  <rect x="116" y="460" width="520" height="170" rx="28" fill="${media.surface}" stroke="${media.accentSoft}" stroke-width="2"/>
  <text x="156" y="524" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Editorial research ready</text>
  <text x="156" y="572" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Localized detail copy, decision framing,</text>
  <text x="156" y="606" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and stable local media for guide-driven traffic.</text>

  <rect x="896" y="146" width="332" height="332" rx="40" fill="url(#panel-${seed.name})"/>
  <rect x="934" y="184" width="256" height="256" rx="34" fill="rgba(255,255,255,0.88)"/>
  <text x="1062" y="336" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="104" font-weight="800" fill="${media.accentStrong}">${escapeXml(media.logoText)}</text>

  <rect x="896" y="532" width="332" height="88" rx="28" fill="${media.accentSoft}"/>
  <text x="1062" y="587" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${media.accentStrong}">Web3 research wave</text>
</svg>
`;
}

async function upsertTags() {
  await Promise.all(
    TAGS.map((tag) =>
      query(
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

async function upsertTool(seed: ToolSeed, reviewedAt: string) {
  const existingResult = await query<{ tags: string[]; features: Record<string, unknown>; category_id: string | null }>(
    'SELECT tags, features, category_id FROM tools WHERE name = $1 LIMIT 1',
    [seed.name],
  );
  const existing = existingResult.rows[0];

  if (!existing?.category_id) {
    throw new Error(`Missing existing tool or category_id for ${seed.name}`);
  }

  const existingTags = existing.tags || [];
  const existingFeatures = existing.features && typeof existing.features === 'object' ? existing.features : {};
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
    decision: seed.decision,
    mediaReview: {
      ...mediaReview,
      needed: false,
      reason: 'Locally hosted editorial media kit added for stable preview coverage.',
      resolvedAt: reviewedAt,
      source: 'local-editorial-media',
    },
  };

  await query(
    `
      UPDATE tools
      SET
        title = $2::jsonb,
        content = $3::jsonb,
        detail = $4::jsonb,
        url = $5,
        image_url = $6,
        thumbnail_url = $7,
        tags = $8::text[],
        pricing = $9,
        status = 'published',
        features = $10::jsonb,
        use_cases = $11::jsonb,
        updated_at = NOW()
      WHERE name = $1
    `,
    [
      seed.name,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      new URL(seed.url).toString(),
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      mergeTags(existingTags, seed.tags),
      seed.pricing,
      JSON.stringify(features),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- enriched ${seed.name}`);
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
  const reviewedAt = new Date().toISOString();

  for (const seed of TOOLS) {
    await upsertTool(seed, reviewedAt);
  }

  const summary = await query<{ total: number; published: number }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published
    FROM tools
  `);

  console.log(
    JSON.stringify(
      {
        enrichedNames: TOOLS.map((tool) => tool.name),
        summary: summary.rows[0],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('\nFailed to enrich web3 research wave 19:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });

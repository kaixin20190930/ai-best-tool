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
  categorySlug: 'web3' | 'developer-tools';
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
  { slug: 'web3-api', en: 'Web3 API', zh: 'Web3 API' },
  { slug: 'on-chain-data', en: 'On-chain Data', zh: '链上数据' },
  { slug: 'portfolio-tracking', en: 'Portfolio Tracking', zh: '组合跟踪' },
  { slug: 'wallet-research', en: 'Wallet Research', zh: '钱包研究' },
  { slug: 'protocol-research', en: 'Protocol Research', zh: '协议研究' },
  { slug: 'developer-platform', en: 'Developer Platform', zh: '开发平台' },
  { slug: 'inference-platform', en: 'Inference Platform', zh: '推理平台' },
  { slug: 'background-jobs', en: 'Background Jobs', zh: '后台任务' },
  { slug: 'workflow-runtime', en: 'Workflow Runtime', zh: '工作流运行时' },
  { slug: 'agent-search', en: 'Agent Search', zh: 'Agent 搜索' },
  { slug: 'model-serving', en: 'Model Serving', zh: '模型服务' },
  { slug: 'api-tooling', en: 'API Tooling', zh: 'API 工具' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'alchemy',
    title: 'Alchemy',
    url: 'https://www.alchemy.com',
    categorySlug: 'web3',
    pricing: 'paid',
    tags: ['web3', 'web3-api', 'on-chain-data', 'developer-platform'],
    content: {
      en: 'A Web3 developer platform for blockchain APIs, on-chain data access, and production-grade app infrastructure.',
      zh: '一个面向 Web3 开发者的平台，提供区块链 API、链上数据访问和生产级应用基础设施。',
    },
    detail: {
      en: `Alchemy matters when the real job is not only researching the chain, but building on top of it. It sits closer to Web3 application infrastructure than to retail portfolio tracking, which makes it relevant for teams that need reliable RPC, indexed data, and developer-facing tooling in production.

If someone is comparing Web3 tools around integration depth rather than market dashboards, Alchemy belongs in the shortlist. The key question is whether the team needs a strong developer platform for chain access and app operations, not just a place to inspect wallet activity.`,
      zh: `当真正的工作不只是“看链上数据”，而是要“基于链上数据做产品”时，Alchemy 的价值会非常明显。它更接近 Web3 应用基础设施，而不是普通投资组合跟踪工具，所以特别适合需要稳定 RPC、索引数据和开发者工具链的团队。

如果一个人在比较 Web3 工具时，核心维度是接入深度而不是市场看板，Alchemy 就应该进入 shortlist。真正要判断的是：团队是否需要一个强开发平台来支撑链上访问和应用运维，而不是只需要看看钱包活动。`,
    },
    useCases: {
      en: ['Web3 API access', 'Blockchain app infrastructure', 'On-chain data integration', 'Developer workflows'],
      zh: ['Web3 API 访问', '区块链应用基础设施', '链上数据集成', '开发者工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Production-grade blockchain APIs and app infrastructure.' },
        { label: 'Best for', value: 'Teams integrating on-chain data into real products and services.' },
        {
          label: 'Decision angle',
          value:
            'Compare on infrastructure reliability, API coverage, and how quickly it supports Web3 product delivery.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向生产环境的区块链 API 与应用基础设施。' },
        { label: '更适合', value: '把链上数据接入真实产品和服务的团队。' },
        { label: '比较重点', value: '重点比较基础设施稳定性、API 覆盖，以及它是否能加快 Web3 产品交付。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Web3 product teams', 'Blockchain developers', 'Infra-oriented builders'],
        zh: ['Web3 产品团队', '区块链开发者', '偏基础设施的构建者'],
      },
      notIdealFor: {
        en: ['Users only watching portfolios', 'Researchers who do not need app integration'],
        zh: ['只看投资组合的用户', '不需要应用集成的研究型用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a Web3 infrastructure layer rather than a market dashboard.',
      zh: '已按“Web3 基础设施层”而不是市场看板来复核。',
    },
    trustNote: {
      en: 'This listing keeps Alchemy centered on chain access and production tooling, which is where its real value shows up.',
      zh: '本条目把 Alchemy 放在链上访问和生产工具链的位置上，这也是它真正体现价值的地方。',
    },
    decision: {
      compareAxes: {
        en: ['API coverage', 'Infra reliability', 'Developer speed'],
        zh: ['API 覆盖', '基础设施稳定性', '开发效率'],
      },
      officialSummary: {
        en: 'The official site matters because the product is tightly tied to platform capabilities and developer documentation.',
        zh: '官网很关键，因为这个产品本身就强依赖平台能力和开发者文档呈现。',
      },
      freshnessSummary: {
        en: 'Coverage and product depth move quickly, so current chain support should always be checked live.',
        zh: '覆盖范围和产品深度变化很快，因此具体支持情况建议始终实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes meaningful once API volume and production traffic enter the decision, not during casual browsing.',
        zh: '只有当 API 量级和生产流量进入决策时，定价才真正重要，而不是随便看看时。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because buyers need to tell whether the product feels like app infrastructure or just marketing.',
        zh: '预览很重要，因为用户需要判断它到底像基础设施产品，还是只是营销包装。',
      },
      communitySummary: {
        en: 'The strongest signal is whether builders keep using it as part of their recurring stack.',
        zh: '最强的信号，是开发者是否会把它长期留在自己的工具栈里。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf7ff',
      badge: 'Chain infrastructure',
      summary: 'Blockchain APIs, indexed data, and production-grade Web3 app tooling',
      logoText: 'Al',
    },
  },
  {
    name: 'zerion',
    title: 'Zerion',
    url: 'https://zerion.io',
    categorySlug: 'web3',
    pricing: 'free',
    tags: ['web3', 'portfolio-tracking', 'wallet-research'],
    content: {
      en: 'A Web3 portfolio and wallet interface for tracking assets, activity, and cross-chain positions in one place.',
      zh: '一个 Web3 投资组合与钱包界面，适合在一个地方跟踪资产、活动和跨链仓位。',
    },
    detail: {
      en: `Zerion matters when the job is understanding wallet state and portfolio movement quickly, not running institutional-grade protocol research. It works well as a visibility layer for active users who want a clearer picture of assets, positions, and wallet activity across chains.

That makes it especially relevant for wallet-first decision flows. If someone is choosing between research-heavy Web3 tools and more approachable monitoring tools, Zerion is a cleaner candidate on the portfolio and tracking side.`,
      zh: `当真正的任务是快速看清钱包状态和组合变化，而不是做机构级协议研究时，Zerion 会非常相关。它更像一个可见性层，适合活跃用户在多链环境下更清楚地理解资产、仓位和钱包活动。

这让它特别适合钱包优先的决策路径。如果一个人正在比较“偏研究的 Web3 工具”和“更易上手的监控工具”，Zerion 在组合和跟踪这一侧会是更干净的候选。`,
    },
    useCases: {
      en: ['Portfolio tracking', 'Wallet monitoring', 'Asset visibility', 'Cross-chain activity review'],
      zh: ['投资组合跟踪', '钱包监控', '资产可见性', '跨链活动查看'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Clear wallet and portfolio visibility for active Web3 users.' },
        { label: 'Best for', value: 'Users who need an easier way to monitor positions and wallet movement.' },
        {
          label: 'Decision angle',
          value:
            'Compare on readability, tracking convenience, and whether it lowers the friction of daily monitoring.',
        },
      ],
      zh: [
        { label: '核心定位', value: '服务于活跃 Web3 用户的钱包与组合可见性。' },
        { label: '更适合', value: '希望更轻松监控仓位和钱包变化的用户。' },
        { label: '比较重点', value: '重点比较可读性、跟踪便利度，以及它是否降低了日常监控摩擦。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Active token holders', 'Wallet-first users', 'Operators checking multi-chain positions'],
        zh: ['活跃代币持有者', '钱包优先用户', '检查多链仓位的运营者'],
      },
      notIdealFor: {
        en: ['Teams needing protocol diligence depth', 'Developers who mainly need API infrastructure'],
        zh: ['需要协议尽调深度的团队', '主要需要 API 基础设施的开发者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a wallet-first visibility and portfolio tracking layer.',
      zh: '已按“钱包优先的可见性和组合跟踪层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Zerion positioned around routine portfolio clarity, which is the practical job many users actually want solved first.',
      zh: '本条目把 Zerion 放在“日常组合清晰度”这个位置上，这也是很多用户最先想解决的真实问题。',
    },
    decision: {
      compareAxes: {
        en: ['Portfolio visibility', 'Wallet readability', 'Monitoring ease'],
        zh: ['组合可见性', '钱包可读性', '监控便利度'],
      },
      officialSummary: {
        en: 'The official experience matters because much of the product value is about interface clarity and day-to-day visibility.',
        zh: '官方体验很关键，因为这个产品的大部分价值都体现在界面清晰度和日常可见性上。',
      },
      freshnessSummary: {
        en: 'Activity and chain coverage shift over time, so users should still verify the current supported experience live.',
        zh: '活动视图和链支持会变化，因此仍建议以实时支持情况为准。',
      },
      pricingSummary: {
        en: 'Pricing is usually secondary here unless the workflow becomes more advanced or team-oriented.',
        zh: '除非工作流开始变得更高级或团队化，否则定价通常不是第一比较维度。',
      },
      mediaSummary: {
        en: 'Preview quality matters because the product is judged heavily on visual clarity and monitoring flow.',
        zh: '预览很重要，因为这个产品很大程度上就是靠视觉清晰度和监控流程来被判断。',
      },
      communitySummary: {
        en: 'The strongest signal is whether users keep it open as part of their routine wallet workflow.',
        zh: '最强的信号，是用户是否会把它留在自己的日常钱包工作流里。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f8fbff',
      badge: 'Wallet-first tracking',
      summary: 'Monitor assets, positions, and wallet activity across chains',
      logoText: 'Ze',
    },
  },
  {
    name: 'footprint',
    title: 'Footprint',
    url: 'https://www.footprint.network',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'on-chain-data', 'protocol-research', 'analytics'],
    content: {
      en: 'An on-chain analytics platform for dashboards, protocol tracking, and crypto research workflows.',
      zh: '一个链上分析平台，适合做看板、协议追踪和加密研究工作流。',
    },
    detail: {
      en: `Footprint becomes relevant when the work needs clearer analysis layers than a simple wallet view can provide. It sits between raw chain data and more narrative-heavy research products, which makes it useful for teams that care about dashboards, protocol metrics, and repeatable analytics work.

It is not just a place to browse numbers. The real value is whether it helps users turn on-chain data into working views and recurring research surfaces. If protocol tracking and dashboard-style analysis are central, it deserves a closer look.`,
      zh: `当工作需要比钱包视图更深一层的分析结构时，Footprint 会变得有价值。它位于“原始链上数据”和“偏叙事研究产品”之间，因此特别适合在意看板、协议指标和可重复分析工作的团队。

它不只是一个“看数字”的地方。真正的价值，是它能否帮助用户把链上数据变成可工作的视图和持续复用的研究面板。如果协议追踪和看板式分析是核心任务，它就值得更认真比较。`,
    },
    useCases: {
      en: ['Protocol dashboards', 'On-chain analytics', 'Crypto research', 'Recurring metric tracking'],
      zh: ['协议看板', '链上分析', '加密研究', '持续指标跟踪'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning chain data into repeatable analytics views and dashboards.' },
        {
          label: 'Best for',
          value: 'Teams that need protocol metrics and recurring analytics work, not only portfolio visibility.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on dashboard usefulness, research depth, and whether it supports recurring analysis better than lighter tools.',
        },
      ],
      zh: [
        { label: '核心定位', value: '把链上数据转成可复用的分析视图和看板。' },
        { label: '更适合', value: '需要协议指标和持续分析工作，而不只是组合可见性的团队。' },
        { label: '比较重点', value: '重点比较看板实用性、研究深度，以及它是否比轻量工具更适合持续分析。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Protocol analysts', 'Research teams', 'Operators building recurring crypto dashboards'],
        zh: ['协议分析师', '研究团队', '搭建持续加密看板的运营者'],
      },
      notIdealFor: {
        en: ['Users only checking personal wallets', 'Teams wanting developer infra rather than analytics surfaces'],
        zh: ['只检查个人钱包的用户', '更需要开发基础设施而不是分析面板的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a repeatable analytics and protocol-tracking layer.',
      zh: '已按“可复用分析和协议追踪层”来复核。',
    },
    trustNote: {
      en: 'This profile keeps Footprint centered on recurring analytical work, which is where it becomes more meaningful than a simple tracker.',
      zh: '本条目把 Footprint 放在持续分析工作的位置上，这也是它比简单跟踪工具更有意义的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Dashboard depth', 'Protocol tracking', 'Research usefulness'],
        zh: ['看板深度', '协议追踪', '研究实用性'],
      },
      officialSummary: {
        en: 'The official product surface matters because analytics products are judged by how usable their actual dashboards feel.',
        zh: '官方产品面很重要，因为分析类产品最终要靠实际看板的可用性来判断。',
      },
      freshnessSummary: {
        en: 'Analytics coverage evolves with chains and protocols, so current data support should be verified live.',
        zh: '分析覆盖会随着链和协议演进，因此当前数据支持仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing matters once dashboards and recurring team research become part of a regular operating workflow.',
        zh: '只有当看板和团队持续研究进入日常运营流程后，定价才会变得重要。',
      },
      mediaSummary: {
        en: 'Preview quality matters because users need to judge whether the analytics surface feels actionable.',
        zh: '预览很重要，因为用户需要判断分析界面是否真正可行动。',
      },
      communitySummary: {
        en: 'The strongest signal is whether teams return to it repeatedly for protocol tracking instead of one-off checks.',
        zh: '最强的信号，是团队是否会反复回来做协议追踪，而不是只查一次。',
      },
    },
    media: {
      category: 'Web3',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f4fffd',
      badge: 'Protocol analytics',
      summary: 'Build recurring dashboards and protocol analysis workflows on top of chain data',
      logoText: 'Fp',
    },
  },
  {
    name: 'modal',
    title: 'Modal',
    url: 'https://modal.com',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['developer-tools', 'developer-platform', 'model-serving'],
    content: {
      en: 'A developer platform for running GPU jobs, model inference, and backend workloads without managing low-level infrastructure directly.',
      zh: '一个开发平台，适合运行 GPU 任务、模型推理和后端工作负载，而无需直接管理底层基础设施。',
    },
    detail: {
      en: `Modal becomes relevant when a team has moved beyond toy demos and needs infrastructure that helps AI workloads run in a more production-friendly way. It sits closer to execution and deployment than to prompt tooling, which makes it important for developer workflows that depend on GPUs or heavier backend jobs.

The real comparison question is not whether it can run code at all, but whether it reduces operational burden enough to become part of the delivery stack. If shipping model-backed features is the job, Modal deserves to be compared seriously.`,
      zh: `当一个团队已经走出玩具 demo，需要更适合生产环境的 AI 工作负载基础设施时，Modal 就会变得非常相关。它更接近执行和部署层，而不是 prompt 工具，因此特别适合依赖 GPU 或更重后台任务的开发工作流。

真正要比较的，不是“它能不能跑代码”，而是“它是否足够减少运维负担，值得进入交付栈”。如果真正的工作是上线模型驱动功能，Modal 值得被认真比较。`,
    },
    useCases: {
      en: ['GPU workloads', 'Inference jobs', 'Backend execution', 'AI feature deployment'],
      zh: ['GPU 工作负载', '推理任务', '后台执行', 'AI 功能部署'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Running model and backend workloads with less infra friction.' },
        { label: 'Best for', value: 'Developers and teams operationalizing heavier AI workloads.' },
        {
          label: 'Decision angle',
          value: 'Compare on deployment convenience, execution reliability, and how much ops burden it removes.',
        },
      ],
      zh: [
        { label: '核心定位', value: '以更少基础设施摩擦运行模型和后台工作负载。' },
        { label: '更适合', value: '需要把更重 AI 工作负载投入实际业务的开发者和团队。' },
        { label: '比较重点', value: '重点比较部署便利性、执行可靠性，以及它到底减少了多少运维负担。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['AI product teams', 'Backend developers', 'Builders shipping GPU-heavy workflows'],
        zh: ['AI 产品团队', '后端开发者', '上线 GPU 重工作流的构建者'],
      },
      notIdealFor: {
        en: ['Users only needing editor assistance', 'Teams that never operate model workloads directly'],
        zh: ['只需要编辑器辅助的用户', '从不直接运行模型工作负载的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an execution and deployment layer for real AI product workloads.',
      zh: '已按“真实 AI 产品工作负载的执行与部署层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Modal positioned around operational delivery, which is where it becomes more meaningful than a generic developer tool.',
      zh: '本条目把 Modal 放在“运营交付”这个位置上，这也是它比泛开发工具更有意义的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Execution reliability', 'Infra burden', 'Deployment speed'],
        zh: ['执行可靠性', '基础设施负担', '部署速度'],
      },
      officialSummary: {
        en: 'The official site matters because the product is tightly coupled to platform primitives and deployment ergonomics.',
        zh: '官网很重要，因为这个产品和平台能力、部署体验是强耦合的。',
      },
      freshnessSummary: {
        en: 'Platform capabilities shift as AI infra evolves, so practical fit should still be checked live.',
        zh: '随着 AI 基础设施演进，平台能力会变化，因此实际适配度仍需实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes central when workloads grow from prototypes into repeated production usage.',
        zh: '当工作负载从原型进入反复的生产使用时，定价才会成为核心问题。',
      },
      mediaSummary: {
        en: 'Preview clarity matters because buyers need to see whether it feels like real execution infrastructure.',
        zh: '预览很重要，因为用户需要判断它是否真的像一个执行基础设施产品。',
      },
      communitySummary: {
        en: 'The strongest signal is whether engineering teams actually keep it in their stack after initial experiments.',
        zh: '最强的信号，是工程团队在初步试用后是否真的把它留在自己的栈里。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#111827',
      accentSoft: '#e5e7eb',
      accentStrong: '#111827',
      surface: '#f8fafc',
      badge: 'AI workload runtime',
      summary: 'Run inference, GPU tasks, and backend AI workloads with less ops overhead',
      logoText: 'Mo',
    },
  },
  {
    name: 'trigger-dev',
    title: 'Trigger.dev',
    url: 'https://trigger.dev',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'background-jobs', 'workflow-runtime', 'automation'],
    content: {
      en: 'A developer-oriented background job and workflow runtime for long-running tasks, automations, and event-driven product work.',
      zh: '一个面向开发者的后台任务与工作流运行时，适合长任务、自动化和事件驱动产品工作。',
    },
    detail: {
      en: `Trigger.dev matters when the actual problem is not just calling an AI model, but coordinating work after that call: retries, long-running jobs, task orchestration, and event-driven execution. It belongs in developer tools because it helps product teams operationalize work, not only prototype it.

If someone is choosing between AI-friendly runtimes, simple automation layers, and broader developer tooling, Trigger.dev is strongest where background execution reliability and workflow visibility are part of the decision.`,
      zh: `当真正的问题不只是“调一次模型”，而是“调完之后怎么协调后续工作”时，Trigger.dev 的价值会变得很明显，比如重试、长任务、任务编排和事件驱动执行。它属于开发者工具，因为它帮助产品团队把工作运营起来，而不只是做原型。

如果一个人正在比较 AI 友好的运行时、简单自动化层和更广的开发者工具，Trigger.dev 在“后台执行可靠性”和“工作流可见性”这两个维度上会尤其突出。`,
    },
    useCases: {
      en: ['Background jobs', 'Event-driven workflows', 'Long-running automations', 'AI task orchestration'],
      zh: ['后台任务', '事件驱动工作流', '长任务自动化', 'AI 任务编排'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Reliable background execution and workflow visibility for product teams.' },
        { label: 'Best for', value: 'Developers building products with long-running or retry-heavy tasks.' },
        {
          label: 'Decision angle',
          value: 'Compare on workflow clarity, background execution reliability, and operational ergonomics.',
        },
      ],
      zh: [
        { label: '核心定位', value: '服务产品团队的可靠后台执行和工作流可见性。' },
        { label: '更适合', value: '在构建包含长任务或高重试场景产品的开发者。' },
        { label: '比较重点', value: '重点比较工作流清晰度、后台执行可靠性和运维体验。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Product engineers', 'Automation-heavy teams', 'Developers coordinating long AI tasks'],
        zh: ['产品工程师', '自动化较重的团队', '协调长 AI 任务的开发者'],
      },
      notIdealFor: {
        en: ['Users only wanting no-code automations', 'Teams that do not run background product workflows'],
        zh: ['只想要 no-code 自动化的用户', '不运行后台产品工作流的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a workflow runtime and background execution layer for developers.',
      zh: '已按“开发者的工作流运行时和后台执行层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Trigger.dev positioned around operational workflow execution, which is where it becomes more valuable than generic automation labels suggest.',
      zh: '本条目把 Trigger.dev 放在运营化工作流执行的位置上，这也是它比“泛自动化”标签更有价值的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow reliability', 'Background execution', 'Operational visibility'],
        zh: ['工作流可靠性', '后台执行', '运维可见性'],
      },
      officialSummary: {
        en: 'The official product surface matters because the value is tightly tied to runtime behavior and developer workflow ergonomics.',
        zh: '官方产品面很重要，因为它的价值和运行时行为、开发者工作流体验强相关。',
      },
      freshnessSummary: {
        en: 'Runtime features and integrations evolve quickly, so current workflow fit should be checked live.',
        zh: '运行时特性和集成演进很快，因此当前工作流适配度仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing matters more once the workflow becomes part of repeated product operations rather than experimentation.',
        zh: '当工作流成为重复性的产品运营基础，而不只是实验时，定价会更重要。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because workflow products are judged heavily on whether their operational surface feels manageable.',
        zh: '预览很重要，因为工作流产品很大程度上要靠“运维界面是否可控”来判断。',
      },
      communitySummary: {
        en: 'The strongest signal is whether developers keep it in recurring operational paths after early setup.',
        zh: '最强的信号，是开发者在完成初步搭建后，是否把它持续留在运营路径里。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f4fffd',
      badge: 'Background workflows',
      summary: 'Run long tasks, retries, and event-driven product workflows more reliably',
      logoText: 'Td',
    },
  },
  {
    name: 'tavily',
    title: 'Tavily',
    url: 'https://tavily.com',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'agent-search', 'api-tooling', 'research'],
    content: {
      en: 'A search API built for AI applications and agents that need fresher retrieval and more controllable web-grounded responses.',
      zh: '一个面向 AI 应用和 Agent 的搜索 API，适合需要更实时检索和更可控网页 grounding 的场景。',
    },
    detail: {
      en: `Tavily becomes relevant when a team needs web retrieval as a product primitive, not just as a manual browsing habit. It fits developer tools because the real value is in giving AI systems cleaner, more controllable search and retrieval behavior inside applications and agent workflows.

If a builder is comparing grounding layers for agents, RAG-style products, or answer systems that need fresher external knowledge, Tavily is a stronger candidate than generic search references.`,
      zh: `当一个团队需要把网页检索变成产品里的基础能力，而不只是靠人工搜索时，Tavily 就会非常相关。它属于开发者工具，因为真正的价值在于：把更干净、更可控的搜索与检索能力接进应用和 Agent 工作流里。

如果一个构建者正在比较 Agent 的 grounding 层、RAG 类产品，或者需要更新鲜外部知识的回答系统，Tavily 会比泛搜索引用更值得认真看。`,
    },
    useCases: {
      en: ['Agent retrieval', 'Search-grounded answers', 'Web-aware AI apps', 'External knowledge lookup'],
      zh: ['Agent 检索', '基于搜索的回答', '具备网页感知的 AI 应用', '外部知识查询'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Search and retrieval APIs for agent and AI application workflows.' },
        {
          label: 'Best for',
          value: 'Builders who need fresh web grounding inside products, not only inside the browser.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on retrieval usefulness, developer control, and how naturally it fits agent systems.',
        },
      ],
      zh: [
        { label: '核心定位', value: '服务 Agent 与 AI 应用工作流的搜索与检索 API。' },
        { label: '更适合', value: '需要把更新鲜网页 grounding 接入产品，而不是只在浏览器里搜索的构建者。' },
        { label: '比较重点', value: '重点比较检索实用性、开发控制力，以及它是否自然融入 Agent 系统。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Agent builders', 'RAG developers', 'Teams shipping web-grounded AI features'],
        zh: ['Agent 构建者', 'RAG 开发者', '上线网页 grounding AI 功能的团队'],
      },
      notIdealFor: {
        en: ['Users only doing manual web research', 'Teams with no retrieval or grounding layer needs'],
        zh: ['只做人工网页研究的用户', '没有检索或 grounding 层需求的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a retrieval and grounding layer for AI product workflows.',
      zh: '已按“AI 产品工作流里的检索与 grounding 层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Tavily centered on productized retrieval rather than generic browsing, which is where it is most meaningfully different.',
      zh: '本条目把 Tavily 放在“产品化检索”这个位置上，这也是它和普通浏览最有本质区别的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Retrieval quality', 'Developer control', 'Agent fit'],
        zh: ['检索质量', '开发控制力', 'Agent 适配度'],
      },
      officialSummary: {
        en: 'The official site matters because the core product is API behavior and retrieval framing rather than a consumer-facing surface.',
        zh: '官网很关键，因为这个产品的核心是 API 行为和检索框架，而不是消费级界面。',
      },
      freshnessSummary: {
        en: 'Search and grounding products evolve quickly, so current API shape and retrieval behavior should still be checked live.',
        zh: '搜索与 grounding 产品变化很快，因此当前 API 形态和检索表现仍建议实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes more important once retrieval moves from experimentation into repeated production usage.',
        zh: '当检索从实验进入重复生产使用时，定价的重要性会明显上升。',
      },
      mediaSummary: {
        en: 'Preview quality matters because buyers need to tell whether the product is truly developer-facing or just concept-heavy.',
        zh: '预览很重要，因为用户需要判断它到底是开发者产品，还是只是概念很多。',
      },
      communitySummary: {
        en: 'The strongest signal is whether builders keep using it as part of live grounding or agent stacks.',
        zh: '最强的信号，是构建者是否会把它长期留在真实 grounding 或 Agent 栈里。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#0891b2',
      accentSoft: '#cffafe',
      accentStrong: '#0e7490',
      surface: '#f3fcff',
      badge: 'Agent retrieval',
      summary: 'Add fresher search and web grounding to agents and AI products',
      logoText: 'Ta',
    },
  },
  {
    name: 'together-ai',
    title: 'Together AI',
    url: 'https://www.together.ai',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['developer-tools', 'inference-platform', 'model-serving', 'developer-platform'],
    content: {
      en: 'A model platform for inference, fine-tuning, and serving open-source AI models in developer workflows.',
      zh: '一个模型平台，适合在开发工作流中做开源 AI 模型的推理、微调和服务。',
    },
    detail: {
      en: `Together AI becomes relevant when a team wants model access and deployment options that feel closer to an AI platform than a single API wrapper. It matters for developers who need to move between inference, experimentation, and serving with more flexibility around model choice.

If the job is to ship with open models, compare providers, or keep the model layer more configurable, Together AI is a meaningful candidate. The question is less about one-off prompts and more about platform fit for repeated product work.`,
      zh: `当一个团队希望模型接入和部署能力更接近“AI 平台”而不是单一 API 包装层时，Together AI 就会变得很相关。它适合那些需要在推理、实验和服务之间切换，并且希望在模型选择上保留更多灵活性的开发者。

如果真正的工作是基于开源模型交付产品、比较不同提供方，或者让模型层保持更可配置，Together AI 就是一个有意义的候选。这里的关键，不是一次 prompt，而是它是否适合反复发生的产品工作。`,
    },
    useCases: {
      en: ['Open model inference', 'Model serving', 'Fine-tuning workflows', 'Configurable AI product stacks'],
      zh: ['开源模型推理', '模型服务', '微调工作流', '可配置 AI 产品栈'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Inference and serving workflows for open-model product teams.' },
        { label: 'Best for', value: 'Builders who care about model choice and platform flexibility in production.' },
        {
          label: 'Decision angle',
          value: 'Compare on platform breadth, model flexibility, and whether it supports repeated shipping work well.',
        },
      ],
      zh: [
        { label: '核心定位', value: '服务开源模型产品团队的推理与服务工作流。' },
        { label: '更适合', value: '在生产环境中在意模型选择和平台灵活性的构建者。' },
        { label: '比较重点', value: '重点比较平台广度、模型灵活性，以及它是否适合反复交付。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['AI platform builders', 'Open-model teams', 'Developers comparing inference providers'],
        zh: ['AI 平台构建者', '开源模型团队', '比较推理提供方的开发者'],
      },
      notIdealFor: {
        en: ['Users only needing one simple API call', 'Teams that never work with open-model flexibility'],
        zh: ['只需要简单单次 API 调用的用户', '完全不需要开源模型灵活性的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a model platform and inference layer for repeated AI product delivery.',
      zh: '已按“服务持续 AI 产品交付的模型平台和推理层”来复核。',
    },
    trustNote: {
      en: 'This listing keeps Together AI centered on platform flexibility and open-model delivery, which is where it becomes most relevant.',
      zh: '本条目把 Together AI 放在平台灵活性和开源模型交付的位置上，这也是它最相关的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Platform breadth', 'Model flexibility', 'Serving fit'],
        zh: ['平台广度', '模型灵活性', '服务适配度'],
      },
      officialSummary: {
        en: 'The official surface matters because the product is defined by platform scope, model options, and deployment paths.',
        zh: '官方产品面很重要，因为这个产品本质上就是由平台范围、模型选项和部署路径来定义的。',
      },
      freshnessSummary: {
        en: 'Model coverage and serving capabilities move fast, so current platform fit should always be checked live.',
        zh: '模型覆盖和服务能力变化很快，因此当前平台适配度应始终实时确认。',
      },
      pricingSummary: {
        en: 'Pricing becomes central when inference and serving move from exploration into steady production volume.',
        zh: '当推理与服务从探索进入稳定生产规模后，定价会变得非常关键。',
      },
      mediaSummary: {
        en: 'Preview quality matters because buyers need to see whether the platform actually feels production-oriented.',
        zh: '预览很重要，因为用户需要判断这个平台是否真的有生产导向感。',
      },
      communitySummary: {
        en: 'The strongest signal is whether teams keep it in their stack as an ongoing model platform instead of a temporary experiment.',
        zh: '最强的信号，是团队是否把它长期留在模型平台栈里，而不是临时试验一下。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#7c2d12',
      accentSoft: '#ffedd5',
      accentStrong: '#9a3412',
      surface: '#fffaf5',
      badge: 'Open model platform',
      summary: 'Serve, tune, and ship open-model capabilities in product workflows',
      logoText: 'To',
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
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="800" fill="white">${escapeXml(media.logoText)}</text>
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
  <text x="156" y="524" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Editorial coverage ready</text>
  <text x="156" y="572" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Stable local media, decision framing,</text>
  <text x="156" y="606" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and category-aligned tool positioning.</text>

  <rect x="896" y="146" width="332" height="332" rx="40" fill="url(#panel-${seed.name})"/>
  <rect x="934" y="184" width="256" height="256" rx="34" fill="rgba(255,255,255,0.88)"/>
  <text x="1062" y="336" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="104" font-weight="800" fill="${media.accentStrong}">${escapeXml(media.logoText)}</text>

  <rect x="896" y="532" width="332" height="88" rx="28" fill="${media.accentSoft}"/>
  <text x="1062" y="587" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${media.accentStrong}">Published seed</text>
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

async function getCategoryIdMap() {
  const result = await query<{ id: string; slug: string }>('SELECT id, slug FROM categories');
  return new Map(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function upsertTool(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const categoryId = categoryIdMap.get(seed.categorySlug);
  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const existingResult = await query<{ tags: string[]; features: Record<string, unknown> }>(
    'SELECT tags, features FROM tools WHERE name = $1 LIMIT 1',
    [seed.name],
  );
  const existing = existingResult.rows[0];
  const existingTags = existing ? existing.tags : [];
  const existingFeatures = existing?.features && typeof existing.features === 'object' ? existing.features : {};
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

  const counts = await query<{ total: number; published: number }>(`
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
}

main()
  .catch((error) => {
    console.error('\nFailed to bootstrap web3/developer wave 18:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });

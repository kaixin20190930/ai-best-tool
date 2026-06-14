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
  categorySlug: 'productivity' | 'automation';
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
  { slug: 'sales', en: 'Sales', zh: '销售' },
  { slug: 'lead-generation', en: 'Lead Generation', zh: '获客' },
  { slug: 'prospecting', en: 'Prospecting', zh: '销售拓客' },
  { slug: 'outbound', en: 'Outbound', zh: '外联' },
  { slug: 'crm', en: 'CRM', zh: 'CRM' },
  { slug: 'sales-engagement', en: 'Sales Engagement', zh: '销售互动' },
  { slug: 'go-to-market', en: 'Go To Market', zh: 'GTM' },
  { slug: 'enrichment', en: 'Enrichment', zh: '线索补全' },
  { slug: 'email-outreach', en: 'Email Outreach', zh: '邮件外联' },
  { slug: 'contact-data', en: 'Contact Data', zh: '联系人数据' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'hunter-io',
    title: 'Hunter',
    url: 'https://hunter.io',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['sales', 'lead-generation', 'contact-data', 'outbound', 'email-outreach'],
    content: {
      en: 'A lead-generation tool for finding work emails, validating contacts, and preparing simple outbound lists faster.',
      zh: '一个用于查找工作邮箱、验证联系人并更快准备基础外联名单的获客工具。',
    },
    detail: {
      en: `Hunter matters when the goal is not a huge sales system but a faster way to get valid contact data into your hands. It is a practical fit when the workflow starts with domain-based discovery, email finding, and basic contact verification.

The real decision is whether Hunter saves enough manual prospect research to become a dependable first step in your outreach process. If your job is mostly finding and validating who to contact, it deserves a serious comparison.`,
      zh: `当目标不是搭一个庞大的销售系统，而是更快拿到可用联系人数据时，Hunter 会很有价值。它尤其适合从域名发现、邮箱查找和基础联系人验证开始的工作流。

这页真正要帮助用户判断的是：Hunter 是否足够节省人工 prospect 研究时间，成为你外联流程里一个稳定的第一步。如果你的工作主要是找人和验证能不能联系，这个工具值得被认真比较。`,
    },
    useCases: {
      en: ['Email finding', 'Contact validation', 'Simple lead lists', 'Outbound preparation'],
      zh: ['邮箱查找', '联系人验证', '基础名单准备', '外联准备'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping you find and verify work email contacts quickly before outreach starts.',
        },
        {
          label: 'Best for',
          value: 'Founders and lean teams that need usable contact data without a heavier sales stack.',
        },
        { label: 'Decision angle', value: 'Compare on contact accuracy, workflow speed, and simplicity.' },
      ],
      zh: [
        { label: '核心定位', value: '在外联开始前，更快地找到并验证工作邮箱联系人。' },
        { label: '更适合', value: '不想上重型销售系统、但需要可用联系人数据的创始人和精简团队。' },
        { label: '比较重点', value: '重点比较联系人准确性、流程速度和简单程度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Indie founders', 'Small outbound teams', 'People doing domain-based prospecting'],
        zh: ['独立开发者', '小型外联团队', '做域名式 prospecting 的用户'],
      },
      notIdealFor: {
        en: ['Teams needing deep account intelligence', 'Operators building complex routing systems'],
        zh: ['需要深度账户情报的团队', '搭建复杂分流系统的运营者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a lightweight contact-finding layer rather than a full prospecting operating system.',
      zh: '已按“轻量联系人发现层”而不是完整 prospecting 操作系统来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Hunter gets you valid contact data quickly enough to justify using it first.',
      zh: '本条目把比较重点放在：Hunter 是否足够快地提供可用联系人数据，值得成为第一步。',
    },
    decision: {
      compareAxes: {
        en: ['Contact accuracy', 'Workflow speed', 'Simplicity'],
        zh: ['联系人准确性', '流程速度', '简单程度'],
      },
      officialSummary: {
        en: 'The official site communicates the product clearly, but the deeper question is whether it fits the exact contact-finding job you do most often.',
        zh: '官网能清楚表达产品，但更深层的问题是：它是否真的适合你最常做的联系人查找任务。',
      },
      freshnessSummary: {
        en: 'Contact-data tools evolve through coverage and integrations, so exact limits and data flows should still be checked live on the official site.',
        zh: '联系人数据工具会随着覆盖面和集成变化，所以具体限制和数据流仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when repeated contact lookup and verification replaces slow manual prospecting.',
        zh: '只有当重复的联系人查找和验证能替代缓慢的人工 prospecting 时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the tool feels operationally lightweight and quick to use.',
        zh: '这里的预览很重要，因为购买者需要判断这个工具是否足够轻、足够快，适合日常操作。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether users keep using it as a repeated contact-lookup habit rather than a one-time utility.',
        zh: '最强的信号，来自用户是否会把它保留成重复使用的联系人查找习惯，而不是一次性工具。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#16a34a',
      accentSoft: '#dcfce7',
      accentStrong: '#15803d',
      surface: '#f7fff9',
      badge: 'Contact lookup',
      summary: 'Find and verify work emails faster when the first problem is simply reaching the right person.',
      logoText: 'Hu',
    },
  },
  {
    name: 'zoominfo',
    title: 'ZoomInfo',
    url: 'https://www.zoominfo.com',
    categorySlug: 'productivity',
    pricing: 'paid',
    tags: ['sales', 'lead-generation', 'contact-data', 'crm', 'go-to-market'],
    content: {
      en: 'A sales intelligence platform for account data, contact discovery, and larger-scale lead qualification workflows.',
      zh: '一个面向账户数据、联系人发现和更大规模线索筛选流程的销售情报平台。',
    },
    detail: {
      en: `ZoomInfo is most relevant when the team needs more than simple contact lookup. It fits organizations that care about account coverage, contact depth, and a broader intelligence layer feeding prospecting and revenue workflows.

The real decision is whether ZoomInfo provides enough data depth and workflow value to justify its place in your lead-generation stack. If your work depends on account research, contact discovery, and higher-volume qualification, it deserves a serious comparison.`,
      zh: `当团队需要的已经不只是简单联系人查找时，ZoomInfo 会更相关。它适合那些在意账户覆盖、联系人深度，以及能为 prospecting 和营收流程提供更广情报层的组织。

这页真正要帮助用户判断的是：ZoomInfo 是否提供了足够的数据深度和流程价值，值得放进你的获客栈里。如果你的工作依赖账户研究、联系人发现和更高量级的筛选，它值得被认真比较。`,
    },
    useCases: {
      en: ['Account research', 'Contact discovery', 'Lead qualification', 'Sales intelligence workflows'],
      zh: ['账户研究', '联系人发现', '线索筛选', '销售情报工作流'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value:
            'Helping teams work from a broader account and contact intelligence layer instead of isolated lookups.',
        },
        { label: 'Best for', value: 'Teams that need wider data coverage and more systematic lead qualification.' },
        { label: 'Decision angle', value: 'Compare on account depth, contact coverage, and workflow leverage.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队站在更完整的账户与联系人情报层上工作，而不是做零散查找。' },
        { label: '更适合', value: '需要更宽数据覆盖和更系统线索筛选的团队。' },
        { label: '比较重点', value: '重点比较账户深度、联系人覆盖和流程杠杆。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Sales teams with volume', 'Revenue ops teams', 'Organizations doing structured qualification'],
        zh: ['有一定量级的销售团队', '营收运营团队', '做结构化筛选的组织'],
      },
      notIdealFor: {
        en: ['Very early teams doing occasional outreach', 'People who only need a few emails at a time'],
        zh: ['只偶尔外联的早期团队', '一次只需要少量邮箱的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a broader sales-intelligence layer rather than a lightweight email finder.',
      zh: '已按“更宽的销售情报层”而不是轻量邮箱查找器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on account depth and qualification value, which is where ZoomInfo is most honestly judged.',
      zh: '本条目把比较重点放在账户深度和筛选价值上，这也是 ZoomInfo 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Account depth', 'Contact coverage', 'Qualification leverage'],
        zh: ['账户深度', '联系人覆盖', '筛选杠杆'],
      },
      officialSummary: {
        en: 'The official site explains the product shape, but the deeper question is whether the data depth truly matters for your actual pipeline motion.',
        zh: '官网能解释产品形态，但更深层的问题是：这层数据深度是否真的对你的 pipeline 流程有价值。',
      },
      freshnessSummary: {
        en: 'Sales-intelligence products evolve through coverage, workflows, and integrations, so exact capability coverage should still be checked live on the official site.',
        zh: '销售情报产品会随着覆盖面、流程和集成变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when account and contact intelligence drives repeated qualification work at scale.',
        zh: '只有当账户与联系人情报能反复支撑规模化筛选时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the product feels like a real intelligence workspace rather than a static database.',
        zh: '这里的预览很重要，因为购买者需要判断这更像真实情报工作台，而不是静态数据库。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it to support qualification and targeting decisions over time.',
        zh: '最强的信号，来自团队是否会长期用它支撑筛选和定向决策。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#1d4ed8',
      accentSoft: '#dbeafe',
      accentStrong: '#1e40af',
      surface: '#f8fbff',
      badge: 'Sales intelligence',
      summary: 'Use broader account and contact intelligence when lead qualification needs more than simple lookups.',
      logoText: 'Zi',
    },
  },
  {
    name: 'cognism',
    title: 'Cognism',
    url: 'https://www.cognism.com',
    categorySlug: 'productivity',
    pricing: 'paid',
    tags: ['sales', 'lead-generation', 'contact-data', 'prospecting', 'go-to-market'],
    content: {
      en: 'A B2B prospecting and contact-data platform for building cleaner outbound lists and qualifying buyers faster.',
      zh: '一个面向 B2B prospecting 和联系人数据的工具，用来更快建立更干净的外联名单并筛选买家。',
    },
    detail: {
      en: `Cognism is relevant when the team wants prospecting data to feel cleaner, more targeted, and more useful inside outbound workflows. It fits B2B teams that need better contact data and more confidence in who is worth contacting next.

The real decision is whether Cognism makes list quality and qualification meaningfully better than lighter data tools. If your workflow depends on cleaner outbound targeting and structured B2B prospecting, it deserves a serious comparison.`,
      zh: `当团队希望 prospecting 数据更干净、更有针对性、并且在外联流程里更有用时，Cognism 会变得相关。它适合那些需要更好联系人数据、也更想确认“下一个值得联系的人是谁”的 B2B 团队。

这页真正要帮助用户判断的是：相比更轻的数据工具，Cognism 是否实质性提升了名单质量和筛选效果。如果你的流程依赖更干净的外联定向和结构化 B2B prospecting，它值得被认真比较。`,
    },
    useCases: {
      en: ['B2B targeting', 'Outbound list building', 'Contact qualification', 'Prospecting prep'],
      zh: ['B2B 定向', '外联名单建立', '联系人筛选', 'prospecting 准备'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping B2B teams build cleaner prospect lists and stronger targeting before outreach begins.',
        },
        {
          label: 'Best for',
          value: 'Teams that care about data cleanliness and more confident prospect qualification.',
        },
        { label: 'Decision angle', value: 'Compare on list quality, buyer-fit confidence, and prospecting readiness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助 B2B 团队在外联开始前，建立更干净的 prospect 名单和更强的目标定向。' },
        { label: '更适合', value: '在意数据干净度和 prospect 筛选把握感的团队。' },
        { label: '比较重点', value: '重点比较名单质量、买家匹配把握和 prospecting 准备度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['B2B sales teams', 'Outbound operators', 'Teams improving buyer targeting'],
        zh: ['B2B 销售团队', '外联运营者', '优化买家定向的团队'],
      },
      notIdealFor: {
        en: ['Very casual prospecting', 'Teams mainly needing post-lead follow-up tools'],
        zh: ['非常随意的 prospecting 场景', '主要需要线索后续跟进工具的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a B2B list-quality and qualification layer rather than a broad sales suite.',
      zh: '已按“B2B 名单质量与筛选层”而不是大而全销售套件来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Cognism gives you cleaner targeting and better qualification confidence.',
      zh: '本条目把比较重点放在 Cognism 是否带来更干净的定向和更强的筛选把握上。',
    },
    decision: {
      compareAxes: {
        en: ['List quality', 'Buyer-fit confidence', 'Prospecting readiness'],
        zh: ['名单质量', '买家匹配把握', 'prospecting 准备度'],
      },
      officialSummary: {
        en: 'The official site is useful, but the deeper question is whether the added targeting confidence actually improves your outbound decisions.',
        zh: '官网有帮助，但更深层的问题是：这层额外定向把握，是否真的改善了你的外联决策。',
      },
      freshnessSummary: {
        en: 'B2B prospecting data tools evolve through coverage and workflow layers, so exact capability coverage should still be checked live on the official site.',
        zh: 'B2B prospecting 数据工具会随着覆盖面和流程层变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when cleaner buyer targeting materially improves who enters the outbound queue.',
        zh: '只有当更干净的买家定向能实质改善“谁进入外联队列”时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the workflow feels like real targeting support instead of another contact list.',
        zh: '这里的预览很重要，因为购买者需要判断它更像真实定向支持，而不是另一张联系人表。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it to improve who gets targeted, not only how many names they collect.',
        zh: '最强的信号，来自团队是否会继续用它改善“联系谁”，而不只是“收集多少名字”。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#115e59',
      surface: '#f4fffd',
      badge: 'B2B targeting',
      summary: 'Improve list cleanliness and buyer targeting when outbound quality matters more than raw name volume.',
      logoText: 'Co',
    },
  },
  {
    name: 'outreach',
    title: 'Outreach',
    url: 'https://www.outreach.io',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'sales-engagement', 'crm'],
    content: {
      en: 'A sales-engagement platform for structured outreach, sequence management, follow-up operations, and pipeline-facing prospecting work.',
      zh: '一个面向结构化外联、序列管理、跟进运营和贴近 pipeline 的 prospecting 工作的销售互动平台。',
    },
    detail: {
      en: `Outreach becomes relevant when prospecting is already a formal revenue motion rather than an ad hoc founder task. It fits teams that need structured sequences, coordinated follow-up, and a workflow that connects outreach with broader pipeline operations.

The real decision is whether Outreach improves the discipline and maintainability of your prospecting system. If your work depends on coordinated sequences, follow-up control, and team-level outreach flow, it deserves a serious comparison.`,
      zh: `当 prospecting 已经不再是临时性的创始人动作，而是正式的营收流程时，Outreach 会变得相关。它适合那些需要结构化序列、协调式跟进，以及把外联和更大 pipeline 运营连接起来的团队。

这页真正要帮助用户判断的是：Outreach 是否提升了你的 prospecting 系统的纪律性和可维护性。如果你的工作依赖协调序列、跟进控制和团队级外联流，它值得被认真比较。`,
    },
    useCases: {
      en: ['Sequence management', 'Team outreach operations', 'Follow-up control', 'Pipeline-facing prospecting'],
      zh: ['序列管理', '团队外联运营', '跟进控制', '贴近 pipeline 的 prospecting'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping teams run structured, repeatable outreach systems instead of ad hoc prospecting bursts.',
        },
        {
          label: 'Best for',
          value: 'Teams that need prospecting execution to connect tightly with broader revenue operations.',
        },
        { label: 'Decision angle', value: 'Compare on sequence discipline, team workflow, and maintainability.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队运行结构化、可重复的外联系统，而不是临时式 prospecting 冲刺。' },
        { label: '更适合', value: '希望把 prospecting 执行和更广的营收运营紧密连接起来的团队。' },
        { label: '比较重点', value: '重点比较序列纪律性、团队工作流和可维护性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Revenue teams', 'Sales teams with process', 'Organizations managing structured follow-up'],
        zh: ['营收团队', '流程化销售团队', '管理结构化跟进的组织'],
      },
      notIdealFor: {
        en: ['Very small teams doing occasional outreach', 'People mainly needing list discovery first'],
        zh: ['只偶尔外联的很小团队', '主要先需要名单发现的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a structured outreach operating layer rather than a lightweight message sender.',
      zh: '已按“结构化外联运营层”而不是轻量消息发送器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on sequence discipline and workflow maintainability, which is where Outreach is most honestly judged.',
      zh: '本条目把比较重点放在序列纪律性和流程维护性上，这也是 Outreach 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Sequence discipline', 'Workflow maintainability', 'Team coordination'],
        zh: ['序列纪律性', '流程维护性', '团队协作'],
      },
      officialSummary: {
        en: 'The official site explains the platform well, but the deeper question is whether it matches the way your team actually runs prospecting at scale.',
        zh: '官网能较好解释平台，但更深层的问题是：它是否真的匹配你团队规模化跑 prospecting 的方式。',
      },
      freshnessSummary: {
        en: 'Sales-engagement platforms evolve through workflow layers and integrations, so exact capability coverage should still be checked live on the official site.',
        zh: '销售互动平台会随着流程层和集成变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when structured follow-up and coordinated outreach already sit at the core of the revenue workflow.',
        zh: '只有当结构化跟进和协调外联已经处在营收流程核心时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the interface feels like a real operating surface for team prospecting.',
        zh: '这里的预览很重要，因为购买者需要判断这个界面是否像一个真正支撑团队 prospecting 的运营工作台。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it in the live revenue process instead of treating it as an optional side tool.',
        zh: '最强的信号，来自团队是否会把它持续放在真实营收流程里，而不是把它当成可有可无的边缘工具。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#fbf9ff',
      badge: 'Structured outreach',
      summary:
        'Run prospecting sequences and follow-up with more discipline once outbound becomes a real team workflow.',
      logoText: 'Ou',
    },
  },
  {
    name: 'salesloft',
    title: 'Salesloft',
    url: 'https://www.salesloft.com',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'sales-engagement', 'crm'],
    content: {
      en: 'A sales-engagement platform for prospecting cadences, follow-up systems, and team-level outbound workflow management.',
      zh: '一个面向 prospecting cadence、跟进系统和团队级外联流程管理的销售互动平台。',
    },
    detail: {
      en: `Salesloft is most relevant when the team wants more structure around how outreach is sequenced, tracked, and maintained. It fits organizations that need prospecting to feel like a consistent operating motion instead of a loose set of messages.

The real decision is whether Salesloft makes your outbound workflow clearer and easier to manage across people and stages. If your work depends on cadences, coordination, and sequence upkeep, it deserves a serious comparison.`,
      zh: `当团队希望对外联如何被编排、追踪和维护拥有更多结构时，Salesloft 会更相关。它适合那些希望 prospecting 更像稳定的运营动作，而不是一组松散消息的组织。

这页真正要帮助用户判断的是：Salesloft 是否让你的 outbound 工作流在不同人和不同阶段之间更清晰、更容易管理。如果你的工作依赖 cadence、协作和序列维护，它值得被认真比较。`,
    },
    useCases: {
      en: ['Prospecting cadences', 'Follow-up systems', 'Sequence upkeep', 'Outbound team workflow'],
      zh: ['prospecting cadence', '跟进系统', '序列维护', '团队外联工作流'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping teams turn prospecting into a more maintainable cadence-driven workflow.',
        },
        {
          label: 'Best for',
          value: 'Organizations that care about consistent outreach execution across teams and stages.',
        },
        { label: 'Decision angle', value: 'Compare on cadence clarity, sequence upkeep, and team workflow fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队把 prospecting 变成更可维护、以 cadence 驱动的工作流。' },
        { label: '更适合', value: '在意跨团队、跨阶段一致执行外联的组织。' },
        { label: '比较重点', value: '重点比较 cadence 清晰度、序列维护和团队流程适配。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Process-driven sales teams', 'Outbound managers', 'Organizations standardizing prospecting'],
        zh: ['流程型销售团队', '外联负责人', '标准化 prospecting 的组织'],
      },
      notIdealFor: {
        en: ['Solo founders still testing messaging manually', 'Teams whose bigger problem is list sourcing'],
        zh: ['还在手工测试消息的单人创始人', '更大问题仍是名单来源的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a cadence-and-maintenance layer for outbound teams rather than a generic messaging app.',
      zh: '已按“外联团队的 cadence 与维护层”而不是通用消息应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on cadence clarity and long-term workflow maintenance, which is where Salesloft is most honestly judged.',
      zh: '本条目把比较重点放在 cadence 清晰度和长期流程维护上，这也是 Salesloft 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Cadence clarity', 'Workflow upkeep', 'Team standardization'],
        zh: ['cadence 清晰度', '流程维护', '团队标准化'],
      },
      officialSummary: {
        en: 'The official site is useful, but the deeper question is whether Salesloft genuinely simplifies the way your team runs prospecting at scale.',
        zh: '官网有帮助，但更深层的问题是：Salesloft 是否真的简化了你团队规模化运行 prospecting 的方式。',
      },
      freshnessSummary: {
        en: 'Sales-engagement systems evolve through workflow and coordination layers, so exact capability coverage should still be checked live on the official site.',
        zh: '销售互动系统会随着流程和协作层变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when the team is already investing in standardized outbound process rather than one-off experimentation.',
        zh: '只有当团队已经在投入标准化 outbound 流程，而不是做一次性实验时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the product feels durable enough for repeated team use.',
        zh: '这里的预览很重要，因为购买者需要判断这个产品是否足够稳，能支持团队反复使用。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it in their weekly outbound routine instead of falling back to looser tools.',
        zh: '最强的信号，来自团队是否会把它留在每周 outbound 节奏里，而不是退回更松散的工具。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#ea580c',
      accentSoft: '#ffedd5',
      accentStrong: '#c2410c',
      surface: '#fffaf5',
      badge: 'Cadence workflow',
      summary: 'Keep prospecting cadence, follow-up, and sequence maintenance clearer across a growing outbound team.',
      logoText: 'Sa',
    },
  },
  {
    name: 'snov-io',
    title: 'Snov.io',
    url: 'https://snov.io',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['sales', 'lead-generation', 'prospecting', 'email-outreach', 'automation'],
    content: {
      en: 'A lead-generation and outreach tool combining email finding, contact validation, and lighter outbound workflows.',
      zh: '一个把邮箱查找、联系人验证和轻量外联工作流结合在一起的获客与外联工具。',
    },
    detail: {
      en: `Snov.io is relevant when the team wants one lighter surface for finding contacts and moving directly into simple outreach. It sits in the middle ground between pure contact lookup tools and heavier sales-engagement systems.

The real decision is whether Snov.io is enough for your workflow without forcing you into a larger outbound stack too early. If your job blends lead discovery with lighter outreach execution, it deserves a serious comparison.`,
      zh: `当团队想要一个更轻的工作台，既能找联系人、又能直接进入基础外联时，Snov.io 会很相关。它处在纯联系人查找工具和更重型销售互动系统之间的中间地带。

这页真正要帮助用户判断的是：在不太早引入更大 outbound 栈的前提下，Snov.io 是否已经足够满足你的流程。如果你的工作既包含 lead 发现，也包含轻量外联执行，它值得被认真比较。`,
    },
    useCases: {
      en: ['Email finding', 'Lead discovery', 'Light outreach', 'Contact validation'],
      zh: ['邮箱查找', 'lead 发现', '轻量外联', '联系人验证'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping smaller teams move from contact lookup into simple outreach without too much stack overhead.',
        },
        {
          label: 'Best for',
          value: 'People who want one lighter system for lead discovery plus basic outbound preparation.',
        },
        { label: 'Decision angle', value: 'Compare on simplicity, contact workflow, and lightweight execution fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助较小团队在不堆太多栈的情况下，从联系人查找走到基础外联。' },
        { label: '更适合', value: '希望用一个更轻系统同时完成 lead 发现和基础外联准备的人。' },
        { label: '比较重点', value: '重点比较简单程度、联系人工作流和轻量执行适配。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Lean outbound teams', 'Founders doing simple outreach', 'Teams avoiding heavier platforms at first'],
        zh: ['精简外联团队', '做基础外联的创始人', '前期不想上重平台的团队'],
      },
      notIdealFor: {
        en: ['Organizations needing deep sales orchestration', 'Teams wanting enterprise-scale workflow control'],
        zh: ['需要深度销售编排的组织', '想要企业级流程控制的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a lighter bridge between contact finding and outreach, not as a full enterprise prospecting system.',
      zh: '已按“联系人查找到外联之间的轻量桥梁”而不是完整企业级 prospecting 系统来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Snov.io is enough for the workflow before a heavier stack becomes necessary.',
      zh: '本条目把比较重点放在：在更重栈变得必要之前，Snov.io 是否已经足够支撑流程。',
    },
    decision: {
      compareAxes: {
        en: ['Simplicity', 'Contact workflow', 'Lightweight execution'],
        zh: ['简单程度', '联系人工作流', '轻量执行'],
      },
      officialSummary: {
        en: 'The official site is useful, but the deeper question is whether this middle-ground workflow is actually the right tradeoff for your team.',
        zh: '官网有帮助，但更深层的问题是：这种中间地带工作流是否真的是你团队想要的取舍。',
      },
      freshnessSummary: {
        en: 'Lead and outreach hybrids evolve through workflow packaging and feature balance, so exact capability coverage should still be checked live on the official site.',
        zh: '获客与外联混合工具会随着流程包装和功能平衡变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when one lighter product can replace multiple smaller steps in your lead-discovery workflow.',
        zh: '只有当一个更轻的产品能替代你 lead 发现流程里的多个小步骤时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the workflow feels coherent rather than stretched across too many half-features.',
        zh: '这里的预览很重要，因为购买者需要判断这个流程是否足够连贯，而不是由很多半成品功能拼起来。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it as a daily workflow instead of treating it as a temporary bridge.',
        zh: '最强的信号，来自团队是否会把它保留为日常流程，而不是临时过渡工具。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#0891b2',
      accentSoft: '#cffafe',
      accentStrong: '#0e7490',
      surface: '#f4feff',
      badge: 'Light outreach stack',
      summary: 'Combine email lookup and lighter outbound work when you want a smaller, more practical sales stack.',
      logoText: 'Sn',
    },
  },
];

function loadLocalEnv() {
  const envPath = path.join(ROOT, '.env.local');
  const envText = fs.readFileSync(envPath, 'utf8');

  for (const line of envText.split('\n')) {
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

function normalizeStringArray(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function mergeTags(existing: unknown, next: string[]) {
  return Array.from(new Set([...normalizeStringArray(existing), ...next]));
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createLogoSvg(seed: ToolSeed) {
  const { accent, accentSoft, accentStrong, logoText } = seed.media;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${seed.name}" x1="24" y1="24" x2="224" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bg-${seed.name})"/>
  <rect x="24" y="24" width="208" height="208" rx="42" fill="rgba(255,255,255,0.84)"/>
  <rect x="46" y="46" width="164" height="164" rx="38" fill="${accentStrong}"/>
  <circle cx="78" cy="78" r="10" fill="rgba(255,255,255,0.24)"/>
  <circle cx="180" cy="182" r="12" fill="rgba(255,255,255,0.18)"/>
  <text x="128" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="white">${escapeXml(logoText)}</text>
</svg>
`;
}

function createCoverSvg(seed: ToolSeed) {
  const { category, accent, accentSoft, accentStrong, surface, badge, summary, logoText } = seed.media;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="800" viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="canvas-${seed.name}" x1="80" y1="56" x2="1286" y2="748" gradientUnits="userSpaceOnUse">
      <stop stop-color="${surface}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="panel-${seed.name}" x1="886" y1="148" x2="1238" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accentSoft}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="800" rx="44" fill="url(#canvas-${seed.name})"/>
  <circle cx="1246" cy="122" r="132" fill="${accentSoft}" fill-opacity="0.78"/>
  <circle cx="1134" cy="640" r="176" fill="${accentSoft}" fill-opacity="0.52"/>
  <rect x="64" y="64" width="1272" height="672" rx="34" fill="white" stroke="#e2e8f0" stroke-width="2"/>

  <rect x="118" y="126" width="262" height="46" rx="23" fill="${accentSoft}"/>
  <text x="249" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${accentStrong}">${escapeXml(category)}</text>

  <text x="118" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${escapeXml(seed.title)}</text>
  <text x="118" y="320" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${accentStrong}">${escapeXml(badge)}</text>
  <text x="118" y="394" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(summary)}</text>

  <rect x="118" y="470" width="548" height="176" rx="30" fill="${surface}" stroke="${accentSoft}" stroke-width="2"/>
  <text x="160" y="532" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps this page stable across deploys</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and avoids broken remote logos or screenshots.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${accentStrong}">${escapeXml(logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${accentStrong}">Editorial media ready</text>
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
  const result = await query('SELECT id, slug FROM categories');
  return new Map<string, string>(result.rows.map((row) => [String(row.slug), String(row.id)]));
}

async function ensureTool(seed: ToolSeed, categoryId: string) {
  await query(
    `
      INSERT INTO tools (
        name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, status, features, use_cases
      )
      VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9::text[], $10, 'published', $11::jsonb, $12::jsonb)
      ON CONFLICT (name)
      DO NOTHING
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
      seed.tags,
      seed.pricing,
      JSON.stringify({ mediaReview: { needed: false, source: 'local-editorial-media' } }),
      JSON.stringify(seed.useCases),
    ],
  );
}

async function applySeed(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const categoryId = categoryIdMap.get(seed.categorySlug);
  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  await ensureTool(seed, categoryId);

  const result = await query('SELECT id, tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (result.rowCount === 0) {
    throw new Error(`Missing tool after ensure: ${seed.name}`);
  }

  const row = result.rows[0];
  const features = row.features && typeof row.features === 'object' ? (row.features as Record<string, unknown>) : {};
  const existingDecision =
    features.decision && typeof features.decision === 'object' ? (features.decision as Record<string, unknown>) : {};
  const mediaReview =
    features.mediaReview && typeof features.mediaReview === 'object'
      ? (features.mediaReview as Record<string, unknown>)
      : {};

  const nextFeatures = {
    ...features,
    localized: {
      en: seed.features.en,
      zh: seed.features.zh,
    },
    audience: seed.audience,
    editorial: {
      reviewedAt,
      reviewedBy: 'AI Best Tool Editorial',
      summary: seed.editorialSummary,
      trustNote: seed.trustNote,
    },
    decision: {
      ...existingDecision,
      compareAxes: seed.decision.compareAxes,
      officialSummary: seed.decision.officialSummary,
      freshnessSummary: seed.decision.freshnessSummary,
      pricingSummary: seed.decision.pricingSummary,
      mediaSummary: seed.decision.mediaSummary,
      communitySummary: seed.decision.communitySummary,
    },
    mediaReview: {
      ...mediaReview,
      needed: false,
      reason: 'Locally hosted editorial media kit added for stable logo and preview coverage.',
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
        category_id = $8,
        tags = $9::text[],
        pricing = $10,
        features = $11::jsonb,
        use_cases = $12::jsonb,
        status = 'published',
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      row.id,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      new URL(seed.url).toString(),
      `/icons/tool-logos/${seed.name}.svg`,
      `/images/tool-media/${seed.name}-cover.svg`,
      categoryId,
      mergeTags(row.tags, seed.tags),
      seed.pricing,
      JSON.stringify(nextFeatures),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- updated ${seed.name}`);
}

async function main() {
  loadLocalEnv();
  fs.mkdirSync(COVER_DIR, { recursive: true });
  fs.mkdirSync(LOGO_DIR, { recursive: true });

  for (const seed of TOOLS) {
    fs.writeFileSync(path.join(LOGO_DIR, `${seed.name}.svg`), createLogoSvg(seed), 'utf8');
    fs.writeFileSync(path.join(COVER_DIR, `${seed.name}-cover.svg`), createCoverSvg(seed), 'utf8');
  }

  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();
  const reviewedAt = new Date().toISOString();

  for (const seed of TOOLS) {
    await applySeed(seed, categoryIdMap, reviewedAt);
  }

  console.log(`\nDone. Updated ${TOOLS.length} additional sales/growth entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await closePool();
  } catch {
    // ignore
  }
  process.exit(1);
});

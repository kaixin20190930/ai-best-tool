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
  categorySlug: 'text-writing';
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
  { slug: 'seo', en: 'SEO', zh: 'SEO' },
  { slug: 'ai-writing', en: 'AI Writing', zh: 'AI 写作' },
  { slug: 'copywriting', en: 'Copywriting', zh: '文案写作' },
  { slug: 'content-optimization', en: 'Content Optimization', zh: '内容优化' },
  { slug: 'content-strategy', en: 'Content Strategy', zh: '内容策略' },
  { slug: 'content-briefs', en: 'Content Briefs', zh: '内容 Brief' },
  { slug: 'topical-authority', en: 'Topical Authority', zh: '主题权威' },
  { slug: 'brand-voice', en: 'Brand Voice', zh: '品牌语气' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'copy-ai',
    title: 'Copy.ai',
    url: 'https://www.copy.ai',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'copywriting', 'content-strategy'],
    content: {
      en: 'An AI writing and go-to-market workflow platform for drafting sales, marketing, and campaign content faster.',
      zh: '一个面向销售、营销和活动内容的 AI 写作与 GTM 工作流平台，用来更快完成文案起草与协作。',
    },
    detail: {
      en: `Copy.ai is strongest when the writing problem is tied to go-to-market execution rather than pure long-form authorship. It helps teams turn repetitive campaign, prospecting, and messaging work into something more structured and repeatable.

The real decision is whether Copy.ai meaningfully reduces the writing burden inside your marketing or revenue workflow. If the work involves campaign copy, outbound messages, sales enablement, or repeatable GTM content, it deserves a serious comparison.`,
      zh: `当写作问题更偏向于 GTM 执行，而不是纯粹长文创作时，Copy.ai 会更有价值。它帮助团队把重复的活动文案、外联消息和营销沟通，变成更结构化、更可复用的工作流。

这页真正要帮助用户判断的是：Copy.ai 是否实质性减轻了你在营销或营收流程中的写作负担。如果你的工作涉及活动文案、外联消息、销售赋能或可重复的 GTM 内容，它值得被认真比较。`,
    },
    useCases: {
      en: ['Campaign copy', 'Outbound messaging', 'Sales enablement', 'GTM content operations'],
      zh: ['活动文案', '外联消息', '销售赋能', 'GTM 内容运营'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping revenue and marketing teams create repeatable messaging workflows instead of isolated drafts.' },
        { label: 'Best for', value: 'Teams shipping campaigns, outbound flows, and structured go-to-market content.' },
        { label: 'Decision angle', value: 'Compare on workflow fit, messaging speed, and team repeatability.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助营收和营销团队构建可重复的消息工作流，而不是只产出孤立草稿。' },
        { label: '更适合', value: '需要交付活动、外联流程和结构化 GTM 内容的团队。' },
        { label: '比较重点', value: '重点比较工作流适配、出稿速度和团队复用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Marketing teams', 'Sales teams', 'Operators building GTM systems'],
        zh: ['营销团队', '销售团队', '搭建 GTM 系统的运营者'],
      },
      notIdealFor: {
        en: ['Writers focused on fiction or essays', 'Teams only needing final-pass grammar cleanup'],
        zh: ['专注小说或随笔写作的作者', '只需要最终语法润色的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a GTM writing workflow tool rather than a generic AI drafting box.',
      zh: '已按“GTM 写作工作流工具”而不是通用 AI 起草框来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on workflow usefulness and repeatable messaging output, which is where Copy.ai is most honestly judged.',
      zh: '本条目把比较重点放在工作流实用性和可重复消息产出上，这也是 Copy.ai 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow fit', 'Messaging speed', 'Repeatable output'],
        zh: ['工作流适配', '出稿速度', '可重复产出'],
      },
      officialSummary: {
        en: 'The official site frames the platform well, but the deeper question is whether it actually fits your revenue and marketing motion.',
        zh: '官网有助于理解平台定位，但更深层的问题是：它是否真的适合你的营收和营销动作。',
      },
      freshnessSummary: {
        en: 'Writing workflow products evolve through templates and automation layers, so exact capability coverage should still be checked live on the official site.',
        zh: '写作工作流产品会随着模板和自动化层变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes sense when repeated campaign and outbound writing is frequent enough to save real team time.',
        zh: '只有当活动和外联写作足够频繁、能真实节省团队时间时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the workflow is operationally useful, not just prompt-driven.',
        zh: '这里的预览很重要，因为购买者需要判断这个工作流到底是运营上实用的，还是只是 prompt 驱动的展示。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it across repeated campaign cycles.',
        zh: '最强的信号，来自团队是否会在一轮又一轮活动周期里继续使用它。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf8ff',
      badge: 'GTM content workflows',
      summary: 'Create repeatable campaign, outbound, and revenue-writing workflows with less manual drafting overhead.',
      logoText: 'Ca',
    },
  },
  {
    name: 'jasper',
    title: 'Jasper',
    url: 'https://www.jasper.ai',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'brand-voice', 'copywriting'],
    content: {
      en: 'An AI writing platform for brand-safe marketing content, campaign execution, and team-level content production.',
      zh: '一个面向品牌一致性营销内容、活动执行和团队级内容生产的 AI 写作平台。',
    },
    detail: {
      en: `Jasper is most relevant when a team cares about brand voice, campaign consistency, and content throughput more than casual AI drafting. It fits teams that want structured marketing output rather than just another writing assistant tab.

The real decision is whether Jasper helps your team scale branded content without losing consistency. If the work includes campaigns, brand-led messaging, and coordinated content production, it deserves a serious comparison.`,
      zh: `当团队更在意品牌语气、活动一致性和内容产能，而不是随手 AI 起草时，Jasper 会更有价值。它适合那些想放大结构化营销产出，而不只是多一个写作助手标签页的团队。

这页真正要帮助用户判断的是：Jasper 是否能帮助你的团队在不丢失品牌一致性的情况下扩大内容生产。如果你的工作包含活动、品牌主导信息和协同内容生产，它值得被认真比较。`,
    },
    useCases: {
      en: ['Brand campaigns', 'Content production', 'Marketing operations', 'Team writing workflows'],
      zh: ['品牌活动', '内容生产', '营销运营', '团队写作工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams produce more branded marketing content without losing tone consistency.' },
        { label: 'Best for', value: 'Marketing teams coordinating multi-channel campaigns and repeatable content systems.' },
        { label: 'Decision angle', value: 'Compare on brand consistency, production speed, and team workflow depth.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队在不丢失语气一致性的前提下扩大品牌营销内容生产。' },
        { label: '更适合', value: '协调多渠道活动和可重复内容系统的营销团队。' },
        { label: '比较重点', value: '重点比较品牌一致性、生产速度和团队工作流深度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Brand marketers', 'Content teams', 'Marketing leads managing approvals'],
        zh: ['品牌营销人员', '内容团队', '管理审批流的营销负责人'],
      },
      notIdealFor: {
        en: ['Users only wanting simple rewriting', 'Solo users who do not care about brand governance'],
        zh: ['只想要简单改写的用户', '并不关心品牌治理的个人用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a branded content production system rather than a general-purpose AI writer.',
      zh: '已按“品牌内容生产系统”而不是通用 AI 写手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on brand consistency and team throughput, which is where Jasper is most honestly judged.',
      zh: '本条目把比较重点放在品牌一致性和团队产能上，这也是 Jasper 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Brand consistency', 'Production speed', 'Team workflow depth'],
        zh: ['品牌一致性', '生产速度', '团队工作流深度'],
      },
      officialSummary: {
        en: 'The official site explains the platform well, but the deeper question is whether Jasper really improves how your team ships branded content together.',
        zh: '官网能清楚解释平台定位，但更深层的问题是：Jasper 是否真的改善了你团队协同交付品牌内容的方式。',
      },
      freshnessSummary: {
        en: 'Content operations tools evolve through workflows and templates, so exact capability coverage should always be checked on the official site.',
        zh: '内容运营工具会随着工作流和模板变化，所以具体能力覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when multiple people repeatedly produce branded content and consistency really matters.',
        zh: '只有当多人反复产出品牌内容、且一致性真的重要时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because teams need to judge whether the product looks like a real operating surface, not just a prompt playground.',
        zh: '这里的预览很重要，因为团队需要判断这个产品更像真实工作台，而不是一个 prompt 游乐场。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it in the content workflow after the first campaign.',
        zh: '最强的信号，来自团队在第一轮活动之后，是否还会继续把它留在内容工作流里。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Brand-safe marketing',
      summary: 'Scale branded campaigns and content systems without losing consistency across the team.',
      logoText: 'Ja',
    },
  },
  {
    name: 'surfer',
    title: 'Surfer',
    url: 'https://surferseo.com',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['seo', 'content-optimization', 'ai-writing'],
    content: {
      en: 'An SEO content optimization platform for briefs, SERP-guided writing, and on-page improvement workflows.',
      zh: '一个面向内容 Brief、SERP 引导写作和页面优化流程的 SEO 内容优化平台。',
    },
    detail: {
      en: `Surfer is strongest when the writing problem is not “how do I write something” but “how do I make this article more competitive in search.” It fits content teams that need SEO feedback loops built directly into drafting and updating workflows.

The real decision is whether Surfer helps you turn search intent and SERP structure into more actionable writing decisions. If the work involves content briefs, search-driven updates, or on-page optimization, it deserves a serious comparison.`,
      zh: `当写作问题不再是“怎么写一篇文章”，而是“怎么让这篇文章在搜索里更能打”时，Surfer 就会更有价值。它适合那些想把 SEO 反馈回路直接嵌进写作和更新流程的内容团队。

这页真正要帮助用户判断的是：Surfer 是否帮助你把搜索意图和 SERP 结构转成更可执行的写作决策。如果你的工作涉及内容 Brief、搜索驱动更新或页面优化，它值得被认真比较。`,
    },
    useCases: {
      en: ['SEO briefs', 'SERP-guided writing', 'Content refreshes', 'On-page optimization'],
      zh: ['SEO Brief', 'SERP 引导写作', '内容更新', '页面优化'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams align writing decisions with search competition and optimization signals.' },
        { label: 'Best for', value: 'Content teams and operators running search-driven publishing workflows.' },
        { label: 'Decision angle', value: 'Compare on optimization clarity, brief usefulness, and update workflow fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队让写作决策更贴近搜索竞争和优化信号。' },
        { label: '更适合', value: '运行搜索驱动发布流程的内容团队和运营者。' },
        { label: '比较重点', value: '重点比较优化清晰度、Brief 实用性和更新流程适配。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO content teams', 'Affiliate publishers', 'Growth operators updating articles'],
        zh: ['SEO 内容团队', '联盟内容发布者', '更新文章的增长运营者'],
      },
      notIdealFor: {
        en: ['Writers unconcerned with search traffic', 'Teams only needing grammar polish'],
        zh: ['并不关心搜索流量的作者', '只需要语法润色的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an SEO optimization workflow rather than a pure drafting assistant.',
      zh: '已按“SEO 优化工作流”而不是纯起草助手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on search competitiveness and update workflow value, which is where Surfer is most honestly judged.',
      zh: '本条目把比较重点放在搜索竞争力和更新流程价值上，这也是 Surfer 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Optimization clarity', 'Brief usefulness', 'Update workflow fit'],
        zh: ['优化清晰度', 'Brief 实用性', '更新流程适配'],
      },
      officialSummary: {
        en: 'The official site is a good checkpoint, but the deeper question is whether Surfer actually improves your search-facing editorial decisions.',
        zh: '官网是一个不错的检查点，但更深层的问题是：Surfer 是否真的改善了你面向搜索的编辑决策。',
      },
      freshnessSummary: {
        en: 'SEO tools shift with SERP behavior and workflow packaging, so exact features should always be checked live on the official site.',
        zh: 'SEO 工具会随着 SERP 行为和工作流包装持续变化，所以具体功能始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing becomes easier to justify when content refreshes and SEO publishing happen often enough to compound.',
        zh: '只有当内容更新和 SEO 发布足够频繁、能够形成复利时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the optimization layer looks genuinely actionable.',
        zh: '这里的预览很重要，因为购买者需要判断这个优化层到底是否真的可执行。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it across refresh cycles, not just for first drafts.',
        zh: '最强的信号，来自团队是否会在一轮又一轮内容更新中持续使用它，而不只是首稿阶段。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f4fffd',
      badge: 'Search-focused optimization',
      summary: 'Write and refresh pages with more direct feedback from search structure and competitive SERPs.',
      logoText: 'Su',
    },
  },
  {
    name: 'frase',
    title: 'Frase',
    url: 'https://www.frase.io',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['seo', 'content-briefs', 'ai-writing'],
    content: {
      en: 'An SEO writing workflow for content briefs, search-informed drafting, and article optimization.',
      zh: '一个面向内容 Brief、搜索驱动起草和文章优化的 SEO 写作工作流工具。',
    },
    detail: {
      en: `Frase is most useful when a team wants brief generation and writing support to sit closer together instead of living in separate SEO and writing tools. It fits operators who want to move from topic discovery to structured draft support with less handoff friction.

The real decision is whether Frase shortens the path from keyword idea to publishable content plan. If the work involves briefs, article structure, and SEO-aligned drafting, it deserves a serious comparison.`,
      zh: `当团队希望“内容 Brief 生成”和“写作支持”更紧密地放在一起，而不是拆在不同 SEO 与写作工具里时，Frase 就会很有价值。它适合那些想用更少交接摩擦，把关键词想法转成结构化稿件方案的运营者。

这页真正要帮助用户判断的是：Frase 是否缩短了从关键词想法走到可发布内容计划的路径。如果你的工作涉及 Brief、文章结构和 SEO 对齐写作，它值得被认真比较。`,
    },
    useCases: {
      en: ['Content briefs', 'SEO article plans', 'Search-aligned drafts', 'Content refresh workflows'],
      zh: ['内容 Brief', 'SEO 文章规划', '搜索对齐起稿', '内容更新流程'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Combining brief generation and writing workflow support into one SEO-oriented surface.' },
        { label: 'Best for', value: 'Operators moving quickly from topics and keywords into structured article plans.' },
        { label: 'Decision angle', value: 'Compare on brief quality, drafting support, and workflow compactness.' },
      ],
      zh: [
        { label: '核心定位', value: '把 Brief 生成和写作支持合并到一个 SEO 导向的工作台里。' },
        { label: '更适合', value: '希望快速从主题、关键词进入结构化文章方案的运营者。' },
        { label: '比较重点', value: '重点比较 Brief 质量、起稿支持和工作流紧凑度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO writers', 'Content operators', 'Small teams running keyword-to-article workflows'],
        zh: ['SEO 写作者', '内容运营者', '跑关键词到文章流程的小团队'],
      },
      notIdealFor: {
        en: ['Users only editing final copy', 'Teams wanting a full enterprise content governance suite'],
        zh: ['只做最终文案润色的用户', '想要完整企业级内容治理套件的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a compact SEO writing workflow rather than a broad content operations platform.',
      zh: '已按“紧凑型 SEO 写作工作流”而不是大型内容运营平台来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on brief-to-draft speed and workflow simplicity, which is where Frase is most honestly judged.',
      zh: '本条目把比较重点放在 Brief 到初稿的速度和流程简洁度上，这也是 Frase 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Brief quality', 'Drafting support', 'Workflow compactness'],
        zh: ['Brief 质量', '起稿支持', '流程紧凑度'],
      },
      officialSummary: {
        en: 'The official site is useful, but the deeper question is whether Frase fits how your team actually moves from keyword to article.',
        zh: '官网是有帮助的，但更深层的问题是：Frase 是否适合你团队真正从关键词走到文章的方式。',
      },
      freshnessSummary: {
        en: 'SEO writing products evolve through SERP and draft workflows, so exact features should be checked live on the official site.',
        zh: 'SEO 写作产品会随着 SERP 和起稿流程演进，所以具体功能应以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes sense when the same team is repeatedly building briefs and first drafts for search content.',
        zh: '只有当同一团队在重复生产搜索内容 Brief 与首稿时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the tool feels like one connected workflow rather than scattered features.',
        zh: '这里的预览很重要，因为购买者需要看清这是不是一个连贯工作流，而不是分散功能的拼装。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it in weekly publishing routines.',
        zh: '最强的信号，来自团队是否会把它保留在每周发布节奏里。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#f59e0b',
      accentSoft: '#fef3c7',
      accentStrong: '#d97706',
      surface: '#fffaf0',
      badge: 'Brief-to-draft workflow',
      summary: 'Move from keywords and topics to structured article briefs and SEO-guided drafts faster.',
      logoText: 'Fr',
    },
  },
  {
    name: 'clearscope',
    title: 'Clearscope',
    url: 'https://www.clearscope.io',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['seo', 'content-optimization', 'content-briefs'],
    content: {
      en: 'An SEO content optimization platform for improving article depth, topical coverage, and editorial quality against search demand.',
      zh: '一个面向文章深度、主题覆盖和编辑质量提升的 SEO 内容优化平台。',
    },
    detail: {
      en: `Clearscope matters when a team wants SEO guidance to feel editorially usable instead of purely mechanical. It is especially relevant for content programs that care about article depth, topical completeness, and improving high-value pages over time.

The real decision is whether Clearscope helps your team produce better search-facing content without turning writing into a checklist exercise. If the work involves briefs, refreshes, and editorial-quality optimization, it deserves a serious comparison.`,
      zh: `当团队希望 SEO 指导更偏向“编辑可用”，而不是纯机械规则时，Clearscope 就会有价值。它尤其适合那些关注文章深度、主题完整性，并持续优化高价值页面的内容项目。

这页真正要帮助用户判断的是：Clearscope 是否帮助你的团队做出更好的搜索内容，而不是把写作变成一张勾选清单。如果你的工作涉及 Brief、内容更新和编辑质量导向优化，它值得被认真比较。`,
    },
    useCases: {
      en: ['Editorial SEO briefs', 'Article depth improvements', 'Content refreshes', 'High-value page optimization'],
      zh: ['编辑型 SEO Brief', '文章深度提升', '内容更新', '高价值页面优化'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams improve topic coverage and editorial quality for search-facing pages.' },
        { label: 'Best for', value: 'Content programs optimizing important pages and recurring editorial work.' },
        { label: 'Decision angle', value: 'Compare on editorial usability, optimization quality, and page-improvement value.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队提升面向搜索页面的主题覆盖和编辑质量。' },
        { label: '更适合', value: '持续优化重要页面和重复编辑工作的内容项目。' },
        { label: '比较重点', value: '重点比较编辑可用性、优化质量和页面提升价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Editorial teams', 'SEO managers', 'Teams improving existing article portfolios'],
        zh: ['编辑团队', 'SEO 经理', '优化存量文章组合的团队'],
      },
      notIdealFor: {
        en: ['Users only wanting quick AI drafting', 'Teams that never revisit published pages'],
        zh: ['只想快速 AI 起稿的用户', '从不回头优化已发布页面的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an editorial SEO optimization layer rather than a generic AI writer.',
      zh: '已按“编辑型 SEO 优化层”而不是通用 AI 写手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on page-quality improvement and editorial fit, which is where Clearscope is most honestly judged.',
      zh: '本条目把比较重点放在页面质量提升和编辑适配上，这也是 Clearscope 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Editorial usability', 'Optimization quality', 'Page-improvement value'],
        zh: ['编辑可用性', '优化质量', '页面提升价值'],
      },
      officialSummary: {
        en: 'The official site gives the product shape, but the deeper question is whether it genuinely improves how your team upgrades important pages.',
        zh: '官网能帮助你理解产品形态，但更深层的问题是：它是否真的改善了你团队升级重要页面的方式。',
      },
      freshnessSummary: {
        en: 'SEO optimization products evolve through data and editorial surfaces, so exact features should still be checked live on the official site.',
        zh: 'SEO 优化产品会随着数据和编辑界面演进，所以具体功能仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when improving a smaller set of valuable pages can compound business impact.',
        zh: '只有当优化一小批高价值页面能够形成业务复利时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because teams need to judge whether the optimization surface feels editorially usable.',
        zh: '这里的预览很重要，因为团队需要判断这个优化界面是否真的适合编辑工作。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams return to it during refresh cycles, not only at initial publication.',
        zh: '最强的信号，来自团队是否会在内容更新周期里反复回来用它，而不只是首发时看一眼。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0284c7',
      surface: '#f4fbff',
      badge: 'Editorial SEO optimization',
      summary: 'Improve page quality, topical coverage, and search-facing editorial depth with a steadier optimization workflow.',
      logoText: 'Cl',
    },
  },
  {
    name: 'scalenut',
    title: 'Scalenut',
    url: 'https://www.scalenut.com',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['seo', 'ai-writing', 'content-strategy'],
    content: {
      en: 'An SEO content platform for topic research, article planning, AI drafting, and optimization in one workflow.',
      zh: '一个把主题研究、文章规划、AI 起草和优化整合到同一流程里的 SEO 内容平台。',
    },
    detail: {
      en: `Scalenut is most useful when a team wants one place to move from search topic planning into actual draft production. It fits operators who prefer a broader all-in-one workflow over stitching separate research, brief, and draft tools together.

The real decision is whether Scalenut gives you enough end-to-end leverage to simplify SEO content production. If the work involves research, planning, writing, and optimization in the same motion, it deserves a serious comparison.`,
      zh: `当团队希望在同一个地方完成搜索主题规划，再推进到实际写作产出时，Scalenut 就会更有意义。它适合那些更偏好“一体化工作流”，而不是把研究、Brief 和起稿工具拼在一起的运营者。

这页真正要帮助用户判断的是：Scalenut 是否提供了足够的端到端杠杆，来简化 SEO 内容生产。如果你的工作涉及研究、规划、写作和优化的一体化动作，它值得被认真比较。`,
    },
    useCases: {
      en: ['Topic research', 'SEO article planning', 'AI drafting', 'All-in-one content workflows'],
      zh: ['主题研究', 'SEO 文章规划', 'AI 起稿', '一体化内容工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Combining research, planning, drafting, and optimization into one SEO-oriented workflow.' },
        { label: 'Best for', value: 'Teams preferring one connected tool instead of separate SEO and writing products.' },
        { label: 'Decision angle', value: 'Compare on end-to-end workflow value, planning support, and execution convenience.' },
      ],
      zh: [
        { label: '核心定位', value: '把研究、规划、起稿和优化合并到一个 SEO 导向工作流里。' },
        { label: '更适合', value: '更喜欢一个连贯工具，而不是拆分 SEO 与写作产品的团队。' },
        { label: '比较重点', value: '重点比较端到端工作流价值、规划支持和执行便利性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO operators', 'Small content teams', 'Indie founders publishing regularly'],
        zh: ['SEO 运营者', '小型内容团队', '持续发内容的独立创始人'],
      },
      notIdealFor: {
        en: ['Teams with a very specialized enterprise stack', 'Users only needing final optimization scores'],
        zh: ['已经有非常专业企业级栈的团队', '只需要最终优化评分的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an all-in-one SEO content workflow rather than a narrow writing tool.',
      zh: '已按“一体化 SEO 内容工作流”而不是狭义写作工具来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on end-to-end workflow value, which is where Scalenut is most honestly judged.',
      zh: '本条目把比较重点放在端到端工作流价值上，这也是 Scalenut 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['End-to-end workflow', 'Planning support', 'Execution convenience'],
        zh: ['端到端工作流', '规划支持', '执行便利性'],
      },
      officialSummary: {
        en: 'The official site is a useful checkpoint, but the deeper question is whether Scalenut actually reduces tool-switching in your SEO workflow.',
        zh: '官网是有帮助的检查点，但更深层的问题是：Scalenut 是否真的减少了你 SEO 工作流中的切换成本。',
      },
      freshnessSummary: {
        en: 'All-in-one products evolve through packaging and templates, so exact workflow details should still be checked live on the official site.',
        zh: '一体化产品会随着功能包装和模板变化，所以具体流程细节仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes sense when reducing context switching matters as much as any single feature quality.',
        zh: '只有当降低工具切换成本和单项功能质量同样重要时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the product really feels connected end to end.',
        zh: '这里的预览很重要，因为购买者需要判断这个产品是否真的具备连贯的一体化体验。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it as the weekly content operating surface.',
        zh: '最强的信号，来自团队是否把它保留为每周内容运营的工作台。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#f97316',
      accentSoft: '#ffedd5',
      accentStrong: '#ea580c',
      surface: '#fff8f2',
      badge: 'All-in-one SEO workflow',
      summary: 'Research, plan, draft, and optimize search content inside one more connected operating surface.',
      logoText: 'Sc',
    },
  },
  {
    name: 'marketmuse',
    title: 'MarketMuse',
    url: 'https://www.marketmuse.com',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['seo', 'content-strategy', 'topical-authority'],
    content: {
      en: 'A content strategy and SEO planning platform for topic depth, authority mapping, and editorial prioritization.',
      zh: '一个面向主题深度、权威结构和编辑优先级规划的内容策略与 SEO 平台。',
    },
    detail: {
      en: `MarketMuse is most relevant when the question is not just “how do we optimize this article” but “what should our content portfolio cover next.” It fits teams that care about topical authority, planning gaps, and making smarter editorial bets across many pages.

The real decision is whether MarketMuse improves strategic content planning enough to justify a place in your workflow. If the work involves topic maps, cluster planning, and authority building, it deserves a serious comparison.`,
      zh: `当问题不再只是“怎么优化这一篇文章”，而是“我们的内容组合下一步该覆盖什么”时，MarketMuse 就会更有价值。它适合那些关心主题权威、规划缺口，并希望在大量页面之间做更聪明编辑决策的团队。

这页真正要帮助用户判断的是：MarketMuse 是否足够提升你的战略内容规划，值得进入工作流。如果你的工作涉及主题地图、集群规划和权威建设，它值得被认真比较。`,
    },
    useCases: {
      en: ['Topic cluster planning', 'Authority mapping', 'Content gap analysis', 'Editorial prioritization'],
      zh: ['主题集群规划', '权威地图', '内容缺口分析', '编辑优先级排序'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams plan content coverage strategically instead of optimizing pages one by one in isolation.' },
        { label: 'Best for', value: 'Editorial and SEO teams managing multi-page content programs.' },
        { label: 'Decision angle', value: 'Compare on planning depth, authority insight, and portfolio-level usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队用更战略的方式规划内容覆盖，而不是孤立地逐篇优化页面。' },
        { label: '更适合', value: '管理多页面内容项目的编辑和 SEO 团队。' },
        { label: '比较重点', value: '重点比较规划深度、权威洞察和组合层实用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO strategists', 'Editorial leads', 'Teams running topic cluster programs'],
        zh: ['SEO 策略师', '编辑负责人', '运行主题集群项目的团队'],
      },
      notIdealFor: {
        en: ['Users only drafting single articles', 'Teams without a content strategy layer'],
        zh: ['只写单篇文章的用户', '没有内容策略层的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a strategic content planning layer rather than a simple AI writing assistant.',
      zh: '已按“战略内容规划层”而不是简单 AI 写作助手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on portfolio-level planning value, which is where MarketMuse is most honestly judged.',
      zh: '本条目把比较重点放在内容组合层的规划价值上，这也是 MarketMuse 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Planning depth', 'Authority insight', 'Portfolio usefulness'],
        zh: ['规划深度', '权威洞察', '组合层实用性'],
      },
      officialSummary: {
        en: 'The official site helps frame the strategic angle, but the deeper question is whether it actually changes your editorial prioritization.',
        zh: '官网能帮助理解它的战略定位，但更深层的问题是：它是否真的改变了你的编辑优先级判断。',
      },
      freshnessSummary: {
        en: 'Planning platforms evolve through models and scoring logic, so exact behavior should always be checked live on the official site.',
        zh: '规划平台会随着模型和评分逻辑演进，所以具体行为始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing becomes easier to justify when content prioritization decisions affect a large portfolio of pages.',
        zh: '只有当内容优先级决策会影响一大批页面时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the product truly supports portfolio-level planning.',
        zh: '这里的预览很重要，因为购买者需要判断这个产品是否真的支持内容组合层规划。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams use it to decide what to publish next, not just how to tweak an article.',
        zh: '最强的信号，来自团队是否用它决定“下一篇该写什么”，而不只是“这一篇怎么调”。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#059669',
      accentSoft: '#d1fae5',
      accentStrong: '#047857',
      surface: '#f4fff9',
      badge: 'Content strategy planning',
      summary: 'Plan topic clusters, authority coverage, and editorial priorities with a more strategic SEO lens.',
      logoText: 'Mm',
    },
  },
  {
    name: 'koala-writer',
    title: 'KoalaWriter',
    url: 'https://koala.sh',
    categorySlug: 'text-writing',
    pricing: 'paid',
    tags: ['seo', 'ai-writing', 'copywriting'],
    content: {
      en: 'An AI long-form writing tool for faster article drafting, affiliate content, and search-focused publishing workflows.',
      zh: '一个面向长文起稿、联盟内容和搜索导向发布流程的 AI 写作工具。',
    },
    detail: {
      en: `KoalaWriter matters when speed and draft throughput are the main constraints, especially for indie builders and smaller publishers trying to keep publishing momentum. It is less about deep strategic planning and more about producing search-oriented long-form drafts quickly.

The real decision is whether KoalaWriter helps you publish useful content faster without making every page feel thin or generic. If the work involves affiliate content, quick long-form drafts, or lightweight SEO publishing, it deserves a real comparison.`,
      zh: `当速度和起稿产能是主要瓶颈时，KoalaWriter 就会有价值，尤其适合想保持发布节奏的独立构建者和小型发布者。它不那么偏深度战略规划，而更偏向快速产出面向搜索的长文初稿。

这页真正要帮助用户判断的是：KoalaWriter 是否帮助你更快发布有用内容，同时不让页面都变得单薄、模板化。如果你的工作涉及联盟内容、快速长文起稿或轻量 SEO 发布，它值得被认真比较。`,
    },
    useCases: {
      en: ['Long-form drafts', 'Affiliate articles', 'Fast publishing', 'Lightweight SEO content'],
      zh: ['长文初稿', '联盟文章', '快速发布', '轻量 SEO 内容'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping smaller teams and indie publishers draft search-oriented long-form content quickly.' },
        { label: 'Best for', value: 'Operators who value publishing speed and output volume over enterprise workflow depth.' },
        { label: 'Decision angle', value: 'Compare on draft speed, article usefulness, and publishing momentum.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助小团队和独立发布者快速起草面向搜索的长文内容。' },
        { label: '更适合', value: '更看重发布速度和产量，而不是企业级流程深度的运营者。' },
        { label: '比较重点', value: '重点比较起稿速度、文章实用性和发布节奏。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Indie hackers', 'Affiliate publishers', 'Small SEO content teams'],
        zh: ['独立开发者', '联盟发布者', '小型 SEO 内容团队'],
      },
      notIdealFor: {
        en: ['Large editorial organizations', 'Teams prioritizing strategic content planning over draft speed'],
        zh: ['大型编辑组织', '比起速度更优先战略规划的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a fast long-form publishing tool rather than a deep content strategy platform.',
      zh: '已按“快速长文发布工具”而不是深度内容策略平台来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on speed-to-draft and lightweight publishing value, which is where KoalaWriter is most honestly judged.',
      zh: '本条目把比较重点放在起稿速度和轻量发布价值上，这也是 KoalaWriter 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Draft speed', 'Article usefulness', 'Publishing momentum'],
        zh: ['起稿速度', '文章实用性', '发布节奏'],
      },
      officialSummary: {
        en: 'The official site can frame the product, but the deeper question is whether KoalaWriter really helps you publish at a sustainable pace.',
        zh: '官网有助于理解产品定位，但更深层的问题是：KoalaWriter 是否真的帮助你以可持续的节奏发布内容。',
      },
      freshnessSummary: {
        en: 'Fast-draft writing tools evolve with models and templates, so exact outputs should always be checked live on the official site.',
        zh: '快起稿写作工具会随着模型和模板持续变化，所以具体输出应以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes sense when content velocity is the real bottleneck and faster publishing compounds business value.',
        zh: '只有当内容产速是真正瓶颈、且更快发布能形成业务复利时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the product feels practical enough for repeated publishing.',
        zh: '这里的预览很重要，因为用户需要判断这个产品是否足够实用，能进入重复发布流程。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether publishers actually keep using it week after week.',
        zh: '最强的信号，来自发布者是否真的会一周又一周地继续使用它。',
      },
    },
    media: {
      category: 'SEO & Writing',
      accent: '#dc2626',
      accentSoft: '#fee2e2',
      accentStrong: '#b91c1c',
      surface: '#fff8f8',
      badge: 'Fast long-form drafts',
      summary: 'Publish search-oriented long-form content faster when output speed matters more than heavy workflow complexity.',
      logoText: 'Kw',
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
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
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
    features.decision && typeof features.decision === 'object'
      ? (features.decision as Record<string, unknown>)
      : {};
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

  console.log(`\nDone. Updated ${TOOLS.length} SEO/writing entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich SEO/writing wave 15:', error);
  await closePool();
  process.exit(1);
});

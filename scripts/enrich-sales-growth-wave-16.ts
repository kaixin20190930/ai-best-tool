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
];

const TOOLS: ToolSeed[] = [
  {
    name: 'apollo-io',
    title: 'Apollo.io',
    url: 'https://www.apollo.io',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['sales', 'lead-generation', 'prospecting', 'crm', 'outbound'],
    content: {
      en: 'A sales intelligence platform for list building, contact enrichment, account research, and early outbound workflows.',
      zh: '一个面向名单建立、联系人补全、账户研究和早期外联流程的销售情报平台。',
    },
    detail: {
      en: `Apollo.io is strongest when the team needs one place to move from “who should we target” to “how do we actually contact them.” It usually enters the shortlist when lead discovery, account research, and contact enrichment need to stay tightly connected.

The real decision is whether Apollo makes prospecting operationally simpler for your team, not just whether it has a large database. If your workflow includes finding accounts, qualifying contacts, and preparing outbound, it deserves a serious comparison.`,
      zh: `当团队既需要回答“该找谁”，又需要继续推进“怎么联系对方”时，Apollo.io 会最有价值。它通常会出现在候选列表里，因为它把名单发现、账户研究和联系人补全更紧地放在了一起。

这页真正要帮助用户判断的是：Apollo 是否让你的 prospecting 工作在运营上更简单，而不只是“数据库看起来很大”。如果你的流程包含找公司、筛联系人和准备外联，它值得被认真比较。`,
    },
    useCases: {
      en: ['List building', 'Account research', 'Contact enrichment', 'Outbound preparation'],
      zh: ['名单建立', '账户研究', '联系人补全', '外联准备'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Connecting account discovery, contact enrichment, and early outreach prep in one workflow.',
        },
        {
          label: 'Best for',
          value: 'Teams that want prospect data and outbound preparation to live in the same operating surface.',
        },
        { label: 'Decision angle', value: 'Compare on list quality, enrichment depth, and downstream workflow fit.' },
      ],
      zh: [
        { label: '核心定位', value: '把账户发现、联系人补全和前期外联准备连接在同一个工作流里。' },
        { label: '更适合', value: '希望把 prospect 数据和外联准备放在同一个工作台里的团队。' },
        { label: '比较重点', value: '重点比较名单质量、补全深度，以及和后续流程的衔接。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Outbound teams', 'Small sales teams', 'Founders doing their own prospecting'],
        zh: ['外联团队', '小型销售团队', '自己做 prospecting 的创始人'],
      },
      notIdealFor: {
        en: ['Teams that only need a CRM record system', 'People still unclear about who their buyer is'],
        zh: ['只需要 CRM 记录系统的团队', '还没想清楚目标客户是谁的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a prospecting workflow system rather than a generic contact database.',
      zh: '已按“prospecting 工作流系统”而不是通用联系人数据库来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Apollo shortens the path from target account to usable outreach preparation.',
      zh: '本条目把比较重点放在：Apollo 是否缩短了从目标账户到可执行外联准备的路径。',
    },
    decision: {
      compareAxes: {
        en: ['List quality', 'Enrichment depth', 'Workflow continuity'],
        zh: ['名单质量', '补全深度', '流程连续性'],
      },
      officialSummary: {
        en: 'The official site explains the platform clearly, but the deeper question is whether it really fits how your team finds and qualifies prospects.',
        zh: '官网能比较清楚地解释平台，但更深层的问题是：它是否真的适合你团队发现和筛选客户的方式。',
      },
      freshnessSummary: {
        en: 'Prospecting products evolve through data partnerships and workflow layers, so exact coverage should still be checked live on the official site.',
        zh: 'prospecting 产品会随着数据合作和流程层变化，所以具体覆盖范围仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when prospect discovery and enrichment happen often enough to save repeated manual research time.',
        zh: '只有当 prospect 发现和补全足够频繁、能持续替代人工研究时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the product looks like a real operating workflow instead of only a data list.',
        zh: '这里的预览很重要，因为购买者需要判断它更像真实工作流，而不是一张数据表。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it in the prospecting motion after the first import or trial.',
        zh: '最强的信号，来自团队在第一次导入或试用之后，是否还会继续把它留在 prospecting 流程里。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f8fbff',
      badge: 'Prospecting workflow',
      summary:
        'Move from target accounts to enriched contacts and usable outbound preparation with less manual handoff.',
      logoText: 'Ap',
    },
  },
  {
    name: 'clay',
    title: 'Clay',
    url: 'https://www.clay.com',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['sales', 'lead-generation', 'enrichment', 'automation', 'go-to-market'],
    content: {
      en: 'A workflow-first enrichment platform for building smarter lead research, scoring, and go-to-market data operations.',
      zh: '一个以工作流为核心的线索补全平台，用来搭建更聪明的 lead 研究、评分和 GTM 数据运营流程。',
    },
    detail: {
      en: `Clay is most relevant when the problem is not “we need more leads” but “we need to make lead data more useful.” It fits operators who want to compose research, enrichment, scoring, and routing into one system instead of juggling disconnected steps.

The real decision is whether Clay helps your team build a more intelligent go-to-market data layer. If the work involves enrichment logic, routing, lead prioritization, or operator-built workflows, it deserves a serious comparison.`,
      zh: `当问题不再是“我们需要更多线索”，而是“我们需要让线索数据变得更有用”时，Clay 会最有价值。它适合那些想把研究、补全、评分和分流整合成一个系统，而不是在多个断开的步骤之间来回切换的运营者。

这页真正要帮助用户判断的是：Clay 是否帮助你的团队搭建出更聪明的 GTM 数据层。如果你的工作涉及补全逻辑、分流、线索优先级或运营者自己搭建流程，它值得被认真比较。`,
    },
    useCases: {
      en: ['Lead enrichment', 'Lead scoring', 'Routing workflows', 'GTM data operations'],
      zh: ['线索补全', '线索评分', '分流工作流', 'GTM 数据运营'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping operators turn fragmented lead data into higher-quality go-to-market workflows.',
        },
        {
          label: 'Best for',
          value: 'People building custom enrichment, scoring, and routing systems around prospect data.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on workflow flexibility, enrichment usefulness, and operator leverage.',
        },
      ],
      zh: [
        { label: '核心定位', value: '帮助运营者把零散线索数据变成更高质量的 GTM 工作流。' },
        { label: '更适合', value: '围绕 prospect 数据搭建自定义补全、评分和分流系统的人。' },
        { label: '比较重点', value: '重点比较流程灵活性、补全实用性和运营杠杆。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Growth operators', 'Sales ops teams', 'Founders designing data-heavy prospecting flows'],
        zh: ['增长运营者', '销售运营团队', '设计数据型 prospecting 流程的创始人'],
      },
      notIdealFor: {
        en: ['Teams wanting a simple CRM front-end', 'People who do not want to design any workflow logic'],
        zh: ['只想要简单 CRM 前台的团队', '完全不想设计任何流程逻辑的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an operator-grade enrichment workflow rather than a generic sales automation app.',
      zh: '已按“运营者级补全工作流工具”而不是通用销售自动化应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Clay improves data quality and workflow design, which is where it is most honestly judged.',
      zh: '本条目把比较重点放在 Clay 是否提升数据质量和流程设计能力上，这也是它最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow flexibility', 'Enrichment quality', 'Operator leverage'],
        zh: ['流程灵活性', '补全质量', '运营杠杆'],
      },
      officialSummary: {
        en: 'The official site gives the product shape, but the deeper question is whether it truly fits the way your team wants to design prospect workflows.',
        zh: '官网能帮助理解产品形态，但更深层的问题是：它是否真的适合你团队设计 prospect 工作流的方式。',
      },
      freshnessSummary: {
        en: 'Operator tools evolve through integrations and workflow packaging, so exact capability coverage should still be checked live on the official site.',
        zh: '运营类工具会随着集成和工作流包装持续变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes the most sense when the team repeatedly uses enrichment and routing logic to improve prospect quality.',
        zh: '只有当团队反复利用补全和分流逻辑来提升 prospect 质量时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the workflow surface feels operationally usable, not just technically impressive.',
        zh: '这里的预览很重要，因为购买者需要看清这个工作台是否在运营上真正可用，而不只是技术上很酷。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether operators keep extending the workflow after the initial setup.',
        zh: '最强的信号，来自运营者在初次搭好之后，是否会继续扩展这套流程。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#fbf9ff',
      badge: 'Enrichment and routing',
      summary: 'Build richer lead scoring, routing, and research systems without stitching every step manually.',
      logoText: 'Cl',
    },
  },
  {
    name: 'instantly',
    title: 'Instantly',
    url: 'https://instantly.ai',
    categorySlug: 'productivity',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'email-outreach', 'lead-generation'],
    content: {
      en: 'An outbound email platform for prospecting campaigns, sending volume, reply tracking, and early pipeline momentum.',
      zh: '一个面向 prospecting 邮件活动、发送规模、回复跟踪和早期 pipeline 推进的外联平台。',
    },
    detail: {
      en: `Instantly becomes relevant once the work has moved from research into execution. It is strongest when the team already knows who to target and now needs a more scalable way to run outbound campaigns and track response momentum.

The real decision is whether Instantly helps your team create more repeatable outbound throughput without making the workflow fragile. If your bottleneck is campaign execution, inbox operations, or reply visibility, it deserves a serious comparison.`,
      zh: `一旦工作重心从研究转向执行，Instantly 就会开始变得相关。它最适合那些已经知道要联系谁、现在需要更可扩展地跑外联活动并跟踪回复节奏的团队。

这页真正要帮助用户判断的是：Instantly 是否帮助你的团队在不让流程变脆弱的前提下，做出更可重复的外联吞吐。如果你的瓶颈是活动执行、邮箱运营或回复可见性，它值得被认真比较。`,
    },
    useCases: {
      en: ['Cold outbound', 'Reply tracking', 'Campaign execution', 'Prospecting throughput'],
      zh: ['冷启动外联', '回复跟踪', '活动执行', 'prospecting 吞吐'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping teams run prospecting campaigns at scale once target lists are already clear.',
        },
        { label: 'Best for', value: 'Teams optimizing outbound execution, sending operations, and early reply flow.' },
        { label: 'Decision angle', value: 'Compare on sending workflow, campaign clarity, and reply management.' },
      ],
      zh: [
        { label: '核心定位', value: '在目标名单已经清晰的前提下，帮助团队规模化跑 prospecting 活动。' },
        { label: '更适合', value: '优化外联执行、发送运营和早期回复流的团队。' },
        { label: '比较重点', value: '重点比较发送流程、活动清晰度和回复管理。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Outbound-heavy teams', 'Lead-gen agencies', 'Founders doing repeat outreach'],
        zh: ['重外联团队', '获客代理机构', '重复做外联的创始人'],
      },
      notIdealFor: {
        en: ['Teams still figuring out ICP', 'People mainly needing research or CRM depth'],
        zh: ['还在摸索 ICP 的团队', '主要需要研究或 CRM 深度的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an outbound execution layer rather than a full-funnel sales system.',
      zh: '已按“外联执行层”而不是全漏斗销售系统来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on campaign execution and reply flow, which is where Instantly is most honestly judged.',
      zh: '本条目把比较重点放在活动执行和回复流上，这也是 Instantly 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Campaign execution', 'Reply visibility', 'Sending workflow'],
        zh: ['活动执行', '回复可见性', '发送流程'],
      },
      officialSummary: {
        en: 'The official site frames the platform well, but the deeper question is whether it helps your team sustain outbound momentum cleanly.',
        zh: '官网能比较好地描述平台，但更深层的问题是：它是否帮助你的团队更干净地维持外联节奏。',
      },
      freshnessSummary: {
        en: 'Outbound tools change through deliverability and workflow layers, so exact capability coverage should still be checked live on the official site.',
        zh: '外联工具会随着送达性和流程层持续变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easiest to justify when outbound is already a repeated motion rather than an occasional experiment.',
        zh: '只有当外联已经是重复性动作，而不是偶发实验时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the interface looks like a campaign operating surface instead of only a messaging box.',
        zh: '这里的预览很重要，因为购买者需要判断这更像一个活动运营工作台，而不是一个消息输入框。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it after the first outbound sprint.',
        zh: '最强的信号，来自团队在第一轮外联冲刺之后，是否还会继续使用它。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f4fffd',
      badge: 'Outbound execution',
      summary: 'Run prospecting campaigns and manage reply momentum with less manual coordination across inboxes.',
      logoText: 'In',
    },
  },
  {
    name: 'lemlist',
    title: 'Lemlist',
    url: 'https://www.lemlist.com',
    categorySlug: 'productivity',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'email-outreach', 'sales-engagement'],
    content: {
      en: 'A sales engagement platform focused on personalized outbound messages, sequencing, and prospecting workflow quality.',
      zh: '一个更强调个性化外联消息、序列设计和 prospecting 工作流质量的销售互动平台。',
    },
    detail: {
      en: `Lemlist matters when the team cares about response quality as much as automation. It is a better fit when the prospecting question is “how do we sound more relevant” instead of only “how do we send more.”

The real decision is whether Lemlist helps your outreach feel more contextual and less templated without slowing the team down. If the work involves cold outreach, personalization, and sequence design, it deserves a serious comparison.`,
      zh: `当团队既在意自动化，也在意回复质量时，Lemlist 就会有价值。它更适合这样一种 prospecting 场景：真正的问题是“我们怎样显得更相关”，而不是“我们怎样发得更多”。

这页真正要帮助用户判断的是：Lemlist 是否帮助你的外联在不拖慢团队的前提下，更有上下文、更少模板味。如果你的工作涉及冷外联、个性化和序列设计，它值得被认真比较。`,
    },
    useCases: {
      en: ['Cold outreach', 'Sequence design', 'Outbound personalization', 'Follow-up campaigns'],
      zh: ['冷外联', '序列设计', '外联个性化', '跟进活动'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams keep outbound personalized enough to improve response quality.' },
        {
          label: 'Best for',
          value: 'Teams where outreach quality and contextual relevance matter more than pure sending volume.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on personalization depth, sequence quality, and workflow usability.',
        },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队让外联保持足够的个性化，从而提升回复质量。' },
        { label: '更适合', value: '更在意外联质量和上下文相关性，而不是纯发送量的团队。' },
        { label: '比较重点', value: '重点比较个性化深度、序列质量和流程可用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: [
          'Sales teams caring about reply quality',
          'Agencies running personalized outreach',
          'Founders doing high-context outbound',
        ],
        zh: ['在意回复质量的销售团队', '跑个性化外联的代理机构', '做高上下文外联的创始人'],
      },
      notIdealFor: {
        en: ['Teams only optimizing for send volume', 'People who do not want to invest in message context'],
        zh: ['只优化发送量的团队', '不想投入消息上下文设计的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a quality-oriented outreach workflow rather than just another sequence sender.',
      zh: '已按“偏质量导向的外联工作流”而不是普通序列发送器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on whether Lemlist improves message relevance and outreach feel, which is where it is most honestly judged.',
      zh: '本条目把比较重点放在 Lemlist 是否提升消息相关性和外联质感上，这也是它最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Personalization depth', 'Sequence quality', 'Reply quality'],
        zh: ['个性化深度', '序列质量', '回复质量'],
      },
      officialSummary: {
        en: 'The official site communicates the product well, but the deeper question is whether it improves how your team sounds to real prospects.',
        zh: '官网能比较好地表达产品，但更深层的问题是：它是否真的改善了你团队面对真实 prospect 时的表达方式。',
      },
      freshnessSummary: {
        en: 'Prospecting tools evolve through workflow layers and positioning, so exact features should still be checked live on the official site.',
        zh: 'prospecting 工具会随着流程层和定位演进，所以具体功能仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is easier to justify when better reply quality creates visible downstream value.',
        zh: '只有当更好的回复质量能带来明显的后续价值时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the workflow feels thoughtful enough for real outbound use.',
        zh: '这里的预览很重要，因为购买者需要判断这个流程是否足够用心，能支撑真实外联。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it for live campaigns instead of switching back to simpler senders.',
        zh: '最强的信号，来自团队是否会在真实活动里继续使用它，而不是又退回更简单的发送器。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#ea580c',
      accentSoft: '#ffedd5',
      accentStrong: '#c2410c',
      surface: '#fffaf5',
      badge: 'Personalized outreach',
      summary: 'Design prospecting sequences that feel more relevant and less generic without losing workflow speed.',
      logoText: 'Le',
    },
  },
  {
    name: 'smartlead',
    title: 'Smartlead',
    url: 'https://www.smartlead.ai',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'email-outreach', 'automation'],
    content: {
      en: 'An outbound automation platform for cold-email infrastructure, inbox orchestration, and scaled prospecting workflows.',
      zh: '一个面向冷邮件基础设施、邮箱编排和规模化 prospecting 流程的外联自动化平台。',
    },
    detail: {
      en: `Smartlead becomes relevant once outbound is no longer a side project. It fits teams that need more control over sending systems, inbox orchestration, and campaign operations at scale.

The real decision is whether Smartlead helps your team operate outbound more reliably as volume increases. If the bottleneck is sending infrastructure, inbox control, or repeatable cold-email operations, it deserves a serious comparison.`,
      zh: `一旦 outbound 不再只是一个副项目，Smartlead 就会开始变得相关。它适合那些需要对发送系统、邮箱编排和规模化活动运营拥有更多控制权的团队。

这页真正要帮助用户判断的是：随着发送量增长，Smartlead 是否帮助你的团队更可靠地运营 outbound。如果你的瓶颈是发送基础设施、邮箱控制或可重复的冷邮件运营，它值得被认真比较。`,
    },
    useCases: {
      en: ['Cold-email infrastructure', 'Inbox orchestration', 'Scaled campaigns', 'Outbound operations'],
      zh: ['冷邮件基础设施', '邮箱编排', '规模化活动', '外联运营'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping teams scale outbound operations with more control over sending infrastructure.',
        },
        {
          label: 'Best for',
          value: 'Teams whose outbound process depends on multi-inbox execution and repeatable cold-email systems.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on infrastructure control, operational clarity, and scaling reliability.',
        },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队在发送基础设施层面拥有更多控制，从而规模化跑 outbound。' },
        { label: '更适合', value: '依赖多邮箱执行和可重复冷邮件系统的团队。' },
        { label: '比较重点', value: '重点比较基础设施控制力、运营清晰度和扩展可靠性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Outbound agencies', 'Growth teams scaling campaigns', 'Operators managing inbox systems'],
        zh: ['外联代理机构', '规模化跑活动的增长团队', '管理邮箱系统的运营者'],
      },
      notIdealFor: {
        en: ['Teams only sending occasional outreach', 'People who mainly need contact discovery'],
        zh: ['只偶尔做外联的团队', '主要需要联系人发现的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an outbound operations layer rather than a generic sales engagement app.',
      zh: '已按“外联运营层”而不是通用销售互动应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on operational control and scale reliability, which is where Smartlead is most honestly judged.',
      zh: '本条目把比较重点放在运营控制力和规模可靠性上，这也是 Smartlead 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Infrastructure control', 'Scaling reliability', 'Operational clarity'],
        zh: ['基础设施控制力', '规模可靠性', '运营清晰度'],
      },
      officialSummary: {
        en: 'The official site helps with positioning, but the deeper question is whether Smartlead fits how your team wants to operate outbound at scale.',
        zh: '官网有助于理解定位，但更深层的问题是：Smartlead 是否适合你团队规模化运营 outbound 的方式。',
      },
      freshnessSummary: {
        en: 'Scaled outbound products evolve through infrastructure and workflow changes, so exact capability coverage should still be checked live on the official site.',
        zh: '规模化 outbound 产品会随着基础设施和流程持续变化，所以具体能力覆盖仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes the most sense when outbound is already a consistent motion and inbox operations are no longer trivial.',
        zh: '只有当 outbound 已经是持续性动作、邮箱运营也不再简单时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to judge whether the product feels like a serious operating surface instead of a lightweight sender.',
        zh: '这里的预览很重要，因为购买者需要判断它是否像一个严肃的运营工作台，而不是轻量发送器。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep it running in live outbound systems over time.',
        zh: '最强的信号，来自团队是否会让它长期跑在真实 outbound 系统里。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#0f172a',
      accentSoft: '#e2e8f0',
      accentStrong: '#1e293b',
      surface: '#f8fafc',
      badge: 'Outbound infrastructure',
      summary: 'Run scaled cold-email systems with more control over inbox operations and campaign infrastructure.',
      logoText: 'Sm',
    },
  },
  {
    name: 'reply-io',
    title: 'Reply.io',
    url: 'https://reply.io',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['sales', 'prospecting', 'outbound', 'email-outreach', 'sales-engagement'],
    content: {
      en: 'A sales engagement platform for prospecting sequences, follow-up workflows, and multi-step outbound execution.',
      zh: '一个面向 prospecting 序列、跟进工作流和多步骤外联执行的销售互动平台。',
    },
    detail: {
      en: `Reply.io matters when a team wants prospecting execution to feel more structured and repeatable. It is a strong fit when the real job is not discovering the lead, but moving a known lead through a cleaner outreach sequence.

The real decision is whether Reply.io makes your outbound follow-up logic easier to run and maintain. If the work involves step-by-step outreach, sequence handling, and engagement operations, it deserves a serious comparison.`,
      zh: `当团队希望 prospecting 执行更结构化、更可重复时，Reply.io 会更有价值。它特别适合这样一种场景：真正的问题不再是“发现线索”，而是“把已知线索更干净地推进到一条外联序列里”。

这页真正要帮助用户判断的是：Reply.io 是否让你的 outbound 跟进逻辑更容易运行和维护。如果你的工作涉及多步骤外联、序列处理和互动运营，它值得被认真比较。`,
    },
    useCases: {
      en: ['Outreach sequences', 'Follow-up workflows', 'Sales engagement', 'Prospecting execution'],
      zh: ['外联序列', '跟进工作流', '销售互动', 'prospecting 执行'],
    },
    features: {
      en: [
        {
          label: 'Core focus',
          value: 'Helping teams run outreach and follow-up in a more structured, maintainable sequence workflow.',
        },
        {
          label: 'Best for',
          value: 'Teams comparing prospecting execution systems rather than broad lead discovery tools.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on sequence structure, follow-up logic, and workflow maintainability.',
        },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队以更结构化、可维护的序列流程来执行外联和跟进。' },
        { label: '更适合', value: '比较 prospecting 执行系统、而不是泛名单发现工具的团队。' },
        { label: '比较重点', value: '重点比较序列结构、跟进逻辑和流程维护成本。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Sales teams running repeated sequences', 'Prospecting operators', 'Agencies managing follow-up flow'],
        zh: ['重复跑序列的销售团队', 'prospecting 运营者', '管理跟进流的代理机构'],
      },
      notIdealFor: {
        en: ['Teams still solving for lead discovery first', 'People only needing a writing assistant'],
        zh: ['仍然先要解决线索发现问题的团队', '只需要写作助手的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a sequence-and-follow-up workflow system rather than a broad AI writing or CRM layer.',
      zh: '已按“序列与跟进工作流系统”而不是泛 AI 写作或 CRM 层来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on sequence clarity and follow-up execution, which is where Reply.io is most honestly judged.',
      zh: '本条目把比较重点放在序列清晰度和跟进执行上，这也是 Reply.io 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Sequence structure', 'Follow-up logic', 'Workflow maintainability'],
        zh: ['序列结构', '跟进逻辑', '流程维护性'],
      },
      officialSummary: {
        en: 'The official site explains the product shape, but the deeper question is whether Reply.io fits how your team actually manages prospect follow-up.',
        zh: '官网能解释产品形态，但更深层的问题是：Reply.io 是否适合你团队真正管理 prospect 跟进的方式。',
      },
      freshnessSummary: {
        en: 'Prospecting execution products evolve through workflow packaging and integrations, so exact features should still be checked live on the official site.',
        zh: 'prospecting 执行类产品会随着流程包装和集成持续变化，所以具体功能仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes the most sense when structured follow-up is already a repeated part of the revenue workflow.',
        zh: '只有当结构化跟进已经是营收流程里的重复动作时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because buyers need to see whether the workflow is easy to operate over time, not just easy to start.',
        zh: '这里的预览很重要，因为购买者需要判断这个流程是不是长期也容易运营，而不只是上手容易。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams keep using it to manage live follow-up rather than drifting back to ad hoc outreach.',
        zh: '最强的信号，来自团队是否会继续用它管理真实跟进，而不是又退回临时式外联。',
      },
    },
    media: {
      category: 'Sales & Growth',
      accent: '#be123c',
      accentSoft: '#ffe4e6',
      accentStrong: '#9f1239',
      surface: '#fff8f9',
      badge: 'Follow-up sequences',
      summary: 'Keep prospecting follow-up more structured and repeatable across multi-step outreach workflows.',
      logoText: 'Re',
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

  console.log(`\nDone. Updated ${TOOLS.length} sales/growth entries.`);
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

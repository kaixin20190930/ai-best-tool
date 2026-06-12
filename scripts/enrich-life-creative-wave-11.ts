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
  categorySlug: 'productivity' | 'chatbot' | 'design-art' | 'life-assistant';
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
  { slug: 'travel-planning', en: 'Travel Planning', zh: '旅行规划' },
  { slug: 'memory-keeping', en: 'Memory Keeping', zh: '回忆记录' },
  { slug: 'personal-timeline', en: 'Personal Timeline', zh: '个人时间线' },
  { slug: 'gif-tools', en: 'GIF Tools', zh: 'GIF 工具' },
  { slug: 'video-conversion', en: 'Video Conversion', zh: '视频转换' },
  { slug: 'compression', en: 'Compression', zh: '压缩' },
  { slug: 'task-breakdown', en: 'Task Breakdown', zh: '任务拆解' },
  { slug: 'planning', en: 'Planning', zh: '规划' },
  { slug: 'knowledge-base', en: 'Knowledge Base', zh: '知识库' },
  { slug: 'memory', en: 'Memory', zh: '记忆管理' },
  { slug: 'personal-assistant', en: 'Personal Assistant', zh: '个人助理' },
  { slug: 'search', en: 'Search', zh: '搜索' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'triptrace',
    title: 'TripTrace',
    url: 'https://triptrace.ai',
    categorySlug: 'life-assistant',
    pricing: 'paid',
    tags: ['travel-planning', 'memory-keeping', 'personal-timeline'],
    content: {
      en: 'An AI memory companion for trips, reunions, and personal moments, designed to turn everyday experiences into a lasting life timeline.',
      zh: '一个面向旅行、重聚和个人时刻的 AI 回忆助手，帮助把日常体验整理成可以长期沉淀的人生时间线。',
    },
    detail: {
      en: `TripTrace is more relevant as a memory and reflection product than as a simple travel utility. The value is not just itinerary planning, but turning meaningful moments into a personal archive that feels coherent over time. That puts it closer to a life-recording workflow than a typical trip assistant.

The real decision on this page is whether the product gives enough emotional and practical value for someone to keep returning after the novelty fades. If the job is preserving context, stories, and milestones instead of just booking a trip, it deserves to be judged on those terms.`,
      zh: `TripTrace 更像一个“回忆与记录产品”，而不只是普通旅行工具。它的价值不在于单纯规划行程，而在于把重要时刻整理成一个随着时间积累、越来越完整的人生档案。因此它更接近一种生活记录工作流，而不是常规出行助手。

这页真正要帮助用户判断的是：当新鲜感过去之后，这个产品是否仍然能提供足够的情感和实际价值，让用户持续回来使用。如果你的需求是保存上下文、故事和人生节点，而不只是规划一次旅行，它就应该按这些维度来判断。`,
    },
    useCases: {
      en: ['Trip memories', 'Personal storytelling', 'Life timeline building', 'Moment journaling'],
      zh: ['旅行回忆记录', '个人故事整理', '人生时间线沉淀', '重要时刻日志'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users preserve and revisit meaningful moments in a structured timeline.' },
        { label: 'Best for', value: 'People who want more than planning and care about memory, context, and personal stories.' },
        { label: 'Decision angle', value: 'Compare on emotional usefulness, memory capture, and long-term return value.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户把重要时刻沉淀成可回看的结构化时间线。' },
        { label: '更适合', value: '不只关心规划，更在意回忆、上下文和个人故事的人。' },
        { label: '比较重点', value: '重点比较情感价值、回忆记录能力和长期回访价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Frequent travelers', 'People documenting personal milestones', 'Users building a life archive'],
        zh: ['经常旅行的人', '记录个人节点的用户', '想建立人生档案的人'],
      },
      notIdealFor: {
        en: ['Users only needing basic itinerary utilities', 'Teams shopping for enterprise travel management'],
        zh: ['只需要基础行程工具的用户', '在选企业差旅管理系统的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a memory-first life assistant rather than a plain trip planner.',
      zh: '已按“回忆优先的生活助手”而不是普通旅行规划器来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on memory value and long-term usefulness, which is where TripTrace should be honestly judged.',
      zh: '本条目把比较锚点放在回忆价值和长期实用性上，这也是 TripTrace 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Memory value', 'Personal storytelling fit', 'Long-term return'],
        zh: ['回忆价值', '个人叙事适配', '长期回访价值'],
      },
      officialSummary: {
        en: 'The official site builds trust, but the deeper question is whether the product becomes part of a user’s life-recording habit rather than a one-time experiment.',
        zh: '官网能建立基础信任，但更深层的问题是：这个产品能否进入用户的长期记录习惯，而不是一次性尝试。',
      },
      freshnessSummary: {
        en: 'Lifestyle products evolve through positioning and workflow details, so exact feature boundaries should still be checked on the official site.',
        zh: '生活方式产品会随着定位和流程细节变化，所以具体功能边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when the product becomes part of repeated memory keeping instead of a single trip novelty.',
        zh: '只有当它进入重复性的回忆记录，而不只是一次旅行的新鲜尝试时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the product feels like a real memory companion instead of a landing-page concept.',
        zh: '这里的预览很重要，因为用户需要判断它更像一个真实的回忆助手，还是停留在概念页层面。',
      },
      communitySummary: {
        en: 'The strongest signal comes from users explaining whether TripTrace actually helped them keep and revisit meaningful moments.',
        zh: '最强的信号，来自用户是否说明 TripTrace 真的帮助他们保存并重新回看重要时刻。',
      },
    },
    media: {
      category: 'Life Assistant',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f5fffd',
      badge: 'Memory timeline',
      summary: 'Turn trips and important moments into a personal archive that stays meaningful over time.',
      logoText: 'Tr',
    },
  },
  {
    name: 'moxion-ai',
    title: 'Moxion',
    url: 'https://moxion.ai',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['gif-tools', 'video-conversion', 'compression'],
    content: {
      en: 'A media utility built for GIF creation, compression, conversion, and quick sharing, with video support when needed.',
      zh: '一个面向 GIF 创建、压缩、转换与分享的媒体工具，并在需要时支持视频处理。',
    },
    detail: {
      en: `Moxion is most relevant as a practical content utility rather than a broad creative suite. The value comes from making small visual assets easier to generate, compress, convert, and share without dragging users into heavyweight editing workflows.

The real decision is whether Moxion becomes a recurring helper for creators and operators who handle lightweight media every week. If the workflow involves GIFs, quick conversions, and clean asset handoff, it deserves to be compared as an efficiency tool.`,
      zh: `Moxion 更适合作为一个务实的内容工具，而不是大型创意套件。它的价值在于，让用户更轻量地完成 GIF 生成、压缩、转换和分享，而不用拖进重型剪辑流程。

这页真正要帮助用户判断的是：对于每周都在处理轻媒体素材的创作者和运营者来说，Moxion 是否能成为一个高频帮手。如果你的流程里有 GIF、快速转换和素材交接，它就应该作为一个效率工具来比较。`,
    },
    useCases: {
      en: ['GIF creation', 'Media compression', 'Format conversion', 'Quick asset sharing'],
      zh: ['GIF 创建', '媒体压缩', '格式转换', '快速素材分享'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users move small media assets through creation, compression, and sharing faster.' },
        { label: 'Best for', value: 'Creators and operators who need lightweight media tooling instead of full editing suites.' },
        { label: 'Decision angle', value: 'Compare on utility, speed, and repeat workflow usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户更快完成轻量媒体素材的创建、压缩和分享。' },
        { label: '更适合', value: '需要轻媒体工具、而不是完整剪辑套件的创作者和运营者。' },
        { label: '比较重点', value: '重点比较实用性、速度和重复工作流价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Meme and social creators', 'Operators shipping lightweight media', 'Teams needing quick conversions'],
        zh: ['表情和社交内容创作者', '发布轻媒体素材的运营者', '需要快速转换的团队'],
      },
      notIdealFor: {
        en: ['Teams wanting deep timeline editing', 'Studios producing long-form polished video'],
        zh: ['需要深度时间线剪辑的团队', '制作长篇精修视频的工作室'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a lightweight media utility rather than a broad creative platform.',
      zh: '已按“轻量媒体效率工具”而不是大型创意平台来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on repeat media utility and speed, which is where Moxion is most honestly judged.',
      zh: '本条目把比较重点放在重复性媒体实用性和速度上，这也是 Moxion 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow utility', 'Conversion speed', 'Lightweight content fit'],
        zh: ['工作流实用性', '转换速度', '轻内容适配'],
      },
      officialSummary: {
        en: 'The official site is useful for trust, but the deeper question is whether Moxion solves enough repetitive media friction to stay in the stack.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：Moxion 是否足够解决重复性媒体摩擦，值得常驻工具栈。',
      },
      freshnessSummary: {
        en: 'Utility products evolve through packaging and small workflow features, so exact plan boundaries should still be checked on the official site.',
        zh: '工具型产品会随着套餐和流程小功能变化，所以具体方案边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when media conversion and optimization are already recurring chores every week.',
        zh: '只有当媒体转换和优化已经是每周重复杂务时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the product feels like a real utility workflow instead of a thin landing-page wrapper.',
        zh: '这里的预览能帮助用户判断：它更像一个真实工具流程，还是一个很薄的落地页包装。',
      },
      communitySummary: {
        en: 'The strongest signal comes from creators explaining whether Moxion actually reduced repetitive asset handling work.',
        zh: '最强的信号，来自创作者是否说明 Moxion 真的减少了重复性的素材处理工作。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Media utility',
      summary: 'Create, compress, convert, and share lightweight media assets with less friction.',
      logoText: 'Mx',
    },
  },
  {
    name: 'goblin-tools',
    title: 'Goblin Tools',
    url: 'https://goblin.tools',
    categorySlug: 'life-assistant',
    pricing: 'freemium',
    tags: ['task-breakdown', 'planning', 'personal-assistant'],
    content: {
      en: 'A practical helper for breaking tasks down, estimating effort, and making daily work feel easier to start.',
      zh: '一个帮助拆解任务、估算精力，并让日常工作更容易开始的实用工具。',
    },
    detail: {
      en: `Goblin Tools is most useful as a daily friction-reduction product. Its value is not big strategic automation, but helping people get unstuck when a task feels vague, overwhelming, or difficult to start. That makes it more relevant in the life assistant category than in a pure productivity-software comparison.

The real decision is whether the tool becomes part of someone’s real everyday coping and planning workflow. If the job is turning vague tasks into manageable next steps, it deserves to be judged on clarity and repeated usefulness.`,
      zh: `Goblin Tools 最有价值的地方，是它能减少日常行动摩擦。它不是做宏大战略自动化，而是在任务显得模糊、压人、很难开始的时候，帮助用户从“卡住”走到“动起来”。因此它比起纯生产力软件，更适合放在生活助手这个分类里判断。

这页真正要帮助用户判断的是：它是否能进入用户真实的日常规划和自我支持流程。如果你的需求是把模糊任务变成可执行下一步，它就应该按清晰度和重复实用性来比较。`,
    },
    useCases: {
      en: ['Task breakdown', 'Getting started on hard tasks', 'Daily planning support', 'Reducing overwhelm'],
      zh: ['任务拆解', '帮助开始困难任务', '日常规划支持', '降低压迫感'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning vague or overwhelming tasks into more manageable next steps.' },
        { label: 'Best for', value: 'People who need everyday support starting, structuring, and estimating tasks.' },
        { label: 'Decision angle', value: 'Compare on clarity, calmness, and repeated daily usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '把模糊或令人有压力的任务变成更容易开始的下一步。' },
        { label: '更适合', value: '需要日常支持来开始、组织和估算任务的人。' },
        { label: '比较重点', value: '重点比较清晰度、减压感和重复日常实用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['People with task paralysis', 'Users wanting lightweight everyday support', 'Individuals needing clearer next steps'],
        zh: ['容易被任务卡住的人', '想要轻量日常支持的用户', '需要更清晰下一步的人'],
      },
      notIdealFor: {
        en: ['Teams needing enterprise workflow orchestration', 'Users only searching for a strict project-management suite'],
        zh: ['需要企业级流程编排的团队', '只在寻找严格项目管理套件的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a daily life-support assistant rather than a traditional productivity app.',
      zh: '已按“日常生活支持助手”而不是传统生产力应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on everyday relief and repeated usefulness, which is where Goblin Tools is most honestly judged.',
      zh: '本条目把比较重点放在日常减压和重复实用性上，这也是 Goblin Tools 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Task clarity', 'Everyday relief', 'Repeat usefulness'],
        zh: ['任务清晰度', '日常减压感', '重复实用性'],
      },
      officialSummary: {
        en: 'The official site builds trust, but the deeper question is whether users actually feel less blocked and more capable after repeated use.',
        zh: '官网能提供基础信任，但更深层的问题是：用户在反复使用之后，是否真的更不容易卡住、更容易行动。',
      },
      freshnessSummary: {
        en: 'Everyday support tools evolve through small workflow features, so exact product details should still be checked on the official site.',
        zh: '日常支持工具会随着小流程功能变化，所以具体产品细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when the product becomes part of a repeated daily support routine instead of an occasional curiosity.',
        zh: '只有当它进入重复性的日常支持流程，而不是偶尔尝鲜时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the interface feels calm and usable instead of toy-like.',
        zh: '这里的预览很重要，因为用户需要判断界面到底是平静可用，还是只是玩具感很重。',
      },
      communitySummary: {
        en: 'The strongest signal comes from users describing whether Goblin Tools really helped them start and finish daily tasks more easily.',
        zh: '最强的信号，来自用户是否说明 Goblin Tools 真的帮助他们更容易开始并完成日常任务。',
      },
    },
    media: {
      category: 'Life Assistant',
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0284c7',
      surface: '#f4fbff',
      badge: 'Daily task support',
      summary: 'Break tasks down, reduce overwhelm, and make daily action feel more manageable.',
      logoText: 'Gt',
    },
  },
  {
    name: 'rewind',
    title: 'Rewind',
    url: 'https://www.rewind.ai',
    categorySlug: 'life-assistant',
    pricing: 'freemium',
    tags: ['memory', 'search', 'knowledge-base'],
    content: {
      en: 'A personal memory assistant that helps users search past work, meetings, and on-screen activity.',
      zh: '一个帮助用户搜索过去工作、会议和屏幕活动的个人记忆助手。',
    },
    detail: {
      en: `Rewind is most relevant when personal recall and context retrieval have become real work problems. Its value is not just storing information, but helping users recover what they have already seen, said, or worked on without manually organizing everything.

The real decision is whether Rewind reduces enough daily memory friction to become part of a user’s regular workflow. If the job involves many tabs, meetings, documents, and interrupted context, it deserves a serious comparison.`,
      zh: `当个人回忆和上下文检索已经成为真实工作问题时，Rewind 就会更有意义。它的价值不只是存信息，而是帮助用户找回自己已经看过、说过或做过的内容，而不用手工整理一切。

这页真正要帮助用户判断的是：Rewind 是否足够明显地减少了日常记忆摩擦，值得进入用户的常规工作流。如果你的工作涉及大量标签页、会议、文档和频繁中断，它值得被认真比较。`,
    },
    useCases: {
      en: ['Personal recall', 'Search past meetings', 'Find previous work context', 'Reduce knowledge loss'],
      zh: ['个人回忆检索', '搜索过往会议', '找回之前工作上下文', '减少知识遗失'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users recover past context without manually building a perfect archive.' },
        { label: 'Best for', value: 'People whose daily work creates lots of scattered, hard-to-recall context.' },
        { label: 'Decision angle', value: 'Compare on recall quality, context recovery, and workflow calmness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户在不手工搭建完美档案的前提下找回过去上下文。' },
        { label: '更适合', value: '日常工作会产生大量分散且难以回忆信息的人。' },
        { label: '比较重点', value: '重点比较召回质量、上下文恢复能力和流程轻松感。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Knowledge workers', 'People in many meetings', 'Users with fragmented digital workdays'],
        zh: ['知识工作者', '会议很多的人', '数字工作日很碎片化的用户'],
      },
      notIdealFor: {
        en: ['Users only wanting a simple note pad', 'Teams seeking strict collaborative databases'],
        zh: ['只想要简单记事本的用户', '寻找严格协作数据库的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a personal recall layer rather than a generic note app.',
      zh: '已按“个人回忆检索层”而不是普通笔记应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on recall and context recovery, which is where Rewind is most meaningfully judged.',
      zh: '本条目把比较重点放在召回和上下文恢复上，这也是 Rewind 最值得被判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Recall quality', 'Context recovery', 'Daily usefulness'],
        zh: ['召回质量', '上下文恢复', '日常实用性'],
      },
      officialSummary: {
        en: 'The official site is a trust checkpoint, but the deeper question is whether Rewind truly makes users faster at recovering their own knowledge.',
        zh: '官网本身是信任检查点，但更深层的问题是：Rewind 是否真的让用户更快找回自己的知识和上下文。',
      },
      freshnessSummary: {
        en: 'Memory tools evolve through workflow details and privacy positioning, so exact product boundaries should still be checked on the official site.',
        zh: '记忆类工具会随着流程细节和隐私定位变化，所以具体产品边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when the cost of losing context or re-finding past work is already visible every week.',
        zh: '只有当丢失上下文和反复找回过去工作的成本每周都很明显时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the interface feels trustworthy and retrievable instead of abstract.',
        zh: '这里的预览很重要，因为用户需要判断这个界面到底是否值得信任、是否真有检索感，而不是很抽象。',
      },
      communitySummary: {
        en: 'The strongest signal comes from users explaining whether Rewind actually reduced rework and made context easier to recover.',
        zh: '最强的信号，来自用户是否说明 Rewind 真的减少了重复返工，并让上下文更容易找回。',
      },
    },
    media: {
      category: 'Life Assistant',
      accent: '#4f46e5',
      accentSoft: '#e0e7ff',
      accentStrong: '#4338ca',
      surface: '#f7f8ff',
      badge: 'Personal recall',
      summary: 'Search past work, meetings, and digital context without rebuilding everything by hand.',
      logoText: 'Rw',
    },
  },
  {
    name: 'personal-ai',
    title: 'Personal AI',
    url: 'https://www.personal.ai',
    categorySlug: 'life-assistant',
    pricing: 'freemium',
    tags: ['memory', 'knowledge-base', 'personal-assistant'],
    content: {
      en: 'A personal AI platform focused on private memory, individual context, and assistant behavior that feels more personal over time.',
      zh: '一个专注于私人记忆、个人上下文和长期更具个性化助手行为的个人 AI 平台。',
    },
    detail: {
      en: `Personal AI is most relevant when users want a memory-aware assistant experience rather than a generic chatbot. The value is not only answering prompts, but carrying forward personal context in a way that feels private, continuous, and tailored to the individual.

The real decision is whether that memory layer creates enough personal usefulness to justify ongoing use. If the job is building an assistant around your own context instead of a generic model response, it deserves a more serious comparison.`,
      zh: `当用户想要的不是一个通用聊天机器人，而是一个记得自己的助手体验时，Personal AI 就更有意义。它的价值不只是回答问题，而是把个人上下文以更私密、更连续、更贴合个体的方式延续下去。

这页真正要帮助用户判断的是：这种记忆层是否创造了足够强的个人价值，值得持续使用。如果你的需求是围绕自己的上下文构建一个助手，而不是接受通用模型回复，它就值得被更认真地比较。`,
    },
    useCases: {
      en: ['Private memory assistant', 'Personal context recall', 'Individualized AI support', 'Knowledge continuity'],
      zh: ['私人记忆助手', '个人上下文召回', '个性化 AI 支持', '知识连续性'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Giving users an assistant experience shaped by personal memory and private context.' },
        { label: 'Best for', value: 'People who want a more individualized assistant instead of generic chat output.' },
        { label: 'Decision angle', value: 'Compare on memory usefulness, personalization depth, and long-term assistant value.' },
      ],
      zh: [
        { label: '核心定位', value: '提供由个人记忆和私有上下文塑造的助手体验。' },
        { label: '更适合', value: '想要更个性化助手，而不是通用聊天输出的人。' },
        { label: '比较重点', value: '重点比较记忆实用性、个性化深度和长期助手价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Users wanting a personal memory layer', 'People with recurring private context', 'Early adopters of individualized AI'],
        zh: ['想要个人记忆层的用户', '拥有大量私有上下文的人', '愿意尝试个性化 AI 的早期用户'],
      },
      notIdealFor: {
        en: ['Teams wanting shared enterprise workflows', 'Users only needing quick generic Q&A'],
        zh: ['需要共享企业工作流的团队', '只需要快速通用问答的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a personal-memory assistant rather than a generic chatbot.',
      zh: '已按“个人记忆助手”而不是通用聊天机器人来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on personal context and memory value, which is where Personal AI is most honestly judged.',
      zh: '本条目把比较重点放在个人上下文和记忆价值上，这也是 Personal AI 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Memory usefulness', 'Personalization depth', 'Long-term assistant value'],
        zh: ['记忆实用性', '个性化深度', '长期助手价值'],
      },
      officialSummary: {
        en: 'The official site is useful for trust, but the deeper question is whether Personal AI actually feels more valuable over time as it learns user context.',
        zh: '官网本身适合作为信任检查点，但更深层的问题是：随着用户上下文积累，Personal AI 是否真的变得越来越有价值。',
      },
      freshnessSummary: {
        en: 'Personal-memory tools evolve through positioning and workflow details, so exact product boundaries should still be confirmed on the official site.',
        zh: '个人记忆工具会随着定位和流程细节变化，所以具体产品边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when retaining personal context actually changes the quality of daily assistant use.',
        zh: '只有当保留个人上下文真的改变了日常助手使用质量时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the product feels like a personal system instead of a generic AI wrapper.',
        zh: '这里的预览能帮助用户判断：它更像一个个人系统，而不是普通 AI 外壳。',
      },
      communitySummary: {
        en: 'The strongest signal comes from users explaining whether Personal AI became more useful as private context accumulated.',
        zh: '最强的信号，来自用户是否说明随着私有上下文积累，Personal AI 真的变得更有用。',
      },
    },
    media: {
      category: 'Life Assistant',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf8ff',
      badge: 'Personal memory layer',
      summary: 'Build a more individualized assistant by carrying forward private context and memory.',
      logoText: 'Pa',
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
  const title = escapeXml(seed.title);

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

  <rect x="118" y="126" width="236" height="46" rx="23" fill="${accentSoft}"/>
  <text x="236" y="155" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="${accentStrong}">${escapeXml(category)}</text>

  <text x="118" y="252" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="#0f172a">${title}</text>
  <text x="118" y="320" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="${accentStrong}">${escapeXml(badge)}</text>
  <text x="118" y="394" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" fill="#475569">${escapeXml(summary)}</text>

  <rect x="118" y="470" width="548" height="176" rx="30" fill="${surface}" stroke="${accentSoft}" stroke-width="2"/>
  <text x="160" y="532" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0f172a">Stable editorial preview</text>
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps this page stable across deploys</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and removes reliance on flaky external preview sources.</text>

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

async function applySeed(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const categoryId = categoryIdMap.get(seed.categorySlug);
  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const result = await query('SELECT id, tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (result.rowCount === 0) {
    console.log(`- skipped ${seed.name}: not found`);
    return false;
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
    decision: {
      ...existingDecision,
      compareAxes: {
        en: seed.decision.compareAxes.en,
        zh: seed.decision.compareAxes.zh,
      },
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
  return true;
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

  let updatedCount = 0;
  for (const seed of TOOLS) {
    const updated = await applySeed(seed, categoryIdMap, reviewedAt);
    if (updated) updatedCount += 1;
  }

  console.log(`\nDone. Updated ${updatedCount} life/creative entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich life/creative wave 11:', error);
  await closePool();
  process.exit(1);
});

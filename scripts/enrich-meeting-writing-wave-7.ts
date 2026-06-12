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
  categorySlug: 'productivity' | 'text-writing';
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
  { slug: 'meeting-notes', en: 'Meeting Notes', zh: '会议纪要' },
  { slug: 'transcription', en: 'Transcription', zh: '转录' },
  { slug: 'summary', en: 'Summary', zh: '总结' },
  { slug: 'collaboration', en: 'Collaboration', zh: '协作' },
  { slug: 'call-intelligence', en: 'Call Intelligence', zh: '通话智能' },
  { slug: 'note-taking', en: 'Note Taking', zh: '笔记' },
  { slug: 'ai-writing', en: 'AI Writing', zh: 'AI 写作' },
  { slug: 'marketing', en: 'Marketing', zh: '营销' },
  { slug: 'seo', en: 'SEO', zh: 'SEO' },
  { slug: 'content-workflow', en: 'Content Workflow', zh: '内容工作流' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'fathom',
    title: 'Fathom',
    url: 'https://fathom.video',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'transcription', 'summary', 'call-intelligence'],
    content: {
      en: 'An AI meeting assistant for notes, highlights, and helping teams turn conversations into follow-through.',
      zh: '一个用于会议纪要、重点提炼，并帮助团队把对话转成后续行动的 AI 会议助手。',
    },
    detail: {
      en: `Fathom matters when meetings are recurring operating work rather than one-off conversations. It is especially relevant for founders, sales teams, customer calls, and internal syncs where the cost of bad notes shows up after the meeting, not during it.

This page should help users compare Fathom as a workflow-reduction tool instead of a raw transcription utility. The real question is whether it reduces the manual burden after calls enough to change team habits.`,
      zh: `当会议已经变成重复性的运营工作，而不是偶发性的沟通时，Fathom 的价值会更明显。它尤其适合创始人、销售、客户通话和内部同步，因为“纪要做得差”的成本，往往是在会后才真正暴露出来。

这页真正要帮助用户判断的是：Fathom 是不是一个“减少会后负担”的工作流工具，而不只是转录工具。核心问题在于，它是否足够明显地减少会后手工整理，从而改变团队习惯。`,
    },
    useCases: {
      en: ['Meeting notes', 'Call summaries', 'Sales follow-up', 'Internal sync workflows'],
      zh: ['会议纪要', '通话总结', '销售跟进', '内部同步工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Reducing meeting admin and recap work after recurring calls.' },
        { label: 'Best for', value: 'Teams that want cleaner summaries and faster follow-through after meetings.' },
        { label: 'Decision angle', value: 'Compare on summary usefulness, workflow fit, and post-meeting execution value.' },
      ],
      zh: [
        { label: '核心定位', value: '减少重复会议后的记录、总结和行政负担。' },
        { label: '更适合', value: '希望获得更干净总结和更快会后执行的团队。' },
        { label: '比较重点', value: '重点比较总结可用性、流程贴合度和会后执行价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Founders on frequent calls', 'Sales and success teams', 'Teams with lots of recurring meetings'],
        zh: ['频繁开会的创始人', '销售与客户成功团队', '会议密度高的团队'],
      },
      notIdealFor: {
        en: ['People who rarely meet live', 'Teams only wanting a basic transcript without workflow support'],
        zh: ['几乎不进行实时会议的人', '只想要基础转录、不需要工作流支持的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a meeting-workflow tool rather than a pure transcription utility.',
      zh: '已按“会议工作流工具”而不是纯转录工具来复核。',
    },
    trustNote: {
      en: 'This listing is framed around follow-through value, because that is usually where Fathom earns its place.',
      zh: '本条目围绕“会后跟进价值”来定位，因为这通常才是 Fathom 真正被采用的原因。',
    },
    decision: {
      compareAxes: {
        en: ['Summary quality', 'Post-call follow-through', 'Meeting admin reduction'],
        zh: ['总结质量', '会后跟进', '会议行政负担降低'],
      },
      officialSummary: {
        en: 'The official site is trustworthy, but the deeper question is whether the tool changes what happens after meetings, not just what gets transcribed during them.',
        zh: '官网本身值得信任，但更深层的问题是：它有没有改变会议之后发生的事情，而不只是记录了会议当下的内容。',
      },
      freshnessSummary: {
        en: 'Meeting assistants evolve through integrations and workflow packaging, so current feature edges should still be checked on the official site before adoption.',
        zh: '会议助手会随着集成和工作流包装持续变化，所以在真正采用前，当前能力边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The pricing threshold matters when meetings happen often enough that note-taking and follow-up become a repeated operating cost.',
        zh: '它的价格门槛只有在会议频率高到“记录和跟进本身已经成为重复运营成本”时才真正值得看重。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users want to judge whether the interface supports recap, sharing, and follow-through instead of showing only raw transcripts.',
        zh: '这里的预览很重要，因为用户会判断界面是不是在支持总结、分享和跟进，而不只是给一份原始转录。',
      },
      communitySummary: {
        en: 'The most useful feedback comes from teams explaining whether Fathom actually changed meeting habits and saved post-call time.',
        zh: '最有价值的反馈，来自团队是否说明 Fathom 真的改变了会议习惯，并节省了会后时间。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#06b6d4',
      accentSoft: '#cffafe',
      accentStrong: '#0891b2',
      surface: '#f4fdff',
      badge: 'Meeting workflow',
      summary: 'Capture notes, highlights, and follow-through after recurring calls.',
      logoText: 'Fa',
    },
  },
  {
    name: 'writesonic',
    title: 'Writesonic',
    url: 'https://writesonic.com',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'marketing', 'seo', 'content-workflow'],
    content: {
      en: 'An AI writing platform for marketing copy, SEO content, and broader content-production workflows.',
      zh: '一个用于营销文案、SEO 内容和更广泛内容生产工作流的 AI 写作平台。',
    },
    detail: {
      en: `Writesonic is most relevant when the writing job is tied to growth, SEO, and repeatable marketing output rather than one-off brainstorming. It sits closer to a content workflow tool than to a narrow rewriting assistant, which makes it useful for teams publishing frequently across channels.

The practical decision on this page is whether Writesonic improves content velocity without making the workflow feel generic or too hard to control. If the work is recurring marketing production, it belongs in the comparison set.`,
      zh: `当写作任务和增长、SEO、重复性的营销产出绑定在一起，而不是一次性头脑风暴时，Writesonic 会更有代表性。它更像一个内容工作流工具，而不是狭义改写助手，所以对高频跨渠道发布内容的团队会更有意义。

这页真正的判断点在于：Writesonic 是否能提升内容速度，同时又不会让工作流变得过于模板化、难以控制。如果你的工作是持续性的营销内容生产，它值得进入比较集合。`,
    },
    useCases: {
      en: ['SEO content', 'Marketing copy', 'Campaign drafts', 'Content production workflows'],
      zh: ['SEO 内容', '营销文案', '活动草稿', '内容生产工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams produce growth-oriented content more consistently.' },
        { label: 'Best for', value: 'Marketing and SEO teams that publish often and need a repeatable content workflow.' },
        { label: 'Decision angle', value: 'Compare on content velocity, workflow breadth, and output control.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队更稳定地生产偏增长导向的内容。' },
        { label: '更适合', value: '高频发布内容、需要可重复内容工作流的营销和 SEO 团队。' },
        { label: '比较重点', value: '重点比较内容速度、工作流广度和输出控制力。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['SEO teams', 'Content marketers', 'Founders shipping repeatable growth content'],
        zh: ['SEO 团队', '内容营销团队', '高频产出增长内容的创始人'],
      },
      notIdealFor: {
        en: ['People only needing occasional rewriting', 'Teams looking for a pure meeting or note-taking tool'],
        zh: ['只需要偶尔改写文本的人', '在寻找会议或笔记工具的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a growth-content workflow tool rather than a narrow writing helper.',
      zh: '已按“增长内容工作流工具”而不是狭义写作助手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the focus on marketing and SEO workflow fit, which is where Writesonic is most meaningfully compared.',
      zh: '本条目把重点放在营销与 SEO 工作流适配上，这也是 Writesonic 最常被认真比较的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Content velocity', 'SEO workflow fit', 'Output control'],
        zh: ['内容速度', 'SEO 工作流适配', '输出控制力'],
      },
      officialSummary: {
        en: 'The official site is a reliable checkpoint, but the stronger decision is whether the product supports your recurring content workflow instead of just promising more AI writing.',
        zh: '官网本身是可靠检查点，但更重要的判断是：它是否真正支持你的重复性内容工作流，而不是只在口头上承诺更多 AI 写作能力。',
      },
      freshnessSummary: {
        en: 'Writing products evolve through packaging and workflow additions, so plan boundaries should still be confirmed on the official site before a team rollout.',
        zh: '写作产品会通过套餐与工作流扩展不断变化，所以在团队正式采用前，套餐边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price becomes easier to justify when SEO briefs, campaign drafts, and repeatable marketing content are already a weekly habit.',
        zh: '只有当 SEO brief、活动草稿和重复性营销内容已经变成每周常规工作时，这类产品的价格才会更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the workflow feels broad enough for content operations instead of looking like a single-purpose writing box.',
        zh: '这里的预览能帮助用户判断：它是不是一个足够完整的内容工作流，而不只是一个单一写作输入框。',
      },
      communitySummary: {
        en: 'The strongest feedback comes from teams describing whether Writesonic actually saved time across recurring SEO and marketing output.',
        zh: '最有价值的反馈，来自团队是否说明 Writesonic 真的在重复性的 SEO 和营销产出里节省了时间。',
      },
    },
    media: {
      category: 'Text & Writing',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf7ff',
      badge: 'Growth writing',
      summary: 'Produce SEO and marketing content with a more repeatable workflow.',
      logoText: 'Ws',
    },
  },
  {
    name: 'notta',
    title: 'Notta',
    url: 'https://www.notta.ai',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'transcription', 'summary', 'collaboration'],
    content: {
      en: 'An AI transcription and note tool for meetings, interviews, and turning recordings into usable summaries.',
      zh: '一个面向会议、访谈和录音整理的 AI 转录与笔记工具，可把对话变成可用总结。',
    },
    detail: {
      en: `Notta becomes useful when the team needs a reliable path from spoken conversation to usable written output. It sits in the meeting-notes layer where transcript quality, summary usefulness, and export/share workflows all matter together.

The real decision is whether Notta is strong enough to become part of a repeated note workflow instead of staying as an occasional recording utility. If you depend on turning calls or interviews into structured output, it is worth comparing carefully.`,
      zh: `当团队需要一条稳定路径，把口头对话变成可用书面输出时，Notta 会很有价值。它处在会议笔记这一层，转录质量、总结可用性，以及导出/分享工作流需要一起被判断。

这里真正的判断点是：Notta 是否足够强，能成为重复性的笔记工作流一部分，而不是只停留在偶尔使用的录音工具。如果你依赖把会议或访谈转成结构化内容，它值得认真比较。`,
    },
    useCases: {
      en: ['Meeting transcription', 'Interview notes', 'Recording summaries', 'Shared team notes'],
      zh: ['会议转录', '访谈纪要', '录音总结', '团队共享笔记'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning spoken conversations into usable team notes and summaries.' },
        { label: 'Best for', value: 'Teams that need repeatable recording-to-note workflows.' },
        { label: 'Decision angle', value: 'Compare on transcript quality, summary usefulness, and export workflow fit.' },
      ],
      zh: [
        { label: '核心定位', value: '把口头对话变成团队可用的笔记与总结。' },
        { label: '更适合', value: '需要稳定录音到笔记工作流的团队。' },
        { label: '比较重点', value: '重点比较转录质量、总结可用性和导出流程适配度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Teams documenting calls', 'Researchers and interviewers', 'Operators who revisit conversations later'],
        zh: ['需要记录通话的团队', '研究者和访谈人员', '需要事后回看对话的运营人员'],
      },
      notIdealFor: {
        en: ['People who rarely work from recordings', 'Teams only wanting a simple one-click audio archive'],
        zh: ['很少基于录音工作的用户', '只想做简单音频归档的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a recording-to-notes workflow tool rather than just an audio archive utility.',
      zh: '已按“录音到笔记”的工作流工具来复核，而不只是音频存档工具。',
    },
    trustNote: {
      en: 'This listing emphasizes repeat note workflow value, which is where Notta is most worth comparing.',
      zh: '本条目强调的是重复性笔记工作流价值，这也是 Notta 最值得被比较的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Transcript quality', 'Summary usefulness', 'Export and sharing workflow'],
        zh: ['转录质量', '总结可用性', '导出与分享工作流'],
      },
      officialSummary: {
        en: 'The official site is easy to trust, but the stronger question is whether the tool consistently turns recordings into output your team will actually reuse.',
        zh: '官网本身容易建立信任，但更重要的问题是：它能不能持续把录音转成团队真的会反复使用的输出。',
      },
      freshnessSummary: {
        en: 'Meeting-note products evolve through integrations and packaging, so exact plan details should still be checked on the official site before rollout.',
        zh: '会议笔记产品会通过集成和套餐持续变化，所以在正式推广前，具体套餐细节仍建议看官网。',
      },
      pricingSummary: {
        en: 'The price becomes more reasonable when recordings, interviews, and recurring meetings already create enough manual note work each week.',
        zh: '只有当录音、访谈和重复会议每周已经制造足够多手工整理工作时，这类产品的价格才更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users want to see whether the product supports summary, search, and sharing instead of just presenting raw text.',
        zh: '这里的预览很重要，因为用户会判断它是否支持总结、搜索和分享，而不是只把原始文本丢出来。',
      },
      communitySummary: {
        en: 'The strongest signal comes from people describing whether Notta became part of their repeated documentation workflow.',
        zh: '最强的信号，来自用户是否说明 Notta 进入了他们重复性的记录工作流。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#4f46e5',
      accentSoft: '#e0e7ff',
      accentStrong: '#4338ca',
      surface: '#f8f9ff',
      badge: 'Transcription workflow',
      summary: 'Turn meetings, interviews, and recordings into reusable notes and summaries.',
      logoText: 'No',
    },
  },
  {
    name: 'otter',
    title: 'Otter',
    url: 'https://otter.ai',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'transcription', 'collaboration', 'summary'],
    content: {
      en: 'A meeting note tool for live transcription, searchable summaries, and team collaboration around conversations.',
      zh: '一个用于实时转录、可搜索总结和团队协作的会议笔记工具。',
    },
    detail: {
      en: `Otter is one of the clearer reference points in the meeting-notes category because users often compare it when they want live transcription plus an output their team can actually share and revisit. It is less about raw recording and more about making conversations easier to work with afterward.

The practical decision here is whether Otter improves visibility and reuse around meetings enough to become part of the default team workflow. If searchable notes and shared recap matter, it deserves a serious look.`,
      zh: `Otter 是会议笔记分类里比较清晰的参考点之一，因为很多用户会在需要“实时转录 + 团队可共享、可回看的输出”时拿它来比较。它不只是做录音，而是让会议之后的内容更容易被使用。

这里真正的判断点在于：Otter 是否足以提升会议后的可见性和复用性，进入团队默认工作流。如果你很看重可搜索笔记和共享总结，它值得被认真比较。`,
    },
    useCases: {
      en: ['Live transcription', 'Meeting recaps', 'Searchable notes', 'Shared team documentation'],
      zh: ['实时转录', '会议回顾', '可搜索笔记', '团队共享文档'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Making meeting conversations searchable, shareable, and easier to reuse.' },
        { label: 'Best for', value: 'Teams that want live transcription plus collaborative note access.' },
        { label: 'Decision angle', value: 'Compare on transcription experience, note searchability, and collaboration fit.' },
      ],
      zh: [
        { label: '核心定位', value: '让会议对话更易搜索、易共享、易复用。' },
        { label: '更适合', value: '希望兼顾实时转录和协作式笔记访问的团队。' },
        { label: '比较重点', value: '重点比较转录体验、笔记可搜索性和协作适配度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Teams in frequent meetings', 'Interview-heavy workflows', 'People needing shared searchable notes'],
        zh: ['会议密度高的团队', '高频访谈工作流', '需要共享可搜索笔记的人'],
      },
      notIdealFor: {
        en: ['People who rarely revisit meeting notes', 'Teams that only need raw audio storage'],
        zh: ['几乎不会回看会议纪要的人', '只需要原始音频存储的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a collaborative meeting-notes reference point, not just a recorder.',
      zh: '已按“协作型会议笔记参考工具”来复核，而不只是录音器。',
    },
    trustNote: {
      en: 'This listing focuses on searchable and collaborative output, because that is usually the real comparison point for Otter.',
      zh: '本条目强调的是可搜索、可协作的输出，因为这通常才是 Otter 被认真比较的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Live transcription feel', 'Searchable note quality', 'Collaboration workflow'],
        zh: ['实时转录体验', '可搜索笔记质量', '协作工作流'],
      },
      officialSummary: {
        en: 'The official site is a useful trust checkpoint, but the bigger decision is whether the team will actually reuse what the product generates after meetings.',
        zh: '官网本身是有用的信任检查点，但更大的判断是：团队会不会真的复用这个产品在会后生成的内容。',
      },
      freshnessSummary: {
        en: 'Meeting products evolve through integrations and packaging, so exact plan differences should still be checked on the official site before adoption.',
        zh: '会议产品会通过集成和套餐持续变化，所以在正式采用前，具体套餐差异仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when searchable notes and shared recaps save recurring coordination time every week.',
        zh: '只有当可搜索笔记和共享总结每周都在持续节省协作时间时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the product presents notes as a reusable workspace rather than a wall of transcript text.',
        zh: '这里的预览能帮助用户判断：它呈现的是一个可复用的笔记工作区，还是只是一面转录文本墙。',
      },
      communitySummary: {
        en: 'The best feedback comes from teams explaining whether Otter improved meeting clarity and cross-team reuse over time.',
        zh: '最有价值的反馈，来自团队是否说明 Otter 随时间推移改善了会议清晰度和跨团队复用。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Live meeting notes',
      summary: 'Create searchable meeting notes that teams can share and revisit quickly.',
      logoText: 'Ot',
    },
  },
  {
    name: 'fireflies',
    title: 'Fireflies',
    url: 'https://fireflies.ai',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'transcription', 'summary', 'collaboration'],
    content: {
      en: 'An AI meeting assistant that records, transcribes, and summarizes conversations for team follow-through.',
      zh: '一个用于记录、转录并总结会议对话、帮助团队推进后续工作的 AI 会议助手。',
    },
    detail: {
      en: `Fireflies is a strong fit when the team wants meetings to become searchable operational memory instead of disappearing after the call ends. It is especially useful for organizations with recurring internal syncs, customer conversations, and follow-up-heavy workflows.

The real decision on this page is whether Fireflies helps your team retain and reuse conversation value more consistently than lighter one-off note tools. If meeting output needs to circulate across people, it belongs in the shortlist.`,
      zh: `当团队希望会议变成“可搜索的组织记忆”，而不是在通话结束后就消散掉时，Fireflies 会很有价值。它尤其适合那些有大量内部同步、客户沟通和高频跟进流程的组织。

这页真正的判断点是：Fireflies 是否能比更轻量的一次性笔记工具，更稳定地帮助团队保留和复用对话价值。如果会议输出需要在多人之间流转，它值得进入 shortlist。`,
    },
    useCases: {
      en: ['Meeting recording', 'Team summaries', 'Conversation search', 'Follow-up coordination'],
      zh: ['会议记录', '团队总结', '对话搜索', '后续协同'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning meetings into searchable, reusable team memory.' },
        { label: 'Best for', value: 'Teams that want summary, search, and follow-up around recurring conversations.' },
        { label: 'Decision angle', value: 'Compare on retention value, team reuse, and follow-up coordination fit.' },
      ],
      zh: [
        { label: '核心定位', value: '把会议转成可搜索、可复用的团队记忆。' },
        { label: '更适合', value: '希望围绕重复性对话建立总结、搜索和跟进能力的团队。' },
        { label: '比较重点', value: '重点比较信息保留价值、团队复用度和后续协同适配。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Operations-heavy teams', 'Customer-facing teams', 'Organizations sharing meeting outputs across people'],
        zh: ['运营密度高的团队', '面向客户的团队', '需要多人共享会议输出的组织'],
      },
      notIdealFor: {
        en: ['Solo users who rarely revisit past calls', 'Teams only needing a minimal transcript file'],
        zh: ['很少回看历史会议的个人用户', '只需要最小化转录文件的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a reusable meeting-memory tool rather than a disposable note helper.',
      zh: '已按“可复用的会议记忆工具”而不是一次性笔记助手来复核。',
    },
    trustNote: {
      en: 'This listing focuses on conversation reuse and coordination value, which is where Fireflies is most defensible.',
      zh: '本条目强调的是对话复用与协同价值，这也是 Fireflies 最有说服力的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Meeting memory value', 'Search and reuse', 'Follow-up coordination'],
        zh: ['会议记忆价值', '搜索与复用', '后续协同'],
      },
      officialSummary: {
        en: 'The official site is reliable, but the stronger decision is whether the tool helps conversations keep creating value after the meeting ends.',
        zh: '官网本身可靠，但更重要的判断是：这个工具是否让对话在会议结束后依然持续创造价值。',
      },
      freshnessSummary: {
        en: 'Meeting assistants change through integrations and packaging, so exact plan differences should still be checked on the official site before rollout.',
        zh: '会议助手会随着集成和套餐变化，所以在团队推广前，具体套餐差异仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price becomes more justifiable when recurring meetings already generate enough follow-up friction for the team each week.',
        zh: '只有当重复会议每周已经给团队制造足够多的后续摩擦时，这类产品的价格才更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because teams want to see whether the product presents meeting output as something reusable rather than just storing transcripts.',
        zh: '这里的预览很重要，因为团队会判断：它是否把会议输出做成可复用的东西，而不只是存放转录内容。',
      },
      communitySummary: {
        en: 'The most useful feedback comes from teams describing whether Fireflies actually improved recall and follow-up across repeated meetings.',
        zh: '最有价值的反馈，来自团队是否说明 Fireflies 真的改善了重复会议中的信息回忆和后续跟进。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f3fffd',
      badge: 'Meeting memory',
      summary: 'Store, search, and reuse team conversations more effectively over time.',
      logoText: 'Fi',
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
  <text x="160" y="580" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">Local media keeps cards consistent across deploys</text>
  <text x="160" y="614" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#475569">and removes dependence on flaky external screenshots.</text>

  <rect x="874" y="142" width="360" height="360" rx="42" fill="url(#panel-${seed.name})"/>
  <rect x="914" y="182" width="280" height="280" rx="34" fill="rgba(255,255,255,0.9)"/>
  <text x="1054" y="344" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="108" font-weight="800" fill="${accentStrong}">${escapeXml(logoText)}</text>

  <rect x="874" y="548" width="360" height="86" rx="28" fill="${accentSoft}"/>
  <text x="1054" y="602" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${accentStrong}">Decision page ready</text>
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

  console.log(`\nDone. Updated ${updatedCount} meeting/writing entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich meeting/writing wave 7:', error);
  await closePool();
  process.exit(1);
});

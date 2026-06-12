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
  categorySlug: 'productivity' | 'chatbot' | 'design-art';
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
  { slug: 'audio-editing', en: 'Audio Editing', zh: '音频编辑' },
  { slug: 'video-editing', en: 'Video Editing', zh: '视频编辑' },
  { slug: 'transcription', en: 'Transcription', zh: '转录' },
  { slug: 'chat', en: 'Chat', zh: '对话' },
  { slug: 'roleplay', en: 'Roleplay', zh: '角色扮演' },
  { slug: 'storytelling', en: 'Storytelling', zh: '故事互动' },
  { slug: 'image-generation', en: 'Image Generation', zh: '图像生成' },
  { slug: '3d', en: '3D', zh: '3D' },
  { slug: 'design', en: 'Design', zh: '设计' },
  { slug: 'presentation', en: 'Presentation', zh: '演示' },
  { slug: 'visual-content', en: 'Visual Content', zh: '视觉内容' },
  { slug: 'multi-model', en: 'Multi-model', zh: '多模型' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'descript',
    title: 'Descript',
    url: 'https://www.descript.com',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['audio-editing', 'video-editing', 'transcription'],
    content: {
      en: 'A collaborative audio and video editor with transcription, cleanup, and content-reuse workflows built in.',
      zh: '一个内置转录、清理和内容复用工作流的协作式音视频编辑工具。',
    },
    detail: {
      en: `Descript matters when the job is not just recording or transcribing, but turning spoken content into something editable, reusable, and publishable. It sits closer to a production workflow tool than a plain note assistant, which makes it relevant for teams creating podcasts, video clips, interviews, and repurposed content.

The practical decision on this page is whether Descript shortens the path from raw conversation to usable media strongly enough to justify becoming part of the stack. If transcription is only the first step and editing is where the real work happens, it deserves a serious look.`,
      zh: `当工作不只是录音或转录，而是要把口头内容变成可编辑、可复用、可发布的成果时，Descript 就会很有价值。它更接近“内容生产工作流工具”，而不是单纯笔记助手，所以对播客、视频片段、访谈和内容再利用团队都很相关。

这页真正要帮助用户判断的是：Descript 是否足够明显地缩短了“原始对话 -> 可用媒体”的路径，值得进入核心工具栈。如果转录只是第一步，而编辑才是真正的工作重心，它就值得被认真比较。`,
    },
    useCases: {
      en: ['Audio editing', 'Video editing', 'Transcript-based production', 'Content repurposing'],
      zh: ['音频编辑', '视频编辑', '基于转录的内容制作', '内容再利用'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning spoken content into editable media and reusable output faster.' },
        { label: 'Best for', value: 'Teams producing podcasts, clips, interviews, and transcript-driven content.' },
        { label: 'Decision angle', value: 'Compare on edit speed, workflow depth, and how well transcription feeds production.' },
      ],
      zh: [
        { label: '核心定位', value: '更快把口头内容转成可编辑媒体和可复用输出。' },
        { label: '更适合', value: '制作播客、视频片段、访谈和转录驱动内容的团队。' },
        { label: '比较重点', value: '重点比较编辑速度、工作流深度，以及转录如何进入生产流程。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Creators editing spoken content', 'Teams repurposing interviews and calls', 'Media workflows built on transcripts'],
        zh: ['编辑口头内容的创作者', '复用访谈和通话内容的团队', '基于转录开展媒体工作的流程'],
      },
      notIdealFor: {
        en: ['Users only wanting basic meeting notes', 'Teams that do not edit or publish spoken content'],
        zh: ['只想要基础会议纪要的用户', '不编辑或发布口头内容的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a transcript-to-production workflow tool rather than a simple note helper.',
      zh: '已按“从转录到生产”的工作流工具来复核，而不是简单笔记助手。',
    },
    trustNote: {
      en: 'This listing keeps the focus on production usefulness, which is where Descript is most honestly judged.',
      zh: '本条目把重点放在内容生产实用性上，这也是 Descript 最值得被真实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Editing speed', 'Transcript-to-production flow', 'Content reuse value'],
        zh: ['编辑速度', '转录到生产的流程', '内容复用价值'],
      },
      officialSummary: {
        en: 'The official site is trustworthy, but the deeper question is whether the product helps teams do more than just transcribe content.',
        zh: '官网本身值得信任，但更深层的问题是：这个产品是否帮助团队做的不只是转录内容。',
      },
      freshnessSummary: {
        en: 'Production tools evolve through packaging and features, so exact plan details should still be checked on the official site before rollout.',
        zh: '内容生产工具会随着套餐和功能持续演进，所以在推广前，具体套餐细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when transcript cleanup, clip making, and content reuse already happen every week.',
        zh: '只有当转录整理、片段制作和内容再利用已经成为每周重复工作时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the interface feels like a real editor rather than a transcript viewer.',
        zh: '这里的预览很重要，因为用户需要判断这个界面看起来像真正的编辑器，而不只是转录查看器。',
      },
      communitySummary: {
        en: 'The best feedback comes from teams explaining whether Descript actually made spoken-content production faster and cleaner.',
        zh: '最有价值的反馈，来自团队是否说明 Descript 真的让口头内容制作更快、更干净。',
      },
    },
    media: {
      category: 'Productivity',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Transcript to production',
      summary: 'Edit audio and video faster when transcripts are part of the production workflow.',
      logoText: 'De',
    },
  },
  {
    name: 'character-ai',
    title: 'Character.AI',
    url: 'https://character.ai',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'roleplay', 'storytelling'],
    content: {
      en: 'A conversational AI platform centered on character-based chats, roleplay, and interactive storytelling experiences.',
      zh: '一个以角色对话、角色扮演和互动式故事体验为核心的对话 AI 平台。',
    },
    detail: {
      en: `Character.AI matters when the user is not just looking for a productivity assistant, but for a more personality-driven conversational experience. It belongs in a different comparison set from work-oriented chatbots because the real value is about interaction style, entertainment, and character immersion.

The decision on this page is whether the product offers enough engagement and replay value to justify its place in a user’s routine. If the job is exploration, roleplay, or personality-driven dialogue rather than knowledge work, it is worth evaluating on those terms.`,
      zh: `当用户寻找的不是生产力助手，而是更有角色感、更有个性的对话体验时，Character.AI 就会更有代表性。它和偏工作型聊天机器人不在同一个比较集合里，因为它真正的价值来自互动方式、娱乐性和角色沉浸感。

这页真正要帮助用户判断的是：这个产品是否有足够的参与感和重复游玩价值，值得进入日常使用。如果你的任务更偏探索、角色扮演或人格驱动对话，而不是知识工作，就应该按这些维度来比较它。`,
    },
    useCases: {
      en: ['Character chat', 'Roleplay', 'Interactive storytelling', 'Personality-driven conversations'],
      zh: ['角色对话', '角色扮演', '互动式故事体验', '人格驱动对话'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Character-based interaction instead of generic work-oriented assistance.' },
        { label: 'Best for', value: 'Users who care about roleplay, immersion, and more personality-rich dialogue.' },
        { label: 'Decision angle', value: 'Compare on engagement, character consistency, and replay value.' },
      ],
      zh: [
        { label: '核心定位', value: '角色化互动，而不是通用工作型助手。' },
        { label: '更适合', value: '在意角色扮演、沉浸感和更有人格化对话的用户。' },
        { label: '比较重点', value: '重点比较参与感、角色一致性和重复体验价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Users exploring character chat', 'People interested in roleplay or entertainment AI', 'Users wanting personality-rich dialogue'],
        zh: ['探索角色对话的用户', '对角色扮演或娱乐型 AI 感兴趣的人', '想要更有人格感对话体验的用户'],
      },
      notIdealFor: {
        en: ['Teams needing work-oriented productivity help', 'Users shopping for research or coding assistants'],
        zh: ['需要工作型生产力辅助的团队', '在选购研究或编码助手的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a character-interaction product rather than a broad workplace chatbot.',
      zh: '已按“角色互动产品”而不是广谱职场聊天机器人来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on engagement and character experience, which is where Character.AI is most meaningfully judged.',
      zh: '本条目把比较锚点放在参与感和角色体验上，这也是 Character.AI 最值得被认真判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Engagement', 'Character consistency', 'Replay value'],
        zh: ['参与感', '角色一致性', '重复体验价值'],
      },
      officialSummary: {
        en: 'The official site is useful for trust, but the deeper decision is whether the character experience feels strong enough to keep users returning.',
        zh: '官网本身能提供基础信任，但更深层的判断是：角色体验是否足够强，能让用户反复回来。',
      },
      freshnessSummary: {
        en: 'Character products evolve through features and community behavior, so exact product boundaries should still be checked on the official site.',
        zh: '角色类产品会随着功能和社区行为变化，所以具体产品边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price only becomes meaningful if the product creates enough repeat engagement to become part of someone’s regular conversational routine.',
        zh: '只有当这个产品能形成足够强的重复参与感，进入日常对话习惯时，它的价格才真正值得判断。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the product presents a real character-driven experience instead of a generic chat surface.',
        zh: '这里的预览能帮助用户判断：它呈现的是不是一个真正的角色驱动体验，而不是普通聊天界面。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether users describe repeat engagement and memorable character interactions, not just one-time novelty.',
        zh: '最强的信号，来自用户是否描述了重复参与感和难忘的角色互动，而不只是一次性的新鲜感。',
      },
    },
    media: {
      category: 'Chatbot',
      accent: '#ec4899',
      accentSoft: '#fce7f3',
      accentStrong: '#db2777',
      surface: '#fff8fc',
      badge: 'Character chat',
      summary: 'Evaluate roleplay, immersion, and personality-rich conversation instead of pure productivity.',
      logoText: 'Ch',
    },
  },
  {
    name: 'luma-ai',
    title: 'Luma AI',
    url: 'https://lumalabs.ai',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['image-generation', '3d', 'visual-content'],
    content: {
      en: 'A creative AI tool for 3D capture, visual generation, and richer media workflows.',
      zh: '一个面向 3D 捕捉、视觉生成和更丰富媒体工作流的创意 AI 工具。',
    },
    detail: {
      en: `Luma AI becomes relevant when the creative job includes more than static image generation. It sits in a more visually ambitious part of the design category, where users care about richer scenes, dimensionality, and media outputs that can go beyond a flat visual.

The practical decision is whether Luma AI adds enough value to the creative workflow to justify learning and using a more specialized visual tool. If the work touches 3D, scene-building, or higher-fidelity visual output, it belongs in the shortlist.`,
      zh: `当创意工作不只停留在静态图像生成，而是开始涉及更立体、更丰富的媒体表达时，Luma AI 就会更有意义。它位于设计分类里更偏视觉深度的一侧，用户关心的是场景、维度感，以及超出平面图像的输出能力。

这里真正的判断点是：Luma AI 是否为创意流程增加了足够多的价值，值得学习和使用一个更专门的视觉工具。如果工作涉及 3D、场景构建或更高保真的视觉输出，它值得进入 shortlist。`,
    },
    useCases: {
      en: ['3D capture', 'Scene generation', 'Visual prototyping', 'Higher-fidelity media creation'],
      zh: ['3D 捕捉', '场景生成', '视觉原型', '更高保真媒体创作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Richer visual workflows that go beyond flat image generation.' },
        { label: 'Best for', value: 'Creators exploring 3D, scenes, and more dimensional media outputs.' },
        { label: 'Decision angle', value: 'Compare on visual depth, workflow fit, and creative payoff.' },
      ],
      zh: [
        { label: '核心定位', value: '超出平面图像生成的更丰富视觉工作流。' },
        { label: '更适合', value: '在探索 3D、场景和更有维度感媒体输出的创作者。' },
        { label: '比较重点', value: '重点比较视觉深度、工作流适配和创作回报。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Visual creators', 'Design teams exploring richer media', 'People experimenting with 3D-adjacent creative output'],
        zh: ['视觉创作者', '探索更丰富媒体表达的设计团队', '尝试 3D 相关创意输出的人'],
      },
      notIdealFor: {
        en: ['Users only wanting basic 2D generation', 'Teams focused purely on documents or text output'],
        zh: ['只想要基础 2D 生成的用户', '只关注文档或文本输出的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a richer visual-media tool rather than a basic image generator.',
      zh: '已按“更丰富的视觉媒体工具”而不是基础图像生成器来复核。',
    },
    trustNote: {
      en: 'This listing focuses on workflow depth and visual payoff, which is where Luma AI is most meaningfully compared.',
      zh: '本条目把重点放在工作流深度和视觉回报上，这也是 Luma AI 最常被认真比较的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Visual depth', 'Creative workflow fit', '3D/media payoff'],
        zh: ['视觉深度', '创意工作流适配', '3D/媒体回报'],
      },
      officialSummary: {
        en: 'The official site is a useful checkpoint, but the deeper decision is whether the product meaningfully expands your visual workflow rather than adding novelty.',
        zh: '官网本身是有用的检查点，但更深层的判断是：这个产品是否真正扩展了你的视觉工作流，而不只是增加新鲜感。',
      },
      freshnessSummary: {
        en: 'Creative media products evolve quickly, so exact capabilities should still be checked on the official site before rollout.',
        zh: '创意媒体产品变化很快，所以在正式采用前，具体能力边界仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price becomes more defensible when richer media output clearly saves time or unlocks work that simpler tools cannot support.',
        zh: '只有当更丰富的媒体输出明显节省时间，或能完成更简单工具做不到的工作时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters a lot here because users judge whether the visual quality feels meaningfully different from simpler creative tools.',
        zh: '这里的预览很关键，因为用户会判断视觉质量是否真的和更简单的创意工具拉开了差距。',
      },
      communitySummary: {
        en: 'The strongest signal comes from creators explaining whether Luma AI actually improved the look and depth of their visual work.',
        zh: '最强的信号，来自创作者是否说明 Luma AI 真的改善了他们作品的视觉表现和层次感。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f3fffd',
      badge: 'Richer visual media',
      summary: 'Explore 3D-adjacent, scene-based, and higher-fidelity creative workflows.',
      logoText: 'Lu',
    },
  },
  {
    name: 'canva',
    title: 'Canva',
    url: 'https://www.canva.com',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['design', 'presentation', 'visual-content'],
    content: {
      en: 'A design platform for social visuals, presentations, and AI-assisted creative production.',
      zh: '一个用于社交视觉、演示文稿和 AI 辅助创意生产的设计平台。',
    },
    detail: {
      en: `Canva matters because many users are not shopping for a specialist generator; they are looking for a practical creative workspace that helps them produce usable assets quickly. It belongs in a different comparison set from pure image models because the workflow includes editing, layout, templates, and delivery.

The key decision on this page is whether Canva gives enough creative leverage for repeat business and content work without requiring a more complex design stack. If the job is producing visual output at speed, it earns its place in the shortlist.`,
      zh: `Canva 之所以重要，是因为很多用户并不是在找某个专门的生成模型，而是在找一个更实用的创意工作区，帮助他们快速做出可用素材。它和纯图像模型不在同一个比较集合里，因为它的工作流包含编辑、布局、模板和交付。

这页真正的判断点在于：Canva 是否能在不引入更复杂设计栈的前提下，为重复性的业务和内容工作提供足够的创意杠杆。如果你的任务是快速产出视觉内容，它就值得进入 shortlist。`,
    },
    useCases: {
      en: ['Presentation design', 'Social media visuals', 'Marketing assets', 'Fast visual publishing'],
      zh: ['演示设计', '社交媒体视觉', '营销素材', '快速视觉发布'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Practical visual production with templates, editing, and fast delivery.' },
        { label: 'Best for', value: 'Teams and individuals producing repeatable visual assets without a heavy design stack.' },
        { label: 'Decision angle', value: 'Compare on output speed, editing flexibility, and day-to-day creative usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '通过模板、编辑和快速交付完成实用视觉生产。' },
        { label: '更适合', value: '希望在不引入重型设计栈的前提下反复产出视觉素材的团队和个人。' },
        { label: '比较重点', value: '重点比较产出速度、编辑灵活性和日常创意实用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Marketing teams', 'Small business operators', 'Creators producing visual assets at speed'],
        zh: ['营销团队', '小企业运营者', '需要快速产出视觉素材的创作者'],
      },
      notIdealFor: {
        en: ['Teams needing highly specialized creative pipelines', 'Users only comparing cutting-edge image generators'],
        zh: ['需要高度专门化创意流程的团队', '只在比较前沿图像生成器的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a practical creative workspace rather than a narrow image-generation tool.',
      zh: '已按“实用创意工作区”而不是狭义图像生成工具来复核。',
    },
    trustNote: {
      en: 'This listing focuses on repeat visual production value, which is where Canva is most meaningfully compared.',
      zh: '本条目把重点放在重复性视觉生产价值上，这也是 Canva 最常被认真比较的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Output speed', 'Editing flexibility', 'Repeat visual production fit'],
        zh: ['产出速度', '编辑灵活性', '重复性视觉生产适配'],
      },
      officialSummary: {
        en: 'The official site is trustworthy, but the deeper decision is whether the product fits your repeat visual workload rather than just looking easy to try.',
        zh: '官网本身值得信任，但更深层的判断是：这个产品是否适合你重复性的视觉工作量，而不只是“看起来容易上手”。',
      },
      freshnessSummary: {
        en: 'Creative workspaces evolve through templates, AI features, and packaging, so exact plan details should still be checked on the official site.',
        zh: '创意工作区会随着模板、AI 功能和套餐持续变化，所以具体套餐细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when visual assets are already being produced every week across multiple channels.',
        zh: '只有当视觉素材已经在多个渠道上每周持续产出时，这类产品的价格才最容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the workspace feels broad enough for real creative production instead of a one-off design helper.',
        zh: '这里的预览能帮助用户判断：这个工作区是否足够宽，能支撑真实创意生产，而不只是一次性设计助手。',
      },
      communitySummary: {
        en: 'The best feedback comes from teams explaining whether Canva actually made repeat visual work faster and easier to coordinate.',
        zh: '最有价值的反馈，来自团队是否说明 Canva 真的让重复性的视觉工作更快、更容易协同。',
      },
    },
    media: {
      category: 'Design & Art',
      accent: '#06b6d4',
      accentSoft: '#cffafe',
      accentStrong: '#0891b2',
      surface: '#f4fdff',
      badge: 'Visual workspace',
      summary: 'Create presentations, social visuals, and marketing assets in a more practical creative workflow.',
      logoText: 'Ca',
    },
  },
  {
    name: 'poe',
    title: 'Poe',
    url: 'https://poe.com',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'multi-model', 'reasoning'],
    content: {
      en: 'A chat platform for accessing multiple AI models and comparing assistants inside one conversational surface.',
      zh: '一个可在同一对话界面中访问多个 AI 模型、比较不同助手的聊天平台。',
    },
    detail: {
      en: `Poe is most relevant when the user does not only want one assistant, but wants optionality across models and interaction styles. It sits in a different part of the chatbot category because the value is not just the chat itself, but the ability to switch, compare, and explore multiple model behaviors in one place.

The real decision is whether that flexibility is useful enough to simplify a user’s workflow instead of creating more choice overhead. If multi-model comparison matters, Poe belongs in the shortlist.`,
      zh: `当用户想要的不只是一个助手，而是多个模型和不同互动风格之间的可选性时，Poe 会更有意义。它在聊天分类里处于一个略有不同的位置，因为它的价值不只是聊天本身，而是能在同一个地方切换、比较和探索多个模型行为。

这里真正的判断点是：这种灵活性是否足够有用，能简化用户工作流，而不是制造更多选择成本。如果“多模型比较”本身很重要，Poe 值得进入 shortlist。`,
    },
    useCases: {
      en: ['Multi-model chat', 'Assistant comparison', 'Prompt testing', 'Exploring different AI behaviors'],
      zh: ['多模型聊天', '助手比较', '提示词测试', '探索不同 AI 行为'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Giving users one surface for comparing and using multiple AI assistants.' },
        { label: 'Best for', value: 'People who want flexibility across models rather than committing to one default assistant.' },
        { label: 'Decision angle', value: 'Compare on model optionality, workflow simplicity, and comparison usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '为用户提供一个比较和使用多个 AI 助手的统一界面。' },
        { label: '更适合', value: '想在多个模型间保持灵活性，而不是直接绑定一个默认助手的人。' },
        { label: '比较重点', value: '重点比较模型可选性、工作流简洁度和比较价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Users comparing multiple assistants', 'Prompt tinkerers', 'People exploring model differences in one place'],
        zh: ['比较多个助手的用户', '爱折腾提示词的人', '想在一个地方探索模型差异的人'],
      },
      notIdealFor: {
        en: ['Teams wanting one highly opinionated default assistant', 'Users only needing a single specialized workflow tool'],
        zh: ['想要一个高度一体化默认助手的团队', '只需要单一专用工作流工具的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a multi-model chat layer rather than a single-assistant product.',
      zh: '已按“多模型聊天层”而不是单一助手产品来复核。',
    },
    trustNote: {
      en: 'This listing focuses on model optionality and comparison value, which is where Poe is most honestly judged.',
      zh: '本条目把重点放在模型可选性和比较价值上，这也是 Poe 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Model optionality', 'Workflow simplicity', 'Comparison value'],
        zh: ['模型可选性', '工作流简洁度', '比较价值'],
      },
      officialSummary: {
        en: 'The official site is a solid checkpoint, but the deeper decision is whether multi-model access makes your workflow simpler instead of noisier.',
        zh: '官网本身是可靠检查点，但更深层的判断是：多模型接入是否让你的工作流更简单，而不是更嘈杂。',
      },
      freshnessSummary: {
        en: 'Multi-model chat products evolve through available models and packaging, so exact plan details should still be checked on the official site.',
        zh: '多模型聊天产品会随着可用模型和套餐变化，所以具体套餐细节仍建议回官网确认。',
      },
      pricingSummary: {
        en: 'The price becomes easier to justify when switching or comparing models is already a repeated part of the user’s workflow.',
        zh: '只有当切换或比较模型已经成为用户重复性工作流的一部分时，这类产品的价格才更容易被证明合理。',
      },
      mediaSummary: {
        en: 'Preview coverage helps users judge whether the interface supports comparison cleanly instead of feeling cluttered by optionality.',
        zh: '这里的预览能帮助用户判断：这个界面是否能干净地支持比较，而不是被过多可选性弄得凌乱。',
      },
      communitySummary: {
        en: 'The strongest feedback comes from users explaining whether Poe actually made multi-model exploration easier to manage.',
        zh: '最强的反馈，来自用户是否说明 Poe 真的让多模型探索更容易管理。',
      },
    },
    media: {
      category: 'Chatbot',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf7ff',
      badge: 'Multi-model chat',
      summary: 'Compare and use multiple assistants inside one conversational workspace.',
      logoText: 'Po',
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

  console.log(`\nDone. Updated ${updatedCount} creative/chat entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich creative/chat wave 9:', error);
  await closePool();
  process.exit(1);
});

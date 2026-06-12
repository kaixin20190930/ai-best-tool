/* eslint-disable no-console */
import fs from 'node:fs';

import { getPool } from '@/db/neon/client';

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type LocalizedList = {
  en: string[];
  zh: string[];
};

type ToolSeed = {
  name: string;
  title: string;
  categorySlug: string;
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
  useCases: LocalizedList;
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: LocalizedList;
    notIdealFor: LocalizedList;
  };
  editorialSummary: {
    en: string;
    zh: string;
  };
  trustNote: {
    en: string;
    zh: string;
  };
};

type TagSeed = {
  slug: string;
  en: string;
  zh: string;
};

const TAGS: TagSeed[] = [
  { slug: 'voice', en: 'Voice', zh: '语音' },
  { slug: 'text-to-speech', en: 'Text to Speech', zh: '文字转语音' },
  { slug: 'voice-ai', en: 'Voice AI', zh: '语音 AI' },
  { slug: 'developer-tools', en: 'Developer Tools', zh: '开发者工具' },
  { slug: 'code-assistant', en: 'Code Assistant', zh: '代码助手' },
  { slug: 'developer-platform', en: 'Developer Platform', zh: '开发平台' },
  { slug: 'prototyping', en: 'Prototyping', zh: '原型开发' },
  { slug: 'ui-generation', en: 'UI Generation', zh: '界面生成' },
  { slug: 'chat', en: 'Chat', zh: '对话' },
  { slug: 'reasoning', en: 'Reasoning', zh: '推理' },
  { slug: 'web3', en: 'Web3', zh: 'Web3' },
  { slug: 'data-infrastructure', en: 'Data Infrastructure', zh: '数据基础设施' },
  { slug: 'smart-contracts', en: 'Smart Contracts', zh: '智能合约' },
  { slug: 'app-builder', en: 'App Builder', zh: '应用构建' },
  { slug: 'search', en: 'Search', zh: '搜索' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'elevenlabs',
    title: 'ElevenLabs',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'voice-ai', 'text-to-speech'],
    content: {
      en: 'An AI voice platform for natural-sounding speech generation, narration, and voice-centric product workflows.',
      zh: '一个用于自然语音生成、旁白制作和语音型产品工作流的 AI 语音平台。',
    },
    detail: {
      en: `ElevenLabs matters when voice output is not a novelty but part of the product or content itself. It is often shortlisted by teams that care about how believable, polished, and reusable the generated voice feels across repeat production work.

On this page, the practical decision is whether you need a lightweight experiment tool or a voice layer that can hold up across narration, demos, and customer-facing experiences. If voice quality directly affects trust, ElevenLabs belongs in a more serious comparison set.`,
      zh: `当语音输出不再只是新鲜感，而是内容或产品体验本身的一部分时，ElevenLabs 就很有代表性。很多团队把它放进 shortlist，不是因为“它会说话”，而是因为他们在意生成语音是否足够真实、足够稳定、能够反复用于生产。

这页真正要帮助用户判断的是：你需要的是一个轻量实验工具，还是一层可以支撑旁白、演示和面向客户体验的语音能力。如果语音质量本身会影响用户信任，ElevenLabs 就应该被放进更严肃的比较集合里。`,
    },
    useCases: {
      en: ['Narration production', 'Voice cloning workflows', 'Product voice experiences', 'Audio content publishing'],
      zh: ['旁白制作', '语音克隆工作流', '产品语音体验', '音频内容发布'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Natural-sounding AI voice generation for repeatable production use.' },
        { label: 'Best for', value: 'Teams that want polished voice output instead of experimental audio demos.' },
        { label: 'Decision angle', value: 'Compare on voice quality, control, and whether output feels publishable.' },
      ],
      zh: [
        { label: '核心定位', value: '面向重复生产场景的高拟真 AI 语音生成。' },
        { label: '更适合', value: '希望获得成品级语音输出，而不是实验性音频演示的团队。' },
        { label: '比较重点', value: '重点比较语音质量、控制能力，以及结果是否真的能发布。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Content teams publishing audio', 'Product teams adding voice output', 'Creators needing polished narration'],
        zh: ['发布音频内容的内容团队', '需要语音输出的产品团队', '需要成品旁白的创作者'],
      },
      notIdealFor: {
        en: ['Teams only needing raw transcription', 'Users who only need a basic one-off voice readout'],
        zh: ['只需要原始转录的团队', '只需要一次性基础朗读的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a production-facing voice platform rather than a novelty audio tool.',
      zh: '已按“面向生产交付的语音平台”而非新奇音频工具来复核。',
    },
    trustNote: {
      en: 'This listing focuses on the real buying question: whether the voice layer is strong enough for repeated public-facing use.',
      zh: '本条目聚焦真实购买判断：这层语音能力是否足够强，能不能支撑反复的公开交付场景。',
    },
  },
  {
    name: 'phind',
    title: 'Phind',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'code-assistant', 'search'],
    content: {
      en: 'A developer-focused AI search assistant for technical answers, code discovery, and fast implementation support.',
      zh: '一个面向开发者的 AI 搜索助手，适合技术问答、代码发现和快速实现支持。',
    },
    detail: {
      en: `Phind is most useful when the workflow starts with a technical question rather than a blank editor. It sits closer to search-assisted implementation help than to a general-purpose assistant, which makes it relevant for debugging, stack exploration, and fast code lookup.

The key decision on this page is whether your coding workflow benefits more from search-driven technical answers or from an editor-native coding environment. If the job often begins with “how does this work?” or “what is the right pattern?”, Phind deserves a serious look.`,
      zh: `当工作流是从一个技术问题开始，而不是从空白编辑器开始时，Phind 会更有价值。它更接近“带搜索的实现辅助”，而不是通用型聊天助手，所以在调试、技术栈探索和快速代码查找场景里很有代表性。

这页真正的判断点是：你的编码工作流更受益于“搜索驱动的技术答案”，还是“编辑器内原生编码环境”。如果你的工作经常从“这东西怎么用？”“正确模式是什么？”开始，Phind 值得认真比较。`,
    },
    useCases: {
      en: ['Technical search', 'Implementation lookup', 'Debugging support', 'API and framework exploration'],
      zh: ['技术搜索', '实现方式查找', '调试支持', 'API 与框架探索'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Search-driven developer assistance for technical questions and implementation work.' },
        { label: 'Best for', value: 'Developers who start with questions, docs, and examples before editing code.' },
        { label: 'Decision angle', value: 'Compare on answer usefulness, source quality, and implementation speed.' },
      ],
      zh: [
        { label: '核心定位', value: '面向技术问题和实现工作的搜索驱动型开发辅助。' },
        { label: '更适合', value: '会先看问题、文档和示例，再动手改代码的开发者。' },
        { label: '比较重点', value: '重点比较答案可用性、来源质量，以及是否加快实现速度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Developers researching implementation patterns', 'Builders debugging unfamiliar stacks', 'Teams comparing code-assistant surfaces'],
        zh: ['研究实现模式的开发者', '在不熟悉技术栈里调试的构建者', '比较不同代码助手形态的团队'],
      },
      notIdealFor: {
        en: ['Users wanting broad non-technical chat workflows', 'Teams needing an editor-native pair-programming surface'],
        zh: ['需要泛用非技术聊天工作流的用户', '需要编辑器内结对编程体验的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a search-first developer assistant rather than a general chatbot.',
      zh: '已按“搜索优先的开发者助手”而不是通用聊天机器人来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes Phind where it is actually chosen in practice: fast technical lookup and implementation support.',
      zh: '本条目强调的是 Phind 在真实工作流里的选择理由：快速技术查找与实现支持。',
    },
  },
  {
    name: 'bolt-new',
    title: 'Bolt.new',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'prototyping', 'app-builder'],
    content: {
      en: 'An AI product-building environment for quickly generating, iterating, and testing app ideas in the browser.',
      zh: '一个用于在浏览器中快速生成、迭代和测试应用想法的 AI 产品构建环境。',
    },
    detail: {
      en: `Bolt.new matters when the goal is speed to prototype rather than long-lived IDE depth. It is often compared by founders and product-minded builders who want to move from idea to working surface quickly without spending the first hour on setup.

The practical decision is whether a browser-native prototyping loop helps you validate faster than a more engineering-heavy workflow. If the job is shipping an early product slice or testing feasibility, Bolt.new fits a different shortlist from code assistants focused on deeper codebase work.`,
      zh: `当目标是“快速做出原型”，而不是“沉浸式长期 IDE 深度开发”时，Bolt.new 会很有价值。很多创始人和偏产品型的构建者会把它拿来比较，因为他们希望从想法直接走到一个可运行界面，而不是先花很久做环境准备。

真正的判断点在于：浏览器原生的原型循环，能不能比更重的工程流更快帮你验证想法。如果任务是切出早期产品切片或验证可行性，Bolt.new 所在的 shortlist 会和深度代码助手明显不同。`,
    },
    useCases: {
      en: ['Rapid prototyping', 'Idea validation', 'Browser-based app generation', 'Founder-led product experiments'],
      zh: ['快速原型', '想法验证', '浏览器内应用生成', '创始人主导的产品实验'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Fast browser-based product prototyping and iteration.' },
        { label: 'Best for', value: 'Builders who care more about validation speed than deep IDE workflows.' },
        { label: 'Decision angle', value: 'Compare on prototype speed, ease of iteration, and feasibility testing value.' },
      ],
      zh: [
        { label: '核心定位', value: '浏览器内快速产品原型与迭代。' },
        { label: '更适合', value: '更在意验证速度，而不是深度 IDE 工作流的构建者。' },
        { label: '比较重点', value: '重点比较原型速度、迭代顺手度，以及可行性验证价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Indie hackers', 'Founders testing ideas', 'Product builders validating interfaces quickly'],
        zh: ['独立开发者', '验证想法的创始人', '快速验证界面的产品构建者'],
      },
      notIdealFor: {
        en: ['Teams primarily optimizing a mature codebase', 'Developers needing a deep editor-native workflow'],
        zh: ['主要在优化成熟代码库的团队', '需要深度编辑器原生工作流的开发者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a browser-native prototype builder rather than a traditional coding assistant.',
      zh: '已按“浏览器原生原型构建器”而不是传统编码助手来复核。',
    },
    trustNote: {
      en: 'This listing frames Bolt.new around validation speed and product experimentation, which is where it is most defensible.',
      zh: '本条目把 Bolt.new 定位在验证速度和产品实验上，这也是它最有说服力的使用场景。',
    },
  },
  {
    name: 'lovable',
    title: 'Lovable',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'app-builder', 'prototyping'],
    content: {
      en: 'An AI app builder focused on turning product ideas into usable interfaces and early product flows quickly.',
      zh: '一个专注于把产品想法快速变成可用界面和早期产品流程的 AI 应用构建工具。',
    },
    detail: {
      en: `Lovable belongs in the builder stack when the real problem is turning product intent into something concrete quickly. It is especially relevant for founders and makers who want a tighter path from product concept to visible interface without starting from a blank implementation.

The decision on this page is less about raw code generation and more about product momentum. If you are comparing tools based on how quickly they help you shape a usable first version, Lovable earns its place in the conversation.`,
      zh: `当真正的问题是“如何更快把产品意图变成具体东西”时，Lovable 在构建者工具栈里就很有意义。它尤其适合希望从产品概念直接走到可见界面的创始人和 maker，而不是从一份空白实现开始。

这页的核心判断点，不是单纯的代码生成能力，而是产品推进速度。如果你比较工具时更看重“多快能做出一个可用的第一版”，Lovable 就值得被认真纳入讨论。`,
    },
    useCases: {
      en: ['App idea shaping', 'Early interface generation', 'Founder-led validation', 'Fast product iteration'],
      zh: ['应用想法成形', '早期界面生成', '创始人主导验证', '快速产品迭代'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning product intent into usable app surfaces quickly.' },
        { label: 'Best for', value: 'Founders and makers trying to validate product direction fast.' },
        { label: 'Decision angle', value: 'Compare on product momentum, interface quality, and iteration speed.' },
      ],
      zh: [
        { label: '核心定位', value: '快速把产品意图变成可用应用界面。' },
        { label: '更适合', value: '想快速验证产品方向的创始人和 maker。' },
        { label: '比较重点', value: '重点比较产品推进速度、界面质量和迭代效率。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Founders validating a product direction', 'Makers building an early user-facing flow', 'Teams testing interface concepts'],
        zh: ['验证产品方向的创始人', '构建早期用户流程的 maker', '测试界面概念的团队'],
      },
      notIdealFor: {
        en: ['Teams focused on long-term engineering depth', 'Builders who mainly need deep codebase editing'],
        zh: ['更关注长期工程深度的团队', '主要需要深度代码库编辑的构建者'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a product-building accelerator rather than a generic AI coding helper.',
      zh: '已按“产品构建加速器”而不是通用 AI 编码助手来复核。',
    },
    trustNote: {
      en: 'This listing focuses on the practical job Lovable is hired for: helping teams reach a testable first version sooner.',
      zh: '本条目强调 Lovable 的真实工作：帮助团队更快做到一个可测试的第一版。',
    },
  },
  {
    name: 'v0',
    title: 'v0',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'ui-generation', 'prototyping'],
    content: {
      en: 'A UI generation tool for quickly producing interface ideas, components, and front-end starting points from prompts.',
      zh: '一个用于从提示词快速生成界面想法、组件和前端起点的 UI 生成工具。',
    },
    detail: {
      en: `v0 is most useful when the bottleneck is interface exploration rather than deeper application logic. Designers, frontend developers, and founders often compare it when they want to turn a rough screen idea into something concrete without spending the first cycle hand-building every layout.

The real decision here is whether your team needs a UI-first accelerator or a more general product builder. If interface direction, component patterns, and front-end starting points matter more than backend complexity, v0 is a strong comparison candidate.`,
      zh: `当瓶颈更偏“界面探索”而不是“深层应用逻辑”时，v0 的价值会更明显。设计师、前端开发者和创始人经常把它拿来比较，因为他们希望先把一个粗略界面想法做成可讨论的东西，而不是一开始就手搓每个布局。

这里真正的判断点是：你的团队需要的是一个“界面优先的加速器”，还是更泛化的产品构建器。如果你更在意界面方向、组件模式和前端起点，而不是后端复杂度，v0 就是很强的比较对象。`,
    },
    useCases: {
      en: ['UI exploration', 'Component generation', 'Frontend starting points', 'Prompt-to-interface iteration'],
      zh: ['界面探索', '组件生成', '前端起点搭建', '提示词到界面的迭代'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Prompt-driven UI generation for fast frontend exploration.' },
        { label: 'Best for', value: 'Teams that want to accelerate interface direction before deeper implementation.' },
        { label: 'Decision angle', value: 'Compare on UI usefulness, component quality, and iteration speed.' },
      ],
      zh: [
        { label: '核心定位', value: '面向前端探索的提示词驱动 UI 生成。' },
        { label: '更适合', value: '想在深入实现前先加快界面方向确定的团队。' },
        { label: '比较重点', value: '重点比较界面可用性、组件质量和迭代速度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Frontend teams', 'Design-minded builders', 'Founders exploring a product surface quickly'],
        zh: ['前端团队', '偏设计驱动的构建者', '快速探索产品界面的创始人'],
      },
      notIdealFor: {
        en: ['Teams mainly solving backend orchestration', 'Users wanting a full-stack workflow in one tool'],
        zh: ['主要在解决后端编排问题的团队', '希望一个工具包办全栈流程的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a UI-first accelerator for frontend exploration and component ideation.',
      zh: '已按“界面优先的前端探索与组件构思工具”来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes v0 where teams actually compare it: fast interface direction and usable frontend output.',
      zh: '本条目强调的是团队真正比较 v0 的地方：快速界面方向与可用的前端输出。',
    },
  },
  {
    name: 'copilot',
    title: 'GitHub Copilot',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['developer-tools', 'code-assistant', 'developer-platform'],
    content: {
      en: 'An AI coding assistant integrated into common developer workflows for code suggestions, completion, and implementation support.',
      zh: '一个集成进常见开发者工作流中的 AI 编码助手，适合代码建议、补全和实现支持。',
    },
    detail: {
      en: `GitHub Copilot matters because it lives where many developers already work. It is less about a dramatic new surface and more about whether AI assistance inside established tooling can reduce friction across everyday coding tasks.

The real decision is whether you want tight integration inside existing developer environments or a more opinionated AI-native coding product. If familiarity, workflow coverage, and incremental productivity matter most, Copilot is a natural benchmark.`,
      zh: `GitHub Copilot 的价值在于，它存在于很多开发者原本就工作的地方。它不是一种特别戏剧化的新界面，而更像是在判断：AI 能不能在现有工具链里持续减少日常编码摩擦。

这里真正的判断点是：你需要的是“深入现有开发环境的紧密集成”，还是“更有主张的 AI 原生编码产品”。如果你最在意熟悉度、工作流覆盖和渐进式效率提升，Copilot 就是自然的 benchmark。`,
    },
    useCases: {
      en: ['Inline code completion', 'Everyday implementation help', 'Developer workflow acceleration', 'Editor-integrated assistance'],
      zh: ['行内代码补全', '日常实现辅助', '开发工作流提速', '编辑器集成帮助'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'AI assistance embedded into familiar developer environments.' },
        { label: 'Best for', value: 'Teams optimizing steady coding throughput inside existing tools.' },
        { label: 'Decision angle', value: 'Compare on workflow coverage, suggestion quality, and familiarity advantage.' },
      ],
      zh: [
        { label: '核心定位', value: '嵌入熟悉开发环境中的 AI 编码辅助。' },
        { label: '更适合', value: '希望在现有工具中稳定提升编码吞吐的团队。' },
        { label: '比较重点', value: '重点比较工作流覆盖、建议质量和熟悉度优势。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Developers staying inside familiar editors', 'Teams standardizing on mainstream dev tooling', 'Organizations preferring incremental adoption'],
        zh: ['留在熟悉编辑器里的开发者', '标准化主流开发工具链的团队', '偏好渐进式采用的组织'],
      },
      notIdealFor: {
        en: ['Builders wanting a radically AI-native coding environment', 'Teams evaluating browser-based product prototyping tools'],
        zh: ['想要彻底 AI 原生编码环境的构建者', '在比较浏览器原型构建工具的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an embedded coding assistant benchmark inside existing developer workflows.',
      zh: '已按“嵌入现有开发工作流中的编码助手 benchmark”来复核。',
    },
    trustNote: {
      en: 'This listing is framed around practical workflow fit, which is usually the real reason teams choose or skip Copilot.',
      zh: '本条目围绕真实工作流适配度来定位，这通常才是团队选择或放弃 Copilot 的核心原因。',
    },
  },
  {
    name: 'gemini',
    title: 'Gemini',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'reasoning', 'knowledge-work'],
    content: {
      en: 'A general AI assistant for search-adjacent tasks, drafting, reasoning, and everyday knowledge work workflows.',
      zh: '一个面向搜索相关任务、起草、推理和日常知识工作的通用 AI 助手。',
    },
    detail: {
      en: `Gemini belongs in the broad-assistant comparison set because many users evaluate it as part of their default productivity stack, not as a niche specialist tool. It is especially relevant when the workflow blends question answering, drafting, and lightweight reasoning across daily work.

The practical decision is whether Gemini fits your broader assistant workflow better than the other mainstream general-purpose options. That comparison usually comes down to speed, ecosystem fit, and how naturally it supports the work you already do every day.`,
      zh: `Gemini 属于“大盘通用助手”比较集合，因为很多用户把它放进自己的默认生产力栈里来评估，而不是把它看成某个垂直小众工具。它特别适合那些把问答、起草和轻量推理混合在日常工作里的场景。

这里真正的判断点是：Gemini 是否比其他主流通用型选项更适合你的整体助手工作流。这个比较通常会落在速度、生态适配，以及它是否自然支持你每天已经在做的事情上。`,
    },
    useCases: {
      en: ['Everyday assistant workflows', 'Drafting and summarization', 'Question answering', 'Light reasoning support'],
      zh: ['日常助手工作流', '起草与总结', '问答支持', '轻量推理辅助'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'General-purpose assistant support across daily knowledge work.' },
        { label: 'Best for', value: 'People comparing mainstream assistant products for everyday use.' },
        { label: 'Decision angle', value: 'Compare on speed, ecosystem fit, and daily workflow comfort.' },
      ],
      zh: [
        { label: '核心定位', value: '覆盖日常知识工作的通用型助手支持。' },
        { label: '更适合', value: '在主流助手产品之间做日常使用比较的人。' },
        { label: '比较重点', value: '重点比较速度、生态适配和日常工作流舒适度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Users wanting one mainstream assistant', 'Knowledge workers comparing broad AI stacks', 'Teams evaluating daily AI productivity tools'],
        zh: ['想用一个主流助手覆盖多数场景的用户', '在比较大盘 AI 栈的知识工作者', '评估日常 AI 生产力工具的团队'],
      },
      notIdealFor: {
        en: ['Teams seeking a highly specialized research or coding tool', 'Users only comparing niche vertical products'],
        zh: ['寻找高度垂直研究或编码工具的团队', '只比较小众垂直产品的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a broad assistant choice rather than a narrow specialist product.',
      zh: '已按“广谱助手选择”而不是狭窄垂直产品来复核。',
    },
    trustNote: {
      en: 'This listing focuses on where Gemini is actually compared in practice: default assistant fit and everyday workflow comfort.',
      zh: '本条目强调的是 Gemini 在真实使用里常被比较的维度：默认助手适配与日常工作流顺手度。',
    },
  },
  {
    name: 'grok',
    title: 'Grok',
    categorySlug: 'chatbot',
    pricing: 'paid',
    tags: ['chat', 'reasoning', 'knowledge-work'],
    content: {
      en: 'A general AI assistant used for question answering, exploration, and everyday conversational workflows.',
      zh: '一个用于问答、探索和日常对话式工作流的通用 AI 助手。',
    },
    detail: {
      en: `Grok is best evaluated in the context of mainstream AI assistant choice rather than as a narrow feature comparison. Users usually care about whether it is useful enough in everyday exploration, conversation, and lightweight work support to deserve a place in the stack.

The key decision is not whether it can answer questions at all, but whether its style, workflow feel, and practical usefulness hold up well enough against the other assistant options competing for the same daily slot.`,
      zh: `Grok 最适合放在“主流 AI 助手选择”这个语境里评估，而不是做狭义功能对比。用户通常更关心的是：它在日常探索、对话和轻量工作支持里，是否足够有用，值得占据自己工具栈中的一个位置。

关键判断点不是“它能不能回答问题”，而是它的风格、工作流感受和实际可用性，是否足以在同一个日常位置上和其他助手选项竞争。`,
    },
    useCases: {
      en: ['Conversational exploration', 'Daily question answering', 'General-purpose assistant tasks', 'Light research support'],
      zh: ['对话式探索', '日常问答', '通用助手任务', '轻量研究支持'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'General conversational AI support across everyday workflows.' },
        { label: 'Best for', value: 'Users comparing daily assistant options rather than niche specialist tools.' },
        { label: 'Decision angle', value: 'Compare on usefulness, assistant feel, and whether it earns a regular slot.' },
      ],
      zh: [
        { label: '核心定位', value: '覆盖日常工作流的通用对话式 AI 支持。' },
        { label: '更适合', value: '比较日常助手选项而非垂直专用工具的用户。' },
        { label: '比较重点', value: '重点比较实用性、助手体验，以及它是否值得成为常驻工具。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Users comparing mainstream AI assistants', 'People wanting another daily conversational option', 'Teams testing broad assistant fit'],
        zh: ['在比较主流 AI 助手的用户', '想增加一个日常对话选项的人', '测试广谱助手适配度的团队'],
      },
      notIdealFor: {
        en: ['Teams mainly shopping for coding infrastructure or deep research tools', 'Users who only care about narrow specialist workflows'],
        zh: ['主要在选购编码基础设施或深度研究工具的团队', '只关心狭窄专用工作流的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an everyday assistant option inside the general chatbot category.',
      zh: '已按通用聊天助手分类中的日常助手选项来复核。',
    },
    trustNote: {
      en: 'This listing keeps the focus on whether Grok is useful in repeat daily use, which is the real comparison people make.',
      zh: '本条目把重点放在 Grok 是否适合重复日常使用上，这才是人们真实会做的比较。',
    },
  },
  {
    name: 'alchemy',
    title: 'Alchemy',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'developer-platform', 'data-infrastructure'],
    content: {
      en: 'A blockchain developer platform for APIs, node access, and Web3 application infrastructure.',
      zh: '一个为 API、节点访问和 Web3 应用基础设施提供支持的区块链开发平台。',
    },
    detail: {
      en: `Alchemy becomes relevant when your Web3 workflow is less about reading dashboards and more about building products on top of chain infrastructure. It is usually compared by teams that care about reliability, developer experience, and how much platform support they get before building everything themselves.

The decision here is whether you need packaged infrastructure leverage or whether a lighter direct-stack approach is enough. If you are shipping Web3 apps, wallets, or protocol-connected products, Alchemy belongs closer to the platform layer than to analytics tools.`,
      zh: `当你的 Web3 工作流更偏“在链上基础设施之上构建产品”，而不是“单纯看数据面板”时，Alchemy 就会非常相关。很多团队会在意可靠性、开发体验，以及在不完全自建的前提下能获得多少平台支持，所以会把它纳入比较。

这里真正的判断点是：你需要的是“打包好的基础设施杠杆”，还是更轻的直连技术栈就够了。如果你在做 Web3 应用、钱包或协议连接型产品，Alchemy 更接近平台层，而不是分析工具层。`,
    },
    useCases: {
      en: ['Web3 app infrastructure', 'Blockchain API access', 'Node and RPC workflows', 'Developer platform support'],
      zh: ['Web3 应用基础设施', '区块链 API 接入', '节点与 RPC 工作流', '开发平台支持'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Developer infrastructure for building and operating Web3 products.' },
        { label: 'Best for', value: 'Teams needing platform support instead of stitching every chain layer manually.' },
        { label: 'Decision angle', value: 'Compare on reliability, DX, and infrastructure leverage.' },
      ],
      zh: [
        { label: '核心定位', value: '用于构建和运行 Web3 产品的开发者基础设施。' },
        { label: '更适合', value: '希望得到平台支持，而不是手工拼装每一层链基础设施的团队。' },
        { label: '比较重点', value: '重点比较可靠性、开发体验和基础设施杠杆。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Web3 product teams', 'Developers shipping on-chain applications', 'Builders needing infrastructure support'],
        zh: ['Web3 产品团队', '上线链上应用的开发者', '需要基础设施支持的构建者'],
      },
      notIdealFor: {
        en: ['Users only doing market research or dashboard browsing', 'Teams that do not need developer-platform depth'],
        zh: ['只做市场研究或看盘的用户', '不需要开发平台深度的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as Web3 developer infrastructure, distinct from research-facing analytics tools.',
      zh: '已按 Web3 开发基础设施来复核，并与研究分析工具做了区分。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on platform leverage and developer workflow depth.',
      zh: '本条目把比较锚点放在平台杠杆和开发工作流深度上。',
    },
  },
  {
    name: 'thirdweb',
    title: 'thirdweb',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'smart-contracts', 'developer-platform'],
    content: {
      en: 'A Web3 development platform for smart contracts, app tooling, and blockchain product building.',
      zh: '一个用于智能合约、应用工具链和区块链产品构建的 Web3 开发平台。',
    },
    detail: {
      en: `thirdweb is most relevant when the work is about shipping blockchain-enabled products rather than only analyzing the market. It sits in the builder side of Web3, where the practical question is how quickly a team can move from concept to working contract and app flow.

The real decision here is whether thirdweb helps reduce Web3 implementation friction enough to justify becoming part of the core product stack. For builders focused on smart contracts and app enablement, it belongs in a very different shortlist from analytics platforms.`,
      zh: `当工作的重点是“交付区块链产品”，而不是“只看市场和数据”时，thirdweb 会更有相关性。它站在 Web3 的构建侧，真正的问题是：团队能否更快从概念走到可用的合约和应用流程。

这里核心的判断点是：thirdweb 是否足够降低 Web3 实现摩擦，值得进入产品核心技术栈。对于专注智能合约和应用使能的构建者来说，它所在的 shortlist 和分析平台会完全不同。`,
    },
    useCases: {
      en: ['Smart contract development', 'Web3 product building', 'Blockchain app tooling', 'On-chain feature enablement'],
      zh: ['智能合约开发', 'Web3 产品构建', '区块链应用工具链', '链上功能使能'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams build and ship Web3 products faster.' },
        { label: 'Best for', value: 'Builders who care about contract and app delivery, not only analytics.' },
        { label: 'Decision angle', value: 'Compare on implementation speed, tooling support, and product-readiness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队更快构建和上线 Web3 产品。' },
        { label: '更适合', value: '更关心合约和应用交付，而不是只看分析数据的构建者。' },
        { label: '比较重点', value: '重点比较实现速度、工具支持和产品落地能力。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Web3 builders shipping contracts', 'Teams enabling blockchain product features', 'Developers comparing product tooling layers'],
        zh: ['在交付合约的 Web3 构建者', '启用链上产品功能的团队', '比较产品工具层的开发者'],
      },
      notIdealFor: {
        en: ['Users doing protocol research only', 'Teams that mainly need market dashboards or portfolio tracking'],
        zh: ['只做协议研究的用户', '主要需要市场面板或资产跟踪的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a Web3 builder platform rather than a market intelligence product.',
      zh: '已按 Web3 构建平台而不是市场情报产品来复核。',
    },
    trustNote: {
      en: 'This listing keeps thirdweb anchored to product building, which is where its value is easiest to judge.',
      zh: '本条目把 thirdweb 锚定在产品构建场景里，这也是它最容易被判断价值的地方。',
    },
  },
];

function loadLocalEnv() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function mergeTags(existing: unknown, next: string[]) {
  return Array.from(new Set([...normalizeStringArray(existing), ...next]));
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

async function applySeed(seed: ToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const pool = getPool();
  const categoryId = categoryIdMap.get(seed.categorySlug);

  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const existingResult = await pool.query('SELECT id, tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (existingResult.rowCount === 0) {
    console.log(`- skipped ${seed.name}: not found in tools table`);
    return false;
  }

  const row = existingResult.rows[0];
  const existingFeatures =
    row.features && typeof row.features === 'object' ? (row.features as Record<string, unknown>) : {};

  const mergedFeatures = {
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
  };

  await pool.query(
    `
      UPDATE tools
      SET
        title = $2::jsonb,
        content = $3::jsonb,
        detail = $4::jsonb,
        category_id = $5,
        tags = $6::text[],
        pricing = $7,
        features = $8::jsonb,
        use_cases = $9::jsonb,
        updated_at = NOW()
      WHERE name = $1
    `,
    [
      seed.name,
      JSON.stringify({ en: seed.title, zh: seed.title }),
      JSON.stringify(seed.content),
      JSON.stringify(seed.detail),
      categoryId,
      mergeTags(row.tags, seed.tags),
      seed.pricing,
      JSON.stringify(mergedFeatures),
      JSON.stringify(seed.useCases),
    ],
  );

  console.log(`- updated ${seed.name}`);
  return true;
}

async function main() {
  loadLocalEnv();
  const reviewedAt = new Date().toISOString();

  console.log('Enriching editorial gaps wave 6...\n');
  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();

  const updatedCount = await TOOLS.reduce(async (countPromise, seed) => {
    const count = await countPromise;
    const updated = await applySeed(seed, categoryIdMap, reviewedAt);
    return updated ? count + 1 : count;
  }, Promise.resolve(0));

  console.log(`\nDone. Updated ${updatedCount} editorial gap entries.`);
  await getPool().end();
}

main().catch((error) => {
  console.error('\nFailed to enrich editorial gaps wave 6:', error);
  process.exit(1);
});

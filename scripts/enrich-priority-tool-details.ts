/* eslint-disable no-console */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

type LocalizedFeatureEntry = {
  label: string;
  value: string;
};

type PriorityToolSeed = {
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
  useCases: {
    en: string[];
    zh: string[];
  };
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
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
  { slug: 'chat', en: 'Chat', zh: '对话' },
  { slug: 'reasoning', en: 'Reasoning', zh: '推理' },
  { slug: 'knowledge-work', en: 'Knowledge Work', zh: '知识工作' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'ai-writing', en: 'AI Writing', zh: 'AI 写作' },
  { slug: 'brand-voice', en: 'Brand Voice', zh: '品牌语气' },
  { slug: 'code-assistant', en: 'Code Assistant', zh: '代码助手' },
  { slug: 'developer-platform', en: 'Developer Platform', zh: '开发平台' },
  { slug: 'website-planning', en: 'Website Planning', zh: '网站规划' },
  { slug: 'keyword-research', en: 'Keyword Research', zh: '关键词研究' },
  { slug: 'on-chain-analytics', en: 'On-chain Analytics', zh: '链上分析' },
  { slug: 'defi-analytics', en: 'DeFi Analytics', zh: 'DeFi 分析' },
  { slug: 'data-infrastructure', en: 'Data Infrastructure', zh: '数据基础设施' },
  { slug: 'workflow-automation', en: 'Workflow Automation', zh: '工作流自动化' },
  { slug: 'meeting-notes', en: 'Meeting Notes', zh: '会议纪要' },
  { slug: 'audio-editing', en: 'Audio Editing', zh: '音频编辑' },
  { slug: 'video-editing', en: 'Video Editing', zh: '视频编辑' },
  { slug: 'image-generation', en: 'Image Generation', zh: '图像生成' },
  { slug: 'video-generation', en: 'Video Generation', zh: '视频生成' },
  { slug: 'avatar-video', en: 'Avatar Video', zh: '数字人视频' },
  { slug: 'design', en: 'Design', zh: '设计' },
  { slug: 'presentation', en: 'Presentation', zh: '演示' },
  { slug: 'visual-content', en: 'Visual Content', zh: '视觉内容' },
  { slug: '3d', en: '3D', zh: '3D' },
  { slug: 'voice', en: 'Voice', zh: '语音' },
  { slug: 'voice-ai', en: 'Voice AI', zh: '语音 AI' },
  { slug: 'transcription', en: 'Transcription', zh: '转录' },
  { slug: 'speech-to-text', en: 'Speech to Text', zh: '语音转文字' },
  { slug: 'text-to-speech', en: 'Text to Speech', zh: '文字转语音' },
];

const PRIORITY_TOOLS: PriorityToolSeed[] = [
  {
    name: 'chatgpt',
    title: 'ChatGPT',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'reasoning', 'knowledge-work'],
    content: {
      en: 'A general-purpose AI assistant for drafting, summarizing, planning, coding help, and everyday knowledge work.',
      zh: '一个通用型 AI 助手，适合草稿撰写、总结归纳、计划整理、编程辅助和日常知识工作。',
    },
    detail: {
      en: `ChatGPT is a strong default starting point when you need one AI tool that can cover writing, brainstorming, research support, and lightweight coding help. It fits individuals and small teams that want a flexible interface before committing to more specialized tools.

What matters most on this page is not just that ChatGPT is well known, but where it is actually useful: early-stage ideation, first drafts, summarization, and fast back-and-forth exploration. If your workflow needs strict systems integration or highly structured team automation, compare it with more workflow-native products before deciding.`,
      zh: `当你希望先用一个工具覆盖写作、头脑风暴、研究辅助和轻量编程支持时，ChatGPT 是很强的默认起点。它更适合个人与小团队先建立工作流，再决定是否引入更垂直的工具。

这页真正重要的不是“它很有名”，而是它在哪些场景里确实好用：早期想法整理、初稿生成、信息总结，以及快速往返式探索。如果你的需求更偏系统集成或团队自动化，建议再和更偏工作流的平台横向比较。`,
    },
    useCases: {
      en: ['First-draft writing', 'Research summaries', 'Brainstorming', 'Everyday assistant workflows'],
      zh: ['初稿写作', '研究总结', '头脑风暴', '日常助手工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'General-purpose assistant for knowledge work and fast iteration.' },
        { label: 'Best for', value: 'People who want one flexible AI product before splitting into specialist tools.' },
        { label: 'Decision angle', value: 'Compare on model quality, memory, workflow speed, and ecosystem fit.' },
      ],
      zh: [
        { label: '核心定位', value: '面向知识工作的通用型助手，适合快速迭代。' },
        { label: '更适合', value: '想先用一个灵活产品覆盖多个场景的个人与小团队。' },
        { label: '比较重点', value: '重点比较模型质量、记忆能力、工作流速度和生态适配。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a general starting point rather than a niche specialist tool.',
      zh: '已按“通用起点工具”而非垂直专用工具的标准完成复核。',
    },
    trustNote: {
      en: 'This listing was checked for positioning, use-case clarity, and pricing path against the official product surface.',
      zh: '本条目已围绕产品定位、适用场景清晰度与定价路径对照官网信息做过复核。',
    },
  },
  {
    name: 'claude',
    title: 'Claude',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'ai-writing', 'knowledge-work'],
    content: {
      en: 'A conversational AI assistant often chosen for long-form writing, document reasoning, and structured thinking workflows.',
      zh: '一个常被用于长文写作、文档推理和结构化思考工作流的对话式 AI 助手。',
    },
    detail: {
      en: `Claude is especially relevant when your workflow leans toward reading, reasoning, and producing cleaner long-form output. Compared with more general chat tools, people often shortlist Claude when they care about tone stability, document handling, and calmer writing support.

This page should help a user answer a practical question: is Claude the better writing and thinking partner for the job, or do they need a broader tool with stronger ecosystem breadth? That trade-off matters more than raw hype.`,
      zh: `如果你的工作流更偏阅读、推理和较干净的长文输出，Claude 会更有代表性。和更通用的聊天工具相比，很多人会在重视语气稳定、文档处理和安静型写作支持时把 Claude 放进 shortlist。

这页要帮助用户回答的实际问题是：Claude 是不是更适合作为写作与思考搭档，还是你需要一个生态更广的通用工具。这个取舍比单纯“热度”更重要。`,
    },
    useCases: {
      en: ['Long-form drafting', 'Document reasoning', 'Research digestion', 'Writing refinement'],
      zh: ['长文草稿', '文档推理', '研究消化', '写作润色'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Reading-heavy and writing-heavy assistant workflows.' },
        { label: 'Best for', value: 'Teams and individuals comparing document reasoning and writing quality.' },
        {
          label: 'Decision angle',
          value: 'Evaluate output tone, context handling, and how well it supports longer thinking loops.',
        },
      ],
      zh: [
        { label: '核心定位', value: '更偏阅读与写作型的助手工作流。' },
        { label: '更适合', value: '在文档推理和写作质量之间做比较的个人与团队。' },
        { label: '比较重点', value: '重点看输出语气、长上下文处理，以及长思考回路是否顺手。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed with a writing-first and document-first lens.',
      zh: '已按“写作优先、文档优先”的使用角度完成复核。',
    },
    trustNote: {
      en: 'This profile emphasizes where Claude is chosen in practice, not just what the product can theoretically do.',
      zh: '本条目强调的是 Claude 在真实工作流里为什么会被选中，而不只是理论能力列表。',
    },
  },
  {
    name: 'perplexity',
    title: 'Perplexity',
    categorySlug: 'research',
    pricing: 'freemium',
    tags: ['research', 'knowledge-work', 'chat'],
    content: {
      en: 'An AI search and answer product for quick research, source-backed discovery, and faster information gathering.',
      zh: '一个面向快速研究、带来源答案和信息发现的 AI 搜索与问答产品。',
    },
    detail: {
      en: `Perplexity belongs near the top of the research stack when the job starts with finding and checking information quickly. It is especially relevant for users who care less about open-ended writing and more about gathering answers, sources, and starting points efficiently.

The real decision on this page is whether your work begins with search and evidence, or whether you mainly need drafting and synthesis inside a broader assistant workflow. If research starts first, Perplexity is a natural comparison anchor.`,
      zh: `如果工作的第一步是快速找信息、核对来源并建立研究起点，Perplexity 在研究类工具里会很靠前。它特别适合那些不把开放式写作放在第一位，而更重视答案、来源和资料发现效率的用户。

这页真正要帮用户判断的是：你的工作是不是“先搜索、先证据”，还是更偏“先起草、先综合”的助手流程。如果研究起点优先，Perplexity 就是很自然的对比锚点。`,
    },
    useCases: {
      en: ['Fast web research', 'Source-backed answers', 'Competitive scanning', 'Topic discovery'],
      zh: ['快速网页研究', '带来源答案', '竞品扫描', '主题发现'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Research-first discovery and answer workflows.' },
        { label: 'Best for', value: 'Users who start with sources, citations, and quick exploration.' },
        {
          label: 'Decision angle',
          value: 'Compare on source trust, research speed, and how much follow-up writing you still need elsewhere.',
        },
      ],
      zh: [
        { label: '核心定位', value: '以研究发现和答案获取为先的工作流。' },
        { label: '更适合', value: '从来源、引用和快速探索开始工作的用户。' },
        { label: '比较重点', value: '重点看来源可信度、研究速度，以及后续是否还要依赖别的写作工具。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a research entry point rather than a pure chatbot.',
      zh: '已按“研究入口工具”而不是纯聊天机器人来完成复核。',
    },
    trustNote: {
      en: 'This page was positioned around evidence-finding and information discovery, which is where the product is usually compared.',
      zh: '本页围绕“找证据、做信息发现”的真实比较场景来定位，而不是泛泛介绍聊天能力。',
    },
  },
  {
    name: 'cursor',
    title: 'Cursor',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'code-assistant', 'knowledge-work'],
    content: {
      en: 'An AI coding environment for generation, refactoring, debugging, and multi-file development workflows.',
      zh: '一个面向生成、重构、调试和多文件开发工作流的 AI 编程环境。',
    },
    detail: {
      en: `Cursor is more useful to evaluate as a developer environment than as a single feature. People usually compare it when they want AI to stay closer to the editor, codebase context, and actual implementation loop instead of living in a separate chat tab.

On this page, the important question is not whether Cursor can generate code, but whether it meaningfully reduces context-switching and helps you move through edits, debugging, and project navigation faster than your current setup.`,
      zh: `与其把 Cursor 看成一个单点功能，不如把它当成开发环境来看。人们通常会在希望 AI 更贴近编辑器、代码库上下文和真实实现循环，而不是停留在独立聊天窗口时，把它纳入对比。

这页真正重要的问题不是“Cursor 能不能生成代码”，而是它能不能实质上减少上下文切换，让你在编辑、调试和项目导航上比当前工作方式更快。`,
    },
    useCases: {
      en: ['Editor-native coding', 'Refactoring', 'Bug fixing', 'Multi-file implementation'],
      zh: ['编辑器内编码', '代码重构', 'Bug 修复', '多文件实现'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Developer workflows that stay inside the editor and codebase.' },
        { label: 'Best for', value: 'Builders comparing AI-native IDE experiences against chat-based coding help.' },
        {
          label: 'Decision angle',
          value:
            'Look at context awareness, edit speed, multi-file reliability, and how often you still fall back to external chat.',
        },
      ],
      zh: [
        { label: '核心定位', value: '留在编辑器和代码库内部的开发工作流。' },
        { label: '更适合', value: '在 AI 原生 IDE 和聊天式编程辅助之间做比较的开发者。' },
        { label: '比较重点', value: '重点看上下文感知、多文件可靠性、改动速度，以及是否仍频繁退回外部聊天。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed from the standpoint of real editor workflow gains, not demo-only code generation.',
      zh: '已按真实编辑器工作流收益来复核，而不是只看演示式代码生成。',
    },
    trustNote: {
      en: 'This listing frames Cursor around implementation speed and codebase fit, which is where the buying decision usually happens.',
      zh: '本条目把 Cursor 放在“实现速度”和“代码库适配”上来判断，这也是用户真正做决策的地方。',
    },
  },
  {
    name: 'notion-ai',
    title: 'Notion AI',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['productivity', 'knowledge-work', 'ai-writing'],
    content: {
      en: 'An AI layer inside Notion for drafting, summarizing, organizing notes, and supporting team knowledge workflows.',
      zh: 'Notion 内置的一层 AI，适合草稿撰写、总结整理、笔记归档和团队知识工作流。',
    },
    detail: {
      en: `Notion AI matters most when your documents, notes, and team knowledge already live inside Notion. In that context, the product is not just another writing helper; it is part of a broader workspace where summarization, drafting, and knowledge retrieval happen in the same place.

This page should help the user compare an embedded workspace assistant with standalone AI tools. If the core value is keeping thinking, writing, and documentation together, Notion AI becomes much easier to justify.`,
      zh: `当你的文档、笔记和团队知识已经放在 Notion 里时，Notion AI 的价值会更明显。在这个语境下，它不只是一个额外的写作助手，而是嵌在工作空间里的能力，让总结、起草和知识检索都发生在同一个地方。

这页应该帮助用户比较“嵌入式工作空间助手”和“独立 AI 工具”的差别。如果核心价值是把思考、写作和文档管理放在一起，Notion AI 就更容易成立。`,
    },
    useCases: {
      en: ['Note summarization', 'Workspace drafting', 'Knowledge retrieval', 'Team documentation'],
      zh: ['笔记总结', '工作空间起草', '知识检索', '团队文档'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'AI assistance inside an existing knowledge workspace.' },
        { label: 'Best for', value: 'Teams and individuals already committed to Notion as a daily operating layer.' },
        {
          label: 'Decision angle',
          value:
            'Compare on workflow continuity, note organization, and whether in-product AI matters more than best-in-class generation elsewhere.',
        },
      ],
      zh: [
        { label: '核心定位', value: '嵌入既有知识工作空间中的 AI 辅助。' },
        { label: '更适合', value: '已经把 Notion 当作日常操作层的个人与团队。' },
        { label: '比较重点', value: '重点比较工作流连续性、笔记组织，以及“嵌入式 AI”是否比单点最强生成能力更重要。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a workspace-native productivity tool rather than a generic assistant.',
      zh: '已按“工作空间原生生产力工具”而非通用助手来完成复核。',
    },
    trustNote: {
      en: 'The positioning here emphasizes embedded workflow value, which is usually the deciding factor for Notion AI.',
      zh: '这里强调的是嵌入式工作流价值，因为这往往才是 Notion AI 被选择的决定因素。',
    },
  },
  {
    name: 'grammarly',
    title: 'Grammarly',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'knowledge-work'],
    content: {
      en: 'A writing assistant for grammar, rewriting, clarity improvements, and day-to-day professional communication.',
      zh: '一个用于语法纠错、改写润色、表达清晰度提升和日常专业沟通的写作助手。',
    },
    detail: {
      en: `Grammarly is rarely the tool you choose for open-ended ideation, but it often wins when the job is polishing existing writing. That makes it more relevant for clarity, tone, and communication confidence than for deep creative generation.

On this page, the key comparison is whether you need a drafting engine or an editing layer. If your team already writes in many places and mainly wants cleaner output at the final mile, Grammarly is a very different product from general-purpose AI chat tools.`,
      zh: `Grammarly 通常不是你拿来做开放式灵感发散的第一选择，但它经常会在“把已有内容写得更清楚”这件事上胜出。所以它更适合清晰度、语气和专业沟通把控，而不是深度创意生成。

这页最重要的比较点是：你需要的是“起草引擎”还是“编辑层”。如果团队已经在很多地方写东西，只是想把最后一公里的输出做得更干净，Grammarly 和通用 AI 聊天工具其实是完全不同的产品。`,
    },
    useCases: {
      en: ['Editing', 'Rewriting', 'Professional communication', 'Final-pass clarity checks'],
      zh: ['编辑润色', '改写', '专业沟通', '最终清晰度检查'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Editing and clarity rather than open-ended generation.' },
        { label: 'Best for', value: 'Writers, operators, and teams polishing existing communication at scale.' },
        {
          label: 'Decision angle',
          value: 'Compare on editing quality, tone control, and how naturally it fits into everyday writing surfaces.',
        },
      ],
      zh: [
        { label: '核心定位', value: '更偏编辑和清晰度，而不是开放式生成。' },
        { label: '更适合', value: '需要大规模打磨既有沟通内容的写作者、运营和团队。' },
        { label: '比较重点', value: '重点看编辑质量、语气控制，以及它是否自然嵌入日常写作界面。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as an editing-first writing tool, not a general AI assistant.',
      zh: '已按“编辑优先的写作工具”而不是通用 AI 助手来完成复核。',
    },
    trustNote: {
      en: 'This entry frames Grammarly around final-pass writing quality, which better matches its practical buying intent.',
      zh: '本条目围绕“最后一公里写作质量”来定位 Grammarly，更贴近真实购买意图。',
    },
  },
  {
    name: 'midjourney',
    title: 'Midjourney',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['image-generation'],
    content: {
      en: 'An AI image generation product used for concept exploration, visual ideation, and fast creative direction.',
      zh: '一个用于概念探索、视觉灵感发散和快速创意方向验证的 AI 图像生成产品。',
    },
    detail: {
      en: `Midjourney is most relevant when users care about visual exploration quality and style range more than structured design workflow controls. It often enters the shortlist for inspiration, concepting, and mood development rather than operational asset pipelines.

The decision point here is whether you need a visually strong generator or a product that integrates more directly into editing, brand, or production workflows. That distinction matters more than raw popularity.`,
      zh: `如果用户更在意视觉探索质量和风格范围，而不是严谨的设计工作流控制，Midjourney 就会更有代表性。它通常会在灵感发散、概念草图和视觉氛围建立时进入 shortlist，而不一定是运营级资产生产的第一选择。

这里真正的决策点是：你需要的是一个视觉能力很强的生成器，还是一个更能直接接入编辑、品牌或生产流程的产品。这个区别比单纯热度更重要。`,
    },
    useCases: {
      en: ['Concept exploration', 'Moodboarding', 'Visual ideation', 'Creative direction'],
      zh: ['概念探索', '情绪板', '视觉灵感发散', '创意方向验证'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Strong visual generation for exploration and style discovery.' },
        { label: 'Best for', value: 'Creators and designers comparing raw image output quality and creative breadth.' },
        {
          label: 'Decision angle',
          value:
            'Compare on visual quality, prompt control, and whether you also need downstream editing or team workflow support.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向探索和风格发现的强视觉生成能力。' },
        { label: '更适合', value: '比较原始图像质量和创意广度的创作者与设计师。' },
        { label: '比较重点', value: '重点看视觉质量、提示词控制，以及是否还需要后续编辑或团队工作流支持。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a visual exploration tool rather than a full design production suite.',
      zh: '已按“视觉探索工具”而非完整设计生产套件来完成复核。',
    },
    trustNote: {
      en: 'This page positions Midjourney around creative output quality and ideation use, where comparisons are usually made.',
      zh: '本页围绕创意输出质量和灵感发散用途来定位 Midjourney，这也是用户最常比较它的地方。',
    },
  },
  {
    name: 'gamma',
    title: 'Gamma',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['knowledge-work'],
    content: {
      en: 'An AI presentation and document tool for turning rough ideas into polished decks, pages, and communication assets quickly.',
      zh: '一个用于把粗糙想法快速整理成更完整演示稿、页面和表达材料的 AI 演示与文档工具。',
    },
    detail: {
      en: `Gamma matters most when the job is not only writing content, but packaging it into something presentable. It is especially relevant for founders, marketers, operators, and teams who need to move from scattered notes into something structured enough to share with clients, teammates, or stakeholders.

This page should help users compare Gamma as a communication workflow product, not only a slide generator. The real question is whether it helps you go from idea to polished explanation faster than your current document or presentation stack.`,
      zh: `Gamma 真正有价值的时候，并不是“帮你多写一点字”，而是帮你把内容包装成能拿出去沟通的形式。它特别适合创始人、营销、运营和团队把零散笔记更快整理成可以给客户、同事或利益相关方看的结构化材料。

这页真正要帮助用户比较的是：Gamma 是不是一个“表达工作流产品”，而不只是一个幻灯片生成器。核心问题在于，它能不能比你当前的文档或演示工具更快把想法变成有完成度的说明。`,
    },
    useCases: {
      en: ['Presentation drafting', 'Proposal packaging', 'Internal communication', 'Idea-to-deck workflows'],
      zh: ['演示稿起草', '提案包装', '内部沟通材料', '想法到演示稿工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning rough content into polished communication assets quickly.' },
        { label: 'Best for', value: 'Teams and solo operators who need cleaner decks and docs with less manual formatting.' },
        { label: 'Decision angle', value: 'Compare on presentation speed, visual polish, and how easily it turns notes into something worth sharing.' },
      ],
      zh: [
        { label: '核心定位', value: '把粗糙内容更快整理成更完整的表达材料。' },
        { label: '更适合', value: '希望减少手工排版、快速产出更干净演示稿和文档的团队与个人。' },
        { label: '比较重点', value: '重点比较出稿速度、视觉完成度，以及它是否容易把笔记变成可分享内容。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a communication workflow product rather than a generic slide toy.',
      zh: '已按“表达工作流产品”而不是泛化的演示玩具来完成复核。',
    },
    trustNote: {
      en: 'This listing emphasizes where Gamma is usually chosen in practice: faster communication packaging, not just prettier slides.',
      zh: '本条目强调的是 Gamma 在真实场景里为什么会被选中：更快完成表达包装，而不只是做出更好看的幻灯片。',
    },
  },
  {
    name: 'runway',
    title: 'Runway',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['video-generation', 'image-generation'],
    content: {
      en: 'An AI creative toolset for video generation, editing, and visual production workflows.',
      zh: '一个用于视频生成、编辑和视觉生产工作流的 AI 创意工具集。',
    },
    detail: {
      en: `Runway is worth evaluating when video creation is part of the actual workflow, not just a one-off experiment. People often compare it when they want to move from ideation into clips, edits, and production tasks without bouncing across too many separate tools.

This page should help users judge whether Runway fits a creator or team workflow where video output matters, or whether a simpler generator is enough.`,
      zh: `当视频创作是实际工作流的一部分，而不是一次性实验时，Runway 才更值得认真评估。人们通常会在希望把灵感发散继续推进成短片、编辑和生产任务，又不想在太多工具之间来回切换时，把它拿来比较。

这页要帮助用户判断的是：Runway 是否适合一个真正重视视频输出的创作者/团队工作流，还是一个更简单的生成器就已经足够。`,
    },
    useCases: {
      en: ['Video generation', 'Creative editing', 'Short-form production', 'Visual storytelling'],
      zh: ['视频生成', '创意编辑', '短视频制作', '视觉叙事'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'AI-assisted video and visual production workflows.' },
        {
          label: 'Best for',
          value: 'Creators comparing generation and editing inside a single video-oriented environment.',
        },
        {
          label: 'Decision angle',
          value: 'Compare on output quality, editability, and whether it shortens the path from idea to finished clip.',
        },
      ],
      zh: [
        { label: '核心定位', value: 'AI 辅助的视频与视觉生产工作流。' },
        { label: '更适合', value: '想在一个偏视频的环境里同时比较生成和编辑能力的创作者。' },
        { label: '比较重点', value: '重点看输出质量、可编辑性，以及它是否缩短了从想法到成片的路径。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed through the lens of real video workflow value, not isolated feature demos.',
      zh: '已按真实视频工作流价值来复核，而不是只看单点演示功能。',
    },
    trustNote: {
      en: 'This profile emphasizes where Runway saves time in practice: moving from concept to editable output.',
      zh: '本条目强调的是 Runway 在真实场景里如何节省时间：从概念走向可编辑输出。',
    },
  },
  {
    name: 'dune',
    title: 'Dune',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'on-chain-analytics', 'data-infrastructure'],
    content: {
      en: 'A blockchain analytics platform for queries, dashboards, and on-chain research workflows.',
      zh: '一个面向查询、仪表盘和链上研究工作流的区块链分析平台。',
    },
    detail: {
      en: `Dune is one of the clearest benchmark tools in the Web3 category because users frequently compare it when they need query-driven on-chain analysis. It is less about generic crypto information and more about structured exploration through dashboards and underlying data logic.

This page should help users distinguish Dune from more packaged intelligence products. If you want to inspect, query, and build around on-chain data yourself, Dune becomes a different kind of decision than a simpler market-facing tool.`,
      zh: `Dune 是 Web3 分类里非常清晰的基准工具，因为当用户需要“可查询的链上分析”时，几乎都会把它拿来比较。它不只是提供泛泛的加密信息，而是更强调通过查询、仪表盘和底层数据逻辑去做结构化探索。

这页应该帮助用户把 Dune 和更“打包好的情报产品”区分开。如果你希望自己围绕链上数据去检查、查询和构建，Dune 的决策逻辑会和更简单的市场信息工具完全不同。`,
    },
    useCases: {
      en: ['On-chain analysis', 'Dashboard building', 'Protocol research', 'Wallet and transaction exploration'],
      zh: ['链上分析', '仪表盘搭建', '协议研究', '钱包与交易探索'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Query-driven blockchain analysis and reusable dashboards.' },
        {
          label: 'Best for',
          value: 'Researchers, analysts, and operators who want direct access to on-chain data logic.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on data flexibility, dashboard reuse, and whether your team can work comfortably with a more analytical interface.',
        },
      ],
      zh: [
        { label: '核心定位', value: '以查询驱动的区块链分析和可复用仪表盘。' },
        { label: '更适合', value: '希望直接接触链上数据逻辑的研究者、分析师和运营团队。' },
        { label: '比较重点', value: '重点看数据灵活性、仪表盘复用性，以及团队是否适应更分析型的界面。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as an analysis-first Web3 tool, not a passive data directory.',
      zh: '已按“分析优先”的 Web3 工具来复核，而不是被动数据目录。',
    },
    trustNote: {
      en: 'This entry is positioned around query-driven research, which is where Dune is most meaningfully compared.',
      zh: '本条目围绕“查询驱动研究”来定位，这是 Dune 最常被认真比较的使用面。',
    },
  },
  {
    name: 'fathom',
    title: 'Fathom',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'knowledge-work'],
    content: {
      en: 'An AI meeting assistant for recording calls, creating notes, and helping teams turn conversations into follow-through.',
      zh: '一个用于记录会议、生成纪要并帮助团队把对话转成后续行动的 AI 会议助手。',
    },
    detail: {
      en: `Fathom becomes relevant when meetings are not just conversations but recurring operational work. It is especially useful for founders, sales teams, customer conversations, and cross-functional collaboration where note quality and follow-through speed matter.

This page should help users compare Fathom as a workflow-reduction tool rather than just a transcription utility. The real question is whether it reduces the manual burden after meetings enough to change team habits.`,
      zh: `当会议不只是聊天，而是重复性的运营工作时，Fathom 的价值会更明显。它尤其适合创始人、销售、客户沟通和跨团队协作场景，因为这些场景里纪要质量和后续跟进速度都很重要。

这页应该帮助用户把 Fathom 看成一个“减少会后负担”的工作流工具，而不只是转录工具。真正的问题是：它能不能足够显著地减少会后手工整理，从而改变团队习惯。`,
    },
    useCases: {
      en: ['Meeting notes', 'Call summaries', 'Sales follow-up', 'Team meeting workflows'],
      zh: ['会议纪要', '通话总结', '销售跟进', '团队会议工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Reducing the note-taking and recap burden around recurring meetings.' },
        { label: 'Best for', value: 'Teams that need cleaner call summaries and faster follow-through after conversations.' },
        { label: 'Decision angle', value: 'Compare on summary usefulness, workflow fit, and whether it actually improves post-meeting execution.' },
      ],
      zh: [
        { label: '核心定位', value: '减少重复会议中的记录和总结负担。' },
        { label: '更适合', value: '需要更干净通话总结和更快会后执行的团队。' },
        { label: '比较重点', value: '重点比较总结是否有用、是否贴合团队流程，以及它有没有真正改善会后执行。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a meeting-workflow tool rather than a pure transcription utility.',
      zh: '已按“会议工作流工具”而不是纯转录工具来完成复核。',
    },
    trustNote: {
      en: 'This listing is framed around meeting follow-through, because that is where the product usually earns its place.',
      zh: '本条目围绕“会后跟进价值”来定位，因为这往往才是它真正被采用的原因。',
    },
  },
  {
    name: 'quillbot',
    title: 'QuillBot',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'knowledge-work'],
    content: {
      en: 'A writing helper for paraphrasing, rewriting, summarizing, and improving clarity in everyday text workflows.',
      zh: '一个适合改写、释义、总结和提升表达清晰度的写作辅助工具。',
    },
    detail: {
      en: `QuillBot is most useful when the job is improving or reshaping existing text rather than generating a whole workflow from scratch. Students, operators, marketers, and everyday writers often compare it when they want to rewrite faster, tighten wording, or make text easier to work with.

This page should help users compare QuillBot as a text-improvement layer. The practical decision is whether you mainly need help creating content, or whether you more often need to refine and reshape what is already there.`,
      zh: `当任务重点是“把已有文本改得更顺、更清楚、更适合当前语境”，而不是从零生成完整内容时，QuillBot 会更有代表性。学生、运营、营销和日常写作者，往往会在想更快改写、压缩措辞或让文本更容易处理时把它拿来比较。

这页应该帮助用户把 QuillBot 看成一个“文本优化层”。实际决策点在于：你更常需要的是“创造内容”，还是“把已有内容改得更好用”。`,
    },
    useCases: {
      en: ['Paraphrasing', 'Rewriting', 'Summaries', 'Clarity improvements'],
      zh: ['释义改写', '文本重写', '摘要整理', '清晰度提升'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Improving and reshaping existing text instead of serving as a full drafting engine.' },
        { label: 'Best for', value: 'Users who repeatedly rewrite, polish, and tighten everyday writing.' },
        { label: 'Decision angle', value: 'Compare on rewrite quality, clarity gains, and whether it saves time in repeated editing tasks.' },
      ],
      zh: [
        { label: '核心定位', value: '优化和重塑已有文本，而不是完整起草引擎。' },
        { label: '更适合', value: '经常要反复改写、润色和压缩日常文本的用户。' },
        { label: '比较重点', value: '重点比较改写质量、清晰度提升，以及它是否在重复编辑任务里持续省时。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a rewrite-first writing tool rather than a broad general assistant.',
      zh: '已按“改写优先的写作工具”而不是泛化通用助手来完成复核。',
    },
    trustNote: {
      en: 'This entry highlights QuillBot’s practical role in repeated editing and paraphrasing work, which is where it is most meaningfully compared.',
      zh: '本条目强调 QuillBot 在重复编辑和释义场景里的真实角色，因为这才是它最常被认真比较的地方。',
    },
  },
  {
    name: 'defillama',
    title: 'DefiLlama',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'defi-analytics', 'research'],
    content: {
      en: 'A DeFi analytics product for tracking protocols, TVL, yields, and broader market structure across chains.',
      zh: '一个用于追踪协议、TVL、收益和跨链市场结构的 DeFi 分析产品。',
    },
    detail: {
      en: `DefiLlama is especially useful as a market map and monitoring layer for DeFi. People often compare it when they need broad protocol visibility, yield tracking, and top-level ecosystem awareness without dropping immediately into lower-level query work.

This page should help users see the distinction between a broad market intelligence surface and a deeper analyst workstation. If the job starts with coverage and monitoring, DefiLlama is often one of the first tools worth opening.`,
      zh: `DefiLlama 很适合作为 DeFi 市场地图和监控层来使用。很多人在需要更广的协议可见性、收益追踪和生态概览，而不是一开始就钻进底层查询工作时，会把它纳入比较。

这页应该帮助用户看清“广覆盖市场情报界面”和“深度分析工作台”之间的差别。如果工作是从覆盖面和监控开始，DefiLlama 往往是最值得先打开的工具之一。`,
    },
    useCases: {
      en: ['Protocol monitoring', 'TVL tracking', 'Yield discovery', 'Ecosystem scanning'],
      zh: ['协议监控', 'TVL 追踪', '收益发现', '生态扫描'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Broad DeFi market visibility and protocol tracking.' },
        {
          label: 'Best for',
          value: 'Operators and researchers who want a fast market map before deeper investigation.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on coverage, monitoring usefulness, and how often you need to go beyond summary data into deeper analysis.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向广覆盖 DeFi 市场可见性和协议追踪。' },
        { label: '更适合', value: '希望先看市场地图、再决定深入调查方向的运营与研究者。' },
        { label: '比较重点', value: '重点看覆盖面、监控价值，以及你是否经常需要跳出概览做更深分析。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a coverage-first DeFi tool for monitoring and discovery.',
      zh: '已按“覆盖优先”的 DeFi 监控与发现工具来完成复核。',
    },
    trustNote: {
      en: 'This page frames DefiLlama around ecosystem visibility and protocol monitoring, which better matches how people actually use it.',
      zh: '本页把 DefiLlama 定位在生态可见性和协议监控上，更贴近它的真实使用方式。',
    },
  },
  {
    name: 'the-graph',
    title: 'The Graph',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'data-infrastructure', 'developer-platform'],
    content: {
      en: 'A decentralized indexing protocol and data layer used for building Web3 applications and structured blockchain access.',
      zh: '一个用于构建 Web3 应用和结构化访问区块链数据的去中心化索引协议与数据层。',
    },
    detail: {
      en: `The Graph belongs on a Web3 shortlist when the question is not only "how do I inspect blockchain data?" but "how do I structure and serve it inside applications?" That makes it a better fit for product builders and infra-minded teams than for casual market browsing.

This page should help distinguish infrastructure-layer products from end-user analytics products. If your work involves powering apps, dashboards, or repeated blockchain data access, The Graph plays a very different role from simple research tools.`,
      zh: `当问题不只是“我怎么查看链上数据”，而是“我怎么把链上数据结构化并服务给应用”时，The Graph 才真正进入 Web3 shortlist。也正因为如此，它更适合产品构建者和偏基础设施思维的团队，而不是只是想随手浏览市场信息的用户。

这页应该帮助用户把基础设施层产品和终端分析产品区分开。如果你的工作涉及给应用、仪表盘或重复性区块链数据访问提供底层支撑，The Graph 的角色会和简单研究工具完全不同。`,
    },
    useCases: {
      en: ['Web3 application data access', 'Indexing', 'Developer infrastructure', 'Structured blockchain queries'],
      zh: ['Web3 应用数据访问', '索引层', '开发者基础设施', '结构化链上查询'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Blockchain data indexing and developer-facing access layers.' },
        { label: 'Best for', value: 'Builders comparing infra options for repeated and structured on-chain data use.' },
        {
          label: 'Decision angle',
          value:
            'Compare on developer fit, indexing model, and whether your need is app infrastructure rather than end-user analytics.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向开发者的区块链数据索引与访问层。' },
        { label: '更适合', value: '在重复、结构化链上数据使用场景下比较基础设施方案的构建者。' },
        { label: '比较重点', value: '重点看开发者适配、索引模式，以及你的需求是不是应用基础设施而非终端分析。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a Web3 infrastructure product, not a consumer-facing analytics page.',
      zh: '已按 Web3 基础设施产品来复核，而不是把它当成面向普通用户的分析页面。',
    },
    trustNote: {
      en: 'This listing helps users compare infrastructure intent versus analytics intent, which is the real decision split here.',
      zh: '本条目帮助用户区分“基础设施意图”和“分析意图”，这才是这里真正的决策分叉点。',
    },
  },
  {
    name: 'n8n',
    title: 'n8n',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['automation', 'workflow-automation', 'developer-platform'],
    content: {
      en: 'A workflow automation platform for connecting services, orchestrating steps, and building repeatable internal operations.',
      zh: '一个用于连接服务、编排步骤和构建可重复内部流程的工作流自动化平台。',
    },
    detail: {
      en: `n8n is a strong benchmark when teams want more control over automation logic than simple app-to-app triggers usually provide. It matters most for repeatable operations, internal workflows, and agent-style orchestration that still needs structure and ownership.

On this page, the useful comparison is whether you need lightweight convenience or a more configurable workflow layer. If your automations keep growing beyond simple rules, n8n becomes more compelling.`,
      zh: `当团队需要比简单应用触发器更强的自动化逻辑控制时，n8n 就会成为一个很强的基准产品。它最适合可重复运营、内部流程，以及仍然需要结构化和可控性的 agent 式编排。

这页真正有用的比较点是：你需要的是轻量便利，还是一个更可配置的工作流层。如果你的自动化经常长到超出简单规则，n8n 的吸引力就会更明显。`,
    },
    useCases: {
      en: ['Internal automations', 'Workflow orchestration', 'Lead routing', 'Operational pipelines'],
      zh: ['内部自动化', '工作流编排', '线索流转', '运营流水线'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Configurable automation for repeatable business and ops workflows.' },
        { label: 'Best for', value: 'Teams outgrowing simple trigger tools and needing more logic control.' },
        {
          label: 'Decision angle',
          value:
            'Compare on workflow flexibility, ownership, and whether your team benefits from a more structured automation layer.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向可重复业务与运营流程的可配置自动化。' },
        { label: '更适合', value: '已经超出简单触发器工具、需要更强逻辑控制的团队。' },
        { label: '比较重点', value: '重点看工作流灵活性、可维护性，以及团队是否需要更结构化的自动化层。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a workflow-control product rather than a convenience-only automation tool.',
      zh: '已按“工作流控制产品”而不只是“省事工具”来完成复核。',
    },
    trustNote: {
      en: 'This profile highlights where n8n becomes meaningfully different: logic depth, repeatability, and operational ownership.',
      zh: '本条目强调 n8n 真正拉开差距的地方：逻辑深度、可重复性和运营归属感。',
    },
  },
  {
    name: 'make',
    title: 'Make',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['automation', 'workflow-automation'],
    content: {
      en: 'A visual automation platform for connecting apps and running repeatable business workflows across tools.',
      zh: '一个用于连接应用并在多工具之间运行可重复业务流程的可视化自动化平台。',
    },
    detail: {
      en: `Make is often chosen when teams want visual workflow building with a lower barrier than more technical automation stacks. It sits in a useful middle ground for operations, marketing, and cross-tool process design.

This page should help users compare ease-of-use against workflow power. If the team wants automation that is still approachable while covering serious operational cases, Make usually deserves a side-by-side look.`,
      zh: `当团队希望用更低门槛的方式搭建可视化工作流，而不想一开始就进入更技术化的自动化栈时，Make 往往会被选中。它对运营、营销和跨工具流程设计来说，正好处在一个很好用的中间地带。

这页应该帮助用户比较“易用性”和“工作流能力”之间的平衡。如果团队既想要自动化，又希望保留较低学习门槛，Make 通常值得被认真横向看一眼。`,
    },
    useCases: {
      en: ['Cross-tool workflows', 'Marketing automation', 'CRM sync', 'Back-office operations'],
      zh: ['跨工具流程', '营销自动化', 'CRM 同步', '后台运营'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Visual automation for teams that want breadth without excessive complexity.' },
        { label: 'Best for', value: 'Operators and marketers comparing accessible workflow automation options.' },
        {
          label: 'Decision angle',
          value:
            'Compare on ease-of-use, integration fit, and how far the visual model can stretch before you outgrow it.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向团队、兼顾广度与复杂度控制的可视化自动化。' },
        { label: '更适合', value: '比较低门槛工作流自动化方案的运营和营销团队。' },
        { label: '比较重点', value: '重点看易用性、集成适配，以及它的可视化模型在多大程度上能支撑你的流程增长。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a balance point between accessibility and workflow breadth.',
      zh: '已按“易用性与工作流广度的平衡点”来完成复核。',
    },
    trustNote: {
      en: 'This page emphasizes where Make is typically compared in practice: approachable automation with real operational reach.',
      zh: '本页强调的是 Make 在真实场景里最常被比较的点：上手门槛友好，但仍有实际运营覆盖面。',
    },
  },
  {
    name: 'openrouter',
    title: 'OpenRouter',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-platform', 'developer-tools', 'reasoning'],
    content: {
      en: 'A model access layer for routing across LLM providers and comparing model options through one developer-facing surface.',
      zh: '一个让开发者通过单一接口接入并路由多个 LLM 提供商、比较模型选项的访问层。',
    },
    detail: {
      en: `OpenRouter is most useful when your question is not "which chatbot should I use?" but "how should my product or workflow access multiple models?" It sits closer to developer choice, routing, and provider flexibility than to end-user assistant experiences.

This page should help separate developer platform intent from consumer AI use. If you need optionality, routing, and model-level experimentation, OpenRouter deserves to be judged on infrastructure usefulness rather than polished end-user UX alone.`,
      zh: `当你的问题不是“我该用哪个聊天机器人”，而是“我的产品或工作流该怎么接入多个模型”时，OpenRouter 才最有价值。它更接近开发者选择、路由控制和提供商灵活性，而不是终端用户助手体验。

这页应该帮助用户把“开发平台意图”和“消费级 AI 使用”分开。如果你需要的是可选性、路由能力和模型级实验空间，OpenRouter 就应该按照基础设施价值来判断，而不是只看终端体验是否精致。`,
    },
    useCases: {
      en: ['Multi-model access', 'Provider routing', 'Developer experimentation', 'Model comparison workflows'],
      zh: ['多模型接入', '提供商路由', '开发实验', '模型比较工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Developer-facing access and routing across model providers.' },
        {
          label: 'Best for',
          value: 'Builders comparing model flexibility, provider optionality, and integration convenience.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on routing value, provider breadth, and whether your workflow is infra-driven instead of app-driven.',
        },
      ],
      zh: [
        { label: '核心定位', value: '面向开发者的多模型提供商访问与路由层。' },
        { label: '更适合', value: '比较模型灵活性、提供商可选性和接入便利度的构建者。' },
        { label: '比较重点', value: '重点看路由价值、提供商广度，以及你的工作流是不是偏基础设施驱动。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a model-access infrastructure product rather than an end-user AI app.',
      zh: '已按“模型访问基础设施产品”而非终端 AI 应用来完成复核。',
    },
    trustNote: {
      en: 'This profile is designed to help users avoid comparing OpenRouter against the wrong class of products.',
      zh: '本条目旨在帮助用户避免把 OpenRouter 和错误类别的产品放在一起比较。',
    },
  },
  {
    name: 'sigoo',
    title: 'Sigoo.ai',
    categorySlug: 'research',
    pricing: 'paid',
    tags: ['research', 'website-planning', 'keyword-research'],
    content: {
      en: 'An SEO intelligence platform for discovering keyword opportunities, planning website structures, and understanding competitive landscapes.',
      zh: '一个用于发现关键词机会、规划网站结构并理解竞争格局的 SEO Intelligence 平台。',
    },
    detail: {
      en: `Sigoo.ai is positioned around intelligence and discovery instead of content execution. The MVP is designed for indie hackers, AI builders, and SaaS founders who want to move from keyword discovery into website planning and competitive understanding without starting from a blank page.

This page should help users see Sigoo.ai as a planning product: a tool for deciding what to build, write, and structure next. That is a different job from AI writing products, and it should be evaluated on clarity, opportunity discovery, and planning usefulness.`,
      zh: `Sigoo.ai 的定位是“情报与发现”，而不是内容执行本身。这个 MVP 面向独立开发者、AI 构建者和 SaaS 创始人，帮助他们从关键词发现进入网站结构规划和竞争理解，而不是从一张白纸开始。

这页要帮助用户把 Sigoo.ai 看成一个“规划产品”：它帮助你决定接下来该做什么、写什么、怎么搭结构。这和 AI 写作工具是完全不同的工作，应该按照清晰度、机会发现能力和规划价值来判断。`,
    },
    useCases: {
      en: [
        'Keyword opportunity discovery',
        'Website structure planning',
        'Competitive landscape analysis',
        'SEO workflow prioritization',
      ],
      zh: ['关键词机会发现', '网站结构规划', '竞争格局分析', 'SEO 工作流优先级判断'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'SEO intelligence and planning rather than content execution.' },
        {
          label: 'Best for',
          value: 'Founders and builders validating where to invest content and website effort next.',
        },
        {
          label: 'Decision angle',
          value:
            'Compare on insight clarity, workflow usefulness, and whether it improves planning quality before production starts.',
        },
      ],
      zh: [
        { label: '核心定位', value: 'SEO Intelligence 与规划，而不是内容执行。' },
        { label: '更适合', value: '需要判断下一步把内容和网站精力投到哪里的创始人和构建者。' },
        { label: '比较重点', value: '重点看洞察清晰度、工作流实用性，以及它是否在执行前提升了规划质量。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a planning-first SEO product, distinct from drafting tools.',
      zh: '已按“规划优先”的 SEO 产品来复核，并与写作型工具做了区分。',
    },
    trustNote: {
      en: 'This listing is framed around planning value and market-fit validation, which better matches the current product stage.',
      zh: '本条目围绕规划价值和市场验证阶段来定位，更贴近当前产品所处阶段。',
    },
  },
  {
    name: 'gemini',
    title: 'Gemini',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'reasoning', 'knowledge-work', 'multimodal'],
    content: {
      en: 'A Google AI assistant for chat, multimodal help, writing support, and everyday knowledge work.',
      zh: '一个用于对话、多模态辅助、写作支持和日常知识工作的 Google AI 助手。',
    },
    detail: {
      en: `Gemini is a strong default when users want one assistant that stays close to the Google ecosystem and still covers chat, writing, and multimodal tasks. It is often compared when the real question is whether workflow convenience outweighs switching to a more specialized tool.

This page should help users decide whether Gemini fits their daily assistant habit or whether a different tool gives them more control, better writing output, or a clearer research workflow.`,
      zh: `当用户希望使用一个更贴近 Google 生态、同时还能覆盖聊天、写作和多模态任务的助手时，Gemini 是一个很强的默认项。很多人比较它的时候，真正的问题是：工作流便利性是否足以抵过切换到更专门工具的成本。

这页要帮助用户判断：Gemini 是否足够适合他们的日常助手习惯，还是另一款工具能提供更强的控制力、更好的写作输出，或者更清晰的研究工作流。`,
    },
    useCases: {
      en: ['General chat', 'Multimodal help', 'Writing support', 'Knowledge work'],
      zh: ['通用对话', '多模态辅助', '写作支持', '知识工作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'A broad assistant experience that fits Google-adjacent daily workflows.' },
        { label: 'Best for', value: 'People who want one assistant for writing, search, and multimodal help.' },
        { label: 'Decision angle', value: 'Compare on ecosystem fit, multimodal usefulness, and daily workflow convenience.' },
      ],
      zh: [
        { label: '核心定位', value: '适配 Google 周边日常工作流的广谱助手体验。' },
        { label: '更适合', value: '希望一个助手同时覆盖写作、搜索和多模态辅助的用户。' },
        { label: '比较重点', value: '重点比较生态适配、多模态实用性和日常工作流便利度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a workflow assistant rather than a novelty chat product.',
      zh: '已按“工作流助手”而不是新鲜感聊天产品来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on practical assistant fit, which is where Gemini is usually judged.',
      zh: '本条目把比较重点放在实际助手适配度上，这也是 Gemini 最常被判断的地方。',
    },
  },
  {
    name: 'grok',
    title: 'Grok',
    categorySlug: 'chatbot',
    pricing: 'freemium',
    tags: ['chat', 'reasoning', 'knowledge-work'],
    content: {
      en: 'A conversational AI assistant for general chat, fast answers, and a more opinionated assistant style.',
      zh: '一个用于通用对话、快速答案和更具风格化回答体验的 AI 助手。',
    },
    detail: {
      en: `Grok is worth comparing when users want a general assistant that feels more opinionated or context-aware than a plain default chatbot. The useful question is not just whether it can answer prompts, but whether its style and context make it more useful in your actual day-to-day workflow.

This page should help users decide whether Grok offers enough practical difference to earn a place beside other mainstream assistants.`,
      zh: `当用户希望一个通用助手更有观点、更有上下文感，而不是一个普通默认聊天机器人时，Grok 就值得比较。真正的问题不只是它能不能回答 prompt，而是它的风格和语境是否能在日常工作里真正帮到你。

这页要帮助用户判断：Grok 是否提供了足够实际的差异化，值得放进主流助手的 shortlist。`,
    },
    useCases: {
      en: ['General chat', 'Fast lookups', 'Assistant comparison', 'Daily knowledge work'],
      zh: ['通用对话', '快速查询', '助手比较', '日常知识工作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'A more opinionated assistant experience for general-purpose workflows.' },
        { label: 'Best for', value: 'People comparing assistant style, response feel, and daily usefulness.' },
        { label: 'Decision angle', value: 'Compare on answer style, context feel, and whether it changes your daily habits.' },
      ],
      zh: [
        { label: '核心定位', value: '更具风格化的通用助手体验。' },
        { label: '更适合', value: '比较助手风格、回答手感和日常实用性的用户。' },
        { label: '比较重点', value: '重点比较回答风格、语境感，以及它是否真的改变日常使用习惯。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a differentiated general assistant, not just another chat tab.',
      zh: '已按“有差异化的通用助手”而不是又一个聊天标签页来复核。',
    },
    trustNote: {
      en: 'This listing focuses on whether Grok is actually useful in day-to-day use, which is the only comparison that matters here.',
      zh: '本条目聚焦 Grok 在日常使用里是否真的有用，这也是这里唯一真正重要的比较。',
    },
  },
  {
    name: 'copilot',
    title: 'Microsoft Copilot',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['chat', 'knowledge-work', 'workflow-automation'],
    content: {
      en: 'A Microsoft AI assistant for everyday productivity, office workflows, and broad task support.',
      zh: '一个用于日常生产力、办公工作流和广泛任务支持的 Microsoft AI 助手。',
    },
    detail: {
      en: `Microsoft Copilot is most relevant when users want an assistant that fits an existing Microsoft-heavy workflow. It is less about one standout feature and more about whether the surrounding ecosystem and daily task flow make it worth using regularly.

This page should help users judge whether Copilot belongs in their core productivity stack or whether a more specialized assistant is a better fit.`,
      zh: `当用户希望一个能适配既有 Microsoft 工作流的助手时，Microsoft Copilot 就更有意义。它不一定靠某个单点能力取胜，而更多取决于生态和日常任务流是否足够顺手，值得长期使用。

这页应该帮助用户判断：Copilot 是否应该进入核心生产力工具栈，还是更专门的助手更适合。`,
    },
    useCases: {
      en: ['Daily productivity', 'Office workflows', 'Task assistance', 'Knowledge work'],
      zh: ['日常生产力', '办公工作流', '任务辅助', '知识工作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'A productivity assistant that fits Microsoft-centered work habits.' },
        { label: 'Best for', value: 'People already working inside Microsoft-style workflows and apps.' },
        { label: 'Decision angle', value: 'Compare on ecosystem fit, workflow convenience, and how naturally it shows up in daily work.' },
      ],
      zh: [
        { label: '核心定位', value: '适配微软生态工作习惯的生产力助手。' },
        { label: '更适合', value: '本来就处在 Microsoft 风格工作流和应用里的用户。' },
        { label: '比较重点', value: '重点比较生态适配、工作流便利性，以及它是否自然进入日常工作。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a workplace assistant rather than a standalone novelty product.',
      zh: '已按“办公助手”而不是独立的新鲜产品来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on real workflow fit inside a Microsoft-heavy stack.',
      zh: '本条目把比较重点放在 Microsoft 重度工作栈里的真实适配度上。',
    },
  },
  {
    name: 'phind',
    title: 'Phind',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['code-assistant', 'research', 'developer-platform'],
    content: {
      en: 'A developer-focused AI search assistant for technical answers, code discovery, and faster implementation support.',
      zh: '一个面向技术答案、代码发现和更快实现支持的开发者 AI 搜索助手。',
    },
    detail: {
      en: `Phind is a strong benchmark when the goal is not generic chat, but fast technical help that stays close to implementation. It is often compared by developers who want answers grounded in search and want to move from question to fix without extra friction.

This page should help users judge whether Phind actually improves debugging and coding speed enough to become part of a developer's regular workflow.`,
      zh: `当目标不是泛泛聊天，而是更贴近实现的快速技术帮助时，Phind 会是一个很强的基准工具。开发者通常会在希望答案有搜索支撑，并且能更顺畅地从问题走到修复时，把它拿来比较。

这页应该帮助用户判断：Phind 是否真的能提升调试和编码速度，足以进入开发者的日常工作流。`,
    },
    useCases: {
      en: ['Technical Q&A', 'Code discovery', 'Debugging support', 'Implementation help'],
      zh: ['技术问答', '代码发现', '调试支持', '实现辅助'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Search-backed technical help for developers.' },
        { label: 'Best for', value: 'People who want answers that move directly toward implementation.' },
        { label: 'Decision angle', value: 'Compare on developer usefulness, search reliability, and speed from question to fix.' },
      ],
      zh: [
        { label: '核心定位', value: '面向开发者的搜索驱动技术帮助。' },
        { label: '更适合', value: '希望答案能直接推进到实现的人。' },
        { label: '比较重点', value: '重点比较开发者实用性、搜索可靠性，以及从问题到修复的速度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a developer workflow assistant rather than a generic chat experience.',
      zh: '已按“开发者工作流助手”而不是通用聊天体验来复核。',
    },
    trustNote: {
      en: 'This listing focuses on technical usefulness and implementation speed, which is why Phind is usually compared.',
      zh: '本条目聚焦技术实用性和实现速度，这也是 Phind 最常被比较的原因。',
    },
  },
  {
    name: 'writesonic',
    title: 'Writesonic',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'marketing', 'content'],
    content: {
      en: 'An AI writing platform for marketing copy, long-form content, and repeatable content generation workflows.',
      zh: '一个用于营销文案、长文内容和可重复内容生成工作流的 AI 写作平台。',
    },
    detail: {
      en: `Writesonic is best understood as a content production tool when the job is repeatable marketing or SEO writing rather than occasional drafting. It is often compared by teams that want a broad writing surface with enough structure to support real content operations.

This page should help users decide whether Writesonic gives them the throughput they need for ongoing content production, or whether a more focused writer is a better fit.`,
      zh: `当任务是可重复的营销或 SEO 写作，而不是偶尔起草时，Writesonic 更适合被看成内容生产工具。团队通常会在需要一个足够宽的写作面，同时又要能支撑真实内容运营时比较它。

这页要帮助用户判断：Writesonic 是否能提供持续内容生产所需的吞吐能力，还是一个更聚焦的写作工具更合适。`,
    },
    useCases: {
      en: ['Marketing copy', 'Long-form writing', 'SEO content', 'Content generation'],
      zh: ['营销文案', '长文写作', 'SEO 内容', '内容生成'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Repeatable writing workflows for marketing and content production.' },
        { label: 'Best for', value: 'Teams and creators shipping content regularly.' },
        { label: 'Decision angle', value: 'Compare on workflow fit, writing throughput, and whether it supports ongoing production.' },
      ],
      zh: [
        { label: '核心定位', value: '面向营销与内容生产的可重复写作工作流。' },
        { label: '更适合', value: '需要持续发布内容的团队和创作者。' },
        { label: '比较重点', value: '重点比较工作流适配、写作吞吐量，以及它是否支持持续生产。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a production-oriented writing tool rather than a casual generator.',
      zh: '已按“生产导向的写作工具”而不是随手生成器来复核。',
    },
    trustNote: {
      en: 'This listing emphasizes repeatable content workflows, which is the most practical way to judge Writesonic.',
      zh: '本条目强调可重复内容工作流，这也是判断 Writesonic 最实用的方式。',
    },
  },
  {
    name: 'jasper',
    title: 'Jasper',
    categorySlug: 'text-writing',
    pricing: 'freemium',
    tags: ['ai-writing', 'brand-voice', 'copywriting'],
    content: {
      en: 'An AI writing platform for branded marketing content, campaign execution, and team writing workflows.',
      zh: '一个用于品牌营销内容、活动执行和团队写作工作流的 AI 写作平台。',
    },
    detail: {
      en: `Jasper matters most when a team cares about brand voice, campaign consistency, and content throughput more than casual AI drafting. It fits teams that want structured marketing output rather than just another writing assistant tab.

This page should help users decide whether Jasper helps a team scale branded content without losing consistency.`,
      zh: `当团队更在意品牌语气、活动一致性和内容产能，而不是随手 AI 起草时，Jasper 会更有价值。它适合那些想放大结构化营销产出，而不只是多一个写作助手标签页的团队。

这页真正要帮助用户判断的是：Jasper 是否能帮助你的团队在不丢失品牌一致性的情况下扩大内容生产。`,
    },
    useCases: {
      en: ['Brand campaigns', 'Content production', 'Marketing ops', 'Team writing'],
      zh: ['品牌活动', '内容生产', '营销运营', '团队写作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams produce branded marketing content at scale.' },
        { label: 'Best for', value: 'Marketing teams coordinating repeatable content systems.' },
        { label: 'Decision angle', value: 'Compare on brand consistency, production speed, and team workflow depth.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队规模化输出品牌营销内容。' },
        { label: '更适合', value: '协调可重复内容系统的营销团队。' },
        { label: '比较重点', value: '重点比较品牌一致性、生产速度和团队工作流深度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a branded content system rather than a general-purpose writer.',
      zh: '已按“品牌内容系统”而不是通用写手来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on brand consistency and repeatable output, which is where Jasper is usually judged.',
      zh: '本条目把比较重点放在品牌一致性和可重复产出上，这也是 Jasper 最常被判断的地方。',
    },
  },
  {
    name: 'elevenlabs',
    title: 'ElevenLabs',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['voice', 'text-to-speech', 'audio'],
    content: {
      en: 'A voice generation platform for narration, cloning, and production-ready audio workflows.',
      zh: '一个用于旁白、声音克隆和生产级音频工作流的语音生成平台。',
    },
    detail: {
      en: `ElevenLabs is strongest when voice quality is not optional and audio output becomes part of a repeatable workflow. It is often compared by creators and product teams who care about natural narration, controllability, and whether the output is good enough for real production.

This page should help users decide whether a dedicated voice tool is worth adding to their stack.`,
      zh: `当语音质量不是可选项，而且音频输出进入可重复工作流时，ElevenLabs 的价值最强。创作者和产品团队常常会在意自然旁白、可控性，以及输出是否足以直接进入真实生产。

这页要帮助用户判断：是否值得把一款专门的语音工具加入自己的技术栈。`,
    },
    useCases: {
      en: ['Voice narration', 'Voice cloning', 'Audio production', 'Text-to-speech workflows'],
      zh: ['语音旁白', '声音克隆', '音频制作', '文字转语音工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'High-quality voice generation for repeatable production work.' },
        { label: 'Best for', value: 'Creators and teams that need natural-sounding audio at scale.' },
        { label: 'Decision angle', value: 'Compare on voice naturalness, controllability, and repeatable production usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '面向重复性生产工作的高质量语音生成。' },
        { label: '更适合', value: '需要规模化自然语音输出的创作者和团队。' },
        { label: '比较重点', value: '重点比较语音自然度、可控性和重复性生产价值。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a production voice tool rather than a novelty demo.',
      zh: '已按“生产级语音工具”而不是新鲜感 Demo 来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison focused on repeated audio production, which is where ElevenLabs is most honestly judged.',
      zh: '本条目把比较重点放在重复性音频生产上，这也是 ElevenLabs 最值得被诚实判断的地方。',
    },
  },
  {
    name: 'assemblyai',
    title: 'AssemblyAI',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['speech-to-text', 'transcription', 'voice-ai'],
    content: {
      en: 'A speech AI platform for transcription, summarization, and production-ready voice APIs.',
      zh: '一个用于转录、摘要和生产级语音 API 的 Speech AI 平台。',
    },
    detail: {
      en: `AssemblyAI is most relevant when a team needs speech tooling that feels product-ready instead of merely experimental. It helps turn raw audio into structured outputs that can power summaries, call workflows, and voice-based product experiences.

The real decision is whether AssemblyAI improves audio understanding enough to justify becoming part of the stack.`,
      zh: `当团队需要的是“产品可用”的语音能力，而不只是实验性质的音频处理时，AssemblyAI 就会更有意义。它帮助把原始音频转成结构化输出，进一步支撑摘要、通话流程和语音驱动的产品体验。

真正的问题是：AssemblyAI 是否足够提升音频理解能力，值得进入你的技术栈。`,
    },
    useCases: {
      en: ['Transcription APIs', 'Speech summaries', 'Call intelligence', 'Voice product workflows'],
      zh: ['转录 API', '语音摘要', '通话智能', '语音产品工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning audio into structured product outputs through transcription and voice APIs.' },
        { label: 'Best for', value: 'Teams building transcription-heavy workflows and audio-native product features.' },
        { label: 'Decision angle', value: 'Compare on transcription quality, voice workflow depth, and production readiness.' },
      ],
      zh: [
        { label: '核心定位', value: '通过转录和语音 API 把音频转成结构化产品输出。' },
        { label: '更适合', value: '构建重转录流程和音频原生产品功能的团队。' },
        { label: '比较重点', value: '重点比较转录质量、语音工作流深度和生产就绪度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a production-ready speech and transcription layer rather than a lightweight demo.',
      zh: '已按“生产级语音与转录层”而不是轻量 Demo 来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on production audio workflows, which is where AssemblyAI is most honestly judged.',
      zh: '本条目把比较重点放在生产级音频工作流上，这也是 AssemblyAI 最值得被诚实判断的地方。',
    },
  },
  {
    name: 'alchemy',
    title: 'Alchemy',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['developer-platform', 'data-infrastructure', 'web3'],
    content: {
      en: 'A Web3 infrastructure platform for blockchain development, data access, and app-building workflows.',
      zh: '一个用于区块链开发、数据访问和应用构建工作流的 Web3 基础设施平台。',
    },
    detail: {
      en: `Alchemy is most relevant when users need serious blockchain infrastructure rather than consumer-facing crypto dashboards. It sits closer to developer tooling and application support, so the comparison is less about casual browsing and more about whether it reduces engineering friction.

This page should help teams decide whether Alchemy deserves a place in their stack for building and shipping Web3 products.`,
      zh: `当用户需要的是严肃的区块链基础设施，而不是面向普通用户的加密看板时，Alchemy 才更有意义。它更靠近开发工具和应用支撑，因此比较重点不是随手浏览，而是它是否能减少工程摩擦。

这页要帮助团队判断：Alchemy 是否值得进入他们的技术栈，用来构建和交付 Web3 产品。`,
    },
    useCases: {
      en: ['Web3 app infrastructure', 'Blockchain data access', 'Developer tooling', 'Production APIs'],
      zh: ['Web3 应用基础设施', '区块链数据访问', '开发者工具', '生产级 API'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Developer-facing blockchain infrastructure and data access.' },
        { label: 'Best for', value: 'Builders comparing serious Web3 infrastructure options.' },
        { label: 'Decision angle', value: 'Compare on infrastructure breadth, developer workflow support, and app-building fit.' },
      ],
      zh: [
        { label: '核心定位', value: '面向开发者的区块链基础设施与数据访问。' },
        { label: '更适合', value: '比较严肃 Web3 基础设施方案的构建者。' },
        { label: '比较重点', value: '重点比较基础设施广度、开发者工作流支持，以及应用构建适配度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a Web3 infrastructure product rather than an end-user dashboard.',
      zh: '已按 Web3 基础设施产品而不是终端看板来复核。',
    },
    trustNote: {
      en: 'This listing focuses on whether the platform reduces enough engineering effort to justify deeper adoption.',
      zh: '本条目聚焦它是否能减少足够多的工程投入，从而值得更深使用。',
    },
  },
  {
    name: 'nansen',
    title: 'Nansen',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'on-chain-analytics', 'research'],
    content: {
      en: 'A wallet intelligence and on-chain research platform for tracking entities, flows, and market signals.',
      zh: '一个用于追踪实体、资金流和市场信号的钱包情报与链上研究平台。',
    },
    detail: {
      en: `Nansen is a strong comparison point when the work needs wallet intelligence, entity context, and repeated monitoring rather than generic market browsing. It becomes more useful as research gets more behavior-oriented and more tied to understanding who is moving what.

This page should help users judge whether wallet-level intelligence is central enough to justify a serious research tool.`,
      zh: `当工作需要钱包情报、实体语境和重复监控，而不只是泛泛地浏览市场时，Nansen 就会成为一个很强的对比点。随着研究越来越偏行为导向、越来越关注“谁在移动什么”，它的价值会更明显。

这页要帮助用户判断：钱包级情报是否已经重要到值得使用一款严肃的研究工具。`,
    },
    useCases: {
      en: ['Wallet tracking', 'On-chain research', 'Entity monitoring', 'Capital-flow analysis'],
      zh: ['钱包追踪', '链上研究', '实体监控', '资金流分析'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Wallet intelligence and behavior-driven on-chain monitoring.' },
        { label: 'Best for', value: 'Researchers and analysts who need entity and flow context.' },
        { label: 'Decision angle', value: 'Compare on wallet depth, monitoring usefulness, and entity context clarity.' },
      ],
      zh: [
        { label: '核心定位', value: '钱包情报和行为驱动的链上监控。' },
        { label: '更适合', value: '需要实体和资金流语境的研究者与分析师。' },
        { label: '比较重点', value: '重点比较钱包深度、监控价值和实体语境清晰度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a wallet-intelligence research tool rather than a surface dashboard.',
      zh: '已按“钱包情报研究工具”而不是表层看板来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on recurring monitoring and wallet intelligence, which is where Nansen is usually judged.',
      zh: '本条目把比较重点放在重复监控和钱包情报上，这也是 Nansen 最常被判断的地方。',
    },
  },
  {
    name: 'token-terminal',
    title: 'Token Terminal',
    categorySlug: 'web3',
    pricing: 'freemium',
    tags: ['web3', 'research', 'on-chain-analytics'],
    content: {
      en: 'A crypto research platform for benchmarks, protocol metrics, and structured comparison across Web3 projects.',
      zh: '一个用于基准、协议指标和 Web3 项目结构化比较的加密研究平台。',
    },
    detail: {
      en: `Token Terminal is most useful when the question is not just market activity, but how to compare protocols in a structured, benchmark-oriented way. It is a good fit for teams and analysts who need clearer business or protocol metrics rather than generic browsing.

This page should help users decide whether Token Terminal is the right place to do recurring protocol comparison work.`,
      zh: `当问题不只是市场动态，而是如何用结构化、基准导向的方式比较协议时，Token Terminal 的价值就更明显。它适合那些需要更清晰业务或协议指标，而不是泛泛浏览的团队与分析师。

这页要帮助用户判断：Token Terminal 是否是你进行重复性协议比较工作的合适入口。`,
    },
    useCases: {
      en: ['Protocol benchmarks', 'Crypto research', 'Metric comparison', 'Market structure analysis'],
      zh: ['协议基准', '加密研究', '指标比较', '市场结构分析'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Structured benchmark and protocol comparison workflows.' },
        { label: 'Best for', value: 'Researchers who want repeatable comparison over time.' },
        { label: 'Decision angle', value: 'Compare on benchmark clarity, metric consistency, and long-term comparison usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '结构化基准与协议比较工作流。' },
        { label: '更适合', value: '想做长期可重复比较的研究者。' },
        { label: '比较重点', value: '重点比较基准清晰度、指标一致性和长期比较价值。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a benchmark-oriented research product rather than a generic market browser.',
      zh: '已按“基准导向的研究产品”而不是泛化市场浏览器来复核。',
    },
    trustNote: {
      en: 'This listing focuses on recurring protocol comparison, which is the most practical way to judge Token Terminal.',
      zh: '本条目聚焦重复性的协议比较，这也是判断 Token Terminal 最实用的方式。',
    },
  },
  {
    name: 'canva',
    title: 'Canva',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['design', 'presentation', 'visual-content', 'image-generation'],
    content: {
      en: 'A design platform with AI-assisted workflows for quick visuals, presentations, and marketing assets.',
      zh: '一个支持 AI 辅助快速视觉、演示和营销素材制作的设计平台。',
    },
    detail: {
      en: `Canva matters when the job is not only making something look good, but making it fast enough to ship across teams and channels. It sits at the intersection of design, presentation, and lightweight content operations, which is why it often becomes the default visual layer for non-designers too.

This page should help users decide whether Canva is the right all-purpose visual tool for their workflow or whether they need a more specialized creative product.`,
      zh: `当任务不只是“做得好看”，而是要足够快地在团队和渠道之间交付时，Canva 就会很有价值。它处在设计、演示和轻量内容运营的交界处，因此很多非设计人员也会把它当作默认视觉层使用。

这页要帮助用户判断：Canva 是否是适合自己工作流的通用视觉工具，还是更需要一款垂直更强的创意产品。`,
    },
    useCases: {
      en: ['Quick visuals', 'Presentations', 'Marketing assets', 'Lightweight design production'],
      zh: ['快速视觉素材', '演示文稿', '营销素材', '轻量设计生产'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Fast visual production across design, slides, and marketing assets.' },
        { label: 'Best for', value: 'Teams and solo users who need quick, publishable visuals without heavy design overhead.' },
        { label: 'Decision angle', value: 'Compare on speed, template depth, and cross-team usability.' },
      ],
      zh: [
        { label: '核心定位', value: '覆盖设计、幻灯片和营销素材的快速视觉生产。' },
        { label: '更适合', value: '需要快速产出可发布视觉内容、又不想承担重设计成本的团队和个人。' },
        { label: '比较重点', value: '重点比较速度、模板深度和跨团队可用性。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a fast visual production layer rather than a narrow design tool.',
      zh: '已按“快速视觉生产层”而不是窄设计工具来复核。',
    },
    trustNote: {
      en: 'This listing centers on everyday visual production, which is where Canva is most honestly judged.',
      zh: '本条目聚焦日常视觉生产，这也是 Canva 最值得被诚实判断的地方。',
    },
  },
  {
    name: 'adobe-firefly',
    title: 'Adobe Firefly',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['design', 'image-generation', 'visual-content'],
    content: {
      en: 'Adobe’s generative AI suite for creating and editing images, visuals, and branded creative assets.',
      zh: 'Adobe 的生成式 AI 套件，用于创建和编辑图像、视觉内容与品牌创意素材。',
    },
    detail: {
      en: `Adobe Firefly matters when creative work needs to fit into a more established design ecosystem rather than standing alone as a novelty generator. It is especially relevant for teams that already think in terms of brand assets, production files, and design handoff.

The practical decision is whether Firefly meaningfully fits your creative production stack or whether you are better served by a lighter, more experimental image generator. If design workflow integration matters, it deserves a serious comparison.`,
      zh: `当创意工作需要适配成熟设计生态，而不是只作为新鲜生成器存在时，Adobe Firefly 就会很有价值。它尤其适合已经习惯品牌素材、生产文件和设计交接流程的团队。

这里真正的判断点是：Firefly 是否足够融入你的创意生产栈，还是一个更轻、更实验性的图像生成器就够了。如果你在意设计工作流整合，它就值得认真比较。`,
    },
    useCases: {
      en: ['Brand visuals', 'Image generation', 'Creative asset editing', 'Design workflow support'],
      zh: ['品牌视觉', '图像生成', '创意素材编辑', '设计工作流支持'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Generative creative workflows that fit into a larger design stack.' },
        { label: 'Best for', value: 'Teams already working inside brand and production-oriented design systems.' },
        { label: 'Decision angle', value: 'Compare on ecosystem fit, image quality, and creative workflow integration.' },
      ],
      zh: [
        { label: '核心定位', value: '可融入更大设计栈的生成式创意工作流。' },
        { label: '更适合', value: '已经在品牌和生产型设计系统里工作的团队。' },
        { label: '比较重点', value: '重点比较生态适配、图像质量和创意工作流整合度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a design-ecosystem generative tool rather than a standalone image toy.',
      zh: '已按“设计生态内的生成工具”而不是独立图像玩具来复核。',
    },
    trustNote: {
      en: 'This page emphasizes workflow fit inside a real design stack, which is the practical question for Firefly.',
      zh: '本页强调它在真实设计栈中的工作流适配性，这也是 Firefly 最实际的判断方式。',
    },
  },
  {
    name: 'notta',
    title: 'Notta',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['meeting-notes', 'transcription', 'voice-ai'],
    content: {
      en: 'An AI transcription and note tool for meetings, interviews, and recordings that need quick summaries.',
      zh: '一个用于会议、访谈和录音的 AI 转录与笔记工具，适合快速摘要。',
    },
    detail: {
      en: `Notta is most useful when the job is to capture speech quickly and turn it into usable notes without a lot of manual cleanup. It sits in the meeting-notes space, but the real value is in reducing friction around transcription, summary, and re-use.

This page should help users decide whether Notta is the right note and transcript layer for recurring conversations or whether a more editing-heavy tool makes more sense.`,
      zh: `当任务是快速捕捉语音并转成可用笔记，而不想花很多人工清理时间时，Notta 就很有价值。它位于会议纪要这个类别里，但真正的价值在于降低转录、摘要和复用的摩擦。

这页要帮助用户判断：Notta 是否是适合重复对话场景的笔记和转录层，还是更偏编辑型的工具更合适。`,
    },
    useCases: {
      en: ['Meeting transcription', 'Interview notes', 'Audio summaries', 'Speech capture'],
      zh: ['会议转录', '访谈笔记', '音频摘要', '语音捕捉'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Fast transcription and usable note output for speech-heavy workflows.' },
        { label: 'Best for', value: 'Teams and individuals who need quick, reusable conversation records.' },
        { label: 'Decision angle', value: 'Compare on transcription quality, summary usefulness, and workflow convenience.' },
      ],
      zh: [
        { label: '核心定位', value: '为重语音工作流提供快速转录和可用笔记输出。' },
        { label: '更适合', value: '需要快速、可复用对话记录的团队和个人。' },
        { label: '比较重点', value: '重点比较转录质量、摘要实用性和工作流便利度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a transcription-and-notes layer rather than a broad productivity suite.',
      zh: '已按“转录与笔记层”而不是宽泛生产力套件来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on conversation capture and reuse, which is where Notta matters most.',
      zh: '本条目把比较重点放在对话捕捉和复用上，这也是 Notta 最重要的价值所在。',
    },
  },
  {
    name: 'deepgram',
    title: 'Deepgram',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['speech-to-text', 'transcription', 'voice-ai'],
    content: {
      en: 'A speech AI platform for transcription, voice intelligence, and developer-friendly audio workflows.',
      zh: '一个用于转录、语音智能和开发者友好音频工作流的 Speech AI 平台。',
    },
    detail: {
      en: `Deepgram is a strong choice when a team wants speech infrastructure that can plug into product workflows instead of just producing a one-off transcript. It matters for builders who need dependable transcription, audio understanding, and developer control.

The practical question is whether Deepgram is strong enough to become part of your product stack for speech-heavy features. If you are building call intelligence, transcription APIs, or audio-native workflows, it belongs in the comparison set.`,
      zh: `当团队需要能接入产品工作流的语音基础设施，而不只是一次性转录结果时，Deepgram 就很有价值。它适合那些需要稳定转录、音频理解和开发者控制力的构建者。

真正的问题是：Deepgram 是否足够强，能够进入你的产品栈，支撑重语音功能。如果你在做通话智能、转录 API 或音频原生工作流，它应该被放进比较集合。`,
    },
    useCases: {
      en: ['Transcription APIs', 'Call intelligence', 'Speech analytics', 'Audio product workflows'],
      zh: ['转录 API', '通话智能', '语音分析', '音频产品工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Developer-oriented speech infrastructure for production workflows.' },
        { label: 'Best for', value: 'Teams building products around transcription and audio intelligence.' },
        { label: 'Decision angle', value: 'Compare on transcription quality, developer fit, and production reliability.' },
      ],
      zh: [
        { label: '核心定位', value: '面向开发者的生产级语音基础设施。' },
        { label: '更适合', value: '围绕转录和音频智能构建产品的团队。' },
        { label: '比较重点', value: '重点比较转录质量、开发者适配度和生产可靠性。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as speech infrastructure rather than a simple transcription widget.',
      zh: '已按“语音基础设施”而不是简单转录小组件来复核。',
    },
    trustNote: {
      en: 'This listing focuses on whether speech infrastructure is strong enough for repeated product use, which is the real buying question.',
      zh: '本条目聚焦语音基础设施是否足够强，能不能支撑重复的产品使用，这才是真正的购买问题。',
    },
  },
  {
    name: 'murf',
    title: 'Murf',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['text-to-speech', 'voice-ai', 'audio-editing'],
    content: {
      en: 'An AI voice generation platform for narration, explainers, and polished text-to-speech output.',
      zh: '一个用于旁白、讲解内容和成品级文字转语音输出的 AI 语音生成平台。',
    },
    detail: {
      en: `Murf matters when the team needs clean voiceovers without building a full audio production pipeline. It fits creators and product teams who care about narration quality and want a straightforward way to generate usable spoken output.

This page should help users judge whether Murf is the right voiceover layer for explainers, demos, and educational content or whether another voice tool gives them better control.`,
      zh: `当团队需要干净的配音，而不想搭建完整音频生产管线时，Murf 就很有价值。它适合关心旁白质量、又希望快速生成可用语音输出的创作者和产品团队。

这页要帮助用户判断：Murf 是否适合作为讲解视频、演示和教育内容的配音层，还是其他语音工具能给出更好的控制能力。`,
    },
    useCases: {
      en: ['Narration', 'Explainer audio', 'Text-to-speech', 'Voice content production'],
      zh: ['旁白', '讲解音频', '文字转语音', '语音内容制作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Polished text-to-speech and narration output for content teams.' },
        { label: 'Best for', value: 'Creators and marketers shipping explainers, demos, and educational audio.' },
        { label: 'Decision angle', value: 'Compare on voice quality, control, and ease of producing publishable output.' },
      ],
      zh: [
        { label: '核心定位', value: '面向内容团队的成品级文字转语音和旁白输出。' },
        { label: '更适合', value: '制作讲解、演示和教育音频的创作者与营销人员。' },
        { label: '比较重点', value: '重点比较语音质量、控制能力和生成可发布结果的容易程度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a narration-focused voice tool rather than a generic audio app.',
      zh: '已按“旁白优先的语音工具”而不是通用音频应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on repeatable narration work, which is where Murf is best judged.',
      zh: '本条目把比较重点放在可重复的旁白工作上，这也是 Murf 最值得被判断的地方。',
    },
  },
  {
    name: 'descript',
    title: 'Descript',
    categorySlug: 'productivity',
    pricing: 'freemium',
    tags: ['audio-editing', 'video-editing', 'transcription'],
    content: {
      en: 'A collaborative audio and video editor with transcription and content-reuse workflows built in.',
      zh: '一个内置转录和内容复用工作流的协作式音视频编辑工具。',
    },
    detail: {
      en: `Descript matters when the workflow starts with spoken content and needs to end with something edited, clipped, and reusable. It is often compared by creators and teams that want transcripts to be an editing surface rather than a dead-end artifact.

This page should help users decide whether Descript shortens the path from raw conversation to publishable media enough to justify another production tool in the stack.`,
      zh: `当工作流从口头内容开始，并最终要变成可编辑、可剪辑、可复用的成果时，Descript 就很有价值。创作者和团队通常会在希望把转录直接变成编辑界面，而不是变成死掉的文本时比较它。

这页要帮助用户判断：Descript 是否足够明显地缩短了从原始对话到可发布媒体的路径，值得在工具栈里再加一层生产工具。`,
    },
    useCases: {
      en: ['Audio editing', 'Video editing', 'Transcript-based production', 'Content repurposing'],
      zh: ['音频编辑', '视频编辑', '基于转录的内容制作', '内容复用'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Transcript-first editing and reusable media production.' },
        { label: 'Best for', value: 'Teams turning interviews, calls, and spoken content into edited assets.' },
        { label: 'Decision angle', value: 'Compare on edit speed, workflow depth, and content reuse value.' },
      ],
      zh: [
        { label: '核心定位', value: '转录优先的编辑和可复用媒体生产。' },
        { label: '更适合', value: '把访谈、通话和口头内容转成编辑资产的团队。' },
        { label: '比较重点', value: '重点比较编辑速度、工作流深度和内容复用价值。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a transcript-to-production editor rather than a simple note helper.',
      zh: '已按“从转录到生产的编辑器”而不是简单笔记助手来复核。',
    },
    trustNote: {
      en: 'This listing focuses on production usefulness, which is the most honest way to judge Descript.',
      zh: '本条目聚焦内容生产实用性，这也是判断 Descript 最诚实的方式。',
    },
  },
  {
    name: 'heygen',
    title: 'HeyGen',
    categorySlug: 'design-art',
    pricing: 'paid',
    tags: ['video-generation', 'avatar-video', 'visual-content'],
    content: {
      en: 'An AI video platform focused on avatar-led videos, quick explainer clips, and scalable talking-head production.',
      zh: '一个专注于数字人视频、快速讲解短片和可规模化口播内容制作的 AI 视频平台。',
    },
    detail: {
      en: `HeyGen matters when the goal is not open-ended video editing, but fast production of presentable spokesperson-style content. It sits in a practical corner of the creative stack where teams care about turnaround time, repeatability, and how quickly an idea becomes a publishable clip.

The real decision is whether avatar-first video creation saves enough time to justify another paid creative tool. If the workflow includes explainers, landing-page videos, onboarding clips, or lightweight campaign content, it deserves a real comparison.`,
      zh: `当目标不是开放式视频剪辑，而是快速产出“能发布的讲解型内容”时，HeyGen 就很有代表性。它处在创意栈里一个很务实的位置，团队真正关心的是交付速度、可重复性，以及一个想法能多快变成可用视频。

这页真正要帮助用户判断的是：数字人优先的视频生成，是否足够节省时间，值得再引入一个付费创意工具。如果你的流程里有讲解视频、落地页视频、入门引导短片或轻量营销内容，它值得认真比较。`,
    },
    useCases: {
      en: ['Avatar-led explainers', 'Landing-page videos', 'Onboarding clips', 'Fast marketing content'],
      zh: ['数字人讲解视频', '落地页视频', '入门引导短片', '快速营销内容'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning scripts into presentable avatar-style videos with less production overhead.' },
        { label: 'Best for', value: 'Teams publishing repeat explainer or campaign videos at speed.' },
        { label: 'Decision angle', value: 'Compare on production speed, presentability, and repeat publishing fit.' },
      ],
      zh: [
        { label: '核心定位', value: '用更低制作成本把脚本快速转成可发布的数字人口播视频。' },
        { label: '更适合', value: '需要高频发布讲解或营销视频的团队。' },
        { label: '比较重点', value: '重点比较制作速度、成片观感和重复发布适配度。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a fast avatar-video production tool rather than a general editing suite.',
      zh: '已按“快速数字人视频生产工具”而不是通用剪辑套件来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison anchored on speed-to-publish and operational usefulness, where HeyGen is most often judged.',
      zh: '本条目把比较锚点放在发布速度和运营实用性上，这也是 HeyGen 最常被判断的地方。',
    },
  },
  {
    name: 'synthesia',
    title: 'Synthesia',
    categorySlug: 'design-art',
    pricing: 'paid',
    tags: ['video-generation', 'avatar-video', 'presentation'],
    content: {
      en: 'An AI video creation platform for training, presentations, and scalable internal communication.',
      zh: '一个用于培训、演示和可规模化内部沟通的 AI 视频创作平台。',
    },
    detail: {
      en: `Synthesia matters when video is part of a repeatable business communication system rather than an ad hoc creative experiment. It fits teams that need training content, internal explainers, and presentation-style video produced consistently.

The practical question is whether Synthesia helps you scale communication without adding a full production pipeline. If the need is corporate training, onboarding, or repetitive explainers, it deserves comparison as a workflow product.`,
      zh: `当视频是可重复的业务沟通系统的一部分，而不是临时创意实验时，Synthesia 就会更有价值。它适合需要稳定产出培训内容、内部讲解和演示式视频的团队。

真正的问题是：Synthesia 是否能帮助你在不建立完整制作管线的情况下扩大沟通产能。如果需求是企业培训、入职引导或重复性讲解，它应该按工作流产品来比较。`,
    },
    useCases: {
      en: ['Training videos', 'Internal communication', 'Presentation videos', 'Onboarding content'],
      zh: ['培训视频', '内部沟通', '演示式视频', '入职内容'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Scalable business video production for communication-heavy teams.' },
        { label: 'Best for', value: 'Teams producing training or internal videos repeatedly.' },
        { label: 'Decision angle', value: 'Compare on repeatability, communication fit, and production consistency.' },
      ],
      zh: [
        { label: '核心定位', value: '面向高沟通密度团队的可规模化商业视频生产。' },
        { label: '更适合', value: '需要反复制作培训或内部视频的团队。' },
        { label: '比较重点', value: '重点比较可重复性、沟通适配度和生产一致性。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as a repeatable video communication system rather than a one-off clip maker.',
      zh: '已按“可重复的视频沟通系统”而不是一次性短片工具来复核。',
    },
    trustNote: {
      en: 'This listing focuses on repeatable communication output, which is where Synthesia is most honestly judged.',
      zh: '本条目聚焦可重复的沟通输出，这也是 Synthesia 最值得被诚实判断的地方。',
    },
  },
  {
    name: 'luma-ai',
    title: 'Luma AI',
    categorySlug: 'design-art',
    pricing: 'freemium',
    tags: ['video-generation', '3d', 'visual-content'],
    content: {
      en: 'A creative AI platform for video generation, visual experimentation, and 3D-inspired content workflows.',
      zh: '一个用于视频生成、视觉实验和 3D 风格内容工作流的 AI 创意平台。',
    },
    detail: {
      en: `Luma AI becomes relevant when the team wants creative output that feels closer to experimentation, motion, and visual exploration than to traditional production. It gives users another option in the short-form and creative-concept part of the stack.

This page should help users judge whether Luma AI is useful as a motion-exploration tool or whether their workflow needs something with stricter production control.`,
      zh: `当团队希望输出更接近实验、动态和视觉探索，而不是传统制作时，Luma AI 就会更有意义。它为短内容和创意概念阶段提供了另一种选择。

这页要帮助用户判断：Luma AI 是否适合作为动态探索工具，还是他们的工作流更需要更严格的生产控制。`,
    },
    useCases: {
      en: ['Video generation', 'Visual experimentation', 'Motion concepts', '3D-inspired creative work'],
      zh: ['视频生成', '视觉实验', '动态概念', '3D 风格创意工作'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Creative motion and experimental visual generation.' },
        { label: 'Best for', value: 'Creators exploring short-form motion and visual concept ideas.' },
        { label: 'Decision angle', value: 'Compare on creative breadth, motion feel, and experimental usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '面向动态创意和视觉实验的生成能力。' },
        { label: '更适合', value: '探索短动态和视觉概念的创作者。' },
        { label: '比较重点', value: '重点比较创意广度、动态质感和实验用途。' },
      ],
    },
    editorialSummary: {
      en: 'Reviewed as an experimental motion and visual tool rather than a strict production platform.',
      zh: '已按“实验型动态与视觉工具”而不是严格生产平台来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on motion exploration and concept testing, which is where Luma AI fits best.',
      zh: '本条目把比较重点放在动态探索和概念测试上，这也是 Luma AI 最适合的位置。',
    },
  },
];

function loadLocalEnv() {
  const envText = fs.readFileSync('.env.local', 'utf8');

  envText.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eq = trimmed.indexOf('=');
    if (eq === -1) return;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function mergeTags(existing: unknown, next: string[]) {
  const existingTags = normalizeStringArray(existing);
  return Array.from(new Set([...existingTags, ...next]));
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

async function applySeed(seed: PriorityToolSeed, categoryIdMap: Map<string, string>, reviewedAt: string) {
  const pool = getPool();
  const categoryId = categoryIdMap.get(seed.categorySlug);

  if (!categoryId) {
    throw new Error(`Missing category: ${seed.categorySlug}`);
  }

  const existingResult = await pool.query('SELECT id, tags, features, use_cases FROM tools WHERE name = $1 LIMIT 1', [
    seed.name,
  ]);

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

  console.log('Enriching priority tool details...\n');
  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();

  const updatedCount = await PRIORITY_TOOLS.reduce(async (countPromise, seed) => {
    const count = await countPromise;
    const updated = await applySeed(seed, categoryIdMap, reviewedAt);
    return updated ? count + 1 : count;
  }, Promise.resolve(0));

  console.log(`\nDone. Updated ${updatedCount} priority tool detail entries.`);
  await getPool().end();
}

main().catch((error) => {
  console.error('\nFailed to enrich priority tool details:', error);
  process.exit(1);
});

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
  { slug: 'code-assistant', en: 'Code Assistant', zh: '代码助手' },
  { slug: 'developer-platform', en: 'Developer Platform', zh: '开发平台' },
  { slug: 'website-planning', en: 'Website Planning', zh: '网站规划' },
  { slug: 'keyword-research', en: 'Keyword Research', zh: '关键词研究' },
  { slug: 'on-chain-analytics', en: 'On-chain Analytics', zh: '链上分析' },
  { slug: 'defi-analytics', en: 'DeFi Analytics', zh: 'DeFi 分析' },
  { slug: 'data-infrastructure', en: 'Data Infrastructure', zh: '数据基础设施' },
  { slug: 'workflow-automation', en: 'Workflow Automation', zh: '工作流自动化' },
  { slug: 'meeting-notes', en: 'Meeting Notes', zh: '会议纪要' },
  { slug: 'image-generation', en: 'Image Generation', zh: '图像生成' },
  { slug: 'video-generation', en: 'Video Generation', zh: '视频生成' },
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

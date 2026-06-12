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
  categorySlug: 'automation' | 'developer-tools' | 'voice';
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
  { slug: 'workflow-automation', en: 'Workflow Automation', zh: '工作流自动化' },
  { slug: 'no-code', en: 'No-code', zh: '无代码' },
  { slug: 'agent-workflows', en: 'Agent Workflows', zh: 'Agent 工作流' },
  { slug: 'automation', en: 'Automation', zh: '自动化' },
  { slug: 'vector-database', en: 'Vector Database', zh: '向量数据库' },
  { slug: 'retrieval', en: 'Retrieval', zh: '检索' },
  { slug: 'observability', en: 'Observability', zh: '可观测性' },
  { slug: 'llmops', en: 'LLMOps', zh: 'LLMOps' },
  { slug: 'developer-tools', en: 'Developer Tools', zh: '开发者工具' },
  { slug: 'speech-to-text', en: 'Speech to Text', zh: '语音转文字' },
  { slug: 'text-to-speech', en: 'Text to Speech', zh: '文字转语音' },
  { slug: 'transcription', en: 'Transcription', zh: '转录' },
  { slug: 'voice-ai', en: 'Voice AI', zh: '语音 AI' },
  { slug: 'voice', en: 'Voice', zh: '语音' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'gumloop',
    title: 'Gumloop',
    url: 'https://www.gumloop.com',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['workflow-automation', 'agent-workflows', 'no-code'],
    content: {
      en: 'An AI-native workflow builder for assembling repeatable automations, research flows, and agent-style operations without heavy engineering overhead.',
      zh: '一个 AI 原生工作流构建器，适合在不增加大量工程负担的情况下搭建可复用自动化、研究流程和 Agent 式运营流程。',
    },
    detail: {
      en: `Gumloop is most useful when a team wants the speed of no-code automation but also wants the workflows to feel more AI-native than simple trigger chains. It fits especially well for founders and operators who need repeatable enrichment, routing, or research flows without building every step from scratch.

The real decision is whether Gumloop gives you enough workflow leverage to replace ad hoc manual operations. If the work involves research pipelines, lead enrichment, internal copilots, or low-friction automations, it deserves a serious comparison.`,
      zh: `当团队既想要无代码自动化的速度，又希望流程比普通触发器链路更“AI 原生”时，Gumloop 就会很有价值。它尤其适合创始人和运营团队，用来搭建可重复执行的补充信息、分发和研究流程，而不用把每一步都自己开发一遍。

这页真正要帮助用户判断的是：Gumloop 是否给了你足够多的流程杠杆，去替代零散的人工操作。如果你的工作涉及研究流水线、线索补全、内部 Copilot 或低摩擦自动化，它值得被认真比较。`,
    },
    useCases: {
      en: ['Research workflows', 'Lead enrichment', 'Agent pipelines', 'Operations automation'],
      zh: ['研究工作流', '线索补全', 'Agent 流水线', '运营自动化'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Building AI-native workflows that stay lightweight enough for operators and founders to ship quickly.' },
        { label: 'Best for', value: 'Teams replacing repetitive internal work with structured AI automation.' },
        { label: 'Decision angle', value: 'Compare on workflow flexibility, operator usability, and automation depth.' },
      ],
      zh: [
        { label: '核心定位', value: '构建 AI 原生工作流，同时保持足够轻量，方便运营者和创始人快速落地。' },
        { label: '更适合', value: '用结构化 AI 自动化替代重复内部工作的团队。' },
        { label: '比较重点', value: '重点比较工作流灵活性、运营可用性和自动化深度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Operators', 'Growth teams', 'Founders building internal automations'],
        zh: ['运营团队', '增长团队', '搭建内部自动化的创始人'],
      },
      notIdealFor: {
        en: ['Teams only needing one simple zap', 'Users wanting a pure developer SDK product'],
        zh: ['只需要单个简单触发器的团队', '只想找纯开发 SDK 产品的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an AI-native automation layer rather than a general no-code app catalog entry.',
      zh: '已按“AI 原生自动化层”而不是普通无代码目录条目来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on actual workflow leverage and operator usefulness, which is where Gumloop is most honestly judged.',
      zh: '本条目把比较重点放在真实流程杠杆和运营实用性上，这也是 Gumloop 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Workflow flexibility', 'Operator usability', 'Automation depth'],
        zh: ['工作流灵活性', '运营可用性', '自动化深度'],
      },
      officialSummary: {
        en: 'The official site is useful as a trust checkpoint, but the deeper question is whether the workflow model fits the jobs your team repeats every week.',
        zh: '官网适合作为信任检查点，但更深层的问题是：它的工作流模型是否适合你团队每周都在重复的那些任务。',
      },
      freshnessSummary: {
        en: 'Automation builders evolve quickly through templates and integrations, so exact coverage should always be checked live on the official site.',
        zh: '自动化构建器会随着模板和集成快速变化，所以具体覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing becomes easier to justify when the platform reliably removes repetitive operational effort every week.',
        zh: '只有当平台每周都能稳定减少重复运营工作时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the builder feels actionable rather than merely visual.',
        zh: '这里的预览很重要，因为用户需要判断这个构建器到底是可执行的，还是只是看起来很会画流程。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether operators actually return to it for repeated workflows instead of one-off experiments.',
        zh: '最强的信号，来自运营者是否真的反复回来跑这些工作流，而不只是偶尔试一次。',
      },
    },
    media: {
      category: 'Automation',
      accent: '#0891b2',
      accentSoft: '#cffafe',
      accentStrong: '#0e7490',
      surface: '#f4feff',
      badge: 'AI workflow builder',
      summary: 'Build repeatable AI automations for research, routing, and operations without heavy setup.',
      logoText: 'Gu',
    },
  },
  {
    name: 'pinecone',
    title: 'Pinecone',
    url: 'https://www.pinecone.io',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['vector-database', 'retrieval', 'developer-tools'],
    content: {
      en: 'A vector database platform used for retrieval, semantic search, memory layers, and production AI backends.',
      zh: '一个面向检索、语义搜索、记忆层和生产级 AI 后端的向量数据库平台。',
    },
    detail: {
      en: `Pinecone matters most after a team has moved beyond simple chat demos and into retrieval-heavy product work. It is not a discovery product for casual users; it is infrastructure for builders who need search, memory, and RAG systems to hold up under real product conditions.

The real decision is whether Pinecone is the right retrieval foundation for your stack. If the work involves semantic search, RAG, or production memory layers, it belongs near the top of the shortlist.`,
      zh: `当团队已经走出简单聊天 Demo，开始进入重检索的产品阶段时，Pinecone 才会真正重要。它不是给普通用户浏览体验的产品，而是为需要把搜索、记忆层和 RAG 系统带入真实业务环境的构建者准备的基础设施。

这页真正要帮助用户判断的是：Pinecone 是否是你技术栈里合适的检索底座。如果你的工作涉及语义搜索、RAG 或生产级记忆层，它就应该排在 shortlist 的前列。`,
    },
    useCases: {
      en: ['RAG pipelines', 'Semantic search', 'Agent memory', 'Production AI backends'],
      zh: ['RAG 流水线', '语义搜索', 'Agent 记忆层', '生产级 AI 后端'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Providing retrieval infrastructure for teams turning LLM prototypes into production systems.' },
        { label: 'Best for', value: 'Developers building search, memory, and retrieval-backed product experiences.' },
        { label: 'Decision angle', value: 'Compare on retrieval fit, production readiness, and backend leverage.' },
      ],
      zh: [
        { label: '核心定位', value: '为把 LLM 原型走向生产系统的团队提供检索基础设施。' },
        { label: '更适合', value: '构建搜索、记忆层和检索驱动产品体验的开发者。' },
        { label: '比较重点', value: '重点比较检索适配度、生产可用性和后端杠杆。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['AI backend engineers', 'RAG product teams', 'Developers building semantic search'],
        zh: ['AI 后端工程师', 'RAG 产品团队', '构建语义搜索的开发者'],
      },
      notIdealFor: {
        en: ['Users only comparing consumer AI apps', 'Teams with no retrieval or search layer'],
        zh: ['只是在比较消费级 AI 应用的用户', '没有检索或搜索层的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as retrieval infrastructure rather than a surface-level AI app.',
      zh: '已按“检索基础设施”而不是表层 AI 应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on retrieval usefulness and production fit, which is where Pinecone is most honestly judged.',
      zh: '本条目把比较重点放在检索实用性和生产适配上，这也是 Pinecone 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Retrieval fit', 'Production readiness', 'Backend leverage'],
        zh: ['检索适配度', '生产可用性', '后端杠杆'],
      },
      officialSummary: {
        en: 'The official site sets expectations, but the deeper question is whether Pinecone actually simplifies your retrieval architecture enough to matter.',
        zh: '官网可以帮助建立预期，但更深层的问题是：Pinecone 是否真的足够简化了你的检索架构。',
      },
      freshnessSummary: {
        en: 'Infra products evolve through APIs and deployment patterns, so exact capabilities should always be checked live on the official site.',
        zh: '基础设施产品会随着 API 和部署方式持续变化，所以具体能力始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when retrieval quality and developer time both improve meaningfully.',
        zh: '只有当检索质量和开发时间都得到明显改善时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because builders need to judge whether the platform feels infra-real, not marketing-heavy.',
        zh: '这里的预览很重要，因为构建者需要判断这个平台到底更像真实基础设施，还是更偏营销展示。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether teams actually keep it in production instead of only testing it during prototypes.',
        zh: '最强的信号，来自团队是否真的把它留在生产环境里，而不只是原型期试一试。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Retrieval infrastructure',
      summary: 'Power RAG, semantic search, and memory-heavy AI systems with a production-minded vector backend.',
      logoText: 'Pi',
    },
  },
  {
    name: 'langsmith',
    title: 'LangSmith',
    url: 'https://www.langchain.com/langsmith',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['observability', 'llmops', 'developer-tools'],
    content: {
      en: 'A tracing, evaluation, and debugging layer for LLM apps, agents, and prompt-driven workflows.',
      zh: '一个面向 LLM 应用、Agent 和 Prompt 驱动流程的追踪、评估与调试层。',
    },
    detail: {
      en: `LangSmith becomes relevant once prompts, chains, or agents stop being simple enough to debug by intuition. It helps teams inspect behavior, evaluate outputs, and understand why an AI workflow is reliable or unstable before users feel the damage.

The real decision is whether LangSmith makes your AI application easier to trust and improve. If the work involves tracing, evals, or agent debugging, it deserves a serious comparison.`,
      zh: `当 Prompt、Chain 或 Agent 已经复杂到无法只靠直觉排查问题时，LangSmith 就会变得重要。它帮助团队检查行为、评估输出，并在用户感受到问题之前理解一个 AI 工作流到底是可靠还是不稳定。

这页真正要帮助用户判断的是：LangSmith 是否让你的 AI 应用更容易被信任、被改进。如果你的工作涉及追踪、评测或 Agent 调试，它值得被认真比较。`,
    },
    useCases: {
      en: ['Agent debugging', 'Prompt tracing', 'LLM evaluation', 'Reliability workflows'],
      zh: ['Agent 调试', 'Prompt 追踪', 'LLM 评估', '可靠性工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams trace and evaluate LLM behavior before weak outputs become product problems.' },
        { label: 'Best for', value: 'Builders shipping agents, prompt systems, and multi-step LLM applications.' },
        { label: 'Decision angle', value: 'Compare on debugging clarity, evaluation support, and reliability insight.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队在低质量输出变成产品问题之前追踪和评估 LLM 行为。' },
        { label: '更适合', value: '正在交付 Agent、Prompt 系统和多步骤 LLM 应用的构建者。' },
        { label: '比较重点', value: '重点比较调试清晰度、评测支持和可靠性洞察。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['LLM product teams', 'Agent builders', 'Developers improving prompt reliability'],
        zh: ['LLM 产品团队', 'Agent 构建者', '提升 Prompt 可靠性的开发者'],
      },
      notIdealFor: {
        en: ['Users not shipping AI workflows', 'Teams with no need for tracing or evaluation'],
        zh: ['并未上线 AI 工作流的用户', '不需要追踪或评估的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an observability and evaluation layer, not as a general chat product.',
      zh: '已按“可观测性与评估层”而不是通用聊天产品来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on reliability and debugging value, which is where LangSmith is most honestly judged.',
      zh: '本条目把比较重点放在可靠性和调试价值上，这也是 LangSmith 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Debugging clarity', 'Evaluation support', 'Reliability insight'],
        zh: ['调试清晰度', '评估支持', '可靠性洞察'],
      },
      officialSummary: {
        en: 'The official site helps frame the product, but the deeper question is whether it reduces guesswork inside your team’s LLM workflow.',
        zh: '官网有助于理解产品定位，但更深层的问题是：它是否真的减少了你团队在 LLM 工作流里的猜测成本。',
      },
      freshnessSummary: {
        en: 'Observability tooling changes quickly with eval and agent patterns, so exact coverage should always be checked live on the official site.',
        zh: '可观测性工具会随着 eval 和 agent 模式快速变化，所以具体覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes sense when debugging time drops and model reliability improves in ways the team can actually feel.',
        zh: '只有当调试时间下降、模型可靠性提升到团队真实能感受到时，这类产品的价格才成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because developers need to judge whether the tracing surface feels actionable enough for real work.',
        zh: '这里的预览很重要，因为开发者需要判断这个追踪界面是否足够可执行，能进入真实工作。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether builders rely on it when outputs degrade, not just when they first set up the stack.',
        zh: '最强的信号，来自构建者是否会在输出退化时依赖它，而不只是在初次搭栈时看一眼。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#4f46e5',
      accentSoft: '#e0e7ff',
      accentStrong: '#4338ca',
      surface: '#f8faff',
      badge: 'Tracing and evals',
      summary: 'Inspect prompts, agents, and outputs with a more structured reliability and debugging workflow.',
      logoText: 'Ls',
    },
  },
  {
    name: 'murf',
    title: 'Murf',
    url: 'https://murf.ai',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['text-to-speech', 'voice-ai', 'voice'],
    content: {
      en: 'An AI voice generation platform for narration, explainers, demos, and polished spoken content.',
      zh: '一个面向旁白、讲解、演示和成品语音内容的 AI 配音平台。',
    },
    detail: {
      en: `Murf matters when a team wants usable voice output without turning every audio asset into a studio production task. It is more relevant as a polished narration and voice-content layer than as a generic AI novelty product.

The key decision is whether Murf gives you audio quality and workflow speed that feel publishable. If the work includes explainers, walkthroughs, product demos, or voice content, it deserves a real comparison.`,
      zh: `当团队希望得到可用的语音输出，但又不想把每段音频都变成一项录音棚任务时，Murf 就会有价值。与其说它是一个 AI 新奇产品，不如说它更像一层可交付的旁白与语音内容能力。

这页真正要帮助用户判断的是：Murf 是否同时给了你足够好的音频质量和足够快的流程速度。如果你的工作包括讲解、演示、产品 walkthrough 或语音内容，它值得被认真比较。`,
    },
    useCases: {
      en: ['Explainer audio', 'Product demos', 'Narration', 'Marketing voiceovers'],
      zh: ['讲解音频', '产品演示', '旁白', '营销配音'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning written scripts into polished spoken output quickly enough for repeated content work.' },
        { label: 'Best for', value: 'Creators and product teams producing narration, demos, and voice content.' },
        { label: 'Decision angle', value: 'Compare on output polish, workflow speed, and publishable quality.' },
      ],
      zh: [
        { label: '核心定位', value: '把文字脚本快速转成足够精致、可反复交付的语音内容。' },
        { label: '更适合', value: '制作旁白、演示和语音内容的创作者与产品团队。' },
        { label: '比较重点', value: '重点比较输出质感、流程速度和可发布质量。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Creators', 'Marketing teams', 'Product teams making demos'],
        zh: ['内容创作者', '营销团队', '制作演示的产品团队'],
      },
      notIdealFor: {
        en: ['Teams only needing raw transcription', 'Users not producing any spoken content'],
        zh: ['只需要原始转录的团队', '不制作任何语音内容的用户'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a publishable voice-content layer rather than a novelty text-to-speech demo.',
      zh: '已按“可发布语音内容层”而不是新奇 TTS Demo 来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on publishable voice quality and workflow speed, which is where Murf is most honestly judged.',
      zh: '本条目把比较重点放在可发布语音质量和流程速度上，这也是 Murf 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Output polish', 'Workflow speed', 'Publishable quality'],
        zh: ['输出质感', '流程速度', '可发布质量'],
      },
      officialSummary: {
        en: 'The official site helps frame the product, but the deeper question is whether the voice output is good enough for your real delivery standard.',
        zh: '官网有助于理解产品定位，但更深层的问题是：它的语音输出是否足够达到你真实交付标准。',
      },
      freshnessSummary: {
        en: 'Voice tools evolve through models and templates, so exact voice coverage should always be checked live on the official site.',
        zh: '语音工具会随着模型和模板持续演进，所以具体语音覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing becomes easier to justify when the platform replaces repeated manual voice production effort.',
        zh: '只有当平台能稳定替代反复的人工作业时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the voice-content workflow looks polished enough for real publishing.',
        zh: '这里的预览很重要，因为用户需要判断这个语音内容流程是否足够精致，能进入真实发布。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether creators actually keep using it for repeated production cycles.',
        zh: '最强的信号，来自创作者是否真的会在一轮又一轮内容生产里继续使用它。',
      },
    },
    media: {
      category: 'Voice',
      accent: '#db2777',
      accentSoft: '#fce7f3',
      accentStrong: '#be185d',
      surface: '#fff7fb',
      badge: 'Narration and voiceover',
      summary: 'Create polished AI voice output for demos, explainers, and spoken content workflows.',
      logoText: 'Mu',
    },
  },
  {
    name: 'deepgram',
    title: 'Deepgram',
    url: 'https://deepgram.com',
    categorySlug: 'voice',
    pricing: 'freemium',
    tags: ['speech-to-text', 'transcription', 'voice-ai'],
    content: {
      en: 'A speech AI platform for transcription, speech understanding, audio intelligence, and voice-first product workflows.',
      zh: '一个面向转录、语音理解、音频智能和语音产品工作流的 Speech AI 平台。',
    },
    detail: {
      en: `Deepgram is strongest when a product team is building around real audio input instead of treating voice as a side feature. It fits especially well for transcription, speech analytics, and voice-native product surfaces where raw audio needs to become structured product value.

The real decision is whether Deepgram improves the speed and quality of audio understanding enough to matter in production. If the work involves transcription APIs, call intelligence, or speech-driven apps, it belongs in the shortlist.`,
      zh: `当产品团队真正围绕音频输入构建能力，而不是把语音当成附属功能时，Deepgram 才会最强。它尤其适合转录、语音分析和语音原生产品表面，帮助把原始音频转成结构化的产品价值。

这页真正要帮助用户判断的是：Deepgram 是否足够提升音频理解的速度和质量，值得进入生产环境。如果你的工作涉及转录 API、通话智能或语音驱动应用，它就应该进入 shortlist。`,
    },
    useCases: {
      en: ['Transcription APIs', 'Call analytics', 'Speech products', 'Audio intelligence'],
      zh: ['转录 API', '通话分析', '语音产品', '音频智能'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Turning audio into structured product signals through speech-to-text and voice intelligence workflows.' },
        { label: 'Best for', value: 'Teams building voice-native features, analytics, and transcription-heavy products.' },
        { label: 'Decision angle', value: 'Compare on transcription usefulness, audio intelligence depth, and product readiness.' },
      ],
      zh: [
        { label: '核心定位', value: '通过语音转文字和语音智能工作流，把音频转成结构化产品信号。' },
        { label: '更适合', value: '构建语音原生功能、分析能力和重转录产品的团队。' },
        { label: '比较重点', value: '重点比较转录实用性、音频智能深度和产品就绪度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Voice product teams', 'Developers building transcription workflows', 'Audio analytics teams'],
        zh: ['语音产品团队', '构建转录流程的开发者', '音频分析团队'],
      },
      notIdealFor: {
        en: ['Users only needing AI narration', 'Teams with no audio input in their workflows'],
        zh: ['只需要 AI 配音的用户', '工作流里没有音频输入的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a voice-intelligence and transcription layer rather than a generic voice demo.',
      zh: '已按“语音智能与转录层”而不是泛化语音 Demo 来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on production audio understanding, which is where Deepgram is most honestly judged.',
      zh: '本条目把比较重点放在生产级音频理解上，这也是 Deepgram 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Transcription usefulness', 'Audio intelligence depth', 'Product readiness'],
        zh: ['转录实用性', '音频智能深度', '产品就绪度'],
      },
      officialSummary: {
        en: 'The official site gives the positioning, but the deeper question is whether Deepgram helps you convert audio into product value reliably enough.',
        zh: '官网可以帮助理解定位，但更深层的问题是：Deepgram 是否足够稳定地把音频转成产品价值。',
      },
      freshnessSummary: {
        en: 'Speech tooling evolves quickly with models and APIs, so exact capability coverage should always be checked live on the official site.',
        zh: '语音工具会随着模型和 API 快速演进，所以具体能力覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing makes the most sense when transcription and audio intelligence reduce repeated product or support effort.',
        zh: '只有当转录和音频智能稳定减少重复产品或支持成本时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the product feels like real audio infrastructure, not a superficial voice feature.',
        zh: '这里的预览很重要，因为用户需要判断这个产品更像真实音频基础设施，而不是表层语音功能。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether builders keep it in the stack once audio moves from experiment to real workflow.',
        zh: '最强的信号，来自构建者是否会在音频从实验走向真实流程后，继续把它留在栈里。',
      },
    },
    media: {
      category: 'Voice',
      accent: '#ea580c',
      accentSoft: '#ffedd5',
      accentStrong: '#c2410c',
      surface: '#fffaf5',
      badge: 'Speech intelligence',
      summary: 'Use transcription and audio intelligence to build more serious speech-driven product workflows.',
      logoText: 'Dg',
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

  console.log(`\nDone. Updated ${updatedCount} automation/developer/voice entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich automation/voice wave 13:', error);
  await closePool();
  process.exit(1);
});

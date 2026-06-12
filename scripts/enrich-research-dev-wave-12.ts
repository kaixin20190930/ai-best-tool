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
  categorySlug: 'research' | 'developer-tools';
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
  { slug: 'model-hub', en: 'Model Hub', zh: '模型仓库' },
  { slug: 'dataset-discovery', en: 'Dataset Discovery', zh: '数据集发现' },
  { slug: 'open-source-ai', en: 'Open-source AI', zh: '开源 AI' },
  { slug: 'inference-api', en: 'Inference API', zh: '推理 API' },
  { slug: 'model-deployment', en: 'Model Deployment', zh: '模型部署' },
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'paper-discovery', en: 'Paper Discovery', zh: '论文发现' },
  { slug: 'benchmarking', en: 'Benchmarking', zh: '基准比较' },
  { slug: 'literature-review', en: 'Literature Review', zh: '文献综述' },
  { slug: 'academic-research', en: 'Academic Research', zh: '学术研究' },
  { slug: 'competition', en: 'Competition', zh: '竞赛' },
  { slug: 'notebooks', en: 'Notebooks', zh: 'Notebook' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'hugging-face',
    title: 'Hugging Face',
    url: 'https://huggingface.co',
    categorySlug: 'research',
    pricing: 'freemium',
    tags: ['model-hub', 'dataset-discovery', 'open-source-ai'],
    content: {
      en: 'A model and dataset platform for discovering open-source AI assets, demos, and community-built research resources.',
      zh: '一个用于发现开源 AI 模型、数据集、演示和社区研究资源的平台。',
    },
    detail: {
      en: `Hugging Face matters because a lot of serious AI exploration does not start with a polished app. It starts with model discovery, dataset inspection, demos, papers, and open-source assets. That makes Hugging Face more useful as a research surface than as a typical end-user tool.

The real decision is whether you need a place to explore the broader model ecosystem rather than just use one product. If the job involves comparing models, following open-source movement, or finding research-adjacent assets, it belongs near the top of the shortlist.`,
      zh: `Hugging Face 之所以重要，是因为很多真正的 AI 探索并不是从一个精致成品开始，而是从模型发现、数据集查看、Demo、论文和开源资产开始。因此它更像一个研究入口，而不是传统终端用户工具。

这页真正要帮助用户判断的是：你是否需要一个进入更大模型生态的入口，而不只是使用某一个产品。如果你的工作涉及比较模型、跟踪开源趋势或寻找研究相关资产，它就应该在 shortlist 的前列。`,
    },
    useCases: {
      en: ['Model discovery', 'Dataset browsing', 'Open-source research', 'AI ecosystem exploration'],
      zh: ['模型发现', '数据集浏览', '开源研究', 'AI 生态探索'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users discover models, datasets, demos, and open-source AI building blocks.' },
        { label: 'Best for', value: 'Researchers, builders, and technical users exploring the wider AI ecosystem.' },
        { label: 'Decision angle', value: 'Compare on discovery depth, ecosystem breadth, and research usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户发现模型、数据集、Demo 和开源 AI 组件。' },
        { label: '更适合', value: '在探索更大 AI 生态的研究者、构建者和技术用户。' },
        { label: '比较重点', value: '重点比较发现深度、生态广度和研究实用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Model researchers', 'AI builders', 'Technical users exploring open-source AI'],
        zh: ['模型研究者', 'AI 构建者', '探索开源 AI 的技术用户'],
      },
      notIdealFor: {
        en: ['Users only wanting a polished consumer app', 'Teams looking for one opinionated workflow product'],
        zh: ['只想找成熟消费级产品的用户', '在寻找单一强流程产品的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a research and model-discovery layer rather than a consumer-facing AI app.',
      zh: '已按“研究与模型发现层”而不是消费级 AI 应用来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on ecosystem discovery and research value, which is where Hugging Face is most honestly judged.',
      zh: '本条目把比较重点放在生态发现和研究价值上，这也是 Hugging Face 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Discovery depth', 'Ecosystem breadth', 'Research usefulness'],
        zh: ['发现深度', '生态广度', '研究实用性'],
      },
      officialSummary: {
        en: 'The official site is itself a major part of the product, but the deeper question is whether it actually helps you navigate the model ecosystem faster.',
        zh: '官网本身就是产品的重要组成，但更深层的问题是：它是否真的帮助你更快理解和导航模型生态。',
      },
      freshnessSummary: {
        en: 'Open-source ecosystems change fast, so the exact coverage and momentum should always be checked live on the official site.',
        zh: '开源生态变化很快，所以具体覆盖和活跃度始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'The pricing question usually matters only when platform depth and hosted tooling become part of repeated research or development work.',
        zh: '只有当平台深度和托管工具进入重复性的研究或开发工作时，定价问题才真正重要。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the interface supports real discovery instead of just looking busy.',
        zh: '这里的预览很重要，因为用户需要判断这个界面是否真正支持发现工作，而不只是信息看起来很多。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether users actually return to it for model discovery and research, not just for one-off browsing.',
        zh: '最强的信号，来自用户是否真的反复回来做模型发现和研究，而不只是偶尔浏览一下。',
      },
    },
    media: {
      category: 'Research',
      accent: '#f59e0b',
      accentSoft: '#fef3c7',
      accentStrong: '#d97706',
      surface: '#fffaf0',
      badge: 'Open model discovery',
      summary: 'Explore models, datasets, demos, and the broader open-source AI ecosystem in one place.',
      logoText: 'Hf',
    },
  },
  {
    name: 'replicate',
    title: 'Replicate',
    url: 'https://replicate.com',
    categorySlug: 'developer-tools',
    pricing: 'paid',
    tags: ['inference-api', 'model-deployment', 'open-source-ai'],
    content: {
      en: 'A developer platform for running and integrating machine learning models through hosted APIs and practical deployment workflows.',
      zh: '一个帮助开发者通过托管 API 和实际部署流程运行、集成机器学习模型的平台。',
    },
    detail: {
      en: `Replicate is most relevant when the job moves from exploring models to actually using them in products and workflows. It matters less as a research browsing layer and more as an execution tool for teams that want model access without building the full serving stack themselves.

The real decision is whether Replicate reduces enough infra friction to justify becoming part of the stack. If the work involves shipping model-powered features, prototyping fast, or testing multiple models operationally, it deserves a serious comparison.`,
      zh: `当工作从“看模型”走向“把模型用进产品和流程”时，Replicate 就会更有价值。它不像研究浏览层，更像一个执行工具，适合那些想使用模型，但不想自己搭完整服务栈的团队。

这页真正要帮助用户判断的是：Replicate 是否足够减少基础设施摩擦，值得进入工具栈。如果你的工作涉及上线模型能力、快速原型或在业务里测试多个模型，它值得被认真比较。`,
    },
    useCases: {
      en: ['Inference APIs', 'Model-backed product features', 'Rapid prototyping', 'Operational model testing'],
      zh: ['推理 API', '模型驱动产品功能', '快速原型', '运营化模型测试'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping teams use and ship model capabilities without owning the entire serving stack.' },
        { label: 'Best for', value: 'Developers and product teams operationalizing models quickly.' },
        { label: 'Decision angle', value: 'Compare on deployment convenience, API usefulness, and speed-to-integration.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助团队在不自建完整服务栈的前提下使用并上线模型能力。' },
        { label: '更适合', value: '需要快速把模型能力投入业务的开发者和产品团队。' },
        { label: '比较重点', value: '重点比较部署便利性、API 实用性和集成速度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Developers shipping AI features', 'Prototype teams', 'Builders comparing model integration paths'],
        zh: ['上线 AI 功能的开发者', '原型团队', '比较模型接入路径的构建者'],
      },
      notIdealFor: {
        en: ['Users only doing high-level research browsing', 'Teams that never integrate model outputs into products'],
        zh: ['只做高层研究浏览的用户', '从不把模型输出接入产品的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an execution and integration layer rather than a model-discovery website.',
      zh: '已按“执行与集成层”而不是模型发现网站来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on deployment friction and developer usefulness, which is where Replicate is most honestly judged.',
      zh: '本条目把比较重点放在部署摩擦和开发者实用性上，这也是 Replicate 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Deployment convenience', 'API usefulness', 'Speed-to-integration'],
        zh: ['部署便利性', 'API 实用性', '集成速度'],
      },
      officialSummary: {
        en: 'The official site is the best trust checkpoint, but the deeper question is whether it shortens the path from model idea to working product behavior.',
        zh: '官网是最好的信任检查点，但更深层的问题是：它是否缩短了“模型想法 -> 产品可用能力”的路径。',
      },
      freshnessSummary: {
        en: 'Model-serving platforms evolve quickly through coverage and APIs, so exact capabilities should always be checked on the official site.',
        zh: '模型服务平台会随着覆盖范围和 API 快速变化，所以具体能力始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'The price becomes easier to justify when hosted model execution saves real engineering time every week.',
        zh: '只有当托管模型执行每周都在真实节省工程时间时，这类产品的价格才更容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because developers need to judge whether the platform feels practical and API-first rather than marketing-first.',
        zh: '这里的预览很重要，因为开发者需要判断这个平台到底更偏实用 API，还是更偏营销包装。',
      },
      communitySummary: {
        en: 'The strongest signal comes from builders explaining whether Replicate actually made shipping models faster and easier.',
        zh: '最强的信号，来自构建者是否说明 Replicate 真的让模型上线更快、更轻松。',
      },
    },
    media: {
      category: 'Developer Tools',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      accentStrong: '#1d4ed8',
      surface: '#f7fbff',
      badge: 'Model deployment layer',
      summary: 'Run, integrate, and operationalize models faster without owning the full infra stack.',
      logoText: 'Rp',
    },
  },
  {
    name: 'papers-with-code',
    title: 'Papers with Code',
    url: 'https://paperswithcode.com',
    categorySlug: 'research',
    pricing: 'free',
    tags: ['paper-discovery', 'benchmarking', 'open-source-ai'],
    content: {
      en: 'A research platform that connects papers, code implementations, and benchmarks so users can move from reading to reproducibility faster.',
      zh: '一个把论文、代码实现和基准测试连接起来的研究平台，帮助用户更快从阅读走向可复现。',
    },
    detail: {
      en: `Papers with Code matters because research value increases a lot when papers are not isolated from implementations and benchmarks. It is useful for users who care about reproducibility, model comparison, and following progress beyond abstracts alone.

The real decision is whether the product helps you go from paper discovery to practical research follow-through. If the job involves comparing methods, checking code availability, or grounding research in benchmarks, it belongs in the shortlist.`,
      zh: `Papers with Code 之所以重要，是因为当论文不再和实现代码、基准测试割裂时，研究价值会大很多。它适合那些关心可复现性、模型比较和不只停留在摘要层面的人。

这页真正要帮助用户判断的是：它是否帮助你从发现论文走向真正跟进研究。如果你的工作涉及比较方法、确认代码是否可用，或把研究落在 benchmark 上，它就应该进入 shortlist。`,
    },
    useCases: {
      en: ['Paper discovery', 'Benchmark comparison', 'Code availability checks', 'Reproducibility research'],
      zh: ['论文发现', 'Benchmark 对比', '代码可用性检查', '可复现研究'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Connecting papers with code and benchmarks so research becomes more actionable.' },
        { label: 'Best for', value: 'Researchers and technical users comparing methods, results, and implementations.' },
        { label: 'Decision angle', value: 'Compare on reproducibility, paper-to-code flow, and benchmark usefulness.' },
      ],
      zh: [
        { label: '核心定位', value: '把论文、代码和基准连接起来，让研究更可执行。' },
        { label: '更适合', value: '比较方法、结果和实现的研究者与技术用户。' },
        { label: '比较重点', value: '重点比较可复现性、论文到代码流程和 benchmark 实用性。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['ML researchers', 'Graduate students', 'Technical evaluators comparing methods'],
        zh: ['机器学习研究者', '研究生', '比较方法的技术评估者'],
      },
      notIdealFor: {
        en: ['Users only wanting casual AI news browsing', 'Teams that never touch papers or code implementations'],
        zh: ['只想随便浏览 AI 资讯的用户', '从不接触论文和代码实现的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a reproducibility and benchmark layer rather than a plain paper index.',
      zh: '已按“可复现与 benchmark 层”而不是普通论文索引来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on research follow-through and reproducibility, which is where Papers with Code is most honestly judged.',
      zh: '本条目把比较重点放在研究跟进和可复现性上，这也是 Papers with Code 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Reproducibility', 'Paper-to-code flow', 'Benchmark usefulness'],
        zh: ['可复现性', '论文到代码流程', 'Benchmark 实用性'],
      },
      officialSummary: {
        en: 'The official site is the product, but the deeper question is whether it helps you move beyond reading into real evaluation and follow-through.',
        zh: '官网本身就是产品，但更深层的问题是：它是否帮助你从阅读走向真实评估与跟进。',
      },
      freshnessSummary: {
        en: 'Research indexes evolve continuously, so exact benchmark and implementation coverage should always be checked live on the official site.',
        zh: '研究索引会持续变化，所以具体 benchmark 和实现覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is less important here than whether the platform actually saves research time and clarifies what is reproducible.',
        zh: '这里定价不是最关键，真正重要的是它是否节省研究时间，并帮助澄清哪些内容可复现。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the information layout supports comparison instead of just listing links.',
        zh: '这里的预览很重要，因为用户需要判断信息结构是否真的支持比较，而不只是堆链接。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether researchers actually rely on it when deciding what to read, compare, and reproduce.',
        zh: '最强的信号，来自研究者是否真的依赖它来决定读什么、比什么、复现什么。',
      },
    },
    media: {
      category: 'Research',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      accentStrong: '#0f766e',
      surface: '#f4fffd',
      badge: 'Paper to code',
      summary: 'Connect papers, implementations, and benchmarks so research becomes easier to verify and compare.',
      logoText: 'Pw',
    },
  },
  {
    name: 'elicit',
    title: 'Elicit',
    url: 'https://elicit.com',
    categorySlug: 'research',
    pricing: 'freemium',
    tags: ['literature-review', 'academic-research', 'research'],
    content: {
      en: 'An AI research assistant designed for literature review, evidence gathering, and structured academic discovery.',
      zh: '一个面向文献综述、证据搜集和结构化学术发现的 AI 研究助手。',
    },
    detail: {
      en: `Elicit matters when users need more than chat answers and want help with evidence, papers, and structured review workflows. It belongs in a research-specific comparison set because the real value is not generic generation, but narrowing questions, locating sources, and summarizing findings more systematically.

The key decision is whether Elicit speeds up evidence-driven work enough to justify becoming a research habit. If the job involves literature review, source gathering, or academic exploration, it deserves a serious comparison.`,
      zh: `当用户需要的不只是聊天式回答，而是围绕证据、论文和结构化综述流程的帮助时，Elicit 就会更有意义。它应该进入专门的研究工具比较集合，因为它真正的价值不在于通用生成，而在于更系统地缩小问题、定位来源和整理发现。

这页真正要帮助用户判断的是：Elicit 是否足够明显地加速了证据驱动型工作，值得成为研究习惯的一部分。如果你的工作涉及文献综述、来源搜集或学术探索，它值得被认真比较。`,
    },
    useCases: {
      en: ['Literature review', 'Evidence gathering', 'Source discovery', 'Academic exploration'],
      zh: ['文献综述', '证据搜集', '来源发现', '学术探索'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Helping users structure research questions and gather evidence more systematically.' },
        { label: 'Best for', value: 'Researchers and students doing literature review or source-heavy analysis.' },
        { label: 'Decision angle', value: 'Compare on evidence quality, review speed, and research workflow fit.' },
      ],
      zh: [
        { label: '核心定位', value: '帮助用户更系统地组织研究问题和搜集证据。' },
        { label: '更适合', value: '做文献综述或重来源分析的研究者和学生。' },
        { label: '比较重点', value: '重点比较证据质量、综述速度和研究流程适配。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Academic researchers', 'Students', 'Analysts doing source-heavy work'],
        zh: ['学术研究者', '学生', '做重来源分析的分析师'],
      },
      notIdealFor: {
        en: ['Users only wanting casual brainstorming chat', 'Teams focused purely on product execution tools'],
        zh: ['只想做轻度脑暴聊天的用户', '只关注产品执行工具的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an evidence-first research assistant rather than a general-purpose chatbot.',
      zh: '已按“证据优先的研究助手”而不是通用聊天机器人来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on literature review and evidence usefulness, which is where Elicit is most honestly judged.',
      zh: '本条目把比较重点放在文献综述和证据实用性上，这也是 Elicit 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Evidence quality', 'Review speed', 'Research workflow fit'],
        zh: ['证据质量', '综述速度', '研究流程适配'],
      },
      officialSummary: {
        en: 'The official site is a trust checkpoint, but the deeper question is whether Elicit actually improves the quality and speed of evidence-driven work.',
        zh: '官网是信任检查点，但更深层的问题是：Elicit 是否真的提升了证据驱动型工作的质量和速度。',
      },
      freshnessSummary: {
        en: 'Research assistants evolve through retrieval and workflow changes, so exact behavior should still be checked on the official site.',
        zh: '研究助手会随着检索和流程变化而演进，所以具体行为仍建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'The price is easiest to justify when source-heavy work is repeated often enough to turn saved time into real value.',
        zh: '只有当重来源工作足够频繁，节省下来的时间能转成真实价值时，这类产品的价格才最容易成立。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the answer-and-source layout feels trustworthy enough for real research.',
        zh: '这里的预览很重要，因为用户需要判断答案和来源布局是否足够可信，能进入真实研究。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether users actually trust it for literature review and source gathering rather than one-off curiosity.',
        zh: '最强的信号，来自用户是否真的把它用于文献综述和来源搜集，而不只是偶尔尝鲜。',
      },
    },
    media: {
      category: 'Research',
      accent: '#7c3aed',
      accentSoft: '#ede9fe',
      accentStrong: '#6d28d9',
      surface: '#faf8ff',
      badge: 'Evidence-first research',
      summary: 'Support literature review, source discovery, and research questions with a more structured workflow.',
      logoText: 'El',
    },
  },
  {
    name: 'kaggle',
    title: 'Kaggle',
    url: 'https://www.kaggle.com',
    categorySlug: 'research',
    pricing: 'free',
    tags: ['dataset-discovery', 'competition', 'notebooks'],
    content: {
      en: 'A data-science platform for datasets, notebooks, competitions, and collaborative experimentation.',
      zh: '一个面向数据科学的协作平台，提供数据集、Notebook、竞赛和实验空间。',
    },
    detail: {
      en: `Kaggle matters because a lot of practical ML learning and experimentation happens around datasets, notebooks, and competitions rather than formal product interfaces. It is less a polished AI app and more a working environment for exploring data and applied ML.

The key decision is whether Kaggle fits your learning or experimentation loop strongly enough to become a regular place to discover datasets and test ideas. If the job includes hands-on analysis, competitions, or reusable notebooks, it deserves a real comparison.`,
      zh: `Kaggle 之所以重要，是因为很多实用型机器学习学习和实验，发生在数据集、Notebook 和竞赛环境里，而不是标准产品界面里。它不像一个精致 AI 成品，更像一个探索数据和应用型 ML 的工作环境。

这页真正要帮助用户判断的是：Kaggle 是否足够适合你的学习或实验循环，值得成为经常回来找数据和测试想法的地方。如果你的工作涉及动手分析、竞赛或可复用 Notebook，它值得被认真比较。`,
    },
    useCases: {
      en: ['Dataset discovery', 'Notebook experiments', 'ML competitions', 'Hands-on analysis'],
      zh: ['数据集发现', 'Notebook 实验', '机器学习竞赛', '动手分析'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Giving users a practical environment for data exploration, experimentation, and ML learning.' },
        { label: 'Best for', value: 'Learners, analysts, and technical users who want to work directly with data and notebooks.' },
        { label: 'Decision angle', value: 'Compare on dataset usefulness, experimentation flow, and hands-on learning value.' },
      ],
      zh: [
        { label: '核心定位', value: '为用户提供一个进行数据探索、实验和机器学习学习的实用环境。' },
        { label: '更适合', value: '想直接处理数据和 Notebook 的学习者、分析师和技术用户。' },
        { label: '比较重点', value: '重点比较数据集实用性、实验流程和动手学习价值。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Data scientists', 'Students learning ML', 'Analysts experimenting with datasets'],
        zh: ['数据科学家', '学习 ML 的学生', '用数据集做实验的分析师'],
      },
      notIdealFor: {
        en: ['Users only wanting a no-effort consumer AI app', 'Teams that never touch data or experiments directly'],
        zh: ['只想找零门槛消费级 AI 应用的用户', '从不直接接触数据和实验的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a data-and-experimentation environment rather than a typical AI product directory entry.',
      zh: '已按“数据与实验环境”而不是典型 AI 产品条目来复核。',
    },
    trustNote: {
      en: 'This listing keeps the comparison centered on hands-on learning and data usefulness, which is where Kaggle is most honestly judged.',
      zh: '本条目把比较重点放在动手学习和数据实用性上，这也是 Kaggle 最值得被诚实判断的地方。',
    },
    decision: {
      compareAxes: {
        en: ['Dataset usefulness', 'Experimentation flow', 'Hands-on learning value'],
        zh: ['数据集实用性', '实验流程', '动手学习价值'],
      },
      officialSummary: {
        en: 'The official site is the core product, but the deeper question is whether it truly supports your experimentation and learning loop.',
        zh: '官网本身就是核心产品，但更深层的问题是：它是否真的支持你的实验和学习循环。',
      },
      freshnessSummary: {
        en: 'Dataset and competition ecosystems shift continuously, so exact coverage should always be checked live on the official site.',
        zh: '数据集和竞赛生态会持续变化，所以具体覆盖始终建议以官网实时状态为准。',
      },
      pricingSummary: {
        en: 'Pricing is secondary here; the main value question is whether Kaggle gives you enough practical surface for repeated experimentation.',
        zh: '这里定价是次要的，真正关键的是 Kaggle 是否提供了足够多的实用表面来支持重复实验。',
      },
      mediaSummary: {
        en: 'Preview coverage matters because users need to judge whether the environment feels workable for real notebooks and datasets.',
        zh: '这里的预览很重要，因为用户需要判断这个环境是否真的适合 Notebook 和数据集工作。',
      },
      communitySummary: {
        en: 'The strongest signal comes from whether users actually return for datasets, competitions, and experiments instead of just profile browsing.',
        zh: '最强的信号，来自用户是否真的回来做数据集、竞赛和实验，而不只是看看资料页。',
      },
    },
    media: {
      category: 'Research',
      accent: '#0ea5e9',
      accentSoft: '#e0f2fe',
      accentStrong: '#0284c7',
      surface: '#f4fbff',
      badge: 'Data experimentation',
      summary: 'Work with datasets, notebooks, and competitions in a more hands-on ML environment.',
      logoText: 'Kg',
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

  console.log(`\nDone. Updated ${updatedCount} research/developer entries.`);
  await closePool();
}

main().catch(async (error) => {
  console.error('\nFailed to enrich research/dev wave 12:', error);
  await closePool();
  process.exit(1);
});

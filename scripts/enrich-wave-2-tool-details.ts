/* eslint-disable no-console */
import fs from 'node:fs';
import { getPool } from '@/db/neon/client';

type LocalizedFeatureEntry = {
  label: string;
  value: string;
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
  useCases: {
    en: string[];
    zh: string[];
  };
  features: {
    en: LocalizedFeatureEntry[];
    zh: LocalizedFeatureEntry[];
  };
  audience: {
    bestFit: {
      en: string[];
      zh: string[];
    };
    notIdealFor: {
      en: string[];
      zh: string[];
    };
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
  { slug: 'research', en: 'Research', zh: '研究' },
  { slug: 'search', en: 'Search', zh: '搜索' },
  { slug: 'evidence', en: 'Evidence', zh: '证据' },
  { slug: 'academic', en: 'Academic', zh: '学术' },
  { slug: 'notes', en: 'Notes', zh: '笔记' },
  { slug: 'summarization', en: 'Summarization', zh: '总结' },
  { slug: 'knowledge', en: 'Knowledge', zh: '知识' },
  { slug: 'developer-tools', en: 'Developer Tools', zh: '开发者工具' },
  { slug: 'observability', en: 'Observability', zh: '可观测性' },
  { slug: 'llm', en: 'LLM', zh: '大模型' },
  { slug: 'api', en: 'API', zh: 'API' },
  { slug: 'gateway', en: 'Gateway', zh: '网关' },
  { slug: 'routing', en: 'Routing', zh: '路由' },
  { slug: 'cost-control', en: 'Cost Control', zh: '成本控制' },
  { slug: 'automation', en: 'Automation', zh: '自动化' },
  { slug: 'agents', en: 'Agents', zh: '智能体' },
  { slug: 'integrations', en: 'Integrations', zh: '集成' },
  { slug: 'no-code', en: 'No-code', zh: '无代码' },
];

const TOOLS: ToolSeed[] = [
  {
    name: 'consensus',
    title: 'Consensus',
    categorySlug: 'research',
    pricing: 'freemium',
    tags: ['research', 'search', 'evidence', 'academic'],
    content: {
      en: 'An evidence-focused AI research engine for finding answers and scientific support from published papers.',
      zh: '一个偏证据导向的 AI 研究引擎，适合从已发表论文中寻找答案和科学支持。',
    },
    detail: {
      en: `Consensus is most useful when the user starts with a question and needs a fast evidence trail, not just a generated paragraph. It fits researchers, founders, operators, and writers who want to know whether a claim is actually supported by published work before they reuse it in content or decisions.

On this page, the real comparison is not "Can it summarize?" but "Can it shorten the distance between a question and a defensible answer?" That makes Consensus a better fit for research intake and evidence screening than for broad writing or project execution.`,
      zh: `Consensus 最有价值的场景，是用户先有一个问题，然后需要快速拿到“证据链”，而不是只要一段生成式回答。它适合研究人员、独立开发者、运营和内容创作者，在把某个观点写进内容或用于决策之前，先确认它是否真的有公开研究支持。

这页真正该比较的不是“它会不会总结”，而是“它能不能缩短从问题到可辩护答案之间的距离”。因此它更适合作为研究入口和证据筛查工具，而不是通用写作或项目执行工具。`,
    },
    useCases: {
      en: ['Evidence-backed research', 'Claim checking', 'Literature discovery', 'Topic framing'],
      zh: ['证据型研究', '观点核查', '文献发现', '主题框定'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Paper-backed answers and research discovery.' },
        { label: 'Best for', value: 'People who need a fast research starting point with scientific grounding.' },
        { label: 'Decision angle', value: 'Compare on evidence quality, source breadth, and how often it saves manual literature scanning.' },
      ],
      zh: [
        { label: '核心定位', value: '围绕论文证据的答案获取与研究发现。' },
        { label: '更适合', value: '需要带科学依据的快速研究起点的用户。' },
        { label: '比较重点', value: '重点看证据质量、来源覆盖面，以及它能否替代一部分手动文献筛选。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Researchers validating claims', 'Writers who want evidence before publishing', 'Founders scanning technical topics'],
        zh: ['要核查观点的研究者', '发布内容前先看证据的写作者', '快速扫技术主题的创业者'],
      },
      notIdealFor: {
        en: ['Users who mainly want polished long-form writing', 'Teams looking for workflow automation or team collaboration'],
        zh: ['主要想直接拿长文成稿的用户', '更需要自动化流程或团队协作系统的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a research intake tool with a clear evidence-first angle.',
      zh: '已按“研究入口 + 证据优先”的角度完成复核。',
    },
    trustNote: {
      en: 'This profile emphasizes where Consensus helps real decisions: narrowing a question into evidence-backed starting points.',
      zh: '本条目强调的是 Consensus 在真实决策中的作用：把问题收敛成带证据的研究起点。',
    },
  },
  {
    name: 'scite',
    title: 'Scite',
    categorySlug: 'research',
    pricing: 'freemium',
    tags: ['research', 'academic', 'evidence'],
    content: {
      en: 'A citation intelligence platform for understanding how papers are supported, challenged, and referenced over time.',
      zh: '一个引文情报平台，用来理解论文是如何被支持、质疑和长期引用的。',
    },
    detail: {
      en: `Scite becomes valuable when basic paper search is no longer enough. Instead of only helping you find a paper, it helps you judge the quality and context around that paper by showing how later work cites it. That is useful for people doing deeper research, competitive analysis, or technical writing where source quality matters.

The practical buying question here is whether your workflow needs citation context, not just search results. If you regularly need to separate strong evidence from weak authority signals, Scite is materially different from a general AI answer engine.`,
      zh: `当“找到论文”已经不够，Scite 的价值就会变得明显。它不只是帮你搜到一篇论文，而是进一步帮助你判断这篇论文的质量和语境，看后续研究如何引用它、支持它，或者反驳它。这对做深度研究、竞品分析、技术写作的人尤其有用。

这里真正的购买问题是：你的工作流需不需要“引文上下文”，而不只是搜索结果。如果你经常要区分强证据和弱权威信号，Scite 和一般的 AI 答案引擎就不是同一类产品。`,
    },
    useCases: {
      en: ['Citation validation', 'Source quality checks', 'Literature review', 'Research credibility checks'],
      zh: ['引文验证', '来源质量检查', '文献综述', '研究可信度判断'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Citation-aware research validation.' },
        { label: 'Best for', value: 'Users who need to understand whether a source is reinforced or disputed.' },
        { label: 'Decision angle', value: 'Look at citation context depth, trust signals, and whether it improves source selection quality.' },
      ],
      zh: [
        { label: '核心定位', value: '带引文语境的研究验证。' },
        { label: '更适合', value: '需要判断一个来源是被支持还是被质疑的用户。' },
        { label: '比较重点', value: '重点看引文语境深度、可信信号，以及它是否真能提升来源筛选质量。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Academic researchers', 'Analysts writing source-sensitive reports', 'Teams reviewing technical evidence'],
        zh: ['学术研究者', '撰写重来源报告的分析师', '审核技术证据的团队'],
      },
      notIdealFor: {
        en: ['Casual users who just need quick answers', 'People looking for general-purpose writing support'],
        zh: ['只想快速得到结论的轻量用户', '主要在找通用写作辅助的人'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a citation-quality layer, not just a generic research search product.',
      zh: '已按“引文质量层”而不是泛研究搜索产品来复核。',
    },
    trustNote: {
      en: 'This listing focuses on how Scite helps users judge source strength, which is where it creates the most differentiated value.',
      zh: '本条目聚焦 Scite 最有区分度的价值：帮助用户判断来源强弱，而不只是继续堆搜索结果。',
    },
  },
  {
    name: 'notebooklm',
    title: 'NotebookLM',
    categorySlug: 'research',
    pricing: 'free',
    tags: ['research', 'notes', 'summarization', 'knowledge'],
    content: {
      en: 'A source-grounded AI notebook for summarizing, organizing, and reasoning over your own documents and research material.',
      zh: '一个基于你自己资料的 AI 笔记本，适合总结、整理并围绕文档做推理。',
    },
    detail: {
      en: `NotebookLM is useful when your research already exists in documents, notes, transcripts, or source files and you want the AI to stay grounded in that material. It is less about searching the open web and more about turning your own pile of sources into a usable working notebook.

That makes the real comparison different from public-answer tools. The important question is whether your work starts from your own corpus. If yes, NotebookLM often feels much closer to how real study, planning, and synthesis work actually happen.`,
      zh: `当你的研究材料已经存在于文档、笔记、会议记录或资料文件里，而且你希望 AI 牢牢围绕这些材料来工作时，NotebookLM 会非常合适。它不是以开放网页搜索为主，而是帮助你把“自己的资料堆”变成可用的工作笔记本。

所以它和公开答案型工具的比较逻辑不一样。关键问题是：你的工作是不是从“自己的语料”出发？如果是，NotebookLM 往往更接近真实的学习、规划和综合过程。`,
    },
    useCases: {
      en: ['Source-grounded summaries', 'Research note organization', 'Document Q&A', 'Study workflows'],
      zh: ['基于资料的总结', '研究笔记整理', '文档问答', '学习型工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Reasoning over your own sources, not just public web answers.' },
        { label: 'Best for', value: 'People who already have documents, notes, or transcripts to work through.' },
        { label: 'Decision angle', value: 'Compare on source grounding, notebook usability, and whether it reduces manual note synthesis.' },
      ],
      zh: [
        { label: '核心定位', value: '围绕你自己的资料做推理，而不只是回答公开网页问题。' },
        { label: '更适合', value: '已经积累了文档、笔记或转录内容的用户。' },
        { label: '比较重点', value: '重点看资料锚定能力、笔记工作流是否顺手，以及能否减少手动综合整理。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Students and researchers organizing source sets', 'Founders synthesizing interviews and docs', 'Operators reviewing internal material'],
        zh: ['整理资料集的学生和研究者', '综合访谈与文档的创业者', '回顾内部资料的运营人员'],
      },
      notIdealFor: {
        en: ['Users who want broad web discovery first', 'Teams needing advanced automation or multi-step publishing workflows'],
        zh: ['先要做广泛网页发现的用户', '需要复杂自动化或多步骤发布流程的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a source-grounded notebook workflow rather than a generic chat product.',
      zh: '已按“资料锚定型笔记工作流”而非通用聊天产品来复核。',
    },
    trustNote: {
      en: 'This profile highlights the strongest use case for NotebookLM: turning your own material into a more navigable research workspace.',
      zh: '本条目强调 NotebookLM 最强的场景：把你自己的资料转成更可用、更可导航的研究工作空间。',
    },
  },
  {
    name: 'langfuse',
    title: 'Langfuse',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'observability', 'llm', 'api'],
    content: {
      en: 'An LLM engineering and observability platform for tracing, evaluating, and improving production AI applications.',
      zh: '一个面向生产环境 AI 应用的 LLM 工程与可观测平台，适合追踪、评估和优化模型工作流。',
    },
    detail: {
      en: `Langfuse matters when a team has already moved beyond prompting demos and is now shipping model behavior into a product. It helps answer operational questions such as what requests are failing, which prompts are drifting, and where quality degrades in real usage.

The decision here is not whether you need "more AI tooling" in the abstract. It is whether observability has become a bottleneck. If your product already depends on prompts, agents, or chained model calls, Langfuse belongs much closer to the core stack.`,
      zh: `当团队已经不再停留在 prompt 演示，而是把模型行为真正交付进产品时，Langfuse 的价值会很快体现出来。它帮助回答一些运营级问题，比如哪些请求在失败、哪些 prompt 在漂移、真实用户使用下质量在哪些环节下降。

这里的决策点不是“要不要更多 AI 工具”，而是“可观测性是不是已经成为瓶颈”。如果你的产品已经依赖 prompts、agents 或多段模型调用，Langfuse 就更接近核心基础设施。`,
    },
    useCases: {
      en: ['Prompt observability', 'LLM tracing', 'Production debugging', 'Evaluation workflows'],
      zh: ['Prompt 可观测', 'LLM 追踪', '生产调试', '评估工作流'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Tracing and evaluating real AI product behavior.' },
        { label: 'Best for', value: 'Teams shipping prompts, agents, or model chains into production.' },
        { label: 'Decision angle', value: 'Compare on trace depth, evaluation workflows, and how quickly it shortens incident debugging.' },
      ],
      zh: [
        { label: '核心定位', value: '追踪并评估真实 AI 产品行为。' },
        { label: '更适合', value: '把 prompts、agents 或模型链路部署到生产的团队。' },
        { label: '比较重点', value: '重点看追踪深度、评估工作流，以及它是否能缩短线上问题定位时间。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['AI product teams in production', 'Developers debugging prompt chains', 'Infra-minded builders optimizing LLM quality'],
        zh: ['已上线的 AI 产品团队', '调试 prompt 链路的开发者', '优化 LLM 质量的基础设施型构建者'],
      },
      notIdealFor: {
        en: ['Non-technical users without an AI stack', 'Teams still at the idea stage with no real traffic'],
        zh: ['没有 AI 技术栈的非技术用户', '还停留在想法阶段、没有真实流量的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as production-facing observability, not just a developer dashboard add-on.',
      zh: '已按“生产可观测能力”而不是普通开发看板附加项来复核。',
    },
    trustNote: {
      en: 'This listing centers on the operational value Langfuse creates once AI behavior becomes part of a live product.',
      zh: '本条目围绕 Langfuse 的运营价值展开：当 AI 行为已经进入线上产品后，它能带来什么可见性和控制力。',
    },
  },
  {
    name: 'helicone',
    title: 'Helicone',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'observability', 'api', 'llm'],
    content: {
      en: 'An LLM observability layer for tracking requests, costs, latency, and quality across AI workloads.',
      zh: '一个面向 AI 工作负载的 LLM 可观测层，适合追踪请求、成本、延迟和质量。',
    },
    detail: {
      en: `Helicone is especially relevant when a team wants faster visibility into costs and request behavior without building all the internal plumbing first. It helps connect model traffic with practical questions around spend, latency, prompt changes, and request-level inspection.

The real evaluation question is whether you need a lightweight observability layer now or a deeper platform later. Helicone usually enters the stack when speed of instrumentation matters almost as much as the observability itself.`,
      zh: `当团队希望尽快看到成本和请求行为，而不是先自己搭一整套内部管线时，Helicone 会很有吸引力。它把模型流量和一些非常实际的问题连接起来，比如花费、延迟、prompt 变化，以及请求级别的排查。

真正的评估问题是：你现在需要的是一个上手更快的可观测层，还是更深的长期平台。Helicone 往往会在“接入速度”几乎和“可观测本身”一样重要的时候进入栈里。`,
    },
    useCases: {
      en: ['Request monitoring', 'Cost tracking', 'Latency analysis', 'Prompt inspection'],
      zh: ['请求监控', '成本追踪', '延迟分析', 'Prompt 检查'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Fast-to-adopt observability for LLM request traffic.' },
        { label: 'Best for', value: 'Teams that need visibility on spend and latency before building internal dashboards.' },
        { label: 'Decision angle', value: 'Compare on setup speed, request visibility, and whether it gives enough control without heavy platform overhead.' },
      ],
      zh: [
        { label: '核心定位', value: '快速接入的 LLM 请求可观测层。' },
        { label: '更适合', value: '希望在自建后台之前先看清成本和延迟的团队。' },
        { label: '比较重点', value: '重点看接入速度、请求可见性，以及是否能在不过度引入平台复杂度的前提下满足需要。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Builders shipping API-based AI products', 'Teams watching token spend closely', 'Developers needing faster request inspection'],
        zh: ['交付 API 型 AI 产品的构建者', '需要紧盯 token 成本的团队', '想更快做请求排查的开发者'],
      },
      notIdealFor: {
        en: ['Users without live model traffic', 'Teams needing a full workflow automation suite rather than observability'],
        zh: ['还没有真实模型流量的用户', '真正需要的是全套自动化平台而不是可观测能力的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a practical observability layer with strong instrumentation speed.',
      zh: '已按“接入快、可操作”的可观测层来复核。',
    },
    trustNote: {
      en: 'This profile emphasizes how Helicone helps teams see request behavior earlier, before observability debt compounds.',
      zh: '本条目强调的是 Helicone 的前置价值：在可观测债务变大之前，先尽早看清请求行为。',
    },
  },
  {
    name: 'portkey',
    title: 'Portkey',
    categorySlug: 'developer-tools',
    pricing: 'freemium',
    tags: ['developer-tools', 'gateway', 'routing', 'cost-control'],
    content: {
      en: 'An AI gateway and control layer for routing, reliability, governance, and cost-aware model operations.',
      zh: '一个 AI 网关与控制层，适合做路由、稳定性治理、权限控制和成本感知的模型运营。',
    },
    detail: {
      en: `Portkey matters when your AI stack has become multi-model, multi-provider, or operationally sensitive. Instead of only watching requests after the fact, it helps control how traffic moves, how failover behaves, and how policies are applied across providers.

The key decision is whether you now need governance and routing, not just app-side prompting. If provider sprawl, reliability, or cost control are turning into engineering concerns, Portkey becomes much more strategic than a simple helper layer.`,
      zh: `当你的 AI 栈开始变成多模型、多供应商，或者对运营稳定性更敏感时，Portkey 的价值会快速提升。它不只是事后观察请求，而是帮助你控制流量怎么走、故障切换怎么发生，以及跨供应商策略如何被统一执行。

关键决策点在于：你现在需要的是治理和路由，而不只是应用侧 prompt 能力。如果供应商扩散、稳定性或成本控制已经变成工程问题，Portkey 的角色会比普通辅助层更战略。`,
    },
    useCases: {
      en: ['Model routing', 'Provider failover', 'Policy control', 'Cost-aware AI infrastructure'],
      zh: ['模型路由', '供应商故障切换', '策略控制', '成本感知 AI 基础设施'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Gateway control across providers, models, and operational policies.' },
        { label: 'Best for', value: 'Teams managing reliability, governance, and spend in a growing AI stack.' },
        { label: 'Decision angle', value: 'Compare on routing flexibility, policy controls, and how much it reduces provider complexity.' },
      ],
      zh: [
        { label: '核心定位', value: '跨供应商、跨模型、跨策略的网关控制层。' },
        { label: '更适合', value: '正在处理稳定性、治理和成本问题的成长型 AI 团队。' },
        { label: '比较重点', value: '重点看路由灵活度、策略控制能力，以及它是否真正降低了多供应商复杂度。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Infra-heavy AI teams', 'Products using multiple model vendors', 'Builders optimizing reliability and cost together'],
        zh: ['基础设施占比较高的 AI 团队', '使用多家模型供应商的产品团队', '同时优化稳定性与成本的构建者'],
      },
      notIdealFor: {
        en: ['Solo users just trying one model API', 'Teams that do not yet need routing, governance, or provider abstraction'],
        zh: ['只是试一个模型 API 的个人开发者', '还不需要路由、治理或供应商抽象层的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an AI control plane for growing infrastructure complexity.',
      zh: '已按“应对 AI 基础设施复杂度增长的控制平面”来复核。',
    },
    trustNote: {
      en: 'This listing focuses on the operational leverage Portkey offers once provider diversity and reliability become real engineering concerns.',
      zh: '本条目强调的是 Portkey 在多供应商和高可靠场景下带来的运营杠杆，而不是泛泛的 API 包装能力。',
    },
  },
  {
    name: 'zapier',
    title: 'Zapier',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['automation', 'integrations', 'no-code'],
    content: {
      en: 'A no-code automation platform for connecting apps, triggers, and repetitive business workflows.',
      zh: '一个无代码自动化平台，适合连接应用、触发器和重复型业务流程。',
    },
    detail: {
      en: `Zapier is still one of the clearest entry points when a user wants to automate repeatable work without building internal integrations. Its value is less about novelty and more about reliability, ecosystem breadth, and how quickly a useful workflow can go live.

The important comparison on this page is not whether automation sounds appealing in theory. It is whether your workflow already has repeatable steps across tools. If the answer is yes, Zapier often wins on speed and familiarity before more specialized agent tooling is even necessary.`,
      zh: `当用户希望在不自建集成的前提下，把重复工作自动化起来时，Zapier 仍然是最清晰的入门选择之一。它的价值不在“新奇”，而在于可靠性、生态覆盖，以及一个有用流程到底能多快上线。

这页真正重要的比较不是“自动化听起来好不好”，而是你的工作流是不是已经存在跨工具的重复步骤。如果答案是肯定的，Zapier 往往会先凭接入速度和熟悉度胜出，再去考虑更垂直的 agent 类工具。`,
    },
    useCases: {
      en: ['App-to-app automation', 'Lead routing', 'Notifications', 'Ops workflow automation'],
      zh: ['应用间自动化', '线索流转', '通知同步', '运营流程自动化'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Fast no-code automation across common business tools.' },
        { label: 'Best for', value: 'Teams that already know the workflow they want to automate.' },
        { label: 'Decision angle', value: 'Compare on integration breadth, setup speed, and whether the automation becomes dependable enough to trust.' },
      ],
      zh: [
        { label: '核心定位', value: '跨常见业务工具的快速无代码自动化。' },
        { label: '更适合', value: '已经明确知道自己要自动化哪段流程的团队。' },
        { label: '比较重点', value: '重点看集成覆盖、搭建速度，以及自动化是否足够稳定到可以放心托付。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Operators automating repetitive tasks', 'Founders connecting SaaS tools quickly', 'Teams building light internal workflows'],
        zh: ['自动化重复任务的运营人员', '快速串联 SaaS 工具的创业者', '搭轻量内部流程的团队'],
      },
      notIdealFor: {
        en: ['Users who only need one-off manual work', 'Teams needing highly custom backend orchestration or code-first control'],
        zh: ['只做一次性手工操作的用户', '需要高度定制后端编排或代码优先控制的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a practical automation default for repeatable business workflows.',
      zh: '已按“重复型业务流程的默认自动化选择”来复核。',
    },
    trustNote: {
      en: 'This profile focuses on repeatable workflow fit and operational reliability, which are the real reasons teams choose Zapier.',
      zh: '本条目强调的是重复流程适配度和运行稳定性，这才是团队选择 Zapier 的真实原因。',
    },
  },
  {
    name: 'pipedream',
    title: 'Pipedream',
    categorySlug: 'automation',
    pricing: 'freemium',
    tags: ['automation', 'integrations', 'api'],
    content: {
      en: 'A workflow automation platform with more developer-friendly flexibility for APIs, events, and custom logic.',
      zh: '一个更偏开发者友好的工作流自动化平台，适合处理 API、事件和自定义逻辑。',
    },
    detail: {
      en: `Pipedream enters the conversation when basic no-code automation is too limiting but a full internal orchestration system is still too heavy. It gives builders more room to work with APIs, code steps, and event-driven workflows without throwing away the speed advantage of managed automation.

So the real decision is about flexibility versus simplicity. If a workflow needs custom logic or non-trivial API work, Pipedream often feels meaningfully more capable than plug-and-play tools while still staying faster than building everything from scratch.`,
      zh: `当基础无代码自动化已经不够灵活，但完整自建编排系统又太重时，Pipedream 就会进入候选名单。它给构建者更多空间去处理 API、代码步骤和事件驱动流程，同时又保留了托管自动化的速度优势。

因此，这里的真实决策是“灵活性”和“简单性”的取舍。如果一个流程需要自定义逻辑或不那么简单的 API 工作，Pipedream 往往会比纯插拔式工具更有能力，同时又比从零自建快得多。`,
    },
    useCases: {
      en: ['API workflows', 'Event-driven automation', 'Custom logic steps', 'Developer-friendly integrations'],
      zh: ['API 工作流', '事件驱动自动化', '自定义逻辑步骤', '开发者友好型集成'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Flexible workflow automation for API-heavy use cases.' },
        { label: 'Best for', value: 'Builders who need more control than simple no-code zaps can offer.' },
        { label: 'Decision angle', value: 'Compare on API flexibility, custom logic support, and how much engineering time it still saves.' },
      ],
      zh: [
        { label: '核心定位', value: '适合 API 密集场景的灵活工作流自动化。' },
        { label: '更适合', value: '需要比简单无代码更强控制力的构建者。' },
        { label: '比较重点', value: '重点看 API 灵活度、自定义逻辑支持，以及它还能节省多少工程时间。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Technical operators and indie hackers', 'Teams stitching together APIs quickly', 'Developers bridging product and automation needs'],
        zh: ['技术型运营和独立开发者', '快速拼接 API 的团队', '连接产品需求与自动化需求的开发者'],
      },
      notIdealFor: {
        en: ['Users who want very simple point-and-click automations only', 'Teams needing deep enterprise governance before flexibility'],
        zh: ['只想做超简单点点点自动化的用户', '在灵活性之前更需要重企业治理的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as a middle layer between no-code convenience and code-first orchestration.',
      zh: '已按“无代码便利”和“代码优先编排”之间的中间层来复核。',
    },
    trustNote: {
      en: 'This listing highlights where Pipedream is strongest in practice: API-heavy workflows that still need to ship quickly.',
      zh: '本条目强调的是 Pipedream 最强的实战位置：既要快上线、又离不开 API 的工作流。',
    },
  },
  {
    name: 'lindy',
    title: 'Lindy',
    categorySlug: 'automation',
    pricing: 'paid',
    tags: ['automation', 'agents', 'integrations'],
    content: {
      en: 'An AI agent workflow product for delegating repeatable business tasks across tools, inboxes, and follow-up loops.',
      zh: '一个 AI agent 工作流产品，适合把重复型业务任务委托给跨工具、邮箱和跟进流程。',
    },
    detail: {
      en: `Lindy is useful when a team wants automation to feel more like delegation than routing. Instead of only moving data between tools, it tries to take on operational tasks that have more context, follow-up, and decision-like behavior inside them.

That means the core comparison is no longer with classic triggers alone. The real question is whether your repetitive work has enough context and repetition to benefit from an agent layer. If it does, Lindy may create leverage that rule-based automation alone cannot.`,
      zh: `当团队希望“自动化”更像“委派任务”而不只是“搬运数据”时，Lindy 会更有吸引力。它不只是把信息从一个工具传到另一个工具，而是尝试承担那些带有上下文、跟进动作和轻决策行为的运营任务。

因此它的核心比较对象已经不只是经典触发器。真正的问题是：你的重复工作里，是否已经有足够多的上下文和重复性，值得交给 agent 层来处理？如果是，Lindy 可能会带来规则型自动化做不到的杠杆。`,
    },
    useCases: {
      en: ['Inbox assistance', 'Follow-up workflows', 'Agent-based task delegation', 'Ops task handling'],
      zh: ['收件箱辅助', '跟进流程', 'Agent 式任务委派', '运营任务处理'],
    },
    features: {
      en: [
        { label: 'Core focus', value: 'Agent-like automation for repetitive operational work.' },
        { label: 'Best for', value: 'Teams that want contextual task delegation instead of only data movement.' },
        { label: 'Decision angle', value: 'Compare on how well it handles follow-up, context retention, and repetitive human-in-the-loop work.' },
      ],
      zh: [
        { label: '核心定位', value: '面向重复型运营工作的 agent 式自动化。' },
        { label: '更适合', value: '希望把“带上下文的任务委派”交出去，而不只是搬运数据的团队。' },
        { label: '比较重点', value: '重点看它处理跟进、上下文保持，以及人机协作型重复工作的能力。' },
      ],
    },
    audience: {
      bestFit: {
        en: ['Lean teams delegating operational follow-up', 'Founders automating inbox-heavy tasks', 'Operators experimenting with agent workflows'],
        zh: ['想委派运营跟进的精干团队', '自动化邮箱型任务的创业者', '尝试 agent 工作流的运营人员'],
      },
      notIdealFor: {
        en: ['Users who only need simple deterministic automation', 'Teams not ready to monitor agent behavior and boundaries'],
        zh: ['只需要简单确定性自动化的用户', '还没准备好管理 agent 边界和行为的团队'],
      },
    },
    editorialSummary: {
      en: 'Reviewed as an agent-style delegation layer rather than a standard automation connector.',
      zh: '已按“agent 式委派层”而不是普通自动化连接器来复核。',
    },
    trustNote: {
      en: 'This listing focuses on where Lindy earns its keep: repetitive operational tasks that still need some context and follow-through.',
      zh: '本条目聚焦 Lindy 真正值钱的地方：那些重复、但又确实需要一点上下文和跟进行为的运营任务。',
    },
  },
];

function loadLocalEnv() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function mergeTags(existing: unknown, additions: string[]) {
  const existingTags = Array.isArray(existing) ? existing.filter((item): item is string => typeof item === 'string') : [];
  return Array.from(new Set([...existingTags, ...additions]));
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

  const existingResult = await pool.query('SELECT tags, features FROM tools WHERE name = $1 LIMIT 1', [seed.name]);
  if (existingResult.rowCount === 0) {
    console.log(`- skipped ${seed.name}: not found`);
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

  console.log('Enriching wave 2 tool details...\n');
  await upsertTags();
  const categoryIdMap = await getCategoryIdMap();

  const updatedCount = await TOOLS.reduce(async (countPromise, seed) => {
    const count = await countPromise;
    const updated = await applySeed(seed, categoryIdMap, reviewedAt);
    return updated ? count + 1 : count;
  }, Promise.resolve(0));

  console.log(`\nDone. Updated ${updatedCount} wave 2 tool detail entries.`);
  await getPool().end();
}

main().catch((error) => {
  console.error('\nFailed to enrich wave 2 tool details:', error);
  process.exit(1);
});

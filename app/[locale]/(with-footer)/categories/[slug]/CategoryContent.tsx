import { notFound } from 'next/navigation';

import { GUIDE_PAGES } from '@/lib/content/guides';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import Search from '@/components/Search';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import ExploreList from '@/app/[locale]/(with-footer)/explore/ExploreList';
import { Link } from '@/app/navigation';

export interface CategoryContentProps {
  params: { locale: string; slug: string };
  pageNum?: string;
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

export default async function CategoryContent({ params, pageNum, searchParams }: CategoryContentProps) {
  const [categoryResult, categoriesResult, tagsResult] = await Promise.allSettled([
    getCategoryBySlug(params.slug, true),
    getAllCategories(true),
    getAllTags('count'),
  ]);
  const category = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

  if (!category) {
    notFound();
  }
  let categoryToolCount = 0;
  if ('toolCount' in category) {
    if (typeof category.toolCount === 'number') {
      categoryToolCount = category.toolCount;
    } else {
      categoryToolCount = Number(category.toolCount) || 0;
    }
  }

  const categoryName = getLocalizedField(category.name, params.locale);
  const categoryDescription =
    getLocalizedField(category.description, params.locale) ||
    `Browse the latest and most useful ${categoryName} AI tools.`;
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const categorySlug = String(category.slug);
  const guideHrefMap: Record<string, string[]> = {
    productivity: ['/guides/ai-productivity-tools', '/guides/ai-productivity-tools-comparison'],
    'design-art': ['/guides/ai-tools-for-designers', '/guides/ai-tools-for-designers-comparison'],
    chatbot: ['/guides/ai-chatbot-tools', '/guides/ai-chatbot-tools-comparison'],
    'text-writing': ['/guides/ai-writing-tools', '/guides/ai-writing-tools-comparison'],
    'video-generator': ['/guides/ai-video-tools', '/guides/ai-video-tools-comparison'],
    'image-generator': ['/guides/ai-image-tools', '/guides/ai-image-tools-comparison'],
    coding: ['/guides/ai-coding-tools', '/guides/ai-coding-tools-comparison'],
    research: ['/guides/ai-tools-for-research', '/guides/ai-tools-for-research-comparison', '/guides/ai-seo-tools'],
    marketing: [
      '/guides/ai-tools-for-marketing',
      '/guides/ai-tools-for-marketing-comparison',
      '/guides/ai-writing-tools',
    ],
    voice: ['/guides/ai-tools-for-voice', '/guides/ai-tools-for-voice-comparison'],
    automation: ['/guides/ai-tools-for-automation', '/guides/ai-tools-for-automation-comparison'],
    'developer-tools': [
      '/guides/ai-tools-for-developers',
      '/guides/ai-tools-for-developers-comparison',
      '/guides/ai-tools-for-model-routing',
      '/guides/ai-tools-for-model-routing-comparison',
      '/guides/ai-tools-for-api-observability',
      '/guides/ai-tools-for-api-observability-comparison',
    ],
    web3: ['/guides/ai-tools-for-web3', '/guides/ai-tools-for-web3-comparison'],
  };
  const representativeToolMap: Record<
    string,
    Array<{
      href: string;
      title: { cn: string; en: string };
      description: { cn: string; en: string };
    }>
  > = {
    productivity: [
      {
        href: '/ai/fathom',
        title: {
          cn: 'Fathom：会议纪要与会后跟进',
          en: 'Fathom: meeting notes and follow-through',
        },
        description: {
          cn: '适合先看 AI 是否真的减少了会后整理和跟进负担。',
          en: 'A strong example if you want to judge whether AI really reduces post-meeting admin work.',
        },
      },
      {
        href: '/ai/gamma',
        title: {
          cn: 'Gamma：把想法变成可分享材料',
          en: 'Gamma: turn rough ideas into shareable decks',
        },
        description: {
          cn: '适合先看表达、演示和提案类工作流怎么被 AI 加速。',
          en: 'Useful for evaluating AI-assisted communication, proposal, and presentation workflows.',
        },
      },
      {
        href: '/ai/notta',
        title: {
          cn: 'Notta：转录与整理入口',
          en: 'Notta: transcription and organization',
        },
        description: {
          cn: '更偏语音转录、会议记录和日常信息整理场景。',
          en: 'A practical entry point for transcription, meeting capture, and day-to-day information cleanup.',
        },
      },
      {
        href: '/ai/motion',
        title: {
          cn: 'Motion：时间与任务安排',
          en: 'Motion: planning and task scheduling',
        },
        description: {
          cn: '适合判断 AI 是否真的在日程和任务推进上提升效率。',
          en: 'Good for judging whether AI meaningfully improves planning and task execution.',
        },
      },
    ],
    web3: [
      {
        href: '/ai/dune',
        title: {
          cn: 'Dune：查询驱动的链上分析',
          en: 'Dune: query-driven on-chain analytics',
        },
        description: {
          cn: '如果你想先看“可查询的数据工作台”是什么样，这一页最有代表性。',
          en: 'The clearest representative page if you want to evaluate a query-first on-chain research workflow.',
        },
      },
      {
        href: '/ai/defillama',
        title: {
          cn: 'DefiLlama：广覆盖市场与协议监控',
          en: 'DefiLlama: protocol monitoring and market coverage',
        },
        description: {
          cn: '适合先看广覆盖 DeFi 市场可见性和监控类工具。',
          en: 'A strong entry point for monitoring-oriented DeFi and market coverage workflows.',
        },
      },
      {
        href: '/ai/the-graph',
        title: {
          cn: 'The Graph：面向构建者的数据基础设施',
          en: 'The Graph: builder-facing data infrastructure',
        },
        description: {
          cn: '如果你更关心 Web3 应用怎么取数，这一页最适合先看。',
          en: 'The best first stop if your question is how apps and products access structured blockchain data.',
        },
      },
      {
        href: '/ai/nansen',
        title: {
          cn: 'Nansen：地址与资金流研究',
          en: 'Nansen: wallet and flow intelligence',
        },
        description: {
          cn: '更适合先看地址、钱包和资金流研究型使用场景。',
          en: 'Useful when you want to compare address, wallet, and capital-flow research products.',
        },
      },
    ],
    research: [
      {
        href: '/ai/perplexity',
        title: {
          cn: 'Perplexity：更适合来源和研究起点',
          en: 'Perplexity: source-friendly research starting point',
        },
        description: {
          cn: '适合先看搜索、来源和答案组织方式是否满足研究需要。',
          en: 'A strong entry point if you want to judge search, citations, and answer structure for research work.',
        },
      },
      {
        href: '/ai/elicit',
        title: {
          cn: 'Elicit：证据驱动研究入口',
          en: 'Elicit: evidence-driven research',
        },
        description: {
          cn: '更适合文献梳理、证据提取和研究型调研。',
          en: 'A better fit for literature review, evidence gathering, and source-heavy research.',
        },
      },
      {
        href: '/ai/papers-with-code',
        title: {
          cn: 'Papers with Code：论文与实现结合',
          en: 'Papers with Code: papers plus implementations',
        },
        description: {
          cn: '适合先看模型、论文和 benchmark 是否能连到一起。',
          en: 'Useful when you care about linking papers, models, and benchmarks together.',
        },
      },
      {
        href: '/ai/hugging-face',
        title: {
          cn: 'Hugging Face：模型发现和生态探索',
          en: 'Hugging Face: model discovery and ecosystem exploration',
        },
        description: {
          cn: '适合研究模型、数据集和开源 AI 资源。',
          en: 'A better fit for models, datasets, and open-source AI ecosystem discovery.',
        },
      },
    ],
    voice: [
      {
        href: '/ai/elevenlabs',
        title: {
          cn: 'ElevenLabs：语音合成与克隆',
          en: 'ElevenLabs: speech synthesis and cloning',
        },
        description: {
          cn: '适合先看音色、语音自然度和生产可用性。',
          en: 'Useful for judging voice quality, naturalness, and production readiness.',
        },
      },
      {
        href: '/ai/descript',
        title: {
          cn: 'Descript：音频编辑与转写',
          en: 'Descript: audio editing and transcription',
        },
        description: {
          cn: '适合转录、音频编辑和播客工作流。',
          en: 'A better fit for transcription, audio editing, and podcast workflows.',
        },
      },
      {
        href: '/ai/notta',
        title: {
          cn: 'Notta：会议转写入口',
          en: 'Notta: meeting transcription',
        },
        description: {
          cn: '适合语音记录、会议纪要和多语言转写。',
          en: 'A practical entry point for meeting capture, notes, and multilingual transcription.',
        },
      },
      {
        href: '/ai/elevenlabs-conversational-ai',
        title: {
          cn: '语音对话 Agent',
          en: 'Voice conversational agents',
        },
        description: {
          cn: '适合把语音接入客服、助手和实时交互场景。',
          en: 'Useful when voice needs to power assistants, support, or real-time interaction.',
        },
      },
    ],
    automation: [
      {
        href: '/ai/n8n',
        title: {
          cn: 'n8n：工作流自动化',
          en: 'n8n: workflow automation',
        },
        description: {
          cn: '适合看可视化编排和自动化深度。',
          en: 'A solid entry point for visual orchestration and automation depth.',
        },
      },
      {
        href: '/ai/zapier',
        title: {
          cn: 'Zapier：连接器优先自动化',
          en: 'Zapier: connector-first automation',
        },
        description: {
          cn: '适合连接器覆盖和快速搭建流程。',
          en: 'A better fit for connector coverage and fast workflow setup.',
        },
      },
      {
        href: '/ai/make',
        title: {
          cn: 'Make：可视化编排',
          en: 'Make: visual orchestration',
        },
        description: {
          cn: '适合复杂分支、条件和任务流编排。',
          en: 'Useful for branching logic, conditions, and more complex flows.',
        },
      },
      {
        href: '/ai/ifttt',
        title: {
          cn: 'IFTTT：轻量触发自动化',
          en: 'IFTTT: lightweight trigger automation',
        },
        description: {
          cn: '适合简单触发器和日常自动化。',
          en: 'A good fit for simple triggers and lightweight daily automations.',
        },
      },
    ],
    'developer-tools': [
      {
        href: '/ai/cursor',
        title: {
          cn: 'Cursor：开发者编辑器入口',
          en: 'Cursor: developer editor entry point',
        },
        description: {
          cn: '适合看编辑器内 AI 辅助是否真正提升编码效率。',
          en: 'Good for judging whether editor-native AI really improves coding speed.',
        },
      },
      {
        href: '/ai/alchemy',
        title: {
          cn: 'Alchemy：基础设施和 API',
          en: 'Alchemy: infrastructure and APIs',
        },
        description: {
          cn: '适合开发者基础设施、API 和链路可用性。',
          en: 'A better fit for infrastructure, APIs, and operational reliability.',
        },
      },
      {
        href: '/ai/pinecone',
        title: {
          cn: 'Pinecone：向量和检索',
          en: 'Pinecone: vector and retrieval',
        },
        description: {
          cn: '适合检索、RAG 和数据层工作流。',
          en: 'Useful for retrieval, RAG, and data-layer workflows.',
        },
      },
      {
        href: '/ai/v0',
        title: {
          cn: 'v0：前端与原型生成',
          en: 'v0: frontend and prototype generation',
        },
        description: {
          cn: '适合前端原型、界面生成和快速出图。',
          en: 'A practical entry point for frontend prototypes, interface generation, and quick UI drafting.',
        },
      },
    ],
  };
  const decisionFocusMap: Record<string, { cn: string; en: string }[]> = {
    'developer-tools': [
      {
        cn: '先看接入成本、API 覆盖和文档质量。',
        en: 'Start with integration cost, API coverage, and documentation quality.',
      },
      {
        cn: '再看是否支持调试、可观测性和团队协作。',
        en: 'Then check debugging, observability, and team workflow support.',
      },
      {
        cn: '最后回到对比页看模型路由和工作流深度。',
        en: 'Finish by comparing model routing and workflow depth.',
      },
    ],
    research: [
      {
        cn: '先看来源透明度、引用和证据链。',
        en: 'Start with source transparency, citations, and evidence trails.',
      },
      {
        cn: '再看是否适合文献、竞品和主题研究。',
        en: 'Then check whether it fits literature, competitor, and topic research.',
      },
      {
        cn: '最后回到对比页看检索广度和上下文能力。',
        en: 'Finish by comparing retrieval breadth and context handling.',
      },
    ],
    voice: [
      {
        cn: '先看转录质量、音色自然度和导出稳定性。',
        en: 'Start with transcription quality, voice naturalness, and export stability.',
      },
      {
        cn: '再看是否适合会议、播客或实时对话。',
        en: 'Then check whether it fits meetings, podcasts, or live conversation.',
      },
      {
        cn: '最后回到对比页看生产可用性和长期成本。',
        en: 'Finish by comparing production readiness and long-term cost.',
      },
    ],
    'text-writing': [
      {
        cn: '先看写作任务适配度和输出质量。',
        en: 'Start with writing-task fit and output quality.',
      },
      {
        cn: '再看 SEO、营销或编辑工作流是否顺手。',
        en: 'Then check whether SEO, marketing, or editing workflows feel natural.',
      },
      {
        cn: '最后回到对比页看免费额度和升级门槛。',
        en: 'Finish by comparing free-tier limits and upgrade thresholds.',
      },
    ],
  };
  const relatedGuideHrefs = [
    '/guides/how-to-choose-ai-tools',
    ...(guideHrefMap[categorySlug] || []),
    '/guides/free-ai-tools',
  ];
  const relatedGuides = relatedGuideHrefs
    .map((href) => GUIDE_PAGES.find((page) => page.href === href))
    .filter(
      (page, index, pages): page is (typeof GUIDE_PAGES)[number] => Boolean(page) && pages.indexOf(page) === index,
    )
    .slice(0, 3);
  const taskSuggestions = relatedGuides.map((guide) => ({
    label: guide.title[isChinese ? 'cn' : 'en'],
    href: guide.href,
  }));
  const comparisonGuides = (guideHrefMap[categorySlug] || [])
    .map((href) => GUIDE_PAGES.find((page) => page.href === href))
    .filter((page): page is (typeof GUIDE_PAGES)[number] => Boolean(page))
    .filter((page) => page.href.endsWith('-comparison'));
  const primaryComparisonGuide = comparisonGuides[0] || relatedGuides[0] || null;
  const checkedAt = '2026-07-15';
  const checkedAtLabel = checkedAt;
  const priorityCategorySlugs = [
    'developer-tools',
    'research',
    'voice',
    'text-writing',
    'productivity',
    'chatbot',
    'marketing',
    'design-art',
    'image-generator',
    'video-generator',
  ];
  const adjacentCategories = categories
    .filter((item) => item.slug !== category.slug)
    .sort((a, b) => {
      const aPriority = priorityCategorySlugs.indexOf(String(a.slug));
      const bPriority = priorityCategorySlugs.indexOf(String(b.slug));

      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;

      return aPriority - bPriority;
    })
    .slice(0, 4)
    .map((item) => ({
      slug: String(item.slug),
      name: getLocalizedField(item.name, params.locale),
    }));
  const representativeTools = (representativeToolMap[categorySlug] || []).slice(0, 3);
  const categorySignalCards = [
    {
      label: isChinese ? '最近核查' : 'Last checked',
      value: checkedAtLabel,
      note: isChinese
        ? '这不是静态目录，后续还会继续补真实对比、评论和认领信号。'
        : 'This is not a static directory; we will keep adding real comparisons, comments, and claim signals.',
    },
    {
      label: isChinese ? '当前规模' : 'Current size',
      value: `${categoryToolCount}`,
      note: isChinese
        ? '分类页保留索引，但会继续把真实工具页、指南页和对比页串起来。'
        : 'The category page stays indexable while linking real tool pages, guides, and comparison pages together.',
    },
    {
      label: isChinese ? '下一跳入口' : 'Next hop',
      value: `${comparisonGuides.length + relatedGuides.length}`,
      note: isChinese
        ? '先从对比和指南进入，再回到列表筛选具体工具。'
        : 'Start with comparisons and guides, then return to the list to narrow down specific tools.',
    },
  ];
  const categorySpecificSignalCardsBySlug: Record<
    string,
    Array<{
      label: string;
      value: string;
      note: string;
    }>
  > = {
    productivity: [
      {
        label: isChinese ? '团队信号' : 'Team signal',
        value: isChinese ? '先看个人席位还是团队席位' : 'Check whether it is for solo or team seats',
        note: isChinese
          ? '生产力类工具最容易在席位和协作边界上出问题。'
          : 'Productivity tools often fail at seat structure and collaboration boundaries.',
      },
      {
        label: isChinese ? '工作流信号' : 'Workflow signal',
        value: isChinese ? '先看是否真能省掉会后整理' : 'Check whether it truly saves post-meeting admin',
        note: isChinese
          ? '如果不能减少整理和跟进，它就只是漂亮的演示。'
          : 'If it does not reduce follow-up work, it is only a nice demo.',
      },
      {
        label: isChinese ? '风险信号' : 'Risk signal',
        value: isChinese ? '别把通用助手当生产力工具' : 'Do not confuse a general assistant with a productivity tool',
        note: isChinese
          ? '真正有用的生产力工具，应该能接住日历、会议和任务流。'
          : 'A useful productivity tool should handle calendar, meetings, and task flow.',
      },
    ],
    web3: [
      {
        label: isChinese ? '数据覆盖' : 'Coverage signal',
        value: isChinese ? '先看链和协议覆盖面' : 'Check chain and protocol coverage first',
        note: isChinese
          ? 'Web3 类工具最怕覆盖链不全或协议不全。'
          : 'Web3 tools are often limited by incomplete chain or protocol coverage.',
      },
      {
        label: isChinese ? '更新信号' : 'Freshness signal',
        value: isChinese ? '先看最近数据和指标更新时间' : 'Check the latest data and metric refresh dates',
        note: isChinese
          ? '链上数据过时，页面就会误导判断。'
          : 'Stale on-chain data quickly undermines the page’s usefulness.',
      },
      {
        label: isChinese ? '风险信号' : 'Risk signal',
        value: isChinese ? '没有明确数据来源就先降级' : 'Downgrade it without clear data sources',
        note: isChinese
          ? 'Web3 里来源、覆盖和导出比花哨功能更重要。'
          : 'In Web3, sources, coverage, and exports matter more than flashy features.',
      },
    ],
    'developer-tools': [
      {
        label: isChinese ? '接入信号' : 'Integration signal',
        value: isChinese ? '先看 API、SDK 和工作流接入' : 'Check APIs, SDKs, and workflow integration first',
        note: isChinese
          ? '开发者工具如果接不进去，功能再强也很难长期用。'
          : 'If a developer tool is hard to integrate, strong features will not matter for long.',
      },
      {
        label: isChinese ? '协作信号' : 'Collaboration signal',
        value: isChinese ? '先看团队共享和权限' : 'Check sharing and permissions for teams',
        note: isChinese
          ? '开发团队更在意交接、权限和可追踪性。'
          : 'Dev teams care about handoff, permissions, and traceability.',
      },
      {
        label: isChinese ? '风险信号' : 'Risk signal',
        value: isChinese
          ? '没文档、没观测、没稳定更新就先谨慎'
          : 'Be cautious without docs, observability, or steady updates',
        note: isChinese
          ? '开发者工具需要可维护，而不只是能演示。'
          : 'Developer tools need maintainability, not just demos.',
      },
    ],
    chatbot: [
      {
        label: isChinese ? '模型信号' : 'Model signal',
        value: isChinese ? '先看能接什么模型' : 'Check which models it can access',
        note: isChinese
          ? '聊天机器人要看模型接入，而不是只看界面。'
          : 'Chatbot pages should focus on model access, not only the UI.',
      },
      {
        label: isChinese ? '使用场景' : 'Use-case signal',
        value: isChinese ? '先分清问答、客服和助手' : 'Separate Q&A, support, and assistant workflows',
        note: isChinese
          ? '不同场景对回复、上下文和知识库要求完全不同。'
          : 'Different workflows have very different needs for replies, context, and knowledge bases.',
      },
      {
        label: isChinese ? '风险信号' : 'Risk signal',
        value: isChinese ? '只是在套壳就降级' : 'Downgrade wrapper-only products',
        note: isChinese
          ? '如果没有真正的模型、记忆或工作流，就不该被当成核心工具。'
          : 'Without a real model, memory, or workflow, it should not be treated as a core tool.',
      },
    ],
  };
  const categorySpecificSignalCards = categorySpecificSignalCardsBySlug[categorySlug] || [];
  const evidenceSignalCards = [...categorySignalCards, ...categorySpecificSignalCards].slice(0, 6);
  const highIntentEntryPoints = (
    {
      coding: [
        {
          href: '/guides/ai-coding-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先把编辑器、代码生成和工作流集成的差异看清楚。',
            en: 'Compare editors, code generation, and workflow integration first.',
          },
        },
        {
          href: '/guides/ai-coding-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '把这个分类里常见的使用场景先串起来。',
            en: 'Get the category context before narrowing down tools.',
          },
        },
        representativeToolMap.coding?.[0],
      ],
      productivity: [
        {
          href: '/guides/ai-productivity-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看会议、任务和日程效率的差别。',
            en: 'Compare meeting, task, and scheduling efficiency first.',
          },
        },
        {
          href: '/guides/ai-productivity-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '把生产力工具的典型工作流先串起来。',
            en: 'Get the productivity workflow context before browsing deeper.',
          },
        },
        representativeToolMap.productivity?.[0],
      ],
      chatbot: [
        {
          href: '/guides/ai-chatbot-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看对话质量、模型接入和场景适配。',
            en: 'Compare conversation quality, model access, and use-case fit first.',
          },
        },
        {
          href: '/guides/ai-chatbot-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把聊天机器人和客服/助手类场景拆开。',
            en: 'Separate chatbot use cases from support and assistant workflows first.',
          },
        },
      ],
      marketing: [
        {
          href: '/guides/ai-tools-for-marketing-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看营销、内容和增长工作流差异。',
            en: 'Compare marketing, content, and growth workflows first.',
          },
        },
        {
          href: '/guides/ai-tools-for-marketing',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '把营销工具的场景先拆清楚。',
            en: 'Clarify the marketing use case before scanning tools.',
          },
        },
      ],
      'design-art': [
        {
          href: '/guides/ai-tools-for-designers-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看设计、创意和生产效率的差别。',
            en: 'Compare design, creative, and production efficiency first.',
          },
        },
        {
          href: '/guides/ai-tools-for-designers',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把设计类 AI 的典型用途串起来。',
            en: 'Understand the design AI use case before browsing tools.',
          },
        },
      ],
      'image-generator': [
        {
          href: '/guides/ai-image-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看出图质量、风格控制和生成速度。',
            en: 'Compare image quality, style control, and generation speed first.',
          },
        },
        {
          href: '/guides/ai-image-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把图片生成场景和创意流程理顺。',
            en: 'Understand the image-generation workflow before browsing tools.',
          },
        },
      ],
      'video-generator': [
        {
          href: '/guides/ai-video-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看视频生成质量、时长和编辑能力。',
            en: 'Compare output quality, duration, and editing depth first.',
          },
        },
        {
          href: '/guides/ai-video-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把视频创作和生成工作流拆开。',
            en: 'Separate video creation workflows before scanning tools.',
          },
        },
      ],
      research: [
        {
          href: '/guides/ai-tools-for-research-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看来源、引用和检索广度的差别。',
            en: 'Compare sources, citations, and retrieval breadth first.',
          },
        },
        {
          href: '/guides/ai-tools-for-research',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '把研究型搜索和证据整理的路径先理顺。',
            en: 'Understand the research workflow before scanning tools.',
          },
        },
        representativeToolMap.research?.[0],
      ],
      automation: [
        {
          href: '/guides/ai-tools-for-automation-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看工作流、触发器和编排能力的差异。',
            en: 'Compare workflow depth, triggers, and orchestration first.',
          },
        },
        {
          href: '/guides/ai-tools-for-automation',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把自动化场景拆清楚，再选工具。',
            en: 'Clarify the automation use case before picking a tool.',
          },
        },
        representativeToolMap.automation?.[0],
      ],
      web3: [
        {
          href: '/guides/ai-tools-for-web3-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看链上研究、监控和数据基础设施的差别。',
            en: 'Compare on-chain research, monitoring, and infrastructure first.',
          },
        },
        {
          href: '/guides/ai-tools-for-web3',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '把 Web3 工具的主要工作流先梳理出来。',
            en: 'Understand the main Web3 workflows before narrowing the list.',
          },
        },
        representativeToolMap.web3?.[0],
      ],
      'developer-tools': [
        {
          href: '/guides/ai-tools-for-developers-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看接入成本、API 覆盖和团队协作。',
            en: 'Compare integration cost, API coverage, and team workflow support first.',
          },
        },
        {
          href: '/guides/ai-tools-for-developers',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把开发者工具分成编辑器、基础设施和观测几类。',
            en: 'Split the space into editor, infrastructure, and observability buckets first.',
          },
        },
        representativeToolMap['developer-tools']?.[0],
      ],
      'text-writing': [
        {
          href: '/guides/ai-writing-tools-comparison',
          title: {
            cn: '先看对比页',
            en: 'Start with comparison',
          },
          description: {
            cn: '先看写作质量、风格控制和编辑工作流。',
            en: 'Compare writing quality, style control, and editing workflows first.',
          },
        },
        {
          href: '/guides/ai-writing-tools',
          title: {
            cn: '再看指南页',
            en: 'Read the guide',
          },
          description: {
            cn: '先把 SEO、营销和内容写作场景分开。',
            en: 'Separate SEO, marketing, and content-writing use cases first.',
          },
        },
        representativeToolMap['text-writing']?.[0],
      ],
    }[categorySlug] || []
  )
    .filter(Boolean)
    .slice(0, 3) as Array<{
    href: string;
    title: { cn: string; en: string };
    description: { cn: string; en: string };
  }>;
  const decisionFocus = decisionFocusMap[categorySlug] || [];
  const helperBullets = isChinese
    ? [
        `先看工具是否真正适合 ${categoryName} 的工作流，而不只是“看起来很强”。`,
        '优先看是否有真实截图、定价说明和最近更新。',
        '如果你是开发者，可以先提交到目录，再观察用户反馈。',
      ]
    : [
        `Check whether the tool truly fits the ${categoryName} workflow, not just whether it looks impressive.`,
        'Prefer tools with real screenshots, clear pricing, and recent updates.',
        'If you are a developer, submit first and use feedback to refine positioning.',
      ];
  if (categorySlug === 'other') {
    helperBullets.unshift(
      isChinese
        ? 'Other 只是临时兜底分类，尽量先把工具重新放回 Research、Voice、Automation、Developer Tools、Web3 或更具体的场景分类。'
        : 'Other is a temporary fallback bucket; prefer moving tools into Research, Voice, Automation, Developer Tools, Web3, or a more specific scenario category.',
    );
  }
  const faqs = [
    {
      question: isChinese
        ? `这个 ${categoryName} 分类页适合什么人？`
        : `Who is this ${categoryName} category page for?`,
      answer: isChinese
        ? `如果你正在寻找 ${categoryName} 相关工具，或者想快速比较多个选项，这一页会帮你从最新、热门和筛选条件里快速缩小范围。`
        : `If you are looking for ${categoryName} tools or want to compare options quickly, this page helps you narrow the list by freshness, popularity, and filters.`,
    },
    {
      question: isChinese ? `我应该怎么选 ${categoryName} 工具？` : `How should I choose a ${categoryName} tool?`,
      answer: isChinese
        ? '先看它是否解决你的核心场景，再看价格、更新频率、截图和真实评论。能直接试用的工具通常更容易判断是否适合你。'
        : 'Start with the core use case, then check pricing, update frequency, screenshots, and real comments. Tools you can try quickly are easier to evaluate.',
    },
    {
      question: isChinese ? '免费工具和付费工具有什么区别？' : 'What is the difference between free and paid tools?',
      answer: isChinese
        ? '免费工具更适合入门和低成本尝试；付费工具通常在稳定性、限制、支持或功能深度上更完整。'
        : 'Free tools are great for getting started and testing low cost. Paid tools usually offer more stability, fewer limits, stronger support, or deeper features.',
    },
    {
      question: isChinese ? `我可以提交自己的 ${categoryName} 工具吗？` : `Can I submit my own ${categoryName} tool?`,
      answer: isChinese
        ? '可以，直接提交到目录。你也可以在提交页里补充截图、定价和一句清晰的能力描述，帮助审核更快完成。'
        : 'Yes, you can submit it to the directory. Add screenshots, pricing, and a clear one-line capability summary to help reviews move faster.',
    },
  ];
  const basePath = `/categories/${category.slug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${params.locale}` },
    { name: 'Explore', url: `${siteUrl}/${params.locale}/explore` },
    {
      name: categoryName,
      url: `${siteUrl}/${params.locale}/categories/${category.slug}`,
    },
  ]);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page container mx-auto px-4 py-8'>
        <div className='theme-surface mb-8 rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '按场景浏览' : 'Browse by use case'}
              </p>
              <h1 className='mt-2 text-3xl font-bold text-slate-900 lg:text-4xl'>
                {isChinese ? `Best ${categoryName} AI 工具` : `Best ${categoryName} AI tools`}
              </h1>
              <p className='mt-3 text-slate-600'>{categoryDescription}</p>
              {categoryToolCount > 0 && (
                <p className='mt-4 text-sm font-medium text-slate-500'>
                  {categoryToolCount} {isChinese ? '个已发布工具' : 'published tools'}
                </p>
              )}
              <div className='mt-4 inline-flex items-center rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800'>
                {isChinese
                  ? '先按任务收窄，再去看具体工具和对比页。'
                  : 'Start with the task, then open the tools and comparison pages.'}
              </div>
            </div>
            <div className='flex flex-wrap gap-3 lg:justify-end'>
              <TrackableCtaLink
                href={primaryComparisonGuide?.href || '/guides/how-to-choose-ai-tools'}
                ctaId={`category_${categorySlug}_comparison`}
                ctaLabel={`Category ${categorySlug} comparison`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '先看对比页' : 'Start with comparison'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/submit'
                ctaId={`category_${categorySlug}_submit`}
                ctaLabel={`Category ${categorySlug} submit`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
              >
                {isChinese ? '提交这个分类的工具' : 'Submit a tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId={`category_${categorySlug}_claim`}
                ctaLabel={`Category ${categorySlug} claim`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100'
              >
                {isChinese ? '认领条目' : 'Claim listing'}
              </TrackableCtaLink>
            </div>
          </div>
        </div>

        <div className='mb-8 grid gap-4 md:grid-cols-3'>
          {categorySignalCards.map((card) => (
            <div key={card.label} className='theme-surface rounded-lg border border-cyan-100 p-5 shadow-sm'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{card.label}</p>
              <p className='mt-2 text-2xl font-bold text-slate-900'>{card.value}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{card.note}</p>
            </div>
          ))}
        </div>

        <div className='mb-8 grid gap-3 md:grid-cols-3'>
          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '为什么先看这个分类' : 'Why start here'}
            </p>
            <p className='mt-2 text-sm font-semibold text-slate-950'>
              {isChinese ? '它先帮你缩小场景，再看具体工具。' : 'It narrows the workflow first, then the tools.'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '分类页最有价值的部分，不是把工具堆在一起，而是让你知道哪些工具属于同一类真实任务。'
                : 'The value is not in stacking tools, but in showing which ones belong to the same real task.'}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较时先看什么' : 'What to compare first'}
            </p>
            <p className='mt-2 text-sm font-semibold text-slate-950'>
              {isChinese ? '场景适配、价格门槛和更新信号。' : 'Use-case fit, pricing threshold, and freshness signals.'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这三项通常比单纯的功能数更能决定你会不会继续用下去。'
                : 'These three signals usually matter more than raw feature count when deciding what to keep using.'}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步怎么走' : 'Where to go next'}
            </p>
            <p className='mt-2 text-sm font-semibold text-slate-950'>
              {isChinese
                ? '先进对比页，再回到具体条目。'
                : 'Go to the comparison page, then back to specific listings.'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这样可以先把 shortlist 压缩，再进入更具体的工具页做最终判断。'
                : 'This compresses the shortlist first, then sends you into more specific pages for the final call.'}
            </p>
          </div>
        </div>

        {taskSuggestions.length > 0 && (
          <div className='mb-8 rounded-[18px] border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm'>
            <Search
              placeholder={
                isChinese
                  ? '搜索这个分类里的工具、场景或产品名...'
                  : 'Search tools, use cases, or product names in this category...'
              }
              taskHint={isChinese ? '先按任务找' : 'Search by task'}
              taskDescription={
                isChinese
                  ? '先选你要完成的任务，再在这个分类里缩小 shortlist。'
                  : 'Choose the task you want to complete first, then narrow the shortlist inside this category.'
              }
              taskSuggestions={taskSuggestions}
              className='p-0 sm:p-0'
            />
          </div>
        )}

        <GuideEvidencePanel
          locale={params.locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页先交代分类到底覆盖哪些真实场景、当前有多少已发布工具、以及用户接下来该去哪里比较。'
              : 'This page explains which real scenarios the category covers, how many published tools exist now, and where users should compare next.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese
                ? '场景、代表工具、比较入口 + 规模'
                : 'Scenarios, representative tools, comparison entry + scale',
              note: isChinese
                ? `当前分类约 ${categoryToolCount} 个已发布工具，代表工具 ${representativeTools.length} 个，相关指南 ${relatedGuides.length} 个。`
                : `About ${categoryToolCount} published tools, ${representativeTools.length} representative tools, and ${relatedGuides.length} related guides are in view.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '分类页保留索引' : 'Category page kept indexable',
              note: isChinese
                ? '承接高意图分类搜索与探索流量。'
                : 'Captures high-intent category search and exploration traffic.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese
                ? '补代表工具、真实对比、评论、owner 信号'
                : 'Add representative tools, real comparisons, comments, and owner signals',
              note: isChinese
                ? '把抽象分类变成可行动的选择页。'
                : 'Turn an abstract category into an actionable selection page.',
            },
          ]}
          decisionSteps={[
            isChinese ? '先看这个分类是否适合你的任务。' : 'First check whether this category fits your task.',
            isChinese
              ? '再用对比页和指南页缩小 shortlist。'
              : 'Then use the comparison and guide pages to narrow the shortlist.',
            isChinese ? '最后进入具体工具页做最终判断。' : 'Finally open the tool pages for the final call.',
          ]}
          signalCards={evidenceSignalCards}
        />

        <div className='mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <section className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '选择建议' : 'How to choose'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? `${categoryName} 工具先看什么` : `What to look for in ${categoryName} tools`}
            </h2>
            <div className='mt-4 space-y-3'>
              {helperBullets.map((bullet) => (
                <div key={bullet} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  {bullet}
                </div>
              ))}
            </div>
          </section>

          <section className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? '这个分类页最常见的问题' : 'Common questions about this category'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-white p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {highIntentEntryPoints.length > 0 && (
          <section className='theme-surface mb-8 rounded-lg border border-cyan-100 bg-cyan-50/50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这几个入口' : 'Start here first'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? `把 ${categoryName} 分类先看清楚` : `Get clarity on ${categoryName} before browsing deeper`}
            </h2>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '先从对比页、指南页和代表工具开始，能更快收敛到真正值得打开的页面。'
                : 'Start with comparison pages, guides, and representative tools to narrow in on the pages that are most worth opening.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-3'>
              {highIntentEntryPoints.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='rounded-lg border border-cyan-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50/60'
                >
                  <p className='text-sm font-semibold text-slate-900'>{item.title[isChinese ? 'cn' : 'en']}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description[isChinese ? 'cn' : 'en']}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {decisionFocus.length > 0 && (
          <section className='theme-surface mb-8 rounded-lg border border-cyan-100 bg-cyan-50/50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这几个判断点' : 'Decision points to check first'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese
                ? `把 ${categoryName} 分类先比清楚`
                : `Compare the ${categoryName} category with a sharper lens`}
            </h2>
            <div className='mt-4 grid gap-3 md:grid-cols-3'>
              {decisionFocus.map((item) => (
                <div key={item.cn} className='rounded-lg border border-white bg-white p-4'>
                  <p className='text-sm leading-6 text-slate-700'>{item[isChinese ? 'cn' : 'en']}</p>
                </div>
              ))}
            </div>
            <div className='mt-5 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={primaryComparisonGuide?.href || '/guides/how-to-choose-ai-tools'}
                ctaId={`category_${categorySlug}_decision_compare`}
                ctaLabel={`Category ${categorySlug} decision compare`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '去看对比页' : 'Open the comparison page'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/submit'
                ctaId={`category_${categorySlug}_decision_submit`}
                ctaLabel={`Category ${categorySlug} decision submit`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
            </div>
          </section>
        )}

        {(comparisonGuides[0] || relatedGuides[0] || representativeTools[0]) && (
          <section className='theme-surface mb-8 rounded-lg border border-cyan-100 bg-cyan-50/50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '更高意图路径' : 'Higher-intent path'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese
                ? '先看对比，再看指南，最后看工具详情'
                : 'Compare first, read the guide, then open the tool page'}
            </h2>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你已经确定大方向，这条路径能让你更快从“这个分类到底适合谁”走到“具体该看哪些工具”。'
                : 'If you already know the broad direction, this path moves you from category-level context to the exact tools worth opening.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-3'>
              {comparisonGuides[0] && (
                <Link
                  href={comparisonGuides[0].href}
                  className='rounded-lg border border-cyan-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50/60'
                >
                  <p className='text-sm font-semibold text-slate-900'>
                    {isChinese ? '1. 先看对比页' : '1. Start with comparison'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {comparisonGuides[0].title[isChinese ? 'cn' : 'en']}
                  </p>
                </Link>
              )}
              {relatedGuides[0] && (
                <Link
                  href={relatedGuides[0].href}
                  className='rounded-lg border border-cyan-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50/60'
                >
                  <p className='text-sm font-semibold text-slate-900'>
                    {isChinese ? '2. 再看指南页' : '2. Read the guide'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {relatedGuides[0].title[isChinese ? 'cn' : 'en']}
                  </p>
                </Link>
              )}
              {representativeTools[0] && (
                <Link
                  href={representativeTools[0].href}
                  className='rounded-lg border border-cyan-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50/60'
                >
                  <p className='text-sm font-semibold text-slate-900'>
                    {isChinese ? '3. 最后看工具详情' : '3. Open the tool page'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {representativeTools[0].title[isChinese ? 'cn' : 'en']}
                  </p>
                </Link>
              )}
            </div>
            <p className='mt-4 text-xs leading-5 text-slate-500'>
              {isChinese
                ? '这条路径只展示最短的一步链路，避免把比较页、指南页和工具页同时铺得太散。'
                : 'This path keeps the chain short so comparison, guide, and tool pages do not compete for attention at the same time.'}
            </p>
          </section>
        )}

        {comparisonGuides.length > 0 && (
          <section className='theme-surface mb-8 rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先做对比' : 'Compare first'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? `${categoryName} 最值得先看的对比页` : `Best comparison pages for ${categoryName}`}
            </h2>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你已经知道自己在这个分类里要比较什么，先看对比页再回列表，会更快收敛到真正合适的工具。'
                : 'If you already know what you need to compare inside this category, start with the comparison page first and then come back to the list.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-2'>
              {comparisonGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <p className='text-sm font-semibold text-slate-900'>{guide.title[isChinese ? 'cn' : 'en']}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{guide.desc[isChinese ? 'cn' : 'en']}</p>
                </Link>
              ))}
            </div>
            <div className='mt-5 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href='/submit'
                ctaId={`category_${categorySlug}_submit_compare`}
                ctaLabel={`Category ${categorySlug} submit compare`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '看完对比后去提交' : 'Submit after comparing'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId={`category_${categorySlug}_claim_compare`}
                ctaLabel={`Category ${categorySlug} claim compare`}
                pageType='category'
                className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
              >
                {isChinese ? '工具方先来认领' : 'Owners can claim here'}
              </TrackableCtaLink>
            </div>
          </section>
        )}

        {categorySlug === 'other' && (
          <section className='theme-surface mb-8 rounded-lg border border-amber-200 bg-amber-50/60 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
              {isChinese ? 'Other 只是兜底桶' : 'Other is only a fallback bucket'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese
                ? '如果能归类，就尽量不要留在 Other'
                : 'If a tool can be categorized, avoid leaving it in Other'}
            </h2>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-700'>
              {isChinese
                ? '更好的做法是把它拆进 Research、Voice、Automation、Developer Tools 或 Web3 这些更具体的场景里。这样筛选、SEO 和后续运营都会更清楚。'
                : 'The better move is to move it into Research, Voice, Automation, Developer Tools, or Web3 so filtering, SEO, and ongoing operations stay clearer.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {[
                { href: '/categories/research?sort=popular', label: isChinese ? 'Research' : 'Research' },
                { href: '/categories/voice?sort=popular', label: isChinese ? 'Voice' : 'Voice' },
                { href: '/categories/automation?sort=popular', label: isChinese ? 'Automation' : 'Automation' },
                {
                  href: '/categories/developer-tools?sort=popular',
                  label: isChinese ? 'Developer Tools' : 'Developer Tools',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='rounded-lg border border-amber-200 bg-white p-4 transition hover:border-amber-300 hover:bg-amber-100/50'
                >
                  <p className='text-sm font-semibold text-slate-950'>{item.label}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese ? '点进去看更具体的子分类入口。' : 'Jump in and work from a more specific bucket.'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className='mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <section className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '从这里开始' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? `${categoryName} 分类推荐入口` : `Recommended entry points for ${categoryName}`}
            </h2>
            <p className='mt-3 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '先从指南和对比页建立判断，再回到列表页筛选，会更容易找到真正适合你的工具。'
                : 'Build context with a guide or comparison page first, then come back to the listing to filter with more confidence.'}
            </p>
            <div className='mt-5 grid gap-3'>
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <p className='text-sm font-semibold text-slate-900'>{guide.title[isChinese ? 'cn' : 'en']}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{guide.desc[isChinese ? 'cn' : 'en']}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '继续浏览' : 'Keep browsing'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? '相关入口与分类' : 'Related entry points and categories'}
            </h2>
            <div className='mt-5 space-y-3'>
              <Link
                href='/new'
                className='block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
              >
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? '回到本周新增' : 'Return to new this week'}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '如果你更想看最近补进和最近补厚的内容，先回本周新增页。'
                    : 'Go back to the weekly additions page if you want the freshest recently added and recently improved listings.'}
                </p>
              </Link>
              <Link
                href='/explore?sort=latest'
                className='block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
              >
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? '回到全部探索' : 'Return to all Explore'}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '如果这个分类还不够，再回到 Explore 扩大筛选范围。'
                    : 'If this category is still too narrow, go back to Explore and widen the search.'}
                </p>
              </Link>
              <Link
                href={`/explore?search=${encodeURIComponent(categoryName)}&sort=popular`}
                className='block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
              >
                <p className='text-sm font-semibold text-slate-900'>
                  {isChinese ? `浏览更多 ${categoryName} 工具` : `Browse more ${categoryName} tools`}
                </p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '按热度先看当前最常被浏览的候选。'
                    : 'Start with popularity to see the tools people are checking most often.'}
                </p>
              </Link>

              {adjacentCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/categories/${item.slug}?sort=popular`}
                  className='block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <p className='text-sm font-semibold text-slate-900'>{item.name}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '看看相邻分类里是否有更匹配的工具。'
                      : 'Check adjacent categories in case the better fit lives nearby.'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {representativeTools.length > 0 && (
          <section className='theme-surface mb-8 rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '代表工具入口' : 'Representative tool pages'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900'>
              {isChinese ? `先看这几个 ${categoryName} 代表页` : `Start with these ${categoryName} examples`}
            </h2>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你不想一开始就看太多卡片，这几个代表页能更快帮你建立“这一类工具到底怎么比较”的判断。'
                : 'If you do not want to scan too many cards right away, these representative pages are the fastest way to understand how tools in this category should be compared.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {representativeTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40'
                >
                  <p className='text-sm font-semibold text-slate-900'>{tool.title[isChinese ? 'cn' : 'en']}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{tool.description[isChinese ? 'cn' : 'en']}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ExploreList
          locale={params.locale}
          searchParams={searchParams}
          pageNum={pageNum}
          categories={categories}
          tags={tags}
          forcedCategorySlug={category.slug}
          basePath={basePath}
        />
      </div>
    </>
  );
}

import { notFound } from 'next/navigation';

import { GUIDE_PAGES } from '@/lib/content/guides';
import { generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import Search from '@/components/Search';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';
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

const VIRTUAL_DECISION_CATEGORIES: Record<
  string,
  { name: Record<string, string>; description: Record<string, string> }
> = {
  research: {
    name: { en: 'AI Research', cn: 'AI 研究' },
    description: {
      en: 'A decision hub for research, citations, literature review, and evidence-checking tools.',
      cn: '面向资料发现、引用追踪、文献整理和证据核对工具的决策中心。',
    },
  },
  voice: {
    name: { en: 'AI Voice', cn: 'AI 语音' },
    description: {
      en: 'A decision hub for transcription, speech generation, meetings, podcasts, and audio workflows.',
      cn: '面向转录、语音生成、会议、播客和音频工作流的决策中心。',
    },
  },
  automation: {
    name: { en: 'AI Automation', cn: 'AI 自动化' },
    description: {
      en: 'A decision hub for triggers, integrations, workflow orchestration, retries, and production reliability.',
      cn: '面向触发器、集成、流程编排、失败重试和生产可靠性的决策中心。',
    },
  },
  web3: {
    name: { en: 'Web3 Tools', cn: 'Web3 工具' },
    description: {
      en: 'A decision hub for on-chain research, protocol data, wallet monitoring, and developer infrastructure.',
      cn: '面向链上研究、协议数据、钱包监控和开发者基础设施的决策中心。',
    },
  },
  'developer-tools': {
    name: { en: 'AI Developer Tools', cn: 'AI 开发者工具' },
    description: {
      en: 'A decision hub for APIs, SDKs, coding workflows, observability, and production operations.',
      cn: '面向 API、SDK、编码工作流、可观测性和生产运维的决策中心。',
    },
  },
};

export default async function CategoryContent({ params, pageNum, searchParams }: CategoryContentProps) {
  const [categoryResult, categoriesResult, tagsResult] = await Promise.allSettled([
    getCategoryBySlug(params.slug, true),
    getAllCategories(true),
    getAllTags('count'),
  ]);
  const databaseCategory = categoryResult.status === 'fulfilled' ? categoryResult.value : null;
  const virtualCategory = VIRTUAL_DECISION_CATEGORIES[params.slug];
  const category =
    databaseCategory ||
    (virtualCategory
      ? {
          id: `virtual:${params.slug}`,
          slug: params.slug,
          name: virtualCategory.name,
          description: virtualCategory.description,
          icon: null,
          orderIndex: 0,
          createdAt: new Date('2026-08-31T00:00:00.000Z'),
          updatedAt: new Date('2026-08-31T00:00:00.000Z'),
          toolCount: 0,
        }
      : null);
  const isVirtualCategory = Boolean(!databaseCategory && virtualCategory);
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
        href: '/ai/fathom#decision-card',
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
        href: '/ai/gamma#decision-card',
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
        href: '/ai/notta#decision-card',
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
        href: '/ai/motion#decision-card',
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
        href: '/ai/dune#decision-card',
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
        href: '/ai/defillama#decision-card',
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
        href: '/ai/the-graph#decision-card',
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
        href: '/ai/nansen#decision-card',
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
        href: '/ai/perplexity#decision-card',
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
        href: '/ai/elicit#decision-card',
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
        href: '/ai/papers-with-code#decision-card',
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
        href: '/ai/hugging-face#decision-card',
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
        href: '/ai/elevenlabs#decision-card',
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
        href: '/ai/descript#decision-card',
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
        href: '/ai/notta#decision-card',
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
        href: '/ai/elevenlabs-conversational-ai#decision-card',
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
        href: '/ai/n8n#decision-card',
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
        href: '/ai/zapier#decision-card',
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
        href: '/ai/make#decision-card',
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
        href: '/ai/ifttt#decision-card',
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
        href: '/ai/cursor#decision-card',
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
        href: '/ai/alchemy#decision-card',
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
        href: '/ai/pinecone#decision-card',
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
        href: '/ai/v0#decision-card',
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
    productivity: [
      {
        cn: '先看它能否真正减少会议、日程和任务整理成本。',
        en: 'Start with whether it truly reduces meeting, scheduling, and task administration.',
      },
      {
        cn: '再看个人使用、团队席位、协作和权限边界。',
        en: 'Then compare solo use, team seats, collaboration, and permission boundaries.',
      },
      {
        cn: '最后检查导出、集成和长期工作流是否稳定。',
        en: 'Finish with exports, integrations, and long-term workflow reliability.',
      },
    ],
    automation: [
      {
        cn: '先看触发器、集成和定时任务能否覆盖真实流程。',
        en: 'Start with trigger, integration, and schedule coverage for the real workflow.',
      },
      {
        cn: '再看条件分支、数据传递和人工确认是否可控。',
        en: 'Then compare branching, data flow, and human approval controls.',
      },
      {
        cn: '最后检查日志、失败重试、权限和维护成本。',
        en: 'Finish with logs, retries, permissions, and maintenance cost.',
      },
    ],
    web3: [
      {
        cn: '先区分链上研究、钱包监控、协议数据和开发者基础设施。',
        en: 'First separate on-chain research, wallet monitoring, protocol data, and developer infrastructure.',
      },
      {
        cn: '再看链、协议、历史数据和实时更新覆盖。',
        en: 'Then compare chain, protocol, historical-data, and real-time coverage.',
      },
      {
        cn: '最后检查查询、导出、API、价格和数据风险。',
        en: 'Finish with queries, exports, APIs, pricing, and data risks.',
      },
    ],
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

  const hubStructureReviewedAt = '2026-09-06';

  const representativeTools = (representativeToolMap[categorySlug] || []).slice(0, 3);

  const decisionFocus = decisionFocusMap[categorySlug] || [];
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
  const faqSchema = generateFAQSchema(faqs);
  let toolCountLabel = isChinese ? `${categoryToolCount} 个已发布工具` : `${categoryToolCount} published tools`;
  if (isVirtualCategory) {
    toolCountLabel = isChinese
      ? `${representativeTools.length} 个精选入口`
      : `${representativeTools.length} curated entries`;
  }

  return (
    <>
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page container mx-auto px-4 py-8'>
        <SeoBreadcrumbs
          locale={params.locale}
          items={[
            { name: isChinese ? '首页' : 'Home', path: '/' },
            { name: isChinese ? '探索工具' : 'Explore', path: '/explore' },
            { name: categoryName, path: `/categories/${category.slug}` },
          ]}
          className='mb-5'
        />
        <section className='mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
          <p className='text-sm font-semibold text-cyan-700'>{isChinese ? '按场景浏览' : 'Browse by use case'}</p>
          <h1 className='mt-2 text-3xl font-bold text-slate-900 lg:text-4xl'>
            {isChinese ? `Best ${categoryName} AI 工具` : `Best ${categoryName} AI tools`}
          </h1>
          <p className='mt-3 text-slate-600'>{categoryDescription}</p>
          <p className='mt-3 text-sm text-slate-500'>{toolCountLabel}</p>
          <Search
            placeholder={isChinese ? '搜索工具、场景或产品名...' : 'Search tools, use cases, or product names...'}
            taskHint={isChinese ? '先按任务找' : 'Search by task'}
            taskSuggestions={taskSuggestions}
            className='mt-4 p-0 sm:p-0'
          />
          {decisionFocus.length > 0 && (
            <ul className='mt-4 grid list-disc gap-3 pl-4 text-sm leading-6 text-slate-700 sm:grid-cols-3'>
              {decisionFocus.map((item) => (
                <li key={item.cn}>{item[isChinese ? 'cn' : 'en']}</li>
              ))}
            </ul>
          )}
          <p className='mt-3 text-xs text-slate-500'>
            {isChinese ? '分类导航核查于' : 'Category navigation checked'} {hubStructureReviewedAt}
            {isChinese ? '；各工具事实请查看详情页来源日期。' : '; see each tool’s source dates for product facts.'}
          </p>
        </section>
        {!isVirtualCategory ? (
          <ExploreList
            locale={params.locale}
            searchParams={searchParams}
            pageNum={pageNum}
            categories={categories}
            tags={tags}
            forcedCategorySlug={category.slug}
            basePath={basePath}
          />
        ) : null}
        {representativeTools.length > 0 && (
          <div className='mt-8'>
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
              <p className='mt-2 max-w-3xl text-xs leading-5 text-slate-500' data-category-fact-boundary>
                {isChinese
                  ? '卡片只说明为什么把该页面作为导航入口；价格、功能、限制、证据日期和判断状态均以对应工具详情页为准。'
                  : 'These cards only explain why a page is a useful navigation entry. Pricing, features, limits, evidence dates, and decision status come from the linked tool page.'}
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
          </div>
        )}
        <nav
          data-category-decision-links
          className='my-8 flex flex-wrap gap-4 text-sm font-semibold text-cyan-800'
          aria-label={isChinese ? '相关选择指南' : 'Related selection guides'}
        >
          {relatedGuides
            .filter((guide) => !guide.href.endsWith('-comparison'))
            .slice(0, 2)
            .map((guide) => (
              <Link key={guide.href} href={guide.href} className='underline'>
                {guide.title[isChinese ? 'cn' : 'en']}
              </Link>
            ))}
          <Link href='/explore' className='underline'>
            {isChinese ? '探索全部工具' : 'Explore all tools'}
          </Link>
        </nav>
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
    </>
  );
}

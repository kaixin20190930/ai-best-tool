import { notFound } from 'next/navigation';

import { GUIDE_PAGES } from '@/lib/content/guides';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
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
  const comparisonGuides = (guideHrefMap[categorySlug] || [])
    .map((href) => GUIDE_PAGES.find((page) => page.href === href))
    .filter((page): page is (typeof GUIDE_PAGES)[number] => Boolean(page))
    .filter((page) => page.href.endsWith('-comparison'));
  const primaryComparisonGuide = comparisonGuides[0] || relatedGuides[0] || null;
  const priorityCategorySlugs = ['developer-tools', 'research', 'voice', 'text-writing'];
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

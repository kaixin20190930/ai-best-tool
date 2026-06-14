import { notFound } from 'next/navigation';

import { GUIDE_PAGES } from '@/lib/content/guides';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
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
  const [category, categories, tags] = await Promise.all([
    getCategoryBySlug(params.slug, true),
    getAllCategories(true),
    getAllTags('count'),
  ]);

  if (!category) {
    notFound();
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
    web3: ['/guides/ai-tools-for-web3', '/guides/ai-tools-for-web3-comparison'],
    research: ['/guides/ai-seo-tools', '/guides/ai-tools-for-crypto-research'],
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
    .slice(0, 4);
  const comparisonGuides = (guideHrefMap[categorySlug] || [])
    .map((href) => GUIDE_PAGES.find((page) => page.href === href))
    .filter((page): page is (typeof GUIDE_PAGES)[number] => Boolean(page))
    .filter((page) => page.href.endsWith('-comparison'));
  const adjacentCategories = categories
    .filter((item) => item.slug !== category.slug)
    .slice(0, 4)
    .map((item) => ({
      slug: String(item.slug),
      name: getLocalizedField(item.name, params.locale),
    }));
  const representativeTools = representativeToolMap[categorySlug] || [];
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
              {'toolCount' in category && (
                <p className='mt-4 text-sm font-medium text-slate-500'>
                  {category.toolCount} {isChinese ? '个已发布工具' : 'published tools'}
                </p>
              )}
            </div>
            <Link
              href='/submit'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交这个分类的工具' : 'Submit a tool'}
            </Link>
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

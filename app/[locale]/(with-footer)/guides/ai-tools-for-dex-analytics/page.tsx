import { Metadata } from 'next';
import { BarChart4, ExternalLink, Layers3, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI DEX 分析工具推荐 | AI Best Tool'
        : `AI tools for DEX analytics | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向交易对分析、流动性观察和 DEX 研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for DEX analytics, pair analysis, and liquidity observation.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-15';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const faqs = [
    {
      question: isChinese ? 'DEX 分析工具最适合用来做什么？' : 'What are DEX analytics tools best used for?',
      answer: isChinese
        ? '通常用于交易对观察、流动性监测、池子对比、价格追踪和 DEX 研究。'
        : 'They are commonly used for pair observation, liquidity monitoring, pool comparison, price tracking, and DEX research.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的链、DEX、数据源和是否有足够清晰的历史数据。'
        : 'Start with supported chains, DEXes, data sources, and whether it has clear historical data.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合做轻量查看，但如果你要更深的历史、更多对比维度和导出，通常需要升级。'
        : 'Good for lightweight viewing, but deeper history, more comparison dimensions, and exports usually require a paid plan.',
    },
    {
      question: isChinese ? '我可以直接从这里找到 DEX 工具吗？' : 'Can I find DEX tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在看交易对、池子，还是整体流动性。',
        '看它是否支持你常用的链和 DEX 数据。',
        '如果给团队使用，优先看 API、导出、告警和历史追踪能力。',
      ]
    : [
        'Separate the use case first: pairs, pools, or overall liquidity.',
        'Check whether it supports the chains and DEX data you actually use.',
        'For team use, prioritize API access, exports, alerts, and historical tracking.',
      ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          { name: isChinese ? 'DEX 工具' : 'DEX tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-dex-analytics` },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'DEX 分析工具推荐' : 'DEX analytics tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '交易对与流动性优先' : 'Pairs and liquidity first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI DEX 分析工具推荐：从交易对到流动性观察，怎么选更合适'
              : 'AI tools for DEX analytics: how to choose for pairs and liquidity observation'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'DEX 分析工具重点不是“图表多”，而是能不能稳定连接交易对和池子数据，并且方便你做观察、对比和追踪。'
              : 'DEX analytics tools are not just about charts. They need reliable access to pair and pool data and a smooth way to observe, compare, and track what matters.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=dex&sort=popular'
              ctaId='dex_analytics_guide_browse_tools'
              ctaLabel='DEX analytics guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 DEX 工具' : 'Browse DEX tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='dex_analytics_guide_top_list'
              ctaLabel='DEX analytics guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-defi-analytics'
              ctaId='dex_analytics_guide_defi'
              ctaLabel='DEX analytics guide DeFi guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 DeFi 指南' : 'Back to DeFi guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-dex-analytics-comparison'
              ctaId='dex_analytics_guide_comparison'
              ctaLabel='DEX analytics guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 DEX 对比页' : 'DEX comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看交易对覆盖，再看流动性与追踪' : 'Start with pair coverage, then liquidity and tracking'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <BarChart4 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'DEX 工具通常在这些分类里' : 'DEX tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    String(category.slug).includes('web3') ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('web3'),
                )
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                  >
                    <span>{getLocalizedField(category.name, locale)}</span>
                    <span className='text-xs text-slate-500'>
                      {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                    </span>
                  </Link>
                ))}
            </div>
          </aside>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道自己在找 DEX 工具，先走 Web3 榜单'
              : 'If DEX is already the lane, open the Web3 ranking first'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-web3-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 榜单' : 'Web3 ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看更高相关的 Web3 候选，再决定是否进入 DEX 的窄对比。'
                  : 'Start with the highest-fit Web3 candidates, then decide whether you need the narrower DEX comparison.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-tools-for-dex-analytics-comparison'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'DEX 对比页' : 'DEX comparison'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当你已经有候选，直接比较交易对、池子和流动性能力。'
                  : 'Once you already have candidates, compare pair, pool, and liquidity capabilities side by side.'}
              </p>
            </Link>
            <Link
              href='/categories/web3?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? 'Web3 分类' : 'Web3 category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '直接浏览真实 Web3 条目，再回头收窄到 DEX 候选。'
                  : 'Browse real Web3 listings first, then narrow back down to DEX-specific candidates.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 DEX shortlist' : 'Use the ranking to narrow your DEX shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在找交易对、池子或流动性观察工具，先看榜单会比只看入口页更快进入决策。'
              : 'If the decision is already about pairs, pools, or liquidity observation tools, the ranking gets you to a decision faster than an entry page alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 榜单' : 'Web3 ranking',
                desc: isChinese ? '先看最值得试的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-dex-analytics-comparison',
                title: isChinese ? 'DEX 对比' : 'DEX comparison',
                desc: isChinese ? '交易对、池子和流动性一起看。' : 'Compare pairs, pools, and liquidity together.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics-comparison',
                title: isChinese ? 'DeFi 对比' : 'DeFi comparison',
                desc: isChinese ? '如果你还想把协议层一起看。' : 'Useful when the protocol layer is also in scope.',
              },
              {
                href: '/categories/web3?sort=popular',
                title: isChinese ? 'Web3 分类' : 'Web3 category',
                desc: isChinese
                  ? '先看真实条目，再缩窄到 DEX 候选。'
                  : 'Browse real listings first, then narrow back to DEX candidates.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`dex_analytics_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断 DEX 分析工具是否真的能让交易对、池子和流动性观察更清晰，而不是只看图表数量。'
              : 'This page checks whether DEX analytics tools truly make pair, pool, and liquidity observation clearer rather than only offering more charts.'
          }
          checkedAt={checkedAt}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '交易对、池子、流动性、追踪' : 'Pairs, pools, liquidity, tracking',
              note: isChinese
                ? `重点看能否支撑持续观察和比较；当前分类数 ${categoryCount} 个。`
                : `Focus on whether it supports ongoing observation and comparison; current category count is ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Core page kept indexable',
              note: isChinese
                ? '与 Web3 分析和 DeFi 页形成清晰分工。'
                : 'Keep a clear split from Web3 analysis and DeFi pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实交易与池子样例' : 'Add real pair and pool examples',
              note: isChinese
                ? `后续优先补监控截图、历史变化和流动性追踪，并保留 ${checkedAt} 的核对痕迹。`
                : `Next, add monitoring screenshots, historical changes, and liquidity tracking while keeping the ${checkedAt} verification trail.`,
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要的是交易对分析、池子观察，还是流动性追踪。'
              : 'First decide whether you need pair analysis, pool observation, or liquidity tracking.',
            isChinese
              ? '如果目标已经明确，就先看更窄的 DEX 对比页和 Web3 研究页。'
              : 'If the target is already clear, start with the narrower DEX comparison and Web3 research pages.',
            isChinese
              ? '如果还要给团队留证据，再回到 DEX 分析页补真实监控图和历史变化。'
              : 'If you still need evidence for a team, come back to add real monitoring screenshots and historical changes.',
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `这页已按真实 DEX 分析决策重新核对，优先保留交易对、池子和流动性入口；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real DEX-analytics decision and keeps pairs, pools, and liquidity entry points visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化交易对分析证据' : 'Keep it indexable and strengthen pair-analysis evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用监控截图、历史变化和流动性追踪来区分它与 Web3 总览页。'
                : 'Use monitoring screenshots, historical changes, and liquidity tracking to distinguish it from broad Web3 pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实池子和流动性案例' : 'Add real pool and liquidity cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补真实交易对、池子和流动性变化样例，并持续保留 ${checkedAt} 的核对记录。`
                : `Next, prioritize real pairs, pools, and liquidity change examples while keeping the ${checkedAt} check record up to date.`}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'DEX 工具看什么' : 'What matters for DEX tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你看交易对和池子' : 'Can it reliably support pair and pool analysis?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'DEX 工具最重要的是交易对覆盖、历史数据和告警能力。'
                  : 'Pair coverage, historical data, and alerting matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运营，优先看导出、API、监控和对多 DEX 的支持。'
                  : 'If you do research or operations, prioritize exports, API access, monitoring, and multi-DEX support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'DEX 工具最常见的问题' : 'Common questions about DEX tools'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_dex_analytics' />
      </div>
    </>
  );
}

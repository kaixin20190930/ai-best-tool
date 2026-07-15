import { Metadata } from 'next';
import { BarChart3, ExternalLink, Layers3, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 协议分析工具推荐 | AI Best Tool'
        : `AI tools for protocol analytics | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向协议健康观察、使用量分析和研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for protocol analytics, protocol health monitoring, and usage analysis.',
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
      question: isChinese ? '协议分析工具最适合用来做什么？' : 'What are protocol analytics tools best used for?',
      answer: isChinese
        ? '通常用于协议健康监测、使用量分析、趋势观察和研究。'
        : 'They are commonly used for protocol health monitoring, usage analysis, trend watching, and research.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的协议、链和数据源，以及是否便于长期观察。'
        : 'Start with supported protocols, chains, and data sources, and whether it works well for long-term observation.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合基础观察；如果你需要更长历史、更多维度和团队协作，通常要升级。'
        : 'Good for basic observation; longer history, more dimensions, and team collaboration usually require a paid plan.',
    },
    {
      question: isChinese ? '我可以直接从这里找到协议工具吗？' : 'Can I find protocol tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在看协议健康、使用量，还是研究趋势。',
        '看它是否支持你关心的链和数据源。',
        '如果给团队使用，优先看 API、导出、告警和历史追踪能力。',
      ]
    : [
        'Separate the use case first: protocol health, usage, or trend research.',
        'Check whether it supports the chains and data sources you actually care about.',
        'For team use, prioritize API access, exports, alerts, and historical tracking.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-protocol-analytics-comparison',
      title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
      desc: isChinese ? '协议覆盖、历史和趋势一起看。' : 'Compare coverage, history, and trends together.',
    },
    {
      href: '/guides/ai-tools-for-defi-analytics-comparison',
      title: isChinese ? 'DeFi 对比页' : 'DeFi comparison',
      desc: isChinese ? '如果问题更偏 TVL 和资金流。' : 'Best when TVL and capital flow matter most.',
    },
    {
      href: '/guides/ai-tools-for-web3-analysis-comparison',
      title: isChinese ? 'Web3 分析对比' : 'Web3 analysis comparison',
      desc: isChinese ? '链上研究和监控更聚焦。' : 'Keep on-chain research and monitoring in focus.',
    },
  ];

  return (
    <>
      <StructuredDataServer
        data={generateBreadcrumbSchema([
          { name: 'Home', url: `${siteUrl}/${locale}` },
          { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
          {
            name: isChinese ? '协议工具' : 'Protocol tools',
            url: `${siteUrl}/${locale}/guides/ai-tools-for-protocol-analytics`,
          },
        ])}
      />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? '协议分析工具推荐' : 'Protocol analytics tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <ShieldCheck className='size-4' />
              {isChinese ? '健康与趋势优先' : 'Health and trends first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 协议分析工具推荐：从协议健康到使用量分析，怎么选更合适'
              : 'AI tools for protocol analytics: how to choose for health monitoring and usage analysis'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '协议分析工具重点不是“数据多”，而是能不能稳定连接协议数据，并且方便你做观察、对比和追踪。'
              : 'Protocol analytics tools are not just about having lots of data. They need reliable access to protocol data and a smooth way to observe, compare, and track what matters.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=protocol&sort=popular'
              ctaId='protocol_analytics_guide_browse_tools'
              ctaLabel='Protocol analytics guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看协议工具' : 'Browse protocol tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='protocol_analytics_guide_top_list'
              ctaLabel='Protocol analytics guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-defi-analytics'
              ctaId='protocol_analytics_guide_defi'
              ctaLabel='Protocol analytics guide DeFi guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 DeFi 指南' : 'Back to DeFi guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-protocol-analytics-comparison'
              ctaId='protocol_analytics_guide_comparison'
              ctaLabel='Protocol analytics guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看协议对比页' : 'Protocol comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看协议覆盖，再看使用量与趋势' : 'Start with protocol coverage, then usage and trends'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <BarChart3 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '协议工具通常在这些分类里' : 'Protocol tools often sit in these categories'}
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
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到协议页面' : 'Compare first, then come back to protocol pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是在做协议分析，就别在总览页停太久，直接去更窄的榜单和对比页。'
              : 'If protocol analytics is already the real task, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`protocol_analytics_guide_${item.href.split('/').pop()}`}
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
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '协议分析页要围绕协议健康、使用量和趋势观察来做，不要和链上分析、DeFi 分析混在一起。这个页继续可索引，但会把更窄的协议和 DeFi 路径分层处理。'
              : 'This protocol analytics page should stay centered on protocol health, usage, and trend watching rather than blending into on-chain or DeFi analysis. Keep it indexable, but separate narrower protocol and DeFi paths clearly.'
          }
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '健康、使用量、趋势' : 'Health, usage, trends',
              note: isChinese
                ? `结合 ${categoryCount} 个分类一起核对，确认它是否真的能支撑长期观察。`
                : `Review it together with ${categoryCount} categories and confirm it actually supports long-term monitoring.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到 DeFi/链上页' : 'Route to DeFi/on-chain pages',
              note: isChinese
                ? '如果需求更偏资金流或地址追踪，就转过去。'
                : 'If the need leans toward fund flow or address tracking, route there.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '协议案例、曲线、周期' : 'Protocol cases, charts, periods',
              note: isChinese
                ? `补真实协议趋势和周期性证据，并保持 ${checkedAt} 的核对痕迹。`
                : `Add real protocol trend and time-series evidence while keeping the ${checkedAt} check trail.`,
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看历史深度和报表权限' : 'Check historical depth and reporting permissions first',
              note: isChinese
                ? '协议分析常把更深的历史窗口锁进高价层。'
                : 'Protocol analytics often gates deeper history behind higher plans.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看协议、指标和趋势是否持续更新'
                : 'Check whether protocols, metrics, and trends are updated',
              note: isChinese
                ? '协议变化快，旧趋势会误导决策。'
                : 'Protocols change quickly, and stale trends can mislead decisions.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '没有真实健康指标就先降级' : 'Downgrade it without real health metrics',
              note: isChinese ? '只有图表没有解释，不够用。' : 'Charts without explanation are not enough.',
            },
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
                ? `这页已按真实协议分析决策重新核对，当前共 ${categoryCount} 个分类，优先保留健康、使用量和趋势入口。`
                : `This page has been rechecked against a real protocol-analytics decision, with ${categoryCount} categories reviewed, and keeps health, usage, and trend entry points visible.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化趋势研究证据' : 'Keep it indexable and strengthen trend-research evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `用协议案例、时间序列和周期分析区分它与链上页，并保持 ${checkedAt} 的审计痕迹。`
                : `Use protocol cases, time-series views, and cycle analysis to distinguish it from on-chain pages while keeping the ${checkedAt} audit trail.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实协议曲线和周期' : 'Add real protocol charts and cycles'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补真实协议趋势、周期性证据和案例，继续保留 ${checkedAt} 的核对痕迹。`
                : `Next, prioritize real protocol trends, time-series evidence, and cases while keeping the ${checkedAt} check trail visible.`}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近协议健康与使用量研究的入口' : 'Real entry points for protocol health and usage research'
          }
          description={
            isChinese
              ? '如果你关心的是协议覆盖、历史数据、趋势观察和对比研究，这几款工具会比泛 Web3 页更快把范围收窄。'
              : 'If protocol coverage, historical data, trend watching, and comparative research matter most, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['messari', 'footprint', 'token-terminal', 'defillama']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={
            isChinese ? '协议分析意图更强的下一步入口' : 'Next paths for stronger protocol-analytics intent'
          }
          compareDescription={
            isChinese
              ? '当你已经明确自己是在找协议分析工具，而不是钱包监控或泛研究工具，继续进入更窄的比较页会更有效。'
              : 'Once the real job is protocol analytics rather than wallet monitoring or broad research, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先看更高相关的 Web3 候选，再决定是否进入更窄的协议分析对比。'
                : 'Start with the highest-fit Web3 candidates, then decide whether you need the narrower protocol-analytics comparison.',
            },
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '适合直接横向看协议覆盖、历史深度和研究贴合度。'
                : 'A direct side-by-side path for protocol coverage, history depth, and research fit.',
            },
            {
              href: '/guides/ai-tools-for-defi-analytics-comparison',
              title: isChinese ? 'DeFi 分析工具对比' : 'DeFi analytics comparison',
              description: isChinese
                ? '如果你发现问题更偏 DeFi 资金和协议细分，这页更合适。'
                : 'More useful if the real decision is shifting toward DeFi-specific protocol and fund analysis.',
            },
            {
              href: '/guides/ai-tools-for-web3-comparison',
              title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
              description: isChinese
                ? '适合还没完全确定自己在选协议、钱包还是研究工具。'
                : 'Good when you are not yet fully narrowed into protocol, wallet, or research tooling.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese
              ? '协议方向明确后，继续这样收窄'
              : 'How to narrow the space once protocol analytics is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确在找协议工具，下一步就看 Web3 榜单、分类和搜索结果继续筛。'
              : 'Once protocol analytics is clearly the lane, the next step is to use the Web3 ranking, category, and search results to compare real candidates.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? '进入 Web3 榜单' : 'Open the Web3 ranking',
              description: isChinese
                ? '先从更高相关的 Web3 候选集合开始。'
                : 'Start with the highest-fit Web3 shortlist.',
            },
            {
              href: '/categories/web3?sort=popular',
              title: isChinese ? '进入 Web3 分类' : 'Open the Web3 category',
              description: isChinese
                ? '回到 Web3 目录继续看真实协议条目。'
                : 'Return to the Web3 directory for real protocol-oriented listings.',
            },
            {
              href: '/explore?search=protocol&sort=popular',
              title: isChinese ? '搜索更多协议工具' : 'Search more protocol tools',
              description: isChinese
                ? '回到 Explore，用更窄的 protocol 关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with protocol-specific search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '协议工具看什么' : 'What matters for protocol tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你看协议和趋势' : 'Can it reliably support protocol and trend work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '协议工具最重要的是协议覆盖、历史数据和告警能力。'
                  : 'Protocol coverage, historical data, and alerting matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运营，优先看导出、API、监控和对多协议的支持。'
                  : 'If you do research or operations, prioritize exports, API access, monitoring, and multi-protocol support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '协议工具最常见的问题' : 'Common questions about protocol tools'}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小协议 shortlist' : 'Use the ranking to narrow your protocol shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比协议健康、历史数据、趋势和研究能力，先看榜单会比泛 Web3 目录更快进入决策。'
              : 'If the decision is already about protocol health, historical data, trends, and research capability, the ranking gets you to a decision faster than a broad Web3 directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
                desc: isChinese
                  ? '先从更高相关的 Web3 候选开始。'
                  : 'Start with the highest-fit Web3 candidates first.',
              },
              {
                href: '/best-ai-tools/ai-api-observability-tools',
                title: isChinese ? '可观测榜单' : 'Observability ranking',
                desc: isChinese
                  ? '如果你还要看日志、追踪和质量治理。'
                  : 'Useful when logs, tracing, and quality governance are also in scope.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
                desc: isChinese ? '协议覆盖、历史和趋势一起看。' : 'Compare coverage, history, and trends together.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics-comparison',
                title: isChinese ? 'DeFi 分析对比' : 'DeFi analytics comparison',
                desc: isChinese ? '如果问题更偏 TVL 和资金流。' : 'Best when TVL and capital flow matter most.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`protocol_analytics_guide_ranking_${item.href.split('/').pop()}`}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_protocol_analytics' />
      </div>
    </>
  );
}

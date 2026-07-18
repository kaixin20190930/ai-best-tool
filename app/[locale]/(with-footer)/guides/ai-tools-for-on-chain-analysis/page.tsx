import { Metadata } from 'next';
import { Activity, ExternalLink, Layers3, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
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
        ? 'AI 链上分析工具推荐 | AI Best Tool'
        : `AI tools for on-chain analysis | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向链上分析、地址追踪和资金流研究的 AI 工具选型指南。'
        : 'A practical guide to AI tools for on-chain analysis, address tracking, and fund-flow research.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-18';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    {
      name: isChinese ? '链上分析工具' : 'On-chain analysis tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-on-chain-analysis`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '链上分析工具最适合做什么？' : 'What are on-chain analysis tools best used for?',
      answer: isChinese
        ? '适合地址追踪、资金流分析、鲸鱼行为观察、项目研究和交易复盘。'
        : 'They are great for address tracking, fund-flow analysis, whale watching, project research, and trade review.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它支持的链、历史数据范围、数据刷新频率和导出方式。'
        : 'Start with supported chains, history depth, refresh frequency, and export options.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合轻量查询和基础追踪；如果你要长历史、API、告警或团队协作，通常要升级。'
        : 'Good for light queries and basic tracking. Long history, API access, alerts, and team collaboration usually require paid plans.',
    },
    {
      question: isChinese ? '我可以直接从这里找到相关工具吗？' : 'Can I find related tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你需要的是地址追踪、资金流、鲸鱼监控还是项目研究。',
        '看它的数据源和历史覆盖是否足够完整。',
        '如果要团队使用，优先看 API、导出、告警和权限控制。',
      ]
    : [
        'Separate the use case first: address tracking, fund flow, whale monitoring, or project research.',
        'Check whether the data sources and history coverage are complete enough.',
        'For team use, prioritize API access, exports, alerts, and permission controls.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-on-chain-analysis-comparison',
      title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
      desc: isChinese
        ? '地址、资金流和链上行为一起看。'
        : 'Compare addresses, fund flows, and on-chain behavior together.',
    },
    {
      href: '/guides/ai-tools-for-wallet-monitoring-comparison',
      title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
      desc: isChinese ? '如果重点转向提醒和异动监控。' : 'Useful when alerts and anomaly monitoring matter more.',
    },
    {
      href: '/guides/ai-tools-for-protocol-analytics-comparison',
      title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
      desc: isChinese
        ? '如果你要把资金流和协议健康一起看。'
        : 'Use this when fund flow and protocol health belong together.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? '链上分析工具推荐' : 'On-chain analysis tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Activity className='size-4' />
              {isChinese ? '地址与资金流优先' : 'Address and fund flow first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 链上分析工具推荐：从地址追踪到资金流分析，怎么选更合适'
              : 'AI tools for on-chain analysis: how to choose for address tracking and fund-flow research'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '链上分析工具的重点不是“图表多”，而是能不能稳定追踪地址、看清资金流，并且支持你实际的研究节奏。'
              : 'On-chain analysis tools are not just about charts. They need reliable address tracking, clear fund-flow views, and a fit for your actual research rhythm.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=on-chain&sort=popular'
              ctaId='on_chain_analysis_guide_browse_tools'
              ctaLabel='On-chain analysis guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看链上分析工具' : 'Browse on-chain tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='on_chain_analysis_guide_top_list'
              ctaLabel='On-chain analysis guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3'
              ctaId='on_chain_analysis_guide_web3'
              ctaLabel='On-chain analysis guide Web3 guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-on-chain-analysis-comparison'
              ctaId='on_chain_analysis_guide_comparison'
              ctaLabel='On-chain analysis guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看链上分析对比页' : 'On-chain comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看地址追踪，再看资金流' : 'Start with address tracking, then fund flow'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <Search className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '链上分析工具通常在这些分类里' : 'On-chain tools often sit in these categories'}
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
            {isChinese
              ? '先看榜单和对比，再回到链上分析页'
              : 'Compare first, then come back to on-chain analysis pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要做的是地址追踪、资金流分析或鲸鱼监控，就直接去更窄的榜单和对比页。'
              : 'If the real job is address tracking, fund-flow analysis, or whale monitoring, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`on_chain_analysis_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小链上分析 shortlist'
              : 'Use the ranking to narrow your on-chain analysis shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比地址追踪、资金流分析和鲸鱼监控，先看榜单会比泛目录更快进入决策。'
              : 'If the decision is already about address tracking, fund-flow analysis, and whale monitoring, the ranking gets you to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
                desc: isChinese
                  ? '先收窄到更高相关的 Web3 候选。'
                  : 'Start with the highest-fit Web3 candidates first.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
                desc: isChinese
                  ? '地址、资金流和行为一起看。'
                  : 'Compare addresses, fund flows, and behavior together.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc: isChinese ? '如果你开始更关心提醒和异动。' : 'Useful when alerts and anomalies matter more.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: isChinese ? '协议分析对比' : 'Protocol analytics comparison',
                desc: isChinese
                  ? '如果资金流和协议健康要一起看。'
                  : 'Helpful when fund flow and protocol health belong together.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`on_chain_analysis_guide_ranking_${item.href.split('/').pop()}`}
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
              ? '链上分析页要围绕地址追踪、资金流和行为复盘来做，不要和协议分析、钱包监控混成一页。这个页继续保持可索引，但会把钱包研究、协议分析和监控入口分层，减少重复。'
              : 'This on-chain analysis page should stay focused on address tracking, fund flow, and behavior review instead of blending with protocol analytics or wallet monitoring. Keep it indexable, but layer wallet research, protocol analytics, and monitoring paths to reduce overlap.'
          }
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '追踪、资金流、复盘' : 'Tracking, fund flow, review',
              note: isChinese
                ? `先确认它是否真能支撑复盘和研究。当前可用分类数：${categoryCount}。`
                : `Confirm it really supports review and research. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到协议/钱包页' : 'Route to protocol/wallet pages',
              note: isChinese
                ? '如果真正需求更像协议健康或钱包监控，就转页。'
                : 'If the real job is protocol health or wallet monitoring, route elsewhere.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '真实地址案例、图谱、截图' : 'Real address cases, charts, screenshots',
              note: isChinese
                ? `补真实链上案例和可验证图谱，并保持 ${checkedAt} 的核对记录。`
                : `Add real on-chain cases and verifiable visuals while keeping the ${checkedAt} verification record.`,
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看查询额度和导出限制' : 'Check query quotas and export limits first',
              note: isChinese
                ? '链上分析常把深度查询放进更高层级。'
                : 'On-chain analysis often gates deep queries behind higher tiers.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看数据源、地址标签和仪表盘是否更新'
                : 'Check whether data sources, labels, and dashboards are updated',
              note: isChinese
                ? '链上变化快，旧数据会直接误导判断。'
                : 'On-chain data changes fast, so stale data misleads quickly.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '没有可复核证据就先降级' : 'Downgrade it without verifiable evidence',
              note: isChinese
                ? '只看到图表不够，必须能追到证据。'
                : 'Charts alone are not enough; you need traceable evidence.',
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要的是地址追踪、资金流分析，还是行为复盘。'
              : 'First decide whether you need address tracking, fund flow analysis, or behavior review.',
            isChinese
              ? '如果目标已经很明确，就先看更窄的钱包研究和协议分析页。'
              : 'If the goal is already clear, start with the narrower wallet research and protocol analytics pages.',
            isChinese
              ? '如果还要给团队留证据，再回到链上分析页补真实案例、图谱和截图。'
              : 'If you still need evidence for a team, come back for real cases, charts, and screenshots.',
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
                ? `这页已按真实链上分析决策重新核对，优先保留追踪、资金流和复盘入口，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real on-chain analysis decision and keeps tracking, fund flow, and review entry points visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化地址研究证据' : 'Keep it indexable and strengthen address-research evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用地址案例、图谱和可验证截图区分它与协议页。'
                : 'Use address cases, charts, and verifiable screenshots to distinguish it from protocol pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实地址案例和图谱' : 'Add real address cases and charts'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实地址复盘、图谱和截图。'
                : 'Next, prioritize real address retros, charts, and screenshots.'}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近链上研究工作的入口' : 'Real entry points for on-chain research workflows'}
          description={
            isChinese
              ? '如果你最关心地址追踪、资金流、协议健康和大户行为，这些工具会比泛 Web3 页更快进入高意图决策。'
              : 'If address tracking, fund flow, protocol health, and whale behavior matter most, these tools narrow the space faster than a broad Web3 page.'
          }
          toolNames={['dune', 'nansen', 'defillama', 'arkham']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '链上意图更强的下一步入口' : 'Next paths for stronger on-chain intent'}
          compareDescription={
            isChinese
              ? '当你已经知道自己是在做链上研究，而不是泛资讯浏览，继续进入更窄的对比页更有效。'
              : 'Once you know the work is truly on-chain research rather than general browsing, narrower comparison pages become more useful.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先缩到更高相关的 Web3 候选，再决定要不要继续下钻到链上分析对比。'
                : 'Narrow to the highest-fit Web3 candidates first, then decide whether you need a deeper on-chain comparison.',
            },
            {
              href: '/guides/ai-tools-for-on-chain-analysis-comparison',
              title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
              description: isChinese
                ? '适合地址、资金流和链上行为的直接横向比较。'
                : 'A direct side-by-side path for addresses, fund flow, and on-chain behavior.',
            },
            {
              href: '/guides/ai-tools-for-wallet-monitoring-comparison',
              title: isChinese ? '钱包监控工具对比' : 'Wallet monitoring comparison',
              description: isChinese
                ? '如果你更关心提醒和异动，而不只是研究，这页更贴近目标。'
                : 'More useful when alerts and anomalies matter as much as research depth.',
            },
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '如果你在看协议表现、使用量和健康指标，这里更对路。'
                : 'A better fit when protocol usage, health, and trend metrics are the real decision points.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '链上方向确定后，继续这样收窄' : 'How to narrow the space once on-chain is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确在找链上研究工具，下一步就看 Web3 榜单、分类和搜索结果里的真实候选。'
              : 'Once on-chain analysis is clearly the right lane, the next step is to use the Web3 ranking, category, and search results to compare real candidates.'
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
                ? '回到 Web3 目录继续看真实条目。'
                : 'Return to the Web3 directory for real listings.',
            },
            {
              href: '/explore?search=on-chain&sort=popular',
              title: isChinese ? '搜索更多链上分析工具' : 'Search more on-chain tools',
              description: isChinese
                ? '回到 Explore，用更窄的链上关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with on-chain-specific search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '链上分析工具看什么' : 'What matters for on-chain tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做研究和监控' : 'Can it reliably support research and monitoring?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '链上分析工具最重要的是数据源稳定、地址追踪清晰、资金流视图好读。'
                  : 'Stability of data sources, clear address tracking, and readable fund-flow views matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做研究或运维，优先看历史查询、导出、告警和 API 能力。'
                  : 'If you do research or operations, prioritize historical queries, exports, alerts, and API access.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '链上分析工具最常见的问题' : 'Common questions about on-chain tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_on_chain_analysis' />
      </div>
    </>
  );
}

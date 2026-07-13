import { Metadata } from 'next';
import { BellRing, ExternalLink, Layers3, Search } from 'lucide-react';
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
        ? 'AI 钱包监控工具推荐 | AI Best Tool'
        : `AI tools for wallet monitoring | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向钱包监控、地址提醒和异常观察的 AI 工具选型指南。'
        : 'A practical guide to AI tools for wallet monitoring, address alerts, and anomaly watching.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-14';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    {
      name: isChinese ? '钱包监控工具' : 'Wallet monitoring tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-wallet-monitoring`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '钱包监控工具最适合做什么？' : 'What are wallet monitoring tools best used for?',
      answer: isChinese
        ? '适合地址提醒、资金流监控、异常交易追踪、黑名单观察和资产变动通知。'
        : 'They are ideal for address alerts, fund-flow monitoring, anomaly tracking, blacklist watching, and asset movement notifications.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看提醒延迟、支持的链、阈值设置和通知渠道。'
        : 'Start with alert latency, supported chains, threshold controls, and notification channels.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量观察常常够用，但如果你需要多地址监控、团队协作或更快提醒，通常要升级。'
        : 'Free tiers can work for light observation, but multi-address monitoring, team collaboration, and faster alerts usually require paid plans.',
    },
    {
      question: isChinese
        ? '我可以直接从这里找到钱包监控工具吗？'
        : 'Can I find wallet monitoring tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你需要的是提醒、监控还是风控观察。',
        '看它支持的链和通知渠道是否覆盖你的实际使用场景。',
        '如果要给团队使用，优先看多地址、标签和导出能力。',
      ]
    : [
        'Separate the need first: alerts, monitoring, or risk observation.',
        'Check whether supported chains and notification channels match your workflow.',
        'For team use, prioritize multi-address support, tagging, and export capabilities.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-wallet-monitoring-comparison',
      title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
      desc: isChinese
        ? '提醒、地址观察和异动监控一起看。'
        : 'Compare alerts, address watching, and anomaly monitoring together.',
    },
    {
      href: '/guides/ai-tools-for-on-chain-analysis-comparison',
      title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
      desc: isChinese
        ? '如果你开始更关心资金流和地址研究。'
        : 'Useful when fund flow and address research matter more.',
    },
    {
      href: '/guides/ai-tools-for-web3-comparison',
      title: isChinese ? 'Web3 工具对比' : 'Web3 tools comparison',
      desc: isChinese ? '如果你想先看更宽的 Web3 入口。' : 'Use this when you want a broader Web3 starting point.',
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
              {isChinese ? '钱包监控工具推荐' : 'Wallet monitoring tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <BellRing className='size-4' />
              {isChinese ? '提醒和异常优先' : 'Alerts and anomalies first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 钱包监控工具推荐：从地址提醒到异常观察，怎么选更合适'
              : 'AI tools for wallet monitoring: how to choose for alerts and anomaly watching'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '钱包监控工具的重点不是“监控很多地址”，而是能不能快速提醒、清晰分类、并且支持你真正要看的链和通知方式。'
              : 'Wallet monitoring tools are not just about watching many addresses. They need fast alerts, clear categorization, and support for the chains and notification methods you actually use.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=wallet&sort=popular'
              ctaId='wallet_monitoring_guide_browse_tools'
              ctaLabel='Wallet monitoring guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看钱包监控工具' : 'Browse wallet tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='wallet_monitoring_guide_top_list'
              ctaLabel='Wallet monitoring guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3'
              ctaId='wallet_monitoring_guide_web3'
              ctaLabel='Wallet monitoring guide Web3 guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-wallet-monitoring-comparison'
              ctaId='wallet_monitoring_guide_comparison'
              ctaLabel='Wallet monitoring guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看钱包监控对比页' : 'Wallet comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看提醒速度，再看通知渠道' : 'Start with alert speed, then notification channels'}
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
              {isChinese ? '钱包监控工具通常在这些分类里' : 'Wallet tools often sit in these categories'}
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
              ? '先看榜单和对比，再回到钱包监控页'
              : 'Compare first, then come back to wallet monitoring pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要做的是提醒、地址观察或异动监控，就直接去更窄的榜单和对比页。'
              : 'If the real job is alerts, address watching, or anomaly monitoring, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`wallet_monitoring_guide_${item.href.split('/').pop()}`}
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
              ? '先用榜单缩小钱包监控 shortlist'
              : 'Use the ranking to narrow your wallet monitoring shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比提醒速度、地址观察和异常监控，先看榜单会比泛 Web3 目录更快进入决策。'
              : 'If the decision is already about alert speed, address watching, and anomaly monitoring, the ranking gets you to a decision faster than a broad Web3 directory.'}
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
                href: '/best-ai-tools/ai-tools-for-on-chain-analysis',
                title: isChinese ? '链上分析榜单' : 'On-chain analysis ranking',
                desc: isChinese
                  ? '如果监控和链上研究一起考虑。'
                  : 'Useful when monitoring and on-chain research overlap.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc: isChinese ? '提醒、观察和监控一起看。' : 'Compare alerts, watching, and monitoring together.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
                desc: isChinese
                  ? '如果你开始更关心地址和资金流研究。'
                  : 'More useful when address and fund-flow research matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`wallet_monitoring_guide_ranking_${item.href.split('/').pop()}`}
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
              ? '钱包监控页要围绕提醒、阈值、异常和通知渠道来做，不要和钱包研究页混在一起。这个页继续保持可索引，但会把更适合监控的高意图入口和更窄的对比页优先露出。'
              : 'This wallet monitoring page should stay focused on alerts, thresholds, anomalies, and notification channels instead of blending into wallet research. Keep it indexable, but surface the monitoring-intent paths and narrower comparisons first.'
          }
          checkedAt={checkedAt}
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '提醒、阈值、异常' : 'Alerts, thresholds, anomalies',
              note: isChinese
                ? `确认它是否真能满足持续观察和及时通知；当前分类数 ${categoryCount} 个。`
                : `Confirm it actually supports ongoing watching and timely notifications; current category count is ${categoryCount}.`,
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到研究页' : 'Route to research pages',
              note: isChinese
                ? '如果真正需求是研究地址关系，就转到研究页。'
                : 'If the real job is research, move to the research pages.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '告警案例、截图、阈值' : 'Alert cases, screenshots, thresholds',
              note: isChinese
                ? `补真实提醒案例和通知截图，增强非 AI 内容；保留 ${checkedAt} 的验证痕迹。`
                : `Add real alert examples and notification screenshots for non-AI signal; keep the ${checkedAt} verification trail.`,
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
                ? `这页已按真实钱包监控决策重新核对，优先保留提醒、阈值和异常入口；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real wallet-monitoring decision and keeps alerts, thresholds, and anomaly entry points visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化监控证据' : 'Keep it indexable and strengthen monitoring evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用告警案例、阈值和通知截图区分它与钱包研究页。'
                : 'Use alert cases, thresholds, and notification screenshots to distinguish it from wallet research pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实告警和通知截图' : 'Add real alerts and notification screenshots'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补真实提醒案例、阈值和通知记录，并持续保留 ${checkedAt} 的核对记录。`
                : `Next, prioritize real alert cases, thresholds, and notification records while keeping the ${checkedAt} check record up to date.`}
            </p>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近监控与提醒工作的入口' : 'Real entry points for monitoring and alert workflows'}
          description={
            isChinese
              ? '如果你最关心地址提醒、异常行为、风险观察和通知速度，这些工具会比泛 Web3 页更快把范围收窄。'
              : 'If address alerts, anomaly behavior, risk observation, and notification speed matter most, these tools narrow the space faster than a broad Web3 page.'
          }
          toolNames={['debank', 'nansen', 'arkham', 'bubblemaps']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '监控意图更强的下一步入口' : 'Next paths for stronger monitoring intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己是在做监控、预警和异动观察，而不是泛研究，继续进入更窄的比较页会更有效。'
              : 'Once the real job is monitoring, alerts, and anomaly watching rather than broad research, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先看更高相关的 Web3 候选，再决定是否进入更窄的钱包监控对比。'
                : 'Review the highest-fit Web3 candidates first, then decide whether a narrower wallet-monitoring comparison is needed.',
            },
            {
              href: '/guides/ai-tools-for-wallet-monitoring-comparison',
              title: isChinese ? '钱包监控工具对比' : 'Wallet monitoring comparison',
              description: isChinese
                ? '适合提醒、地址观察和异动监控的直接比较。'
                : 'A direct side-by-side path for alerts, address watching, and anomaly monitoring.',
            },
            {
              href: '/guides/ai-tools-for-on-chain-analysis-comparison',
              title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
              description: isChinese
                ? '如果你开始需要更深的地址和资金流研究，这页更合适。'
                : 'More useful when the work starts leaning toward deeper address and fund-flow research.',
            },
            {
              href: '/guides/ai-tools-for-web3-comparison',
              title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
              description: isChinese
                ? '适合还没有完全确定自己是监控还是研究路径的人。'
                : 'Good when the user is not yet fully narrowed into monitoring versus research.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '监控方向确定后，继续这样收窄' : 'How to narrow the space once monitoring is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确在找监控工具，下一步就看 Web3 榜单、分类和搜索结果继续筛。'
              : 'Once wallet monitoring is clearly the lane, the next step is to use the Web3 ranking, category, and search results.'
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
                ? '回到 Web3 目录继续看真实监控候选。'
                : 'Return to the Web3 directory for real monitoring candidates.',
            },
            {
              href: '/explore?search=wallet&sort=popular',
              title: isChinese ? '搜索更多钱包工具' : 'Search more wallet tools',
              description: isChinese
                ? '回到 Explore，用更窄的钱包关键词扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with wallet-specific search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '钱包监控工具看什么' : 'What matters for wallet tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做提醒和观察' : 'Can it reliably support alerts and observation?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '钱包监控工具最重要的是提醒延迟、分类清晰和通知方式稳定。'
                  : 'Alert latency, clear categorization, and stable notification delivery matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做风控或监控，优先看多地址、标签、导出和历史记录。'
                  : 'If you do risk or monitoring work, prioritize multi-address support, tags, exports, and history.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '钱包监控工具最常见的问题' : 'Common questions about wallet tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_wallet_monitoring' />
      </div>
    </>
  );
}

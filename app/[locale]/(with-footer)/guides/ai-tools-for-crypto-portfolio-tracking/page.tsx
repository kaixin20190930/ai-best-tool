import { Metadata } from 'next';
import { ExternalLink, Layers3, PieChart, WalletCards } from 'lucide-react';
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
        ? 'AI Crypto 资产追踪工具推荐 | AI Best Tool'
        : `AI tools for crypto portfolio tracking | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向资产看板、持仓跟踪、钱包归集和组合观察的 AI 工具选型指南。'
        : 'A practical guide to AI tools for portfolio dashboards, holdings tracking, wallet rollups, and allocation monitoring.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? 'Crypto 资产追踪工具' : 'Crypto portfolio tracking tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-crypto-portfolio-tracking`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '资产追踪工具最适合做什么？' : 'What are crypto portfolio tracking tools best for?',
      answer: isChinese
        ? '适合做跨钱包归集、持仓看板、资产分布观察、收益变化追踪和组合健康检查。'
        : 'They are best for cross-wallet rollups, portfolio dashboards, allocation monitoring, performance tracking, and portfolio health checks.',
    },
    {
      question: isChinese ? '我先看什么维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看支持的钱包和链、资产归类清不清楚、组合视图是否稳定，以及更新频率。'
        : 'Start with supported wallets and chains, clarity of asset grouping, stability of portfolio views, and refresh frequency.',
    },
    {
      question: isChinese ? '它和钱包监控工具有什么区别？' : 'How is this different from a wallet monitoring tool?',
      answer: isChinese
        ? '资产追踪更偏“看全局持仓和组合”，钱包监控更偏“看提醒和异动”。'
        : 'Portfolio tracking is more about total holdings and allocation views, while wallet monitoring is more about alerts and anomalies.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '轻量个人使用通常够，但多钱包、深历史和更高级看板常常会更快碰到限制。'
        : 'It can be enough for light personal use, but multi-wallet tracking, deeper history, and richer dashboards hit limits faster.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是组合看板、钱包归集，还是更偏交易与提醒。',
        '看资产归类和多链支持是否覆盖你的真实持仓结构。',
        '如果要长期看组合，重点看刷新频率、历史视图和导出能力。',
      ]
    : [
        'Separate portfolio dashboards, wallet rollups, and alert workflows before comparing tools.',
        'Check whether asset grouping and multichain support match your real holdings structure.',
        'For long-term tracking, prioritize refresh cadence, historical views, and export capabilities.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
      title: isChinese ? '资产追踪对比页' : 'Portfolio tracking comparison',
      desc: isChinese
        ? '组合视图、多钱包和历史能力一起看。'
        : 'Compare portfolio views, multi-wallet support, and history together.',
    },
    {
      href: '/guides/ai-tools-for-wallet-monitoring-comparison',
      title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
      desc: isChinese ? '如果重点转向提醒和异动。' : 'Best when alerts and anomalies matter more.',
    },
    {
      href: '/guides/ai-tools-for-web3-comparison',
      title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
      desc: isChinese
        ? '如果还在追踪、研究和监控之间摇摆。'
        : 'Useful when tracking, research, and monitoring are still being weighed.',
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
              {isChinese ? 'Crypto 资产追踪工具推荐' : 'Crypto portfolio tracking tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <WalletCards className='size-4' />
              {isChinese ? '组合和持仓优先' : 'Portfolio and holdings first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Crypto 资产追踪工具推荐：从持仓看板到钱包归集，怎么选更合适'
              : 'AI tools for crypto portfolio tracking: how to choose for holdings and wallet rollups'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '资产追踪工具的重点不是“显示很多代币”，而是能不能把你的真实钱包、链和组合结构稳定地整理清楚。'
              : 'Portfolio tracking tools are not mainly about showing many tokens. The real job is turning your actual wallets, chains, and allocations into a stable and useful view.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=portfolio&sort=popular'
              ctaId='portfolio_tracking_guide_browse_tools'
              ctaLabel='Portfolio tracking guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看资产追踪工具' : 'Browse portfolio tracking tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='portfolio_tracking_guide_top_list'
              ctaLabel='Portfolio tracking guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-web3'
              ctaId='portfolio_tracking_guide_web3'
              ctaLabel='Portfolio tracking guide Web3 guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到 Web3 指南' : 'Back to Web3 guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-crypto-portfolio-tracking-comparison'
              ctaId='portfolio_tracking_guide_comparison'
              ctaLabel='Portfolio tracking guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看资产追踪对比页' : 'Portfolio comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看组合视图，再看链和钱包支持'
                : 'Start with portfolio views, then wallet and chain coverage'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <PieChart className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '资产追踪工具通常在这些分类里' : 'Portfolio tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['web3', 'life-assistant', 'research'].includes(String(category.slug)))
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
              ? '先看榜单和对比，再回到资产追踪页'
              : 'Compare first, then come back to portfolio tracking pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是在找组合和持仓工具，就别在总览页停太久，直接去更窄的榜单和对比页。'
              : 'If portfolio tracking is already the real task, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`portfolio_tracking_guide_${item.href.split('/').pop()}`}
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
              ? '先用榜单缩小资产追踪 shortlist'
              : 'Use the ranking to narrow your portfolio tracking shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比组合看板、多钱包归集和历史视图，先看榜单会比泛 Web3 目录更快进入决策。'
              : 'If the decision is already about portfolio dashboards, multi-wallet rollups, and historical views, the ranking gets you to a decision faster than a broad Web3 directory.'}
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
                href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
                title: isChinese ? '资产追踪对比' : 'Portfolio tracking comparison',
                desc: isChinese
                  ? '组合、多钱包和历史一起看。'
                  : 'Compare portfolios, multi-wallet support, and history together.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: isChinese ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc: isChinese ? '如果你开始更关心提醒和异动。' : 'Useful when alerts and anomalies matter more.',
              },
              {
                href: '/guides/ai-tools-for-web3-comparison',
                title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
                desc: isChinese
                  ? '如果你还在追踪、研究和监控之间比较。'
                  : 'Helpful when tracking, research, and monitoring are still in play.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`portfolio_tracking_guide_ranking_${item.href.split('/').pop()}`}
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
              ? '资产追踪页要围绕组合看板、多钱包归集和持仓观察来做，不要和钱包监控混成一页。这个页继续可索引，但会把更窄的钱包监控、链上分析和 Web3 路径分层露出。'
              : 'This portfolio tracking page should stay centered on portfolio views, multi-wallet rollups, and holdings observation instead of blending into wallet monitoring. Keep it indexable, but surface the narrower wallet monitoring, on-chain analysis, and Web3 paths separately.'
          }
          items={[
            {
              label: isChinese ? '验证重点' : 'Validation focus',
              value: isChinese ? '组合、归集、持仓' : 'Portfolio, rollups, holdings',
              note: isChinese
                ? '确认它是不是服务“看全局”这个任务。'
                : 'Confirm it serves the “see the whole portfolio” job.',
            },
            {
              label: isChinese ? '合并策略' : 'Merge strategy',
              value: isChinese ? '分流到监控/分析' : 'Route to monitoring/analysis',
              note: isChinese
                ? '如果重点其实是提醒或资金流，就转到更窄页。'
                : 'If the real need is alerts or fund flow, move to a narrower page.',
            },
            {
              label: isChinese ? '后续增量' : 'Next increments',
              value: isChinese ? '真实钱包结构、看板、截图' : 'Real wallet setups, dashboards, screenshots',
              note: isChinese
                ? '补真实组合结构和看板例子。'
                : 'Add real portfolio structures and dashboard examples.',
            },
          ]}
        />

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更贴近持仓与组合观察的入口' : 'Real entry points for holdings and portfolio views'}
          description={
            isChinese
              ? '如果你更关心多钱包归集、组合分布和资产看板，这几款工具会比泛 Web3 页更快把范围收窄。'
              : 'If multi-wallet rollups, allocation views, and portfolio dashboards matter most, these tools narrow the field faster than a broad Web3 page.'
          }
          toolNames={['debank', 'zerion', 'zapper', 'nansen']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={
            isChinese ? '资产追踪意图更强的下一步入口' : 'Next paths for stronger portfolio-tracking intent'
          }
          compareDescription={
            isChinese
              ? '当你已经明确自己是在找持仓追踪，而不是预警或深度链上分析，继续进入更窄的比较页会更有效。'
              : 'Once the real job is portfolio tracking rather than alerts or deep on-chain analysis, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先看更高相关的 Web3 候选，再决定是否进入更窄的资产追踪对比。'
                : 'Start with the highest-fit Web3 candidates, then decide whether you need the narrower portfolio-tracking comparison.',
            },
            {
              href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
              title: isChinese ? '资产追踪工具对比' : 'Portfolio tracking comparison',
              description: isChinese
                ? '适合直接横向看组合视图、多钱包支持和历史能力。'
                : 'A direct side-by-side path for portfolio views, multi-wallet support, and history depth.',
            },
            {
              href: '/guides/ai-tools-for-wallet-monitoring-comparison',
              title: isChinese ? '钱包监控工具对比' : 'Wallet monitoring comparison',
              description: isChinese
                ? '如果你发现真正需求更偏提醒和异动，这页更合适。'
                : 'More useful if the real decision shifts toward alerts and anomalies.',
            },
            {
              href: '/guides/ai-tools-for-web3-comparison',
              title: isChinese ? 'Web3 工具总对比' : 'Web3 tools comparison',
              description: isChinese
                ? '适合还没完全确定自己在选追踪、研究还是监控的人。'
                : 'Good when you are not yet fully narrowed into tracking, research, or monitoring.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese
              ? '确定资产追踪方向后，这样继续收窄'
              : 'How to narrow the space once portfolio tracking is clearly the lane'
          }
          nextDescription={
            isChinese
              ? '如果你已经明确在找组合和持仓工具，下一步就看 Web3 榜单、分类和搜索结果继续筛。'
              : 'Once portfolio tracking is clearly the lane, the next step is to use the Web3 ranking, category, and search results.'
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
                ? '回到目录继续看真实资产工具候选。'
                : 'Return to the directory for real portfolio-oriented candidates.',
            },
            {
              href: '/explore?search=portfolio&sort=popular',
              title: isChinese ? '搜索更多资产追踪工具' : 'Search more portfolio tools',
              description: isChinese
                ? '回到 Explore，用更窄的组合关键词继续扩大 shortlist。'
                : 'Return to Explore and widen the shortlist with more portfolio-specific search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '资产追踪工具看什么' : 'What matters for portfolio tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能把真实持仓稳定整理出来' : 'Can it turn real holdings into a stable view?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '最重要的是资产归类是否清楚、多钱包合并是否稳定，以及组合视图是否便于长期观察。'
                  : 'The key is whether asset grouping is clear, multi-wallet rollups stay stable, and the portfolio view is useful over time.'}
              </p>
              <p>
                {isChinese
                  ? '如果你会跨链或有多个地址，优先看支持范围、历史视图和导出能力。'
                  : 'If you work across chains or multiple addresses, prioritize coverage, historical views, and export support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '资产追踪工具最常见的问题' : 'Common questions about portfolio tracking tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_portfolio_tracking' />
      </div>
    </>
  );
}

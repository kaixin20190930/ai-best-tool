import { Metadata } from 'next';
import { Activity, BarChart3, ExternalLink, Wallet } from 'lucide-react';
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
        ? 'AI Web3 分析工具推荐 | AI Best Tool'
        : `AI tools for Web3 analysis | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向链上分析、协议观察、DeFi 研究和钱包监控的 AI Web3 分析工具指南。'
        : 'A practical guide to AI tools for Web3 analysis, including on-chain research, protocol monitoring, DeFi analytics, and wallet tracking.',
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
      name: isChinese ? 'Web3 分析工具' : 'Web3 analysis tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-web3-analysis`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI Web3 分析工具最适合做什么？' : 'What are AI tools for Web3 analysis best for?',
      answer: isChinese
        ? '最适合链上分析、协议观察、钱包跟踪、DeFi 研究、资金流监控和异常发现。'
        : 'They are best for on-chain analysis, protocol monitoring, wallet tracking, DeFi research, fund-flow observation, and anomaly detection.',
    },
    {
      question: isChinese ? '它和一般 Web3 工具有什么区别？' : 'How are these different from general Web3 tools?',
      answer: isChinese
        ? '一般 Web3 工具范围更广，可能包括钱包、数据 API 和基础设施；Web3 分析工具更聚焦于“看数据、看变化、看风险”。'
        : 'General Web3 tools may include wallets, APIs, and infrastructure. Web3 analysis tools are more focused on observing data, change, and risk.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看覆盖的链和协议，再看历史数据、监控能力、导出方式和研究是否可复用。'
        : 'Start with supported chains and protocols, then check history depth, monitoring, exports, and whether the research can be reused.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合做初步观察，但如果你需要长期监控、团队研究或更深数据，通常还是会碰到限制。'
        : 'Free tiers can be enough for early observation, but ongoing monitoring, team research, and deeper data usually hit limits.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在做链上分析、协议观察、钱包监控还是 DeFi 研究。',
        '优先看数据深度、覆盖范围、历史查询和监控能力。',
        '如果结论要给团队反复复用，重点看导出、分享和后续追踪能力。',
      ]
    : [
        'Separate on-chain analysis, protocol monitoring, wallet tracking, and DeFi research before comparing tools.',
        'Prioritize depth, coverage, history, and monitoring.',
        'If your conclusions need to be reused by a team, focus on exports, sharing, and follow-up tracking.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: isChinese ? '先看 Web3 榜单' : 'Start with Web3 ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-web3-analysis-comparison',
      title: isChinese ? 'Web3 分析对比' : 'Web3 analysis comparison',
      desc: isChinese ? '链上研究、监控和观察一起看。' : 'Compare research, monitoring, and observation together.',
    },
    {
      href: '/guides/ai-tools-for-defi-analytics-comparison',
      title: isChinese ? 'DeFi 对比页' : 'DeFi comparison',
      desc: isChinese ? '如果重点是 TVL 和资金流。' : 'Best when TVL and fund flow matter most.',
    },
    {
      href: '/guides/ai-tools-for-on-chain-analysis-comparison',
      title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
      desc: isChinese
        ? '如果你更偏地址和交易观察。'
        : 'Use this when address- and transaction-level work matters more.',
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
              <BarChart3 className='size-4' />
              {isChinese ? 'Web3 分析工具推荐' : 'Web3 analysis tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Activity className='size-4' />
              {isChinese ? '观察与研究优先' : 'Monitoring-first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Web3 分析工具推荐：怎么选更适合链上研究和监控'
              : 'AI tools for Web3 analysis: how to choose for on-chain research and monitoring'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Web3 分析工具真正的价值，在于它能不能帮你更快看见链上变化、理解协议状态，并把这些观察变成可持续的研究流程。'
              : 'The real value of Web3 analysis tools is whether they help you spot on-chain changes faster, understand protocol health, and turn those observations into repeatable research workflows.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=web3&sort=popular'
              ctaId='web3_analysis_guide_browse_tools'
              ctaLabel='Web3 analysis guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 Web3 工具' : 'Browse Web3 tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-web3-tools'
              ctaId='web3_analysis_guide_top_list'
              ctaLabel='Web3 analysis guide Web3 top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Web3 榜单' : 'Open Web3 ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-on-chain-analysis'
              ctaId='web3_analysis_guide_on_chain'
              ctaLabel='Web3 analysis guide on-chain guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看链上分析工具' : 'On-chain analysis'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-defi-analytics'
              ctaId='web3_analysis_guide_defi'
              ctaLabel='Web3 analysis guide DeFi guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 DeFi 分析工具' : 'DeFi analytics'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看覆盖范围，再看监控深度' : 'Start with coverage, then monitoring depth'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <Wallet className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? 'Web3 分析工具通常在这些分类里' : 'Web3 analysis tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['web3', 'research'].includes(String(category.slug)))
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

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断 Web3 分析工具是否真的能让链上变化、协议状态和风险观察更清晰，而不是只看图表数量。'
              : 'This page checks whether Web3 analysis tools truly make on-chain changes, protocol state, and risk observation clearer rather than only offering more charts.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '链上、协议、风险、追踪' : 'On-chain, protocol, risk, tracking',
              note: isChinese ? '重点看能否支撑持续观察。' : 'Focus on whether it supports ongoing observation.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Core page kept indexable',
              note: isChinese
                ? '与 DEX、DeFi 和钱包页形成清晰分工。'
                : 'Keep a clear split from DEX, DeFi, and wallet pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实研究与监控案例' : 'Add real research and monitoring cases',
              note: isChinese
                ? '后续优先补链上样本、监控面板和研究笔记。'
                : 'Next, add on-chain examples, monitoring panels, and research notes.',
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这页已按真实 Web3 分析决策重新核对，优先保留链上变化、协议状态和风险入口。'
                : 'This page has been rechecked against a real Web3 analysis decision and keeps on-chain changes, protocol state, and risk entry points visible.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，强化分析证据' : 'Keep it indexable and strengthen analysis evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用链上样例、监控面板和研究笔记区分它与 DEX、DeFi 页。'
                : 'Use on-chain examples, monitoring panels, and research notes to distinguish it from DEX and DeFi pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实研究与监控案例' : 'Add real research and monitoring cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补链上样本、监控面板和研究笔记。'
                : 'Next, prioritize on-chain examples, monitoring panels, and research notes.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到 Web3 页面' : 'Compare first, then come back to Web3 pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是在做链上研究，就别在总览页停太久，直接去更窄的榜单和对比页。'
              : 'If on-chain research is already the real task, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`web3_analysis_guide_${item.href.split('/').pop()}`}
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
              ? '先用榜单缩小 Web3 analysis shortlist'
              : 'Use the ranking to narrow your Web3 analysis shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比链上研究、协议监控和钱包追踪，先看榜单会比泛目录更快进入决策。'
              : 'If the decision is already about on-chain research, protocol monitoring, and wallet tracking, the ranking gets you to a decision faster than a broad directory.'}
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
                href: '/guides/ai-tools-for-web3-analysis-comparison',
                title: isChinese ? 'Web3 分析对比' : 'Web3 analysis comparison',
                desc: isChinese
                  ? '研究、监控和观察一起看。'
                  : 'Compare research, monitoring, and observation together.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics-comparison',
                title: isChinese ? 'DeFi 对比页' : 'DeFi comparison',
                desc: isChinese ? '如果重点是 TVL 和资金流。' : 'Best when TVL and fund flow matter most.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: isChinese ? '链上分析对比' : 'On-chain analysis comparison',
                desc: isChinese
                  ? '如果你更偏地址和交易观察。'
                  : 'Use this when address- and transaction-level work matters more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`web3_analysis_guide_ranking_${item.href.split('/').pop()}`}
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese ? '更贴近链上研究和监控的真实入口' : 'Real entry points for on-chain research and monitoring'
          }
          description={
            isChinese
              ? '如果你更关心协议、钱包、TVL、资金流和历史趋势，这几款工具会比泛 Web3 页面更快进入正题。'
              : 'If you care more about protocols, wallets, TVL, fund flow, and historical change, these tools get you into the real work faster than a general Web3 page.'
          }
          toolNames={['dune', 'messari', 'debank', 'bubblemaps']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '继续深入的对比入口' : 'Next comparison paths'}
          compareDescription={
            isChinese
              ? '当你已经知道自己更偏 DeFi、协议还是链上分析时，继续进入更细的对比页会更有效。'
              : 'Once you know whether your focus is DeFi, protocol monitoring, or on-chain research, narrower compare pages work better.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-web3-tools',
              title: isChinese ? 'Web3 工具榜单' : 'Web3 tools ranking',
              description: isChinese
                ? '先把更高相关的 Web3 候选看一遍，再决定进入哪条更窄的分析对比路径。'
                : 'Review the highest-fit Web3 candidates first, then choose the narrower analysis path that fits.',
            },
            {
              href: '/guides/ai-tools-for-defi-analytics-comparison',
              title: isChinese ? 'DeFi 分析工具对比' : 'DeFi analytics comparison',
              description: isChinese
                ? '更适合 TVL、协议变化和资金流研究。'
                : 'Useful for TVL, protocol shifts, and capital-flow research.',
            },
            {
              href: '/guides/ai-tools-for-web3-analysis-comparison',
              title: isChinese ? 'Web3 分析工具对比' : 'Web3 analysis comparison',
              description: isChinese
                ? '更适合链上研究、协议监控、钱包追踪和异常观察。'
                : 'Better for on-chain research, protocol monitoring, wallet tracking, and anomaly observation.',
            },
            {
              href: '/guides/ai-tools-for-on-chain-analysis-comparison',
              title: isChinese ? '链上分析工具对比' : 'On-chain analysis comparison',
              description: isChinese
                ? '更适合地址、交易和异常活动观察。'
                : 'Better for address-level, transaction-level, and anomaly-focused work.',
            },
            {
              href: '/guides/ai-tools-for-protocol-analytics-comparison',
              title: isChinese ? '协议分析工具对比' : 'Protocol analytics comparison',
              description: isChinese
                ? '更适合协议健康、增长和使用情况跟踪。'
                : 'Useful for protocol health, growth, and usage tracking.',
            },
            {
              href: '/guides/ai-tools-for-web3-analysis-comparison',
              title: isChinese ? 'Web3 分析工具对比' : 'Web3 analysis comparison',
              description: isChinese
                ? '当你已经锁定 Web3 分析方向，这里是更窄的比较入口。'
                : 'A narrower comparison path once Web3 analysis is your clear direction.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? 'Web3 分析方向确定后，下一步看这里' : 'Where to go once Web3 analysis is the clear direction'
          }
          nextDescription={
            isChinese
              ? '如果你已经确定自己更偏链上分析和监控，下一步就进入 Web3 榜单、分类和搜索页。'
              : 'If on-chain analysis and monitoring are clearly the right lane, the next step is to use the Web3 ranking, category, and targeted search.'
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
                ? '直接进入 Web3 目录，继续比较真实候选。'
                : 'Jump into the Web3 category to compare real listings.',
            },
            {
              href: '/explore?search=web3&sort=popular',
              title: isChinese ? '搜索更多 Web3 工具' : 'Search more Web3 tools',
              description: isChinese
                ? '回到 Explore，用 Web3 关键词扩大候选范围。'
                : 'Return to Explore and widen the shortlist with a Web3-focused search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Web3 分析工具看什么' : 'What matters for Web3 analysis tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能持续帮你看见风险与变化' : 'Can it help you keep seeing risk and change over time?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'Web3 分析工具不只是给你一个静态仪表盘，而是要能帮助你长期跟踪地址、协议、资金流和异常变化。'
                  : 'Web3 analysis tools are not only about showing a dashboard. They should help you keep tracking wallets, protocols, fund flows, and unusual changes over time.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做的是长期研究或运维，优先看监控、导出、分享和历史查询能力。'
                  : 'For ongoing research or operations, prioritize monitoring, exports, sharing, and historical queries.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Web3 分析工具最常见的问题' : 'Common questions about Web3 analysis tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_web3_analysis' />
      </div>
    </>
  );
}

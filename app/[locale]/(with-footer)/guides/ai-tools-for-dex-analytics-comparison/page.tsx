import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI DEX 分析工具对比' : 'AI tools for DEX analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 DEX AI 工具，帮你更快选出适合交易对和流动性工作的一个。'
      : 'Compare common DEX AI tools to choose the one that fits your pair and liquidity workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'DEX 工具', en: 'DEX tools' },
    comparisonLabel: { cn: 'AI DEX 分析工具对比', en: 'AI tools for DEX analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做交易对分析、流动性观察或 DEX 研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need pair analysis, liquidity observation, or DEX research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'dex',
    guideHref: '/guides/ai-tools-for-dex-analytics',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 DEX 指南', en: 'Back to DEX guide' },
    altBrowseHref: '/explore?search=dex&sort=popular',
    altBrowseLabel: { cn: '浏览更多 DEX 工具', en: 'Browse more DEX tools' },
    breadcrumbLabel: { cn: 'DEX 工具对比', en: 'DEX tools comparison' },
    compareTitle: { cn: '几款常见 DEX 工具的快速对照', en: 'A quick side-by-side look at common DEX tools' },
    compareSubtitle: { cn: 'DEX', en: 'DEX' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果你已经明确在做 DEX 或链上研究，先用榜单把 shortlist 收窄。',
          en: 'If DEX or on-chain research is already the goal, use the ranking to narrow the shortlist first.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-analysis-comparison',
        title: { cn: '转去 Web3 分析对比', en: 'Go to Web3 analysis comparison' },
        description: {
          cn: '如果你的问题已经扩大到协议、钱包和资金流，这页更高意图。',
          en: 'A higher-intent path when the question expands to protocols, wallets, and fund flows.',
        },
      },
      {
        href: '/guides/ai-tools-for-defi-analytics-comparison',
        title: { cn: '转去 DeFi 分析对比', en: 'Go to DeFi analytics comparison' },
        description: {
          cn: '如果你更关心收益、池子和协议层指标，这页更贴近。',
          en: 'Move here if yield, pools, and protocol metrics matter more.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果你要的是长期协议监控和仪表盘，这条路径更合适。',
          en: 'Use this when long-term protocol monitoring and dashboards are the real need.',
        },
      },
    ],
    tips: {
      cn: [
        '先看交易对和池子覆盖，再看是否支持你常用的链。',
        '如果你要团队使用，关注 API、导出、权限和告警能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with pair and pool coverage, then check whether it supports the chains you actually use.',
        'For team use, look at API access, exports, permissions, and alerting.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看数据覆盖、免费可用性、评分、更新情况和实际使用感。',
          en: 'We compare data coverage, free usability, ratings, freshness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看 DEX 工具？', en: 'Why only DEX tools?' },
        answer: {
          cn: '因为 DEX 工具的意图比较明确，通常围绕交易对、流动性和研究工作流，对比也更直接。',
          en: 'Because DEX tools usually map to clear needs around pairs, liquidity, and research workflows, making comparison more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '这页先看真实可验证的 DEX 分析信号，再继续判断是不是要深挖交易对、流动性和链上观察。'
            : 'This page looks at verifiable DEX-analysis signals first, then helps you decide whether to go deeper into pairs, liquidity, and on-chain monitoring.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '交易对覆盖' : 'Pair coverage',
            value:
              locale === 'cn' || locale === 'tw'
                ? '是否覆盖你常看的池子'
                : 'Whether it covers the pools you actually watch',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它是不是你真正在看的链和池子，而不是泛泛数据。'
                : 'Confirm the actual chains and pools matter to you, not just generic coverage.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '流动性与趋势' : 'Liquidity and trends',
            value: locale === 'cn' || locale === 'tw' ? '能否看出变化趋势' : 'Can it show trend changes clearly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果趋势和历史不够稳，分析页就很难长期使用。'
                : 'If trend and history signals are weak, the page is hard to rely on long term.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '研究输出' : 'Research output',
            value: locale === 'cn' || locale === 'tw' ? '导出、分享、API' : 'Exports, sharing, and API',
            note:
              locale === 'cn' || locale === 'tw'
                ? '团队要复用时，这些会比功能清单更重要。'
                : 'For team reuse, these matter more than the feature list.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '交易对信号' : 'Pair signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '是否覆盖你真正在看的池子'
                : 'Does it cover the pools you actually watch',
            note:
              locale === 'cn' || locale === 'tw'
                ? '只要池子不对，分析就没有意义。'
                : 'If the pool is wrong, the analysis is not useful.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '趋势信号' : 'Trend signal',
            value: locale === 'cn' || locale === 'tw' ? '历史变化是否清楚' : 'Are historical changes clear',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'DEX 判断常常取决于趋势，而不是单点。'
                : 'DEX decisions often depend on trends, not a single snapshot.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '输出信号' : 'Output signal',
            value: locale === 'cn' || locale === 'tw' ? '导出、分享和 API' : 'Exports, sharing, and API',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能交给团队继续用，比功能堆砌更关键。'
                : 'Whether the team can keep using it matters more than a longer feature list.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 DEX 分析路径重新核对，保留交易对、流动性和研究入口。'
              : 'This page has been rechecked against a real DEX analysis workflow and keeps pair, liquidity, and research entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实 DEX 证据'
              : 'Keep it indexable and add real DEX evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用交易对、趋势和真人评论把它和泛链上页区分开。'
              : 'Use pairs, trend signals, and real comments to differentiate it from generic on-chain pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实 DEX 场景和反馈' : 'Add real DEX scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、图表和真人评论。'
              : 'Next, prioritize cases, charts, and real comments.'}
          </p>
        </div>
      </section>
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先把 DEX 分析入口收紧，再决定是否切到更广的链上研究'
              : 'Tighten the DEX analysis entry first, then decide whether to switch into broader on-chain research'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确是在看交易对、池子或流动性，先从更高意图入口收口通常更省时间。'
              : 'If the work is clearly about pairs, pools, or liquidity, starting with higher-intent entry points usually saves time.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 榜单' : 'Web3 ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先把候选范围收紧。'
                    : 'Use this to narrow the candidate set first.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'DeFi 分析对比' : 'DeFi analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的问题已经偏收益、池子和协议指标。'
                    : 'Best when yield, pools, and protocol metrics are the real focus.',
              },
              {
                href: '/guides/ai-tools-for-web3-analysis-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 分析对比' : 'Web3 analysis comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的问题已经扩大到协议、钱包和资金流。'
                    : 'Use this when the question expands to protocols, wallets, and fund flows.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心长期协议监控和仪表盘。'
                    : 'Choose this when long-term monitoring and dashboards are the real need.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`dex_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_dex_analytics_comparison' />
    </>
  );
}

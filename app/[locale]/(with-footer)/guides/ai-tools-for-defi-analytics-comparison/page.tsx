import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI DeFi 分析工具对比' : 'AI tools for DeFi analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 DeFi AI 工具，帮你更快选出适合流动性和收益工作的一个。'
      : 'Compare common DeFi AI tools to choose the one that fits your liquidity and yield workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'DeFi 工具', en: 'DeFi tools' },
    comparisonLabel: { cn: 'AI DeFi 分析工具对比', en: 'AI tools for DeFi analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做流动性监测、收益追踪或协议研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need liquidity monitoring, yield tracking, or protocol research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'defi',
    guideHref: '/guides/ai-tools-for-defi-analytics',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 DeFi 指南', en: 'Back to DeFi guide' },
    altBrowseHref: '/explore?search=defi&sort=popular',
    altBrowseLabel: { cn: '浏览更多 DeFi 工具', en: 'Browse more DeFi tools' },
    breadcrumbLabel: { cn: 'DeFi 工具对比', en: 'DeFi tools comparison' },
    compareTitle: { cn: '几款常见 DeFi 工具的快速对照', en: 'A quick side-by-side look at common DeFi tools' },
    compareSubtitle: { cn: 'DeFi', en: 'DeFi' },
    preferredToolNames: ['defillama', 'dune', 'token-terminal', 'nansen'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果你已经明确要做 DeFi 或链上分析，先用榜单缩小候选。',
          en: 'If DeFi or on-chain analysis is already the goal, use the ranking first to narrow candidates.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-analysis-comparison',
        title: { cn: '转去 Web3 分析对比', en: 'Go to Web3 analysis comparison' },
        description: {
          cn: '如果你的核心问题已经变成链上研究、协议监控和钱包追踪，这页更高意图。',
          en: 'A higher-intent path when the real need is on-chain research, protocol monitoring, and wallet tracking.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果你更关心协议健康和长期指标，这条路径更贴近。',
          en: 'Move here if protocol health and recurring metrics are the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-dex-analytics-comparison',
        title: { cn: '转去 DEX 分析对比', en: 'Go to DEX analytics comparison' },
        description: {
          cn: '如果你正在看交易对和流动性工作流，这页也值得继续看。',
          en: 'Use this when trading pairs and liquidity workflows are the real decision.',
        },
      },
    ],
    tips: {
      cn: [
        '先看协议覆盖和历史深度，再看是否支持你常用的链。',
        '如果你要团队使用，关注 API、导出、权限和告警能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with protocol coverage and historical depth, then check whether it supports the chains you actually use.',
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
        question: { cn: '为什么只看 DeFi 工具？', en: 'Why only DeFi tools?' },
        answer: {
          cn: '因为 DeFi 工具的意图比较明确，通常围绕流动性、收益和协议研究，对比也更直接。',
          en: 'Because DeFi tools usually map to clear needs around liquidity, yield, and protocol research, making comparison more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'DeFi 对比页正在从“罗列工具”收束成“先看证据再决定”。'
            : 'This DeFi comparison page is moving from a tool list to a evidence-first decision page.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认你要做什么 DeFi 任务', '再看数据覆盖和历史深度', '最后才看是否值得点开官网']
            : [
                'Confirm the DeFi task first',
                'Then check coverage and history depth',
                'Only then decide whether to open the official site',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '任务类型' : 'Task type',
            value: locale === 'cn' || locale === 'tw' ? '流动性 / 收益 / 协议' : 'Liquidity / yield / protocol',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果任务类型不清楚，对比就会很虚。'
                : 'If the task type is vague, comparison becomes hand-wavy very quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '历史深度' : 'History depth',
            value: locale === 'cn' || locale === 'tw' ? '看长期数据' : 'Long-term data',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'DeFi 很多判断都依赖历史和时间序列，而不是静态卡片。'
                : 'Many DeFi decisions depend on history and time series, not static cards.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '落地验证' : 'Validation path',
            value: locale === 'cn' || locale === 'tw' ? '先看榜单再打开官网' : 'Check ranking before the official site',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先把 shortlist 缩小，再进入官网验证，转化更稳。'
                : 'Narrow the shortlist first, then validate on the official site for better conversion.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '协议信号' : 'Protocol signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看协议覆盖是否够'
                : 'Check whether protocol coverage is sufficient',
            note:
              locale === 'cn' || locale === 'tw'
                ? '覆盖不够，后面的收益和流动性判断都会虚。'
                : 'If coverage is thin, yield and liquidity judgments become shaky.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '历史信号' : 'History signal',
            value: locale === 'cn' || locale === 'tw' ? '时间序列和趋势是否稳定' : 'Are time series and trends stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'DeFi 很多判断都依赖历史，不是只看当下。'
                : 'Many DeFi decisions depend on history, not only the current snapshot.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队信号' : 'Team signal',
            value: locale === 'cn' || locale === 'tw' ? '导出、API 和权限' : 'Exports, API, and permissions',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果要进团队流程，这些比页面花哨更重要。'
                : 'If it needs to fit team workflows, these matter more than flashy screens.',
          },
        ]}
      />
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是否继续看 DeFi 工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing DeFi tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果 DeFi 已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If DeFi is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 榜单' : 'Web3 ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics',
                title: locale === 'cn' || locale === 'tw' ? 'DeFi 指南' : 'DeFi guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是流动性、收益还是协议研究。'
                    : 'Re-check whether the task is liquidity, yield, or protocol research.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的重点已经变成协议健康和指标。'
                    : 'Useful when protocol health and metrics are the real focus.',
              },
              {
                href: '/guides/ai-tools-for-dex-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'DEX 分析对比' : 'DEX analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心交易对和流动性工作流。'
                    : 'Better when trading pairs and liquidity workflows matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`defi_ranking_${item.href.split('/').pop()}`}
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
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按当前比较页的判断标准重新核对。'
              : 'This page has been rechecked against the current comparison-page decision flow.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '保留索引，补真实证据' : 'Keep it indexable and add real evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用评论、案例和 owner 认领把它和泛工具页区分开。'
              : 'Use comments, cases, and owner claims to distinguish it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实用例和反馈' : 'Add real use cases and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、反馈和认领信息。'
              : 'Next, prioritize cases, feedback, and claim information.'}
          </p>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_defi_analytics_comparison' />
    </>
  );
}

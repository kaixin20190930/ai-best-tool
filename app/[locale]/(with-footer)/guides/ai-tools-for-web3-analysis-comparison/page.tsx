import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 分析工具对比' : 'AI tools for Web3 analysis comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比常见的 Web3 分析工具，帮你更快选出更适合链上研究、协议监控和钱包追踪的一个。'
      : 'Compare common Web3 analysis tools to choose the one that fits on-chain research, protocol monitoring, and wallet tracking best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Web3 分析工具', en: 'Web3 analysis tools' },
    comparisonLabel: { cn: 'AI Web3 分析工具对比', en: 'AI tools for Web3 analysis comparison' },
    description: {
      cn: '如果你已经知道自己更偏链上研究、协议监控、DeFi 观察或钱包追踪，这一页会帮你把常见工具放在一起对照。',
      en: 'If you already know you need on-chain research, protocol monitoring, DeFi observation, or wallet tracking, this page helps you compare common tools side by side.',
    },
    searchQuery: 'web3',
    guideHref: '/guides/ai-tools-for-web3-analysis',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 Web3 分析指南', en: 'Back to Web3 analysis guide' },
    altBrowseHref: '/explore?search=web3&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Web3 工具', en: 'Browse more Web3 tools' },
    breadcrumbLabel: { cn: 'Web3 分析工具对比', en: 'Web3 analysis tools comparison' },
    compareTitle: {
      cn: '常见 Web3 分析工具的快速对照',
      en: 'A quick side-by-side look at common Web3 analysis tools',
    },
    compareSubtitle: { cn: 'Web3 分析', en: 'Web3 analysis' },
    preferredToolNames: ['dune', 'nansen', 'debank', 'bubblemaps'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果你已经明确要做 Web3 分析，先用榜单缩小 shortlist。',
          en: 'If Web3 analysis is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-analysis',
        title: { cn: '回到 Web3 分析指南', en: 'Back to the Web3 analysis guide' },
        description: {
          cn: '如果你还想先理清协议、钱包和资金流分析，可以回到指南页。',
          en: 'Go back if you still need to clarify protocol, wallet, and fund-flow analysis first.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你的决策已经转向链上研究本身，这页更高意图。',
          en: 'A higher-intent path once the decision moves directly into on-chain research.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你更关心地址画像和行为判断，这页更贴近。',
          en: 'Move there if address profiling and behavior analysis are the real focus.',
        },
      },
    ],
    tips: {
      cn: [
        '先分清你更关心协议、钱包、资金流还是可视化研究。',
        '如果你需要团队协作，优先看导出、分享、告警和历史查询。',
        '长期使用时，把更新频率和真实反馈也一起纳入判断。',
      ],
      en: [
        'Start by separating protocol, wallet, fund-flow, and visual research needs.',
        'If you need team collaboration, prioritize exports, sharing, alerts, and historical queries.',
        'For long-term use, include freshness and real feedback in the decision.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的重点是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看覆盖范围、历史深度、监控能力、导出与分享，以及实际使用体验。',
          en: 'We compare coverage, historical depth, monitoring capabilities, exports and sharing, and practical usability.',
        },
      },
      {
        question: { cn: '为什么这页比总 Web3 页更窄？', en: 'Why is this narrower than the main Web3 page?' },
        answer: {
          cn: '因为当你已经知道自己是在做 Web3 分析时，直接对照常见工具会比泛 Web3 列表更快。',
          en: 'Once you already know Web3 analysis is the lane, comparing common tools directly is faster than a broad Web3 list.',
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
            ? '这页先看真实可验证的 Web3 分析信号，再继续判断是不是要做协议监控、钱包追踪或资金流研究。'
            : 'This page looks at verifiable Web3-analysis signals first, then helps you decide whether protocol monitoring, wallet tracking, or fund-flow research is the real need.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先判断你是在看协议监控、钱包追踪，还是资金流研究。',
                '如果目标已经明确，先去更聚焦的 Web3 指南或对比页看候选。',
                '如果还要给团队留证据，再回到这页补导出、分享和告警记录。',
              ]
            : [
                'First decide whether you care most about protocol monitoring, wallet tracking, or fund-flow research.',
                'If the goal is already clear, move to the more focused Web3 guide or comparison pages for candidates.',
                'If you still need team evidence, come back here for exports, sharing, and alert notes.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '覆盖范围' : 'Coverage',
            value: locale === 'cn' || locale === 'tw' ? '协议、钱包、资金流' : 'Protocols, wallets, and fund flows',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先看你要研究的对象是不是都能覆盖到。'
                : 'Confirm the objects you care about are all actually covered.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '历史深度' : 'Historical depth',
            value: locale === 'cn' || locale === 'tw' ? '趋势与回看是否稳定' : 'Whether trends and history feel stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '没有稳定历史，研究页很难长期依赖。'
                : 'Without stable history, the research page is hard to trust long term.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队输出' : 'Team output',
            value: locale === 'cn' || locale === 'tw' ? '导出、分享、告警' : 'Exports, sharing, and alerts',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果要团队复用，这些比单次查询更重要。'
                : 'If the work will be reused by a team, these matter more than a one-off query.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '覆盖信号' : 'Coverage signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先确认研究对象是否都覆盖'
                : 'Confirm the objects you care about are all covered',
            note:
              locale === 'cn' || locale === 'tw'
                ? '协议、钱包和资金流如果漏了一个，分析就会断层。'
                : 'If protocol, wallet, or fund-flow coverage is missing, the analysis has a gap.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '历史信号' : 'History signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看趋势和回看是否稳定'
                : 'Check whether trends and history feel stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '没有稳定历史，研究页很难长期依赖。'
                : 'Without stable history, the research page is hard to trust long term.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队信号' : 'Team signal',
            value: locale === 'cn' || locale === 'tw' ? '导出、分享、告警' : 'Exports, sharing, and alerts',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果要团队复用，这些比单次查询更重要。'
                : 'If the work will be reused by a team, these matter more than a one-off query.',
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
              ? '这页已按真实 Web3 分析路径重新核对，保留协议、钱包和资金流入口。'
              : 'This page has been rechecked against a real Web3 analysis workflow and keeps protocol, wallet, and fund-flow entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实 Web3 分析证据'
              : 'Keep it indexable and add real Web3 analysis evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用覆盖、历史和真人评论把它和泛分析页区分开。'
              : 'Use coverage, history, and real comments to differentiate it from generic analysis pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实 Web3 场景和反馈' : 'Add real Web3 scenarios and feedback'}
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
              ? '先收窄入口，再决定是继续看 Web3 分析还是切去更具体的子场景'
              : 'Narrow the entry first, then decide whether to keep comparing Web3 analysis tools or switch to a more specific sub-scenario'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做链上研究、协议监控或钱包追踪，先从更高意图的入口收口会更快。'
              : 'If you already know you need on-chain research, protocol monitoring, or wallet tracking, starting with higher-intent entry points is faster.'}
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
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: locale === 'cn' || locale === 'tw' ? '链上分析对比' : 'On-chain analysis comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的目标已经变成地址、资金流和行为分析。'
                    : 'Best when the real goal is addresses, fund flows, and behavior analysis.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包研究对比' : 'Wallet research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更在意地址画像和资产视图。'
                    : 'Use this when address profiling and asset views matter more.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要看协议健康和长期指标。'
                    : 'Choose this when protocol health and recurring metrics are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`web3_analysis_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_web3_analysis_comparison' />
    </>
  );
}

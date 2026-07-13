import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw'
      ? 'AI Crypto 资产追踪工具对比'
      : 'AI tools for crypto portfolio tracking comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto 资产追踪工具，帮你更快选出适合持仓看板、钱包归集和组合观察的一款。'
      : 'Compare common crypto portfolio tracking tools to choose the one that fits dashboards, wallet rollups, and allocation monitoring best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Crypto 资产追踪工具', en: 'Crypto portfolio tracking tools' },
    comparisonLabel: {
      cn: 'AI Crypto 资产追踪工具对比',
      en: 'AI tools for crypto portfolio tracking comparison',
    },
    description: {
      cn: '如果你已经知道自己要解决组合看板、多钱包归集、资产分布或持仓观察，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need portfolio dashboards, multi-wallet rollups, allocation views, or holdings tracking, this page helps you compare common options side by side.',
    },
    searchQuery: 'portfolio',
    guideHref: '/guides/ai-tools-for-crypto-portfolio-tracking',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到资产追踪指南', en: 'Back to portfolio tracking guide' },
    altBrowseHref: '/explore?search=portfolio&sort=popular',
    altBrowseLabel: { cn: '浏览更多资产追踪工具', en: 'Browse more portfolio tools' },
    breadcrumbLabel: { cn: 'Crypto 资产追踪工具对比', en: 'Crypto portfolio tracking tools comparison' },
    compareTitle: {
      cn: '几款常见资产追踪工具的快速对照',
      en: 'A quick side-by-side look at common portfolio tracking tools',
    },
    compareSubtitle: { cn: 'Portfolio tracking', en: 'Portfolio tracking' },
    preferredToolNames: ['debank', 'zerion', 'zapper', 'nansen'],
    decisionCards: [
      {
        title: { cn: '看多钱包和多链支持', en: 'Wallet and chain coverage' },
        description: {
          cn: '优先看它能不能覆盖你真实使用的钱包结构和链。',
          en: 'Prioritize whether the tool actually covers the wallet structure and chains you use.',
        },
      },
      {
        title: { cn: '看组合视图清晰度', en: 'Portfolio view clarity' },
        description: {
          cn: '更该看资产归类、分配视图和历史变化是否清楚。',
          en: 'Focus more on asset grouping, allocation views, and how clear historical changes are.',
        },
      },
      {
        title: { cn: '看长期观察能力', en: 'Long-term tracking fit' },
        description: {
          cn: '如果你要长期跟踪持仓，就要看刷新频率、历史和导出能力。',
          en: 'If long-term tracking matters, look at refresh cadence, history depth, and export support.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要稳定看组合的用户', en: 'People who need a stable portfolio view' },
        description: {
          cn: '适合多钱包、多链或希望长期观察持仓变化的人。',
          en: 'Best for people with multiple wallets, multiple chains, or an ongoing need to track holdings over time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看预警的人', en: 'People who mainly need alerts' },
        description: {
          cn: '如果重点是异动提醒而不是组合看板，钱包监控页通常更适合。',
          en: 'If the real job is anomaly alerts rather than portfolio views, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果资产追踪已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If portfolio tracking is the clear goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-portfolio-tracking',
        title: { cn: '回到资产追踪指南', en: 'Back to the portfolio tracking guide' },
        description: {
          cn: '如果你还想先理清多钱包、组合视图和历史观察，可以回到指南页。',
          en: 'Go back if you still need to clarify multi-wallet views, portfolio clarity, and historical tracking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控对比', en: 'Go to wallet monitoring comparison' },
        description: {
          cn: '如果你真正要的是异动提醒和行为预警，这条更高意图。',
          en: 'A higher-intent path when alerts and behavior monitoring are the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你已经从持仓视图转向地址画像和行为判断，这页更贴近。',
          en: 'Move there once the workflow shifts from holdings views to address profiling and behavior analysis.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控工具对比', en: 'Switch to wallet monitoring comparison' },
        description: {
          cn: '如果你发现真正决策点更偏提醒和异动，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward alerts and anomalies.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: { cn: '回到 Web3 工具总对比', en: 'Back to Web3 tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选追踪、监控还是研究工具。',
          en: 'Best if you are not yet fully narrowed into tracking, monitoring, or research.',
        },
      },
      {
        href: '/explore?search=portfolio&sort=popular',
        title: { cn: '继续看更多资产候选', en: 'See more portfolio candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    toolSelectionNotes: {
      debank: {
        bestFor: {
          cn: '想快速看清钱包持仓、协议暴露和日常组合状态的人。',
          en: 'People who want a fast read on wallet holdings, protocol exposure, and day-to-day portfolio state.',
        },
        whyPickIt: {
          cn: '它更像组合可见性的起点层，适合把“我现在到底持有什么”先整理清楚。',
          en: 'It behaves like a starting layer for portfolio visibility, which helps answer what you actually hold right now.',
        },
        watchOut: {
          cn: '如果你真正要的是更深的地址关系或聪明钱研究，它通常只是第一站。',
          en: 'It is usually the first stop rather than the deepest layer if you need smart-money or address-relationship research.',
        },
      },
      zerion: {
        bestFor: {
          cn: '更在意跨链仓位、资产分配和组合界面清晰度的活跃持仓用户。',
          en: 'Active holders who care about cross-chain positions, allocations, and a cleaner portfolio interface.',
        },
        whyPickIt: {
          cn: '它在钱包优先和组合清晰度上很直接，适合长期盯仓位变化的人。',
          en: 'It is especially direct on wallet-first portfolio clarity, which suits people tracking positions over time.',
        },
        watchOut: {
          cn: '如果你更在意协议研究或深度链上分析，它会显得不够厚。',
          en: 'It can feel too light if the real work is protocol research or deeper on-chain analysis.',
        },
      },
      zapper: {
        bestFor: {
          cn: '希望从钱包视角快速看资产、协议和动作概览的人。',
          en: 'People who want a quick wallet-first overview of assets, protocols, and activity.',
        },
        whyPickIt: {
          cn: '它适合用作组合和地址工作的中间层，介于轻量可见性和更深研究之间。',
          en: 'It works well as a middle layer between lightweight portfolio visibility and deeper Web3 research.',
        },
        watchOut: {
          cn: '如果你主要要做预警、实体归因或重研究输出，仍值得继续比下去。',
          en: 'You may still want to compare further if alerting, entity attribution, or heavier research output matters more.',
        },
      },
      nansen: {
        bestFor: {
          cn: '不仅看持仓，还要结合行为、资金流和聪明钱信号一起判断的人。',
          en: 'People who want holdings views plus behavior, fund-flow context, and smart-money signals.',
        },
        whyPickIt: {
          cn: '它把组合观察往研究和信号判断那一侧拉得更深。',
          en: 'It pushes portfolio tracking further toward signal interpretation and research depth.',
        },
        watchOut: {
          cn: '如果你只是想看自己的钱包和资产分布，它可能比需求更重。',
          en: 'It can feel heavier than necessary if you mostly want a clean view of your own wallets and allocations.',
        },
      },
    },
    tips: {
      cn: [
        '先看支持的钱包和链，再看资产归类和历史视图。',
        '如果你会长期使用，重点看刷新频率、导出和稳定性。',
        '比“显示很多代币”更重要的是能不能把组合看清楚。',
      ],
      en: [
        'Start with wallet and chain coverage, then move to asset grouping and historical views.',
        'For long-term use, focus on refresh cadence, export support, and stability.',
        'More important than showing many tokens is whether the portfolio becomes easier to understand.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看钱包与链支持、资产归类、组合视图、历史能力和长期观察体验。',
          en: 'We compare wallet and chain coverage, asset grouping, portfolio views, historical depth, and long-term tracking experience.',
        },
      },
      {
        question: { cn: '为什么单独做资产追踪对比？', en: 'Why compare portfolio tracking tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是提醒，而是能不能稳定整理和观察你的真实持仓结构。',
          en: 'Because the decision is usually less about alerts and more about whether the tool can reliably organize and present your real holdings structure.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看资产追踪工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing portfolio tracking tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果资产追踪已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If portfolio tracking is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 榜单' : 'Web3 ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看更高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-crypto-portfolio-tracking',
                title: locale === 'cn' || locale === 'tw' ? '资产追踪指南' : 'Portfolio tracking guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是看组合、归集还是长期观察。'
                    : 'Re-check whether the need is portfolio view, rollups, or long-term tracking.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心提醒和异动。'
                    : 'Useful when alerts and anomalies matter more.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包研究对比' : 'Wallet research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你已经转向地址画像和行为分析。'
                    : 'Better once the workflow shifts to address profiling and behavior analysis.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`portfolio_ranking_${item.href.split('/').pop()}`}
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
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_portfolio_tracking_comparison' />
    </>
  );
}

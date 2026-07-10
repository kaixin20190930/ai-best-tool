import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 协议分析工具对比' : 'AI tools for protocol analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的协议 AI 工具，帮你更快选出适合协议健康和趋势观察的一个。'
      : 'Compare common protocol AI tools to choose the one that fits your health and trend workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '协议工具', en: 'Protocol tools' },
    comparisonLabel: { cn: 'AI 协议分析工具对比', en: 'AI tools for protocol analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做协议健康观察、使用量分析或研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need protocol health monitoring, usage analysis, or research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'protocol',
    guideHref: '/guides/ai-tools-for-protocol-analytics',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到协议指南', en: 'Back to protocol guide' },
    altBrowseHref: '/explore?search=protocol&sort=popular',
    altBrowseLabel: { cn: '浏览更多协议工具', en: 'Browse more protocol tools' },
    breadcrumbLabel: { cn: '协议工具对比', en: 'Protocol tools comparison' },
    compareTitle: { cn: '几款常见协议工具的快速对照', en: 'A quick side-by-side look at common protocol tools' },
    compareSubtitle: { cn: 'Protocol', en: 'Protocol' },
    preferredToolNames: ['messari', 'footprint', 'token-terminal', 'defillama'],
    comparisonDimensions: [
      {
        title: { cn: '协议覆盖', en: 'Protocol coverage' },
        description: {
          cn: '先看它是否覆盖你真正研究的协议和生态，而不是只看列表长度。',
          en: 'Check whether it covers the protocols and ecosystems you actually study rather than just the length of the list.',
        },
      },
      {
        title: { cn: '历史与趋势', en: 'History and trends' },
        description: {
          cn: '历史深度、趋势视图和长期观察稳定性，往往决定它能不能当研究底座。',
          en: 'History depth, trend views, and long-term stability often decide whether it can act as a research base.',
        },
      },
      {
        title: { cn: '指标体系', en: 'Metric framework' },
        description: {
          cn: '如果你要做长期分析，指标是不是一致、可比、可复用会很重要。',
          en: 'If this will support ongoing analysis, whether metrics are consistent, comparable, and reusable matters a lot.',
        },
      },
      {
        title: { cn: '研究输出', en: 'Research output' },
        description: {
          cn: '导出、API 和复盘效率会直接影响它能不能进入团队工作流。',
          en: 'Exports, APIs, and review efficiency directly affect whether it fits team workflows.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '看协议覆盖', en: 'Protocol coverage' },
        description: {
          cn: '优先看它是否覆盖你真正研究的协议和生态，而不是只看数量。',
          en: 'Prioritize whether it covers the protocols and ecosystems you actually study rather than only counting how many it lists.',
        },
      },
      {
        title: { cn: '看历史和趋势', en: 'History and trends' },
        description: {
          cn: '更该看历史深度、趋势视图和长期观察是否稳定。',
          en: 'Focus more on history depth, trend views, and whether long-term observation feels stable.',
        },
      },
      {
        title: { cn: '看研究输出能力', en: 'Research output fit' },
        description: {
          cn: '如果要给团队或客户使用，就要看 API、导出和复盘效率。',
          en: 'If the work feeds a team or clients, look at API access, exports, and how efficient the review workflow is.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '持续做协议研究的人', en: 'People doing ongoing protocol research' },
        description: {
          cn: '适合需要持续跟踪协议健康、使用量和趋势变化的研究或运营角色。',
          en: 'Best for research or operations roles that need to track protocol health, usage, and trend changes over time.',
        },
      },
      {
        title: { cn: '做长期协议 watchlist 的团队', en: 'Teams building long-term protocol watchlists' },
        description: {
          cn: '当你需要持续比较不同协议、赛道和关键指标，这类对比会更有用。',
          en: 'These comparisons are especially useful when teams need to compare protocols, sectors, and key metrics continuously over time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看单个钱包异动的人', en: 'People mostly tracking single-wallet anomalies' },
        description: {
          cn: '如果重点是提醒和地址异动，钱包监控页通常更适合。',
          en: 'If the real job is alerts and wallet anomalies, wallet monitoring pages are usually a better fit.',
        },
      },
      {
        title: { cn: '只看轻量价格走势的人', en: 'People only watching lightweight price moves' },
        description: {
          cn: '如果你只是想扫一眼价格波动，而不是研究协议健康与使用量，这类工具通常会显得偏重。',
          en: 'These tools usually feel too heavy when the real task is only quick price watching rather than protocol health or usage analysis.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果协议分析已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If protocol analytics is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics',
        title: { cn: '回到协议分析指南', en: 'Back to the protocol guide' },
        description: {
          cn: '如果你还想先理清协议健康、趋势和研究范围，可以回到指南页。',
          en: 'Go back if you still need to clarify protocol health, trends, and research scope first.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你现在更关心地址和资金流，这条更高意图。',
          en: 'A higher-intent path when addresses and fund flows become the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-defi-analytics-comparison',
        title: { cn: '转去 DeFi 分析对比', en: 'Go to DeFi analytics comparison' },
        description: {
          cn: '如果你的重点已经变成 DeFi 协议与流动性，这页更顺。',
          en: 'Move there when the real need shifts toward DeFi protocols and liquidity.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-defi-analytics-comparison',
        title: { cn: '转去 DeFi 分析工具对比', en: 'Switch to DeFi analytics comparison' },
        description: {
          cn: '如果你发现真正决策点更偏 DeFi 协议与流动性，这页更合适。',
          en: 'Move there if the real decision is shifting toward DeFi protocol and liquidity analysis.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: { cn: '回到 Web3 工具总对比', en: 'Back to Web3 tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选协议、钱包还是研究工具。',
          en: 'Best if you are not yet fully narrowed into protocol, wallet, or research tooling.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Switch to on-chain analysis comparison' },
        description: {
          cn: '如果你开始更关心地址、资金流和异常行为，这页会更贴近真实问题。',
          en: 'Move there if addresses, fund flow, and unusual behavior are becoming the real question.',
        },
      },
      {
        href: '/categories/web3?sort=popular',
        title: { cn: '回到 Web3 分类', en: 'Return to the Web3 category' },
        description: {
          cn: '当你想扩大 shortlist 并回看更多真实条目时，直接回分类页。',
          en: 'Go back to the category when you want a wider shortlist of real listings.',
        },
      },
    ],
    toolSelectionNotes: {
      messari: {
        bestFor: {
          cn: '更看重协议情报、研究上下文和更完整判断框架的研究者。',
          en: 'Researchers who care more about protocol intelligence, context, and richer decision framing.',
        },
        whyPickIt: {
          cn: '它更像研究层工具，而不是只给你看一串指标。',
          en: 'It feels more like a research layer than a simple stream of metrics.',
        },
        watchOut: {
          cn: '如果你只需要轻量指标看板，它可能比需求更重。',
          en: 'It may feel heavier than necessary if you mostly need lightweight metrics views.',
        },
      },
      footprint: {
        bestFor: {
          cn: '想把链上数据变成持续看板和重复分析工作流的团队。',
          en: 'Teams that want recurring dashboards and repeatable analytics workflows built on chain data.',
        },
        whyPickIt: {
          cn: '它更适合把协议分析做成“持续运转的面板”，而不是临时查看。',
          en: 'It is strong when protocol analysis needs to become an ongoing dashboard habit rather than one-off checking.',
        },
        watchOut: {
          cn: '如果你只想快速扫一眼协议或钱包，它可能不如轻量工具直接。',
          en: 'It may be less direct than lighter tools if you only need a quick protocol or wallet glance.',
        },
      },
      'token-terminal': {
        bestFor: {
          cn: '更重视协议基本面、商业指标和长期价值判断的人。',
          en: 'People who care more about protocol fundamentals, business metrics, and longer-term value judgment.',
        },
        whyPickIt: {
          cn: '它把协议分析拉向基本面视角，适合更偏投资和价值研究的工作流。',
          en: 'It pushes protocol analysis toward a fundamentals lens, which is useful for investment and value-oriented workflows.',
        },
        watchOut: {
          cn: '如果你更在意实时钱包或异常活动，它不会是第一入口。',
          en: 'It will not be the first stop if the real priority is live wallet or anomaly activity.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想快速看 DeFi 生态、协议规模和宏观变化的人。',
          en: 'People who want a fast view of DeFi ecosystems, protocol scale, and macro changes.',
        },
        whyPickIt: {
          cn: '它非常适合做 broad scan，让你快速判断“下一步深入哪里”。',
          en: 'It is very good for broad scanning and deciding where deeper analysis should happen next.',
        },
        watchOut: {
          cn: '如果你要更深的研究语境或细粒度定制分析，仍要继续往下比。',
          en: 'You may still want deeper tools if richer context or finer-grained analysis matters more.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你看重的是研究深度、持续看板，还是协议基本面。',
        '再看协议覆盖和历史深度，然后确认是否支持你常用的链和赛道。',
        '如果你要团队使用，关注 API、导出、权限和告警能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'First separate research depth, recurring dashboards, and protocol fundamentals needs.',
        'Then compare protocol coverage and historical depth before checking chain and sector support.',
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
        question: { cn: '为什么只看协议工具？', en: 'Why only protocol tools?' },
        answer: {
          cn: '因为协议工具的意图比较明确，通常围绕协议健康、使用量和趋势研究，对比也更直接。',
          en: 'Because protocol tools usually map to clear needs around health, usage, and trend research, making comparison more direct.',
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
            ? '这页先看真实可验证的协议分析信号，再继续判断是否需要长期监控、趋势追踪和研究输出。'
            : 'This page looks at verifiable protocol-analysis signals first, then helps you decide whether long-term monitoring, trend tracking, and research output are needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '协议覆盖' : 'Protocol coverage',
            value: locale === 'cn' || locale === 'tw' ? '是否覆盖你的研究对象' : 'Whether it covers your research targets',
            note:
              locale === 'cn' || locale === 'tw'
                ? '研究页最怕覆盖面不对，先确认对象。'
                : 'Research pages fail fast when the coverage target is wrong.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '趋势稳定性' : 'Trend stability',
            value: locale === 'cn' || locale === 'tw' ? '长期趋势和历史是否可复用' : 'Whether trends and history are reusable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '稳定的趋势视图比一次性截图更有价值。'
                : 'Stable trend views are more useful than one-off screenshots.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '研究产出' : 'Research output',
            value: locale === 'cn' || locale === 'tw' ? '导出、分享、API' : 'Exports, sharing, and API',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果要做团队研究，这些就是落地门槛。'
                : 'If this supports team research, these are the practical thresholds.',
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
              ? '先看榜单，再决定是否继续看协议工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing protocol tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果协议分析已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If protocol analytics is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
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
                href: '/guides/ai-tools-for-protocol-analytics',
                title: locale === 'cn' || locale === 'tw' ? '协议指南' : 'Protocol guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认你要的是研究、看板还是基本面。'
                    : 'Re-check whether the job is research, dashboards, or fundamentals.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: locale === 'cn' || locale === 'tw' ? '链上分析对比' : 'On-chain analysis comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你真正关心的是地址和资金流。'
                    : 'Useful when addresses and fund flows are the real need.',
              },
              {
                href: '/guides/ai-tools-for-defi-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'DeFi 分析对比' : 'DeFi analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的重点已经变成 DeFi 协议与流动性。'
                    : 'Better when DeFi protocols and liquidity are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`protocol_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_protocol_analytics_comparison' />
    </>
  );
}

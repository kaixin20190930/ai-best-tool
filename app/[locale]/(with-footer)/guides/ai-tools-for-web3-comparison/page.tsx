import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { Link } from '@/app/navigation';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 工具对比' : 'AI tools for Web3 comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Web3 AI 工具，先从指南和榜单收窄，再选出适合链上工作流的一个。'
      : 'Compare common Web3 AI tools, narrowing from guide and ranking first, to choose the one that fits your on-chain workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Web3 工具', en: 'Web3 tools' },
    comparisonLabel: { cn: 'AI Web3 工具对比', en: 'AI tools for Web3 comparison' },
    description: {
      cn: '如果你已经知道自己要做链上分析、钱包工作流或 Crypto 研究，这一页会帮你把几款常见工具放在一起看，并回到榜单和指南。',
      en: 'If you already know you need on-chain analysis, wallet workflows, or crypto research, this page helps you compare a few common tools side by side and routes you back to the guide and ranking.',
    },
    searchQuery: 'web3',
    guideHref: '/guides/ai-tools-for-web3',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 Web3 指南', en: 'Back to Web3 guide' },
    altBrowseHref: '/explore?search=web3&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Web3 工具', en: 'Browse more Web3 tools' },
    breadcrumbLabel: { cn: 'Web3 工具对比', en: 'Web3 tools comparison' },
    compareTitle: { cn: '几款常见 Web3 工具的快速对照', en: 'A quick side-by-side look at common Web3 tools' },
    compareSubtitle: { cn: 'Web3', en: 'Web3' },
    preferredToolNames: ['dune', 'debank', 'messari', 'alchemy'],
    comparisonDimensions: [
      {
        title: { cn: '链覆盖与数据源', en: 'Chain coverage and data sources' },
        description: {
          cn: '先看它支持哪些链、数据源够不够深，以及能不能覆盖你真正关心的协议或地址。看完后再回到榜单对照。',
          en: 'Check which chains it supports, how deep the data sources go, and whether it covers the protocols or addresses you care about, then return to the ranking to compare fit.',
        },
      },
      {
        title: { cn: '查询与分析深度', en: 'Query and analysis depth' },
        description: {
          cn: '如果你要的是研究结论而不是截图，要重点看它能不能把碎片数据变成可复用视图。',
          en: 'If you need research conclusions rather than screenshots, look for reusable views instead of fragmented data only.',
        },
      },
      {
        title: { cn: '监控与提醒', en: 'Monitoring and alerts' },
        description: {
          cn: '钱包、协议和资产监控类工具，通知、历史轨迹和异常判断会比“看起来很全”更重要。',
          en: 'For wallet, protocol, and asset monitoring, alerts, history trails, and anomaly detection matter more than surface breadth.',
        },
      },
      {
        title: { cn: '开发接入能力', en: 'Developer integration' },
        description: {
          cn: '如果工具最终要进产品或内部工作流，API、导出、权限和自动化就不能只是附加项。',
          en: 'If the tool has to fit into a product or internal workflow, API access, exports, permissions, and automation cannot be afterthoughts.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做链上研究', en: 'On-chain research' },
        description: {
          cn: '先看链覆盖、查询深度和是否适合把碎片数据变成可复用结论。',
          en: 'Start with chain coverage, query depth, and whether the tool helps turn fragmented data into reusable conclusions.',
        },
      },
      {
        title: { cn: '做钱包与地址监控', en: 'Wallet and address monitoring' },
        description: {
          cn: '更该看通知、可视化、历史轨迹和异常行为判断。',
          en: 'Focus more on alerts, visualization, historical trails, and anomaly detection.',
        },
      },
      {
        title: { cn: '做团队化的数据工作流', en: 'Team data workflows' },
        description: {
          cn: 'API、导出、协作和权限管理会比单次查数据更重要。',
          en: 'API access, exports, collaboration, and permissioning matter more than one-off lookups.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '研究员 / 交易员 / 分析师', en: 'Researchers, traders, and analysts' },
        description: {
          cn: '适合需要长期盯链上数据、协议动态和地址行为的人。',
          en: 'A strong fit for anyone continuously tracking on-chain signals, protocol shifts, or address behavior.',
        },
      },
      {
        title: { cn: '已经明确在做 Web3 垂直工作流的人', en: 'People already inside Web3 workflows' },
        description: {
          cn: '如果你已经知道自己要看链、地址、协议和风险，这类页面会很高效。',
          en: 'These comparison pages work best once you already know your real work is on-chain, wallet, protocol, or risk focused.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果你已经明确要做 Web3 工具选型，先用榜单把 shortlist 收窄。',
          en: 'If Web3 tooling is clearly the goal, use the ranking first to narrow the shortlist.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-analysis-comparison',
        title: { cn: '转去 Web3 分析对比', en: 'Go to Web3 analysis comparison' },
        description: {
          cn: '如果你的决策更偏链上研究、协议监控和钱包追踪，这页更高意图。',
          en: 'A higher-intent path when the decision is really about on-chain research, protocol monitoring, and wallet tracking.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你更关心地址画像和行为判断，继续看这条路。',
          en: 'Move here if address profiling and behavior analysis are the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '如果你想把链上研究范围再拉宽一点，这页也值得继续看。',
          en: 'Use this when you want to broaden the research shortlist a little further.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看泛 AI 榜单的人', en: 'People browsing broad AI lists' },
        description: {
          cn: '如果你还没确定自己真的需要 Web3 数据工具，这页会显得太垂直。',
          en: 'If you are still exploring broad AI tooling, this page will likely feel too specialized.',
        },
      },
      {
        title: { cn: '不需要链上数据的人', en: 'People who do not need on-chain data' },
        description: {
          cn: '如果工作重点不在链、协议、地址或资产行为，Web3 工具通常不是最优先入口。',
          en: 'If chains, protocols, wallets, and asset behavior are not central to the job, Web3 tools are probably not the first stop.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '当核心问题已经明确是地址、流向和链上行为时，这页更贴近高意图搜索。',
          en: 'The better path when the real need is addresses, fund flow, and on-chain behavior.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '如果你更偏项目调研、叙事判断和信息整合，这里更合适。',
          en: 'A better fit when the decision is really about project research, narratives, and information synthesis.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果你更关心协议健康、指标看板和长期跟踪，这页更贴近真实决策。',
          en: 'A better fit when protocol health, recurring dashboards, and long-term tracking are the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控对比', en: 'Go to wallet monitoring comparison' },
        description: {
          cn: '如果你关心的是大户、地址风险和异动提醒，就继续走这条路，再回榜单收口。',
          en: 'Continue here if whales, wallet risk, and anomaly alerts are the real priority, then return to the ranking to narrow down again.',
        },
      },
    ],
    toolSelectionNotes: {
      dune: {
        bestFor: {
          cn: '需要自己查链上数据、做查询和搭建分析视图的研究者与分析师。',
          en: 'Researchers and analysts who want to query chain data directly and build their own analytical views.',
        },
        whyPickIt: {
          cn: '它更接近查询与分析工作台，适合把零散链上数据变成真正可复用的研究结果。',
          en: 'It behaves more like a query-first analytics workbench that turns fragmented chain data into reusable research.',
        },
        watchOut: {
          cn: '如果你只想要现成答案，而不想自己深入分析，它会显得比你需要的更重。',
          en: 'It can feel heavier than necessary if you mostly want ready-made answers instead of deeper analysis.',
        },
      },
      debank: {
        bestFor: {
          cn: '想快速看清钱包持仓、活动和协议暴露的活跃 Web3 用户。',
          en: 'Active Web3 users who want a fast view of wallet holdings, activity, and protocol exposure.',
        },
        whyPickIt: {
          cn: '它把“钱包可见性”这件事做得很直接，适合日常监控和快速判断。',
          en: 'It makes wallet visibility very direct, which is valuable for routine monitoring and quick judgment.',
        },
        watchOut: {
          cn: '如果你的工作重点是协议研究或开发基础设施，它通常不是最深的一层。',
          en: 'It is usually not the deepest layer when the real job is protocol research or developer infrastructure.',
        },
      },
      messari: {
        bestFor: {
          cn: '更看重协议情报、赛道判断和研究输出的人。',
          en: 'People who care more about protocol intelligence, market narratives, and research output.',
        },
        whyPickIt: {
          cn: '它比轻量跟踪产品更偏研究层，适合做更有上下文的 Web3 判断。',
          en: 'It leans more toward a research layer than lightweight tracking products, which helps with context-rich Web3 decisions.',
        },
        watchOut: {
          cn: '如果你只是看钱包或仓位变化，它可能比你的需求更偏重。',
          en: 'It may feel heavier than necessary if you mostly care about wallet or position changes.',
        },
      },
      alchemy: {
        bestFor: {
          cn: '把链上数据和区块链接入真实产品、服务或开发工作流的团队。',
          en: 'Teams integrating blockchain data and chain access into real products, services, or developer workflows.',
        },
        whyPickIt: {
          cn: '它把 Web3 的重点拉回到 API 和应用基础设施层，适合开发导向决策。',
          en: 'It brings the decision back to APIs and application infrastructure, which is ideal for developer-oriented workflows.',
        },
        watchOut: {
          cn: '如果你只是做研究浏览或钱包跟踪，它会比你需要的更偏基础设施。',
          en: 'It can feel too infrastructure-heavy if your job is mostly browsing research or monitoring wallets.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在选查询分析、钱包可见性、研究情报，还是开发基础设施。',
        '再看它支持的链和数据源，不同产品的覆盖面会差很多。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'First separate query analytics, wallet visibility, research intelligence, and developer infrastructure.',
        'Then compare supported chains and data sources, because coverage varies a lot.',
        'For team use, look at API access, exports, permissions, and historical queries.',
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
        question: { cn: '为什么只看 Web3 工具？', en: 'Why only Web3 tools?' },
        answer: {
          cn: '因为这几款分别覆盖了链上分析、研究情报、钱包可见性和关系可视化，对比维度更完整。',
          en: 'Because together they cover on-chain analysis, research intelligence, wallet visibility, and relationship visualization.',
        },
      },
    ],
  });

  const quickStarts = [
    {
      href: '/best-ai-tools/ai-web3-tools',
      title: locale === 'cn' || locale === 'tw' ? 'Web3 榜单' : 'Web3 ranking',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '先看 shortlist，再回比较页。'
          : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-tools-for-web3',
      title: locale === 'cn' || locale === 'tw' ? 'Web3 指南' : 'Web3 guide',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '重新确认是分析、监控还是研究。'
          : 'Re-check whether the job is analysis, monitoring, or research.',
    },
    {
      href: '/ai/dune',
      title: 'Dune',
      desc:
        locale === 'cn' || locale === 'tw' ? '适合查询驱动的链上分析。' : 'Useful for query-driven on-chain analysis.',
    },
    {
      href: '/ai/defillama',
      title: 'DefiLlama',
      desc: locale === 'cn' || locale === 'tw' ? '适合协议和市场覆盖。' : 'Good for protocol and market coverage.',
    },
  ];

  return (
    <>
      <section className='mx-auto mt-8 max-w-6xl rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:px-8 lg:py-8'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
          {locale === 'cn' || locale === 'tw' ? '先看这些入口' : 'Start here'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {locale === 'cn' || locale === 'tw'
            ? '从榜单、指南和代表工具开始收窄'
            : 'Narrow from ranking, guide, and representative tools'}
        </h2>
        <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          {quickStarts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Web3 工具比较最重要的是数据可信度、链上覆盖和研究流程，而不是单纯谁的界面更花。'
            : 'Web3 tool comparison should focus on data trustworthiness, on-chain coverage, and research workflow rather than just who has the flashiest UI.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '数据可信度' : 'Data trust',
            value: locale === 'cn' || locale === 'tw' ? '先看数据来源与可验证性' : 'Check source quality and verifiability first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '链上工具最怕数据看起来很全，实际却不准。'
                : 'The biggest risk is data that looks comprehensive but is not actually reliable.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '链上覆盖' : 'On-chain coverage',
            value: locale === 'cn' || locale === 'tw' ? '看能否覆盖关键协议' : 'See whether it covers key protocols',
            note:
              locale === 'cn' || locale === 'tw'
                ? '覆盖面直接影响研究结果是否可用。'
                : 'Coverage directly affects whether the research result is usable.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '研究流程' : 'Research workflow',
            value: locale === 'cn' || locale === 'tw' ? '看是否适合持续分析' : 'Check whether it supports ongoing analysis',
            note:
              locale === 'cn' || locale === 'tw'
                ? '导出、收藏和历史跟踪很关键。'
                : 'Export, saves, and historical tracking matter a lot.',
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
              ? '先看榜单，再决定是继续看 Web3 工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Web3 tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果 Web3 已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If Web3 is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
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
                href: '/guides/ai-tools-for-web3',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 指南' : 'Web3 guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是分析、监控还是研究。'
                    : 'Re-check whether the job is analysis, monitoring, or research.',
              },
              {
                href: '/guides/ai-tools-for-web3-analysis-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 分析对比' : 'Web3 analysis comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果重点是链上分析和协议研究。'
                    : 'Useful when on-chain analysis and protocol research are the real need.',
              },
              {
                href: '/guides/ai-tools-for-wallet-monitoring-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包监控对比' : 'Wallet monitoring comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心提醒和异动。'
                    : 'Better when alerts and anomalies matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`web3_comparison_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_web3_comparison' />
    </>
  );
}

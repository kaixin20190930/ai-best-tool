import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 钱包监控工具对比' : 'AI tools for wallet monitoring comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的钱包监控 AI 工具，帮你更快选出适合提醒和异常观察的一个。'
      : 'Compare common wallet monitoring AI tools to choose the one that fits your alerting and anomaly-watching workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '钱包监控工具', en: 'Wallet monitoring tools' },
    comparisonLabel: { cn: 'AI 钱包监控工具对比', en: 'AI tools for wallet monitoring comparison' },
    description: {
      cn: '如果你已经知道自己要做地址提醒、异常观察或风控监控，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need address alerts, anomaly watching, or risk monitoring, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'wallet',
    guideHref: '/guides/ai-tools-for-wallet-monitoring',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到钱包监控指南', en: 'Back to wallet guide' },
    altBrowseHref: '/explore?search=wallet&sort=popular',
    altBrowseLabel: { cn: '浏览更多钱包工具', en: 'Browse more wallet tools' },
    breadcrumbLabel: { cn: '钱包监控工具对比', en: 'Wallet monitoring tools comparison' },
    compareTitle: { cn: '几款常见钱包监控工具的快速对照', en: 'A quick side-by-side look at common wallet tools' },
    compareSubtitle: { cn: '钱包监控', en: 'Wallet monitoring' },
    preferredToolNames: ['debank', 'nansen', 'arkham', 'bubblemaps'],
    comparisonDimensions: [
      {
        title: { cn: '持仓可见性', en: 'Holdings visibility' },
        description: {
          cn: '先看钱包资产、协议暴露和跨链视图是否一眼就能看明白。',
          en: 'Check whether asset views, protocol exposure, and cross-chain visibility are easy to understand at a glance.',
        },
      },
      {
        title: { cn: '提醒质量', en: 'Alert quality' },
        description: {
          cn: '提醒准不准、快不快，通常比看板好不好看更关键。',
          en: 'Whether alerts are accurate and timely usually matters more than dashboard polish.',
        },
      },
      {
        title: { cn: '异常与关系线索', en: 'Anomaly and relationship clues' },
        description: {
          cn: '如果你要做风控或调查，异常模式、标签和关系图会很重要。',
          en: 'If risk or investigation matters, anomaly patterns, labels, and relationship views become important.',
        },
      },
      {
        title: { cn: '团队协作', en: 'Team collaboration' },
        description: {
          cn: '多地址、标签、导出和共享会决定它能不能进入团队流程。',
          en: 'Multi-address support, tags, exports, and sharing determine whether the tool fits team workflows.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '看持仓与可见性', en: 'Holdings and visibility' },
        description: {
          cn: '先看钱包资产、协议暴露和跨链视图是否清楚，而不是只看界面漂不漂亮。',
          en: 'Start with asset clarity, protocol exposure, and cross-chain visibility rather than only how polished the UI looks.',
        },
      },
      {
        title: { cn: '看监控与提醒', en: 'Monitoring and alerts' },
        description: {
          cn: '如果你真的要长期盯地址行为，提醒方式和异常发现能力会比静态视图更重要。',
          en: 'If you really need to watch address behavior over time, alerting and anomaly detection matter more than static views.',
        },
      },
      {
        title: { cn: '看团队使用场景', en: 'Team workflow fit' },
        description: {
          cn: '多地址、标签、导出和协作能力决定它能不能进入团队日常流程。',
          en: 'Multi-address support, labels, exports, and collaboration determine whether the tool fits team routines.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '长期盯钱包和仓位变化的人', en: 'People tracking wallets and positions continuously' },
        description: {
          cn: '适合活跃持仓用户、研究员和运营者做高频监控。',
          en: 'A strong fit for active holders, researchers, and operators doing frequent monitoring.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '主要做协议尽调的人', en: 'People mainly doing protocol diligence' },
        description: {
          cn: '如果真正问题是协议健康和赛道判断，协议分析或研究页通常更合适。',
          en: 'If the real job is protocol health or market diligence, protocol analytics or research pages are usually a better fit.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果钱包监控已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If wallet monitoring is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring',
        title: { cn: '回到钱包监控指南', en: 'Back to the wallet monitoring guide' },
        description: {
          cn: '如果你还想先理清提醒、异常和风控监控，可以回到指南页。',
          en: 'Go back if you still need to clarify alerts, anomalies, and risk monitoring first.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你现在更关心地址归因和行为解释，这条更高意图。',
          en: 'A higher-intent path when address attribution and behavior interpretation matter more.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
        title: { cn: '转去资产追踪对比', en: 'Go to portfolio tracking comparison' },
        description: {
          cn: '如果你的工作从提醒转回持仓和组合视图，这页更贴近。',
          en: 'Move there when the workflow shifts back toward holdings and portfolio views.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你不只是看变化，还要调查地址关系和行为线索，这页更高意图。',
          en: 'A better path when you need wallet investigation and behavior clues, not only monitoring.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你开始需要更深的数据和分析结构，这页更贴近下一步。',
          en: 'Move there if you are starting to need deeper chain data and analytical structure.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: { cn: '回到 Web3 工具总对比', en: 'Back to Web3 tools comparison' },
        description: {
          cn: '适合还没完全确定自己是在选钱包、研究还是协议工具。',
          en: 'Best if you are not yet fully narrowed into wallet, research, or protocol tooling.',
        },
      },
    ],
    toolSelectionNotes: {
      debank: {
        bestFor: {
          cn: '想快速看清钱包活动、持仓变化和协议暴露的日常观察用户。',
          en: 'People who want a quick daily read on wallet activity, holdings changes, and protocol exposure.',
        },
        whyPickIt: {
          cn: '它更偏轻量监控起点层，适合先回答“这个钱包现在大概发生了什么”。',
          en: 'It behaves more like a lightweight monitoring starting layer, which is good for answering what is happening in a wallet right now.',
        },
        watchOut: {
          cn: '如果你更在意告警、实体调查或更深的研究结构，它通常不是最深的一层。',
          en: 'It is usually not the deepest layer if alerting, entity investigation, or deeper research structure matters more.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关注地址标签、聪明钱行为和更专业监控视角的团队。',
          en: 'Teams that care more about address labels, smart-money behavior, and a more professional monitoring angle.',
        },
        whyPickIt: {
          cn: '它把钱包监控往研究和行为信号那一侧拉得更深。',
          en: 'It pushes wallet monitoring further toward research depth and behavior signals.',
        },
        watchOut: {
          cn: '如果你只是想看自己的钱包和基础提醒，它可能比需求更重。',
          en: 'It can feel heavier than necessary if you mostly want a simple view of your own wallets and basic alerts.',
        },
      },
      arkham: {
        bestFor: {
          cn: '要做地址归因、行为追踪和调查型监控的人。',
          en: 'People doing address attribution, behavior tracking, and investigation-style monitoring.',
        },
        whyPickIt: {
          cn: '它更适合把“是谁在动、和谁相关、为什么值得注意”这一层看清楚。',
          en: 'It is stronger when the job is understanding who is moving, what it connects to, and why it matters.',
        },
        watchOut: {
          cn: '如果你只想做轻量组合查看，它通常会显得太调查导向。',
          en: 'It usually feels too investigation-oriented if you only want lightweight portfolio checks.',
        },
      },
      bubblemaps: {
        bestFor: {
          cn: '想快速看清钱包聚类、持有人结构和异常关系线索的人。',
          en: 'People who want fast visual clues around wallet clusters, holder structure, and unusual relationships.',
        },
        whyPickIt: {
          cn: '它更擅长把“结构上不对劲的地方”直接可视化出来。',
          en: 'It is stronger at making structurally unusual patterns visually obvious.',
        },
        watchOut: {
          cn: '如果你需要完整告警栈或深度看板，它通常只是一个线索层，不是全栈答案。',
          en: 'If you need a full alerting stack or deep dashboards, it is usually a clue layer rather than the whole answer.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你更在意资产可见性、提醒监控，还是更深的钱包研究。',
        '再看提醒速度和通知渠道，不同工具差异会很大。',
        '如果你要团队使用，关注多地址、标签、导出和权限控制。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'First separate asset visibility, alerting, and deeper wallet investigation needs.',
        'Then compare alert speed and notification channels because tools differ a lot.',
        'For team use, look at multi-address support, tags, exports, and permission controls.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看提醒速度、覆盖链、免费可用性、评分和实际使用感。',
          en: 'We compare alert speed, chain coverage, free usability, ratings, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看钱包监控工具？', en: 'Why only wallet tools?' },
        answer: {
          cn: '因为钱包监控工具的意图很明确，通常围绕提醒、异常和风控，对比也更直接。',
          en: 'Because wallet tools usually map to clear needs around alerts, anomalies, and risk controls, making comparison more direct.',
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
              ? '先看榜单，再决定是继续看钱包监控工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing wallet monitoring tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果监控和提醒已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If monitoring and alerts are already the goals, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
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
                href: '/guides/ai-tools-for-wallet-monitoring',
                title: locale === 'cn' || locale === 'tw' ? '钱包监控指南' : 'Wallet monitoring guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是提醒、异常还是风控。'
                    : 'Re-check whether the need is alerts, anomalies, or risk monitoring.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包研究对比' : 'Wallet research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当你更关心地址归因和行为解释。'
                    : 'Useful when address attribution and behavior interpretation matter more.',
              },
              {
                href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
                title: locale === 'cn' || locale === 'tw' ? '资产追踪对比' : 'Portfolio tracking comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果工作重点回到持仓和组合视图。'
                    : 'Better when the workflow shifts back toward holdings and portfolio views.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`wallet_monitoring_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_wallet_monitoring_comparison' />
    </>
  );
}

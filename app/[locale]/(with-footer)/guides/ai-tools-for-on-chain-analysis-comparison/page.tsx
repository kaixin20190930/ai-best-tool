import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 链上分析工具对比' : 'AI tools for on-chain analysis comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的链上分析 AI 工具，帮你更快选出适合研究和监控的一个。'
      : 'Compare common on-chain AI tools to choose the one that fits your research and monitoring workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '链上分析工具', en: 'On-chain analysis tools' },
    comparisonLabel: { cn: 'AI 链上分析工具对比', en: 'AI tools for on-chain analysis comparison' },
    description: {
      cn: '如果你已经知道自己要做地址追踪、资金流观察或项目研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need address tracking, fund-flow observation, or project research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'on-chain',
    guideHref: '/guides/ai-tools-for-on-chain-analysis',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到链上分析指南', en: 'Back to on-chain guide' },
    altBrowseHref: '/explore?search=on-chain&sort=popular',
    altBrowseLabel: { cn: '浏览更多链上分析工具', en: 'Browse more on-chain tools' },
    breadcrumbLabel: { cn: '链上分析工具对比', en: 'On-chain analysis tools comparison' },
    compareTitle: { cn: '几款常见链上分析工具的快速对照', en: 'A quick side-by-side look at common on-chain tools' },
    compareSubtitle: { cn: '链上分析', en: 'On-chain analysis' },
    preferredToolNames: ['dune', 'nansen', 'defillama', 'arkham'],
    comparisonDimensions: [
      {
        title: { cn: '数据深度', en: 'Data depth' },
        description: {
          cn: '先看它能不能让你继续往下钻，而不是只停留在汇总层。',
          en: 'Check whether it lets you drill down instead of stopping at summary views.',
        },
      },
      {
        title: { cn: '地址与资金流', en: 'Addresses and fund flows' },
        description: {
          cn: '如果你在研究链上行为，地址、路径和资金流是第一层判断。',
          en: 'If you are studying on-chain behavior, addresses, paths, and fund flows are the first layer of judgment.',
        },
      },
      {
        title: { cn: '复用与协作', en: 'Reuse and collaboration' },
        description: {
          cn: '看板复用、导出和历史查询，会决定研究能不能长期跑下去。',
          en: 'Dashboard reuse, exports, and historical queries determine whether research can keep going over time.',
        },
      },
      {
        title: { cn: '从观察到验证', en: 'Observation to validation' },
        description: {
          cn: '如果你想验证自己的判断，就要看它是否支持自定义查询和深入分析。',
          en: 'If you want to validate your own thesis, check whether it supports custom queries and deeper analysis.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '看问题是否需要自定义验证', en: 'Need for custom validation' },
        description: {
          cn: '如果你要验证自己的判断，而不是只看现成结论，就要优先看查询和分析深度。',
          en: 'If the real job is validating your own thesis instead of reading finished summaries, prioritize query and analysis depth.',
        },
      },
      {
        title: { cn: '看偏钱包、协议还是市场层', en: 'Wallet, protocol, or market layer' },
        description: {
          cn: '先分清你是在看钱包行为、协议健康，还是更广的市场扫描，不同工具会直接分流。',
          en: 'First separate whether the work is about wallet behavior, protocol health, or broader market scanning, because the best tool changes fast across those layers.',
        },
      },
      {
        title: { cn: '看团队复用能力', en: 'Team reuse and repeatability' },
        description: {
          cn: '如果这是持续研究流程，就要看看板复用、导出、历史和协作是否顺手。',
          en: 'If this becomes a recurring research workflow, judge how reusable dashboards, exports, history, and collaboration feel.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做链上研究和判断验证的人', en: 'People doing on-chain research and thesis validation' },
        description: {
          cn: '适合需要把钱包行为、协议数据和资金流线索拼成完整判断的人。',
          en: 'Best for people who need to connect wallet behavior, protocol data, and fund-flow clues into a fuller judgment.',
        },
      },
      {
        title: { cn: '不是只看价格图的人', en: 'People needing more than price charts' },
        description: {
          cn: '当你不满足于行情图，而要看地址、结构和行为变化时，这类对比最有帮助。',
          en: 'These comparisons are most useful when price charts are not enough and the real work is about addresses, structure, and behavior change.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看持仓汇总的人', en: 'People mainly wanting holdings rollups' },
        description: {
          cn: '如果重点是组合看板和钱包资产归集，资产追踪页通常更直接。',
          en: 'If the real need is portfolio views and wallet rollups, portfolio tracking pages are usually more direct.',
        },
      },
      {
        title: { cn: '只想收提醒的人', en: 'People mainly wanting alerts' },
        description: {
          cn: '如果重点是异动提醒和通知，而不是研究链上结构，钱包监控页通常更适合。',
          en: 'If the real job is alerting and anomaly notifications rather than understanding chain structure, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果链上分析已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If on-chain analysis is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis',
        title: { cn: '回到链上分析指南', en: 'Back to the on-chain guide' },
        description: {
          cn: '如果你还要先理清地址追踪、资金流和项目研究，可以回到指南页。',
          en: 'Go back if you still need to clarify address tracking, fund flows, and project research first.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你现在更关心地址画像和行为判断，这条更高意图。',
          en: 'A higher-intent path when the real need is address profiling and behavior analysis.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果你的判断开始偏协议健康、使用量和趋势，这页更贴近。',
          en: 'Move there when the decision leans toward protocol health, usage, and trends.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析工具对比', en: 'Switch to protocol analytics comparison' },
        description: {
          cn: '如果你的问题更偏协议表现、健康指标和赛道判断，这页更贴近目标。',
          en: 'A better fit when the real decision is more about protocol performance, health metrics, and sector judgment.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究工具对比', en: 'Switch to wallet research comparison' },
        description: {
          cn: '如果问题开始收窄到地址画像、标签和关系线索，这页会更顺。',
          en: 'Move there when the question narrows into address profiles, labels, and relationship clues.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控工具对比', en: 'Switch to wallet monitoring comparison' },
        description: {
          cn: '如果研究需求开始变成持续提醒和异常观察，这页更适合。',
          en: 'A better path when research needs start turning into ongoing alerting and anomaly observation.',
        },
      },
    ],
    toolSelectionNotes: {
      dune: {
        bestFor: {
          cn: '要做自定义查询、判断验证和研究级链上分析的人。',
          en: 'People doing custom queries, thesis validation, and research-grade on-chain analysis.',
        },
        whyPickIt: {
          cn: '它最适合回答“我自己的问题”，而不是只消费别人已经整理好的结论。',
          en: 'It is strongest when the job is answering your own question instead of only consuming prepackaged conclusions.',
        },
        watchOut: {
          cn: '如果你只是想看更轻量的市场概览或组合状态，它可能比需求更重。',
          en: 'It can feel heavier than necessary if the real need is just lighter market overviews or portfolio checks.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关注聪明钱、地址行为和资金流信号的研究者。',
          en: 'Researchers who care more about smart-money signals, address behavior, and fund-flow context.',
        },
        whyPickIt: {
          cn: '它很适合把链上分析继续拉向“谁在动、为什么重要、市场可能会怎么理解”。',
          en: 'It works well when on-chain analysis needs to move toward who is acting, why it matters, and what the market may infer.',
        },
        watchOut: {
          cn: '如果你主要是在做协议指标比较或宏观扫描，它未必是第一层。',
          en: 'It may not be the first layer if the work is mostly protocol benchmarking or macro scanning.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想先做赛道扫描、协议比较和 DeFi shortlist 构建的人。',
          en: 'People who want sector scanning, protocol comparison, and early DeFi shortlist building.',
        },
        whyPickIt: {
          cn: '它更擅长把全局市场研究范围先快速收窄下来。',
          en: 'It is stronger at narrowing the broad market research space quickly from the top down.',
        },
        watchOut: {
          cn: '如果你真正要做的是自定义验证或地址层调查，后面通常还会继续缩到更深工具。',
          en: 'You will usually narrow further into deeper tools if the real work becomes custom validation or address-level investigation.',
        },
      },
      arkham: {
        bestFor: {
          cn: '想把链上分析继续收窄到地址归因、身份线索和调查路径的人。',
          en: 'People who want to narrow on-chain analysis further into address attribution, identity clues, and investigation paths.',
        },
        whyPickIt: {
          cn: '它适合把“链上发生了什么”继续推进到“可能是谁在做、和谁相关”。',
          en: 'It is especially useful when the question shifts from what happened on-chain to who might be behind it and what it connects to.',
        },
        watchOut: {
          cn: '如果你只需要协议级别或宏观层判断，它可能会显得过于调查导向。',
          en: 'It can feel too investigation-oriented if the real need stays at the protocol or macro layer.',
        },
      },
    },
    tips: {
      cn: [
        '先看它支持的链和数据源，不同产品的覆盖面会差很多。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with supported chains and data sources, because coverage varies a lot.',
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
        question: { cn: '为什么只看链上分析工具？', en: 'Why only on-chain tools?' },
        answer: {
          cn: '因为链上分析工具的意图很明确，通常围绕地址、资金流和研究工作流，对比也更直接。',
          en: 'Because on-chain analysis tools usually map to clear needs around addresses, fund flow, and research workflows, making comparison more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-18'
        scope={
          locale === 'cn' || locale === 'tw'
            ? '链上分析对比页现在把重点放在“研究、监控和地址判断”三个动作。'
            : 'This on-chain analysis comparison page now focuses on research, monitoring, and address analysis.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认研究还是监控', '再看地址和协议深度', '最后才决定是否继续对比']
            : [
                'Confirm research vs monitoring first',
                'Then check address and protocol depth',
                'Only then decide whether to keep comparing',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '核心动作' : 'Core action',
            value: locale === 'cn' || locale === 'tw' ? '研究 / 监控 / 画像' : 'Research / monitoring / profiling',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你更关心组合看板或钱包追踪，应该转去相邻页面。'
                : 'If you care more about portfolio dashboards or wallet tracking, route to the adjacent pages.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '深度能力' : 'Depth',
            value: locale === 'cn' || locale === 'tw' ? '历史和关系链' : 'History and relationships',
            note:
              locale === 'cn' || locale === 'tw'
                ? '链上分析真正的价值在于历史、关联和解释能力。'
                : 'The real value in on-chain analysis is history, relationships, and explanation quality.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '验证顺序' : 'Validation order',
            value: locale === 'cn' || locale === 'tw' ? '先缩 shortlist' : 'Shortlist first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先收窄候选，再去官网验证是否符合分析工作流。'
                : 'Narrow the shortlist first, then validate whether it fits the analysis workflow.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '数据信号' : 'Data signal',
            value: locale === 'cn' || locale === 'tw' ? '先看能否继续下钻' : 'Check whether it allows deeper drilling',
            note:
              locale === 'cn' || locale === 'tw'
                ? '只有能继续下钻，链上分析才不只是汇总页。'
                : 'On-chain analysis only matters if you can keep drilling instead of staying on a summary page.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '流向信号' : 'Flow signal',
            value: locale === 'cn' || locale === 'tw' ? '地址与资金流是否清楚' : 'Are addresses and fund flows clear',
            note:
              locale === 'cn' || locale === 'tw'
                ? '地址、路径和流向清楚，判断才会稳。'
                : 'Clear addresses, paths, and flows make the judgment steadier.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复用信号' : 'Reuse signal',
            value: locale === 'cn' || locale === 'tw' ? '导出、历史和协作' : 'Exports, history, and collaboration',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能复用才适合持续研究。'
                : 'If it can be reused, it is suitable for recurring research.',
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
              ? '先看榜单，再决定是否继续看链上工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing on-chain tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果链上分析已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If on-chain analysis is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
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
                href: '/guides/ai-tools-for-on-chain-analysis',
                title: locale === 'cn' || locale === 'tw' ? '链上分析指南' : 'On-chain guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认你要的是研究、监控还是验证。'
                    : 'Re-check whether the job is research, monitoring, or validation.',
              },
              {
                href: '/guides/ai-tools-for-wallet-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '钱包研究对比' : 'Wallet research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的真实需求更偏地址画像。'
                    : 'Useful when address profiling is the real need.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的重点已经变成协议健康和趋势。'
                    : 'Better when protocol health and trends are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`onchain_ranking_${item.href.split('/').pop()}`}
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
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_on_chain_analysis_comparison' />
    </>
  );
}

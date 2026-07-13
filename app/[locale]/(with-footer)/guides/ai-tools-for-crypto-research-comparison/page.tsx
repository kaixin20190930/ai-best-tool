import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Crypto 研究工具对比' : 'AI tools for crypto research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto AI 工具，帮你更快选出适合研究和监控的一个。'
      : 'Compare common crypto AI tools to choose the one that fits your research and monitoring workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Crypto 研究工具', en: 'Crypto research tools' },
    comparisonLabel: { cn: 'AI Crypto 研究工具对比', en: 'AI tools for crypto research comparison' },
    description: {
      cn: '如果你已经知道自己要做代币观察、链上跟踪或市场情报，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need token watching, on-chain tracking, or market intelligence, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'crypto',
    guideHref: '/guides/ai-tools-for-crypto-research',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 Crypto 指南', en: 'Back to crypto guide' },
    altBrowseHref: '/explore?search=crypto&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Crypto 工具', en: 'Browse more crypto tools' },
    breadcrumbLabel: { cn: 'Crypto 研究工具对比', en: 'Crypto research tools comparison' },
    compareTitle: { cn: '几款常见 Crypto 工具的快速对照', en: 'A quick side-by-side look at common crypto tools' },
    compareSubtitle: { cn: 'Crypto', en: 'Crypto' },
    preferredToolNames: ['messari', 'defillama', 'dune', 'nansen'],
    comparisonDimensions: [
      {
        title: { cn: '研究框架', en: 'Research framing' },
        description: {
          cn: '先看它能不能把零散资料收拢成一个更清楚的研究起点。',
          en: 'Check whether it can turn scattered sources into a clearer research starting point.',
        },
      },
      {
        title: { cn: '链上与资料并重', en: 'On-chain plus source context' },
        description: {
          cn: '好的 Crypto 工具不只是给数据，还要把项目资料、叙事和链上信号放在一起。',
          en: 'A good crypto tool does more than show data; it brings project materials, narratives, and on-chain signals together.',
        },
      },
      {
        title: { cn: '持续追踪能力', en: 'Long-term tracking' },
        description: {
          cn: '如果你要长期 watchlist，历史维度、导出和回看就很关键。',
          en: 'If you maintain a watchlist over time, history, exports, and reviewability become essential.',
        },
      },
      {
        title: { cn: '研究到决策的距离', en: 'Research-to-decision distance' },
        description: {
          cn: '看它能不能让你从发现到判断的路径更短，而不是只给一堆相关信息。',
          en: 'See whether it shortens the path from discovery to decision instead of only surfacing related information.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做市场与项目研究', en: 'Market and project research' },
        description: {
          cn: '先看研究框架、主题覆盖和是否方便把零散信息变成可判断的结论。',
          en: 'Start with research framing, topic coverage, and whether fragmented information can be turned into usable conclusions.',
        },
      },
      {
        title: { cn: '做链上追踪与验证', en: 'On-chain tracking and validation' },
        description: {
          cn: '更该看数据深度、地址和协议维度，以及是否能继续往下钻。',
          en: 'Focus more on data depth, address and protocol layers, and whether the tool lets you drill further.',
        },
      },
      {
        title: { cn: '做长期 watchlist', en: 'Long-term watchlist workflows' },
        description: {
          cn: '如果你要持续跟踪项目与赛道，导出、历史维度和复盘效率会更重要。',
          en: 'If you need to track projects and sectors over time, exports, historical depth, and review efficiency matter more.',
        },
      },
    ],
    fitFor: [
      {
        title: {
          cn: '做 Crypto 投研、内容和策略跟踪的人',
          en: 'People doing crypto research, content, and strategy tracking',
        },
        description: {
          cn: '适合需要在链上数据、项目资料和市场叙事之间持续切换的人。',
          en: 'Best for people who move repeatedly between on-chain data, project materials, and market narratives.',
        },
      },
      {
        title: { cn: '已经确定要做 Web3 垂直研究的人', en: 'People already committed to Web3-specific research' },
        description: {
          cn: '当问题已经不是“要不要看 crypto”，而是“怎么更有效研究 crypto”，这类页最有用。',
          en: 'These pages work best when the question is no longer whether to study crypto, but how to research it more effectively.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看最轻量行情的人', en: 'People who only want lightweight price watching' },
        description: {
          cn: '如果你只是想扫一眼行情，不打算深入研究，这类工具通常会显得偏重。',
          en: 'These tools usually feel too heavy when the job is only quick price checking rather than deeper research.',
        },
      },
      {
        title: { cn: '不需要链上和项目上下文的人', en: 'People who do not need on-chain or project context' },
        description: {
          cn: '如果工作重点不在项目、协议、地址或赛道判断，Crypto 研究工具通常不是第一入口。',
          en: 'Crypto research tools are usually not the first stop when projects, protocols, addresses, and sector judgment are not central to the work.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果 Crypto 研究已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If crypto research is the clear goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research',
        title: { cn: '回到 Crypto 指南', en: 'Back to the crypto guide' },
        description: {
          cn: '如果你还想先把项目研究、链上追踪和市场情报理清，可以回到指南页。',
          en: 'Go back if you still need to clarify project research, on-chain tracking, and market intelligence first.',
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
          cn: '如果你的决策开始偏协议健康、使用量和长期趋势，这页更顺。',
          en: 'Move there when the decision is more about protocol health, usage, and longer-term trends.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-token-research-comparison',
        title: { cn: '转去代币研究对比', en: 'Go to token research comparison' },
        description: {
          cn: '当问题已经收窄到具体 token、项目比较和基本面判断时，这页更高意图。',
          en: 'A better high-intent path when the work narrows into token-level project comparison and fundamentals judgment.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你的研究开始转向地址画像、资金路径和钱包行为，这条路更贴近目标。',
          en: 'A better fit when research shifts into address profiles, fund paths, and wallet behavior.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果判断点开始偏协议健康、使用量和长期趋势，这页更顺。',
          en: 'The better next step when the decision starts leaning toward protocol health, usage, and longer-term trends.',
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
          cn: '更偏项目资料、赛道判断和研究输出的人。',
          en: 'People leaning more toward project research, sector framing, and written research output.',
        },
        whyPickIt: {
          cn: '它更适合把 Crypto 研究拉回到“怎么理解项目和叙事”这条线上。',
          en: 'It is strong when crypto research needs to center on how projects and narratives should be interpreted.',
        },
        watchOut: {
          cn: '如果你真正要追的是地址和链上行为，通常还要继续缩到更数据导向的工具。',
          en: 'You will usually narrow further into more data-oriented tooling if the real job is addresses and on-chain behavior.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想快速看协议规模、链上生态和赛道变化的人。',
          en: 'People who want a fast view of protocol scale, ecosystem structure, and sector movement.',
        },
        whyPickIt: {
          cn: '它很适合做“先看全局发生了什么”，帮助你决定值得继续深挖哪里。',
          en: 'It is very good for seeing the big picture first and deciding where deeper investigation is worth the time.',
        },
        watchOut: {
          cn: '如果你需要更强的项目叙事和研究文本支持，它通常不是最完整的一层。',
          en: 'It is usually not the fullest layer when you need stronger narrative research and written project context.',
        },
      },
      dune: {
        bestFor: {
          cn: '想亲自查链上数据、做查询和搭建研究视图的分析者。',
          en: 'Analysts who want to query chain data directly and build their own research views.',
        },
        whyPickIt: {
          cn: '它把研究拉进更深的数据层，适合不满足于现成结论的人。',
          en: 'It brings research closer to the underlying data, which is ideal when ready-made conclusions are not enough.',
        },
        watchOut: {
          cn: '如果你现在只想快速筛项目，不一定需要这么深的查询能力。',
          en: 'You may not need this much query depth if the current job is only quick project screening.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关心聪明钱、钱包行为和链上资金流信号的人。',
          en: 'People who care more about smart-money behavior, wallet signals, and fund flow.',
        },
        whyPickIt: {
          cn: '它适合把“项目研究”继续拉向“谁在动、钱怎么走”的层面。',
          en: 'It is useful when project research needs to move into who is acting and where money is flowing.',
        },
        watchOut: {
          cn: '如果你的研究更偏项目资料和协议指标，而不是地址层信号，它未必是第一入口。',
          en: 'It may not be the first stop when the work is more about project materials and protocol metrics than address-layer signals.',
        },
      },
    },
    tips: {
      cn: [
        '先看你是做项目研究、链上追踪，还是围绕赛道做长期 watchlist。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和真实评论，也要看研究框架是否贴合你的风格。',
      ],
      en: [
        'Start with whether the work is project research, on-chain tracking, or building long-term sector watchlists.',
        'For team use, look at API access, exports, permissions, and historical queries.',
        'For long-term use, pay attention to freshness, ratings, real comments, and whether the research framing fits your style.',
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
        question: { cn: '为什么只看 Crypto 工具？', en: 'Why only crypto tools?' },
        answer: {
          cn: '因为 Crypto 工具的意图很明确，通常围绕代币、链上和市场研究，对比也更直接。',
          en: 'Because crypto tools usually map to clear needs around tokens, on-chain data, and market research, making comparison more direct.',
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
            ? '这页先看真实可验证的 Crypto 研究信号，再继续判断是否需要更完整的链上和资料结合视图。'
            : 'This page looks at verifiable crypto-research signals first, then helps you decide whether a fuller blend of on-chain and source-context views is needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '研究框架' : 'Research framing',
            value: locale === 'cn' || locale === 'tw' ? '是否能收拢信息' : 'Can it organize scattered info',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正好的研究页，是能把碎信息变成判断起点。'
                : 'Good research pages turn fragments into a usable starting point.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '链上与资料' : 'On-chain and source context',
            value: locale === 'cn' || locale === 'tw' ? '是否能放在一起看' : 'Can they be viewed together',
            note:
              locale === 'cn' || locale === 'tw'
                ? '只看链上不够，资料和叙事也要一起看。'
                : 'Chain data alone is not enough; source context matters too.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '持续追踪' : 'Long-term tracking',
            value: locale === 'cn' || locale === 'tw' ? '历史和导出是否稳定' : 'Are history and exports stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果不能复盘，研究就很难长期用。'
                : 'If it cannot be revisited, research will not last long.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 Crypto 研究路径重新核对，保留发现、引用和复盘入口。'
              : 'This page has been rechecked against a real crypto research workflow and keeps discovery, citation, and review entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实研究证据'
              : 'Keep it indexable and add real research evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用来源、复盘和真人评论把它和泛研究页区分开。'
              : 'Use sources, review notes, and real comments to differentiate it from generic research pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实研究场景和反馈' : 'Add real research scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、来源和真人评论。'
              : 'Next, prioritize cases, sources, and real comments.'}
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
              ? '先看榜单，再决定是否继续看 Crypto 工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing crypto tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果 Crypto 研究已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If crypto research is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
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
                href: '/guides/ai-tools-for-crypto-research',
                title: locale === 'cn' || locale === 'tw' ? 'Crypto 指南' : 'Crypto guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是项目研究、链上追踪还是市场情报。'
                    : 'Re-check whether the job is project research, on-chain tracking, or market intelligence.',
              },
              {
                href: '/guides/ai-tools-for-token-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '代币研究对比' : 'Token research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的问题已经收窄到具体 token。'
                    : 'Useful when the task has narrowed into a specific token question.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的重点更偏协议健康和趋势。'
                    : 'Better when protocol health and trends are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`crypto_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_research_comparison' />
    </>
  );
}

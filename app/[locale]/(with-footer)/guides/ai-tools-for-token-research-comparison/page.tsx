import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代币研究工具对比' : 'AI token research tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 代币研究工具，帮助你更快判断项目比较、基本面视角和 token 研究深度。'
      : 'Compare AI token-research tools to judge project comparison, fundamentals framing, and research depth faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '代币研究工具', en: 'Token research tools' },
    comparisonLabel: { cn: 'AI 代币研究工具对比', en: 'AI token research tools comparison' },
    description: {
      cn: '如果你已经知道自己要做 token 观察、项目比较和基本面判断，这一页会帮你把几款更贴近研究决策的工具放在一起看。',
      en: 'If the real job is token watching, project comparison, and fundamentals judgment, this page helps compare the tools that sit closer to that research decision.',
    },
    searchQuery: 'token',
    guideHref: '/guides/ai-tools-for-token-research',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到代币研究指南', en: 'Back to token research guide' },
    altBrowseHref: '/explore?search=token&sort=popular',
    altBrowseLabel: { cn: '浏览更多代币研究相关工具', en: 'Browse more token-research tools' },
    breadcrumbLabel: { cn: '代币研究工具对比', en: 'Token research tools comparison' },
    compareTitle: { cn: '代币研究工具的快速对照', en: 'A quick side-by-side look at token-research tools' },
    compareSubtitle: { cn: 'Token research', en: 'Token research' },
    preferredToolNames: ['messari', 'token-terminal', 'defillama', 'nansen'],
    comparisonDimensions: [
      {
        title: { cn: '项目比较框架', en: 'Project comparison framework' },
        description: {
          cn: '先看它是否能把不同 token 放到同一套判断标准下。',
          en: 'Check whether different tokens can be judged against the same framework.',
        },
      },
      {
        title: { cn: '基本面深度', en: 'Fundamentals depth' },
        description: {
          cn: '协议收入、活跃度、持有人结构和叙事变化，越能看深越好。',
          en: 'Protocol revenue, activity, holder structure, and narrative shifts matter more when they can be inspected in depth.',
        },
      },
      {
        title: { cn: '长期跟踪效率', en: 'Long-term tracking efficiency' },
        description: {
          cn: '如果要做 watchlist，就要看历史查询、导出和复盘效率。',
          en: 'If you maintain a watchlist, history queries, exports, and review efficiency are essential.',
        },
      },
      {
        title: { cn: '研究到结论的速度', en: 'Speed from research to conclusion' },
        description: {
          cn: '不要只看指标多不多，要看它能不能让你更快形成判断。',
          en: 'Do not only count metrics; check whether the tool helps you reach a judgment faster.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做项目比较', en: 'Compare projects' },
        description: {
          cn: '重点看指标框架、历史维度和是否方便把不同 token 放到同一判断标准下。',
          en: 'Focus on metric framing, historical depth, and whether projects can be judged against a shared standard.',
        },
      },
      {
        title: { cn: '看基本面与趋势', en: 'Study fundamentals and trend shifts' },
        description: {
          cn: '更该看协议收入、活跃度、持有人结构和关键叙事变化。',
          en: 'Look more closely at protocol revenue, activity, holder structure, and key narrative changes.',
        },
      },
      {
        title: { cn: '持续跟踪赛道', en: 'Track a sector over time' },
        description: {
          cn: '优先看导出、历史查询和做长期 watchlist 的效率。',
          en: 'Prioritize exports, historical queries, and the efficiency of building a long-term watchlist.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '投研、内容和策略观察者', en: 'Researchers, content writers, and strategy observers' },
        description: {
          cn: '适合需要持续判断项目质量、代币叙事和赛道变化的人。',
          en: 'A good fit for people who regularly judge project quality, token narratives, and sector shifts.',
        },
      },
      {
        title: { cn: '已经缩小到具体 token 决策的人', en: 'People already narrowed into token-level decisions' },
        description: {
          cn: '当问题已经不是“看不看 crypto”，而是“看哪个项目更值得继续研究”时，这类页最有用。',
          en: 'These pages work best when the question is no longer whether to watch crypto at all, but which token or project deserves more time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看价格走势的人', en: 'People who only want simple price charts' },
        description: {
          cn: '如果你只需要最轻量的价格观察，这一类研究工具可能会显得过重。',
          en: 'If the job is only lightweight price watching, these research tools may feel heavier than necessary.',
        },
      },
      {
        title: { cn: '还没有缩到具体项目的人', en: 'People not yet narrowed into specific projects' },
        description: {
          cn: '如果你的研究还停留在“先看整个市场”，Crypto 研究总对比通常会更合适。',
          en: 'The broader crypto research comparison is usually a better first stop if the work is still at a market-wide exploration stage.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果代币研究已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If token research is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-token-research',
        title: { cn: '回到代币研究指南', en: 'Back to the token research guide' },
        description: {
          cn: '如果你还要先理清项目比较、基本面和研究框架，可以回到指南页。',
          en: 'Go back if you still need to clarify project comparison, fundamentals, and research framing first.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '如果你发现自己其实还在做更广的市场研究，这条更高意图。',
          en: 'A higher-intent path if your work is still broader crypto market research.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你的研究开始延伸到地址、资金路径和行为判断，这页更贴近。',
          en: 'Move there once the work extends into addresses, fund paths, and behavior analysis.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '当研究范围开始扩大到市场情报和叙事整合时，这页更合适。',
          en: 'A better fit once the work expands into broader market intelligence and research synthesis.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果判断点开始转向协议健康、使用量和长期趋势，就继续走这里。',
          en: 'Continue here once the decision shifts toward protocol health, usage, and longer-term trend analysis.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你更关心地址、资金路径和链上行为，这页更贴近目标。',
          en: 'More useful if the real job is addresses, fund paths, and on-chain behavior.',
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
          cn: '更看重项目资料、叙事理解和研究上下文的研究者。',
          en: 'Researchers who care more about project context, narrative framing, and deeper written research.',
        },
        whyPickIt: {
          cn: '它适合把 token 研究拉回到“这个项目到底讲什么、值不值得继续看”。',
          en: 'It is useful when token research needs to answer what the project is really about and whether it deserves more time.',
        },
        watchOut: {
          cn: '如果你现在更关心地址信号和链上行为，后面通常还会继续走向更数据导向的工具。',
          en: 'You will usually continue into more data-oriented tools if address signals and on-chain behavior become the real priority.',
        },
      },
      'token-terminal': {
        bestFor: {
          cn: '更偏基本面、收入、活跃度和长期价值判断的人。',
          en: 'People leaning toward fundamentals, revenue, activity, and longer-term value judgment.',
        },
        whyPickIt: {
          cn: '它把 token 研究拉向协议和商业指标层，适合更偏投资框架的工作流。',
          en: 'It brings token research toward protocol and business metrics, which fits more investment-oriented workflows.',
        },
        watchOut: {
          cn: '如果你主要在看短期链上异动或地址活动，它不会是第一入口。',
          en: 'It will not be the first stop when the real task is short-term on-chain anomalies or address activity.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想快速扫项目规模、赛道格局和宏观变化的人。',
          en: 'People who want to scan project scale, sector structure, and macro shifts quickly.',
        },
        whyPickIt: {
          cn: '它很适合做 broad scan，帮助你决定下一步该深入哪些 token 或赛道。',
          en: 'It is strong for broad scanning and deciding which tokens or sectors deserve deeper work next.',
        },
        watchOut: {
          cn: '如果你需要更完整的项目论证或研究文本，它通常不是最完整的一层。',
          en: 'It is usually not the fullest layer if the real need is richer project argumentation or written research context.',
        },
      },
      nansen: {
        bestFor: {
          cn: '想把 token 研究继续延伸到聪明钱、钱包行为和资金流信号的人。',
          en: 'People who want token research to extend into smart-money behavior, wallet signals, and fund flow.',
        },
        whyPickIt: {
          cn: '它适合把“项目值得不值得看”继续追问成“谁在参与、钱怎么流动”。',
          en: 'It helps turn “is this project worth attention” into deeper questions about who is participating and how funds are moving.',
        },
        watchOut: {
          cn: '如果你主要在做项目比较和基本面归纳，它可能会把重心拉得过于地址导向。',
          en: 'It can pull the work too far toward address-layer analysis if the real job is mainly project comparison and fundamentals synthesis.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你在做项目比较、叙事研究，还是基本面和指标跟踪。',
        '不要只看图表多少，研究视角、历史维度和比较框架更重要。',
        '如果你会长期跟踪一个赛道，导出和复盘效率要提前考虑。',
      ],
      en: [
        'Decide whether the work is project comparison, narrative research, or fundamentals and metric tracking.',
        'Do not judge by chart count alone. Research framing, comparison logic, and historical depth matter more.',
        'If you will track a sector over time, think early about export and review efficiency.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '主要比较项目比较能力、指标框架、研究深度，以及它是否适合长期跟踪和复盘。',
          en: 'We mainly compare project-comparison ability, metric framing, research depth, and fit for long-term tracking and review.',
        },
      },
      {
        question: { cn: '为什么单独做代币研究对比？', en: 'Why compare token-research tools separately?' },
        answer: {
          cn: '因为 token 研究的决策逻辑比泛 Crypto 浏览更窄，更在意项目比较、基本面和长期判断。',
          en: 'Because token research is narrower than broad crypto browsing and cares more about project comparison, fundamentals, and long-term judgment.',
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
            ? '代币研究对比页要围绕项目比较、基本面判断、长期跟踪和研究复盘来判断，不要只看指标数量。它会继续保留索引，但把更广的 Crypto 研究路径分层。'
            : 'This token research comparison page should focus on project comparison, fundamentals, long-term tracking, and research review instead of metric count alone. Keep it indexable, but separate broader crypto research paths.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认它能不能帮你解释一个 token，而不是只堆指标。',
                '再看基本面、长期跟踪和研究复盘是否顺手。',
                '最后回到真实 token 案例和反馈，判断值不值得继续索引。',
              ]
            : [
                'First confirm it helps explain a token instead of merely stacking metrics.',
                'Then check fundamentals, long-term tracking, and review workflows.',
                'Finally return to real token cases and feedback to judge whether the page deserves continued indexing.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '验证重点' : 'Validation focus',
            value: locale === 'cn' || locale === 'tw' ? '项目、基本面、复盘' : 'Projects, fundamentals, review',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它是不是能帮助你解释一个 token。'
                : 'Confirm it helps you explain a token.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '合并策略' : 'Merge strategy',
            value: locale === 'cn' || locale === 'tw' ? '分流到 Crypto / On-chain' : 'Route to crypto / on-chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你还在看更宽的市场或地址行为，就转到更窄页。'
                : 'If the real work is broader market or address behavior, move to narrower pages.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '后续增量' : 'Next increments',
            value: locale === 'cn' || locale === 'tw' ? '案例、来源、评论' : 'Cases, sources, comments',
            note:
              locale === 'cn' || locale === 'tw'
                ? '补上研究场景和实体信号。'
                : 'Add research scenarios and entity signals.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '叙事信号' : 'Narrative signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能否讲清项目故事'
                : 'Check whether it can explain the project story',
            note:
              locale === 'cn' || locale === 'tw'
                ? '代币研究最怕只看指标却忽略叙事和上下文。'
                : 'Token research fails when it looks only at metrics and ignores narrative context.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '数据深度' : 'Data depth',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看链上和市场数据够不够用'
                : 'See whether chain and market data are deep enough',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果数据源不够深，研究结论很容易偏浅。'
                : 'Shallow data sources lead to shallow conclusions.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '导出信号' : 'Export signal',
            value: locale === 'cn' || locale === 'tw' ? '能否沉淀到研究流程里' : 'Can it fit into a research workflow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能导出、能记录、能复盘，才更像真正的研究工具。'
                : 'Exporting, recording, and reviewing are what make it feel like a real research tool.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实代币研究路径重新核对，保留项目、基本面和复盘入口。'
              : 'This page has been rechecked against a real token-research workflow and keeps project, fundamentals, and review entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实代币证据'
              : 'Keep it indexable and add real token evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用项目、来源和真人评论把它和泛研究页区分开。'
              : 'Use project signals, sources, and real comments to differentiate it from generic research pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实代币场景和反馈' : 'Add real token scenarios and feedback'}
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
              ? '先把代币研究入口收紧，再决定是否切去更广的 Crypto 研究'
              : 'Tighten the token-research entry first, then decide whether to switch into broader crypto research'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你的目标已经很明确是项目比较、基本面和 token 研究深度，先从更高意图入口收口通常更快。'
              : 'If the goal is clearly project comparison, fundamentals, and token-research depth, starting with higher-intent entry points is usually faster.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-web3-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Web3 榜单' : 'Web3 ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄候选项目和工具。'
                    : 'Use this to narrow the candidate set first.',
              },
              {
                href: '/guides/ai-tools-for-crypto-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Crypto 研究对比' : 'Crypto research comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的问题其实还在更大的市场研究层。'
                    : 'Best when the real question is still broader market research.',
              },
              {
                href: '/guides/ai-tools-for-protocol-analytics-comparison',
                title: locale === 'cn' || locale === 'tw' ? '协议分析对比' : 'Protocol analytics comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心协议健康、收入和长期指标。'
                    : 'Choose this when protocol health, revenue, and longer-term metrics matter more.',
              },
              {
                href: '/guides/ai-tools-for-on-chain-analysis-comparison',
                title: locale === 'cn' || locale === 'tw' ? '链上分析对比' : 'On-chain analysis comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果研究已经转向地址、资金路径和行为。'
                    : 'Use this once the workflow shifts to addresses, fund paths, and behavior analysis.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`token_research_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_token_research_comparison' />
    </>
  );
}

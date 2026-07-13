import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 SEO AI 工具，帮你更快选出适合关键词和排名跟踪的一个。'
      : 'Compare common SEO AI tools to choose the one that fits your keyword and rank tracking workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'SEO 工具', en: 'SEO tools' },
    comparisonLabel: { cn: 'AI SEO 工具对比', en: 'AI SEO tools comparison' },
    description: {
      cn: '如果你已经知道自己要做关键词研究、内容优化或排名跟踪，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need keyword research, content optimization, or rank tracking, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'seo',
    guideHref: '/guides/ai-seo-tools',
    rankingHref: '/best-ai-tools/ai-seo-tools',
    rankingLabel: { cn: '转去 SEO 榜单页', en: 'Open the SEO ranking' },
    backGuideLabel: { cn: '回到 SEO 指南', en: 'Back to SEO guide' },
    altBrowseHref: '/explore?search=seo&sort=popular',
    altBrowseLabel: { cn: '浏览更多 SEO 工具', en: 'Browse more SEO tools' },
    breadcrumbLabel: { cn: 'SEO 工具对比', en: 'SEO tools comparison' },
    compareTitle: { cn: '几款常见 SEO 工具的快速对照', en: 'A quick side-by-side look at common SEO tools' },
    compareSubtitle: { cn: 'SEO', en: 'SEO' },
    preferredToolNames: ['surfer', 'frase', 'clearscope', 'marketmuse'],
    decisionCards: [
      {
        title: { cn: '做关键词与主题规划', en: 'Keyword and topic planning' },
        description: {
          cn: '优先看关键词覆盖、SERP 意图拆解和内容 brief 是否真能进入你的内容流程。',
          en: 'Focus on keyword coverage, SERP-intent breakdown, and whether the brief can actually move into your content workflow.',
        },
      },
      {
        title: { cn: '做内容优化与更新', en: 'Content optimization and refreshes' },
        description: {
          cn: '更该看页面建议是否稳定、可执行，以及你是否会持续回访这些建议。',
          en: 'Look at whether optimization suggestions are stable, actionable, and worth revisiting over time.',
        },
      },
      {
        title: { cn: '做团队增长工作流', en: 'Team growth workflows' },
        description: {
          cn: 'API、导出、权限和历史数据会比一次性的“生成效果”更重要。',
          en: 'API access, exports, permissions, and historical data matter more than a one-off flashy generation.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '关键词覆盖', en: 'Keyword coverage' },
        description: {
          cn: '先看它能不能把相关词、长尾词和主题集群一起铺开，而不是只给你一个单点建议。',
          en: 'Check whether it covers primary terms, long-tail variants, and topic clusters instead of single-point advice.',
        },
      },
      {
        title: { cn: '内容 brief 质量', en: 'Content brief quality' },
        description: {
          cn: '好的 SEO 工具要能把 intent、结构和可执行建议一起给出来。',
          en: 'A strong SEO tool should give you intent, structure, and actionable guidance together.',
        },
      },
      {
        title: { cn: '页面优化动作', en: 'On-page optimization' },
        description: {
          cn: '如果你要持续优化现有内容，就要看建议是否稳定、清楚、能重复使用。',
          en: 'If you are refreshing existing content, check whether recommendations are stable, clear, and reusable.',
        },
      },
      {
        title: { cn: '团队可用性', en: 'Team usability' },
        description: {
          cn: '导出、权限、协作和历史数据会直接影响团队能不能把它用进日常流程。',
          en: 'Exports, permissions, collaboration, and historical data affect whether the team can actually adopt it.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '内容团队 / 独立站增长', en: 'Content teams and SEO-led growth' },
        description: {
          cn: '适合已经明确要做搜索流量、站点结构和持续内容产出的团队。',
          en: 'Best for teams already committed to search traffic, site structure, and ongoing content output.',
        },
      },
      {
        title: { cn: '需要把调研接进写作的人', en: 'Research that needs to flow into writing' },
        description: {
          cn: '如果你不是单纯查词，而是要把主题研究快速变成内容计划，这类工具更有价值。',
          en: 'Especially useful when topic research needs to become a real publishing plan quickly.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想偶尔写两篇内容的人', en: 'Occasional writers' },
        description: {
          cn: '如果你不是持续做内容增长，很多 SEO 套件会显得过重。',
          en: 'If you are not running an ongoing content engine, many SEO suites will feel heavier than needed.',
        },
      },
      {
        title: { cn: '只需要纯文案润色的人', en: 'People who only need copy polishing' },
        description: {
          cn: '如果重点只是改写和润色，通常通用写作工具会更直接。',
          en: 'If the goal is mostly rewriting and polishing, general writing tools are often a cleaner fit.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-seo-tools',
        title: { cn: '先看 SEO 榜单', en: 'Start with the SEO ranking' },
        description: {
          cn: '如果你已经明确是 SEO 场景，先用榜单缩小 shortlist。',
          en: 'If SEO is clearly the lane, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-seo-tools',
        title: { cn: '回到 SEO 指南', en: 'Back to the SEO guide' },
        description: {
          cn: '如果你还想先把关键词、结构和内容策略理清，可以回到指南页。',
          en: 'Go back if you still want to clarify keywords, structure, and content strategy first.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你现在更偏 SERP、竞品和资料发现，这条更高意图。',
          en: 'A higher-intent path when SERP research, competitors, and discovery are the real needs.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你发现自己其实是在找写作和改写工具，而不是 SEO 套件，这页更直接。',
          en: 'Move there if the real decision is about writing and rewriting rather than SEO suites.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-seo-tools',
        title: { cn: '先看 SEO 榜单页', en: 'Start with the SEO ranking' },
        description: {
          cn: '如果你想先收紧 shortlist，再回比较页做细分判断，就先去榜单页。',
          en: 'Go through the ranking first if you want a tighter shortlist before making the detailed comparison.',
        },
      },
      {
        href: '/guides/ai-seo-tools',
        title: { cn: '回到 SEO 选型指南', en: 'Back to the SEO guide' },
        description: {
          cn: '如果你还没想清楚该比哪些维度，先回到完整的 SEO 选型逻辑。',
          en: 'Go back if you still need the full SEO decision logic before comparing tools.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Switch to research tools comparison' },
        description: {
          cn: '如果你现在更需要做 SERP 调研、竞品观察和资料发现，而不是直接写内容，这页更贴近真实工作流。',
          en: 'Move here if discovery, SERP research, and competitor analysis matter more than direct content production right now.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Switch to writing tools comparison' },
        description: {
          cn: '如果你发现自己更偏内容产出，而不是 SEO 套件本身，这里更贴近真实决策。',
          en: 'Move here if the real decision is about content production rather than SEO suites.',
        },
      },
    ],
    toolSelectionNotes: {
      surfer: {
        bestFor: {
          cn: '已经在稳定产出 SEO 内容、希望把 brief 和页面优化接到日常写作流程的团队。',
          en: 'Teams already publishing SEO content regularly and wanting briefs plus on-page optimization inside a repeatable workflow.',
        },
        whyPickIt: {
          cn: '它更像内容执行层工具，适合把关键词意图直接接到写作和更新动作里。',
          en: 'It behaves more like an execution-layer tool that turns keyword intent directly into writing and refresh actions.',
        },
        watchOut: {
          cn: '如果你现在还停留在纯关键词调研阶段，它可能会显得比你当前需要更重。',
          en: 'It can feel heavier than necessary if you are still mostly doing early-stage keyword research.',
        },
      },
      frase: {
        bestFor: {
          cn: '既要做主题调研，又要快速产出 brief 和首稿的小团队或个人站长。',
          en: 'Small teams and solo operators who need both topic research and fast brief-to-draft execution.',
        },
        whyPickIt: {
          cn: '调研和写作之间衔接很顺，适合内容节奏快、需要快速试题的工作流。',
          en: 'It connects research and writing smoothly, which fits faster publishing cycles well.',
        },
        watchOut: {
          cn: '如果你更看重企业级协作、权限和更深的数据治理，可能还要继续比较。',
          en: 'You may want to keep comparing if enterprise collaboration, permissions, or deeper data governance matter more.',
        },
      },
      clearscope: {
        bestFor: {
          cn: '已经有内容流程，只想把现有页面和文章做得更稳、更一致的团队。',
          en: 'Teams that already have a content engine and mainly want steadier, more consistent optimization on existing work.',
        },
        whyPickIt: {
          cn: '它更偏质量控制和内容优化，适合把已有内容往更高标准打磨。',
          en: 'It leans toward quality control and optimization, making it strong for refining existing content.',
        },
        watchOut: {
          cn: '如果你更需要从零开始找题、做主题地图，它不一定是最先上的那个。',
          en: 'It may not be the first tool to pick if topic discovery and planning from scratch are the real bottlenecks.',
        },
      },
      marketmuse: {
        bestFor: {
          cn: '更重视站点结构、主题覆盖和内容资产规划的内容团队。',
          en: 'Content teams that care more about site structure, topic coverage, and long-range content planning.',
        },
        whyPickIt: {
          cn: '它更接近内容策略层，而不是单篇文章层，适合做体系化内容布局。',
          en: 'It sits closer to strategy than single-article execution, which helps with system-level content planning.',
        },
        watchOut: {
          cn: '如果你只想尽快优化几篇页面，它可能不如更轻量的执行型工具直接。',
          en: 'It can feel less direct than lighter execution tools when the goal is simply to improve a handful of pages quickly.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你在选调研工具、内容执行工具，还是站点策略工具。',
        '再看关键词和排名功能，最后才看历史数据和协作能力。',
        '如果你要团队使用，关注 API、导出、权限和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'First separate research tools, execution tools, and strategy-layer tools.',
        'Then compare keyword and ranking features before worrying about history and collaboration.',
        'For team use, look at API access, exports, permissions, and collaboration.',
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
        question: { cn: '为什么只看 SEO 工具？', en: 'Why only SEO tools?' },
        answer: {
          cn: '因为 SEO 工具的意图比较明确，通常围绕关键词、内容和排名，对比也更直接。',
          en: 'Because SEO tools usually map to clear needs around keywords, content, and rankings, making comparison more direct.',
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
            ? 'SEO 工具对比不该只看功能表，而要看关键词研究、内容优化、排名跟踪和团队落地是否真的能接上。'
            : 'SEO tool comparison should not stop at feature lists; it should verify whether keyword research, content optimization, rank tracking, and team adoption actually fit together.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '关键词研究' : 'Keyword research',
            value:
              locale === 'cn' || locale === 'tw' ? '先确认覆盖和意图拆解' : 'Check coverage and intent breakdown first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '找词和分意图比花哨的生成更重要。'
                : 'Finding the right queries and intents matters more than flashy generation.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '内容优化' : 'Content optimization',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看建议是否可执行'
                : 'See whether the recommendations are actionable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正有用的是能直接进入内容流程的建议。'
                : 'The useful ones are the recommendations that actually flow into publishing.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期维护' : 'Long-term maintenance',
            value: locale === 'cn' || locale === 'tw' ? '看更新与稳定性' : 'Check freshness and stability',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'SEO 工具要能长期跟着搜索变化走。'
                : 'SEO tools need to keep up with search changes over time.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 SEO 决策路径重新核对，保留研究、优化和跟踪入口。'
              : 'This page has been rechecked against a real SEO decision path and keeps research, optimization, and tracking entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实 SEO 证据'
              : 'Keep it indexable and add real SEO evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用关键词、优化动作和真人评论把它和泛工具页区分开。'
              : 'Use keywords, optimization actions, and real comments to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实 SEO 场景和反馈' : 'Add real SEO scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、优化记录和真人评论。'
              : 'Next, prioritize cases, optimization notes, and real comments.'}
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
              ? '先看榜单，再决定是否继续看 SEO 工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing SEO tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果 SEO 已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If SEO is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-seo-tools',
                title: locale === 'cn' || locale === 'tw' ? 'SEO 榜单' : 'SEO ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-seo-tools',
                title: locale === 'cn' || locale === 'tw' ? 'SEO 指南' : 'SEO guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是关键词、内容还是排名。'
                    : 'Re-check whether the task is keywords, content, or rankings.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '研究工具对比' : 'Research tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的任务更偏 SERP 和竞品观察。'
                    : 'Useful when the task is more about SERP and competitor research.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果下一步是把调研变成写作产出。'
                    : 'Better when the next step is turning research into writing output.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`seo_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_seo_tools_comparison' />
    </>
  );
}

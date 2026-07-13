import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { Link } from '@/app/navigation';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 研究工具对比' : 'AI tools for research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 研究工具，先从指南和榜单收窄，再选出适合资料发现、证据核对和分析工作流的一个。'
      : 'Compare common AI research tools, narrowing from guide and ranking first, to choose the one that fits discovery, evidence-checking, and analysis workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '研究工具', en: 'Research tools' },
    comparisonLabel: { cn: 'AI 研究工具对比', en: 'AI tools for research comparison' },
    description: {
      cn: '如果你已经知道自己要做资料发现、信息核对或竞品研究，这一页会帮你把几款常见工具放在一起看，并回到榜单和指南。',
      en: 'If you already know you need discovery, evidence-checking, or competitor research, this page helps you compare a few common tools side by side and routes you back to the guide and ranking.',
    },
    searchQuery: 'research',
    guideHref: '/guides/ai-tools-for-research',
    rankingHref: '/best-ai-tools/ai-research-tools',
    rankingLabel: { cn: '转去研究榜单页', en: 'Open the research ranking' },
    backGuideLabel: { cn: '回到研究工具指南', en: 'Back to research guide' },
    altBrowseHref: '/explore?search=research&sort=popular',
    altBrowseLabel: { cn: '浏览更多研究工具', en: 'Browse more research tools' },
    breadcrumbLabel: { cn: '研究工具对比', en: 'Research tools comparison' },
    compareTitle: { cn: '几款常见研究工具的快速对照', en: 'A quick side-by-side look at common research tools' },
    compareSubtitle: { cn: 'Research', en: 'Research' },
    preferredToolNames: ['perplexity', 'consensus', 'scite', 'notebooklm'],
    comparisonDimensions: [
      {
        title: { cn: '检索广度', en: 'Retrieval breadth' },
        description: {
          cn: '先看它能不能快速把相关主题、来源和上下文打开，而不只是给你一个答案。看完后再回到榜单对照。',
          en: 'Check whether it can quickly surface relevant themes, sources, and context rather than just one answer, then return to the ranking to compare fit.',
        },
      },
      {
        title: { cn: '引用与可追溯性', en: 'Citations and traceability' },
        description: {
          cn: '研究型工具最重要的是能不能回到原始来源，避免“看起来对但查不到”。',
          en: 'The key question is whether you can trace back to the original source and avoid answers that only sound right.',
        },
      },
      {
        title: { cn: '分析沉淀', en: 'Analysis depth' },
        description: {
          cn: '如果资料要继续沉淀成自己的工作笔记，就要看整理、导入和复用能力。',
          en: 'If the material needs to become your own working notes, look at organization, import, and reuse support.',
        },
      },
      {
        title: { cn: '持续追问', en: 'Follow-up questioning' },
        description: {
          cn: '很多研究不是一次问完，而是要反复问、反复收敛，所以上下文维持也很关键。',
          en: 'Research usually happens through repeated follow-up and narrowing, so context retention matters a lot too.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '先做资料发现', en: 'Discovery first' },
        description: {
          cn: '先看检索广度、速度，以及是否能帮你快速拉起一个研究起点。',
          en: 'Start with retrieval breadth, speed, and whether the tool helps you build a research starting point quickly.',
        },
      },
      {
        title: { cn: '更看重证据核对', en: 'Evidence-checking first' },
        description: {
          cn: '更该看引用是否透明、来源能否回溯，以及对论文和正式资料的支持。',
          en: 'Focus more on citation transparency, source traceability, and support for papers or formal sources.',
        },
      },
      {
        title: { cn: '要形成自己的分析材料', en: 'Turn research into working notes' },
        description: {
          cn: '如果你要把资料继续整理、比较和沉淀，导入、整理和上下文管理会比单次回答更重要。',
          en: 'If research needs to become organized notes and ongoing analysis, imports, organization, and context handling matter more than one-off answers.',
        },
      },
    ],
    fitFor: [
      {
        title: {
          cn: '做市场研究、竞品研究和内容研究的人',
          en: 'People doing market, competitive, or content research',
        },
        description: {
          cn: '适合需要持续发现资料、理解主题、核对说法和整理证据的工作流。',
          en: 'Best for workflows that repeatedly discover sources, understand topics, verify claims, and organize evidence.',
        },
      },
      {
        title: { cn: '重视来源可信度的团队', en: 'Teams that care about source trustworthiness' },
        description: {
          cn: '如果你不能只靠“看起来像真的”，这类对比会特别有帮助。',
          en: 'These comparisons are especially useful when sounding plausible is not good enough and sources matter.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想快速写一段文案的人', en: 'People who only want quick copy generation' },
        description: {
          cn: '如果重点只是写作输出，而不是查证和发现信息，研究工具通常不是最直接的入口。',
          en: 'If the main goal is copy generation rather than source discovery and verification, research tools are usually not the cleanest first stop.',
        },
      },
      {
        title: { cn: '完全不关心来源的人', en: 'People who do not care about sources' },
        description: {
          cn: '如果你的任务不需要引用、依据或证据，研究型工具会显得偏重。',
          en: 'These tools may feel unnecessarily heavy if your task does not need citations, references, or evidence.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-research-tools',
        title: { cn: '先看研究榜单', en: 'Start with the research ranking' },
        description: {
          cn: '如果研究是明确目标，先用榜单收窄 shortlist。',
          en: 'If research is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-research',
        title: { cn: '回到研究指南', en: 'Back to the research guide' },
        description: {
          cn: '如果你还要先把资料发现、证据核对和分析方向理清，可以回到指南页。',
          en: 'Go back if you still need to clarify discovery, evidence-checking, and analysis direction.',
        },
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 工具对比', en: 'Go to SEO tools comparison' },
        description: {
          cn: '如果你的研究已经收窄到关键词、SERP 和网站结构，这条更高意图。',
          en: 'A higher-intent path when the research is really about keywords, SERP, and site structure.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果下一步是把研究结果变成内容输出，这页更顺。',
          en: 'Move there when the next step is turning research into content output.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 研究工具对比', en: 'Go to SEO research tools comparison' },
        description: {
          cn: '如果你的研究已经收窄到关键词、SERP 和网站结构，这条路更高意图。',
          en: 'A more high-intent path when the research is really about keywords, SERP analysis, and site structure.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究工具对比', en: 'Go to crypto research tools comparison' },
        description: {
          cn: '如果你的研究重点已经是项目、协议和 narrative，这一页更贴近真实工作流。',
          en: 'A better fit when the real research job is around projects, protocols, and crypto narratives.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你下一步已经从“找资料”切到“整理输出”，就该从研究工具转去写作工具。',
          en: 'Move here when the next step shifts from finding evidence to turning it into structured output.',
        },
      },
      {
        href: '/categories/research?sort=popular',
        title: { cn: '回到 Research 分类', en: 'Return to the research category' },
        description: {
          cn: '当你想扩大 shortlist 并回看更多真实条目时，直接回分类页，再回榜单收口。',
          en: 'Go back to the category when you want a wider shortlist of real listings, then return to the ranking to narrow down again.',
        },
      },
    ],
    toolSelectionNotes: {
      perplexity: {
        bestFor: {
          cn: '想快速发现资料、建立研究起点，并高频来回追问的人。',
          en: 'People who want to discover sources quickly, build a research starting point, and iterate through follow-up questions fast.',
        },
        whyPickIt: {
          cn: '它很适合做“先把范围打开”，让你更快知道该继续查什么。',
          en: 'It is excellent for opening the search space and figuring out what to investigate next.',
        },
        watchOut: {
          cn: '如果你的工作更偏正式证据、论文和严谨引用，后面通常还要继续缩到更证据导向的工具。',
          en: 'You will often narrow further into more evidence-oriented tools if the work depends on formal papers and rigorous citations.',
        },
      },
      consensus: {
        bestFor: {
          cn: '想围绕论文和研究结论做资料核对的人。',
          en: 'People who want to validate information around papers and research-backed conclusions.',
        },
        whyPickIt: {
          cn: '它更像在帮助你判断“研究里到底怎么说”，适合证据优先的使用场景。',
          en: 'It helps answer what the research actually says, which makes it fit evidence-first use cases well.',
        },
        watchOut: {
          cn: '如果你的材料更多来自网页、竞品站和行业信息，它不一定是最宽的入口。',
          en: 'It may not be the broadest starting point when your sources are mostly websites, competitors, and industry information.',
        },
      },
      scite: {
        bestFor: {
          cn: '需要更细地看引用关系、支持与反驳证据的人。',
          en: 'People who need to inspect citation context and supporting or contrasting evidence more closely.',
        },
        whyPickIt: {
          cn: '它能帮助你不只看“有没有被引用”，而是继续追问“是怎么被引用的”。',
          en: 'It helps you go beyond whether something was cited and ask how it was cited.',
        },
        watchOut: {
          cn: '如果你只是想快速概览一个主题，它可能比需要的更细、更学术。',
          en: 'It can feel more granular and academic than necessary when you only need a quick topic overview.',
        },
      },
      notebooklm: {
        bestFor: {
          cn: '已经有一批资料，想把自己的材料放进去做整理、归纳和问答的人。',
          en: 'People who already have a set of materials and want to turn them into organized notes, synthesis, and grounded Q&A.',
        },
        whyPickIt: {
          cn: '它把研究重点从“发现信息”延伸到“围绕已有资料建立自己的工作台”。',
          en: 'It extends research from discovery into building a working analysis space around your own materials.',
        },
        watchOut: {
          cn: '如果你现在最缺的是找资料而不是整理资料，它通常不是第一步。',
          en: 'It is usually not the first step when the main gap is finding sources rather than organizing them.',
        },
      },
    },
    tips: {
      cn: [
        '先确认你做的是资料发现、证据核对还是围绕已有资料做分析沉淀。',
        '如果你重视可信度，优先看来源透明度、回溯能力和引用上下文。',
        '更看重长期使用时，关注导出、收藏、上下文管理和后续整理能力。',
      ],
      en: [
        'Start with whether the job is discovery, evidence-checking, or building analysis around your own materials.',
        'If trust matters, prioritize source transparency, traceability, and citation context.',
        'For long-term use, focus on exports, saved context, and downstream organization support.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看来源可追溯性、免费可用性、评分、更新情况和实际研究适配度。',
          en: 'We compare source traceability, free usability, ratings, freshness, and fit for real research workflows.',
        },
      },
      {
        question: { cn: '为什么把研究工具单独拿出来？', en: 'Why compare research tools separately?' },
        answer: {
          cn: '因为研究型需求更关注信息来源、覆盖范围和分析深度，而不只是生成结果。',
          en: 'Because research-heavy use cases care more about sources, coverage, and analytical depth than pure generation.',
        },
      },
    ],
  });

  const quickStarts = [
    {
      href: '/best-ai-tools/ai-research-tools',
      title: locale === 'cn' || locale === 'tw' ? '研究榜单' : 'Research ranking',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '先看 shortlist，再回比较页。'
          : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-tools-for-research',
      title: locale === 'cn' || locale === 'tw' ? '研究指南' : 'Research guide',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '重新确认是发现、核对还是分析。'
          : 'Re-check whether the job is discovery, verification, or analysis.',
    },
    {
      href: '/ai/perplexity',
      title: 'Perplexity',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '更适合带来源的起点研究。'
          : 'A source-friendly starting point for research.',
    },
    {
      href: '/ai/notebooklm',
      title: 'NotebookLM',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '适合整理已有资料并做问答。'
          : 'Great for organizing existing materials and asking grounded questions.',
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
            ? '研究对比页要围绕资料发现、引用可追溯和分析复盘来判断，不要只看答案速度。它会继续保留索引，但会把更窄的 SEO 和写作路径分层。'
            : 'This research comparison page should focus on discovery, source traceability, and analysis review instead of answer speed alone. Keep it indexable, but separate narrower SEO and writing paths.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '验证重点' : 'Validation focus',
            value: locale === 'cn' || locale === 'tw' ? '发现、引用、复盘' : 'Discovery, citations, review',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它是不是能帮你找资料和核对来源。'
                : 'Confirm it helps you find sources and verify claims.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '合并策略' : 'Merge strategy',
            value: locale === 'cn' || locale === 'tw' ? '分流到 SEO / 写作' : 'Route to SEO / writing',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你其实在做搜索流量或内容输出，就转到更窄页。'
                : 'If the real job is search traffic or content output, move to narrower pages.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '后续增量' : 'Next increments',
            value: locale === 'cn' || locale === 'tw' ? '真实案例、来源、评论' : 'Cases, sources, comments',
            note:
              locale === 'cn' || locale === 'tw'
                ? '把研究场景和真人反馈一起补上。'
                : 'Add research scenarios and human feedback together.',
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
              ? '这页已按真实研究路径重新核对，保留发现、引用和复盘入口。'
              : 'This page has been rechecked against a real research workflow and keeps discovery, citation, and review entry points visible.'}
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
              ? '先看榜单，再决定是继续看研究工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing research tools or switch to adjacent paths'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果研究已经是明确目标，先把 shortlist 收窄通常比继续横向看更多页面更有效。'
              : 'If research is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-research-tools',
                title: locale === 'cn' || locale === 'tw' ? '研究工具榜单' : 'Research tools ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-research',
                title: locale === 'cn' || locale === 'tw' ? '研究指南' : 'Research guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是发现、核对还是分析。'
                    : 'Re-check whether the task is discovery, verification, or analysis.',
              },
              {
                href: '/guides/ai-seo-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'SEO 工具对比' : 'SEO tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当研究更偏关键词和 SERP。'
                    : 'Useful when the research is more about keywords and SERP.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果下一步是把资料整理成输出。'
                    : 'Better when the next step is turning research into output.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`research_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_research_comparison' />
    </>
  );
}

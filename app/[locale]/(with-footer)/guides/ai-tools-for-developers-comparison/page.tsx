import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 开发者工具对比' : 'AI tools for developers comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 开发者工具，帮你更快选出适合编码、模型接入、调试和工作流集成的一个。'
      : 'Compare common AI developer tools to choose the one that fits coding, model access, debugging, and workflow integration best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '开发者工具', en: 'Developer tools' },
    comparisonLabel: { cn: 'AI 开发者工具对比', en: 'AI tools for developers comparison' },
    description: {
      cn: '如果你已经明确自己要的是编码辅助、模型路由、API 工作流或调试支持，这一页会帮你更快把候选工具放在一起看。',
      en: 'If you already know you need coding assistance, model routing, API workflows, or debugging support, this page helps you compare likely candidates side by side.',
    },
    searchQuery: 'developer',
    guideHref: '/guides/ai-tools-for-developers',
    rankingHref: '/best-ai-tools/ai-coding-tools',
    rankingLabel: { cn: '转去编程榜单页', en: 'Open the coding ranking' },
    backGuideLabel: { cn: '回到开发者工具指南', en: 'Back to developer tools guide' },
    altBrowseHref: '/explore?search=developer&sort=popular',
    altBrowseLabel: { cn: '浏览更多开发者工具', en: 'Browse more developer tools' },
    breadcrumbLabel: { cn: '开发者工具对比', en: 'Developer tools comparison' },
    compareTitle: { cn: '几款常见开发者工具的快速对照', en: 'A quick side-by-side look at common developer tools' },
    compareSubtitle: { cn: 'Developer', en: 'Developer' },
    preferredToolNames: ['cursor', 'openrouter', 'modal', 'langfuse'],
    comparisonDimensions: [
      {
        title: { cn: '编辑器内体验', en: 'Editor-native experience' },
        description: {
          cn: '如果主要工作在编辑器里，补全、多文件上下文和重构稳定性是第一判断点。',
          en: 'If most of the work happens inside the editor, completion, multi-file context, and refactoring stability are the first things to judge.',
        },
      },
      {
        title: { cn: '模型与接入层', en: 'Model and access layer' },
        description: {
          cn: '如果你在做多模型接入或平台统一，路由、成本控制和切换灵活性比单一能力更关键。',
          en: 'If you are unifying multiple models or platforms, routing, cost control, and switching flexibility matter more than one isolated feature.',
        },
      },
      {
        title: { cn: '执行与运维', en: 'Execution and operations' },
        description: {
          cn: '当工具要进入生产，日志、失败处理、权限和系统兼容性会迅速变成主角。',
          en: 'Once the tool is in production, logs, failure handling, permissions, and system compatibility quickly become the main factors.',
        },
      },
      {
        title: { cn: '团队协作成本', en: 'Team collaboration cost' },
        description: {
          cn: '如果多人一起用，真正要看的是接入维护、共享成本和日常治理是否顺手。',
          en: 'For team use, the real question is whether setup, sharing, and day-to-day governance feel manageable.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '工作主要在编辑器里', en: 'Most work happens in the editor' },
        description: {
          cn: '优先比较补全、重构、多文件上下文和真正落地代码的稳定性。',
          en: 'Prioritize completion, refactoring, multi-file context, and the reliability of turning intent into working code.',
        },
      },
      {
        title: { cn: '工作主要在 API / 模型层', en: 'Most work happens in the API or model layer' },
        description: {
          cn: '重点看模型路由、可观测性、成本控制和团队接入方式。',
          en: 'Focus on model routing, observability, cost control, and how teams integrate it.',
        },
      },
      {
        title: { cn: '工作主要在自动化与运维层', en: 'Most work happens in orchestration and ops' },
        description: {
          cn: '更该看日志、权限、失败处理和与现有基础设施的兼容性。',
          en: 'Put more weight on logs, permissions, failure handling, and compatibility with existing infrastructure.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '真实在交付产品的团队', en: 'Teams shipping real products' },
        description: {
          cn: '适合已经有仓库、接口、多人协作和生产约束的开发团队。',
          en: 'Best for teams already working with repos, APIs, multi-person collaboration, and production constraints.',
        },
      },
      {
        title: { cn: '独立开发者与小团队', en: 'Indie hackers and small teams' },
        description: {
          cn: '如果你需要更快地把想法接进代码和工作流，这类对比会很直接。',
          en: 'These comparisons are especially useful when you need to connect ideas to code and workflows faster.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想简单聊天问答的人', en: 'People who only want lightweight chat' },
        description: {
          cn: '如果重点只是提问和回答，开发者工具页通常太重了。',
          en: 'If the goal is mostly chat-style Q&A, developer tooling pages will often feel too heavy.',
        },
      },
      {
        title: { cn: '暂时没有接入或协作需求的人', en: 'People without integration or team needs' },
        description: {
          cn: '如果你还没进入真实交付或接入阶段，可能先看通用编程或聊天工具更合适。',
          en: 'If you are not yet integrating into real delivery workflows, general coding or chatbot pages may be a cleaner first stop.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-coding-tools',
        title: { cn: '先看编程榜单', en: 'Start with the coding ranking' },
        description: {
          cn: '如果编码体验是关键，先用榜单缩小 shortlist。',
          en: 'If coding experience is key, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers',
        title: { cn: '回到开发者指南', en: 'Back to the developer guide' },
        description: {
          cn: '如果你还想先把编辑器、模型层和运维层理清，可以回到指南页。',
          en: 'Go back if you still need to clarify editor, model-layer, and ops-layer needs first.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Go to automation comparison' },
        description: {
          cn: '如果你的开发重点已经变成流程编排和后台执行，这条更高意图。',
          en: 'A higher-intent path when the real need is orchestration and backend execution.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你已经在关心日志、错误和成本，这页更贴近真实交付。',
          en: 'Move there once logs, errors, and cost visibility are part of the workflow.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-coding-tools-comparison',
        title: { cn: '转去编程工具对比', en: 'Go to coding tools comparison' },
        description: {
          cn: '如果真正的决策点在编辑器内编码体验，这页更高意图。',
          en: 'A better high-intent path when the real decision is editor-native coding experience.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Go to automation tools comparison' },
        description: {
          cn: '如果你在找工作流编排、连接器和自动化执行层，这页更贴近目标。',
          en: 'Move there if orchestration, connectors, and workflow execution are the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你已经走到日志、成本和质量治理这一步，这页更贴近真实交付。',
          en: 'A better next step if logs, cost, and quality governance are already part of the delivery workflow.',
        },
      },
      {
        href: '/categories/developer-tools?sort=popular',
        title: { cn: '回到 Developer Tools 分类', en: 'Return to the developer tools category' },
        description: {
          cn: '当你想扩大 shortlist 并回看真实条目时，直接回分类页。',
          en: 'Go back to the category when you want a wider shortlist of real listings.',
        },
      },
    ],
    toolSelectionNotes: {
      cursor: {
        bestFor: {
          cn: '主要工作发生在编辑器里、希望更快写出和修改真实代码的开发者。',
          en: 'Developers whose main work happens in the editor and who want to ship and edit real code faster.',
        },
        whyPickIt: {
          cn: '它直接作用在编码体验上，适合把想法快速落到代码里。',
          en: 'It acts directly on the coding experience, which makes it great for turning intent into code quickly.',
        },
        watchOut: {
          cn: '如果真正的问题在 API、模型平台或后台执行，它不会解决最深的一层。',
          en: 'It will not solve the deepest layer if the real bottleneck is APIs, model platforms, or backend execution.',
        },
      },
      openrouter: {
        bestFor: {
          cn: '想统一接多个模型、做切换和比较的开发者与产品团队。',
          en: 'Developers and product teams that want unified access across multiple models and providers.',
        },
        whyPickIt: {
          cn: '它更像模型接入层，有利于保留模型选择和切换灵活性。',
          en: 'It behaves more like a model-access layer, which keeps model choice and switching flexible.',
        },
        watchOut: {
          cn: '如果你的主要问题不是模型接入，而是可观测性或工作流执行，仍要继续比较。',
          en: 'You may still need to compare further if observability or workflow execution is the real concern.',
        },
      },
      modal: {
        bestFor: {
          cn: '需要跑 GPU 任务、推理或更重后台执行工作负载的团队。',
          en: 'Teams running GPU workloads, inference, or heavier backend execution jobs.',
        },
        whyPickIt: {
          cn: '它把开发者决策拉向执行与部署层，适合真正上线 AI 功能的场景。',
          en: 'It pulls the decision toward execution and deployment, which fits real AI product delivery.',
        },
        watchOut: {
          cn: '如果你还停留在编辑器辅助或轻量实验阶段，它可能会显得过重。',
          en: 'It can feel heavy if you are still mostly in editor assistance or lightweight experimentation mode.',
        },
      },
      langfuse: {
        bestFor: {
          cn: '已经进入生产，开始关心日志、提示词质量和评估链路的团队。',
          en: 'Teams already in production and now caring about logs, prompt quality, and evaluation loops.',
        },
        whyPickIt: {
          cn: '它把“看清系统怎么工作”这件事做得更直接。',
          en: 'It makes it easier to see how the AI system is actually behaving in practice.',
        },
        watchOut: {
          cn: '如果你还没真正上线请求和工作流，它可能会显得偏早。',
          en: 'It may feel premature if you have not yet reached real request volume and production workflows.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你的主要工作发生在编辑器、模型接入层、执行层还是可观测层。',
        '如果你要团队使用，优先看权限、日志、私有仓库支持和接入维护成本。',
        '如果你会长期依赖它，重点看上下文能力、模型选择和稳定性。',
      ],
      en: [
        'Start with whether your work happens mainly in the editor, model-access layer, execution layer, or observability layer.',
        'For team use, prioritize permissions, logs, private repo support, and maintenance cost.',
        'If you will rely on it long term, focus on context depth, model choice, and stability.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流适配、免费可用性、评分、更新情况和对真实开发流程的帮助程度。',
          en: 'We compare workflow fit, free usability, ratings, freshness, and usefulness in real development work.',
        },
      },
      {
        question: { cn: '为什么单独做开发者工具对比？', en: 'Why compare developer tools separately?' },
        answer: {
          cn: '因为开发者工具的决策重点通常不是“会不会回答”，而是能不能稳定接进编辑器、仓库和产品流程。',
          en: 'Because developer-tool decisions are usually less about answers and more about stable integration into editors, repos, and product workflows.',
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
            ? '开发者工具的比较重点不是功能数，而是能否把编码、调试、协作和工作流整合到一个顺手的链路里。'
            : 'Developer tools should be judged less by feature count and more by whether they integrate coding, debugging, collaboration, and workflow into something actually smooth.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '编码效率' : 'Coding efficiency',
            value: locale === 'cn' || locale === 'tw' ? '看它能否缩短路径' : 'See whether it shortens the path',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正好用的工具通常是减少切换。'
                : 'The best tools usually reduce context switches.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '调试支持' : 'Debug support',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看能否继续推进问题'
                : 'Check whether it helps move the issue forward',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能解释、定位、建议下一步会更有价值。'
                : 'Tools that explain, locate, and suggest next steps are more useful.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作整合' : 'Collaboration fit',
            value: locale === 'cn' || locale === 'tw' ? '看是否适合团队使用' : 'See whether it fits team use',
            note:
              locale === 'cn' || locale === 'tw'
                ? '权限、共享和历史记录决定能不能长期落地。'
                : 'Permissions, sharing, and history decide long-term adoption.',
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
              ? '这页已按真实开发者工作流重新核对，保留编码、调试和协作入口。'
              : 'This page has been rechecked against a real developer workflow and keeps coding, debugging, and collaboration entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实开发者证据'
              : 'Keep it indexable and add real developer evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用仓库上下文、调试记录和真人评论把它和泛开发页区分开。'
              : 'Use repo context, debugging notes, and real comments to differentiate it from generic dev pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实开发场景和反馈' : 'Add real developer scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补仓库案例、编辑器样例和真人评论。'
              : 'Next, prioritize repo cases, editor examples, and real comments.'}
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
              ? '先看榜单，再决定是继续看开发者工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing developer tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果开发者工具已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If developer tools are already the clear goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-coding-tools',
                title: locale === 'cn' || locale === 'tw' ? '编程榜单' : 'Coding ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看更高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-developers',
                title: locale === 'cn' || locale === 'tw' ? '开发者指南' : 'Developer guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认编辑器、模型层还是运维层。'
                    : 'Re-check whether the need is editor, model layer, or operations.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '自动化对比' : 'Automation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当开发工作已经偏向工作流执行。'
                    : 'Useful when the work is moving toward workflow execution.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'API 可观测对比' : 'API observability comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果核心已经是日志、错误和成本。'
                    : 'Better when logs, errors, and cost visibility are the real need.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`developer_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_developers_comparison' />
    </>
  );
}

import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Agent 工具对比' : 'AI tools for agents comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更接近 Agent 工作流的 AI 工具，帮你更快选出适合任务编排、工具调用和运行治理的一组能力。'
      : 'Compare AI tools that sit closer to agent workflows so you can choose the right stack for orchestration, tool use, and runtime governance.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Agent 工具', en: 'Agent tools' },
    comparisonLabel: { cn: 'AI Agent 工具对比', en: 'AI tools for agents comparison' },
    description: {
      cn: '如果你已经知道自己在找 Agent 编排、执行层和治理层能力，这一页会帮你把几款更接近真实工作流的工具放在一起看。',
      en: 'If you already know you need agent orchestration, execution, and governance capabilities, this page helps you compare a few workflow-relevant tools side by side.',
    },
    searchQuery: 'agent',
    guideHref: '/guides/ai-tools-for-agents',
    rankingHref: '/best-ai-tools/ai-agent-tools',
    rankingLabel: { cn: '转去 Agent 榜单页', en: 'Open the agent ranking' },
    backGuideLabel: { cn: '回到 Agent 工具指南', en: 'Back to agent tools guide' },
    altBrowseHref: '/explore?search=agent&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Agent 工具', en: 'Browse more agent tools' },
    breadcrumbLabel: { cn: 'Agent 工具对比', en: 'Agent tools comparison' },
    compareTitle: {
      cn: '几款常见 Agent 方向工具的快速对照',
      en: 'A quick side-by-side look at common agent-oriented tools',
    },
    compareSubtitle: { cn: 'Agent', en: 'Agent' },
    preferredToolNames: ['n8n', 'openrouter', 'langfuse', 'portkey'],
    comparisonDimensions: [
      {
        title: { cn: '任务编排能力', en: 'Task orchestration' },
        description: {
          cn: '先看它是否适合多步骤任务、条件分支、工具调用和执行闭环，而不是只做一次性回答。',
          en: 'Check whether it supports multi-step tasks, branching, tool use, and execution loops instead of only one-off answers.',
        },
      },
      {
        title: { cn: '状态与上下文', en: 'State and context' },
        description: {
          cn: 'Agent 的关键不是单步结果，而是跨步骤保留上下文、任务状态和中间决策。',
          en: 'The key is not one answer, but how well the system preserves context, task state, and intermediate decisions across steps.',
        },
      },
      {
        title: { cn: '模型与工具接入', en: 'Model and tool access' },
        description: {
          cn: '如果 Agent 要调用多个模型、API 或外部系统，接入层灵活性会直接影响可用性。',
          en: 'If the agent needs multiple models, APIs, or external systems, access-layer flexibility will shape real usability.',
        },
      },
      {
        title: { cn: '可观测与治理', en: 'Observability and governance' },
        description: {
          cn: '进入生产后，日志、追踪、成本、失败恢复和人工接管能力都会变成决策重点。',
          en: 'Once this reaches production, logs, traces, cost, failure recovery, and human override become central decisions.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '要固定流程还是自主执行', en: 'Fixed flows or adaptive execution' },
        description: {
          cn: '如果流程几乎固定，自动化工具就够了；如果任务需要判断、回退和工具切换，Agent 工具会更有意义。',
          en: 'If the flow is mostly fixed, automation may be enough. If tasks need judgment, retries, and tool switching, agent tooling matters more.',
        },
      },
      {
        title: { cn: '重点在模型层还是执行层', en: 'Model layer or execution layer' },
        description: {
          cn: '有些工具更像模型网关，有些更像执行编排层，先分清主矛盾。',
          en: 'Some tools behave like model gateways while others are closer to execution orchestrators, so identify the main layer first.',
        },
      },
      {
        title: { cn: '先原型还是准备生产', en: 'Prototype first or prepare for production' },
        description: {
          cn: '原型阶段看上手速度，生产阶段要看日志、权限、稳定性和团队可维护性。',
          en: 'Prototype work values speed, while production work depends on logs, permissions, stability, and maintainability.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '在搭多步骤 AI 工作流的团队', en: 'Teams building multi-step AI workflows' },
        description: {
          cn: '适合任务需要调用工具、保持状态、跨步骤判断并最终落地执行的场景。',
          en: 'Best for workflows that need tool use, state, cross-step decisions, and final execution.',
        },
      },
      {
        title: { cn: '把 AI 接进生产流程的人', en: 'People pushing AI into production workflows' },
        description: {
          cn: '如果你关心的不只是一个 demo，而是长期运行、治理和交接，这页会更有帮助。',
          en: 'This is more useful when the goal is not only a demo, but long-running execution, governance, and handoff.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做单轮问答的人', en: 'People doing only single-turn chat' },
        description: {
          cn: '如果需求只是问答或写作，Agent 工具页通常会显得过重。',
          en: 'If the job is only chat or writing, agent tooling pages will often feel heavier than necessary.',
        },
      },
      {
        title: { cn: '还没有明确流程边界的人', en: 'People without a clear workflow yet' },
        description: {
          cn: '如果触发条件、输入输出和责任边界都还没想清楚，先梳理流程比选工具更重要。',
          en: 'If triggers, inputs, outputs, and ownership are still unclear, clarifying the workflow matters more than tool comparison.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-agent-tools',
        title: { cn: '先看 Agent 榜单', en: 'Start with the agent ranking' },
        description: {
          cn: '如果你已经确认要看 Agent 工作流，先把 shortlist 缩小。',
          en: 'If agent workflows are clearly the lane, narrow the shortlist first.',
        },
      },
      {
        href: '/guides/ai-tools-for-agents',
        title: { cn: '回到 Agent 指南', en: 'Return to the agent guide' },
        description: {
          cn: '先回到更高层判断，再重新对比具体工具。',
          en: 'Step back to the broader guide, then re-compare specific tools.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化对比', en: 'Go to automation comparison' },
        description: {
          cn: '如果实际流程更固定，自动化层通常更合适。',
          en: 'If the workflow is more fixed than adaptive, the automation layer is often the better fit.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你在意运行中的日志、成本和质量治理，这页更高意图。',
          en: 'A better path when runtime logs, cost, and quality governance are the real concern.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Go to automation tools comparison' },
        description: {
          cn: '如果你怀疑流程其实更偏固定编排而不是 Agent，自然要回到自动化层判断。',
          en: 'Go there when the workflow may actually be fixed orchestration rather than agent-like execution.',
        },
      },
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: { cn: '转去模型路由对比', en: 'Go to model routing comparison' },
        description: {
          cn: '如果核心问题是多模型接入、回退策略和路由治理，这页更贴近主矛盾。',
          en: 'A better fit when multi-model access, fallbacks, and routing governance are the main concern.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '当 Agent 开始稳定运行，日志、成本和质量追踪会成为下一层决策。',
          en: 'Once agents run continuously, logs, cost, and quality tracking usually become the next decision layer.',
        },
      },
      {
        href: '/categories/automation?sort=popular',
        title: { cn: '回到 Automation 分类', en: 'Return to the automation category' },
        description: {
          cn: '当你想扩大 shortlist 并回看真实条目时，直接回分类页。',
          en: 'Go back to the category when you want a wider shortlist of real listings.',
        },
      },
    ],
    toolSelectionNotes: {
      n8n: {
        bestFor: {
          cn: '需要把 Agent 逻辑放进可读、可控、可长期维护流程里的团队。',
          en: 'Teams that want agent logic to live inside readable, controllable, and maintainable workflows.',
        },
        whyPickIt: {
          cn: '它更像一个结构化执行层，适合让 Agent 工作流拥有更清晰的边界和归属。',
          en: 'It behaves more like a structured execution layer, which helps agent workflows keep clearer boundaries and ownership.',
        },
        watchOut: {
          cn: '如果你追求的是更深的模型治理或可观测能力，仍然需要补上其他层。',
          en: 'You may still need additional layers if the main challenge is deeper model governance or observability.',
        },
      },
      openrouter: {
        bestFor: {
          cn: '需要给 Agent 接多个模型、保留切换弹性和成本选择权的团队。',
          en: 'Teams that need multiple models for agents while keeping switching flexibility and cost control.',
        },
        whyPickIt: {
          cn: '它更适合作为模型接入层，帮助 Agent 选择和替换底层模型。',
          en: 'It works well as a model-access layer, making it easier for agents to choose and switch underlying models.',
        },
        watchOut: {
          cn: '它不是完整的执行编排层，所以如果任务流很重，还要继续补执行和治理能力。',
          en: 'It is not a full execution layer, so heavier task orchestration still needs separate execution and governance tooling.',
        },
      },
      langfuse: {
        bestFor: {
          cn: '已经有 Agent 请求流量，开始关心轨迹、质量和调试回路的团队。',
          en: 'Teams already running agent requests and now caring about traces, quality, and debugging loops.',
        },
        whyPickIt: {
          cn: '它能把 Agent 的运行轨迹、提示词和结果回路看得更清楚。',
          en: 'It helps teams see agent traces, prompts, and result loops much more clearly.',
        },
        watchOut: {
          cn: '如果你还没进入稳定运行阶段，它可能会显得偏早。',
          en: 'It can feel premature if the workflow has not yet reached a stable running stage.',
        },
      },
      portkey: {
        bestFor: {
          cn: '需要在 Agent 运行中同时看网关、策略、可观测和治理的团队。',
          en: 'Teams that want gateway control, policy, observability, and governance around agent execution.',
        },
        whyPickIt: {
          cn: '它把接入层和治理层拉得更近，适合把 Agent 系统往生产化推进。',
          en: 'It brings access and governance closer together, which fits teams moving agent systems toward production.',
        },
        watchOut: {
          cn: '如果需求仍然停留在轻量原型，它的价值可能不会立刻体现出来。',
          en: 'Its value may not show up immediately if the work is still mostly a lightweight prototype.',
        },
      },
    },
    tips: {
      cn: [
        '先判断任务是不是多步骤、要不要调用工具、要不要跨轮保留状态。',
        '如果要长期运行，优先看日志、失败恢复、权限和人工接管能力。',
        '如果你同时在比模型和执行系统，先分开看模型层与编排层。',
      ],
      en: [
        'Start with whether the task is multi-step, tool-using, and stateful across iterations.',
        'If it needs to run continuously, prioritize logs, retries, permissions, and human override.',
        'If you are comparing both models and execution systems, separate the model layer from the orchestration layer first.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流适配、免费可用性、评分、更新情况，以及它对真实 Agent 场景的帮助程度。',
          en: 'We compare workflow fit, free usability, ratings, freshness, and usefulness in real agent-oriented workflows.',
        },
      },
      {
        question: { cn: '为什么 Agent 工具要单独比较？', en: 'Why compare agent tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是单次回答质量，而是多步骤执行、治理和可维护性。',
          en: 'Because these decisions are usually less about one answer and more about multi-step execution, governance, and maintainability.',
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
            ? '这页先看真实可验证的 Agent 工作流信号，再继续判断是否真的需要编排、执行和治理层。'
            : 'This page looks at verifiable agent-workflow signals first, then helps you decide whether orchestration, execution, and governance are truly needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '编排能力' : 'Orchestration',
            value: locale === 'cn' || locale === 'tw' ? '多步骤任务与工具调用' : 'Multi-step tasks and tool use',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它是不是真的能跑完整闭环，而不是只会单轮输出。'
                : 'Confirm it can actually complete loops, not just single-turn output.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '上下文与状态' : 'Context and state',
            value: locale === 'cn' || locale === 'tw' ? '跨步骤保留任务状态' : 'Keeps task state across steps',
            note:
              locale === 'cn' || locale === 'tw'
                ? '没有状态管理，Agent 往往只会变成更贵的 prompt。'
                : 'Without state, an agent often becomes an expensive prompt wrapper.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '可观测与治理' : 'Observability and governance',
            value: locale === 'cn' || locale === 'tw' ? '日志、追踪、成本' : 'Logs, traces, and cost',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真要上生产，这些通常比 demo 表现更关键。'
                : 'For production, these usually matter more than demo quality.',
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
              ? '这页已按真实 Agent 工作流重新核对，保留编排、状态和治理入口。'
              : 'This page has been rechecked against a real agent workflow and keeps orchestration, state, and governance entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实 Agent 证据'
              : 'Keep it indexable and add real agent evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用多步骤、状态管理和真人评论把它和泛工具页区分开。'
              : 'Use multi-step flow, state handling, and real comments to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实 Agent 场景和反馈' : 'Add real agent scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补真实编排案例、失败恢复样例和真人评论。'
              : 'Next, prioritize orchestration cases, recovery examples, and real comments.'}
          </p>
        </div>
      </section>
      <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先用榜单缩小 agent shortlist'
              : 'Use the ranking to narrow your agent shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确是在找 Agent 编排、执行和治理工具，先看榜单会比只看对比页更快进入决策。'
              : 'If the decision is already about agent orchestration, execution, and governance tools, the ranking gets you to a decision faster than a comparison page alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-agent-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Agent 榜单' : 'Agent ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看最值得试的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Agent 对比' : 'Agent comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '任务编排、状态和治理一起看。'
                    : 'Compare orchestration, state, and governance together.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '自动化对比' : 'Automation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果流程更固定，优先看这页。'
                    : 'Useful when the workflow is more fixed than adaptive.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: locale === 'cn' || locale === 'tw' ? '可观测对比' : 'Observability comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你也在看日志、成本和质量治理。'
                    : 'Useful when logs, cost, and quality governance are also in scope.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`agent_comparison_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>
      </div>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_agents_comparison' />
    </>
  );
}

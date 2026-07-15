import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 模型路由工具对比' : 'AI tools for model routing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的模型路由工具，帮你更快选出适合多模型接入、回退策略和成本治理的一款。'
      : 'Compare common model routing tools to choose the one that fits multi-model access, fallback strategy, and cost control best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '模型路由工具', en: 'Model routing tools' },
    comparisonLabel: { cn: 'AI 模型路由工具对比', en: 'AI tools for model routing comparison' },
    description: {
      cn: '如果你已经知道自己要解决多模型接入、回退、成本控制或统一出口，这一页会帮你把常见工具放在一起看。',
      en: 'If you already know you need multi-model access, fallbacks, cost control, or unified access, this page helps you compare common options side by side.',
    },
    searchQuery: 'model',
    guideHref: '/guides/ai-tools-for-model-routing',
    rankingHref: '/best-ai-tools/ai-model-routing-tools',
    rankingLabel: { cn: '转去模型路由榜单页', en: 'Open the model routing ranking' },
    backGuideLabel: { cn: '回到模型路由指南', en: 'Back to model routing guide' },
    altBrowseHref: '/explore?search=model&sort=popular',
    altBrowseLabel: { cn: '浏览更多模型路由工具', en: 'Browse more model routing tools' },
    breadcrumbLabel: { cn: '模型路由工具对比', en: 'Model routing tools comparison' },
    compareTitle: {
      cn: '几款常见模型路由工具的快速对照',
      en: 'A quick side-by-side look at common model routing tools',
    },
    compareSubtitle: { cn: 'Model routing', en: 'Model routing' },
    preferredToolNames: ['openrouter', 'portkey', 'together-ai', 'helicone'],
    comparisonDimensions: [
      {
        title: { cn: '供应商覆盖', en: 'Provider coverage' },
        description: {
          cn: '先看能接多少模型供应商，以及切换时会不会把你锁得太死。',
          en: 'Check how many model providers are supported and whether switching creates unnecessary lock-in.',
        },
      },
      {
        title: { cn: '回退与容错', en: 'Fallbacks and resilience' },
        description: {
          cn: '路由工具的价值很大一部分在于它能不能稳住失败场景。',
          en: 'A big part of routing value is whether it stays stable when things fail.',
        },
      },
      {
        title: { cn: '成本与策略治理', en: 'Cost and policy governance' },
        description: {
          cn: '如果模型很多，限额、预算和规则控制就会成为核心能力。',
          en: 'With many models in play, quotas, budgets, and rule control quickly become core capabilities.',
        },
      },
      {
        title: { cn: '团队与生产集成', en: 'Team and production integration' },
        description: {
          cn: '如果它要进生产，权限、日志、审计和交接成本就不能忽略。',
          en: 'If it is going to production, permissions, logs, audits, and handoff cost cannot be ignored.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做统一模型出口', en: 'Unified model access' },
        description: {
          cn: '先看支持的供应商、模型广度和切换成本，而不是只看模型数量。',
          en: 'Start with provider support, model breadth, and switching cost rather than just the raw model count.',
        },
      },
      {
        title: { cn: '做回退与稳定性', en: 'Fallbacks and stability' },
        description: {
          cn: '更该看回退控制、缓存和失败处理是否足够稳。',
          en: 'Focus more on fallback controls, caching, and failure handling stability.',
        },
      },
      {
        title: { cn: '做成本治理', en: 'Cost governance' },
        description: {
          cn: '日志、限额和成本视图会比“接入快”更重要。',
          en: 'Logs, limits, and cost visibility matter more here than quick setup alone.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '多模型产品团队', en: 'Teams shipping multi-model products' },
        description: {
          cn: '适合需要在多个模型、供应商和策略之间持续切换与优化的团队。',
          en: 'Best for teams that need to switch and optimize across multiple models, providers, and strategies.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只调一个模型的人', en: 'People calling only one model' },
        description: {
          cn: '如果你不会做路由、回退或成本治理，这类工具可能会显得过重。',
          en: 'If routing, fallbacks, and cost governance are not real needs, these tools may feel heavier than necessary.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-model-routing-tools',
        title: { cn: '先看模型路由榜单', en: 'Start with the model routing ranking' },
        description: {
          cn: '如果模型路由已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If model routing is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-model-routing',
        title: { cn: '回到模型路由指南', en: 'Back to the model routing guide' },
        description: {
          cn: '如果你还要先理清统一接入、回退和成本治理，可以回到指南页。',
          en: 'Go back if you still need to clarify unified access, fallback behavior, and cost governance first.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你更关心日志、成本和质量追踪，这页更高意图。',
          en: 'A higher-intent path when logs, cost, and quality tracking matter more.',
        },
      },
      {
        href: '/guides/ai-tools-for-evals-comparison',
        title: { cn: '转去 Evals 对比', en: 'Go to evals comparison' },
        description: {
          cn: '如果你已经不只是选模型，而是开始验证输出质量，这页更贴近。',
          en: 'Move there once the job expands beyond model access into output-quality validation.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-model-routing-tools',
        title: { cn: '先看模型路由榜单页', en: 'Start with the model routing ranking' },
        description: {
          cn: '如果你想先确认这一类最值得看的候选，再回来细比，就先去榜单页。',
          en: 'Go through the ranking first if you want the strongest candidates before doing the detailed comparison.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你发现自己更关心日志、成本和质量追踪，这页更贴近真实决策。',
          en: 'Move there if the real decision is more about logs, cost, and quality tracking.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '适合还没完全确定自己是在选路由还是更广的开发工作流工具。',
          en: 'Best if you are not yet fully narrowed into routing versus broader developer tooling.',
        },
      },
      {
        href: '/guides/ai-tools-for-evals',
        title: { cn: '转去评估工具指南', en: 'Go to evals tools guide' },
        description: {
          cn: '如果你已经不只是选模型出口，而是开始验证输出质量和策略效果，这页更顺。',
          en: 'A better path when the job now includes validating output quality and strategy performance, not only model access.',
        },
      },
    ],
    toolSelectionNotes: {
      openrouter: {
        bestFor: {
          cn: '想统一接多个模型供应商，并保留切换自由度的独立开发者和产品团队。',
          en: 'Indie hackers and product teams that want one access layer across multiple model providers while keeping switching flexibility.',
        },
        whyPickIt: {
          cn: '它更像统一模型入口，适合先把“接得上、换得动”这件事做好。',
          en: 'It behaves like a unified model access layer, which is great for solving model access and switching first.',
        },
        watchOut: {
          cn: '如果你已经进入企业级治理、限额和审计阶段，通常还会继续补网关层能力。',
          en: 'You will often need a fuller gateway layer later if enterprise-grade governance, limits, and audits become important.',
        },
      },
      portkey: {
        bestFor: {
          cn: '既要做多模型路由，又要做配额、回退、团队权限和出口治理的团队。',
          en: 'Teams that need multi-model routing plus quotas, fallbacks, team permissions, and model-access governance.',
        },
        whyPickIt: {
          cn: '它把网关、路由和治理放在同一层，适合从“能接模型”走向“能管模型”。',
          en: 'It brings gateway, routing, and governance into one layer, which helps teams move from model access toward model control.',
        },
        watchOut: {
          cn: '如果你只是验证一个 MVP，它可能比当前阶段真正需要的更重一些。',
          en: 'It can be heavier than necessary when you are only validating an MVP.',
        },
      },
      'together-ai': {
        bestFor: {
          cn: '更偏开放模型、推理平台和模型选择灵活性的开发团队。',
          en: 'Developer teams leaning toward open models, inference platforms, and broader model choice flexibility.',
        },
        whyPickIt: {
          cn: '它把路由决策拉近到模型平台层，适合把“用哪类模型”也纳入技术决策。',
          en: 'It pulls the routing decision closer to the model-platform layer, which is useful when model family choice itself matters.',
        },
        watchOut: {
          cn: '如果你真正的问题只是统一出口和简单切换，不一定需要平台层这么深。',
          en: 'You may not need this much platform depth if the real need is only unified access and simple switching.',
        },
      },
      helicone: {
        bestFor: {
          cn: '想把路由策略和成本可见性一起看清楚的小团队与早期产品。',
          en: 'Small teams and early products that want routing strategy and cost visibility understood together.',
        },
        whyPickIt: {
          cn: '它能帮助你更快看到不同模型调用的花费与请求表现，方便做早期策略调整。',
          en: 'It helps teams quickly see spend and request behavior across models, which is useful for early routing decisions.',
        },
        watchOut: {
          cn: '如果你要的是更完整的网关治理和策略控制，后面还是可能继续上更重的一层。',
          en: 'You may still add a fuller gateway layer later if governance and routing controls become more demanding.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在解决统一接入、回退稳定性，还是企业级限额和治理。',
        '如果你要长期上线，重点看日志、权限、缓存、配额和成本治理。',
        '比“接得快”更重要的是后续是否方便替换、扩供应商和持续维护。',
      ],
      en: [
        'Start by separating unified access, fallback stability, and enterprise governance needs.',
        'If this will run long term, focus on logs, permissions, caching, quotas, and cost governance.',
        'More important than quick setup is whether the system stays replaceable, extensible, and maintainable later.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看供应商覆盖、回退控制、成本治理、日志能力和实际接入成本。',
          en: 'We compare provider coverage, fallback control, cost governance, logging, and practical integration cost.',
        },
      },
      {
        question: { cn: '为什么单独做模型路由对比？', en: 'Why compare model routing tools separately?' },
        answer: {
          cn: '因为这类决策的重点通常不是“能不能调用模型”，而是能不能长期稳定治理模型出口。',
          en: 'Because the decision is usually less about basic model access and more about stable long-term control of model access.',
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
            ? '这页先看真实可验证的模型路由信号，再继续判断是否需要统一入口、回退控制和成本治理。'
            : 'This page looks at verifiable model-routing signals first, then helps you decide whether unified access, fallback control, and cost governance are really needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '供应商覆盖' : 'Provider coverage',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先确认能接多少模型'
                : 'Confirm how many models it can actually cover',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能稳住多供应商接入和切换自由度。'
                : 'Start with whether multi-provider access and switching flexibility are actually there.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '容错能力' : 'Fallback handling',
            value:
              locale === 'cn' || locale === 'tw' ? '回退与失败处理要可见' : 'Fallbacks and failures should be visible',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果失败场景都说不清，后面再比高级功能意义不大。'
                : 'If failure behavior is unclear, feature depth is less useful.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '生产治理' : 'Production governance',
            value: locale === 'cn' || locale === 'tw' ? '日志、限额、审计' : 'Logs, limits, and audits',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正上生产时，治理能力会比“接得快”更关键。'
                : 'Once in production, governance matters more than quick setup.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '入口信号' : 'Access signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看是否真能统一入口' : 'Check whether access is truly unified',
            note: locale === 'cn' || locale === 'tw' ? '不要只看支持多少模型。' : 'Do not only count supported models.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '回退信号' : 'Fallback signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看失败时能否自动切换'
                : 'See whether it can fall back automatically',
            note:
              locale === 'cn' || locale === 'tw'
                ? '生产里最关键的是失败后还能不能继续。'
                : 'In production, the key is whether things keep working after failure.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '治理信号' : 'Governance signal',
            value: locale === 'cn' || locale === 'tw' ? '日志、限额、审计' : 'Logs, limits, and audits',
            note:
              locale === 'cn' || locale === 'tw'
                ? '长期上线离不开治理能力。'
                : 'Long-term deployment depends on governance.',
          },
        ]}
      />
      <section className='mx-auto mt-6 grid max-w-6xl gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '模型路由对比页已按真实统一入口和回退场景重新核对。'
              : 'The model routing comparison page has been rechecked against real unified-access and fallback scenarios.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-700'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，继续强调统一入口、回退和治理。'
              : 'Keep it indexable and keep emphasizing unified access, fallback, and governance.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-700'>
            {locale === 'cn' || locale === 'tw'
              ? '补一个真实多模型切换与回退案例。'
              : 'Add one real multi-model switching and fallback case.'}
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
              ? '先看榜单，再决定是继续看模型路由还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing model routing tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果模型接入和路由治理已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If model access and routing governance are already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-model-routing-tools',
                title: locale === 'cn' || locale === 'tw' ? '模型路由榜单' : 'Model routing ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-model-routing',
                title: locale === 'cn' || locale === 'tw' ? '模型路由指南' : 'Model routing guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是统一接入、回退还是治理。'
                    : 'Re-check whether the need is unified access, fallback, or governance.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'API 可观测对比' : 'API observability comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当你更关心日志、成本和质量追踪。'
                    : 'Useful when logs, cost, and quality tracking matter more.',
              },
              {
                href: '/guides/ai-tools-for-evals-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Evals 对比' : 'Evals comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你已经开始验证输出质量。'
                    : 'Better once output-quality validation becomes part of the decision.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`model_routing_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_model_routing_comparison' />
    </>
  );
}

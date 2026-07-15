import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Prompt 测试工具对比' : 'AI tools for prompt testing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 prompt 测试工具，帮你更快选出适合评估、A/B 测试和回归验证的一款。'
      : 'Compare common prompt testing tools to choose the one that fits evals, A/B tests, and regression checks best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Prompt 测试工具', en: 'Prompt testing tools' },
    comparisonLabel: { cn: 'AI Prompt 测试工具对比', en: 'AI tools for prompt testing comparison' },
    description: {
      cn: '如果你已经知道自己要解决提示词评估、A/B 对比、回归验证和质量判断，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need prompt evaluation, A/B comparison, regression checks, and quality judgment, this page helps you compare common options side by side.',
    },
    searchQuery: 'prompt',
    guideHref: '/guides/ai-tools-for-prompt-testing',
    rankingHref: '/best-ai-tools/ai-prompt-testing-tools',
    rankingLabel: { cn: '转去 Prompt 榜单页', en: 'Open the prompt testing ranking' },
    backGuideLabel: { cn: '回到 Prompt 测试指南', en: 'Back to prompt testing guide' },
    altBrowseHref: '/explore?search=prompt&sort=popular',
    altBrowseLabel: { cn: '浏览更多 prompt 测试工具', en: 'Browse more prompt testing tools' },
    breadcrumbLabel: { cn: 'Prompt 测试工具对比', en: 'Prompt testing tools comparison' },
    compareTitle: {
      cn: '几款常见 prompt 测试工具的快速对照',
      en: 'A quick side-by-side look at common prompt testing tools',
    },
    compareSubtitle: { cn: 'Prompt testing', en: 'Prompt testing' },
    preferredToolNames: ['langfuse', 'langsmith', 'helicone', 'portkey'],
    decisionCards: [
      {
        title: { cn: '看评估方式', en: 'Evaluation style' },
        description: {
          cn: '优先看它是偏单次对比、数据集评估，还是回归验证。',
          en: 'Prioritize whether the tool is strongest at single-run comparison, dataset evals, or regression checks.',
        },
      },
      {
        title: { cn: '看版本管理', en: 'Version management' },
        description: {
          cn: '更该看 prompt、模型和结果能不能连成可复盘的版本链路。',
          en: 'Focus on whether prompts, models, and outputs are tied into a reviewable version history.',
        },
      },
      {
        title: { cn: '看团队协作', en: 'Team collaboration fit' },
        description: {
          cn: '如果是团队使用，要看结果共享、复盘和验收流程是否顺手。',
          en: 'For team use, judge whether result sharing, review, and signoff workflows feel natural.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '经常迭代 prompt 的团队', en: 'Teams that iterate prompts often' },
        description: {
          cn: '适合已经进入反复试验阶段，不想每次都靠感觉判断的人。',
          en: 'Best for teams already iterating heavily and no longer wanting to judge changes by instinct alone.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看上线后日志的人', en: 'People mainly focused on post-deploy logs' },
        description: {
          cn: '如果重点是请求链路和线上质量观察，可观测页通常更适合。',
          en: 'If the real job is request tracing and production quality visibility, observability pages are usually a better fit.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-prompt-testing-tools',
        title: { cn: '先看 Prompt 榜单', en: 'Start with the prompt testing ranking' },
        description: {
          cn: '如果 Prompt 测试已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If prompt testing is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing',
        title: { cn: '回到 Prompt 测试指南', en: 'Back to the prompt testing guide' },
        description: {
          cn: '如果你还要先理清评估方式、版本管理和协作流程，可以回到指南页。',
          en: 'Go back if you still need to clarify evaluation style, version management, and collaboration flow first.',
        },
      },
      {
        href: '/guides/ai-tools-for-evals-comparison',
        title: { cn: '转去 Evals 对比', en: 'Go to evals comparison' },
        description: {
          cn: '如果你的问题已经从 prompt 测试扩展到更广的验证体系，这页更高意图。',
          en: 'A higher-intent path when the job expands from prompt testing into broader evaluation systems.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '如果你更关心请求、日志和质量追踪，这页更贴近。',
          en: 'Move there when requests, logs, and quality tracking become the real focus.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-prompt-testing-tools',
        title: { cn: '先看 Prompt 榜单页', en: 'Start with the prompt testing ranking' },
        description: {
          cn: '如果你想先把 shortlist 收紧，再回来比较版本和实验流程，就先去榜单页。',
          en: 'Open the ranking first if you want a tighter shortlist before comparing versions and experiment flows.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你发现真正决策点更偏日志、请求和线上质量，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward logs, requests, and production quality visibility.',
        },
      },
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: { cn: '转去模型路由工具对比', en: 'Switch to model routing comparison' },
        description: {
          cn: '如果你发现问题在模型切换和成本治理，这页更合适。',
          en: 'More useful if the real decision is about model switching and cost governance.',
        },
      },
      {
        href: '/guides/ai-tools-for-evals-comparison',
        title: { cn: '转去评估工具对比', en: 'Go to evals tools comparison' },
        description: {
          cn: '如果你的问题已经从 prompt 测试扩展到更广的验证体系，这页更自然。',
          en: 'A more natural next step when the job expands from prompt testing into a broader evaluation system.',
        },
      },
    ],
    toolSelectionNotes: {
      langfuse: {
        bestFor: {
          cn: '想把 prompt 迭代、线上行为和评估闭环连在一起的产品团队。',
          en: 'Product teams that want prompt iteration, production behavior, and evaluation loops connected together.',
        },
        whyPickIt: {
          cn: '它适合把“测试 prompt”这件事放进持续迭代流程，而不是做几次孤立实验。',
          en: 'It fits teams that want prompt testing inside a continuing iteration loop rather than as isolated experiments.',
        },
        watchOut: {
          cn: '如果你只是想临时做 A/B 对比，它可能会比当前需求更完整。',
          en: 'It may be more complete than necessary if the need is only occasional A/B comparison.',
        },
      },
      langsmith: {
        bestFor: {
          cn: '更关心链路调试、评估集和复杂应用行为验证的团队。',
          en: 'Teams more focused on trace debugging, eval datasets, and validating complex application behavior.',
        },
        whyPickIt: {
          cn: '它很适合把 prompt 测试延伸成系统级验证，而不只是比较两版文案。',
          en: 'It is a strong choice when prompt testing needs to grow into system-level validation rather than just comparing two prompt versions.',
        },
        watchOut: {
          cn: '如果系统还很轻，或者并没有复杂链路，门槛会显得偏高。',
          en: 'The overhead can feel high when the system is still light and does not need deep workflow tracing.',
        },
      },
      helicone: {
        bestFor: {
          cn: '想先把请求表现、成本和 prompt 变化的效果看清楚的小团队。',
          en: 'Small teams that first want clearer visibility into request behavior, spend, and the impact of prompt changes.',
        },
        whyPickIt: {
          cn: '它很适合把 prompt 调整和线上结果先对上号，帮助做早期判断。',
          en: 'It is practical for connecting prompt changes with live results early on.',
        },
        watchOut: {
          cn: '如果你需要更重的实验管理和评估组织能力，后面可能仍会继续补别的层。',
          en: 'You may still need another layer later if experiment management and eval organization become central.',
        },
      },
      portkey: {
        bestFor: {
          cn: '把 prompt 测试和网关治理、限额、模型策略一起看待的团队。',
          en: 'Teams treating prompt testing together with gateway governance, quotas, and model strategy.',
        },
        whyPickIt: {
          cn: '它适合把“怎么测”与“怎么管模型出口”放在同一套决策里。',
          en: 'It helps when the team wants testing decisions and model-access governance in the same layer.',
        },
        watchOut: {
          cn: '如果你只需要轻量实验，它可能会比当前阶段更平台化。',
          en: 'It may feel more platform-heavy than needed for lightweight experiments.',
        },
      },
    },
    tips: {
      cn: [
        '先看评估方式，再看 prompt 版本管理和结果沉淀方式。',
        '如果是团队使用，重点看结果复盘、共享和验收流程是否顺手。',
        '比“能不能跑”更重要的是能不能稳定复现、比较和持续验证。',
      ],
      en: [
        'Start with evaluation style, then move to prompt versioning and result organization.',
        'For team use, focus on review, sharing, and signoff workflow for results.',
        'More important than whether it can run is whether it can reproduce, compare, and validate reliably over time.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看评估方式、版本管理、结果复盘、团队协作和实际验证流程。',
          en: 'We compare evaluation style, version control, result review, team collaboration, and practical validation flow.',
        },
      },
      {
        question: { cn: '为什么单独做 prompt 测试对比？', en: 'Why compare prompt testing tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是“能不能调用模型”，而是能不能稳定验证和比较 prompt 质量。',
          en: 'Because the decision is usually less about model access and more about whether prompt quality can be validated and compared reliably.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-15'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Prompt 测试对比页已经对齐“先验证，再扩大”的判断顺序。'
            : 'This prompt-testing comparison page now follows a verify-first, expand-later order.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认评估目标', '再看版本与协作', '最后决定是否继续点开']
            : [
                'Confirm the evaluation goal first',
                'Then check versioning and collaboration',
                'Only then decide whether to continue',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '评估目标' : 'Evaluation goal',
            value: locale === 'cn' || locale === 'tw' ? '对比 / 回归 / 验收' : 'Comparison / regression / acceptance',
            note:
              locale === 'cn' || locale === 'tw'
                ? '不同目标会直接改变你该看哪一类工具。'
                : 'Different goals change which tools matter immediately.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '版本管理' : 'Versioning',
            value: locale === 'cn' || locale === 'tw' ? '可回溯可复盘' : 'Traceable and reviewable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '没有版本链路，prompt 测试很容易变成“今天觉得行”。'
                : 'Without version history, prompt testing becomes a “seems fine today” exercise.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '后续动作' : 'Next action',
            value:
              locale === 'cn' || locale === 'tw' ? '先看榜单再验证官网' : 'Check the ranking before the official site',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先缩小 shortlist，再进入官网看是否真能落地。'
                : 'Narrow the shortlist first, then validate whether it truly fits on the official site.',
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
              ? '先看榜单，再决定是继续测 prompt 还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep testing prompts or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做评估、A/B 测试或回归验证，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If evals, A/B tests, or regression checks are already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-prompt-testing-tools',
                title: locale === 'cn' || locale === 'tw' ? 'Prompt 测试榜单' : 'Prompt testing ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先把最相关的候选缩小到少数几个。'
                    : 'Narrow to the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-evals-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Evals 对比' : 'Evals comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当你想把 prompt 测试扩展成系统验证。'
                    : 'Useful when prompt testing needs to grow into system-level validation.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'API 可观测对比' : 'API observability comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心日志、成本和线上表现。'
                    : 'Useful when logs, cost, and live behavior matter more.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Agent 工具对比' : 'Agent tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当验证不再只是 prompt，而是多步骤工作流。'
                    : 'A better path when the work moves beyond prompts into multi-step workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`prompt_testing_ranking_${item.href.split('/').pop()}`}
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
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_prompt_testing_comparison' />
    </>
  );
}

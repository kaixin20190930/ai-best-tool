import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代码审查工具对比' : 'AI tools for code review comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的代码审查工具，帮你更快选出适合 PR 审查、风险提示和团队反馈的一款。'
      : 'Compare common code review tools to choose the one that fits PR review, risk checks, and team feedback best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '代码审查工具', en: 'Code review tools' },
    comparisonLabel: { cn: 'AI 代码审查工具对比', en: 'AI tools for code review comparison' },
    description: {
      cn: '如果你已经知道自己要解决 PR 理解、风险提示、review 草稿或变更解释，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need PR understanding, risk checks, review drafts, or change explanation, this page helps you compare common options side by side.',
    },
    searchQuery: 'code review',
    guideHref: '/guides/ai-tools-for-code-review',
    rankingHref: '/best-ai-tools/ai-code-review-tools',
    rankingLabel: { cn: '转去代码审查榜单页', en: 'Open the code review ranking' },
    backGuideLabel: { cn: '回到代码审查指南', en: 'Back to code review guide' },
    altBrowseHref: '/explore?search=code%20review&sort=popular',
    altBrowseLabel: { cn: '浏览更多代码审查工具', en: 'Browse more code review tools' },
    breadcrumbLabel: { cn: '代码审查工具对比', en: 'Code review tools comparison' },
    compareTitle: {
      cn: '几款常见代码审查工具的快速对照',
      en: 'A quick side-by-side look at common code review tools',
    },
    compareSubtitle: { cn: 'Code review', en: 'Code review' },
    preferredToolNames: ['cursor', 'claude', 'phind', 'chatgpt'],
    decisionCards: [
      {
        title: { cn: '看 diff 理解能力', en: 'Diff understanding' },
        description: {
          cn: '优先看它能不能围绕改动本身给出具体解释，而不是泛泛总结。',
          en: 'Prioritize whether it can explain the actual change instead of offering generic summaries.',
        },
      },
      {
        title: { cn: '看风险与噪音比', en: 'Risk signal vs noise' },
        description: {
          cn: '更该看提示是否真有价值，以及会不会让 review comment 变多但变浅。',
          en: 'Focus on whether the warnings are truly useful instead of producing shallow extra comments.',
        },
      },
      {
        title: { cn: '看团队协作贴合度', en: 'Team collaboration fit' },
        description: {
          cn: '如果是团队使用，要看它是否贴近 PR 流程、评论节奏和协作习惯。',
          en: 'For team use, judge how well it fits PR flow, comment rhythm, and collaboration habits.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '想缩短 PR 周期的团队', en: 'Teams trying to shorten PR cycles' },
        description: {
          cn: '适合已经有稳定提交和 review 流程，但想减少等待与沟通成本的团队。',
          en: 'Best for teams with an existing review process that want to reduce waiting time and communication cost.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想找写代码助手的人', en: 'People only looking for code generation help' },
        description: {
          cn: '如果重点是实现速度而不是 review 质量，这类比较会显得偏后段。',
          en: 'If implementation speed matters more than review quality, this comparison is not the sharpest first step.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-code-review-tools',
        title: { cn: '先看代码审查榜单', en: 'Start with the code review ranking' },
        description: {
          cn: '如果代码审查已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If code review is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-code-review',
        title: { cn: '回到代码审查指南', en: 'Back to the code review guide' },
        description: {
          cn: '如果你还想先理清 diff 理解、风险提示和协作流程，可以回到指南页。',
          en: 'Go back if you still need to clarify diff understanding, risk checks, and collaboration flow first.',
        },
      },
      {
        href: '/guides/ai-coding-tools-comparison',
        title: { cn: '转去编程工具对比', en: 'Go to coding tools comparison' },
        description: {
          cn: '如果你的问题其实更偏实现效率，这页更高意图。',
          en: 'A higher-intent path when the real need is implementation speed rather than review depth.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing-comparison',
        title: { cn: '转去 Prompt 测试对比', en: 'Go to prompt testing comparison' },
        description: {
          cn: '如果 review 开始延伸到 AI 输出质量和回归验证，这页更顺。',
          en: 'Move there when review starts overlapping with output quality and regression checks.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-coding-tools-comparison',
        title: { cn: '转去编程工具对比', en: 'Switch to coding tools comparison' },
        description: {
          cn: '如果你发现真正决策点更偏实现效率，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward implementation speed.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选 review 还是更广的开发工作流工具。',
          en: 'Best if you are not yet fully narrowed into review versus broader developer tooling.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing-comparison',
        title: { cn: '转去 Prompt 测试对比', en: 'Go to prompt testing comparison' },
        description: {
          cn: '如果你的 review 已经延伸到 AI 输出质量、评估和回归验证，这页更贴近后续流程。',
          en: 'A better path when review work starts overlapping with output quality, evals, and regression checks.',
        },
      },
    ],
    toolSelectionNotes: {
      cursor: {
        bestFor: {
          cn: '已经主要在编辑器里 review 改动、顺手修改代码和补充说明的开发者。',
          en: 'Developers who mostly review changes inside the editor and often jump directly into code fixes or explanations.',
        },
        whyPickIt: {
          cn: '它把 review 和改代码放得很近，适合快速理解改动并立刻处理。',
          en: 'It keeps review close to editing, which is useful when understanding a diff and fixing it happen almost together.',
        },
        watchOut: {
          cn: '如果团队重点在 PR 线程、协作节奏和多人审批，它并不天然替代完整的 review 流程。',
          en: 'It does not automatically replace a full PR-centric review workflow when collaboration and approvals are the real center of gravity.',
        },
      },
      claude: {
        bestFor: {
          cn: '需要更长上下文、想让工具帮助解释改动意图和潜在风险的人。',
          en: 'People who want longer-context help for understanding change intent and surfacing possible risks.',
        },
        whyPickIt: {
          cn: '它更适合把 diff 放进更完整的上下文里去理解，而不只是做一句话点评。',
          en: 'It works well when the diff needs to be understood in fuller context rather than reduced to a quick comment.',
        },
        watchOut: {
          cn: '如果你要的是严格贴合 PR 流程的自动化落地，仍然要配合具体的工作流工具。',
          en: 'You will still need more workflow-specific tooling if the goal is tighter PR-process automation.',
        },
      },
      phind: {
        bestFor: {
          cn: '更偏技术排查、想把 review 问题延伸成定位和修复线索的开发者。',
          en: 'Developers who lean technical and want review findings to turn into debugging and fix-oriented investigation.',
        },
        whyPickIt: {
          cn: '它适合把“这里可能有问题”继续追成“为什么会这样、应该怎么改”。',
          en: 'It is useful when you want to turn a possible issue into a deeper why-and-how-to-fix thread.',
        },
        watchOut: {
          cn: '如果你更看重团队 review 反馈的一致性，它未必是最顺手的入口。',
          en: 'It may not be the cleanest first stop when the main need is consistent team review feedback.',
        },
      },
      chatgpt: {
        bestFor: {
          cn: '想快速做 PR 解释、review 草稿或改动总结的人。',
          en: 'People who want quick PR explanations, review drafts, or change summaries.',
        },
        whyPickIt: {
          cn: '它很适合把 review 讨论先拉起来，尤其是在你还没完全确定问题表达方式的时候。',
          en: 'It is a practical way to get a review discussion started, especially when you have not fully shaped the issue yet.',
        },
        watchOut: {
          cn: '如果没有配合代码上下文和真实 diff，反馈很容易变得泛。',
          en: 'Feedback can become generic quickly if it is not grounded in enough code context and the real diff.',
        },
      },
    },
    tips: {
      cn: [
        '先看 diff 理解和风险提示，再看评论质量与可执行性。',
        '如果是团队使用，重点看噪音控制、协作贴合度和 review 节奏。',
        '比“会不会说”更重要的是能不能让 review 过程更稳、更快、更一致。',
      ],
      en: [
        'Start with diff understanding and risk checks, then move to comment quality and actionability.',
        'For team use, focus on noise control, collaboration fit, and review rhythm.',
        'More important than sounding smart is whether the tool makes review steadier, faster, and more consistent.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看 diff 理解、风险提示、反馈可执行性、协作贴合度和真实使用噪音。',
          en: 'We compare diff understanding, risk checks, actionability of feedback, collaboration fit, and real-world noise.',
        },
      },
      {
        question: { cn: '为什么单独做代码审查对比？', en: 'Why compare code review tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是生成代码，而是能不能减少 review 成本并提升反馈质量。',
          en: 'Because the decision is usually less about generating code and more about reducing review cost while improving feedback quality.',
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
            ? '代码审查工具的核心不是“多说几句”，而是能不能把 diff、风险提示、团队协作和 review 节奏串起来，减少噪音。'
            : 'The core of code review tools is not saying more, but whether they can connect diff understanding, risk signals, team collaboration, and review rhythm without adding noise.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先判断你是在做 diff 理解、风险检查，还是 review 协作。',
                '如果目标已经明确，先去更聚焦的代码审查或编程工具页看候选。',
                '如果还要给团队留证据，再回到这页补 PR、评论和交接案例。',
              ]
            : [
                'First decide whether you care most about diff understanding, risk checks, or review collaboration.',
                'If the goal is already clear, move to the more focused code-review or coding pages for candidates.',
                'If you still need team evidence, come back here for PR, comments, and handoff examples.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? 'Diff 理解' : 'Diff understanding',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能讲清改动本身'
                : 'Check whether it can explain the change itself',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果连改动都解释不清，后面的建议就很难稳定。'
                : 'If it cannot explain the change clearly, the rest of the feedback will not hold up well.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险噪音比' : 'Risk-to-noise ratio',
            value:
              locale === 'cn' || locale === 'tw' ? '看提醒是否真有价值' : 'Check whether warnings are actually useful',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能减少漏检才算好，而不是只是制造更多 comment。'
                : 'It is only good if it reduces misses instead of creating more comments.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队协作' : 'Team collaboration',
            value: locale === 'cn' || locale === 'tw' ? '看是否贴合 PR 流程' : 'See whether it matches PR workflow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '审批、评论和交接流程越顺，团队越容易长期用。'
                : 'The smoother the approval, comments, and handoff flow, the more likely the team will keep using it.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? 'Diff 信号' : 'Diff signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能解释改动本身'
                : 'Check whether it can explain the change itself',
            note:
              locale === 'cn' || locale === 'tw'
                ? '解释不清改动，后面就很难稳。'
                : 'If it cannot explain the diff clearly, the rest is shaky.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '噪音信号' : 'Noise signal',
            value:
              locale === 'cn' || locale === 'tw' ? '看提醒是否真有价值' : 'See whether warnings are actually useful',
            note: locale === 'cn' || locale === 'tw' ? '能减少漏检才算好。' : 'It only helps if it reduces misses.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作信号' : 'Collaboration signal',
            value: locale === 'cn' || locale === 'tw' ? '看是否贴合 PR 流程' : 'Check whether it matches PR workflow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '审批和交接越顺，越容易长期用。'
                : 'The smoother the approval and handoff flow, the more likely it sticks.',
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
              ? '先看榜单，再决定是继续看代码审查工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing code review tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果代码审查已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If code review is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-code-review-tools',
                title: locale === 'cn' || locale === 'tw' ? '代码审查榜单' : 'Code review ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-code-review',
                title: locale === 'cn' || locale === 'tw' ? '代码审查指南' : 'Code review guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是 diff 理解还是风险提示。'
                    : 'Re-check whether the need is diff understanding or risk checks.',
              },
              {
                href: '/guides/ai-coding-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '编程工具对比' : 'Coding tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的重点其实更偏实现效率。'
                    : 'Useful when implementation speed is actually the priority.',
              },
              {
                href: '/guides/ai-tools-for-prompt-testing-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Prompt 测试对比' : 'Prompt testing comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果 review 开始延伸到 AI 输出验证。'
                    : 'Better when review work overlaps with AI output validation.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`code_review_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_code_review_comparison' />
    </>
  );
}

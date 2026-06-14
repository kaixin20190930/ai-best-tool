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

  return ComparisonPage({ ...data, locale });
}

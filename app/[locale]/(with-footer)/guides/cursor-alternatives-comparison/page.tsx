import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Cursor 替代方案对比' : 'Cursor alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更接近 Cursor 工作流的 AI 工具，帮你更快判断编辑器内补全、重构、调试和上下文协作该选哪一类。'
      : 'Compare AI tools that feel closer to the Cursor workflow so you can choose the right fit for editor-first completion, refactoring, debugging, and context-aware coding.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '编程工具', en: 'Coding tools' },
    comparisonLabel: { cn: 'Cursor 替代方案对比', en: 'Cursor alternatives comparison' },
    description: {
      cn: '如果你已经知道自己想要的是更接近 Cursor 的编辑器内工作流，这一页会把最常被拿来替代或搭配 Cursor 的工具放在一起看。',
      en: 'If you already know you want something closer to a Cursor-style editor workflow, this page puts the most common alternatives and complements side by side.',
    },
    searchQuery: 'cursor',
    guideHref: '/guides/ai-coding-tools',
    rankingHref: '/best-ai-tools/ai-coding-tools',
    rankingLabel: { cn: '转去编程榜单页', en: 'Open the coding ranking' },
    backGuideLabel: { cn: '回到编程工具指南', en: 'Back to coding guide' },
    altBrowseHref: '/explore?search=cursor&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Cursor 相关工具', en: 'Browse more Cursor-related tools' },
    breadcrumbLabel: { cn: 'Cursor 替代方案对比', en: 'Cursor alternatives comparison' },
    compareTitle: {
      cn: '最常被拿来替代 Cursor 的几款工具',
      en: 'Common alternatives to Cursor side by side',
    },
    compareSubtitle: { cn: 'Cursor', en: 'Cursor' },
    preferredToolNames: ['cursor', 'claude', 'phind', 'chatgpt'],
    decisionCards: [
      {
        title: { cn: '看你更在意编辑器还是问答', en: 'Editor-first or chat-first' },
        description: {
          cn: 'Cursor 更偏编辑器内工作流；如果你只是要快速问答或代码解释，别的工具可能更轻。',
          en: 'Cursor is more editor-first; if you mainly need quick Q&A or code explanation, a different tool may feel lighter.',
        },
      },
      {
        title: { cn: '看上下文和重构深度', en: 'Context and refactoring depth' },
        description: {
          cn: '真正的替代项要能跟得上你当前文件、相关依赖和改动上下文，而不是只回答单轮问题。',
          en: 'A real alternative needs to keep up with your current file, related dependencies, and change context instead of only answering one-off prompts.',
        },
      },
      {
        title: { cn: '看是否能直接推进产出', en: 'Can it move the work forward' },
        description: {
          cn: '如果工具能帮你直接补代码、解释 diff 或继续修复问题，才算真正进入生产级工作流。',
          en: 'If the tool can help you write code, explain a diff, or keep a debugging loop moving, it is closer to a production-ready workflow.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '已经在编辑器里工作的开发者', en: 'Developers already working inside an editor' },
        description: {
          cn: '适合你已经把主要工作放在 IDE / 编辑器里，希望 AI 直接贴着代码协作。',
          en: 'Best if your main workflow already lives in an IDE or editor and you want AI to work directly alongside the code.',
        },
      },
      {
        title: { cn: '想把补全和解释合并的人', en: 'People who want completion plus explanation' },
        description: {
          cn: '如果你希望工具不仅能补代码，还能解释为什么这么改，这类对比会更有帮助。',
          en: 'Useful when you want the tool to not only fill code, but also explain why a change makes sense.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只需要纯问答的人', en: 'People who only need chat' },
        description: {
          cn: '如果你并不打算在编辑器里直接改代码，这个比较页会显得偏重。',
          en: 'If you do not plan to edit code inside the editor, this comparison will feel heavier than needed.',
        },
      },
      {
        title: { cn: '还没决定开发工作流的人', en: 'People still figuring out their workflow' },
        description: {
          cn: '如果你还不确定是写代码、调试、审查还是编排更重要，先回到更宽的编程指南。',
          en: 'If you are not sure whether coding, debugging, review, or orchestration matters most, start from the broader coding guide.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-coding-tools-comparison',
        title: { cn: '转去编程工具总对比', en: 'Go to coding tools comparison' },
        description: {
          cn: '如果你想把候选面拉大一点，再重新收敛 shortlist，这页更合适。',
          en: 'Use this when you want a broader candidate set before narrowing back down.',
        },
      },
      {
        href: '/guides/ai-tools-for-code-review-comparison',
        title: { cn: '转去代码审查对比', en: 'Go to code review comparison' },
        description: {
          cn: '如果你的主要诉求已经变成 PR 审查和反馈质量，这条路径更贴近目标。',
          en: 'Move here if your real need is PR review and better feedback quality.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '如果你还想从更宽的开发者工作流角度判断，再回这个页。',
          en: 'Return here if you want the broader developer-workflow view again.',
        },
      },
    ],
    toolSelectionNotes: {
      cursor: {
        bestFor: {
          cn: '已经习惯在编辑器里直接让 AI 参与编码、补全和局部重构的人。',
          en: 'People who already like having AI inside the editor for coding, completion, and local refactors.',
        },
        whyPickIt: {
          cn: '它最像“在写代码的地方直接用 AI”，能把补全、解释和修改连成一条线。',
          en: 'It feels closest to using AI exactly where you write code, tying completion, explanation, and changes together.',
        },
        watchOut: {
          cn: '如果你更想要的是更大范围的对话或研究式工作流，它不一定是最轻松的入口。',
          en: 'If you want broader conversational or research-style workflows, it may not be the lightest entry point.',
        },
      },
      claude: {
        bestFor: {
          cn: '更看重长上下文解释、方案比较和更完整代码讨论的人。',
          en: 'People who value long-context explanations, solution comparison, and fuller code discussion.',
        },
        whyPickIt: {
          cn: '它适合先把问题讲清楚，再把代码改动带进去一起推演。',
          en: 'It is useful when you want to clarify the problem first and then reason through the code changes together.',
        },
        watchOut: {
          cn: '如果你追求的是非常贴近编辑器的局部改动体验，可能还要再看别的工具。',
          en: 'If you want a very editor-native local edit experience, you may still want to compare other tools.',
        },
      },
      phind: {
        bestFor: {
          cn: '更偏技术搜索、排障和把问题一路追到修复建议的人。',
          en: 'People who lean toward technical search, debugging, and turning issues into fix suggestions.',
        },
        whyPickIt: {
          cn: '它更像“把问题解释清楚并给下一步”，适合卡在疑难点时继续推进。',
          en: 'It feels like a tool for explaining the issue and giving the next step, which helps when you are blocked.',
        },
        watchOut: {
          cn: '如果你想要的是完整的 editor-first 工作流，它可能更偏中间层而不是主入口。',
          en: 'If you want a full editor-first workflow, it may feel more like a middle layer than the main entry point.',
        },
      },
      chatgpt: {
        bestFor: {
          cn: '先把思路理顺、快速生成代码草案或解释改动的人。',
          en: 'People who want to shape the thinking first, quickly draft code, or explain a change.',
        },
        whyPickIt: {
          cn: '它是一个很通用的起点，适合把模糊需求先收敛成可执行步骤。',
          en: 'It is a versatile starting point that helps turn fuzzy requirements into executable steps.',
        },
        watchOut: {
          cn: '如果你已经明确要在编辑器里高频改代码，可能会更想要更贴近 IDE 的工具。',
          en: 'If you know you will be changing code frequently in the editor, you may prefer a more IDE-native tool.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你是想“在编辑器里改代码”，还是“先把思路和实现说清楚”。',
        '如果你经常在文件级别来回切换，重点看上下文保持和局部修改体验。',
        '真正的替代方案不是谁更会聊天，而是谁更能嵌进你的日常写代码流程。',
      ],
      en: [
        'Start by deciding whether you want to change code inside the editor or clarify the plan first.',
        'If you switch files a lot, focus on context retention and local edit flow.',
        'The real alternative is not which tool chats best, but which one fits your daily coding routine.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看编辑器工作流、上下文能力、代码补全/重构体验，以及它对真实开发节奏的帮助。',
          en: 'We compare editor workflow, context handling, completion/refactor experience, and usefulness in real development cadence.',
        },
      },
      {
        question: { cn: '为什么单独做 Cursor 替代方案？', en: 'Why a separate Cursor alternatives page?' },
        answer: {
          cn: '因为它的搜索意图更具体，用户往往已经在评估要不要从 Cursor 转到别的工作流。',
          en: 'Because the search intent is much more specific, and users are often already evaluating whether to move away from Cursor.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='cursor_alternatives_comparison' />
    </>
  );
}

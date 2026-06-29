import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Perplexity 替代方案对比' : 'Perplexity alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Perplexity 的 AI 工具，帮你更快判断资料发现、证据核对和研究工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Perplexity alternatives so you can choose the right fit for discovery, evidence-checking, and research workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '研究工具', en: 'Research tools' },
    comparisonLabel: { cn: 'Perplexity 替代方案对比', en: 'Perplexity alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Perplexity 这类研究型入口，这一页会把常见替代项放在一起看，帮助你判断是要更强的检索起点、证据核对能力，还是更偏论文/知识库的工作流。',
      en: 'If you are already comparing Perplexity-style research entry points, this page puts the common alternatives side by side so you can decide whether you need a stronger discovery starting point, better evidence-checking, or a more paper and knowledge-base oriented workflow.',
    },
    searchQuery: 'perplexity',
    guideHref: '/guides/ai-tools-for-research',
    rankingHref: '/best-ai-tools/ai-research-tools',
    rankingLabel: { cn: '转去研究榜单页', en: 'Open the research ranking' },
    backGuideLabel: { cn: '回到研究工具指南', en: 'Back to research guide' },
    altBrowseHref: '/explore?search=perplexity&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Perplexity 相关工具', en: 'Browse more Perplexity-related tools' },
    breadcrumbLabel: { cn: 'Perplexity 替代方案对比', en: 'Perplexity alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Perplexity 替代项的快速对照',
      en: 'A quick side-by-side look at common Perplexity alternatives',
    },
    compareSubtitle: { cn: 'Perplexity', en: 'Perplexity' },
    preferredToolNames: ['perplexity', 'consensus', 'scite', 'notebooklm'],
    decisionCards: [
      {
        title: { cn: '先看是发现资料还是核对证据', en: 'Discovery or evidence-checking' },
        description: {
          cn: 'Perplexity 常被用来快速打开资料范围；如果你的重点是证据核对，可能要再看更偏论文的工具。',
          en: 'Perplexity is often used to quickly open up a topic; if your main concern is evidence-checking, you may want a more paper-oriented tool.',
        },
      },
      {
        title: { cn: '再看是不是要长期研究工作流', en: 'Long-term research workflow' },
        description: {
          cn: '如果你会反复追问、整理来源、做复盘，导入、上下文和归档能力就很重要。',
          en: 'If you keep asking follow-up questions, organizing sources, and doing recap work, imports, context, and archiving matter a lot.',
        },
      },
      {
        title: { cn: '最后看是否适合团队使用', en: 'Team readiness' },
        description: {
          cn: '研究工具如果要进团队日常，协作、权限、导出和稳定性会比单次回答更关键。',
          en: 'If a research tool is going into team workflows, collaboration, permissions, exports, and stability matter more than a one-off answer.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要快速搜集和核对资料的人', en: 'People who need quick discovery and source checking' },
        description: {
          cn: '适合你要快速打开话题、比较来源、确认说法是否靠谱。',
          en: 'A strong fit when you need to open a topic fast, compare sources, and confirm whether a claim is trustworthy.',
        },
      },
      {
        title: { cn: '做研究和内容产出的人', en: 'People doing research and content production' },
        description: {
          cn: '如果你的工作需要把研究结论变成可用内容，这类页特别实用。',
          en: 'Useful when research needs to turn into usable content or a decision-ready summary.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想写作不想查证的人', en: 'People who only want writing without verification' },
        description: {
          cn: '如果你只是要快速生成文本，研究工具通常不是最直接的入口。',
          en: 'If you only want quick text generation, research tools are usually not the most direct fit.',
        },
      },
      {
        title: { cn: '完全不关心来源的人', en: 'People who do not care about sources' },
        description: {
          cn: '如果来源、引用和证据都不重要，研究型工具会显得偏重。',
          en: 'If sources, citations, and evidence do not matter, research tools will feel unnecessarily heavy.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具总对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你要把候选范围继续拉宽，这页更适合。',
          en: 'Use this when you want to broaden the shortlist further.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '如果你的研究已经收窄到链上、项目和市场情报，这条路更高意图。',
          en: 'A more specific path when the real research job is on-chain, projects, and market intelligence.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你下一步是把资料整理成内容，这页也值得继续看。',
          en: 'Move here when the next step is turning research into publishable content.',
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
          cn: '它很适合先把范围打开，让你更快知道该继续查什么。',
          en: 'It is excellent for opening the search space and figuring out what to investigate next.',
        },
        watchOut: {
          cn: '如果工作更偏正式证据和学术资料，你可能还会想继续看别的更专门工具。',
          en: 'If your work depends on formal evidence and academic material, you may still want more specialized tools.',
        },
      },
      consensus: {
        bestFor: {
          cn: '想围绕论文和研究结论做资料核对的人。',
          en: 'People who want to validate information around papers and research-backed conclusions.',
        },
        whyPickIt: {
          cn: '它更像在帮助你判断“研究里到底怎么说”，适合证据优先场景。',
          en: 'It helps answer what the research actually says, which makes it fit evidence-first use cases well.',
        },
        watchOut: {
          cn: '如果你主要是做广泛搜集和快速发散，它未必是最轻的入口。',
          en: 'If your main job is broad discovery and fast exploration, it may not be the lightest entry.',
        },
      },
      scite: {
        bestFor: {
          cn: '需要引用关系、研究证据和学术核对的人。',
          en: 'People who need citation relationships, evidence, and academic verification.',
        },
        whyPickIt: {
          cn: '它在证据与引用链路上更强，适合严谨研究。',
          en: 'It is stronger on evidence and citation relationships, which suits rigorous research.',
        },
        watchOut: {
          cn: '如果你只是要快速聊天式研究，它会显得更学术、更重。',
          en: 'If you only want a quick chat-style research experience, it can feel more academic and heavier.',
        },
      },
      notebooklm: {
        bestFor: {
          cn: '想把文档、资料和笔记放进一个可追问的工作台里的人。',
          en: 'People who want to put documents, sources, and notes into a queryable workbench.',
        },
        whyPickIt: {
          cn: '它更适合围绕你自己的资料做归纳和复盘。',
          en: 'It is better for summarizing and reviewing your own source material.',
        },
        watchOut: {
          cn: '如果你的核心需求是开放式资料发现，记得它更偏个人知识库。',
          en: 'If your main need is open-ended discovery, remember it behaves more like a personal knowledge base.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是资料发现、证据核对，还是论文/知识库式工作流。',
        '如果要团队用，协作、导出和稳定性会比“回答快不快”更关键。',
        '研究工具最好用真实任务测一轮，不要只看表面答案。',
      ],
      en: [
        'First separate discovery, evidence-checking, and paper or knowledge-base workflows.',
        'For team use, collaboration, exports, and stability matter more than raw speed.',
        'Research tools should be tested on real tasks, not just surface answers.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '为什么单独做 Perplexity 替代方案页？',
          en: 'Why make a separate Perplexity alternatives page?',
        },
        answer: {
          cn: '因为很多用户已经有非常明确的研究意图，这比泛泛的研究工具对比更接近转化。',
          en: 'Because many users already have a specific research intent, which is closer to conversion than a broad research comparison.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看资料发现、证据核对、引用、工作流贴合度和真实反馈。',
          en: 'We compare discovery, evidence-checking, citations, workflow fit, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='perplexity_alternatives_comparison' />
    </>
  );
}

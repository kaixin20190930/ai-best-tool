import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Notion 替代方案对比' : 'Notion alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Notion 的 AI 工具，帮你更快判断知识库、文档协作和个人/团队工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Notion alternatives so you can choose the right fit for knowledge bases, document collaboration, and personal or team workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '生产力工具', en: 'Productivity tools' },
    comparisonLabel: { cn: 'Notion 替代方案对比', en: 'Notion alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Notion 这类工作区工具，这一页会把常见替代项放在一起看，帮助你判断是要完整知识库、轻量文档，还是更偏 AI 协作的入口。',
      en: 'If you are already comparing Notion-style workspace tools, this page puts the common alternatives side by side so you can decide whether you need a full knowledge base, lighter docs, or a more AI-first collaboration entry.',
    },
    searchQuery: 'notion',
    guideHref: '/guides/ai-productivity-tools',
    rankingHref: '/best-ai-tools/ai-productivity-tools',
    rankingLabel: { cn: '转去生产力榜单页', en: 'Open the productivity ranking' },
    backGuideLabel: { cn: '回到生产力指南', en: 'Back to productivity guide' },
    altBrowseHref: '/explore?search=productivity&sort=popular',
    altBrowseLabel: { cn: '浏览更多生产力工具', en: 'Browse more productivity tools' },
    breadcrumbLabel: { cn: 'Notion 替代方案对比', en: 'Notion alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Notion 替代项的快速对照',
      en: 'A quick side-by-side look at common Notion alternatives',
    },
    compareSubtitle: { cn: 'Notion', en: 'Notion' },
    preferredToolNames: ['notion', 'anthropic', 'chatgpt-mac', 'gemini'],
    decisionCards: [
      {
        title: { cn: '先看知识库还是轻量文档', en: 'Knowledge base or lightweight docs' },
        description: {
          cn: 'Notion 的核心价值常常是工作区和知识库；如果你只要写文档，替代项可能更轻。',
          en: 'Notion’s core value is often its workspace and knowledge base; if you only need docs, a lighter alternative may fit better.',
        },
      },
      {
        title: { cn: '再看团队协作深度', en: 'How deep is the team collaboration' },
        description: {
          cn: '如果多人要一起编辑、归档、复用和追踪内容，协作和权限会决定最终体验。',
          en: 'If multiple people need to edit, archive, reuse, and track content together, collaboration and permissions decide the final experience.',
        },
      },
      {
        title: { cn: '最后看 AI 是辅助还是主角', en: 'Is AI the helper or the main feature' },
        description: {
          cn: '有些工具只是帮你更快写和整理；有些工具则会把 AI 协作本身放在更核心的位置。',
          en: 'Some tools only help you write and organize faster, while others put AI collaboration at the center.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做知识管理的人', en: 'Knowledge management users' },
        description: {
          cn: '适合你要长期存、找、改、复用大量内容。',
          en: 'Best if you need to store, find, revise, and reuse a lot of content over time.',
        },
      },
      {
        title: { cn: '团队文档协作的人', en: 'Teams collaborating on docs' },
        description: {
          cn: '如果你的文档会在团队里不断迭代，这页会更有帮助。',
          en: 'Useful when your docs are constantly iterated on by a team.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想快速记几句的人', en: 'People only jotting down a few notes' },
        description: {
          cn: '如果你只需要临时记录几句话，完整的工作区工具会显得过重。',
          en: 'If you only need to capture a few temporary notes, a full workspace tool will feel heavy.',
        },
      },
      {
        title: { cn: '还没想清楚记录方式的人', en: 'People still undecided on capture style' },
        description: {
          cn: '如果你还不知道自己更偏任务、笔记、文档还是知识库，先回生产力或记笔记指南。',
          en: 'If you are not sure whether you need tasks, notes, docs, or a knowledge base, start from the productivity or note-taking guide first.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-productivity-tools-comparison',
        title: { cn: '转去生产力工具总对比', en: 'Go to productivity tools comparison' },
        description: {
          cn: '如果你想把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note-taking tools comparison' },
        description: {
          cn: '如果你的重点其实是会议、记录和回看笔记，这条路径更贴近。',
          en: 'Switch here if meetings, capture, and note retrieval are the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes',
        title: { cn: '转去会议助手指南', en: 'Go to meeting notes guide' },
        description: {
          cn: '如果你要把知识整理和会议记录连起来看，这页更顺。',
          en: 'Move here if you want to connect knowledge organization with meeting capture.',
        },
      },
    ],
    toolSelectionNotes: {
      notion: {
        bestFor: {
          cn: '需要工作区、知识库和文档协作放在一起的人。',
          en: 'People who want a workspace, knowledge base, and doc collaboration in one place.',
        },
        whyPickIt: {
          cn: '它的强项是把内容、数据库和协作组织到统一工作区里。',
          en: 'Its strength is organizing content, databases, and collaboration into a single workspace.',
        },
        watchOut: {
          cn: '如果你只想要轻量记笔记或快速 AI 助手，它可能会显得偏重。',
          en: 'If you only want lightweight note taking or a quick AI assistant, it may feel heavy.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想把写作、整理和 AI 讨论放进更轻桌面入口的人。',
          en: 'People who want writing, organization, and AI discussion in a lighter desktop entry point.',
        },
        whyPickIt: {
          cn: '它更像一个通用助手入口，适合处理零散任务和快速整理。',
          en: 'It feels like a general assistant entry point that works well for scattered tasks and quick organization.',
        },
        watchOut: {
          cn: '如果你需要完整知识库结构和团队协作，Notion 这类工作区会更强。',
          en: 'If you need a full knowledge-base structure and team collaboration, a Notion-style workspace is stronger.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '更看重长文本、分析和内容处理的人。',
          en: 'People who care more about long text, analysis, and content handling.',
        },
        whyPickIt: {
          cn: '它能帮你把复杂内容讲清楚，适合做文档整理的思考层。',
          en: 'It helps make complex content clearer and works well as the reasoning layer for docs.',
        },
        watchOut: {
          cn: '如果你需要真正的工作区组织，而不是文本处理，单靠它还不够。',
          en: 'If you need real workspace organization rather than text processing, it is not enough by itself.',
        },
      },
      gemini: {
        bestFor: {
          cn: '已经在 Google 生态里做文档和协作的人。',
          en: 'People already doing docs and collaboration in Google’s ecosystem.',
        },
        whyPickIt: {
          cn: '它更像把 AI 融进现有文档工作流，而不是替你重建整个工作区。',
          en: 'It feels like AI woven into an existing document workflow rather than a complete workspace rebuild.',
        },
        watchOut: {
          cn: '如果你要的是完整知识库和结构化协作，不要只看表层体验。',
          en: 'If you want a full knowledge base and structured collaboration, do not judge only by surface feel.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你要的是工作区、文档，还是简单笔记。',
        '如果多人协作很重要，权限和复用结构要放前面看。',
        'AI 是帮你写和整理，还是帮你构建工作区，这个差别很大。',
      ],
      en: [
        'First decide whether you need a workspace, docs, or just simple notes.',
        'If team collaboration matters, prioritize permissions and reusable structure.',
        'There is a big difference between AI helping you write and organize versus helping you build the workspace itself.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Notion 替代方案页？', en: 'Why make a separate Notion alternatives page?' },
        answer: {
          cn: '因为 Notion 的决策通常是工作区和知识管理的选择，不只是一个写作工具。',
          en: 'Because the Notion decision is usually about the workspace and knowledge-management stack, not just a writing tool.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看知识库组织、文档协作、AI 辅助、更新情况、价格和真实反馈。',
          en: 'We compare knowledge-base organization, document collaboration, AI assistance, freshness, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='notion_alternatives_comparison' />
    </>
  );
}

import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Grammarly 替代方案对比' : 'Grammarly alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Grammarly 的 AI 工具，帮你更快判断改写、润色和日常写作该怎么选。'
      : 'Compare AI tools that are commonly used as Grammarly alternatives so you can choose the right fit for rewriting, polishing, and everyday writing.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '写作工具', en: 'Writing tools' },
    comparisonLabel: { cn: 'Grammarly 替代方案对比', en: 'Grammarly alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Grammarly 这类改写和润色入口，这一页会把常见替代项放在一起看，帮助你判断是要语法校正、品牌语气，还是更完整的写作工作流。',
      en: 'If you are already comparing Grammarly-style rewriting and polishing entry points, this page puts the common alternatives side by side so you can decide whether you need grammar correction, brand tone control, or a more complete writing workflow.',
    },
    searchQuery: 'grammarly',
    guideHref: '/guides/ai-writing-tools',
    rankingHref: '/best-ai-tools/ai-writing-tools',
    rankingLabel: { cn: '转去写作榜单页', en: 'Open the writing ranking' },
    backGuideLabel: { cn: '回到写作指南', en: 'Back to writing guide' },
    altBrowseHref: '/explore?search=grammarly&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Grammarly 相关工具', en: 'Browse more Grammarly-related tools' },
    breadcrumbLabel: { cn: 'Grammarly 替代方案对比', en: 'Grammarly alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Grammarly 替代项的快速对照',
      en: 'A quick side-by-side look at common Grammarly alternatives',
    },
    compareSubtitle: { cn: 'Grammarly', en: 'Grammarly' },
    preferredToolNames: ['grammarly', 'frase', 'rytr', 'sudowrite'],
    decisionCards: [
      {
        title: { cn: '先看是语法修正还是内容改写', en: 'Grammar fix or content rewrite' },
        description: {
          cn: 'Grammarly 的核心通常是校对和润色；如果你要的是内容结构或长文起稿，别的工具可能更合适。',
          en: 'Grammarly is usually about correction and polish; if you need structure or long-form drafting, another tool may fit better.',
        },
      },
      {
        title: { cn: '再看品牌语气和日常写作', en: 'Brand tone and everyday writing' },
        description: {
          cn: '如果你希望写出来的内容更统一、更像你自己，语气控制会非常关键。',
          en: 'If you want consistent output that sounds like you, tone control becomes crucial.',
        },
      },
      {
        title: { cn: '最后看是否适合长期装进工作流', en: 'Workflow fit' },
        description: {
          cn: '真正能留下来的工具，不只是改得对，而是能稳定嵌入每天的写作流程。',
          en: 'The tools that stick are not just the ones that are correct; they are the ones that fit your daily writing flow.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要持续润色英文内容的人', en: 'People constantly polishing English writing' },
        description: {
          cn: '适合邮件、文档、公告和日常内容里反复做语法和语气修正的人。',
          en: 'A good fit for people who repeatedly clean up grammar and tone in emails, docs, announcements, and everyday content.',
        },
      },
      {
        title: { cn: '想减少写作返工的人', en: 'People who want less rewriting churn' },
        description: {
          cn: '如果你最烦的是“写完还要再改很多轮”，这类页会很有帮助。',
          en: 'These pages help most when the pain point is having to rewrite the same thing multiple times.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想做长文规划的人', en: 'People who only want long-form planning' },
        description: {
          cn: '如果你主要在写博客、SEO 或长文章，写作工具总页可能比 Grammarly 替代页更合适。',
          en: 'If you mainly write blogs, SEO content, or long articles, the broader writing tools page may be a better start.',
        },
      },
      {
        title: { cn: '只要创意发散的人', en: 'People who only want ideation' },
        description: {
          cn: '如果你更看重发散和风格探索，创意写作工具会更贴近。',
          en: 'If ideation and style exploration matter more, creative writing tools are a closer match.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具总对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want to broaden the shortlist further.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你的任务其实已经变成找资料和核对事实，可以转到研究页。',
          en: 'Move here if your real job has shifted toward sourcing and fact-checking.',
        },
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 工具对比', en: 'Go to SEO tools comparison' },
        description: {
          cn: '如果你写的是搜索流量内容，SEO 页更贴近。',
          en: 'A better fit when the writing task is really about search-driven content.',
        },
      },
    ],
    toolSelectionNotes: {
      grammarly: {
        bestFor: {
          cn: '更重视改写、润色、语法一致性和日常写作质量的人。',
          en: 'People who care most about rewriting, polish, grammar consistency, and everyday writing quality.',
        },
        whyPickIt: {
          cn: '它更像稳定的编辑层助手，适合每天都要用到。',
          en: 'It behaves more like a dependable editing-layer assistant for day-to-day use.',
        },
        watchOut: {
          cn: '如果你期待它承担重度长文规划或 SEO 研究，它通常不是最强入口。',
          en: 'It is usually not the strongest entry point for heavy long-form planning or SEO research.',
        },
      },
      frase: {
        bestFor: {
          cn: '既要内容起稿，又要兼顾搜索意图和主题调研的人。',
          en: 'People who need drafting plus search intent and topic research in the same workflow.',
        },
        whyPickIt: {
          cn: '它把写作和 SEO 连得更紧，适合内容增长型工作流。',
          en: 'It connects writing and SEO more tightly, which suits growth-oriented content workflows.',
        },
        watchOut: {
          cn: '如果你只是要轻量润色，它可能比需求更完整。',
          en: 'It may be more complete than necessary if you only need light polishing.',
        },
      },
      rytr: {
        bestFor: {
          cn: '想快速起稿、用模板覆盖多种短内容任务的人。',
          en: 'People who want quick drafts and template-driven coverage for many short-form tasks.',
        },
        whyPickIt: {
          cn: '上手快、切换轻，适合先把内容跑起来。',
          en: 'It is quick to learn and easy to switch across tasks, which helps get content moving.',
        },
        watchOut: {
          cn: '如果你要求更强的品牌语气控制或更深的长文稳定性，仍然值得继续比较。',
          en: 'You may still want to compare further if brand voice control or long-form stability matters a lot.',
        },
      },
      sudowrite: {
        bestFor: {
          cn: '更偏创意写作、叙事发散和风格探索的人。',
          en: 'People leaning toward creative writing, narrative ideation, and style exploration.',
        },
        whyPickIt: {
          cn: '它的价值更在发散和续写，而不是标准化内容生产。',
          en: 'Its strength is expansion and continuation rather than standardized content production.',
        },
        watchOut: {
          cn: '如果你要的是稳定润色而不是创意发散，它不一定是最直接的选择。',
          en: 'If you want steady polishing rather than creative ideation, it may not be the most direct choice.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是语法校对、润色，还是内容重写。',
        '如果你长期写邮件、公告和文档，稳定的编辑层会很值。',
        '如果你更在意 SEO 或长内容规划，先看总对比页再细分。',
      ],
      en: [
        'First separate grammar correction, polishing, and content rewriting.',
        'If you write emails, announcements, and docs often, a stable editing layer is valuable.',
        'If SEO or long-form planning matters more, start from the broader comparison page.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Grammarly 替代方案页？', en: 'Why make a separate Grammarly alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找改写和润色工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for rewriting and polishing tools, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看改写、语法、语气控制、长文稳定性和真实反馈。',
          en: 'We compare rewriting, grammar, tone control, long-form stability, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='grammarly_alternatives_comparison' />
    </>
  );
}

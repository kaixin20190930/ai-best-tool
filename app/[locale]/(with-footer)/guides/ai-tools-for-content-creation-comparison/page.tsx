import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 内容创作工具对比' : 'AI content creation tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 内容创作工具，帮你更快判断脚本、封面、改写和发布节奏该怎么选。'
      : 'Compare common AI content creation tools to choose the right fit for scripts, thumbnails, rewriting, and publishing cadence.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '内容创作工具', en: 'Content creation tools' },
    comparisonLabel: { cn: 'AI 内容创作工具对比', en: 'AI content creation tools comparison' },
    description: {
      cn: '如果你已经知道自己在做脚本、封面、改写、批量内容或多渠道发布，这一页会把常见候选放在一起看，帮助你快速缩小范围。',
      en: 'If you already know the work is scripts, thumbnails, rewriting, batch content, or multi-channel publishing, this page helps you compare common options side by side and narrow the shortlist quickly.',
    },
    searchQuery: 'content',
    guideHref: '/guides/ai-tools-for-content-creation',
    rankingHref: '/best-ai-tools/ai-content-creation-tools',
    rankingLabel: { cn: '转去内容创作榜单页', en: 'Open the content creation ranking' },
    backGuideLabel: { cn: '回到内容创作指南', en: 'Back to content creation guide' },
    altBrowseHref: '/explore?search=content&sort=popular',
    altBrowseLabel: { cn: '浏览更多内容创作工具', en: 'Browse more content creation tools' },
    breadcrumbLabel: { cn: '内容创作工具对比', en: 'Content creation tools comparison' },
    compareTitle: {
      cn: '几款常见内容创作工具的快速对照',
      en: 'A quick side-by-side look at common content creation tools',
    },
    compareSubtitle: { cn: '内容创作', en: 'Content creation' },
    preferredToolNames: ['jasper', 'copy-ai', 'chatgpt', 'canva'],
    decisionCards: [
      {
        title: { cn: '做脚本与起稿', en: 'Scripts and first drafts' },
        description: {
          cn: '先看它能不能把想法快速变成可以改的初稿，而不是只会生成漂亮的句子。',
          en: 'Check whether it can turn ideas into editable first drafts quickly instead of only generating polished sentences.',
        },
      },
      {
        title: { cn: '做封面和再包装', en: 'Thumbnails and repurposing' },
        description: {
          cn: '如果你的内容会跨平台复用，模板、尺寸和批量能力就会更重要。',
          en: 'If content is reused across platforms, templates, dimensions, and batch support matter more.',
        },
      },
      {
        title: { cn: '做持续发布', en: 'Ongoing publishing' },
        description: {
          cn: '持续发布最怕流程断掉，所以导出、协作和品牌一致性很关键。',
          en: 'Consistency depends on the workflow not breaking, so exports, collaboration, and brand consistency matter a lot.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '起稿速度', en: 'Drafting speed' },
        description: {
          cn: '第一版能不能快速出来，直接决定你有没有继续改下去的动力。',
          en: 'How fast a usable first draft appears often decides whether the workflow keeps moving.',
        },
      },
      {
        title: { cn: '批量与模板', en: 'Batch and templates' },
        description: {
          cn: '如果你一次要产出多个版本或多个渠道，批量能力会明显影响效率。',
          en: 'When you need multiple variants or channels at once, batch support changes the economics of the workflow.',
        },
      },
      {
        title: { cn: '品牌一致性', en: 'Brand consistency' },
        description: {
          cn: '语气、用词和格式统一，往往比单次写得好更重要。',
          en: 'Tone, wording, and format consistency often matter more than one especially clever draft.',
        },
      },
      {
        title: { cn: '导出与协作', en: 'Export and collaboration' },
        description: {
          cn: '如果要交给团队或接进发布流程，导出和协作会迅速变成硬需求。',
          en: 'If the workflow needs to move into a team or publishing process, export and collaboration become hard requirements.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要持续出内容的人', en: 'People publishing continuously' },
        description: {
          cn: '适合博客、社媒、邮件、落地页和多渠道内容运营。',
          en: 'A good fit for blogs, social posts, email, landing pages, and multi-channel content ops.',
        },
      },
      {
        title: { cn: '要把内容做成流程的人', en: 'People turning content into a workflow' },
        description: {
          cn: '如果你不是偶尔写一段，而是要稳定产出，这页会更贴近。',
          en: 'Better when content production is a repeatable workflow rather than an occasional task.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想随便聊聊的人', en: 'People who just want casual chat' },
        description: {
          cn: '如果重点只是问答，对比内容创作工具通常太重。',
          en: 'If the goal is mostly Q&A, content creation comparisons will usually feel too heavy.',
        },
      },
      {
        title: { cn: '只需要一次性润色的人', en: 'People needing one-off cleanup only' },
        description: {
          cn: '如果只是偶尔润一段文字，轻量写作工具可能够了。',
          en: 'If you only need occasional cleanup, lighter writing tools may already be enough.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-creators-comparison',
        title: { cn: '转去创作者工具对比', en: 'Go to creator tools comparison' },
        description: {
          cn: '如果你想把内容创作和多渠道发布一起看，这页更大一点。',
          en: 'A broader fit when you want content creation and multi-channel publishing together.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你更关心的是写作、改写和内容执行，这页更直接。',
          en: 'Move there if writing, rewriting, and execution are the real decision points.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果你的内容工作流里视频占比更高，这页更合适。',
          en: 'A better next stop if video is a larger part of your content workflow.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你要做的是脚本、封面、改写还是批量发布。',
        '再看模板、品牌一致性和导出能力。',
        '如果你要长期使用，协作和批量能力通常比单次效果更重要。',
      ],
      en: [
        'Start by separating scripts, thumbnails, rewriting, and batch publishing.',
        'Then check templates, brand consistency, and export support.',
        'For long-term use, collaboration and batch capabilities usually matter more than a single impressive result.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '内容创作工具和写作工具有什么不同？',
          en: 'How are content creation and writing tools different?',
        },
        answer: {
          cn: '内容创作更强调脚本、封面、批量和多渠道发布；写作工具更强调起稿、改写和文案质量。',
          en: 'Content creation is more about scripts, thumbnails, batch work, and publishing across channels; writing tools focus more on drafting, rewriting, and copy quality.',
        },
      },
      {
        question: { cn: '为什么这页更适合创作者？', en: 'Why is this page creator-friendly?' },
        answer: {
          cn: '因为创作者通常需要把一个想法变成一整套内容资产，而不是只生成一段文本。',
          en: 'Because creators usually need to turn one idea into a whole set of assets, not just a paragraph of text.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_content_creation_comparison' />
    </>
  );
}

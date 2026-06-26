import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 创作者工具对比' : 'AI tools for creators comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的创作者 AI 工具，帮你更快判断内容产出、再包装和发布节奏能力。'
      : 'Compare common creator AI tools to judge content production, repurposing, and publishing workflow fit faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '创作者工具', en: 'Creator tools' },
    comparisonLabel: { cn: 'AI 创作者工具对比', en: 'AI tools for creators comparison' },
    description: {
      cn: '如果你已经知道自己是在做内容创作、再包装或多渠道发布，这一页会帮你把常见候选放在一起看，减少反复试错。',
      en: 'If you already know the work is content creation, repurposing, or multi-channel publishing, this page helps you compare common options side by side and reduce trial-and-error.',
    },
    searchQuery: 'creator',
    guideHref: '/guides/ai-tools-for-creators',
    backGuideLabel: { cn: '回到创作者指南', en: 'Back to creator guide' },
    altBrowseHref: '/explore?search=creator&sort=popular',
    altBrowseLabel: { cn: '浏览更多创作者工具', en: 'Browse more creator tools' },
    breadcrumbLabel: { cn: '创作者工具对比', en: 'Creator tools comparison' },
    compareTitle: { cn: '几款常见创作者工具的快速对照', en: 'A quick side-by-side look at common creator tools' },
    compareSubtitle: { cn: '创作者', en: 'Creator' },
    tips: {
      cn: [
        '先看你的内容类型：短视频、长文、播客、社媒或图文。',
        '优先比较脚本、封面、剪辑和再包装能省下多少时间。',
        '如果持续发布，模板、批量和导出限制通常很关键。',
      ],
      en: [
        'Start with your content type: short video, long-form writing, podcast, social, or graphics.',
        'Prioritize how much time it saves on scripting, thumbnails, editing, and repurposing.',
        'If you publish regularly, templates, batch workflows, and export limits matter a lot.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要比较内容工作流覆盖、再包装效率、批量能力、导出与实际使用感。',
          en: 'We mainly compare workflow coverage, repurposing speed, batch capability, export support, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么单独看创作者工具？', en: 'Why compare creator tools separately?' },
        answer: {
          cn: '因为创作者更关心持续产出、内容节奏和多渠道复用，这和普通办公或写作工具并不完全一样。',
          en: 'Because creators care more about publishing cadence, repurposing, and multi-channel output than a normal office or writing workflow.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_creators_comparison' />
    </>
  );
}

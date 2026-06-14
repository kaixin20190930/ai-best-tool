import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 会议纪要工具对比' : 'AI tools for meeting notes comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的会议纪要 AI 工具，帮你更快选出适合转写和整理的一个。'
      : 'Compare common meeting notes AI tools to choose the one that fits your transcription and cleanup workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '会议纪要工具', en: 'Meeting notes tools' },
    comparisonLabel: { cn: 'AI 会议纪要工具对比', en: 'AI tools for meeting notes comparison' },
    description: {
      cn: '如果你已经知道自己要做会议记录、纪要整理或行动项提取，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need meeting transcription, note cleanup, or action-item extraction, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'meeting',
    guideHref: '/guides/ai-tools-for-meeting-notes',
    backGuideLabel: { cn: '回到会议指南', en: 'Back to meeting guide' },
    altBrowseHref: '/explore?search=meeting&sort=popular',
    altBrowseLabel: { cn: '浏览更多会议纪要工具', en: 'Browse more meeting notes tools' },
    breadcrumbLabel: { cn: '会议纪要工具对比', en: 'Meeting notes tools comparison' },
    compareTitle: {
      cn: '几款常见会议纪要工具的快速对照',
      en: 'A quick side-by-side look at common meeting notes tools',
    },
    compareSubtitle: { cn: 'Meeting notes', en: 'Meeting notes' },
    comparisonDimensions: [
      {
        title: { cn: '转写准确度', en: 'Transcription accuracy' },
        description: {
          cn: '先看能不能稳定听清多人发言、口音和噪音环境下的内容。',
          en: 'Check whether the tool can reliably handle multiple speakers, accents, and noisy environments.',
        },
      },
      {
        title: { cn: '纪要整理速度', en: 'Cleanup speed' },
        description: {
          cn: '真正省时间的，不只是转写，而是能不能快速整理出可发给团队的纪要。',
          en: 'The real time saver is not just transcription, but whether it can quickly turn notes into something shareable.',
        },
      },
      {
        title: { cn: '行动项提取', en: 'Action item extraction' },
        description: {
          cn: '如果你要把会议转成执行结果，行动项、负责人和截止时间就非常关键。',
          en: 'If meetings need to turn into execution, action items, owners, and due dates become critical.',
        },
      },
      {
        title: { cn: '团队协作与导出', en: 'Collaboration and exports' },
        description: {
          cn: '多人一起用的时候，分享、权限、搜索和导出往往决定能不能长期用。',
          en: 'For team use, sharing, permissions, search, and exports often determine whether the tool sticks.',
        },
      },
    ],
    tips: {
      cn: [
        '先看支持的会议平台和录音格式，再看转写准确度。',
        '如果你要团队使用，关注导出、协作、权限和历史记录。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with supported meeting platforms and audio formats, then check transcription quality.',
        'For team use, look at exports, collaboration, permissions, and history.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。',
          en: 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看会议纪要工具？', en: 'Why only meeting notes tools?' },
        answer: {
          cn: '因为会议记录是最容易形成明确对比意图的场景之一，对比也更直接。',
          en: 'Because meeting notes are one of the clearest compare-intent scenarios, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}

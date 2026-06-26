import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 学生工具对比' : 'AI tools for students comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 学生工具，帮你更快选出适合的一个。'
      : 'Compare common AI student tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '学生工具', en: 'Student tools' },
    comparisonLabel: { cn: 'AI 学生工具对比', en: 'AI tools for students comparison' },
    description: {
      cn: '如果你已经知道自己是在做学习、作业或笔记整理，这一页会帮你把几款常见的学生工具放在一起看，减少反复试错。',
      en: 'If you already know you need student tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'student',
    guideHref: '/guides/ai-tools-for-students',
    rankingHref: '/best-ai-tools/ai-student-tools',
    rankingLabel: { cn: '转去学生榜单页', en: 'Open the student ranking' },
    backGuideLabel: { cn: '回到学生指南', en: 'Back to student guide' },
    altBrowseHref: '/explore?search=student&sort=popular',
    altBrowseLabel: { cn: '浏览更多学生工具', en: 'Browse more student tools' },
    breadcrumbLabel: { cn: '学生工具对比', en: 'Student tools comparison' },
    compareTitle: { cn: '几款常见学生工具的快速对照', en: 'A quick side-by-side look at common student tools' },
    compareSubtitle: { cn: '学生', en: 'students' },
    tips: {
      cn: [
        '先看你是做学习总结、作业辅助、笔记整理还是论文写作，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: summaries, homework help, note organization, or paper writing all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
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
        question: { cn: '为什么只看学生工具？', en: 'Why only student tools?' },
        answer: {
          cn: '因为学生工具通常有很明确的学习、作业和总结需求，对比意图也更清晰。',
          en: 'Because student tools usually map to clear study, homework, and summary needs, which makes compare intent very clear.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_students_comparison' />
    </>
  );
}

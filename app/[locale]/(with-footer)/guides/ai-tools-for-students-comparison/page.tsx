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
    comparisonLabel: { cn: 'AI 学生工具对比', en: 'AI tools for students comparison' },
    breadcrumbLabel: { cn: '学生工具对比', en: 'Student tools comparison' },
    guideHref: '/guides/ai-tools-for-students',
    content: { kind: 'unavailable', guideLabel: { cn: '回到学生指南', en: 'Back to student guide' } },
  });

  return ComparisonPage({ ...data, locale });
}

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import UnavailableComparisonPage from '@/components/guides/UnavailableComparisonPage';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 编程工具对比 | AI Best Tool'
        : `AI coding tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 编程工具，帮你更快选出适合的一个。'
        : 'Compare common AI coding tools to choose the one that fits you best.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = BASE_URL;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '编程工具对比' : 'Coding tools comparison',
      url: `${siteUrl}/${locale}/guides/ai-coding-tools-comparison`,
    },
  ]);
  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <UnavailableComparisonPage
        locale={locale}
        title={{ cn: 'AI 编程工具对比', en: 'AI coding tools comparison' }}
        guideHref='/guides/ai-coding-tools'
        guideLabel={{ cn: '查看任务指南', en: 'Read the task guide' }}
      />
    </>
  );
}

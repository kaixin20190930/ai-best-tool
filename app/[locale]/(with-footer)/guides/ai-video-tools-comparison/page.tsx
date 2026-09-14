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
        ? 'AI 视频工具对比 | AI Best Tool'
        : `AI video tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 视频工具，帮你更快选出适合的一个。'
        : 'Compare common AI video tools to choose the one that fits you best.',
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
      name: isChinese ? '视频工具对比' : 'Video tools comparison',
      url: `${siteUrl}/${locale}/guides/ai-video-tools-comparison`,
    },
  ]);
  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <UnavailableComparisonPage
        locale={locale}
        title={{ cn: 'AI 视频工具对比', en: 'AI video tools comparison' }}
        guideHref='/guides/ai-video-tools'
        guideLabel={{ cn: '查看任务指南', en: 'Read the task guide' }}
      />
    </>
  );
}

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Jasper 替代方案对比' : 'Jasper alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Jasper 的 AI 工具，帮你更快判断品牌文案、活动素材和营销写作该怎么选。'
      : 'Compare AI tools that are commonly used as Jasper alternatives so you can choose the right fit for brand copy, campaign assets, and marketing writing.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Jasper 替代方案对比', en: 'Jasper alternatives comparison' },
    breadcrumbLabel: { cn: 'Jasper 替代方案对比', en: 'Jasper alternatives comparison' },
    guideHref: '/guides/ai-tools-for-marketing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}

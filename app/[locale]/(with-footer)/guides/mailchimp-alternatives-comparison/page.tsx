import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Mailchimp 替代方案对比' : 'Mailchimp alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Mailchimp 的 AI 工具，帮你更快判断邮件营销、自动化和受众管理该怎么选。'
      : 'Compare AI tools that are commonly used as Mailchimp alternatives so you can choose the right fit for email marketing, automation, and audience management.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Mailchimp 替代方案对比', en: 'Mailchimp alternatives comparison' },
    breadcrumbLabel: { cn: 'Mailchimp 替代方案对比', en: 'Mailchimp alternatives comparison' },
    guideHref: '/guides/ai-tools-for-marketing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}

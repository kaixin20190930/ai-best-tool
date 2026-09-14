import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw'
      ? 'Salesforce Einstein 替代方案对比'
      : 'Salesforce Einstein alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '先明确 Salesforce Einstein 的具体服务，再比较 CRM、销售数据和自动化工作流；本页候选不是经验证的等价替代品。'
      : 'Identify the specific Salesforce Einstein service before comparing CRM, sales data and automation workflows. Candidates are not verified interchangeable replacements.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: {
      cn: 'Salesforce Einstein 替代方案对比',
      en: 'Salesforce Einstein alternatives comparison',
    },
    breadcrumbLabel: { cn: 'Salesforce Einstein 替代方案对比', en: 'Salesforce Einstein alternatives comparison' },
    guideHref: '/guides/ai-tools-for-sales',
    content: { kind: 'unavailable', guideLabel: { cn: '回到销售指南', en: 'Back to sales guide' } },
  });

  return ComparisonPage({ ...data, locale });
}

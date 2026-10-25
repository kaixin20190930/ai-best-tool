import type { Metadata } from 'next';

import { automationDecisionComparison } from '@/lib/content/automationDecisionComparison';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'n8n vs Make vs Lindy：自动化工具选择' : 'n8n vs Make vs Lindy: automation comparison',
    locale === 'cn' || locale === 'tw'
      ? '按部署方式、AI 工作模型、credits 与 execution 成本、人审和限制，对比 n8n、Make 与 Lindy。'
      : 'Compare n8n, Make, and Lindy by deployment, AI work model, credits and executions, human review, and limits.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-automation-comparison', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'n8n vs Make vs Lindy', en: 'n8n vs Make vs Lindy' },
    breadcrumbLabel: { cn: 'n8n vs Make vs Lindy', en: 'n8n vs Make vs Lindy' },
    guideHref: '/guides/ai-tools-for-automation',
    content: { kind: 'verified', comparison: automationDecisionComparison, faqs: [
      { question: { cn: 'n8n、Make 和 Lindy 哪个更便宜？', en: 'Which of n8n, Make, and Lindy costs less?' }, answer: { cn: '无法直接用标价判断。n8n Cloud 按完整执行、Make 按 credits、Lindy 按共享 credits；先用同一个任务试算触发频率、AI 调用、失败重试和人工审核。', en: 'List prices are not directly comparable. n8n Cloud counts executions, Make credits, and Lindy pooled credits. Pilot one task including triggers, AI calls, retries, and review time.' } },
      { question: { cn: '哪款适合自己托管？', en: 'Which can I self-host?' }, answer: { cn: 'n8n 有自托管 Community 与付费版本。自托管需要团队负责升级、备份与监控；商业嵌入用途先检查许可。', en: 'n8n has self-hosted Community and paid editions. Your team owns upgrades, backups, and monitoring; check the license before commercial embedding.' } },
    ] },
  });

  return ComparisonPage({ ...data, locale });
}

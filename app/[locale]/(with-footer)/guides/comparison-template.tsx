import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import {
  validateVerifiedComparison,
  type BilingualCopy,
  type VerifiedComparison,
} from '@/lib/content/verifiedComparison';
import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '@/lib/seo/schema';
import { getToolByNameCached } from '@/lib/services/tools';
import UnavailableComparisonPage from '@/components/guides/UnavailableComparisonPage';
import VerifiedComparisonPage from '@/components/guides/VerifiedComparisonPage';
import { StructuredDataServer } from '@/components/seo/StructuredData';

// Every caller must explicitly choose sourced comparison or unavailable content.
// Retired fields are intentionally absent: TypeScript rejects the old contract.
export type ComparisonConfig = {
  comparisonLabel: BilingualCopy;
  breadcrumbLabel: BilingualCopy;
  guideHref: string;
  content:
    | { kind: 'verified'; comparison: VerifiedComparison; faqs: { question: BilingualCopy; answer: BilingualCopy }[] }
    | { kind: 'unavailable'; guideLabel: BilingualCopy };
};

export async function buildComparisonMetadata(locale: string, title: string, description: string): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw' ? `${title} | AI Best Tool` : `${title} | ${t('title')}`,
    description,
    ...getNoindexMetadata(),
  };
}

export async function buildComparisonPageData(locale: string, config: ComparisonConfig) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = BASE_URL;
  const comparisonPath = config.guideHref.endsWith('-comparison') ? config.guideHref : `${config.guideHref}-comparison`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? config.breadcrumbLabel.cn : config.breadcrumbLabel.en,
      url: `${siteUrl}/${locale}${comparisonPath}`,
    },
  ]);
  // Unavailable pages never query search/popularity or emit unsupported optional schemas.
  if (config.content.kind === 'unavailable')
    return { config, breadcrumbSchema, tools: [], faqSchema: null, itemListSchema: null };
  const { comparison, faqs } = config.content;
  const requestedTools = await Promise.all(
    comparison.candidates.map((candidate) => getToolByNameCached(candidate.slug).catch(() => null)),
  );
  const tools = requestedTools.flatMap((tool) =>
    tool?.status === 'published'
      ? [{ name: tool.name, title: tool.title[isChinese ? 'zh' : 'en'] || tool.title.en || tool.name }]
      : [],
  );
  const valid = validateVerifiedComparison(
    comparison,
    tools.map((tool) => tool.name),
  );
  return {
    config,
    breadcrumbSchema,
    tools,
    faqSchema: valid
      ? generateFAQSchema(
          faqs.map((faq) => ({
            question: faq.question[isChinese ? 'cn' : 'en'],
            answer: faq.answer[isChinese ? 'cn' : 'en'],
          })),
        )
      : null,
    itemListSchema: valid
      ? generateItemListSchema(
          tools.map((tool) => ({ name: tool.title, url: `${siteUrl}/${locale}/ai/${tool.name}` })),
          `${config.comparisonLabel[isChinese ? 'cn' : 'en']} comparison`,
        )
      : null,
  };
}

export function ComparisonPage({
  config,
  breadcrumbSchema,
  tools,
  faqSchema,
  itemListSchema,
  locale,
}: Awaited<ReturnType<typeof buildComparisonPageData>> & { locale: string }) {
  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      {faqSchema ? <StructuredDataServer data={faqSchema} /> : null}
      {itemListSchema ? <StructuredDataServer data={itemListSchema} /> : null}
      {config.content.kind === 'verified' ? (
        <VerifiedComparisonPage
          comparison={config.content.comparison}
          locale={locale}
          tools={tools}
          guideHref={config.guideHref}
          faqs={config.content.faqs}
        />
      ) : (
        <UnavailableComparisonPage
          locale={locale}
          title={config.comparisonLabel}
          guideHref={config.guideHref}
          guideLabel={config.content.guideLabel}
        />
      )}
    </>
  );
}

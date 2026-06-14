import { WebNavigationDetailData, WebNavigationListRow } from '@/lib/data';
import { getComparisonCtaFromTags } from '@/lib/services/comparisonCta';
import { Tool } from '@/lib/services/tools';

const localeAliases: Record<string, string[]> = {
  cn: ['cn', 'zh', 'zh-CN', 'en'],
  tw: ['tw', 'zh-TW', 'zh', 'en'],
  jp: ['jp', 'ja', 'ja-JP', 'en'],
  en: ['en', 'en-US'],
};

export function getLocalizedToolValue(field: Record<string, string> | null | undefined, locale = 'en') {
  if (!field) return '';

  const candidateLocales = [locale, ...(localeAliases[locale] || []), 'en'];
  const matchedLocale = candidateLocales.find((candidate) => field[candidate]);

  return matchedLocale ? field[matchedLocale] : Object.values(field)[0] || '';
}

export function toolToListRow(tool: Tool, locale = 'en'): WebNavigationListRow {
  const featureRecord =
    tool.features && typeof tool.features === 'object' ? (tool.features as Record<string, unknown>) : {};
  const submission =
    featureRecord.submission && typeof featureRecord.submission === 'object'
      ? (featureRecord.submission as Record<string, unknown>)
      : {};
  const commercial =
    submission.commercial && typeof submission.commercial === 'object'
      ? (submission.commercial as Record<string, unknown>)
      : {};
  const featuredUntil = typeof commercial.featuredUntil === 'string' ? commercial.featuredUntil : '';
  const featuredActiveFrom = typeof commercial.featuredActiveFrom === 'string' ? commercial.featuredActiveFrom : '';
  const isSponsored = commercial.isSponsoredPlacement === true;
  const nowTs = Date.now();
  const fromTs = featuredActiveFrom ? new Date(featuredActiveFrom).getTime() : Number.NEGATIVE_INFINITY;
  const untilTs = featuredUntil ? new Date(featuredUntil).getTime() : Number.NaN;
  const isFeatured =
    isSponsored && Number.isFinite(untilTs) && untilTs >= nowTs && (!Number.isFinite(fromTs) || fromTs <= nowTs);
  const comparisonCta = getComparisonCtaFromTags(tool.tags || [], locale);

  return {
    id: tool.id,
    name: tool.name,
    title: getLocalizedToolValue(tool.title, locale),
    content: getLocalizedToolValue(tool.content, locale),
    createdAt: tool.createdAt?.toISOString?.(),
    url: tool.url,
    imageUrl: tool.imageUrl,
    thumbnailUrl: tool.thumbnailUrl || tool.imageUrl,
    isFeatured,
    updatedAt: tool.updatedAt?.toISOString?.(),
    ...comparisonCta,
  };
}

export function toolToDetailData(tool: Tool, locale = 'en'): WebNavigationDetailData {
  const content = getLocalizedToolValue(tool.content, locale);
  const detail = getLocalizedToolValue(tool.detail, locale);

  return {
    categoryName: tool.categoryId || '',
    collectionTime: tool.createdAt?.toISOString?.() || '',
    content,
    detail: detail || content,
    imageUrl: tool.imageUrl || tool.thumbnailUrl || '',
    name: tool.name,
    starRating: Number(tool.averageRating) || 0,
    tagName: tool.tags?.join(', ') || '',
    thumbnailUrl: tool.thumbnailUrl || tool.imageUrl || '',
    title: getLocalizedToolValue(tool.title, locale),
    url: tool.url,
    websiteData: '',
  };
}

export function toolToRecommendation(tool: Tool, locale = 'en') {
  return {
    id: tool.id,
    name: tool.name,
    title: getLocalizedToolValue(tool.title, locale),
    url: tool.url,
  };
}

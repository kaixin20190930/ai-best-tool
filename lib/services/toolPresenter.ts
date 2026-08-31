import { WebNavigationDetailData, WebNavigationListRow } from '@/lib/data';
import { getComparisonCtaFromTags } from '@/lib/services/comparisonCta';
import { Tool } from '@/lib/services/tools';

const localeAliases: Record<string, string[]> = {
  cn: ['cn', 'zh', 'zh-CN', 'en'],
  tw: ['tw', 'zh-TW', 'zh', 'en'],
  jp: ['jp', 'ja', 'ja-JP', 'en'],
  en: ['en', 'en-US'],
};

export function getLocalizedToolValue(field: unknown, locale = 'en'): string {
  if (typeof field === 'string') return field.trim();
  if (!field || typeof field !== 'object') return '';

  const candidateLocales = [locale, ...(localeAliases[locale] || []), 'en'];
  const record = field as Record<string, unknown>;
  const matchedLocale = candidateLocales.find(
    (candidate) => {
      const value = record[candidate];
      return typeof value === 'string' && value.trim().length > 0;
    },
  );

  if (matchedLocale) {
    return (record[matchedLocale] as string).trim();
  }

  const firstString = Object.values(record).find((value) => typeof value === 'string' && value.trim());
  return typeof firstString === 'string' ? firstString.trim() : '';
}

function getSafeIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : '';
  }

  if (typeof value === 'string') {
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : '';
  }

  return '';
}

function getToolStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
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
    createdAt: getSafeIsoDate(tool.createdAt),
    url: tool.url,
    imageUrl: tool.imageUrl,
    thumbnailUrl: tool.thumbnailUrl || tool.imageUrl,
    isFeatured,
    updatedAt: getSafeIsoDate(tool.updatedAt),
    ...comparisonCta,
  };
}

export function toolToDetailData(tool: Tool, locale = 'en'): WebNavigationDetailData {
  const content = getLocalizedToolValue(tool.content, locale);
  const detail = getLocalizedToolValue(tool.detail, locale);

  return {
    categoryName: tool.categoryId || '',
    collectionTime: getSafeIsoDate(tool.createdAt),
    content,
    detail: detail || content,
    imageUrl: tool.imageUrl || tool.thumbnailUrl || '',
    name: tool.name,
    starRating: Number(tool.averageRating) || 0,
    tagName: getToolStringArray(tool.tags).join(', '),
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

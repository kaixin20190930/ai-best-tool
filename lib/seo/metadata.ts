/**
 * SEO Metadata Generation Utilities
 * Functions for generating optimized titles, descriptions, and metadata
 */

import type { Metadata } from 'next';

import { SEO_CONFIG, SEO_CONSTRAINTS, TITLE_SEPARATOR } from './constants';
import { getNoindexMetadata, INDEXABLE_LOCALES, isIndexableLocale } from './indexing';

export interface LocalizedPageMetadataInput {
  locale: string;
  path: string;
  title: string;
  description: string;
  indexable?: boolean;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string | string[];
  baseUrl?: string;
}

/**
 * Generate an optimized page title
 * Ensures title is within SEO best practice length (30-60 characters)
 *
 * @param pageTitle - The specific page title
 * @param siteName - Optional site name (defaults to SEO_CONFIG.siteName)
 * @param separator - Optional separator (defaults to TITLE_SEPARATOR)
 * @returns Optimized title string
 */
export function generateTitle(
  pageTitle: string,
  siteName: string = SEO_CONFIG.siteName,
  separator: string = TITLE_SEPARATOR,
): string {
  if (!pageTitle) {
    return SEO_CONFIG.defaultTitle;
  }

  // If page title alone is within optimal range, use it
  if (pageTitle.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && pageTitle.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
    return pageTitle;
  }

  // Construct full title with site name
  const fullTitle = `${pageTitle} ${separator} ${siteName}`;

  // If full title is too long, truncate page title
  if (fullTitle.length > SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
    const maxPageTitleLength = SEO_CONSTRAINTS.TITLE_MAX_LENGTH - siteName.length - separator.length - 2; // 2 for spaces
    const truncatedPageTitle =
      pageTitle.length > maxPageTitleLength ? `${pageTitle.substring(0, maxPageTitleLength - 3)}...` : pageTitle;
    return `${truncatedPageTitle} ${separator} ${siteName}`;
  }

  return fullTitle;
}

/**
 * Generate an optimized meta description
 * Ensures description is within SEO best practice length (120-160 characters)
 *
 * @param content - The description content
 * @param maxLength - Optional max length (defaults to SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
 * @returns Optimized description string
 */
export function generateDescription(
  content: string,
  maxLength: number = SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
): string {
  if (!content) {
    return SEO_CONFIG.defaultDescription;
  }

  // Remove extra whitespace and newlines
  const cleanContent = content.replace(/\s+/g, ' ').trim();

  // If content is within optimal range, return as-is
  if (cleanContent.length >= SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH && cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // If too short, return as-is (better than truncating or padding artificially)
  if (cleanContent.length < SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH) {
    return cleanContent;
  }

  // If too long, truncate at word boundary
  if (cleanContent.length > maxLength) {
    const truncated = cleanContent.substring(0, maxLength - 3);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // Truncate at last complete word
    if (lastSpaceIndex > maxLength * 0.8) {
      // Only if we're not losing too much content
      return `${truncated.substring(0, lastSpaceIndex)}...`;
    }

    return `${truncated}...`;
  }

  return cleanContent;
}

/**
 * Generate a social media image URL
 * Ensures the image URL is absolute and properly formatted
 *
 * @param imagePath - Relative or absolute image path
 * @param baseUrl - Optional base URL (defaults to SEO_CONFIG.siteUrl)
 * @returns Absolute image URL
 */
export function generateSocialImageUrl(imagePath: string, baseUrl: string = SEO_CONFIG.siteUrl): string {
  if (!imagePath) {
    return `${baseUrl}${SEO_CONFIG.defaultImage}`;
  }

  // If already absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Ensure path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate canonical URL
 * Ensures URL is absolute and properly formatted
 *
 * @param path - Relative path
 * @param baseUrl - Optional base URL (defaults to SEO_CONFIG.siteUrl)
 * @returns Absolute canonical URL
 */
export function generateCanonicalUrl(path: string, baseUrl: string = SEO_CONFIG.siteUrl): string {
  // Remove trailing slash from base URL
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Remove trailing slash from path unless it's just "/"
  const cleanPath = normalizedPath.length > 1 ? normalizedPath.replace(/\/$/, '') : normalizedPath;

  return `${cleanBaseUrl}${cleanPath}`;
}

export function generateLocalizedPath(path: string, locale: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const pathWithoutLocale = normalizedPath.replace(/^\/(?:en|cn|jp|de|es|fr|pt|ru|tw)(?=\/|$)/, '') || '/';
  if (locale === SEO_CONFIG.defaultLocale) return pathWithoutLocale;
  if (pathWithoutLocale === '/') return `/${locale}`;
  return `/${locale}${pathWithoutLocale}`;
}

/**
 * Generate the public canonical URL for a localized route.
 * English uses the default unprefixed route while other locales keep their prefix.
 */
export function generateLocalizedCanonicalUrl(
  path: string,
  locale: string,
  baseUrl: string = SEO_CONFIG.siteUrl,
): string {
  return generateCanonicalUrl(generateLocalizedPath(path, locale), baseUrl);
}

/**
 * Generate tool-specific title
 * Creates an optimized title for tool detail pages
 *
 * @param toolName - Name of the tool
 * @param category - Optional category name
 * @returns Optimized tool title
 */
export function generateToolTitle(toolName: string, category?: string): string {
  if (!toolName) {
    return SEO_CONFIG.defaultTitle;
  }

  if (category) {
    return generateTitle(`${toolName} - ${category} AI Tool`);
  }

  return generateTitle(`${toolName} - AI Tool`);
}

/**
 * Generate tool-specific description
 * Creates an optimized description for tool detail pages
 *
 * @param toolName - Name of the tool
 * @param description - Tool description
 * @param category - Optional category name
 * @returns Optimized tool description
 */
export function generateToolDescription(toolName: string, description: string, category?: string): string {
  if (!description) {
    return generateDescription(
      `Discover ${toolName}${category ? `, a ${category} AI tool` : ', an AI tool'} that helps you achieve more. Explore features, pricing, and reviews.`,
    );
  }

  // Enhance short descriptions with context
  if (description.length < SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH) {
    const enhanced = `${description} Explore ${toolName}${category ? ` in the ${category} category` : ''} and discover how it can help you.`;
    return generateDescription(enhanced);
  }

  return generateDescription(description);
}

/**
 * Generate alternate language URLs for hreflang tags
 *
 * @param path - Current page path (without locale prefix)
 * @param currentLocale - Current locale
 * @param baseUrl - Optional base URL (defaults to SEO_CONFIG.siteUrl)
 * @returns Array of alternate locale objects
 */
export function generateAlternateLocales(
  path: string,
  currentLocale: string,
  baseUrl: string = SEO_CONFIG.siteUrl,
): Array<{ locale: string; url: string }> {
  return INDEXABLE_LOCALES.filter((locale) => locale !== currentLocale).map((locale) => ({
    locale,
    url: generateLocalizedCanonicalUrl(path, locale, baseUrl),
  }));
}

/**
 * Generate hreflang links for all locales including x-default
 * This creates a complete set of hreflang tags for proper internationalization
 *
 * @param path - Current page path (without locale prefix)
 * @param currentLocale - Current locale
 * @param baseUrl - Optional base URL (defaults to SEO_CONFIG.siteUrl)
 * @returns Record of locale codes to URLs, including 'x-default'
 */
export function generateHreflangLinks(
  path: string,
  currentLocale: string,
  baseUrl: string = SEO_CONFIG.siteUrl,
): Record<string, string> {
  const hreflangLinks: Record<string, string> = {};

  // Add all locales including current one
  INDEXABLE_LOCALES.forEach((locale) => {
    hreflangLinks[locale] = generateLocalizedCanonicalUrl(path, locale, baseUrl);
  });

  // Add x-default pointing to the default locale
  hreflangLinks['x-default'] = generateLocalizedCanonicalUrl(path, SEO_CONFIG.defaultLocale, baseUrl);

  return hreflangLinks;
}

/**
 * Build canonical, hreflang, robots, and social metadata from one localized path.
 * Non-indexable and unsupported-locale pages keep a canonical but do not advertise
 * hreflang alternates to search engines.
 */
export function buildLocalizedPageMetadata({
  locale,
  path,
  title,
  description,
  indexable = true,
  image = SEO_CONFIG.defaultImage,
  type = 'website',
  keywords,
  baseUrl = SEO_CONFIG.siteUrl,
}: LocalizedPageMetadataInput): Metadata {
  const canonicalPath = path.split(/[?#]/, 1)[0] || '/';
  const canonical = generateLocalizedCanonicalUrl(canonicalPath, locale, baseUrl);
  const shouldIndex = indexable && isIndexableLocale(locale);
  const socialImage = generateSocialImageUrl(image, baseUrl);

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical,
      ...(shouldIndex ? { languages: generateHreflangLinks(canonicalPath, locale, baseUrl) } : {}),
    },
    ...(shouldIndex ? {} : getNoindexMetadata()),
    openGraph: {
      type,
      locale,
      url: canonical,
      siteName: SEO_CONFIG.siteName,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
      ...(SEO_CONFIG.twitterHandle
        ? {
            creator: SEO_CONFIG.twitterHandle,
            site: SEO_CONFIG.twitterHandle,
          }
        : {}),
    },
  };
}

/**
 * SEOHead Component
 * Generates basic SEO meta tags for pages
 * Supports locale and alternate locales for internationalization
 */

import { Metadata } from 'next';
import {
  generateTitle,
  generateDescription,
  generateCanonicalUrl,
  generateSocialImageUrl,
  generateAlternateLocales,
  generateHreflangLinks,
  SEO_CONFIG,
} from '@/lib/seo';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  locale?: string;
  alternateLocales?: Array<{ locale: string; url: string }>;
  noindex?: boolean;
  keywords?: string[];
}

/**
 * Generate Next.js Metadata object for SEO
 * This function should be used in page components with generateMetadata
 *
 * @param props - SEO configuration props
 * @returns Next.js Metadata object
 */
export function generateSEOMetadata(props: SEOHeadProps): Metadata {
  const {
    title,
    description,
    canonical,
    image,
    type = 'website',
    locale = SEO_CONFIG.defaultLocale,
    alternateLocales,
    noindex = false,
    keywords,
  } = props;

  // Generate optimized title and description
  const optimizedTitle = generateTitle(title);
  const optimizedDescription = generateDescription(description);

  // Generate canonical URL
  const canonicalUrl = canonical
    ? generateCanonicalUrl(canonical)
    : undefined;

  // Generate social image URL
  const socialImage = generateSocialImageUrl(image || SEO_CONFIG.defaultImage);

  // Build metadata object
  const metadata: Metadata = {
    title: optimizedTitle,
    description: optimizedDescription,
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
  };

  // Add keywords if provided
  if (keywords && keywords.length > 0) {
    metadata.keywords = keywords;
  }

  // Add robots meta tag if noindex
  if (noindex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  // Add Open Graph metadata
  metadata.openGraph = {
    title: optimizedTitle,
    description: optimizedDescription,
    url: canonicalUrl,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: optimizedTitle,
      },
    ],
    locale: locale,
    type: type,
  };

  // Add alternate locales for Open Graph
  if (alternateLocales && alternateLocales.length > 0 && metadata.openGraph) {
    metadata.openGraph.alternateLocale = alternateLocales.map((alt) => alt.locale);
  }

  // Add Twitter Card metadata
  metadata.twitter = {
    card: 'summary_large_image',
    title: optimizedTitle,
    description: optimizedDescription,
    images: [socialImage],
    ...(SEO_CONFIG.twitterHandle && {
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
    }),
  };

  // Add alternate language links (hreflang tags)
  if (alternateLocales && alternateLocales.length > 0 && canonicalUrl) {
    // Build languages object from alternateLocales
    const languages = alternateLocales.reduce(
      (acc, alt) => {
        acc[alt.locale] = alt.url;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Add current locale
    languages[locale] = canonicalUrl;

    // Add x-default pointing to default locale
    const defaultLocaleUrl = locale === SEO_CONFIG.defaultLocale 
      ? canonicalUrl 
      : alternateLocales.find(alt => alt.locale === SEO_CONFIG.defaultLocale)?.url || canonicalUrl;
    
    languages['x-default'] = defaultLocaleUrl;

    metadata.alternates = {
      canonical: canonicalUrl,
      languages,
    };
  } else if (canonicalUrl) {
    // Even without alternateLocales, set up basic alternates with canonical
    metadata.alternates = {
      canonical: canonicalUrl,
    };
  }

  return metadata;
}

/**
 * Helper function to generate metadata with automatic alternate locales
 *
 * @param props - SEO configuration props
 * @param currentPath - Current page path (without locale prefix)
 * @returns Next.js Metadata object
 */
export function generateSEOMetadataWithLocales(
  props: Omit<SEOHeadProps, 'alternateLocales'>,
  currentPath: string,
): Metadata {
  const locale = props.locale || SEO_CONFIG.defaultLocale;
  const alternateLocales = generateAlternateLocales(currentPath, locale);

  return generateSEOMetadata({
    ...props,
    alternateLocales,
  });
}

/**
 * Helper function to generate complete hreflang metadata for a page
 * This is the recommended way to add hreflang tags to pages
 *
 * @param locale - Current page locale
 * @param path - Current page path (without locale prefix, e.g., '/explore' or '/ai/chatgpt')
 * @returns Metadata alternates object with all hreflang links including x-default
 */
export function generateHreflangMetadata(
  locale: string,
  path: string,
): Pick<Metadata, 'alternates'> {
  const hreflangLinks = generateHreflangLinks(path, locale);
  const canonicalUrl = hreflangLinks[locale];

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangLinks,
    },
  };
}

/**
 * SEO Configuration Constants
 * Central configuration for all SEO-related metadata across the site
 */

/**
 * Site Configuration Interface
 */
import { BASE_URL, normalizeBaseUrl } from '@/lib/env';

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  locales: string[];
  defaultLocale: string;
}

/**
 * Tool Pricing Information
 */
export interface ToolPricing {
  type: 'free' | 'paid' | 'freemium';
  price?: number;
  currency?: string;
}

/**
 * Tool Rating Information
 */
export interface ToolRating {
  value: number;
  count: number;
}

/**
 * Tool Metadata Interface
 */
export interface ToolMetadata {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  pricing: ToolPricing;
  rating?: ToolRating;
  image: string;
  url: string;
  officialUrl?: string;
  datePublished?: string;
  dateModified?: string;
}

/**
 * Get the site URL from environment variables
 */
function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location.origin
    return normalizeBaseUrl(window.location.origin);
  }

  // Server-side: use the normalized canonical base URL.
  return BASE_URL;
}

/**
 * Main SEO Configuration
 */
export const SEO_CONFIG: SEOConfig = {
  siteName: 'AI Best Tool',
  siteUrl: getSiteUrl(),
  defaultTitle: 'AI Best Tool - Discover the Best AI Tools',
  defaultDescription:
    'Discover and explore the best AI tools for your needs. Browse our curated directory of AI-powered software, applications, and services.',
  defaultImage: '/images/aibesttool.png',
  twitterHandle: '@aibesttool',
  locales: ['en', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'jp', 'pt', 'ru'],
  defaultLocale: 'en',
};

/**
 * SEO Constraints
 */
export const SEO_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 30,
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MIN_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 160,
  TOOL_DESCRIPTION_MIN_LENGTH: 200,
  TOOL_DESCRIPTION_MAX_LENGTH: 300,
} as const;

/**
 * Social Media Image Dimensions
 */
export const SOCIAL_IMAGE_DIMENSIONS = {
  OPEN_GRAPH: {
    width: 1200,
    height: 630,
  },
  TWITTER: {
    width: 1200,
    height: 600,
  },
} as const;

/**
 * Default separator for title generation
 */
export const TITLE_SEPARATOR = '|';

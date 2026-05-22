/**
 * SocialMeta Component
 * Generates Open Graph and Twitter Card metadata for social media sharing
 * Supports different card types and customization
 */

import { Metadata } from 'next';
import { generateSocialImageUrl, SEO_CONFIG } from '@/lib/seo';

export type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';
export type OpenGraphType = 'website' | 'article' | 'profile' | 'book' | 'video.movie' | 'music.song';

export interface SocialMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: OpenGraphType;
  twitterCard?: TwitterCardType;
  twitterCreator?: string;
  twitterSite?: string;
  locale?: string;
  siteName?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * Generate social media metadata (Open Graph and Twitter Cards)
 *
 * @param props - Social metadata configuration
 * @returns Partial Next.js Metadata object with social tags
 */
export function generateSocialMetadata(props: SocialMetaProps): Partial<Metadata> {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    twitterCard = 'summary_large_image',
    twitterCreator,
    twitterSite,
    locale = SEO_CONFIG.defaultLocale,
    siteName = SEO_CONFIG.siteName,
    article,
  } = props;

  // Generate social image URL
  const socialImage = generateSocialImageUrl(image || SEO_CONFIG.defaultImage);

  const metadata: Partial<Metadata> = {};

  // Open Graph metadata
  metadata.openGraph = {
    title,
    description,
    siteName,
    locale,
    type,
    ...(url && { url }),
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  };

  // Add article-specific Open Graph data
  if (type === 'article' && article) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      ...(article.publishedTime && { publishedTime: article.publishedTime }),
      ...(article.modifiedTime && { modifiedTime: article.modifiedTime }),
      ...(article.author && { authors: [article.author] }),
      ...(article.section && { section: article.section }),
      ...(article.tags && article.tags.length > 0 && { tags: article.tags }),
    };
  }

  // Twitter Card metadata
  metadata.twitter = {
    card: twitterCard,
    title,
    description,
    images: [socialImage],
    creator: twitterCreator || SEO_CONFIG.twitterHandle,
    site: twitterSite || SEO_CONFIG.twitterHandle,
  };

  return metadata;
}

/**
 * Generate social metadata for tool pages
 * Specialized function for tool detail pages with ratings and pricing
 *
 * @param toolData - Tool information
 * @returns Partial Next.js Metadata object
 */
export function generateToolSocialMetadata(toolData: {
  name: string;
  description: string;
  image?: string;
  url?: string;
  category?: string;
  rating?: { value: number; count: number };
  price?: string;
}): Partial<Metadata> {
  const { name, description, image, url, category, rating, price } = toolData;

  // Enhance description with additional context
  let enhancedDescription = description;
  if (category) {
    enhancedDescription = `${description} | ${category} AI Tool`;
  }
  if (rating && rating.count > 0) {
    enhancedDescription += ` | ⭐ ${rating.value}/5 (${rating.count} reviews)`;
  }
  if (price) {
    enhancedDescription += ` | ${price}`;
  }

  return generateSocialMetadata({
    title: name,
    description: enhancedDescription,
    image,
    url,
    type: 'website',
    twitterCard: 'summary_large_image',
  });
}

/**
 * Generate social metadata for article/blog pages
 *
 * @param articleData - Article information
 * @returns Partial Next.js Metadata object
 */
export function generateArticleSocialMetadata(articleData: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}): Partial<Metadata> {
  return generateSocialMetadata({
    title: articleData.title,
    description: articleData.description,
    image: articleData.image,
    url: articleData.url,
    type: 'article',
    twitterCard: 'summary_large_image',
    article: {
      publishedTime: articleData.publishedTime,
      modifiedTime: articleData.modifiedTime,
      author: articleData.author,
      section: articleData.section,
      tags: articleData.tags,
    },
  });
}

/**
 * Generate social metadata for profile pages
 *
 * @param profileData - Profile information
 * @returns Partial Next.js Metadata object
 */
export function generateProfileSocialMetadata(profileData: {
  name: string;
  bio: string;
  image?: string;
  url?: string;
  username?: string;
}): Partial<Metadata> {
  const { name, bio, image, url, username } = profileData;

  return generateSocialMetadata({
    title: name,
    description: bio,
    image,
    url,
    type: 'profile',
    twitterCard: 'summary',
    ...(username && { twitterCreator: `@${username}` }),
  });
}

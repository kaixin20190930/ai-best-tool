import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWebNavigationDetail } from '@/network/webNavigation';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  CircleArrowRight,
  DollarSign,
  Eye,
  FolderOpen,
  Heart,
  Lightbulb,
  MousePointerClick,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Tag as TagIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Separator } from '@/components/ui/separator';
import BaseImage from '@/components/image/BaseImage';
import MarkdownProse from '@/components/MarkdownProse';
import RatingStars from '@/components/RatingStars';
import FavoriteButton from '@/components/FavoriteButton';
import CommentList from '@/components/comments/CommentList';
import MediaGallery from '@/components/MediaGallery';
import RecommendedTools from '@/components/RecommendedTools';
import TrackableLink from '@/components/TrackableLink';
import ShareButton from '@/components/ShareButton';
import { getUserRating } from '@/app/actions/ratings';
import { isFavorited } from '@/app/actions/favorites';
import { getCommentCount } from '@/app/actions/comments';
import { getToolByName, getLocalizedField } from '@/lib/services/tools';
import { toolToDetailData } from '@/lib/services/toolPresenter';
import { createClient } from '@/lib/supabase/server';
import { trackPageView, getToolStats } from '@/app/actions/analytics';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateSoftwareSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ToolMetadata, SEO_CONFIG, SOCIAL_IMAGE_DIMENSIONS } from '@/lib/seo/constants';
import { 
  generateToolTitle, 
  generateToolDescription, 
  generateCanonicalUrl, 
  generateSocialImageUrl 
} from '@/lib/seo/metadata';
import { getCategoryById, getLocalizedField as getCategoryLocalizedField } from '@/lib/services/categories';
import { getTagsBySlugs, getLocalizedField as getTagLocalizedField } from '@/lib/services/tags';
import { listingConfig } from '@/lib/config/listing';

// Revalidate every hour (3600 seconds) - ISR strategy
export const revalidate = 3600;

// Enable dynamic params for ISR
export const dynamicParams = true;

export async function generateMetadata({
  params: { locale, websiteName },
}: {
  params: { locale: string; websiteName: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.ai',
  });
  const dbTool = await getToolByName(websiteName);
  const data = dbTool?.status === 'published'
    ? toolToDetailData(dbTool, locale)
    : (await getWebNavigationDetail(websiteName, locale)).data;
  
  // Get localized content if available
  const toolTitle = dbTool 
    ? getLocalizedField(dbTool.title, locale) || data?.title || websiteName
    : data?.title || websiteName;
  
  const toolDescription = dbTool
    ? getLocalizedField(dbTool.content, locale) || data?.content || ''
    : data?.content || '';
  
  // Get category name if available
  let toolCategory: string | undefined;
  if (dbTool?.categoryId) {
    const { getCategoryById, getLocalizedField: getCategoryLocalizedField } = await import('@/lib/services/categories');
    const category = await getCategoryById(dbTool.categoryId);
    if (category) {
      toolCategory = getCategoryLocalizedField(category.name, locale);
    }
  }

  // Generate optimized title and description using SEO utilities
  const optimizedTitle = generateToolTitle(toolTitle, toolCategory);
  const optimizedDescription = generateToolDescription(
    toolTitle,
    toolDescription,
    toolCategory
  );

  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(`/${locale}/ai/${websiteName}`);

  // Generate optimized social image URL
  const toolImage = data?.thumbnailUrl || data?.imageUrl || SEO_CONFIG.defaultImage;
  const socialImageUrl = generateSocialImageUrl(toolImage);

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: socialImageUrl,
          width: SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.width,
          height: SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.height,
          alt: toolTitle,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [socialImageUrl],
    },
  };
}

export default async function Page({ params: { websiteName, locale } }: { params: { websiteName: string; locale: string } }) {
  const t = await getTranslations('Startup.detail');
  const dbTool = await getToolByName(websiteName);
  const data = dbTool?.status === 'published'
    ? toolToDetailData(dbTool, locale)
    : (await getWebNavigationDetail(websiteName, locale)).data;

  if (!data) notFound();

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const toolId = dbTool?.id;
  
  // Get rating and favorite data if tool exists in database
  let userRating = null;
  let ratingStats = { averageRating: 0, ratingCount: 0 };
  let isFavoritedByUser = false;
  let commentCount = 0;
  let toolStats = {
    viewCount: 0,
    clickCount: 0,
    shareCount: 0,
    favoriteCount: 0,
    averageRating: 0,
    ratingCount: 0
  };

  // Get category and tags information
  let category = null;
  let tags: Array<{ slug: string; name: Record<string, string> }> = [];
  
  if (dbTool) {
    // Fetch category if available
    if (dbTool.categoryId) {
      category = await getCategoryById(dbTool.categoryId);
    }
    
    // Fetch tags if available
    if (dbTool.tags && dbTool.tags.length > 0) {
      tags = await getTagsBySlugs(dbTool.tags);
    }
  }

  if (toolId) {
    try {
      const [nextUserRating, nextIsFavoritedByUser, nextToolStats, nextCommentCount] = await Promise.all([
        getUserRating(toolId).catch(() => null),
        isFavorited(toolId).catch(() => false),
        getToolStats(toolId).catch(() => ({
          viewCount: 0,
          clickCount: 0,
          shareCount: 0,
          favoriteCount: 0,
          averageRating: 0,
          ratingCount: 0
        })),
        getCommentCount(toolId).catch(() => 0),
      ]);
      userRating = nextUserRating;
      isFavoritedByUser = nextIsFavoritedByUser;
      toolStats = nextToolStats;
      commentCount = Number(nextCommentCount || 0);
      ratingStats = {
        averageRating: toolStats.averageRating,
        ratingCount: toolStats.ratingCount,
      };
    } catch (error) {
      console.error('Error fetching tool data:', error);
    }

    // Track page view (fire and forget)
    trackPageView(toolId, user?.id).catch(err => 
      console.error('Failed to track page view:', err)
    );
  }

  // Generate SoftwareApplication schema for tool pages
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const toolUrl = `${baseUrl}/${locale}/ai/${websiteName}`;
  const toolImageUrl = data.thumbnailUrl || data.imageUrl || '';
  
  let softwareSchema = null;
  if (dbTool) {
    // Get localized title and description
    const localizedTitle = getLocalizedField(dbTool.title, locale);
    const localizedDescription = getLocalizedField(dbTool.content, locale);
    const localizedDetail = getLocalizedField(dbTool.detail, locale);
    
    const toolMetadata: ToolMetadata = {
      name: localizedTitle || data.title,
      description: localizedDescription || data.content,
      longDescription: localizedDetail || data.detail,
      category: category
        ? getCategoryLocalizedField(category.name, locale)
        : 'AI Tool',
      tags: dbTool.tags || [],
      pricing: {
        type: dbTool.pricing as 'free' | 'paid' | 'freemium',
        price: undefined,
        currency: 'USD',
      },
      rating: ratingStats.ratingCount > 0 ? {
        value: ratingStats.averageRating,
        count: ratingStats.ratingCount,
      } : undefined,
      image: toolImageUrl.startsWith('http') ? toolImageUrl : `${baseUrl}${toolImageUrl}`,
      url: toolUrl,
      officialUrl: data.url,
      datePublished: dbTool.createdAt?.toISOString?.(),
      dateModified: dbTool.updatedAt?.toISOString?.(),
    };
    
    softwareSchema = generateSoftwareSchema(toolMetadata);
  }

  // Generate BreadcrumbList schema for navigation hierarchy
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: 'AI Tools', url: `${baseUrl}/${locale}/explore` },
    { name: data.title, url: toolUrl },
  ]);
  const categoryName = category
    ? getCategoryLocalizedField(category.name, locale)
    : data.categoryName || 'AI Tool';
  const detailMarkdown =
    dbTool && getLocalizedField(dbTool.detail, locale)
      ? getLocalizedField(dbTool.detail, locale)
      : data?.detail || data?.content || '';
  const heroImage = data.thumbnailUrl || data.imageUrl || '';
  const pricingLabel =
    dbTool?.pricing === 'free'
      ? 'Free'
      : dbTool?.pricing === 'paid'
        ? 'Paid'
        : dbTool?.pricing === 'freemium'
          ? 'Freemium'
          : 'Check website';
  const updatedAt = dbTool?.updatedAt || dbTool?.createdAt;
  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat(locale === 'cn' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(updatedAt))
    : 'Recently checked';
  const quickFacts = [
    {
      label: 'Category',
      value: categoryName,
      icon: FolderOpen,
      tone: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'Pricing',
      value: pricingLabel,
      icon: DollarSign,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Updated',
      value: updatedLabel,
      icon: CalendarDays,
      tone: 'text-cyan-700 bg-cyan-50',
    },
    {
      label: 'Rating',
      value:
        ratingStats.ratingCount > 0
          ? `${ratingStats.averageRating.toFixed(1)} / 5`
          : 'No ratings yet',
      icon: Star,
      tone: 'text-cyan-700 bg-cyan-50',
    },
  ];
  const commentPromptLabel = locale === 'cn' ? '可以直接点一个开头' : 'Start with one of these';
  const commentStarterPrompts =
    locale === 'cn'
      ? [
          '你主要把它用在哪个场景？',
          '最喜欢的一点是什么？',
          '有没有踩坑或替代方案？',
        ]
      : [
          'What do you mainly use it for?',
          'What do you like most about it?',
          'Any caveats or alternatives?',
        ];

  return (
    <>
      {/* Structured Data for SEO */}
      {softwareSchema && <StructuredDataServer data={softwareSchema} />}
      <StructuredDataServer data={breadcrumbSchema} />
      
      <div className='w-full bg-slate-50'>
        <div className='mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12'>
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start'>
            <section className='space-y-6'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200'>
                  <Sparkles className='size-4 text-emerald-600' />
                  AI tool profile
                </span>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200'>
                  <FolderOpen className='size-4 text-sky-600' />
                  {categoryName}
                </span>
              </div>

              <div className='space-y-4'>
                <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>
                  {data.title}
                </h1>
                <p className='max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
                  {data.content}
                </p>
              </div>

              {toolId && (
                <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
                  <div className='mb-3 flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700'>
                      {locale === 'cn' ? '互动面板' : 'Action rail'}
                    </span>
                    <span className='text-sm text-slate-500'>
                      {locale === 'cn'
                        ? '收藏、分享、评分和讨论都在同一条行动带里。'
                        : 'Save, share, rate, and discuss from one compact rail.'}
                    </span>
                  </div>

                  <div className='grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center'>
                    <div className='rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200'>
                      <div className='flex flex-wrap items-center gap-4'>
                        <div className='min-w-0'>
                          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '评分' : 'Rating'}
                          </p>
                          <div className='mt-1'>
                            <RatingStars
                              toolId={toolId}
                              currentRating={userRating}
                              averageRating={ratingStats.averageRating}
                              ratingCount={ratingStats.ratingCount}
                              readonly={false}
                              size='md'
                              showStats={true}
                            />
                          </div>
                        </div>

                        <div className='h-10 w-px bg-slate-200' />

                        <div className='min-w-0'>
                          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                            {locale === 'cn' ? '收藏' : 'Save'}
                          </p>
                          <div className='mt-1'>
                            <FavoriteButton
                              toolId={toolId}
                              initialState={isFavoritedByUser}
                              showLabel={true}
                              className='rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 hover:ring-red-200'
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <ShareButton
                        toolId={toolId}
                        toolName={websiteName}
                        toolTitle={data.title}
                        toolDescription={data.content}
                        userId={user?.id}
                        className='rounded-full'
                      />
                      <a
                        href='#comments'
                        className='inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100'
                      >
                        <MessageSquare className='size-4' />
                        {commentCount > 0
                          ? `${commentCount} ${locale === 'cn' ? '条讨论' : 'comments'}`
                          : (locale === 'cn' ? '去讨论' : 'Discuss')}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                {toolId ? (
                  <TrackableLink
                    href={data.url}
                    toolId={toolId}
                    userId={user?.id}
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
                  >
                    {t('visitWebsite')} <ArrowUpRight className='size-4' />
                  </TrackableLink>
                ) : (
                  <a
                    href={data.url}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
                  >
                    {t('visitWebsite')} <ArrowUpRight className='size-4' />
                  </a>
                )}
                <a
                  href={`/${locale}/explore?search=${encodeURIComponent(data.title)}`}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100'
                >
                  Find similar tools <CircleArrowRight className='size-4' />
                </a>
                {/* Discussion anchor is now surfaced in the action panel above */}
              </div>
            </section>

            <aside className='space-y-4'>
              <div className='overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200'>
                {heroImage ? (
                  toolId ? (
                    <TrackableLink
                      href={data.url}
                      toolId={toolId}
                      userId={user?.id}
                      className='group relative block aspect-video w-full overflow-hidden bg-slate-100'
                    >
                      <BaseImage
                        title={data.title}
                        alt={`${data.title} interface preview`}
                        fill
                        src={heroImage}
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    </TrackableLink>
                  ) : (
                    <a
                      href={data.url}
                      target='_blank'
                      rel='noreferrer'
                      className='group relative block aspect-video w-full overflow-hidden bg-slate-100'
                    >
                      <BaseImage
                        title={data.title}
                        alt={`${data.title} interface preview`}
                        fill
                        src={heroImage}
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    </a>
                  )
                ) : (
                  <div className='flex aspect-video items-center justify-center bg-slate-100 text-5xl font-bold text-slate-300'>
                    {data.title.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className='grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 text-center'>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>Views</p>
                    <p className='font-semibold text-slate-950'>{toolStats.viewCount.toLocaleString()}</p>
                  </div>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>Clicks</p>
                    <p className='font-semibold text-slate-950'>{toolStats.clickCount.toLocaleString()}</p>
                  </div>
                  <div className='p-3'>
                    <p className='text-xs text-slate-500'>Saved</p>
                    <p className='font-semibold text-slate-950'>{toolStats.favoriteCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className='mt-3 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-sm text-cyan-900'>
                      {locale === 'cn'
                        ? '如果这是你的工具，可以考虑付费入驻，拿到优先审核和前排展示。'
                        : 'If this is your tool, paid listing can unlock priority review and featured placement.'}
                    </p>
                    <Link
                      href={`/${locale}/developer/listing`}
                      className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                    >
                      {locale === 'cn' ? '查看入驻方案' : 'View listing plan'}
                    </Link>
                  </div>
                  <p className='mt-2 text-xs text-cyan-900/70'>
                    {listingConfig.plans.standard_paid.reviewWindow} • {listingConfig.plans.standard_paid.featuredLabel}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {quickFacts.map((fact) => (
                  <div key={fact.label} className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200'>
                    <div className={`mb-3 inline-flex rounded-lg p-2 ${fact.tone}`}>
                      <fact.icon className='size-4' />
                    </div>
                    <p className='text-xs font-medium uppercase text-slate-500'>{fact.label}</p>
                    <p className='mt-1 text-sm font-semibold text-slate-950'>{fact.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <div className='border-y border-slate-200 bg-white'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 lg:px-6'>
            <span className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700'>
              <TagIcon className='size-4 text-slate-500' />
              Tags
            </span>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag.slug}
                  className='rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700'
                >
                  {getTagLocalizedField(tag.name, locale)}
                </span>
              ))
            ) : (
              <span className='rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600'>
                {categoryName}
              </span>
            )}
          </div>
        </div>

        <div className='mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-12'>
          <main className='space-y-8'>
            <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
              <div className='mb-5 flex items-center gap-3'>
                <ShieldCheck className='size-6 text-emerald-600' />
                <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>{t('introduction')}</h2>
              </div>
              <MarkdownProse
                markdown={detailMarkdown}
                className='text-base leading-7 text-slate-700'
              />
            </section>

            {dbTool && dbTool.features && Object.entries(dbTool.features).some(([, value]) => typeof value === 'string') && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <div className='mb-5 flex items-center gap-3'>
                  <CheckCircle className='size-6 text-emerald-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>Key Features</h2>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {Object.entries(dbTool.features)
                    .filter(([, value]) => typeof value === 'string')
                    .map(([key, value]) => (
                      <div key={key} className='rounded-lg border border-slate-200 p-4'>
                        <h3 className='font-semibold text-slate-950'>{key}</h3>
                        <p className='mt-2 text-sm leading-6 text-slate-600'>{String(value)}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {dbTool && dbTool.useCases && Object.keys(dbTool.useCases).length > 0 && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <div className='mb-5 flex items-center gap-3'>
                  <Lightbulb className='size-6 text-cyan-600' />
                  <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>Use Cases</h2>
                </div>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {Object.entries(dbTool.useCases).map(([key, value]) => (
                    <div key={key} className='rounded-lg bg-cyan-50 p-4 ring-1 ring-cyan-100'>
                      <h3 className='font-semibold text-slate-950'>{key}</h3>
                      {typeof value === 'string' && (
                        <p className='mt-2 text-sm leading-6 text-slate-700'>{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dbTool && ((dbTool.screenshots && dbTool.screenshots.length > 0) || dbTool.videoUrl) && (
              <section className='rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8'>
                <h2 className='mb-5 text-2xl font-bold text-slate-950 lg:text-3xl'>Screenshots & Videos</h2>
                <MediaGallery
                  screenshots={dbTool.screenshots || []}
                  videoUrl={dbTool.videoUrl}
                  title={data.title}
                />
              </section>
            )}

            {toolId && (
              <>
                <RecommendedTools toolId={toolId} locale={locale} />
                <section id='comments' className='scroll-mt-24'>
                  <Separator className='mb-8 border-t border-slate-200' />
                  <div className='mb-6 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <h3 className='text-base font-semibold text-slate-900'>
                          Join the discussion and follow updates
                        </h3>
                        <p className='mt-1 text-sm text-slate-600'>
                          Save this tool, share it with your team, and leave your review.
                        </p>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        {user ? (
                          <>
                            <FavoriteButton
                              toolId={toolId}
                              initialState={isFavoritedByUser}
                              showLabel={true}
                            />
                            <ShareButton
                              toolId={toolId}
                              toolName={websiteName}
                              toolTitle={data.title}
                              toolDescription={data.content}
                              userId={user.id}
                            />
                          </>
                        ) : (
                          <Link
                            href={`/${locale}/login?redirect=/${locale}/ai/${websiteName}`}
                            className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                          >
                            Log in to save and comment
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900'>
                    {locale === 'cn'
                      ? '欢迎写下真实体验：适合什么场景、哪里最好用、有什么坑，都会帮到后来的人。'
                      : 'Share real usage notes: best use cases, what works well, and what to watch out for. That helps the next person a lot.'}
                  </div>
                  <CommentList
                    toolId={toolId}
                    currentUserId={user?.id}
                    locale={locale}
                    promptLabel={commentPromptLabel}
                    starterPrompts={commentStarterPrompts}
                    placeholder={
                      locale === 'cn'
                        ? '说说你的真实使用体验，比如适合什么场景、有什么优点或注意点。'
                        : 'Tell us your real experience: best use cases, strengths, or anything to watch out for.'
                    }
                  />
                </section>
              </>
            )}
          </main>

          <aside className='space-y-4 lg:sticky lg:top-24 lg:self-start'>
            <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
              <h2 className='text-base font-bold text-slate-950'>Tool Snapshot</h2>
              <dl className='mt-4 space-y-3 text-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>Pricing</dt>
                  <dd className='font-semibold text-slate-950'>{pricingLabel}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>Category</dt>
                  <dd className='text-right font-semibold text-slate-950'>{categoryName}</dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>Status</dt>
                  <dd className='font-semibold text-emerald-700'>
                    {dbTool?.status === 'published' ? 'Published' : 'Listed'}
                  </dd>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <dt className='text-slate-500'>Last update</dt>
                  <dd className='text-right font-semibold text-slate-950'>{updatedLabel}</dd>
                </div>
              </dl>
              {toolId ? (
                <TrackableLink
                  href={data.url}
                  toolId={toolId}
                  userId={user?.id}
                  className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
                >
                  Open official site <ArrowUpRight className='size-4' />
                </TrackableLink>
              ) : (
                <a
                  href={data.url}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
                >
                  Open official site <ArrowUpRight className='size-4' />
                </a>
              )}
            </div>

            <div className='rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200'>
              <h2 className='text-base font-bold text-slate-950'>Engagement</h2>
              <div className='mt-4 space-y-3 text-sm text-slate-700'>
                <p className='flex items-center gap-2'>
                  <Eye className='size-4 text-slate-500' /> {toolStats.viewCount.toLocaleString()} views
                </p>
                <p className='flex items-center gap-2'>
                  <MousePointerClick className='size-4 text-slate-500' /> {toolStats.clickCount.toLocaleString()} website clicks
                </p>
                <p className='flex items-center gap-2'>
                  <Heart className='size-4 text-slate-500' /> {toolStats.favoriteCount.toLocaleString()} saves
                </p>
                <p className='flex items-center gap-2'>
                  <Star className='size-4 text-slate-500' /> {ratingStats.ratingCount.toLocaleString()} ratings
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

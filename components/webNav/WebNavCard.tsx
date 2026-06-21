import Link from 'next/link';
import { Flame, Megaphone, Sparkles } from 'lucide-react';

import { WebNavigationListRow } from '@/lib/data';

import FavoriteButton from '../FavoriteButton';
import RatingStars from '../RatingStars';
import TrackableLink from '../TrackableLink';
import ToolCardMedia from './ToolCardMedia';

interface WebNavCardProps extends Omit<WebNavigationListRow, 'id'> {
  compareHref?: string;
  compareLabel?: string;
  isFavorited?: boolean;
  toolId?: string;
  averageRating?: number;
  ratingCount?: number;
  contextLabel?: 'latest' | 'popular';
  locale?: string;
}

function getFreshnessLabel(createdAt?: string, updatedAt?: string): string | null {
  const referenceDate = updatedAt || createdAt;

  if (!referenceDate) {
    return null;
  }

  const timestamp = new Date(referenceDate).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const days = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));

  if (createdAt && days <= 14) {
    return 'Recently added';
  }

  if (days === 0) {
    return 'Updated today';
  }

  return `Updated ${days} days ago`;
}

export default function WebNavCard({
  compareHref,
  compareLabel,
  name,
  imageUrl,
  thumbnailUrl,
  title,
  url,
  content,
  isFavorited = false,
  toolId,
  averageRating = 0,
  ratingCount = 0,
  createdAt,
  updatedAt,
  contextLabel,
  locale = 'en',
  isFeatured,
}: WebNavCardProps) {
  const freshnessLabel = getFreshnessLabel(createdAt, updatedAt);
  const isChinese = locale === 'cn' || locale === 'tw';
  const officialSiteLabel = isChinese ? '打开官网' : 'Open official site';
  const compareActionLabel = compareLabel || (isChinese ? '查看比较' : 'Compare');

  return (
    <div className='flex h-full flex-col gap-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md lg:p-4'>
      <Link href={`/ai/${name}`} title={title}>
        <ToolCardMedia imageUrl={imageUrl} name={name} thumbnailUrl={thumbnailUrl} title={title} />
      </Link>
      <div className='flex min-w-0 items-center justify-between gap-3'>
        <a href={url} title={title} target='_blank' rel='noreferrer' className='min-w-0 flex-1 hover:text-slate-700'>
          <h3 className='line-clamp-1 break-words text-base font-bold text-slate-950 lg:text-lg'>{title}</h3>
        </a>
        {toolId && <FavoriteButton toolId={toolId} initialState={isFavorited} />}
      </div>
      <div className='flex flex-col gap-3'>
        {contextLabel === 'popular' && (
          <span className='inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'>
            <Flame className='size-3.5' />
            Trending
          </span>
        )}
        {contextLabel === 'latest' && (
          <span className='inline-flex w-fit items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700'>
            <Sparkles className='size-3.5' />
            New
          </span>
        )}
        {isFeatured && (
          <span className='inline-flex w-fit items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-1 text-xs font-semibold text-fuchsia-700'>
            <Megaphone className='size-3.5' />
            Featured
          </span>
        )}
        {freshnessLabel && (
          <span className='w-fit rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'>
            {freshnessLabel}
          </span>
        )}
        <p className='line-clamp-4 break-words text-sm leading-6 text-slate-600'>{content}</p>
        <div className='flex flex-wrap gap-2'>
          {toolId ? (
            <TrackableLink
              href={url}
              toolId={toolId}
              className='inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800'
            >
              {officialSiteLabel}
              <Sparkles className='size-3.5' />
            </TrackableLink>
          ) : (
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800'
            >
              {officialSiteLabel}
              <Sparkles className='size-3.5' />
            </a>
          )}
          {compareHref && compareLabel && (
            <Link
              href={compareHref}
              className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950'
            >
              <Sparkles className='size-3.5 text-cyan-700' />
              {compareActionLabel}
            </Link>
          )}
        </div>
        {toolId && (
          <RatingStars
            toolId={toolId}
            averageRating={averageRating}
            ratingCount={ratingCount}
            readonly
            size='sm'
            showStats
          />
        )}
      </div>
    </div>
  );
}

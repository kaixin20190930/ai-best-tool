import Link from 'next/link';
import { Flame, Megaphone, Sparkles } from 'lucide-react';

import { WebNavigationListRow } from '@/lib/data';

import FavoriteButton from '../FavoriteButton';
import BaseImage from '../image/BaseImage';
import RatingStars from '../RatingStars';

interface WebNavCardProps extends Omit<WebNavigationListRow, 'id'> {
  isFavorited?: boolean;
  toolId?: string;
  averageRating?: number;
  ratingCount?: number;
  contextLabel?: 'latest' | 'popular';
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

function getInitials(label: string): string {
  const parts = label
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'AI';
  }

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return initials || 'AI';
}

export default function WebNavCard({
  name,
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
  isFeatured,
}: WebNavCardProps) {
  const freshnessLabel = getFreshnessLabel(createdAt, updatedAt);
  const initials = getInitials(title);

  return (
    <div className='flex h-full flex-col gap-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md lg:p-4'>
      <Link href={`/ai/${name}`} title={title}>
        {thumbnailUrl ? (
          <BaseImage
            width={350}
            height={160}
            src={thumbnailUrl}
            alt={`${title} - AI tool screenshot and preview`}
            title={title}
            className='aspect-[350/160] w-full justify-self-center rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white object-contain p-2.5'
            sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 350px'
            loading='lazy'
          />
        ) : (
          <div className='flex aspect-[350/160] w-full justify-self-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-3'>
            <div className='flex h-full w-full flex-col justify-between rounded-lg bg-white/60 p-3 ring-1 ring-white/80'>
              <div className='flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400'>
                <span>Preview pending</span>
                <span className='rounded-full bg-slate-900 px-2 py-1 text-[9px] text-white'>{name}</span>
              </div>
              <div className='flex flex-1 items-center justify-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white shadow-sm'>
                  {initials}
                </div>
              </div>
              <p className='line-clamp-1 text-center text-[11px] text-slate-500'>Screenshot or logo to be added</p>
            </div>
          </div>
        )}
      </Link>
      <div className='flex items-center justify-between'>
        <a href={url} title={title} target='_blank' rel='noreferrer' className='hover:text-slate-700'>
          <h3 className='line-clamp-1 flex-1 text-base font-bold text-slate-950 lg:text-lg'>{title}</h3>
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
        <p className='line-clamp-4 text-sm leading-6 text-slate-600'>{content}</p>
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

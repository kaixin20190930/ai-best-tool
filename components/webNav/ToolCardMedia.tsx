'use client';

import { useEffect, useMemo, useState } from 'react';

import { isPlaceholderMediaUrl } from '@/lib/services/mediaReview';

type ToolCardMediaProps = {
  imageUrl?: string | null;
  name: string;
  thumbnailUrl?: string | null;
  title: string;
};

function getInitials(label: string): string {
  const parts = label
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'AI';
  }

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AI'
  );
}

export default function ToolCardMedia({ imageUrl, name, thumbnailUrl, title }: ToolCardMediaProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasFailedAllSources, setHasFailedAllSources] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sources = useMemo(
    () =>
      [
        imageUrl,
        thumbnailUrl,
        `/images/tool-media/${name}-editorial-cover.svg`,
        `/images/tool-media/${name}-cover.svg`,
      ].filter((value, index, array): value is string => {
        if (!value || array.indexOf(value) !== index) {
          return false;
        }

        return !isPlaceholderMediaUrl(value);
      }),
    [imageUrl, name, thumbnailUrl],
  );

  const currentSource = sources[sourceIndex];
  const initials = getInitials(title);
  const fallbackLabel = `${title} - preview unavailable`;
  const isLogoLikeSource =
    currentSource === imageUrl ||
    currentSource?.includes('/icons/tool-logos/') ||
    currentSource?.endsWith('.ico') ||
    currentSource?.includes('favicon');

  useEffect(() => {
    setHasLoaded(false);
  }, [currentSource]);

  if (!currentSource || hasFailedAllSources) {
    return (
      <div
        className='flex aspect-[350/160] w-full justify-self-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-3'
        aria-label={fallbackLabel}
      >
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
    );
  }

  return (
    <img
      src={currentSource}
      alt={`${title} - AI tool screenshot and preview`}
      className={[
        'aspect-[350/160] w-full justify-self-center rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white object-contain transition-opacity duration-200',
        isLogoLikeSource ? 'p-6' : 'p-2.5',
        hasLoaded ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      loading='lazy'
      decoding='async'
      onLoad={() => {
        setHasLoaded(true);
      }}
      onError={() => {
        setSourceIndex((current) => {
          if (current < sources.length - 1) {
            return current + 1;
          }

          setHasFailedAllSources(true);
          return current;
        });
      }}
    />
  );
}

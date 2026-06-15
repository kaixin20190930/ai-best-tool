/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export type ImageProps = React.ComponentProps<typeof Image>;

// Generate descriptive alt text from src if not provided
function generateAltFromSrc(src: string | undefined): string {
  if (!src) return 'Image';
  const filename =
    src
      .split('/')
      .pop()
      ?.replace(/\.(svg|png|jpg|jpeg|webp)$/i, '') || '';
  return filename.replace(/[-_]/g, ' ').trim() || 'Image';
}

export default function BaseImage(props: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const srcValue = typeof props.src === 'string' ? props.src : '';
  const isSvg = /\.svg(?:\?.*)?$/i.test(srcValue);
  const fallbackText = props.alt || generateAltFromSrc(props.src as string);

  useEffect(() => {
    setHasError(false);
    setHasLoaded(false);
  }, [props.src]);

  // Ensure alt text is always present and descriptive
  const altText = props.alt || (props.title as string) || generateAltFromSrc(props.src as string);

  if (hasError) {
    return (
      <div
        aria-label={fallbackText}
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 ${props.className || ''}`}
        style={props.style as React.CSSProperties | undefined}
      >
        <div className='flex min-h-[160px] w-full flex-col items-center justify-center gap-2 p-4 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-sm'>
            {fallbackText.slice(0, 2).toUpperCase() || 'AI'}
          </div>
          <p className='max-w-[22rem] text-sm font-medium text-slate-600'>{fallbackText}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={altText}
      className={`${props.className || ''} transition-opacity duration-200 ${hasLoaded ? 'visible opacity-100' : 'invisible opacity-0'}`}
      // SVG previews are more stable when served directly instead of through the optimizer.
      unoptimized={props.unoptimized ?? isSvg}
      // Use lazy loading by default unless priority is set
      loading={props.loading ?? (props.priority ? 'eager' : 'lazy')}
      // Blur placeholders are useful for raster images, but break or add noise for svg assets.
      placeholder={props.placeholder ?? (isSvg ? 'empty' : 'blur')}
      blurDataURL={
        isSvg
          ? undefined
          : props.blurDataURL ??
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='
      }
      onLoad={(event) => {
        setHasLoaded(true);
        props.onLoad?.(event);
      }}
      onError={(event) => {
        setHasError(true);
        props.onError?.(event);
      }}
    />
  );
}

'use client';

import { useState } from 'react';
import BaseImage from '@/components/image/BaseImage';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';

interface MediaGalleryProps {
  screenshots: string[];
  videoUrl?: string | null;
  title: string;
}

export default function MediaGallery({ screenshots, videoUrl, title }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Combine video and screenshots into media items
  const mediaItems = [
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ...screenshots.map(url => ({ type: 'image' as const, url }))
  ];

  if (mediaItems.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsVideoPlaying(false);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setIsVideoPlaying(false);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setIsVideoPlaying(false);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < mediaItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setIsVideoPlaying(false);
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        {mediaItems.map((item, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className='group relative aspect-video overflow-hidden rounded-lg border border-cyan-200 bg-cyan-50/50 transition-all hover:border-cyan-300 hover:shadow-lg'
          >
            {item.type === 'video' ? (
              <div className='relative h-full w-full'>
                <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-600 to-slate-700'>
                  <Play className='size-12 text-white opacity-80 transition-opacity group-hover:opacity-100' />
                </div>
                <span className='absolute bottom-2 left-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white'>
                  Video
                </span>
              </div>
            ) : (
              <BaseImage
                src={item.url}
                alt={`${title} - screenshot ${index + 1} showing features and interface`}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-110'
                loading='lazy'
              />
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90'
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className='absolute right-4 top-4 z-10 rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30'
            aria-label='Close'
          >
            <X className='size-6' />
          </button>

          {/* Navigation Buttons */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className='absolute left-4 z-10 rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30'
              aria-label='Previous'
            >
              <ChevronLeft className='size-6' />
            </button>
          )}

          {selectedIndex < mediaItems.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className='absolute right-4 z-10 rounded-full bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-30'
              aria-label='Next'
            >
              <ChevronRight className='size-6' />
            </button>
          )}

          {/* Media Content */}
          <div
            className='relative max-h-[90vh] max-w-[90vw]'
            onClick={(e) => e.stopPropagation()}
          >
            {mediaItems[selectedIndex].type === 'video' ? (
              <div className='relative aspect-video w-full max-w-4xl'>
                {isVideoPlaying ? (
                  <iframe
                    src={mediaItems[selectedIndex].url}
                    className='h-full w-full rounded-lg'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                ) : (
                  <div
                    className='flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-slate-700'
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className='size-20 text-white' />
                  </div>
                )}
              </div>
            ) : (
              <div className='relative max-h-[90vh] max-w-[90vw]'>
                <BaseImage
                  src={mediaItems[selectedIndex].url}
                  alt={`${title} - detailed screenshot ${selectedIndex + 1} showing features and interface`}
                  width={1920}
                  height={1080}
                  className='max-h-[90vh] max-w-[90vw] rounded-lg object-contain'
                  unoptimized={false}
                  priority
                />
              </div>
            )}

            {/* Counter */}
            <div className='mt-4 text-center text-sm text-white'>
              {selectedIndex + 1} / {mediaItems.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

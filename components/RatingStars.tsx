'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { submitRating } from '@/app/actions/ratings';

interface RatingStarsProps {
  toolId: string;
  currentRating?: number | null;
  averageRating?: number;
  ratingCount?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
}

export default function RatingStars({
  toolId,
  currentRating = null,
  averageRating = 0,
  ratingCount = 0,
  readonly = false,
  size = 'md',
  showStats = true
}: RatingStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(currentRating);
  const [isPending, startTransition] = useTransition();

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6'
  };

  const starSize = sizeClasses[size];

  const handleRating = async (rating: number) => {
    if (readonly || isPending) return;

    startTransition(async () => {
      const result = await submitRating(toolId, rating);
      
      if (result.success) {
        setUserRating(rating);
        toast.success(result.message || 'Rating submitted successfully');
      } else {
        if (result.error === 'You must be logged in to rate tools') {
          toast.error('Please log in to rate this tool');
        } else {
          toast.error(result.error || 'Failed to submit rating');
        }
      }
    });
  };

  const displayRating = readonly ? averageRating : (hoveredStar || userRating || 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isPartiallyFilled = !readonly && star === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              onMouseEnter={() => !readonly && setHoveredStar(star)}
              onMouseLeave={() => !readonly && setHoveredStar(null)}
              disabled={readonly || isPending}
              className={`transition-all ${
                readonly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110'
              } ${isPending ? 'opacity-50' : ''}`}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${starSize} transition-all ${
                  isFilled
                    ? 'fill-yellow-400 stroke-yellow-400'
                    : isPartiallyFilled
                    ? 'fill-yellow-200 stroke-yellow-400'
                    : 'fill-none stroke-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showStats && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">
            {averageRating && averageRating > 0 ? Number(averageRating).toFixed(1) : 'No ratings'}
          </span>
          {ratingCount > 0 && (
            <span className="text-slate-400">
              ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      )}

      {!readonly && userRating && (
        <p className="text-xs text-slate-500">
          Your rating: {userRating} star{userRating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

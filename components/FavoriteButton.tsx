'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFavorite } from '@/app/actions/favorites';

interface FavoriteButtonProps {
  toolId: string;
  initialState?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function FavoriteButton({ 
  toolId, 
  initialState = false,
  showLabel = false,
  className = ''
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavorite(toolId);
      
      if (result.success) {
        setIsFavorited(result.isFavorited);
        toast.success(result.message || (result.isFavorited ? 'Added to favorites' : 'Removed from favorites'));
      } else {
        if (result.error === 'You must be logged in to favorite tools') {
          toast.error('Please log in to favorite tools');
          // Optionally redirect to login
          // window.location.href = '/login';
        } else {
          toast.error(result.error || 'Failed to update favorite');
        }
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`group flex items-center gap-2 transition-all ${
        isPending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'
      } ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`size-6 transition-all ${
          isFavorited 
            ? 'fill-red-500 stroke-red-500' 
            : 'fill-none stroke-slate-700 group-hover:stroke-red-500'
        }`}
      />
      {showLabel && (
        <span className="text-sm font-medium text-slate-700">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}

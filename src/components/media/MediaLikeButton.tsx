'use client';

import React from 'react';
import { useMediaLikes } from '@/hooks/useMediaLikes';
import { Heart, ThumbsDown } from 'lucide-react';
import { clsx } from 'clsx';

interface MediaLikeButtonProps {
  mediaId: string;
  showCounts?: boolean;
  variant?: 'default' | 'compact';
}

export default function MediaLikeButton({
  mediaId,
  showCounts = true,
  variant = 'default',
}: MediaLikeButtonProps) {
  const {
    likesStatus,
    isLiked,
    isDisliked,
    isLoading,
    isLoadingStatus,
    toggleLike,
  } = useMediaLikes(mediaId);

  if (isLoadingStatus) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className={clsx(
      'flex gap-2',
      variant === 'compact' && 'gap-1'
    )}>
      {/* Like Button */}
      <button
        onClick={() => toggleLike('like')}
        disabled={isLoading}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50',
          variant === 'compact' && 'px-3 py-1.5',
          isLiked
            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
            : likesStatus.likeCount > 0
            ? 'bg-green-50 dark:bg-green-900/10 border-2 border-green-300 dark:border-green-700'
            : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-green-300 dark:hover:border-green-700'
        )}
        title={isLiked ? 'Retirer le like' : 'Liker'}
      >
        <Heart
          className={clsx(
            'w-5 h-5',
            variant === 'compact' && 'w-4 h-4',
            isLiked ? 'fill-green-500 text-green-500' : likesStatus.likeCount > 0 ? 'text-green-400' : 'text-gray-600 dark:text-gray-400'
          )}
        />
        {showCounts && (
          <span className={clsx(
            'text-sm font-medium',
            variant === 'compact' && 'text-xs',
            isLiked ? 'text-green-600 dark:text-green-400' : likesStatus.likeCount > 0 ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
          )}>
            {likesStatus.likeCount}
          </span>
        )}
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => toggleLike('dislike')}
        disabled={isLoading}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50',
          variant === 'compact' && 'px-3 py-1.5',
          isDisliked
            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
            : likesStatus.dislikeCount > 0
            ? 'bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-300 dark:border-blue-700'
            : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700'
        )}
        title={isDisliked ? 'Retirer le dislike' : 'Disliker'}
      >
        <ThumbsDown
          className={clsx(
            'w-5 h-5',
            variant === 'compact' && 'w-4 h-4',
            isDisliked ? 'fill-blue-500 text-blue-500' : likesStatus.dislikeCount > 0 ? 'text-blue-400' : 'text-gray-600 dark:text-gray-400'
          )}
        />
        {showCounts && (
          <span className={clsx(
            'text-sm font-medium',
            variant === 'compact' && 'text-xs',
            isDisliked ? 'text-blue-600 dark:text-blue-400' : likesStatus.dislikeCount > 0 ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
          )}>
            {likesStatus.dislikeCount}
          </span>
        )}
      </button>
    </div>
  );
}

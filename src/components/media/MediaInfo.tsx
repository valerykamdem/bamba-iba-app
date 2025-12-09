'use client';

import React from 'react';
import MediaLikeButton from '@/components/media/MediaLikeButton';

interface MediaInfoProps {
  video?: any;
  audio?: any;
  media?: any;
}

/**
 * Unified MediaInfo component that displays information about video or audio content
 * Supports both legacy video/audio props and new unified media object
 */
export default function MediaInfo({ video, audio, media }: MediaInfoProps) {
  // Normalize data: prefer explicit video/audio props, fall back to media object
  const data = video || audio || media;
  const isAudio = !!(audio || (media && media.type === 'audio'));

  if (!data) return null;

  // Map properties to common shape
  const title = data.title || '';
  const description = data.description || '';
  const duration = data.duration || '';
  const creator = data.channel || data.speaker || '';
  const timestamp = data.timestamp || '';
  const likes = data.likes || 0;
  const views = data.views || `${data.plays || 0}`;
  const thumbnail = data.thumbnail || data.coverImageUrl || '';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 space-y-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Creator and metadata */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {creator}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timestamp}
            </p>
          </div>
        </div>
        <MediaLikeButton mediaId={data.id} />
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
        <span>{views} {isAudio ? 'plays' : 'views'}</span>
        <span>{likes} likes</span>
        {duration && <span>{duration}</span>}
      </div>

      {/* Description */}
      {description && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            About
          </h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

interface MediaRecommendationsProps {
  videos?: any[];
  audios?: any[];
  videos_or_audios?: any[];
}

/**
 * Unified MediaRecommendations component displaying related content
 * Handles both video and audio media types
 */
export default function MediaRecommendations({ 
  videos, 
  audios,
  videos_or_audios
}: MediaRecommendationsProps) {
  const items = videos || audios || videos_or_audios || [];
  const isAudio = !!(audios || (videos_or_audios && videos_or_audios[0]?.type === 'audio'));
  const basePath = isAudio ? '/listen' : '/watch';

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Recommended {isAudio ? 'Audio' : 'Videos'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.id}`}
            className="group"
          >
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              {(item.thumbnail || item.coverImageUrl) && (
                <div className="relative w-full h-40 bg-gray-300 dark:bg-gray-600 overflow-hidden">
                  <img
                    src={item.thumbnail || item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {item.duration}
                    </span>
                  )}
                </div>
              )}
              
              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.channel || item.speaker}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {item.views || item.plays || 0} {isAudio ? 'plays' : 'views'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

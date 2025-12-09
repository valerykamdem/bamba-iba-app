'use client';

import { Play, Calendar, Youtube } from 'lucide-react';
import { YouTubeVideo } from '@/types/youtube';
import Link from 'next/link';

interface YouTubeCardProps {
    video: YouTubeVideo;
}

export default function YouTubeCard({ video }: YouTubeCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays < 1) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Hier';
        if (diffDays < 30) return `Il y a ${diffDays}j`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <Link href={`/youtube/${video.id}`} className="group cursor-pointer block">
            <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                {/* Thumbnail Background */}
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* YouTube Badge */}
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Youtube className="w-3.5 h-3.5" />
                        YouTube
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-20 h-20 bg-red-600/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play
                                className="w-10 h-10 text-white ml-1.5"
                                fill="currentColor"
                            />
                        </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                            {video.duration}
                        </div>
                    )}

                    {/* Content Overlay - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="space-y-2">
                            {/* Title */}
                            <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-lg">
                                {video.title}
                            </h3>

                            {/* Description */}
                            {video.description && (
                                <p className="text-sm text-white/80 line-clamp-2">
                                    {video.description}
                                </p>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-3 text-xs text-white/80 font-medium">
                                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(video.publishedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

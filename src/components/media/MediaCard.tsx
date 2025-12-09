import { Play, Eye, Calendar, Music, Video as VideoIcon } from 'lucide-react';
import { Media } from '@/types/media';
import Link from 'next/link';

interface MediaCardProps {
    media: Media;
}

export default function MediaCard({ media }: MediaCardProps) {
    const href = media.type === 'audio' ? `/listen/${media.id}` : `/watch/${media.id}`;

    return (
        <Link href={href} className="group cursor-pointer block">
            <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                {/* Thumbnail Background */}
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                        src={media.thumbnail}
                        alt={media.title}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* Media Type Badge */}
                    <div className={`absolute top-3 left-3 ${media.type === 'audio'
                        ? 'bg-purple-600/90'
                        : 'bg-blue-600/90'
                        } backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg`}>
                        {media.type === 'audio' ? (
                            <>
                                <Music className="w-3.5 h-3.5" />
                                Audio
                            </>
                        ) : (
                            <>
                                <VideoIcon className="w-3.5 h-3.5" />
                                Vidéo
                            </>
                        )}
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className={`w-20 h-20 ${media.type === 'audio' ? 'bg-purple-600/95' : 'bg-white/95'
                            } backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300`}>
                            <Play
                                className={`w-10 h-10 ${media.type === 'audio' ? 'text-white' : 'text-blue-600'
                                    } ml-1.5`}
                                fill="currentColor"
                            />
                        </div>
                    </div>

                    {/* Duration Badge */}
                    {media.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                            {media.duration}
                        </div>
                    )}

                    {/* Content Overlay - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="space-y-2">
                            {/* Title */}
                            <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-lg">
                                {media.title}
                            </h3>

                            {/* Speaker & Category */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`w-8 h-8 rounded-full ${media.type === 'audio'
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                        } flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white/30`}>
                                        {media.speaker[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-white/90 font-medium truncate">
                                            {media.speaker}
                                        </p>
                                        <p className="text-xs text-white/70 truncate">
                                            {media.category}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Views & Date */}
                            <div className="flex items-center gap-3 text-xs text-white/80 font-medium">
                                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <Eye className="w-3.5 h-3.5" />
                                    {media.plays}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {media.timestamp}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

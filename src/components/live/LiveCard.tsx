'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Mic, Video } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Live } from '@/lib/api/lives';
import { motion } from 'framer-motion';

interface LiveCardProps {
    live: Live;
    onPlay?: () => void;
}

export default function LiveCard({ live, onPlay }: LiveCardProps) {
    const isAudio = live.type === 'audio';

    const handlePlayClick = (e: React.MouseEvent) => {
        if (onPlay) {
            e.preventDefault();
            e.stopPropagation();
            onPlay();
        }
    };

    return (
        <Link href={`/live/${live.id}`}>
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
            >
                <Card hover className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 group">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                        {live.thumbnailUrl ? (
                            <Image
                                src={live.thumbnailUrl}
                                alt={live.title}
                                fill
                                className="object-cover"
                            />
                        ) : isAudio ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mic className="w-12 h-12 text-purple-500 dark:text-purple-400 opacity-50" />
                            </div>
                        ) : null}

                        {/* LIVE Badge */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            <Badge variant="live">LIVE</Badge>
                            <Badge variant="primary" size="sm" className="bg-black/50 text-white border-none backdrop-blur-sm">
                                {isAudio ? <Mic className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                                {isAudio ? 'AUDIO' : 'VIDÉO'}
                            </Badge>
                        </div>

                        {/* Play Button Overlay for Audio */}
                        {isAudio && onPlay && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={handlePlayClick}
                                    className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                >
                                    <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Viewers */}
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-sm rounded flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {live.viewers.toLocaleString()}
                        </div>

                        {/* Hover overlay (only if not audio/playable to avoid double overlay) */}
                        {!onPlay && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <div className="flex gap-3">
                            <Avatar
                                src={live.channelAvatar}
                                alt={live.channelName}
                                fallback={live.channelName.charAt(0)}
                            />

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                                    {live.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{live.channelName}</p>
                                {live.category && (
                                    <Badge variant="primary" size="sm" className="mt-2">
                                        {live.category}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </Link>
    );
}

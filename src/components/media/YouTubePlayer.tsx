'use client';

import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
import { useState } from 'react';

interface YouTubePlayerProps {
    url: string;
    title?: string;
}

export default function YouTubePlayer({ url, title }: YouTubePlayerProps) {
    const [isReady, setIsReady] = useState(false);

    return (
        <div className="relative w-full">
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white/80 text-sm">Chargement de la vidéo...</p>
                        </div>
                    </div>
                )}

                <ReactPlayer
                    key={url}
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    onReady={() => setIsReady(true)}
                    onError={(e) => console.error('YouTube Player Error:', e)}
                    config={{
                        youtube: {
                            playerVars: {
                                modestbranding: 1,
                            },
                        },
                    }}
                    className="absolute top-0 left-0"
                />
            </div>

            {title && (
                <div className="mt-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h1>
                </div>
            )}
        </div>
    );
}

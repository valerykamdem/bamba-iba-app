import { YouTubeVideo } from '@/types/youtube';
import YouTubeCard from './YouTubeCard';

interface YouTubeGridProps {
    videos: YouTubeVideo[];
}

export default function YouTubeGrid({ videos }: YouTubeGridProps) {
    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Aucune vidéo disponible
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Les vidéos seront bientôt disponibles.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
                <YouTubeCard key={video.id} video={video} />
            ))}
        </div>
    );
}

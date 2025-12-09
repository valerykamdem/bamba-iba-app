import YouTubePlayer from '@/components/media/YouTubePlayer';
import { YouTubeVideo } from '@/types/youtube';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
    params: Promise<{
        videoId: string;
    }>;
}

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/youtube`, {
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.videos || [];
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}

export default async function VideoPage({ params }: PageProps) {
    const { videoId } = await params;
    const videos = await getYouTubeVideos();
    const video = videos.find(v => v.id === videoId);

    if (!video) {
        notFound();
    }

    // Get other videos (excluding current one)
    const otherVideos = videos.filter(v => v.id !== videoId);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Link
                        href="/youtube"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Retour aux vidéos
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video Player */}
                            <YouTubePlayer url={video.url} />

                            {/* Video Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {video.title}
                                </h1>

                                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(video.publishedAt)}
                                    </span>
                                    {video.views !== undefined && (
                                        <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                            <Eye className="w-4 h-4" />
                                            {video.views.toLocaleString()} vues
                                        </span>
                                    )}
                                    {video.duration && (
                                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                            Durée: {video.duration}
                                        </span>
                                    )}
                                </div>

                                {video.description && (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Description
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                            {video.description}
                                        </p>
                                    </div>
                                )}

                                {/* Watch on YouTube Link */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                        Voir sur YouTube
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Other Videos */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    Autres vidéos
                                </h2>

                                {otherVideos.length > 0 ? (
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                        {otherVideos.slice(0, 10).map((otherVideo) => (
                                            <Link
                                                key={otherVideo.id}
                                                href={`/youtube/${otherVideo.id}`}
                                                className="group block"
                                            >
                                                <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <div className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden">
                                                        <img
                                                            src={otherVideo.thumbnail}
                                                            alt={otherVideo.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        {otherVideo.duration && (
                                                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                                                {otherVideo.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                            {otherVideo.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {formatDate(otherVideo.publishedAt)}
                                                        </p>
                                                        {otherVideo.views !== undefined && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {otherVideo.views.toLocaleString()} vues
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Aucune autre vidéo disponible.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

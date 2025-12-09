import MainLayout from '@/components/layout/MainLayout';
import YouTubeGrid from '@/components/media/YouTubeGrid';
import { YouTubeVideo } from '@/types/youtube';
import { Youtube } from 'lucide-react';

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/youtube`, {
            next: { revalidate: 300 } // Revalider toutes les 5 minutes
        });

        if (!response.ok) {
            console.error('Failed to fetch YouTube videos');
            return [];
        }

        const data = await response.json();
        return data.videos || [];
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}

export default async function YouTubePage() {
    const videos = await getYouTubeVideos();

    return (
        <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Youtube className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
                                Bamba Iba
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Chaîne YouTube officielle
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Découvrez toutes les vidéos de notre chaîne YouTube. Nous partageons des contenus
                            spirituels, des enseignements et bien plus encore pour enrichir votre vie de foi.
                        </p>
                        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {videos.length} vidéos
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Dernières vidéos
                    </h2>
                    <YouTubeGrid videos={videos} />
                </div>

                {/* Info Section */}
                <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        🔄 Mise à jour automatique
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Les vidéos sont automatiquement récupérées depuis la chaîne YouTube via le flux RSS.
                        La liste se met à jour toutes les 5 minutes pour afficher les dernières publications.
                    </p>
                </div>
            </div>
        </div>
        </MainLayout>
    );
}

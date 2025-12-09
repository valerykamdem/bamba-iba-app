'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import MediaGrid from '@/components/media/MediaGrid';
import { mediaApi } from '@/lib/api/media';
import { Media } from '@/types/media';

export default function MediaPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize , setPageSize] = useState(100);

    useEffect(() => {
        fetchMedia();
    }, [currentPage, pageSize, searchQuery]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await mediaApi.list({
                page: currentPage,
                pageSize: pageSize,
                search: searchQuery,
            });
            setMedia(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotalCount(response.pagination.totalCount);
        } catch (err) {
            console.error('Error fetching media:', err);
            setError('Erreur lors du chargement des médias');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMedia();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MainLayout>           
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Médiathèque
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Découvrez tous nos contenus audio et vidéo
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un média..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </form>

                    {/* Stats */}
                    {!loading && !error && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {totalCount} média{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                            <button
                                onClick={fetchMedia}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {/* Media Grid */}
                    {!loading && !error && (
                        <MediaGrid
                            media={media}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

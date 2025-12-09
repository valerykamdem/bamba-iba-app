'use client';

import { useQuery } from '@tanstack/react-query';
import { livesApi } from '@/lib/api/lives';
import LiveCard from '@/components/live/LiveCard';
import MainLayout from '@/components/layout/MainLayout';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Tv } from 'lucide-react';

export default function LivePage() {
    const { data: lives, isLoading, error } = useQuery({
        queryKey: ['lives', 'active'],
        queryFn: () => livesApi.getActive(),
        refetchInterval: 10000, // Refresh toutes les 10s
    });

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Tv className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Lives en cours</h1>
                            <Badge variant="live">LIVE</Badge>
                        </div>
                        <p className="text-gray-600">
                            Découvrez les diffusions en direct de vos créateurs préférés
                        </p>
                    </div>

                    {lives && lives.length > 0 && (
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{lives.length}</p>
                            <p className="text-sm text-gray-600">Lives actifs</p>
                        </div>
                    )}
                </div>

                {/* Lives Grid */}
                {isLoading ? (
                    <GridSkeleton count={6} />
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Erreur lors du chargement des lives</p>
                    </div>
                ) : lives && lives.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {lives.map((live) => (
                            <LiveCard key={live.id} live={live} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Aucun live en cours
                        </h3>
                        <p className="text-gray-500">
                            Revenez plus tard pour découvrir de nouvelles diffusions !
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

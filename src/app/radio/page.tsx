'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { radioApi, RadioStation } from '@/lib/api/radio';
import StationCard from '@/components/radio/StationCard';
import RadioSchedule from '@/components/radio/RadioSchedule';
import { Radio as RadioIcon, PlayCircle } from 'lucide-react';
import { GridSkeleton } from '@/components/ui/Skeleton';
import MainLayout from '@/components/layout/MainLayout';
import StickyRadioPlayer from '@/components/radio/StickyRadioPlayer';
import RadioHeroPlayer from '@/components/radio/RadioHeroPlayer';
import RadioChat from '@/components/radio/RadioChat';
import { useRadioStore } from '@/store/useRadioStore';
import { Station } from '@/types/radio';


export default function RadioPage() {
    const { data: stations, isLoading, error } = useQuery({
        queryKey: ['radio', 'stations'],
        queryFn: () => radioApi.getStations(),
        retry: 2, // Retry failed requests twice
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    const { initializeFirstStation, isInitialized } = useRadioStore();

    // Auto-initialize first station on page load
    useEffect(() => {
        if (stations && stations.length > 0 && !isInitialized) {
            console.log('📻 Initializing first available station...', stations);
            const firstStation = stations[0];

            // Validate that we have a valid stream URL
            const streamUrl = firstStation.listen_url || firstStation.hls_url;
            if (!streamUrl) {
                console.error('❌ First station has no valid stream URL:', firstStation);
                return;
            }

            // Convert Station to RadioStation
            const radioStation: RadioStation = {
                id: firstStation.id.toString(),
                name: firstStation.name,
                streamUrl: streamUrl,
                logo: '',
                genre: firstStation.description || 'Radio',
                description: firstStation.description,
            };

            console.log('✅ Converted station:', radioStation);
            // Initialize and start playing first station
            initializeFirstStation(radioStation, firstStation.id);
        } else if (stations && stations.length === 0) {
            console.warn('⚠️ No stations available from API');
        }
    }, [stations, isInitialized, initializeFirstStation]);

    // Check if we have multiple stations
    const hasMultipleStations = stations && stations.length > 1;
    const hasStations = stations && stations.length > 0;

    return (
        <MainLayout>
            <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-24">
                {/* Hero Player - Data comes from SignalR hub */}
                <RadioHeroPlayer isLoading={isLoading} stations={stations} />

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200 text-sm">
                            ❌ Erreur lors du chargement des stations radio. Veuillez réessayer plus tard.
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && !hasStations && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            ⚠️ Aucune station radio n'est disponible pour le moment.
                        </p>
                    </div>
                )}

                {/* Content Grid - Responsive layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
                    {/* Main Content Area - Chat takes priority on larger screens */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">En direct</h2>
                        </div>

                        {/* Chat - Prominent placement */}
                        <RadioChat />

                        {/* Sticky Player - Only visible when playing */}
                        <StickyRadioPlayer />
                    </div>

                    {/* Sidebar - Schedule */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                            <RadioSchedule />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

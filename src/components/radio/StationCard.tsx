'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RadioStation } from '@/lib/api/radio';
import { Station } from '@/types/radio';
import { useRadioStore } from '@/store/useRadioStore';
import { Play, Pause, Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface StationCardProps {
    station: Station | RadioStation;
}

// Helper to convert Station to RadioStation
function toRadioStation(station: Station | RadioStation): RadioStation {
    // Check if already RadioStation
    if ('streamUrl' in station) {
        return station as RadioStation;
    }

    // Convert Station to RadioStation
    const s = station as Station;
    return {
        id: s.id.toString(),
        name: s.name,
        streamUrl: s.listen_url || s.hls_url,
        logo: '', // Stations don't have a direct logo, will use song art later
        genre: s.description || 'Radio',
        description: s.description,
    };
}

function StationCard({ station }: StationCardProps) {
    const radioStation = toRadioStation(station);

    // Use specific selectors to avoid re-rendering on every store update (like time updates)
    const isCurrentStation = useRadioStore(state => state.currentStation?.id === radioStation.id);
    const isPlaying = useRadioStore(state => state.isPlaying);
    const isFav = useRadioStore(state => state.favorites.includes(radioStation.id));
    const play = useRadioStore(state => state.play);
    const pause = useRadioStore(state => state.pause);
    const toggleFavorite = useRadioStore(state => state.toggleFavorite);
    const selectStation = useRadioStore(state => state.selectStation);

    const [isLoading, setIsLoading] = useState(false);

    const handlePlayPause = async () => {
        if (isCurrentStation && isPlaying) {
            pause();
        } else {
            setIsLoading(true);
            try {
                // Check if this is a Station type (from API) with numeric ID
                if ('listen_url' in station || 'hls_url' in station) {
                    const originalStation = station as Station;
                    // Call selectStation API to refresh broadcast information
                    await selectStation(originalStation.id);
                }
                // Then play the station
                play(radioStation);
            } catch (error) {
                console.error('Erreur lors de la sélection de la station:', error);
                // Even if selectStation fails, still try to play the station
                play(radioStation);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card hover className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {/* Logo */}
                <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                    {radioStation.logo && (
                        <Image
                            src={radioStation.logo}
                            alt={radioStation.name}
                            fill
                            className="object-cover"
                        />
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handlePlayPause}
                            disabled={isLoading}
                            className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                            ) : isCurrentStation && isPlaying ? (
                                <Pause className="w-8 h-8 text-blue-600" fill="currentColor" />
                            ) : (
                                <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
                            )}
                        </button>
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={() => toggleFavorite(radioStation.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                        <Heart
                            className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                        />
                    </button>

                    {/* Playing Indicator */}
                    {isCurrentStation && isPlaying && (
                        <div className="absolute bottom-3 left-3">
                            <Badge variant="live" size="sm">EN DIRECT</Badge>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {radioStation.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{radioStation.genre}</p>
                    {radioStation.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                            {radioStation.description}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

export default memo(StationCard);

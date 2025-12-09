'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Radio, Signal, Users, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import { useRadioHub } from '@/hooks/useRadioHub';
import { RadioStation } from '@/lib/api/radio';
import { Station } from '@/types/radio';
import StationCard from './StationCard';

interface RadioHeroPlayerProps {
    isLoading?: boolean;
    stations?: (Station | RadioStation)[];
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

export default function RadioHeroPlayer({ isLoading = false, stations = [] }: RadioHeroPlayerProps) {
    const { isPlaying, currentStation, play, pause, volume, setVolume, nowPlaying, listeners } = useRadioStore();
    const { isConnected } = useRadioHub();
    const [isMuted, setIsMuted] = useState(false);
    const [localVolume, setLocalVolume] = useState(volume);
    const [elapsedTime, setElapsedTime] = useState("00:00:00");

    // Sync volume
    useEffect(() => {
        setLocalVolume(volume);
    }, [volume]);

    // Timer logic
    useEffect(() => {
        const updateTimer = () => {
            if (!nowPlaying?.played_at) {
                // Fallback si pas de timestamp joué
                if (nowPlaying?.elapsed) {
                    const elapsed = nowPlaying.elapsed;
                    const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
                    const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
                    const seconds = (elapsed % 60).toString().padStart(2, '0');
                    setElapsedTime(`${hours}:${minutes}:${seconds}`);
                } else {
                    setElapsedTime("00:00:00");
                }
                return;
            }

            const now = Math.floor(Date.now() / 1000);
            const start = nowPlaying.played_at;
            let elapsed = now - start;
            if (elapsed < 0) elapsed = 0;

            const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');

            setElapsedTime(`${hours}:${minutes}:${seconds}`);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(timer);
    }, [nowPlaying]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setLocalVolume(newVolume);
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(localVolume || 0.5);
            setIsMuted(false);
        } else {
            setLocalVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const defaultStation: RadioStation = {
        id: 'main',
        name: 'Bambaiba Radio',
        streamUrl: 'https://stream.bambaiba.com/radio',
        logo: '/images/radio-logo.png',
        genre: 'Généraliste',
        description: 'La voix de la communauté'
    };

    // Determine active station
    const activeStation = currentStation || (stations.length > 0 ? toRadioStation(stations[0]) : defaultStation);

    // Data display
    const songTitle = nowPlaying?.song?.title || nowPlaying?.song?.text || 'Bambaiba Radio';
    const songArtist = nowPlaying?.song?.artist || 'En direct';
    const albumArt = nowPlaying?.song?.art;
    const listenersCount = listeners?.current || 0;
    const isOnline = isConnected;



    return (
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[420px] w-full">
            {/* Player Container - RESTORED ORIGINAL DESIGN */}
            <div className="relative flex-1 min-h-[400px] sm:bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group order-1 lg:order-1">
                {/* Background Gradient with Overlay & Visualizer */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
                    {/* Blurred Art bg */}
                    {albumArt && (
                        <div className="absolute inset-0 opacity-30 transition-opacity duration-1000">
                            <Image src={albumArt} alt="" fill className="object-cover blur-3xl" unoptimized />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 mix-blend-overlay" />
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-white text-sm font-medium">Chargement...</p>
                        </div>
                    </div>
                )}

                {/* Visualizer Animation RE-ADDED */}
                <div className="absolute bottom-0 left-0 right-0 h-24 md:h-48 hidden sm:flex items-end justify-center gap-0.5 md:gap-1 opacity-30 pointer-events-none z-0">
                    {[...Array(24)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 md:w-2 bg-white rounded-t-full"
                            animate={{
                                height: isPlaying ? [10, Math.random() * 60 + 10, 10] : 10,
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.05,
                            }}
                        />
                    ))}
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between z-10">
                    {/* Top Bar */}
                    <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className={`flex items-center gap-2 ${isOnline ? 'bg-white/10' : 'bg-red-900/30'} backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10`}>
                                <div className="relative">
                                    {isOnline && <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-pulse" />}
                                    <Signal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isOnline ? 'text-white' : 'text-red-400'}`} />
                                </div>
                                <span className="text-white font-bold tracking-wider text-xs">{isOnline ? 'EN DIRECT' : 'HORS LIGNE'}</span>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 font-mono text-white font-medium text-xs">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                {elapsedTime}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-white/80 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{listenersCount}</span>
                        </div>
                    </div>

                    {/* Main Info - Center section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6 flex-1 py-2">
                        <div className="space-y-2 max-w-full sm:max-w-md lg:max-w-lg text-center sm:text-left order-2 sm:order-1 flex-1 min-w-0">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-300 font-medium tracking-wide uppercase text-xs">
                                <Radio className="w-3.5 h-3.5" />
                                <span className="truncate">{activeStation?.name || 'Aucune station'}</span>
                            </div>

                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                                {songTitle}
                            </h1>

                            <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-300">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 overflow-hidden relative flex-shrink-0 border border-white/10">
                                    {albumArt ? (
                                        <Image src={albumArt} alt={songTitle} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                                            <Radio className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-white font-semibold text-sm sm:text-base truncate">{songArtist}</p>
                                    <p className="text-xs opacity-70 truncate">{nowPlaying?.playlist || 'En continu'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Big Play Button Restored */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!activeStation) return;
                                isPlaying ? pause() : play(activeStation);
                            }}
                            className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow order-1 sm:order-2 flex-shrink-0"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 fill-current" />
                            ) : (
                                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 fill-current ml-1" />
                            )}
                        </motion.button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => activeStation && useRadioStore.getState().toggleFavorite(activeStation.id.toString())}
                                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                            >
                                <Heart className={`w-4 h-4 ${activeStation && useRadioStore.getState().isFavorite(activeStation.id.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="hidden lg:inline text-xs sm:text-sm">Favoris</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden lg:inline text-xs sm:text-sm">Partager</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-28 sm:w-40">
                            <button onClick={toggleMute} className="text-white/80 hover:text-white flex-shrink-0">
                                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stations Sidebar (Right) - Reduced size */}
            <div className="lg:w-72 w-full lg:flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[300px] lg:h-auto order-2 lg:order-2">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                        <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Stations
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    {stations.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                            <Signal className="w-6 h-6 mb-2 opacity-50" />
                            <p className="text-xs">Aucune station</p>
                        </div>
                    ) : (
                        stations.map((station, index) => (
                            <div key={station.id} className="relative transform scale-95 origin-left w-full">
                                <StationCard station={station} />
                                {currentStation?.id.toString() === station.id.toString() && isPlaying && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg animate-pulse" />
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

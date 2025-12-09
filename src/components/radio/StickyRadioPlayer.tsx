'use client';

import { useRadioStore } from '@/store/useRadioStore';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

export default function StickyRadioPlayer() {
    const { isPlaying, currentStation, volume, play, pause, stop, setVolume } = useRadioStore();

    if (!currentStation) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl z-50"
            >
                <div className="max-w-screen-2xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Station Logo */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                            {currentStation.logo ? (
                                <Image
                                    src={currentStation.logo}
                                    alt={currentStation.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                                    {currentStation.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Station Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{currentStation.name}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {currentStation.genre} • En direct
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button
                                onClick={() => (isPlaying ? pause() : play(currentStation))}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" fill="white" />
                                ) : (
                                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                                )}
                            </button>

                            {/* Volume */}
                            <div className="hidden md:flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-gray-300" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:h-3
                           [&::-webkit-slider-thumb]:bg-white
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <span className="text-sm text-gray-400 w-10 text-right">
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>

                            {/* Close */}
                            <button
                                onClick={stop}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audio Player */}
                <ReactPlayer
                    url={currentStation.streamUrl}
                    playing={isPlaying}
                    volume={volume}
                    width="0"
                    height="0"
                />
            </motion.div>
        </AnimatePresence>
    );
}

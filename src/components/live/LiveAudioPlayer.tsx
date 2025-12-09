'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { clsx } from 'clsx';

interface LiveAudioPlayerProps {
    streamUrl: string;
    autoPlay?: boolean;
    poster?: string;
}

export default function LiveAudioPlayer({ streamUrl, autoPlay = true, poster }: LiveAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.7);

    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(audio);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                    audio.play().catch(() => setIsPlaying(false));
                }
            });

            return () => hls.destroy();
        }
        else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = streamUrl;
            if (autoPlay) {
                audio.play().catch(() => setIsPlaying(false));
            }
        }
    }, [streamUrl, autoPlay]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <audio ref={audioRef} className="hidden" />

            {/* Visualizer / Poster */}
            <div className="relative aspect-video md:aspect-[3/1] bg-gradient-to-br from-gray-800 to-gray-900">
                {poster ? (
                    <img src={poster} alt="Cover" className="w-full h-full object-cover opacity-50" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Radio className="w-16 h-16 text-gray-600 animate-pulse" />
                    </div>
                )}

                {/* Waveform Animation (Fake) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 px-4 pb-4 opacity-50">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "w-2 bg-blue-500 rounded-t-sm transition-all duration-150",
                                isPlaying ? "animate-music-bar" : "h-2"
                            )}
                            style={{
                                height: isPlaying ? `${Math.random() * 100}%` : '10%',
                                animationDelay: `${i * 0.05}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-900/90 backdrop-blur border-t border-gray-800">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all hover:scale-105"
                    >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>

                    <div className="flex-1">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setVolume(val);
                                if (audioRef.current) audioRef.current.volume = val;
                            }}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

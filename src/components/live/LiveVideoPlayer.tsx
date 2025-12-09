'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { clsx } from 'clsx';

interface LiveVideoPlayerProps {
    streamUrl: string;
    autoPlay?: boolean;
}

export default function LiveVideoPlayer({ streamUrl, autoPlay = true }: LiveVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.7);

    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        // Support HLS.js
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                    video.play();
                }
            });

            return () => hls.destroy();
        }
        // Support natif Safari
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            if (autoPlay) {
                video.play();
            }
        }
    }, [streamUrl, autoPlay]);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <div className="relative group bg-black rounded-lg overflow-hidden aspect-video">
            <video
                ref={videoRef}
                className="w-full h-full"
                playsInline
            />

            {/* Controls overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    {/* Progress bar */}
                    <div className="h-1 bg-white/30 rounded-full">
                        <div className="h-full w-0 bg-red-500 rounded-full" />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={togglePlay}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 text-white" fill="white" />
                                ) : (
                                    <Play className="w-6 h-6 text-white" fill="white" />
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20"
                                />
                            </div>

                            <span className="ml-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                LIVE
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <Settings className="w-5 h-5 text-white" />
                            </button>

                            <button
                                onClick={toggleFullscreen}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Maximize className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

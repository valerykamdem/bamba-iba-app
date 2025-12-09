'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Repeat, Shuffle, Maximize, Minimize, Settings, Subtitles,
    FastForward, Rewind, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface MediaPlayerProps {
    type: 'audio' | 'video';
    src: string;
    poster?: string;
    title: string;
    subtitle?: string;
    autoPlay?: boolean;
    qualities?: { quality: string; videoUrl: string }[];
    subtitles?: { language: string; url: string }[];
    nextUrl?: string;
}

export default function MediaPlayer({
    type, src, poster, title, subtitle, autoPlay = false,
    qualities = [], subtitles = [], nextUrl
}: MediaPlayerProps) {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [currentQuality, setCurrentQuality] = useState(src);
    const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(false);

    const mediaRef = useRef<HTMLMediaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (mediaRef.current) {
            mediaRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (mediaRef.current) {
            mediaRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        // Update source when quality changes
        if (mediaRef.current && currentQuality !== mediaRef.current.src) {
            const currentTime = mediaRef.current.currentTime;
            const wasPlaying = !mediaRef.current.paused;

            mediaRef.current.src = currentQuality;
            mediaRef.current.currentTime = currentTime;

            if (wasPlaying) {
                mediaRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentQuality]);

    useEffect(() => {
        if (autoPlay && mediaRef.current) {
            mediaRef.current.play().catch(() => {
                setIsPlaying(false);
            });
        }
    }, [autoPlay]);

    const togglePlay = () => {
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
            } else {
                mediaRef.current.play();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (mediaRef.current) {
            setCurrentTime(mediaRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (mediaRef.current) {
            setDuration(mediaRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (mediaRef.current) {
            mediaRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleFastSeek = (seconds: number) => {
        if (mediaRef.current) {
            mediaRef.current.currentTime = Math.min(Math.max(mediaRef.current.currentTime + seconds, 0), duration);
        }
    };

    const toggleMute = () => {
        if (mediaRef.current) {
            mediaRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        if (type === 'video') {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false);
                }, 3000);
            }
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className={clsx(
                "group relative bg-black rounded-2xl overflow-hidden shadow-xl",
                type === 'audio' ? "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800" : "aspect-video"
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => type === 'video' && isPlaying && setShowControls(false)}
        >
            {/* Media Area */}
            <div className={clsx(
                "relative",
                type === 'audio' ? "aspect-video md:aspect-[21/9] bg-gray-900" : "w-full h-full"
            )}>
                {type === 'audio' ? (
                    <>
                        <img
                            src={poster}
                            alt={title}
                            className="w-full h-full object-cover opacity-50 blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={poster}
                                alt={title}
                                className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-xl shadow-2xl"
                            />
                        </div>
                        <audio
                            ref={mediaRef as React.RefObject<HTMLAudioElement>}
                            src={currentQuality}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => {
                                setIsPlaying(false);
                                if (nextUrl) router.push(nextUrl);
                            }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    </>
                ) : (
                    <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        src={currentQuality}
                        poster={poster}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => {
                            setIsPlaying(false);
                            setShowControls(true);
                            if (nextUrl) router.push(nextUrl);
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                        onDoubleClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x < rect.width / 2) {
                                handleFastSeek(-10);
                            } else {
                                handleFastSeek(10);
                            }
                        }}
                    />
                )}
            </div>

            {/* Controls Overlay */}
            <div className={clsx(
                "transition-opacity duration-300",
                type === 'video'
                    ? `absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 md:p-6 ${showControls ? 'opacity-100' : 'opacity-0'}`
                    : "p-6 space-y-6"
            )}>
                {type === 'audio' && (
                    <div className="flex flex-col items-center text-center space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && <p className="text-blue-600 dark:text-blue-400 font-medium">{subtitle}</p>}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2 group/progress">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className={clsx(
                                "w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all group-hover/progress:h-2",
                                type === 'video' ? "bg-white/30" : "bg-gray-200 dark:bg-gray-700"
                            )}
                        />
                        <div className={clsx(
                            "flex justify-between text-xs font-medium",
                            type === 'video' ? "text-white/90" : "text-gray-500 dark:text-gray-400"
                        )}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => handleFastSeek(-10)}
                                className={clsx(
                                    "p-2 transition-colors hidden md:block",
                                    type === 'video' ? "text-white hover:text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-600"
                                )}
                                title="-10s"
                            >
                                <Rewind className="w-5 h-5" />
                            </button>

                            <button className={clsx(
                                "p-2 transition-colors",
                                type === 'video' ? "text-white hover:text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-600"
                            )}>
                                <SkipBack className="w-6 h-6" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className={clsx(
                                    "p-3 rounded-full transition-transform hover:scale-105 shadow-lg",
                                    type === 'video' ? "bg-white text-black hover:bg-gray-200" : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                                )}
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                            </button>

                            <button
                                onClick={() => nextUrl && router.push(nextUrl)}
                                className={clsx(
                                    "p-2 transition-colors",
                                    type === 'video' ? "text-white hover:text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-600",
                                    !nextUrl && "opacity-50 cursor-not-allowed"
                                )}
                                title="Suivant"
                                disabled={!nextUrl}
                            >
                                <SkipForward className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => handleFastSeek(10)}
                                className={clsx(
                                    "p-2 transition-colors hidden md:block",
                                    type === 'video' ? "text-white hover:text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-600"
                                )}
                                title="+10s"
                            >
                                <FastForward className="w-5 h-5" />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/volume ml-2">
                                <button onClick={toggleMute} className={clsx(
                                    "transition-colors",
                                    type === 'video' ? "text-white hover:text-red-500" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )} title={isMuted ? "Activer le son" : "Couper le son"}>
                                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        setIsMuted(false);
                                    }}
                                    className={clsx(
                                        "w-0 group-hover/volume:w-20 h-1 rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300 overflow-hidden",
                                        type === 'video' ? "bg-white/30" : "bg-gray-200 dark:bg-gray-700"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Subtitles */}
                            <button
                                onClick={() => setIsSubtitlesEnabled(!isSubtitlesEnabled)}
                                className={clsx(
                                    "p-2 transition-colors relative",
                                    type === 'video' ? "text-white hover:text-red-500" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                                    isSubtitlesEnabled && "text-red-500 border-b-2 border-red-500"
                                )}
                                title="Sous-titres"
                            >
                                <Subtitles className="w-5 h-5" />
                            </button>

                            {/* Settings Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={clsx(
                                        "p-2 transition-colors transition-transform duration-300",
                                        type === 'video' ? "text-white hover:text-red-500" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                                        showSettings && "rotate-90"
                                    )}
                                    title="Paramètres"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                {/* Settings Dropdown */}
                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white/10 p-2 text-sm text-white z-50">
                                        <div className="space-y-1">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                                                Vitesse de lecture
                                            </div>
                                            {[0.5, 1, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => {
                                                        setPlaybackRate(rate);
                                                        setShowSettings(false);
                                                    }}
                                                    className={clsx(
                                                        "w-full text-left px-3 py-1.5 rounded hover:bg-white/10 flex items-center justify-between",
                                                        playbackRate === rate && "text-red-500 font-medium"
                                                    )}
                                                >
                                                    <span>Normal {rate !== 1 && `x${rate}`}</span>
                                                    {playbackRate === rate && <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            ))}

                                            {qualities.length > 0 && (
                                                <>
                                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 my-1 pt-2">
                                                        Qualité
                                                    </div>
                                                    {qualities.map((q) => (
                                                        <button
                                                            key={q.quality}
                                                            onClick={() => {
                                                                setCurrentQuality(q.videoUrl);
                                                                setShowSettings(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-3 py-1.5 rounded hover:bg-white/10 flex items-center justify-between",
                                                                currentQuality === q.videoUrl && "text-red-500 font-medium"
                                                            )}
                                                        >
                                                            <span>{q.quality}</span>
                                                            {currentQuality === q.videoUrl && <ChevronRight className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {type === 'video' && (
                                <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition-colors" title="Plein écran">
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

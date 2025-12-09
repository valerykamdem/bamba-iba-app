'use client';

import { useState, useEffect, useMemo } from 'react';
import { Radio, Calendar, ChevronRight, Music } from 'lucide-react';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { radioApi } from '@/lib/api/radio';
import { useRadioStore } from '@/store/useRadioStore';
import { NowPlayingInfo } from '@/types/radio';

interface EnhancedProgram {
    id: string;
    title: string;
    host: string;
    startTime: string;
    endTime: string;
    description?: string;
    status: 'past' | 'current' | 'future';
    progress?: number; // 0-100 for current show
    isSong?: boolean; // New flag to distinguish songs from shows
    artwork?: string;
}

// Fallback data if API fails or returns empty
const FALLBACK_SCHEDULE = [
    {
        id: '1',
        title: 'Morning Show',
        host: 'Sarah & Mike',
        startTime: '06:00',
        endTime: '09:00',
        description: 'Réveillez-vous avec la meilleure musique et les dernières infos.',
    },
    {
        id: '2',
        title: 'Le Grand Talk',
        host: 'Jean-Pierre',
        startTime: '09:00',
        endTime: '11:00',
        description: 'Débats, invités et actualité en direct.',
    },
    {
        id: '3',
        title: 'Hits Non-Stop',
        host: 'Auto DJ',
        startTime: '11:00',
        endTime: '14:00',
    },
    {
        id: '4',
        title: 'Afternoon Vibes',
        host: 'Léa',
        startTime: '14:00',
        endTime: '17:00',
        description: 'La meilleure sélection pour votre après-midi.',
    },
    {
        id: '5',
        title: 'Soirée Détente',
        host: 'Marc',
        startTime: '17:00',
        endTime: '20:00',
        description: 'Jazz, Soul et bonne humeur.',
    },
    {
        id: '6',
        title: 'Night Mix',
        host: 'DJ K',
        startTime: '20:00',
        endTime: '00:00',
    }
];

export default function RadioSchedule() {
    // Current time state for real-time updates
    const [now, setNow] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get current station from store
    const { currentStation } = useRadioStore();

    // Fetch schedule from API dynamically based on current station
    const { data: apiSchedule, isLoading: isLoadingSchedule } = useQuery({
        queryKey: ['radio', 'schedule', currentStation?.id],
        queryFn: () => currentStation ? radioApi.getSchedule(currentStation.id === 'main' ? '1' : currentStation.id) : Promise.resolve([]),
        enabled: !!currentStation,
        retry: 1,
        staleTime: 300000, // 5 minutes
    });

    // Fetch Live Streams (for playlist fallback)
    const { data: liveStreams } = useQuery({
        queryKey: ['radio', 'livestreams'],
        queryFn: () => radioApi.getLiveStreams(),
        enabled: !!currentStation && (!apiSchedule || apiSchedule.length === 0), // Only fetch if schedule is empty/missing
        staleTime: 10000, // 10 seconds for live data
        refetchInterval: 30000, // Refresh every 30s if using playlist
    });

    // Process schedule data
    const dailySchedule = useMemo<EnhancedProgram[]>(() => {
        // 1. Try to use API Schedule
        if (apiSchedule && apiSchedule.length > 0) {
            return apiSchedule.map((program, index) => {
                // Parse time (HH:MM or HH:MM:SS)
                let [startHour, startMinute] = program.time.split(':').map(Number);

                const startDate = new Date(now);
                startDate.setHours(startHour, startMinute, 0);

                // Infer end time from next program or assume 2 hour duration if last show
                let endDate = new Date(startDate);
                if (index < apiSchedule.length - 1) {
                    const nextProgram = apiSchedule[index + 1];
                    let [nextHour, nextMinute] = nextProgram.time.split(':').map(Number);

                    // Handle day crossing
                    if (nextHour < startHour) {
                        // Next show is tomorrow
                    }
                    endDate.setHours(nextHour, nextMinute, 0);
                    if (endDate <= startDate) {
                        endDate.setDate(endDate.getDate() + 1);
                    }
                } else {
                    // Default duration for last show: 2 hours
                    endDate.setHours(startDate.getHours() + 2);
                }

                const endTimeString = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

                let status: 'past' | 'current' | 'future' = 'future';
                let progress = 0;

                if (now >= endDate) {
                    status = 'past';
                } else if (now >= startDate && now < endDate) {
                    status = 'current';
                    const totalDuration = endDate.getTime() - startDate.getTime();
                    const elapsed = now.getTime() - startDate.getTime();
                    progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                }

                // Map API Schedule to EnhancedProgram
                return {
                    id: `${index}-${program.time}`,
                    title: program.program || 'Programme Radio',
                    host: program.host || 'Animateur',
                    startTime: program.time.substring(0, 5),
                    endTime: endTimeString,
                    description: '', // API doesn't provide description yet
                    status,
                    progress,
                    isSong: false
                };
            });
        }

        // 2. Fallback to Playlist (Song History + Now Playing + Playing Next)
        if (currentStation && liveStreams) {
            const stream = liveStreams.find(s => s.station.id.toString() === currentStation.id || (currentStation.id === 'main' && s.station.id === 1)); // Adjust ID matching logic if needed

            if (stream) {
                const playlist: EnhancedProgram[] = [];

                // Helper to format timestamps
                const formatTime = (timestamp: number) => {
                    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                };

                // A. History
                if (stream.song_history) {
                    stream.song_history.slice(0, 5).forEach((song: NowPlayingInfo) => { // Limit to last 5
                        // History items usually have played_at. We can estimate end time using duration.
                        const start = song.played_at;
                        const end = start + song.duration;

                        playlist.push({
                            id: song.sh_id.toString(),
                            title: song.song.title,
                            host: song.song.artist,
                            startTime: formatTime(start),
                            endTime: formatTime(end),
                            status: 'past',
                            isSong: true,
                            artwork: song.song.art
                        });
                    });
                }

                // B. Now Playing
                if (stream.now_playing?.song) {
                    const song = stream.now_playing;
                    const start = song.played_at;
                    const end = start + song.duration;
                    const totalDuration = song.duration * 1000; // ms
                    const elapsed = (song.elapsed || 0) * 1000; // ms
                    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

                    playlist.push({
                        id: 'now-' + song.sh_id,
                        title: song.song.title,
                        host: song.song.artist,
                        startTime: formatTime(start),
                        endTime: formatTime(end),
                        status: 'current',
                        progress: progress,
                        isSong: true,
                        artwork: song.song.art
                    });
                }

                // C. Playing Next
                if (stream.playing_next?.song) {
                    const song = stream.playing_next;
                    // Next song starts when current ends (approx)
                    const start = stream.now_playing ? (stream.now_playing.played_at + stream.now_playing.duration) : (Date.now() / 1000);
                    const end = start + song.duration;

                    playlist.push({
                        id: 'next-' + song.cued_at,
                        title: song.song.title,
                        host: song.song.artist,
                        startTime: formatTime(start),
                        endTime: formatTime(end),
                        status: 'future',
                        isSong: true,
                        artwork: song.song.art
                    });
                }

                if (playlist.length > 0) {
                    // Sort by time just in case
                    return playlist.sort((a, b) => a.startTime.localeCompare(b.startTime));
                }
            }
        }

        // 3. Last Result: Fallback mock data
        const baseSchedule = FALLBACK_SCHEDULE;

        return baseSchedule.map(program => {
            const [startHour, startMinute] = program.startTime.split(':').map(Number);
            const [endHour, endMinute] = program.endTime.split(':').map(Number);

            const startDate = new Date(now);
            startDate.setHours(startHour, startMinute, 0);

            const endDate = new Date(now);
            // Handle day crossing (e.g. 23:00 to 01:00)
            if (endHour < startHour) {
                endDate.setDate(endDate.getDate() + 1);
            }
            endDate.setHours(endHour, endMinute, 0);

            let status: 'past' | 'current' | 'future' = 'future';
            let progress = 0;

            if (now >= endDate) {
                status = 'past';
            } else if (now >= startDate && now < endDate) {
                status = 'current';
                const totalDuration = endDate.getTime() - startDate.getTime();
                const elapsed = now.getTime() - startDate.getTime();
                progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            }

            return { ...program, status, progress, isSong: false };
        });
    }, [now, apiSchedule, liveStreams, currentStation]);

    const currentProgram = dailySchedule.find(p => p.status === 'current');

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Icon changes based on whether it's a schedule (Calendar) or Playlist (Music) */}
                    {currentProgram?.isSong ? (
                        <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                    <h2 className="font-bold text-gray-900 dark:text-white">
                        {currentProgram?.isSong ? 'Playlist' : 'Programme'}
                    </h2>
                </div>
                <div className="text-xs font-mono font-medium text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Current Show Highlight (if any) */}
            {currentProgram && (
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Radio className="w-24 h-24 transform rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold tracking-wider uppercase text-blue-100">
                                {currentProgram.isSong ? 'En lecture' : 'En ce moment'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            {currentProgram.artwork && (
                                <img src={currentProgram.artwork} alt="Art" className="w-12 h-12 rounded-md object-cover border border-white/20" />
                            )}
                            <div>
                                <h3 className="text-xl font-bold leading-tight">{currentProgram.title}</h3>
                                <p className="text-blue-100 text-sm">{currentProgram.host}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-black/20 rounded-full h-1.5 mb-1">
                            <div
                                className="bg-white/90 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${currentProgram.progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-blue-100 font-mono">
                            <span>{currentProgram.startTime}</span>
                            <span>{currentProgram.endTime}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="p-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-800"></div>

                <div className="space-y-6 relative">
                    {dailySchedule.map((program, index) => (
                        <div
                            key={program.id}
                            className={clsx(
                                "relative pl-8 transition-opacity duration-300",
                                program.status === 'past' ? "opacity-50" : "opacity-100"
                            )}
                        >
                            {/* Dot on Line */}
                            <div
                                className={clsx(
                                    "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center bg-white dark:bg-gray-900",
                                    program.status === 'current'
                                        ? "border-blue-600 dark:border-blue-500 scale-110 shadow-lg shadow-blue-500/20"
                                        : program.status === 'past'
                                            ? "border-gray-300 dark:border-gray-700"
                                            : "border-gray-400 dark:border-gray-600"
                                )}
                            >
                                {program.status === 'current' && (
                                    <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="group cursor-default flex items-start gap-3">
                                {program.isSong && program.artwork && program.status !== 'current' && (
                                    <img src={program.artwork} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700 bg-gray-100" />
                                )}
                                <div>
                                    <div className="flex items-baseline justify-between mb-0.5 gap-2">
                                        <h4 className={clsx(
                                            "font-semibold text-sm transition-colors",
                                            program.status === 'current'
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        )}>
                                            {program.title}
                                        </h4>
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                                            {program.startTime}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {program.host}
                                    </p>
                                    {program.description && program.status !== 'past' && !program.isSong && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                                            {program.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-center">
                <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center justify-center gap-1 w-full">
                    {currentProgram?.isSong ? 'Voir tout l\'historique' : 'Voir la grille complète'} <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

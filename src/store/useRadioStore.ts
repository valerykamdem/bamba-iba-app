import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RadioStation, radioApi } from '@/lib/api/radio';
import { NowPlayingInfo, ListenersInfo } from '@/types/radio';

interface RadioState {
    isPlaying: boolean;
    currentStation: RadioStation | null;
    volume: number;
    favorites: string[]; // IDs des stations favorites
    nowPlaying: NowPlayingInfo | null; // Données nowplaying en temps réel
    listeners: ListenersInfo | null; // Nombre d'auditeurs en temps réel
    isInitialized: boolean; // Flag pour éviter la double initialisation
    play: (station: RadioStation) => void;
    pause: () => void;
    stop: () => void;
    setVolume: (volume: number) => void;
    toggleFavorite: (stationId: string) => void;
    isFavorite: (stationId: string) => boolean;
    setNowPlaying: (nowPlaying: NowPlayingInfo) => void;
    setListeners: (listeners: ListenersInfo) => void;
    selectStation: (stationId: number) => Promise<void>;
    initializeFirstStation: (station: RadioStation, stationId: number) => Promise<void>;
}

// Store pour le player radio
export const useRadioStore = create<RadioState>()(
    persist(
        (set, get) => ({
            isPlaying: false,
            currentStation: null,
            volume: 0.7,
            favorites: [],
            nowPlaying: null,
            listeners: null,
            isInitialized: false,

            play: (station) => {
                set({ isPlaying: true, currentStation: station });
            },

            pause: () => {
                set({ isPlaying: false });
            },

            stop: () => {
                set({ isPlaying: false, currentStation: null });
            },

            setVolume: (volume) => {
                set({ volume: Math.max(0, Math.min(1, volume)) });
            },

            toggleFavorite: (stationId) => {
                set((state) => {
                    const isFav = state.favorites.includes(stationId);
                    return {
                        favorites: isFav
                            ? state.favorites.filter((id) => id !== stationId)
                            : [...state.favorites, stationId],
                    };
                });
            },

            isFavorite: (stationId) => {
                return get().favorites.includes(stationId);
            },

            setNowPlaying: (nowPlaying) => {
                set({ nowPlaying });
            },

            setListeners: (listeners) => {
                set({ listeners });
            },

            selectStation: async (stationId) => {
                try {
                    await radioApi.selectStation(stationId);

                    // Fetch initial data immediately via REST to avoid waiting for SignalR
                    const liveStreams = await radioApi.getLiveStreams();
                    const stream = liveStreams.find(s => s.station.id === stationId);

                    if (stream) {
                        set({
                            nowPlaying: stream.now_playing,
                            listeners: stream.listeners
                        });
                    }
                } catch (error) {
                    console.error('Erreur lors de la sélection de la station:', error);
                    throw error;
                }
            },

            initializeFirstStation: async (station, stationId) => {
                const state = get();

                console.log('🎯 initializeFirstStation called:', {
                    station: station.name,
                    stationId,
                    isInitialized: state.isInitialized,
                    currentStation: state.currentStation?.name
                });

                // Ne pas initialiser si déjà fait ou si une station est déjà en cours de lecture
                if (state.isInitialized || state.currentStation) {
                    console.log('⏭️ Skipping initialization - already initialized');
                    return;
                }

                // Validate station has streamUrl
                if (!station.streamUrl) {
                    console.error('❌ Cannot initialize station without streamUrl:', station);
                    set({ isInitialized: true }); // Mark as initialized to prevent retry loop
                    return;
                }

                try {
                    console.log('📡 Calling selectStation API for:', stationId);
                    // Appeler l'API pour sélectionner la station
                    await radioApi.selectStation(stationId);
                    console.log('✅ selectStation API call successful');

                    // Fetch initial data immediately via REST
                    try {
                        const liveStreams = await radioApi.getLiveStreams();
                        const stream = liveStreams.find(s => s.station.id === stationId);

                        if (stream) {
                            console.log('✅ Initial live data fetched:', stream.now_playing?.song?.title);
                            set({
                                nowPlaying: stream.now_playing,
                                listeners: stream.listeners
                            });
                        }
                    } catch (fetchError) {
                        console.error('⚠️ Could not fetch initial live data:', fetchError);
                    }

                    // Définir la station comme station actuelle et démarrer la lecture
                    set({
                        currentStation: station,
                        isPlaying: true,
                        isInitialized: true
                    });
                    console.log('✅ Première station initialisée et lecture démarrée:', station.name);
                } catch (error) {
                    console.error('❌ Erreur lors de l\'appel API selectStation:', error);
                    // Même en cas d'erreur API, on peut quand même jouer la station
                    set({
                        currentStation: station,
                        isPlaying: true,
                        isInitialized: true
                    });
                    console.log('⚠️ Station initialisée malgré l\'erreur API:', station.name);
                }
            },
        }),
        {
            name: 'radio-storage',
            partialize: (state) => ({
                volume: state.volume,
                favorites: state.favorites,
            }),
        }
    )
);

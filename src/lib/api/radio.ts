import { apiClient } from './client';
import { Station, LiveStream } from '@/types/radio';

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    logo: string;
    genre: string;
    description: string;
    website?: string;
    listeners?: number;
}

export interface NowPlaying {
    artist: string;
    title: string;
    album?: string;
    artwork?: string;
}

export interface Schedule {
    time: string;
    program: string;
    host: string;
}

// Service pour la radio
export const radioApi = {
    // Récupérer toutes les stations depuis AzuraCast
    getStations: async () => {
        const response = await apiClient.get<Station[]>('/radio/Stations');
        return response.data;
    },

    // Récupérer une station par ID
    getStation: async (id: string) => {
        const response = await apiClient.get<RadioStation>(`/radio/stations/${id}`);
        return response.data;
    },

    // Récupérer le programme du jour
    getSchedule: async (stationId: string, date?: string) => {
        const response = await apiClient.get<Schedule[]>(`/radio/${stationId}/schedule`, {
            params: { date },
        });
        return response.data;
    },

    // Récupérer le titre en cours de lecture
    getNowPlaying: async (stationId: string) => {
        const response = await apiClient.get<NowPlaying>(`/radio/${stationId}/now-playing`);
        return response.data;
    },

    // Ajouter/retirer une station des favoris
    toggleFavorite: async (stationId: string, isFavorite: boolean) => {
        if (isFavorite) {
            await apiClient.post(`/radio/favorites/${stationId}`);
        } else {
            await apiClient.delete(`/radio/favorites/${stationId}`);
        }
    },

    // Récupérer les stations favorites
    getFavorites: async () => {
        const response = await apiClient.get<RadioStation[]>('/radio/favorites');
        return response.data;
    },

    // Récupérer les flux live depuis AzuraCast (avec données nowplaying)
    getLiveStreams: async (): Promise<LiveStream[]> => {
        const response = await apiClient.get<LiveStream[]>('/radio/LiveStream');
        return response.data;
    },

    // Sélectionner une station pour actualiser les informations de diffusion
    selectStation: async (stationId: number): Promise<void> => {
        await apiClient.post(`/radio/selectStation/${stationId}`);
        return;
    },
};


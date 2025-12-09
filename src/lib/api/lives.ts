import { apiClient } from './client';

export interface Live {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    streamUrl: string;
    channelName: string;
    channelAvatar?: string;
    viewers: number;
    startedAt: string;
    category?: string;
    type: 'video' | 'audio';
}

// Service pour les lives (streaming vidéo et audio)
export const livesApi = {
    // Récupérer tous les lives actifs
    getActive: async () => {
        const response = await apiClient.get<Live[]>('/lives/active');
        return response.data;
    },

    // Récupérer un live par ID
    getById: async (id: string) => {
        const response = await apiClient.get<Live>(`/lives/${id}`);
        return response.data;
    },

    // Créer un nouveau live
    create: async (data: {
        title: string;
        description: string;
        category?: string;
        isAudioOnly?: boolean;
    }) => {
        const response = await apiClient.post<Live>('/lives', data);
        return response.data;
    },

    // Terminer un live
    end: async (id: string) => {
        await apiClient.post(`/lives/${id}/end`);
    },

    // Récupérer le nombre de viewers
    getViewers: async (id: string) => {
        const response = await apiClient.get<{ count: number }>(`/lives/${id}/viewers`);
        return response.data;
    },

    // Mettre à jour l'ordre des lives (organisation côté client)
    updateOrder: async (order: string[]) => {
        await apiClient.post('/lives/reorder', { order });
    },
};

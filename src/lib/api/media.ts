import { apiClient } from './client';
import { Media, MediaApiResponse, PaginatedResponse } from '@/types/media';

// Fonction utilitaire pour corriger les URLs d'images
export const fixImageUrl = (url: string): string => {
    if (!url) return '';
    // Remplacer minio.local:8443 par localhost:9000
    return url.replace('minio.local:8443', 'localhost:9000').replace('https://', 'http://');
};

// Fonction utilitaire pour formater la durée
const formatDuration = (duration: string): string => {
    // Convertir "00:46:37.2400000" en "46:37"
    const parts = duration.split(':');
    if (parts.length >= 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2].split('.')[0]);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return duration;
};

// Fonction utilitaire pour formater la date
const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `Il y a ${diffMins} min`;
    }
    if (diffHours < 24) {
        return `Il y a ${diffHours}h`;
    }
    if (diffDays < 30) {
        return `Il y a ${diffDays}j`;
    }
    return date.toLocaleDateString('fr-FR');
};

// Mapper les données API vers le format attendu par les composants
const mapMediaApiToMedia = (apiMedia: MediaApiResponse): Media => {
    const baseUrl = apiMedia.type === 'audio'
        ? 'http://localhost:9000/bambaiba-audios'
        : 'http://localhost:9000/bambaiba-videos';

    const fileExtension = apiMedia.type === 'audio' ? 'mp3' : 'mp4';

    return {
        id: apiMedia.id,
        type: apiMedia.type,
        title: apiMedia.title,
        description: apiMedia.description || '',
        thumbnail: fixImageUrl(apiMedia.thumbnailUrl),
        duration: formatDuration(apiMedia.duration),
        likes: apiMedia.likeCount,
        dislikes: apiMedia.dislikeCount,
        plays: apiMedia.playCount,
        comments: apiMedia.commentCount,
        timestamp: formatTimestamp(apiMedia.createdAt),
        category: apiMedia.category || 'Non catégorisé',
        topic: apiMedia.topic || '',
        speaker: apiMedia.speaker || 'Orateur inconnu',
        language: apiMedia.language || '',
        mediaUrl: fixImageUrl(apiMedia.mediaUrl || '') || `${baseUrl}/${apiMedia.id}.${fileExtension}`,
        qualities: apiMedia.qualities?.map(q => ({
            quality: q.quality,
            videoUrl: fixImageUrl(q.videoUrl)
        })) || [],
        subtitles: apiMedia.subtitles?.map(s => ({
            language: s.language,
            url: fixImageUrl(s.url)
        })) || [],
    };
};

// Service pour les opérations sur les médias via l'API
export const mediaApi = {
    // Récupérer les médias avec pagination et recherche
    list: async ({ page = 10, pageSize = 100, search = '' }: { page?: number; pageSize?: number; search?: string; } = {}) => {
        try {
            console.log('🎬 Fetching media from API:', { page, pageSize, search });
            const response = await apiClient.get<PaginatedResponse<MediaApiResponse>>('/media', {
                params: {
                    Page: page,
                    PageSize: pageSize,
                    Search: search,
                },
            });

            console.log('✅ API Response:', response.data);

            const mappedData = {
                data: response.data.items.map(mapMediaApiToMedia),
                pagination: {
                    totalCount: response.data.totalCount,
                    page: response.data.page,
                    pageSize: response.data.pageSize,
                    totalPages: response.data.totalPages,
                }
            };

            console.log('✅ Mapped media:', mappedData.data.length, 'items');
            return mappedData;
        } catch (error) {
            console.error('❌ Error fetching media:', error);
            throw error;
        }
    },

    // Récupérer un média par ID
    getById: async (id: string) => {
        const response = await apiClient.get<MediaApiResponse>(`/media/${id}`);
        return mapMediaApiToMedia(response.data);
    },

    // Créer un nouveau média (upload)
    create: async (formData: FormData) => {
        const response = await apiClient.post<MediaApiResponse>('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return mapMediaApiToMedia(response.data);
    },

    // Mettre à jour un média
    update: async (id: string, data: Partial<Media>) => {
        const response = await apiClient.put<MediaApiResponse>(`/media/${id}`, data);
        return mapMediaApiToMedia(response.data);
    },

    // Supprimer un média
    delete: async (id: string) => {
        await apiClient.delete(`/media/${id}`);
    },

    // Incrémenter les lectures/vues
    incrementPlays: async (id: string) => {
        await apiClient.post(`/media/${id}/plays`);
    },
};

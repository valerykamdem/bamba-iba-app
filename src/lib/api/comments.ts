import { apiClient } from './client';
import { Comment, CommentApiResponse, PaginatedCommentsResponse } from '@/types/comment';
import { fixImageUrl } from './media';

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
const mapCommentApiToComment = (apiComment: CommentApiResponse): Comment => {
    return {
        id: apiComment.id,
        mediaId: apiComment.mediaId,
        userId: apiComment.userId,
        userName: apiComment.userName,
        userAvatar: fixImageUrl(apiComment.userAvatar || '') || '/api/placeholder/40/40',
        content: apiComment.content,
        timestamp: formatTimestamp(apiComment.createdAt),
        likes: apiComment.likeCount,
        replies: apiComment.replyCount,
    };
};

// Service pour les opérations sur les commentaires via l'API
export const commentsApi = {
    // Récupérer les commentaires d'un média avec pagination
    list: async ({ mediaId, page = 1, pageSize = 10 }: { mediaId: string; page?: number; pageSize?: number; }) => {
        try {
            console.log('💬 Fetching comments from API:', { mediaId, page, pageSize });
            const response = await apiClient.get<PaginatedCommentsResponse>(`/comments/${mediaId}`, {
                params: {
                    Page: page,
                    PageSize: pageSize,
                },
            });

            console.log('✅ API Response:', response.data);

            const data = response.data as PaginatedCommentsResponse;

            const mappedData = {
                data: data.items.map(mapCommentApiToComment),
                pagination: {
                    totalCount: data.totalCount,
                    page: data.page,
                    pageSize: data.pageSize,
                    totalPages: data.totalPages,
                }
            };

            console.log('✅ Mapped comments:', mappedData.data.length, 'items');
            return mappedData;
        } catch (error) {
            console.error('❌ Error fetching comments:', error);
            throw error;
        }
    },

    // Créer un nouveau commentaire
    create: async (mediaId: string, content: string, parentCommentId?: string) => {
        const response = await apiClient.post<CommentApiResponse>('/comments', {
            mediaId,
            content,
            ...(parentCommentId && { parentCommentId }),
        });
        return mapCommentApiToComment(response.data);
    },

    // Supprimer un commentaire
    delete: async (commentId: string) => {
        await apiClient.delete(`/comments/${commentId}`);
    },

    // Liker un commentaire
    like: async (commentId: string) => {
        await apiClient.post(`/comments/${commentId}/like`);
    },
};

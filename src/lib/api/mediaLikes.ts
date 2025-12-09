import { apiClient } from './client';

export interface LikesStatusResponse {
  likeCount: number;
  dislikeCount: number;
  isPublic: boolean;
  isLike?: boolean;       // Alias from server: IsLike
  isDislike?: boolean;    // Alias from server: IsDislike
  userLiked?: boolean;    // Fallback: client-side naming
  userDisliked?: boolean; // Fallback: client-side naming
}

export interface LikeRequest {
  mediaId: string;
}

// Service pour les likes/dislikes de médias (vidéo/audio)
export const mediaLikesApi = {
  // Récupérer le statut des likes et dislikes pour un média
  getLikesStatus: async (mediaId: string): Promise<LikesStatusResponse> => {
    const response = await apiClient.get<LikesStatusResponse>(
      `/media/${mediaId}/likes/status`
    );
    return response.data;
  },

  // Poster un like pour un média (authentifié)
  likeMedia: async (mediaId: string): Promise<void> => {
    await apiClient.post(`/media/${mediaId}/likes`, { mediaId });
  },

  // Retirer un like d'un média (authentifié)
  unlikeMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/media/${mediaId}/likes`);
  },

  // Poster un dislike pour un média (authentifié)
  dislikeMedia: async (mediaId: string): Promise<void> => {
    await apiClient.post(`/media/${mediaId}/dislikes`, { mediaId });
  },

  // Retirer un dislike d'un média (authentifié)
  undislikeMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/media/${mediaId}/dislikes`);
  },
};

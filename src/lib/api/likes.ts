import { apiClient } from './client';

export interface Like {
  id: string;
  userId: string;
  videoId?: string;
  commentId?: string;
  createdAt: string;
}

// Service pour les likes (vidéos, commentaires)
export const likesApi = {
  // Liker une vidéo (authentifié)
  likeVideo: async (videoId: string): Promise<void> => {
    await apiClient.post(`/videos/${videoId}/like`);
  },

  // Retirer le like d'une vidéo (authentifié)
  unlikeVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/videos/${videoId}/like`);
  },

  // Vérifier si une vidéo est likée (authentifié)
  isVideoLiked: async (videoId: string): Promise<boolean> => {
    const response = await apiClient.get<{ liked: boolean }>(
      `/videos/${videoId}/like/status`
    );
    return response.data.liked;
  },

  // Liker un commentaire (authentifié)
  likeComment: async (videoId: string, commentId: string): Promise<void> => {
    await apiClient.post(
      `/videos/${videoId}/comments/${commentId}/like`
    );
  },

  // Retirer le like d'un commentaire (authentifié)
  unlikeComment: async (videoId: string, commentId: string): Promise<void> => {
    await apiClient.delete(
      `/videos/${videoId}/comments/${commentId}/like`
    );
  },

  // Vérifier si un commentaire est liké (authentifié)
  isCommentLiked: async (
    videoId: string,
    commentId: string
  ): Promise<boolean> => {
    const response = await apiClient.get<{ liked: boolean }>(
      `/videos/${videoId}/comments/${commentId}/like/status`
    );
    return response.data.liked;
  },
};

import { apiClient } from './client';

export interface ChatMessage {
    id: string;
    liveId: string;
    userId: string;
    username: string;
    userAvatar: string;
    message: string;
    timestamp: string;
    badges?: string[]; // ['streamer', 'moderator', 'vip']
}

// Service pour le chat en temps réel
export const chatApi = {
    // Récupérer l'historique des messages d'un live
    getMessages: async (liveId: string, limit = 50) => {
        const response = await apiClient.get<ChatMessage[]>(`/chat/${liveId}/messages`, {
            params: { limit },
        });
        return response.data;
    },

    // Envoyer un message
    sendMessage: async (liveId: string, message: string) => {
        const response = await apiClient.post<ChatMessage>(`/chat/${liveId}`, { message });
        return response.data;
    },

    // Supprimer un message (modération)
    deleteMessage: async (messageId: string) => {
        await apiClient.delete(`/chat/messages/${messageId}`);
    },

    // Ban un utilisateur du chat
    banUser: async (liveId: string, userId: string, duration?: number) => {
        await apiClient.post(`/chat/${liveId}/ban`, { userId, duration });
    },

    // Timeout un utilisateur
    timeoutUser: async (liveId: string, userId: string, seconds: number) => {
        await apiClient.post(`/chat/${liveId}/timeout`, { userId, seconds });
    },
};

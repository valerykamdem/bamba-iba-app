import { create } from 'zustand';
import { ChatMessage } from '@/lib/api/chat';

interface ChatState {
    messages: ChatMessage[];
    isConnected: boolean;
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    removeMessage: (messageId: string) => void;
    setConnected: (connected: boolean) => void;
    clearMessages: () => void;
}

// Store pour le chat
export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isConnected: false,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    removeMessage: (messageId) =>
        set((state) => ({
            messages: state.messages.filter((msg) => msg.id !== messageId),
        })),

    setConnected: (connected) => set({ isConnected: connected }),

    clearMessages: () => set({ messages: [] }),
}));

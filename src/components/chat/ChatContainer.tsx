'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatApi, ChatMessage } from '@/lib/api/chat';
import { wsClient } from '@/lib/websocket';
import { useChatStore } from '@/store/useChatStore';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatContainerProps {
    liveId: string;
}

export default function ChatContainer({ liveId }: ChatContainerProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const { messages, addMessage, setMessages, setConnected } = useChatStore();

    // Charger l'historique des messages
    const { data: historyData } = useQuery({
        queryKey: ['chat', liveId],
        queryFn: () => chatApi.getMessages(liveId),
    });

    useEffect(() => {
        if (historyData) {
            setMessages(historyData);
        }
    }, [historyData, setMessages]);

    // WebSocket pour les nouveaux messages
    useEffect(() => {
        const socket = wsClient.connect();

        socket.emit('join-live', liveId);
        setConnected(true);

        socket.on('new-message', (message: ChatMessage) => {
            addMessage(message);
        });

        socket.on('message-deleted', (messageId: string) => {
            // Gérer la suppression
        });

        return () => {
            socket.emit('leave-live', liveId);
            wsClient.disconnect();
            setConnected(false);
        };
    }, [liveId, addMessage, setConnected]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: (text: string) => chatApi.sendMessage(liveId, text),
        onSuccess: () => {
            setInputValue('');
        },
        onError: () => {
            toast.error('Erreur lors de l\'envoi du message');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !user) return;

        sendMessageMutation.mutate(inputValue);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Chat en direct</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                    {messages.length} messages
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-custom">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2"
                        >
                            <Avatar
                                src={message.userAvatar}
                                alt={message.username}
                                size="sm"
                                fallback={message.username.charAt(0)}
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900">
                                        {message.username}
                                    </span>
                                    {message.badges?.map((badge) => (
                                        <span
                                            key={badge}
                                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-700 break-words">
                                    {message.message}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Envoyer un message..."
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                       focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                            maxLength={200}
                        />

                        <button
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Smile className="w-5 h-5 text-gray-500" />
                        </button>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || sendMessageMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                        Connectez-vous pour participer au chat
                    </p>
                )}
            </div>
        </div>
    );
}

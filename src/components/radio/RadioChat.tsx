'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadioHub } from '@/hooks/useRadioHub';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/radio';

export default function RadioChat() {
    const { isConnected, messages: hubMessages, sendMessage } = useRadioHub();
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            user: 'System',
            content: 'Bienvenue sur le chat en direct !',
            timestamp: '09:00',
            isSystem: true,
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync SignalR messages with local messages
    useEffect(() => {
        if (hubMessages.length > 0) {
            setMessages(prev => {
                const newMessages = [...prev];
                hubMessages.forEach(msg => {
                    // Avoid duplicates
                    if (!newMessages.find(m => m.id === msg.id)) {
                        newMessages.push(msg);
                    }
                });
                return newMessages;
            });
        }
    }, [hubMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (!isAuthenticated || !user) {
            // Optionnel : rediriger vers login ou afficher une modale
            console.warn('Utilisateur non connecté');
            // Pour l'instant on empêche juste l'envoi
            return;
        }

        try {
            console.log('📝 Sending message from UI:', inputValue);
            // Send via SignalR
            await sendMessage(user.username, inputValue);
            console.log('✅ Message sent from UI');

            // Optionally add to local messages immediately (optimistic update)
            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                user: user.username,
                avatar: user.avatar,
                content: inputValue,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, newMessage]);

            setInputValue('');
        } catch (error) {
            console.error('❌ UI Error sending message:', error);
            // You could show a toast notification here
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Chat en direct</h3>
                <span className="ml-auto text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.isSystem ? 'justify-center' : ''}`}
                        >
                            {msg.isSystem ? (
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                    {msg.content}
                                </span>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {msg.avatar ? (
                                            <img src={msg.avatar} alt={msg.user} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            msg.user.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {msg.user}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm break-words bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg rounded-tl-none">
                                            {msg.content}
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                {isAuthenticated ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Participez à la discussion..."
                            disabled={!isConnected}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border focus:border-blue-500 rounded-full text-sm transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || !isConnected}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Connectez-vous pour participer au chat</p>
                        <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Se connecter
                        </a>
                    </div>
                )}

                {!isConnected && isAuthenticated && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                        Connexion au chat en cours...
                    </p>
                )}
            </form>
        </div>
    );
}

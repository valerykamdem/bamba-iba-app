'use client';

import { useCallback, useState } from 'react';
import { chatApi, ChatMessage } from '@/lib/api/chat';
import toast from 'react-hot-toast';

export const useChat = (liveId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (limit = 50) => {
    setIsLoading(true);
    setError(null);
    try {
      const msgs = await chatApi.getMessages(liveId, limit);
      setMessages(msgs);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur de chargement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [liveId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        toast.error('Le message ne peut pas être vide');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const newMessage = await chatApi.sendMessage(liveId, message);
        setMessages((prev) => [...prev, newMessage]);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erreur d\'envoi';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [liveId]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    setIsLoading(true);
    try {
      await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success('Message supprimé');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur de suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    sendMessage,
    deleteMessage,
  };
};

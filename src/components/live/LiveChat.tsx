'use client';

import React, { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessageItemProps {
  id: string;
  username: string;
  userAvatar: string;
  message: string;
  badges?: string[];
}

interface LiveChatProps {
  liveId: string;
}

function ChatMessage({ username, userAvatar, message, badges = [] }: ChatMessageItemProps) {
  return (
    <div className="flex gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
      <img
        src={userAvatar || '/api/placeholder/32/32'}
        alt={username}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{username}</span>
          {badges.includes('streamer') && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
              Streamer
            </span>
          )}
          {badges.includes('moderator') && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
              Modérateur
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{message}</p>
      </div>
    </div>
  );
}

export default function LiveChat({ liveId }: LiveChatProps) {
  const [messageInput, setMessageInput] = useState('');
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useChat(liveId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Veuillez vous connecter pour chatter');
      return;
    }

    if (!messageInput.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Pas encore de messages. Soyez le premier!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              username={msg.username}
              userAvatar={msg.userAvatar}
              message={msg.message}
              badges={msg.badges}
            />
          ))
        )}
      </div>

      {/* Input Form */}
      {user?.id ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Dire quelque chose..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !messageInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center gap-1 text-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <a href="/login" className="text-blue-500 hover:underline">
              Connectez-vous
            </a>{' '}
            pour participer au chat
          </p>
        </div>
      )}
    </div>
  );
}

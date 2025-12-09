'use client';

import React, { useState } from 'react';
import { commentsApi } from '@/lib/api/comments';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface CommentFormProps {
  mediaId: string;
  onCommentAdded?: (comment: any) => void;
}

export default function CommentForm({ mediaId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsLoading(true);
    try {
      const newComment = await commentsApi.create(mediaId, content);
      setContent('');
      toast.success('Comment added!');
      onCommentAdded?.(newComment);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to leave a comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Leave a comment..."
        disabled={isLoading}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}

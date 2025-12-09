'use client';

import { useCallback, useState } from 'react';
import { commentsApi } from '@/lib/api/comments';
import toast from 'react-hot-toast';

export const useComments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = useCallback(
    async (mediaId: string, content: string, parentCommentId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const comment = await commentsApi.create(mediaId, content, parentCommentId);
        toast.success('Commentaire ajouté!');
        return comment;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || 'Erreur lors de l\'ajout du commentaire';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await commentsApi.delete(commentId);
      toast.success('Commentaire supprimé');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likeComment = useCallback(async (commentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await commentsApi.like(commentId);
      toast.success('Commentaire liké!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    addComment,
    deleteComment,
    likeComment,
  };
};

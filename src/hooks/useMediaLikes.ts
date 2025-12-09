'use client';

import { useCallback, useState, useEffect } from 'react';
import { mediaLikesApi, LikesStatusResponse } from '@/lib/api/mediaLikes';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useMediaLikes = (mediaId: string) => {
  const { user } = useAuth();
  const [likesStatus, setLikesStatus] = useState<LikesStatusResponse>({
    likeCount: 0,
    dislikeCount: 0,
    isPublic: false,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Récupérer le statut des likes au montage
  useEffect(() => {
    const fetchLikesStatus = async () => {
      try {
        setIsLoadingStatus(true);
        const response = await mediaLikesApi.getLikesStatus(mediaId);
        setLikesStatus(response);
        // Initialiser l'état du like/dislike de l'utilisateur actuel
        // Support both server naming (IsLike/IsDislike) and client naming (userLiked/userDisliked)
        setIsLiked(response.isLike ?? response.userLiked ?? false);
        setIsDisliked(response.isDislike ?? response.userDisliked ?? false);
      } catch (err) {
        console.error('Error fetching likes status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    if (mediaId) {
      fetchLikesStatus();
    }
  }, [mediaId]);

  const toggleLike = useCallback(
    async (likeType: 'like' | 'dislike') => {
      if (!user?.id) {
        toast.error('Veuillez vous connecter pour liker');
        return;
      }

      setIsLoading(true);
      try {
        if (likeType === 'like') {
          if (isLiked) {
            // Retirer le like
            await mediaLikesApi.unlikeMedia(mediaId);
            setIsLiked(false);
            setLikesStatus((prev) => ({
              ...prev,
              likeCount: Math.max(0, prev.likeCount - 1),
            }));
            toast.success('Like retiré');
          } else {
            // Ajouter le like
            await mediaLikesApi.likeMedia(mediaId);
            setIsLiked(true);
            // Si était disliké, enlever le dislike
            if (isDisliked) {
              setIsDisliked(false);
              setLikesStatus((prev) => ({
                ...prev,
                likeCount: prev.likeCount + 1,
                dislikeCount: Math.max(0, prev.dislikeCount - 1),
              }));
            } else {
              setLikesStatus((prev) => ({
                ...prev,
                likeCount: prev.likeCount + 1,
              }));
            }
            toast.success('Vidéo likée!');
          }
        } else {
          // Dislike
          if (isDisliked) {
            // Retirer le dislike
            await mediaLikesApi.undislikeMedia(mediaId);
            setIsDisliked(false);
            setLikesStatus((prev) => ({
              ...prev,
              dislikeCount: Math.max(0, prev.dislikeCount - 1),
            }));
            toast.success('Dislike retiré');
          } else {
            // Ajouter le dislike
            await mediaLikesApi.dislikeMedia(mediaId);
            setIsDisliked(true);
            // Si était liké, enlever le like
            if (isLiked) {
              setIsLiked(false);
              setLikesStatus((prev) => ({
                ...prev,
                dislikeCount: prev.dislikeCount + 1,
                likeCount: Math.max(0, prev.likeCount - 1),
              }));
            } else {
              setLikesStatus((prev) => ({
                ...prev,
                dislikeCount: prev.dislikeCount + 1,
              }));
            }
            toast.success('Dislike ajouté');
          }
        }
      } catch (err: any) {
        console.error(`${likeType} error:`, err);
        toast.error(err?.response?.data?.message || `Erreur lors du ${likeType}`);
      } finally {
        setIsLoading(false);
      }
    },
    [mediaId, user?.id, isLiked, isDisliked]
  );

  return {
    likesStatus,
    isLiked,
    isDisliked,
    isLoading,
    isLoadingStatus,
    toggleLike,
  };
};

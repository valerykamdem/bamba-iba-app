"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api/comments';
import { MessageCircle, ThumbsUp, User } from 'lucide-react';
import { useState } from 'react';
import CommentForm from '@/components/media/CommentForm';
import { Comment } from '@/types/comment';

interface MediaCommentsProps {
    mediaId: string;
}

export default function MediaComments({ mediaId }: MediaCommentsProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // All hooks must be called before any conditional returns
    const queryClient = useQueryClient();

    const { data: commentsData, isLoading, error } = useQuery({
        queryKey: ['comments', mediaId, page],
        queryFn: () => commentsApi.list({ mediaId, page, pageSize }),
    });

    const handleCommentAdded = async (comment: Comment) => {
        try {
            // After adding a comment, refresh the comments for this media and go to first page
            setPage(1);
            await queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
        } catch (err) {
            console.error('Error invalidating comments query:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    Commentaires
                </h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    Commentaires
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <p className="text-red-600 dark:text-red-400">
                        Erreur lors du chargement des commentaires
                    </p>
                </div>
            </div>
        );
    }

    const comments = commentsData?.data || [];
    const totalCount = commentsData?.pagination.totalCount || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    {totalCount} Commentaire{totalCount > 1 ? 's' : ''}
                </h3>
            </div>

            {comments.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun commentaire pour le moment.</p>
                    <p className="text-sm mt-1">Soyez le premier à commenter !</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                {comment.userAvatar ? (
                                    <img
                                        src={comment.userAvatar}
                                        alt={comment.userName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {comment.userName}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {comment.timestamp}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{comment.likes}</span>
                                    </button>
                                    {comment.replies > 0 && (
                                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{comment.replies} réponse{comment.replies > 1 ? 's' : ''}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulaire d'ajout de commentaire */}
            <div className="pt-6">
                <CommentForm mediaId={mediaId} onCommentAdded={handleCommentAdded} />
            </div>

            {/* Pagination */}
            {commentsData && commentsData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Précédent
                    </button>
                    <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        Page {page} sur {commentsData.pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(commentsData.pagination.totalPages, p + 1))}
                        disabled={page === commentsData.pagination.totalPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}

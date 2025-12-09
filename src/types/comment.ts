// Types pour les commentaires
export interface CommentApiResponse {
    id: string;
    mediaId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    replyCount: number;
}

export interface Comment {
    id: string;
    mediaId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: string;
    likes: number;
    replies: number;
}

export interface PaginatedCommentsResponse {
    items: CommentApiResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

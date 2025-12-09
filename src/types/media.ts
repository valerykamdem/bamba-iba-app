// Interface pour les réponses API
export interface MediaApiResponse {
    id: string;
    userId: string;
    type: "audio" | "video";
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: string;
    likeCount: number;
    dislikeCount: number;
    playCount: number;
    commentCount: number;
    isPublic: boolean;
    publishedAt: string;
    tags: string[];
    category: string;
    topic: string;
    createdAt: string;
    updatedAt: string;
    speaker: string;
    language: string;
    mediaUrl?: string; // URL du fichier média (audio/vidéo)
    qualities?: { quality: string; videoUrl: string }[];
    subtitles?: { language: string; url: string }[];
}

// Interface générique pour les réponses paginées
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Interface utilisée par les composants
export interface Media {
    id: string;
    type: "audio" | "video";
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    likes: number;
    dislikes: number;
    plays: number;
    comments: number;
    timestamp: string;
    category: string;
    topic: string;
    speaker: string;
    language: string;
    mediaUrl: string;
    qualities?: { quality: string; videoUrl: string }[];
    subtitles?: { language: string; url: string }[];
}

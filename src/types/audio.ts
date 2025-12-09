// Interface pour les réponses API
export interface AudioApiResponse {
    id: string;
    title: string;
    speaker: string;
    category: string;
    topic: string;
    coverImageUrl: string;
    duration: string;
    playCount: number;
    createdAt: string;
    updatedAt: string;
    description?: string;
}

// Interface utilisée par les composants (conservée pour compatibilité)
export interface Audio {
    id: string;
    title: string;
    speaker: string;
    category: string;
    topic: string;
    coverImageUrl: string;
    duration: string;
    url: string;
    timestamp: string;
    likes: number;
    comments: number;
    description?: string;
}
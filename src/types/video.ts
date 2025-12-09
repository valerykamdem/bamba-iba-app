// Interface pour les réponses API
export interface VideoApiResponse {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  userId: string;
}

// Interface générique pour les réponses paginées
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface utilisée par les composants (conservée pour compatibilité)
export interface Video {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  description?: string;
  channelImage: string;
  videoUrl?: string;
}

export interface Channel {
  id: string;
  name: string;
  subscribers: string;
  avatar: string;
}
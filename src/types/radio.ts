// Types pour l'API AzuraCast et SignalR

// Types pour les stations depuis /api/live/Stations
export interface StationMount {
    id: number;
    name: string;
    url: string;
    bitrate: number;
    format: string;
    listeners: {
        total: number;
        unique: number;
        current: number;
    };
    path: string;
    is_default: boolean;
}

export interface Station {
    id: number;
    name: string;
    shortcode: string;
    description: string;
    frontend: string;
    backend: string;
    timezone: string;
    listen_url: string;
    url: string;
    public_player_url: string;
    playlist_pls_url: string;
    playlist_m3u_url: string;
    is_public: boolean;
    requests_enabled: boolean;
    mounts: StationMount[];
    remotes: unknown[];
    hls_enabled: boolean;
    hls_is_default: boolean;
    hls_url: string;
    hls_listeners: number;
}

// Types pour les données nowplaying depuis /api/live/LiveStream
export interface SongInfo {
    id: string;
    art: string;
    custom_fields: unknown[];
    text: string;
    artist: string;
    title: string;
    album: string;
    genre: string;
    isrc: string;
    lyrics: string;
}

export interface NowPlayingInfo {
    sh_id: number;
    played_at: number;
    duration: number;
    playlist: string;
    streamer: string;
    is_request: boolean;
    song: SongInfo;
    elapsed: number;
    remaining: number;
}

export interface PlayingNext {
    cued_at: number;
    played_at: number;
    duration: number;
    playlist: string;
    is_request: boolean;
    song: SongInfo;
}

export interface LiveInfo {
    is_live: boolean;
    streamer_name: string;
    broadcast_start: number | null;
    art: string | null;
}

export interface ListenersInfo {
    total: number;
    unique: number;
    current: number;
}

export interface LiveStream {
    station: Station;
    listeners: ListenersInfo;
    live: LiveInfo;
    now_playing: NowPlayingInfo;
    playing_next: PlayingNext;
    song_history: NowPlayingInfo[];
    is_online: boolean;
    cache: unknown;
}

// Types pour les événements SignalR
export interface NowPlayingUpdateEvent {
    stationId: number;
    stationName: string;
    nowPlaying: NowPlayingInfo;
    listeners: ListenersInfo;
    isLive: boolean;
    live?: LiveInfo;
}

export interface ChatMessage {
    id: string;
    user: string;
    avatar?: string;
    content: string;
    timestamp: string;
    isSystem?: boolean;
}

export interface ReceiveMessageEvent {
    message: ChatMessage;
}

export interface InfoEvent {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
}

// Type pour la connexion SignalR
export interface SignalRConnection {
    isConnected: boolean;
    connectionId: string | null;
    error: string | null;
}

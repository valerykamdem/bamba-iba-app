import { io, Socket } from 'socket.io-client';

// Client WebSocket pour le chat en temps réel
class WebSocketClient {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:7000';
    }

    // Connecter au serveur WebSocket
    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(this.url, {
            auth: {
                token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
            },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connecté');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket déconnecté');
        });

        this.socket.on('error', (error) => {
            console.error('❌ Erreur WebSocket:', error);
        });

        return this.socket;
    }

    // Déconnecter
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Écouter un événement
    on(event: string, callback: (data: unknown) => void) {
        this.socket?.on(event, callback);
    }

    // Supprimer un listener
    off(event: string, callback?: (data: unknown) => void) {
        this.socket?.off(event, callback);
    }

    // Émettre un événement
    emit(event: string, data?: unknown) {
        this.socket?.emit(event, data);
    }

    // Joindre un live
    joinLive(liveId: string) {
        this.emit('join-live', liveId);
    }

    // Quitter un live
    leaveLive(liveId: string) {
        this.emit('leave-live', liveId);
    }

    // Envoyer un message
    sendMessage(liveId: string, message: string) {
        this.emit('send-message', { liveId, message });
    }
}

// Instance unique du client WebSocket
export const wsClient = new WebSocketClient();

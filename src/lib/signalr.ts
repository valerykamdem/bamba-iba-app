import * as signalR from '@microsoft/signalr';
import { NowPlayingUpdateEvent, ReceiveMessageEvent, InfoEvent } from '@/types/radio';
import { isTokenExpired, isTokenExpiringSoon } from './tokenUtils';

const HUB_URL = 'http://localhost:7000/hubs/livehub';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor() {
        // Only initialize connection on client-side
        if (typeof window !== 'undefined') {
            this.initializeConnection();
        }
    }

    private async getAuthStore() {
        // Dynamic import to avoid circular dependencies
        const { useAuthStore } = await import('@/store/useAuthStore');
        return useAuthStore.getState();
    }

    private async refreshTokenIfNeeded(): Promise<string> {
        try {
            const authState = await this.getAuthStore();
            const token = authState.token;

            // If no token, return empty string
            if (!token) {
                console.warn('[SignalR] No token available');
                return '';
            }

            // If token is expired or expiring soon, refresh it
            if (isTokenExpired(token) || isTokenExpiringSoon(token)) {
                console.log('[SignalR] Token expired or expiring soon, refreshing...');

                const refreshToken = authState.refreshToken;
                if (!refreshToken) {
                    console.error('[SignalR] No refresh token available');
                    authState.logout();
                    return '';
                }

                // Use raw axios to avoid interceptor loops
                const axios = (await import('axios')).default;
                const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';

                try {
                    const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken }, {
                        timeout: 10000,
                    });

                    const newToken = response.data.token || response.data.access_Token;
                    authState.setToken(newToken);
                    console.log('[SignalR] Token refreshed successfully');
                    return newToken;
                } catch (refreshError) {
                    console.error('[SignalR] Token refresh failed:', refreshError);
                    authState.logout();
                    return '';
                }
            }

            return token;
        } catch (error) {
            console.error('[SignalR] Error in refreshTokenIfNeeded:', error);
            return '';
        }
    }

    private initializeConnection() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: async () => {
                    return await this.refreshTokenIfNeeded();
                }
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
                        return null; // Stop reconnecting
                    }
                    // Exponential backoff: 0s, 2s, 10s, 30s, etc.
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {
        if (!this.connection) return;

        this.connection.onreconnecting((error) => {
            console.warn('SignalR: Tentative de reconnexion...', error);
            this.reconnectAttempts++;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR: Reconnecté avec succès', connectionId);
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.error('SignalR: Connexion fermée', error);
            // Attempt to reconnect after a delay if not intentional disconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.start().catch(console.error);
                }, 5000);
            }
        });
    }

    async start(): Promise<void> {
        if (!this.connection) {
            throw new Error('Connection not initialized');
        }

        const connection = this.connection; // Local variable for type safety

        if (connection.state !== signalR.HubConnectionState.Disconnected) {
            console.log(`SignalR: Cannot start, current state is ${connection.state}`);
            return;
        }

        try {
            await connection.start();
            console.log('SignalR: Connecté avec succès', connection.connectionId);
            this.reconnectAttempts = 0;
        } catch (error) {
            console.error('SignalR: Erreur de connexion', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (!this.connection) return;

        const connection = this.connection;
        try {
            await connection.stop();
            console.log('SignalR: Déconnecté');
        } catch (error) {
            console.error('SignalR: Erreur lors de la déconnexion', error);
        }
    }

    // Événement: Mise à jour NowPlaying
    onNowPlayingUpdate(callback: (data: NowPlayingUpdateEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.on('NowPlayingUpdate', callback);
    }

    offNowPlayingUpdate(callback: (data: NowPlayingUpdateEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.off('NowPlayingUpdate', callback);
    }

    // Événement: Réception de messages chat
    onReceiveMessage(callback: (data: ReceiveMessageEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.on('ReceiveMessage', callback);
    }

    offReceiveMessage(callback: (data: ReceiveMessageEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.off('ReceiveMessage', callback);
    }

    // Événement: Notifications système
    onInfo(callback: (data: InfoEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.on('Info', callback);
    }

    offInfo(callback: (data: InfoEvent) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.off('Info', callback);
    }

    // Événement: Mise à jour du nombre de spectateurs
    onViewerCountUpdated(callback: (count: number) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.on('ViewerCountUpdated', callback);
    }

    offViewerCountUpdated(callback: (count: number) => void): void {
        if (!this.connection) return;
        const connection = this.connection;
        connection.off('ViewerCountUpdated', callback);
    }

    // Envoyer un message au chat
    async sendChatMessage(user: string, content: string): Promise<void> {
        // 1. Vérifier si le token est valide ou doit être rafraîchi
        const authState = await this.getAuthStore();
        
        // Refresh silently if needed, but don't force reconnect just because we refreshed
        // The token is sent during connection handshake, but existing connections usually remain valid until expiration
        try {
            const validToken = await this.refreshTokenIfNeeded();
        } catch (e) {
            console.error('[SignalR] Error refreshing token before sending message:', e);
        }

        // 2. Vérifier l'état de la connexion
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.warn(`[SignalR] Connection state is ${this.connection?.state}, attempting to reconnect...`);
            // Essayer de se connecter uniquement si déconnecté
            try {
                await this.start();
            } catch (e) {
                console.error("[SignalR] Failed to reconnect for sending message:", e);
                // Don't throw immediately, let the invoke try and fail if needed, or throw specific error
                 throw new Error('SignalR: Impossible de se connecter pour envoyer le message');
            }
        }

        const connection = this.connection;
        if (!connection) throw new Error('SignalR: Connexion non initialisée');

        try {
            console.log('[SignalR] Invoking SendMessage...');
            await connection.invoke('SendMessage', user, content);
            console.log('[SignalR] SendMessage invoked successfully');
        } catch (error: any) {
            console.error('SignalR: Erreur détaillée lors de l\'envoi du message:', error);
            
            // Log specific error properties
            if (error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            // Si l'erreur est liée à l'authentification (401), alors on force le refresh et la reconnexion
            if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Auth'))) {
                console.log('[SignalR] Auth error detected on invoke, attempting refresh and reconnect...');
                const newToken = await this.refreshTokenIfNeeded();
                if (newToken) {
                    console.log('[SignalR] Token refreshed, reconnecting...');
                    await this.stop();
                    await this.start();
                    // Retry once
                    console.log('[SignalR] Retrying SendMessage...');
                    await this.connection?.invoke('SendMessage', user, content);
                    return;
                }
            }

            throw error;
        }
    }

    getConnectionState(): signalR.HubConnectionState {
        return this.connection?.state || signalR.HubConnectionState.Disconnected;
    }

    getConnectionId(): string | null {
        return this.connection?.connectionId || null;
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Instance singleton
export const signalRService = new SignalRService();

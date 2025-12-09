'use client';

import { useEffect, useState, useCallback } from 'react';
import { signalRService } from '@/lib/signalr';
import { NowPlayingUpdateEvent, ReceiveMessageEvent, InfoEvent, ChatMessage } from '@/types/radio';
import { useRadioStore } from '@/store/useRadioStore';
import { HubConnectionState } from '@microsoft/signalr';

interface UseRadioHubReturn {
    isConnected: boolean;
    connectionState: HubConnectionState;
    error: string | null;
    messages: ChatMessage[];
    sendMessage: (user: string, content: string) => Promise<void>;
}

export function useRadioHub(): UseRadioHubReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<HubConnectionState>(HubConnectionState.Disconnected);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const { setNowPlaying, setListeners } = useRadioStore();

    // Handler pour les mises à jour nowplaying
    const handleNowPlayingUpdate = useCallback((...args: any[]) => {
        console.log('🎵 NowPlaying Update received - Arguments:', args);
        console.log('🎵 Number of arguments:', args.length);

        // Le serveur peut envoyer les données dans différents formats
        // Essayons de gérer les deux cas
        const data = args.length === 1 ? args[0] : args;

        console.log('🎵 Processed data:', data);

        // Si les données ont la structure attendue
        if (data && typeof data === 'object') {
            if ('nowPlaying' in data && 'listeners' in data) {
                console.log('✅ Setting nowPlying:', data.nowPlaying);
                console.log('✅ Setting listeners:', data.listeners);
                setNowPlaying(data.nowPlaying);
                setListeners(data.listeners);
            } else {
                // Si le serveur envoie directement les données nowplaying
                console.log('⚠️ Data structure differs from expected. Raw data:', data);
                // Essayons de mapper les données
                if (data.now_playing) {
                    setNowPlaying(data.now_playing);
                }
                if (data.listeners) {
                    setListeners(data.listeners);
                }
            }
        }
    }, [setNowPlaying, setListeners]);

    // Handler pour les messages chat
    const handleReceiveMessage = useCallback((...args: any[]) => {
        console.log('💬 Chat Message received - Arguments:', args);
        const data = args.length === 1 ? args[0] : args;
        console.log('💬 Processed data:', data);

        if (data && typeof data === 'object') {
            const message = 'message' in data ? data.message : data;
            console.log('💬 Adding message:', message);
            setMessages((prev) => [...prev, message]);
        }
    }, []);

    // Handler pour les notifications système
    const handleInfo = useCallback((...args: any[]) => {
        console.log('ℹ️ Info received - Arguments:', args);
        const data = args.length === 1 ? args[0] : args;
        console.log('ℹ️ Processed data:', data);
    }, []);

    // Handler pour le nombre de spectateurs
    const handleViewerCountUpdated = useCallback((count: number) => {
        console.log('👥 Viewer count updated:', count);
        // On met à jour uniquement le champ current pour l'instant
        setListeners({
            current: count,
            unique: count, // approximate
            total: count // approximate
        });
    }, [setListeners]);

    // Fonction pour envoyer un message
    const sendMessage = useCallback(async (user: string, content: string) => {
        try {
            console.log('📤 Sending message:', { user, content });
            await signalRService.sendChatMessage(user, content);
            console.log('✅ Message sent successfully');
        } catch (err) {
            console.error('❌ Erreur lors de l\'envoi du message:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            throw err;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const connect = async () => {
            try {
                console.log('🔌 Attempting to connect to SignalR hub...');

                // Démarrer la connexion
                await signalRService.start();

                if (!mounted) return;

                console.log('✅ SignalR connected successfully');
                console.log('📡 Connection ID:', signalRService.getConnectionId());

                // Enregistrer les handlers d'événements
                console.log('📝 Registering event handlers...');
                signalRService.onNowPlayingUpdate(handleNowPlayingUpdate);
                signalRService.onReceiveMessage(handleReceiveMessage);
                signalRService.onInfo(handleInfo);
                signalRService.onViewerCountUpdated(handleViewerCountUpdated);
                console.log('✅ Event handlers registered');

                setIsConnected(signalRService.isConnected());
                setConnectionState(signalRService.getConnectionState());
                setError(null);
            } catch (err) {
                console.error('❌ Erreur de connexion SignalR:', err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Erreur de connexion');
                    setIsConnected(false);
                    setConnectionState(signalRService.getConnectionState());
                }
            }
        };

        connect();

        // Intervalle pour vérifier l'état de la connexion
        const interval = setInterval(() => {
            if (mounted) {
                setIsConnected(signalRService.isConnected());
                setConnectionState(signalRService.getConnectionState());
            }
        }, 5000);

        // Cleanup
        return () => {
            mounted = false;
            clearInterval(interval);

            // Retirer les handlers
            signalRService.offNowPlayingUpdate(handleNowPlayingUpdate);
            signalRService.offReceiveMessage(handleReceiveMessage);
            signalRService.offInfo(handleInfo);
            signalRService.offViewerCountUpdated(handleViewerCountUpdated);

            // Note: On ne déconnecte pas le service car il peut être utilisé par d'autres composants
            // signalRService.stop();
        };
    }, [handleNowPlayingUpdate, handleReceiveMessage, handleInfo, handleViewerCountUpdated]);

    return {
        isConnected,
        connectionState,
        error,
        messages,
        sendMessage,
    };
}

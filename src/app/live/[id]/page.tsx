'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { livesApi } from '@/lib/api/lives';
import MainLayout from '@/components/layout/MainLayout';
import LiveVideoPlayer from '@/components/live/LiveVideoPlayer';
import ChatContainer from '@/components/chat/ChatContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Users, Eye } from 'lucide-react';
import { useEffect } from 'react';
import { useLiveStore } from '@/store/useLiveStore';

interface LivePageProps {
    params: Promise<{ id: string }>;
}

export default function LiveDetailPage({ params }: LivePageProps) {
    const resolvedParams = use(params);
    const { updateViewers } = useLiveStore();

    const { data: live, isLoading } = useQuery({
        queryKey: ['live', resolvedParams.id],
        queryFn: () => livesApi.getById(resolvedParams.id),
    });

    // Mettre à jour le nombre de viewers
    useEffect(() => {
        if (!live) return;
        updateViewers(live.viewers);

        const interval = setInterval(async () => {
            const data = await livesApi.getViewers(resolvedParams.id);
            updateViewers(data.count);
        }, 5000);

        return () => clearInterval(interval);
    }, [live, resolvedParams.id, updateViewers]);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="p-6">Chargement...</div>
            </MainLayout>
        );
    }

    if (!live) {
        notFound();
    }

    return (
        <MainLayout>
            <div className="max-w-screen-2xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Player */}
                        <LiveVideoPlayer streamUrl={live.streamUrl} />

                        {/* Informations */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {live.title}
                                </h1>
                                <Badge variant="live" size="lg">
                                    LIVE
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <Avatar
                                    src={live.channelAvatar}
                                    alt={live.channelName}
                                    size="lg"
                                    fallback={live.channelName.charAt(0)}
                                />
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg">{live.channelName}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {live.viewers.toLocaleString()} spectateurs
                                        </span>
                                        <span>•</span>
                                        <span>Commencé à {new Date(live.startedAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            {live.description && (
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {live.description}
                                </p>
                            )}

                            {live.category && (
                                <div className="mt-4">
                                    <Badge variant="primary">{live.category}</Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne chat */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 h-[calc(100vh-7rem)]">
                            <ChatContainer liveId={resolvedParams.id} />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// Helper necessaire pour Next.js 16
function use<T>(promise: Promise<T>): T {
    throw promise;
}

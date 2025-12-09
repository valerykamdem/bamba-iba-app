import { notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import MediaPlayer from '@/components/media/MediaPlayer';
import MediaInfo from '@/components/media/MediaInfo';
import MediaComments from '@/components/media/MediaComments';
import MediaRecommendations from '@/components/media/MediaRecommendations';
import { mediaApi } from '@/lib/api/media';

interface ListenPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ListenPage({ params }: ListenPageProps) {
    const { id } = await params;

    let media;
    try {
        media = await mediaApi.getById(id);
    } catch (error) {
        notFound();
    }

    if (!media || media.type !== 'audio') {
        notFound();
    }

    // Récupérer les audios recommandés
    const response = await mediaApi.list({ pageSize: 10 });
    const recommendations = response.data
        .filter(m => m.type === 'audio' && m.id !== media.id)
        .slice(0, 10);

    // Mapper les médias vers le format Audio pour compatibility
    const audio = {
        id: media.id,
        title: media.title,
        speaker: media.speaker,
        category: media.category,
        topic: media.topic,
        coverImageUrl: media.thumbnail,
        duration: media.duration,
        url: media.mediaUrl,
        timestamp: media.timestamp,
        likes: media.likes,
        comments: media.comments,
        description: media.description,
    };

    const recommendedAudios = recommendations.map(m => ({
        id: m.id,
        title: m.title,
        speaker: m.speaker,
        category: m.category,
        topic: m.topic,
        coverImageUrl: m.thumbnail,
        duration: m.duration,
        url: m.mediaUrl,
        timestamp: m.timestamp,
        likes: m.likes,
        comments: m.comments,
        description: m.description,
    }));

    return (
        <MainLayout>
            <div className="max-w-[1920px] mx-auto p-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column - Player and Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <MediaPlayer
                            type="audio"
                            src={media.mediaUrl}
                            poster={media.thumbnail}
                            title={media.title}
                            subtitle={media.speaker}
                            qualities={media.qualities}
                            subtitles={media.subtitles}
                            nextUrl={recommendedAudios.length > 0 ? `/listen/${recommendedAudios[0].id}` : undefined}
                        />
                        <MediaInfo audio={audio} />
                        <div className="mt-8">
                            <MediaComments mediaId={media.id} />
                        </div>
                    </div>

                    {/* Sidebar Column - Recommendations */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <MediaRecommendations audios={recommendedAudios} />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// Generate dynamic metadata
export async function generateMetadata({ params }: ListenPageProps) {
    const { id } = await params;

    let media;
    try {
        media = await mediaApi.getById(id);
    } catch (error) {
        return {
            title: 'Audio non trouvé',
        };
    }

    if (!media) {
        return {
            title: 'Audio non trouvé',
        };
    }

    return {
        title: `${media.title} - Bambaiba Audio`,
        description: media.description || `Écoutez ${media.title} sur Bambaiba`,
    };
}

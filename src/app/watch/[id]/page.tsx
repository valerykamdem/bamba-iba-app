import { notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import MediaPlayer from '@/components/media/MediaPlayer';
import MediaInfo from '@/components/media/MediaInfo';
import MediaComments from '@/components/media/MediaComments';
import MediaRecommendations from '@/components/media/MediaRecommendations';
import { mediaApi } from '@/lib/api/media';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  let media;
  try {
    media = await mediaApi.getById(id);
  } catch (error) {
    notFound();
  }

  if (!media || media.type !== 'video') {
    notFound();
  }

  // Récupérer les vidéos recommandées
  const response = await mediaApi.list({ pageSize: 10 });
  const recommendations = response.data
    .filter(m => m.type === 'video' && m.id !== media.id)
    .slice(0, 10);

  // Mapper les médias vers le format Video pour compatibility
  const video = {
    id: media.id,
    title: media.title,
    channel: media.speaker,
    channelId: media.speaker,
    views: `${media.plays}`,
    timestamp: media.timestamp,
    duration: media.duration,
    thumbnail: media.thumbnail,
    description: media.description,
    channelImage: media.thumbnail,
    videoUrl: media.mediaUrl,
  };

  const recommendedVideos = recommendations.map(m => ({
    id: m.id,
    title: m.title,
    channel: m.speaker,
    channelId: m.speaker,
    views: `${m.plays}`,
    timestamp: m.timestamp,
    duration: m.duration,
    thumbnail: m.thumbnail,
    description: m.description,
    channelImage: m.thumbnail,
    videoUrl: m.mediaUrl,
  }));

  return (
    <MainLayout>
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Vidéo et infos */}
          <div className="lg:col-span-2 space-y-4">
            <MediaPlayer
              type="video"
              src={media.mediaUrl}
              poster={media.thumbnail}
              title={media.title}
              subtitle={media.speaker}
              autoPlay
            />
            <MediaInfo video={video} />
            <MediaComments mediaId={media.id} />
          </div>

          {/* Colonne latérale - Recommandations */}
          <div className="lg:col-span-1">
            <MediaRecommendations videos={recommendedVideos} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Générer les métadonnées dynamiques
export async function generateMetadata({ params }: WatchPageProps) {
  const { id } = await params;

  let media;
  try {
    media = await mediaApi.getById(id);
  } catch (error) {
    return {
      title: 'Vidéo non trouvée',
    };
  }

  if (!media) {
    return {
      title: 'Vidéo non trouvée',
    };
  }

  return {
    title: `${media.title} - Bambaiba`,
    description: media.description || `Regardez ${media.title} sur Bambaiba`,
  };
}
'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api/media';
import { livesApi } from '@/lib/api/lives';
import MainLayout from '@/components/layout/MainLayout';
import MediaCard from '@/components/media/MediaCard';
import LiveCard from '@/components/live/LiveCard';
import HeroSection from '@/components/home/HeroSection';
import SectionHeader from '@/components/ui/SectionHeader';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { Tv, Flame, History } from 'lucide-react';

export default function HomePage() {
  // Récupérer les médias
  const { data: media, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['media'],
    queryFn: () => mediaApi.list({ pageSize: 20 }),
  });

  // Récupérer les lives actifs
  const { data: lives } = useQuery({
    queryKey: ['lives'],
    queryFn: () => livesApi.getActive(),
  });

  const activeLives = lives || [];

  return (
    <MainLayout>
      <div className="pb-24 space-y-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Active Lives */}
        {activeLives.length > 0 && (
          <section>
            <SectionHeader
              title="En direct maintenant"
              subtitle="Live"
              icon={<Tv className="w-5 h-5" />}
              href="/live"
            />

            <div className="px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLives.map((live) => (
                  <div key={live.id} className="w-full">
                    <LiveCard live={live} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trending Media */}
        <section>
          <SectionHeader
            title="Tendances du moment"
            subtitle="Populaire"
            icon={<Flame className="w-5 h-5" />}
          />

          {isLoadingMedia ? (
            <div className="px-6 md:px-12">
              <GridSkeleton count={4} />
            </div>
          ) : (
            <div className="px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {media?.data?.slice(0, 4).map((item) => (
                  <div key={item.id} className="w-full">
                    <MediaCard media={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Recent Media */}
        <section>
          <SectionHeader
            title="Récemment ajoutés"
            subtitle="Nouveautés"
            icon={<History className="w-5 h-5" />}
            href="/media"
          />

          {isLoadingMedia ? (
            <div className="px-6 md:px-12">
              <GridSkeleton count={4} />
            </div>
          ) : (
            <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {media?.data?.map((item) => (
                <MediaCard key={item.id} media={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
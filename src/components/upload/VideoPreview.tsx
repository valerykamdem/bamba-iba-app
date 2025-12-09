'use client';

import { Play } from 'lucide-react';

interface VideoPreviewProps {
  videoUrl: string;
}

export default function VideoPreview({ videoUrl }: VideoPreviewProps) {
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-white" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}
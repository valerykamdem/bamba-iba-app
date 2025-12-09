import MainLayout from '@/components/layout/MainLayout';
import VideoUploadForm from '@/components/upload/VideoUploadForm';

export const metadata = {
  title: 'Uploader une vidéo - VidéoPro',
  description: 'Partagez vos vidéos avec le monde',
};

export default function UploadPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Uploader une vidéo
          </h1>
          <p className="text-gray-600">
            Partagez votre contenu avec votre communauté
          </p>
        </div>

        <VideoUploadForm />
      </div>
    </MainLayout>
  );
}
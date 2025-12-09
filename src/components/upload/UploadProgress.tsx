'use client';

import { CheckCircle, Loader } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
}

export default function UploadProgress({ progress }: UploadProgressProps) {
  const isComplete = progress === 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {isComplete ? 'Upload terminé !' : 'Upload en cours...'}
          </h3>
          <p className="text-sm text-gray-600">
            {isComplete ? 'Votre vidéo est maintenant en ligne' : `${progress}% complété`}
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isComplete && (
        <p className="text-xs text-gray-500 mt-2">
          Veuillez ne pas fermer cette page pendant l'upload
        </p>
      )}
    </div>
  );
}
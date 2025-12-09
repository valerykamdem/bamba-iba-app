'use client';

import { useState, useRef } from 'react';
import { Upload, Video, X, Image as ImageIcon, FileVideo } from 'lucide-react';
import Image from 'next/image';
import UploadProgress from './UploadProgress';
import VideoPreview from './VideoPreview';

interface VideoData {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  thumbnail?: File;
}

export default function VideoUploadForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<VideoData>({
    title: '',
    description: '',
    category: 'education',
    visibility: 'public',
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      // Générer un titre par défaut depuis le nom du fichier
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    } else {
      alert('Veuillez sélectionner un fichier vidéo valide');
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: undefined }));
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Veuillez sélectionner une vidéo');
      return;
    }

    if (!formData.title.trim()) {
      alert('Veuillez entrer un titre');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('video', videoFile);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('category', formData.category);
    uploadFormData.append('visibility', formData.visibility);

    if (formData.thumbnail) {
      uploadFormData.append('thumbnail', formData.thumbnail);
    }

    try {
      // Simuler la progression de l'upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        alert('Vidéo uploadée avec succès !');
        // Réinitialiser le formulaire
        handleRemoveVideo();
        handleRemoveThumbnail();
        setFormData({
          title: '',
          description: '',
          category: 'education',
          visibility: 'public',
        });
        setUploadProgress(0);
      } else {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de la vidéo');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Zone de drop vidéo */}
      {!videoFile ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sélectionnez une vidéo à uploader
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              Ou glissez-déposez un fichier vidéo
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileVideo className="w-4 h-4" />
              <span>MP4, WebM, MOV (Max 2GB)</span>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleVideoSelect}
            />
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Vidéo sélectionnée
            </h3>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {videoUrl && <VideoPreview videoUrl={videoUrl} />}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 font-medium mb-1">
              {videoFile.name}
            </p>
            <p className="text-xs text-gray-500">
              Taille: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {/* Progression de l'upload */}
      {uploading && <UploadProgress progress={uploadProgress} />}

      {/* Formulaire de détails */}
      {videoFile && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Détails de la vidéo
          </h3>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Donnez un titre accrocheur à votre vidéo"
              maxLength={100}
              className="input-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 caractères
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre vidéo..."
              rows={5}
              maxLength={5000}
              className="input-base resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/5000 caractères
            </p>
          </div>

          {/* Miniature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miniature personnalisée
            </label>

            {!thumbnailPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Choisir une image</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                />
              </label>
            ) : (
              <div className="relative h-40 w-full">
                <Image
                  src={thumbnailPreview}
                  alt="Miniature"
                  fill
                  className="object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="input-base"
            >
              <option value="enseignement">Enseignement</option>
              <option value="prophetie">Prophetie</option>
              <option value="cantique">Cantique</option>
              <option value="songe">Songe</option>
              <option value="lecture">Lecture</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Visibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibilité
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as VideoData['visibility'] }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Public</p>
                  <p className="text-sm text-gray-600">Tout le monde peut voir cette vidéo</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="unlisted"
                  checked={formData.visibility === 'unlisted'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as VideoData['visibility'] }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Non répertorié</p>
                  <p className="text-sm text-gray-600">Seules les personnes avec le lien peuvent voir</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as VideoData['visibility'] }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Privé</p>
                  <p className="text-sm text-gray-600">Seulement vous pouvez voir cette vidéo</p>
                </div>
              </label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="btn-secondary"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !formData.title.trim()}
            >
              {uploading ? 'Upload en cours...' : 'Publier la vidéo'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
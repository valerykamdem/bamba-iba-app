import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Aucune vidéo fournie' },
        { status: 400 }
      );
    }

    // Créer les dossiers s'ils n'existent pas
    const videosDir = path.join(process.cwd(), 'public/videos');
    const thumbnailsDir = path.join(process.cwd(), 'public/thumbnails');

    if (!existsSync(videosDir)) {
      await mkdir(videosDir, { recursive: true });
    }
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true });
    }

    // Sauvegarder la vidéo
    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);
    const videoFilename = `${Date.now()}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const videoPath = path.join(videosDir, videoFilename);
    await writeFile(videoPath, videoBuffer);

    // Sauvegarder la miniature si fournie
    let thumbnailUrl = null;
    if (thumbnailFile) {
      const thumbnailBytes = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      const thumbnailFilename = `${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
      await writeFile(thumbnailPath, thumbnailBuffer);
      thumbnailUrl = `/thumbnails/${thumbnailFilename}`;
    }

    // Ici, vous pourriez sauvegarder les métadonnées dans une base de données
    const videoData = {
      id: Date.now(),
      title,
      description,
      category,
      visibility,
      videoUrl: `/videos/${videoFilename}`,
      thumbnailUrl,
      uploadDate: new Date().toISOString(),
    };

    console.log('Vidéo uploadée:', videoData);

    return NextResponse.json({
      success: true,
      message: 'Vidéo uploadée avec succès',
      data: videoData,
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la vidéo' },
      { status: 500 }
    );
  }
}

// Configuration pour autoriser les fichiers volumineux
export const config = {
  api: {
    bodyParser: false,
  },
};
import { YouTubeVideo } from '@/types/youtube';

// // Liste des vidéos de la chaîne @BambaIba-officiel
// // Vous pouvez ajouter manuellement de nouvelles vidéos ici
// export const youtubeVideos: YouTubeVideo[] = [
//     {
//         id: '1',
//         url: 'https://www.youtube.com/watch?v=VIDEO_ID_1',
//         title: 'Exemple Vidéo 1',
//         description: 'Description de la première vidéo',
//         thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg',
//         duration: '10:30',
//         publishedAt: '2024-11-20T00:00:00Z',
//     },
//     {
//         id: '2',
//         url: 'https://www.youtube.com/watch?v=VIDEO_ID_2',
//         title: 'Exemple Vidéo 2',
//         description: 'Description de la deuxième vidéo',
//         thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_2/maxresdefault.jpg',
//         duration: '15:45',
//         publishedAt: '2024-11-18T00:00:00Z',
//     },
//     // Ajoutez plus de vidéos ici...
// ];

// // Fonction utilitaire pour obtenir une vidéo par ID
// export const getVideoById = (id: string): YouTubeVideo | undefined => {
//     return youtubeVideos.find(video => video.id === id);
// };

// Fonction utilitaire pour extraire l'ID YouTube d'une URL
export const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

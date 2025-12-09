import { NextResponse } from 'next/server';
import { YouTubeVideo } from '@/types/youtube';

const CHANNEL_ID = 'UCRew43Uz-KVeIpVOggVYMSQ';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Interface pour le parsing XML
interface YouTubeRSSEntry {
    'yt:videoId': string[];
    title: string[];
    link: Array<{ $: { href: string } }>;
    published: string[];
    'media:group': Array<{
        'media:thumbnail': Array<{ $: { url: string; width: string; height: string } }>;
        'media:description': string[];
        'media:community': Array<{
            'media:statistics': Array<{ $: { views: string } }>;
        }>;
    }>;
}

interface YouTubeRSSFeed {
    feed: {
        entry?: YouTubeRSSEntry[];
    };
}

// Fonction pour parser le XML du flux RSS YouTube
async function parseYouTubeRSS(xmlText: string): Promise<YouTubeVideo[]> {
    const videos: YouTubeVideo[] = [];

    try {
        // Utiliser DOMParser pour parser le XML (côté serveur avec une expression régulière simple)
        // Pour une solution plus robuste, on pourrait utiliser une bibliothèque comme 'fast-xml-parser'

        // Extraire toutes les entrées <entry>
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        const entries = xmlText.match(entryRegex) || [];

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];

            // Extraire les informations de chaque vidéo
            const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entry.match(/<title>(.*?)<\/title>/);
            const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
            const thumbnailMatch = entry.match(/<media:thumbnail url="(.*?)"/);
            const descriptionMatch = entry.match(/<media:description>(.*?)<\/media:description>/);
            const viewsMatch = entry.match(/<media:statistics views="(.*?)"/);

            if (videoIdMatch && titleMatch && publishedMatch) {
                const videoId = videoIdMatch[1];
                const title = titleMatch[1]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                videos.push({
                    id: videoId,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    title: title,
                    description: descriptionMatch ? descriptionMatch[1] : '',
                    thumbnail: thumbnailMatch
                        ? thumbnailMatch[1]
                        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    duration: '', // Le flux RSS ne fournit pas la durée
                    publishedAt: publishedMatch[1],
                    views: viewsMatch ? parseInt(viewsMatch[1]) : 0,
                });
            }
        }

        return videos;
    } catch (error) {
        console.error('Error parsing YouTube RSS:', error);
        return [];
    }
}

export async function GET() {
    try {
        console.log('📺 Fetching YouTube RSS feed...');

        // Récupérer le flux RSS
        const response = await fetch(RSS_URL, {
            next: { revalidate: 300 } // Cache pendant 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }

        const xmlText = await response.text();

        // Parser le XML et extraire les vidéos
        const videos = await parseYouTubeRSS(xmlText);

        console.log(`✅ Successfully fetched ${videos.length} videos from RSS feed`);

        return NextResponse.json({
            success: true,
            channelName: 'Bamba Iba',
            channelId: CHANNEL_ID,
            videos: videos,
            count: videos.length,
        });

    } catch (error) {
        console.error('❌ Error fetching YouTube RSS:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch YouTube videos',
                message: error instanceof Error ? error.message : 'Unknown error',
                videos: [],
            },
            { status: 500 }
        );
    }
}

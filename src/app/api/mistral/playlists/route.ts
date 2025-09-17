import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

interface PlaylistRequest {
  topGenres: string[];
  topArtists: string[];
}

interface PlaylistResponse {
  name: string;
  description: string;
  occasion: string;
  songs: string[];
  seedArtists?: string[];
  image?: string;
}

const fallbackPlaylists: PlaylistResponse[] = [
  {
    name: 'AI Discovery Mix',
    description: 'A personalized blend of your favorite genres with new discoveries',
    occasion: 'Perfect for any time of day',
    songs: ['Artist - Song Title', 'Another Artist - Great Track', 'Featured Artist - Popular Hit']
  },
  {
    name: 'Your Vibe Playlist',
    description: 'Carefully curated tracks that match your unique music taste',
    occasion: 'For focus, relaxation, or discovery',
    songs: ['Indie Artist - Atmospheric Song', 'Alternative Band - Catchy Tune', 'Electronic Artist - Chill Beat']
  },
  {
    name: 'Genre Fusion',
    description: 'A creative mix blending your top genres into one cohesive experience',
    occasion: 'When you want variety',
    songs: ['Multi-Genre Artist - Fusion Track', 'Cross-Over Band - Hybrid Song', 'Experimental Artist - Unique Sound']
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const { topGenres, topArtists } = (body as PlaylistRequest) || {};

    if (!topGenres || !topArtists) {
      return NextResponse.json({ success: false, error: 'Missing required data', playlists: fallbackPlaylists }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.warn('Mistral API key not configured, using fallbacks');
      return NextResponse.json({ success: true, playlists: generatePersonalizedFallbacks(topGenres, topArtists), source: 'fallback' });
    }

    try {
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });
      const prompt = createSimplifiedPrompt(topGenres, topArtists);

      const timeoutPromise = new Promise((_res, reject) => setTimeout(() => reject(new Error('Mistral API timeout')), 8000));
      const mistralPromise = mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a music curator. Always respond with valid JSON only. No explanations outside the JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 1500
      });

      const response = (await Promise.race([mistralPromise, timeoutPromise])) as unknown;
      type MistralChoice = { message?: { content?: string } | null };
      type MistralChatResponse = { choices?: MistralChoice[] | null };

      if (!response || typeof response !== 'object') throw new Error('Invalid response from Mistral');
      const respTyped = response as MistralChatResponse;
      const content = respTyped.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content from Mistral');

      const parsedPlaylists = parseResponseSafely(content, topGenres, topArtists);
      return NextResponse.json({ success: true, playlists: parsedPlaylists, source: 'mistral', timestamp: new Date().toISOString() });
    } catch (mistralError) {
      console.warn('Mistral API failed:', mistralError);
      return NextResponse.json({ success: true, playlists: generatePersonalizedFallbacks(topGenres, topArtists), source: 'fallback_after_error', error: mistralError instanceof Error ? mistralError.message : 'Unknown error' });
    }
  } catch (error) {
    console.error('Playlist API error:', error);
    return NextResponse.json({ success: true, playlists: fallbackPlaylists, source: 'emergency_fallback', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 200 });
  }
}

function createSimplifiedPrompt(topGenres: string[], topArtists: string[]): string {
  return `Create exactly 3 playlist recommendations for a user who likes:\n- Genres: ${topGenres.slice(0, 3).join(', ')}\n- Artists: ${topArtists.slice(0, 3).join(', ')}\n\nRespond with ONLY this JSON format:\n{\n  "playlists": [\n    {\n      "name": "Creative Playlist Name",\n      "description": "Brief description of the playlist",\n      "occasion": "When to listen (e.g., workout, focus, chill)",\n      "songs": ["Artist - Song", "Artist - Song", "Artist - Song", "Artist - Song", "Artist - Song"]\n    }\n  ]\n}\n\nMake the playlist names creative and specific, not generic. Include 5 songs per playlist in \"Artist - Song\" format.`;
}

function parseResponseSafely(content: unknown, topGenres: string[], topArtists: string[]): PlaylistResponse[] {
  try {
    let contentString = '';
    if (typeof content === 'string') contentString = content;
    else if (Array.isArray(content)) contentString = content.map((c) => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object' && 'text' in c && typeof (c as Record<string, unknown>).text === 'string') {
        return (c as Record<string, unknown>).text as string;
      }
      return '';
    }).join('');
    else if (content && typeof content === 'object') {
      const c = content as Record<string, unknown>;
      if ('text' in c && typeof c.text === 'string') contentString = c.text as string;
      else contentString = JSON.stringify(content);
    } else contentString = String(content ?? '');

    const jsonMatch = contentString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    if (!('playlists' in parsed) || !Array.isArray(parsed.playlists)) throw new Error('Invalid playlist format');
    const playlistsRaw = parsed.playlists as unknown[];

    return playlistsRaw.slice(0, 3).map((pl) => {
      const item = (pl as Record<string, unknown>) || {};
      const name = typeof item.name === 'string' ? item.name : 'AI Generated Playlist';
      const description = typeof item.description === 'string' ? item.description : 'Curated for your music taste';
      const occasion = typeof item.occasion === 'string' ? item.occasion : 'Perfect for any time';
      const songs = Array.isArray(item.songs) ? (item.songs.filter((s): s is string => typeof s === 'string').slice(0, 8) as string[]) : [`${topArtists[0] || 'Popular Artist'} - Great Song`];
      return { name, description, occasion, songs, seedArtists: topArtists.slice(0, 3) } as PlaylistResponse;
    });
  } catch (err) {
    console.warn('Failed to parse Mistral response:', err);
    return generatePersonalizedFallbacks(topGenres, topArtists);
  }
}

function generatePersonalizedFallbacks(topGenres: string[], topArtists: string[]): PlaylistResponse[] {
  const genre = topGenres[0] || 'music';
  const artist = topArtists[0] || 'your favorite artist';
  return [
    {
      name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Essentials`,
      description: `The best ${genre} tracks curated for your taste`,
      occasion: 'Perfect for discovering new favorites',
      songs: [`${artist} - Popular Track`, `Similar Artist - Great Song`, `${genre} Artist - Hit Single`, `Featured Artist - Trending Song`, `Recommended Artist - Top Track`],
      seedArtists: topArtists.slice(0, 3)
    },
    {
      name: 'Your Discovery Mix',
      description: 'New music recommendations based on your listening history',
      occasion: 'For exploration and discovery',
      songs: ['New Artist - Trending Track', 'Rising Star - Viral Song', 'Indie Artist - Hidden Gem', 'Alternative Band - Latest Single', 'Electronic Artist - Dance Track']
    },
    {
      name: `More Like ${artist}`,
      description: `Artists and songs similar to ${artist}`,
      occasion: 'When you want more of what you love',
      songs: [`${artist} - Deep Cut`, 'Similar Artist 1 - Best Song', 'Similar Artist 2 - Popular Track', 'Related Band - Hit Single', 'Recommended Artist - Fan Favorite']
    }
  ];
}


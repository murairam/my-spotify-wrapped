// 2. FIXED: src/app/api/mistral/playlists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

interface PlaylistRequest {
  topGenres: string[];
  topArtists: string[];
  userProfile?: {
    display_name?: string;
    country?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Mistral API key not configured" },
        { status: 500 }
      );
    }

    const { topGenres, topArtists, userProfile }: PlaylistRequest = await request.json();

    if (!topGenres || !topArtists) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert music curator. Produce exactly 3 playlist recommendations tailored to this user's taste. Respond with valid JSON only. Do NOT include any extra commentary.

INPUT:
Top Genres: ${topGenres.join(', ')}
Top Artists: ${topArtists.join(', ')}
${userProfile?.country ? `Location: ${userProfile.country}` : ''}

REQUIREMENTS:
- Return a top-level object with a single key "playlists" that is an array of 3 playlist objects.
- Each playlist object must include: name (string), description (string), occasion (string), seedArtists (array of strings), songs (array of 8-12 strings in the format "Artist - Song Title"), image (optional string URL).
- Song strings must be in the format exactly: "Artist - Song Title".
- Use non-generic, creative playlist names and specific song picks that fit the seeds/genres.

EXAMPLE RESPONSE SCHEMA:
{
  "playlists": [
    {
      "name": "Late Night Indie Drift",
      "description": "A moody, intimate set perfect for winding down",
      "occasion": "Late-night thinking, calm",
      "seedArtists": ["Artist A", "Artist B"],
      "songs": ["Artist - Song Title", "Artist - Song Title", ...],
      "image": "https://...optional.jpg"
    }
  ]
}

Now produce the JSON according to the schema.`;

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: 'system', content: 'You are an expert music curator. Produce ONLY valid JSON matching the schema the user requested.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      maxTokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Mistral AI');
    }

    let parsedResponse;
    try {
      // FIXED: Handle different content types from Mistral API
      let contentString = '';
      if (typeof content === 'string') {
        contentString = content;
      } else if (Array.isArray(content)) {
        // Handle ContentChunk[] format safely (some chunk types like image_url may not have text)
        type ContentWithText = { text?: unknown };
        contentString = content.map(chunk => {
          if (typeof chunk === 'string') return chunk;
          if (chunk && typeof chunk === 'object' && 'text' in (chunk as ContentWithText) && typeof (chunk as ContentWithText).text === 'string') {
            return (chunk as ContentWithText).text as string;
          }
          return '';
        }).join('');
      } else {
        contentString = String(content);
      }

      // Try to extract JSON from the response robustly
      const jsonMatch = contentString.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : contentString;
      parsedResponse = JSON.parse(jsonStr);

      // Normalize to expected shape: ensure songs arrays are strings and seedArtists exist
      if (parsedResponse && Array.isArray(parsedResponse.playlists)) {
        parsedResponse.playlists = parsedResponse.playlists.slice(0, 3).map((p: unknown) => {
          const rec = (p && typeof p === 'object') ? (p as Record<string, unknown>) : {} as Record<string, unknown>;
          const name = typeof rec['name'] === 'string' ? rec['name'] as string : 'Custom Playlist';
          const description = typeof rec['description'] === 'string' ? rec['description'] as string : '';
          const occasion = typeof rec['occasion'] === 'string' ? rec['occasion'] as string : '';
          const seedArtists = Array.isArray(rec['seedArtists']) ? rec['seedArtists'] as string[] : (Array.isArray(rec['seed_artists']) ? rec['seed_artists'] as string[] : topArtists.slice(0, 3));
          const songs = Array.isArray(rec['songs']) ? (rec['songs'] as unknown[]).filter((s): s is string => typeof s === 'string') : [];
          const image = typeof rec['image'] === 'string' ? rec['image'] as string : undefined;
          return { name, description, occasion, seedArtists, songs, image };
        });
      }
    } catch (parseError) {
      console.error('Failed to parse Mistral response:', parseError);
      // Fallback with basic structure
      parsedResponse = {
        playlists: [
          {
            name: "Your Personal Mix",
            description: "A curated blend of your favorite genres and artists",
            occasion: "Perfect for focus work or relaxing",
            songs: topArtists.slice(0, 5).map(artist => `${artist} - Popular Track`)
          }
        ]
      };
    }

    return NextResponse.json({
      success: true,
      ...parsedResponse,
      metadata: {
        model: "mistral-small-latest",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Mistral playlist error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate playlist recommendations',
        success: false
      },
      { status: 500 }
    );
  }
}


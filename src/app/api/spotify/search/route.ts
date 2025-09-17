// src/app/api/spotify/search/route.ts
// General Spotify search endpoint for artists, tracks, etc.
import { NextRequest, NextResponse } from 'next/server';
// Ensure this API route is always treated as dynamic (uses session/headers)
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'artist,track';
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`🔍 Spotify search: "${query}" (${type})`);

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Spotify search failed:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        error: errorText
      });

      return NextResponse.json(
        { error: 'Failed to search Spotify' },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();
    console.log(`✅ Spotify search found:`, {
      artists: data.artists?.items?.length || 0,
      tracks: data.tracks?.items?.length || 0,
      albums: data.albums?.items?.length || 0
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

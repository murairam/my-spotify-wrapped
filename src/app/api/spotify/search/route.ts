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

    // Authorization: Only allow users to search their own data (example: check user id if needed)
    // if (session.user?.id !== expectedUserId) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'artist,track';
    const limit = searchParams.get('limit') || '20';

    // Input validation
    if (!query || typeof query !== 'string' || query.length > 100) {
      return NextResponse.json({ error: 'Query parameter is required and must be less than 100 characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9\s\-_'",.?!]+$/.test(query)) {
      return NextResponse.json({ error: 'Query contains invalid characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z,]+$/.test(type)) {
      return NextResponse.json({ error: 'Type parameter is invalid' }, { status: 400 });
    }
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return NextResponse.json({ error: 'Limit must be between 1 and 50' }, { status: 400 });
    }

    // Remove logging in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`Spotify search: "${query}" (${type})`);
    }

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('Spotify search failed:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          error: errorText
        });
      }
      return NextResponse.json(
        { error: 'Failed to search Spotify' },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('Spotify search found:', {
        artists: data.artists?.items?.length || 0,
        tracks: data.tracks?.items?.length || 0,
        albums: data.albums?.items?.length || 0
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Search error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

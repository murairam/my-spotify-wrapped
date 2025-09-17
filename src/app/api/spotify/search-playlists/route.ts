// 1. FIXED: src/app/api/spotify/search-playlists/route.ts
import { NextRequest, NextResponse } from 'next/server';
// This route uses request headers / server session and must be dynamic
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Fixed import path

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Simple in-memory cache to reduce Spotify API calls during matching. Keyed by query|limit|includeTracks
    // TTL is short to keep results fresh but avoid repeated identical requests.
    const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
  type CacheEntry = { ts: number; payload: unknown };
  // store cache on module-level global to persist across invocations in the same server instance
  // keep typing strict: use unknown on global and assert the map shape safely
  const globalAny = global as unknown as { __spotify_search_cache?: Map<string, CacheEntry> };
  if (!globalAny.__spotify_search_cache) globalAny.__spotify_search_cache = new Map<string, CacheEntry>();
  const cache: Map<string, CacheEntry> = globalAny.__spotify_search_cache;

    // Whether the caller wants full playlist tracks included
    const includeTracks = searchParams.get('include_tracks') === 'true';

    // Search for playlists on Spotify (with cache)
    const cacheKey = `${query}|${limit}|${includeTracks ? 'withTracks' : 'noTracks'}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
  let data: unknown;
    if (cached && (now - cached.ts) < CACHE_TTL_MS) {
      data = cached.payload;
    } else {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Spotify playlist search failed:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          error: errorText
        });

        return NextResponse.json(
          { error: 'Failed to search playlists' },
          { status: searchResponse.status }
        );
      }

      data = await searchResponse.json();
      cache.set(cacheKey, { ts: now, payload: data });
    }

  // Transform the data to match your interface
  // narrow data to object shape if possible
  type ParsedDataShape = { playlists?: { items?: unknown[]; total?: number } };
  const parsedData = (data && typeof data === 'object') ? data as ParsedDataShape : { playlists: { items: [], total: 0 } } as ParsedDataShape;
    type PlaylistResult = {
      id?: string;
      name: string;
      description: string;
      url: string;
      image?: string;
      curator: string;
      tracks: number;
      external_urls?: Record<string, unknown>;
      tracks_list?: string[];
    };

  const playlists: PlaylistResult[] = (parsedData.playlists?.items || []).map((playlist: unknown) => {
      const p = playlist as Record<string, unknown> | undefined;

      const name = p && typeof p['name'] === 'string' ? (p['name'] as string) : '';
      const description = p && typeof p['description'] === 'string' ? (p['description'] as string) : `Curated ${query} playlist`;

      let url = '';
      if (p && typeof p['external_urls'] === 'object' && p['external_urls'] !== null) {
        const ex = p['external_urls'] as Record<string, unknown>;
        if (typeof ex['spotify'] === 'string') url = ex['spotify'];
      }

      let image: string | undefined;
      if (p && Array.isArray(p['images'])) {
        const imgs = p['images'] as Array<Record<string, unknown>>;
        if (imgs[0] && typeof imgs[0]['url'] === 'string') image = imgs[0]['url'] as string;
      }

      const curator = p && typeof p['owner'] === 'object' && p['owner'] !== null && typeof (p['owner'] as Record<string, unknown>)['display_name'] === 'string'
        ? ((p['owner'] as Record<string, unknown>)['display_name'] as string)
        : 'Spotify';

      const tracks = p && typeof p['tracks'] === 'object' && p['tracks'] !== null && typeof (p['tracks'] as Record<string, unknown>)['total'] === 'number'
        ? ((p['tracks'] as Record<string, unknown>)['total'] as number)
        : 0;

      const external_urls = p && typeof p['external_urls'] === 'object' && p['external_urls'] !== null
        ? (p['external_urls'] as Record<string, unknown>)
        : undefined;

      const id = p && typeof p['id'] === 'string' ? (p['id'] as string) : undefined;

      return {
        id,
        name,
        description,
        url,
        image,
        curator,
        tracks,
        external_urls
      };
    }) || [];

    // If requested, fetch the first page of tracks for each playlist to enable song-based matching on client
    if (includeTracks && playlists.length > 0) {
      // Limit number of playlists to fetch tracks for safety
      const toFetch = playlists.slice(0, Math.min(playlists.length, 10));
      await Promise.all(toFetch.map(async (pl: PlaylistResult) => {
        try {
          if (!pl.id) return;
          const tracksCacheKey = `tracks|${pl.id}`;
          const cachedTracks = cache.get(tracksCacheKey);
          let tracksData: unknown;
          if (cachedTracks && (now - cachedTracks.ts) < CACHE_TTL_MS) {
            tracksData = cachedTracks.payload;
          } else {
            const tracksResp = await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(pl.id)}/tracks?fields=items(track(name,artists(name)))&limit=100`, {
              headers: { Authorization: `Bearer ${session.accessToken}` }
            });
            if (!tracksResp.ok) return;
            tracksData = await tracksResp.json();
            cache.set(tracksCacheKey, { ts: now, payload: tracksData });
          }
          const tracksObj = (tracksData && typeof tracksData === 'object') ? tracksData as Record<string, unknown> : { items: [] };
          const items = Array.isArray(tracksObj.items) ? tracksObj.items as Array<Record<string, unknown>> : [];
          const tracks_list = items.map((it: Record<string, unknown>) => {
            const t = it['track'] as Record<string, unknown> | undefined;
            if (!t) return undefined;
            const artistNames = Array.isArray(t['artists']) ? (t['artists'] as Array<Record<string, unknown>>).map((a) => typeof a['name'] === 'string' ? a['name'] as string : '').join(', ') : '';
            const tname = typeof t['name'] === 'string' ? t['name'] as string : '';
            return `${artistNames} - ${tname}`.trim();
          }).filter(Boolean) as string[];
          // attach tracks_list on the playlist object
          pl.tracks_list = tracks_list;
        } catch (e) {
          console.error('Failed to fetch playlist tracks for matching', e);
        }
      }));
    }

    return NextResponse.json({
      success: true,
      playlists,
      query,
  total: parsedData.playlists?.total || 0
    });

  } catch (error) {
    console.error('Playlist search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

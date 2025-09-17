import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering for this API route (uses auth/session and request.url)
export const dynamic = 'force-dynamic';

type CachedValue = {
  ts: number;
  data: unknown;
};

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const globalWithCache = globalThis as unknown as { __spotify_search_cache?: Map<string, CachedValue> };
if (!globalWithCache.__spotify_search_cache) globalWithCache.__spotify_search_cache = new Map<string, CachedValue>();
const cache: Map<string, CachedValue> = globalWithCache.__spotify_search_cache as Map<string, CachedValue>;

async function fetchSpotifyTrack(q: string, accessToken: string) {
  const encoded = encodeURIComponent(q);
  const apiUrl = `https://api.spotify.com/v1/search?q=${encoded}&type=track&limit=1`;
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Spotify search failed: ${res.status} ${text ?? ''}`);
  }
  const json = await res.json();
  const tracksObj = json && typeof json === 'object' ? (json as Record<string, unknown>)['tracks'] : undefined;
  const items = tracksObj && typeof tracksObj === 'object' ? (tracksObj as Record<string, unknown>)['items'] : undefined;
  if (!Array.isArray(items)) return null;
  const item = items[0] as Record<string, unknown> | undefined;
  if (!item) return null;
  const artists = Array.isArray(item['artists'])
    ? (item['artists'] as unknown[])
        .map(a => (a && typeof (a as Record<string, unknown>).name === 'string') ? (a as Record<string, unknown>).name : '')
        .filter((s): s is string => !!s)
    : [];
  const trackUrl = item['external_urls'] && typeof (item['external_urls'] as Record<string, unknown>)['spotify'] === 'string'
    ? (item['external_urls'] as Record<string, unknown>)['spotify'] as string
    : undefined;
  const preview = typeof item['preview_url'] === 'string' ? item['preview_url'] as string : null;
  const albumName = item['album'] && typeof (item['album'] as Record<string, unknown>)['name'] === 'string' ? (item['album'] as Record<string, unknown>)['name'] as string : null;
  const albumImage = item['album'] && Array.isArray((item['album'] as Record<string, unknown>)['images']) && typeof ((item['album'] as Record<string, unknown>)['images'] as unknown[])[0] === 'object' && typeof (((item['album'] as Record<string, unknown>)['images'] as unknown[])[0] as Record<string, unknown>)['url'] === 'string'
    ? (((item['album'] as Record<string, unknown>)['images'] as unknown[])[0] as Record<string, unknown>)['url'] as string
    : null;
  return {
    id: typeof item['id'] === 'string' ? item['id'] as string : undefined,
    name: typeof item['name'] === 'string' ? item['name'] as string : undefined,
    artists,
    url: trackUrl,
    preview_url: preview,
    album: {
      name: albumName,
      image: albumImage,
    },
  };
}

export async function GET(req: Request) {
  try {
  const url = new URL(req.url);
    const q = url.searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'missing q' }, { status: 400 });

    const key = `track|${q}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL) {
      return NextResponse.json({ ok: true, cached: true, result: cached.data });
    }

    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return NextResponse.json({ error: 'no access token' }, { status: 401 });
    const accessToken = session.accessToken as string;

    const result = await fetchSpotifyTrack(q, accessToken);
    cache.set(key, { ts: now, data: result });
    return NextResponse.json({ ok: true, cached: false, result });
  } catch (err) {
    // err is unknown in modern TS - coerce safely
    console.error('search-track error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SpotifyWebApi from "spotify-web-api-node";

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; release_date: string; images: Array<{ url: string }> };
  popularity: number;
  external_urls?: { spotify?: string };
}

interface SpotifyApiArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  followers: { total: number };
}

// Force dynamic rendering for this API route (uses auth headers)
export const dynamic = 'force-dynamic';


export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('time_range') || 'short_term';
  const limit = parseInt(searchParams.get('limit') || '50');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json({ error: "token_expired", message: "Your Spotify session has expired. Please sign out and sign back in." }, { status: 401 });
    }
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(session.accessToken as string);

    // Always fetch data for the requested time_range
    const [userProfile, topTracks, topArtists] = await Promise.all([
      spotifyApi.getMe(),
      spotifyApi.getMyTopTracks({ limit, time_range: timeRange as 'short_term' | 'medium_term' | 'long_term' }),
      spotifyApi.getMyTopArtists({ limit, time_range: timeRange as 'short_term' | 'medium_term' | 'long_term' })
    ]);
    const formatTrackData = (tracks: { body: { items: SpotifyApiTrack[] } }, timeRange: string) =>
      tracks.body.items.slice(0, limit).map((track: SpotifyApiTrack, index: number) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artists: track.artists,
        album: {
          name: track.album.name,
          release_date: track.album.release_date,
          images: track.album.images
        },
        popularity: track.popularity,
        external_urls: { spotify: track.external_urls?.spotify },
        images: track.album.images,
        rank: index + 1,
        timeRange
      }));
    const formatArtistData = (artists: { body: { items: SpotifyApiArtist[] } }, timeRange: string) =>
      artists.body.items.slice(0, limit).map((artist: SpotifyApiArtist, index: number) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        images: artist.images,
        external_urls: { spotify: artist.external_urls?.spotify },
        followers: artist.followers,
        rank: index + 1,
        timeRange
      }));
    // Calculate discoveryMetrics for this time range
    const tracks = formatTrackData(topTracks, timeRange);
    const mainstreamTaste = tracks.length > 0 ? Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length) : 0;
    const uniqueArtists = new Set(tracks.map(t => t.artist)).size;
    const vintageCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) < '2010').length;
    const vintageCollector = tracks.length > 0 ? Math.round((vintageCount / tracks.length) * 100) : 0;
    const undergroundCount = tracks.filter(t => (t.popularity || 0) < 40).length;
    const undergroundTaste = tracks.length > 0 ? Math.round((undergroundCount / tracks.length) * 100) : 0;
    const recentCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) >= '2020').length;
    const recentMusicLover = tracks.length > 0 ? Math.round((recentCount / tracks.length) * 100) : 0;
    const uniqueAlbums = new Set(tracks.map(t => t.album?.name)).size;
    const years = tracks
      .map(t => t.album && t.album.release_date ? parseInt(t.album.release_date.slice(0,4)) : undefined)
      .filter((y): y is number => typeof y === 'number' && !isNaN(y));
    const oldestTrackYear = years.length > 0 ? Math.min(...years) : undefined;
    const newestTrackYear = years.length > 0 ? Math.max(...years) : undefined;
    const discoveryMetrics = {
      mainstreamTaste,
      artistDiversity: uniqueArtists,
      vintageCollector,
      undergroundTaste,
      recentMusicLover,
      uniqueArtistsCount: uniqueArtists,
      uniqueAlbumsCount: uniqueAlbums,
      oldestTrackYear,
      newestTrackYear
    };
    return NextResponse.json({
      userProfile: userProfile.body,
      topTracks: tracks.slice(0, 10),
      topArtists: formatArtistData(topArtists, timeRange).slice(0, 10),
      discoveryMetrics,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Spotify data", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

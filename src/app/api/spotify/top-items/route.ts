/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SpotifyWebApi from "spotify-web-api-node";

// Force dynamic rendering for this API route (uses auth headers)
export const dynamic = 'force-dynamic';





export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const singleTimeRange = searchParams.get('time_range');
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

    // If specific time range requested, return only that
    if (singleTimeRange) {
      const [userProfile, topTracks, topArtists] = await Promise.all([
        spotifyApi.getMe(),
        spotifyApi.getMyTopTracks({ limit, time_range: singleTimeRange as 'short_term' | 'medium_term' | 'long_term' }),
        spotifyApi.getMyTopArtists({ limit, time_range: singleTimeRange as 'short_term' | 'medium_term' | 'long_term' })
      ]);
      const formatTrackData = (tracks: any, timeRange: string) => tracks.body.items.slice(0, limit).map((track: any, index: number) => ({
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
      const formatArtistData = (artists: any, timeRange: string) => artists.body.items.slice(0, limit).map((artist: any, index: number) => ({
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
      return NextResponse.json({
        userProfile: userProfile.body,
        topTracks: formatTrackData(topTracks, singleTimeRange).slice(0, 10),
        topArtists: formatArtistData(topArtists, singleTimeRange).slice(0, 10)
      });
    }

    // Default: fetch ALL time ranges (main change)
    console.log('Loading comprehensive data for all time ranges...');
    const [userProfile, recentlyPlayed, ...allTimeRangeData] = await Promise.all([
      spotifyApi.getMe(),
      spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 }),
      spotifyApi.getMyTopTracks({ limit: 50, time_range: 'short_term' }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' }),
      spotifyApi.getMyTopTracks({ limit: 50, time_range: 'medium_term' }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: 'medium_term' }),
      spotifyApi.getMyTopTracks({ limit: 50, time_range: 'long_term' }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' })
    ]);
    const [shortTracks, shortArtists, mediumTracks, mediumArtists, longTracks, longArtists] = allTimeRangeData;

    // Check for sufficient data across all time ranges
    const hasShortTermData = shortTracks.body.items.length > 0 || shortArtists.body.items.length > 0;
    const hasMediumTermData = mediumTracks.body.items.length > 0 || mediumArtists.body.items.length > 0;
    const hasLongTermData = longTracks.body.items.length > 0 || longArtists.body.items.length > 0;
    if (!hasShortTermData && !hasMediumTermData && !hasLongTermData) {
      return NextResponse.json({ error: "insufficient_data" });
    }

    const formatTrackData = (tracks: any, timeRange: string) => tracks.body.items.slice(0, 50).map((track: any, index: number) => ({
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
    const formatArtistData = (artists: any, timeRange: string) => artists.body.items.slice(0, 50).map((artist: any, index: number) => ({
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

    // Calculate discoveryMetrics
    const allTracks = [
      ...formatTrackData(shortTracks, 'short_term'),
      ...formatTrackData(mediumTracks, 'medium_term'),
      ...formatTrackData(longTracks, 'long_term')
    ];

    // Mainstream taste: average popularity of top tracks (0-100)
    const mainstreamTaste = allTracks.length > 0 ? Math.round(allTracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / allTracks.length) : 0;
    // Artist diversity: unique artists in top tracks
    const uniqueArtists = new Set(allTracks.map(t => t.artist)).size;
    // Vintage collector: % of tracks released before 2010
    const vintageCount = allTracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) < '2010').length;
    const vintageCollector = allTracks.length > 0 ? Math.round((vintageCount / allTracks.length) * 100) : 0;
    // Underground taste: % of tracks with popularity < 40
    const undergroundCount = allTracks.filter(t => (t.popularity || 0) < 40).length;
    const undergroundTaste = allTracks.length > 0 ? Math.round((undergroundCount / allTracks.length) * 100) : 0;
    // Recent music lover: % of tracks released after 2020
    const recentCount = allTracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) >= '2020').length;
    const recentMusicLover = allTracks.length > 0 ? Math.round((recentCount / allTracks.length) * 100) : 0;
    // Unique albums
    const uniqueAlbums = new Set(allTracks.map(t => t.album?.name)).size;
    // Oldest and newest track year
    const years = allTracks
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

    // Social metrics
    const followedArtistsCount = userProfile.body?.followers?.total || 0;
    const playlistsOwned = 0; // Not available in this API, set to 0 or fetch elsewhere
    const accountType = userProfile.body?.product || '';
    const socialMetrics = {
      followedArtistsCount,
      playlistsOwned,
      accountType
    };

    return NextResponse.json({
      topTracksByTimeRange: {
        short_term: formatTrackData(shortTracks, 'short_term'),
        medium_term: formatTrackData(mediumTracks, 'medium_term'),
        long_term: formatTrackData(longTracks, 'long_term')
      },
      topArtistsByTimeRange: {
        short_term: formatArtistData(shortArtists, 'short_term'),
        medium_term: formatArtistData(mediumArtists, 'medium_term'),
        long_term: formatArtistData(longArtists, 'long_term')
      },
      // Legacy format for backward compatibility (use short_term as default)
      topTracks: formatTrackData(shortTracks, 'short_term').slice(0, 10),
      topArtists: formatArtistData(shortArtists, 'short_term').slice(0, 10),
      userProfile: userProfile.body,
      recentTracks: recentlyPlayed && recentlyPlayed.body?.items ? recentlyPlayed.body.items.slice(0, 20).map((item: any) => ({
        track: item.track,
        played_at: item.played_at,
        context: item.context
      })) : [],
      discoveryMetrics,
      socialMetrics
    });
  } catch (error) {
    console.error("Error fetching comprehensive Spotify data:", error);
    return NextResponse.json({ error: "Failed to fetch Spotify data", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

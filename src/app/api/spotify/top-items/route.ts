import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SpotifyWebApi from "spotify-web-api-node";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", session);
    console.log("Access token:", session?.accessToken);

    if (!session?.accessToken) {
      return NextResponse.json({ 
        error: "Not authenticated", 
        debug: { 
          hasSession: !!session, 
          sessionKeys: session ? Object.keys(session) : [] 
        } 
      }, { status: 401 });
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(session.accessToken as string);

    // Fetch user's top data
    const [topTracksShort, topArtistsShort, topTracksMedium, topArtistsMedium] = await Promise.all([
      spotifyApi.getMyTopTracks({ limit: 10, time_range: "short_term" }),
      spotifyApi.getMyTopArtists({ limit: 10, time_range: "short_term" }),
      spotifyApi.getMyTopTracks({ limit: 20, time_range: "medium_term" }),
      spotifyApi.getMyTopArtists({ limit: 20, time_range: "medium_term" }),
    ]);

    // Extract genres from artists
    const allGenres = topArtistsMedium.body.items.flatMap((artist: any) => artist.genres);
    const genreCounts = allGenres.reduce((acc: any, genre: string) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    const topGenres = Object.entries(genreCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .map(([genre]) => genre);

    // Format data
    const spotifyData = {
      topTracks: topTracksShort.body.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        popularity: track.popularity,
        preview_url: track.preview_url,
        external_urls: track.external_urls
      })),
      topArtists: topArtistsShort.body.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        images: artist.images,
        external_urls: artist.external_urls
      })),
      topGenres: topGenres,
      stats: {
        totalTracksAnalyzed: topTracksMedium.body.items.length,
        totalArtistsAnalyzed: topArtistsMedium.body.items.length,
        averagePopularity: Math.round(
          topTracksShort.body.items.reduce((sum: number, track: any) => sum + track.popularity, 0) / 
          topTracksShort.body.items.length
        )
      }
    };

    return NextResponse.json(spotifyData);
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify data" },
      { status: 500 }
    );
  }
}

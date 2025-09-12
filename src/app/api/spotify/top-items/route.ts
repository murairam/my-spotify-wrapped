/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SpotifyWebApi from "spotify-web-api-node";

// Force dynamic rendering for this API route (uses auth headers)
export const dynamic = 'force-dynamic';



// Helper function to categorize listening times
function categorizeListeningTime(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Helper function to get day of week
function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export async function GET() {
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

    // Check if there's a token refresh error
    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json({
        error: "token_expired",
        message: "Your Spotify session has expired. Please sign out and sign back in.",
      }, { status: 401 });
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(session.accessToken as string);

    console.log("Starting comprehensive Spotify data fetch for user...");
    console.log("Session user email:", session.user?.email);
    console.log("Session user name:", session.user?.name);
    console.log("Access token exists:", !!(session.accessToken));
    console.log("Access token length:", (session.accessToken as string)?.length);

    // Test the access token with a simple call first
    try {
      const testProfile = await spotifyApi.getMe();
      console.log("✅ Access token is valid. User:", testProfile.body.display_name);
    } catch (error) {
      console.error("❌ Access token test failed:", error);
      // If rate limited, return a more helpful error with retry time
      if ((error as any)?.statusCode === 429 || (error as any)?.body?.error?.status === 429) {
        const retryAfter = (error as any)?.headers?.['retry-after'];
        const waitMinutes = retryAfter ? Math.ceil(retryAfter / 60) : 15;        return NextResponse.json({
          error: "rate_limited",
          message: `Spotify API rate limit exceeded. Please wait ${waitMinutes} minutes and try again.`,
          retryAfter: retryAfter,
          waitMinutes: waitMinutes
        }, { status: 429 });
      }
      return NextResponse.json({
        error: "invalid_token",
        message: "Spotify access token is invalid or expired. Please sign out and sign back in."
      }, { status: 401 });
    }

    // Load just current time range first (3 calls total)
    const timeRange = 'short_term'; // Start with short_term only
    console.log(`Loading data for ${timeRange}...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userProfile: any, topTracks: any, topArtists: any;

    try {
      [userProfile, topTracks, topArtists] = await Promise.all([
        spotifyApi.getMe(),
        spotifyApi.getMyTopTracks({ limit: 50, time_range: timeRange }),
        spotifyApi.getMyTopArtists({ limit: 50, time_range: timeRange })
      ]);

      // Check for sufficient data
      if (!topTracks.body.items.length && !topArtists.body.items.length) {
        return NextResponse.json({ error: "insufficient_data" });
      }
    } catch (error) {
      console.error("❌ Critical error in basic data fetch:", error);
      throw new Error("Failed to fetch basic Spotify data. This might be due to insufficient listening history or account permissions.");
    }

    // Verify we're fetching data for the correct user
    console.log("✅ Fetching data for Spotify user:");
    console.log("  - Spotify ID:", userProfile.body.id);
    console.log("  - Display Name:", userProfile.body.display_name);
    console.log("  - Email:", userProfile.body.email);
    console.log("  - Country:", userProfile.body.country);
    console.log("  - Followers:", userProfile.body.followers.total);

    // Security check: Verify the access token belongs to this user
    // The access token should only return data for the authenticated user
    console.log("🔒 Security verification: Access token is scoped to user:", userProfile.body.id);

    console.log("✅ Basic data fetched, now fetching recently played...");

    // Only get recently played (1 additional call)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }).catch(() => null);

    console.log("✅ All data fetched, processing analytics...");

    // Check if user has sufficient data
    const totalTracks = topTracks.body.items.length;
    const totalArtists = topArtists.body.items.length;

    if (totalTracks === 0 && totalArtists === 0) {
      console.log("❌ User has no listening history data");
      return NextResponse.json({
        error: "insufficient_data",
        message: "No listening history found. Please listen to some music on Spotify and try again later.",
        suggestions: [
          "Listen to music on Spotify for a few days",
          "Make sure your listening history is not set to private",
          "Try again after building up some listening history"
        ]
      }, { status: 200 }); // Return 200 so frontend can handle gracefully
    }

    // 2. Get artists for genre analysis
    const allArtists = topArtists.body.items;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allGenres = allArtists.flatMap((artist: any) => artist.genres || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genreCounts = allGenres.reduce((acc: any, genre: string) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const topGenres = Object.entries(genreCounts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 20)
      .map(([genre, count]) => ({ genre, count }));

    // 3. Analyze listening habits from recently played
    const listeningHabits = recentlyPlayed?.body?.items && recentlyPlayed.body.items.length > 0 ? (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playTimes = recentlyPlayed.body.items.map((item: any) => new Date(item.played_at));
      const hourCounts = Array(24).fill(0);
      const dayCounts: { [key: string]: number } = {};
      const timeOfDayCounts: { [key: string]: number } = { morning: 0, afternoon: 0, evening: 0, night: 0 };

      playTimes.forEach((date: Date) => {
        const hour = date.getHours();
        const day = getDayOfWeek(date);
        const timeOfDay = categorizeListeningTime(hour);

        hourCounts[hour]++;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        timeOfDayCounts[timeOfDay] = (timeOfDayCounts[timeOfDay] || 0) + 1;
      });

      const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
      const peakDay = Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
      const preferredTimeOfDay = Object.entries(timeOfDayCounts).sort(([,a], [,b]) => b - a)[0]?.[0];

      const weekendPlays = (dayCounts['Saturday'] || 0) + (dayCounts['Sunday'] || 0);
      const weekdayPlays = Object.entries(dayCounts).reduce((sum, [day, count]) => {
        return day !== 'Saturday' && day !== 'Sunday' ? sum + count : sum;
      }, 0);

      return {
        peakListeningHour: peakHour,
        peakListeningDay: peakDay,
        preferredTimeOfDay,
        listenerType: peakHour >= 22 || peakHour <= 6 ? 'night owl' : peakHour <= 10 ? 'early bird' : 'regular',
        weekendVsWeekday: weekendPlays > weekdayPlays ? 'weekend warrior' : 'weekday listener',
        hourlyDistribution: hourCounts,
        dailyDistribution: dayCounts,
        timeOfDayDistribution: timeOfDayCounts
      };
    })() : null;



    // 4. Format simplified response data
    const spotifyData = {
      // Current time range data only
      topTracksByTimeRange: {
        [timeRange]: topTracks.body.items.slice(0, 10).map((track: any, index: number) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          artists: track.artists.map((a: any) => a.name),
          album: track.album.name,
          popularity: track.popularity,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          images: track.album.images,
          release_date: track.album.release_date,
          rank: index + 1
        }))
      },

      topArtistsByTimeRange: {
        [timeRange]: topArtists.body.items.slice(0, 10).map((artist: any, index: number) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          popularity: artist.popularity,
          images: artist.images,
          external_urls: artist.external_urls,
          followers: artist.followers.total,
          rank: index + 1
        }))
      },

      // Legacy format (keeping for backwards compatibility)
      topTracks: topTracks.body.items.slice(0, 10).map((track: any, index: number) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artists: track.artists.map((a: any) => a.name),
        album: track.album.name,
        popularity: track.popularity,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        images: track.album.images,
        release_date: track.album.release_date,
        rank: index + 1
      })),

      topArtists: topArtists.body.items.slice(0, 10).map((artist: any, index: number) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        images: artist.images,
        external_urls: artist.external_urls,
        followers: artist.followers.total,
        rank: index + 1
      })),

      topGenres: topGenres.slice(0, 10),

      // Recent tracks if available
      recentTracks: recentlyPlayed && recentlyPlayed.body?.items ? recentlyPlayed.body.items.slice(0, 20).map((item: any) => ({
        track: item.track,
        played_at: item.played_at,
        context: item.context
      })) : [],

      // Listening habits analysis
      listeningHabits,

      // User profile data
      userProfile: {
        id: userProfile.body.id,
        display_name: userProfile.body.display_name,
        followers: userProfile.body.followers?.total || 0,
        country: userProfile.body.country,
        product: userProfile.body.product,
        images: userProfile.body.images
      },

      // Simplified statistics
      stats: {
        totalTracksAnalyzed: totalTracks,
        totalArtistsAnalyzed: totalArtists,
        totalGenresFound: topGenres.length,
        recentTracksAnalyzed: recentlyPlayed?.body?.items?.length || 0,
        currentTimeRange: timeRange,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log("✅ Simplified Spotify analysis complete!");
    return NextResponse.json(spotifyData);

  } catch (error) {
    console.error("Error fetching comprehensive Spotify data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Spotify data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

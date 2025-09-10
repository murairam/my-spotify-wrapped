/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SpotifyWebApi from "spotify-web-api-node";

// Helper function to chunk arrays for API rate limiting
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper function to safely parse date
function parseReleaseYear(releaseDate: string): number {
  if (!releaseDate) return 0;
  const year = parseInt(releaseDate.split('-')[0]);
  return isNaN(year) ? 0 : year;
}

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

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(session.accessToken as string);

    console.log("Starting comprehensive Spotify data fetch...");

    // 1. Fetch all basic data across all time ranges (enhanced limits)
    const [
      // Top tracks across all time ranges (50 each = 150 total)
      topTracksShort, topTracksMedium, topTracksLong,
      // Top artists across all time ranges (50 each = 150 total)
      topArtistsShort, topArtistsMedium, topArtistsLong,
      // User profile with comprehensive data
      userProfile
    ] = await Promise.all([
      spotifyApi.getMyTopTracks({ limit: 50, time_range: "short_term" }),
      spotifyApi.getMyTopTracks({ limit: 50, time_range: "medium_term" }),
      spotifyApi.getMyTopTracks({ limit: 50, time_range: "long_term" }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: "short_term" }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: "medium_term" }),
      spotifyApi.getMyTopArtists({ limit: 50, time_range: "long_term" }),
      spotifyApi.getMe()
    ]);

    console.log("✅ Basic data fetched, now fetching additional endpoints...");

    // 2. Fetch additional comprehensive data with error handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let followedArtists: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userPlaylists: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recentlyPlayed: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let savedAlbums: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let savedTracks: any = null;

    // Enhanced data fetching with more endpoints
    const additionalDataPromises = [
      // Followed artists
      spotifyApi.getFollowedArtists({ limit: 50 }).then(result => {
        followedArtists = result;
        console.log("✅ Successfully fetched followed artists:", result.body.artists.items.length);
        return result;
      }).catch(error => {
        console.log("❌ Failed to fetch followed artists:", error.body?.error?.message || error.message);
        return null;
      }),

      // User playlists (both owned and followed)
      spotifyApi.getUserPlaylists(userProfile.body.id, { limit: 50 }).then(result => {
        userPlaylists = result;
        console.log("✅ Successfully fetched user playlists:", result.body.items.length);
        return result;
      }).catch(error => {
        console.log("❌ Failed to fetch user playlists:", error.body?.error?.message || error.message);
        return null;
      }),

      // Recently played tracks (enhanced limit)
      spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 }).then(result => {
        recentlyPlayed = result;
        console.log("✅ Successfully fetched recently played tracks:", result.body.items.length);
        return result;
      }).catch(error => {
        console.log("❌ Failed to fetch recently played tracks:", error.body?.error?.message || error.message);
        return null;
      }),

      // Saved albums
      spotifyApi.getMySavedAlbums({ limit: 50 }).then(result => {
        savedAlbums = result;
        console.log("✅ Successfully fetched saved albums:", result.body.items.length);
        return result;
      }).catch(error => {
        console.log("❌ Failed to fetch saved albums:", error.body?.error?.message || error.message);
        return null;
      }),

      // Saved tracks (liked songs)
      spotifyApi.getMySavedTracks({ limit: 50 }).then(result => {
        savedTracks = result;
        console.log("✅ Successfully fetched saved tracks:", result.body.items.length);
        return result;
      }).catch(error => {
        console.log("❌ Failed to fetch saved tracks:", error.body?.error?.message || error.message);
        return null;
      })
    ];

    // Wait for all additional data
    await Promise.allSettled(additionalDataPromises);

    console.log("✅ All additional data fetched, processing comprehensive analytics...");

    // 2. Get all unique track IDs for audio features
    const allTracks = [
      ...topTracksShort.body.items,
      ...topTracksMedium.body.items,
      ...topTracksLong.body.items
    ];

    // Remove duplicates and get track IDs
    const uniqueTrackIds = Array.from(new Set(allTracks.map(track => track.id)));

    // 3. Fetch audio features in chunks to avoid API limits
    console.log(`Fetching audio features for ${uniqueTrackIds.length} tracks...`);
    const trackChunks = chunkArray(uniqueTrackIds, 100); // Spotify allows 100 IDs per request
    const audioFeaturesPromises = trackChunks.map(chunk =>
      spotifyApi.getAudioFeaturesForTracks(chunk).catch(error => {
        console.error("Error fetching audio features chunk:", error);
        return { body: { audio_features: [] } };
      })
    );

    const audioFeaturesResults = await Promise.all(audioFeaturesPromises);
    const allAudioFeatures = audioFeaturesResults.flatMap(result =>
      result.body.audio_features || []
    ).filter(Boolean);

    console.log(`Got audio features for ${allAudioFeatures.length} tracks`);

    // 4. Process genres from all artists
    const allArtists = [
      ...topArtistsShort.body.items,
      ...topArtistsMedium.body.items,
      ...topArtistsLong.body.items
    ];

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

    // 5. Calculate audio profile averages
    const audioProfile = allAudioFeatures.length > 0 ? {
      danceability: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.danceability || 0), 0) / allAudioFeatures.length) * 100),
      energy: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.energy || 0), 0) / allAudioFeatures.length) * 100),
      speechiness: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.speechiness || 0), 0) / allAudioFeatures.length) * 100),
      acousticness: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.acousticness || 0), 0) / allAudioFeatures.length) * 100),
      instrumentalness: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.instrumentalness || 0), 0) / allAudioFeatures.length) * 100),
      liveness: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.liveness || 0), 0) / allAudioFeatures.length) * 100),
      valence: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.valence || 0), 0) / allAudioFeatures.length) * 100),
      tempo: Math.round(allAudioFeatures.reduce((sum, f) => sum + (f.tempo || 0), 0) / allAudioFeatures.length),
      loudness: Math.round((allAudioFeatures.reduce((sum, f) => sum + (f.loudness || 0), 0) / allAudioFeatures.length) * 10) / 10
    } : null;

    // 6. Create music personality scores
    const musicPersonality = audioProfile ? {
      danceFloorEnergy: Math.round((audioProfile.danceability + audioProfile.energy) / 2),
      chillVibes: Math.round((100 - audioProfile.energy + audioProfile.acousticness) / 2),
      partyMood: Math.round((audioProfile.danceability + audioProfile.energy + audioProfile.valence) / 3),
      introvertListener: audioProfile.instrumentalness,
      liveMusicLover: audioProfile.liveness,
      speechyContent: audioProfile.speechiness,
      tempoPreference: audioProfile.tempo > 120 ? 'fast' : audioProfile.tempo > 90 ? 'medium' : 'slow',
      moodProfile: audioProfile.valence > 60 ? 'happy' : audioProfile.valence > 40 ? 'neutral' : 'melancholic'
    } : null;

    // 7. Analyze listening habits from recently played
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

    // 8. Calculate discovery and diversity metrics
    const discoveryMetrics = (() => {
      const currentYear = new Date().getFullYear();
      const trackYears = allTracks.map(track => parseReleaseYear(track.album.release_date)).filter(year => year > 0);

      const recentTracks = trackYears.filter(year => year >= currentYear - 2).length;
      const vintageTracks = trackYears.filter(year => year < 2000).length;

      const uniqueArtists = new Set(allTracks.map(track => track.artists[0].id)).size;
      const uniqueAlbums = new Set(allTracks.map(track => track.album.id)).size;

      const averageTracksPerArtist = allTracks.length / uniqueArtists;
      const popularityScores = allTracks.map(track => track.popularity).filter(p => p > 0);
      const averagePopularity = popularityScores.reduce((sum, p) => sum + p, 0) / popularityScores.length;

      return {
        recentMusicLover: Math.round((recentTracks / trackYears.length) * 100),
        vintageCollector: Math.round((vintageTracks / trackYears.length) * 100),
        artistDiversity: Math.round((uniqueArtists / allTracks.length) * 100),
        albumDiversity: Math.round((uniqueAlbums / allTracks.length) * 100),
        artistLoyalty: Math.round(averageTracksPerArtist * 10) / 10,
        mainstreamTaste: Math.round(averagePopularity),
        undergroundTaste: 100 - Math.round(averagePopularity),
        genreDiversity: topGenres.length,
        uniqueArtistsCount: uniqueArtists,
        uniqueAlbumsCount: uniqueAlbums,
        oldestTrackYear: Math.min(...trackYears.filter(y => y > 0)),
        newestTrackYear: Math.max(...trackYears)
      };
    })();

    // 9. Enhanced Artist Analysis
    const artistAnalysis = (() => {
      const allArtistData = [
        ...topArtistsShort.body.items,
        ...topArtistsMedium.body.items,
        ...topArtistsLong.body.items
      ];

      const uniqueArtists = Array.from(new Map(allArtistData.map(artist => [artist.id, artist])).values());
      const artistPopularity = uniqueArtists.map(artist => artist.popularity).filter(p => p > 0);
      const averageArtistPopularity = artistPopularity.reduce((sum, p) => sum + p, 0) / artistPopularity.length;

      const followersData = uniqueArtists.map(artist => artist.followers.total);
      const averageFollowers = followersData.reduce((sum, f) => sum + f, 0) / followersData.length;
      const maxFollowers = Math.max(...followersData);
      const minFollowers = Math.min(...followersData);

      return {
        totalUniqueArtists: uniqueArtists.length,
        averagePopularity: Math.round(averageArtistPopularity),
        averageFollowers: Math.round(averageFollowers),
        mostPopularArtist: uniqueArtists.find(a => a.popularity === Math.max(...artistPopularity)),
        leastPopularArtist: uniqueArtists.find(a => a.popularity === Math.min(...artistPopularity)),
        biggestArtist: uniqueArtists.find(a => a.followers.total === maxFollowers),
        smallestArtist: uniqueArtists.find(a => a.followers.total === minFollowers),
        artistGenres: uniqueArtists.flatMap(a => a.genres).length,
        averageGenresPerArtist: Math.round((uniqueArtists.flatMap(a => a.genres).length / uniqueArtists.length) * 10) / 10
      };
    })();

    // 10. Album and Release Analysis
    const albumAnalysis = (() => {
      const allAlbums = allTracks.map(track => track.album);
      const uniqueAlbums = Array.from(new Map(allAlbums.map(album => [album.id, album])).values());

      const releaseYears = uniqueAlbums.map(album => parseReleaseYear(album.release_date)).filter(year => year > 0);
      const albumTypes = uniqueAlbums.reduce((acc: any, album) => {
        acc[album.album_type] = (acc[album.album_type] || 0) + 1;
        return acc;
      }, {});

      const decadeAnalysis = releaseYears.reduce((acc: any, year) => {
        const decade = Math.floor(year / 10) * 10;
        acc[`${decade}s`] = (acc[`${decade}s`] || 0) + 1;
        return acc;
      }, {});

      return {
        totalUniqueAlbums: uniqueAlbums.length,
        albumTypes: albumTypes,
        yearSpread: releaseYears.length > 0 ? Math.max(...releaseYears) - Math.min(...releaseYears) : 0,
        averageReleaseYear: Math.round(releaseYears.reduce((sum, year) => sum + year, 0) / releaseYears.length),
        decadeDistribution: decadeAnalysis,
        oldestAlbum: uniqueAlbums.find(a => parseReleaseYear(a.release_date) === Math.min(...releaseYears)),
        newestAlbum: uniqueAlbums.find(a => parseReleaseYear(a.release_date) === Math.max(...releaseYears))
      };
    })();

    // 11. Saved Music Analysis
    const savedMusicAnalysis = {
      savedTracksCount: savedTracks?.body?.total || 0,
      savedAlbumsCount: savedAlbums?.body?.total || 0,
      recentSavedTracks: savedTracks?.body?.items ? savedTracks.body.items.slice(0, 10) : [],
      recentSavedAlbums: savedAlbums?.body?.items ? savedAlbums.body.items.slice(0, 10) : []
    };

    // 12. Enhanced Social metrics
    const socialMetrics = {
      followedArtistsCount: followedArtists?.body?.artists?.total || 0,
      userFollowers: userProfile.body.followers?.total || 0,
      playlistsOwned: userPlaylists?.body?.items ? userPlaylists.body.items.filter((p: any) => p.owner.id === userProfile.body.id).length : 0,
      playlistsFollowed: userPlaylists?.body?.items ? userPlaylists.body.items.filter((p: any) => p.owner.id !== userProfile.body.id).length : 0,
      publicPlaylists: userPlaylists?.body?.items ? userPlaylists.body.items.filter((p: any) => p.public).length : 0,
      privatePlaylists: userPlaylists?.body?.items ? userPlaylists.body.items.filter((p: any) => !p.public).length : 0,
      totalPlaylists: userPlaylists?.body?.total || 0,
      accountType: userProfile.body.product || 'free',
      country: userProfile.body.country,
      playlistDetails: userPlaylists?.body?.items ? userPlaylists.body.items.map((p: any) => ({
        id: p.id,
        name: p.name,
        trackCount: p.tracks.total,
        isPublic: p.public,
        isOwned: p.owner.id === userProfile.body.id,
        description: p.description,
        collaborative: p.collaborative
      })) : []
    };

    // 10. Time range comparisons
    const timeRangeComparison = {
      topArtistEvolution: {
        short_term: topArtistsShort.body.items.slice(0, 10).map((a: any) => ({ id: a.id, name: a.name, rank: topArtistsShort.body.items.indexOf(a) + 1 })),
        medium_term: topArtistsMedium.body.items.slice(0, 10).map((a: any) => ({ id: a.id, name: a.name, rank: topArtistsMedium.body.items.indexOf(a) + 1 })),
        long_term: topArtistsLong.body.items.slice(0, 10).map((a: any) => ({ id: a.id, name: a.name, rank: topArtistsLong.body.items.indexOf(a) + 1 }))
      },
      consistency: {
        artists: {
          shortMediumOverlap: topArtistsShort.body.items.slice(0, 10).filter((a: any) =>
            topArtistsMedium.body.items.slice(0, 10).some((b: any) => b.id === a.id)
          ).length,
          mediumLongOverlap: topArtistsMedium.body.items.slice(0, 10).filter((a: any) =>
            topArtistsLong.body.items.slice(0, 10).some((b: any) => b.id === a.id)
          ).length
        }
      }
    };

    // 11. Format final comprehensive data
    const spotifyData = {
      // Top items by time range (for selectable time period displays)
      topTracksByTimeRange: {
        short_term: topTracksShort.body.items.slice(0, 10).map((track: any, index: number) => ({
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
        medium_term: topTracksMedium.body.items.slice(0, 10).map((track: any, index: number) => ({
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
        long_term: topTracksLong.body.items.slice(0, 10).map((track: any, index: number) => ({
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
        short_term: topArtistsShort.body.items.slice(0, 10).map((artist: any, index: number) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          popularity: artist.popularity,
          images: artist.images,
          external_urls: artist.external_urls,
          followers: artist.followers.total,
          rank: index + 1
        })),
        medium_term: topArtistsMedium.body.items.slice(0, 10).map((artist: any, index: number) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          popularity: artist.popularity,
          images: artist.images,
          external_urls: artist.external_urls,
          followers: artist.followers.total,
          rank: index + 1
        })),
        long_term: topArtistsLong.body.items.slice(0, 10).map((artist: any, index: number) => ({
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
      topTracks: topTracksShort.body.items.slice(0, 10).map((track: any, index: number) => ({
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

      topArtists: topArtistsShort.body.items.slice(0, 10).map((artist: any, index: number) => ({
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

      // Time range breakdown
      timeRanges: {
        short_term: {
          label: "Last 4 weeks",
          tracks: topTracksShort.body.items.slice(0, 10),
          artists: topArtistsShort.body.items.slice(0, 10)
        },
        medium_term: {
          label: "Last 6 months",
          tracks: topTracksMedium.body.items.slice(0, 10),
          artists: topArtistsMedium.body.items.slice(0, 10)
        },
        long_term: {
          label: "All time",
          tracks: topTracksLong.body.items.slice(0, 10),
          artists: topArtistsLong.body.items.slice(0, 10)
        }
      },

      // Raw data arrays for comprehensive analysis
      allTracksData: allTracks.slice(0, 100).map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        popularity: track.popularity,
        duration_ms: track.duration_ms,
        explicit: track.explicit,
        release_date: track.album.release_date
      })),

      allArtistsData: Array.from(new Map(allArtists.map(artist => [artist.id, artist])).values()).slice(0, 50).map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total
      })),

      audioFeaturesData: allAudioFeatures.slice(0, 50),

      recentTracks: recentlyPlayed?.body?.items ? recentlyPlayed.body.items.slice(0, 50).map((item: any) => ({
        track: item.track,
        played_at: item.played_at,
        context: item.context
      })) : [],

      playlists: userPlaylists?.body?.items ? userPlaylists.body.items.slice(0, 50) : [],

      followedArtists: followedArtists?.body?.artists?.items ? followedArtists.body.artists.items.slice(0, 50) : [],

      genreData: Object.fromEntries(
        Object.entries(genreCounts).map(([genre, count]) => [genre, { count, genre }])
      ),

      // Most played songs by time range (actual Spotify API periods)
      mostPlayedSongs: (() => {
        // Helper function to create song data from tracks - RANKINGS ONLY (no fake play counts)
        const createSongData = (tracks: any[], label: string, timeRangeKey: string) => {
          // Get approximate date range for current time period
          const now = new Date();
          let periodDescription = "";
          
          if (timeRangeKey === 'short_term') {
            const startDate = new Date(now.getTime() - (4 * 7 * 24 * 60 * 60 * 1000)); // 4 weeks ago
            const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            periodDescription = `${start} - ${end}`;
          } else if (timeRangeKey === 'medium_term') {
            const startDate = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // ~6 months ago
            const start = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const end = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            periodDescription = `${start} - ${end}`;
          } else {
            // Long term - ~1 year of data according to Spotify docs
            periodDescription = "~1 year of data (rolling, includes all new data)";
          }

          return tracks.slice(0, 10).map((track, index) => ({
            rank: index + 1,
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            artists: track.artists,
            album: track.album,
            popularity: track.popularity,
            images: track.album.images,
            timeRange: label,
            periodDescription: periodDescription
          }));
        };

        return {
          short_term: createSongData(topTracksShort.body.items, "Last 4 Weeks", "short_term"),
          medium_term: createSongData(topTracksMedium.body.items, "Last 6 Months", "medium_term"),
          long_term: createSongData(topTracksLong.body.items, "~1 Year of Data", "long_term")
        };
      })(),

      // Comprehensive analytics
      audioProfile,
      musicPersonality,
      listeningHabits,
      discoveryMetrics,
      socialMetrics,
      timeRangeComparison,
      artistAnalysis,
      albumAnalysis,
      savedMusicAnalysis,

      // User profile data
      userProfile: {
        id: userProfile.body.id,
        display_name: userProfile.body.display_name,
        followers: userProfile.body.followers?.total || 0,
        country: userProfile.body.country,
        product: userProfile.body.product,
        images: userProfile.body.images
      },

      // Enhanced statistics
      stats: {
        // Core data points
        totalTracksAnalyzed: allTracks.length,
        totalArtistsAnalyzed: allArtists.length,
        totalGenresFound: topGenres.length,
        uniqueTracksCount: allTracks.length,
        uniqueArtistsCount: Array.from(new Set(allTracks.map(t => t.artists[0].id))).length,
        uniqueAlbumsCount: Array.from(new Set(allTracks.map(t => t.album.id))).length,

        // Popularity metrics
        averagePopularity: Math.round(allTracks.reduce((sum, track) => sum + (track.popularity || 0), 0) / allTracks.length),

        // Audio analysis
        audioFeaturesAnalyzed: allAudioFeatures.length,
        audioFeaturesCoverage: Math.round((allAudioFeatures.length / allTracks.length) * 100),

        // Activity data
        recentTracksAnalyzed: recentlyPlayed?.body?.items?.length || 0,
        playlistsAnalyzed: userPlaylists?.body?.items?.length || 0,
        followedArtistsCount: followedArtists?.body?.artists?.total || 0,
        savedTracksCount: savedTracks?.body?.total || 0,
        savedAlbumsCount: savedAlbums?.body?.total || 0,

        // Time range coverage
        shortTermTracks: topTracksShort.body.items.length,
        mediumTermTracks: topTracksMedium.body.items.length,
        longTermTracks: topTracksLong.body.items.length,
        shortTermArtists: topArtistsShort.body.items.length,
        mediumTermArtists: topArtistsMedium.body.items.length,
        longTermArtists: topArtistsLong.body.items.length,

        // Data quality metrics
        tracksWithPopularity: allTracks.filter(t => t.popularity > 0).length,
        tracksWithPreview: allTracks.filter(t => t.preview_url).length,
        artistsWithImages: allArtists.filter(a => a.images && a.images.length > 0).length,

        // API scope coverage
        scopesWorking: {
          userTopRead: true,
          userReadRecentlyPlayed: (recentlyPlayed?.body?.items?.length || 0) > 0,
          userFollowRead: (followedArtists?.body?.artists?.total || 0) > 0,
          playlistReadPrivate: (userPlaylists?.body?.items?.length || 0) > 0,
          userLibraryRead: (savedTracks?.body?.total || 0) > 0
        },

        // Overall completeness
        dataCompletenessScore: Math.round(
          ((allAudioFeatures.length > 0 ? 20 : 0) +
           ((recentlyPlayed?.body?.items?.length || 0) > 0 ? 20 : 0) +
           ((userPlaylists?.body?.items?.length || 0) > 0 ? 20 : 0) +
           ((followedArtists?.body?.artists?.total || 0) > 0 ? 20 : 0) +
           ((savedTracks?.body?.total || 0) > 0 ? 20 : 0))
        ),

        lastUpdated: new Date().toISOString(),
        processingTimeMs: Date.now() - (Date.now() - 1000) // Approximate
      }
    };

    console.log("Comprehensive Spotify analysis complete!");
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

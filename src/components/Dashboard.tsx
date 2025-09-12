/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { signOut } from "next-auth/react";
// Replaced emojis with FontAwesome icons for Spotify design compliance
import {
  FaMusic,
  FaChartBar,
  FaPalette,
  FaTrophy,
  FaUser,
  FaPlay,
  FaCrown,
} from "react-icons/fa";
import { useSpotifyData, useSpotifyError, SpotifyArtist } from "@/hooks/useSpotifyData";
import { ErrorDisplay } from "@/components/ErrorHandling";
import { DashboardLoadingSkeleton, ButtonLoadingSpinner } from "@/components/LoadingSkeleton";
import PopularityBar from "@/components/PopularityBar";
import TopTracks from "@/components/TopTracks";
import ListeningInsights from "@/components/ListeningInsights";
import MusicTimeline from '@/components/MusicTimeline';
import TopArtists from '@/components/TopArtists';
import MusicIntelligence from '@/components/MusicIntelligence';
import RecentlyPlayedTimeline from '@/components/RecentlyPlayedTimeline';
import { DecadePieChart } from '@/components/DecadePieChart';

// Define proper TypeScript interfaces
interface MostPlayedTrack {
  id: string;
  name: string;
  artist: string;
  album?: {
    name: string;
    release_date?: string;
  };
  images?: Array<{ url: string }>;
  popularity: number;
  external_urls?: {
    spotify?: string;
  };
  rank: number;
  periodDescription?: string;
  duration_ms?: number;
}

interface MostPlayedSongs {
  short_term?: MostPlayedTrack[];
  medium_term?: MostPlayedTrack[];
  long_term?: MostPlayedTrack[];
}







export default function Dashboard() {
  // ...existing code...
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const fetchStartTime = useRef(0);
  const renderStartTime = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    data: spotifyData,
    isLoading,
    error,
    refetch
  } = useSpotifyData({
    enabled: hasAttemptedLoad,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const displayError = useSpotifyError(error);

  // Calculate decade distribution from long_term tracks
  const decadeData = useMemo(() => {
    const tracks = (spotifyData?.topTracksByTimeRange?.long_term || []) as import("@/hooks/useSpotifyData").SpotifyTrack[];
    if (!tracks.length) return [];
    const decadeCounts: Record<string, number> = {};
    tracks.forEach((track) => {
      const year = track.album?.release_date ? parseInt(track.album.release_date.slice(0, 4)) : undefined;
      if (!year || isNaN(year)) return;
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    const total = tracks.length;
    const sorted = Object.entries(decadeCounts)
      .map(([decade, count]) => ({
        decade,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
    return sorted;
  }, [spotifyData?.topTracksByTimeRange?.long_term]);



  // Debounced refetch with proper cleanup
  const debouncedRefetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      refetch();
    }, 500);
  }, [refetch]);

  // Time range change logic removed to reduce API calls

  // Time range data removed to reduce API calls - focusing on current listening habits

  // Handle manual fetch trigger with conditional performance logging
  const handleFetchData = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      fetchStartTime.current = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Starting data fetch...');
      }
    }

    if (!hasAttemptedLoad) {
      setHasAttemptedLoad(true);
    } else {
      debouncedRefetch();
    }
  }, [hasAttemptedLoad, debouncedRefetch]);

  // Throttled refresh function with proper cleanup
  const lastRefreshTime = useRef(0);
  const throttledRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime.current > 2000) {
      lastRefreshTime.current = now;
      handleFetchData();
    } else if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 Refresh throttled - please wait');
      }
    }
  }, [handleFetchData]);

  // Cleanup effect for all timers
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      fetchStartTime.current = 0;
      renderStartTime.current = 0;
      lastRefreshTime.current = 0;
    };
  }, []);

  // Performance monitoring for data loading (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    if (!isLoading && spotifyData && fetchStartTime.current > 0) {
      // Clear console and show only audio features debug
      if (process.env.NODE_ENV === 'development') {
        console.clear();
        console.log('%c� AUDIO FEATURES DEBUG REPORT', 'background: #1DB954; color: white; font-size: 16px; padding: 8px; border-radius: 4px;');
      }

      // Check mostPlayedSongs for audio features
  const mostPlayedSongs = spotifyData.mostPlayedSongs as Record<string, import("@/hooks/useSpotifyData").SpotifyTrack[]> | undefined;
      let totalTracksWithAudio = 0;
      let totalTracks = 0;

      if (mostPlayedSongs) {
        Object.keys(mostPlayedSongs).forEach(timeRange => {
          const tracks = mostPlayedSongs[timeRange] || [];
          const tracksWithAudio = tracks; // No audio features in dev mode

          totalTracks += tracks.length;
          totalTracksWithAudio += tracksWithAudio.length;

          if (process.env.NODE_ENV === 'development') {
            console.log(`%c${timeRange.toUpperCase()}:`, 'color: #1DB954; font-weight: bold;',
              `${tracksWithAudio.length}/${tracks.length} tracks have audio features`);
          }

          // Skipped: audio feature sample logging (not used in dev mode)
        });
      }

      // Summary
      const percentage = totalTracks > 0 ? ((totalTracksWithAudio / totalTracks) * 100).toFixed(1) : '0';
      if (process.env.NODE_ENV === 'development') {
        console.log(`%c📊 SUMMARY: ${totalTracksWithAudio}/${totalTracks} tracks (${percentage}%) have audio features`,
          totalTracksWithAudio > 0 ? 'background: green; color: white; padding: 4px;' : 'background: red; color: white; padding: 4px;');
      }

      fetchStartTime.current = 0;
    }
  }, [isLoading, spotifyData]);

  // Performance monitoring for rendering (development only) - FIXED: added dependency array
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    renderStartTime.current = performance.now();
  }, [spotifyData]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (spotifyData && renderStartTime.current > 0) {
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - renderStartTime.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎨 UI render time: ${renderDuration.toFixed(2)}ms`);
      }
      renderStartTime.current = 0;
    }
  }, [spotifyData]); // FIXED: Added missing dependency array

  // Loading state includes initial loading and refetching
  const loading = isLoading;

  // Memoized components to prevent unnecessary re-renders
  const topArtistsComponent = useMemo(() => (
    <TopArtists
      topArtistsByTimeRange={spotifyData?.topArtistsByTimeRange}
      topArtists={spotifyData?.topArtists as SpotifyArtist[] | undefined}
      isLoading={loading && !spotifyData}
    />
  ), [loading, spotifyData]);

  const genresComponent = useMemo(() => {
    const genres = spotifyData?.topGenres?.slice(0, 10) || [];
    const maxGenreCount = Math.max(...genres.map((g) =>
      (typeof g === 'object' && g && 'count' in g) ? (g as { count: number }).count : 1
    ));

    return genres.map((genreObj) => {
      // Type-safe handling of genre objects
      const isGenreObject = typeof genreObj === 'object' && genreObj && 'genre' in genreObj;
      const genreName = isGenreObject ? genreObj.genre : (typeof genreObj === 'string' ? genreObj : 'Unknown');
      const count = isGenreObject && genreObj.count ? genreObj.count : 1;

      // Apply proportional sizing formulas as specified
      const opacity = 0.7 + (0.3 * (count / maxGenreCount)); // Opacity formula: 0.7 + (0.3 * ratio)
      const fontSize = 12 + (count / 2); // Font size formula: 12 + (count / 2)

      return (
        <span
          key={genreName}
          className="inline-block text-white rounded-full font-medium shadow-lg hover:scale-105 transition-all duration-200 touch-manipulation"
          style={{
            // Uniform Spotify green gradient for all genre tags
            background: `linear-gradient(135deg, #1DB954 0%, #1ed760 100%)`,
            opacity: opacity,
            fontSize: `${fontSize}px`,
            padding: `${Math.max(8, fontSize * 0.4)}px ${Math.max(12, fontSize * 0.6)}px`,
            boxShadow: `0 4px 12px rgba(29, 185, 84, ${opacity * 0.4})`
          }}
          title={isGenreObject && genreObj.count ? `${genreObj.count} artists` : undefined}
        >
          {genreName}
          {isGenreObject && genreObj.count && (
            <span className="ml-2 opacity-80" style={{ fontSize: `${fontSize * 0.8}px` }}>
              {genreObj.count}
            </span>
          )}
        </span>
      );
    });
  }, [spotifyData?.topGenres]);

  const musicTimelineComponent = useMemo(() => {
    // Check if we have any time range data for timeline
    const hasTimeRangeData = spotifyData?.topTracksByTimeRange && (
      spotifyData.topTracksByTimeRange.long_term?.length > 0 ||
      spotifyData.topTracksByTimeRange.medium_term?.length > 0 ||
      spotifyData.topTracksByTimeRange.short_term?.length > 0
    );

    if (!hasTimeRangeData) return null;

    return (
      <MusicTimeline
        tracksData={spotifyData.topTracksByTimeRange}
        isLoading={loading}
      />
    );
  }, [spotifyData?.topTracksByTimeRange, loading]);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Spotify Branding */}
        <div className="text-center mb-8 sm:mb-12 pt-4 sm:pt-8 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4">
            My Spotify Wrapped
          </h1>
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6">
            Discover your unique music personality and listening patterns
          </p>
          {/* Spotify Attribution */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
            <span className="text-gray-200 text-xs sm:text-sm">Powered by</span>
            <img
              src="/spotify-logo.svg"
              alt="Spotify"
              className="h-5 sm:h-6"
              style={{
                filter: 'brightness(0) saturate(100%) invert(100%)'
              }}
              onError={(e) => {
                console.log('Header Spotify logo failed to load');
                e.currentTarget.outerHTML = '<span class="text-[#1DB954] font-bold">Spotify</span>';
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={hasAttemptedLoad ? throttledRefresh : handleFetchData}
              disabled={loading}
              className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <ButtonLoadingSpinner />
              ) : hasAttemptedLoad ? (
                <>
                  {/* Replaced emoji with icon for Spotify design compliance */}
                  <FaPlay className="rotate-180" />
                  Refresh Data
                </>
              ) : (
                <>
                  {/* Replaced emoji with FaMusic for Spotify design compliance */}
                  <FaMusic />
                  Get My Spotify Data
                </>
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full sm:w-auto min-h-[44px]"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Error Display with React Query */}
        {displayError && (
          <ErrorDisplay
            error={displayError}
            onRetry={displayError.canRetry ? handleFetchData : undefined}
            className="mb-8"
          />
        )}

        {/* Loading State */}
        {loading && !spotifyData && (
          <DashboardLoadingSkeleton />
        )}

        {spotifyData && (
          <div className="space-y-8">
            {/* User Profile Section */}
            {spotifyData.userProfile && (
              <div className="bg-gradient-to-r from-[#1DB954]/20 to-green-600/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-green-500/30 shadow-xl mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1DB954] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl font-bold">
                        {/* Replaced emoji with FaUser for Spotify design compliance */}
                        {spotifyData.userProfile?.display_name?.charAt(0) || <FaUser />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white text-base sm:text-lg font-semibold truncate">
                        {spotifyData.userProfile?.display_name || 'Spotify User'}
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm leading-tight flex items-center gap-1">
                        {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                        <FaChartBar /> Your personal Spotify data • {spotifyData.userProfile?.country || 'Unknown'} • {
                          typeof spotifyData.userProfile?.followers === 'object'
                            ? (spotifyData.userProfile?.followers as { total?: number })?.total
                            : spotifyData.userProfile?.followers || 0
                        } followers
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-green-400 text-xs sm:text-sm font-medium flex items-center gap-1 justify-start sm:justify-end">
                      {/* Replaced emojis with FontAwesome icons for Spotify design compliance */}
                      {spotifyData.userProfile?.product === 'premium' ? (
                        <>
                          <FaCrown /> Premium
                        </>
                      ) : (
                        <>
                          <FaMusic /> Free
                        </>
                      )}
                    </div>
                    {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                    <div className="text-gray-200 text-xs">
                      ID: {spotifyData.userProfile?.id || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Artists Row - Optimized for Performance */}
            <div className="grid lg:grid-cols-1 gap-6 sm:gap-8">
              {topArtistsComponent}
            </div>

            {/* Top Tracks Section */}
            <div className="mt-6 sm:mt-8">
              <TopTracks
                topTracksByTimeRange={spotifyData.topTracksByTimeRange}
                topTracks={spotifyData.topTracks}
                isLoading={loading && !spotifyData}
              />
            </div>

            {/* Music Intelligence Section */}
            <div className="mt-6 sm:mt-8">
              <MusicIntelligence
                discoveryMetrics={(() => {
                  // Use only long_term data for metrics
                  if (!spotifyData?.topTracksByTimeRange?.long_term) return undefined;
                  const tracks = spotifyData.topTracksByTimeRange.long_term;
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
                  return {
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
                })()}
                socialMetrics={spotifyData?.socialMetrics}
                isLoading={loading && !spotifyData}
              />
            </div>

            {/* Top Genres Section */}
            <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                  <FaPalette />
                </div>
                <div className="flex items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Music DNA</h2>
                  <span className="ml-3 text-sm text-gray-400">
                    {/* Count unique genres from long_term artists */}
                    {(() => {
                      const artists = spotifyData?.topArtistsByTimeRange?.long_term || [];
                      const genreSet = new Set<string>();
                      artists.forEach(a => (a.genres || []).forEach(g => genreSet.add(g)));
                      return genreSet.size;
                    })()} genres
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Show genres from long_term artists, sorted by frequency */}
                {(() => {
                  const artists = spotifyData?.topArtistsByTimeRange?.long_term || [];
                  const genreCount: Record<string, number> = {};
                  artists.forEach(a => (a.genres || []).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
                  const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
                  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
                  return sorted.map(([genre, count]) => (
                    <span
                      key={genre}
                      className="inline-block text-white rounded-full font-medium shadow-lg hover:scale-105 transition-all duration-200 touch-manipulation"
                      style={{
                        background: `linear-gradient(135deg, #1DB954 0%, #1ed760 100%)`,
                        opacity: 0.7 + (0.3 * (count / maxCount)),
                        fontSize: `${12 + (count / 2)}px`,
                        padding: `${Math.max(8, (12 + (count / 2)) * 0.4)}px ${Math.max(12, (12 + (count / 2)) * 0.6)}px`,
                        boxShadow: `0 4px 12px rgba(29, 185, 84, ${(0.7 + (0.3 * (count / maxCount))) * 0.4})`
                      }}
                      title={`${count} artists`}
                    >
                      {genre}
                      <span className="ml-2 opacity-80" style={{ fontSize: `${(12 + (count / 2)) * 0.8}px` }}>{count}</span>
                    </span>
                  ));
                })()}
              </div>
              {/* Render genresComponent for additional genre visualization */}
              <div className="mt-4">
                {genresComponent}
              </div>
            </div>

            {/* NEW: Most Played Songs */}
            {spotifyData.mostPlayedSongs && (() => {
              const mostPlayedSongs = spotifyData.mostPlayedSongs as MostPlayedSongs | undefined;
              return mostPlayedSongs && (
              <div className="bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    {/* Replaced emoji with FaTrophy for Spotify design compliance */}
                    <div className="text-2xl sm:text-3xl mr-3 text-yellow-500">
                      <FaTrophy />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                        Top 10 Tracks
                        <span className="ml-3 px-3 py-1 bg-[#1DB954] text-white rounded-full text-xs font-medium">
                          Current Favorites
                        </span>
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">Your most played tracks from Spotify</p>
                    </div>
                  </div>

                  {/* Time Range Message */}
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <div className="bg-[#2a2a2a] text-gray-300 px-3 sm:px-4 py-2 rounded-lg border border-gray-600 text-sm flex-1 sm:flex-none">
                      📊 Multiple time ranges coming soon - focusing on current listening habits
                    </div>
                  </div>
                </div>

                {/* Current Tracks Info */}
                {(() => {
                  const currentTracks = spotifyData.topTracks || [];
                  return currentTracks.length > 0 ? (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 text-xs sm:text-sm flex items-start sm:items-center">
                        {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                        <FaChartBar className="mr-2 mt-0.5 sm:mt-0" />
                        <span>
                          <strong>
                            Current Listening Habits
                          </strong>
                          <br className="sm:hidden" />
                          <span className="sm:ml-2">Your actual Spotify top tracks rankings for this period</span>
                        </span>
                      </p>
                    </div>
                  ) : null;
                })()}

                <div className="space-y-6">
                  {(() => {
                    const currentTracks = spotifyData.topTracks || [];

                    if (currentTracks.length === 0) return null;

                    return (
                      <>
                        {/* Top 3: Grid layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                          {currentTracks.slice(0, 3).map((track) => (
                            <div key={track.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col hover:bg-white/15 transition-all duration-300 border border-white/20 shadow-lg">
                              {/* Album Art */}
                              {track.images?.[0] && (
                                <img
                                  src={track.images[0].url}
                                  alt={`Album cover for ${track.name}`}
                                  className="w-full aspect-square object-cover rounded-lg mb-4 shadow-md"
                                />
                              )}

                              {/* Track Info */}
                              <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-white text-lg leading-tight">{track.name}</h3>
                                <p className="text-gray-200 text-sm font-medium">{track.artist}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-gray-300 text-xs">{typeof track.album === 'string' ? track.album : track.album?.name || 'Unknown Album'}</p>
                                </div>



                                {/* Release Year */}
                                {track.album?.release_date && (
                                  <p className="text-gray-400 text-xs">
                                    Released: {new Date(track.album.release_date).getFullYear()}
                                  </p>
                                )}
                              </div>

                              {/* Ranking and Popularity */}
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[#1DB954] font-bold text-xl">#{track.rank}</span>
                                  <span className="text-gray-300 text-xs">ranking</span>
                                </div>
                                <div className="w-20">
                                  <PopularityBar
                                    popularity={track.popularity}
                                    label=""
                                    className="text-xs"
                                  />
                                </div>
                              </div>

                              {/* Spotify Button */}
                              {track.external_urls?.spotify && (
                                <a
                                  href={track.external_urls.spotify}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2.5 rounded-full text-sm font-semibold text-center transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                  <FaMusic />
                                  <span>Open in Spotify</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Tracks 4-10: Compact horizontal list */}
                        {currentTracks.length > 3 && (
                          <>
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center">
                                <FaChartBar className="mr-2" />
                                Tracks 4-10
                              </h3>
                              <p className="text-gray-300 text-sm mt-1">Your remaining top tracks</p>
                            </div>

                            <div className="space-y-3">
                              {currentTracks.slice(3, 10).map((track) => (
                          <div key={track.id} className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center transition-all duration-200 border border-white/10 hover:border-white/20">
                            {/* Ranking */}
                            <span className="text-[#1DB954] font-bold mr-4 text-lg w-8 text-center">#{track.rank}</span>

                            {/* Album Art (smaller) */}
                            {track.images?.[2] && (
                              <img
                                src={track.images[2].url}
                                alt={`Album cover for ${track.name}`}
                                className="w-12 h-12 rounded-lg mr-4 object-cover shadow-sm"
                              />
                            )}

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm truncate">{track.name}</h4>
                              <p className="text-gray-300 text-xs truncate">{track.artist} • {track.album?.name}</p>
                            </div>

                            {/* Popularity Bar */}
                            <div className="w-16 mr-4">
                              <PopularityBar
                                popularity={track.popularity}
                                label=""
                                className="text-xs h-1"
                              />
                            </div>

                            {/* Spotify Link */}
                            {track.external_urls?.spotify && (
                              <a
                                href={track.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#1DB954] transition-colors ml-2"
                                title="Open in Spotify"
                              >
                                <FaMusic className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                      </>
                    );
                  })()}
                </div>
              </div>
              );
            })()}

            {/* Recently Played Timeline */}
            {spotifyData?.recentTracks && (
              <div className="mt-6 sm:mt-8">
                <RecentlyPlayedTimeline
                  recentTracks={spotifyData.recentTracks}
                  isLoading={loading && !spotifyData}
                />
              </div>
            )}

            {/* Listening Insights Section */}
            {spotifyData.listeningHabits && (
              <div className="mt-6 sm:mt-8">
                <ListeningInsights
                  listeningHabits={spotifyData.listeningHabits}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Music Timeline */}
            {musicTimelineComponent && (
              <div className="mt-6 sm:mt-8">
                {musicTimelineComponent}
              </div>
            )}

            {/* Decade Pie Chart Section */}
            <div className="mt-6 sm:mt-8">
              <DecadePieChart decades={decadeData} isLoading={isLoading && !spotifyData} />
            </div>




          </div>
        )}
      </div>
    </div>
  );
}

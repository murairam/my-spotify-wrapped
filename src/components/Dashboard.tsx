/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useSpotifyError, useDebouncedSpotifyData, useTimeRangeData, SpotifyArtist } from "@/hooks/useSpotifyData";
import { ErrorDisplay } from "@/components/ErrorHandling";
import { DashboardLoadingSkeleton, ButtonLoadingSpinner } from "@/components/LoadingSkeleton";
import PopularityBar from "@/components/PopularityBar";
import ListeningInsights from "@/components/ListeningInsights";
import MusicTimeline from '@/components/MusicTimeline';
import TopArtists from '@/components/TopArtists';
import MusicIntelligence from '@/components/MusicIntelligence';

export default function Dashboard() {
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('short_term');
  const fetchStartTime = useRef(0);
  const renderStartTime = useRef(0);

  // Data fetching hooks
  const {
    data: spotifyData,
    isLoading,
    isFetching,
    isRefetching,
    refetch: originalRefetch,
    error
  } = useDebouncedSpotifyData({ enabled: hasAttemptedLoad });

  const timeRangeData = useTimeRangeData();
  const displayError = useSpotifyError(error);

  // Debounced refetch to prevent excessive API calls during quick interactions
  const debouncedRefetch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalRefetch();
      }, 500); // 500ms debounce
    };
  }, [originalRefetch]);

  // Debounced time range change to prevent excessive API calls
  const debouncedTimeRangeChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (newTimeRange: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSelectedTimeRange(newTimeRange);
      }, 300); // Shorter debounce for better UX
    };
  }, []);

  // Sync with time range data when available
  useEffect(() => {
    if (timeRangeData.data && Object.keys(timeRangeData.data).length > 0) {
      console.log('🔄 Time range data updated, triggering refresh...');
      debouncedRefetch();
    }
  }, // 300ms debounce for time range changes
  [timeRangeData.data, debouncedRefetch]);

  // Handle manual fetch trigger with performance logging
  const handleFetchData = useCallback(() => {
    fetchStartTime.current = performance.now();
    console.log('🚀 Starting data fetch...');

    if (!hasAttemptedLoad) {
      setHasAttemptedLoad(true);
    } else {
      // Use debounced refetch to prevent rapid successive calls
      debouncedRefetch();
    }
  }, [hasAttemptedLoad, debouncedRefetch]);

  // Throttled refresh function to prevent excessive API calls
  const throttledRefresh = useMemo(
    () => {
      let lastRefresh = 0;
      return () => {
        const now = Date.now();
        if (now - lastRefresh > 2000) { // 2 second throttle
          lastRefresh = now;
          handleFetchData();
        } else {
          console.log('🚫 Refresh throttled - please wait');
        }
      };
    },
    [handleFetchData]
  );

  // Performance monitoring for data loading
  useEffect(() => {
    if (isLoading && fetchStartTime.current > 0) {
      console.log('⏳ Data loading started...');
    }

    if (!isLoading && !isFetching && spotifyData && fetchStartTime.current > 0) {
      const fetchEndTime = performance.now();
      const fetchDuration = fetchEndTime - fetchStartTime.current;
      console.group('🎵 Data Fetch Performance Summary');
      console.log(`⏱️ Total fetch time: ${fetchDuration.toFixed(2)}ms`);
      console.log(`📊 Tracks loaded: ${spotifyData.topTracks?.length || 0}`);
      console.log(`🎤 Artists loaded: ${spotifyData.topArtists?.length || 0}`);
      console.log(`🎨 Genres loaded: ${spotifyData.topGenres?.length || 0}`);
      console.groupEnd();
      fetchStartTime.current = 0;
    }
  }, [isLoading, isFetching, spotifyData]);

  // Performance monitoring for rendering
  useEffect(() => {
    renderStartTime.current = performance.now();
  }, [spotifyData]);

  useEffect(() => {
    if (spotifyData && renderStartTime.current > 0) {
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - renderStartTime.current;
      console.log(`🎨 UI render time: ${renderDuration.toFixed(2)}ms`);
      renderStartTime.current = 0;
    }
  });

  // Loading state includes initial loading and refetching
  const loading = isLoading || isFetching || isRefetching;

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
    const maxGenreCount = Math.max(...genres.map((g: any) => g.count || 1));

    return genres.map((genreObj: any) => {
      const count = genreObj.count || 1;

      // Apply proportional sizing formulas as specified
      const opacity = 0.7 + (0.3 * (count / maxGenreCount)); // Opacity formula: 0.7 + (0.3 * ratio)
      const fontSize = 12 + (count / 2); // Font size formula: 12 + (count / 2)

      return (
        <span
          key={genreObj.genre || genreObj}
          className="inline-block text-white rounded-full font-medium shadow-lg hover:scale-105 transition-all duration-200 touch-manipulation"
          style={{
            // Uniform Spotify green gradient for all genre tags
            background: `linear-gradient(135deg, #1DB954 0%, #1ed760 100%)`,
            opacity: opacity,
            fontSize: `${fontSize}px`,
            padding: `${Math.max(8, fontSize * 0.4)}px ${Math.max(12, fontSize * 0.6)}px`,
            boxShadow: `0 4px 12px rgba(29, 185, 84, ${opacity * 0.4})`
          }}
          title={genreObj.count ? `${genreObj.count} artists` : undefined}
        >
          {genreObj.genre || genreObj}
          {genreObj.count && (
            <span className="ml-2 opacity-80" style={{ fontSize: `${fontSize * 0.8}px` }}>
              {genreObj.count}
            </span>
          )}
        </span>
      );
    });
  }, [spotifyData?.topGenres]);

  const musicTimelineComponent = useMemo(() =>
    spotifyData?.allTracksData && spotifyData.allTracksData.length > 0 ? (
      <MusicTimeline tracks={spotifyData.allTracksData as any} />
    ) : null, [spotifyData?.allTracksData]);

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
                        <FaChartBar /> Your personal Spotify data • {spotifyData.userProfile?.country || 'Unknown'} • {spotifyData.userProfile?.followers || 0} followers
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

            {/* Genres and Stats Row */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Top Genres */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  {/* Replaced emoji with FaPalette for Spotify design compliance */}
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                    <FaPalette />
                  </div>
                  <div className="flex items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Music DNA</h2>
                    {/* Subtitle displaying total number of genres as specified */}
                    <span className="ml-3 text-sm text-gray-400">
                      {spotifyData?.topGenres?.length || 0} genres
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {genresComponent}
                </div>
              </div>

              {/* Music Intelligence */}
              <MusicIntelligence
                discoveryMetrics={spotifyData.discoveryMetrics}
                socialMetrics={spotifyData.socialMetrics}
                isLoading={isLoading}
              />
            </div>

            {/* NEW: Most Played Songs */}
            {spotifyData.mostPlayedSongs && (
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
                          {selectedTimeRange === 'short_term' ? 'Last 4 Weeks' :
                           selectedTimeRange === 'medium_term' ? 'Last 6 Months' :
                           '~1 Year'}
                        </span>
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">Your most played tracks from Spotify</p>
                    </div>
                  </div>

                  {/* Time Range Selector */}
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                    <span className="text-gray-200 text-sm">Period:</span>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => debouncedTimeRangeChange(e.target.value)}
                      className="bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none text-sm flex-1 sm:flex-none min-h-[44px] touch-manipulation"
                    >
                      {/* Replaced emojis with text for cleaner design */}
                      <option value="short_term">Last 4 Weeks</option>
                      <option value="medium_term">Last 6 Months</option>
                      <option value="long_term">~1 Year of Data</option>
                    </select>
                  </div>
                </div>

                {/* Time Range Info */}
                {(spotifyData.mostPlayedSongs?.[selectedTimeRange] || []).length > 0 && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-xs sm:text-sm flex items-start sm:items-center">
                      {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                      <FaChartBar className="mr-2 mt-0.5 sm:mt-0" />
                      <span>
                        <strong>
                          Period: {(spotifyData.mostPlayedSongs?.[selectedTimeRange] as any)?.[0]?.periodDescription || 'Unknown'}
                        </strong>
                        <br className="sm:hidden" />
                        <span className="sm:ml-2">Your actual Spotify top tracks rankings for this period</span>
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Top 3: Grid layout */}
                  {(spotifyData.mostPlayedSongs?.[selectedTimeRange] || []).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {(spotifyData.mostPlayedSongs?.[selectedTimeRange] || []).slice(0, 3).map((track: any) => (
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
                            <p className="text-gray-300 text-xs">{track.album?.name}</p>
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
                              {/* Replaced emoji with FaMusic for Spotify design compliance */}
                              <FaMusic />
                              <span>Open in Spotify</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tracks 4-10: Compact horizontal list */}
                  {(spotifyData.mostPlayedSongs?.[selectedTimeRange] || []).length > 3 && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                          <FaChartBar className="mr-2" />
                          Tracks 4-10
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">Your remaining top tracks</p>
                      </div>

                      <div className="space-y-3">
                        {(spotifyData.mostPlayedSongs?.[selectedTimeRange] || []).slice(3, 10).map((track: any) => (
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
                </div>
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

            {/* Raw Data Section */}
            <details className="mt-6 sm:mt-8 bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10">
              <summary className="cursor-pointer font-semibold text-white hover:text-gray-300 text-sm sm:text-base min-h-[44px] flex items-center touch-manipulation">🔍 Raw Data (for debugging)</summary>
              <pre className="mt-4 text-xs overflow-auto text-gray-300 bg-black/30 p-3 sm:p-4 rounded-lg max-h-64 sm:max-h-96">
                {JSON.stringify(spotifyData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

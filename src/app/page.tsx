/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
// Replaced emojis with FontAwesome icons for Spotify design compliance
import { 
  FaSpotify, 
  FaMusic, 
  FaChartBar, 
  FaPalette, 
  FaFire, 
  FaCrown, 
  FaTrophy, 
  FaMicrophone,
  FaUser,
  FaPlay,
  FaClock,
  FaGuitar,
  FaTheaterMasks,
  FaHeart,
  FaArrowUp,
  FaUsers,
  FaEdit
} from "react-icons/fa";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { useSpotifyError, useDebouncedSpotifyData, useTimeRangeData, SpotifyTrack, SpotifyArtist } from "@/hooks/useSpotifyData";
import { ErrorDisplay } from "@/components/ErrorHandling";
import { DashboardLoadingSkeleton, ButtonLoadingSpinner } from "@/components/LoadingSkeleton";
import PopularityBar from "@/components/PopularityBar";
import ListeningHeatmap from "@/components/ListeningHeatmap";
import MusicTimeline from '@/components/MusicTimeline';
import TopTracks from '@/components/TopTracks';
import TopArtists from '@/components/TopArtists';

export default function Home() {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <Content />
      </SessionProvider>
    </ReactQueryProvider>
  );
}

function Content() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 lg:p-12 rounded-2xl border border-white/20 shadow-2xl text-center max-w-md w-full">
          <div className="mb-8">
            {/* Replaced emoji with FaSpotify for Spotify design compliance */}
            <div className="text-4xl sm:text-5xl mb-4 text-[#1DB954]">
              <FaSpotify />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Spotify Wrapped</h1>
            {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
            <p className="text-gray-200 text-sm sm:text-base">Discover your musical journey</p>
          </div>

          <button
            onClick={() => signIn("spotify")}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full min-h-[44px] mb-6 flex items-center justify-center gap-2"
          >
            {/* Replaced emoji with FaSpotify for Spotify design compliance */}
            <FaSpotify />
            Sign in with Spotify
          </button>

          {/* Spotify Logo for Brand Compliance */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
              <span className="text-gray-200 text-xs sm:text-sm">Powered by</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/spotify-logo.svg"
                alt="Spotify"
                className="h-5 sm:h-6"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(100%)'
                }}
                onError={(e) => {
                  console.log('Spotify logo failed to load, using fallback');
                  e.currentTarget.outerHTML = '<span class="text-[#1DB954] font-bold">Spotify</span>';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <SpotifyDataTest />;
}

function SpotifyDataTest() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("short_term"); // Default to most recent data
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Performance tracking refs
  const fetchStartTime = useRef<number>(0);
  const renderStartTime = useRef<number>(0);

  // Use optimized React Query hook with debouncing for data fetching
  const {
    data: spotifyData,
    isLoading,
    error: queryError,
    isFetching,
    isRefetching,
    debouncedRefetch
  } = useDebouncedSpotifyData({
    enabled: hasAttemptedLoad, // Only fetch when user clicks the button
    retry: (failureCount, error) => {
      // Custom retry logic
      if (error?.type === 'auth' || error?.type === 'insufficient_data') {
        return false;
      }
      return failureCount < 3;
    }
  }, 1000); // 1 second debounce delay

  // Parallel data fetching for time ranges (background prefetching)
  const timeRangeData = useTimeRangeData(['short_term', 'medium_term', 'long_term']);

  // Parse error for display
  const displayError = useSpotifyError(queryError);

  // Debounced time range change handler
  const debouncedTimeRangeChange = useMemo(
    () => {
      const handleTimeRangeChange = (newTimeRange: string) => {
        console.log(`🎯 Time range changed to: ${newTimeRange}`);
        setSelectedTimeRange(newTimeRange);
        // Use background prefetched data if available
        if (timeRangeData.data[newTimeRange]) {
          console.log('✅ Using cached time range data');
        }
      };

      let timeoutId: NodeJS.Timeout;
      return (newTimeRange: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleTimeRangeChange(newTimeRange), 300);
      };
    }, // 300ms debounce for time range changes
    [timeRangeData.data]
  );

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
  const topTracksComponent = useMemo(() => (
    <TopTracks
      topTracksByTimeRange={spotifyData?.topTracksByTimeRange}
      topTracks={spotifyData?.topTracks as SpotifyTrack[] | undefined}
      isLoading={loading && !spotifyData}
    />
  ), [loading, spotifyData]);

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

            {/* Top Tracks and Artists Row - Optimized for Performance */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {topTracksComponent}
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

              {/* Stats */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                    <FaChartBar />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Your Stats</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                      <div className="text-gray-200 text-sm sm:text-base">Average Popularity</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.stats?.averagePopularity || 0}/100</div>
                      {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                      <div className="text-xs sm:text-sm text-gray-200">
                        {(spotifyData.stats?.averagePopularity || 0) >= 70 ? "Mainstream taste" :
                         (spotifyData.stats?.averagePopularity || 0) >= 50 ? "Balanced taste" : "Underground vibes"}
                      </div>
                    </div>
                    {/* Replaced emoji with FaFire for Spotify design compliance */}
                    <div className="text-3xl sm:text-4xl text-orange-500">
                      <FaFire />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                      <div className="text-gray-200 text-sm sm:text-base">Tracks Analyzed</div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.stats?.totalTracksAnalyzed || 0}</div>
                    </div>
                    {/* Replaced emoji with FaMusic for Spotify design compliance */}
                    <div className="text-3xl sm:text-4xl text-blue-500">
                      <FaMusic />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                      <div className="text-gray-200 text-sm sm:text-base">Artists Analyzed</div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-400">{spotifyData.stats?.totalArtistsAnalyzed || 0}</div>
                    </div>
                    {/* Replaced emoji with FaMicrophone for Spotify design compliance */}
                    <div className="text-3xl sm:text-4xl text-purple-500">
                      <FaMicrophone />
                    </div>
                  </div>
                </div>
              </div>
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
                              <p className="text-white text-sm font-semibold truncate">{track.name}</p>
                              <p className="text-gray-300 text-xs truncate">{track.artist}</p>
                            </div>

                            {/* Popularity Bar */}
                            <div className="ml-4 w-16">
                              <PopularityBar
                                popularity={track.popularity}
                                label=""
                                className="text-xs"
                              />
                            </div>

                            {/* Compact Spotify Link */}
                            {track.external_urls?.spotify && (
                              <a
                                href={track.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 bg-[#1DB954] hover:bg-[#1ed760] text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1"
                              >
                                {/* Replaced emoji with FaMusic for Spotify design compliance */}
                                <FaMusic />
                                <span className="hidden sm:inline">Spotify</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-xs sm:text-sm flex items-start">
                    <span className="mr-2 mt-0.5">💡</span>
                    <span>
                      Shows your actual Spotify top tracks rankings for ${
                        selectedTimeRange === 'short_term' ? 'the last 4 weeks' :
                        selectedTimeRange === 'medium_term' ? 'the last 6 months' :
                        '~1 year of data'
                      }. Rankings are 100% real from Spotify&apos;s API. Spotify doesn&apos;t provide exact play counts or specific dates.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* NEW: Social & Discovery Insights */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              {/* Discovery Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🔍</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Discovery Profile</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Mainstream Taste</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.discoveryMetrics.mainstreamTaste || 0}%</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">
                            {(spotifyData.discoveryMetrics.mainstreamTaste || 0) > 70 ? "Chart follower" :
                             (spotifyData.discoveryMetrics.mainstreamTaste || 0) > 50 ? "Balanced taste" : "Underground explorer"}
                          </div>
                        </div>
                        {/* Replaced emoji with FaArrowUp for Spotify design compliance */}
                        <div className="text-3xl sm:text-4xl text-green-500">
                          <FaArrowUp />
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Artist Diversity</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.discoveryMetrics.artistDiversity || 0}%</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">
                            {(spotifyData.discoveryMetrics.artistDiversity || 0) > 70 ? "Explorer" :
                             (spotifyData.discoveryMetrics.artistDiversity || 0) > 50 ? "Balanced" : "Loyal fan"}
                          </div>
                        </div>
                        {/* Replaced emoji with FaTheaterMasks for Spotify design compliance */}
                        <div className="text-3xl sm:text-4xl text-purple-500">
                          <FaTheaterMasks />
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Recent Music Lover</div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-400">{spotifyData.discoveryMetrics.recentMusicLover || 0}%</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">
                            {(spotifyData.discoveryMetrics.recentMusicLover || 0) > 60 ? "Trend follower" :
                             (spotifyData.discoveryMetrics.recentMusicLover || 0) > 30 ? "Balanced" : "Vintage collector"}
                          </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">🆕</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Social Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  {/* Replaced emoji with FaUsers for Spotify design compliance */}
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                    <FaUsers />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Social Profile</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {spotifyData.socialMetrics && (
                    <>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Following Artists</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.socialMetrics.followedArtistsCount || 0}</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">Artists you follow</div>
                        </div>
                        {/* Replaced emoji with FaHeart for Spotify design compliance */}
                        <div className="text-3xl sm:text-4xl text-red-500">
                          <FaHeart />
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Your Playlists</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.socialMetrics.playlistsOwned || 0}</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">Playlists you created</div>
                        </div>
                        {/* Replaced emoji with FaEdit for Spotify design compliance */}
                        <div className="text-3xl sm:text-4xl text-blue-500">
                          <FaEdit />
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-gray-200 text-sm sm:text-base">Account Type</div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-400 capitalize">{spotifyData.socialMetrics.accountType || 'Free'}</div>
                          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                          <div className="text-xs sm:text-sm text-gray-200">Spotify subscription</div>
                        </div>
                        {/* Replaced emoji with FaCrown for Spotify design compliance */}
                        <div className="text-3xl sm:text-4xl text-yellow-500">
                          <FaCrown />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Music Timeline - Performance Optimized */}
            {musicTimelineComponent}

            {/* RAW DATA: Listening Time Patterns */}
            {spotifyData.listeningHabits && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">⏰</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Time Patterns</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningHour || 0}:00</div>
                    <div className="text-gray-300 text-sm sm:text-base">Peak listening hour</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningDay || 'Unknown'}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Most active day</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white capitalize">{spotifyData.listeningHabits.preferredTimeOfDay || 'Unknown'}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Most active period</div>
                  </div>
                </div>
              </div>
            )}

            {/* Listening Activity Heatmap */}
            {spotifyData.listeningHabits && (
              <ListeningHeatmap
                listeningHabits={spotifyData.listeningHabits}
                className="mt-6 sm:mt-8"
              />
            )}

            {/* RAW DATA: Time Range Evolution */}
            <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📈</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Evolution Across Time</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {spotifyData.timeRanges && Object.entries(spotifyData.timeRanges).map(([period, data]: [string, any]) => (
                  <div key={period} className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">{data.label}</h3>
                    <div className="space-y-2">
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Top Artist: </span>
                        <span className="text-white truncate block sm:inline">{data.artists[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Top Track: </span>
                        <span className="text-white truncate block sm:inline">{data.tracks[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Total Artists: </span>
                        <span className="text-white">{data.artists?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RAW DATA: Music Metrics */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  {/* Replaced emoji with FaChartBar for Spotify design compliance */}
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                    <FaChartBar />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Raw Metrics</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Unique Artists</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.uniqueArtistsCount || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Unique Albums</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.uniqueAlbumsCount || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Average Tracks per Artist</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.artistLoyalty || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Oldest Track Year</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.oldestTrackYear || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Newest Track Year</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.newestTrackYear || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎯</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Percentages</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Mainstream Score</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.mainstreamTaste || 0}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Underground Score</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.undergroundTaste || 0}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Recent Music (2023-2025)</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.recentMusicLover || 0}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Vintage Music (Pre-2000)</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.vintageCollector || 0}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Artist Diversity</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.artistDiversity || 0}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: Recently Played Activity */}
            {/* RAW DATA: Recent Listening History */}
            {spotifyData.recentTracks && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    {/* Replaced emoji with FaClock for Spotify design compliance */}
                    <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                      <FaClock />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Listening Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.recentTracks.length} tracks
                  </span>
                </div>
                <div className="grid gap-2 sm:gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {spotifyData.recentTracks.slice(0, 15).map((track: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      {track.track.album?.images?.[2] && (
                        <img
                          src={track.track.album.images[2].url}
                          alt={track.track.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs sm:text-sm">
                          <div className="truncate">{track.track.name}</div>
                          {track.track.external_urls?.spotify && (
                            <a
                              href={track.track.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[28px] touch-manipulation"
                            >
                              {/* Replaced emoji with FaMusic for Spotify design compliance */}
                              <FaMusic className="mr-1" />
                              <span className="hidden sm:inline">Open</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-gray-300 text-xs truncate">{track.track.artists[0]?.name}</div>
                      </div>
                      <div className="text-gray-400 text-xs flex-shrink-0">
                        {new Date(track.played_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: All Your Playlists */}
            {spotifyData.playlists && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📝</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Your Playlists Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.playlists.length} playlists
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {spotifyData.playlists.map((playlist: any) => (
                    <div key={playlist.id} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                      <div className="text-white font-medium text-sm mb-2">
                        <div className="truncate">{playlist.name}</div>
                        {playlist.external_urls?.spotify && (
                          <a
                            href={playlist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[28px] touch-manipulation"
                          >
                            <span className="mr-1">📝</span>
                            <span className="hidden sm:inline">Open</span>
                            <span className="sm:hidden">♪</span>
                          </a>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{playlist.tracks.total} tracks</span>
                        <span>{playlist.public ? 'Public' : 'Private'}</span>
                      </div>
                      {playlist.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">{playlist.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Artists You Follow */}
            {spotifyData.followedArtists && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">👥</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Following Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.followedArtists.length} artists
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-64 sm:max-h-80 overflow-y-auto">
                  {spotifyData.followedArtists.map((artist: any) => (
                    <div key={artist.id} className="p-2 sm:p-3 bg-white/5 rounded-lg text-center">
                      {artist.images?.[2] && (
                        <img
                          src={artist.images[2].url}
                          alt={artist.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2"
                        />
                      )}
                      <div className="text-white text-xs sm:text-sm">
                        <div className="truncate">{artist.name}</div>
                        {artist.external_urls?.spotify && (
                          <a
                            href={artist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                          >
                            {/* Replaced emoji with FaMicrophone for Spotify design compliance */}
                            <FaMicrophone className="mr-1" />
                            <span className="hidden sm:inline">Spotify</span>
                            <span className="sm:hidden">♪</span>
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-300">{artist.followers.total.toLocaleString()} followers</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Genre Distribution */}
            {spotifyData.genreData && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    {/* Replaced emoji with FaGuitar for Spotify design compliance */}
                    <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                      <FaGuitar />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Genre Statistics</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {Object.keys(spotifyData.genreData || {}).length} genres
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
                  {Object.entries(spotifyData.genreData || {})
                    .sort(([,a]: [string, any], [,b]: [string, any]) => (b as any)?.count - (a as any)?.count)
                    .slice(0, 20)
                    .map(([genre, data]: [string, any]) => (
                    <div key={genre} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-xs sm:text-sm capitalize truncate mr-2">{genre}</span>
                      <span className="text-gray-300 font-bold text-xs sm:text-sm flex-shrink-0">{data.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Artist Analysis */}
            {spotifyData.artistAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  {/* Replaced emoji with FaMicrophone for Spotify design compliance */}
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                    <FaMicrophone />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Artist Deep Dive</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.totalUniqueArtists || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Total Artists</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.averagePopularity || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Popularity</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{((spotifyData.artistAnalysis.averageFollowers || 0) / 1000000).toFixed(1)}M</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Followers</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.averageGenresPerArtist || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Genres per Artist</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Most Popular Artist</h3>
                    {spotifyData.artistAnalysis.mostPopularArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white text-sm sm:text-base">
                          <div className="truncate">{spotifyData.artistAnalysis.mostPopularArtist.name}</div>
                          {spotifyData.artistAnalysis.mostPopularArtist.external_urls?.spotify && (
                            <a
                              href={spotifyData.artistAnalysis.mostPopularArtist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                            >
                              {/* Replaced emoji with FaMicrophone for Spotify design compliance */}
                              <FaMicrophone className="mr-1" />
                              <span className="hidden sm:inline">Spotify</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm">Popularity: {spotifyData.artistAnalysis.mostPopularArtist.popularity || 0}/100</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Biggest Artist</h3>
                    {spotifyData.artistAnalysis.biggestArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white text-sm sm:text-base">
                          <div className="truncate">{spotifyData.artistAnalysis.biggestArtist.name}</div>
                          {spotifyData.artistAnalysis.biggestArtist.external_urls?.spotify && (
                            <a
                              href={spotifyData.artistAnalysis.biggestArtist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                            >
                              {/* Replaced emoji with FaMicrophone for Spotify design compliance */}
                              <FaMicrophone className="mr-1" />
                              <span className="hidden sm:inline">Spotify</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm">{(spotifyData.artistAnalysis.biggestArtist.followers?.total || 0).toLocaleString()} followers</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Album Analysis */}
            {spotifyData.albumAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">💿</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Album Analysis</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.totalUniqueAlbums || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Unique Albums</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.yearSpread || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Year Spread</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.averageReleaseYear || 0}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Release Year</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{Object.keys(spotifyData.albumAnalysis.albumTypes || {}).length}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Album Types</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Decade Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.decadeDistribution || {})
                        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
                        .slice(0, 5)
                        .map(([decade, count]: [string, any]) => (
                        <div key={decade} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300">{decade}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Album Types</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.albumTypes || {}).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300 capitalize">{type}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Complete Statistics Dashboard */}
            {spotifyData.stats && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📈</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Complete API Capabilities</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-green-500/20 rounded-full text-sm text-green-300">
                    {spotifyData.stats.dataCompletenessScore || 0}% Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.totalTracksAnalyzed || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Total Tracks</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.uniqueArtistsCount || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Unique Artists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.uniqueAlbumsCount || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Unique Albums</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.totalGenresFound || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Genres Found</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.playlistsAnalyzed || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Playlists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.followedArtistsCount || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Followed Artists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.recentTracksAnalyzed || 0}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Recent Tracks</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.audioFeaturesCoverage || 0}%</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Audio Features</div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/5 rounded-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">API Endpoint Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(spotifyData.stats.scopesWorking || {}).map(([scope, working]: [string, any]) => (
                      <div key={scope} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-300 truncate mr-2">{scope.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${working ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {working ? 'Working' : 'Limited'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}            {/* Next: Add Mistral AI button */}
            <div className="text-center pt-6 sm:pt-8">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl shadow-xl transform transition hover:scale-105 min-h-[44px] touch-manipulation">
                🤖 Get AI Analysis (Coming Soon!)
              </button>
            </div>

            {/* Spotify Attribution Footer */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <img
                  src="/spotify-logo.svg"
                  alt="Spotify"
                  className="h-6 sm:h-8"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(100%)'
                  }}
                  onError={(e) => {
                    console.log('Footer Spotify logo failed to load');
                    e.currentTarget.outerHTML = '<div class="text-[#1DB954] font-bold text-xl">Spotify</div>';
                  }}
                />
                <div className="text-center px-4">
                  <p className="text-gray-400 text-sm">
                    Data provided by Spotify
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    This app uses the Spotify Web API but is not endorsed, certified or otherwise approved by Spotify.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {spotifyData && (
          <details className="mt-6 sm:mt-8 bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10">
            <summary className="cursor-pointer font-semibold text-white hover:text-gray-300 text-sm sm:text-base min-h-[44px] flex items-center touch-manipulation">🔍 Raw Data (for debugging)</summary>
            <pre className="mt-4 text-xs overflow-auto text-gray-300 bg-black/30 p-3 sm:p-4 rounded-lg max-h-64 sm:max-h-96">
              {JSON.stringify(spotifyData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

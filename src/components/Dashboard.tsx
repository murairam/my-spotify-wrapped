import Image from 'next/image';
import { useState, useMemo } from "react";
import { signOut } from "next-auth/react";
import {
  FaMusic,
  FaChartBar,
  FaPalette,
  FaAward,  // Using FaAward instead of FaTrophy
  FaUser,
  FaCrown,
} from "react-icons/fa";

import { useQuery } from '@tanstack/react-query';
import { useSpotifyError, SpotifyArtist } from '@/hooks/useSpotifyData';

import TopArtists from '@/components/TopArtists';
import MusicTimeline from '@/components/MusicTimeline';
import { DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorDisplay } from '@/components/ErrorHandling';
import TopTracks from '@/components/TopTracks';
import MusicIntelligence, { type SocialMetrics } from '@/components/MusicIntelligence';
import PopularityBar from '@/components/PopularityBar';
import RecentlyPlayedTimeline from '@/components/RecentlyPlayedTimeline';
import ListeningInsights from '@/components/ListeningInsights';

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

interface RecentTrack {
  track?: {
    id: string;
    name: string;
    artists?: Array<{ name: string }>;
    album?: {
      name: string;
      images: Array<{ url: string; height?: number; width?: number }>;
    };
    duration_ms?: number;
    external_urls?: { spotify?: string };
  };
  played_at: string;
}

export const TIME_RANGES = [
  { key: 'short_term', label: 'Last 4 Weeks' },
  { key: 'medium_term', label: 'Last 6 Months' },
  { key: 'long_term', label: 'All Time' }
] as const;
export type TimeRangeKey = typeof TIME_RANGES[number]['key'];

// Helper function for metrics (must be at module scope, not inside component)
function getDiscoveryMetrics(tracks: MostPlayedTrack[]) {
  const mainstreamTaste = tracks.length > 0 ? Math.round(tracks.reduce((sum: number, t: MostPlayedTrack) => sum + (t.popularity || 0), 0) / tracks.length) : 0;
  const uniqueArtists = new Set(tracks.map((t: MostPlayedTrack) => t.artist)).size;
  const vintageCount = tracks.filter((t: MostPlayedTrack) => t.album && t.album.release_date && t.album.release_date.slice(0,4) < '2010').length;
  const vintageCollector = tracks.length > 0 ? Math.round((vintageCount / tracks.length) * 100) : 0;
  const undergroundCount = tracks.filter((t: MostPlayedTrack) => (t.popularity || 0) < 40).length;
  const undergroundTaste = tracks.length > 0 ? Math.round((undergroundCount / tracks.length) * 100) : 0;
  const recentCount = tracks.filter((t: MostPlayedTrack) => t.album && t.album.release_date && t.album.release_date.slice(0,4) >= '2020').length;
  const recentMusicLover = tracks.length > 0 ? Math.round((recentCount / tracks.length) * 100) : 0;
  const uniqueAlbums = new Set(tracks.map((t: MostPlayedTrack) => t.album?.name)).size;
  const years = tracks
    .map((t: MostPlayedTrack) => t.album && t.album.release_date ? parseInt(t.album.release_date.slice(0,4)) : undefined)
    .filter((y: number | undefined): y is number => typeof y === 'number' && !isNaN(y));
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
}

// Minimal API response type for dashboard
interface SpotifyUserProfile {
  display_name?: string;
  country?: string;
  followers?: { total?: number } | number;
  product?: string;
  id?: string;
}

interface TopTracksByTimeRange {
  short_term?: MostPlayedTrack[];
  medium_term?: MostPlayedTrack[];
  long_term?: MostPlayedTrack[];
}

interface TopArtistsByTimeRange {
  short_term?: SpotifyArtist[];
  medium_term?: SpotifyArtist[];
  long_term?: SpotifyArtist[];
}

interface SpotifyApiResponse {
  userProfile?: SpotifyUserProfile;
  topTracks?: MostPlayedTrack[];
  topArtists?: SpotifyArtist[];
  topGenres?: Array<{ genre: string; count?: number } | string>;
  topTracksByTimeRange?: TopTracksByTimeRange;
  topArtistsByTimeRange?: TopArtistsByTimeRange;
  mostPlayedSongs?: MostPlayedSongs;
  socialMetrics?: SocialMetrics;
  recentTracks?: RecentTrack[];
  listeningHabits?: {
    peakListeningHour?: number;
    peakListeningDay?: string;
    preferredTimeOfDay?: string;
  };
  [key: string]: unknown;
}

export default function Dashboard() {
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>('short_term');

  // Queries for each time range
  const queries: Record<TimeRangeKey, ReturnType<typeof useQuery<SpotifyApiResponse, Error>>> = {
    short_term: useQuery({
      queryKey: ['spotify-top-items', 'short_term'],
      queryFn: () => fetch(`/api/spotify/top-items?time_range=short_term`).then(res => res.json()),
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: true
    }),
    medium_term: useQuery({
      queryKey: ['spotify-top-items', 'medium_term'],
      queryFn: () => fetch(`/api/spotify/top-items?time_range=medium_term`).then(res => res.json()),
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: selectedRange === 'medium_term'
    }),
    long_term: useQuery({
      queryKey: ['spotify-top-items', 'long_term'],
      queryFn: () => fetch(`/api/spotify/top-items?time_range=long_term`).then(res => res.json()),
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: selectedRange === 'long_term'
    })
  };

  const currentQuery = queries[selectedRange];
  const spotifyData: SpotifyApiResponse | undefined = currentQuery.data;
  const isLoading = currentQuery.isLoading;
  const error = currentQuery.error;
  const displayError = useSpotifyError(error);

  // Compute metrics for Music Intelligence section
  const musicIntelligenceMetrics = useMemo(() => {
    if (spotifyData?.topTracksByTimeRange?.long_term && Array.isArray(spotifyData.topTracksByTimeRange.long_term)) {
      return getDiscoveryMetrics(spotifyData.topTracksByTimeRange.long_term);
    }
    return null;
  }, [spotifyData?.topTracksByTimeRange?.long_term]);

  const loading = isLoading;

  // Memoized components to prevent unnecessary re-renders
  const topArtistsComponent = useMemo(() => (
    <TopArtists
      topArtists={spotifyData?.topArtists}
      isLoading={isLoading && !spotifyData}
    />
  ), [isLoading, spotifyData]);

  const genresComponent = useMemo(() => {
    const genres = (spotifyData?.topGenres?.slice(0, 10) || []) as ({ genre: string; count?: number } | string)[];
    const maxGenreCount = Math.max(...genres.map((g) =>
      typeof g === 'object' && g && 'count' in g ? (g as { count: number }).count ?? 1 : 1
    ));

    return genres.map((genreObj) => {
      const isGenreObject = typeof genreObj === 'object' && genreObj && 'genre' in genreObj;
      const genreName = isGenreObject ? (genreObj as { genre: string }).genre : (typeof genreObj === 'string' ? genreObj : 'Unknown');
      const count = isGenreObject && (genreObj as { count?: number }).count ? (genreObj as { count: number }).count : 1;

      const opacity = 0.7 + (0.3 * (count / maxGenreCount));
      const fontSize = 12 + (count / 2);

      return (
        <span
          key={genreName}
          className="inline-block text-white rounded-full font-medium shadow-lg hover:scale-105 transition-all duration-200 touch-manipulation"
          style={{
            background: `linear-gradient(135deg, #1DB954 0%, #1ed760 100%)`,
            opacity: opacity,
            fontSize: `${fontSize}px`,
            padding: `${Math.max(8, fontSize * 0.4)}px ${Math.max(12, fontSize * 0.6)}px`,
            boxShadow: `0 4px 12px rgba(29, 185, 84, ${opacity * 0.4})`
          }}
          title={isGenreObject && (genreObj as { count?: number }).count ? `${(genreObj as { count: number }).count} artists` : undefined}
        >
          {genreName}
          {isGenreObject && (genreObj as { count?: number }).count && (
            <span className="ml-2 opacity-80" style={{ fontSize: `${fontSize * 0.8}px` }}>
              {(genreObj as { count: number }).count}
            </span>
          )}
        </span>
      );
    });
  }, [spotifyData?.topGenres]);

  const musicTimelineComponent = useMemo(() => {
    const hasTimeRangeData = spotifyData?.topTracksByTimeRange && (
      (spotifyData.topTracksByTimeRange.long_term?.length ?? 0) > 0 ||
      (spotifyData.topTracksByTimeRange.medium_term?.length ?? 0) > 0 ||
      (spotifyData.topTracksByTimeRange.short_term?.length ?? 0) > 0
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
        {/* Time Range Selector */}
        <div className="flex justify-center mb-6 gap-2">
          {TIME_RANGES.map(tr => (
            <button
              key={tr.key}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-150 ${selectedRange === tr.key ? 'bg-[#1DB954] text-white' : 'bg-gray-800 text-gray-300 hover:bg-[#1DB954]/80 hover:text-white'}`}
              onClick={() => setSelectedRange(tr.key)}
              disabled={selectedRange === tr.key}
            >
              {tr.label}
              {queries[tr.key].isLoading && <span className="ml-2 animate-spin">⏳</span>}
            </button>
          ))}
        </div>

        {/* Header with Spotify Branding */}
        <div className="text-center mb-8 sm:mb-12 pt-4 sm:pt-8 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4">
            My Spotify Wrapped
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6">
            Discover your unique music personality and listening patterns
          </p>
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-gray-200 text-xs sm:text-sm">Powered by</span>
            <Image
              src="/spotify-logo.svg"
              alt="Spotify"
              width={96}
              height={24}
              className="h-5 sm:h-6"
              style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full sm:w-auto min-h-[44px]"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Error Display */}
        {displayError && (
          <ErrorDisplay
            error={displayError}
            onRetry={displayError.canRetry ? currentQuery.refetch : undefined}
            className="mb-8"
          />
        )}

        {/* Loading State */}
        {isLoading && !spotifyData && (
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
                        {spotifyData.userProfile?.display_name?.charAt(0) || <FaUser />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white text-base sm:text-lg font-semibold truncate">
                        {spotifyData.userProfile?.display_name || 'Spotify User'}
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm leading-tight flex items-center gap-1">
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
                    <div className="text-gray-200 text-xs">
                      ID: {spotifyData.userProfile?.id || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Artists Section */}
            <div className="grid lg:grid-cols-1 gap-6 sm:gap-8">
              {topArtistsComponent}
            </div>

            {/* Top Tracks Section */}
            <div className="mt-6 sm:mt-8">
              <TopTracks
                topTracks={spotifyData.topTracks as unknown as import("@/hooks/useSpotifyData").SpotifyTrack[]}
                isLoading={isLoading && !spotifyData}
              />
            </div>

            {/* Music Intelligence Section */}
            {musicIntelligenceMetrics && (
              <div className="mt-6 sm:mt-8">
                <MusicIntelligence
                  discoveryMetrics={musicIntelligenceMetrics}
                  socialMetrics={spotifyData?.socialMetrics}
                  isLoading={loading && !spotifyData}
                />
              </div>
            )}

            {/* Top Genres Section */}
            <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
                  <FaPalette />
                </div>
                <div className="flex items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Music DNA</h2>
                  <span className="ml-3 text-sm text-gray-400">
                    {(() => {
                      const artists = spotifyData?.topArtistsByTimeRange?.long_term || [];
                      const genreSet = new Set<string>();
                      artists.forEach((a: SpotifyArtist) => (a.genres || []).forEach((g: string) => genreSet.add(g)));
                      return genreSet.size;
                    })()} genres
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {(() => {
                  const artists = (spotifyData?.topArtistsByTimeRange?.long_term || []) as SpotifyArtist[];
                  const genreCount: Record<string, number> = {};
                  artists.forEach((a: SpotifyArtist) => (a.genres || []).forEach((g: string) => { genreCount[g] = (genreCount[g] || 0) + 1; }));
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
              <div className="mt-4">
                {genresComponent}
              </div>
            </div>

            {/* Recently Played Timeline */}
            {spotifyData?.recentTracks && (
              <div className="mt-6 sm:mt-8">
                <RecentlyPlayedTimeline
                  recentTracks={spotifyData.recentTracks}
                  isLoading={loading && !spotifyData}
                />
              </div>
            )}

            {/* Top Tracks Detail Section */}
            <div className="bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="text-2xl sm:text-3xl mr-3 text-yellow-500">
                    <FaAward />
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
              </div>

              {spotifyData.topTracks && spotifyData.topTracks.length > 0 && (
                <div className="space-y-6">
                  {/* Top 3: Grid layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {spotifyData.topTracks.slice(0, 3).map((track, index) => (
                      <div key={track.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col hover:bg-white/15 transition-all duration-300 border border-white/20 shadow-lg">
                        {track.images?.[0] && (
                          <Image
                            src={track.images[0].url}
                            alt={`Album cover for ${track.name}`}
                            width={400}
                            height={400}
                            className="w-full aspect-square object-cover rounded-lg mb-4 shadow-md"
                          />
                        )}

                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold text-white text-lg leading-tight">{track.name}</h3>
                          <p className="text-gray-200 text-sm font-medium">{track.artist}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-300 text-xs">{track.album?.name || 'Unknown Album'}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#1DB954] font-bold text-xl">#{index + 1}</span>
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

                  {/* Tracks 4-10: Compact list */}
                  {spotifyData.topTracks.length > 3 && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <FaChartBar className="mr-2" />
                          Tracks 4-10
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">Your remaining top tracks</p>
                      </div>

                      <div className="space-y-3">
                        {spotifyData.topTracks.slice(3, 10).map((track, index) => (
                          <div key={track.id} className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center transition-all duration-200 border border-white/10 hover:border-white/20">
                            <span className="text-[#1DB954] font-bold mr-4 text-lg w-8 text-center">#{index + 4}</span>

                            {track.images?.[0] && (
                              <Image
                                src={track.images[0].url}
                                alt={`Album cover for ${track.name}`}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg mr-4 object-cover shadow-sm"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm truncate">{track.name}</h4>
                              <p className="text-gray-300 text-xs truncate">{track.artist} • {track.album?.name}</p>
                            </div>

                            <div className="w-16 mr-4">
                              <PopularityBar
                                popularity={track.popularity}
                                label=""
                                className="text-xs h-1"
                              />
                            </div>

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
              )}
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Custom hooks for Spotify data fetching with React Query
 * Provides caching, automatic retries, and error handling
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parseSpotifyError, SpotifyError } from '@/components/ErrorHandling';

export interface SpotifyUserProfile {
  display_name?: string;
  id?: string;
  country?: string;
  followers?: number;
  product?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  popularity: number;
  images?: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  album?: {
    name: string;
    release_date: string;
  };
  rank?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  popularity?: number;
  followers?: { total: number };
}

export interface SpotifyStats {
  averagePopularity?: number;
  totalTracksAnalyzed?: number;
  totalArtistsAnalyzed?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
  totalGenresFound?: number;
  playlistsAnalyzed?: number;
  followedArtistsCount?: number;
  recentTracksAnalyzed?: number;
  audioFeaturesCoverage?: number;
  dataCompletenessScore?: number;
  scopesWorking?: Record<string, boolean>;
}

export interface DiscoveryMetrics {
  mainstreamTaste?: number;
  undergroundTaste?: number;
  artistDiversity?: number;
  recentMusicLover?: number;
  vintageCollector?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
  artistLoyalty?: number;
  oldestTrackYear?: number;
  newestTrackYear?: number;
}

export interface SocialMetrics {
  followedArtistsCount?: number;
  playlistsOwned?: number;
  accountType?: string;
}

export interface ListeningHabits {
  peakListeningHour?: number;
  peakListeningDay?: string;
  preferredTimeOfDay?: string;
}

export interface ArtistAnalysis {
  totalUniqueArtists?: number;
  averagePopularity?: number;
  averageFollowers?: number;
  averageGenresPerArtist?: number;
  mostPopularArtist?: SpotifyArtist;
  biggestArtist?: SpotifyArtist;
}

export interface AlbumAnalysis {
  totalUniqueAlbums?: number;
  yearSpread?: number;
  averageReleaseYear?: number;
  albumTypes?: Record<string, number>;
  decadeDistribution?: Record<string, number>;
}

export interface SpotifyData {
  userProfile?: SpotifyUserProfile;
  topTracks?: SpotifyTrack[];
  topTracksByTimeRange?: Record<string, SpotifyTrack[]>;
  topArtists?: SpotifyArtist[];
  topArtistsByTimeRange?: Record<string, SpotifyArtist[]>;
  topGenres?: Array<{ genre: string; count?: number } | string>;
  stats?: SpotifyStats;
  mostPlayedSongs?: Record<string, SpotifyTrack[]>;
  listeningHabits?: ListeningHabits;
  allTracksData?: Array<{ id: string; name: string; album: { release_date: string } }>;
  discoveryMetrics?: DiscoveryMetrics;
  socialMetrics?: SocialMetrics;
  recentTracks?: Array<{ track: SpotifyTrack; played_at: string }>;
  playlists?: Array<{ id: string; name: string; tracks: { total: number }; public: boolean; description?: string; external_urls?: { spotify?: string } }>;
  followedArtists?: SpotifyArtist[];
  genreData?: Record<string, { count: number }>;
  artistAnalysis?: ArtistAnalysis;
  albumAnalysis?: AlbumAnalysis;
  timeRanges?: Record<string, { label: string; artists: SpotifyArtist[]; tracks: SpotifyTrack[] }>;
}

/**
 * Fetches Spotify data from the API with comprehensive error handling
 */
async function fetchSpotifyData(): Promise<SpotifyData> {
  const response = await fetch('/api/spotify/top-items', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Create error object with response details
    const errorData: {
      status: number;
      statusText: string;
      message?: string;
      error?: string;
      suggestions?: string[];
    } = {
      status: response.status,
      statusText: response.statusText,
    };

    // Try to get error details from response body
    try {
      const errorBody = await response.json() as { message?: string; error?: string; suggestions?: string[] };
      errorData.message = errorBody.message || errorBody.error || response.statusText;
      errorData.error = errorBody.error;
      errorData.suggestions = errorBody.suggestions;
    } catch {
      errorData.message = response.statusText;
    }

    throw errorData;
  }

  const data = await response.json() as SpotifyData & { error?: string };

  // Handle insufficient data case (not an error, but special case)
  if (data.error === 'insufficient_data') {
    throw data;
  }

  return data;
}

/**
 * Custom hook for Spotify data with React Query
 */
export function useSpotifyData(options?: Partial<UseQueryOptions<SpotifyData, SpotifyError>>) {
  return useQuery<SpotifyData, SpotifyError>({
    queryKey: ['spotify-data'],
    queryFn: fetchSpotifyData,

    // Caching configuration
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - data stays in cache for 30 minutes

    // Retry configuration
    retry: (failureCount, error: SpotifyError) => {
      // Don't retry auth errors or insufficient data errors
      if (error.type === 'auth' || error.type === 'insufficient_data') {
        return false;
      }
      // Retry network and API errors up to 3 times
      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.pow(2, attemptIndex) * 1000;
    },



    // Don't refetch on window focus by default (can be overridden)
    refetchOnWindowFocus: false,

    // Don't refetch on reconnect by default (can be overridden)
    refetchOnReconnect: true,

    // Transform errors to our SpotifyError format
    select: (data) => data,

    // Custom options can override defaults
    ...options,
  });
}

/**
 * Hook that returns the formatted error for display
 */
export function useSpotifyError(error: unknown): SpotifyError | null {
  if (!error) return null;
  return parseSpotifyError(error);
}

/**
 * Query key factory for consistent cache keys
 */
export const spotifyQueryKeys = {
  all: ['spotify'] as const,
  data: () => [...spotifyQueryKeys.all, 'data'] as const,
  topItems: () => [...spotifyQueryKeys.all, 'top-items'] as const,
} as const;

/**
 * Utility function to prefetch Spotify data
 */
export function prefetchSpotifyData(queryClient: { prefetchQuery: (options: { queryKey: readonly string[]; queryFn: () => Promise<SpotifyData>; staleTime: number }) => Promise<void> }) {
  return queryClient.prefetchQuery({
    queryKey: spotifyQueryKeys.data(),
    queryFn: fetchSpotifyData,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Utility function to invalidate and refetch Spotify data
 */
export function refetchSpotifyData(queryClient: { invalidateQueries: (options: { queryKey: readonly string[] }) => Promise<void> }) {
  return queryClient.invalidateQueries({
    queryKey: spotifyQueryKeys.all,
  });
}


/**
 * Custom hooks for Spotify data fetching with React Query
 * Provides caching, automatic retries, error handling, and performance optimizations
 */

import { useQuery, UseQueryOptions, useQueries } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
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
  artists?: Array<{ name: string }>;
  popularity: number;
  images?: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  album?: {
    name: string;
    release_date: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
  duration_ms?: number;
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
 * Performance logging utility
 */
const logPerformanceMetrics = (operation: string, startTime: number, endTime: number, dataSize?: number) => {
  if (process.env.NODE_ENV === 'development') {
    const duration = endTime - startTime;
    console.group(`🎵 Spotify API Performance - ${operation}`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);
    if (dataSize !== undefined) {
      console.log(`📦 Data size: ${dataSize} items`);
      console.log(`⚡ Throughput: ${(dataSize / duration * 1000).toFixed(2)} items/sec`);
    }
    console.log(`🕒 Timestamp: ${new Date(endTime).toISOString()}`);
    console.groupEnd();
  }
};

/**
 * Debounce utility for function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Fetches Spotify data from the API with comprehensive error handling and performance logging
 */
async function fetchSpotifyData(): Promise<SpotifyData> {
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  try {
    const response = await fetch('/api/spotify/top-items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics('API Error', startTime, endTime);
      }

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
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      // Calculate data size for performance metrics
      const dataSize = (data.topTracks?.length || 0) + (data.topArtists?.length || 0);
      logPerformanceMetrics('Data Fetch Success', startTime, endTime, dataSize);
    }

    // Handle insufficient data case (not an error, but special case)
    if (data.error === 'insufficient_data') {
      throw data;
    }

    return data;
  } catch (error) {
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics('Fetch Error', startTime, endTime);
    }
    throw error;
  }
}

/**
 * Fetches top tracks with performance optimization
 */
async function fetchTopTracks(timeRange: string = 'short_term'): Promise<SpotifyTrack[]> {
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  try {
    const response = await fetch(`/api/spotify/top-items?type=tracks&time_range=${timeRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top tracks: ${response.statusText}`);
    }

    const data = await response.json() as { topTracks: SpotifyTrack[] };
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics('Top Tracks Fetch', startTime, endTime, data.topTracks?.length);
    }
    return data.topTracks || [];
  } catch (error) {
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics('Top Tracks Error', startTime, endTime);
    }
    throw error;
  }
}

/**
 * Fetches top artists with performance optimization
 */
async function fetchTopArtists(timeRange: string = 'short_term'): Promise<SpotifyArtist[]> {
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  try {
    const response = await fetch(`/api/spotify/top-items?type=artists&time_range=${timeRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top artists: ${response.statusText}`);
    }

    const data = await response.json() as { topArtists: SpotifyArtist[] };
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics('Top Artists Fetch', startTime, endTime, data.topArtists?.length);
    }
    return data.topArtists || [];
  } catch (error) {
    const endTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics('Top Artists Error', startTime, endTime);
    }
    throw error;
  }
}

/**
 * Fetches tracks and artists in parallel for better performance
 */
async function fetchParallelSpotifyData(timeRange: string = 'short_term'): Promise<{
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
}> {
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  try {
    // Fetch tracks and artists in parallel using Promise.all
    const [topTracks, topArtists] = await Promise.all([
      fetchTopTracks(timeRange),
      fetchTopArtists(timeRange)
    ]);

  // Removed unused endTime variable
    if (process.env.NODE_ENV === 'development') {
      const parallelEndTime = performance.now();
      logPerformanceMetrics('Parallel Fetch Complete', startTime, parallelEndTime,
        (topTracks?.length || 0) + (topArtists?.length || 0));
    }

    return {
      topTracks,
      topArtists
    };
  } catch (error) {
    const endTime = performance.now();
    logPerformanceMetrics('Parallel Fetch Error', startTime, endTime);
    throw error;
  }
}

/**
 * Custom hook for Spotify data with React Query and performance optimizations
 */
export function useSpotifyData(options?: Partial<UseQueryOptions<SpotifyData, SpotifyError>>) {
  return useQuery<SpotifyData, SpotifyError>({
    queryKey: ['spotify-data'],
    queryFn: fetchSpotifyData,

    // Caching configuration - optimized for performance
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

    // Performance optimizations
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnReconnect: true,    // Refetch when connection is restored
    refetchOnMount: false,       // Use cached data on mount if available

    // Transform errors to our SpotifyError format
    select: (data) => data,

    // Custom options can override defaults
    ...options,
  });
}

/**
 * Optimized hook for parallel fetching of tracks and artists
 */
export function useParallelSpotifyData(timeRange: string = 'short_term') {
  return useQueries({
    queries: [
      {
        queryKey: ['spotify-tracks', timeRange],
        queryFn: () => fetchTopTracks(timeRange),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['spotify-artists', timeRange],
        queryFn: () => fetchTopArtists(timeRange),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    ],
  });
}

/**
 * Hook with debounced refetching to prevent excessive API calls
 */
export function useDebouncedSpotifyData(
  options?: Partial<UseQueryOptions<SpotifyData, SpotifyError>>,
  debounceDelay: number = 1000
) {
  const debouncedRefetchRef = useRef<() => void>();

  const query = useSpotifyData(options);

  // Create debounced refetch function
  const debouncedRefetch = useMemo(
    () => debounce(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Debounced refetch triggered');
      }
      query.refetch();
    }, debounceDelay),
    [query, debounceDelay]
  );

  // Store debounced function in ref for external access
  debouncedRefetchRef.current = debouncedRefetch;

  return {
    ...query,
    debouncedRefetch: useCallback(() => {
      debouncedRefetchRef.current?.();
    }, [])
  };
}

/**
 * Hook for optimized time range data fetching with caching
 */
export function useTimeRangeData(timeRanges: string[] = ['short_term', 'medium_term', 'long_term']) {
  const startTime = useRef(performance.now());

  const queries = useQueries({
    queries: timeRanges.map(timeRange => ({
      queryKey: ['spotify-parallel-data', timeRange],
      queryFn: () => fetchParallelSpotifyData(timeRange),
      staleTime: 10 * 60 * 1000, // 10 minutes for time range data
      gcTime: 60 * 60 * 1000,    // 1 hour cache
      refetchOnWindowFocus: false,
      enabled: true, // Always enabled for background prefetching
    }))
  });

  // Log performance when all queries complete
  const allLoaded = queries.every(q => !q.isLoading);
  const hasData = queries.some(q => q.data);

  if (allLoaded && hasData) {
    const endTime = performance.now();
    const totalItems = queries.reduce((sum, q) => {
      const data = q.data;
      return sum + (data?.topTracks?.length || 0) + (data?.topArtists?.length || 0);
    }, 0);

    logPerformanceMetrics('All Time Ranges Loaded', startTime.current, endTime, totalItems);
  }

  return {
    queries,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    data: queries.reduce((acc, query, index) => {
      if (query.data) {
        acc[timeRanges[index]] = query.data;
      }
      return acc;
    }, {} as Record<string, { topTracks: SpotifyTrack[]; topArtists: SpotifyArtist[] }>)
  };
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

import { useSession, signOut } from 'next-auth/react';
/**
 * Custom hook that signs out the user if the session has a refresh token error
 * Use this in your top-level component to force sign-out on token refresh failure
 */
import type { Session } from 'next-auth';
export function useSpotifySessionGuard() {
  const { data: session, status } = useSession() as { data: (Session & { error?: string }) | null, status: string };
  if (session && session.error === 'RefreshAccessTokenError') {
    // Optionally, show a toast or UI message here before sign out
    signOut({ callbackUrl: '/' });
  }
  return { session, status };
}

/**
 * Custom hooks for Spotify data fetching with React Query
 * Provides caching, automatic retries, error handling, and performance optimizations
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { SpotifyError } from '@/components/ErrorHandling';
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
async function fetchSpotifyData(timeRange: string = 'short_term'): Promise<SpotifyData> {
  try {
    const response = await fetch(`/api/spotify/top-items?time_range=${timeRange}`, {
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
      } catch {
        // ignore JSON parse error, use default errorData
      }
      throw errorData;
    }

    const data = await response.json() as SpotifyData & { error?: string };
    
    // Handle insufficient data case (not an error, but special case)
    if (data.error === 'insufficient_data') {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
}
export function useSpotifyData(timeRange: string = 'short_term', options?: Partial<UseQueryOptions<SpotifyData, SpotifyError>>) {
  return useQuery<SpotifyData, SpotifyError>({
    queryKey: ['spotify-data', timeRange],
    queryFn: async ({ queryKey }) => {
      const [, range] = queryKey as [string, string];
      return fetchSpotifyData(range || 'short_term');
    },

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




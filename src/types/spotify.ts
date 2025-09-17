export interface SpotifyTrack {
  id: string;
  name: string;
  artist?: string;
  artists?: Array<{ name: string }>;
  popularity: number;
  images?: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  // Optional fields present on some Spotify track objects
  duration_ms?: number;
  preview_url?: string | null;
  album?: {
    name: string;
    release_date: string;
    images: Array<{ url: string }>;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: Array<{ url: string }>;
  external_urls?: { spotify?: string };
  popularity?: number;
  followers?: { total: number } | number;
}

export interface MusicIntelligence {
  mainstreamTaste?: number;
  undergroundTaste?: number;
  artistDiversity?: number;
  recentMusicLover?: number;
  vintageCollector?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
  artistLoyalty?: number;
}

export interface SpotifyStats {
  averagePopularity?: number;
  totalTracksAnalyzed?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
}

export interface SpotifyUserProfile {
  display_name?: string;
  country?: string;
  followers?: { total: number };
  product?: string;
}

export interface SpotifyData {
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  topGenres: string[];
  musicIntelligence?: MusicIntelligence;
  stats?: SpotifyStats;
  userProfile?: SpotifyUserProfile;
  timeRange?: string;
}

export interface ConcertRecommendation {
  artist: string;
  venue: string;
  city: string;
  date: string;
  matchScore: number;
  reason: string;
  ticketUrl?: string;
}

export interface AIAnalysisRequest {
  spotifyData: SpotifyData;
  userLocation?: string;
  preferences: {
    includeConcerts: boolean;
    includeNewArtists: boolean;
    includePlaylistSuggestions: boolean;
    includeMoodAnalysis: boolean;
  };
}

export interface AIEnhancedInsights {
  concerts: ConcertRecommendation[];
  newArtists: string;
  moodAnalysis: string;
  playlists: string;
  funFacts: string[];
}

export interface AIAnalysisResponse {
  summary: string;
  enhanced: AIEnhancedInsights;
  confidence: number;
  timestamp: string;
  featuresUsed?: Record<string, boolean>;
}

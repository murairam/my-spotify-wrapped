import { useState } from 'react';
import { ItemSkeleton } from './LoadingSkeleton';
import { SpotifyArtist } from '@/hooks/useSpotifyData';

/**
 * Interface for artists data organized by time range
 */
interface ArtistsData {
  short_term?: SpotifyArtist[];
  medium_term?: SpotifyArtist[];
  long_term?: SpotifyArtist[];
}

/**
 * Props for the TopArtists component
 */
interface TopArtistsProps {
  /** Artists data organized by time ranges, or fallback array */
  topArtistsByTimeRange?: ArtistsData;
  /** Fallback artists array if time range data is not available */
  topArtists?: SpotifyArtist[];
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * TopArtists Component
 *
 * Displays the user's top artists with time range selection and interactive elements.
 * Shows artist ranking, profile image, name, genres, and links to Spotify.
 *
 * @param props - The component props
 * @param props.topArtistsByTimeRange - Artists data organized by time ranges
 * @param props.topArtists - Fallback artists array
 * @param props.className - Additional CSS classes
 * @returns JSX element displaying the top artists section
 */
export default function TopArtists({
  topArtistsByTimeRange,
  topArtists = [],
  className = "",
  isLoading = false
}: TopArtistsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("short_term");

  // Get artists for the selected time range or fall back to topArtists
  const currentArtists = topArtistsByTimeRange?.[selectedTimeRange as keyof ArtistsData] || topArtists || [];

  return (
    <div className={`bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl ${className}`}>
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎤</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Top Artists</h2>
        </div>
        <select
          className="bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none w-full sm:w-auto min-h-[44px] touch-manipulation"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option value="short_term">📅 Last 4 Weeks</option>
          <option value="medium_term">📊 Last 6 Months</option>
          <option value="long_term">🏆 ~1 Year of Data</option>
        </select>
      </div>

      {/* Artists list */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          // Show loading skeletons
          [...Array(5)].map((_, index) => (
            <ItemSkeleton key={`artist-skeleton-${index}`} />
          ))
        ) : (
          currentArtists.slice(0, 5).map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-all"
            >
              {/* Rank number */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                {index + 1}
              </div>

              {/* Artist profile image */}
              {artist.images?.[2] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.images[2].url}
                  alt={artist.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                />
              )}

              {/* Artist info and Spotify link */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm sm:text-lg">
                  <div className="truncate">{artist.name}</div>
                  {artist.external_urls?.spotify && (
                    <a
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[32px] touch-manipulation"
                    >
                      <span className="mr-1">🎤</span>
                      <span className="hidden sm:inline">Spotify</span>
                      <span className="sm:hidden">🎵</span>
                    </a>
                  )}
                </div>
                <div className="text-gray-300 text-xs sm:text-sm truncate">
                  {artist.genres?.slice(0, 2).join(", ") || "No genres"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

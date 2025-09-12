import { useState } from 'react';
import { FaMicrophone, FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import Image from 'next/image';
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
 * Props for the EnhancedTopArtists component
 */
interface EnhancedTopArtistsProps {
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
 * Enhanced TopArtists Component
 *
 * Features improved visual hierarchy with:
 * - Clean grid layout for artist cards
 * - Show top 5 by default, expandable to top 10
 * - Artist cards with images, names, and play counts
 * - Clear section headings and consistent spacing
 */
export default function EnhancedTopArtists({
  topArtistsByTimeRange,
  topArtists = [],
  className = "",
  isLoading = false
}: EnhancedTopArtistsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("short_term");
  const [showAll, setShowAll] = useState(false);

  // Get artists for the selected time range or fall back to topArtists
  const currentArtists = topArtistsByTimeRange?.[selectedTimeRange as keyof ArtistsData] || topArtists;

  // Limit to top 5 by default, show all (up to 10) when expanded
  const displayedArtists = showAll ? currentArtists.slice(0, 10) : currentArtists.slice(0, 5);
  const hasMoreArtists = currentArtists.length > 5;

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaMicrophone className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Your Top Artists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-xl animate-pulse">
              <div className="w-16 h-16 bg-gray-600 rounded-full mb-3"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header with Clear Typography */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaMicrophone className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Your Top Artists</h2>
        </div>

        {/* Time Range Selector */}
        {topArtistsByTimeRange && (
          <div className="flex bg-white/10 rounded-full p-1">
            {[
              { key: "short_term", label: "4 weeks" },
              { key: "medium_term", label: "6 months" },
              { key: "long_term", label: "All time" }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedTimeRange(key)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedTimeRange === key
                    ? "bg-[#1DB954] text-white font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Artists Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {displayedArtists.map((artist, index) => (
          <div
            key={artist.id}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all duration-200 group"
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#1DB954] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {/* Artist Image */}
                {artist.images && artist.images.length > 0 && (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  />
                )}
              </div>
              {/* Popularity Score */}
              <div className="text-right">
                <div className="text-xs text-gray-400">Popularity</div>
                <div className="text-sm font-bold text-[#1DB954]">{artist.popularity}/100</div>
              </div>
            </div>

            {/* Artist Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg truncate group-hover:text-[#1DB954] transition-colors">
                {artist.name}
              </h3>

              {/* Genres as Pills */}
              <div className="flex flex-wrap gap-1">
                {artist.genres?.slice(0, 2).map((genre, genreIndex) => (
                  <span
                    key={genreIndex}
                    className="bg-[#1DB954]/20 text-[#1DB954] px-2 py-1 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Spotify Link */}
              {artist.external_urls?.spotify && (
                <a
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#1DB954] transition-colors mt-2"
                >
                  <span>Listen on Spotify</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreArtists && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full transition-all font-medium"
          >
            {showAll ? <FaEyeSlash /> : <FaEye />}
            {showAll ? `Show Less` : `Show More (${currentArtists.length - 5} more)`}
          </button>
        </div>
      )}
    </div>
  );
}

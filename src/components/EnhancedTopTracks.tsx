import { useState } from 'react';
import { FaMusic, FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import Image from 'next/image';
import PopularityBar from './PopularityBar';
import { SpotifyTrack } from '@/hooks/useSpotifyData';

/**
 * Interface for tracks data organized by time range
 */
interface TracksData {
  short_term?: SpotifyTrack[];
  medium_term?: SpotifyTrack[];
  long_term?: SpotifyTrack[];
}

/**
 * Props for the EnhancedTopTracks component
 */
interface EnhancedTopTracksProps {
  /** Tracks data organized by time ranges, or fallback array */
  topTracksByTimeRange?: TracksData;
  /** Fallback tracks array if time range data is not available */
  topTracks?: SpotifyTrack[];
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * Enhanced TopTracks Component
 *
 * Features improved visual hierarchy with:
 * - Clean grid layout for track cards
 * - Show top 5 by default, expandable to top 10
 * - Track cards with album artwork, names, and popularity
 * - Clear section headings and consistent spacing
 */
export default function EnhancedTopTracks({
  topTracksByTimeRange,
  topTracks = [],
  className = "",
  isLoading = false
}: EnhancedTopTracksProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("short_term");
  const [showAll, setShowAll] = useState(false);

  // Get tracks for the selected time range or fall back to topTracks
  const currentTracks = topTracksByTimeRange?.[selectedTimeRange as keyof TracksData] || topTracks;

  // Limit to top 5 by default, show all (up to 10) when expanded
  const displayedTracks = showAll ? currentTracks.slice(0, 10) : currentTracks.slice(0, 5);
  const hasMoreTracks = currentTracks.length > 5;

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaMusic className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Your Top Tracks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-xl animate-pulse">
              <div className="w-16 h-16 bg-gray-600 rounded mb-3"></div>
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
          <FaMusic className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Your Top Tracks</h2>
        </div>

        {/* Time Range Selector */}
        {topTracksByTimeRange && (
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

      {/* Tracks Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {displayedTracks.map((track, index) => (
          <div
            key={track.id}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all duration-200 group"
          >
            {/* Rank Badge and Album Art */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#1DB954] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {/* Album Artwork */}
                {track.images && track.images.length > 0 && (
                  <Image
                    src={track.images[0].url}
                    alt={track.album?.name || track.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded object-cover border-2 border-white/20"
                  />
                )}
              </div>
              {/* Popularity Score */}
              <div className="text-right">
                <div className="text-xs text-gray-400">Popularity</div>
                <div className="text-sm font-bold text-[#1DB954]">{track.popularity}/100</div>
              </div>
            </div>

            {/* Track Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-lg leading-tight group-hover:text-[#1DB954] transition-colors line-clamp-2">
                {track.name}
              </h3>

              <p className="text-gray-300 text-sm truncate">
                by {track.artist}
              </p>

              {track.album && (
                <p className="text-gray-400 text-xs truncate">
                  {track.album.name}
                </p>
              )}

              {/* Popularity Bar */}
              <div className="mt-3">
                <PopularityBar
                  popularity={track.popularity}
                  className="h-2"
                />
              </div>

              {/* Spotify Link */}
              {track.external_urls?.spotify && (
                <a
                  href={track.external_urls.spotify}
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
      {hasMoreTracks && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full transition-all font-medium"
          >
            {showAll ? <FaEyeSlash /> : <FaEye />}
            {showAll ? `Show Less` : `Show More (${currentTracks.length - 5} more)`}
          </button>
        </div>
      )}
    </div>
  );
}

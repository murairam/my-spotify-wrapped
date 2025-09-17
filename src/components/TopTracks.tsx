// Removed useState for centralized time range
// Replaced emojis with FontAwesome icons for Spotify design compliance
import { FaMusic } from 'react-icons/fa';
import PopularityBar from './PopularityBar';
import { ItemSkeleton } from './LoadingSkeleton';
import Image from 'next/image';

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
 * Props for the TopTracks component
 */
interface TopTracksProps {
  /** Tracks data organized by time ranges, or fallback array */
  topTracksByTimeRange?: TracksData;
  /** Fallback tracks array if time range data is not available */
  topTracks?: SpotifyTrack[];
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Centralized time range key */
  timeRange: 'short_term' | 'medium_term' | 'long_term';
}

/**
 * TopTracks Component
 *
 * Displays the user's top tracks with time range selection and interactive elements.
 * Shows track ranking, artwork, name, artist, and popularity with links to Spotify.
 *
 * @param props - The component props
 * @param props.topTracksByTimeRange - Tracks data organized by time ranges
 * @param props.topTracks - Fallback tracks array
 * @param props.className - Additional CSS classes
 * @returns JSX element displaying the top tracks section
 */
export default function TopTracks({
  topTracksByTimeRange,
  topTracks = [],
  className = "",
  isLoading = false,
  timeRange
}: TopTracksProps) {
  // Get tracks for the centralized time range or fall back to topTracks
  const currentTracks = topTracksByTimeRange?.[timeRange as keyof TracksData] || topTracks || [];

  return (
    <div className={`bg-gradient-to-b from-[#0f1112] to-[#121212] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-2xl ${className}`}>
      {/* Header with centralized time range label */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
            <FaMusic />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Top Tracks</h2>
        </div>
        <span className="text-gray-400 text-sm">
          {timeRange === 'short_term' && 'Last 4 Weeks'}
          {timeRange === 'medium_term' && 'Last 6 Months'}
          {timeRange === 'long_term' && 'Last Year'}
        </span>
      </div>

      {/* Tracks list */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          // Show loading skeletons
          [...Array(5)].map((_, index) => (
            <ItemSkeleton key={`track-skeleton-${index}`} />
          ))
        ) : (
          currentTracks.slice(0, 10).map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg transition-all ${index < 3 ? 'bg-gradient-to-r from-[#122214] to-[#07120a] shadow-lg transform hover:scale-[1.02] md:p-6' : 'bg-black/20 hover:bg-black/40'}`}
            >
              {/* Rank number */}
              <div className={`${index < 3 ? 'w-10 h-10 sm:w-14 sm:h-14 text-xl' : 'w-6 h-6 sm:w-8 sm:h-8 text-xs'} bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {index + 1}
              </div>

              {/* Track artwork */}
              {track.images?.[2] && (
                <Image
                  src={track.images[2].url}
                  alt={track.name}
                  width={index < 3 ? 96 : 56}
                  height={index < 3 ? 96 : 56}
                  className={`${index < 3 ? 'w-24 h-24' : 'w-12 h-12 sm:w-14 sm:h-14'} rounded-lg object-cover flex-shrink-0 shadow-lg`}
                />
              )}

              {/* Track info and Spotify link */}
              <div className="flex-1 min-w-0">
                <div className={`${index < 3 ? 'font-bold text-xl' : 'font-semibold text-white text-sm sm:text-lg'}`}>
                  <div className="truncate">{track.name}</div>
                  {track.external_urls?.spotify && (
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 sm:px-3 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-medium rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[32px] sm:min-h-[28px] touch-manipulation"
                    >
                      <FaMusic className="mr-1" />
                      <span className="hidden sm:inline">Open in Spotify</span>
                      <span className="sm:hidden">Spotify</span>
                    </a>
                  )}
                </div>
                <div className={`${index < 3 ? 'text-gray-200 text-sm' : 'text-gray-200 text-sm truncate'}`}>{track.artist}</div>
              </div>

              {/* Popularity bar */}
              <div className="w-24 sm:w-32 flex-shrink-0">
                <PopularityBar
                  popularity={track.popularity}
                  label="Popularity"
                  className="p-2"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

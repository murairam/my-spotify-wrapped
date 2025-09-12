import { useState } from 'react';
import Image from 'next/image';
import { FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Interface for top items (tracks or artists)
 */
export interface TopItem {
  id: string;
  name: string;
  artist?: string; // For tracks
  plays?: number;
  popularity?: number;
  image?: string;
  rank: number;
  external_urls?: { spotify?: string };
}

/**
 * Props for the TopItemsSection component
 */
interface TopItemsSectionProps {
  /** Section title */
  title: string;
  /** Array of top items to display */
  items: TopItem[];
  /** React icon component for the section */
  icon: React.ReactNode;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TopItemsSection Component
 *
 * A reusable component for displaying top tracks/artists with:
 * - Cards with images, names, and play counts/popularity
 * - Show top 5 by default, expandable to show all
 * - Responsive grid layout
 * - Spotify links and visual feedback
 */
export const TopItemsSection = ({
  title,
  items,
  icon,
  isLoading = false,
  className = ""
}: TopItemsSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  // Show top 5 by default, all when expanded
  const displayedItems = showAll ? items : items.slice(0, 5);
  const hasMoreItems = items.length > 5;

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3 text-[#1DB954]">{icon}</div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white/5 p-3 rounded-xl animate-pulse">
              <div className="w-full h-24 bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded mb-1"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3 text-[#1DB954]">{icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Showing {displayedItems.length} of {items.length} items
            </p>
          </div>
        </div>
      </div>

      {/* Items Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all duration-200 group"
          >
            {/* Rank Badge */}
            <div className="relative mb-3">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#1DB954] text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {item.rank}
              </div>

              {/* Item Image */}
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="w-full h-24 object-cover rounded-lg border-2 border-white/20"
                />
              )}
            </div>

            {/* Item Info */}
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-[#1DB954] transition-colors">
                {item.name}
              </h3>

              {item.artist && (
                <p className="text-gray-300 text-xs line-clamp-1">
                  by {item.artist}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                {item.plays && (
                  <span className="text-[#1DB954] font-medium">
                    {item.plays} plays
                  </span>
                )}
                {item.popularity && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.popularity > 70
                      ? 'bg-green-500/20 text-green-400'
                      : item.popularity > 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.popularity}/100
                  </span>
                )}
              </div>

              {/* Spotify Link */}
              {item.external_urls?.spotify && (
                <a
                  href={item.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#1DB954] transition-colors mt-2"
                >
                  <span>Listen</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreItems && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full transition-all font-medium text-sm"
          >
            {showAll ? 'Show Less' : `Show More (${items.length - 5} more)`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">Listen to more music to see your top {title.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
};

import { FaPalette } from 'react-icons/fa';

/**
 * Props for the EnhancedMusicDNA component
 */
interface EnhancedMusicDNAProps {
  /** Array of genre strings */
  genres?: string[];
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * Enhanced Music DNA Component
 *
 * Features improved visual hierarchy with:
 * - Genre tags as colored bubbles/pills with proportional sizing
 * - Clear section heading with genre count
 * - Responsive flex wrap layout
 * - Spotify green gradient background for enhanced visual appeal
 */
export default function EnhancedMusicDNA({
  genres = [],
  className = "",
  isLoading = false
}: EnhancedMusicDNAProps) {

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaPalette className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Music DNA</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array(8).fill(0).map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-600 rounded-full animate-pulse"
              style={{ width: Math.random() * 60 + 60 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Generate different colors for genre pills
  const genreColors = [
    'bg-gradient-to-r from-[#1DB954] to-[#1ed760]', // Spotify green
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-orange-500 to-orange-600',
    'bg-gradient-to-r from-teal-500 to-teal-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-yellow-500 to-yellow-600',
    'bg-gradient-to-r from-cyan-500 to-cyan-600'
  ];

  // Calculate size based on position (earlier genres are more prominent)
  const getGenreSize = (index: number) => {
    if (index === 0) return 'text-lg px-4 py-2'; // Largest for top genre
    if (index < 3) return 'text-base px-3 py-2'; // Medium for top 3
    if (index < 6) return 'text-sm px-3 py-1'; // Smaller for next 3
    return 'text-xs px-2 py-1'; // Smallest for the rest
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header with Clear Typography */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaPalette className="text-2xl mr-3 text-[#1DB954]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Music DNA</h2>
            <p className="text-sm text-gray-400 mt-1">
              {genres.length} genres discovered
            </p>
          </div>
        </div>
      </div>

      {/* Genre Bubbles - Responsive Flex Layout */}
      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {genres.slice(0, 15).map((genre, index) => (
            <div
              key={genre}
              className={`
                ${genreColors[index % genreColors.length]}
                ${getGenreSize(index)}
                text-white font-medium rounded-full
                shadow-lg hover:shadow-xl transform hover:scale-105
                transition-all duration-200 cursor-default
                border border-white/20
              `}
              title={`Genre: ${genre}`}
            >
              <span className="drop-shadow-sm">
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </span>
            </div>
          ))}

          {/* Show count if there are more genres */}
          {genres.length > 15 && (
            <div className="flex items-center px-3 py-1 bg-white/20 text-white/80 rounded-full text-xs font-medium">
              +{genres.length - 15} more
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">No genre data available</p>
          <p className="text-sm">Listen to more music to discover your Music DNA</p>
        </div>
      )}

      {/* Key Insights */}
      {genres.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[#1DB954]/10 to-[#1ed760]/10 rounded-xl border border-[#1DB954]/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold text-sm">Your Top Genre</h4>
              <p className="text-[#1DB954] font-bold text-lg capitalize">
                {genres[0]}
              </p>
            </div>
            {genres.length > 1 && (
              <div className="text-right">
                <p className="text-gray-400 text-xs">Genre Diversity</p>
                <p className="text-white font-bold">
                  {genres.length > 10 ? 'Very High' : genres.length > 5 ? 'High' : 'Moderate'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

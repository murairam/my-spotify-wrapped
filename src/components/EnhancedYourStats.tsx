import { FaChartBar, FaFire, FaMusic, FaMicrophone, FaUsers, FaCompactDisc } from 'react-icons/fa';

/**
 * Interface for Spotify statistics
 */
interface SpotifyStats {
  averagePopularity?: number;
  totalTracksAnalyzed?: number;
  totalArtistsAnalyzed?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
  totalGenresFound?: number;
  playlistsAnalyzed?: number;
  followedArtistsCount?: number;
}

/**
 * Props for the EnhancedYourStats component
 */
interface EnhancedYourStatsProps {
  /** Spotify statistics object */
  stats?: SpotifyStats;
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * Enhanced Your Stats Component
 *
 * Features improved visual hierarchy with:
 * - Key stats highlighted with larger fonts and icons
 * - Grid layout for consistent spacing
 * - Visual indicators and personality insights
 * - Responsive design with clear data presentation
 */
export default function EnhancedYourStats({
  stats,
  className = "",
  isLoading = false
}: EnhancedYourStatsProps) {

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaChartBar className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Your Stats</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-6 bg-gray-600 rounded mb-2 w-2/3"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Helper function to get personality insight based on popularity
  const getPopularityInsight = (popularity: number) => {
    if (popularity >= 75) return { text: "Mainstream Explorer", color: "text-orange-400" };
    if (popularity >= 60) return { text: "Balanced Taste", color: "text-blue-400" };
    if (popularity >= 45) return { text: "Indie Enthusiast", color: "text-purple-400" };
    return { text: "Underground Discoverer", color: "text-green-400" };
  };

  // Helper function to get collection size insight
  const getCollectionInsight = (tracks: number) => {
    if (tracks >= 100) return { text: "Music Collector", color: "text-yellow-400" };
    if (tracks >= 50) return { text: "Active Listener", color: "text-blue-400" };
    if (tracks >= 20) return { text: "Casual Explorer", color: "text-green-400" };
    return { text: "Getting Started", color: "text-gray-400" };
  };

  const popularityInsight = getPopularityInsight(stats?.averagePopularity || 0);
  const collectionInsight = getCollectionInsight(stats?.totalTracksAnalyzed || 0);

  // Define stat items with enhanced visual presentation
  const statItems = [
    {
      icon: FaFire,
      label: "Average Popularity",
      value: `${stats?.averagePopularity || 0}/100`,
      subtitle: popularityInsight.text,
      color: "text-orange-500",
      bgColor: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30"
    },
    {
      icon: FaMusic,
      label: "Tracks Analyzed",
      value: `${stats?.totalTracksAnalyzed || 0}`,
      subtitle: collectionInsight.text,
      color: "text-blue-500",
      bgColor: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: FaMicrophone,
      label: "Artists Analyzed",
      value: `${stats?.totalArtistsAnalyzed || 0}`,
      subtitle: "Unique artists",
      color: "text-purple-500",
      bgColor: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30"
    },
    {
      icon: FaUsers,
      label: "Genre Diversity",
      value: `${stats?.totalGenresFound || 0}`,
      subtitle: "Genres discovered",
      color: "text-green-500",
      bgColor: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: FaCompactDisc,
      label: "Unique Albums",
      value: `${stats?.uniqueAlbumsCount || 0}`,
      subtitle: "Album collection",
      color: "text-pink-500",
      bgColor: "from-pink-500/20 to-pink-600/20",
      borderColor: "border-pink-500/30"
    },
    {
      icon: FaUsers,
      label: "Unique Artists",
      value: `${stats?.uniqueArtistsCount || 0}`,
      subtitle: "Artist range",
      color: "text-teal-500",
      bgColor: "from-teal-500/20 to-teal-600/20",
      borderColor: "border-teal-500/30"
    }
  ];

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header with Clear Typography */}
      <div className="flex items-center mb-6">
        <FaChartBar className="text-2xl mr-3 text-[#1DB954]" />
        <div>
          <h2 className="text-2xl font-bold text-white">Your Stats</h2>
          <p className="text-sm text-gray-400 mt-1">
            Your music listening analytics
          </p>
        </div>
      </div>

      {/* Stats Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={`
                bg-gradient-to-br ${item.bgColor}
                border ${item.borderColor}
                p-4 rounded-xl
                hover:bg-white/10 transition-all duration-200
                group cursor-default
              `}
            >
              {/* Icon and Value */}
              <div className="flex items-center justify-between mb-3">
                <IconComponent className={`text-2xl ${item.color}`} />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white group-hover:text-[#1DB954] transition-colors">
                    {item.value}
                  </div>
                </div>
              </div>

              {/* Label and Subtitle */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">
                  {item.label}
                </h4>
                <p className={`text-xs ${popularityInsight.color}`}>
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights Summary */}
      {stats && (
        <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#1ed760]/10 rounded-xl border border-[#1DB954]/20 p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <FaFire className="mr-2 text-[#1DB954]" />
            Your Music Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Listening Style:</span>
              <span className={`font-semibold ${popularityInsight.color}`}>
                {popularityInsight.text}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Collection Size:</span>
              <span className={`font-semibold ${collectionInsight.color}`}>
                {collectionInsight.text}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Music Diversity:</span>
              <span className="font-semibold text-[#1DB954]">
                {(stats.totalGenresFound || 0) > 10 ? "Very High" :
                 (stats.totalGenresFound || 0) > 5 ? "High" : "Moderate"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Artist Discovery:</span>
              <span className="font-semibold text-purple-400">
                {((stats.uniqueArtistsCount || 0) / (stats.totalTracksAnalyzed || 1) * 100).toFixed(0)}% unique
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

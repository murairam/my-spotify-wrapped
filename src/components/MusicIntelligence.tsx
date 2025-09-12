import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faUsers, faSearch, faChartLine } from '@fortawesome/free-solid-svg-icons';

interface DiscoveryMetrics {
  mainstreamTaste?: number;
  artistDiversity?: number;
  vintageCollector?: number;
  undergroundTaste?: number;
  recentMusicLover?: number;
  uniqueArtistsCount?: number;
  uniqueAlbumsCount?: number;
  artistLoyalty?: number;
  oldestTrackYear?: number;
  newestTrackYear?: number;
}

interface SocialMetrics {
  followedArtistsCount?: number;
  playlistsOwned?: number;
  accountType?: string;
}

interface MusicIntelligenceProps {
  discoveryMetrics?: DiscoveryMetrics;
  socialMetrics?: SocialMetrics;
  isLoading?: boolean;
  className?: string;
}

const getListenerType = (mainstreamTaste: number): { type: string; color: string } => {
  if (mainstreamTaste >= 75) {
    return { type: 'Mainstream Explorer', color: 'text-blue-400' };
  } else if (mainstreamTaste >= 50) {
    return { type: 'Balanced Listener', color: 'text-green-400' };
  } else if (mainstreamTaste >= 25) {
    return { type: 'Indie Enthusiast', color: 'text-purple-400' };
  } else {
    return { type: 'Underground Discoverer', color: 'text-orange-400' };
  }
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
            <div className="h-4 bg-white/20 rounded w-24"></div>
          </div>
          <div className="h-6 bg-white/20 rounded w-32 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

const MusicIntelligence: React.FC<MusicIntelligenceProps> = ({
  discoveryMetrics,
  socialMetrics,
  isLoading = false,
  className = ''
}) => {
  if (isLoading || !discoveryMetrics || !socialMetrics) {
    return (
      <div className={`bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <FontAwesomeIcon icon={faBrain} className="text-[#1DB954] text-xl" />
          <h2 className="text-xl font-bold text-white">Music Intelligence</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  const listenerType = getListenerType(discoveryMetrics.mainstreamTaste ?? 0);

  return (
    <div className={`bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faBrain} className="text-[#1DB954] text-xl" />
        <h2 className="text-xl font-bold text-white">Music Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Listener Type */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faSearch} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Listener Type</span>
          </div>
          <div className={`text-xl font-bold ${listenerType.color} mb-2`}>
            {listenerType.type}
          </div>
          <div className="text-white/60 text-sm">
            {discoveryMetrics.mainstreamTaste ?? 0}% mainstream taste
          </div>
        </div>

        {/* Artist Diversity */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Artist Diversity</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {discoveryMetrics.artistDiversity ?? 0}
          </div>
          <div className="text-white/60 text-sm">
            Unique artists in your top tracks
          </div>
        </div>

        {/* Vintage Collector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Vintage Collector</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {discoveryMetrics.vintageCollector ?? 0}%
          </div>
          <div className="text-white/60 text-sm">
            Tracks released before 2010
          </div>
        </div>

        {/* Underground Taste */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Underground Taste</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {discoveryMetrics.undergroundTaste ?? 0}%
          </div>
          <div className="text-white/60 text-sm">
            Tracks with popularity &lt; 40
          </div>
        </div>

        {/* Recent Music Lover */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Recent Music Lover</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {discoveryMetrics.recentMusicLover ?? 0}%
          </div>
          <div className="text-white/60 text-sm">
            Tracks released after 2020
          </div>
        </div>

        {/* Unique Albums */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Unique Albums</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {discoveryMetrics.uniqueAlbumsCount ?? 0}
          </div>
          <div className="text-white/60 text-sm">
            Distinct albums in your top tracks
          </div>
        </div>

        {/* Followed Artists */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faUsers} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Following</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {(socialMetrics.followedArtistsCount ?? 0).toLocaleString()}
          </div>
          <div className="text-white/60 text-sm">
            Artists followed
          </div>
        </div>

        {/* Playlists Created */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faBrain} className="text-[#1DB954] text-lg" />
            <span className="text-white/80 font-medium">Curator</span>
          </div>
          <div className="text-xl font-bold text-white mb-2">
            {socialMetrics.playlistsOwned ?? 0}
          </div>
          <div className="text-white/60 text-sm">
            Playlists created
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicIntelligence;

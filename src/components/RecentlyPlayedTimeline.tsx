'use client';

import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faSpinner, faMusic, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface RecentTrack {
  track?: {
    id: string;
    name: string;
    artists?: Array<{ name: string }>;
    album?: {
      name: string;
      images: Array<{ url: string; height?: number; width?: number }>;
    };
    duration_ms?: number;
    external_urls?: { spotify?: string };
  };
  played_at: string;
}

interface RecentlyPlayedTimelineProps {
  recentTracks?: RecentTrack[] | null;
  isLoading?: boolean;
}

const RecentlyPlayedTimeline: React.FC<RecentlyPlayedTimelineProps> = ({
  recentTracks,
  isLoading = false,
}) => {
  const processedTracks = useMemo(() => {
    if (!recentTracks || !Array.isArray(recentTracks)) return [];

    return recentTracks.slice(0, 20).map((item, index) => {
      if (!item.track) return null;

      const track = item.track;
      const playedAt = new Date(item.played_at);
      const now = new Date();
      const timeDiff = now.getTime() - playedAt.getTime();

      // Format time ago
      let timeAgo = '';
      if (timeDiff < 60000) { // Less than 1 minute
        timeAgo = 'Just now';
      } else if (timeDiff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(timeDiff / 60000);
        timeAgo = `${minutes}m ago`;
      } else if (timeDiff < 86400000) { // Less than 1 day
        const hours = Math.floor(timeDiff / 3600000);
        timeAgo = `${hours}h ago`;
      } else {
        const days = Math.floor(timeDiff / 86400000);
        timeAgo = `${days}d ago`;
      }

      // Format duration
      const minutes = track.duration_ms ? Math.floor(track.duration_ms / 60000) : 0;
      const seconds = track.duration_ms ? Math.floor((track.duration_ms % 60000) / 1000) : 0;
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Get album image
  const albumImage = track.album?.images?.find(img => img.height && img.height >= 64) ||
        track.album?.images?.[0] ||
        null;

      return {
        id: track.id || `track-${index}`,
        uniqueKey: `${track.id}-${item.played_at}-${index}`, // Unique key for React rendering
        name: track.name,
        artists: track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration,
        timeAgo,
        albumImage: albumImage?.url,
        spotifyUrl: track.external_urls?.spotify,
        playedAt: playedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }).filter(Boolean);
  }, [recentTracks]);

  if (isLoading) {
    return (
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faClock} className="text-[#1DB954] text-xl" />
            <h3 className="text-xl font-bold text-white">Recently Played</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <FontAwesomeIcon icon={faSpinner} className="text-[#1DB954] text-2xl animate-spin" />
        </div>
      </div>
    );
  }

  if (processedTracks.length === 0) {
    return (
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faClock} className="text-[#1DB954] text-xl" />
            <h3 className="text-xl font-bold text-white">Recently Played</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faMusic} className="text-white/30 text-4xl mb-4" />
          <p className="text-white/70 mb-2">No recent listening history available</p>
          <p className="text-white/50 text-sm">
            Start playing music on Spotify to see your recent tracks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faClock} className="text-[#1DB954] text-xl" />
          <h3 className="text-xl font-bold text-white">Recently Played</h3>
        </div>
        <div className="text-sm text-white/60">
          Last 20 tracks
        </div>
      </div>

      {/* Desktop: Horizontal scroll timeline */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {processedTracks.map((track, index) => (
              <div
                key={track?.uniqueKey || `desktop-${index}`}
                className="flex-shrink-0 w-64 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    {track?.albumImage ? (
                      <Image
                        src={track.albumImage}
                        alt={track.album}
                        width={48}
                        height={48}
                        className="rounded-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faMusic} className="text-white/50 text-lg" />
                      </div>
                    )}
                    {track?.spotifyUrl && (
                      <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlayCircle} className="text-white text-xl" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium text-sm truncate" title={track?.name}>
                      {track?.name}
                    </div>
                    <div className="text-white/70 text-xs truncate" title={track?.artists}>
                      {track?.artists}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-[#1DB954]">{track?.timeAgo}</span>
                      <span className="text-white/50">{track?.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical stack */}
      <div className="sm:hidden space-y-3">
        {processedTracks.slice(0, 10).map((track, index) => (
          <div
            key={track?.uniqueKey || `mobile-${index}`}
            className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex-shrink-0">
              {track?.albumImage ? (
                <Image
                  src={track.albumImage}
                  alt={track.album}
                  width={40}
                  height={40}
                  className="rounded-md"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
                  <FontAwesomeIcon icon={faMusic} className="text-white/50" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {track?.name}
              </div>
              <div className="text-white/70 text-xs truncate">
                {track?.artists}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-[#1DB954] text-xs">{track?.timeAgo}</div>
              <div className="text-white/50 text-xs">{track?.duration}</div>
            </div>
          </div>
        ))}

        {processedTracks.length > 10 && (
          <div className="text-center pt-2">
            <div className="text-white/50 text-sm">
              +{processedTracks.length - 10} more tracks
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyPlayedTimeline;

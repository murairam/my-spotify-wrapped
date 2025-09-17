import React, { useState, useEffect } from 'react';
import { useSpotifySessionGuard } from '@/hooks/useSpotifyData';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { FaMusic, FaMicrophone, FaPalette, FaBrain, FaChartLine, FaUsers, FaCrown, FaUser, FaPlay, FaHeart, FaClock, FaCalendarAlt, FaSignOutAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { getDataForTimeRange, MockSpotifyData, convertMockToSpotifyData } from '@/lib/mockData';
import { getRecentlyPlayedForTimeRange } from '@/lib/mockRecentlyPlayed';
import type { SpotifyData } from '@/types/spotify';
import AIIntelligenceSection from './ai/AIIntelligenceSection';
import RecentlyPlayedTimeline from './RecentlyPlayedTimeline';
import type { SpotifyData as HookSpotifyData } from '@/hooks/useSpotifyData';
import { useSpotifyData } from '@/hooks/useSpotifyData';


const TIME_RANGES = [
  { key: 'short_term', label: 'Last 4 Weeks' },
  { key: 'medium_term', label: 'Last 6 Months' },
  { key: 'long_term', label: 'Last Year' } // Spotify's 'long_term' is ~1 year of data
] as const;
type TimeRangeKey = typeof TIME_RANGES[number]['key'];

interface DashboardProps {
  isDemo?: boolean;
  onLogout?: () => void;
  spotifyData?: MockSpotifyData;
  timeRange?: TimeRangeKey;
  onTimeRangeChange?: (range: TimeRangeKey) => void;
}

export default function Dashboard({ isDemo = false, onLogout, spotifyData, timeRange = 'short_term', onTimeRangeChange }: DashboardProps) {
  // Guard: sign out if session has refresh error
  useSpotifySessionGuard();
  const [currentData, setCurrentData] = useState<MockSpotifyData | null>(null);

  // Use React Query hook to fetch spotify data and expose loading state when not in demo mode
  const { data: hookData, isLoading: hookLoading } = useSpotifyData(timeRange);

  useEffect(() => {
    if (isDemo && onTimeRangeChange) {
      setCurrentData(getDataForTimeRange(timeRange));
      return;
    }

    // Prefer explicit spotifyData prop when provided (e.g., server-side prop hydration)
    if (spotifyData) {
      setCurrentData(spotifyData as unknown as MockSpotifyData);
      return;
    }

    // Otherwise use hook data from useSpotifyData
    if (hookData) {
      setCurrentData(hookData as unknown as MockSpotifyData);
    }
  }, [timeRange, isDemo, spotifyData, onTimeRangeChange, hookData]);

  const handleLogout = () => {
    if (isDemo && onLogout) {
      setCurrentData(null);
  // No-op: setSelectedRange removed, handled by parent
      onLogout();
    } else {
      signOut({ callbackUrl: '/' });
    }
  };

  if (!currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Convert mock data to SpotifyData when in demo mode so AI gets expected shape
  const spotifyDataForAI = isDemo && currentData ? (convertMockToSpotifyData(currentData) as unknown as SpotifyData) : (currentData as unknown as SpotifyData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header with Global Time Range Selector and Logout */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Your Spotify Wrapped
              </h1>
              <p className="text-gray-400 text-lg">
                Discover your music personality and listening habits
                {isDemo && (
                  <span className="ml-2 px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-600/30">
                    DEMO MODE
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Time Range Selector */}
              <div className="flex items-center gap-3">
                <FaClock className="text-[#1DB954] text-lg" />
                {onTimeRangeChange ? (
                  <select
                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none text-sm font-medium min-w-[180px]"
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeKey)}
                  >
                    {TIME_RANGES.map(range => (
                      <option key={range.key} value={range.key}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{TIME_RANGES.find(r => r.key === timeRange)?.label}</span>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-600/30 hover:border-red-600/50 transition-all text-sm font-medium"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-[#1DB954]/20 to-green-600/20 backdrop-blur-lg p-6 rounded-xl border border-green-500/30 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {currentData.userProfile?.display_name?.charAt(0) || <FaUser />}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {currentData.userProfile?.display_name}
                </h3>
                <p className="text-green-300 text-sm flex items-center gap-2">
                  <FaChartLine size={12} />
                  {currentData.userProfile?.country} • {currentData.userProfile?.followers?.total} followers
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-medium flex items-center gap-2 justify-end">
                <FaCrown size={14} />
                {currentData.userProfile?.product === 'premium' ? 'Premium' : 'Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Column - Primary Charts */}
          <div className="xl:col-span-2 space-y-8">

            {/* Top Tracks */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <FaMusic className="text-[#1DB954] text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
                  <span className="text-gray-400 text-sm ml-auto">
                    {TIME_RANGES.find(r => r.key === timeRange)?.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentData.topTracks.slice(0, 10).map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-4 p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all group ${index < 3 ? 'md:p-6' : ''}`}
                    >
                      <div className={`${index < 3 ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-sm'} bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {index + 1}
                      </div>
                      <Image
                        src={track.images[0]?.url}
                        alt={track.name}
                        width={index < 3 ? 64 : 48}
                        height={index < 3 ? 64 : 48}
                        className={`${index < 3 ? 'w-16 h-16' : 'w-12 h-12'} rounded object-cover`}
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`${index < 3 ? 'font-bold text-lg' : 'font-semibold text-white'} truncate text-white`}>
                          {track.name}
                        </h4>
                        <p className={`${index < 3 ? 'text-gray-200 text-sm' : 'text-gray-400 text-sm'} truncate`}>{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {track.external_urls?.spotify && (
                          <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1DB954] hover:text-green-400 transition-colors"
                            title="Open in Spotify"
                          >
                            <FaExternalLinkAlt size={14} />
                          </a>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaPlay className="text-[#1DB954] cursor-pointer" size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spotify Attribution */}
                <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Image src="/spotify-icon.png" alt="Spotify" width={16} height={16} className="w-4 h-4" unoptimized />
                  <span>Powered by Spotify</span>
                </div>
              </div>
            </div>

            {/* Top Artists */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <FaMicrophone className="text-[#1DB954] text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Top Artists</h2>
                  <span className="text-gray-400 text-sm ml-auto">
                    {TIME_RANGES.find(r => r.key === timeRange)?.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentData.topArtists.slice(0, 10).map((artist, index) => (
                    <div key={artist.id} className={`text-center p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all group ${index < 3 ? 'md:p-6' : ''}`}>
                      <div className="relative">
                        <Image
                          src={artist.images[0]?.url}
                          alt={artist.name}
                          width={index < 3 ? 112 : 80}
                          height={index < 3 ? 112 : 80}
                          className={`${index < 3 ? 'w-28 h-28' : 'w-20 h-20'} rounded-full mx-auto mb-3 object-cover`}
                          unoptimized
                        />
                        <div className={`absolute -top-2 -right-2 ${index < 3 ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'} bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold`}>
                          {index + 1}
                        </div>
                      </div>
                      <h4 className={`${index < 3 ? 'font-bold text-lg' : 'font-semibold text-sm'} text-white mb-1`}>{artist.name}</h4>
                      <p className={`${index < 3 ? 'text-gray-200 text-sm' : 'text-gray-400 text-xs'} mb-2`}>{artist.genres.slice(0, 2).join(', ')}</p>
                      {artist.external_urls?.spotify && (
                        <a
                          href={artist.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#1DB954] hover:text-green-400 transition-colors text-xs"
                          title="Open in Spotify"
                        >
                          <FaExternalLinkAlt size={10} />
                          <span>Open</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Analytics */}
          <div className="space-y-8">

            {/* Music Intelligence */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaBrain className="text-[#1DB954] text-2xl" />
                <h2 className="text-xl font-bold text-white">Music Intelligence</h2>
              </div>
              {currentData.musicIntelligence ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                    <span className="text-gray-300 text-sm">Mainstream Taste</span>
                    <span className="text-white font-bold">{currentData.musicIntelligence.mainstreamTaste}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                    <span className="text-gray-300 text-sm">Artist Diversity</span>
                    <span className="text-white font-bold">{currentData.musicIntelligence.artistDiversity}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                    <span className="text-gray-300 text-sm">Vintage Collector</span>
                    <span className="text-white font-bold">{currentData.musicIntelligence.vintageCollector}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                    <span className="text-gray-300 text-sm">Underground Taste</span>
                    <span className="text-white font-bold">{currentData.musicIntelligence.undergroundTaste}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Music intelligence data not available.</div>
              )}
            </div>

            {/* Music DNA - Top Genres */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaPalette className="text-[#1DB954] text-2xl" />
                <h2 className="text-xl font-bold text-white">Music DNA</h2>
                <span className="text-gray-400 text-sm ml-auto">
                  {Array.isArray(currentData.topGenres) ? `${currentData.topGenres.length} genres` : 'No genre data'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.isArray(currentData.topGenres) && currentData.topGenres.length > 0 ? (
                  currentData.topGenres.map((genre, index) => (
                    <span
                      key={genre}
                      className="px-3 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `rgba(29, 185, 84, ${Math.max(0.3, 1 - index * 0.1)})`,
                        color: 'white'
                      }}
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No genres available</span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-[#1DB954] text-2xl" />
                <h2 className="text-xl font-bold text-white">Quick Stats</h2>
              </div>

              <div className="space-y-4">
                {currentData.musicIntelligence ? (
                  <>
                    <div className="flex items-center gap-3">
                      <FaHeart className="text-red-500" />
                      <span className="text-gray-300">Unique Albums</span>
                      <span className="text-white font-bold ml-auto">{currentData.musicIntelligence.uniqueAlbumsCount}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-blue-500" />
                      <span className="text-gray-300">Recent Music</span>
                      <span className="text-white font-bold ml-auto">{currentData.musicIntelligence.recentMusicLover}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaUsers className="text-purple-500" />
                      <span className="text-gray-300">Artist Diversity</span>
                      <span className="text-white font-bold ml-auto">{currentData.musicIntelligence.artistDiversity}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400">No quick stats available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recently Played (placed before AI section) */}
        <div className="mt-12">
          <RecentlyPlayedTimeline
            recentTracks={isDemo ? getRecentlyPlayedForTimeRange(timeRange) : ((currentData as unknown as HookSpotifyData)?.recentTracks || null)}
            isLoading={hookLoading}
          />
        </div>

        {/* AI Intelligence Section - Full Width Below Main Dashboard */}
        <div className="mt-16 pt-8 border-t border-gray-800 space-y-8">
          <AIIntelligenceSection
            spotifyData={spotifyDataForAI}
            className="w-full"
          />
        </div>

        {/* Footer Attribution */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center gap-3 text-gray-400">
              <span className="flex items-center justify-center gap-1">
                Data provided by
                <Image src="/spotify-logo.svg" alt="Spotify" width={24} height={24} className="inline align-middle h-6 w-auto mx-1" unoptimized />
                Web API and
                <Image src="/mistral-logo-color-white.png" alt="Mistral" width={24} height={24} className="inline align-middle h-6 w-auto mx-1" unoptimized />
                Web API
              </span>
          </div>
        </div>
      </div>
    </div>
  );
}

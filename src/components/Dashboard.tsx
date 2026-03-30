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
import { ErrorDisplay, parseSpotifyError } from '@/components/ErrorHandling';

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
  const { data: hookData, isLoading: hookLoading, error: hookError } = useSpotifyData(timeRange, { enabled: !isDemo });

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

  if (hookError) {
    const parsedError = parseSpotifyError(hookError);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <ErrorDisplay error={parsedError} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  
  if (!currentData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Convert mock data to SpotifyData when in demo mode so AI gets expected shape
  const spotifyDataForAI = isDemo && currentData ? (convertMockToSpotifyData(currentData) as unknown as SpotifyData) : (currentData as unknown as SpotifyData);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header with Global Time Range Selector and Logout */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 glow-text">
                Your Spotify Wrapped
              </h1>
              <p className="text-gray-400 text-lg">
                Discover your music personality and listening habits
                {isDemo && (
                  <span className="ml-2 px-2 py-1 bg-[#00BFFF]/10 text-[#00BFFF] text-xs rounded-full border border-[#00BFFF]/30">
                    DEMO MODE
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Time Range Selector */}
              <div className="flex items-center gap-3">
                <FaClock className="text-[#00BFFF] text-lg" />
                {onTimeRangeChange ? (
                  <select
                    className="bg-[#080808] text-white px-4 py-3 rounded-lg border border-[#00BFFF]/20 focus:border-[#00BFFF]/60 focus:outline-none focus:shadow-glow-sm text-sm font-medium min-w-[180px] transition-all"
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeKey)}
                    aria-label="Select time range for Spotify data"
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
                className="flex items-center gap-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg border border-red-600/20 hover:border-red-600/40 transition-all text-sm font-medium"
                aria-label="Logout from your account"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-[#00BFFF]/10 to-[#005f80]/10 backdrop-blur-lg p-6 rounded-xl border border-[#00BFFF]/25 glow mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#00BFFF] rounded-full flex items-center justify-center shadow-glow">
                <span className="text-black text-xl font-bold">
                  {currentData.userProfile?.display_name?.charAt(0) || <FaUser />}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {currentData.userProfile?.display_name}
                </h3>
                <p className="text-[#00BFFF]/80 text-sm flex items-center gap-2">
                  <FaChartLine size={12} />
                  {currentData.userProfile?.country} • {currentData.userProfile?.followers?.total} followers
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#00BFFF] text-sm font-medium flex items-center gap-2 justify-end">
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
            <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 overflow-hidden transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm">
              <div className="p-6 border-b border-[#00BFFF]/10">
                <div className="flex items-center gap-3">
                  <FaMusic className="text-[#00BFFF] text-2xl" />
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
                      className={`flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] hover:bg-[#00BFFF]/5 border border-transparent hover:border-[#00BFFF]/15 transition-all group ${index < 3 ? 'md:p-6' : ''}`}
                    >
                      <div className={`${index < 3 ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-sm'} bg-[#00BFFF] rounded-full flex items-center justify-center text-black font-bold flex-shrink-0`}>
                        {index + 1}
                      </div>
                      <Image
                        src={track.images[0]?.url}
                        alt={`Album art for ${track.name}`}
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
                            className="text-[#00BFFF] hover:text-white transition-colors"
                            title="Open in Spotify"
                            aria-label={`Open ${track.name} by ${track.artist} in Spotify`}
                          >
                            <FaExternalLinkAlt size={14} />
                          </a>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaPlay className="text-[#00BFFF] cursor-pointer" size={14} aria-label={`Play ${track.name}`}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spotify Attribution */}
                <div className="mt-6 pt-4 border-t border-[#00BFFF]/10 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Image src="/spotify-icon.png" alt="Spotify" width={16} height={16} className="w-4 h-4" unoptimized />
                  <span>Powered by Spotify</span>
                </div>
              </div>
            </div>

            {/* Top Artists */}
            <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 overflow-hidden transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm">
              <div className="p-6 border-b border-[#00BFFF]/10">
                <div className="flex items-center gap-3">
                  <FaMicrophone className="text-[#00BFFF] text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Top Artists</h2>
                  <span className="text-gray-400 text-sm ml-auto">
                    {TIME_RANGES.find(r => r.key === timeRange)?.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentData.topArtists.slice(0, 10).map((artist, index) => (
                    <div key={artist.id} className={`text-center p-4 rounded-lg bg-white/[0.03] hover:bg-[#00BFFF]/5 border border-transparent hover:border-[#00BFFF]/15 transition-all group ${index < 3 ? 'md:p-6' : ''}`}>
                      <div className="relative">
                        <Image
                          src={artist.images[0]?.url}
                          alt={`Photo of ${artist.name}`}
                          width={index < 3 ? 112 : 80}
                          height={index < 3 ? 112 : 80}
                          className={`${index < 3 ? 'w-28 h-28' : 'w-20 h-20'} rounded-full mx-auto mb-3 object-cover ring-2 ring-[#00BFFF]/20`}
                          unoptimized
                        />
                        <div className={`absolute -top-2 -right-2 ${index < 3 ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'} bg-[#00BFFF] rounded-full flex items-center justify-center text-black font-bold`}>
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
                          className="inline-flex items-center gap-1 text-[#00BFFF] hover:text-white transition-colors text-xs"
                          title="Open in Spotify"
                          aria-label={`Open ${artist.name} in Spotify`}
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

            {/* Taste Profile Radar */}
            <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FaBrain className="text-[#00BFFF] text-2xl" />
                <h2 className="text-xl font-bold text-white">Taste Profile</h2>
              </div>
              {currentData.musicIntelligence ? (
                (() => {
                  const mi = currentData.musicIntelligence!;
                  const cx = 100, cy = 100, maxR = 62;
                  const axes = [
                    { label: 'Mainstream', value: mi.mainstreamTaste ?? 0, angle: -Math.PI / 2 },
                    { label: 'Underground', value: mi.undergroundTaste ?? 0, angle: 0 },
                    { label: 'Vintage', value: mi.vintageCollector ?? 0, angle: Math.PI / 2 },
                    { label: 'Diversity', value: Math.min(mi.artistDiversity ?? 0, 100), angle: Math.PI },
                  ];
                  const pt = (angle: number, val: number) => ({
                    x: cx + (val / 100) * maxR * Math.cos(angle),
                    y: cy + (val / 100) * maxR * Math.sin(angle),
                  });
                  const ringPts = (pct: number) =>
                    axes.map(a => { const p = pt(a.angle, pct); return `${p.x},${p.y}`; }).join(' ');
                  const dataPts = axes.map(a => { const p = pt(a.angle, a.value); return `${p.x},${p.y}`; }).join(' ');
                  return (
                    <div className="flex flex-col items-center">
                      <svg width="100%" viewBox="0 0 200 200" className="max-w-[190px]">
                        {[25, 50, 75, 100].map(pct => (
                          <polygon key={pct} points={ringPts(pct)} fill="none" stroke="rgba(0,191,255,0.1)" strokeWidth="0.8" />
                        ))}
                        {axes.map((a, i) => {
                          const end = pt(a.angle, 100);
                          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(0,191,255,0.15)" strokeWidth="0.8" />;
                        })}
                        <polygon points={dataPts} fill="rgba(0,191,255,0.13)" stroke="#00BFFF" strokeWidth="1.5" strokeLinejoin="round" />
                        {axes.map((a, i) => {
                          const p = pt(a.angle, a.value);
                          return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00BFFF" />;
                        })}
                        <text x={cx} y={cy - maxR - 10} textAnchor="middle" fill="#9ca3af" fontSize="9.5">Mainstream</text>
                        <text x={cx + maxR + 8} y={cy} textAnchor="start" dominantBaseline="middle" fill="#9ca3af" fontSize="9.5">Underground</text>
                        <text x={cx} y={cy + maxR + 14} textAnchor="middle" fill="#9ca3af" fontSize="9.5">Vintage</text>
                        <text x={cx - maxR - 8} y={cy} textAnchor="end" dominantBaseline="middle" fill="#9ca3af" fontSize="9.5">Diversity</text>
                      </svg>
                      <div className="grid grid-cols-2 gap-1.5 w-full mt-1 text-xs">
                        <div className="flex justify-between px-2 py-1 rounded bg-white/[0.03]">
                          <span className="text-gray-400">Mainstream</span>
                          <span className="text-[#00BFFF] font-bold">{mi.mainstreamTaste}%</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-white/[0.03]">
                          <span className="text-gray-400">Underground</span>
                          <span className="text-[#00BFFF] font-bold">{mi.undergroundTaste}%</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-white/[0.03]">
                          <span className="text-gray-400">Vintage</span>
                          <span className="text-[#00BFFF] font-bold">{mi.vintageCollector}%</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-white/[0.03]">
                          <span className="text-gray-400">Diversity</span>
                          <span className="text-[#00BFFF] font-bold">{mi.artistDiversity} artists</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-gray-400 text-sm">Taste profile data not available.</div>
              )}
            </div>

            {/* Music DNA - Top Genres */}
            <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FaPalette className="text-[#00BFFF] text-2xl" />
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
                        backgroundColor: `rgba(0, 191, 255, ${Math.max(0.15, 0.55 - index * 0.05)})`,
                        color: index < 4 ? '#000' : '#fff',
                        boxShadow: index < 3 ? '0 0 8px rgba(0,191,255,0.25)' : 'none'
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

            {/* Track Popularity */}
            <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm">
              <div className="flex items-center gap-3 mb-5">
                <FaChartLine className="text-[#00BFFF] text-2xl" />
                <h2 className="text-xl font-bold text-white">Track Popularity</h2>
              </div>
              <div className="space-y-2.5">
                {currentData.topTracks.slice(0, 6).map((track, i) => (
                  <div key={track.id} className="flex items-center gap-2.5">
                    <span className="text-gray-600 text-xs w-3 shrink-0 text-right">{i + 1}</span>
                    <span className="text-gray-300 text-xs w-[88px] truncate shrink-0">{track.name}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#005f80] to-[#00BFFF]"
                        style={{ width: `${track.popularity}%` }}
                      />
                    </div>
                    <span className="text-[#00BFFF] text-xs font-mono w-5 shrink-0 text-right">{track.popularity}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-4 text-center">Spotify popularity score (0–100)</p>
            </div>
          </div>
        </div>

        {/* Recently Played (placed before AI section) */}
        <div className="mt-12">
          <RecentlyPlayedTimeline
            recentTracks={isDemo ? getRecentlyPlayedForTimeRange() : ((currentData as unknown as HookSpotifyData)?.recentTracks || null)}
            isLoading={hookLoading}
          />
        </div>

        {/* AI Intelligence Section - Full Width Below Main Dashboard */}
        <div className="mt-16 pt-8 border-t border-[#00BFFF]/10 space-y-8">
          <AIIntelligenceSection
            key={timeRange}
            spotifyData={spotifyDataForAI}
            recentTracks={isDemo ? getRecentlyPlayedForTimeRange() : ((currentData as unknown as HookSpotifyData)?.recentTracks || null)}
            className="w-full"
          />
        </div>

        {/* Footer Attribution */}
        <div className="mt-12 pt-8 border-t border-[#00BFFF]/10 text-center">
          <div className="flex items-center justify-center gap-3 text-gray-400">
              <span className="flex items-center justify-center gap-1">
                Data provided by
                <Image src="/spotify-green-logo.png" alt="Spotify" width={32} height={32} className="inline align-middle mx-1" unoptimized />
                Web API and
                <Image src="/m-boxed-rainbow.png" alt="Mistral" width={32} height={32} className="inline align-middle mx-1" unoptimized />
                Web API
              </span>
          </div>
        </div>
      </div>
    </div>
  );
}

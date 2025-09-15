import React, { useState } from 'react';
import Image from 'next/image';
import { FaMusic, FaMicrophone, FaPalette, FaBrain, FaChartLine, FaUsers, FaCrown, FaUser, FaPlay, FaHeart, FaClock, FaCalendarAlt } from 'react-icons/fa';

// Mock data for demonstration
const mockData = {
  userProfile: {
    display_name: "Music Lover",
    product: "premium",
    country: "US",
    followers: { total: 1234 },
    id: "user123"
  },
  topTracks: [
    { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', popularity: 95, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '2', name: 'Good 4 U', artist: 'Olivia Rodrigo', popularity: 89, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '3', name: 'Levitating', artist: 'Dua Lipa', popularity: 92, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '4', name: 'Watermelon Sugar', artist: 'Harry Styles', popularity: 88, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '5', name: 'drivers license', artist: 'Olivia Rodrigo', popularity: 87, images: [{ url: 'https://via.placeholder.com/64' }] }
  ],
  topArtists: [
    { id: '1', name: 'The Weeknd', genres: ['pop', 'r&b'], popularity: 95, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '2', name: 'Olivia Rodrigo', genres: ['pop', 'alternative'], popularity: 92, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '3', name: 'Dua Lipa', genres: ['pop', 'dance'], popularity: 90, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '4', name: 'Harry Styles', genres: ['pop', 'rock'], popularity: 89, images: [{ url: 'https://via.placeholder.com/64' }] },
    { id: '5', name: 'Taylor Swift', genres: ['pop', 'country'], popularity: 94, images: [{ url: 'https://via.placeholder.com/64' }] }
  ],
  musicIntelligence: {
    mainstreamTaste: 85,
    artistDiversity: 42,
    vintageCollector: 15,
    undergroundTaste: 25,
    recentMusicLover: 70,
    uniqueAlbumsCount: 89
  },
  topGenres: ['pop', 'r&b', 'alternative', 'dance', 'rock', 'indie', 'hip-hop', 'electronic']
};

const TIME_RANGES = [
  { key: 'short_term', label: 'Last 4 Weeks' },
  { key: 'medium_term', label: 'Last 6 Months' },
  { key: 'long_term', label: 'All Time' }
];

export default function ImprovedDashboard() {
  const [selectedRange, setSelectedRange] = useState('short_term');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header with Global Time Range Selector */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Your Spotify Wrapped
              </h1>
              <p className="text-gray-400 text-lg">
                Discover your music personality and listening habits
              </p>
            </div>

            {/* Global Time Range Selector */}
            <div className="flex items-center gap-3">
              <FaClock className="text-[#1DB954] text-lg" />
              <select
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none text-sm font-medium min-w-[180px]"
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
              >
                {TIME_RANGES.map(range => (
                  <option key={range.key} value={range.key}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-[#1DB954]/20 to-green-600/20 backdrop-blur-lg p-6 rounded-xl border border-green-500/30 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {mockData.userProfile?.display_name?.charAt(0) || <FaUser />}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {mockData.userProfile?.display_name}
                </h3>
                <p className="text-green-300 text-sm flex items-center gap-2">
                  <FaChartLine size={12} />
                  {mockData.userProfile?.country} • {mockData.userProfile?.followers?.total} followers
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-medium flex items-center gap-2 justify-end">
                <FaCrown size={14} />
                {mockData.userProfile?.product === 'premium' ? 'Premium' : 'Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Column - Primary Charts */}
          <div className="xl:col-span-2 space-y-8">

            {/* Top Tracks - Redesigned */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <FaMusic className="text-[#1DB954] text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
                  <span className="text-gray-400 text-sm ml-auto">
                    {TIME_RANGES.find(r => r.key === selectedRange)?.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockData.topTracks.slice(0, 6).map((track, index) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all group">
                      <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <Image
                        src={track.images[0]?.url}
                        alt={track.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{track.name}</h4>
                        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPlay className="text-[#1DB954] cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spotify Attribution */}
                <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Image src="https://open.spotifycdn.com/cdn/images/favicon16.ico" alt="Spotify" width={16} height={16} className="w-4 h-4" unoptimized />
                  <span>Powered by Spotify</span>
                </div>
              </div>
            </div>

            {/* Top Artists - Redesigned */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <FaMicrophone className="text-[#1DB954] text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Top Artists</h2>
                  <span className="text-gray-400 text-sm ml-auto">
                    {TIME_RANGES.find(r => r.key === selectedRange)?.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockData.topArtists.slice(0, 6).map((artist, index) => (
                    <div key={artist.id} className="text-center p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all group">
                      <div className="relative">
                        <Image
                          src={artist.images[0]?.url}
                          alt={artist.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                          unoptimized
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {index + 1}
                        </div>
                      </div>
                      <h4 className="font-semibold text-white text-sm mb-1">{artist.name}</h4>
                      <p className="text-gray-400 text-xs">
                        {artist.genres.slice(0, 2).join(', ')}
                      </p>
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

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                  <span className="text-gray-300 text-sm">Mainstream Taste</span>
                  <span className="text-white font-bold">{mockData.musicIntelligence.mainstreamTaste}%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                  <span className="text-gray-300 text-sm">Artist Diversity</span>
                  <span className="text-white font-bold">{mockData.musicIntelligence.artistDiversity}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                  <span className="text-gray-300 text-sm">Vintage Collector</span>
                  <span className="text-white font-bold">{mockData.musicIntelligence.vintageCollector}%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                  <span className="text-gray-300 text-sm">Underground Taste</span>
                  <span className="text-white font-bold">{mockData.musicIntelligence.undergroundTaste}%</span>
                </div>
              </div>
            </div>

            {/* Music DNA - Top Genres */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaPalette className="text-[#1DB954] text-2xl" />
                <h2 className="text-xl font-bold text-white">Music DNA</h2>
                <span className="text-gray-400 text-sm ml-auto">{mockData.topGenres.length} genres</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {mockData.topGenres.map((genre, index) => (
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
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-[#1DB954] text-2xl" />
                <h2 className="text-xl font-bold text-white">Quick Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaHeart className="text-red-500" />
                  <span className="text-gray-300">Unique Albums</span>
                  <span className="text-white font-bold ml-auto">{mockData.musicIntelligence.uniqueAlbumsCount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-500" />
                  <span className="text-gray-300">Recent Music</span>
                  <span className="text-white font-bold ml-auto">{mockData.musicIntelligence.recentMusicLover}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaUsers className="text-purple-500" />
                  <span className="text-gray-300">Artist Diversity</span>
                  <span className="text-white font-bold ml-auto">{mockData.musicIntelligence.artistDiversity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <Image src="https://open.spotifycdn.com/cdn/images/favicon32.ico" alt="Spotify" width={32} height={32} className="w-6 h-6" unoptimized />
            <span>Data provided by Spotify Web API</span>
          </div>
        </div>
      </div>
    </div>
  );
}

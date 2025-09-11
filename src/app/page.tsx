/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import PopularityBar from "@/components/PopularityBar";

export default function Home() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  );
}

function Content() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">My Spotify Wrapped</h1>
          <p className="mb-4 text-sm sm:text-base">Not signed in</p>
          <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto min-h-[44px]"
          >
            Sign in with Spotify
          </button>

          {/* Spotify Logo for Brand Compliance */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs sm:text-sm">Powered by</span>
              <img
                src="/spotify-logo.svg"
                alt="Spotify"
                className="h-5 sm:h-6"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(100%)'
                }}
                onError={(e) => {
                  console.log('Spotify logo failed to load, using fallback');
                  e.currentTarget.outerHTML = '<span class="text-[#1DB954] font-bold">Spotify</span>';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <SpotifyDataTest />;
}

function SpotifyDataTest() {
  const [spotifyData, setSpotifyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("short_term"); // Default to most recent data
  const [selectedTracksTimeRange, setSelectedTracksTimeRange] = useState("short_term"); // For Top Tracks section
  const [selectedArtistsTimeRange, setSelectedArtistsTimeRange] = useState("short_term"); // For Top Artists section

  const fetchSpotifyData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/spotify/top-items");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle insufficient data case
      if (data.error === "insufficient_data") {
        setError(`${data.message}\n\nSuggestions:\n${data.suggestions.map((s: string) => `• ${s}`).join('\n')}`);
        return;
      }

      setSpotifyData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Spotify data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Spotify Branding */}
        <div className="text-center mb-8 sm:mb-12 pt-4 sm:pt-8 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4">
            My Spotify Wrapped
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6">
            Discover your unique music personality and listening patterns
          </p>
          {/* Spotify Attribution */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-gray-400 text-xs sm:text-sm">Powered by</span>
            <img
              src="/spotify-logo.svg"
              alt="Spotify"
              className="h-5 sm:h-6"
              style={{
                filter: 'brightness(0) saturate(100%) invert(100%)'
              }}
              onError={(e) => {
                console.log('Header Spotify logo failed to load');
                e.currentTarget.outerHTML = '<span class="text-[#1DB954] font-bold">Spotify</span>';
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={fetchSpotifyData}
              disabled={loading}
              className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full sm:w-auto min-h-[44px]"
            >
              {loading ? "🎵 Loading..." : "🎶 Get My Spotify Data"}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 sm:px-8 rounded-full font-semibold text-base sm:text-lg shadow-lg transform transition hover:scale-105 w-full sm:w-auto min-h-[44px]"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-4 sm:px-6 rounded-lg mb-8 backdrop-blur-sm">
            <div className="flex items-start">
              <span className="text-xl sm:text-2xl mr-2 sm:mr-3 mt-1">⚠️</span>
              <div>
                <div className="font-semibold mb-2 text-sm sm:text-base">Spotify Data Issue</div>
                <div className="whitespace-pre-line text-xs sm:text-sm">{error}</div>
                <div className="mt-4 text-xs text-red-300">
                  💡 This usually happens with new Spotify accounts or accounts with private listening history.
                </div>
              </div>
            </div>
          </div>
        )}

        {spotifyData && (
          <div className="space-y-8">
            {/* User Profile Section */}
            {spotifyData.userProfile && (
              <div className="bg-gradient-to-r from-[#1DB954]/20 to-green-600/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-green-500/30 shadow-xl mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1DB954] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl font-bold">
                        {spotifyData.userProfile.display_name?.charAt(0) || '🎵'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white text-base sm:text-lg font-semibold truncate">
                        {spotifyData.userProfile.display_name || 'Spotify User'}
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm leading-tight">
                        📊 Your personal Spotify data • {spotifyData.userProfile.country || 'Unknown'} • {spotifyData.userProfile.followers || 0} followers
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-green-400 text-xs sm:text-sm font-medium">
                      {spotifyData.userProfile.product === 'premium' ? '👑 Premium' : '🎵 Free'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      ID: {spotifyData.userProfile.id || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Tracks and Artists Row */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Top Tracks */}
              <div className="bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎵</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Top Tracks</h2>
                  </div>
                  <select
                    className="bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none w-full sm:w-auto min-h-[44px] touch-manipulation"
                    value={selectedTracksTimeRange}
                    onChange={(e) => setSelectedTracksTimeRange(e.target.value)}
                  >
                    <option value="short_term">📅 Last 4 Weeks</option>
                    <option value="medium_term">📊 Last 6 Months</option>
                    <option value="long_term">🏆 ~1 Year of Data</option>
                  </select>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(spotifyData.topTracksByTimeRange?.[selectedTracksTimeRange] || spotifyData.topTracks || [])?.slice(0, 5).map((track: any, index: number) => (
                    <div key={track.id} className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-all">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      {track.images?.[2] && (
                        <img
                          src={track.images[2].url}
                          alt={track.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm sm:text-lg">
                          <div className="truncate">{track.name}</div>
                          {track.external_urls?.spotify && (
                            <a
                              href={track.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 sm:px-3 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-medium rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[32px] sm:min-h-[28px] touch-manipulation"
                            >
                              <span className="mr-1">🎵</span>
                              <span className="hidden sm:inline">Open in Spotify</span>
                              <span className="sm:hidden">Spotify</span>
                            </a>
                          )}
                        </div>
                        <div className="text-gray-300 text-sm truncate">{track.artist}</div>
                      </div>
                      <div className="w-24 sm:w-32 flex-shrink-0">
                        <PopularityBar
                          popularity={track.popularity}
                          label="Popularity"
                          className="p-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Artists */}
              <div className="bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎤</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Top Artists</h2>
                  </div>
                  <select
                    className="bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none w-full sm:w-auto min-h-[44px] touch-manipulation"
                    value={selectedArtistsTimeRange}
                    onChange={(e) => setSelectedArtistsTimeRange(e.target.value)}
                  >
                    <option value="short_term">📅 Last 4 Weeks</option>
                    <option value="medium_term">📊 Last 6 Months</option>
                    <option value="long_term">🏆 ~1 Year of Data</option>
                  </select>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(spotifyData.topArtistsByTimeRange?.[selectedArtistsTimeRange] || spotifyData.topArtists || [])?.slice(0, 5).map((artist: any, index: number) => (
                    <div key={artist.id} className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-all">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      {artist.images?.[2] && (
                        <img
                          src={artist.images[2].url}
                          alt={artist.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm sm:text-lg">
                          <div className="truncate">{artist.name}</div>
                          {artist.external_urls?.spotify && (
                            <a
                              href={artist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[32px] touch-manipulation"
                            >
                              <span className="mr-1">🎤</span>
                              <span className="hidden sm:inline">Spotify</span>
                              <span className="sm:hidden">🎵</span>
                            </a>
                          )}
                        </div>
                        <div className="text-gray-300 text-xs sm:text-sm truncate">
                          {artist.genres?.slice(0, 2).join(", ") || "No genres"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Genres and Stats Row */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Top Genres */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎨</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Music DNA</h2>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {spotifyData.topGenres?.slice(0, 10).map((genreObj: any, index: number) => (
                    <span
                      key={genreObj.genre || genreObj}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg hover:scale-105 transition-transform touch-manipulation"
                      style={{
                        background: `linear-gradient(45deg, hsl(${index * 36}, 70%, 50%), hsl(${(index * 36) + 60}, 70%, 60%))`
                      }}
                      title={genreObj.count ? `${genreObj.count} artists` : undefined}
                    >
                      {genreObj.genre || genreObj}
                      {genreObj.count && (
                        <span className="ml-2 text-xs opacity-80">
                          {genreObj.count}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📊</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Your Stats</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="text-gray-300 text-sm sm:text-base">Average Popularity</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.stats?.averagePopularity}/100</div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {spotifyData.stats?.averagePopularity >= 70 ? "Mainstream taste" :
                         spotifyData.stats?.averagePopularity >= 50 ? "Balanced taste" : "Underground vibes"}
                      </div>
                    </div>
                    <div className="text-3xl sm:text-4xl">🔥</div>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="text-gray-300 text-sm sm:text-base">Tracks Analyzed</div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.stats?.totalTracksAnalyzed}</div>
                    </div>
                    <div className="text-3xl sm:text-4xl">🎵</div>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="text-gray-300 text-sm sm:text-base">Artists Analyzed</div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-400">{spotifyData.stats?.totalArtistsAnalyzed}</div>
                    </div>
                    <div className="text-3xl sm:text-4xl">👨‍🎤</div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Most Played Songs */}
            {spotifyData.mostPlayedSongs && (
              <div className="bg-[#191414] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🔥</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Most Played Songs</h2>
                    <span className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 bg-[#1DB954] text-white rounded-full text-xs sm:text-sm">
                      Top 10
                    </span>
                  </div>

                  {/* Time Range Selector */}
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <span className="text-gray-300 text-sm">Period:</span>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-600 focus:border-[#1DB954] focus:outline-none text-sm flex-1 sm:flex-none min-h-[44px] touch-manipulation"
                    >
                      <option value="short_term">📅 Last 4 Weeks</option>
                      <option value="medium_term">📊 Last 6 Months</option>
                      <option value="long_term">🏆 ~1 Year of Data</option>
                    </select>
                  </div>
                </div>

                {/* Time Range Info */}
                {(spotifyData.mostPlayedSongs[selectedTimeRange] || []).length > 0 && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-xs sm:text-sm flex items-start sm:items-center">
                      <span className="mr-2 mt-0.5 sm:mt-0">📊</span>
                      <span>
                        <strong>
                          Period: {(spotifyData.mostPlayedSongs[selectedTimeRange] || [])[0]?.periodDescription || 'Unknown'}
                        </strong>
                        <br className="sm:hidden" />
                        <span className="sm:ml-2">Your actual Spotify top tracks rankings for this period</span>
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {(spotifyData.mostPlayedSongs[selectedTimeRange] || []).map((track: any) => (
                    <div key={track.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                        {track.rank}
                      </div>
                      {track.images?.[2] && (
                        <img
                          src={track.images[2].url}
                          alt={track.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 spotify-rounded-small object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm sm:text-lg">
                          <div className="truncate">{track.name}</div>
                          {track.external_urls?.spotify && (
                            <a
                              href={track.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 sm:px-3 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-medium rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[32px] touch-manipulation"
                            >
                              <span className="mr-1">🎵</span>
                              <span className="hidden sm:inline">Open in Spotify</span>
                              <span className="sm:hidden">Spotify</span>
                            </a>
                          )}
                        </div>
                        <div className="text-[#b3b3b3] truncate text-sm">{track.artist}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">{track.album.name}</div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-[#1DB954] font-bold text-lg sm:text-2xl">#{track.rank}</div>
                        <div className="text-gray-400 text-xs sm:text-sm">ranking</div>
                        <div className="w-20 sm:w-24">
                          <PopularityBar
                            popularity={track.popularity}
                            label=""
                            className="p-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-xs sm:text-sm flex items-start">
                    <span className="mr-2 mt-0.5">💡</span>
                    <span>
                      Shows your actual Spotify top tracks rankings for ${
                        selectedTimeRange === 'short_term' ? 'the last 4 weeks' :
                        selectedTimeRange === 'medium_term' ? 'the last 6 months' :
                        '~1 year of data'
                      }. Rankings are 100% real from Spotify&apos;s API. Spotify doesn&apos;t provide exact play counts or specific dates.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* NEW: Social & Discovery Insights */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              {/* Discovery Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🔍</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Discovery Profile</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Mainstream Taste</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.discoveryMetrics.mainstreamTaste}%</div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.mainstreamTaste > 70 ? "Chart follower" :
                             spotifyData.discoveryMetrics.mainstreamTaste > 50 ? "Balanced taste" : "Underground explorer"}
                          </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">📈</div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Artist Diversity</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.discoveryMetrics.artistDiversity}%</div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.artistDiversity > 70 ? "Explorer" :
                             spotifyData.discoveryMetrics.artistDiversity > 50 ? "Balanced" : "Loyal fan"}
                          </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">🎭</div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Recent Music Lover</div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-400">{spotifyData.discoveryMetrics.recentMusicLover}%</div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.recentMusicLover > 60 ? "Trend follower" :
                             spotifyData.discoveryMetrics.recentMusicLover > 30 ? "Balanced" : "Vintage collector"}
                          </div>
                        </div>
                        <div className="text-3xl sm:text-4xl">🆕</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Social Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">👥</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Social Profile</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {spotifyData.socialMetrics && (
                    <>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Following Artists</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-400">{spotifyData.socialMetrics.followedArtistsCount}</div>
                          <div className="text-xs sm:text-sm text-gray-400">Artists you follow</div>
                        </div>
                        <div className="text-3xl sm:text-4xl">❤️</div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Your Playlists</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-400">{spotifyData.socialMetrics.playlistsOwned}</div>
                          <div className="text-xs sm:text-sm text-gray-400">Playlists you created</div>
                        </div>
                        <div className="text-3xl sm:text-4xl">📝</div>
                      </div>
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm sm:text-base">Account Type</div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-400 capitalize">{spotifyData.socialMetrics.accountType}</div>
                          <div className="text-xs sm:text-sm text-gray-400">Spotify subscription</div>
                        </div>
                        <div className="text-3xl sm:text-4xl">👑</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RAW DATA: Listening Time Patterns */}
            {spotifyData.listeningHabits && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">⏰</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Time Patterns</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningHour}:00</div>
                    <div className="text-gray-300 text-sm sm:text-base">Peak listening hour</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningDay}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Most active day</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white capitalize">{spotifyData.listeningHabits.preferredTimeOfDay}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Most active period</div>
                  </div>
                </div>
              </div>
            )}


            {/* RAW DATA: Time Range Evolution */}
            <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📈</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Evolution Across Time</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {spotifyData.timeRanges && Object.entries(spotifyData.timeRanges).map(([period, data]: [string, any]) => (
                  <div key={period} className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">{data.label}</h3>
                    <div className="space-y-2">
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Top Artist: </span>
                        <span className="text-white truncate block sm:inline">{data.artists[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Top Track: </span>
                        <span className="text-white truncate block sm:inline">{data.tracks[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="text-gray-300">Total Artists: </span>
                        <span className="text-white">{data.artists?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RAW DATA: Music Metrics */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📊</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Raw Metrics</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Unique Artists</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.uniqueArtistsCount}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Unique Albums</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.uniqueAlbumsCount}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Average Tracks per Artist</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.artistLoyalty}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Oldest Track Year</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.oldestTrackYear}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Newest Track Year</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.newestTrackYear}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎯</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Percentages</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Mainstream Score</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.mainstreamTaste}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Underground Score</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.undergroundTaste}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Recent Music (2023-2025)</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.recentMusicLover}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Vintage Music (Pre-2000)</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.vintageCollector}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm sm:text-base">Artist Diversity</span>
                        <span className="text-white font-bold text-sm sm:text-base">{spotifyData.discoveryMetrics.artistDiversity}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: Recently Played Activity */}
            {/* RAW DATA: Recent Listening History */}
            {spotifyData.recentTracks && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🕐</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Listening Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.recentTracks.length} tracks
                  </span>
                </div>
                <div className="grid gap-2 sm:gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {spotifyData.recentTracks.slice(0, 15).map((track: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      {track.track.album?.images?.[2] && (
                        <img
                          src={track.track.album.images[2].url}
                          alt={track.track.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs sm:text-sm">
                          <div className="truncate">{track.track.name}</div>
                          {track.track.external_urls?.spotify && (
                            <a
                              href={track.track.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[28px] touch-manipulation"
                            >
                              <span className="mr-1">🎵</span>
                              <span className="hidden sm:inline">Open</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-gray-300 text-xs truncate">{track.track.artists[0]?.name}</div>
                      </div>
                      <div className="text-gray-400 text-xs flex-shrink-0">
                        {new Date(track.played_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: All Your Playlists */}
            {spotifyData.playlists && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📝</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Your Playlists Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.playlists.length} playlists
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {spotifyData.playlists.map((playlist: any) => (
                    <div key={playlist.id} className="p-3 sm:p-4 bg-white/5 rounded-lg">
                      <div className="text-white font-medium text-sm mb-2">
                        <div className="truncate">{playlist.name}</div>
                        {playlist.external_urls?.spotify && (
                          <a
                            href={playlist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 sm:mt-0 sm:ml-2 min-h-[28px] touch-manipulation"
                          >
                            <span className="mr-1">📝</span>
                            <span className="hidden sm:inline">Open</span>
                            <span className="sm:hidden">♪</span>
                          </a>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{playlist.tracks.total} tracks</span>
                        <span>{playlist.public ? 'Public' : 'Private'}</span>
                      </div>
                      {playlist.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">{playlist.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Artists You Follow */}
            {spotifyData.followedArtists && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">👥</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Following Data</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.followedArtists.length} artists
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-64 sm:max-h-80 overflow-y-auto">
                  {spotifyData.followedArtists.map((artist: any) => (
                    <div key={artist.id} className="p-2 sm:p-3 bg-white/5 rounded-lg text-center">
                      {artist.images?.[2] && (
                        <img
                          src={artist.images[2].url}
                          alt={artist.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2"
                        />
                      )}
                      <div className="text-white text-xs sm:text-sm">
                        <div className="truncate">{artist.name}</div>
                        {artist.external_urls?.spotify && (
                          <a
                            href={artist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                          >
                            <span className="mr-1">🎤</span>
                            <span className="hidden sm:inline">Spotify</span>
                            <span className="sm:hidden">♪</span>
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-300">{artist.followers.total.toLocaleString()} followers</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Genre Distribution */}
            {spotifyData.genreData && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎸</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Genre Statistics</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {Object.keys(spotifyData.genreData).length} genres
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
                  {Object.entries(spotifyData.genreData)
                    .sort(([,a]: [string, any], [,b]: [string, any]) => b.count - a.count)
                    .slice(0, 20)
                    .map(([genre, data]: [string, any]) => (
                    <div key={genre} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-xs sm:text-sm capitalize truncate mr-2">{genre}</span>
                      <span className="text-gray-300 font-bold text-xs sm:text-sm flex-shrink-0">{data.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Artist Analysis */}
            {spotifyData.artistAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎤</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Artist Deep Dive</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.totalUniqueArtists}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Total Artists</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.averagePopularity}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Popularity</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{(spotifyData.artistAnalysis.averageFollowers / 1000000).toFixed(1)}M</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Followers</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.artistAnalysis.averageGenresPerArtist}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Genres per Artist</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Most Popular Artist</h3>
                    {spotifyData.artistAnalysis.mostPopularArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white text-sm sm:text-base">
                          <div className="truncate">{spotifyData.artistAnalysis.mostPopularArtist.name}</div>
                          {spotifyData.artistAnalysis.mostPopularArtist.external_urls?.spotify && (
                            <a
                              href={spotifyData.artistAnalysis.mostPopularArtist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                            >
                              <span className="mr-1">🎤</span>
                              <span className="hidden sm:inline">Spotify</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm">Popularity: {spotifyData.artistAnalysis.mostPopularArtist.popularity}/100</div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Biggest Artist</h3>
                    {spotifyData.artistAnalysis.biggestArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white text-sm sm:text-base">
                          <div className="truncate">{spotifyData.artistAnalysis.biggestArtist.name}</div>
                          {spotifyData.artistAnalysis.biggestArtist.external_urls?.spotify && (
                            <a
                              href={spotifyData.artistAnalysis.biggestArtist.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs rounded-full transition-colors mt-1 min-h-[28px] touch-manipulation"
                            >
                              <span className="mr-1">🎤</span>
                              <span className="hidden sm:inline">Spotify</span>
                              <span className="sm:hidden">♪</span>
                            </a>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm">{spotifyData.artistAnalysis.biggestArtist.followers.total.toLocaleString()} followers</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Album Analysis */}
            {spotifyData.albumAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">💿</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Album Analysis</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.totalUniqueAlbums}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Unique Albums</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.yearSpread}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Year Spread</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{spotifyData.albumAnalysis.averageReleaseYear}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Avg Release Year</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{Object.keys(spotifyData.albumAnalysis.albumTypes).length}</div>
                    <div className="text-gray-300 text-sm sm:text-base">Album Types</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Decade Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.decadeDistribution)
                        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
                        .slice(0, 5)
                        .map(([decade, count]: [string, any]) => (
                        <div key={decade} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300">{decade}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Album Types</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.albumTypes).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-300 capitalize">{type}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Complete Statistics Dashboard */}
            {spotifyData.stats && (
              <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📈</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Complete API Capabilities</h2>
                  </div>
                  <span className="sm:ml-4 px-3 py-1 bg-green-500/20 rounded-full text-sm text-green-300">
                    {spotifyData.stats.dataCompletenessScore}% Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.totalTracksAnalyzed}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Total Tracks</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.uniqueArtistsCount}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Unique Artists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.uniqueAlbumsCount}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Unique Albums</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.totalGenresFound}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Genres Found</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.playlistsAnalyzed}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Playlists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.followedArtistsCount}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Followed Artists</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.recentTracksAnalyzed}</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Recent Tracks</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-white">{spotifyData.stats.audioFeaturesCoverage}%</div>
                    <div className="text-gray-300 text-xs sm:text-sm">Audio Features</div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/5 rounded-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">API Endpoint Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(spotifyData.stats.scopesWorking).map(([scope, working]: [string, any]) => (
                      <div key={scope} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-300 truncate mr-2">{scope.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${working ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {working ? 'Working' : 'Limited'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}            {/* Next: Add Mistral AI button */}
            <div className="text-center pt-6 sm:pt-8">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl shadow-xl transform transition hover:scale-105 min-h-[44px] touch-manipulation">
                🤖 Get AI Analysis (Coming Soon!)
              </button>
            </div>

            {/* Spotify Attribution Footer */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <img
                  src="/spotify-logo.svg"
                  alt="Spotify"
                  className="h-6 sm:h-8"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(100%)'
                  }}
                  onError={(e) => {
                    console.log('Footer Spotify logo failed to load');
                    e.currentTarget.outerHTML = '<div class="text-[#1DB954] font-bold text-xl">Spotify</div>';
                  }}
                />
                <div className="text-center px-4">
                  <p className="text-gray-400 text-sm">
                    Data provided by Spotify
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    This app uses the Spotify Web API but is not endorsed, certified or otherwise approved by Spotify.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {spotifyData && (
          <details className="mt-6 sm:mt-8 bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10">
            <summary className="cursor-pointer font-semibold text-white hover:text-gray-300 text-sm sm:text-base min-h-[44px] flex items-center touch-manipulation">🔍 Raw Data (for debugging)</summary>
            <pre className="mt-4 text-xs overflow-auto text-gray-300 bg-black/30 p-3 sm:p-4 rounded-lg max-h-64 sm:max-h-96">
              {JSON.stringify(spotifyData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

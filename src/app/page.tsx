/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Spotify Wrapped</h1>
          <p className="mb-4">Not signed in</p>
          <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Sign in with Spotify
          </button>
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

  const fetchSpotifyData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/spotify/top-items");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSpotifyData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Spotify data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            My Spotify Wrapped
          </h1>
          <p className="text-xl text-gray-300 mb-8">Powered by Mistral AI</p>
          <div className="space-x-4">
            <button
              onClick={fetchSpotifyData}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition hover:scale-105"
            >
              {loading ? "🎵 Loading..." : "🎶 Get My Spotify Data"}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition hover:scale-105"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-8 backdrop-blur-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <div className="font-semibold">Error</div>
                <div>{error}</div>
              </div>
            </div>
          </div>
        )}

        {spotifyData && (
          <div className="space-y-8">
            {/* Top Tracks and Artists Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Tracks */}
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎵</span>
                  <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
                </div>
                <div className="space-y-4">
                  {spotifyData.topTracks?.slice(0, 5).map((track: any, index: number) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">{track.name}</div>
                        <div className="text-gray-300">{track.artist}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Popularity</div>
                        <div className="text-green-400 font-bold" title="Spotify's algorithm score based on recent plays and trends">{track.popularity}/100</div>
                        <div className="text-xs text-gray-500">
                          {track.popularity >= 80 ? "🔥 Trending" :
                           track.popularity >= 60 ? "📈 Popular" :
                           track.popularity >= 40 ? "🎵 Moderate" : "💎 Niche"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Artists */}
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎤</span>
                  <h2 className="text-2xl font-bold text-white">Top Artists</h2>
                </div>
                <div className="space-y-4">
                  {spotifyData.topArtists?.slice(0, 5).map((artist: any, index: number) => (
                    <div key={artist.id} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      {artist.images?.[2] && (
                        <img
                          src={artist.images[2].url}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">{artist.name}</div>
                        <div className="text-gray-300 text-sm">
                          {artist.genres?.slice(0, 2).join(", ") || "No genres"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Genres and Stats Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Genres */}
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎨</span>
                  <h2 className="text-2xl font-bold text-white">Music DNA</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {spotifyData.topGenres?.slice(0, 10).map((genreObj: any, index: number) => (
                    <span
                      key={genreObj.genre || genreObj}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform"
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
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">📊</span>
                  <h2 className="text-2xl font-bold text-white">Your Stats</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-gray-300">Average Popularity</div>
                      <div className="text-2xl font-bold text-green-400">{spotifyData.stats?.averagePopularity}/100</div>
                      <div className="text-sm text-gray-400">
                        {spotifyData.stats?.averagePopularity >= 70 ? "Mainstream taste" :
                         spotifyData.stats?.averagePopularity >= 50 ? "Balanced taste" : "Underground vibes"}
                      </div>
                    </div>
                    <div className="text-4xl">🔥</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-gray-300">Tracks Analyzed</div>
                      <div className="text-2xl font-bold text-blue-400">{spotifyData.stats?.totalTracksAnalyzed}</div>
                    </div>
                    <div className="text-4xl">🎵</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-gray-300">Artists Analyzed</div>
                      <div className="text-2xl font-bold text-purple-400">{spotifyData.stats?.totalArtistsAnalyzed}</div>
                    </div>
                    <div className="text-4xl">👨‍🎤</div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Social & Discovery Insights */}
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              {/* Discovery Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🔍</span>
                  <h2 className="text-2xl font-bold text-white">Discovery Profile</h2>
                </div>
                <div className="space-y-6">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Mainstream Taste</div>
                          <div className="text-2xl font-bold text-green-400">{spotifyData.discoveryMetrics.mainstreamTaste}%</div>
                          <div className="text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.mainstreamTaste > 70 ? "Chart follower" :
                             spotifyData.discoveryMetrics.mainstreamTaste > 50 ? "Balanced taste" : "Underground explorer"}
                          </div>
                        </div>
                        <div className="text-4xl">📈</div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Artist Diversity</div>
                          <div className="text-2xl font-bold text-blue-400">{spotifyData.discoveryMetrics.artistDiversity}%</div>
                          <div className="text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.artistDiversity > 70 ? "Explorer" :
                             spotifyData.discoveryMetrics.artistDiversity > 50 ? "Balanced" : "Loyal fan"}
                          </div>
                        </div>
                        <div className="text-4xl">🎭</div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Recent Music Lover</div>
                          <div className="text-2xl font-bold text-purple-400">{spotifyData.discoveryMetrics.recentMusicLover}%</div>
                          <div className="text-sm text-gray-400">
                            {spotifyData.discoveryMetrics.recentMusicLover > 60 ? "Trend follower" :
                             spotifyData.discoveryMetrics.recentMusicLover > 30 ? "Balanced" : "Vintage collector"}
                          </div>
                        </div>
                        <div className="text-4xl">🆕</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Social Metrics */}
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">👥</span>
                  <h2 className="text-2xl font-bold text-white">Social Profile</h2>
                </div>
                <div className="space-y-6">
                  {spotifyData.socialMetrics && (
                    <>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Following Artists</div>
                          <div className="text-2xl font-bold text-green-400">{spotifyData.socialMetrics.followedArtistsCount}</div>
                          <div className="text-sm text-gray-400">Artists you follow</div>
                        </div>
                        <div className="text-4xl">❤️</div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Your Playlists</div>
                          <div className="text-2xl font-bold text-blue-400">{spotifyData.socialMetrics.playlistsOwned}</div>
                          <div className="text-sm text-gray-400">Playlists you created</div>
                        </div>
                        <div className="text-4xl">📝</div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-gray-300">Account Type</div>
                          <div className="text-2xl font-bold text-purple-400 capitalize">{spotifyData.socialMetrics.accountType}</div>
                          <div className="text-sm text-gray-400">Spotify subscription</div>
                        </div>
                        <div className="text-4xl">👑</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RAW DATA: Listening Time Patterns */}
            {spotifyData.listeningHabits && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">⏰</span>
                  <h2 className="text-2xl font-bold text-white">Time Patterns</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningHour}:00</div>
                    <div className="text-gray-300">Peak listening hour</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.listeningHabits.peakListeningDay}</div>
                    <div className="text-gray-300">Most active day</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white capitalize">{spotifyData.listeningHabits.preferredTimeOfDay}</div>
                    <div className="text-gray-300">Most active period</div>
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Time Range Evolution */}
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">📈</span>
                <h2 className="text-2xl font-bold text-white">Evolution Across Time</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {spotifyData.timeRanges && Object.entries(spotifyData.timeRanges).map(([period, data]: [string, any]) => (
                  <div key={period} className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-3">{data.label}</h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-300">Top Artist: </span>
                        <span className="text-white">{data.artists[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-300">Top Track: </span>
                        <span className="text-white">{data.tracks[0]?.name || 'N/A'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-300">Total Artists: </span>
                        <span className="text-white">{data.artists?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RAW DATA: Music Metrics */}
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">📊</span>
                  <h2 className="text-2xl font-bold text-white">Raw Metrics</h2>
                </div>
                <div className="space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Unique Artists</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.uniqueArtistsCount}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Unique Albums</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.uniqueAlbumsCount}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Average Tracks per Artist</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.artistLoyalty}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Oldest Track Year</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.oldestTrackYear}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Newest Track Year</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.newestTrackYear}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎯</span>
                  <h2 className="text-2xl font-bold text-white">Percentages</h2>
                </div>
                <div className="space-y-4">
                  {spotifyData.discoveryMetrics && (
                    <>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Mainstream Score</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.mainstreamTaste}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Underground Score</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.undergroundTaste}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Recent Music (2023-2025)</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.recentMusicLover}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Vintage Music (Pre-2000)</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.vintageCollector}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">Artist Diversity</span>
                        <span className="text-white font-bold">{spotifyData.discoveryMetrics.artistDiversity}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: Recently Played Activity */}
            {/* RAW DATA: Recent Listening History */}
            {spotifyData.recentTracks && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🕐</span>
                  <h2 className="text-2xl font-bold text-white">Recent Listening Data</h2>
                  <span className="ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.recentTracks.length} tracks
                  </span>
                </div>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {spotifyData.recentTracks.slice(0, 15).map((track: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      {track.track.album?.images?.[2] && (
                        <img
                          src={track.track.album.images[2].url}
                          alt={track.track.name}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">{track.track.name}</div>
                        <div className="text-gray-300 text-xs truncate">{track.track.artists[0]?.name}</div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(track.played_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: All Your Playlists */}
            {spotifyData.playlists && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">📝</span>
                  <h2 className="text-2xl font-bold text-white">Your Playlists Data</h2>
                  <span className="ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.playlists.length} playlists
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {spotifyData.playlists.map((playlist: any) => (
                    <div key={playlist.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="text-white font-medium text-sm mb-2 truncate">{playlist.name}</div>
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
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">👥</span>
                  <h2 className="text-2xl font-bold text-white">Following Data</h2>
                  <span className="ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {spotifyData.followedArtists.length} artists
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                  {spotifyData.followedArtists.map((artist: any) => (
                    <div key={artist.id} className="p-3 bg-white/5 rounded-lg text-center">
                      {artist.images?.[2] && (
                        <img
                          src={artist.images[2].url}
                          alt={artist.name}
                          className="w-16 h-16 rounded-full mx-auto mb-2"
                        />
                      )}
                      <div className="text-white text-sm truncate">{artist.name}</div>
                      <div className="text-xs text-gray-300">{artist.followers.total.toLocaleString()} followers</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Genre Distribution */}
            {spotifyData.genreData && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎸</span>
                  <h2 className="text-2xl font-bold text-white">Genre Statistics</h2>
                  <span className="ml-4 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {Object.keys(spotifyData.genreData).length} genres
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {Object.entries(spotifyData.genreData)
                    .sort(([,a]: [string, any], [,b]: [string, any]) => b.count - a.count)
                    .slice(0, 20)
                    .map(([genre, data]: [string, any]) => (
                    <div key={genre} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white text-sm capitalize">{genre}</span>
                      <span className="text-gray-300 font-bold">{data.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAW DATA: Artist Analysis */}
            {spotifyData.artistAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">🎤</span>
                  <h2 className="text-2xl font-bold text-white">Artist Deep Dive</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.artistAnalysis.totalUniqueArtists}</div>
                    <div className="text-gray-300">Total Artists</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.artistAnalysis.averagePopularity}</div>
                    <div className="text-gray-300">Avg Popularity</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{(spotifyData.artistAnalysis.averageFollowers / 1000000).toFixed(1)}M</div>
                    <div className="text-gray-300">Avg Followers</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.artistAnalysis.averageGenresPerArtist}</div>
                    <div className="text-gray-300">Genres per Artist</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">Most Popular Artist</h3>
                    {spotifyData.artistAnalysis.mostPopularArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white">{spotifyData.artistAnalysis.mostPopularArtist.name}</div>
                        <div>Popularity: {spotifyData.artistAnalysis.mostPopularArtist.popularity}/100</div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">Biggest Artist</h3>
                    {spotifyData.artistAnalysis.biggestArtist && (
                      <div className="text-gray-300">
                        <div className="font-bold text-white">{spotifyData.artistAnalysis.biggestArtist.name}</div>
                        <div>{spotifyData.artistAnalysis.biggestArtist.followers.total.toLocaleString()} followers</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RAW DATA: Album Analysis */}
            {spotifyData.albumAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">💿</span>
                  <h2 className="text-2xl font-bold text-white">Album Analysis</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.albumAnalysis.totalUniqueAlbums}</div>
                    <div className="text-gray-300">Unique Albums</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.albumAnalysis.yearSpread}</div>
                    <div className="text-gray-300">Year Spread</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{spotifyData.albumAnalysis.averageReleaseYear}</div>
                    <div className="text-gray-300">Avg Release Year</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-bold text-white">{Object.keys(spotifyData.albumAnalysis.albumTypes).length}</div>
                    <div className="text-gray-300">Album Types</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">Decade Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.decadeDistribution)
                        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
                        .slice(0, 5)
                        .map(([decade, count]: [string, any]) => (
                        <div key={decade} className="flex justify-between text-sm">
                          <span className="text-gray-300">{decade}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">Album Types</h3>
                    <div className="space-y-2">
                      {Object.entries(spotifyData.albumAnalysis.albumTypes).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between text-sm">
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
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl mt-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">📈</span>
                  <h2 className="text-2xl font-bold text-white">Complete API Capabilities</h2>
                  <span className="ml-4 px-3 py-1 bg-green-500/20 rounded-full text-sm text-green-300">
                    {spotifyData.stats.dataCompletenessScore}% Complete
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.totalTracksAnalyzed}</div>
                    <div className="text-gray-300 text-sm">Total Tracks</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.uniqueArtistsCount}</div>
                    <div className="text-gray-300 text-sm">Unique Artists</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.uniqueAlbumsCount}</div>
                    <div className="text-gray-300 text-sm">Unique Albums</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.totalGenresFound}</div>
                    <div className="text-gray-300 text-sm">Genres Found</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.playlistsAnalyzed}</div>
                    <div className="text-gray-300 text-sm">Playlists</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.followedArtistsCount}</div>
                    <div className="text-gray-300 text-sm">Followed Artists</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.recentTracksAnalyzed}</div>
                    <div className="text-gray-300 text-sm">Recent Tracks</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{spotifyData.stats.audioFeaturesCoverage}%</div>
                    <div className="text-gray-300 text-sm">Audio Features</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">API Endpoint Status</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(spotifyData.stats.scopesWorking).map(([scope, working]: [string, any]) => (
                      <div key={scope} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{scope.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${working ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {working ? 'Working' : 'Limited'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}            {/* Next: Add Mistral AI button */}
            <div className="text-center pt-8">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl transform transition hover:scale-105">
                🤖 Get AI Analysis (Coming Soon!)
              </button>
            </div>
          </div>
        )}

        {spotifyData && (
          <details className="mt-8 bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <summary className="cursor-pointer font-semibold text-white hover:text-gray-300">🔍 Raw Data (for debugging)</summary>
            <pre className="mt-4 text-xs overflow-auto text-gray-300 bg-black/30 p-4 rounded-lg">
              {JSON.stringify(spotifyData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

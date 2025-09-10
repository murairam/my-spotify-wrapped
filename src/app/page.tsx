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
                  {spotifyData.topGenres?.slice(0, 10).map((genre: string, index: number) => (
                    <span 
                      key={genre}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-lg"
                      style={{
                        background: `linear-gradient(45deg, hsl(${index * 36}, 70%, 50%), hsl(${(index * 36) + 60}, 70%, 60%))`
                      }}
                    >
                      {genre}
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

            {/* Next: Add Mistral AI button */}
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

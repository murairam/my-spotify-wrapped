

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { FaSpotify, FaEye, FaArrowRight, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import Dashboard from './Dashboard';
import AIIntelligenceSection from './ai/AIIntelligenceSection';
import ConcertFinderSection from './concerts/ConcertFinderSection';
import type { SpotifyData } from '@/types/spotify';
import { getDataForTimeRange, MockSpotifyData } from '../lib/mockData';

export function LandingPage() {

type AppState = 'landing' | 'loading' | 'dashboard' | 'error';
type AuthMethod = 'spotify' | 'mock' | null;
type ErrorType = 'auth_failed' | 'network_error' | 'insufficient_data' | 'rate_limit' | 'unknown';

interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
}



// State and handlers (only one set)
const [appState, setAppState] = useState<AppState>('landing');
const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
const [error, setError] = useState<AppError | null>(null);
const [spotifyData, setSpotifyData] = useState<MockSpotifyData | null>(null);
const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term');
const { data: session, status } = useSession();

useEffect(() => {
  const fetchSpotifyData = async () => {
    if (session) {
      try {
        const res = await fetch(`/api/spotify/top-items?time_range=${timeRange}`);
        if (!res.ok) throw new Error('Failed to fetch Spotify data');
        const data = await res.json();
        // Always use the correct time range for topTracks/topArtists if available
        const topTracks = data.topTracksByTimeRange?.[timeRange] || data.topTracks || [];
        const topArtists = data.topArtistsByTimeRange?.[timeRange] || data.topArtists || [];
        const musicIntelligence = data.discoveryMetrics || null;
        // Extract top genres from topArtists (flatten, count, sort by frequency)
        let topGenres: string[] = [];
        if (Array.isArray(topArtists)) {
          const genreCounts: Record<string, number> = {};
          topArtists.forEach((artist: { genres?: string[] }) => {
            if (Array.isArray(artist.genres)) {
              artist.genres.forEach((genre: string) => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
              });
            }
          });
          topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre)
            .slice(0, 10);
        }
        setSpotifyData({
          ...data,
          topTracks,
          topArtists,
          musicIntelligence,
          topGenres,
        });
      } catch (err) {
        setError({ type: 'network_error', message: 'Failed to load Spotify data', details: (err instanceof Error ? err.message : String(err)) });
      }
    } else {
      setSpotifyData(null);
    }
  };
  fetchSpotifyData();
}, [session, timeRange]);

const handleSpotifyLogin = () => {
  signIn('spotify', { callbackUrl: '/' });
};

const handleMockData = () => {
  setAuthMethod('mock');
  setSpotifyData(getDataForTimeRange(timeRange));
  setAppState('dashboard');
};

const handleLogout = () => {
  setAppState('landing');
  setAuthMethod(null);
  setError(null);
};

const handleRetry = () => {
  setError(null);
  setAppState('landing');
};

// Conditional rendering (only one set)
if (status === 'loading' || appState === 'loading') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="text-[#1DB954] text-6xl mx-auto animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">
          {authMethod === 'spotify' ? 'Connecting to Spotify...' : 'Loading Dashboard...'}
        </h2>
        <p className="text-gray-400 mb-8">
          {authMethod === 'spotify'
            ? 'Authenticating your account and fetching your music data'
            : 'Preparing your personalized music insights'}
        </p>
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#1DB954] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

if (error || appState === 'error') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{error?.message}</h2>
        <p className="text-gray-400 mb-8">{error?.details}</p>
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            <FaArrowRight />
            Try Again
          </button>
          {error?.type === 'auth_failed' || error?.type === 'insufficient_data' ? (
            <button
              onClick={handleMockData}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              <FaEye />
              Try Demo Instead
            </button>
          ) : null}
        </div>
        <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">
            {error?.type === 'insufficient_data' && "💡 New Spotify accounts need at least 4 weeks of listening history."}
            {error?.type === 'rate_limit' && "💡 Rate limits reset every hour. Try again later."}
            {error?.type === 'auth_failed' && "💡 Make sure you're using a valid Spotify account."}
            {error?.type === 'network_error' && "💡 Check your internet connection and try again."}
          </p>
        </div>
      </div>
    </div>
  );
}

if (session) {
  if (!spotifyData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-[#1DB954] text-6xl mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading your Spotify data...</h2>
        </div>
      </div>
    );
  }
  return <Dashboard isDemo={false} spotifyData={spotifyData ?? undefined} onLogout={handleLogout} timeRange={timeRange} onTimeRangeChange={setTimeRange} />;
}

if (appState === 'dashboard') {
  return (
    <Dashboard
      isDemo={authMethod === 'mock'}
      spotifyData={spotifyData ?? undefined}
      onLogout={handleLogout}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    />
  );
}

// Default: Landing page UI with sign in and demo options
return (
  <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] flex items-center justify-center">
    <div className="max-w-xl w-full mx-auto text-center p-8">
      <h1 className="text-4xl font-bold text-white mb-6">Welcome to My Spotify Wrapped</h1>
      <p className="text-gray-400 mb-8">Sign in with Spotify to see your personalized music insights, or try the demo.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 p-8 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer group"
             onClick={handleSpotifyLogin}>
          <FaSpotify className="text-[#1DB954] text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-white mb-3">Sign in with Spotify</h3>
          <p className="text-gray-300 text-sm mb-6">
            Connect your Spotify account to unlock your real listening stats, top tracks, artists, genres, and more.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#1DB954] font-semibold">
            <span>Connect Account</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-4 text-xs text-gray-400">
            ✓ Real listening data ✓ Personalized insights ✓ Live updates
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer group"
             onClick={handleMockData}>
          <FaEye className="text-purple-400 text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-white mb-3">Try Demo</h3>
          <p className="text-gray-300 text-sm mb-6">
            Explore the interface with sample data to see how the dashboard works before connecting your account.
          </p>
          <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
            <span>View Demo</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-4 text-xs text-gray-400">
            ✓ No login required ✓ Sample data ✓ Full UI experience
          </div>
        </div>
      </div>
      <div className="mt-12 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-sm">
          <FaSpotify className="inline mr-2" />
          This app uses the Spotify Web API and requires Premium for full functionality.
          Your data is processed securely and never stored permanently.
        </p>
      </div>
      {/* Show AI and Concert Finder preview when spotifyData (or demo data) is present */}
      {spotifyData && (
        <div className="mt-10 space-y-8">
          <AIIntelligenceSection spotifyData={spotifyData as unknown as SpotifyData} className="w-full" />
          <ConcertFinderSection spotifyData={spotifyData as unknown as SpotifyData} className="w-full" />
        </div>
      )}
    </div>
  </div>
);
}

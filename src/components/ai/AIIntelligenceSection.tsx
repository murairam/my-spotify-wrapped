// src/components/ai/AIIntelligenceSection.tsx - DEBUG VERSION
'use client';

import React, { useState } from 'react';
import { FaBrain, FaRocket } from 'react-icons/fa';
import AIPersonalityCard from './AIPersonalityCard';
import AIConcertFinder from './AIConcertFinder';
import AIArtistDiscovery from './AIArtistDiscovery';
import AIPlaylistGenerator from './AIPlaylistGenerator';
import AIMoodAnalysis from './AIMoodAnalysis';
import type { SpotifyData } from '@/types/spotify';
import useAIAnalysis from '@/hooks/useAIAnalysis';

interface AIIntelligenceSectionProps {
  spotifyData: SpotifyData;
  className?: string;
}

export default function AIIntelligenceSection({ spotifyData, className = '' }: AIIntelligenceSectionProps) {
  const [userLocation, setUserLocation] = useState('');
  const { analysis, isLoading, error, analyzeData } = useAIAnalysis();

  const handleStartAnalysis = async () => {
    if (!spotifyData) return;

    await analyzeData({
      spotifyData,
      userLocation: userLocation.trim() || undefined,
      preferences: {
        includeConcerts: true,
        includeNewArtists: true,
        includePlaylistSuggestions: true,
        includeMoodAnalysis: true,
        // FORCE debug output for troubleshooting
        includeDebug: true
      }
    });
  };

  // EXTRA DEBUG LOGGING IN RENDER
  React.useEffect(() => {
    if (analysis) {
      console.log("🔍 RENDER DEBUG: Analysis in component:", analysis);
      console.log("🔍 RENDER DEBUG: Enhanced data:", analysis.enhanced);
      console.log("🔍 RENDER DEBUG: Debug property:", analysis.debug);
      console.log("🔍 RENDER DEBUG: newArtists:", analysis.enhanced?.newArtists);
      console.log("🔍 RENDER DEBUG: playlists:", analysis.enhanced?.playlists);
      console.log("🔍 RENDER DEBUG: moodAnalysis:", analysis.enhanced?.moodAnalysis);
    }
  }, [analysis]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* AI Intelligence Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <FaBrain className="text-white text-xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">AI Music Intelligence</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Discover deeper insights about your music taste with AI-powered analysis,
          concert recommendations, and personalized discoveries.
        </p>
      </div>

      {/* Analysis Trigger */}
      {!analysis && !isLoading && (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaRocket className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Ready for AI Analysis?</h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                Let our AI analyze your music taste to find concerts, discover new artists,
                create playlists, and understand your musical personality.
              </p>
            </div>

            {/* Location input for concerts */}
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                Your City (for concert recommendations)
              </label>
              <input
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                placeholder="e.g., Paris, New York, Tokyo..."
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={!spotifyData}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              🚀 Start AI Analysis
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 text-center">
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto"></div>
            <h3 className="text-lg font-semibold text-white">AI is analyzing your music...</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>🎭 Understanding your musical personality</div>
              <div>🎵 Finding concerts in your area</div>
              <div>🔍 Discovering new artists for you</div>
              <div>💭 Analyzing your listening patterns</div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Analysis Failed</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={handleStartAnalysis}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AIPersonalityCard analysis={analysis} />
            <AIConcertFinder
              concerts={analysis.enhanced?.concerts || []}
              userLocation={userLocation}
            />
            <AIArtistDiscovery
              newArtists={
                analysis.enhanced?.newArtists === undefined
                  ? undefined
                  : typeof analysis.enhanced.newArtists === 'string'
                    ? analysis.enhanced.newArtists
                    : JSON.stringify(analysis.enhanced.newArtists)
              }
            />
            <AIPlaylistGenerator
              playlists={
                analysis.enhanced?.playlists === undefined
                  ? undefined
                  : typeof analysis.enhanced.playlists === 'string'
                    ? analysis.enhanced.playlists
                    : JSON.stringify(analysis.enhanced.playlists)
              }
            />
            <AIMoodAnalysis
              moodAnalysis={
                analysis.enhanced?.moodAnalysis === undefined
                  ? undefined
                  : typeof analysis.enhanced.moodAnalysis === 'string'
                    ? analysis.enhanced.moodAnalysis
                    : JSON.stringify(analysis.enhanced.moodAnalysis)
              }
              className="lg:col-span-2"
            />
          </div>

          {/* ALWAYS SHOW DEBUG PANEL FOR TROUBLESHOOTING */}
          <DebugPanel
            analysis={analysis}
            debug={analysis.debug}
          />
        </div>
      )}
    </div>
  );
}

function DebugPanel({ analysis, debug }: {
  analysis: {
    summary: string;
    enhanced: Record<string, unknown>;
    confidence: number;
    timestamp: string;
    debug?: {
      aiText?: string;
      aiJson?: unknown;
    };
  };
  debug?: { aiText?: string; aiJson?: unknown }
}) {
  const [open, setOpen] = useState(true); // Start open for debugging

  return (
    <div className="mt-6 p-4 bg-black/20 border border-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-white font-semibold">🔍 Debug Panel (Always Visible for Troubleshooting)</h4>
        <button className="text-xs text-gray-400" onClick={() => setOpen(!open)}>
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div className="mt-3 text-sm text-gray-200 space-y-3">
          <div>
            <h5 className="text-xs text-yellow-400 mb-1">Analysis Object Keys:</h5>
            <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-32 text-xs">
              {JSON.stringify(Object.keys(analysis || {}), null, 2)}
            </pre>
          </div>

          <div>
            <h5 className="text-xs text-yellow-400 mb-1">Enhanced Object:</h5>
            <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-48 text-xs">
              {JSON.stringify(analysis?.enhanced, null, 2)}
            </pre>
          </div>

          {debug ? (
            <>
              <div>
                <h5 className="text-xs text-green-400 mb-1">AI Raw Text (First 500 chars):</h5>
                <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-48 text-xs whitespace-pre-wrap">
                  {typeof debug.aiText === 'string' ? debug.aiText.substring(0, 500) + '...' : 'No AI text'}
                </pre>
              </div>
              <div>
                <h5 className="text-xs text-green-400 mb-1">AI Parsed JSON:</h5>
                <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-64 text-xs">
                  {JSON.stringify(debug.aiJson, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div>
              <h5 className="text-xs text-red-400 mb-1">❌ No Debug Data Available</h5>
              <p className="text-xs text-gray-400">The API response didn&apos;t include debug information.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

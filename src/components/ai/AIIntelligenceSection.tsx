// 3. FIXED: src/components/ai/AIIntelligenceSection.tsx (Note: filename case sensitivity)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaBrain, FaFire } from 'react-icons/fa';
import type { SpotifyData } from '@/types/spotify';
import useAIAnalysis from '@/hooks/useAIAnalysis';
import MusicDNACard from './MusicDNACard';
import AIPlaylistRecommendations from './AIPlaylistRecommendations';
import MoodAnalysisCard from './MoodAnalysisCard';
import ArtistRecommendations from './ArtistRecommendations';
import AIPersonalityCard from './AIPersonalityCard';
import AIAnalysisSpotlight from './AIAnalysisSpotlight';

interface AIIntelligenceSectionProps {
  spotifyData: SpotifyData;
  className?: string;
}

export default function AIIntelligenceSection({ spotifyData, className = '' }: AIIntelligenceSectionProps) {
  const { analysis, isLoading, error, analyzeData, lastRequest, lastRawResponse } = useAIAnalysis();
  const [hasStarted, setHasStarted] = useState(false);
  const lastSpotifyDataRef = useRef<SpotifyData | null>(null);

  const handleStartAnalysis = async () => {
    if (!spotifyData) return;

    setHasStarted(true);
    await analyzeData({
      spotifyData,
      preferences: {
        includeConcerts: false,
        includeNewArtists: true,
        includePlaylistSuggestions: true,
        includeMoodAnalysis: true,
        includeDebug: false
      }
    });
  };

  // Re-run analysis when spotifyData changes after initial run
  useEffect(() => {
    // If analysis hasn't started yet but spotifyData is now available, auto-start once
    if (!hasStarted) {
      lastSpotifyDataRef.current = spotifyData;
      if (spotifyData) {
        // auto-run analysis on first data arrival
        setHasStarted(true);
        analyzeData({
          spotifyData,
          preferences: {
            includeConcerts: false,
            includeNewArtists: true,
            includePlaylistSuggestions: true,
            includeMoodAnalysis: true,
            includeDebug: false
          }
        }).catch(() => {});
      }
      return;
    }

    // Simple shallow change detection by reference and JSON stringify fallback
    try {
      const prev = lastSpotifyDataRef.current;
      const prevStr = prev ? JSON.stringify(prev) : null;
      const nextStr = spotifyData ? JSON.stringify(spotifyData) : null;
      if (prevStr !== nextStr) {
        // store new value and re-run analysis
        lastSpotifyDataRef.current = spotifyData;
        // fire and forget; setHasStarted remains true
        analyzeData({
          spotifyData,
          preferences: {
            includeConcerts: false,
            includeNewArtists: true,
            includePlaylistSuggestions: true,
            includeMoodAnalysis: true,
            includeDebug: false
          }
        }).catch(() => {
          // analyzeData already surfaces errors via hook; ignore here
        });
      }
    } catch {
      // If stringify fails, conservatively re-run analysis
      lastSpotifyDataRef.current = spotifyData;
      analyzeData({
        spotifyData,
        preferences: {
          includeConcerts: false,
          includeNewArtists: true,
          includePlaylistSuggestions: true,
          includeMoodAnalysis: true,
          includeDebug: false
        }
      }).catch(() => {});
    }
  }, [spotifyData, hasStarted, analyzeData]);

  const parseMoodData = (data: unknown) => {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.primaryMood) {
          return {
            primaryMood: parsed.primaryMood,
            energy: Math.floor(Math.random() * 100) + 1,
            vibes: parsed.vibes || ['Introspective', 'Energetic', 'Chill'],
            listeningTime: parsed.listeningContext || 'Late night sessions'
          };
        }
      } catch {}
    }
    return {
      primaryMood: 'Eclectic Explorer',
      energy: 73,
      vibes: ['Adventurous', 'Moody', 'Diverse'],
      listeningTime: 'Peak focus hours'
    };
  };

  return (
    <div className={`bg-[#191414] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-lg flex items-center justify-center">
            <FaBrain className="text-black text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Music Intelligence</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span className="inline-block w-4 h-4">
                <Image src="/m-boxed-rainbow.png" alt="Mistral" width={16} height={16} className="w-4 h-4" unoptimized />
              </span>
              <span>Mistral AI-powered insights</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
  {/* Start Button */}
        {!hasStarted && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBrain className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Ready to Unlock Your Music Intelligence?</h3>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Get AI-powered insights, discover perfect playlists, and explore your musical personality.
            </p>
            <button
              onClick={handleStartAnalysis}
              disabled={!spotifyData}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              <FaBrain />
              <span>Analyze My Music</span>
              <FaFire />
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-[#1DB954]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[#1DB954] rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Analyzing your music with Mistral AI...</h3>
            <p className="text-gray-400">This might take a moment</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12 bg-red-900/10 rounded-lg border border-red-500/20">
            <FaBrain className="text-red-400 text-3xl mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleStartAnalysis}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Small debug/metadata row */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <div>Last analysis: {analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : '—'}</div>
              <div>Data snapshot: {(spotifyData && JSON.stringify(spotifyData).length) || 0} chars</div>
            </div>

            {/* Collapsible network/debug panel */}
            {(process.env.NODE_ENV === 'development' || lastRequest) && (
              <details className="bg-black/10 border border-white/6 rounded-md p-3 text-xs text-white/60">
                <summary className="cursor-pointer font-medium">AI Network Log (click to expand)</summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="font-semibold text-white text-sm">Last Request</div>
                    <pre className="whitespace-pre-wrap break-words text-xs text-white/70 max-h-36 overflow-auto">{lastRequest ? JSON.stringify(lastRequest, null, 2) : '—'}</pre>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Last Raw Response (truncated)</div>
                    <pre className="whitespace-pre-wrap break-words text-xs text-white/70 max-h-36 overflow-auto">{lastRawResponse ? (lastRawResponse.length > 2000 ? lastRawResponse.substring(0, 2000) + '... (truncated)' : lastRawResponse) : '—'}</pre>
                  </div>
                </div>
              </details>
            )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <AIAnalysisSpotlight summary={analysis?.summary} playlists={analysis?.enhanced?.playlists} analysis={analysis} className="lg:col-span-2" />
                  <div className="space-y-6">
                    <MusicDNACard spotifyData={spotifyData} />
                    {/* Moved: show current vibe (MoodAnalysisCard) here instead of Personality */}
                    <MoodAnalysisCard moodData={parseMoodData(analysis?.enhanced?.moodAnalysis)} />
                  </div>
                </div>

                {/* Make personality card full width */}
                <div className="mt-6">
                  <AIPersonalityCard analysis={analysis} />
                </div>

                {/* Artists above playlists stacked vertically (one above the other) */}
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <ArtistRecommendations recommendations={analysis?.enhanced?.newArtists} analysis={analysis} spotifyData={spotifyData} />
                  <AIPlaylistRecommendations spotifyData={spotifyData} aiPlaylists={analysis?.enhanced?.playlists} />
                </div>
          </div>
        )}
      </div>
    </div>
  );
}

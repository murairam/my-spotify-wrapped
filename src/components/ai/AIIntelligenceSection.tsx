// src/components/ai/AIIntelligenceSection.tsx - IMPROVED VERSION
'use client';

import React, { useState } from 'react';
import { FaBrain, FaRocket, FaMusic, FaHeart, FaMagic, FaPlay } from 'react-icons/fa';
import AIPersonalityCard from './AIPersonalityCard';
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
  const { analysis, isLoading, error, analyzeData } = useAIAnalysis();
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartAnalysis = async () => {
    if (!spotifyData) return;

    await analyzeData({
      spotifyData,
      preferences: {
        includeConcerts: false, // Separate concerts from AI analysis
        includeNewArtists: true,
        includePlaylistSuggestions: true,
        includeMoodAnalysis: true,
        includeDebug: true
      }
    });
  };

  const analysisSteps = [
    { icon: FaBrain, text: "Analyzing your musical DNA...", color: "from-purple-500 to-blue-500" },
    { icon: FaMusic, text: "Finding your perfect artists...", color: "from-blue-500 to-cyan-500" },
    { icon: FaHeart, text: "Reading your emotional patterns...", color: "from-cyan-500 to-green-500" },
    { icon: FaMagic, text: "Crafting personalized playlists...", color: "from-green-500 to-yellow-500" }
  ];

  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % analysisSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isLoading, analysisSteps.length]);

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Enhanced Header */}
      <div className="text-center relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 rounded-3xl p-8 border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-2xl">
                <FaBrain className="text-white text-2xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <FaMagic className="text-yellow-900 text-xs" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-black text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Music Intelligence
              </h2>
              <p className="text-lg text-gray-300 font-medium">
                Unlock the secrets of your musical soul
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-base max-w-3xl mx-auto leading-relaxed">
            Our advanced AI analyzes your listening patterns, emotional connections, and musical DNA to reveal
            hidden insights about your taste and discover your next favorite artists.
          </p>
        </div>
      </div>

      {/* Analysis Trigger */}
      {!analysis && !isLoading && (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <FaRocket className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Discover Your Musical Identity?</h3>
            <p className="text-gray-300 text-base mb-8 max-w-lg mx-auto">
              Let our AI dive deep into your music taste to reveal patterns, discover new artists,
              and create the perfect playlists just for you.
            </p>

            <button
              onClick={handleStartAnalysis}
              disabled={!spotifyData}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FaMagic className="text-lg" />
                Analyze My Music DNA
                <FaPlay className="text-sm" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity -z-10" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {isLoading && (
        <div className="bg-gradient-to-br from-gray-900 to-purple-900/20 rounded-2xl border border-purple-500/30 p-8 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />

          <div className="relative z-10 space-y-6">
            {/* Animated Icon */}
            <div className="relative mx-auto w-16 h-16">
              <div className={`absolute inset-0 bg-gradient-to-r ${analysisSteps[currentStep].color} rounded-full animate-spin`} />
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                {React.createElement(analysisSteps[currentStep].icon, {
                  className: "text-white text-xl"
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI is analyzing your music...</h3>
              <p className="text-purple-300 font-medium">{analysisSteps[currentStep].text}</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center space-x-4 mt-8">
              {analysisSteps.map((step, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 scale-125'
                      : index < currentStep
                        ? 'bg-green-400'
                        : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              This may take up to 30 seconds...
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <FaBrain className="text-red-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-red-400 mb-3">Analysis Failed</h3>
          <p className="text-red-300 text-sm mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleStartAnalysis}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Results Header */}
          <div className="text-center bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl p-6 border border-green-500/20">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
              <FaMagic className="text-white text-lg" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your Musical DNA Decoded</h3>
            <p className="text-gray-300">Based on your unique listening patterns and preferences</p>
          </div>

          {/* Enhanced Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(() => {
              // Safely extract optional personality fields from analysis.enhanced
              const enhancedRaw = analysis.enhanced as unknown;
              const getString = (key: string, fallback: string) => {
                try {
                  if (enhancedRaw && typeof enhancedRaw === 'object' && key in (enhancedRaw as Record<string, unknown>)) {
                    const val = (enhancedRaw as Record<string, unknown>)[key];
                    if (typeof val === 'string' && val.trim().length > 0) return val;
                  }
                } catch {
                  // ignore
                }
                return fallback;
              };

              const musicPersonality = getString('musicPersonality', getString('userProfileSummary', 'Your unique musical identity reflects a diverse and evolving taste.'));
              const discoveryStyle = getString('discoveryStyle', 'You have an adventurous approach to finding new music.');
              const socialProfile = getString('socialProfile', 'Your musical social patterns show thoughtful curation and sharing.');

              return (
                <AIPersonalityCard
                  analysis={{
                    ...analysis,
                    enhanced: {
                      ...analysis.enhanced,
                      musicPersonality,
                      discoveryStyle,
                      socialProfile
                    }
                  }}
                />
              );
            })()}

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

            <div className="lg:col-span-2">
              <AIMoodAnalysis
                moodAnalysis={
                  analysis.enhanced?.moodAnalysis === undefined
                    ? undefined
                    : typeof analysis.enhanced.moodAnalysis === 'string'
                      ? analysis.enhanced.moodAnalysis
                      : JSON.stringify(analysis.enhanced.moodAnalysis)
                }
              />
            </div>
          </div>

          {/* Debug Panel - Only show in development */}
          {process.env.NODE_ENV === 'development' && analysis.debug && (
            <DebugPanel debug={analysis.debug} />
          )}
        </div>
      )}
    </div>
  );
}

function DebugPanel({ debug }: { debug: { aiText?: string; aiJson?: unknown } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 p-4 bg-black/30 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-white font-semibold">🔧 Developer Debug Panel</h4>
        <button
          className="text-xs text-gray-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Hide' : 'Show'} Debug Data
        </button>
      </div>
      {open && (
        <div className="mt-4 text-sm text-gray-200 space-y-4">
          <div>
            <h5 className="text-xs text-yellow-400 mb-2">AI Raw Response (First 500 chars):</h5>
            <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-40 text-xs whitespace-pre-wrap border border-gray-600">
              {typeof debug.aiText === 'string' ? debug.aiText.substring(0, 500) + '...' : 'No AI text available'}
            </pre>
          </div>
          <div>
            <h5 className="text-xs text-green-400 mb-2">Parsed JSON Structure:</h5>
            <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-60 text-xs border border-gray-600">
              {JSON.stringify(debug.aiJson, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

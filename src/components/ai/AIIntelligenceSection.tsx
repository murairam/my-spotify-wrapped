// 3. FIXED: src/components/ai/AIIntelligenceSection.tsx (Note: filename case sensitivity)
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaBrain, FaFire } from 'react-icons/fa';
import type { SpotifyData } from '@/types/spotify';
import useAIAnalysis from '@/hooks/useAIAnalysis';
import MusicDNACard from './MusicDNACard';
import AIPlaylistRecommendations from './AIPlaylistRecommendations';
import ArtistRecommendations from './ArtistRecommendations';
import AIPersonalityCard from './AIPersonalityCard';
import AIStory from './AIStory';
import MusicSpiritAnimal from './MusicSpiritAnimal';

interface AIIntelligenceSectionProps {
  spotifyData: SpotifyData;
  className?: string;
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {labels.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done ? 'bg-[#00BFFF]/30 text-[#00BFFF]' :
                  active ? 'bg-[#00BFFF] text-black shadow-glow' :
                  'bg-white/5 text-gray-600'
                }`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${
                active ? 'text-[#00BFFF]' : done ? 'text-[#00BFFF]/50' : 'text-gray-600'
              }`}>{label}</span>
            </div>
            {i < total - 1 && (
              <div className={`h-px w-8 mb-4 transition-all ${step < current ? 'bg-[#00BFFF]/40' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function AIIntelligenceSection({ spotifyData, className = '' }: AIIntelligenceSectionProps) {
  const { analysis, error, analyzeData } = useAIAnalysis();
  const [storyStep, setStoryStep] = useState<'start' | 'loading' | 'dna' | 'personality' | 'recommendations'>('start');

  const handleStartAnalysis = async () => {
    if (!spotifyData) return;

    setStoryStep('loading');
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
    setStoryStep('dna');
  };

  const handleNextStep = () => {
    switch (storyStep) {
      case 'dna':
        setStoryStep('personality');
        break;
      case 'personality':
        setStoryStep('recommendations');
        break;
      default:
        break;
    }
  };



  return (
    <div className={`bg-[#080808] rounded-xl border border-[#00BFFF]/15 overflow-hidden transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#00BFFF]/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00BFFF] rounded-lg flex items-center justify-center shadow-glow">
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
        {(() => {
          switch (storyStep) {
            case 'start':
              return (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#00BFFF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-lg">
                    <FaBrain className="text-black text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Ready to Unlock Your Music Intelligence?</h3>
                  <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                    Get AI-powered insights, discover perfect playlists, and explore your musical personality.
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    disabled={!spotifyData}
                    className="bg-[#00BFFF] hover:bg-[#33ccff] text-black font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-glow hover:shadow-glow-lg"
                  >
                    <FaBrain />
                    <span>Analyze My Music</span>
                    <FaFire />
                  </button>
                </div>
              );
            case 'loading':
              return (
                <div className="text-center py-16">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-[#00BFFF]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-[#00BFFF] rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Analyzing your music with Mistral AI...</h3>
                  <p className="text-gray-400 mb-1">Crunching your listening history — usually takes 10–20 seconds</p>
                  <p className="text-[#00BFFF]/50 text-xs mt-3">Building your music DNA, personality profile &amp; playlist suggestions</p>
                </div>
              );
            case 'dna':
              return (
                <div className="space-y-4">
                  <StepIndicator current={1} total={3} labels={['Your DNA', 'Your Story', 'Discover']} />
                  {analysis && <MusicSpiritAnimal analysis={analysis} />}
                  <MusicDNACard spotifyData={spotifyData} />
                  <button
                    onClick={handleNextStep}
                    className="w-full mt-2 bg-[#00BFFF] hover:bg-[#33ccff] text-black font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                  >
                    Continue to Your Story →
                  </button>
                </div>
              );
            case 'personality':
              return (
                <div className="space-y-4">
                  <StepIndicator current={2} total={3} labels={['Your DNA', 'Your Story', 'Discover']} />
                  {analysis && <AIStory analysis={analysis} />}
                  {analysis && <AIPersonalityCard analysis={analysis} />}
                  <button
                    onClick={handleNextStep}
                    className="w-full mt-2 bg-[#00BFFF] hover:bg-[#33ccff] text-black font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                  >
                    See Recommendations →
                  </button>
                </div>
              );
            case 'recommendations':
              return (
                <div className="space-y-4">
                  <StepIndicator current={3} total={3} labels={['Your DNA', 'Your Story', 'Discover']} />
                  {analysis && <ArtistRecommendations recommendations={analysis?.enhanced?.newArtists} analysis={analysis} spotifyData={spotifyData} />}
                  {analysis && <AIPlaylistRecommendations spotifyData={spotifyData} aiPlaylists={analysis?.enhanced?.playlists} />}
                </div>
              );
          }
        })()}
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
      </div>
    </div>
  );
}

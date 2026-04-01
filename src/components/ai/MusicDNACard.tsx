// src/components/ai/MusicDNACard.tsx
'use client';

import React from 'react';
import type { SpotifyData, AIAnalysisResponse } from '@/types/spotify';

interface MusicDNACardProps {
  spotifyData: SpotifyData;
  analysis?: AIAnalysisResponse | null;
  className?: string;
}

export default function MusicDNACard({ spotifyData, analysis, className = '' }: MusicDNACardProps) {
  const genres = spotifyData?.topGenres?.slice(0, 5) || [];
  const threeWordTagline = analysis?.enhanced?.threeWordTagline as string[] | undefined;
  const mainstreamScore = spotifyData?.musicIntelligence?.mainstreamTaste ?? 65;

  // Descending bar widths for top 5 genres
  const barWidths = [100, 78, 58, 40, 24];

  // Mood label from AI analysis
  const moodLabel = (() => {
    const mood = analysis?.enhanced?.moodAnalysis;
    if (!mood) return null;
    if (typeof mood === 'object' && mood !== null && 'primaryMood' in mood) {
      return (mood as { primaryMood?: string }).primaryMood ?? null;
    }
    return null;
  })();

  const moodColors: Record<string, { bg: string; text: string; border: string }> = {
    'Energetic Explorer':  { bg: 'rgba(255,107,107,0.12)', text: '#FF6B6B', border: 'rgba(255,107,107,0.3)' },
    'Chill Curator':       { bg: 'rgba(0,191,255,0.10)',   text: '#00BFFF', border: 'rgba(0,191,255,0.3)'   },
    'Nostalgic Wanderer':  { bg: 'rgba(255,215,0,0.10)',   text: '#FFD700', border: 'rgba(255,215,0,0.3)'   },
    'Genre Bender':        { bg: 'rgba(155,139,244,0.12)', text: '#9B8BF4', border: 'rgba(155,139,244,0.3)' },
    'Mainstream Mixer':    { bg: 'rgba(0,191,255,0.10)',   text: '#00BFFF', border: 'rgba(0,191,255,0.3)'   },
    'Underground Hunter':  { bg: 'rgba(155,139,244,0.12)', text: '#9B8BF4', border: 'rgba(155,139,244,0.3)' },
  };
  const moodStyle = moodLabel ? (moodColors[moodLabel] ?? moodColors['Chill Curator']) : null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-[#00BFFF]/15 hover:border-[#00BFFF]/30 transition-all ${className}`}
      style={{ background: 'linear-gradient(135deg, #080808 0%, #0a0814 100%)' }}>

      {/* Three-word tagline hero — AI generated */}
      {threeWordTagline && threeWordTagline.length > 0 && (
        <div className="px-6 pt-6 pb-4 text-center border-b border-white/5">
          <p className="text-xs font-medium text-white/40 mb-3">Your sound in three words</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {threeWordTagline.map((word, i) => (
              <span
                key={word}
                className="text-lg font-black px-4 py-2 rounded-xl"
                style={{
                  background: i === 0
                    ? 'linear-gradient(135deg, rgba(0,191,255,0.2), rgba(0,191,255,0.05))'
                    : i === 1
                    ? 'linear-gradient(135deg, rgba(155,139,244,0.2), rgba(155,139,244,0.05))'
                    : 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,107,107,0.03))',
                  color: i === 0 ? '#00BFFF' : i === 1 ? '#9B8BF4' : '#FF8FAB',
                  border: `1px solid ${i === 0 ? 'rgba(0,191,255,0.25)' : i === 1 ? 'rgba(155,139,244,0.25)' : 'rgba(255,143,171,0.2)'}`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Mood badge */}
        {moodLabel && moodStyle && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/45">Listening mood</p>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: moodStyle.bg, color: moodStyle.text, border: `1px solid ${moodStyle.border}` }}
            >
              {moodLabel}
            </span>
          </div>
        )}

        {/* Genre bars */}
        {genres.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-white/45 mb-3">Top genres</p>
            {genres.map((genre, i) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="text-xs text-white/65 w-28 truncate capitalize">{genre}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidths[i] ?? 20}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, #00BFFF, #33d4ff)'
                        : i === 1
                        ? 'linear-gradient(90deg, #00BFFF, #9B8BF4)'
                        : `linear-gradient(90deg, rgba(0,191,255,${0.6 - i * 0.1}), rgba(155,139,244,${0.6 - i * 0.1}))`,
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mainstream bar — replaces the boring 67%/33% boxes */}
        <div>
          <div className="flex justify-between text-xs text-white/45 mb-2">
            <span>Underground</span>
            <span>Mainstream</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${mainstreamScore}%`,
                background: mainstreamScore > 60
                  ? 'linear-gradient(90deg, #9B8BF4, #00BFFF)'
                  : 'linear-gradient(90deg, #FF6B6B, #9B8BF4)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-white/45">{100 - mainstreamScore}% unique</span>
            <span className="text-xs text-white/45">{mainstreamScore}% popular</span>
          </div>
        </div>
      </div>
    </div>
  );
}

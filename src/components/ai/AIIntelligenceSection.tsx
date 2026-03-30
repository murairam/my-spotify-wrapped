'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaBrain, FaFire } from 'react-icons/fa';
import type { SpotifyData, SpotifyArtist } from '@/types/spotify';
import useAIAnalysis from '@/hooks/useAIAnalysis';
import MusicDNACard from './MusicDNACard';
import AIPlaylistRecommendations from './AIPlaylistRecommendations';
import ArtistRecommendations from './ArtistRecommendations';
import AIPersonalityCard from './AIPersonalityCard';
import AIStory from './AIStory';
import MusicSpiritAnimal from './MusicSpiritAnimal';

interface RecentTrack {
  track: unknown;
  played_at: string;
}

interface AIIntelligenceSectionProps {
  spotifyData: SpotifyData;
  recentTracks?: RecentTrack[] | null;
  className?: string;
}

type Step = 'start' | 'loading' | 'dna' | 'personality' | 'recommendations';

const STEPS = [
  { key: 'dna',             label: 'Your DNA',    num: 1 },
  { key: 'personality',     label: 'Your Story',  num: 2 },
  { key: 'recommendations', label: 'Discover',    num: 3 },
] as const;

const STEP_GRADIENTS: Record<string, string> = {
  dna:             'linear-gradient(135deg, rgba(0,191,255,0.12) 0%, rgba(0,191,255,0.02) 100%)',
  personality:     'linear-gradient(135deg, rgba(155,139,244,0.12) 0%, rgba(155,139,244,0.02) 100%)',
  recommendations: 'linear-gradient(135deg, rgba(0,200,120,0.10) 0%, rgba(0,200,120,0.01) 100%)',
};

const STEP_ACCENT: Record<string, string> = {
  dna:             '#00BFFF',
  personality:     '#9B8BF4',
  recommendations: '#00C878',
};

// ─── Top Artist % card ────────────────────────────────────────────────────────

function estimateTopPercent(positionIndex: number, popularity: number): number {
  // Position 0 (top artist) + high popularity = very exclusive
  const base = [1, 3, 6][positionIndex] ?? 10;
  if (popularity >= 85) return base;
  if (popularity >= 70) return Math.round(base * 1.5);
  return Math.round(base * 2.5);
}

function TopArtistStatCard({ artists }: { artists: SpotifyArtist[] }) {
  const top = artists.slice(0, 2).filter(a => a.name);
  if (top.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 p-6"
      style={{ background: 'linear-gradient(135deg, #080808, #0a0814)' }}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5">Your Artist Loyalty</p>
      <div className="grid grid-cols-2 gap-4">
        {top.map((artist, i) => {
          const pct = estimateTopPercent(i, artist.popularity ?? 70);
          return (
            <div key={artist.id} className="flex items-center gap-4">
              {/* Artist image */}
              {artist.images?.[0]?.url ? (
                <Image
                  src={artist.images[0].url}
                  alt={artist.name}
                  width={52}
                  height={52}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
                  unoptimized
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/5 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs mb-0.5 truncate">{artist.name}</p>
                {/* Big % stat */}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl font-black"
                    style={{
                      background: i === 0
                        ? 'linear-gradient(90deg, #00BFFF, #33d4ff)'
                        : 'linear-gradient(90deg, #9B8BF4, #c4b8ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Top {pct}%
                  </span>
                </div>
                <p className="text-white/30 text-xs">of all {artist.name} listeners</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Biggest Listening Day card ───────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_VIBES: Record<string, string> = {
  Monday:    'You fuel the week with music.',
  Tuesday:   'Tuesday is your secret power day.',
  Wednesday:  'Midweek, you hit play the hardest.',
  Thursday:  'Almost Friday energy — your playlists know it.',
  Friday:    'Weekend mode: activated.',
  Saturday:  'Full volume, no plans, just music.',
  Sunday:    'Sunday sessions hit different.',
};

function BiggestListeningDayCard({ recentTracks }: { recentTracks: RecentTrack[] }) {
  const dayCounts: Record<string, number> = {};
  for (const item of recentTracks) {
    const d = new Date(item.played_at);
    if (!isNaN(d.getTime())) {
      const name = DAYS[d.getDay()];
      dayCounts[name] = (dayCounts[name] || 0) + 1;
    }
  }
  const entries = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const [topDay, topCount] = entries[0];
  const vibe = DAY_VIBES[topDay] ?? 'That was a great day for music.';

  return (
    <div className="rounded-2xl border border-white/8 p-6 text-center"
      style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,107,107,0.04), #080808)' }}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-4">Biggest Music Day</p>
      <p
        className="text-5xl font-black mb-2"
        style={{
          background: 'linear-gradient(135deg, #FFD700, #FF8FAB)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {topDay}
      </p>
      <p className="text-white/40 text-sm mb-3">{topCount} tracks played that day</p>
      <p className="text-white/25 text-xs italic">{vibe}</p>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((step, i) => {
        const done   = i < currentIdx;
        const active = step.key === current;
        const accent = STEP_ACCENT[step.key];
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? `${accent}40` : active ? accent : 'rgba(255,255,255,0.06)',
                  color:      done ? accent : active ? '#000' : 'rgba(255,255,255,0.3)',
                  boxShadow:  active ? `0 0 12px ${accent}60` : 'none',
                }}
              >
                {done ? '✓' : step.num}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: active ? accent : done ? `${accent}70` : 'rgba(255,255,255,0.25)' }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 mb-4 transition-all"
                style={{ background: i < currentIdx ? `${STEP_ACCENT[STEPS[i + 1].key]}40` : 'rgba(255,255,255,0.08)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIIntelligenceSection({ spotifyData, recentTracks, className = '' }: AIIntelligenceSectionProps) {
  const { analysis, error, analyzeData } = useAIAnalysis();
  const [storyStep, setStoryStep] = useState<Step>('start');

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
        includeDebug: false,
      },
    });
    setStoryStep('dna');
  };

  const nextStep = () => {
    if (storyStep === 'dna')         setStoryStep('personality');
    if (storyStep === 'personality') setStoryStep('recommendations');
  };

  const accent = storyStep in STEP_ACCENT ? STEP_ACCENT[storyStep] : '#00BFFF';
  const topArtists = (spotifyData?.topArtists ?? []) as SpotifyArtist[];

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/8 transition-all ${className}`}
      style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: '#00BFFF', boxShadow: '0 0 16px rgba(0,191,255,0.3)' }}>
          <FaBrain className="text-black text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Music Intelligence</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Image src="/m-boxed-rainbow.png" alt="Mistral" width={13} height={13} unoptimized />
            <span className="text-xs text-white/40">Powered by Mistral AI</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">

        {/* ── Start screen ── */}
        {storyStep === 'start' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #00BFFF, #9B8BF4)', boxShadow: '0 0 40px rgba(0,191,255,0.25)' }}>
              <FaBrain className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Ready to meet your music self?</h3>
            <p className="text-white/45 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Mistral AI will decode your listening DNA, find your spirit animal, and surface artists you&apos;ll obsess over.
            </p>
            <button
              onClick={handleStartAnalysis}
              disabled={!spotifyData}
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-2xl text-black transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00BFFF, #33d4ff)', boxShadow: '0 0 30px rgba(0,191,255,0.4)' }}
            >
              <FaBrain />
              Analyze My Music
              <FaFire />
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {storyStep === 'loading' && (
          <div className="text-center py-14">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00BFFF] animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#9B8BF4] animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-white font-semibold mb-2">Analyzing your listening DNA…</p>
            <p className="text-white/35 text-sm">Usually takes 10–20 seconds</p>
            <div className="flex justify-center gap-2 mt-5 flex-wrap">
              {['Finding your spirit animal', 'Mapping your genres', 'Writing your story'].map((label) => (
                <span key={label} className="text-[10px] text-white/25 bg-white/5 rounded-full px-3 py-1">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Steps ── */}
        {(storyStep === 'dna' || storyStep === 'personality' || storyStep === 'recommendations') && (
          <div>
            <StepIndicator current={storyStep} />

            <div className="rounded-2xl p-5 mb-5 space-y-4"
              style={{ background: STEP_GRADIENTS[storyStep], border: `1px solid ${accent}18` }}>

              {/* Step 1 — DNA: Top % + Biggest Day + Genre DNA */}
              {storyStep === 'dna' && (
                <>
                  <TopArtistStatCard artists={topArtists} />
                  {recentTracks && recentTracks.length > 0 && (
                    <BiggestListeningDayCard recentTracks={recentTracks} />
                  )}
                  <MusicDNACard spotifyData={spotifyData} analysis={analysis} />
                </>
              )}

              {/* Step 2 — Story: narrative + personality + SPIRIT ANIMAL REVEAL */}
              {storyStep === 'personality' && (
                <>
                  <AIStory analysis={analysis} />
                  <AIPersonalityCard analysis={analysis ?? { enhanced: {}, confidence: 0 }} />
                  {/* Spirit Animal as the climactic reveal */}
                  {analysis?.enhanced?.musicSpiritAnimal && (
                    <div>
                      <p className="text-center text-[10px] tracking-[0.2em] uppercase text-[#9B8BF4]/50 mb-3 mt-2">
                        ✦ Your Musical Identity Revealed ✦
                      </p>
                      <MusicSpiritAnimal analysis={analysis} />
                    </div>
                  )}
                </>
              )}

              {/* Step 3 — Discover */}
              {storyStep === 'recommendations' && (
                <>
                  <ArtistRecommendations
                    recommendations={analysis?.enhanced?.newArtists}
                    analysis={analysis ?? undefined}
                    spotifyData={spotifyData}
                  />
                  <AIPlaylistRecommendations
                    spotifyData={spotifyData}
                    aiPlaylists={analysis?.enhanced?.playlists}
                  />
                </>
              )}
            </div>

            {/* Next step button */}
            {storyStep !== 'recommendations' && (
              <button
                onClick={nextStep}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${accent}22, ${accent}10)`,
                  border: `1px solid ${accent}30`,
                  color: accent,
                }}
              >
                {storyStep === 'dna' ? 'Continue to Your Story →' : 'See Recommendations →'}
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 rounded-xl border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={handleStartAnalysis}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

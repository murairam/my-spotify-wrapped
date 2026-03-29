// src/components/ai/MusicSpiritAnimal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { AIAnalysisResponse } from '@/types/spotify';

interface MusicSpiritAnimalProps {
  analysis: AIAnalysisResponse | null;
}

const MusicSpiritAnimal: React.FC<MusicSpiritAnimalProps> = ({ analysis }) => {
  const [revealed, setRevealed] = useState(false);

  const enhanced = analysis?.enhanced;
  const musicSpiritAnimal = enhanced?.musicSpiritAnimal as string | undefined;
  const spiritAnimalDescription = enhanced?.spiritAnimalDescription as string | undefined;
  const threeWordTagline = enhanced?.threeWordTagline as string[] | undefined;

  useEffect(() => {
    if (musicSpiritAnimal) {
      const t = setTimeout(() => setRevealed(true), 300);
      return () => clearTimeout(t);
    }
  }, [musicSpiritAnimal]);

  if (!musicSpiritAnimal) return null;

  // Split emoji from the animal name (e.g. "🦅 Night Hawk" → ["🦅", "Night Hawk"])
  // Split on first whitespace — everything before is the emoji, everything after is the name
  const spaceIdx = musicSpiritAnimal.indexOf(' ');
  const emojiMatch = spaceIdx > 0
    ? [null, musicSpiritAnimal.slice(0, spaceIdx), musicSpiritAnimal.slice(spaceIdx + 1)]
    : null;
  const emoji = emojiMatch ? emojiMatch[1] : '🎵';
  const animalName = emojiMatch ? emojiMatch[2] : musicSpiritAnimal;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#00BFFF]/20 p-8 text-center transition-all duration-700"
      style={{
        background: 'linear-gradient(135deg, #080808 0%, #0a0a18 60%, #08080f 100%)',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'scale(1)' : 'scale(0.97)',
        filter: revealed ? 'blur(0px)' : 'blur(8px)',
      }}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,191,255,0.07) 0%, transparent 70%)' }}
        />
      </div>

      {/* Label */}
      <p className="relative text-[10px] font-semibold tracking-[0.25em] uppercase text-[#00BFFF]/50 mb-5">
        Your Music Spirit Animal
      </p>

      {/* Emoji */}
      <div
        className="relative text-7xl mb-4 leading-none"
        style={{ filter: 'drop-shadow(0 0 24px rgba(0,191,255,0.35))' }}
      >
        {emoji}
      </div>

      {/* Animal name with gradient */}
      <h2
        className="relative text-4xl md:text-5xl font-black tracking-tight mb-4"
        style={{
          background: 'linear-gradient(90deg, #00BFFF 0%, #ffffff 50%, #9B8BF4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {animalName}
      </h2>

      {/* AI-generated one-liner */}
      {spiritAnimalDescription && (
        <p className="relative text-white/50 text-sm max-w-xs mx-auto leading-relaxed mb-5">
          {spiritAnimalDescription}
        </p>
      )}

      {/* Three-word tagline chips — AI generated */}
      {threeWordTagline && threeWordTagline.length > 0 && (
        <div className="relative flex justify-center gap-2 flex-wrap mb-5">
          {threeWordTagline.map((word) => (
            <span
              key={word}
              className="text-sm font-semibold text-white border border-[#00BFFF]/20 rounded-lg px-4 py-2"
              style={{ background: 'rgba(0,191,255,0.05)' }}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Subtle divider */}
      <div className="relative w-16 h-px bg-gradient-to-r from-transparent via-[#00BFFF]/30 to-transparent mx-auto mt-2" />

      {/* Watermark — key for shareability */}
      <p className="relative mt-4 text-[10px] text-white/20 tracking-widest uppercase">
        my-spotify-wrapped
      </p>
    </div>
  );
};

export default MusicSpiritAnimal;

// src/components/ai/AIPersonalityCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AIPersonalityCardProps {
  analysis: {
    enhanced?: {
      musicPersonality?: string;
      discoveryStyle?: string;
      socialProfile?: string;
      funFacts?: string[];
    };
    confidence?: number;
  };
  className?: string;
}

interface TraitChip {
  icon: string;
  label: string;
  // First sentence extracted from full text — shown on chip
  headline: string;
  // Full text — shown on expand
  full: string;
  accent: string;
  bg: string;
  border: string;
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].replace(/\*\*/g, '').trim() : text.split(' ').slice(0, 8).join(' ') + '…';
}

export default function AIPersonalityCard({ analysis, className = '' }: AIPersonalityCardProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const enhanced = analysis?.enhanced || {};
  const confidence = analysis?.confidence ?? 0;

  const musicPersonality = enhanced.musicPersonality || '';
  const discoveryStyle   = enhanced.discoveryStyle   || '';
  const socialProfile    = enhanced.socialProfile    || '';
  const funFacts         = enhanced.funFacts         || [];

  const chips: TraitChip[] = [
    {
      icon: '🎭',
      label: 'Musical Identity',
      headline: musicPersonality ? firstSentence(musicPersonality) : 'Defining your sound…',
      full: musicPersonality,
      accent: '#00BFFF',
      bg: 'rgba(0,191,255,0.07)',
      border: 'rgba(0,191,255,0.18)',
    },
    {
      icon: '🧭',
      label: 'Discovery Style',
      headline: discoveryStyle ? firstSentence(discoveryStyle) : 'How you find new music…',
      full: discoveryStyle,
      accent: '#9B8BF4',
      bg: 'rgba(155,139,244,0.07)',
      border: 'rgba(155,139,244,0.18)',
    },
    {
      icon: '🎧',
      label: 'Social Listening',
      headline: socialProfile ? firstSentence(socialProfile) : 'Your listening personality…',
      full: socialProfile,
      accent: '#FF8FAB',
      bg: 'rgba(255,143,171,0.07)',
      border: 'rgba(255,143,171,0.18)',
    },
    {
      icon: '⚡',
      label: 'Fun Fact',
      headline: funFacts.length > 0 ? funFacts[0].replace(/\*\*/g, '').replace(/^[^\s]+\s/, '').split('.')[0] : 'Interesting insight…',
      full: funFacts.join('\n\n'),
      accent: '#FFD700',
      bg: 'rgba(255,215,0,0.07)',
      border: 'rgba(255,215,0,0.18)',
    },
  ].filter(c => c.full.length > 0);

  if (chips.length === 0) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-[#00BFFF]/15 ${className}`}
      style={{ background: 'linear-gradient(135deg, #080808, #09090f)' }}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/m-boxed-rainbow.png" alt="Mistral" width={24} height={24} unoptimized />
          <span className="text-white font-semibold text-sm">Your Musical Personality</span>
        </div>
        {confidence > 0 && (
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#00BFFF]/60 bg-[#00BFFF]/8 border border-[#00BFFF]/15 px-2.5 py-1 rounded-full">
            {confidence}% confidence
          </span>
        )}
      </div>

      {/* 2×2 chip grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {chips.map((chip, i) => {
          const isOpen = expanded === i;
          return (
            <button
              key={chip.label}
              onClick={() => setExpanded(isOpen ? null : i)}
              className="text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: chip.bg, border: `1px solid ${chip.border}` }}
            >
              <div className="text-2xl mb-2">{chip.icon}</div>
              <p className="text-[10px] tracking-[0.15em] uppercase mb-1.5" style={{ color: chip.accent, opacity: 0.7 }}>
                {chip.label}
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                {isOpen ? chip.full.replace(/\*\*/g, '') : chip.headline}
              </p>
              {!isOpen && chip.full !== chip.headline && (
                <p className="text-[10px] mt-2" style={{ color: chip.accent, opacity: 0.5 }}>tap to expand ↓</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/5">
        <p className="text-[10px] text-white/25 text-center flex items-center justify-center gap-1.5">
          <Image src="/mistral-logo-color-white.png" alt="Mistral" width={12} height={12} unoptimized />
          Powered by Mistral AI
        </p>
      </div>
    </div>
  );
}

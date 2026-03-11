// src/components/ai/MusicDNACard.tsx
'use client';

import React from 'react';
import { FaGem } from 'react-icons/fa';
import type { SpotifyData } from '@/types/spotify';

interface MusicDNACardProps {
  spotifyData: SpotifyData;
  className?: string;
}

export default function MusicDNACard({ spotifyData, className = '' }: MusicDNACardProps) {
  const musicDNA = spotifyData?.topGenres?.slice(0, 4) || ['alternative', 'indie', 'electronic'];
  const mainstreamScore = spotifyData?.musicIntelligence?.mainstreamTaste || 65;
  const discoveryScore = 100 - mainstreamScore;

  return (
    <div className={`bg-[#080808] rounded-lg p-6 border border-[#00BFFF]/15 transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaGem className="text-[#00BFFF] text-lg" />
        <h3 className="text-xl font-bold text-white">Your Music DNA</h3>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {musicDNA.map((genre, index) => (
          <div
            key={genre}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: `rgba(0, 191, 255, ${0.7 - index * 0.15})`,
              color: index < 2 ? '#000' : '#fff',
              boxShadow: index === 0 ? '0 0 10px rgba(0,191,255,0.4)' : 'none'
            }}
          >
            {genre}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#00BFFF]/8 border border-[#00BFFF]/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#00BFFF]">{mainstreamScore}%</div>
          <div className="text-xs text-[#00BFFF]/70">Mainstream</div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{100 - mainstreamScore}%</div>
          <div className="text-xs text-gray-400">Unique</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          You&apos;re a <span className="text-[#00BFFF] font-semibold">{discoveryScore > 60 ? 'Music Explorer' : 'Hit Follower'}</span>
          {' '}with <span className="text-white font-semibold">{musicDNA.length > 3 ? 'Diverse' : 'Focused'}</span> taste
        </p>
      </div>
    </div>
  );
}


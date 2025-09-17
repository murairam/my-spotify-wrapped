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
    <div className={`bg-[#0d1117] rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaGem className="text-[#1DB954] text-lg" />
        <h3 className="text-xl font-bold text-white">Your Music DNA</h3>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {musicDNA.map((genre, index) => (
          <div
            key={genre}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 ${
              index === 0 ? 'bg-[#1DB954] text-black' :
              index === 1 ? 'bg-purple-500 text-white' :
              index === 2 ? 'bg-blue-500 text-white' :
              'bg-pink-500 text-white'
            }`}
          >
            {genre}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{mainstreamScore}%</div>
          <div className="text-xs text-green-300">Mainstream</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{100 - mainstreamScore}%</div>
          <div className="text-xs text-purple-300">Unique</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          You&apos;re a <span className="text-[#1DB954] font-semibold">{discoveryScore > 60 ? 'Music Explorer' : 'Hit Follower'}</span>
          {' '}with <span className="text-purple-400 font-semibold">{musicDNA.length > 3 ? 'Diverse' : 'Focused'}</span> taste
        </p>
      </div>
    </div>
  );
}


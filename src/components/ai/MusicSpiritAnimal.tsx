// src/components/ai/MusicSpiritAnimal.tsx
import React from 'react';
import type { AIAnalysisResponse } from '@/types/spotify';

interface MusicSpiritAnimalProps {
  analysis: AIAnalysisResponse | null;
}

const MusicSpiritAnimal: React.FC<MusicSpiritAnimalProps> = ({ analysis }) => {
  if (!analysis) return null;

  const { musicSpiritAnimal } = analysis.enhanced || {};
  if (!musicSpiritAnimal) return null;

  return (
    <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 mb-4 text-center">
      <p className="text-xs text-[#00BFFF]/60 uppercase tracking-widest font-semibold mb-3">
        Your Music Spirit Animal
      </p>
      <p className="text-4xl font-bold text-white mb-1">
        {musicSpiritAnimal as string}
      </p>
      <div className="w-12 h-0.5 bg-[#00BFFF]/30 mx-auto mt-3 rounded-full" />
    </div>
  );
};

export default MusicSpiritAnimal;

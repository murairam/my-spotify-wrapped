// src/components/ai/MoodAnalysisCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FaCompass } from 'react-icons/fa';

interface MoodData {
  primaryMood: string;
  energy: number;
  vibes: string[];
  listeningTime: string;
}

interface MoodAnalysisCardProps {
  moodData: MoodData;
  className?: string;
}

export default function MoodAnalysisCard({ moodData, className = '' }: MoodAnalysisCardProps) {
  const [moodRingColor, setMoodRingColor] = useState('#00BFFF');

  useEffect(() => {
    const colors = ['#00BFFF', '#0099cc', '#33ccff', '#006699', '#00e5ff'];
    const interval = setInterval(() => {
      setMoodRingColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-[#080808] rounded-lg p-6 border border-[#00BFFF]/15 transition-all hover:border-[#00BFFF]/30 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaCompass className="text-[#00BFFF] text-lg" />
        <h3 className="text-xl font-bold text-white">Your Current Vibe</h3>
      </div>

      <div className="text-center">
        <div
          className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-1000 transform hover:scale-110"
          style={{
            backgroundColor: moodRingColor,
            boxShadow: `0 0 30px ${moodRingColor}60`
          }}
        >
          <div className="text-black font-bold text-lg">{moodData.primaryMood.split(' ')[0]}</div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4">
          {moodData.vibes.map((vibe) => (
            <div key={vibe} className="bg-[#00BFFF]/8 rounded-lg p-3 border border-[#00BFFF]/15">
              <div className="text-white text-sm font-medium">{vibe}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00BFFF] rounded-full" style={{boxShadow:'0 0 6px rgba(0,191,255,0.6)'}}></div>
            <span className="text-gray-400">Energy: <span className="text-[#00BFFF] font-bold">{moodData.energy}%</span></span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mt-4">
          Prime listening: <span className="text-[#00BFFF]">{moodData.listeningTime}</span>
        </p>
      </div>
    </div>
  );
}

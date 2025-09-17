// src/components/ai/AIPersonalityCard.tsx - CORRECTED VERSION
'use client';

import React from 'react';
import Image from 'next/image';
import { FaHeart, FaCompass, FaUsers, FaChartLine } from 'react-icons/fa';

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

export default function AIPersonalityCard({ analysis, className = '' }: AIPersonalityCardProps) {
  const enhanced = analysis?.enhanced || {};
  const confidence = analysis?.confidence || 0;

  // Extract personality data with better fallbacks
  const musicPersonality = enhanced.musicPersonality || "Your unique musical identity is still being analyzed...";
  const discoveryStyle = enhanced.discoveryStyle || "Your discovery patterns reveal an adventurous listener...";
  const socialProfile = enhanced.socialProfile || "Your musical social tendencies show interesting patterns...";
  const funFacts = enhanced.funFacts || [];

  return (
    <div className={`bg-gradient-to-br from-[#0f1724]/30 to-[#071233]/30 rounded-xl border border-[#2b2f4a]/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B21B6]/10 to-[#7C3AED]/10 border-b border-[#6d28d9]/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-transparent flex items-center justify-center">
              <Image src="/mistral-logo-color-white.png" alt="Mistral" width={40} height={40} className="w-10 h-10" unoptimized />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your Musical Personality</h3>
              <p className="text-purple-300 text-sm">AI-powered insights</p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{confidence}%</div>
            <div className="text-xs text-purple-300">Confidence</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Musical Personality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaHeart className="text-pink-400" />
            <h4 className="text-white font-semibold">Musical Identity</h4>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {musicPersonality}
          </p>
        </div>

        {/* Discovery Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaCompass className="text-blue-400" />
            <h4 className="text-white font-semibold">Discovery Style</h4>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {discoveryStyle}
          </p>
        </div>

        {/* Social Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaUsers className="text-green-400" />
            <h4 className="text-white font-semibold">Social Listening</h4>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {socialProfile}
          </p>
        </div>

        {/* Fun Facts */}
        {funFacts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-yellow-400" />
              <h4 className="text-white font-semibold">Fun Facts</h4>
            </div>
            <div className="space-y-2">
              {funFacts.map((fact, index) => (
                <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-black/10 border-t border-[#6d28d9]/10">
        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
          <Image src="/mistral-logo-color-white.png" alt="Mistral" width={16} height={16} className="inline-block" unoptimized />
          <span>Powered by Mistral AI • Musical Personality Analysis</span>
        </p>
      </div>
    </div>
  );
}

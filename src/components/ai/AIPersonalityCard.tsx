// src/components/ai/AIPersonalityCard.tsx
'use client';

import React, { useState } from 'react';
import { FaUser, FaChevronDown, FaChevronUp, FaHeart } from 'react-icons/fa';

interface AIPersonalityCardProps {
  analysis: {
    summary: string;
    enhanced?: {
      funFacts?: string[];
    };
    confidence: number;
  };
  className?: string;
}

export default function AIPersonalityCard({ analysis, className = '' }: AIPersonalityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!analysis) return null;

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FaUser className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Musical Personality</h3>
            <p className="text-gray-400 text-sm">
              AI Confidence: {Math.round(analysis.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main analysis */}
        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </p>
        </div>

        {/* Fun Facts */}
        {analysis.enhanced?.funFacts && analysis.enhanced.funFacts.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-white mb-3 hover:text-purple-400 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FaHeart className="text-red-500" />
                Fun Facts About Your Taste
              </span>
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isExpanded && (
              <div className="space-y-3 animate-in slide-in-from-top duration-300">
                {analysis.enhanced.funFacts.map((fact, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg p-4"
                  >
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-black/20 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Powered by Mistral AI • Musical Personality Analysis
        </p>
      </div>
    </div>
  );
}

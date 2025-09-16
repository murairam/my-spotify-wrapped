// src/components/ai/AIArtistDiscovery.tsx
'use client';

import React, { useState } from 'react';
import { FaMusic, FaChevronDown, FaChevronUp, FaSpotify } from 'react-icons/fa';

interface AIArtistDiscoveryProps {
  newArtists?: string;
  className?: string;
}

export default function AIArtistDiscovery({ newArtists, className = '' }: AIArtistDiscoveryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!newArtists) {
    return (
      <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <FaMusic className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">New Artist Discovery</h3>
            <p className="text-gray-400 text-sm">Find your next favorite artists</p>
          </div>
        </div>
        <div className="text-center py-8">
          <FaMusic className="text-gray-600 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Run AI analysis to discover new artists based on your taste
          </p>
        </div>
      </div>
    );
  }

  // Parse the AI response into structured recommendations

  // Define a type for artist recommendations
  interface ArtistRecommendation {
    artist: string;
    reason: string;
    genre?: string;
    song?: string;
  }

  const parseArtistRecommendations = (text: string): ArtistRecommendation[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const recommendations: ArtistRecommendation[] = [];

    let currentRec: ArtistRecommendation | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      // Check if it's a numbered item (new recommendation)
      const numberMatch = trimmed.match(/^\d+\.\s*(.+)/);
      if (numberMatch) {
        if (currentRec && currentRec.artist) {
          recommendations.push(currentRec);
        }
        currentRec = { artist: numberMatch[1], reason: '' };
      } else if (currentRec && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        // Additional details about current recommendation
        const detail = trimmed.replace(/^[-•]\s*/, '');
        if (detail.toLowerCase().includes('song:') || detail.toLowerCase().includes('track:')) {
          currentRec.song = detail.replace(/.*(?:song|track):\s*/i, '');
        } else if (detail.toLowerCase().includes('genre:')) {
          currentRec.genre = detail.replace(/.*genre:\s*/i, '');
        } else {
          currentRec.reason += (currentRec.reason ? ' ' : '') + detail;
        }
      } else if (currentRec && currentRec.artist && !trimmed.match(/^\d+/)) {
        // Continuation of reason
        currentRec.reason += (currentRec.reason ? ' ' : '') + trimmed;
      }
    });

    // Add the last recommendation

    if (currentRec) {
      recommendations.push(currentRec);
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  };

  const recommendations = parseArtistRecommendations(newArtists);

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FaMusic className="text-white text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">New Artist Discovery</h3>
              <p className="text-gray-400 text-sm">
                {recommendations.length} personalized recommendations
              </p>
            </div>
          </div>
          {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-lg p-4 hover:border-green-500/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-base">
                      {rec.artist}
                    </h4>
                    {rec.genre && (
                      <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded-full">
                        {rec.genre}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    {rec.reason}
                  </p>

                  {rec.song && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FaSpotify className="text-green-500" />
                      <span>Start with: &quot;{rec.song}&quot;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-300 prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {newArtists}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-black/20 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          AI-curated artist recommendations based on your taste profile
        </p>
      </div>
    </div>
  );
}

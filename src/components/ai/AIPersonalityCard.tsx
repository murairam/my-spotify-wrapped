
'use client';

// Helper component to extract and display music personality
interface UserProfileSummary {
  musicPersonality?: string[];
  discoveryStyle?: string[];
  socialProfile?: {
    likelyTraits?: string[];
    possibleDemographics?: {
      ageRange?: string;
      urbanity?: string;
      digitalBehavior?: string;
    };
  };
}

function MusicPersonalitySection({ summary }: { summary: string }) {
  // Try to parse summary as JSON and extract musicPersonality, discoveryStyle, socialProfile
  let personality: UserProfileSummary | null = null;
  try {
    const parsed = JSON.parse(summary || '{}');
    if (parsed && parsed.metadata && parsed.metadata.userProfileSummary) {
      personality = parsed.metadata.userProfileSummary as UserProfileSummary;
    }
  } catch {
    // Not JSON, treat as plain text
  }
  if (personality) {
    return (
      <div>
        {personality.musicPersonality && (
          <div className="mb-3">
            <h4 className="text-white font-semibold mb-1">Music Personality</h4>
            <ul className="list-disc ml-6 text-gray-200">
              {personality.musicPersonality.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>
          </div>
        )}
        {personality.discoveryStyle && (
          <div className="mb-3">
            <h4 className="text-white font-semibold mb-1">Discovery Style</h4>
            <ul className="list-disc ml-6 text-gray-200">
              {personality.discoveryStyle.map((style, i) => (
                <li key={i}>{style}</li>
              ))}
            </ul>
          </div>
        )}
        {personality.socialProfile && (
          <div className="mb-3">
            <h4 className="text-white font-semibold mb-1">Social Profile</h4>
            {personality.socialProfile.likelyTraits && (
              <ul className="list-disc ml-6 text-gray-200">
                {personality.socialProfile.likelyTraits.map((trait, i) => (
                  <li key={i}>{trait}</li>
                ))}
              </ul>
            )}
            {personality.socialProfile.possibleDemographics && (
              <div className="mt-2 text-gray-400 text-xs">
                <div>Age Range: {personality.socialProfile.possibleDemographics.ageRange}</div>
                <div>Urbanity: {personality.socialProfile.possibleDemographics.urbanity}</div>
                <div>Digital Behavior: {personality.socialProfile.possibleDemographics.digitalBehavior}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  // Fallback: show summary as plain text
  return <p className="text-gray-200 leading-relaxed whitespace-pre-line">{summary}</p>;
}

import React, { useState } from 'react';
import { FaUser, FaChevronDown, FaChevronUp, FaHeart } from 'react-icons/fa';

interface AIPersonalityCardProps {
  analysis: {
    summary: string;
    enhanced?: {
      funFacts?: string[];
      userProfileSummary?: unknown;
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

        {/* Main analysis: prefer structured userProfileSummary in enhanced, otherwise parse summary */}
        <div className="prose prose-invert max-w-none mb-6">
          {analysis.enhanced?.userProfileSummary ? (
            <MusicPersonalitySection summary={JSON.stringify({ metadata: { userProfileSummary: analysis.enhanced.userProfileSummary } })} />
          ) : (
            <MusicPersonalitySection summary={analysis.summary} />
          )}
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

// src/components/ai/AIMoodAnalysis.tsx
'use client';

import React, { useState } from 'react';
import { FaHeart, FaChevronDown, FaChevronUp, FaBrain, FaBolt, FaSun, FaMoon } from 'react-icons/fa';

interface AIMoodAnalysisProps {
  moodAnalysis?: string;
  className?: string;
}

export default function AIMoodAnalysis({ moodAnalysis, className = '' }: AIMoodAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!moodAnalysis) {
    return (
      <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FaHeart className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mood & Emotional Analysis</h3>
            <p className="text-gray-400 text-sm">Understand your musical emotions</p>
          </div>
        </div>
        <div className="text-center py-8">
          <FaHeart className="text-gray-600 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Run AI analysis to understand your emotional music patterns
          </p>
        </div>
      </div>
    );
  }

  // Extract mood insights from the analysis
  const extractMoodInsights = (text: string) => {
    const insights = {
      primaryMood: '',
      emotionalDescription: '',
      listeningContext: '',
      seasonalTrend: ''
    };

    const sentences = text.split('.').map(s => s.trim()).filter(s => s.length > 0);

    // Look for mood-related keywords
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();

      if (lower.includes('mood') || lower.includes('emotional')) {
        if (!insights.primaryMood) {
          insights.primaryMood = sentence;
        } else {
          insights.emotionalDescription += (insights.emotionalDescription ? ' ' : '') + sentence + '.';
        }
      } else if (lower.includes('listen') || lower.includes('music for')) {
        insights.listeningContext += (insights.listeningContext ? ' ' : '') + sentence + '.';
      } else if (lower.includes('season') || lower.includes('time') || lower.includes('energy')) {
        insights.seasonalTrend += (insights.seasonalTrend ? ' ' : '') + sentence + '.';
      } else if (!insights.emotionalDescription) {
        insights.emotionalDescription += (insights.emotionalDescription ? ' ' : '') + sentence + '.';
      }
    });

    return insights;
  };

  const moodInsights = extractMoodInsights(moodAnalysis);

  const getMoodIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('energetic') || lower.includes('high energy')) return <FaBolt className="text-yellow-500" />;
    if (lower.includes('calm') || lower.includes('relaxed')) return <FaMoon className="text-blue-400" />;
    if (lower.includes('happy') || lower.includes('upbeat')) return <FaSun className="text-orange-500" />;
    if (lower.includes('focused') || lower.includes('concentrate')) return <FaBrain className="text-purple-500" />;
    return <FaHeart className="text-pink-500" />;
  };

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaHeart className="text-white text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">Mood & Emotional Analysis</h3>
              <p className="text-gray-400 text-sm">Your musical emotional patterns</p>
            </div>
          </div>
          {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Mood */}
            {moodInsights.primaryMood && (
              <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getMoodIcon(moodInsights.primaryMood)}
                  <h4 className="text-white font-semibold">Primary Mood</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {moodInsights.primaryMood}.
                </p>
              </div>
            )}

            {/* Listening Context */}
            {moodInsights.listeningContext && (
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaBrain className="text-blue-400" />
                  <h4 className="text-white font-semibold">When You Listen</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {moodInsights.listeningContext}
                </p>
              </div>
            )}
          </div>

          {/* Full Emotional Description */}
          {moodInsights.emotionalDescription && (
            <div className="mt-6 bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-600/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaHeart className="text-pink-400" />
                Emotional Profile
              </h4>
              <p className="text-gray-200 text-sm leading-relaxed">
                {moodInsights.emotionalDescription}
              </p>
            </div>
          )}

          {/* Seasonal/Energy Trends */}
          {moodInsights.seasonalTrend && (
            <div className="mt-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FaSun className="text-green-400" />
                Energy & Patterns
              </h4>
              <p className="text-gray-200 text-sm leading-relaxed">
                {moodInsights.seasonalTrend}
              </p>
            </div>
          )}

          {/* Fallback: Full text if parsing didn't work well */}
          {!moodInsights.primaryMood && !moodInsights.emotionalDescription && (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                {moodAnalysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-black/20 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Emotional analysis based on your listening patterns and music psychology
        </p>
      </div>
    </div>
  );
}

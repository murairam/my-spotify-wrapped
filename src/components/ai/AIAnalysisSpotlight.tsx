// src/components/ai/AIAnalysisSpotlight.tsx
// WORKING VERSION - Just replace your existing file with this
'use client';

import React, { useState, useEffect } from 'react';
import { FaBrain, FaStar, FaFire, FaHeart, FaLightbulb, FaRocket } from 'react-icons/fa';

import type { AIAnalysisResponse } from '@/types/spotify';

type AIAnalysis = Partial<AIAnalysisResponse> & {
  enhanced?: Partial<AIAnalysisResponse['enhanced']> & { newArtists?: Array<{ artist: string }>; };
};

interface Props {
  summary?: string | null;
  playlists?: AIAnalysisResponse['enhanced']['playlists'];
  analysis?: AIAnalysis;
  className?: string;
}

export default function AIAnalysisSpotlight({ summary, analysis, className = '' }: Props) {
  const [funFact, setFunFact] = useState<string>('');
  const [personality, setPersonality] = useState<string>('');
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Generate fun AI insights based on the analysis data
  const generateFunInsights = (analysisData?: AIAnalysis) => {
    const insights = {
      funFacts: [] as string[],
      personality: ''
    };

    if (!analysisData) return insights;

    // Extract data for fun analysis with safe fallbacks
    const enhanced = (analysisData.enhanced as Record<string, unknown> | undefined) || {};
    const mood = (enhanced.moodAnalysis as Record<string, unknown> | string | undefined) || {};
    const existingFacts = (enhanced.funFacts as string[] | undefined) || [];
    const musicPersonality = (enhanced.musicPersonality as string | undefined) || '';

    // Create fun personality assessment
    if (musicPersonality) {
      insights.personality = musicPersonality;
    } else if (typeof mood === 'object' && mood !== null && 'primaryMood' in mood) {
      const moodObj = mood as Record<string, unknown>;
      const primary = typeof moodObj.primaryMood === 'string' ? moodObj.primaryMood : undefined;
      const desc = typeof moodObj.emotionalDescription === 'string' ? moodObj.emotionalDescription : undefined;
      if (primary) {
        insights.personality = `🎭 **Your Musical Personality**: You\'re a **${primary}** soul! `;
        if (desc) insights.personality += desc;
      } else {
        insights.personality = "🎭 **Your Musical Personality**: You\'re a **Sonic Explorer** with impeccable taste! 🌟";
      }
    } else {
      insights.personality = "🎭 **Your Musical Personality**: You\'re a **Sonic Explorer** with impeccable taste! 🌟";
    }

    // Build generated fun facts based on available analysis fields
    const generatedFacts: string[] = [];
    try {
      const enhancedObj = (analysisData.enhanced as Record<string, unknown> | undefined) || undefined;
      const newArtists = Array.isArray(enhancedObj?.newArtists)
        ? (enhancedObj?.newArtists as Array<Record<string, unknown>>).slice(0, 3).map(a => String(a.artist || a.name || '')).filter(Boolean)
        : [];
      const topGenres = Array.isArray((analysisData as unknown as Record<string, unknown>)?.topGenres)
        ? ((analysisData as unknown as Record<string, unknown>)?.topGenres as string[]).slice(0, 3).filter(Boolean)
        : [];

      if (newArtists.length > 0) {
        generatedFacts.push(`🎧 **Discovery Tip**: Start with ${newArtists.join(', ')} — they pair unexpectedly well with your favorite tracks.`);
      }
      if (topGenres.length > 0) {
        generatedFacts.push(`🌈 **Genre Mix**: Your top genres like ${topGenres.join(', ')} make your playlists feel both cohesive and adventurous.`);
      }
      if (enhancedObj && typeof enhancedObj.musicPersonality === 'string') {
        generatedFacts.push(`🤖 **AI Insight**: ${String(enhancedObj.musicPersonality).slice(0, 100)}`);
      }
      // small dynamic fun facts to ensure freshness
      generatedFacts.push("🔮 **AI Prediction**: You\'re about to fall for an artist you haven\'t heard yet — keep an open shuffle! 🌟");
      generatedFacts.push("🔎 **Fun Fact**: Your listening cues make for perfect late-night discovery sessions.");
    } catch {
      // ignore generation errors and fall back to static facts
    }

    // Merge existing and generated, dedupe, prioritize generated facts
    const pool: string[] = [...generatedFacts, ...existingFacts];
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const f of pool) {
      const norm = f.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!norm) continue;
      if (seen.has(norm)) continue;
      seen.add(norm);
      deduped.push(f);
      if (deduped.length >= 6) break;
    }

    insights.funFacts = deduped.slice(0, 6);

    return insights;
  };

  // Process insights when analysis data changes
  useEffect(() => {
    const insights = generateFunInsights(analysis);
    setPersonality(insights.personality);

    if (insights.funFacts.length > 0) {
      setFunFact(insights.funFacts[0]);

      // Rotate through fun facts
      const interval = setInterval(() => {
        setCurrentFactIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % insights.funFacts.length;
          setFunFact(insights.funFacts[nextIndex]);
          return nextIndex;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [analysis]);

  // If no analysis yet, show teaser
  if (!analysis) {
    return (
      <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <FaBrain className="text-purple-400 text-2xl animate-pulse" />
          <div>
            <h3 className="text-2xl font-bold text-white">🎭 AI Spotlight</h3>
            <p className="text-gray-400 text-sm">Powered by Mistral AI • Ready to analyze your musical soul</p>
          </div>
        </div>

        <div className="text-center py-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
          <FaRocket className="text-4xl text-purple-400 mx-auto mb-3 animate-bounce" />
          <p className="text-gray-300">
            🚀 <strong>Get ready for some AI magic!</strong> I&apos;m about to dive deep into your music and discover things even you didn&apos;t know about your taste!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FaBrain className="text-purple-400 text-2xl" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">🎭 AI Spotlight</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400 font-medium">Powered by Mistral AI</span>
                <div className="flex gap-1">
                  <FaStar className="text-yellow-400 text-xs" />
                  <FaStar className="text-yellow-400 text-xs" />
                  <FaStar className="text-yellow-400 text-xs" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-purple-300 font-medium">AI Confidence</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i <= (analysis?.confidence || 85)/20 ? 'bg-green-400' : 'bg-gray-600'}`} />
                ))}
              </div>
              <span className="text-xs text-green-400 ml-1">{analysis?.confidence || 85}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* AI Personality Analysis */}
        {personality && (
          <>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-start gap-3">
              <FaHeart className="text-pink-400 text-xl mt-1 animate-pulse" />
              <div className="flex-1">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  🧠 Mistral&apos;s Take on Your Musical Soul
                  <FaFire className="text-orange-400 text-sm animate-bounce" />
                </h4>
                <div className="text-gray-200 text-sm leading-relaxed mb-3">
                  {(() => {
                    // Use the derived personality string (from generateFunInsights) here so it doesn't duplicate
                    // the full analysisParagraph shown below. Falls back to a short summary if personality is empty.
                    const raw = (personality as string) || (analysis?.summary as string) || '';
                    const paragraphs = raw.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
                    return (
                      <>
                        {paragraphs.map((p, i) => (
                          <p
                            key={i}
                            className="mb-3"
                            dangerouslySetInnerHTML={{
                              __html: p
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
                                .replace(/(?:^|[^*])\*([^*]+)\*(?![*])/g, '<em class="text-indigo-200">$1</em>')
                            }}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-400/20">
            <div className="flex items-start gap-3">
              <FaLightbulb className="text-yellow-400 text-xl mt-1 animate-pulse" />
              <div className="flex-1">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  💡 AI Fun Fact #{currentFactIndex + 1}
                  <div className="flex gap-1 ml-2">
                    {Array.from({length: 6}).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i === currentFactIndex ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </h4>
                <div
                  className="text-gray-200 text-sm leading-relaxed transition-all duration-500"
                  dangerouslySetInnerHTML={{
                    __html: funFact
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>')
                      .replace(/(?:^|[^*])\*([^*]+)\*(?![*])/g, '<em class="text-cyan-200">$1</em>')
                  }}
                />
              </div>
            </div>
          </div>
          </>
        )}

        {/* Summary if available */}
        {summary && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-400/20">
            <div className="flex items-start gap-3">
              <FaStar className="text-green-400 text-xl mt-1" />
              <div className="flex-1">
                <h4 className="text-white font-bold mb-2">🌟 AI Deep Dive Summary</h4>
                <div
                  className="text-gray-200 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: summary
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-300">$1</strong>')
                      .replace(/(?:^|[^*])\*([^*]+)\*(?![*])/g, '<em class="text-green-200">$1</em>')
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mistral AI Credit */}
        {/* Mistral analysis paragraph (new) */}
        {analysis && (
          <div className="bg-gradient-to-r from-indigo-900/6 to-slate-900/6 rounded-lg p-4 border border-indigo-600/10">
            <h4 className="text-white font-bold mb-2">🔎 Mistral&apos;s Analysis</h4>
            <div
              className="text-gray-200 text-sm leading-relaxed mb-3"
              dangerouslySetInnerHTML={{
                __html: (
                  // Prefer musicPersonality -> moodAnalysis.emotionalDescription -> summary
                  // Prefer analysisParagraph if present
                  ((analysis.enhanced as unknown) as Record<string, unknown>)?.analysisParagraph as string | undefined ||
                  ((analysis.enhanced as unknown) as Record<string, unknown>)?.musicPersonality as string | undefined ||
                  (typeof (((analysis.enhanced as unknown) as Record<string, unknown>)?.moodAnalysis) === 'object' ? (((analysis.enhanced as unknown) as Record<string, unknown>).moodAnalysis as Record<string, unknown> | undefined)?.emotionalDescription as string | undefined : '') ||
                  (analysis.summary as string) ||
                  ''
                )
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
                  .replace(/(?:^|[^*])\*([^*]+)\*(?![*])/g, '<em class="text-indigo-200">$1</em>')
              }}
            />
          </div>
        )}

        <div className="text-center pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-center gap-2 text-xs text-purple-300">
            <span>✨ Analysis crafted by</span>
            <strong className="text-purple-200">Mistral AI</strong>
            <span>•</span>
            <span>Bringing personality to your playlist</span>
            <FaHeart className="text-pink-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}


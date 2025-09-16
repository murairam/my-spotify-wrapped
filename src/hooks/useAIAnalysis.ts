// src/hooks/useAIAnalysis.ts - FIXED VERSION
import { useState, useCallback } from 'react';
import type { SpotifyData } from '@/types/spotify';

interface AIAnalysisRequest {
  spotifyData: SpotifyData;
  userLocation?: string;
  preferences: {
    includeConcerts: boolean;
    includeNewArtists: boolean;
    includePlaylistSuggestions: boolean;
    includeMoodAnalysis: boolean;
    includeDebug?: boolean;
  };
}

interface ConcertRecommendation {
  artist: string;
  venue: string;
  city: string;
  date: string;
  matchScore: number;
  reason: string;
}

interface AIAnalysis {
  summary: string;
  enhanced: {
    concerts: ConcertRecommendation[];
    newArtists?: unknown;
    moodAnalysis?: unknown;
    playlists?: unknown;
    funFacts: string[];
  };
  confidence: number;
  timestamp: string;
  // Development-only debug info returned by the API
  debug?: {
    aiText?: string;
    aiJson?: unknown;
  };
}

function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = useCallback(async (request: AIAnalysisRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🤖 Starting AI analysis...');

      const response = await fetch('/api/mistral/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      const result: { success: boolean; analysis: AIAnalysis; error?: string } = await response.json();

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        console.log('✅ AI analysis completed');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze your music';
      console.error('❌ AI analysis error:', err);
      setError(errorMessage);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);


  return {
    analysis,
    isLoading,
    error,
    analyzeData,
    clearAnalysis,
  };
}

export default useAIAnalysis;

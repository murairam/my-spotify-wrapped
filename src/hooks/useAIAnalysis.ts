// src/hooks/useAIAnalysis.ts - FIXED VERSION WITH DEBUGGING
import { useState, useCallback } from 'react';
import type { SpotifyData, AIAnalysisResponse } from '@/types/spotify';

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

// Reuse shared AIAnalysisResponse type for consistency
type AIAnalysis = AIAnalysisResponse & {
  // optional debug field returned by the server in development
  debug?: { aiText?: string; aiJson?: unknown };
};

function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<AIAnalysisRequest | null>(null);
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null);

  const analyzeData = useCallback(async (request: AIAnalysisRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🤖 Starting AI analysis...');
      console.log('🤖 Request:', request);

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

  const text = await response.text();
  setLastRawResponse(text);
  const result: { success: boolean; analysis: AIAnalysis; error?: string } = JSON.parse(text);

      // CRITICAL DEBUG LOGGING
      console.log("🔍 DEBUG: Full API response:", result);
      console.log("🔍 DEBUG: Analysis object:", result.analysis);
      console.log("🔍 DEBUG: Enhanced object:", result.analysis?.enhanced);
      console.log("🔍 DEBUG: Debug property exists:", !!result.analysis?.debug);
      console.log("🔍 DEBUG: Debug content:", result.analysis?.debug);
      console.log("🔍 DEBUG: newArtists:", result.analysis?.enhanced?.newArtists);
      console.log("🔍 DEBUG: playlists:", result.analysis?.enhanced?.playlists);
      console.log("🔍 DEBUG: moodAnalysis:", result.analysis?.enhanced?.moodAnalysis);

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        setLastRequest(request);
        console.log('✅ AI analysis completed successfully');
        console.log('✅ Analysis set in state:', result.analysis);
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
    lastRequest,
    lastRawResponse,
    analyzeData,
    clearAnalysis,
  };
}

export default useAIAnalysis;

// src/app/api/mistral/analyze/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import type { SpotifyData, AIAnalysisRequest, ConcertRecommendation } from '@/types/spotify';

// --- Add missing createPersonalityPrompt function ---
function createPersonalityPrompt(spotifyData: SpotifyData): string {
  // Compose a summary of the user's music personality for the AI prompt
  const topArtists = spotifyData.topArtists?.slice(0, 5).map(a => a.name).join(", ") || "unknown artists";
  const topGenres = spotifyData.topGenres?.slice(0, 5).join(", ") || "various genres";
  // No moodProfile in MusicIntelligence, so fallback to a generic string
  const mood = "varied moods";
  const summary = `The user listens to artists like ${topArtists}, enjoys genres such as ${topGenres}, and their musical mood is described as ${mood}.`;
  return `Analyze the following Spotify user data and provide insights about their music personality, discovery style, and social profile.\n${summary}`;
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Mistral API key not configured. Please add MISTRAL_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const requestBody: AIAnalysisRequest = await request.json();
    const { spotifyData, userLocation, preferences } = requestBody;

    if (!spotifyData) {
      return NextResponse.json(
        { error: "Spotify data is required" },
        { status: 400 }
      );
    }

    console.log("🤖 Analyzing Spotify data with Mistral AI...");

    // Create a comprehensive prompt based on your data structure

      // Create a comprehensive prompt for Mistral
      const prompt = createPersonalityPrompt(spotifyData);

  // Compose a multi-part prompt to get all required fields as structured JSON arrays/objects
  const multiPrompt = `\n\n${prompt}\n\n---\nNow, in JSON, provide:\n{\n  "newArtists": [\n    { "artist": "string", "reason": "string", "genre": "string", "song": "string" },\n    ... (5 total)\n  ],\n  "playlists": [\n    { "name": "string", "description": "string", "occasion": "string", "songs": ["string", ...] },\n    ... (3 total)\n  ],\n  "moodAnalysis": {\n    "primaryMood": "string",\n    "emotionalDescription": "string",\n    "listeningContext": "string",\n    "seasonalTrend": "string"\n  }\n}\n\nReturn only valid JSON, no explanations.`;

          const chatResponse = await mistral.chat.complete({
            model: "mistral-large-latest",
            messages: [
              {
                role: "system",
                content: "You are an expert music psychologist and playlist curator. Always answer in JSON when asked."
              },
              {
                role: "user",
                content: multiPrompt,
              },
            ],
            maxTokens: 1200,
            temperature: 0.8,
          });


          const aiTextRaw = chatResponse.choices?.[0]?.message?.content;
          const aiText = typeof aiTextRaw === 'string' ? aiTextRaw : '';
          let aiJson: unknown = {};
          try {
            // Robust JSON extraction: find first top-level JSON object by balancing braces
            const extractJsonFromText = (text: string): unknown | undefined => {
              const startIdx = text.indexOf('{');
              if (startIdx === -1) return undefined;
              let inString = false;
              let escape = false;
              let depth = 0;
              for (let i = startIdx; i < text.length; i++) {
                const ch = text[i];
                if (escape) { escape = false; continue; }
                if (ch === '\\') { escape = true; continue; }
                if (ch === '"') { inString = !inString; continue; }
                if (inString) continue;
                if (ch === '{') depth++;
                else if (ch === '}') {
                  depth--;
                  if (depth === 0) {
                    const candidate = text.slice(startIdx, i + 1);
                    try {
                      return JSON.parse(candidate);
                    } catch {
                      // try a forgiving cleanup: remove trailing commas before ] or }
                      try {
                        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
                        return JSON.parse(cleaned);
                      } catch {
                        return undefined;
                      }
                    }
                  }
                }
              }
              // Fallback: regex attempt
              const match = text.match(/\{[\s\S]*\}/);
              if (match) {
                try {
                  return JSON.parse(match[0]);
                } catch {
                  try {
                    const cleaned = match[0].replace(/,\s*([}\]])/g, '$1');
                    return JSON.parse(cleaned);
                  } catch { return undefined; }
                }
              }
              return undefined;
            };

            if (typeof aiText === 'string') {
              const parsed = extractJsonFromText(aiText);
              if (parsed !== undefined) aiJson = parsed;
            }
          } catch (e) {
            console.warn("Could not parse AI JSON response", e, aiText);
          }

          // Generate additional insights (legacy fields)
          const insights = generateInsights(spotifyData);

          // Generate concert recommendations if location provided
          let concerts: ConcertRecommendation[] = [];
          if (preferences?.includeConcerts && userLocation) {
            concerts = await findConcertRecommendations(spotifyData.topArtists || [], userLocation);
          }

          console.log("✅ Successfully generated AI analysis");

          // Prefer structured fields when available
          const enhancedObj: Record<string, unknown> = {
            ...insights,
            concerts
          };
          // Heuristics: the model may return fields under different keys or nested
          const looksLikeNewArtists = (v: unknown): boolean => {
            return Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && Boolean((v as Array<Record<string, unknown>>)[0].artist || (v as Array<Record<string, unknown>>)[0].name || (v as Array<Record<string, unknown>>)[0].reason || (v as Array<Record<string, unknown>>)[0].genre || (v as Array<Record<string, unknown>>)[0].song);
          };
          const looksLikePlaylists = (v: unknown): boolean => {
            return Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && Boolean((v as Array<Record<string, unknown>>)[0].name || (v as Array<Record<string, unknown>>)[0].songs || (v as Array<Record<string, unknown>>)[0].description || (v as Array<Record<string, unknown>>)[0].occasion);
          };
          const looksLikeMoodAnalysis = (v: unknown): boolean => {
            return v !== null && typeof v === 'object' && Boolean((v as Record<string, unknown>).primaryMood || (v as Record<string, unknown>).mood || (v as Record<string, unknown>).emotionalDescription || (v as Record<string, unknown>).listeningContext);
          };

          const looksLikeMusicPersonality = (v: unknown): boolean => {
            return v !== null && typeof v === 'object' && Boolean((v as Record<string, unknown>).coreTraits || (v as Record<string, unknown>).archetype || (v as Record<string, unknown>).description || (v as Record<string, unknown>).musicPersonality);
          };

          const looksLikeDiscoveryStyle = (v: unknown): boolean => {
            return v !== null && typeof v === 'object' && Boolean((v as Record<string, unknown>).primaryMethods || (v as Record<string, unknown>).primarySources || (v as Record<string, unknown>).discoveryStyle);
          };

          const looksLikeSocialProfile = (v: unknown): boolean => {
            return v !== null && typeof v === 'object' && Boolean((v as Record<string, unknown>).likelyPlatforms || (v as Record<string, unknown>).sharingBehavior || (v as Record<string, unknown>).socialProfile);
          };

          const findMatchingValue = (obj: unknown, predicate: (x: unknown) => boolean): unknown => {
            if (predicate(obj)) return obj;
            if (!obj || typeof obj !== 'object') return undefined;
            const record = obj as Record<string, unknown>;
            for (const key of Object.keys(record)) {
              try {
                const val = record[key];
                if (predicate(val)) return val;
                if (val && typeof val === 'object') {
                  const found: unknown = findMatchingValue(val, predicate);
                  if (found !== undefined) return found;
                }
              } catch {}
            }
            return undefined;
          };

          if (aiJson && typeof aiJson === 'object' && 'newArtists' in aiJson) {
            enhancedObj.newArtists = (aiJson as Record<string, unknown>).newArtists;
          } else {
            const found = findMatchingValue(aiJson, looksLikeNewArtists);
            if (found !== undefined) enhancedObj.newArtists = found;
          }

          if (aiJson && typeof aiJson === 'object' && 'playlists' in aiJson) {
            enhancedObj.playlists = (aiJson as Record<string, unknown>).playlists;
          } else {
            const found = findMatchingValue(aiJson, looksLikePlaylists);
            if (found !== undefined) enhancedObj.playlists = found;
          }

          if (aiJson && typeof aiJson === 'object' && 'moodAnalysis' in aiJson) {
            enhancedObj.moodAnalysis = (aiJson as Record<string, unknown>).moodAnalysis;
          } else {
            const found = findMatchingValue(aiJson, looksLikeMoodAnalysis);
            if (found !== undefined) enhancedObj.moodAnalysis = found;
          }

          // Try to attach musicPersonality / discoveryStyle / socialProfile when available
          if (aiJson && typeof aiJson === 'object' && 'musicPersonality' in aiJson) {
            enhancedObj.musicPersonality = (aiJson as Record<string, unknown>).musicPersonality;
          } else {
            const found = findMatchingValue(aiJson, looksLikeMusicPersonality);
            if (found !== undefined) enhancedObj.musicPersonality = found;
          }

          if (aiJson && typeof aiJson === 'object' && 'discoveryStyle' in aiJson) {
            enhancedObj.discoveryStyle = (aiJson as Record<string, unknown>).discoveryStyle;
          } else {
            const found = findMatchingValue(aiJson, looksLikeDiscoveryStyle);
            if (found !== undefined) enhancedObj.discoveryStyle = found;
          }

          if (aiJson && typeof aiJson === 'object' && 'socialProfile' in aiJson) {
            enhancedObj.socialProfile = (aiJson as Record<string, unknown>).socialProfile;
          } else {
            const found = findMatchingValue(aiJson, looksLikeSocialProfile);
            if (found !== undefined) enhancedObj.socialProfile = found;
          }

          // Debugging: log AI outputs (development only)
          if (process.env.NODE_ENV === 'development') {
            console.debug('Mistral AI raw text:', aiText);
            console.debug('Mistral AI parsed json:', aiJson);
            console.debug('Enhanced object to return:', enhancedObj);
          }

          // If the AI returned a structured user profile under any of a few likely keys, prefer that
          let summaryOut = '';
          const candidateProfile = aiJson && typeof aiJson === 'object'
            ? ((aiJson as Record<string, unknown>).userProfileSummary ?? (aiJson as Record<string, unknown>).personality ?? (aiJson as Record<string, unknown>).musicPersonality ?? (aiJson as Record<string, unknown>).summary)
            : undefined;
          if (candidateProfile) {
            try {
              summaryOut = JSON.stringify({ metadata: { userProfileSummary: candidateProfile } });
            } catch {
              summaryOut = '';
            }
          } else {
            // Avoid returning the full AI text blob as the summary - keep it empty so components use enhanced fields.
            summaryOut = '';
          }

          const baseResponse: Record<string, unknown> = {
            success: true,
            analysis: {
              summary: summaryOut,
              enhanced: enhancedObj,
              confidence: calculateConfidenceScore(spotifyData),
              timestamp: new Date().toISOString()
            }
          };

          // Mirror musicPersonality into userProfileSummary for backwards compatibility with the personality card
          try {
            if (enhancedObj.musicPersonality && !(enhancedObj as Record<string, unknown>).userProfileSummary) {
              (enhancedObj as Record<string, unknown>).userProfileSummary = enhancedObj.musicPersonality;
            }
          } catch {}

          // Attach debug output when in development OR when the client explicitly requested debug in preferences
          if (process.env.NODE_ENV === 'development' || (preferences && (preferences as Record<string, unknown>).includeDebug)) {
            baseResponse.debug = {
              aiText,
              aiJson
            };
          }

          return NextResponse.json(baseResponse);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("❌ Error calling Mistral API:", error);

          // Handle specific error types
          if (typeof errorMessage === 'string' && errorMessage.includes('API key')) {
            return NextResponse.json(
              { error: "Invalid Mistral API key. Please check your configuration." },
              { status: 401 }
            );
          }

          if (typeof errorMessage === 'string' && errorMessage.includes('rate limit')) {
            return NextResponse.json(
              { error: "Rate limit exceeded. Please try again later." },
              { status: 429 }
            );
          }

          return NextResponse.json(
            {
              error: "Failed to generate AI analysis",
              details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
          );
  }
}

function generateInsights(data: SpotifyData) {
  const insights = {
    musicPersonality: "",
    discoveryStyle: "",
    socialProfile: "",
    recommendations: [] as string[],
    funFacts: [] as string[]
  };

  // Music personality based on mainstream vs underground taste
  const mainstream = data.musicIntelligence?.mainstreamTaste || 50;
  if (mainstream > 70) {
    insights.musicPersonality = "You're a trendsetter who loves staying current with popular hits and viral sounds.";
  } else if (mainstream < 30) {
    insights.musicPersonality = "You're a music explorer who thrives on discovering hidden gems before they go mainstream.";
  } else {
    insights.musicPersonality = "You have a balanced taste, mixing popular hits with unique discoveries.";
  }

  // Discovery style
  const recentLover = data.musicIntelligence?.recentMusicLover || 50;

  if (recentLover > 70) {
    insights.discoveryStyle = "You're always hunting for the latest releases and emerging artists.";
  } else if (data.musicIntelligence?.vintageCollector && data.musicIntelligence.vintageCollector > 50) {
    insights.discoveryStyle = "You appreciate musical history and love diving into classic catalogs.";
  } else {
    insights.discoveryStyle = "You have a timeless approach to music discovery.";
  }

  // Generate fun facts
  if (data.stats?.uniqueArtistsCount && data.stats.uniqueArtistsCount > 100) {
    insights.funFacts.push(`You've explored ${data.stats.uniqueArtistsCount} different artists - that's more diverse than most radio stations!`);
  }

  if (data.topGenres && data.topGenres.length > 10) {
    insights.funFacts.push("Your genre palette is more diverse than a music festival lineup!");
  }

  if (mainstream < 40) {
    insights.funFacts.push("You're listening to artists that most people haven't discovered yet!");
  }

  // Simple recommendations based on their profile
  insights.recommendations = [
    "Explore Spotify's 'Discover Weekly' for personalized finds",
    "Check out similar artists in your top genres",
    "Try the 'Song Radio' feature on your favorite tracks",
    "Follow some music blogs that match your taste level"
  ];

  return insights;
}

async function findConcertRecommendations(topArtists: Array<{ name: string }>, location: string): Promise<ConcertRecommendation[]> {
  try {
    const topArtistNames = topArtists.slice(0, 8).map(artist => artist.name);
    console.log(`🎵 Searching concerts in ${location} for:`, topArtistNames);

    // Mock implementation - replace with real concert search API
    const vendors = [
      'ticketmaster.com',
      'eventbrite.com',
      'axs.com',
      'seetickets.com',
      'dice.fm',
      'stubhub.com',
      'ticketswap.com'
    ];
    const mockConcerts: ConcertRecommendation[] = topArtistNames.slice(0, 3).map((artist, index) => {
      // 50% chance to have a ticket link, otherwise fallback to artist Spotify
      const hasTicket = Math.random() > 0.5;
      const vendor = vendors[index % vendors.length];
      const ticketUrl = hasTicket
        ? `https://${vendor}/concerts/${encodeURIComponent(artist.toLowerCase().replace(/\s+/g, '-'))}-${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}`
        : undefined;
      return {
        artist: artist,
        venue: `${location} Concert Hall`,
        city: location,
        date: new Date(Date.now() + (index + 1) * 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10), // next months
        matchScore: 90 - (index * 5),
        reason: `Perfect match because you love ${artist} and similar artists in your top genres.`,
        ticketUrl,
      };
    });

    return mockConcerts;
  } catch (error) {
    console.error("Concert search error:", error);
    return [];
  }
}

function calculateConfidenceScore(data: SpotifyData): number {
  let score = 0.5; // Base confidence

  if (data.topTracks && data.topTracks.length >= 10) score += 0.15;
  if (data.topArtists && data.topArtists.length >= 8) score += 0.15;
  if (data.topGenres && data.topGenres.length >= 5) score += 0.1;
  if (data.musicIntelligence) score += 0.1;
  if (data.stats?.averagePopularity !== undefined) score += 0.05;

  return Math.min(score, 1.0);
}

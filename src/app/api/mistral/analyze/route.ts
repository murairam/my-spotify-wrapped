// src/app/api/mistral/analyze/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import type { SpotifyData, ConcertRecommendation } from '@/types/spotify';

// Define the request interface with proper types
interface AIAnalysisRequest {
  spotifyData: SpotifyData;
  userLocation?: string;
  preferences?: {
    includeConcerts?: boolean;
    includeNewArtists?: boolean;
    includePlaylistSuggestions?: boolean;
    includeMoodAnalysis?: boolean;
    includeDebug?: boolean;
  };
}

// Define the analysis response interface
interface AIAnalysis {
  summary: string;
  enhanced: Record<string, unknown>;
  confidence: number;
  timestamp: string;
  debug?: {
    aiText?: string;
    aiJson?: unknown;
  };
}

// Enhanced prompt creation function
function createPersonalityPrompt(spotifyData: SpotifyData): string {
  // Build a compact, explicit data payload for the model to consume
  const dataPayload = {
    topArtists: (spotifyData.topArtists || []).slice(0, 10).map(a => ({
      name: a.name,
      genres: a.genres || [],
      popularity: a.popularity,
      followers: a.followers
    })),
    topTracks: (spotifyData.topTracks || []).slice(0, 20).map(t => ({
      name: t.name,
      artists: (t.artists || []).map(ar => ar.name),
      popularity: t.popularity,
      duration_ms: t.duration_ms,
      preview_url: t.preview_url || null,
      album: t.album?.name || null
    })),
    topGenres: spotifyData.topGenres || [],
    stats: spotifyData.stats || {}
  };

  return `Below is a JSON data payload describing a Spotify user's listening profile. Use this data as the authoritative source when generating analysis, artist discoveries, and playlist suggestions. Do NOT invent data.

DATA_JSON:\n${JSON.stringify(dataPayload, null, 2)}\n\n`;
}

// Concert recommendation functions (simplified for this fix)
async function findConcertRecommendations(
  artists: Array<{ name: string; genres?: string[] }>,
  location: string
): Promise<ConcertRecommendation[]> {
  // Mock implementation - replace with your actual concert API logic
  return artists.slice(0, 3).map((artist, index) => ({
    artist: artist.name || 'Unknown Artist',
    venue: `Venue ${index + 1}`,
    city: location,
    date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    matchScore: 90 - (index * 10),
    reason: `Perfect match for your taste in ${artist.genres?.[0] || 'music'}`
  }));
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

  // Social profile
  insights.socialProfile = "You share music that reflects your unique taste and influences your social circle.";

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

  return insights;
}

function calculateConfidenceScore(data: SpotifyData): number {
  let score = 50; // Base score

  if (data.topArtists && data.topArtists.length >= 10) score += 20;
  if (data.topTracks && data.topTracks.length >= 20) score += 15;
  if (data.topGenres && data.topGenres.length >= 5) score += 10;
  if (data.musicIntelligence) score += 5;

  return Math.min(score, 100);
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

    // Create structured prompt for better AI responses (embed authoritative Spotify data)
    const basePrompt = createPersonalityPrompt(spotifyData);

    const structuredPrompt = `${basePrompt}

INSTRUCTIONS:
- Use the DATA_JSON above as the authoritative source. Do NOT invent or hallucinate new track/artist data.
- Return ONLY valid JSON (no explanation outside the JSON).
- Provide exactly 5 new artist suggestions and 3 playlists.
- Each playlist should contain 8-12 songs listed in the format "Song Title - Artist Name". Where possible include the artist's primary genre and a one-line reason for the selection.
- For each new artist, include: artist name, primary genre, one recommended song (preferably from their topTracks), and a 1-2 sentence reason why this artist suits the user.
- For playlists, include: name, short description (1-2 sentences), occasion, song list (8-12 items), and an optional array of seed artists from the user's topArtists used to construct the playlist.
- Also produce a "moodAnalysis" object with: primaryMood, emotionalDescription, listeningContext, and seasonalTrend.

RESPONSE_SCHEMA:
{
  "newArtists": [{ "artist": "", "genre": "", "song": "", "reason": "" }],
  "playlists": [{ "name": "", "description": "", "occasion": "", "songs": ["Song - Artist"], "seedArtists": ["Artist Name"] }],
  "moodAnalysis": { "primaryMood": "", "emotionalDescription": "", "listeningContext": "", "seasonalTrend": "" }
}

Return only the JSON that matches RESPONSE_SCHEMA.`;

    let aiText = '';
    let aiJson: unknown = null;

    try {
      console.log("📡 Calling Mistral API...");

      const chatResponse = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: "You are an expert music analyst and curator. Always respond with valid JSON matching the RESPONSE_SCHEMA when requested." },
          { role: "user", content: structuredPrompt }
        ],
        temperature: 0.6,
        maxTokens: 2000
      });

      const content = chatResponse.choices?.[0]?.message?.content;
      // Handle both string and ContentChunk[] responses from Mistral
      if (typeof content === 'string') {
        aiText = content;
      } else if (Array.isArray(content)) {
        // If content is an array of ContentChunks, extract text from text chunks
        aiText = content
          .filter((chunk): chunk is { type: 'text'; text: string } =>
            typeof chunk === 'object' && chunk !== null && 'type' in chunk && chunk.type === 'text'
          )
          .map(chunk => chunk.text)
          .join('');
      } else {
        aiText = '';
      }
      console.log("🤖 Mistral raw response length:", aiText.length);

      if (process.env.NODE_ENV === 'development') {
        console.log("🤖 Mistral raw response:", aiText.substring(0, 500) + "...");
      }

      // Enhanced JSON parsing with multiple strategies and cleaning
      if (aiText.trim()) {
        try {
          // Strategy 1: Try parsing the full response as JSON
          aiJson = JSON.parse(aiText);
          console.log("✅ Successfully parsed full response as JSON");

        } catch (parseError1) {
          const error1 = parseError1 instanceof Error ? parseError1.message : String(parseError1);
          console.log("⚠️ Full response not JSON, trying to extract JSON block...");

          try {
            // Strategy 2: Look for JSON block between ```json markers
            const jsonCodeBlockMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonCodeBlockMatch) {
              let jsonString = jsonCodeBlockMatch[1];

              // Clean the JSON string to handle control characters
              jsonString = jsonString
                .replace(/\n/g, '\\n')           // Escape newlines
                .replace(/\r/g, '\\r')           // Escape carriage returns
                .replace(/\t/g, '\\t')           // Escape tabs
                .replace(/\"/g, '\\"')           // Escape quotes
                .replace(/\\\"/g, '"')           // Unescape quotes that were already escaped
                .replace(/\\\\\"/g, '\\"');      // Fix double escaping

              aiJson = JSON.parse(jsonString);
              console.log("✅ Successfully parsed JSON from code block after cleaning");
            } else {
              throw new Error("No JSON code block found");
            }

          } catch (parseError2) {
            const error2 = parseError2 instanceof Error ? parseError2.message : String(parseError2);
            console.log("⚠️ JSON code block parsing failed, trying to extract and clean JSON object...");

            try {
              // Strategy 3: Look for any JSON object and clean it
              const jsonMatch = aiText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                let jsonString = jsonMatch[0];

                // More aggressive cleaning for malformed JSON
                jsonString = jsonString
                  .replace(/[\n\r\t]/g, ' ')          // Replace control chars with spaces
                  .replace(/\s+/g, ' ')               // Collapse multiple spaces
                  .replace(/([^\\])"/g, '$1\\"')      // Escape unescaped quotes
                  .replace(/^"/, '\\"')               // Escape quote at start
                  .replace(/\\"/g, '"')               // Unescape quotes
                  .replace(/\\\\/g, '\\');            // Fix double escaping

                aiJson = JSON.parse(jsonString);
                console.log("✅ Successfully extracted and parsed JSON object after aggressive cleaning");
              } else {
                throw new Error("No JSON object found");
              }

            } catch (parseError3) {
              const error3 = parseError3 instanceof Error ? parseError3.message : String(parseError3);
              console.warn("❌ All JSON parsing strategies failed:", {
                error1,
                error2,
                error3
              });
              console.log("Raw AI text sample for manual inspection:", aiText.substring(0, 1000));

              // Create a basic fallback that shows the raw content
              aiJson = {
                newArtists: [
                  {
                    artist: "Parsing Failed - See Raw Content",
                    reason: "JSON parsing failed but AI generated content. Check debug panel for raw output.",
                    genre: "Debug",
                    song: "Raw AI response available in debug panel"
                  }
                ],
                playlists: [
                  {
                    name: "Content Generation Successful",
                    description: "AI generated detailed content but JSON parsing failed",
                    occasion: "Check debug panel for full raw response",
                    songs: ["Parsing error occurred"]
                  }
                ],
                moodAnalysis: {
                  primaryMood: "Parsing Error",
                  emotionalDescription: "AI successfully generated analysis but JSON parsing failed. View raw content in debug panel.",
                  listeningContext: "Full analysis available in raw AI text",
                  seasonalTrend: "Check debug output for complete analysis"
                }
              };
            }
          }
        }
      }

    } catch (mistralError) {
      console.error("❌ Mistral API error:", mistralError);

      // Handle rate limit errors specifically
      if (mistralError instanceof Error && mistralError.message.includes('429')) {
        console.log("⏰ Rate limit hit, using fallback data");
        // Provide a better fallback experience
        aiJson = {
          newArtists: [
            {
              artist: "Rate Limited - Try Again Later",
              reason: "Your Mistral API tier has reached its capacity. Please wait or upgrade your plan.",
              genre: "N/A",
              song: "Please try again in a few minutes"
            }
          ],
          playlists: [
            {
              name: "Service Temporarily Unavailable",
              description: "AI analysis is temporarily limited due to API quotas",
              occasion: "Please try again later",
              songs: ["Rate limit reached"]
            }
          ],
          moodAnalysis: {
            primaryMood: "Rate Limited",
            emotionalDescription: "Your Mistral API has reached its usage limit. Please wait or upgrade your plan for AI analysis.",
            listeningContext: "Try again in a few minutes",
            seasonalTrend: "Service will resume once rate limits reset"
          }
        };
      } else {
        throw mistralError;
      }
    }

    // Generate additional insights (legacy fields)
    const insights = generateInsights(spotifyData);

    // Generate concert recommendations if location provided
    let concerts: ConcertRecommendation[] = [];
    if (preferences?.includeConcerts && userLocation) {
      concerts = await findConcertRecommendations(spotifyData.topArtists || [], userLocation);
    }

    console.log("✅ Successfully generated AI analysis");

    // Build enhanced object with all AI data
    const enhancedObj: Record<string, unknown> = {
      ...insights,
      concerts
    };

    // CRITICAL FIX: Directly assign the parsed JSON fields
    if (aiJson && typeof aiJson === 'object' && aiJson !== null) {
      const aiJsonObj = aiJson as Record<string, unknown>;

      if (aiJsonObj.newArtists && Array.isArray(aiJsonObj.newArtists)) {
        enhancedObj.newArtists = aiJsonObj.newArtists;
        console.log("✅ Assigned newArtists:", aiJsonObj.newArtists.length, "items");
      } else {
        console.log("⚠️ No valid newArtists found in AI response");
      }

      if (aiJsonObj.playlists && Array.isArray(aiJsonObj.playlists)) {
        enhancedObj.playlists = aiJsonObj.playlists;
        console.log("✅ Assigned playlists:", aiJsonObj.playlists.length, "items");
      } else {
        console.log("⚠️ No valid playlists found in AI response");
      }

      if (aiJsonObj.moodAnalysis && typeof aiJsonObj.moodAnalysis === 'object') {
        enhancedObj.moodAnalysis = aiJsonObj.moodAnalysis;
        console.log("✅ Assigned moodAnalysis");
      } else {
        console.log("⚠️ No valid moodAnalysis found in AI response");
      }
    } else {
      console.log("⚠️ No valid AI JSON to process, using fallback insights only");
    }

    // Log what we're actually sending
    console.log("🔍 Enhanced object keys:", Object.keys(enhancedObj));
    console.log("🔍 newArtists present:", !!enhancedObj.newArtists);
    console.log("🔍 playlists present:", !!enhancedObj.playlists);
    console.log("🔍 moodAnalysis present:", !!enhancedObj.moodAnalysis);

    const baseResponse: {
      success: boolean;
      analysis: AIAnalysis;
    } = {
      success: true,
      analysis: {
        summary: '',
        enhanced: enhancedObj,
        confidence: calculateConfidenceScore(spotifyData),
        timestamp: new Date().toISOString()
      }
    };

    // Add debug info in development
    if (process.env.NODE_ENV === 'development' || preferences?.includeDebug) {
      baseResponse.analysis.debug = {
        aiText,
        aiJson
      };
    }

    return NextResponse.json(baseResponse);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error in AI analysis:", error);

    return NextResponse.json(
      {
        error: "Failed to generate AI analysis",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

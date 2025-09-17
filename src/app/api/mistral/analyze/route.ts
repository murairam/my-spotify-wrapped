// Clean Mistral analyze route implementation
import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import type { SpotifyData, ConcertRecommendation } from '@/types/spotify';

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

interface RouteAIAnalysis {
  summary: string;
  enhanced: Record<string, unknown>;
  confidence: number;
  timestamp: string;
  debug?: { aiText?: string; aiJson?: unknown };
}

function createPersonalityPrompt(spotifyData: SpotifyData): string {
  const dataPayload = {
    topArtists: (spotifyData.topArtists || []).slice(0, 10).map(a => ({
      name: a.name,
      genres: a.genres || [],
      popularity: a.popularity,
      followers: a.followers,
    })),
    topTracks: (spotifyData.topTracks || []).slice(0, 20).map(t => ({
      name: t.name,
      artists: (t.artists || []).map(ar => ar.name),
      popularity: t.popularity,
      duration_ms: t.duration_ms,
      preview_url: t.preview_url || null,
      album: t.album?.name || null,
    })),
    topGenres: spotifyData.topGenres || [],
    stats: spotifyData.stats || {},
  };

  return `Below is a JSON data payload describing a Spotify user's listening profile. Use this data as the authoritative source when generating analysis, artist discoveries, and playlist suggestions. Do NOT invent data.\n\nDATA_JSON:\n${JSON.stringify(
    dataPayload,
    null,
    2
  )}\n\n`;
}

async function findConcertRecommendations(
  artists: Array<{ name: string; genres?: string[] }>,
  location: string
): Promise<ConcertRecommendation[]> {
  return artists.slice(0, 3).map((artist, index) => ({
    artist: artist.name || 'Unknown Artist',
    venue: `Venue ${index + 1}`,
    city: location,
    date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    matchScore: 90 - index * 10,
    reason: `Perfect match for your taste in ${artist.genres?.[0] || 'music'}`,
  }));
}

function generateInsights(data: SpotifyData) {
  const insights = {
    musicPersonality: '',
    discoveryStyle: '',
    socialProfile: '',
    recommendations: [] as string[],
    funFacts: [] as string[],
  };

  const mainstream = data.musicIntelligence?.mainstreamTaste || 50;
  const diversity = data.musicIntelligence?.artistDiversity || 0;

  if (mainstream > 70) {
    insights.musicPersonality = "You're a trendsetter who loves staying current with popular hits and viral sounds.";
  } else if (mainstream < 30) {
    insights.musicPersonality = "You're a music explorer who thrives on discovering hidden gems before they go mainstream.";
  } else {
    insights.musicPersonality = "You have a balanced taste, mixing popular hits with unique discoveries.";
  }

  const recentLover = data.musicIntelligence?.recentMusicLover || 50;
  if (recentLover > 70) {
    insights.discoveryStyle = "You're always hunting for the latest releases and emerging artists.";
  } else if (data.musicIntelligence?.vintageCollector && data.musicIntelligence.vintageCollector > 50) {
    insights.discoveryStyle = "You appreciate musical history and love diving into classic catalogs.";
  } else {
    insights.discoveryStyle = 'You have a timeless approach to music discovery.';
  }

  insights.socialProfile = 'You share music that reflects your unique taste and influences your social circle.';

  if (data.stats?.uniqueArtistsCount && data.stats.uniqueArtistsCount > 100) {
    insights.funFacts.push(`You've explored ${data.stats.uniqueArtistsCount} different artists - that's more diverse than most radio stations!`);
  }

  if (data.topGenres && data.topGenres.length > 10) {
    insights.funFacts.push('Your genre palette is more diverse than a music festival lineup!');
  }

  if (mainstream < 40) {
    insights.funFacts.push("You're listening to artists that most people haven't discovered yet!");
  }

  if (diversity > 50) {
    insights.funFacts.push('🎪 **AI Fact**: Your music library has more variety than a music festival lineup!');
  }

  return insights;
}

function calculateConfidenceScore(data: SpotifyData): number {
  let score = 50;
  if (data.topArtists && data.topArtists.length >= 10) score += 20;
  if (data.topTracks && data.topTracks.length >= 20) score += 15;
  if (data.topGenres && data.topGenres.length >= 5) score += 10;
  if (data.musicIntelligence) score += 5;
  return Math.min(score, 100);
}

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json({ error: 'Mistral API key not configured.' }, { status: 500 });
    }

    const requestBody: AIAnalysisRequest = await request.json();
    const { spotifyData, userLocation, preferences } = requestBody;

    if (!spotifyData) {
      return NextResponse.json({ error: 'Spotify data is required' }, { status: 400 });
    }

    const basePrompt = createPersonalityPrompt(spotifyData);

  const structuredPrompt = `${basePrompt}

INSTRUCTIONS:
- Use the DATA_JSON above as the authoritative source. Do NOT invent or hallucinate new track/artist data.
- Return ONLY valid JSON (no explanation outside the JSON).
- Be creative, fun, and engaging while staying accurate to the data.
- Use a friendly, witty AI personality that showcases Mistral's capabilities.
- Include emojis and **bold text** in descriptions for visual appeal.
- Create insights that will make the user smile and feel understood.

## Request two richer analysis paragraphs
- Include a dedicated field in the JSON called "analysisParagraph".
- The JSON field "analysisParagraph" should contain two paragraphs separated by a blank line ("\n\n"). Each paragraph should be 3-6 sentences long (overall 6-12 sentences, ~140-300 words total).
- Paragraph 1 (context & life): diagnostic tone — summarize the user's core listening habits, include one concise "lifeContext" hypothesis sentence that is clearly framed as a non-diagnostic hypothesis (e.g., "You might be leaning into reflective songs lately, perhaps because..."), and reference a concrete example from DATA_JSON (top artists/genres).
- Paragraph 2 (action & flourish): actionable, uplifting tone — provide 1-2 practical listening suggestions or habits, one engaging observation from funFacts, and a playful closing sentence with an emoji.
- Use **bold** sparingly to highlight one or two key phrases and include a small number of emojis for personality.
- Keep everything factual and grounded in DATA_JSON; do NOT invent new artist/track facts.
- Output rules: Return ONLY valid JSON. The JSON must include the field "analysisParagraph" (string with two paragraphs separated by a blank line). Optionally include "lifeContext" as a separate one-sentence string.

Example JSON schema addition:
\"analysisParagraph\": \"A 4-6 sentence paragraph, ~70-120 words, including a diagnostic, a concrete example using DATA_JSON, one actionable tip, and a playful closing sentence with one emoji.\"
RESPONSE REQUIREMENTS:
- Provide exactly 5 new artist suggestions and 3-4 playlists
- Create a compelling "summary" that's fun and personal (2-3 sentences with personality)
- Generate 4-6 "funFacts" that are entertaining and insightful
- Include "musicPersonality" analysis that's engaging and accurate

RESPONSE_SCHEMA:
{
  "summary": "A fun, engaging 2-3 sentence summary with **bold highlights** and emojis that captures the user's musical essence and shows off AI personality",
  "newArtists": [{ "artist": "", "genre": "", "song": "", "reason": "" }],
  "playlists": [{ "name": "", "description": "", "occasion": "", "songs": ["Song - Artist"], "seedArtists": ["Artist Name"] }],
  "moodAnalysis": {
    "primaryMood": "One of: Energetic Explorer, Chill Curator, Nostalgic Wanderer, Genre Bender, Mainstream Mixer, Underground Hunter",
    "emotionalDescription": "Fun, engaging description with emojis and **bold text** about their listening psychology",
    "listeningContext": "When/how they listen to music",
    "seasonalTrend": "Their music evolution patterns"
  },
  "musicPersonality": "A witty, insightful analysis of their musical character with **bold highlights** and emojis (2-3 sentences)",
  "funFacts": [
    "🤖 **AI Insight**: A clever observation about their music taste",
    "🎵 **Fun Fact**: A entertaining discovery about their listening habits",
    "🔮 **AI Prediction**: A playful prediction about their musical future",
    "More engaging facts with emojis and **bold formatting**"
  ]
}`;

    let aiText = '';
    let aiJson: unknown = null;

    try {
      const chatResponse = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are an expert music analyst and curator.' },
          { role: 'user', content: structuredPrompt },
        ],
        // Slightly warmer to encourage richer prose for the longer paragraph
        temperature: 0.7,
        // Increase tokens to allow a longer analysis paragraph without truncation
        maxTokens: 3000,
      });

      const content = chatResponse.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        aiText = content;
      } else if (Array.isArray(content)) {
        // content can be an array of chunks from Mistral; narrow safely
        aiText = content
          .filter((c): c is { type: 'text'; text: string } => {
            if (typeof c !== 'object' || c === null) return false;
            const rec = c as Record<string, unknown>;
            return rec['type'] === 'text' && typeof rec['text'] === 'string';
          })
          .map(c => (c as { type: 'text'; text: string }).text)
          .join('');
      }

      if (aiText.trim()) {
        try {
          aiJson = JSON.parse(aiText);
        } catch {
          const codeBlock = aiText.match(/```json\s*([\s\S]*?)\s*```/i);
          if (codeBlock) {
            try {
              aiJson = JSON.parse(codeBlock[1]);
            } catch {
              const objMatch = aiText.match(/\{[\s\S]*\}/);
              if (objMatch) {
                try {
                  aiJson = JSON.parse(objMatch[0]);
                } catch {
                  aiJson = null;
                }
              }
            }
          }
        }
      }
    } catch (mErr) {
      console.error('Mistral call error', mErr);
      if (mErr instanceof Error && mErr.message.includes('429')) {
        aiJson = {
          newArtists: [{ artist: 'Rate Limited - Try Later', genre: 'N/A', song: '', reason: 'Rate limited' }],
          playlists: [],
          moodAnalysis: {},
        };
      } else {
        throw mErr;
      }
    }

    const insights = generateInsights(spotifyData);
    let concerts: ConcertRecommendation[] = [];
    if (preferences?.includeConcerts && userLocation) {
      concerts = await findConcertRecommendations(spotifyData.topArtists || [], userLocation);
    }

    const enhancedObj: Record<string, unknown> = { ...insights, concerts };
    if (aiJson && typeof aiJson === 'object' && aiJson !== null) {
      const obj = aiJson as Record<string, unknown>;

      // Normalize newArtists into array of { artist, genre?, song?, reason? }
      if (obj.newArtists) {
        let raw = obj.newArtists as unknown;
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { /* leave as-is */ }
        }
        if (Array.isArray(raw)) {
          enhancedObj.newArtists = raw.map((item) => {
            if (typeof item === 'string') {
              const s = item.replace(/^\s*"+|"+\s*$/g, '').trim();
              return { artist: s, genre: '', song: '', reason: '' };
            }
            if (typeof item === 'object' && item !== null) {
              const it = item as Record<string, unknown>;
              const artist = (it['artist'] as string) || (it['name'] as string) || '';
              const genre = (it['genre'] as string) || (Array.isArray(it['genres']) ? (it['genres'] as string[])[0] : '') || '';
              const song = (it['song'] as string) || (it['track'] as string) || '';
              const reason = (it['reason'] as string) || (it['why'] as string) || (it['note'] as string) || '';
              return { artist: artist.trim(), genre: genre.trim(), song: song.trim(), reason: reason.trim() };
            }
            return { artist: '', genre: '', song: '', reason: '' };
          });
        }
      }

      // Normalize playlists into array of playlist objects
      if (obj.playlists) {
        let raw = obj.playlists as unknown;
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { /* leave as-is */ }
        }
        if (Array.isArray(raw)) {
          enhancedObj.playlists = raw.map((p) => {
            if (typeof p === 'string') return { name: p, description: '', occasion: '', songs: [], seedArtists: [] };
            if (typeof p === 'object' && p !== null) {
              const pl = p as Record<string, unknown>;
              return {
                name: (pl['name'] as string) || '',
                description: (pl['description'] as string) || (pl['desc'] as string) || '',
                occasion: (pl['occasion'] as string) || '',
                songs: Array.isArray(pl['songs']) ? (pl['songs'] as string[]) : [],
                seedArtists: Array.isArray(pl['seedArtists']) ? (pl['seedArtists'] as string[]) : (Array.isArray(pl['seed_artists']) ? (pl['seed_artists'] as string[]) : []),
              };
            }
            return { name: '', description: '', occasion: '', songs: [], seedArtists: [] };
          });
        }
      }

      if (obj.moodAnalysis) enhancedObj.moodAnalysis = obj.moodAnalysis;
      if (obj.analysisParagraph) {
        try {
          enhancedObj.analysisParagraph = String(obj.analysisParagraph).trim();
        } catch {
          // ignore malformed analysisParagraph
        }
      }
      if (obj.lifeContext) {
        try {
          enhancedObj.lifeContext = String(obj.lifeContext).trim();
        } catch {
          // ignore
        }
      }
    }

    // If AI didn't return a sufficiently long analysisParagraph, synthesize one from available fields
    const ensureTwoParagraphs = () => {
      const ap = (enhancedObj.analysisParagraph as string) || '';
      const paragraphs = ap.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
      if (paragraphs.length >= 2) return; // good enough

      const musicPersonality = String(enhancedObj.musicPersonality || '').trim();
      const funFacts = Array.isArray(enhancedObj.funFacts) ? (enhancedObj.funFacts as string[]) : [];
      const topArtists = (spotifyData.topArtists || []).slice(0, 3).map(a => a.name).filter(Boolean);
      const topGenres = (spotifyData.topGenres || []).slice(0, 3).filter(Boolean);
      const life = String(enhancedObj.lifeContext || '').trim();

      // Paragraph 1: diagnostic + life context + concrete example
      const p1Parts: string[] = [];
      if (musicPersonality) p1Parts.push(musicPersonality);
      else p1Parts.push('Your listening patterns reveal distinct preferences and moods that together tell a vivid musical story.');
      if (life) p1Parts.push(life);
      if (topArtists.length > 0) {
        p1Parts.push(`For example, your top artists like ${topArtists.join(', ')} point to a preference for ${topGenres.length ? topGenres.join(', ') : 'a focused set of sounds'}.`);
      } else if (topGenres.length > 0) {
        p1Parts.push(`Your taste leans into ${topGenres.join(', ')} which shapes many of your listening moments.`);
      }

      // Paragraph 2: actionable advice + fun fact + flourish
      const p2Parts: string[] = [];
      p2Parts.push('Actionable tip: try a themed 45-minute listening session focused on one of your favorites — it often surfaces surprising gems.');
      if (funFacts.length > 0) p2Parts.push(funFacts[0]);
      p2Parts.push('Finish with a playful, curiosity-driven shuffle to keep discovery alive. 🎧');

      enhancedObj.analysisParagraph = `${p1Parts.join(' ')}\n\n${p2Parts.join(' ')}`;
    };

    ensureTwoParagraphs();

    const baseResponse = {
      success: true,
      analysis: {
        summary: '',
        enhanced: enhancedObj,
        confidence: calculateConfidenceScore(spotifyData),
        timestamp: new Date().toISOString(),
      } as unknown as RouteAIAnalysis,
    };

    if (process.env.NODE_ENV === 'development' || preferences?.includeDebug) {
      baseResponse.analysis.debug = { aiText, aiJson };
    }

    return NextResponse.json(baseResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('AI analyze route error', error);
    return NextResponse.json({ error: 'Failed to generate AI analysis', details: message }, { status: 500 });
  }
}

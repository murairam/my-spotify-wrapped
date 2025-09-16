// src/app/api/mistral/analyze/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import type { SpotifyData, AIAnalysisRequest, ConcertRecommendation } from '@/types/spotify';

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
    const prompt = createPersonalityPrompt(spotifyData);

    const chatResponse = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert music psychologist who creates engaging, personalized analyses of listening habits. Write in the style of Spotify Wrapped - fun, insightful, and positive. Be creative with observations about personality traits revealed through music choices."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 600,
      temperature: 0.8,
    });

    const analysis = chatResponse.choices?.[0]?.message?.content || "Unable to generate analysis";

    // Generate additional insights
    const insights = generateInsights(spotifyData);

    // Generate concert recommendations if location provided
    let concerts: ConcertRecommendation[] = [];
    if (preferences?.includeConcerts && userLocation) {
      concerts = await findConcertRecommendations(spotifyData.topArtists || [], userLocation);
    }

    console.log("✅ Successfully generated AI analysis");

    return NextResponse.json({
      success: true,
      analysis: {
        summary: analysis,
        enhanced: {
          ...insights,
          concerts: concerts
        },
        confidence: calculateConfidenceScore(spotifyData),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error calling Mistral API:", error);

    // Handle specific error types
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: "Invalid Mistral API key. Please check your configuration." },
        { status: 401 }
      );
    }

    if (errorMessage.includes('rate limit')) {
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

function createPersonalityPrompt(data: SpotifyData): string {
  // Extract data safely with fallbacks
  const tracks = data.topTracks?.slice(0, 10).map(t =>
    `"${t.name}" by ${t.artist || t.artists?.[0]?.name || 'Unknown'}`
  ).join(", ") || "Various tracks";

  const artists = data.topArtists?.slice(0, 8).map(a => a.name).join(", ") || "Various artists";
  const genres = data.topGenres?.slice(0, 8).join(", ") || "Mixed genres";

  // Music intelligence insights
  const intelligence = data.musicIntelligence;
  const mainstreamScore = intelligence?.mainstreamTaste || 50;
  const recentLover = intelligence?.recentMusicLover || 50;

  // User profile context
  const userName = data.userProfile?.display_name || "music lover";
  const timeContext = data.timeRange?.includes('short') ? 'last 4 weeks' :
                     data.timeRange?.includes('medium') ? 'last 6 months' : 'all time';

  return `
Create a fun, engaging 400-word personality analysis for ${userName} based on their Spotify data from ${timeContext}:

MUSIC PROFILE:
• Favorite Songs: ${tracks}
• Top Artists: ${artists}
• Genres: ${genres}
• Mainstream vs Underground: ${mainstreamScore}% mainstream taste
• Recent Music Preference: ${recentLover}% recent releases
• Unique Artists: ${intelligence?.uniqueArtistsCount || 'Unknown'}
• Average Song Popularity: ${data.stats?.averagePopularity || 'Unknown'}/100

Write like Spotify Wrapped with:
- Second person voice ("You're the type of person who...")
- Creative personality insights based on their music choices
- Fun observations about their taste evolution and preferences
- Cultural references and music scene comparisons
- Positive, engaging tone with some humor
- Insights about their mood preferences and lifestyle
- A memorable closing line about their musical identity

Focus on what their music reveals about their character, social preferences, emotional needs, and how they discover new music.
  `.trim();
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

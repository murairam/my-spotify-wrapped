// import { NextRequest, NextResponse } from "next/server";
// import { Mistral } from "@mistralai/mistralai";

// const mistral = new Mistral({
//   apiKey: process.env.MISTRAL_API_KEY!,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { spotifyData } = await request.json();

//     if (!spotifyData) {
//       return NextResponse.json({ error: "Spotify data is required" }, { status: 400 });
//     }

//     // Create a detailed prompt for Mistral
//     const prompt = createMistralPrompt(spotifyData);

//     const chatResponse = await mistral.chat.complete({
//       model: "mistral-large-latest",
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       maxTokens: 500,
//       temperature: 0.7,
//     });

//     const aiSummary = chatResponse.choices?.[0]?.message?.content || "Unable to generate summary";

//     return NextResponse.json({
//       summary: aiSummary,
//       prompt: prompt // For debugging
//     });
//   } catch (error) {
//     console.error("Error calling Mistral API:", error);
//     return NextResponse.json(
//       { error: "Failed to generate AI summary" },
//       { status: 500 }
//     );
//   }
// }

// function createMistralPrompt(data: any): string {
//   const { topTracks, topArtists, topGenres, stats } = data;

//   const trackNames = topTracks.slice(0, 5).map((track: any) => track.name);
//   const artistNames = topArtists.slice(0, 5).map((artist: any) => artist.name);
//   const genreList = topGenres.slice(0, 5);

//   return `
// Write a fun, engaging, and personalized 200-word music taste analysis like a Spotify Wrapped story. Be creative, humorous, and insightful.

// USER'S TOP MUSIC DATA:
// - Top 5 Tracks: ${trackNames.join(", ")}
// - Top 5 Artists: ${artistNames.join(", ")}
// - Top 5 Genres: ${genreList.join(", ")}
// - Average Song Popularity: ${stats.averagePopularity}/100

// INSTRUCTIONS:
// - Write in second person ("You're the type of person who...")
// - Include playful observations about their music taste
// - Make comparisons or fun facts about the artists/genres
// - Add some humor but keep it positive and engaging
// - Structure it like a narrative story, not bullet points
// - End with a memorable closing line about their musical identity

// Create a unique personality profile based on this data that feels personal and entertaining!
// `.trim();
// }

// Placeholder export for deployment
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "Mistral AI integration coming soon!"
  });
}

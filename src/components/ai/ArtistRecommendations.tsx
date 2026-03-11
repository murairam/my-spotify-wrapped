// src/components/ai/ArtistRecommendations.tsx
// FIXED VERSION - Real Spotify Artist and Song Links
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaMusic, FaExternalLinkAlt, FaPlay } from 'react-icons/fa';
import type { SpotifyData, AIAnalysisResponse } from '@/types/spotify';

interface ArtistRecommendation {
  artist: string;
  reason: string;
  genre: string;
  song: string;
}

interface EnrichedArtist {
  name: string;
  reason: string;
  genre: string;
  recommendedSong: string;
  artistUrl: string;
  songUrl: string;
  artistImage?: string;
  isLoading: boolean;
}

interface ArtistRecommendationsProps {
  recommendations: unknown;
  spotifyData?: SpotifyData;
  analysis?: AIAnalysisResponse;
  className?: string;
}

export default function ArtistRecommendations({ recommendations, className = '' }: ArtistRecommendationsProps) {
  const [enrichedArtists, setEnrichedArtists] = useState<EnrichedArtist[]>([]);

  // Parse AI recommendations and normalize different shapes into ArtistRecommendation
  const parseArtistRecommendations = (data: unknown): ArtistRecommendation[] => {
    const normalize = (item: unknown): ArtistRecommendation => {
      if (!item) return { artist: '', reason: '', genre: '', song: '' };
      if (typeof item === 'string') {
        // Strip wrapping quotes and whitespace
        const s = item.replace(/^\s*"+|"+\s*$/g, '').trim();
        return { artist: s, reason: '', genre: '', song: '' };
      }
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        const artist = obj.artist ?? obj.name ?? obj.title ?? '';
        const reason = obj.reason ?? obj.note ?? obj.excerpt ?? obj.why ?? '';
        const genre = obj.genre ?? (obj.genres ? (obj.genres as unknown as string[])[0] : '') ?? '';
        const song = obj.song ?? obj.track ?? obj.recommendedSong ?? '';
        return {
          artist: typeof artist === 'string' ? artist.trim() : '',
          reason: typeof reason === 'string' ? reason.trim() : '',
          genre: typeof genre === 'string' ? genre.trim() : '',
          song: typeof song === 'string' ? song.replace(/^\s*"+|"+\s*$/g, '').trim() : ''
        };
      }
      return { artist: '', reason: '', genre: '', song: '' };
    };

    try {
      if (Array.isArray(data)) return data.map(normalize).slice(0, 4);
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed.map(normalize).slice(0, 4);
      }
    } catch {
      // ignore parse errors and return empty
    }

    return [];
  };

  // Search Spotify for real artist and song data
  const enrichArtistWithSpotify = async (artistRec: ArtistRecommendation): Promise<EnrichedArtist> => {
    console.log(`🎵 Enriching artist: ${artistRec.artist}`);

    const enriched: EnrichedArtist = {
      name: artistRec.artist,
      reason: artistRec.reason,
      genre: artistRec.genre,
      recommendedSong: artistRec.song,
      artistUrl: `https://open.spotify.com/search/${encodeURIComponent(artistRec.artist)}/artists`,
      // Don't construct a songUrl from possibly undefined song; build it only when we have a song
      songUrl: '',
      artistImage: undefined,
      isLoading: false
    };

    try {
      // Search for the artist first
      console.log(`🔍 Searching for artist: ${artistRec.artist}`);
      const artistResponse = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistRec.artist)}&type=artist&limit=3`);

      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        console.log(`✅ Artist search result:`, artistData);

        if (artistData.artists?.items?.length > 0) {
          const spotifyArtist = artistData.artists.items[0];
          enriched.artistUrl = spotifyArtist.external_urls?.spotify || enriched.artistUrl;
          enriched.artistImage = spotifyArtist.images?.[0]?.url;
          console.log(`✅ Found artist URL: ${enriched.artistUrl}`);

          // Now search for the recommended song by this artist
          if (artistRec.song) {
            console.log(`🔍 Searching for song: ${artistRec.song} by ${artistRec.artist}`);
            const songQuery = `track:"${artistRec.song}" artist:"${artistRec.artist}"`;
            const songResponse = await fetch(`/api/spotify/search?q=${encodeURIComponent(songQuery)}&type=track&limit=3`);

            if (songResponse.ok) {
              const songData = await songResponse.json();
              console.log(`✅ Song search result:`, songData);

                if (songData.tracks?.items?.length > 0) {
                const spotifyTrack = songData.tracks.items[0];
                  enriched.songUrl = spotifyTrack.external_urls?.spotify || enriched.songUrl;
                  enriched.recommendedSong = spotifyTrack.name || enriched.recommendedSong;
                console.log(`✅ Found song URL: ${enriched.songUrl}`);
              } else {
                // Fallback: search just by song name
                console.log(`🔄 Trying broader song search: ${artistRec.song}`);
                const broadSongResponse = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistRec.song)}&type=track&limit=5`);

                if (broadSongResponse.ok) {
                  const broadSongData = await broadSongResponse.json();
                  if (broadSongData.tracks?.items?.length > 0) {
                    // Try to find a song by the same artist, or use the first result
                    const matchingTrack = (broadSongData.tracks.items as unknown[]).find((trackRaw: unknown) => {
                      if (typeof trackRaw !== 'object' || trackRaw === null) return false;
                      const track = trackRaw as Record<string, unknown>;
                      const artists = track.artists as unknown;
                      if (!Array.isArray(artists)) return false;
                      return artists.some((a: unknown) => typeof (a as Record<string, unknown>).name === 'string' && ( (a as Record<string, unknown>).name as string).toLowerCase().includes(artistRec.artist.toLowerCase()));
                    }) as Record<string, unknown> | undefined || (broadSongData.tracks.items as unknown[])[0] as Record<string, unknown> | undefined;

                    if (matchingTrack) {
                      enriched.songUrl = (matchingTrack.external_urls as Record<string, unknown> | undefined)?.spotify as string | undefined || enriched.songUrl;
                      enriched.recommendedSong = (matchingTrack.name as string | undefined) || enriched.recommendedSong;
                    }
                    console.log(`✅ Found fallback song URL: ${enriched.songUrl}`);
                  }
                }
              }
            }
          }
        } else {
          console.log(`⚠️ No Spotify artist found for: ${artistRec.artist}`);
        }
      } else {
        console.log(`❌ Artist search failed for: ${artistRec.artist}`);
      }
    } catch (error) {
      console.error(`❌ Error enriching artist ${artistRec.artist}:`, error);
    }

    // If AI gave a song but we haven't replaced it with a real track, build a Spotify search URL
    if (enriched.recommendedSong && !enriched.songUrl) {
      const q = `${enriched.recommendedSong} ${artistRec.artist}`.trim();
      enriched.songUrl = `https://open.spotify.com/search/${encodeURIComponent(q)}/tracks`;
    }

    console.log(`✅ Final enriched artist:`, enriched);
    return enriched;
  };

  // Process all artists when recommendations change
  useEffect(() => {
    const processArtists = async () => {
      if (!recommendations) {
        setEnrichedArtists([]);
        return;
      }

      const artistRecs = parseArtistRecommendations(recommendations);
      if (artistRecs.length === 0) {
        setEnrichedArtists([]);
        return;
      }

      console.log(`🎵 Processing ${artistRecs.length} artist recommendations`);

      // Set initial loading state
      const loadingArtists: EnrichedArtist[] = artistRecs.map(rec => ({
        name: rec.artist,
        reason: rec.reason,
        genre: rec.genre,
        recommendedSong: rec.song,
        artistUrl: '',
        songUrl: '',
        isLoading: true
      }));
      setEnrichedArtists(loadingArtists);

      // Enrich each artist with Spotify data
      const enrichedResults = await Promise.all(
        artistRecs.map(rec => enrichArtistWithSpotify(rec))
      );

      setEnrichedArtists(enrichedResults);
    };

    processArtists();
  }, [recommendations]);

  // No recommendations prop at all — render nothing
  if (!recommendations) return null;

  // Enrichment pending (initial render or async Spotify calls in flight) — show skeleton
  if (enrichedArtists.length === 0) {
    return (
      <div className={`bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00BFFF]/20 rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-white/5 mb-3" />
              <div className="h-3 bg-white/5 rounded mb-2 w-3/4" />
              <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#080808] rounded-xl border border-[#00BFFF]/15 overflow-hidden transition-all hover:border-[#00BFFF]/30 hover:shadow-glow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#00BFFF]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00BFFF] rounded-lg flex items-center justify-center shadow-glow-sm">
            <FaMusic className="text-black text-lg" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Artists You&apos;ll Love</h3>
            <p className="text-gray-400 text-sm">
              {enrichedArtists.length} AI-curated discoveries
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrichedArtists.map((artist, index) => (
            <div
              key={index}
              className="bg-white/[0.03] hover:bg-[#00BFFF]/5 border border-transparent hover:border-[#00BFFF]/15 rounded-lg p-4 transition-all group"
            >
              {/* Artist Header with Image */}
              <div className="flex items-center gap-3 mb-3">
                {artist.artistImage ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#00BFFF]/20">
                    <Image
                      src={artist.artistImage}
                      alt={artist.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[#00BFFF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMusic className="text-[#00BFFF]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate group-hover:text-[#00BFFF] transition-colors">
                    {artist.name}
                  </h4>
                  <span className="text-xs px-2 py-1 bg-[#00BFFF]/10 text-[#00BFFF] rounded-full">
                    {artist.genre}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {artist.reason}
              </p>

              {/* Recommended Song */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <FaPlay className="text-[#00BFFF]" />
                  <span>Start with:</span>
                </div>
                <button
                  onClick={() => artist.songUrl && window.open(artist.songUrl, '_blank')}
                  className="w-full text-left p-3 bg-white/[0.03] hover:bg-[#00BFFF]/8 border border-transparent hover:border-[#00BFFF]/20 rounded-lg transition-all group/song"
                  disabled={artist.isLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover/song:text-[#00BFFF] transition-colors">
                      &quot;{artist.recommendedSong}&quot;
                    </span>
                    <FaExternalLinkAlt className="text-gray-500 group-hover/song:text-[#00BFFF] transition-colors text-xs" />
                  </div>
                </button>
              </div>

              {/* Artist Link */}
              <div className="flex gap-2">
                <button
                  onClick={() => artist.artistUrl && window.open(artist.artistUrl, '_blank')}
                  className="flex-1 bg-[#00BFFF] hover:bg-[#33ccff] text-black px-4 py-2 rounded-lg font-medium transition-all shadow-glow-sm hover:shadow-glow flex items-center justify-center gap-2"
                  disabled={artist.isLoading}
                >
                  {artist.isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <FaMusic />
                      <span>View Artist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


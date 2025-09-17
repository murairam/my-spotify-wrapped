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

  // Don't render if no recommendations
  if (!recommendations || enrichedArtists.length === 0) {
    return null;
  }

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <FaMusic className="text-white text-lg" />
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
              className="bg-black/20 hover:bg-black/40 rounded-lg p-4 transition-all group"
            >
              {/* Artist Header with Image */}
              <div className="flex items-center gap-3 mb-3">
                {artist.artistImage ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
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
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMusic className="text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {artist.name}
                  </h4>
                  <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded-full">
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
                  <FaPlay className="text-[#1DB954]" />
                  <span>Start with:</span>
                </div>
                <button
                  onClick={() => artist.songUrl && window.open(artist.songUrl, '_blank')}
                  className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all group/song"
                  disabled={artist.isLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover/song:text-[#1DB954] transition-colors">
                      &quot;{artist.recommendedSong}&quot;
                    </span>
                    <FaExternalLinkAlt className="text-gray-500 group-hover/song:text-[#1DB954] transition-colors text-xs" />
                  </div>
                </button>
              </div>

              {/* Artist Link */}
              <div className="flex gap-2">
                <button
                  onClick={() => artist.artistUrl && window.open(artist.artistUrl, '_blank')}
                  className="flex-1 bg-[#1DB954] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={artist.isLoading}
                >
                  {artist.isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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


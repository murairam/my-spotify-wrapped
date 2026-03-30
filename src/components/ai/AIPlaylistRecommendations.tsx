// src/components/ai/AIPlaylistRecommendations.tsx
// WORKING VERSION - Uses AI Analysis + Spotify API
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { SpotifyData } from '@/types/spotify';
import Image from 'next/image';
import { FaExternalLinkAlt, FaPlay, FaSpinner, FaListUl } from 'react-icons/fa';

interface PlaylistRecommendation {
  name: string;
  description: string;
  url?: string;
  image?: string;
  curator?: string;
  tracks?: number;
  songs?: string[];
  external_urls?: { spotify?: string };
}

interface AIPlaylistRecommendationsProps {
  spotifyData?: SpotifyData | undefined;
  className?: string;
  aiPlaylists?: unknown;
}

export default function AIPlaylistRecommendations({
  spotifyData,
  className = '',
  aiPlaylists
}: AIPlaylistRecommendationsProps) {
  const [playlists, setPlaylists] = useState<PlaylistRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Stable fallback images
  const getPlaylistImage = (index: number): string => {
    // Unique gradient placeholders — used only when no real Spotify image is available
    const gradients = [
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2300BFFF'/><stop offset='100%25' stop-color='%230040FF'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='72' font-family='serif'>🎵</text></svg>`,
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23A020F0'/><stop offset='100%25' stop-color='%23FF2080'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='72' font-family='serif'>🎶</text></svg>`,
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2300E676'/><stop offset='100%25' stop-color='%2300BCD4'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='72' font-family='serif'>🎸</text></svg>`,
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23FF9800'/><stop offset='100%25' stop-color='%23FF2020'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='72' font-family='serif'>🎤</text></svg>`,
    ];
    return gradients[index % gradients.length];
  };

  // Process AI playlists and enrich with Spotify data - UPDATE TEXT TOO
  const processAIPlaylists = useCallback(async (aiData: unknown[]): Promise<PlaylistRecommendation[]> => {
    const safeAiData = Array.isArray(aiData) ? aiData : [];
    console.log('🎵 Processing AI playlists:', aiData);

    const processed: PlaylistRecommendation[] = [];

    // Process AI playlists first (up to 3 from Mistral)
    for (let i = 0; i < Math.min(aiData.length, 3); i++) {
      const aiPlaylist = safeAiData[i] as Record<string, unknown> | undefined;
      console.log(`🎵 Processing AI playlist ${i + 1}:`, aiPlaylist);

      const name = aiPlaylist && typeof aiPlaylist.name === 'string' ? aiPlaylist.name : `AI Playlist ${i + 1}`;
      const description = aiPlaylist && typeof aiPlaylist.description === 'string' ? aiPlaylist.description : 'Curated for your taste';
      const songsArray = aiPlaylist && Array.isArray(aiPlaylist.songs) ? (aiPlaylist.songs.filter((s: unknown) => typeof s === 'string') as string[]) : [];

      const processedPlaylist: PlaylistRecommendation = {
        name,
        description,
        image: getPlaylistImage(i),
        curator: 'Picked for you',
        tracks: songsArray.length || 30,
        songs: songsArray,
        url: undefined // Ensure we always try to get a real URL
      };

      // ALWAYS try to find similar Spotify playlist for each one
      try {
  const searchQuery = (typeof name === 'string' && name) || (typeof description === 'string' && description) || `${spotifyData?.topGenres?.[0] || 'pop'} playlist`;
        console.log(`🔍 Searching Spotify for playlist ${i + 1}:`, searchQuery);

  const response = await fetch(`/api/spotify/search-playlists?q=${encodeURIComponent(searchQuery)}&limit=5`);

        if (response.ok) {
          const searchData: unknown = await response.json();
          console.log(`✅ Spotify search result ${i + 1}:`, searchData);
          if (isRecord(searchData) && 'playlists' in searchData && Array.isArray((searchData as Record<string, unknown>).playlists) && ((searchData as Record<string, unknown>).playlists as unknown[]).length > 0) {
            // Try to find the best match, not just the first one
            const playlistsArr = ((searchData as Record<string, unknown>).playlists as unknown[]);
            const bestMatch = playlistsArr.find((pl) => {
              if (!pl || typeof pl !== 'object') return false;
              const p = pl as Record<string, unknown>;
              const external_urls = p.external_urls as Record<string, unknown> | undefined;
              return !!(external_urls && typeof external_urls.spotify === 'string' && p.image);
            }) as Record<string, unknown> | undefined || (playlistsArr[0] as Record<string, unknown> | undefined);

            if (bestMatch) {
              // UPDATE ALL PLAYLIST DATA including text
              const bm = bestMatch as Record<string, unknown>;
              const bmExternal = bm.external_urls as Record<string, unknown> | undefined;
              const bmUrl = bmExternal && typeof bmExternal.spotify === 'string' ? bmExternal.spotify : (typeof bm.url === 'string' ? bm.url : undefined);
              const bmImage = typeof bm.image === 'string' ? bm.image : undefined;
              const bmCurator = typeof bm.curator === 'string' ? bm.curator : 'Spotify';
              const bmTracks = typeof bm.tracks === 'number' ? bm.tracks : undefined;

              processedPlaylist.url = bmUrl;
              processedPlaylist.image = bmImage || getPlaylistImage(i);
              processedPlaylist.curator = bmCurator;
              processedPlaylist.tracks = bmTracks || processedPlaylist.tracks;

              // UPDATE NAME AND DESCRIPTION to match the actual Spotify playlist
              const bmName = typeof bm.name === 'string' ? bm.name : undefined;
              const bmDesc = typeof bm.description === 'string' ? bm.description : undefined;
              processedPlaylist.name = bmName || processedPlaylist.name;
              processedPlaylist.description = bmDesc || `Spotify playlist with ${bmTracks || 'many'} tracks`;

              console.log(`✅ Enhanced playlist ${i + 1} with Spotify data:`, {
                name: processedPlaylist.name,
                description: processedPlaylist.description,
                url: processedPlaylist.url
              });
            }
          }
        } else {
          console.warn(`⚠️ Spotify search failed for playlist ${i + 1}:`, searchQuery);
        }

        // If still no URL, build a search URL from the AI name — keep name/description as-is
        if (!processedPlaylist.url) {
          const searchTerm = typeof name === 'string' && name ? name : (spotifyData?.topGenres?.[0] || 'playlist');
          processedPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`;
          console.log(`🔄 Using name-based search URL for playlist ${i + 1}:`, processedPlaylist.url);
        }
      } catch (error) {
        console.error(`❌ Error enriching playlist ${i + 1}:`, error);
        // Keep AI name/description, just set a search URL
        const searchTerm = typeof name === 'string' && name ? name : (spotifyData?.topGenres?.[0] || 'playlist');
        processedPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`;
      }

      processed.push(processedPlaylist);
    }

    // ADD A 4TH PLAYLIST using the same enrichment logic
    const topGenres = spotifyData?.topGenres || ['pop'];
    const topArtist = spotifyData?.topArtists?.[0];

    const fourthPlaylist: PlaylistRecommendation = {
      name: topArtist ? `${topArtist.name} Mix` : 'Your Discovery Mix',
      description: topArtist ? `Songs like ${topArtist.name}` : 'Music tailored to your taste',
      image: getPlaylistImage(3),
      curator: 'Spotify',
      tracks: 50,
      songs: [],
      url: undefined
    };

    // Enrich the 4th playlist the same way - UPDATE TEXT TOO
    try {
      const searchQuery = topArtist ? `${topArtist.name} radio` : `${topGenres[0]} discover`;
      console.log('🔍 Searching Spotify for 4th playlist:', searchQuery);

      const response = await fetch(`/api/spotify/search-playlists?q=${encodeURIComponent(searchQuery)}&limit=5`);

      if (response.ok) {
        const searchData: unknown = await response.json();
        console.log('✅ Spotify search result for 4th playlist:', searchData);

        if (isRecord(searchData) && 'playlists' in searchData && Array.isArray((searchData as Record<string, unknown>).playlists) && ((searchData as Record<string, unknown>).playlists as unknown[]).length > 0) {
          const playlistsArr = (searchData as Record<string, unknown>).playlists as unknown[];
          const bestMatch = playlistsArr.find((pl) => {
            if (!pl || typeof pl !== 'object') return false;
            const p = pl as Record<string, unknown>;
            const external_urls = p.external_urls as Record<string, unknown> | undefined;
            return !!(external_urls && typeof external_urls.spotify === 'string' && p.image);
          }) as Record<string, unknown> | undefined || (playlistsArr[0] as Record<string, unknown> | undefined);

          if (bestMatch) {
            const bm = bestMatch as Record<string, unknown>;
            const bmExternal = bm.external_urls as Record<string, unknown> | undefined;
            const bmUrl = bmExternal && typeof bmExternal.spotify === 'string' ? bmExternal.spotify : (typeof bm.url === 'string' ? bm.url : undefined);
            const bmImage = typeof bm.image === 'string' ? bm.image : (topArtist?.images?.[0]?.url || getPlaylistImage(3));
            const bmCurator = typeof bm.curator === 'string' ? bm.curator : 'Spotify';
            const bmTracks = typeof bm.tracks === 'number' ? bm.tracks : undefined;
            const bmName = typeof bm.name === 'string' ? bm.name : undefined;
            const bmDesc = typeof bm.description === 'string' ? bm.description : undefined;

            fourthPlaylist.url = bmUrl;
            fourthPlaylist.image = bmImage;
            fourthPlaylist.curator = bmCurator;
            fourthPlaylist.tracks = bmTracks || fourthPlaylist.tracks;

            // UPDATE TEXT to match the actual Spotify playlist
            fourthPlaylist.name = bmName || fourthPlaylist.name;
            fourthPlaylist.description = bmDesc || `Spotify playlist with ${bmTracks || 'many'} tracks`;

            console.log('✅ Enhanced 4th playlist with Spotify data:', {
              name: fourthPlaylist.name,
              description: fourthPlaylist.description,
              url: fourthPlaylist.url
            });
          }
        }
      }

      // If still no URL, build a search URL from the existing name — keep name/description as-is
      if (!fourthPlaylist.url) {
        const searchTerm = fourthPlaylist.name || (topArtist ? `${topArtist.name} radio` : `${topGenres[0]} discover`);
        fourthPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`;
        console.log('🔄 Using name-based search URL for 4th playlist:', fourthPlaylist.url);
      }
    } catch (error) {
      console.error('❌ Error enriching 4th playlist:', error);
      const searchTerm = fourthPlaylist.name || 'discover weekly';
      fourthPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`;
    }

  processed.push(fourthPlaylist);

    console.log('✅ Final processed playlists (4 total):', processed.map(p => ({
      name: p.name,
      description: p.description,
      url: p.url
    })));
    return processed;
  }, [spotifyData]);
  // small runtime type guard helper
  function isRecord(v: unknown): v is Record<string, unknown> {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  // Create fallback playlists when no AI data
  const createFallbackPlaylists = useCallback((): PlaylistRecommendation[] => {
    if (!spotifyData) return [];

    const topGenres = spotifyData.topGenres || ['pop'];
    const topArtists = spotifyData.topArtists || [];

    return [
      {
        name: `${topGenres[0]?.charAt(0).toUpperCase() + topGenres[0]?.slice(1)} Mix`,
        description: `Your ${topGenres[0]} essentials`,
        url: `https://open.spotify.com/search/${encodeURIComponent(topGenres[0])}%20playlist`,
        image: getPlaylistImage(0),
        curator: 'Spotify',
        tracks: 50
      },
      {
        name: 'Discover Weekly Style',
        description: 'New music based on your taste',
        url: 'https://open.spotify.com/search/discover%20weekly',
        image: getPlaylistImage(1),
        curator: 'Spotify',
        tracks: 30
      },
      {
        name: topArtists?.[0]?.name ? `${topArtists[0].name} Radio` : 'Artist Radio',
        description: topArtists?.[0]?.name ? `Similar to ${topArtists[0].name}` : 'Based on your top artists',
        url: topArtists?.[0]?.name ?
          `https://open.spotify.com/search/${encodeURIComponent(topArtists[0].name)}%20radio` :
          'https://open.spotify.com/search/radio',
        image: topArtists?.[0]?.images?.[0]?.url || getPlaylistImage(2),
        curator: 'Spotify',
        tracks: 50
      },
      {
        name: 'Focus Playlist',
        description: 'Perfect for concentration',
        url: 'https://open.spotify.com/search/focus%20playlist',
        image: getPlaylistImage(3),
        curator: 'Spotify',
        tracks: 100
      }
    ];
  }, [spotifyData]);

  // Main effect - only runs when aiPlaylists changes (when AI analysis completes)
  const topGenre = spotifyData?.topGenres?.[0] ?? 'pop';

  useEffect(() => {
  const processPlaylists = async () => {
      console.log('🎵 AIPlaylistRecommendations useEffect triggered');
      console.log('🎵 aiPlaylists:', aiPlaylists);
      console.log('🎵 aiPlaylists type:', typeof aiPlaylists);
      console.log('🎵 aiPlaylists isArray:', Array.isArray(aiPlaylists));

      if (!aiPlaylists) {
        console.log('🎵 No AI playlists data, not showing component');
        setPlaylists([]);
        return;
      }

      setIsLoading(true);

      try {
  let playlistsToProcess: unknown[] = [];

        // Handle different aiPlaylists formats
        if (Array.isArray(aiPlaylists)) {
          playlistsToProcess = aiPlaylists;
        } else if (aiPlaylists && typeof aiPlaylists === 'object') {
          // Sometimes it might be wrapped in an object
          const obj = aiPlaylists as Record<string, unknown>;
          if ('playlists' in obj && Array.isArray(obj.playlists)) {
            playlistsToProcess = obj.playlists as unknown[];
          } else if ('enhanced' in obj && obj.enhanced && typeof obj.enhanced === 'object' && 'playlists' in (obj.enhanced as Record<string, unknown>) && Array.isArray((obj.enhanced as Record<string, unknown>).playlists)) {
            playlistsToProcess = ((obj.enhanced as Record<string, unknown>).playlists) as unknown[];
          }
        }

        console.log('🎵 Playlists to process:', playlistsToProcess);

        if (playlistsToProcess.length > 0) {
          // Process AI playlists and enrich with Spotify data
          const processedPlaylists = await processAIPlaylists(playlistsToProcess);
          setPlaylists(processedPlaylists);
        } else {
          console.log('🎵 No valid playlists found, using fallback');
          // Use fallback playlists
          const fallbackPlaylists = createFallbackPlaylists();
          setPlaylists(fallbackPlaylists);
        }
      } catch (error) {
        console.error('❌ Error processing playlists:', error);
        // Use fallback on error
        const fallbackPlaylists = createFallbackPlaylists();
        setPlaylists(fallbackPlaylists);
      } finally {
        setIsLoading(false);
      }
    };

    processPlaylists();
  }, [aiPlaylists, topGenre, processAIPlaylists, createFallbackPlaylists]); // Only re-run when AI data changes

  // Show loading skeleton while playlists are being processed (including when aiPlaylists is undefined)
  if (isLoading && playlists.length === 0) {
    return (
      <div className={`bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <FaListUl className="text-[#00BFFF] text-xl" />
          <h3 className="text-lg font-bold text-white">Playlist Suggestions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 animate-pulse">
              <div className="aspect-square bg-white/[0.06] rounded mb-2"></div>
              <div className="h-4 bg-white/[0.06] rounded mb-1"></div>
              <div className="h-3 bg-white/[0.04] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    // Still waiting for first render cycle — show skeleton so layout stays stable
    return (
      <div className={`bg-[#080808] rounded-xl border border-[#00BFFF]/15 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <FaListUl className="text-[#00BFFF] text-xl" />
          <h3 className="text-lg font-bold text-white">Playlist Suggestions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 animate-pulse">
              <div className="aspect-square bg-white/[0.06] rounded mb-2" />
              <div className="h-4 bg-white/[0.06] rounded mb-1" />
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
          <FaListUl className="text-[#00BFFF] text-2xl" />
          <h2 className="text-2xl font-bold text-white">Playlist Suggestions</h2>
          <span className="text-white/40 text-sm ml-auto">
            {playlists.length} picks
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && playlists.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm text-[#00BFFF]">
            <FaSpinner className="animate-spin" />
            Enriching playlists with Spotify data...
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 rounded-lg bg-white/[0.03] hover:bg-[#00BFFF]/5 border border-transparent hover:border-[#00BFFF]/15 transition-all group cursor-pointer"
              onClick={() => playlist.url && window.open(playlist.url, '_blank')}
            >
              {/* Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-white/[0.05] relative">
                <Image
                  src={playlist.image || getPlaylistImage(index)}
                  alt={playlist.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 150px"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaylistImage(index);
                  }}
                />

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#00BFFF] rounded-full flex items-center justify-center shadow-glow">
                    <FaPlay className="text-black text-sm ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="min-h-0">
                <h4 className="font-semibold text-white text-sm leading-tight truncate group-hover:text-[#00BFFF] transition-colors">
                  {playlist.name}
                </h4>
                <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-tight">
                  {playlist.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between mt-2 text-xs text-white/35">
                  <span>{playlist.tracks} songs</span>
                  <div className="flex items-center gap-1">
                    <span>{playlist.curator}</span>
                    <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Songs preview */}
                {playlist.songs && playlist.songs.length > 0 && (
                  <div className="mt-2 text-xs text-white/35">
                    <div className="truncate">
                      🎵 {playlist.songs.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

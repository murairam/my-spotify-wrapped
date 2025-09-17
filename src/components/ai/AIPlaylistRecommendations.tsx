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
    const images = [
      'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
      'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a',
      'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      'https://i.scdn.co/image/ab67616d0000b273ef968746a39516c05d3c267b'
    ];
    return images[index % images.length];
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
      const description = aiPlaylist && typeof aiPlaylist.description === 'string' ? aiPlaylist.description : 'AI curated for your taste';
      const songsArray = aiPlaylist && Array.isArray(aiPlaylist.songs) ? (aiPlaylist.songs.filter((s: unknown) => typeof s === 'string') as string[]) : [];

      const processedPlaylist: PlaylistRecommendation = {
        name,
        description,
        image: getPlaylistImage(i),
        curator: 'AI Curator',
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

        // If still no URL, create a targeted search URL and update text accordingly
        if (!processedPlaylist.url) {
          const genre = spotifyData?.topGenres?.[0] || 'pop';
          const titlePart = typeof name === 'string' ? name : 'playlist';
          processedPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(String(genre))}%20${encodeURIComponent(String(titlePart))}`;
          processedPlaylist.name = `${String(genre).charAt(0).toUpperCase() + String(genre).slice(1)} Search`;
          processedPlaylist.description = `Find ${String(genre)} playlists on Spotify`;
          console.log(`🔄 Using targeted search URL for playlist ${i + 1}:`, processedPlaylist.url);
        }
      } catch (error) {
        console.error(`❌ Error enriching playlist ${i + 1}:`, error);
        // Use basic fallback URL and update text
        const genre = spotifyData?.topGenres?.[0] || 'pop';
        processedPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(genre)}%20playlist`;
        processedPlaylist.name = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Playlists`;
        processedPlaylist.description = `Discover ${genre} music on Spotify`;
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

      // If still no URL, use targeted search and update text
      if (!fourthPlaylist.url) {
        if (topArtist) {
          fourthPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(topArtist.name)}%20radio`;
          fourthPlaylist.name = `${topArtist.name} Radio Search`;
          fourthPlaylist.description = `Find radio stations based on ${topArtist.name}`;
        } else {
          fourthPlaylist.url = `https://open.spotify.com/search/${encodeURIComponent(topGenres[0])}%20discover`;
          fourthPlaylist.name = `${topGenres[0].charAt(0).toUpperCase() + topGenres[0].slice(1)} Discovery`;
          fourthPlaylist.description = `Discover new ${topGenres[0]} music`;
        }
        console.log('🔄 Using targeted search URL for 4th playlist:', fourthPlaylist.url);
      }
    } catch (error) {
      console.error('❌ Error enriching 4th playlist:', error);
      fourthPlaylist.url = `https://open.spotify.com/search/discover%20weekly`;
      fourthPlaylist.name = 'Discover Weekly Style';
      fourthPlaylist.description = 'Find new music recommendations';
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

  // Don't render anything if no AI analysis has been run
  if (!aiPlaylists && playlists.length === 0) {
    return null;
  }

  if (isLoading && playlists.length === 0) {
    return (
      <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <FaListUl className="text-[#1DB954] text-xl" />
          <h3 className="text-lg font-bold text-white">Playlist Suggestions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-black/20 rounded-lg p-3 animate-pulse">
              <div className="aspect-square bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <FaListUl className="text-[#1DB954] text-2xl" />
          <h2 className="text-2xl font-bold text-white">AI Playlist Suggestions</h2>
          <span className="text-gray-400 text-sm ml-auto">
            {playlists.length} AI-curated mixes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && playlists.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm text-[#1DB954]">
            <FaSpinner className="animate-spin" />
            Enriching playlists with Spotify data...
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-all group cursor-pointer"
              onClick={() => playlist.url && window.open(playlist.url, '_blank')}
            >
              {/* Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative">
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
                  <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
                    <FaPlay className="text-white text-sm ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="min-h-0">
                <h4 className="font-semibold text-white text-sm leading-tight truncate group-hover:text-[#1DB954] transition-colors">
                  {playlist.name}
                </h4>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-tight">
                  {playlist.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{playlist.tracks} songs</span>
                  <div className="flex items-center gap-1">
                    <span>{playlist.curator}</span>
                    <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Songs preview */}
                {playlist.songs && playlist.songs.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
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

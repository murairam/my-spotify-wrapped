// src/components/ai/AIPlaylistRecommendations.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaMusic, FaExternalLinkAlt, FaPlay, FaSpinner } from 'react-icons/fa';
import type { SpotifyData } from '@/types/spotify';

interface PlaylistRecommendation {
  name: string;
  description: string;
  url: string;
  image?: string;
  curator: string;
  tracks: number;
  external_urls?: { spotify?: string };
}

interface AIPlaylistRecommendationsProps {
  spotifyData: SpotifyData;
  className?: string;
  aiPlaylists?: unknown | undefined;
}



export default function AIPlaylistRecommendations({ spotifyData, className = '', aiPlaylists }: AIPlaylistRecommendationsProps) {
  const [playlists, setPlaylists] = useState<PlaylistRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback: Search real Spotify playlists based on genres
  const searchSpotifyPlaylists = useCallback(async () => {
    try {
      const topGenre = Array.isArray(spotifyData.topGenres)
        ? spotifyData.topGenres[0]
        : (spotifyData.topGenres as unknown && typeof spotifyData.topGenres === 'object' ? (spotifyData.topGenres as Record<string, unknown>)['genre'] as string | undefined : undefined) || 'indie';

      const response = await fetch(`/api/spotify/search-playlists?q=${encodeURIComponent(topGenre)}&limit=3`);

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error('Spotify playlist search error:', err);
    }
  }, [spotifyData]);

  // Helpers to avoid using `any` and satisfy ESLint rules. Memoize to keep stable references.
  const getSpotifyUrlFromExternal = useCallback((external: unknown): string | undefined => {
    if (!external || typeof external !== 'object') return undefined;
    const ex = external as Record<string, unknown>;
    if (typeof ex['spotify'] === 'string') return ex['spotify'] as string;
    return undefined;
  }, []);

  const extractArtistName = useCallback((a: unknown): string | undefined => {
    if (!a || typeof a !== 'object') return undefined;
    const rec = a as Record<string, unknown>;
    if (typeof rec['name'] === 'string') return rec['name'] as string;
    return undefined;
  }, []);

  const normalizeFoundPlaylist = useCallback((found: unknown): Partial<PlaylistRecommendation> => {
    if (!found || typeof found !== 'object') return {};
    const f = found as Record<string, unknown>;
    const name = typeof f['name'] === 'string' ? (f['name'] as string) : undefined;
    const description = typeof f['description'] === 'string' ? (f['description'] as string) : undefined;
    const url = typeof f['url'] === 'string' ? (f['url'] as string) : getSpotifyUrlFromExternal(f['external_urls']);
    const image = typeof f['image'] === 'string' ? (f['image'] as string) : undefined;
    const curator = typeof f['curator'] === 'string' ? (f['curator'] as string) : undefined;
    const tracks = typeof f['tracks'] === 'number' ? (f['tracks'] as number) : undefined;
    const external_urls = f['external_urls'] && typeof f['external_urls'] === 'object' ? (f['external_urls'] as Record<string, unknown>) : undefined;
    return { name, description, url, image, curator, tracks, external_urls };
  }, [getSpotifyUrlFromExternal]);

  // Simple string-based scoring for name/description similarity. Memoize.
  const scoreMatch = useCallback((ai: string, candidateName: string, candidateDescription?: string) => {
    const a = ai.toLowerCase();
    const n = candidateName.toLowerCase();
    const d = (candidateDescription || '').toLowerCase();

    let score = 0;
    if (n.includes(a) || a.includes(n)) score += 50;
    // overlap by words
    const aWords = a.split(/\W+/).filter(Boolean);
    const nWords = n.split(/\W+/).filter(Boolean);
    const overlap = aWords.filter(w => nWords.includes(w)).length;
    score += overlap * 10;
    // description bonus
    const dOverlap = aWords.filter(w => d.includes(w)).length;
    score += dOverlap * 5;
    return score;
  }, []);

  // lightweight fuzzy similarity using Dice's coefficient on character bigrams
  const fuzzyScore = useCallback((a: string, b: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const sa = normalize(a);
    const sb = normalize(b);
    if (!sa || !sb) return 0;
    const bigrams = (s: string) => {
      const res: string[] = [];
      for (let i = 0; i < s.length - 1; i++) res.push(s.slice(i, i + 2));
      return res;
    };
    const A = bigrams(sa);
    const B = bigrams(sb);
    const intersection = A.filter(x => B.includes(x)).length;
    const score = (2 * intersection) / (A.length + B.length || 1);
    return Math.round(score * 100);
  }, []);


  // We'll trigger fetching/enrichment via a stable function. This avoids repeated re-fetches
  // caused by unstable references or frequent parent re-renders.
  const lastFetchKeyRef = React.useRef<string | null>(null);
  const aiUsedRef = React.useRef(false);

  const fetchAndEnrich = useCallback(async () => {
    if (!spotifyData?.topGenres || !spotifyData?.topArtists) return;
    // Include a small signature of the AI playlists in the fetch key so that when
    // the server returns new AI suggestions (for example after a time-range change),
    // we still re-run enrichment even if the top genres/artists didn't change.
    const aiSignature = Array.isArray(aiPlaylists)
      ? (aiPlaylists as unknown[]).slice(0, 3).map((raw) => {
          if (raw && typeof raw === 'object') {
            const p = raw as Record<string, unknown>;
            if (typeof p['name'] === 'string') return p['name'] as string;
            if (Array.isArray(p['songs'])) return (p['songs'] as string[]).slice(0, 3).join('|');
          }
          return '';
        })
      : undefined;

    const fetchKey = JSON.stringify({
      genres: Array.isArray(spotifyData?.topGenres) ? spotifyData.topGenres.slice(0, 3) : spotifyData?.topGenres,
      artists: Array.isArray(spotifyData?.topArtists) ? spotifyData.topArtists.slice(0, 5).map(a => extractArtistName(a)).filter(Boolean) : undefined,
      ai: aiSignature,
    });

    // If AI supplied playlists, show them immediately for UX feedback, but continue enrichment
    const aiList = Array.isArray(aiPlaylists) ? aiPlaylists : [];
    if (aiList.length > 0) {
      try {
        const mapped = aiList.map((raw) => {
          const p = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {} as Record<string, unknown>;
          const name = typeof p['name'] === 'string' ? p['name'] as string : undefined;
          const description = typeof p['description'] === 'string' ? p['description'] as string : undefined;
          const url = p['external_urls'] && typeof p['external_urls'] === 'object' ? ((p['external_urls'] as Record<string, unknown>)['spotify'] as string | undefined) : (typeof p['url'] === 'string' ? p['url'] as string : undefined);
          const image = typeof p['image'] === 'string' ? p['image'] as string : undefined;
          const curator = typeof p['curator'] === 'string' ? p['curator'] as string : 'AI Curator';
          const songs = Array.isArray(p['songs']) ? (p['songs'] as string[]) : undefined;
          const tracks = typeof p['tracks'] === 'number' ? p['tracks'] as number : (songs ? songs.length : 0);

          return {
            name,
            description,
            url,
            image,
            curator,
            tracks,
            external_urls: p['external_urls'] && typeof p['external_urls'] === 'object' ? (p['external_urls'] as Record<string, unknown>) : undefined,
          } as PlaylistRecommendation;
        });
        // show AI playlists first
        setPlaylists(mapped);
        aiUsedRef.current = true;
        // do not return; continue to enrich from Spotify so we replace defaults with real matches
      } catch {
        // fall through to normal flow
      }
    }

    if (lastFetchKeyRef.current === fetchKey) {
      // same data, skip re-fetch
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mistral/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topGenres: Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres.slice(0, 3) : spotifyData.topGenres,
          topArtists: Array.isArray(spotifyData.topArtists) ? spotifyData.topArtists.slice(0, 5).map(a => extractArtistName(a)).filter(Boolean) : [],
          userProfile: spotifyData.userProfile
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendations');
      const data = await response.json();
      const aiPlaylistsFromServer: PlaylistRecommendation[] = (data.playlists || []) as PlaylistRecommendation[];
      setPlaylists(aiPlaylistsFromServer);

      try {
        const enriched = await Promise.all(aiPlaylistsFromServer.map(async (pl) => {
          const qRaw = pl.name || pl.description || '';
          const q = encodeURIComponent(qRaw);
          if (!qRaw) return pl;

          try {
            const sp = await fetch(`/api/spotify/search-playlists?q=${q}&limit=3&include_tracks=true`);
            if (!sp.ok) return pl;
            const spData = await sp.json();
            const candidates = Array.isArray(spData.playlists) ? spData.playlists : [];
            if (candidates.length === 0) return pl;

            let best = candidates[0];
            let bestScore = -Infinity;
            for (const c of candidates) {
              const cRec = c as Record<string, unknown>;
              const name = typeof cRec['name'] === 'string' ? cRec['name'] as string : '';
              const desc = typeof cRec['description'] === 'string' ? cRec['description'] as string : '';
              const fuzzy = fuzzyScore(qRaw, name || desc);
              const base = scoreMatch(qRaw, name, desc);
              const sc = fuzzy * 0.6 + base * 0.4;
              if (sc > bestScore) {
                bestScore = sc;
                best = c;
              }
            }

            const nf = normalizeFoundPlaylist(best);
            return {
              ...pl,
              name: nf.name || pl.name,
              description: nf.description || pl.description,
              url: nf.url || pl.url,
              image: nf.image || pl.image,
              curator: nf.curator || pl.curator,
              tracks: typeof nf.tracks === 'number' ? nf.tracks : pl.tracks,
              external_urls: nf.external_urls || pl.external_urls
            } as PlaylistRecommendation;
          } catch (innerErr) {
            console.error('Error searching Spotify for playlist enrichment', innerErr);
            return pl;
          }
        }));

        setPlaylists(enriched);
      } catch (err) {
        console.error('Failed to enrich AI playlists with Spotify metadata:', err);
      }

      lastFetchKeyRef.current = fetchKey;
      aiUsedRef.current = false;
    } catch (err) {
      console.error('Playlist recommendation error:', err);
      setError('Failed to load playlist recommendations');
      await searchSpotifyPlaylists();
    } finally {
      setIsLoading(false);
    }
  }, [spotifyData, normalizeFoundPlaylist, scoreMatch, fuzzyScore, searchSpotifyPlaylists, extractArtistName, aiPlaylists]);

  useEffect(() => {
    void fetchAndEnrich();
    // If aiPlaylists changes, force fetchAndEnrich to re-run mapping/fetch
  }, [fetchAndEnrich, aiPlaylists]);




  if (isLoading) {
    return (
      <div className={`bg-[#0d1117] rounded-lg p-6 border border-gray-800 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <FaMusic className="text-[#1DB954] text-lg" />
          <h3 className="text-xl font-bold text-white">Perfect Playlists for You</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-[#1DB954] text-2xl mr-3" />
          <span className="text-gray-400">Finding your perfect playlists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0d1117] rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaMusic className="text-[#1DB954] text-lg" />
        <h3 className="text-xl font-bold text-white">Perfect Playlists for You</h3>
      </div>

      {error && (
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => { void fetchAndEnrich(); }}
            className="mt-4 text-sm text-[#1DB954] hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {playlists.map((playlist, index) => (
            <div
                key={index}
                className={`bg-[#181818] rounded-lg p-4 border border-gray-700/50 hover:border-[#1DB954]/50 transition-all group ${ (playlist.url || getSpotifyUrlFromExternal(playlist.external_urls)) ? 'cursor-pointer' : 'cursor-not-allowed opacity-70' }`}
                onClick={() => {
                  const target = playlist.url || getSpotifyUrlFromExternal(playlist.external_urls);
                  if (target) window.open(target, '_blank');
                }}
                role={(playlist.url || getSpotifyUrlFromExternal(playlist.external_urls)) ? 'link' : undefined}
              >
              {playlist.image && (
                <div className="w-full h-32 rounded-lg mb-3 overflow-hidden relative">
                  {typeof playlist.image === 'string' && /https?:\/\//i.test(playlist.image) ? (
                    // External images: render a plain <img> to avoid Next.js host config requirement
                    // Keep responsive sizing via CSS
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={playlist.image} alt={playlist.name || 'playlist image'} className="object-cover w-full h-full" />
                  ) : (
                    <Image
                      src={(playlist.image as string) || ''}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1 group-hover:text-[#1DB954] transition-colors">
                    {playlist.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FaPlay className="text-xs" />
                    <span>{playlist.tracks} tracks</span>
                    <span>•</span>
                    <span>by {playlist.curator}</span>
                  </div>
                </div>
                <FaExternalLinkAlt className="text-gray-500 group-hover:text-[#1DB954] transition-colors ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


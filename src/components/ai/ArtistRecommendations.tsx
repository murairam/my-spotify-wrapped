// src/components/ai/ArtistRecommendations.tsx
"use client";

import React, { useEffect, useState } from 'react';

// Module-level cache for artist track lookup: Map<query, { url?: string | null; ts?: number }>
const artistTrackSearchCache: Map<string, { url?: string | null; ts?: number }> = new Map();
// Map to hold in-flight promises so duplicate queries reuse the same network request
const artistTrackInFlight: Map<string, Promise<{ url?: string | null }>> = new Map();

// sessionStorage key to persist client cache across reloads
const ARTIST_TRACK_CACHE_KEY = 'artistTrackSearchCache_v1';
// TTL for cache entries (ms)
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const normalizeQuery = (q: string) => q.trim().toLowerCase().replace(/\s+/g, ' ');

// hydrate module cache from sessionStorage if available
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const raw = sessionStorage.getItem(ARTIST_TRACK_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, { url?: string | null; ts?: number }>;
      Object.entries(parsed).forEach(([k, v]) => artistTrackSearchCache.set(k, v));
    }
  }
} catch {}
import { FaMusic, FaExternalLinkAlt, FaPlay } from 'react-icons/fa';

interface ArtistRecommendation {
  artist: string;
  reason: string;
  genre: string;
  song: string;
}

interface ArtistRecommendationsProps {
  recommendations: unknown;
  className?: string;
}

export default function ArtistRecommendations({ recommendations, className = '' }: ArtistRecommendationsProps) {
  const parseArtistRecommendations = (data: unknown): ArtistRecommendation[] => {
    if (Array.isArray(data)) return data.slice(0, 3);
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      } catch {}
    }
    return [];
  };

  const artistRecs = parseArtistRecommendations(recommendations);

  // Note: we use the module-level cache `artistTrackSearchCache` directly below.

  const getSpotifyArtistUrl = (artistName: string) => {
    const query = encodeURIComponent(artistName);
    return `https://open.spotify.com/search/${query}/artists`;
  };

  // local state for enriched tracks per index
  const [tracks, setTracks] = useState<Array<{ url?: string | null; loading: boolean }>>(
    artistRecs.map(() => ({ url: null, loading: true }))
  );

  // keep tracks length in sync when artistRecs change
  useEffect(() => {
    setTracks(artistRecs.map(() => ({ url: null, loading: true })));
  }, [artistRecs]);

  useEffect(() => {
    let mounted = true;
    const fetchTrack = async (query: string, idx: number) => {
      // normalize query then check cache
      const nq = normalizeQuery(query);
      const cached = artistTrackSearchCache.get(nq);
      // if cached and not expired, use it
      if (cached && cached.ts && Date.now() - cached.ts < CACHE_TTL) {
        if (!mounted) return;
        setTracks((s) => {
          const copy = [...s];
          copy[idx] = { url: cached.url ?? null, loading: false };
          return copy;
        });
        return;
      }
      if (cached) {
        if (!mounted) return;
        setTracks((s) => {
          const copy = [...s];
          copy[idx] = { url: cached.url ?? null, loading: false };
          return copy;
        });
        return;
      }

      // If there's an in-flight request for the same query, reuse it
      let inflight = artistTrackInFlight.get(nq);
      if (!inflight) {
        inflight = (async () => {
          try {
            const res = await fetch(`/api/spotify/search-track?q=${encodeURIComponent(nq)}`);
            const json = await res.json();
            if (json?.ok && json.result) {
              const result = { url: json.result.url ?? null, ts: Date.now() };
              try { artistTrackSearchCache.set(nq, result); } catch {}
              // persist a lightweight map to sessionStorage
              try {
                const store: Record<string, { url?: string | null; ts?: number }> = {};
                artistTrackSearchCache.forEach((v, k) => (store[k] = { url: v.url ?? null, ts: v.ts }));
                sessionStorage.setItem(ARTIST_TRACK_CACHE_KEY, JSON.stringify(store));
              } catch {}
              return result;
            }
            try { artistTrackSearchCache.set(nq, { url: null, ts: Date.now() }); } catch {}
            return { url: null };
          } catch {
            try { artistTrackSearchCache.set(nq, { url: null, ts: Date.now() }); } catch {}
            return { url: null };
          }
        })();
        artistTrackInFlight.set(nq, inflight);
      }

      try {
        const result = await inflight;
        if (!mounted) return;
        setTracks((s) => {
          const copy = [...s];
          copy[idx] = { url: result.url ?? null, loading: false };
          return copy;
        });
      } finally {
  // clear inflight entry once finished to avoid memory growth
        artistTrackInFlight.delete(nq);
      }
    };

    artistRecs.forEach((rec, idx) => {
      const q = `${rec.artist} ${rec.song}`;
      fetchTrack(q, idx);
    });

    return () => {
      mounted = false;
    };
  }, [artistRecs]);

  if (artistRecs.length === 0) {
    return null;
  }

  return (
    <div className={`bg-[#0d1117] rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaMusic className="text-[#1DB954] text-lg" />
          <h3 className="text-xl font-bold text-white">Artists You&apos;ll Love</h3>
        </div>
        <div className="text-gray-400 text-sm">AI curated</div>
      </div>

      <div className="space-y-4">
        {artistRecs.map((artist, index) => (
          <div
            key={index}
            className="bg-[#181818] rounded-lg p-4 border border-gray-700/50 hover:border-[#1DB954]/50 transition-all group cursor-pointer"
            onClick={() => window.open(getSpotifyArtistUrl(artist.artist), '_blank')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold text-lg group-hover:text-[#1DB954] transition-colors">
                    {artist.artist}
                  </h4>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                    {artist.genre}
                  </span>
                </div>
                  <p className="text-gray-400 text-sm mb-2">{artist.reason}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <FaPlay className="text-xs" />
                  {tracks[index]?.loading ? (
                    <span className="italic text-gray-400">Enriching...</span>
                  ) : tracks[index]?.url ? (
                    <a
                      href={tracks[index].url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#1DB954]"
                      // intentionally no click handler: allow normal link behavior
                    >
                      Try: &quot;{artist.song}&quot;
                    </a>
                  ) : (
                    <span>Try: &quot;{artist.song}&quot;</span>
                  )}
                </div>
              </div>
              <FaExternalLinkAlt className="text-gray-500 group-hover:text-[#1DB954] transition-colors ml-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

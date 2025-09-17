'use client';

import React from 'react';
import Image from 'next/image';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';

interface Props {
  summary?: string | null;
  playlists?: unknown;
  className?: string;
}

export default function AIAnalysisSpotlight({ summary, playlists, className = '' }: Props) {
  type LocalPL = { name?: string; description?: string; songs?: string[]; external_urls?: { spotify?: string } | Record<string, unknown>; image?: string };
  const normalizedPlaylists: LocalPL[] = Array.isArray(playlists)
    ? playlists.map((p) => {
        if (!p || typeof p !== 'object') return {} as LocalPL;
        const rec = p as Record<string, unknown>;
        return {
          name: typeof rec['name'] === 'string' ? (rec['name'] as string) : undefined,
          description: typeof rec['description'] === 'string' ? (rec['description'] as string) : undefined,
          songs: Array.isArray(rec['songs']) ? (rec['songs'] as string[]) : undefined,
          external_urls: rec['external_urls'] && typeof rec['external_urls'] === 'object' ? (rec['external_urls'] as Record<string, unknown>) : undefined,
          image: typeof rec['image'] === 'string' ? (rec['image'] as string) : undefined,
        };
      })
    : [];

  const top = normalizedPlaylists.length > 0 ? normalizedPlaylists[0] : null;

  const getSpotifyUrl = (ext: unknown) => {
    if (!ext || typeof ext !== 'object') return undefined;
    const rec = ext as Record<string, unknown>;
    if (typeof rec['spotify'] === 'string') return rec['spotify'] as string;
    return undefined;
  };

  return (
    <div className={`bg-gradient-to-br from-[#071017] to-[#0b1318] rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FaStar className="text-yellow-400 text-xl" />
          <div>
            <h3 className="text-xl font-bold text-white">AI Spotlight</h3>
            <p className="text-gray-400 text-sm">A short summary of what the AI discovered about your listening.</p>
          </div>
        </div>
        {top && (
          <div className="text-right text-xs text-gray-400">
            <div className="font-medium text-white">Top suggestion</div>
            <div className="mt-1">{top.name}</div>
          </div>
        )}
      </div>

      {summary ? (
        <div className="mb-4 text-gray-200 text-sm leading-relaxed">
          {summary}
        </div>
      ) : (
        <div className="mb-4 text-gray-400 text-sm">No AI summary available yet.</div>
      )}

      {top && (
        <div className="bg-[#0f1417] rounded-lg p-3 border border-gray-700/50 flex items-center gap-3">
          {top.image ? (
            <div className="w-20 h-20 relative rounded-md overflow-hidden">
              {typeof top.image === 'string' && /https?:\/\//i.test(top.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={top.image} alt={top.name || 'playlist'} className="object-cover w-full h-full" />
              ) : (
                <Image src={(top.image as string) || ''} alt={top.name || 'playlist'} fill className="object-cover" sizes="80px" />
              )}
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center text-gray-500">Playlist</div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{top.name}</div>
                <div className="text-gray-400 text-sm line-clamp-2">{top.description}</div>
              </div>
              <a
                href={getSpotifyUrl(top.external_urls) || undefined}
                target="_blank"
                rel="noreferrer"
                className="ml-4 text-gray-400 hover:text-[#1DB954]"
              >
                <FaExternalLinkAlt />
              </a>
            </div>

            {Array.isArray(top.songs) && (
              <div className="text-gray-400 text-xs mt-3">
                {top.songs.slice(0, 5).map((s, i) => (
                  <div key={i} className="truncate">{s}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

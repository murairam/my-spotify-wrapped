// src/components/ai/AIPlaylistGenerator.tsx
'use client';

import React, { useState } from 'react';
import { FaListUl, FaChevronDown, FaChevronUp, FaClock, FaPlay } from 'react-icons/fa';

interface AIPlaylistGeneratorProps {
  playlists?: string;
  className?: string;
}

export default function AIPlaylistGenerator({ playlists, className = '' }: AIPlaylistGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!playlists) {
    return (
      <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <FaListUl className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Playlist Suggestions</h3>
            <p className="text-gray-400 text-sm">Curated playlists for every mood</p>
          </div>
        </div>
        <div className="text-center py-8">
          <FaListUl className="text-gray-600 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Run AI analysis to get personalized playlist ideas
          </p>
        </div>
      </div>
    );
  }

  // Parse playlist suggestions from AI response

  // Define a type for playlist suggestions
  interface PlaylistSuggestion {
    name: string;
    description: string;
    occasion: string;
    songs: string[];
  }

  const parsePlaylistSuggestions = (text: string): PlaylistSuggestion[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const suggestions: PlaylistSuggestion[] = [];

    let currentPlaylist: PlaylistSuggestion | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      // Check if it's a numbered playlist
      const numberMatch = trimmed.match(/^\d+\.\s*(.+)/);
      if (numberMatch) {
        if (currentPlaylist && currentPlaylist.name) {
          suggestions.push(currentPlaylist);
        }
        currentPlaylist = {
          name: numberMatch[1].replace(/[""\"]/g, ''),
          description: '',
          occasion: '',
          songs: []
        };
      } else if (currentPlaylist && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        const detail = trimmed.replace(/^[-•]\s*/, '');
        if (detail.toLowerCase().includes('mood:') || detail.toLowerCase().includes('occasion:')) {
          currentPlaylist.occasion = detail.replace(/.*(?:mood|occasion):\s*/i, '');
        } else if (detail.toLowerCase().includes('songs:') || detail.toLowerCase().includes('tracks:')) {
          // Skip the "songs:" label
        } else if (detail.includes(' - ') || detail.includes(' by ')) {
          currentPlaylist.songs.push(detail);
        } else {
          currentPlaylist.description += (currentPlaylist.description ? ' ' : '') + detail;
        }
      } else if (currentPlaylist && currentPlaylist.name && !trimmed.match(/^\d+/)) {
        if (trimmed.includes(' - ') || trimmed.includes(' by ')) {
          currentPlaylist.songs.push(trimmed);
        } else {
          currentPlaylist.description += (currentPlaylist.description ? ' ' : '') + trimmed;
        }
      }
    });


    if (currentPlaylist) {
      suggestions.push(currentPlaylist);
    }

    return suggestions.slice(0, 3);
  };

  const playlistSuggestions = parsePlaylistSuggestions(playlists);

  const getOccasionIcon = (occasion: string) => {
    const lower = occasion.toLowerCase();
    if (lower.includes('workout') || lower.includes('exercise')) return '💪';
    if (lower.includes('focus') || lower.includes('study')) return '🎯';
    if (lower.includes('relax') || lower.includes('chill')) return '😌';
    if (lower.includes('party') || lower.includes('dance')) return '🎉';
    if (lower.includes('morning') || lower.includes('wake')) return '🌅';
    if (lower.includes('night') || lower.includes('evening')) return '🌙';
    return '🎵';
  };

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <FaListUl className="text-white text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">Custom Playlist Ideas</h3>
              <p className="text-gray-400 text-sm">
                {playlistSuggestions.length} AI-curated concepts
              </p>
            </div>
          </div>
          {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {playlistSuggestions.length > 0 ? (
            <div className="space-y-4">
              {playlistSuggestions.map((playlist, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
                        <span>{getOccasionIcon(playlist.occasion)}</span>
                        {playlist.name}
                      </h4>
                      {playlist.occasion && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <FaClock className="text-xs" />
                          <span>{playlist.occasion}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <FaPlay className="text-xs" />
                      <span className="text-xs">{playlist.songs.length} tracks</span>
                    </div>
                  </div>

                  {playlist.description && (
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      {playlist.description}
                    </p>
                  )}

                  {playlist.songs.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Sample Tracks:
                      </h5>
                      {playlist.songs.slice(0, 3).map((song, songIndex) => (
                        <div key={songIndex} className="text-sm text-gray-300 bg-black/20 rounded px-2 py-1">
                          {song}
                        </div>
                      ))}
                      {playlist.songs.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{playlist.songs.length - 3} more suggestions...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-300 prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {playlists}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-black/20 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Personalized playlist concepts based on your listening patterns
        </p>
      </div>
    </div>
  );
}

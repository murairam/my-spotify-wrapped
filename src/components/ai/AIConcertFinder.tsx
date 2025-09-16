// src/components/ai/AIConcertFinder.tsx
'use client';

import React from 'react';
import { FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt, FaExternalLinkAlt, FaStar } from 'react-icons/fa';

interface Concert {
  artist: string;
  venue: string;
  city: string;
  date: string;
  matchScore: number;
  reason: string;
  ticketUrl?: string;
}

interface AIConcertFinderProps {
  concerts: Concert[];
  userLocation?: string;
  className?: string;
}

export default function AIConcertFinder({ concerts, userLocation, className = '' }: AIConcertFinderProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <FaTicketAlt className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Concert Recommendations</h3>
            <p className="text-gray-400 text-sm">
              {userLocation ? `Found in ${userLocation}` : 'Based on your taste'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {concerts && concerts.length > 0 ? (
          <div className="space-y-4">
            {concerts.map((concert, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-base mb-1">
                      {concert.artist}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {concert.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        {formatDate(concert.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar className={`text-xs ${getMatchColor(concert.matchScore)}`} />
                    <span className={`text-sm font-medium ${getMatchColor(concert.matchScore)}`}>
                      {concert.matchScore}%
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {concert.reason}
                </p>

                {concert.ticketUrl ? (
                  <a
                    href={concert.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-md text-sm transition-colors"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    View Tickets
                  </a>
                ) : (
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(concert.artist)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700/20 hover:bg-gray-700/30 text-gray-300 rounded-md text-sm transition-colors"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Artist on Spotify
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaTicketAlt className="text-gray-600 text-3xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {userLocation
                ? `No concerts found in ${userLocation}. Try a different city!`
                : 'Add your location to find concerts near you.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-black/20 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Concert recommendations powered by AI analysis
        </p>
      </div>
    </div>
  );
}

// src/components/concerts/ConcertFinderSection.tsx - NEW SEPARATE COMPONENT
'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaTicketAlt, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import type { SpotifyData } from '@/types/spotify';

interface ConcertRecommendation {
  artist: string;
  venue: string;
  city: string;
  date: string;
  matchScore: number;
  reason: string;
  ticketUrl?: string;
  price?: string;
}

interface ConcertFinderSectionProps {
  spotifyData: SpotifyData;
  className?: string;
}

export default function ConcertFinderSection({ spotifyData, className = '' }: ConcertFinderSectionProps) {
  const [location, setLocation] = useState('');
  const [concerts, setConcerts] = useState<ConcertRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchConcerts = async () => {
    if (!location.trim() || !spotifyData?.topArtists) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Mock concert search - replace with real API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      const mockConcerts: ConcertRecommendation[] = spotifyData.topArtists.slice(0, 4).map((artist, index) => ({
        artist: artist.name,
        venue: `${['Arena', 'Theater', 'Club', 'Festival'][index]} ${Math.floor(Math.random() * 100)}`,
        city: location,
        date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        matchScore: Math.max(85 - (index * 5), 70),
        reason: `Perfect match for your taste in ${artist.genres?.[0] || 'music'}`,
        price: `$${Math.floor(Math.random() * 50) + 25}-${Math.floor(Math.random() * 100) + 50}`,
        ticketUrl: `https://example.com/tickets/${artist.name.toLowerCase().replace(/\s+/g, '-')}`
      }));

      setConcerts(mockConcerts);
    } catch (error) {
      console.error('Concert search failed:', error);
      setConcerts([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center bg-gradient-to-br from-orange-900/20 via-red-900/20 to-pink-900/20 rounded-3xl p-8 border border-orange-500/20">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <FaTicketAlt className="text-white text-2xl" />
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-black text-white bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Concert Finder
            </h2>
            <p className="text-lg text-gray-300 font-medium">
              Find live shows near you
            </p>
          </div>
        </div>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Discover upcoming concerts from your favorite artists and similar musicians playing in your area.
        </p>
      </div>

      {/* Search Interface */}
      <div className="bg-gradient-to-br from-slate-900 to-orange-900/20 rounded-2xl border border-orange-500/30 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Your Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchConcerts()}
              placeholder="Enter city, state, or country..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={searchConcerts}
            disabled={!location.trim() || isSearching || !spotifyData?.topArtists}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <FaSearch />
                Find Concerts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {concerts.length > 0 ? (
            <>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Found {concerts.length} concerts in {location}
                </h3>
                <p className="text-gray-400">Based on your top artists</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {concerts.map((concert, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-900 to-orange-900/10 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-colors overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Artist & Match Score */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">{concert.artist}</h4>
                          <p className="text-gray-400 text-sm">{concert.reason}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {concert.matchScore}% Match
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-300">
                          <FaMapMarkerAlt className="text-orange-400" />
                          <span className="text-sm">{concert.venue}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-300">
                          <FaCalendarAlt className="text-blue-400" />
                          <span className="text-sm">{concert.date}</span>
                        </div>

                        {concert.price && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <FaTicketAlt className="text-green-400" />
                            <span className="text-sm">{concert.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => concert.ticketUrl && window.open(concert.ticketUrl, '_blank')}
                        className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500 hover:to-red-500 border border-orange-500/50 hover:border-transparent text-orange-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                      >
                        <FaExternalLinkAlt />
                        Get Tickets
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-700">
              <FaTicketAlt className="text-gray-600 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No concerts found</h3>
              <p className="text-gray-500 text-sm">
                Try searching in a different location or check back later for new events.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

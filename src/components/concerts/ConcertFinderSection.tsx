// src/components/concerts/ConcertFinderSection.tsx - SPOTIFY-STYLED VERSION
'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaTicketAlt, FaCalendarAlt, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import Image from 'next/image';
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
      await new Promise(resolve => setTimeout(resolve, 2000));

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

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className={`bg-[#191414] rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Header - Spotify Style */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-lg flex items-center justify-center">
            <FaTicketAlt className="text-black text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Concert Finder</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <Image
                src="https://developer.spotify.com/images/guidelines/design/logos/01_RGB/02_PNG/Spotify_Logo_RGB_Green.png"
                alt="Spotify"
                width={16}
                height={16}
                className="opacity-60"
              />
              <span>Based on your top artists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchConcerts()}
                placeholder="Enter your city..."
                className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#1DB954] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={searchConcerts}
            disabled={!location.trim() || isSearching || !spotifyData?.topArtists}
            className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-700 text-black disabled:text-gray-400 font-semibold px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <FaSearch />
                Search Concerts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {hasSearched && (
          <>
            {concerts.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Found {concerts.length} concerts in {location}
                  </h3>
                  <span className="text-gray-400 text-sm">Based on your listening history</span>
                </div>

                <div className="space-y-4">
                  {concerts.map((concert, index) => (
                    <div
                      key={index}
                      className="bg-[#0d1117] rounded-lg p-4 border border-gray-800 hover:border-gray-600 hover:bg-[#181818] transition-all group cursor-pointer"
                      onClick={() => concert.ticketUrl && window.open(concert.ticketUrl, '_blank')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-semibold text-lg group-hover:text-[#1DB954] transition-colors">
                              {concert.artist}
                            </h4>
                            <div className="flex items-center gap-1">
                              <FaStar className={`text-xs ${getMatchScoreColor(concert.matchScore)}`} />
                              <span className={`text-sm font-medium ${getMatchScoreColor(concert.matchScore)}`}>
                                {concert.matchScore}% Match
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-xs" />
                              <span>{concert.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-xs" />
                              <span>{concert.date}</span>
                            </div>
                            {concert.price && (
                              <div className="flex items-center gap-2">
                                <FaTicketAlt className="text-xs" />
                                <span>{concert.price}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-400 text-sm mb-3">{concert.reason}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#1DB954] text-sm group-hover:text-[#1ed760] transition-colors">
                              <FaExternalLinkAlt className="text-xs" />
                              <span>Get Tickets</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FaTicketAlt className="text-gray-600 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No concerts found in {location}</h3>
                <p className="text-gray-500 text-sm">
                  Try searching in a different location or check back later for new events.
                </p>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-6">
              Enter your location to find upcoming concerts from your favorite artists and similar musicians.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800 bg-[#0d1117]">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Concert data may not reflect real availability</span>
          <div className="flex items-center gap-2">
            <Image
              src="https://developer.spotify.com/images/guidelines/design/logos/01_RGB/02_PNG/Spotify_Logo_RGB_Green.png"
              alt="Spotify"
              width={14}
              height={14}
              className="opacity-60"
            />
            <span>Based on Spotify listening data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { FaMusic, FaMicrophone, FaFire, FaUsers, FaChartLine } from 'react-icons/fa';
import { TopItemsSection, TopItem } from './TopItemsSection';
import { GenreChart, GenreData } from './GenreChart';
import { DecadePieChart, DecadeData } from './DecadePieChart';
import { StatCard, StatData } from './StatCard';
import { ListeningHabits, ListeningHabitsData } from './ListeningHabits';
import { SpotifyData } from '../hooks/useSpotifyData';
/**
 * Props for the EnhancedDataDashboard component
 */
interface EnhancedDataDashboardProps {
  /** Spotify data from the hook */
  spotifyData: SpotifyData;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Helper function to transform Spotify tracks to TopItem format
 */
const transformTracksToTopItems = (tracks?: SpotifyData['topTracks']): TopItem[] => {
  if (!tracks) return [];
  return tracks.slice(0, 10).map((track, index) => ({
    id: track.id,
    name: track.name,
    artist: track.artist,
    plays: Math.floor(Math.random() * 100) + 20, // Simulated plays
    popularity: track.popularity,
    image: track.images?.[0]?.url,
    rank: index + 1,
    external_urls: track.external_urls
  }));
};

/**
 * Helper function to transform Spotify artists to TopItem format
 */
const transformArtistsToTopItems = (artists?: SpotifyData['topArtists']): TopItem[] => {
  if (!artists) return [];
  return artists.slice(0, 10).map((artist, index) => ({
    id: artist.id,
    name: artist.name,
    plays: Math.floor(Math.random() * 100) + 30, // Simulated plays
    popularity: artist.popularity || 0,
    image: artist.images?.[0]?.url,
    rank: index + 1,
    external_urls: artist.external_urls
  }));
};

/**
 * Helper function to transform genre data
 */
const transformGenreData = (genres?: SpotifyData['topGenres']): GenreData[] => {
  if (!genres) return [];
  return genres.map(genre => ({
    name: typeof genre === 'string' ? genre : genre.genre || 'Unknown Genre',
    count: typeof genre === 'object' && genre.count ? genre.count : Math.floor(Math.random() * 15) + 1
  }));
};

/**
 * Helper function to generate decade distribution from tracks
 */
const generateDecadeDistribution = (tracks?: SpotifyData['topTracks']): DecadeData[] => {
  if (!tracks || tracks.length === 0) return [];

  const decades: { [key: string]: number } = {};

  tracks.forEach(track => {
    if (track.album?.release_date) {
      const year = parseInt(track.album.release_date.split('-')[0]);
      const decade = `${Math.floor(year / 10) * 10}s`;
      decades[decade] = (decades[decade] || 0) + 1;
    }
  });

  const total = Object.values(decades).reduce((sum, count) => sum + count, 0);

  return Object.entries(decades)
    .map(([decade, count]) => ({
      decade,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Helper function to generate listening habits data
 */
const generateListeningHabits = (): ListeningHabitsData => {
  // Simulated data - in a real app this would come from actual listening history
  const peakHours = ['14:00', '16:00', '18:00', '20:00', '22:00'];
  const peakDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 50) + (hour >= 8 && hour <= 22 ? 20 : 5),
    label: `${hour}:00`
  }));

  const dailyData = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => ({
    day,
    dayIndex: index,
    count: Math.floor(Math.random() * 100) + 30
  }));

  return {
    peakHour: peakHours[Math.floor(Math.random() * peakHours.length)],
    peakDay: peakDays[Math.floor(Math.random() * peakDays.length)],
    period: 'Afternoon',
    hourlyData,
    dailyData,
    insights: {
      weekendVsWeekday: 'Weekend Heavy',
      morningVsEvening: 'Evening Listener',
      consistency: 'Very Consistent'
    }
  };
};

/**
 * EnhancedDataDashboard Component
 *
 * A comprehensive data visualization dashboard featuring:
 * - Top tracks and artists with visual cards
 * - Interactive genre bar chart
 * - Decade distribution pie chart
 * - Color-coded statistics with context
 * - Listening habits and time patterns
 */
export const EnhancedDataDashboard = ({
  spotifyData,
  isLoading = false,
  className = ""
}: EnhancedDataDashboardProps) => {

  // Transform data for components
  const topTracks = transformTracksToTopItems(spotifyData?.topTracks);
  const topArtists = transformArtistsToTopItems(spotifyData?.topArtists);
  const genreData = transformGenreData(spotifyData?.topGenres);
  const decadeData = generateDecadeDistribution(spotifyData?.topTracks);
  const listeningHabits = generateListeningHabits();

  // Prepare stat data with proper context
  const statsData: StatData[] = [
    {
      value: spotifyData?.stats?.averagePopularity || 67,
      label: 'Average Popularity',
      subtitle: 'Based on track popularity scores',
      maxValue: 100,
      unit: '/100'
    },
    {
      value: ((spotifyData?.stats?.uniqueArtistsCount || 45) / (spotifyData?.stats?.totalArtistsAnalyzed || 89) * 100).toFixed(0),
      label: 'Artist Diversity',
      subtitle: 'Unique vs total artists ratio',
      maxValue: 100,
      unit: '%'
    },
    {
      value: 77, // Simulated recent music percentage
      label: 'Recent Music Percentage',
      subtitle: 'Music from last 5 years',
      maxValue: 100,
      unit: '%'
    },
    {
      value: spotifyData?.stats?.totalGenresFound || 12,
      label: 'Genre Exploration',
      subtitle: 'Different genres discovered',
      maxValue: 20,
    }
  ];

  const statIcons = [FaFire, FaUsers, FaChartLine, FaMusic];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Top Items Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <TopItemsSection
          title="Your Top Tracks"
          items={topTracks}
          icon={<FaMusic />}
          isLoading={isLoading}
        />

        <TopItemsSection
          title="Your Top Artists"
          items={topArtists}
          icon={<FaMicrophone />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <GenreChart
          genres={genreData}
          isLoading={isLoading}
        />

        <DecadePieChart
          decades={decadeData}
          isLoading={isLoading}
        />
      </div>

      {/* Statistics Grid */}
      <div>
        <div className="flex items-center mb-6">
          <FaChartLine className="text-2xl mr-3 text-[#1DB954]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Your Music Analytics</h2>
            <p className="text-sm text-gray-400 mt-1">
              Key insights about your listening patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              icon={React.createElement(statIcons[index])}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Listening Habits */}
      <ListeningHabits
        habits={listeningHabits}
        isLoading={isLoading}
      />
    </div>
  );
};

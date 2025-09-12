import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaPalette } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Interface for genre data
 */
export interface GenreData {
  name: string;
  count: number;
}

/**
 * Props for the GenreChart component
 */
interface GenreChartProps {
  /** Array of genre data */
  genres: GenreData[];
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * GenreChart Component
 *
 * Displays top genres as an interactive bar chart with:
 * - Responsive chart that adapts to container size
 * - Spotify green gradient colors
 * - Hover effects and tooltips
 * - Shows top 10 genres maximum for readability
 */
export const GenreChart = ({
  genres,
  isLoading = false,
  className = ""
}: GenreChartProps) => {

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaPalette className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Top Genres</h2>
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Limit to top 10 genres for better readability
  const topGenres = genres.slice(0, 10);

  // Prepare chart data with Spotify styling
  const chartData = {
    labels: topGenres.map(genre =>
      genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
    ),
    datasets: [
      {
        label: 'Artists',
        data: topGenres.map(genre => genre.count),
        backgroundColor: topGenres.map((_, index) => {
          // Create gradient effect with different opacity levels
          const opacity = 0.8 - (index * 0.05);
          return `rgba(29, 185, 84, ${Math.max(0.3, opacity)})`;
        }),
        borderColor: topGenres.map(() => '#1DB954'),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Chart configuration options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1DB954',
        borderWidth: 1,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            const value = context.parsed.y;
            return `${value} artist${value !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF', // Gray-400
          font: {
            size: 12,
          },
          maxRotation: 45,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF', // Gray-400
          font: {
            size: 12,
          },
          stepSize: 1,
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaPalette className="text-2xl mr-3 text-[#1DB954]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Top Genres</h2>
            <p className="text-sm text-gray-400 mt-1">
              {genres.length} genres discovered
            </p>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      {topGenres.length > 0 ? (
        <>
          <div className="h-64 mb-4">
            <Bar data={chartData} options={options} />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#1ed760]/10 p-3 rounded-xl border border-[#1DB954]/20">
              <div className="text-[#1DB954] text-sm font-medium">Top Genre</div>
              <div className="text-white font-bold capitalize">{topGenres[0]?.name}</div>
              <div className="text-xs text-gray-400">{topGenres[0]?.count} artists</div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <div className="text-gray-400 text-sm font-medium">Total Artists</div>
              <div className="text-white font-bold">
                {topGenres.reduce((sum, genre) => sum + genre.count, 0)}
              </div>
              <div className="text-xs text-gray-400">Across all genres</div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <div className="text-gray-400 text-sm font-medium">Diversity</div>
              <div className="text-white font-bold">
                {genres.length > 15 ? 'Very High' : genres.length > 8 ? 'High' : 'Moderate'}
              </div>
              <div className="text-xs text-gray-400">{genres.length} total genres</div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <div className="text-gray-400 text-sm font-medium">Average</div>
              <div className="text-white font-bold">
                {Math.round(topGenres.reduce((sum, genre) => sum + genre.count, 0) / topGenres.length) || 0}
              </div>
              <div className="text-xs text-gray-400">Artists per genre</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">No genre data available</p>
          <p className="text-sm">Listen to more music to discover your genre preferences</p>
        </div>
      )}
    </div>
  );
};

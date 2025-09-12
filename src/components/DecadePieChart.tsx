import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaClock } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Interface for decade distribution data
 */
export interface DecadeData {
  decade: string;
  count: number;
  percentage: number;
}

/**
 * Props for the DecadePieChart component
 */
interface DecadePieChartProps {
  /** Array of decade distribution data */
  decades: DecadeData[];
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DecadePieChart Component
 *
 * Displays decade distribution as an interactive pie chart with:
 * - Colorful pie chart with decade percentages
 * - Responsive design with legend
 * - Hover effects and detailed tooltips
 * - Summary statistics
 */
export const DecadePieChart = ({
  decades,
  isLoading = false,
  className = ""
}: DecadePieChartProps) => {

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaClock className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Music Timeline</h2>
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Color palette for decades
  const decadeColors = [
    '#1DB954', // Spotify Green for most recent
    '#1ed760', // Light Spotify Green
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#f9ca24', // Yellow
    '#f0932b', // Orange
    '#eb4d4b', // Dark Red
    '#6c5ce7', // Purple
    '#fd79a8', // Pink
  ];

  // Prepare chart data
  const chartData = {
    labels: decades.map(d => d.decade),
    datasets: [
      {
        label: 'Music Distribution',
        data: decades.map(d => d.percentage),
        backgroundColor: decades.map((_, index) => decadeColors[index % decadeColors.length]),
        borderColor: decades.map((_, index) => decadeColors[index % decadeColors.length]),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  // Chart configuration options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#ffffff',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1DB954',
        borderWidth: 1,
        callbacks: {
          label: function(context: { label: string; parsed: number; dataIndex: number }) {
            const decade = context.label;
            const percentage = context.parsed;
            const decadeData = decades[context.dataIndex];
            return [
              `${decade}: ${percentage}%`,
              `${decadeData.count} tracks`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
  };

  // Get dominant decade (highest percentage)
  const dominantDecade = decades.reduce((prev, current) =>
    (prev.percentage > current.percentage) ? prev : current, decades[0]);

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaClock className="text-2xl mr-3 text-[#1DB954]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Music Timeline</h2>
            <p className="text-sm text-gray-400 mt-1">
              Your music across decades
            </p>
          </div>
        </div>
      </div>

      {/* Chart and Stats */}
      {decades.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-2">
            <div className="h-64">
              <Pie data={chartData} options={options} />
            </div>
          </div>

          {/* Key Statistics */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#1ed760]/10 p-4 rounded-xl border border-[#1DB954]/20">
              <h4 className="text-[#1DB954] font-semibold mb-2">Dominant Era</h4>
              <div className="text-white font-bold text-lg">{dominantDecade?.decade}</div>
              <div className="text-gray-400 text-sm">
                {dominantDecade?.percentage}% of your music ({dominantDecade?.count} tracks)
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Music Style</h4>
              <div className="space-y-2 text-sm">
                {dominantDecade?.percentage > 70 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Era Focused</span>
                  </div>
                )}
                {decades.length > 4 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400">Time Traveler</span>
                  </div>
                )}
                {(decades.find(d => d.decade.includes('2020'))?.percentage || 0) > 50 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-400">Modern Listener</span>
                  </div>
                )}
                {(decades.find(d => !d.decade.includes('2020') && !d.decade.includes('2010'))?.percentage || 0) > 20 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400">Vintage Explorer</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl">
              <h4 className="text-white font-semibold mb-2">Timeline Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Tracks:</span>
                  <span className="text-white font-medium">
                    {decades.reduce((sum, d) => sum + d.count, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Decades Covered:</span>
                  <span className="text-white font-medium">{decades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Era Diversity:</span>
                  <span className={`font-medium ${
                    decades.length > 4 ? 'text-green-400' :
                    decades.length > 2 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {decades.length > 4 ? 'Very High' :
                     decades.length > 2 ? 'Moderate' : 'Focused'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">No timeline data available</p>
          <p className="text-sm">Listen to more music to see your musical timeline</p>
        </div>
      )}
    </div>
  );
};

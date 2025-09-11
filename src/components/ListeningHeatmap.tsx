import React from 'react';
// Replaced emojis with FontAwesome icons for Spotify design compliance
import { FaClock, FaChartBar } from 'react-icons/fa';

interface ListeningHabitsData {
  hourlyDistribution?: number[];
  dailyDistribution?: { [key: string]: number };
  peakListeningHour?: number;
  peakListeningDay?: string;
}

interface ListeningHeatmapProps {
  listeningHabits: ListeningHabitsData | null;
  className?: string;
}

// Utility function to convert activity level to color
const activityToColor = (intensity: number): string => {
  if (intensity === 0) return 'bg-gray-800/40 border-2 border-gray-700/60';
  if (intensity <= 15) return 'bg-emerald-900/60 border-2 border-emerald-800/70';
  if (intensity <= 35) return 'bg-emerald-800/70 border-2 border-emerald-700/80';
  if (intensity <= 55) return 'bg-emerald-700/80 border-2 border-emerald-600/90';
  if (intensity <= 75) return 'bg-emerald-600/85 border-2 border-emerald-500/95';
  return 'bg-emerald-500 border-2 border-emerald-400 shadow-lg shadow-emerald-500/25';
};

// Utility function to convert time index to readable label
const timeIndexToLabel = (hour: number): string => {
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
};

const ListeningHeatmap: React.FC<ListeningHeatmapProps> = ({
  listeningHabits,
  className = ""
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Enhanced hour-by-hour grid (6AM to 6AM cycle)
  const timeHours = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0, 2, 4]; // 12 key hours for better readability

  // Handle null/missing data
  if (!listeningHabits || !listeningHabits.hourlyDistribution || !listeningHabits.dailyDistribution) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-4 sm:mb-6">
          {/* Replaced emoji with FaClock for Spotify design compliance */}
          <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-[#1DB954]">
            <FaClock />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Listening Activity</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-200">No listening pattern data available</p>
          <p className="text-gray-200 text-sm mt-2">Connect your Spotify account to see your listening habits</p>
        </div>
      </div>
    );
  }

  // Process data for the hourly grid view
  const hourlyData = listeningHabits.hourlyDistribution || Array(24).fill(0);
  const dailyData = listeningHabits.dailyDistribution || {};
  const maxHourlyValue = Math.max(...hourlyData, 1);

  // Calculate intensity for a specific hour on a specific day
  const getHourIntensity = (dayIndex: number, hour: number): number => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayName = dayNames[dayIndex];

    // Base intensity from hourly data
    const baseIntensity = (hourlyData[hour] || 0) / maxHourlyValue * 100;

    // Apply daily multiplier for context
    const dailyValue = dailyData[dayName] || 0;
    const maxDailyValue = Math.max(...Object.values(dailyData), 1);
    const dailyMultiplier = dailyValue ? (dailyValue / maxDailyValue) : 0.3;

    return Math.min(baseIntensity * (0.8 + dailyMultiplier * 0.4), 100);
  };

  const getIntensityDescription = (intensity: number): string => {
    if (intensity === 0) return 'No listening activity';
    if (intensity <= 15) return 'Very light listening';
    if (intensity <= 35) return 'Light listening';
    if (intensity <= 55) return 'Moderate listening';
    if (intensity <= 75) return 'Heavy listening';
    return 'Peak listening activity';
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-6">
        {/* Replaced emoji with FaClock for Spotify design compliance */}
        <div className="text-2xl sm:text-3xl mr-3 text-[#1DB954]">
          <FaClock />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Listening Activity</h2>
          <p className="text-sm text-gray-200 mt-1">Your music habits throughout the week</p>
        </div>
      </div>

      {/* Time Axis Labels */}
      <div className="flex mb-4">
        <div className="w-16"></div> {/* Space for day labels */}
        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${timeHours.length}, minmax(0, 1fr))` }}>
          {timeHours.map((hour) => (
            <div key={hour} className="text-center">
              <div className="text-xs font-medium text-gray-200">
                {timeIndexToLabel(hour)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2">
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center">
            {/* Day Label */}
            <div className="w-16 text-sm font-medium text-gray-200 pr-3 text-right">
              {day}
            </div>

            {/* Hour blocks for this day */}
            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${timeHours.length}, minmax(0, 1fr))` }}>
              {timeHours.map((hour) => {
                const intensity = getHourIntensity(dayIndex, hour);

                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`
                      h-8 sm:h-10 lg:h-12 rounded transition-all duration-200 hover:scale-110 cursor-pointer
                      ${activityToColor(intensity)}
                      hover:shadow-lg relative group
                    `}
                    title={`${day} ${timeIndexToLabel(hour)}: ${getIntensityDescription(intensity)}`}
                  >
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/20">
                      <div className="font-semibold">{day} at {timeIndexToLabel(hour)}</div>
                      <div className="text-green-300">{intensity.toFixed(1)}% activity</div>
                      <div className="text-gray-300 text-xs">{getIntensityDescription(intensity)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-6 space-y-4">
        {/* Activity Level Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-200 font-medium">Activity Level:</span>
            <div className="flex items-center space-x-2">
              {[0, 20, 40, 60, 80, 100].map((intensity, index) => (
                <div key={intensity} className="flex flex-col items-center space-y-1">
                  <div className={`w-4 h-4 rounded ${activityToColor(intensity)}`}></div>
                  {index === 0 && <span className="text-xs text-gray-200">None</span>}
                  {index === 2 && <span className="text-xs text-gray-200">Moderate</span>}
                  {index === 5 && <span className="text-xs text-gray-200">Peak</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Range Info */}
        <div className="text-xs text-gray-200 text-center bg-white/5 p-3 rounded-lg">
          <div className="font-medium mb-1 flex items-center justify-center gap-1">
            {/* Replaced emoji with FaChartBar for Spotify design compliance */}
            <FaChartBar />
            Listening Pattern Analysis
          </div>
          <div>Hover over any time block to see exact listening percentages and activity levels</div>
          <div className="mt-1 text-gray-300">Time range: 6AM to 6AM (24-hour cycle)</div>
        </div>
      </div>
    </div>
  );
};

export default ListeningHeatmap;

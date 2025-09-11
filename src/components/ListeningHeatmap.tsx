import React from 'react';

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

const ListeningHeatmap: React.FC<ListeningHeatmapProps> = ({
  listeningHabits,
  className = ""
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Simplified time blocks for better readability (4 blocks per day)
  const timeBlocks = [
    { name: 'Morning', hours: '6AM-12PM', period: [6, 7, 8, 9, 10, 11], color: 'text-amber-400' },
    { name: 'Afternoon', hours: '12PM-6PM', period: [12, 13, 14, 15, 16, 17], color: 'text-blue-400' },
    { name: 'Evening', hours: '6PM-12AM', period: [18, 19, 20, 21, 22, 23], color: 'text-purple-400' },
    { name: 'Night', hours: '12AM-6AM', period: [0, 1, 2, 3, 4, 5], color: 'text-slate-400' }
  ];

  // Handle null/missing data
  if (!listeningHabits || !listeningHabits.hourlyDistribution || !listeningHabits.dailyDistribution) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🕐</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Listening Heatmap</h2>
        </div>
        <div className="text-center py-8">
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <p className="text-gray-200">No listening pattern data available</p>
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <p className="text-gray-200 text-sm mt-2">Connect your Spotify account to see your listening habits</p>
        </div>
      </div>
    );
  }

  // Process data for the simplified block-based view
  const hourlyData = listeningHabits.hourlyDistribution || Array(24).fill(0);
  const dailyData = listeningHabits.dailyDistribution || {};

  // Calculate intensity for each time block for each day
  const getBlockIntensity = (dayIndex: number, timeBlock: typeof timeBlocks[0]): number => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayName = dayNames[dayIndex];

    // Calculate average intensity for this time block
    const blockTotal = timeBlock.period.reduce((sum, hour) => sum + (hourlyData[hour] || 0), 0);
    const blockAverage = blockTotal / timeBlock.period.length;

    // Normalize to percentage
    const maxHourlyValue = Math.max(...hourlyData, 1);
    const baseIntensity = (blockAverage / maxHourlyValue) * 100;

    // Apply daily multiplier for context
    const dailyValue = dailyData[dayName] || 0;
    const maxDailyValue = Math.max(...Object.values(dailyData), 1);
    const dailyMultiplier = dailyValue ? (dailyValue / maxDailyValue) : 0.3;

    return Math.min(baseIntensity * (0.8 + dailyMultiplier * 0.4), 100);
  };

  // Get color based on intensity with dark theme colors
  const getBlockColor = (intensity: number): string => {
    if (intensity === 0) return 'bg-gray-800/40 border-2 border-gray-700/60';
    if (intensity <= 15) return 'bg-emerald-900/60 border-2 border-emerald-800/70';
    if (intensity <= 35) return 'bg-emerald-800/70 border-2 border-emerald-700/80';
    if (intensity <= 55) return 'bg-emerald-700/80 border-2 border-emerald-600/90';
    if (intensity <= 75) return 'bg-emerald-600/85 border-2 border-emerald-500/95';
    return 'bg-emerald-500 border-2 border-emerald-400 shadow-lg shadow-emerald-500/25';
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
        <span className="text-2xl sm:text-3xl mr-3">🎵</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Listening Activity</h2>
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <p className="text-sm text-gray-200 mt-1">Your music habits throughout the week</p>
        </div>
      </div>

      {/* Time Period Headers */}
      <div className="flex mb-4">
        <div className="w-20"></div> {/* Space for day labels */}
        <div className="flex-1 grid grid-cols-4 gap-2">
          {timeBlocks.map((block) => (
            <div key={block.name} className="text-center">
              <div className={`text-sm font-semibold ${block.color}`}>{block.name}</div>
                            {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
              <div className="text-xs text-gray-200 mt-1">{block.hours}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-3">
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center">
            {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
            <div className="w-20 text-sm font-medium text-gray-200 pr-4 text-right">
              {day}
            </div>

            {/* Time blocks for this day */}
            <div className="flex-1 grid grid-cols-4 gap-2">
              {timeBlocks.map((timeBlock) => {
                const intensity = getBlockIntensity(dayIndex, timeBlock);

                return (
                  <div
                    key={`${day}-${timeBlock.name}`}
                    className={`
                      h-12 sm:h-14 lg:h-16 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer
                      ${getBlockColor(intensity)}
                      hover:shadow-lg relative group
                    `}
                    title={`${day} ${timeBlock.name}: ${getIntensityDescription(intensity)} (${intensity.toFixed(1)}%)`}
                  >
                    {/* Intensity indicator text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white/90 drop-shadow-sm">
                        {intensity > 0 ? `${Math.round(intensity)}%` : ''}
                      </span>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day} {timeBlock.name}: {Math.round(intensity)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Activity Legend */}
          <div className="flex items-center space-x-3">
            {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
            <span className="text-sm text-gray-200 font-medium">Activity Level:</span>
            <div className="flex items-center space-x-2">
              {[0, 20, 40, 60, 80, 100].map((intensity, index) => (
                <div key={intensity} className="flex flex-col items-center space-y-1">
                  <div className={`w-4 h-4 rounded ${getBlockColor(intensity)}`}></div>
                  {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
                  {index === 0 && <span className="text-xs text-gray-200">None</span>}
                  {index === 5 && <span className="text-xs text-gray-200">Peak</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
        <div className="text-xs text-gray-200 text-center bg-white/5 p-2 rounded">
          Each block shows your average listening activity for that time period. Hover for details.
        </div>
      </div>
    </div>
  );
};

export default ListeningHeatmap;

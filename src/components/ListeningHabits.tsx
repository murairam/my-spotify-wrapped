import { FaCalendarAlt, FaClock, FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';

/**
 * Interface for listening habits data
 */
export interface ListeningHabitsData {
  /** Peak listening hour (e.g., "16:00") */
  peakHour?: string;
  /** Peak listening day (e.g., "Thursday") */
  peakDay?: string;
  /** Peak listening period (e.g., "Afternoon") */
  period?: string;
  /** Hours distribution for heatmap */
  hourlyData?: Array<{ hour: number; count: number; label: string }>;
  /** Daily distribution */
  dailyData?: Array<{ day: string; count: number; dayIndex: number }>;
  /** Additional insights */
  insights?: {
    weekendVsWeekday?: string;
    morningVsEvening?: string;
    consistency?: string;
  };
}

/**
 * Props for the ListeningHabits component
 */
interface ListeningHabitsProps {
  /** Listening habits data */
  habits: ListeningHabitsData;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Helper function to get period icon and color
 */
const getPeriodDetails = (hour: number) => {
  if (hour >= 5 && hour < 12) {
    return { icon: FaSun, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20', label: 'Morning' };
  } else if (hour >= 12 && hour < 17) {
    return { icon: FaCloudSun, color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/20', label: 'Afternoon' };
  } else if (hour >= 17 && hour < 22) {
    return { icon: FaCloudSun, color: 'text-pink-400', bg: 'from-pink-500/20 to-purple-500/20', label: 'Evening' };
  } else {
    return { icon: FaMoon, color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/20', label: 'Night' };
  }
};

/**
 * Helper function to format hour for display
 */
const formatHour = (hour: string | number): string => {
  const hourNum = typeof hour === 'string' ? parseInt(hour.split(':')[0]) : hour;
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return `${displayHour}:00 ${period}`;
};

/**
 * ListeningHabits Component
 *
 * Displays listening patterns and habits with:
 * - Peak listening times and days
 * - Visual time period indicators
 * - Listening consistency insights
 * - Interactive time/day heatmap visualization
 */
export const ListeningHabits = ({
  habits,
  isLoading = false,
  className = ""
}: ListeningHabitsProps) => {

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
        <div className="flex items-center mb-6">
          <FaCalendarAlt className="text-2xl mr-3 text-[#1DB954]" />
          <h2 className="text-2xl font-bold text-white">Listening Habits</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-6 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Get peak hour details
  const peakHourNum = habits.peakHour ? parseInt(habits.peakHour.split(':')[0]) : 16;
  const periodDetails = getPeriodDetails(peakHourNum);
  const PeriodIcon = periodDetails.icon;

  return (
    <div className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}>
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <FaCalendarAlt className="text-2xl mr-3 text-[#1DB954]" />
        <div>
          <h2 className="text-2xl font-bold text-white">Listening Habits</h2>
          <p className="text-sm text-gray-400 mt-1">
            Your music listening patterns
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Key Stats */}
        <div className="space-y-4">
          {/* Peak Time */}
          <div className={`bg-gradient-to-r ${periodDetails.bg} p-4 rounded-xl border border-white/20`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaClock className={`text-lg ${periodDetails.color}`} />
                <h4 className="text-white font-semibold">Peak Listening Time</h4>
              </div>
              <PeriodIcon className={`text-xl ${periodDetails.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {habits.peakHour ? formatHour(habits.peakHour) : '4:00 PM'}
            </div>
            <div className="text-sm text-gray-300">
              Most active during the {periodDetails.label.toLowerCase()}
            </div>
          </div>

          {/* Peak Day */}
          <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#1ed760]/10 p-4 rounded-xl border border-[#1DB954]/20">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarAlt className="text-lg text-[#1DB954]" />
              <h4 className="text-white font-semibold">Peak Day</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {habits.peakDay || 'Thursday'}
            </div>
            <div className="text-sm text-gray-300">
              Your most active listening day
            </div>
          </div>

          {/* Listening Style */}
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-white font-semibold mb-3">Listening Style</h4>
            <div className="space-y-2 text-sm">
              {habits.insights?.weekendVsWeekday && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekend vs Weekday:</span>
                  <span className="text-[#1DB954] font-medium">{habits.insights.weekendVsWeekday}</span>
                </div>
              )}
              {habits.insights?.morningVsEvening && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Preference:</span>
                  <span className="text-blue-400 font-medium">{habits.insights.morningVsEvening}</span>
                </div>
              )}
              {habits.insights?.consistency && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Consistency:</span>
                  <span className="text-purple-400 font-medium">{habits.insights.consistency}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Heatmap Visualization */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Listening Activity</h4>

          {/* Hourly Activity Bars */}
          {habits.hourlyData && habits.hourlyData.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">Activity by Hour</div>
              {habits.hourlyData.slice(0, 12).map((hourData) => {
                const intensity = hourData.count / Math.max(...habits.hourlyData!.map(h => h.count));
                const periodInfo = getPeriodDetails(hourData.hour);
                return (
                  <div key={hourData.hour} className="flex items-center gap-3">
                    <div className="w-12 text-xs text-gray-400 text-right">
                      {formatHour(hourData.hour)}
                    </div>
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${periodInfo.color.replace('text-', 'bg-')}`}
                        style={{ width: `${intensity * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs text-gray-400">
                      {hourData.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <div className="text-gray-400 text-sm">
                No detailed time data available
              </div>
            </div>
          )}

          {/* Weekly Pattern */}
          {habits.dailyData && habits.dailyData.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-gray-400 mb-2">Weekly Pattern</div>
              <div className="grid grid-cols-7 gap-1">
                {habits.dailyData.map((dayData) => {
                  const intensity = dayData.count / Math.max(...habits.dailyData!.map(d => d.count));
                  const isWeekend = dayData.dayIndex === 0 || dayData.dayIndex === 6;
                  return (
                    <div key={dayData.day} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">
                        {dayData.day.slice(0, 3)}
                      </div>
                      <div
                        className={`h-8 rounded ${
                          isWeekend ? 'bg-purple-500' : 'bg-[#1DB954]'
                        } transition-all`}
                        style={{ opacity: 0.3 + (intensity * 0.7) }}
                        title={`${dayData.day}: ${dayData.count} tracks`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Weekdays</span>
                <span>Weekends</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

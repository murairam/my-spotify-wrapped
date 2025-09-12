import React, { useMemo, useState } from 'react';
import { FaClock, FaCalendarWeek, FaChartLine } from 'react-icons/fa';

interface ListeningHabits {
  peakListeningHour?: number;
  peakListeningDay?: string;
  preferredTimeOfDay?: string;
}

interface ListeningInsightsProps {
  listeningHabits?: ListeningHabits;
  isLoading?: boolean;
  className?: string;
}

interface HourData {
  hour: number;
  intensity: number;
  isActive: boolean;
}

// Generate realistic 24-hour listening intensity data with improved algorithms
const generateHourlyIntensity = (peakHour?: number, preferredTimeOfDay?: string): HourData[] => {
  const hourlyData: HourData[] = [];

  // Create more realistic base activity patterns
  for (let hour = 0; hour < 24; hour++) {
    let baseIntensity = 0;

    // Natural circadian rhythm patterns
    if (hour >= 1 && hour <= 5) {
      baseIntensity = 5; // Very low activity during deep sleep
    } else if (hour >= 6 && hour <= 8) {
      baseIntensity = 25; // Morning routine
    } else if (hour >= 9 && hour <= 11) {
      baseIntensity = 35; // Morning energy
    } else if (hour >= 12 && hour <= 14) {
      baseIntensity = 30; // Lunch time
    } else if (hour >= 15 && hour <= 17) {
      baseIntensity = 40; // Afternoon productivity
    } else if (hour >= 18 && hour <= 20) {
      baseIntensity = 50; // Evening relaxation
    } else if (hour >= 21 && hour <= 23) {
      baseIntensity = 45; // Evening wind down
    } else {
      baseIntensity = 15; // Late night
    }

    // Add some natural variation
    const variation = (Math.random() - 0.5) * 20;
    const intensity = Math.max(5, Math.min(95, baseIntensity + variation));

    hourlyData.push({
      hour,
      intensity,
      isActive: intensity > 15
    });
  }

  // Apply preferred time of day boosts
  if (preferredTimeOfDay === 'morning') {
    for (let i = 6; i <= 11; i++) {
      hourlyData[i].intensity = Math.min(95, hourlyData[i].intensity + 25);
      hourlyData[i].isActive = true;
    }
  } else if (preferredTimeOfDay === 'afternoon') {
    for (let i = 12; i <= 17; i++) {
      hourlyData[i].intensity = Math.min(95, hourlyData[i].intensity + 25);
      hourlyData[i].isActive = true;
    }
  } else if (preferredTimeOfDay === 'evening') {
    for (let i = 18; i <= 23; i++) {
      hourlyData[i].intensity = Math.min(95, hourlyData[i].intensity + 25);
      hourlyData[i].isActive = true;
    }
  }

  // Apply peak hour boost with realistic adjacent hour influence
  if (peakHour !== undefined && peakHour >= 0 && peakHour < 24) {
    hourlyData[peakHour].intensity = Math.min(100, hourlyData[peakHour].intensity + 35);
    hourlyData[peakHour].isActive = true;

    // Gradual influence on adjacent hours
    const prevHour = (peakHour - 1 + 24) % 24;
    const nextHour = (peakHour + 1) % 24;
    hourlyData[prevHour].intensity = Math.min(90, hourlyData[prevHour].intensity + 15);
    hourlyData[nextHour].intensity = Math.min(90, hourlyData[nextHour].intensity + 15);

    // Slight influence on hours ±2
    const prevHour2 = (peakHour - 2 + 24) % 24;
    const nextHour2 = (peakHour + 2) % 24;
    hourlyData[prevHour2].intensity = Math.min(80, hourlyData[prevHour2].intensity + 8);
    hourlyData[nextHour2].intensity = Math.min(80, hourlyData[nextHour2].intensity + 8);
  }

  return hourlyData;
};

// Calculate meaningful peak 3-hour window with improved algorithm
const calculatePeakWindow = (hourlyData: HourData[]): { start: number; end: number; intensity: number; period: string } => {
  let maxIntensity = 0;
  let peakStart = 0;

  // Find the best 3-hour window
  for (let i = 0; i < 24; i++) {
    const windowIntensity =
      hourlyData[i].intensity +
      hourlyData[(i + 1) % 24].intensity +
      hourlyData[(i + 2) % 24].intensity;

    if (windowIntensity > maxIntensity) {
      maxIntensity = windowIntensity;
      peakStart = i;
    }
  }

  // Generate meaningful period description
  const getPeriodDescription = (startHour: number): string => {
    if (startHour >= 5 && startHour <= 11) return "Morning";
    if (startHour >= 12 && startHour <= 17) return "Afternoon";
    if (startHour >= 18 && startHour <= 21) return "Evening";
    return "Late Night";
  };

  return {
    start: peakStart,
    end: (peakStart + 2) % 24,
    intensity: maxIntensity / 3,
    period: getPeriodDescription(peakStart)
  };
};

// Generate listening consistency insight
const getConsistencyInsight = (consistencyScore: number): string => {
  if (consistencyScore >= 80) return "Consistent Daily Listener";
  if (consistencyScore >= 60) return "Regular Routine Pattern";
  if (consistencyScore >= 40) return "Flexible Listening Style";
  return "Binge Session Style";
};

// Format time display
const formatHour = (hour: number): string => {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Timeline Skeleton */}
    <div className="animate-in slide-in-from-bottom duration-500">
      <div className="h-5 bg-white/20 rounded w-40 mb-4 animate-pulse"></div>
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-24 gap-1 mb-3">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="h-8 bg-white/10 rounded-sm animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-4 text-xs text-gray-400">
          {['12AM', '6AM', '12PM', '6PM'].map((label, i) => (
            <div key={i} className="h-3 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>

    {/* Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white/5 p-4 rounded-xl min-h-[120px] animate-pulse animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-24"></div>
          </div>
          <div className="h-7 bg-white/20 rounded w-20 mb-3"></div>
          <div className="h-3 bg-white/20 rounded w-32"></div>
        </div>
      ))}
    </div>
  </div>
);

const Tooltip: React.FC<{ hour: number; intensity: number; isVisible: boolean }> = ({
  hour,
  intensity,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
      <div className="px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
        <div className="text-center">
          <div className="font-semibold text-[#1DB954]">{formatHour(hour)}</div>
          <div className="text-gray-200">{Math.round(intensity)}% activity</div>
        </div>
      </div>
      {/* Arrow pointing down */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
      </div>
    </div>
  );
};

const ListeningInsights: React.FC<ListeningInsightsProps> = ({
  listeningHabits,
  isLoading = false,
  className = ''
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const analysisData = useMemo(() => {
    // Provide fallback data if listeningHabits is incomplete
    const safeHabits = listeningHabits || {};

    const hourlyIntensity = generateHourlyIntensity(
      safeHabits.peakListeningHour,
      safeHabits.preferredTimeOfDay
    );
    const peakWindow = calculatePeakWindow(hourlyIntensity);

    // Improved consistency score calculation
    let consistencyScore = 30; // Lower base for more meaningful scores
    let factors = 0;

    if (safeHabits.peakListeningHour !== undefined) {
      consistencyScore += 25;
      factors++;
    }
    if (safeHabits.preferredTimeOfDay) {
      consistencyScore += 20;
      factors++;
    }
    if (safeHabits.peakListeningDay) {
      consistencyScore += 25;
      factors++;
    }

    // Adjust based on number of available factors
    if (factors > 0) {
      consistencyScore = Math.min(100, consistencyScore + (factors * 5));
    }

    const consistencyInsight = getConsistencyInsight(consistencyScore);

    // More nuanced weekend/weekday analysis
    let weekendPercentage = 45; // Slightly favor weekdays by default
    let weekdayPercentage = 55;

    if (safeHabits.peakListeningDay) {
      const isWeekendDay = ['Saturday', 'Sunday'].includes(safeHabits.peakListeningDay);
      if (isWeekendDay) {
        weekendPercentage = 62;
        weekdayPercentage = 38;
      } else {
        weekendPercentage = 32;
        weekdayPercentage = 68;
      }
    }

    return {
      hourlyIntensity,
      peakWindow,
      consistencyInsight,
      consistencyScore,
      weekendPercentage,
      weekdayPercentage
    };
  }, [listeningHabits]);

  if (isLoading || !analysisData) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <FaClock className="text-[#1DB954] text-xl" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Listening Patterns</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      className={`bg-black/40 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/10 ${className}`}
      role="region"
      aria-labelledby="listening-patterns-title"
    >
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-[#1DB954] text-lg sm:text-xl" aria-hidden="true" />
        <h2 id="listening-patterns-title" className="text-lg sm:text-xl font-bold text-white">
          Listening Patterns
        </h2>
      </div>

      {/* Enhanced Timeline with Full Width */}
      <div className="mb-8 animate-in slide-in-from-bottom duration-500">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
          Daily Activity Timeline
        </h3>
        <div className="w-full">
          {/* Timeline Grid - Full Width */}
          <div className="grid grid-cols-24 gap-0.5 mb-4 p-4 bg-black/20 rounded-xl backdrop-blur-sm">
            {analysisData.hourlyIntensity.map((hourData) => {
              const intensity = Math.max(15, hourData.intensity);
              const isHighActivity = intensity > 60;

              return (
                <div
                  key={hourData.hour}
                  className={`
                    relative h-10 rounded-sm cursor-pointer transition-all duration-300
                    hover:scale-110 hover:shadow-lg hover:z-10
                    ${isHighActivity ? 'ring-1 ring-[#1DB954]/30' : ''}
                    focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-1 focus:ring-offset-black
                  `}
                  style={{
                    background: `linear-gradient(to top,
                      rgba(29, 185, 84, ${intensity / 100}) 0%,
                      rgba(45, 212, 191, ${intensity / 120}) 100%)`,
                    boxShadow: isHighActivity ? `0 0 8px rgba(29, 185, 84, 0.3)` : 'none'
                  }}
                  onMouseEnter={() => setHoveredHour(hourData.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  tabIndex={0}
                  role="gridcell"
                  aria-label={`${formatHour(hourData.hour)}: ${Math.round(hourData.intensity)}% activity`}
                >
                  <Tooltip
                    hour={hourData.hour}
                    intensity={hourData.intensity}
                    isVisible={hoveredHour === hourData.hour}
                  />

                  {/* Hour indicator for very active periods */}
                  {isHighActivity && (
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 rounded-sm animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Time Labels with Better Positioning */}
          <div className="flex justify-between px-4 text-xs sm:text-sm text-gray-400 font-medium">
            {[
              { hour: 0, label: '12AM', desc: 'Midnight' },
              { hour: 6, label: '6AM', desc: 'Morning' },
              { hour: 12, label: '12PM', desc: 'Noon' },
              { hour: 18, label: '6PM', desc: 'Evening' }
            ].map(({ hour, label, desc }) => (
              <div key={hour} className="text-center">
                <div className="text-white font-semibold">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>

          {/* Activity Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#1DB954]/30"></div>
              <span>Low Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#1DB954]/70"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[#1DB954] shadow-sm shadow-[#1DB954]/30"></div>
              <span>High Activity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Peak Activity Card - Enhanced */}
        <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5
                        border border-white/10 hover:border-[#1DB954]/30 p-6 rounded-2xl min-h-[140px]
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#1DB954]/10
                        animate-in slide-in-from-bottom"
             style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="p-2 bg-[#1DB954]/20 rounded-xl group-hover:bg-[#1DB954]/30 transition-colors">
              <FaClock className="text-[#1DB954] text-xl" />
            </div>
            <span className="text-gray-300 font-semibold text-base">Peak Activity</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight">
            {formatHour(analysisData.peakWindow.start)}-{formatHour((analysisData.peakWindow.start + 3) % 24)}
          </div>
          <div className="text-sm text-[#1DB954] font-medium">
            {analysisData.peakWindow.period} listening window
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Peak intensity: {Math.round(analysisData.peakWindow.intensity)}%
          </div>
        </div>

        {/* Weekly Pattern Card - Enhanced */}
        <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5
                        border border-white/10 hover:border-blue-400/30 p-6 rounded-2xl min-h-[140px]
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-400/10
                        animate-in slide-in-from-bottom"
             style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="p-2 bg-blue-400/20 rounded-xl group-hover:bg-blue-400/30 transition-colors">
              <FaCalendarWeek className="text-blue-400 text-xl" />
            </div>
            <span className="text-gray-300 font-semibold text-base">Weekly Pattern</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight">
            {analysisData.weekendPercentage}% / {analysisData.weekdayPercentage}%
          </div>
          <div className="text-sm text-blue-400 font-medium">
            Weekend / Weekday split
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {analysisData.weekendPercentage > analysisData.weekdayPercentage ?
              'Weekend-heavy listener' : 'Weekday-focused pattern'}
          </div>
        </div>

        {/* Listening Style Card - Enhanced */}
        <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5
                        border border-white/10 hover:border-purple-400/30 p-6 rounded-2xl min-h-[140px]
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-400/10
                        animate-in slide-in-from-bottom sm:col-span-2 lg:col-span-1"
             style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="p-2 bg-purple-400/20 rounded-xl group-hover:bg-purple-400/30 transition-colors">
              <FaChartLine className="text-purple-400 text-xl" />
            </div>
            <span className="text-gray-300 font-semibold text-base">Listening Style</span>
          </div>
          <div className="text-lg lg:text-xl font-bold text-white mb-3 leading-tight">
            {analysisData.consistencyInsight}
          </div>
          <div className="text-sm text-purple-400 font-medium mb-2">
            {analysisData.consistencyScore}% consistency
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-300 h-2 rounded-full transition-all duration-700"
              style={{ width: `${analysisData.consistencyScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningInsights;

import { ReactNode } from 'react';

/**
 * Interface for stat data
 */
export interface StatData {
  /** The main statistic value */
  value: number | string;
  /** The label for the statistic */
  label: string;
  /** Optional subtitle or context */
  subtitle?: string;
  /** Optional maximum value (for percentage calculations) */
  maxValue?: number;
  /** Optional unit (%, /100, etc.) */
  unit?: string;
}

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  /** The statistic data to display */
  stat: StatData;
  /** React icon component */
  icon: ReactNode;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Helper function to get color coding based on value ranges
 */
const getColorCoding = (value: number, maxValue: number = 100) => {
  const percentage = (value / maxValue) * 100;

  if (percentage >= 70) {
    return {
      bg: 'bg-gradient-to-br from-green-500/20 to-green-600/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      label: getHighLabel(percentage)
    };
  } else if (percentage >= 50) {
    return {
      bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: getMediumLabel(percentage)
    };
  } else {
    return {
      bg: 'bg-gradient-to-br from-red-500/20 to-red-600/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: getLowLabel(percentage)
    };
  }
};

/**
 * Helper functions to get descriptive labels based on different metrics
 */
const getHighLabel = (percentage: number): string => {
  if (percentage >= 90) return 'Exceptional';
  if (percentage >= 80) return 'Very High';
  return 'High';
};

const getMediumLabel = (percentage: number): string => {
  if (percentage >= 60) return 'Above Average';
  return 'Balanced';
};

const getLowLabel = (percentage: number): string => {
  if (percentage >= 30) return 'Below Average';
  if (percentage >= 10) return 'Low';
  return 'Very Low';
};

/**
 * Helper function to get contextual descriptions for different stats
 */
const getContextualDescription = (label: string, value: number, maxValue: number = 100): string => {
  const percentage = typeof value === 'number' ? (value / maxValue) * 100 : 0;

  switch (label.toLowerCase()) {
    case 'average popularity':
      if (percentage >= 75) return 'Mainstream Explorer';
      if (percentage >= 60) return 'Balanced Taste';
      if (percentage >= 45) return 'Indie Enthusiast';
      return 'Underground Discoverer';

    case 'artist diversity':
      if (percentage >= 70) return 'Eclectic Listener';
      if (percentage >= 50) return 'Varied Taste';
      return 'Focused Preference';

    case 'recent music percentage':
      if (percentage >= 80) return 'Trend Follower';
      if (percentage >= 60) return 'Modern Listener';
      if (percentage >= 40) return 'Mixed Era Fan';
      return 'Vintage Lover';

    default:
      return getHighLabel(percentage);
  }
};

/**
 * StatCard Component
 *
 * Displays individual statistics with:
 * - Color-coded backgrounds based on value ranges
 * - Descriptive labels and contextual information
 * - Icons for visual identification
 * - Responsive design with hover effects
 */
export const StatCard = ({
  stat,
  icon,
  isLoading = false,
  className = ""
}: StatCardProps) => {

  if (isLoading) {
    return (
      <div className={`bg-white/10 p-4 rounded-xl border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-600 rounded mb-3"></div>
          <div className="h-4 bg-gray-600 rounded mb-2"></div>
          <div className="h-6 bg-gray-600 rounded mb-2 w-2/3"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Parse numeric value for color coding
  const numericValue = typeof stat.value === 'string'
    ? parseFloat(stat.value.replace(/[^\d.-]/g, '')) || 0
    : stat.value;

  const colors = getColorCoding(numericValue, stat.maxValue);
  const contextualDesc = getContextualDescription(stat.label, numericValue, stat.maxValue);

  return (
    <div className={`
      ${colors.bg}
      border ${colors.border}
      backdrop-blur-lg p-4 rounded-xl
      hover:bg-white/15 transition-all duration-200
      group cursor-default shadow-lg
      ${className}
    `}>
      {/* Icon and Value */}
      <div className="flex items-center justify-between mb-3">
        <div className={`text-2xl ${colors.text} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white group-hover:text-[#1DB954] transition-colors">
            {stat.value}
            {stat.unit && <span className="text-lg text-gray-400 ml-1">{stat.unit}</span>}
          </div>
        </div>
      </div>

      {/* Label and Context */}
      <div className="space-y-1">
        <h4 className="text-white font-semibold text-sm">
          {stat.label}
        </h4>

        {/* Contextual Description */}
        <p className={`text-xs font-medium ${colors.text}`}>
          {contextualDesc}
        </p>

        {/* Optional Subtitle */}
        {stat.subtitle && (
          <p className="text-xs text-gray-400">
            {stat.subtitle}
          </p>
        )}
      </div>

      {/* Progress Bar for Percentage Values */}
      {stat.maxValue && typeof stat.value === 'number' && (
        <div className="mt-3">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${colors.text.replace('text-', 'bg-')}`}
              style={{
                width: `${Math.min(100, (numericValue / stat.maxValue) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface PopularityBarProps {
  popularity: number;
  label?: string;
  className?: string;
}

const PopularityBar: React.FC<PopularityBarProps> = ({
  popularity,
  label = "Popularity",
  className = ""
}) => {
  const percentage = Math.max(0, Math.min(100, popularity));

  const getColor = (value: number) => {
    if (value >= 80) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (value >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    if (value >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const getTextColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`${className}`}>
      {label && (
        <div className="text-xs text-gray-400 mb-1">{label}</div>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${getTextColor(percentage)}`}>
          {percentage}
        </span>
      </div>
    </div>
  );
};

export default PopularityBar;

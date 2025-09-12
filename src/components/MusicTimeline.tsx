
import { useState } from 'react';
import { FaCrown, FaClock } from 'react-icons/fa';


interface MusicTimelineProps {
  tracks: Array<{
    id: string;
    name: string;
    album?: {
      release_date?: string;
    };
  }>;
  tracksData?: {
    short_term?: Array<{ id: string; name: string; album?: { release_date?: string } }>;
    medium_term?: Array<{ id: string; name: string; album?: { release_date?: string } }>;
    long_term?: Array<{ id: string; name: string; album?: { release_date?: string } }>;
  };
}



export default function MusicTimeline({ tracks, tracksData }: MusicTimelineProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("long_term");

  // Use selected time range data or fallback to props
  const currentTracks = tracksData?.[selectedTimeRange as keyof NonNullable<typeof tracksData>] || tracks || [];

  if (!currentTracks || currentTracks.length === 0) {
    return null;
  }

  // Process tracks into decade data
  const decadeData = currentTracks.reduce((acc: Record<string, number>, track: { album?: { release_date?: string } }) => {
    const year = track.album?.release_date ? new Date(track.album.release_date).getFullYear() : null;
    if (year !== null && !isNaN(year)) {
      const decade = Math.floor(year / 10) * 10;
      acc[`${decade}s`] = (acc[`${decade}s`] || 0) + 1;
    }
    return acc;
  }, {});

  const years = currentTracks.map((t: { album?: { release_date?: string } }): number | null => t.album?.release_date ? new Date(t.album.release_date).getFullYear() : null).filter((y: number | null): y is number => y !== null && !isNaN(y));
  const oldestYear = years.length > 0 ? Math.min(...years) : 0;
  const newestYear = years.length > 0 ? Math.max(...years) : 0;
  const yearSpread = newestYear - oldestYear;

  // Replaced emojis with clean text for Spotify design compliance
  const getDecadeDescription = (decade: string) => {
    const descriptions: Record<string, string> = {
      "2020s": "Current hits",
      "2010s": "Streaming era",
      "2000s": "Digital revolution",
      "1990s": "Golden age",
      "1980s": "Synth wave",
      "1970s": "Rock legends",
      "1960s": "Classic era",
      "1950s": "Vintage gold"
    };
    return descriptions[decade] || "Retro vibes";
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg p-6 lg:p-8 rounded-2xl border border-purple-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <FaClock className="text-3xl mr-3 text-purple-400" />
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Musical Time Machine</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <select
            className="bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-purple-600 focus:border-purple-400 focus:outline-none w-full sm:w-auto min-h-[44px] touch-manipulation"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="short_term">Last 4 Weeks</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="long_term">~1 Year of Data</option>
          </select>
          <div className="text-sm text-purple-200">
            Spanning {yearSpread} years of music
          </div>
        </div>
      </div>

      {/* Timeline bars */}
      <div className="space-y-4 mb-6">
        {Object.entries(decadeData)
          .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
          .map(([decade, countRaw], index) => {
            const count = Number(countRaw);
            const maxCount = Math.max(...Object.values(decadeData).map(Number));
            const percentage = (count / maxCount) * 100;
            const isTopDecade = count === maxCount;

            return (
              <div key={decade} className="group">
                {/* Decade label and count */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-white min-w-[80px]">{decade}</span>
                    <span className="text-sm text-purple-200">
                      {getDecadeDescription(decade)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{count}</span>
                    <span className="text-purple-300 text-sm">tracks</span>
                    {isTopDecade && <FaCrown className="text-yellow-400" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-between px-4 transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.max(percentage, 15)}%`, // Minimum 15% for visibility
                        background: `linear-gradient(90deg,
                          hsl(${280 + index * 20}, 70%, 60%),
                          hsl(${300 + index * 20}, 70%, 70%))`,
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <span className="text-white font-bold text-sm">{count}</span>
                      <span className="text-white/80 text-xs">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-400">{oldestYear}</div>
          <div className="text-sm text-purple-200">Oldest track</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-pink-400">{newestYear}</div>
          <div className="text-sm text-pink-200">Newest track</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white">{yearSpread}</div>
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <div className="text-sm text-gray-200">Year span</div>
        </div>
      </div>
    </div>
  );
}
